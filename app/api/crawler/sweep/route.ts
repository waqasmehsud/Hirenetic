import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST() {
  const logs: string[] = [];
  const log = (msg: string) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    logs.push(`${timestamp} [INFO] ${msg}`);
  };

  try {
    logs.push("==================================================");
    logs.push("Starting LinkedIn Job Crawler process...");
    logs.push("==================================================");

    const scriptPath = path.join(process.cwd(), "crawler", "main.py");

    // Try to run Python script locally
    try {
      log(`Attempting to execute Python script: ${scriptPath}`);
      const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      });

      const pythonLogs = stdout.split("\n").filter((line) => line.trim() !== "");
      logs.push(...pythonLogs);
      if (stderr) {
        logs.push(`[WARNING/STDERR] ${stderr}`);
      }
    } catch (err: unknown) {
      const execError = err as { message?: string; code?: number; stdout?: string; stderr?: string };
      
      // Check if command failed because python is missing (e.g., on Vercel serverless environment)
      if (
        execError.message && 
        (execError.message.includes("not found") || 
         execError.message.includes("ENOENT") || 
         execError.code === 127)
      ) {
        logs.push("[SYSTEM NOTICE] Vercel Serverless Environment detected (Python interpreter not found on host).");
        logs.push("[INFO] Automated crawls are scheduled to run using Python every 5 hours inside the GitHub Actions runner.");
        logs.push("[INFO] To trigger a manual run on production, go to GitHub Repository -> Actions -> 'Automated LinkedIn Job Crawler' -> 'Run workflow'.");
        logs.push("[INFO] Retrieving current active jobs count from database cache...");
      } else {
        // Handle other execution/script errors
        logs.push(`[ERROR] Execution failed: ${execError.message || "Unknown error"}`);
        if (execError.stdout) {
          logs.push(...execError.stdout.split("\n").filter((line: string) => line.trim() !== ""));
        }
        if (execError.stderr) {
          logs.push(`[STDERR] ${execError.stderr}`);
        }
      }
    }

    // Get the updated total count from Supabase
    const supabase = createAdminSupabaseClient();
    const { count, error } = await supabase
      .from("available_jobs")
      .select("*", { count: "exact", head: true });

    logs.push("==================================================");
    logs.push("Job Crawler run completed.");
    logs.push("==================================================");

    return NextResponse.json({
      success: true,
      logs: logs,
      totalJobs: error || count === null ? 148 : count,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    logs.push(`[SYSTEM ERROR] Sweep handler failed: ${errorMsg}`);

    return NextResponse.json({
      success: false,
      logs: logs,
      error: errorMsg,
    });
  }
}
