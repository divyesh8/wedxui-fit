import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { planFromProfile } from '@/lib/workout-session';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

function mondayOf(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const reviews = await prisma.aiReview.findMany({
    where: { userId: sessionUser.id },
    orderBy: { weekStart: 'desc' },
    take: 8,
  });
  return NextResponse.json({ reviews });
}

export async function POST() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id }, select: { isPro: true } });
  if (!user.isPro) {
    return NextResponse.json({ error: 'Weekly AI reviews are a Pro feature.', pro: false }, { status: 403 });
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: sessionUser.id } });
  if (!profile || !profile.goal) {
    return NextResponse.json({ error: 'Complete onboarding first.' }, { status: 404 });
  }

  const weekStart = mondayOf(new Date());
  const logs = await prisma.workoutLog.findMany({
    where: { userId: sessionUser.id, completedAt: { gte: weekStart } },
    orderBy: { completedAt: 'asc' },
  });
  const prevWeekStart = new Date(weekStart.getTime() - 7 * 86_400_000);
  const prevLogs = await prisma.workoutLog.findMany({
    where: { userId: sessionUser.id, completedAt: { gte: prevWeekStart, lt: weekStart } },
  });

  const { plan } = planFromProfile(profile, sessionUser.name ?? sessionUser.username);
  const planned = Math.min(plan.days.length, 7);
  const completed = logs.length;
  const adherencePct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  const minutesThisWeek = logs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
  const minutesLastWeek = prevLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);

  const recommendations: string[] = [];
  if (completed === 0) {
    recommendations.push('No sessions logged yet this week — the plan only works if it happens. Schedule the next one now.');
  } else if (adherencePct < 60) {
    recommendations.push(`You completed ${completed}/${planned} planned sessions. If the schedule keeps slipping, consider regenerating the plan with fewer days — consistency at 3 days beats failing at ${planned}.`);
  } else {
    recommendations.push(`Strong adherence: ${completed}/${planned} sessions (${adherencePct}%). Keep the streak alive.`);
  }
  if (prevLogs.length > 0 && completed >= prevLogs.length && minutesThisWeek < minutesLastWeek * 0.7 && minutesLastWeek > 0) {
    recommendations.push('Sessions are getting shorter week-over-week — a possible plateau signal. Check whether rests are ballooning or exercises are being skipped.');
  }
  if (profile.streakDays >= 7) {
    recommendations.push(`A ${profile.streakDays}-day streak — momentum is your biggest asset right now.`);
  }
  recommendations.push('Note: plateau detection currently uses consistency and duration only — per-set load tracking will sharpen it in a future update.');

  const content = {
    weekStart: weekStart.toISOString(),
    plannedSessions: planned,
    completedSessions: completed,
    adherencePct,
    minutesThisWeek,
    minutesLastWeek,
    streakDays: profile.streakDays,
    recommendations,
  };

  const existing = await prisma.aiReview.findFirst({ where: { userId: sessionUser.id, weekStart } });
  const review = existing
    ? await prisma.aiReview.update({ where: { id: existing.id }, data: { content: content as Prisma.InputJsonValue } })
    : await prisma.aiReview.create({ data: { userId: sessionUser.id, weekStart, content: content as Prisma.InputJsonValue } });

  return NextResponse.json({ review });
}
