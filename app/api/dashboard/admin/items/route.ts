import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface ProfileJoined {
  full_name: string | null;
  role: string | null;
}

interface ItemWithProfile {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  profiles: ProfileJoined | null;
}

export async function GET() {
  try {
    const user = await requireAdmin();

    // Rate Limiting (30 requests/min for admin audit)
    const { success, remaining, reset } = await rateLimit(`admin-items-get:${user.id}`, 30, 60);
    const headers = {
      "X-RateLimit-Limit": "30",
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    };

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: items, error } = await supabase
      .from("items")
      .select("*, profiles(full_name, role)")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch all items for admin panel", error);
      return NextResponse.json(
        { error: "Failed to fetch admin audit records" },
        { status: 500, headers }
      );
    }

    // Cast the returned data to assert profiles shape matches local type definition
    const castedItems = items as unknown as ItemWithProfile[];

    return NextResponse.json(castedItems, { status: 200, headers });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    const status = errorObj.status || 500;
    return NextResponse.json(
      { error: errorObj.message || "Internal server error" },
      { status }
    );
  }
}
