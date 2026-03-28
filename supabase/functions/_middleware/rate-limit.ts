// In-memory rate limit store (resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (
  key: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  let bucket = rateLimitStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    rateLimitStore.set(key, bucket);
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  rateLimitStore.set(key, bucket);

  return { allowed: true, remaining: limit - bucket.count };
};
