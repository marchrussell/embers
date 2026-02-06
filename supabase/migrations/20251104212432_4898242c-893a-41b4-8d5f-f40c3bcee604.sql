-- Create mentorship invitations table
-- Using replace() on gen_random_uuid() instead of pgcrypto's gen_random_bytes()
CREATE TABLE public.mentorship_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('diy', 'guided')),
  invite_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS
ALTER TABLE public.mentorship_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invitations
CREATE POLICY "Admins can manage invitations"
ON public.mentorship_invitations
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can view unused, non-expired invitations by token (for signup validation)
CREATE POLICY "Public can view valid invitations"
ON public.mentorship_invitations
FOR SELECT
TO public
USING (used = false AND expires_at > now());

-- Create indexes for performance
CREATE INDEX idx_invitations_token ON public.mentorship_invitations(invite_token);
CREATE INDEX idx_invitations_email ON public.mentorship_invitations(email);
CREATE INDEX idx_invitations_used ON public.mentorship_invitations(used) WHERE used = false;
