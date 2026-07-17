import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../../app/api/health/route";

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    RESEND_API_KEY: "test-resend-key",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe("Health Check API - GET /api/health", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  it("should return OK status (200) when both DB and email are healthy", async () => {
    fetchSpy.mockImplementation(async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.includes("supabase")) {
        return new Response(null, { status: 200 });
      }
      if (url.includes("resend")) {
        return new Response(null, { status: 200 });
      }
      return new Response(null, { status: 404 });
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("OK");
    expect(body.services.database).toBe("UP");
    expect(body.services.email).toBe("UP");
  });

  it("should return DEGRADED status (200) when only database is down", async () => {
    fetchSpy.mockImplementation(async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.includes("supabase")) {
        throw new Error("Connection refused");
      }
      if (url.includes("resend")) {
        return new Response(null, { status: 200 });
      }
      return new Response(null, { status: 404 });
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("DEGRADED");
    expect(body.services.database).toBe("DOWN");
    expect(body.services.email).toBe("UP");
  });

  it("should return DEGRADED status (200) when only email is down", async () => {
    fetchSpy.mockImplementation(async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.includes("supabase")) {
        return new Response(null, { status: 200 });
      }
      if (url.includes("resend")) {
        return new Response(null, { status: 500 });
      }
      return new Response(null, { status: 404 });
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("DEGRADED");
    expect(body.services.database).toBe("UP");
    expect(body.services.email).toBe("DOWN");
  });

  it("should return DOWN status (503) when both services are down", async () => {
    fetchSpy.mockImplementation(async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.includes("supabase")) {
        throw new Error("Connection refused");
      }
      if (url.includes("resend")) {
        throw new Error("Connection refused");
      }
      return new Response(null, { status: 404 });
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("DOWN");
    expect(body.services.database).toBe("DOWN");
    expect(body.services.email).toBe("DOWN");
  });

  it("should include correct response shape", async () => {
    fetchSpy.mockImplementation(
      async () => new Response(null, { status: 200 })
    );

    const response = await GET();
    const body = await response.json();

    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("services");
    expect(body.services).toHaveProperty("database");
    expect(body.services).toHaveProperty("email");
    expect(body.version).toBe("0.1.0");
  });

  it("should return a valid ISO timestamp", async () => {
    fetchSpy.mockImplementation(
      async () => new Response(null, { status: 200 })
    );

    const response = await GET();
    const body = await response.json();

    const parsed = new Date(body.timestamp);
    expect(parsed.toISOString()).toBe(body.timestamp);
    expect(isNaN(parsed.getTime())).toBe(false);
  });
});
