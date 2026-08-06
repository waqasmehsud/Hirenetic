import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  let tmpFilePath = null;

  try {
    // ── Auth Guard: Verify Supabase session before allowing execution ──
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication token' },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }
    // ── End Auth Guard ──

    const { script_code, script_filename } = await req.json();

    if (!script_code) {
      return NextResponse.json({ error: 'No script code provided' }, { status: 400 });
    }

    const safeFilename = (script_filename || 'script.py').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const tmpDir = os.tmpdir();
    tmpFilePath = path.join(tmpDir, `hirenetic_${Date.now()}_${safeFilename}`);

    // Write code to temporary file
    await fs.writeFile(tmpFilePath, script_code, 'utf8');

    // Auto-detect and install missing third-party python imports dynamically
    const stdlib = new Set([
      'os', 'sys', 'time', 'json', 're', 'math', 'datetime', 'random',
      'typing', 'pathlib', 'sqlite3', 'collections', 'itertools', 'textwrap',
      'urllib', 'http', 'functools', 'copy', 'hashlib', 'string'
    ]);
    const pipMap = {
      bs4: 'beautifulsoup4',
      cv2: 'opencv-python',
      sklearn: 'scikit-learn',
      PIL: 'Pillow'
    };

    const importMatches = script_code.matchAll(/^(?:import|from)\s+([a-zA-Z0-9_]+)/gm);
    const toInstall = new Set();
    for (const match of importMatches) {
      const mod = match[1];
      if (!stdlib.has(mod)) {
        toInstall.add(pipMap[mod] || mod);
      }
    }

    if (toInstall.size > 0) {
      const pkgs = Array.from(toInstall).join(' ');
      const isWin = process.platform === 'win32';
      const installCmd = isWin
        ? `python -m pip install ${pkgs}`
        : `python3 -m pip install --break-system-packages ${pkgs}`;

      await new Promise((resolve) => {
        exec(installCmd, { timeout: 60000 }, () => resolve());
      });
    }

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
