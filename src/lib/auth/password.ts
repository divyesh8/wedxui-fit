import bcrypt from 'bcryptjs';

/** Hash a plaintext password with bcrypt (cost 12). */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/** Constant-time compare a plaintext password against a bcrypt hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
