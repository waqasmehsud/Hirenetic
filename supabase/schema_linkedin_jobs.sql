-- ============================================================
-- Migration: Create linkedin_jobs table with RLS & indexes
-- Description: Stores scraped LinkedIn job postings for Hirenetic.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.linkedin_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_link TEXT UNIQUE NOT NULL,
  posted_date TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast sorting and searching
CREATE INDEX IF NOT EXISTS idx_linkedin_jobs_scraped_at ON public.linkedin_jobs (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_jobs_company ON public.linkedin_jobs (company);
CREATE INDEX IF NOT EXISTS idx_linkedin_jobs_job_title ON public.linkedin_jobs (job_title);

-- Enable Row Level Security
ALTER TABLE public.linkedin_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated read access
CREATE POLICY "Allow public read access on linkedin_jobs"
  ON public.linkedin_jobs
  FOR SELECT
  TO public
  USING (true);

-- Allow service role full access (insert/update/delete/select)
CREATE POLICY "Allow service role full access on linkedin_jobs"
  ON public.linkedin_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant privileges
GRANT ALL ON TABLE public.linkedin_jobs TO postgres, authenticated, anon, service_role;
