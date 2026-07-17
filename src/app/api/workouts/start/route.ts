import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { planFromProfile } from '@/lib/workout-session';

export const runtime = 'nodejs';

const bodySchema = z.object({ dayIndex: z.number().int().min(0) });

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid dayIndex.' }, { status: 400 });

  const profile = await prisma.userProfile.findUnique({ where: { userId: sessionUser.id } });
  if (!profile || !profile.goal) {
    return NextResponse.json({ error: 'Complete onboarding first.' }, { status: 404 });
  }

  // Resume, don't duplicate, if a session is already in progress.
  const existing = await prisma.workoutLog.findFirst({
    where: { userId: sessionUser.id, completedAt: null },
    include: { exercises: true },
  });
  if (existing) return NextResponse.json({ session: existing });

  const { plan } = planFromProfile(profile, sessionUser.name ?? sessionUser.username);
  const day = plan.days[parsed.data.dayIndex];
  if (!day) return NextResponse.json({ error: 'dayIndex out of range.' }, { status: 400 });

  const session = await prisma.workoutLog.create({
    data: {
      userId: sessionUser.id,
      name: day.name,
      startedAt: new Date(),
      exercises: { create: day.exercises.map((ex) => ({ exerciseId: ex.id })) },
    },
    include: { exercises: true },
  });

  return NextResponse.json({ session });
}
