import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { generateRecoveryCodes, hashRecoveryCodes, logActivity } from '@/lib/settings/security';

export const runtime = 'nodejs';

const body = z.object({
  password: z.string().min(1, 'Enter your password to regenerate recovery codes'),
});

/**
 * POST /api/settings/2fa/recovery-codes
 *
 * Regenerating invalidates every previous code — that is the point, and the UI
 * says so before calling this. Password-gated for the same reason as disabling.
 */
export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, field: 'password' },
      { status: 400 }
    );
  }

  const [user, security] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id }, select: { password: true } }),
    prisma.securitySettings.findUnique({ where: { userId: sessionUser.id } }),
  ]);

  if (!(await verifyPassword(parsed.data.password, user.password))) {
    return NextResponse.json({ error: 'Password is incorrect.', field: 'password' }, { status: 400 });
  }
  if (!security?.twoFactorEnabled) {
    return NextResponse.json(
      { error: 'Enable two-factor authentication before generating recovery codes.' },
      { status: 400 }
    );
  }

  const recoveryCodes = generateRecoveryCodes();
  await prisma.securitySettings.update({
    where: { userId: sessionUser.id },
    data: { recoveryCodes: await hashRecoveryCodes(recoveryCodes) },
  });
  await logActivity(sessionUser.id, 'RECOVERY_CODES_REGENERATED', undefined, req);

  return NextResponse.json({ recoveryCodes });
}
