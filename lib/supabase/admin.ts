import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminSupabaseClient can only be called on the server"
    );
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
