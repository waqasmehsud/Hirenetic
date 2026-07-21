import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

function getHoursRemaining(resetAtString: string): string {
  try {
    const resetDate = new Date(resetAtString);
    const refreshDate = new Date(resetDate.getTime() + 24 * 60 * 60 * 1000);
    const diff = refreshDate.getTime() - new Date().getTime();
    if (diff <= 0) return "soon";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  } catch {
    return "24h";
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages }: { messages: ChatMessage[] } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages history is required" }, { status: 400 });
    }

    // Fetch the Gemini key and daily limits records for the user
    const supabase = await createServerSupabaseClient();
    const { data: keyRecord, error } = await supabase
      .from("llm_keys")
      .select("id, api_key, model_name, requests_today, tokens_today, reset_at")
      .eq("user_id", user.id)
      .like("model_name", "Gemini %")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error || !keyRecord || keyRecord.length === 0) {
      return NextResponse.json({
        success: false,
        error: "NO_GEMINI_KEY",
        message: "Gemini API Key not found. Please add your Gemini API key in the 'LLM API Management' section to start chatting.",
      });
    }

    const dbRecord = keyRecord[0];
    const apiKey = dbRecord.api_key;
    const savedModelName = dbRecord.model_name;

    // Rate-limiting check (24 hour rollover cycle)
    let requestsToday = dbRecord.requests_today || 0;
    let tokensToday = dbRecord.tokens_today || 0;
    let resetAt = dbRecord.reset_at || new Date().toISOString();

    const resetDate = new Date(resetAt);
    const now = new Date();
    
    if (now.getTime() - resetDate.getTime() > 24 * 60 * 60 * 1000) {
      // 24 hours has passed, reset budget values locally
      requestsToday = 0;
      tokensToday = 0;
      resetAt = now.toISOString();
    }

    // Check if limits exceeded
    if (requestsToday >= 1500) {
      return NextResponse.json({
        success: false,
        error: "LIMIT_EXCEEDED",
        message: `Daily request limit of 1,500 requests reached for Free Tier. Refreshes in: ${getHoursRemaining(resetAt)}`,
      });
    }

    if (tokensToday >= 1000000) {
      return NextResponse.json({
        success: false,
        error: "LIMIT_EXCEEDED",
        message: `Daily token limit of 1,000,000 tokens reached for Free Tier. Refreshes in: ${getHoursRemaining(resetAt)}`,
      });
    }
    
    // Map human-readable model selection to Google API Model IDs
    let geminiModelId = "gemini-3.5-flash";
    if (savedModelName === "Gemini 3.5 Flash") geminiModelId = "gemini-3.5-flash";
    else if (savedModelName === "Gemini 2.5 Flash") geminiModelId = "gemini-2.5-flash";
    else if (savedModelName === "Gemini 2.0 Flash") geminiModelId = "gemini-2.0-flash";
    else if (savedModelName === "Gemini 1.5 Flash") geminiModelId = "gemini-1.5-flash";
    else if (savedModelName === "Gemini 1.5 Pro") geminiModelId = "gemini-1.5-pro";

    // Convert messages to Gemini contents structure
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API returned error:", errText);
      let apiErrorMessage = "Please verify if your API Key is valid.";
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          apiErrorMessage = errJson.error.message;
        }
      } catch {}
      
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_ERROR",
        message: `Gemini API Error: ${apiErrorMessage}`,
      });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json({
        success: false,
        error: "EMPTY_RESPONSE",
        message: "Received empty response from Gemini.",
      });
    }

    // Estimate request tokens (standard approx: ~3.8 characters per token)
    const inputChars = contents.reduce((acc, curr) => acc + (curr.parts[0]?.text || "").length, 0);
    const outputChars = replyText.length;
    const estimatedTokens = Math.ceil((inputChars + outputChars) / 3.8);

    // Save incremented usage counts to database
    const { error: updateError } = await supabase
      .from("llm_keys")
      .update({
        requests_today: requestsToday + 1,
        tokens_today: tokensToday + estimatedTokens,
        reset_at: resetAt,
      })
      .eq("id", dbRecord.id);

    if (updateError) {
      console.error("Error updating key usage counts:", updateError);
    }

    return NextResponse.json({
      success: true,
      text: replyText,
    });
  } catch (err) {
    console.error("API Chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
