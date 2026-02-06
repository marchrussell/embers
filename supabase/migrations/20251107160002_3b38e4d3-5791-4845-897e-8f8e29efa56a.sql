-- Add unique constraint on user_id in user_subscriptions table
-- This allows the check-subscription function to properly upsert subscription data
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);