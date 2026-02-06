-- Remove the blocking policy that's causing issues
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous access to user_roles" ON public.user_roles;

-- The existing policies already restrict access properly:
-- - "Users can only view their own profile" using (auth.uid() = id)
-- - "Admins can view all profiles" using has_role(auth.uid(), 'admin'::app_role)
-- These policies already prevent anonymous access because auth.uid() returns NULL for anon users