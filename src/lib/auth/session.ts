import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, sessionTtlDays, signSessionToken, verifySessionToken } from './jwt';

// Server-only (uses next/headers). Creates a DB-backed session AND sets the
// httpOnly cookie, so logout can truly revoke access by deleting the row.

export async function createSession(userId: string): Promise<void> {
  const ttlDays = sessionTtlDays();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const hdrs = headers();
  const session = await prisma.authSession.create({
    data: {
      userId,
      expiresAt,
      userAgent: hdrs.get('user-agent')?.slice(0, 255) ?? null,
      ipAddress: (hdrs.get('x-forwarded-for') ?? '').split(',')[0].trim() || null,
    },
  });
  const token = await signSessionToken({ userId, sessionId: session.id });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttlDays * 24 * 60 * 60,
  });
}

export interface SessionUser {
  id: string;
  username: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: Date | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifySessionToken(token);
  if (!claims) return null;
  const session = await prisma.authSession.findUnique({ where: { id: claims.sessionId } });
  if (!session || session.expiresAt < new Date()) return null;
  return prisma.user.findUnique({
    where: { id: claims.userId },
    select: { id: true, username: true, name: true, email: true, role: true, emailVerified: true },
  });
}

export async function destroySession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    const claims = await verifySessionToken(token);
    if (claims) {
      await prisma.authSession.delete({ where: { id: claims.sessionId } }).catch(() => {});
    }
  }
  cookies().delete(SESSION_COOKIE);
}
