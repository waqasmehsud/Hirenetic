-- ============================================================
-- HIRENETIC PLATFORM: API MANAGEMENT PANEL SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ============================================================

-- 1. Create API Credentials Table
CREATE TABLE IF NOT EXISTS public.api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('LLM', 'Job API', 'Scraper', 'Other')),
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    base_url TEXT,
    model TEXT,
    expiration_date DATE,
    daily_quota INTEGER DEFAULT 1000,
    used_quota INTEGER DEFAULT 0,
    refresh_cycle TEXT DEFAULT 'Daily',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safe Migration Column Checks (If Table Already Exists)
ALTER TABLE public.api_credentials ADD COLUMN IF NOT EXISTS daily_quota INTEGER DEFAULT 1000;
ALTER TABLE public.api_credentials ADD COLUMN IF NOT EXISTS used_quota INTEGER DEFAULT 0;
ALTER TABLE public.api_credentials ADD COLUMN IF NOT EXISTS refresh_cycle TEXT DEFAULT 'Daily';
ALTER TABLE public.api_credentials ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.api_credentials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- 3. Enable Row Level Security (RLS) & Add Public Access Policies
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to api_credentials" ON public.api_credentials;
DROP POLICY IF EXISTS "Allow public insert to api_credentials" ON public.api_credentials;
DROP POLICY IF EXISTS "Allow public update to api_credentials" ON public.api_credentials;
DROP POLICY IF EXISTS "Allow public delete to api_credentials" ON public.api_credentials;

CREATE POLICY "Allow public read access to api_credentials" 
    ON public.api_credentials FOR SELECT USING (true);

CREATE POLICY "Allow public insert to api_credentials" 
    ON public.api_credentials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to api_credentials" 
    ON public.api_credentials FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to api_credentials" 
    ON public.api_credentials FOR DELETE USING (true);

-- 4. Automatic Last Updated Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_api_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach Trigger to api_credentials Table
DROP TRIGGER IF EXISTS trigger_api_credentials_updated_at ON public.api_credentials;
CREATE TRIGGER trigger_api_credentials_updated_at
    BEFORE UPDATE ON public.api_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_api_credentials_updated_at();

-- 6. Insert Initial Active LLM Credentials (Groq & Gemini Only)
INSERT INTO public.api_credentials (name, category, provider, api_key, base_url, model, expiration_date, daily_quota, used_quota, notes, status)
VALUES 
  ('Groq Llama 3.3 Fast', 'LLM', 'Groq', 'gsk_DEMO_KEY_GROQ_LLAMA3_456', 'https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile', CURRENT_DATE + INTERVAL '90 days', 14400, 0, 'Active Groq LLM inference key', 'Active'),
  ('Gemini Free', 'LLM', 'Google', 'AIzaSyA9X_DEMO_KEY_GEMINI_123', 'https://generativelanguage.googleapis.com/v1beta', 'gemini-1.5-flash', CURRENT_DATE + INTERVAL '60 days', 1500, 0, 'Active Gemini key for resume parsing', 'Active')
ON CONFLICT (id) DO NOTHING;
