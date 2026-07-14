import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

const bodySchema = z.object({
  weightKg: z.coerce.number().min(30).max(300),
  bodyFatPct: z.coerce.number().min(3).max(60).nullable(),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const entries = await prisma.progressEntry.findMany({
    where: { userId: sessionUser.id },
    orderBy: { date: 'asc' },
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message }, { status: 400 });
  }

  const entry = await prisma.progressEntry.create({
    data: { userId: sessionUser.id, date: new Date(), weightKg: parsed.data.weightKg, bodyFatPct: parsed.data.bodyFatPct },
  });
  return NextResponse.json({ entry }, { status: 201 });
}
