# Requirements — Full-Stack Web Application Blueprint

## 1. Purpose

This document defines what the system must do (functional requirements) and how well it must do it (non-functional requirements). Every later document — architecture, stack, deployment, security — traces back to a requirement here. If a design decision can't be justified by something in this file, question the decision.

## 2. Functional Requirements

### 2.1 User Management

- FR-1: Users can register via email/password and at least one OAuth provider (Google, GitHub).
- FR-2: Email verification is required before full account access is granted.
- FR-3: Users can reset passwords via a time-limited, single-use token sent by email.
- FR-4: Users can view and update their own profile data.
- FR-5: Admins can view, suspend, and delete user accounts through a protected admin surface.

### 2.2 Authentication & Authorization

- FR-6: Session-based authentication using Supabase Auth (JWT-backed), with automatic token refresh.
- FR-7: Role-based access control (RBAC) with at minimum: `anonymous`, `user`, `admin` roles, enforced at both the API layer and the database layer (Row Level Security).
- FR-8: Every protected route (frontend and API) must reject unauthenticated or under-privileged requests with the correct HTTP status (401/403), never a silent failure or client-only redirect.

### 2.3 Core Application Data

- FR-9: The system supports CRUD operations on the primary domain entities (to be defined per-project; the schema layer must not assume a fixed entity set).
- FR-10: All user-submitted data is validated server-side against a schema before persistence, regardless of client-side validation.
- FR-11: Soft-deletes are used for user-facing records to support recovery and audit; hard-deletes are reserved for compliance-driven erasure (e.g., GDPR requests).

### 2.4 Notifications & Communication

- FR-12: Transactional emails (verification, password reset, key account events) are sent via an integrated email API on a free/developer tier (see `architecture.md` §5).
- FR-13: Email sending is decoupled from the request/response cycle (queued or fire-and-forget with logged failures) so a slow or failed email provider never blocks a user-facing action.
- FR-14: Users can opt out of non-essential notification categories; transactional (security-critical) emails are never optional.

### 2.5 Admin & Observability Surface

- FR-15: An admin dashboard (route-protected) exposes user management, basic usage metrics, and system health status.
- FR-16: The system exposes a `/api/health` endpoint reporting database connectivity, email provider reachability, and build/version metadata, for uptime monitoring.

## 3. Non-Functional Requirements

### 3.1 Security

- NFR-1: All traffic is served over HTTPS/TLS 1.2+ only; HTTP requests are redirected, never served.
- NFR-2: Secrets (API keys, database credentials, JWT signing keys) are never committed to source control and are injected via environment variables managed per-environment (see `deployment.md`).
- NFR-3: All database access from application code respects Row Level Security policies — no service-role key is used in code paths reachable from client input.
- NFR-4: Input validation and output encoding are applied at every trust boundary (API request bodies, query params, user-generated content rendered in the UI) to prevent injection (SQL, XSS, command).
- NFR-5: Rate limiting is enforced on all public-facing API routes, with stricter limits on auth endpoints (login, signup, password reset) to mitigate brute-force and enumeration attacks.
- NFR-6: Dependencies are scanned for known vulnerabilities on every CI run (`npm audit` / GitHub Dependabot); high/critical findings block merge.
- NFR-7: The system follows OWASP ASVS Level 2 as its baseline security standard for a system handling authenticated user data.
- NFR-8: All authentication and authorization failures, and admin actions, are logged with enough context to support incident investigation, without logging sensitive payloads (passwords, tokens, full card numbers).

### 3.2 Performance

- NFR-9: Server-rendered pages achieve a Largest Contentful Paint (LCP) under 2.5s on a simulated 4G connection for the primary landing/dashboard routes.
- NFR-10: API routes return within 300ms at the 95th percentile under nominal load (excluding external calls such as email dispatch, which are async per FR-13).
- NFR-11: Database queries on indexed lookups complete within 50ms at the 95th percentile; N+1 query patterns are disallowed in code review.

### 3.3 Scalability

- NFR-12: The application is stateless at the compute layer — no in-memory session or file-based state that would break horizontal scaling — so it can scale via Vercel's serverless/edge functions without code changes.
- NFR-13: The database schema and connection strategy account for serverless connection-pooling limits (via Supabase's built-in pooler / PgBouncer) to avoid connection exhaustion under burst traffic.
- NFR-14: The codebase supports adding new feature modules (new domain entities, new API routes, new UI sections) without modifying shared core infrastructure — see `directory_structure.md` for the enforced module boundary.

### 3.4 Reliability & Availability

- NFR-15: Target uptime of 99.5% for production, consistent with Vercel's and Supabase's own platform SLAs (the system will not exceed the reliability of the platforms it depends on).
- NFR-16: Deployments are zero-downtime by default (Vercel's atomic deployments); database migrations are written to be backward-compatible with the currently-running code during rollout.
- NFR-17: A rollback path exists for both application code (Vercel instant rollback to prior deployment) and database schema (versioned, reversible migrations).

### 3.5 Maintainability

- NFR-18: Code is written in TypeScript with strict mode enabled; `any` is disallowed by lint rule except in explicitly justified, commented cases.
- NFR-19: Every module has a colocated test suite; CI blocks merges that drop coverage below an agreed threshold on changed files.
- NFR-20: Environment-specific configuration is never hardcoded; all three environments (dev, staging, production) run from the same codebase with different environment variables.

### 3.6 Compliance & Data Protection

- NFR-21: Personally identifiable information (PII) is minimized — only data required for the product's function is collected.
- NFR-22: Users can request export or deletion of their data (supports GDPR/CCPA-style requests) via an admin-assisted or self-service flow.
- NFR-23: Passwords are never handled directly by application code — authentication is delegated entirely to Supabase Auth, which handles hashing and storage.

## 4. Deployment Specification (Summary)

- Three environments: **development** (local Docker Compose), **staging** (Vercel preview + Supabase staging project), **production** (Vercel production + Supabase production project).
- Full detail in `deployment.md`; environment parity is a hard requirement — staging must mirror production configuration except for scale and data.

## 5. Out of Scope (v1)

To keep the initial build shippable, the following are explicitly deferred and should be added as feature modules later, not designed in now:

- Payments/billing integration
- Real-time collaborative features (websockets beyond Supabase Realtime's basic use)
- Native mobile clients
- Multi-tenancy / organization-level accounts (RBAC is user-role based, not tenant-based, in v1)

Deferring these is itself a requirement: the architecture must not preclude adding them later (see `objectives.md` §"Extensibility as a first-class goal").
