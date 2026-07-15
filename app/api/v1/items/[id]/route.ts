import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth, requireOwnership } from "@/lib/auth/guards";
import { updateItemSchema } from "@/lib/validation/items.schema";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Rate Limiting (60 requests/min)
    const { success, remaining, reset } = await rateLimit(`item-get-single:${user.id}`, 60, 60);
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
    const { data: item, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error(`Failed to fetch item ${id} from database`, error);
      return NextResponse.json({ error: "Failed to fetch item" }, { status: 500, headers });
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404, headers });
    }

    return NextResponse.json(item, { status: 200, headers });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    const status = errorObj.status || 500;
    return NextResponse.json(
      { error: errorObj.message || "Internal server error" },
      { status }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Rate Limiting (30 requests/min for updates)
    const { success, remaining, reset } = await rateLimit(`item-patch:${user.id}`, 30, 60);
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
    const parsedBody = updateItemSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedBody.error.flatten().fieldErrors },
        { status: 400, headers }
      );
    }

    // 1. Fetch item to verify ownership first
    const supabase = await createServerSupabaseClient();
    const { data: item, error: fetchError } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      logger.error(`Failed to fetch item ${id} for update checks`, fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500, headers });
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404, headers });
    }

    // 2. Enforce ownership check (owner or admin)
    await requireOwnership(item.user_id);

    // 3. Perform database update
    const { data: updatedItem, error: updateError } = await supabase
      .from("items")
      .update({
        name: parsedBody.data.name,
        description: parsedBody.data.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      logger.error(`Failed to update item ${id} in database`, updateError);
      return NextResponse.json({ error: "Failed to update item" }, { status: 500, headers });
    }

    return NextResponse.json(updatedItem, { status: 200, headers });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    const status = errorObj.status || 500;
    return NextResponse.json(
      { error: errorObj.message || "Internal server error" },
      { status }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Rate Limiting (30 requests/min for deletions)
    const { success, remaining, reset } = await rateLimit(`item-delete:${user.id}`, 30, 60);
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

    // 1. Fetch item to verify ownership first
    const supabase = await createServerSupabaseClient();
    const { data: item, error: fetchError } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      logger.error(`Failed to fetch item ${id} for delete checks`, fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500, headers });
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404, headers });
    }

    // 2. Enforce ownership check (owner or admin)
    await requireOwnership(item.user_id);

    // 3. Perform database delete
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logger.error(`Failed to delete item ${id} from database`, deleteError);
      return NextResponse.json({ error: "Failed to delete item" }, { status: 500, headers });
    }

    return NextResponse.json(
      { success: true, message: "Item deleted successfully" },
      { status: 200, headers }
    );
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    const status = errorObj.status || 500;
    return NextResponse.json(
      { error: errorObj.message || "Internal server error" },
      { status }
    );
  }
}
