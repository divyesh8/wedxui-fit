import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { profileUpdateSchema } from '@/lib/validations/onboarding';

export const runtime = 'nodejs';

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const [profile, allAchievements, unlocked, userRow] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: sessionUser.id } }),
    prisma.achievement.findMany({ orderBy: { xpReward: 'asc' } }),
    prisma.userAchievement.findMany({ where: { userId: sessionUser.id } }),
    prisma.user.findUnique({ where: { id: sessionUser.id }, select: { isPro: true } }),
  ]);
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));
  const achievements = allAchievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));

  return NextResponse.json({
    user: { name: sessionUser.name, email: sessionUser.email },
    profile,
    achievements,
    achievementsCount: unlocked.length,
    isPro: userRow?.isPro ?? false,
  });
}

export async function PATCH(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = profileUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message, field: issue.path[0] }, { status: 400 });
  }
  const { name, image, ...profileFields } = parsed.data;

  const [user, profile] = await prisma.$transaction([
    (name !== undefined || image !== undefined)
      ? prisma.user.update({
          where: { id: sessionUser.id },
          data: { ...(name !== undefined && { name }), ...(image !== undefined && { image }) },
        })
      : prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } }),
    prisma.userProfile.upsert({
      where: { userId: sessionUser.id },
      create: { userId: sessionUser.id, ...profileFields },
      update: profileFields,
    }),
  ]);

  return NextResponse.json({ user: { name: user.name, email: user.email }, profile });
}
