-- Add explicit policies to block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles"
  ON public.profiles
  FOR ALL
  TO anon
  USING (false);

-- Add explicit policies to block anonymous access to user_roles table  
CREATE POLICY "Block anonymous access to user_roles"
  ON public.user_roles
  FOR ALL
  TO anon
  USING (false);

-- Ensure both tables have RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;