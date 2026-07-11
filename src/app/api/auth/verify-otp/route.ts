import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { otpSchema } from '@/lib/validations/auth';
import { verifyOtpHash, OTP_MAX_ATTEMPTS } from '@/lib/auth/otp';
import { createSession } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!rateLimit(`verify:${clientIp(req)}`, 15, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 });
  }
  const parsed = otpSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 });
  if (user.emailVerified) {
    await createSession(user.id); // already verified — just log in
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const otp = await prisma.otpVerification.findFirst({
    where: { userId: user.id, purpose: 'EMAIL_VERIFICATION', consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) return NextResponse.json({ error: 'No active code. Please resend.' }, { status: 400 });
  if (otp.expiresAt < new Date()) return NextResponse.json({ error: 'Code expired. Please resend.' }, { status: 400 });
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many wrong attempts. Please resend a new code.' }, { status: 429 });
  }

  const ok = await verifyOtpHash(code, otp.codeHash);
  if (!ok) {
    await prisma.otpVerification.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.otpVerification.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
  ]);
  await createSession(user.id); // verified — log in immediately

  return NextResponse.json({ ok: true });
}
