-- =======================================================
-- HIRENETIC DATABASE SCHEMA: JOB APPLICATIONS TABLE
-- Description: Tracks candidate job applications (both internal & external redirects)
-- =======================================================

-- 1. Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL,
    job_id TEXT,
    company_name TEXT,
    job_title TEXT,
    external_apply_url TEXT,
    application_source TEXT DEFAULT 'Candidate Portal External Redirect',
    application_status TEXT DEFAULT 'Redirected',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexing for fast query lookups by candidate and status
CREATE INDEX IF NOT EXISTS idx_job_apps_candidate_id ON public.job_applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_status ON public.job_applications (application_status);
CREATE INDEX IF NOT EXISTS idx_job_apps_applied_at ON public.job_applications (applied_at DESC);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to all authenticated users (HR & Candidates)
DROP POLICY IF EXISTS "Allow read access to job_applications" ON public.job_applications;
CREATE POLICY "Allow read access to job_applications" 
ON public.job_applications FOR SELECT 
USING (true);

-- Policy: Allow insert access to authenticated & anon users for tracking applications
DROP POLICY IF EXISTS "Allow insert access to job_applications" ON public.job_applications;
CREATE POLICY "Allow insert access to job_applications" 
ON public.job_applications FOR INSERT 
WITH CHECK (true);

-- Policy: Allow update access to job_applications for HR status changes
DROP POLICY IF EXISTS "Allow update access to job_applications" ON public.job_applications;
CREATE POLICY "Allow update access to job_applications" 
ON public.job_applications FOR UPDATE 
USING (true);
