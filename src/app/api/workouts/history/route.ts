import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: sessionUser.id, completedAt: { not: null } },
    orderBy: { completedAt: 'desc' },
    take: 30,
    include: { exercises: true },
  });

  return NextResponse.json({
    history: logs.map((l) => ({
      id: l.id,
      name: l.name,
      completedAt: l.completedAt,
      durationMin: l.durationMin,
      exerciseCount: l.exercises.length,
      xpEarned: l.xpEarned,
    })),
  });
}
