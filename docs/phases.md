# Development Phases — Roadmap & Milestones

Each phase has an explicit exit criterion. Do not start the next phase until the current one's exit criterion is met — this is what keeps "extensible from day one" honest instead of aspirational.

## Phase 0 — Project Bootstrap

**Goal:** A repository that builds, deploys, and does nothing useful yet.

- Initialize the Next.js (TypeScript) project with strict mode.
- Set up the directory structure per `directory_structure.md`.
- Configure ESLint, Prettier, and TypeScript strict rules.
- Initialize Git, connect to GitHub, set branch protection on `main` (require PR review + passing CI).
- Create Supabase projects for dev, staging, production.
- Write `.env.example` and local `.env.local` (gitignored).
- Stand up `docker-compose.yml` for local dev (app + local Supabase via Supabase CLI).
- Deploy a "Hello World" page to Vercel to confirm the pipeline end-to-end.

**Exit criterion:** `docker compose up` runs locally and a trivial page is live on a Vercel preview URL, deployed via a GitHub Actions workflow.

## Phase 1 — Core Infrastructure & CI/CD

**Goal:** The scaffolding every future feature will depend on is in place and enforced.

- GitHub Actions pipeline: install → lint → type-check → test → build → dependency audit.
- Vercel project linked with preview deployments on every PR and production deployment on merge to `main`.
- Centralized environment variable schema (validated at boot, e.g., via `zod` in `lib/env.ts`) so a missing var fails fast.
- Error monitoring hook (e.g., a lightweight logger abstraction that can later point to Sentry or similar without changing call sites).
- `/api/health` endpoint implemented per FR-16.

**Exit criterion:** A PR with a lint error or a missing required env var fails CI automatically; a clean PR deploys a preview automatically.

## Phase 2 — Database Schema & Row Level Security

**Goal:** The data layer is defined, migrated, and locked down before any feature touches it.

- Define core schema: `users` (extends Supabase `auth.users`), `profiles`, `roles`, plus any initial domain tables.
- Write versioned SQL migrations (Supabase CLI migration files) — no manual dashboard schema edits after this point.
- Enable RLS on every table at creation time; write policies per role (`anonymous`, `user`, `admin`).
- Seed scripts for local/dev data.
- Document the schema (ERD description) in `architecture.md`.

**Exit criterion:** A fresh database, built entirely from migrations, enforces that a `user`-role client cannot read another user's private rows — verified by an automated test.

## Phase 3 — Authentication & Authorization

**Goal:** Users can sign up, log in, verify email, reset passwords, and the app correctly distinguishes roles.

- Integrate Supabase Auth (email/password + at least one OAuth provider).
- Build middleware (`proxy.ts`) for route protection, shared across all protected routes — not per-route logic.
- Implement email verification and password reset flows, wired to the email API (Phase 4 dependency — stub the send in the interim if sequencing requires).
- Implement RBAC checks reusable both server-side (API routes) and client-side (UI gating, non-authoritative).
- Write tests: unauthenticated access to protected routes, wrong-role access, token expiry/refresh.

**Exit criterion:** All FR-1 through FR-8 pass their acceptance tests; an unauthenticated request to any protected API route returns 401, and an under-privileged authenticated request returns 403.

## Phase 4 — Email/Notification Integration

**Goal:** Transactional email works reliably and doesn't block user-facing flows.

- Integrate the chosen free/developer-tier email API (see `architecture.md` §5 for provider choice and rationale).
- Build a notification abstraction layer (`lib/notifications/`) so the provider can be swapped without touching call sites.
- Implement async dispatch (queued via a lightweight job approach appropriate to serverless — e.g., Supabase Edge Function trigger or a deferred fetch with retry/logging) so email sending never blocks the request thread per FR-13.
- Wire verification, password reset, and one sample "account event" email.

**Exit criterion:** Triggering a password reset sends a real email in staging within a few seconds, and a simulated provider outage does not break the password reset request itself (it logs and surfaces a retry, not a 500).

## Phase 5 — API Layer & Core Domain Features

**Goal:** The first real feature module exists end-to-end, proving the extensibility pattern.

- Build one representative CRUD domain module (e.g., "items" or whatever the product's first real entity is) following the module pattern in `directory_structure.md`: schema → migration → API route → validation → UI.
- Server-side validation via shared Zod schemas, reused for client-side form validation.
- Apply rate limiting to the module's API routes.

**Exit criterion:** The module is fully functional and its addition required zero changes to `lib/auth`, `proxy.ts`, or deployment config — confirmed by code review checklist.

## Phase 6 — Frontend Components & UX Shell

**Goal:** A cohesive, accessible application shell exists for any future feature to plug into.

- App shell: navigation, auth-aware layout, loading/error boundaries.
- Shared component library (`components/ui/`) — buttons, forms, modals, toasts — built once, reused everywhere.
- Responsive layout baseline; accessibility pass (keyboard nav, ARIA labels on interactive elements, color contrast).
- Admin dashboard shell (user list, health status) per FR-15.

**Exit criterion:** Lighthouse accessibility score ≥ 90 on primary routes; the app shell renders correctly at mobile, tablet, and desktop breakpoints.

## Phase 7 — Security Hardening Pass

**Goal:** Treat security as a dedicated phase, not just an ambient property, before first real users touch the system.

- Run through the OWASP ASVS Level 2 checklist against the actual implementation (not just the design).
- Confirm rate limiting on all public and auth endpoints.
- Confirm CORS policy is restrictive (explicit allowed origins per environment, not `*`).
- Run `npm audit` / Dependabot triage to zero open high/critical issues.
- Verify secrets are absent from git history (`git log -p` scan or a tool like `gitleaks`).
- Pen-test-style manual pass: attempt IDOR (accessing another user's resource by ID), attempt privilege escalation, attempt SQL/XSS injection on every input.

**Exit criterion:** A written sign-off against the `security.md` checklist, with any findings resolved or explicitly risk-accepted with rationale.

## Phase 8 — Testing & QA

**Goal:** Confidence that the system behaves correctly, not just that it compiles.

- Unit tests for validation schemas, utility functions, and business logic.
- Integration tests for API routes (auth states, validation failures, success paths).
- End-to-end tests (e.g., Playwright) for the critical user journeys: signup → verify → login → core action → logout.
- Load/perf smoke test against NFR-9/NFR-10 targets.

**Exit criterion:** CI enforces the coverage threshold from NFR-19; all critical-journey E2E tests pass in the staging environment.

## Phase 9 — Staging Rollout & Production Deployment

**Goal:** Ship it.

- Full deploy to staging with production-equivalent configuration; smoke-test manually.
- Configure production Vercel project, environment variables, and Supabase production project (separate from staging, per `deployment.md`).
- Enable monitoring/alerting on `/api/health` and error rates.
- Production deploy via the same CI/CD pipeline used throughout — no manual, un-audited deploys.
- Post-launch: verify rollback procedure works by performing a controlled rollback in staging first.

**Exit criterion:** Production is live, monitored, and the team has a documented, tested rollback procedure.

## Phase 10 — Post-Launch: Extension Readiness Review

**Goal:** Confirm the "extensible without restructuring" objective actually held.

- Retrospective: did Phase 5's module pattern hold for every feature added since? Where did developers have to break the pattern, and why?
- Update `directory_structure.md` and this roadmap if a genuine architectural gap was found (not a one-off exception).

**Exit criterion:** A short written retro; any architectural debt is logged as a tracked issue, not silently absorbed.
