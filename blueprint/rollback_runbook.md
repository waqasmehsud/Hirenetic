# Rollback Runbook

This document describes the step-by-step procedure for rolling back application code and database migrations in the Staging and Production environments.

---

## 1. Application Code Rollback (Vercel)

Vercel keeps immutable builds for every deployment, making application-level rollbacks fast and low-risk.

### Option A: Vercel Dashboard (Instant Revert)
1. Go to the [Vercel Dashboard](https://vercel.com/) and navigate to the project dashboard (`llm-shield`).
2. Click on the **Deployments** tab.
3. Find the last known stable deployment (the deployment immediately preceding the problematic release).
4. Click the triple-dot menu `...` on that deployment card.
5. Select **Promote to Production**.
6. Confirm the promotion. Vercel will instantly shift traffic to the selected build without rebuilding it.

### Option B: Vercel CLI Rollback
If you have the Vercel CLI configured locally or want to automate rollbacks via scripts:
```bash
# 1. List recent deployments to find the target deployment ID
vercel list

# 2. Revert to the specified deployment ID
vercel rollback <deployment-id>
```

---

## 2. Database Schema Rollback (Supabase / PostgreSQL)

Database rollbacks require careful coordination because database schema changes cannot always be undone instantly without risking data loss.

### General Policies
*   **Additive-Only Changes (Preferred):** Whenever possible, migrations should be backward-compatible (e.g., adding nullable columns, creating new tables). Destructive changes (e.g., dropping columns/tables) should only be executed in a separate, later release after all code paths referencing them have been deleted and deployed.
*   **Manual Backups:** For any release containing critical database migrations, generate a manual database backup in the Supabase Dashboard prior to the release window.

### Rollback Strategy A: Revert Migration (Roll-Forward / Additive Revert)
The safest way to revert a schema change in a live database is to generate a new migration file that cancels out the previous migration. This maintains a clean sequential migration history.

1.  **Locate the bad migration:** Find the file under `supabase/migrations/<timestamp>_bad_migration.sql`.
2.  **Generate a rollback migration:** Create a new migration file using the Supabase CLI locally:
    ```bash
    supabase migration new rollback_of_<timestamp>
    ```
3.  **Write the inverse operations:** Open the newly created file in `supabase/migrations/` and write the SQL statements to revert the bad schema changes.
    *   *Example:* If the bad migration did:
        ```sql
        ALTER TABLE public.items ADD COLUMN priority text;
        ```
    *   *The rollback migration should do:*
        ```sql
        ALTER TABLE public.items DROP COLUMN IF EXISTS priority;
        ```
4.  **Push the revert migration:**
    ```bash
    # Apply to Staging
    supabase db push --project-ref <staging-project-ref>
    
    # Apply to Production (or let CI apply it on merge to main)
    supabase db push --project-ref <production-project-ref>
    ```

### Rollback Strategy B: Database State Recovery (Supabase PITR)
For severe database corruption or migration failures that cannot be resolved through SQL changes:

1.  Log in to the **Supabase Dashboard**.
2.  Navigate to **Database** -> **Backups**.
3.  Choose **Point-in-Time Recovery (PITR)**.
4.  Select a timestamp immediately prior to the deployment start time.
5.  Initiate the recovery process. (Note: Restoring a database via PITR takes several minutes and will overwrite any data inserted after the restore point).

---

## 3. Staging Rollback Dry-Run Verification

To satisfy the pre-launch exit criteria, a controlled rollback must be successfully performed in the Staging environment:

### Step 1: Deploy a Test Migration and Code
1.  Create a temporary branch:
    ```bash
    git checkout -b test/rollback-dry-run
    ```
2.  Create a dummy migration that adds a temporary column:
    ```bash
    supabase migration new add_temp_column
    ```
    Add the SQL to `supabase/migrations/<timestamp>_add_temp_column.sql`:
    ```sql
    ALTER TABLE public.items ADD COLUMN temp_flag boolean DEFAULT false;
    ```
3.  Deploy the branch to Staging (either via git push and Vercel preview deployment, or running `supabase db push` against Staging database credentials).
4.  Verify in the database that `temp_flag` column is present on `public.items`.

### Step 2: Simulate Rollback
1.  **Application Rollback:** Revert Vercel Staging to the prior deployment using the Vercel Dashboard (click **Promote to Production** on the previous stable build).
2.  **Database Rollback:** Apply a revert migration that drops the `temp_flag` column:
    ```bash
    supabase migration new drop_temp_column
    ```
    Add SQL to `supabase/migrations/<timestamp>_drop_temp_column.sql`:
    ```sql
    ALTER TABLE public.items DROP COLUMN IF EXISTS temp_flag;
    ```
3.  Run `supabase db push --project-ref <staging-project-ref>`.
4.  Verify the `temp_flag` column has been successfully removed from `public.items` in Staging, and the application is back to its original stable build.

---

## 4. Monitoring & Alerting Configuration

To detect issues early and trigger a rollback before users are severely impacted, set up the following monitoring checks:

1.  **Health Check Alerting:** Set up an external uptime checker (e.g., Better Uptime, Pingdom, or Cloudflare Health Checks) pointing at `/api/health`.
    *   **Interval:** Every 1 minute.
    *   **Failure Condition:** Raise a high-priority incident (P1) if status is `DEGRADED` (returns 200 but nested services are DOWN) or `DOWN` (returns 503).
2.  **Error Rate Alerting:** Monitor Vercel logs or Sentry error metrics.
    *   **Trigger:** Error rate exceeds 2% of total traffic over a 5-minute window.
    *   **Action:** Alert the on-call engineer to review the latest deployment and prepare a rollback if the spike coincides with a release.
