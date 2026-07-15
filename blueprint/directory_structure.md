# Directory Structure

## 1. Principle

Every folder below exists to enforce one rule: **a new feature is additive.** If you're building "comments" or "billing" or "notifications-v2", you should be able to point to exactly one new top-level thing you added (a route folder, a migration, maybe a lib module) and nothing you had to *change* in the core. If a feature genuinely requires changing `middleware.ts` or `lib/auth`, that's a signal to pause and reconsider — flagged explicitly here so it isn't done casually.

## 2. Top-Level Layout

```
project-root/
├── .github/
│   └── workflows/
│       └── ci-cd.yml               # CI pipeline: lint, type-check, test, build, audit
├── .vscode/                        # Shared editor settings (optional, non-blocking)
├── app/                             # Next.js App Router — pages, layouts, API routes
│   ├── (auth)/                      # Route group: login, signup, reset-password pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/                 # Route group: authenticated app shell
│   │   ├── layout.tsx                # Auth-aware layout (nav, session check)
│   │   ├── page.tsx                  # Dashboard home
│   │   └── admin/                    # Admin-only routes (role-gated)
│   │       └── page.tsx
│   ├── api/                         # Route Handlers = the API layer
│   │   ├── health/route.ts          # FR-16 health check
│   │   ├── auth/                    # auth-adjacent endpoints not covered by Supabase directly
│   │   └── v1/                      # versioned API namespace for domain modules
│   │       └── <feature>/route.ts    # e.g., api/v1/items/route.ts
│   ├── layout.tsx                   # Root layout
│   └── globals.css
├── components/
│   ├── ui/                          # Shared, generic components (Button, Modal, Toast, Form fields)
│   └── <feature>/                   # Feature-specific components, colocated per feature
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server/RSC Supabase client (SSR-aware, cookie-based)
│   │   └── admin.ts                  # Service-role client — used ONLY in trusted, non-request-triggered contexts (see security.md)
│   ├── auth/
│   │   ├── session.ts                 # Session/role resolution helpers
│   │   └── guards.ts                  # Reusable authorization check functions
│   ├── notifications/
│   │   ├── provider.ts                 # Email provider adapter (Resend today; swappable)
│   │   └── templates/                  # React Email templates
│   ├── validation/
│   │   └── <feature>.schema.ts         # Zod schemas, shared client+server
│   ├── env.ts                          # Validated environment variable loader (fails fast)
│   └── utils.ts
├── db/
│   ├── migrations/                     # Versioned SQL migrations (Supabase CLI)
│   ├── seed.sql                        # Local/dev seed data
│   └── schema/                         # Drizzle schema definitions (TypeScript source of truth)
├── middleware.ts                       # Single shared auth/route-protection entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                            # Playwright specs
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── public/                              # Static assets
├── .env.example
├── .env.local                           # gitignored
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 3. The Feature Module Pattern (the core extensibility mechanism)

Every new domain feature follows this exact shape. Use it as a checklist when adding something new:

1. **Schema:** `db/schema/<feature>.ts` (Drizzle definition) + `db/migrations/xxxx_<feature>.sql` (generated/reviewed migration), with RLS policies included in the same migration — never added later.
2. **Validation:** `lib/validation/<feature>.schema.ts` — Zod schema, imported by both the API route and any client-side form.
3. **API:** `app/api/v1/<feature>/route.ts` (and `[id]/route.ts` for item-level operations) — uses `lib/auth/guards.ts` for authorization, `lib/validation/<feature>.schema.ts` for input validation, and the server Supabase client for data access.
4. **UI:** `components/<feature>/` for feature-specific components; `app/(dashboard)/<feature>/page.tsx` if it needs its own route.
5. **Tests:** `tests/unit/<feature>/`, `tests/integration/<feature>/`, and an E2E spec if it's part of a critical journey.

Nothing in this list touches `middleware.ts`, `lib/auth/session.ts`, `lib/supabase/*`, or the CI/CD config. If a feature seems to require that, it's probably actually a change to *core* auth/infra behavior — treat it as its own reviewed, deliberate change, not something bundled into a feature PR.

## 4. Why Route Groups (`(auth)`, `(dashboard)`)

Next.js route groups let us apply different layouts (public auth pages vs. authenticated app shell) without affecting the URL structure. This keeps `middleware.ts` simple: it can pattern-match on route groups/paths to decide what needs a session, rather than every page implementing its own check.

## 5. Why `lib/supabase/admin.ts` Is Isolated and Flagged

The service-role Supabase client bypasses RLS entirely. It is deliberately kept in its own file, imported only where absolutely necessary (e.g., an admin-triggered bulk operation, a scheduled job) — never in a Route Handler that processes arbitrary user input. This isolation makes it easy to grep the codebase for every place RLS is bypassed and audit each one, per NFR-3.

## 6. Environment-Specific Files

- `docker/docker-compose.yml` supports environment-specific overrides via Compose profiles or additional override files (`docker-compose.override.yml` for local dev tweaks) — detailed in `deployment.md`.
- `.env.example` documents variables for all three environments in one annotated file (see `deployment.md` §3); actual values never live in the repo.
