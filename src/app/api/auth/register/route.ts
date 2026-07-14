import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
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
  if (existingEmail) {
    return NextResponse.json({ error: 'This email is already registered.', field: 'email' }, { status: 409 });
  }
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json({ error: 'That username is taken — choose another.', field: 'username' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  // No email verification step — account is usable immediately.
  const user = await prisma.user.create({
    data: { username, email, name: username, password: passwordHash, emailVerified: new Date() },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
