-- Migration to add llm_keys table with RLS policy and roles grants
CREATE TABLE IF NOT EXISTS public.llm_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  requests_today INTEGER DEFAULT 0 NOT NULL,
  tokens_today INTEGER DEFAULT 0 NOT NULL,
  reset_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, model_name)
);

ALTER TABLE public.llm_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Allow_users_to_manage_keys ON public.llm_keys;
CREATE POLICY Allow_users_to_manage_keys ON public.llm_keys 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.llm_keys TO postgres, authenticated, service_role;
