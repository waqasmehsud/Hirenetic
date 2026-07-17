import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";

// Manually load .env.local for local integration tests
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      let val = trimmed.slice(index + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
  }
} catch (err) {
  console.error("Failed to load .env.local in vitest:", err);
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.ts", "app/**/*.ts"],
      exclude: [
        "tests/**",
        "*.config.*",
        "node_modules/**",
        "lib/supabase/**", // Thin SDK wrappers — tested indirectly via integration tests
        "lib/env.ts", // Module-level Zod validation — fails fast at boot, not unit-testable
        "lib/auth/session.ts", // Depends on Next.js cookies() — tested via E2E
        "app/api/auth/**", // OAuth callback — tested via E2E
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80,
      },
    },
  },
});
