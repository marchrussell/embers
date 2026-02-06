-- Update RLS policies for user_subscriptions to allow service role to manage subscriptions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin view all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users view own subscriptions" ON user_subscriptions;

-- Create new policies that allow service role to manage subscriptions
CREATE POLICY "Service role can manage all subscriptions"
ON user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can view all subscriptions"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
    AND user_roles.active = true
  )
);

CREATE POLICY "Users can view own subscriptions"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);