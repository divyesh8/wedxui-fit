import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
// Never cached, never statically evaluated at build time.
export const dynamic = 'force-dynamic';

/**
 * Matures scheduled account deletions.
 *
 * Without this, "your account will be deleted in 30 days" is a promise the
 * product never keeps — the request row sits in the database forever. This is
 * the job that makes the Danger Zone honest.
 *
 * Runs daily via vercel.json. Deletion is irreversible, so the query is
 * deliberately narrow: a user is removed only when they have a deletion
 * request that has MATURED (scheduledFor <= now) and was NEVER CANCELLED.
 * Everything else about that user's data goes with them through the
 * onDelete: Cascade relations on User.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fail closed. An unauthenticated endpoint that deletes accounts is worse
    // than one that does not run.
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const due = await prisma.deleteAccountRequest.findMany({
    where: { cancelledAt: null, scheduledFor: { lte: new Date() } },
    select: { userId: true, scheduledFor: true },
  });

  const purged: string[] = [];
  for (const row of due) {
    // One at a time: a single failure must not abort the rest of the batch.
    try {
      await prisma.user.delete({ where: { id: row.userId } });
      purged.push(row.userId);
    } catch {
      // Already gone, or a constraint held it back — the next run retries.
    }
  }

  return NextResponse.json({ due: due.length, purged: purged.length });
}
