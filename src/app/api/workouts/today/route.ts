import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { generatePlan } from '@/lib/plan-generator';
import { profileToGeneratorInput } from '@/lib/workout-session';

export const runtime = 'nodejs';

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const profile = await prisma.userProfile.findUnique({ where: { userId: sessionUser.id } });
  if (!profile || !profile.goal) {
    return NextResponse.json({ error: 'Complete onboarding first.' }, { status: 404 });
  }

  const { plan, targets } = generatePlan(profileToGeneratorInput(profile, sessionUser.name ?? sessionUser.username));

  const activeSession = await prisma.workoutLog.findFirst({
    where: { userId: sessionUser.id, completedAt: null },
    include: { exercises: true },
    orderBy: { startedAt: 'desc' },
  });

  const nextDayIndex = profile.totalWorkouts % plan.days.length;

  return NextResponse.json({ plan, targets, nextDayIndex, activeSession });
}
