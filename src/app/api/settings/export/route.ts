import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { getSettingsBundle } from '@/lib/settings/service';
import { logActivity } from '@/lib/settings/security';

export const runtime = 'nodejs';

/**
 * GET /api/settings/export
 *
 * Everything this account owns, as a downloadable JSON file. Every query is
 * scoped by userId — no other user's data can appear here. Credentials are
 * deliberately excluded: the password hash, TOTP secret, and recovery-code
 * hashes are not the user's data to re-import, and exporting them would turn a
 * convenience feature into a credential-exfiltration path.
 */
export async function GET(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const userId = sessionUser.id;

  const [user, profile, settings, workouts, progress, achievements, security, activity] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isPro: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      prisma.userProfile.findUnique({ where: { userId } }),
      getSettingsBundle(userId),
      prisma.workoutLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { exercises: { include: { sets: true } } },
      }),
      prisma.progressEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
      // Status only — never the secret or the code hashes.
      prisma.securitySettings.findUnique({
        where: { userId },
        select: { twoFactorEnabled: true, lastPasswordChange: true },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { action: true, detail: true, ipAddress: true, createdAt: true },
      }),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    format: 'wedxui-fit/v1',
    note: 'Credentials (password hash, 2FA secret, recovery codes) are intentionally excluded.',
    user,
    profile,
    settings,
    security: security ?? { twoFactorEnabled: false, lastPasswordChange: null },
    workouts,
    progress,
    achievements,
    activity,
  };

  await logActivity(userId, 'DATA_EXPORTED', `${workouts.length} workouts`, req);

  const filename = `wedxui-fit-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      // A data export must never be cached by a shared proxy.
      'Cache-Control': 'no-store, private',
    },
  });
}
