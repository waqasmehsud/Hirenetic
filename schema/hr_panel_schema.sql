-- ============================================================
-- HIRENETIC PLATFORM: EMPLOYERS PROFILES SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ============================================================

-- 1. Create employers_profiles Table
CREATE TABLE IF NOT EXISTS public.employers_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    industry TEXT,
    company_size TEXT,
    designation TEXT DEFAULT 'Lead HR Manager',
    phone TEXT,
    location TEXT,
    website_url TEXT,
    company_logo_url TEXT,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safe Migration Column Checks (If Table Already Exists)
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Lead HR Manager';
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.employers_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT TRUE;

-- 3. Enable Row Level Security (RLS) & Add Public Access Policies
ALTER TABLE public.employers_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow employers to view their own profile" ON public.employers_profiles;
DROP POLICY IF EXISTS "Allow public access to employers_profiles" ON public.employers_profiles;

CREATE POLICY "Allow public access to employers_profiles" 
    ON public.employers_profiles FOR ALL USING (true);

-- 4. Automatic Last Updated Timestamp Trigger
CREATE OR REPLACE FUNCTION update_employers_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_employers_profiles_updated_at ON public.employers_profiles;
CREATE TRIGGER trigger_employers_profiles_updated_at
    BEFORE UPDATE ON public.employers_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_employers_profiles_updated_at();
