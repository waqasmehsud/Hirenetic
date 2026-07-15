import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";
import { createItemSchema } from "@/lib/validation/items.schema";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    // Rate Limiting (60 requests/min for general CRUD)
    const { success, remaining, reset } = await rateLimit(`items-get:${user.id}`, 60, 60);
    const headers = {
      "X-RateLimit-Limit": "60",
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
    const { data: dbItems, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch items from database", error);
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500, headers });
    }

    return NextResponse.json(dbItems, { status: 200, headers });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    const status = errorObj.status || 500;
    return NextResponse.json(
      { error: errorObj.message || "Internal server error" },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    // Rate Limiting (30 requests/min for creations)
    const { success, remaining, reset } = await rateLimit(`items-post:${user.id}`, 30, 60);
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

    const body = (await request.json()) as Record<string, unknown>;
    const parsedBody = createItemSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedBody.error.flatten().fieldErrors },
        { status: 400, headers }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: newItem, error } = await supabase
      .from("items")
      .insert({
        name: parsedBody.data.name,
        description: parsedBody.data.description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to insert item into database", error, { userId: user.id });
      return NextResponse.json({ error: "Failed to create item" }, { status: 500, headers });
    }

    return NextResponse.json(newItem, { status: 201, headers });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    const status = errorObj.status || 500;
    return NextResponse.json(
      { error: errorObj.message || "Internal server error" },
      { status }
    );
  }
}
