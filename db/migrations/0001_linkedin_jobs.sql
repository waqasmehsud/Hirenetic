-- Migration: 0001_linkedin_jobs.sql
-- Description: Create linkedin_jobs table for automated job crawler data

CREATE TABLE IF NOT EXISTS public.linkedin_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_link TEXT UNIQUE NOT NULL,
  posted_date TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_linkedin_jobs_scraped_at ON public.linkedin_jobs (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_jobs_company ON public.linkedin_jobs (company);
CREATE INDEX IF NOT EXISTS idx_linkedin_jobs_job_title ON public.linkedin_jobs (job_title);

ALTER TABLE public.linkedin_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on linkedin_jobs"
  ON public.linkedin_jobs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role full access on linkedin_jobs"
  ON public.linkedin_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.linkedin_jobs TO postgres, authenticated, anon, service_role;
