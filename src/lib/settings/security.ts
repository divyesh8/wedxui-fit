import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * TOTP secrets are encrypted at rest with AES-256-GCM. The key is derived from
 * JWT_SECRET via scrypt, so a database dump alone cannot bypass 2FA.
 */
function key(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set — cannot encrypt TOTP secrets.');
  return crypto.scryptSync(secret, 'wedxui-totp-v1', 32);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  // iv:tag:ciphertext — all base64, colon-delimited.
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), enc.toString('base64')].join(':');
}

export function decryptSecret(payload: string): string | null {
  try {
    const [ivB64, tagB64, dataB64] = payload.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null; // tampered or key rotated
  }
}

/** 10 single-use codes. Returned in plaintext ONCE; only hashes are stored. */
export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
}

/** Returns the index of the matching hash, or -1. Caller must consume it. */
export async function findRecoveryCode(input: string, hashes: string[]): Promise<number> {
  const normalized = input.trim().toUpperCase();
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(normalized, hashes[i])) return i;
  }
  return -1;
}

export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'RECOVERY_CODES_REGENERATED'
  | 'DEVICE_REVOKED'
  | 'ALL_DEVICES_REVOKED'
  | 'SETTINGS_UPDATED'
  | 'AI_RESET'
  | 'DATA_EXPORTED'
  | 'HISTORY_DELETED'
  | 'ACCOUNT_DELETION_REQUESTED'
  | 'ACCOUNT_DELETION_CANCELLED';

/** Audit trail. Never throws — logging must not break the action it records. */
export async function logActivity(
  userId: string,
  action: ActivityAction,
  detail?: string,
  req?: Request
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        detail: detail ?? null,
        ipAddress: req?.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
        userAgent: req?.headers.get('user-agent')?.slice(0, 255) ?? null,
      },
    });
  } catch {
    // swallow — audit failure must not surface as a user-facing error
  }
}

// securityScore moved to ./constants (crypto-free) so the client security card
// can import it without pulling node crypto + bcryptjs into the browser bundle.
// Re-exported here for server callers that already import from this module.
export { securityScore, type SecurityScore } from './constants';
