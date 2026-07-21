import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MODELS_LIST = [
  "Gemini 3.5 Flash",
  "Gemini 2.5 Flash",
  "Gemini 2.0 Flash",
  "Gemini 1.5 Flash",
  "Gemini 1.5 Pro",
  "OpenAI GPT-4o",
  "OpenAI GPT-4o-mini",
  "Anthropic Claude 3.5 Sonnet",
  "DeepSeek V3",
];

// Helper to mask key
function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: keys, error } = await supabase
      .from("llm_keys")
      .select("model_name, api_key, requests_today, tokens_today, reset_at")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching keys:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const keyMap = new Map<string, any>();
    if (keys) {
      keys.forEach((k) => {
        keyMap.set(k.model_name, k);
      });
    }

    const responseData = MODELS_LIST.map((model) => {
      const record = keyMap.get(model);
      
      let requestsRemaining = 1500;
      let tokensRemaining = 1000000;
      let refreshTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (record) {
        const resetDate = new Date(record.reset_at || Date.now());
        const now = new Date();
        
        // If 24 hours has passed, reset budget values locally
        if (now.getTime() - resetDate.getTime() > 24 * 60 * 60 * 1000) {
          requestsRemaining = 1500;
          tokensRemaining = 1000000;
          refreshTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        } else {
          requestsRemaining = Math.max(0, 1500 - (record.requests_today || 0));
          tokensRemaining = Math.max(0, 1000000 - (record.tokens_today || 0));
          refreshTime = new Date(resetDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
        }
      }

      return {
        modelName: model,
        isConfigured: !!record,
        maskedKey: record ? maskKey(record.api_key) : "",
        requestsRemaining,
        tokensRemaining,
        refreshTime,
      };
    });

    return NextResponse.json({ success: true, keys: responseData });
  } catch (err) {
    console.error("API GET keys error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { modelName, apiKey } = body;

    if (!modelName || !apiKey || apiKey.trim() === "") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!MODELS_LIST.includes(modelName)) {
      return NextResponse.json({ error: "Invalid model name" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Upsert key with default daily limits tracking variables
    const { error } = await supabase
      .from("llm_keys")
      .upsert(
        {
          user_id: user.id,
          model_name: modelName,
          api_key: apiKey.trim(),
          requests_today: 0,
          tokens_today: 0,
          reset_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, model_name" }
      );

    if (error) {
      console.error("Error upserting key:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "API key saved successfully!" });
  } catch (err) {
    console.error("API POST keys error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { modelName } = body;

    if (!modelName) {
      return NextResponse.json({ error: "Missing model name" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("llm_keys")
      .delete()
      .eq("user_id", user.id)
      .eq("model_name", modelName);

    if (error) {
      console.error("Error deleting key:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "API Key removed successfully!" });
  } catch (err) {
    console.error("API DELETE key error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
