-- Create favourites table to store user's favourite sessions
CREATE TABLE public.user_favourites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Enable RLS
ALTER TABLE public.user_favourites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favourites
CREATE POLICY "Users can view own favourites"
ON public.user_favourites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own favourites
CREATE POLICY "Users can insert own favourites"
ON public.user_favourites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favourites
CREATE POLICY "Users can delete own favourites"
ON public.user_favourites
FOR DELETE
USING (auth.uid() = user_id);