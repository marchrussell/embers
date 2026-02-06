-- Create table for Rise ARC application form submissions
CREATE TABLE public.arc_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  challenges TEXT[] DEFAULT '{}',
  internal_experience TEXT,
  statements TEXT[] DEFAULT '{}',
  tried_options TEXT[] DEFAULT '{}',
  tried_note TEXT,
  needs TEXT[] DEFAULT '{}',
  desired_shift TEXT,
  awareness TEXT,
  where_are_you TEXT,
  final_checkin TEXT,
  final_comment TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.arc_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit application"
ON public.arc_applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.arc_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update applications
CREATE POLICY "Admins can update applications"
ON public.arc_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.arc_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_arc_applications_created_at ON public.arc_applications(created_at DESC);
CREATE INDEX idx_arc_applications_status ON public.arc_applications(status);