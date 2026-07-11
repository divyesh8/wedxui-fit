import { SignJWT, jwtVerify } from 'jose';

// Edge-safe (jose + TextEncoder only) — imported by both middleware and node routes.
export const SESSION_COOKIE = 'wedxui_session';

export function sessionTtlDays(): number {
  const n = parseInt(process.env.SESSION_TTL_DAYS ?? '7', 10);
  return Number.isFinite(n) && n > 0 ? n : 7;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export interface SessionClaims {
  userId: string;
  sessionId: string;
}

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  const ttlSec = sessionTtlDays() * 24 * 60 * 60;
  return new SignJWT({ sid: claims.sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSec)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') return null;
    return { userId: payload.sub, sessionId: payload.sid };
  } catch {
    return null;
  }
}
