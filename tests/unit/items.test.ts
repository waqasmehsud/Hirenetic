import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@supabase/supabase-js";
import { GET, POST } from "../../app/api/v1/items/route";
import { GET as getSingle, PATCH, DELETE } from "../../app/api/v1/items/[id]/route";
import { GET as getAdminItems } from "../../app/api/dashboard/admin/items/route";
import { requireAuth, requireOwnership, requireAdmin } from "../../lib/auth/guards";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { rateLimit } from "../../lib/rate-limit";

// Mock guards
vi.mock("../../lib/auth/guards", () => ({
  requireAuth: vi.fn(),
  requireOwnership: vi.fn(),
  requireAdmin: vi.fn(),
  AuthError: class extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message);
    }
  },
}));

// Mock Supabase
vi.mock("../../lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

// Mock rate limit
vi.mock("../../lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

type MockSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

describe("Items API Endpoints", () => {
  const mockUser = { id: "user-123", email: "user@example.com" } as unknown as User;
  const mockAdmin = { id: "admin-123", email: "admin@example.com" } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: 123456 });
  });

  describe("GET /api/v1/items", () => {
    it("should fetch user items successfully", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const mockItems = [{ id: "1", name: "Item 1", user_id: "user-123" }];
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockItems);
    });

    it("should fail if unauthorized", async () => {
      const authError = new Error("Unauthorized");
      (authError as { status?: number }).status = 401;
      vi.mocked(requireAuth).mockRejectedValue(authError);

      const res = await GET();
      expect(res.status).toBe(401);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/v1/items", () => {
    it("should create a new item successfully with valid payload", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const mockNewItem = { id: "2", name: "New Item", description: "Desc", user_id: "user-123" };
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNewItem, error: null }),
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);

      const req = new Request("http://localhost/api/v1/items", {
        method: "POST",
        body: JSON.stringify({ name: "New Item", description: "Desc" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(mockNewItem);
    });

    it("should fail validation if payload is invalid", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const req = new Request("http://localhost/api/v1/items", {
        method: "POST",
        body: JSON.stringify({ description: "No Name" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string; details: { name?: string } };
      expect(data.error).toBe("Validation failed");
      expect(data.details.name).toBeDefined();
    });
  });

  describe("GET /api/v1/items/[id]", () => {
    it("should fetch single item by ID", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const mockItem = { id: "item-123", name: "Item", user_id: "user-123" };
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);

      const res = await getSingle(new Request("http://localhost"), {
        params: Promise.resolve({ id: "item-123" }),
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockItem);
    });

    it("should return 404 if item not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);

      const res = await getSingle(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nonexistent" }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/items/[id]", () => {
    it("should update item successfully if user has ownership", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const mockItem = { id: "item-123", name: "Item", user_id: "user-123" };
      const mockUpdatedItem = { ...mockItem, name: "Updated Name" };
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedItem, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);
      vi.mocked(requireOwnership).mockResolvedValue(mockUser);

      const req = new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "item-123" }) });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockUpdatedItem);
      expect(requireOwnership).toHaveBeenCalledWith("user-123");
    });
  });

  describe("DELETE /api/v1/items/[id]", () => {
    it("should delete item successfully if user has ownership", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const mockItem = { id: "item-123", name: "Item", user_id: "user-123" };
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
        error: null,
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);
      vi.mocked(requireOwnership).mockResolvedValue(mockUser);

      const res = await DELETE(new Request("http://localhost"), {
        params: Promise.resolve({ id: "item-123" }),
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true, message: "Item deleted successfully" });
      expect(requireOwnership).toHaveBeenCalledWith("user-123");
    });
  });

  describe("GET /api/dashboard/admin/items", () => {
    it("should fetch all items joined with profiles for admins", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(mockAdmin);
      vi.mocked(rateLimit).mockResolvedValue({ success: true, limit: 30, remaining: 29, reset: 123456 });

      const mockItems = [
        {
          id: "item-123",
          name: "Item",
          user_id: "user-123",
          profiles: { full_name: "User One", role: "user" },
        },
      ];
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
      };
      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as unknown as MockSupabaseClient);

      const res = await getAdminItems();
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockItems);
      expect(requireAdmin).toHaveBeenCalled();
    });

    it("should fail if requester is not an admin", async () => {
      const adminError = new Error("Forbidden: Admin privileges required");
      (adminError as { status?: number }).status = 403;
      vi.mocked(requireAdmin).mockRejectedValue(adminError);

      const res = await getAdminItems();
      expect(res.status).toBe(403);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBe("Forbidden: Admin privileges required");
    });
  });
});
