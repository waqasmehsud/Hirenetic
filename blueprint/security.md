# Security

This document is the operational companion to `architecture.md` §4. Where that document explains the *design*, this one is the checklist and implementation guidance developers use day to day.

## 1. Baseline Standard

Target: **OWASP ASVS Level 2**, appropriate for an application handling authenticated user data without extreme regulatory requirements (no ASVS Level 3 / high-assurance needs identified for v1 — revisit if handling payment card data or health records later).

## 2. Authentication & Session Security

- All auth flows delegated to Supabase Auth — the app never stores, hashes, or compares passwords directly (NFR-23).
- Sessions use Supabase's SSR-safe cookie handling (`httpOnly`, `secure` in staging/production, `sameSite=lax` at minimum) so tokens are not accessible to client-side JavaScript, mitigating XSS-based token theft.
- Password reset and email verification tokens are single-use and time-limited — enforced by Supabase Auth's built-in token handling, not custom code.
- OAuth redirect URIs are explicitly allow-listed per environment in the Supabase Auth settings — never a wildcard.

## 3. Authorization — Defense in Depth (implementation detail)

Two layers, both required, neither sufficient alone:

1. **`middleware.ts`** — authenticates the request (valid session or not) and does coarse route protection (e.g., anything under `(dashboard)/admin` requires `role = admin`).
2. **Route Handler + RLS** — the handler checks fine-grained ownership/authorization ("is this user allowed to modify *this specific* record?"), and the database's RLS policy enforces the same rule independently, using the user's own JWT via the request-scoped Supabase client (never the service-role client for user-triggered actions).

**Rule:** if you find yourself using `lib/supabase/admin.ts` (service-role, RLS-bypassing) inside a Route Handler that takes user input, stop — that's very likely a bug, not a feature. Service-role access is reserved for trusted, non-request-triggered contexts (scheduled jobs, admin-triggered bulk ops with their own explicit authorization check).

## 4. Input Validation & Injection Prevention

- Every Route Handler validates its input against a Zod schema before any database call (NFR-4, FR-10). Reject early with 400 on failure; never pass unvalidated data further into the system "just this once."
- Because Supabase's client library uses parameterized queries under the hood, raw SQL string concatenation should never appear in the codebase — code review should treat any raw SQL template literal with interpolated variables as an automatic block, and prefer the Drizzle query builder or Supabase client methods.
- User-generated content rendered in the UI is never rendered via `dangerouslySetInnerHTML` without explicit sanitization (e.g., via a library like `DOMPurify`) — default to React's automatic escaping and only opt out with a documented reason.

## 5. Rate Limiting

- Applied at the edge/middleware layer, keyed by IP and/or user ID depending on the route.
- Recommended implementation: Vercel's Edge Middleware combined with a lightweight store (e.g., Upstash Redis, which has a free tier compatible with this stack's "near-zero cost" objective) for a sliding-window counter.
- **Stricter limits on:** `/api/auth/*`-adjacent routes (login, signup, password reset request) — these are the routes most valuable to an attacker for brute-force or enumeration, so they get tighter thresholds than general CRUD routes.
- Rate-limited responses return `429` with a `Retry-After` header, not a silent drop.

## 6. CORS Policy

- Production and staging: explicit allow-list of known origins (the app's own domain(s)); no `Access-Control-Allow-Origin: *` on any authenticated route.
- Development: may be more permissive (`localhost` origins) but the CORS configuration itself is environment-aware (via `lib/env.ts`'s `APP_ENV`), not hardcoded to always-permissive.
- API routes intended for third-party/public consumption (if any are ever added) get their own explicitly documented, narrower CORS and rate-limit policy — they are not the default posture.

## 7. Secret Management

- No secret ever committed to git. `.env.example` documents variable **names** and a placeholder/description only.
- Pre-commit or CI-level secret scanning (e.g., `gitleaks`) recommended as an added CI step (extendable in `ci-cd.yml`) to catch accidental leaks before they reach `main`.
- Service-role Supabase key and email API key are server-only, never exposed to the client bundle (never prefixed `NEXT_PUBLIC_`).
- GitHub Actions secrets (e.g., a Supabase CLI access token for running migrations) are scoped as narrowly as the platform allows and rotated if a workflow file is ever modified by an untrusted contributor (relevant if the repo ever accepts external PRs).

## 8. Dependency & Supply Chain Security

- `npm audit --audit-level=high` runs in CI on every PR (NFR-6); unresolved high/critical findings block merge.
- GitHub Dependabot enabled for automated dependency update PRs.
- Lockfile (`package-lock.json`) is committed and CI uses `npm ci` (not `npm install`) to guarantee reproducible, un-tampered dependency trees.

## 9. Data Protection

- TLS enforced everywhere (Vercel and Supabase both terminate TLS by default; no code path should ever construct an `http://` URL for a production API call).
- PII minimization: only collect fields with a stated product purpose (NFR-21); if a field isn't used by any feature yet, it doesn't belong in the schema yet either.
- Sensitive fields (if any are added later, e.g., anything payment-adjacent) are never logged — logging statements are reviewed for accidental inclusion of full request bodies containing user secrets.
- Data export/deletion requests (NFR-22) are handled via an admin-assisted flow initially; if volume grows, a self-service flow can be added as its own feature module without touching core infrastructure.

## 10. Logging & Monitoring

- Authentication failures, authorization failures (403s), and admin actions are logged with: timestamp, user ID (if known), route, and outcome — never with the request body if it might contain credentials (NFR-8).
- `/api/health` is monitored externally (uptime checker pointed at it) so degraded database or email-provider connectivity is caught proactively, not from a user complaint.

## 11. Security Testing Before Launch (Phase 7 checklist)

- [ ] IDOR check: attempt to access/modify another user's resource by guessing/incrementing an ID — must be rejected by RLS even if an application-layer check were somehow bypassed.
- [ ] Privilege escalation check: attempt to call admin-only routes as a `user`-role account.
- [ ] Injection check: submit script tags, SQL metacharacters, and oversized payloads to every input field; confirm rejection or safe handling, not a 500 or an unescaped render.
- [ ] Auth bypass check: attempt to hit protected API routes with no session, an expired session, and a tampered JWT.
- [ ] Rate limit check: confirm login/signup endpoints actually throttle repeated attempts.
- [ ] CORS check: confirm a request from an unlisted origin is rejected in the staging/production configuration.
- [ ] Secret scan: run a git history scan for accidentally committed keys.
- [ ] Dependency scan: zero open high/critical vulnerabilities at launch time.

## 12. Compliance Notes (Non-Legal-Advice Disclaimer)

This blueprint implements technical measures consistent with common GDPR/CCPA expectations (data minimization, user-initiated export/deletion, encryption in transit). It does not constitute legal advice or a compliance certification — if the product will handle regulated data (health, payment card, children's data), consult qualified legal counsel before launch, since additional controls (e.g., PCI-DSS scope, HIPAA safeguards) fall outside this general-purpose architecture.
