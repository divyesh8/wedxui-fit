import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { logActivity } from '@/lib/settings/security';

export const runtime = 'nodejs';

/** The grace period the UI promises. Changing it changes what users were told. */
const GRACE_DAYS = 30;

const requestBody = z.object({
  password: z.string().min(1, 'Enter your password to confirm'),
  /** Typed confirmation, so the destructive path cannot be reached by a stray click. */
  confirmText: z.literal('DELETE', {
    errorMap: () => ({ message: 'Type DELETE to confirm' }),
  }),
});

/** GET — current deletion state, so the UI can show the countdown. */
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const row = await prisma.deleteAccountRequest.findUnique({ where: { userId: sessionUser.id } });
  const pending = row && !row.cancelledAt ? row : null;

  return NextResponse.json({
    pending: Boolean(pending),
    requestedAt: pending?.requestedAt ?? null,
    scheduledFor: pending?.scheduledFor ?? null,
  });
}

/**
 * POST — schedule deletion in GRACE_DAYS days.
 *
 * This records the request and starts the countdown; the account stays fully
 * usable until it matures, and DELETE cancels it. The row is the source of
 * truth for the purge — which needs a scheduled job to run
 * (deleteAccountRequest where scheduledFor <= now and cancelledAt is null).
 * Nothing purges automatically yet.
 */
export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = requestBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message, field: issue.path[0] }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { password: true },
  });
  if (!(await verifyPassword(parsed.data.password, user.password))) {
    return NextResponse.json({ error: 'Password is incorrect.', field: 'password' }, { status: 400 });
  }

  const requestedAt = new Date();
  const scheduledFor = new Date(requestedAt.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);

  const row = await prisma.deleteAccountRequest.upsert({
    where: { userId: sessionUser.id },
    create: { userId: sessionUser.id, requestedAt, scheduledFor },
    // Re-requesting after a cancellation restarts the clock and clears cancelledAt.
    update: { requestedAt, scheduledFor, cancelledAt: null },
  });

  await logActivity(
    sessionUser.id,
    'ACCOUNT_DELETION_REQUESTED',
    `scheduled for ${scheduledFor.toISOString()}`,
    req
  );

  return NextResponse.json({
    pending: true,
    requestedAt: row.requestedAt,
    scheduledFor: row.scheduledFor,
  });
}

/** DELETE — cancel a pending deletion. */
export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const existing = await prisma.deleteAccountRequest.findUnique({
    where: { userId: sessionUser.id },
  });
  if (!existing || existing.cancelledAt) {
    return NextResponse.json({ error: 'No pending deletion to cancel.' }, { status: 404 });
  }

  await prisma.deleteAccountRequest.update({
    where: { userId: sessionUser.id },
    data: { cancelledAt: new Date() },
  });
  await logActivity(sessionUser.id, 'ACCOUNT_DELETION_CANCELLED', undefined, req);

  return NextResponse.json({ pending: false });
}
