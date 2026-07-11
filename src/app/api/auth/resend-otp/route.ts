import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailSchema } from '@/lib/validations/auth';
import { generateOtp, hashOtp, otpExpiry } from '@/lib/auth/otp';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!rateLimit(`resend:${clientIp(req)}`, 4, 60_000)) {
    return NextResponse.json({ error: 'Please wait before requesting another code.' }, { status: 429 });
  }
  const parsed = emailSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond ok to avoid leaking which emails exist.
  if (!user || user.emailVerified) return NextResponse.json({ ok: true });

  await prisma.otpVerification.deleteMany({ where: { userId: user.id, purpose: 'EMAIL_VERIFICATION' } });
  const code = generateOtp();
  await prisma.otpVerification.create({
    data: { userId: user.id, purpose: 'EMAIL_VERIFICATION', codeHash: await hashOtp(code), expiresAt: otpExpiry() },
  });
  try {
    await sendOtpEmail(email, code, user.username);
  } catch (err) {
    console.error('resend-otp: failed to send OTP email', err);
    return NextResponse.json(
      { error: 'We could not send the verification email. Please try again shortly.' },
      { status: 502 }
    );
  }

  const body: Record<string, unknown> = { ok: true };
  if (process.env.NODE_ENV === 'development') body.devCode = code;
  return NextResponse.json(body);
}
