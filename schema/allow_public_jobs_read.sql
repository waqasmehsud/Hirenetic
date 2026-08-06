-- ============================================================
-- HIRENETIC PLATFORM: ALLOW PUBLIC READ ACCESS TO JOBS TABLE
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Enable Row Level Security on crwl_jobsData
ALTER TABLE public."crwl_jobsData" ENABLE ROW LEVEL SECURITY;

-- 2. Add Public SELECT Policy so all users & recruiters can query live jobs
DROP POLICY IF EXISTS "Allow public select on crwl_jobsData" ON public."crwl_jobsData";
CREATE POLICY "Allow public select on crwl_jobsData" 
    ON public."crwl_jobsData" FOR SELECT USING (true);
