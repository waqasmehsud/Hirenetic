# Deployment

## 1. Environment Model

Three environments, one codebase, differentiated entirely by configuration:

| Environment     | Where it runs                                                | Database                                        | Purpose                                         |
| --------------- | ------------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------- |
| **Development** | Local machine, Docker Compose                                | Local Supabase stack (Supabase CLI, Dockerized) | Day-to-day development, disposable data         |
| **Staging**     | Vercel (dedicated project or Preview alias pinned to `main`) | Dedicated Supabase **staging** project          | Pre-production QA, integration testing, demoing |
| **Production**  | Vercel Production                                            | Dedicated Supabase **production** project       | Real users, real data                           |

**Hard rule:** staging and production never share a Supabase project. This is non-negotiable — it's the single easiest way to prevent a QA experiment from corrupting real user data.

Note the distinction from `architecture.md` §5.3: Vercel's automatic **PR preview deployments** are a separate, ephemeral mechanism (one per open PR, torn down after merge) used for code review, and typically point at the _staging_ Supabase project too (never production). The persistent "Staging" environment referenced in the table above is what QA treats as a stable pre-prod target.

## 2. Docker (Development & CI Parity)

Docker is used for **local development and CI consistency**, not as the production runtime (Vercel builds from source directly — see `programmingstack.md` §10).

### 2.1 `Dockerfile` (app container, used for local dev + CI build verification)

See `templates/Dockerfile` for the full file. Key points:

- Multi-stage build: a `deps` stage installs dependencies, a `builder` stage runs `next build`, and a slim `runner` stage copies only the production output — keeping the image small and reducing attack surface.
- Runs as a non-root user in the final stage (security hardening — see `security.md`).
- Uses `node:20-alpine` as the base for a small, actively-maintained image.

### 2.2 `docker-compose.yml` (multi-environment local setup)

See `templates/docker-compose.yml`. Structure:

- A base `docker-compose.yml` defines the app service and wires it to environment variables via an env file.
- `docker-compose.override.yml` (gitignored or dev-only, auto-loaded by Compose) can add local-only tweaks (e.g., volume mounts for hot reload) without polluting the base file.
- Local Supabase services (Postgres, Auth, Storage, Studio) are run via the **Supabase CLI's own Docker orchestration** (`supabase start`), not hand-rolled in our Compose file — this avoids maintaining a fragile reimplementation of Supabase's local stack and stays in sync with the CLI's updates.

Local dev flow:

```bash
supabase start              # spins up local Postgres/Auth/Storage/Studio via Docker
docker compose up --build   # spins up the Next.js app, pointed at the local Supabase stack
```

### 2.3 Why not deploy the Docker image to Vercel?

Vercel's native build pipeline (source → build → serverless functions) is more tightly integrated with its edge network, preview deployments, and zero-config scaling than deploying a container to it would be. Docker's job here is reproducibility for developers and CI — not the production artifact.

## 3. Environment Variables

See `templates/.env.example` for the full annotated file. Categories:

- **Public (safe to expose to the browser, prefixed `NEXT_PUBLIC_`):** Supabase URL, Supabase anon key.
- **Server-only secrets:** Supabase service-role key (used only in `lib/supabase/admin.ts` contexts), email API key, any signing secrets.
- **Environment identifiers:** `NODE_ENV`, `APP_ENV` (`development` | `staging` | `production`) — used by `lib/env.ts` to select environment-specific behavior (e.g., stricter CORS in production).

`lib/env.ts` validates all required variables at process start using a Zod schema; a missing or malformed variable crashes the process immediately with a clear message, rather than surfacing as a confusing runtime error later (per objectives §4.5).

**Where each environment's real values live:**

- Development: `.env.local` (gitignored), populated manually from `.env.example` or via `supabase start`'s printed local credentials.
- Staging/Production: Vercel's Environment Variables settings, scoped to the correct Vercel environment (Preview vs. Production), plus the corresponding Supabase project's API keys.

## 4. GitHub Actions CI/CD Pipeline

See `templates/.github/workflows/ci-cd.yml` for the full workflow. Stages, in order, all required to pass before merge:

1. **Install** — cached `npm ci` for reproducible installs.
2. **Lint** — ESLint.
3. **Type-check** — `tsc --noEmit`.
4. **Test** — Vitest unit/integration tests (with coverage threshold enforcement).
5. **Build** — `next build`, catching build-time errors before deploy.
6. **Dependency audit** — `npm audit --audit-level=high` (or GitHub Dependabot alerts as a complementary/parallel gate); the pipeline fails on unresolved high/critical vulnerabilities.
7. **(main branch only) Database migration** — applies pending Supabase migrations via the Supabase CLI, using a scoped GitHub Actions secret, as an explicit step **before** the Vercel deploy promotes new code, so schema and code changes are sequenced deliberately rather than racing each other.

Vercel's own GitHub integration handles the actual build-and-deploy step (triggered by push/PR), running independently of — but only meaningfully useful after — the Actions pipeline has passed; branch protection rules require the Actions checks to pass before a PR can merge, which is what actually gates production.

## 5. Vercel Configuration

- **Project settings:** connect the GitHub repo; enable automatic deployments for `main` (production) and all PRs (preview).
- **Environment variables:** set per Vercel Environment (Development/Preview/Production) matching the categories in §3. Preview environment variables point at the Supabase _staging_ project; Production environment variables point at the Supabase _production_ project.
- **Domains:** attach the production domain to the Production environment only; preview URLs remain on Vercel's auto-generated subdomains.
- **Build settings:** framework preset "Next.js" (auto-detected); no custom build command needed unless a pre-build migration check is added.
- Optional `vercel.json` for explicit route-level function configuration (e.g., pinning specific API routes to Edge vs. Node runtime, setting function region close to the Supabase project's region to minimize latency).

## 6. Database Migration Strategy

- All schema changes are written as versioned SQL migration files (`db/migrations/`), generated via `supabase db diff` or hand-written, and committed to the repo — never applied by clicking in the Supabase dashboard.
- Migrations are applied to staging automatically on merge to `main` (or a dedicated `staging` branch, if the team prefers a longer-lived staging branch — decide once and document it, don't mix strategies).
- Production migrations are applied as a deliberate, reviewed step — either the same CI job gated behind a manual approval, or a separate release process — because a bad migration in production is the highest-cost failure mode in this whole pipeline.
- Migrations are written to be **backward-compatible** during rollout (per NFR-16): additive changes (new nullable columns, new tables) deploy before the code that depends on them; destructive changes (dropping a column) happen in a follow-up migration only after the code no longer references it.

## 7. Rollback Procedure

- **Application code:** Vercel retains prior deployments; rollback is a one-click "promote previous deployment" action, effectively instant (per NFR-17).
- **Database:** each migration should have a documented reverse operation, or the migration should be additive-only (preferred). For genuinely destructive migrations, take a manual Supabase backup/export immediately before applying in production.
- **Verified rollback path (Phase 9 exit criterion):** before first production launch, actually perform a rollback in staging to confirm the procedure works, rather than assuming it will.

## 8. Pre-Launch Checklist

- [ ] Staging and production Supabase projects are fully separate, with separate keys.
- [ ] All required env vars are set in the correct Vercel environment (spot-check via `/api/health`).
- [ ] Email provider free-tier limits confirmed current and sufficient for expected launch volume (see `programmingstack.md` §9 note).
- [ ] Branch protection on `main` requires the CI workflow to pass.
- [ ] A rollback has been performed successfully at least once in staging.
- [ ] `security.md` checklist signed off.
