import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Só cria cliente se URL/token forem reais (evita ENOTFOUND com placeholders tipo xxx.upstash.io). */
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const looksPlaceholder =
    /xxx|placeholder|your_redis|changeme|example\.com/i.test(url) ||
    /xxx|changeme|your_token/i.test(token);
  if (looksPlaceholder) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".upstash.io")) {
      return null;
    }
  } catch {
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedis();

// Auth routes: 5 attempts per 15 minutes per IP
export const authRatelimit: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

// Upload routes: 20 uploads per hour per user
export const uploadRatelimit: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:upload",
    })
  : null;

// Generic API: 100 requests per minute per user
export const apiRatelimit: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};
