# Technology Stack & Rationale

Every choice below is justified against `objectives.md` and `requirements.md` — not chosen because it's popular. Where a reasonable alternative exists, it's named, so the team understands the tradeoff, not just the decision.

## 1. Frontend Framework — Next.js 14+ (App Router, TypeScript)

**Why:**

- Server Components + Route Handlers let the frontend and API layer live in one deployable unit, which directly supports NFR-12 (stateless, serverless-friendly) and simplifies the CI/CD story (one build, one deploy target).
- File-system routing maps cleanly onto the "feature module" extensibility pattern (`objectives.md` §4.2): a new route is a new folder, not a new registration step somewhere else.
- First-class Vercel support means zero-config deployment, preview URLs per PR, and edge/serverless runtime selection per route — directly supports the deployment requirements.
- Built-in image optimization, streaming SSR, and code-splitting support the LCP target in NFR-9 without custom tooling.

**Alternative considered:** Remix. Comparable architecture, but Next.js's tighter first-party integration with Vercel and the broader Supabase community tooling (official `@supabase/ssr` helpers, examples) reduces integration risk for this specific stack.

## 2. Language — TypeScript (strict mode)

**Why:** NFR-18 requires it directly. Strict typing catches a large class of bugs (null handling, shape mismatches between API and UI) at compile time rather than in production — cheaper to fix, and it makes the "shared Zod schema between client and server" pattern (objectives §4.4) actually enforceable rather than a convention people forget.

## 3. Styling — Tailwind CSS

**Why:** Utility-first CSS keeps styling colocated with components, which matters for the module-based extensibility model — a new feature's styles ship with the feature, not in a growing global stylesheet that every developer is scared to touch. Design tokens (spacing, color) are still centralized via the Tailwind config, so consistency isn't sacrificed for locality.

**Alternative considered:** CSS Modules or a component library like Chakra/Mantine. Tailwind was chosen for lower long-term CSS bloat and because it pairs well with headless component libraries (Radix UI primitives) for accessible, unstyled interactive components — giving control over both behavior and appearance.

## 4. Backend Runtime — Vercel Serverless/Edge Functions (via Next.js Route Handlers)

**Why:** No separate backend service to deploy, monitor, or scale independently — directly supports NFR-12 and the "near-zero cost at low scale" objective. Vercel scales functions automatically per-request; there's no server to provision or patch.

**Tradeoff acknowledged:** Serverless functions are stateless and have execution time limits, and cold starts are a real (if usually small) latency cost. This is acceptable for this application shape (CRUD + auth + notifications); it would **not** be the right choice for long-running background jobs or WebSocket servers — those are explicitly out of scope for v1 (see `requirements.md` §5), and if needed later, would run as a separate service (e.g., a small dedicated worker), not force a rewrite of the main app.

## 5. Database — Supabase (managed Postgres)

**Why:**

- Postgres is a mature, ACID-compliant relational database — the right default for an application with relational data (users, roles, ownership) and where data integrity matters more than eventual-consistency flexibility.
- Supabase adds Auth, Storage, Realtime, and RLS enforcement on top of vanilla Postgres, which is precisely the "defense in depth" authorization model in `architecture.md` §4.2 — RLS support at the database layer isn't bolted on, it's native to the platform.
- Free tier is genuinely usable for development and early production (per objectives §2.3), with a clear upgrade path (Pro tier) that doesn't require migrating databases.
- Connection pooling (Supavisor/PgBouncer, built in) directly addresses NFR-13's serverless connection-exhaustion concern — this is a common failure mode when pairing serverless compute with traditional Postgres, and Supabase solves it without extra infrastructure.

**Alternative considered:** PlanetScale (MySQL, no native RLS) or a self-hosted Postgres. Supabase was chosen specifically because RLS + Auth + Storage in one managed platform reduces the number of integration points and secrets to manage, which is a security win as much as a convenience win.

## 6. ORM / Query Layer — Supabase JS Client + Drizzle ORM (for typed queries beyond simple CRUD)

**Why:**

- For straightforward CRUD, the official `@supabase/supabase-js` client (paired with `@supabase/ssr` for server-side session handling) is used directly — it respects the user's JWT and therefore RLS, which a generic ORM's connection pool often does not by default.
- For more complex queries (joins, aggregations) where hand-written Supabase client chains get unwieldy, **Drizzle ORM** is used in a typed, edge-runtime-compatible way (unlike Prisma, which historically needed a Node.js runtime and a heavier client, complicating edge deployment).
- Drizzle's schema-as-code approach also gives us a single TypeScript source of truth for table shapes that can generate/validate against the SQL migrations, tightening the loop between migration files and application types.

