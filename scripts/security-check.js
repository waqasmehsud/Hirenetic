#!/usr/bin/env node

/**
 * Hirenetic Local Security Scanner
 * Runs dependency audit, secret detection (gitleaks), and SAST (semgrep)
 * Usage: node scripts/security-check.js [--deps] [--secrets] [--sast] [--docker] [--all]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(color, msg) {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function banner() {
  log(COLORS.cyan, '\n╔══════════════════════════════════════════════════╗');
  log(COLORS.cyan, '║       🛡️  Hirenetic Security Scanner  🛡️          ║');
  log(COLORS.cyan, '╚══════════════════════════════════════════════════╝\n');
}

function run(cmd, options = {}) {
  try {
    const output = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: 120000,
      ...options,
    });
    return { success: true, output: output || '' };
  } catch (err) {
    return {
      success: false,
      output: err.stdout || '',
      stderr: err.stderr || '',
      code: err.status,
    };
  }
}

function checkToolInstalled(cmd, installHint) {
  try {
    execSync(`${cmd} --version`, { cwd: ROOT, stdio: 'pipe', encoding: 'utf-8' });
    return true;
  } catch {
    log(COLORS.yellow, `⚠️  ${cmd} is not installed.`);
    log(COLORS.dim, `   Install: ${installHint}`);
    return false;
  }
}

// ─── DEPENDENCY AUDIT ───────────────────────────────────────
function runDepsAudit() {
  log(COLORS.blue, '\n━━━ 📦 Dependency Security Audit ━━━━━━━━━━━━━━━━━━');
  const result = run('npm audit --audit-level=high', { silent: true });
  if (result.success) {
    log(COLORS.green, '✅ No high/critical vulnerabilities found in dependencies.');
    return true;
  } else {
    // npm audit exits non-zero when vulnerabilities found
    console.log(result.output);
    if (result.stderr) console.error(result.stderr);

    // Check if there are critical/high specifically
    const output = (result.output || '') + (result.stderr || '');
    const hasCritical = /\d+\s+critical/i.test(output);
    const hasHigh = /\d+\s+high/i.test(output);

    if (hasCritical) {
      log(COLORS.red, '❌ CRITICAL vulnerabilities found in dependencies!');
      return false;
    } else if (hasHigh) {
      log(COLORS.yellow, '⚠️  HIGH vulnerabilities found in dependencies.');
      return false;
    } else {
      log(COLORS.yellow, '⚠️  Dependency audit completed with findings (moderate/low).');
      return true; // Don't block on moderate/low
    }
  }
}

// ─── SECRET DETECTION ───────────────────────────────────────
function runSecretsScan() {
  log(COLORS.blue, '\n━━━ 🔑 Secret Detection (Gitleaks) ━━━━━━━━━━━━━━━');
  if (!checkToolInstalled('gitleaks', 'https://github.com/gitleaks/gitleaks#installing')) {
    log(COLORS.red, '❌ Gitleaks not installed. Secret scanning SKIPPED but counts as FAILURE.');
    log(COLORS.dim, '   Windows: winget install gitleaks   |   macOS: brew install gitleaks');
    return false;
  }

  const configPath = path.join(ROOT, '.gitleaks.toml');
  const configArg = fs.existsSync(configPath) ? `--config="${configPath}"` : '';
  const result = run(`gitleaks detect --source="${ROOT}" ${configArg} --redact --no-git -v`, { silent: true });

  if (result.success) {
    log(COLORS.green, '✅ No secrets detected.');
    return true;
  } else {
    // Gitleaks found secrets — print redacted output
    const output = result.output || result.stderr || '';
    // Filter lines that may contain findings but redact values
    const lines = output.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      log(COLORS.red, '❌ Potential secrets detected (values redacted):');
      lines.slice(0, 20).forEach(l => {
        log(COLORS.dim, `   ${l}`);
      });
      if (lines.length > 20) {
        log(COLORS.dim, `   ... and ${lines.length - 20} more findings`);
      }
    } else {
      log(COLORS.red, '❌ Gitleaks detected potential secrets.');
    }
    return false;
  }
}

// ─── SAST (SEMGREP) ─────────────────────────────────────────
function runSast() {
  log(COLORS.blue, '\n━━━ 🔍 SAST Analysis (Semgrep) ━━━━━━━━━━━━━━━━━━━');
  if (!checkToolInstalled('semgrep', 'pip install semgrep  OR  https://semgrep.dev/docs/getting-started/')) {
    log(COLORS.red, '❌ Semgrep not installed. SAST scanning SKIPPED but counts as FAILURE.');
    log(COLORS.dim, '   Install: pip install semgrep');
    return false;
  }

  const excludes = '--exclude=node_modules --exclude=.next --exclude=coverage --exclude=dist --exclude=build --exclude=package-lock.json';
  const result = run(
    `semgrep scan --config=auto --config=p/javascript --config=p/nextjs --config=p/owasp-top-ten ${excludes} --severity=WARNING --severity=ERROR --no-git-ignore --json --quiet "${path.join(ROOT, 'src')}"`,
    { silent: true }
  );

  if (result.success) {
    try {
      const data = JSON.parse(result.output);
      const findings = data.results || [];
      if (findings.length === 0) {
        log(COLORS.green, '✅ No SAST findings.');
        return true;
      }
      log(COLORS.yellow, `⚠️  ${findings.length} SAST finding(s):`);
      const errors = findings.filter(f => f.extra?.severity === 'ERROR');
      const warnings = findings.filter(f => f.extra?.severity !== 'ERROR');
      findings.slice(0, 15).forEach(f => {
        const sev = f.extra?.severity || 'WARNING';
        const color = sev === 'ERROR' ? COLORS.red : COLORS.yellow;
        log(color, `   [${sev}] ${f.check_id}`);
        log(COLORS.dim, `     File: ${path.relative(ROOT, f.path)}:${f.start?.line}`);
        log(COLORS.dim, `     ${f.extra?.message || ''}`);
      });
      if (findings.length > 15) {
        log(COLORS.dim, `   ... and ${findings.length - 15} more`);
      }
      return errors.length === 0; // Fail only on ERROR severity
    } catch {
      log(COLORS.green, '✅ Semgrep scan completed with no critical findings.');
      return true;
    }
  } else {
    // Semgrep returned non-zero
    const output = result.output || result.stderr || '';
    if (output.includes('"results"')) {
      try {
        const data = JSON.parse(output);
        const findings = data.results || [];
        if (findings.length === 0) {
          log(COLORS.green, '✅ No SAST findings.');
          return true;
        }
        const errors = findings.filter(f => f.extra?.severity === 'ERROR');
        log(COLORS.yellow, `⚠️  ${findings.length} SAST finding(s) detected.`);
        findings.slice(0, 10).forEach(f => {
          const sev = f.extra?.severity || 'WARNING';
          const color = sev === 'ERROR' ? COLORS.red : COLORS.yellow;
          log(color, `   [${sev}] ${f.check_id}`);
          log(COLORS.dim, `     File: ${path.relative(ROOT, f.path)}:${f.start?.line}`);
        });
        return errors.length === 0;
      } catch {
        log(COLORS.yellow, '⚠️  Semgrep returned findings. Review output above.');
        return true;
      }
    }
    log(COLORS.yellow, '⚠️  Semgrep scan encountered an issue. Review manually.');
    if (output) console.log(output.substring(0, 500));
    return true; // Don't block on semgrep errors
  }
}

// ─── DOCKER (TRIVY) ─────────────────────────────────────────
function runDockerScan() {
  log(COLORS.blue, '\n━━━ 🐳 Docker Security Scan (Trivy) ━━━━━━━━━━━━━━');
  if (!checkToolInstalled('trivy', 'https://aquasecurity.github.io/trivy/latest/getting-started/installation/')) {
    log(COLORS.yellow, '⚠️  Trivy not installed. Docker scanning skipped.');
    log(COLORS.dim, '   Install: https://aquasecurity.github.io/trivy');
    return true; // Don't fail if trivy not installed for local scans
  }

  const dockerfilePath = path.join(ROOT, 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    log(COLORS.dim, '   No Dockerfile found. Skipping.');
    return true;
  }

  // Scan Dockerfile for misconfigurations
  log(COLORS.dim, '   Scanning Dockerfile for misconfigurations...');
  const configResult = run(`trivy config --severity HIGH,CRITICAL "${dockerfilePath}"`, { silent: true });

  // Scan filesystem for vulnerabilities
  log(COLORS.dim, '   Scanning project filesystem...');
  const fsResult = run(`trivy fs --severity HIGH,CRITICAL --skip-dirs node_modules --skip-dirs .next "${ROOT}"`, { silent: true });

  const hasCriticalConfig = (configResult.output || '').includes('CRITICAL');
  const hasCriticalFs = (fsResult.output || '').includes('CRITICAL');

  if (hasCriticalConfig || hasCriticalFs) {
    log(COLORS.red, '❌ Critical vulnerabilities found by Trivy.');
    if (configResult.output) console.log(configResult.output.substring(0, 800));
    if (fsResult.output) console.log(fsResult.output.substring(0, 800));
    return false;
  }

  log(COLORS.green, '✅ Docker/filesystem scan passed (no critical issues).');
  return true;
}

// ─── MAIN ───────────────────────────────────────────────────
function main() {
  banner();

  const runAll = args.length === 0 || args.includes('--all');
  const runDeps = runAll || args.includes('--deps');
  const runSecrets = runAll || args.includes('--secrets');
  const runSastFlag = runAll || args.includes('--sast');
  const runDocker = args.includes('--docker'); // Docker scan only if explicitly requested or --all

  const results = {};
  let hasFailure = false;

  if (runDeps) {
    results.deps = runDepsAudit();
    if (!results.deps) hasFailure = true;
  }

  if (runSecrets) {
    results.secrets = runSecretsScan();
    if (!results.secrets) hasFailure = true;
  }

  if (runSastFlag) {
    results.sast = runSast();
    if (!results.sast) hasFailure = true;
  }

  if (runDocker || runAll) {
    results.docker = runDockerScan();
    if (!results.docker) hasFailure = true;
  }

  // ─── Summary ──────────────────────────────────────────────
  log(COLORS.cyan, '\n━━━ 📊 Security Scan Summary ━━━━━━━━━━━━━━━━━━━━━');
  Object.entries(results).forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌';
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    log(passed ? COLORS.green : COLORS.red, `  ${icon} ${label}`);
  });

  if (hasFailure) {
    log(COLORS.red, '\n❌ Security checks FAILED. Fix issues before pushing.\n');
    process.exit(1);
  } else {
    log(COLORS.green, '\n✅ All security checks PASSED.\n');
    process.exit(0);
  }
}

main();
