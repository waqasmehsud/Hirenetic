-- ============================================================
-- HIRENETIC PLATFORM: COMPLETE CANDIDATE PROFILES SUPABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ============================================================

-- 1. Create or Update candidates_profiles Table with ALL Parsed, Interests & Preferences Fields
CREATE TABLE IF NOT EXISTS public.candidates_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    title TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    interests JSONB DEFAULT '[]'::jsonb,
    preferred_job_type TEXT DEFAULT 'Both',
    projects JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_field TEXT,
    resume_text TEXT,
    llm_parsed_json JSONB DEFAULT '{}'::jsonb,
    active_llm_provider TEXT,
    cv_file_path TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migration Commands (Safe Column Checks if Table Already Exists)
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS preferred_job_type TEXT DEFAULT 'Both';
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS resume_field TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS resume_text TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS llm_parsed_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS active_llm_provider TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS cv_file_path TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS hr_notes TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS hr_notes_author TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS hr_notes_updated_at TIMESTAMPTZ;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS github_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS github_score INT DEFAULT 92;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS linkedin_score INT DEFAULT 95;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS portfolio_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS portfolio_score INT DEFAULT 90;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS resume_score INT DEFAULT 92;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 96;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS match_score INT DEFAULT 94;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) DEFAULT 4.7;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS experience_years NUMERIC(4, 1) DEFAULT 4.2;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS verifications JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Screening';
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'In Progress';
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS applications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS expected_salary TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS notice_period TEXT;
ALTER TABLE public.candidates_profiles ADD COLUMN IF NOT EXISTS github_first_push_year INT;

-- 3. Job Applications Standalone Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates_profiles(id) ON DELETE CASCADE,
    email TEXT,
    job_id TEXT,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    stage TEXT DEFAULT 'Screening',
    status TEXT DEFAULT 'In Progress',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to job_applications" ON public.job_applications;
CREATE POLICY "Allow public access to job_applications" ON public.job_applications FOR ALL USING (true);

-- 3. Enable Row Level Security (RLS) & Add Public Access Policies
ALTER TABLE public.candidates_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to candidates_profiles" ON public.candidates_profiles;
CREATE POLICY "Allow public access to candidates_profiles" 
    ON public.candidates_profiles FOR ALL USING (true);

-- 4. Automatic Last Updated Timestamp Trigger
CREATE OR REPLACE FUNCTION update_candidates_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_candidates_profiles_updated_at ON public.candidates_profiles;
CREATE TRIGGER trigger_candidates_profiles_updated_at
    BEFORE UPDATE ON public.candidates_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_candidates_profiles_updated_at();

-- 5. Create Storage Bucket 'cvs' & Public Storage Policy
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to CVS Storage" ON storage.objects;
CREATE POLICY "Public Access to CVS Storage" 
ON storage.objects FOR ALL USING (bucket_id = 'cvs');
