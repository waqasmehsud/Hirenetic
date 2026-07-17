# Objectives — Full-Stack Web Application Blueprint

## 1. Why This Document Exists

Requirements say _what_ the system must do. This document says _why_ we're building it this way, and how the team will know it succeeded. When a design decision is ambiguous and `requirements.md` doesn't resolve it, come back here.

## 2. Primary Objectives

1. **Ship a secure-by-default foundation.** A developer adding a new feature next month should have to work _harder_ to introduce a security hole than to avoid one — because the defaults (RLS on by default, validated inputs, rate-limited routes) already point the right way.
2. **Make the codebase extensible without re-architecture.** New domain features are additive: new folders, new routes, new tables. They should never require touching the auth layer, the deployment pipeline, or the core app shell.
3. **Keep infrastructure cost near zero at low scale, with a clear path to paid tiers.** Supabase, Vercel, and the email provider all have functional free tiers. The architecture must work end-to-end on free tiers for development and early production, and scale by upgrading tiers — not by re-platforming.
4. **Environment parity.** What runs in production should be recognizable in staging and dev. Docker gives us that parity locally; the same environment variables schema drives all three environments.
5. **CI/CD as a gate, not a formality.** Nothing reaches staging or production without passing lint, type-check, tests, and a dependency vulnerability scan. Humans should not be the last line of defense for basic quality and security issues.

## 3. Success Criteria

A blueprint execution is successful when:

- [ ] A new developer can clone the repo, run one Docker Compose command, and have a working local environment (frontend + local Supabase stack) in under 10 minutes.
- [ ] Every environment variable required by the app is documented in `.env.example`; the app fails fast with a clear error if a required variable is missing, rather than failing silently at runtime.
- [ ] A pull request that introduces an unvalidated input, a missing auth check, or a new dependency with a known critical CVE is blocked by CI before a human has to notice it.
- [ ] Adding a new feature (e.g., a "comments" module) requires touching only files under one new directory plus a database migration — no changes to `lib/auth`, `proxy.ts`, or the deployment config.
- [ ] The production deployment survives a full redeploy with zero user-facing downtime.
- [ ] The system passes an OWASP ASVS Level 2 self-assessment checklist before first production launch.

## 4. Guiding Principles

### 4.1 Security is a default, not a checklist

Row Level Security is enabled the moment a table is created — never bolted on later. Auth checks live in shared middleware, not copy-pasted per-route. The team should never have to "remember" to secure something; the scaffolding should make insecurity the unusual path.

### 4.2 Extensibility over premature abstraction

We deliberately do _not_ over-engineer a plugin system or a generic entity framework in v1. Instead, we enforce a **consistent module shape** (see `directory_structure.md`) so that adding a feature means following a known pattern, not inventing new architecture. Extensibility comes from consistency, not cleverness.

### 4.3 Boring technology where it counts

Auth, database, deployment, and CI are the least appropriate places to experiment with bleeding-edge tools. We choose mature, well-documented technology (Next.js, Postgres/Supabase, GitHub Actions, Vercel) for the foundation, and reserve room for experimentation in the feature layer, where a bad choice is cheap to reverse.

### 4.4 One source of truth per concern

- Database schema truth lives in versioned migrations, not in dashboard clicks.
- Environment configuration truth lives in `.env.example` plus the deployment platform's secret store — never in code comments or Slack messages.
- API contract truth lives in typed schemas (e.g., Zod) shared between client and server, so drift between what the frontend sends and the backend expects is caught at compile time, not in production.

### 4.5 Fail loudly in development, fail gracefully in production

Missing env vars, type errors, and failed migrations should crash the dev server immediately with a clear message. In production, the same classes of failure should degrade gracefully (e.g., a failed email send logs and retries rather than 500ing the user's signup).

### 4.6 Extensibility as a first-class goal (cross-reference)

Every item in `requirements.md` §5 ("Out of Scope") was deferred _because_ the architecture makes it addable later without rework — not because it was ignored. If a proposed design choice would make billing, multi-tenancy, or real-time features harder to bolt on later, that's a reason to revisit the choice now, even though those features aren't being built yet.

## 5. Non-Goals

- We are not building a general-purpose framework or boilerplate-for-hire — this blueprint is opinionated for _this_ application shape (auth'd SaaS-like web app), not a universal starter.
- We are not chasing 100% test coverage for its own sake; we're chasing coverage on auth, data validation, and payment-adjacent logic (once billing exists) where bugs are expensive.
- We are not optimizing for the theoretical largest possible scale on day one. We're optimizing for a clean path from "free tier, few users" to "paid tier, many users" without a rewrite.