**Alternative considered:** Prisma. Excellent DX, but its edge-runtime story is less mature and its generated client is heavier — a real cost against NFR-10's latency target on serverless/edge functions. Drizzle was chosen for this stack's specific constraints; Prisma remains a reasonable choice if the team later moves off edge runtimes entirely.

## 7. Validation — Zod

**Why:** A single schema definition drives server-side request validation (NFR-4, FR-10) and can be reused for client-side form validation and TypeScript type inference — eliminating the class of bugs where frontend and backend disagree about a field's shape. This is the mechanism behind objectives §4.4 ("API contract truth lives in typed schemas").

## 8. Authentication — Supabase Auth

**Why:** Directly satisfies NFR-23 (the app never handles raw passwords) and FR-1/FR-2/FR-3/FR-6. Supports email/password and OAuth providers out of the box, integrates natively with RLS via `auth.uid()`, and has official SSR-safe helper libraries for Next.js.

## 9. Email API — Resend (primary), free/developer tier

**Why:**

- Resend's free tier (as of this writing) is generous enough for a pre-revenue product's transactional volume, has a clean API, and — notably — has official React Email support, letting transactional email templates be built as React components, consistent with the rest of the stack.
- Decoupled behind `lib/notifications/` (per `architecture.md` §5.2), so if Resend's limits or terms stop fitting the project, swapping to SendGrid or Mailgun's free tiers touches one module.

**Always verify current free-tier limits before committing**, since provider terms change — this is flagged explicitly in `deployment.md` as a pre-launch checklist item, not assumed to be static.

## 10. Containerization — Docker + Docker Compose

**Why:** Local development needs to mirror production closely enough that "works on my machine" isn't a source of bugs. Docker Compose runs the Next.js app alongside a local Supabase stack (via the Supabase CLI's Docker-based local development environment), giving every developer an identical, disposable environment — directly supporting objectives §4.4 (environment parity) and the Phase 0 success criterion in `phases.md`.

**Note:** Vercel itself does not run our Docker image in production (Vercel builds directly from source) — Docker's role here is **local development and CI parity**, not the production runtime. This is intentional: it avoids paying a "containerize for the cloud" tax while still getting reproducible local environments.

## 11. CI/CD — GitHub Actions + Vercel Git Integration

**Why:** GitHub Actions runs the quality gate (lint, type-check, test, build, audit) that Vercel's own build step doesn't enforce by default. Vercel's native GitHub integration handles the actual deploy (preview per PR, production on merge to `main`), so we're not duplicating deployment logic in Actions — Actions gates, Vercel ships. This division of labor keeps the pipeline simple and avoids maintaining custom deploy scripts.

## 12. Testing — Vitest (unit/integration) + Playwright (E2E)

**Why:** Vitest is fast and has native TypeScript/ESM support that matches the Next.js toolchain closely, reducing config friction versus Jest. Playwright is used for the critical-journey E2E tests in `phases.md` Phase 8 because it reliably handles modern SSR apps, including auth-cookie-based flows, across multiple browsers.

## 13. Summary Table

| Layer              | Choice                           | Key Alternative                   |
| ------------------ | -------------------------------- | --------------------------------- |
| Frontend framework | Next.js 14+ (App Router, TS)     | Remix                             |
| Styling            | Tailwind CSS + Radix primitives  | Chakra/Mantine                    |
| Backend runtime    | Vercel Serverless/Edge Functions | Dedicated Node server             |
| Database           | Supabase (Postgres)              | PlanetScale, self-hosted Postgres |
| ORM/query          | Supabase JS client + Drizzle     | Prisma                            |
| Validation         | Zod                              | Yup, io-ts                        |
| Auth               | Supabase Auth                    | Auth0, Clerk                      |
| Email              | Resend (free tier)               | SendGrid, Mailgun (free tiers)    |
| Containerization   | Docker Compose (dev/CI only)     | Vagrant, bare local installs      |
| CI                 | GitHub Actions                   | CircleCI, GitLab CI               |
| Hosting            | Vercel                           | Netlify, self-hosted              |
| Testing            | Vitest + Playwright              | Jest + Cypress                    |
