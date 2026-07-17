import { env } from "./env";
import { logger } from "./logger";

interface RateLimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory fallback for local dev when Upstash is absent
const localCache = new Map<string, { count: number; expires: number }>();

/**
 * Enforces rate limiting on a per-identifier basis (IP or User ID).
 * Uses Upstash Redis pipeline REST API if configured, falling back to in-memory locally.
 * Fails open (logs error and allows request) to prevent rate-limiter downtime from breaking the app.
 */
export async function rateLimit(
  identifier: string,
  limit = 60,
  windowSeconds = 60
): Promise<RateLimitResponse> {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  const isUpstashConfigured = url && url !== "" && token && token !== "";

  if (!isUpstashConfigured) {
    const now = Math.floor(Date.now() / 1000);
    const key = `${identifier}:${Math.floor(now / windowSeconds)}`;
    const record = localCache.get(key);

    if (!record || now > record.expires) {
      localCache.set(key, { count: 1, expires: now + windowSeconds });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowSeconds,
      };
    }

    if (record.count >= limit) {
      return { success: false, limit, remaining: 0, reset: record.expires };
    }

    record.count += 1;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.expires,
    };
  }

  try {
    const now = Date.now();
    const key = `ratelimit:${identifier}:${Math.floor(now / (windowSeconds * 1000))}`;

    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds],
      ]),
      signal: AbortSignal.timeout(3000), // 3-second timeout
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error(
        `Upstash Redis rate limiter request failed: ${res.status} - ${errText}`
      );
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: Math.floor(now / 1000) + windowSeconds,
      };
    }

    const data = (await res.json()) as Array<{ result: number }>;
    const count = data[0]?.result ?? 1;

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: Math.floor(now / 1000) + windowSeconds,
    };
  } catch (err) {
    logger.error("Rate limiter exception", err);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }
}
