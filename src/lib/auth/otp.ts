import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';

/** Cryptographically-random 6-digit code, zero-padded. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export function verifyOtpHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiry(): Date {
  const minutes = parseInt(process.env.OTP_TTL_MINUTES ?? '5', 10);
  return new Date(Date.now() + (Number.isFinite(minutes) ? minutes : 5) * 60_000);
}

export const OTP_MAX_ATTEMPTS = 5;
