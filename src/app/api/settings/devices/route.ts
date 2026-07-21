import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/jwt';
import { logActivity } from '@/lib/settings/security';

export const runtime = 'nodejs';

/** getSessionUser() does not surface the session id, so read it from the cookie. */
async function currentSessionId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return (await verifySessionToken(token))?.sessionId ?? null;
}

/**
 * Best-effort, honest device labelling from the UA string. No UA-parsing
 * dependency — this is a hint to help the user recognise a session, and it is
 * shown next to the raw UA, never in place of it.
 */
function describeDevice(userAgent: string | null): { label: string; kind: 'mobile' | 'tablet' | 'desktop' } {
  if (!userAgent) return { label: 'Unknown device', kind: 'desktop' };
  const ua = userAgent.toLowerCase();

  const kind: 'mobile' | 'tablet' | 'desktop' = /ipad|tablet/.test(ua)
    ? 'tablet'
    : /mobi|android|iphone/.test(ua)
      ? 'mobile'
      : 'desktop';

  const os = /windows/.test(ua)
    ? 'Windows'
    : /iphone|ipad|ios/.test(ua)
      ? 'iOS'
      : /mac os|macintosh/.test(ua)
        ? 'macOS'
        : /android/.test(ua)
          ? 'Android'
          : /linux/.test(ua)
            ? 'Linux'
            : 'Unknown OS';

  // Order matters: Edge and Chrome both contain "chrome"; Safari appears in both.
  const browser = /edg\//.test(ua)
    ? 'Edge'
    : /opr\/|opera/.test(ua)
      ? 'Opera'
      : /chrome\//.test(ua)
        ? 'Chrome'
        : /firefox\//.test(ua)
          ? 'Firefox'
          : /safari\//.test(ua)
            ? 'Safari'
            : 'Unknown browser';

  return { label: `${browser} on ${os}`, kind };
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const [rows, thisSession] = await Promise.all([
    prisma.authSession.findMany({
      where: { userId: sessionUser.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
    currentSessionId(),
  ]);

  const devices = rows.map((s) => {
    const { label, kind } = describeDevice(s.userAgent);
    return {
      id: s.id,
      label,
      kind,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      current: s.id === thisSession,
    };
  });

  return NextResponse.json({ devices });
}

const revokeBody = z.object({
  sessionId: z.string().min(1).optional(),
  /** Revoke every session except the one making the request. */
  all: z.boolean().optional(),
});

export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = revokeBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { sessionId, all } = parsed.data;
  const thisSession = await currentSessionId();

  if (all) {
    const { count } = await prisma.authSession.deleteMany({
      where: { userId: sessionUser.id, ...(thisSession && { id: { not: thisSession } }) },
    });
    await logActivity(sessionUser.id, 'ALL_DEVICES_REVOKED', `${count} session(s)`, req);
    return NextResponse.json({ revoked: count });
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Provide a sessionId, or pass { all: true }.' },
      { status: 400 }
    );
  }
  if (sessionId === thisSession) {
    return NextResponse.json(
      { error: 'That is this device — use Log out instead.' },
      { status: 400 }
    );
  }

  // deleteMany scoped by userId: a crafted sessionId cannot revoke someone else's session.
  const { count } = await prisma.authSession.deleteMany({
    where: { id: sessionId, userId: sessionUser.id },
  });
  if (count === 0) {
    return NextResponse.json({ error: 'That session no longer exists.' }, { status: 404 });
  }

  await logActivity(sessionUser.id, 'DEVICE_REVOKED', sessionId, req);
  return NextResponse.json({ revoked: count });
}
