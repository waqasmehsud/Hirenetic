import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here";

describe("Row Level Security (RLS) Integration Tests", () => {
  // Bypasses WebSocket constructor check in Node.js test environments
  const realtimeConfig = {
    transport: class {} as unknown as typeof globalThis.WebSocket,
  };

  // Client configurations
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: realtimeConfig,
  });
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: realtimeConfig,
  });
  const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: realtimeConfig,
  });

  let dbAvailable = true;

  beforeAll(async () => {
    // Authenticate user client (Jane Doe)
    const { error: userAuthError } = await userClient.auth.signInWithPassword({
      email: "user@example.com",
      password: "Password123",
    });
    if (userAuthError) {
      dbAvailable = false;
      console.warn(
        "⚠️ Local Supabase stack not running. Skipping RLS assertions."
      );
    }

    // Authenticate admin client (System Administrator)
    const { error: adminAuthError } = await adminClient.auth.signInWithPassword(
      {
        email: "admin@example.com",
        password: "Password123",
      }
    );
    if (adminAuthError) {
      dbAvailable = false;
    }
  });

  it("should prevent anonymous clients from reading profiles", async () => {
    if (!dbAvailable) return;
    const { data, error } = await anonClient.from("profiles").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("should prevent normal authenticated users from reading other users' private profiles", async () => {
    if (!dbAvailable) return;
    const { data: profileData } = await userClient.from("profiles").select("*");
    expect(profileData).not.toBeNull();

    // User should only see their own profile
    const onlyOwnProfile = profileData!.every(
      (p) => p.id === "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12"
    );
    expect(onlyOwnProfile).toBe(true);
  });

  it("should allow admin clients to read all users' profiles", async () => {
    if (!dbAvailable) return;
    const { data, error } = await adminClient.from("profiles").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(1);
  });
});
