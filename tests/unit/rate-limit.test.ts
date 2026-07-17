import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "../../lib/rate-limit";
import { env } from "../../lib/env";

vi.mock("../../lib/env", () => ({
  env: {
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
  },
}));

vi.mock("../../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── In-memory fallback (Upstash NOT configured) ───────────────────────────

  describe("in-memory fallback", () => {
    beforeEach(() => {
      (env as Record<string, string>).UPSTASH_REDIS_REST_URL = "";
      (env as Record<string, string>).UPSTASH_REDIS_REST_TOKEN = "";
    });

    it("allows requests under the limit", async () => {
      const result = await rateLimit("mem-allow-test", 5, 60);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBeLessThanOrEqual(5);
    });

    it("returns remaining count correctly as requests are made", async () => {
      const id = "mem-remaining-test";
      const limit = 5;

      const r1 = await rateLimit(id, limit, 60);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(4);

      const r2 = await rateLimit(id, limit, 60);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(3);

      const r3 = await rateLimit(id, limit, 60);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(2);
    });

    it("blocks requests that exceed the limit", async () => {
      const id = "mem-block-test";
      const limit = 3;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        await rateLimit(id, limit, 60);
      }

      const blocked = await rateLimit(id, limit, 60);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it("uses separate counters for different identifiers", async () => {
      const idA = "mem-separate-a";
      const idB = "mem-separate-b";
      const limit = 2;

      // Exhaust limit for idA
      await rateLimit(idA, limit, 60);
      await rateLimit(idA, limit, 60);
      const blockedA = await rateLimit(idA, limit, 60);
      expect(blockedA.success).toBe(false);

      // idB should still be allowed
      const allowedB = await rateLimit(idB, limit, 60);
      expect(allowedB.success).toBe(true);
      expect(allowedB.remaining).toBe(1);
    });

    it("respects custom limit and window parameters", async () => {
      const id = "mem-custom-params";
      const customLimit = 2;
      const customWindow = 120;

      const r1 = await rateLimit(id, customLimit, customWindow);
      expect(r1.success).toBe(true);
      expect(r1.limit).toBe(customLimit);
      expect(r1.remaining).toBe(1);

      const r2 = await rateLimit(id, customLimit, customWindow);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(0);

      const r3 = await rateLimit(id, customLimit, customWindow);
      expect(r3.success).toBe(false);
      expect(r3.remaining).toBe(0);
    });
  });

  // ─── Upstash Redis path ────────────────────────────────────────────────────

  describe("Upstash Redis path", () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      (env as Record<string, string>).UPSTASH_REDIS_REST_URL =
        "https://fake-redis.upstash.io";
      (env as Record<string, string>).UPSTASH_REDIS_REST_TOKEN = "fake-token";
      fetchSpy = vi.spyOn(globalThis, "fetch");
    });

    afterEach(() => {
      fetchSpy.mockRestore();
      (env as Record<string, string>).UPSTASH_REDIS_REST_URL = "";
      (env as Record<string, string>).UPSTASH_REDIS_REST_TOKEN = "";
    });

    it("makes a POST to the pipeline endpoint with correct auth header", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify([{ result: 1 }]), { status: 200 })
      );

      await rateLimit("upstash-post-test");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://fake-redis.upstash.io/pipeline");
      expect(options.method).toBe("POST");
      expect((options.headers as Record<string, string>).Authorization).toBe(
        "Bearer fake-token"
      );
    });

    it("returns success when count is under the limit", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify([{ result: 1 }]), { status: 200 })
      );

      const result = await rateLimit("upstash-under-limit", 10, 60);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
    });

    it("returns failure when count exceeds the limit", async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify([{ result: 11 }]), { status: 200 })
      );

      const result = await rateLimit("upstash-over-limit", 10, 60);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(10);
    });

    it("fails open when Upstash returns a non-OK response", async () => {
      fetchSpy.mockResolvedValue(
        new Response("Internal Server Error", { status: 500 })
      );

      const result = await rateLimit("upstash-non-ok", 10, 60);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it("fails open when fetch throws an exception (network error)", async () => {
      fetchSpy.mockRejectedValue(new Error("Network failure"));

      const result = await rateLimit("upstash-network-error", 10, 60);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });
});
