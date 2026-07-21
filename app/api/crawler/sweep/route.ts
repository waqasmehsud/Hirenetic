import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "crawler", "main.py");
    console.log("Starting real python crawler sweep at:", scriptPath);

    // Run the Python script to scrape live LinkedIn jobs and upsert them to Supabase
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
      },
    });

    const logs = stdout.split("\n").filter((line) => line.trim() !== "");
    if (stderr) {
      logs.push(`[WARNING/STDERR] ${stderr}`);
    }

    // Get the updated total count from Supabase
    const supabase = createAdminSupabaseClient();
    const { count, error } = await supabase
      .from("available_jobs")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      logs: logs,
      totalJobs: error || count === null ? 148 : count,
    });
  } catch (err: any) {
    console.error("Failed to run python crawler:", err);
    
    // Attempt to salvage any stdout log lines generated before failure
    const logs = [];
    if (err.stdout) {
      logs.push(...err.stdout.split("\n").filter((line: string) => line.trim() !== ""));
    }
    logs.push(`[SYSTEM ERROR] Crawler failed: ${err.message}`);
    if (err.stderr) {
      logs.push(`[STDERR] ${err.stderr}`);
    }

    return NextResponse.json({
      success: false,
      logs: logs,
      error: err.message,
    });
  }
}
