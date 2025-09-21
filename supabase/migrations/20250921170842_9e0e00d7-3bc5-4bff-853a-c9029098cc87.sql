-- CRITICAL SECURITY FIX: Remove dangerous public policies that expose all data

-- Drop dangerous public policies that allow unrestricted access to sensitive data
DROP POLICY IF EXISTS "profiles policy" ON public.profiles;
DROP POLICY IF EXISTS "purchases policy" ON public.purchases;
DROP POLICY IF EXISTS "conversations policy" ON public.conversations;
DROP POLICY IF EXISTS "messages policy" ON public.messages;
DROP POLICY IF EXISTS "public crushes policy" ON public.crushes;
DROP POLICY IF EXISTS "user settings policy" ON public.user_settings;

-- Ensure subscriptions table has proper UPDATE and DELETE restrictions for security
-- Users should not be able to modify their own subscriptions directly
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;

-- Create admin-only policy for subscription management (will be used by payment webhooks)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
FOR ALL USING (
  current_setting('role') = 'service_role'
);

-- Verify all tables have RLS enabled (security hardening)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;