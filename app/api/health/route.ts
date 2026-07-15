import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const healthStatus: {
    status: "OK" | "DEGRADED" | "DOWN";
    timestamp: string;
    version: string;
    services: {
      database: "UP" | "DOWN";
      email: "UP" | "DOWN";
    };
  } = {
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    services: {
      database: "UP",
      email: "UP",
    },
  };

  // 1. Check Database Connectivity
  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      signal: AbortSignal.timeout(3000), // 3-second timeout
    });
    if (!res.ok && res.status !== 404) {
      healthStatus.services.database = "DOWN";
      healthStatus.status = "DEGRADED";
    }
  } catch (err) {
    logger.error("Health check - Database ping failed", err);
    healthStatus.services.database = "DOWN";
    healthStatus.status = "DEGRADED";
  }

  // 2. Check Email Provider Reachability (Resend)
  try {
    const res = await fetch("https://api.resend.com/emails", {
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      signal: AbortSignal.timeout(3000), // 3-second timeout
    });
    
    // Status 5xx or network error indicates the service is down/unreachable.
    if (res.status >= 500) {
      healthStatus.services.email = "DOWN";
      healthStatus.status = "DEGRADED";
    }
  } catch (err) {
    logger.error("Health check - Email provider ping failed", err);
    healthStatus.services.email = "DOWN";
    healthStatus.status = "DEGRADED";
  }

  if (healthStatus.services.database === "DOWN" && healthStatus.services.email === "DOWN") {
    healthStatus.status = "DOWN";
  }

  const responseStatus = healthStatus.status === "DOWN" ? 503 : 200;
  return NextResponse.json(healthStatus, { status: responseStatus });
}
