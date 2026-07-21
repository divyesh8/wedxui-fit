import { NextResponse } from 'next/server';
import { z } from 'zod';
import QRCode from 'qrcode';
import { generateSecret, generateURI, verify } from 'otplib';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import {
  encryptSecret,
  decryptSecret,
  generateRecoveryCodes,
  hashRecoveryCodes,
  logActivity,
} from '@/lib/settings/security';

export const runtime = 'nodejs';

const ISSUER = 'WEDXUI FIT';

// Authenticator clocks drift. ±30s (one step) is the usual allowance; wider
// than that starts to meaningfully extend the window a stolen code is valid for.
const EPOCH_TOLERANCE = 30;

const verifyBody = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app'),
});

const disableBody = z.object({
  password: z.string().min(1, 'Enter your password to disable two-factor authentication'),
});

/**
 * POST /api/settings/2fa
 *
 * Two phases on one verb, distinguished by whether a token is present:
 *   {}            → begin enrollment: new secret + QR. NOT yet enabled.
 *   { token }     → confirm enrollment: verifies against the pending secret,
 *                   enables 2FA, and returns recovery codes exactly once.
 *
 * A pending enrollment is `totpSecret` set while `twoFactorEnabled` is false,
 * so an abandoned enrollment can never lock anyone out.
 */
export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const existing = await prisma.securitySettings.findUnique({ where: { userId: sessionUser.id } });

  // ── Phase 1: begin enrollment ──
  if (!('token' in body)) {
    if (existing?.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled.' },
        { status: 409 }
      );
    }

    const secret = generateSecret();
    const uri = generateURI({ issuer: ISSUER, label: sessionUser.email, secret });
    const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 240 });

    await prisma.securitySettings.upsert({
      where: { userId: sessionUser.id },
      create: { userId: sessionUser.id, totpSecret: encryptSecret(secret), twoFactorEnabled: false },
      update: { totpSecret: encryptSecret(secret), twoFactorEnabled: false },
    });

    // `secret` is returned for manual entry when a camera is unavailable.
    return NextResponse.json({ pending: true, secret, otpauthUri: uri, qrDataUrl });
  }

  // ── Phase 2: confirm enrollment ──
  const parsed = verifyBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, field: 'token' },
      { status: 400 }
    );
  }
  if (existing?.twoFactorEnabled) {
    return NextResponse.json(
      { error: 'Two-factor authentication is already enabled.' },
      { status: 409 }
    );
  }
  if (!existing?.totpSecret) {
    return NextResponse.json(
      { error: 'Start the enrollment again — no pending setup was found.' },
      { status: 400 }
    );
  }

  const secret = decryptSecret(existing.totpSecret);
  if (!secret) {
    return NextResponse.json(
      { error: 'Stored secret could not be read. Start the enrollment again.' },
      { status: 400 }
    );
  }

  const result = await verify({
    secret,
    token: parsed.data.token,
    epochTolerance: EPOCH_TOLERANCE,
  });
  if (!result.valid) {
    return NextResponse.json(
      { error: 'That code is not valid. Check your app and try again.', field: 'token' },
      { status: 400 }
    );
  }

  const recoveryCodes = generateRecoveryCodes();
  await prisma.securitySettings.update({
    where: { userId: sessionUser.id },
    data: { twoFactorEnabled: true, recoveryCodes: await hashRecoveryCodes(recoveryCodes) },
  });
  await logActivity(sessionUser.id, 'TWO_FACTOR_ENABLED', undefined, req);

  // The only time these are ever readable. Only hashes are stored.
  return NextResponse.json({ enabled: true, recoveryCodes });
}

/** DELETE /api/settings/2fa — password-gated, so a hijacked tab cannot disable it. */
export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = disableBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, field: 'password' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { password: true },
  });
  if (!(await verifyPassword(parsed.data.password, user.password))) {
    return NextResponse.json(
      { error: 'Password is incorrect.', field: 'password' },
      { status: 400 }
    );
  }

  await prisma.securitySettings.upsert({
    where: { userId: sessionUser.id },
    create: { userId: sessionUser.id, twoFactorEnabled: false },
    update: { twoFactorEnabled: false, totpSecret: null, recoveryCodes: [] },
  });
  await logActivity(sessionUser.id, 'TWO_FACTOR_DISABLED', undefined, req);

  return NextResponse.json({ enabled: false });
}
