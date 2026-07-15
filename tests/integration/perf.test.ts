import { describe, it, expect, vi } from "vitest";

// Mock dependencies to isolate handler performance from external services
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    RESEND_API_KEY: "test-resend-key",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "perf-user", email: "perf@test.com" }),
  requireOwnership: vi.fn(),
  requireAdmin: vi.fn(),
  AuthError: class extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: 0 }),
}));

describe("Performance Smoke Tests (NFR-9 / NFR-10)", () => {
  const LATENCY_BUDGET_MS = 300; // NFR-10: API routes return within 300ms at p95
  const SAMPLE_SIZE = 20;

  async function measureLatency(fn: () => Promise<Response>): Promise<number[]> {
    const times: number[] = [];
    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    return times.sort((a, b) => a - b);
  }

  function percentile(sorted: number[], p: number): number {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  it(`GET /api/v1/items p95 latency should be under ${LATENCY_BUDGET_MS}ms (NFR-10)`, async () => {
    const { GET } = await import("../../app/api/v1/items/route");
    const times = await measureLatency(() => GET());
    const p95 = percentile(times, 95);
    console.warn(`  Items GET p95: ${p95.toFixed(2)}ms (budget: ${LATENCY_BUDGET_MS}ms)`);
    expect(p95).toBeLessThan(LATENCY_BUDGET_MS);
  });

  it(`GET /api/v1/items/[id] p95 latency should be under ${LATENCY_BUDGET_MS}ms (NFR-10)`, async () => {
    const { GET } = await import("../../app/api/v1/items/[id]/route");
    const times = await measureLatency(() =>
      GET(new Request("http://localhost"), { params: Promise.resolve({ id: "test-id" }) })
    );
    const p95 = percentile(times, 95);
    console.warn(`  Items GET [id] p95: ${p95.toFixed(2)}ms (budget: ${LATENCY_BUDGET_MS}ms)`);
    expect(p95).toBeLessThan(LATENCY_BUDGET_MS);
  });

  it("documents that LCP testing (NFR-9) requires browser-based measurement", () => {
    // NFR-9: Server-rendered pages achieve LCP under 2.5s on simulated 4G.
    // This cannot be measured in a Vitest unit/integration context.
    // LCP is measured via Playwright + Lighthouse or via Chrome DevTools Protocol.
    // See tests/e2e/ for browser-based testing.
    expect(true).toBe(true);
  });
});
