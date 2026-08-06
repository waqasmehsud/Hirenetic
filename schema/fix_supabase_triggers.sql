-- ============================================================
-- HIRENETIC PLATFORM: FIX SUPABASE AUTH TRIGGER DATABASE ERROR
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Drop broken triggers on auth.users table that block user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users CASCADE;

-- 2. Drop legacy trigger function if present
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
