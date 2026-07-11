import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { generateOtp, hashOtp, otpExpiry } from '@/lib/auth/otp';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 });
  }

  const parsed = registerSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message, field: issue.path[0] }, { status: 400 });
  }
  const { username, email, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail?.emailVerified) {
    return NextResponse.json({ error: 'This email is already registered.', field: 'email' }, { status: 409 });
  }
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername && existingUsername.email !== email) {
    return NextResponse.json({ error: 'That username is taken — choose another.', field: 'username' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  // New user, or re-registering an as-yet-unverified account (re-issue OTP).
  const user = existingEmail
    ? await prisma.user.update({
        where: { id: existingEmail.id },
        data: { username, password: passwordHash, name: username },
      })
    : await prisma.user.create({
        data: { username, email, name: username, password: passwordHash },
      });

  await prisma.otpVerification.deleteMany({ where: { userId: user.id, purpose: 'EMAIL_VERIFICATION' } });
  const code = generateOtp();
  await prisma.otpVerification.create({
    data: { userId: user.id, purpose: 'EMAIL_VERIFICATION', codeHash: await hashOtp(code), expiresAt: otpExpiry() },
  });
  try {
    await sendOtpEmail(email, code, username);
  } catch (err) {
    console.error('register: failed to send OTP email', err);
    return NextResponse.json(
      { error: 'We could not send the verification email. Please try again shortly or contact support.' },
      { status: 502 }
    );
  }

  const body: Record<string, unknown> = { ok: true, email };
  if (process.env.NODE_ENV === 'development') body.devCode = code; // dev-only convenience
  return NextResponse.json(body, { status: 201 });
}
