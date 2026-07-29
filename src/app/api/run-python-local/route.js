import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req) {
  let tmpFilePath = null;

  try {
    const { script_code, script_filename } = await req.json();

    if (!script_code) {
      return NextResponse.json({ error: 'No script code provided' }, { status: 400 });
    }

    const safeFilename = (script_filename || 'script.py').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const tmpDir = os.tmpdir();
    tmpFilePath = path.join(tmpDir, `hirenetic_${Date.now()}_${safeFilename}`);

    // Write code to temporary file
    await fs.writeFile(tmpFilePath, script_code, 'utf8');

    // Execute python command locally with 30s timeout
    const result = await new Promise((resolve) => {
      const primaryCmd = process.platform === 'win32' ? 'python' : 'python3';
      const secondaryCmd = process.platform === 'win32' ? 'python3' : 'python';

      const runWithCmd = (cmd) => {
        exec(`${cmd} "${tmpFilePath}"`, { timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
          if (error && error.code === 127 && cmd === primaryCmd) {
            // If primary command not found (code 127), try secondary command
            return runWithCmd(secondaryCmd);
          }
          resolve({
            error,
            stdout: stdout ? stdout.toString() : '',
            stderr: stderr ? stderr.toString() : '',
          });
        });
      };

      runWithCmd(primaryCmd);
    });

    // Cleanup temp file
    try {
      if (tmpFilePath) await fs.unlink(tmpFilePath);
    } catch {
      // Ignore cleanup error
    }

    const exitCode = result.error ? result.error.code || 1 : 0;
    const isTimeout = result.error && result.error.killed;

    if (isTimeout) {
      return NextResponse.json({
        success: false,
        exitCode: 124,
        stdout: result.stdout,
        stderr: 'Execution timed out (exceeded 30 seconds limit).',
      });
    }

    return NextResponse.json({
      success: exitCode === 0,
      exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error) {
    if (tmpFilePath) {
      try { await fs.unlink(tmpFilePath); } catch {}
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
