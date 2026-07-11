// Best-effort in-memory rate limiter — good for a single instance and dev.
// For multi-instance production scale, swap for a durable store (e.g. Upstash Redis).
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}
