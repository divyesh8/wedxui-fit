import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { xpForWorkout, applyStreakRule } from '@/lib/workout-session';
import { calculateLevelFromXP } from '@/lib/utils';

export const runtime = 'nodejs';

interface AchievementCondition {
  metric: 'totalWorkouts' | 'streakDays';
  gte: number;
}

export async function PATCH(req: Request, { params }: { params: { id: string; exerciseLogId: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const session = await prisma.workoutLog.findUnique({ where: { id: params.id }, include: { exercises: true } });
  if (!session || session.userId !== sessionUser.id) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }
  if (session.completedAt) {
    return NextResponse.json({ error: 'Session already completed.' }, { status: 409 });
  }
  const exerciseLog = session.exercises.find((e) => e.id === params.exerciseLogId);
  if (!exerciseLog) return NextResponse.json({ error: 'Exercise not found in this session.' }, { status: 404 });

  const now = new Date();
  if (!exerciseLog.completedAt) {
    await prisma.exerciseLog.update({ where: { id: params.exerciseLogId }, data: { completedAt: now } });
  }

  const remaining = session.exercises.filter((e) => e.id !== params.exerciseLogId && !e.completedAt);
  if (remaining.length > 0) {
    return NextResponse.json({ workoutCompleted: false });
  }

  // Every exercise is now done — run the full completion transaction.
  const result = await prisma.$transaction(async (tx) => {
    const durationMin = Math.round(session.activeSeconds / 60);
    const xpEarned = xpForWorkout(session.exercises.length);

    const completedLog = await tx.workoutLog.update({
      where: { id: params.id },
      data: { completedAt: now, durationMin, xpEarned },
    });

    const profile = await tx.userProfile.findUniqueOrThrow({ where: { userId: sessionUser.id } });
    const previousLog = await tx.workoutLog.findFirst({
      where: { userId: sessionUser.id, completedAt: { not: null }, id: { not: params.id } },
      orderBy: { completedAt: 'desc' },
    });
    const { streakDays, bestStreak } = applyStreakRule(profile, previousLog?.completedAt ?? null, now);
    const newXp = profile.xp + xpEarned;
    const newLevel = calculateLevelFromXP(newXp);

    const updatedProfile = await tx.userProfile.update({
      where: { userId: sessionUser.id },
      data: {
        xp: newXp,
        level: newLevel,
        streakDays,
        bestStreak,
        totalWorkouts: { increment: 1 },
        totalMinutes: { increment: durationMin },
      },
    });

    // Unlock any newly-qualifying achievements (no-op if already unlocked).
    const achievements = await tx.achievement.findMany();
    const unlocked: { id: string; name: string; icon: string; description: string }[] = [];
    for (const a of achievements) {
      let cond: AchievementCondition;
      try {
        cond = JSON.parse(a.condition);
      } catch {
        continue;
      }
      const metricValue = cond.metric === 'streakDays' ? updatedProfile.streakDays : updatedProfile.totalWorkouts;
      if (metricValue < cond.gte) continue;
      const already = await tx.userAchievement.findUnique({
        where: { userId_achievementId: { userId: sessionUser.id, achievementId: a.id } },
      });
      if (already) continue;
      await tx.userAchievement.create({ data: { userId: sessionUser.id, achievementId: a.id } });
      unlocked.push({ id: a.id, name: a.name, icon: a.icon, description: a.description });
    }

    // Challenges: bump progress only for challenges the user has already
    // joined — no join/browse UI exists yet, so this is a safe no-op today.
    await tx.userChallenge.updateMany({
      where: { userId: sessionUser.id, status: 'IN_PROGRESS' },
      data: { progress: { increment: 1 } },
    });

    return { workoutLog: completedLog, profile: updatedProfile, unlockedAchievements: unlocked };
  }, { maxWait: 10_000, timeout: 20_000 });

  return NextResponse.json({ workoutCompleted: true, ...result });
}
