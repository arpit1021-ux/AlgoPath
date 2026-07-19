import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const getRedis = () => {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};

export const planCreationLimiter = (() => {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "24h"),
    prefix: "rl:plan_create",
    analytics: true,
  });
})();

export const problemUpdateLimiter = (() => {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "1h"),
    prefix: "rl:problem_update",
    analytics: true,
  });
})();

export const notesLimiter = (() => {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1h"),
    prefix: "rl:notes",
    analytics: true,
  });
})();

export const revisionLimiter = (() => {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, "1h"),
    prefix: "rl:revision",
    analytics: true,
  });
})();

export const analyticsLimiter = (() => {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1h"),
    prefix: "rl:analytics",
    analytics: true,
  });
})();

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ blocked: boolean; response?: Response }> {
  if (!limiter) return { blocked: false };
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000);
    const resetInMinutes = Math.ceil(resetInSeconds / 60);
    return {
      blocked: true,
      response: new Response(
        JSON.stringify({
          error: "Too many requests",
          message:
            resetInMinutes > 1
              ? `Please wait ${resetInMinutes} minutes before trying again.`
              : `Please wait ${resetInSeconds} seconds before trying again.`,
          retryAfter: resetInSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": resetInSeconds.toString(),
          },
        }
      ),
    };
  }
  return { blocked: false };
}
