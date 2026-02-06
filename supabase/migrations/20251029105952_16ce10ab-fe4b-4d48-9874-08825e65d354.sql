-- Create mentorship_submodules table
CREATE TABLE IF NOT EXISTS public.mentorship_submodules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.mentorship_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add submodule_id to lessons and keep week_number temporarily for migration
ALTER TABLE public.mentorship_lessons
ADD COLUMN IF NOT EXISTS submodule_id UUID REFERENCES public.mentorship_submodules(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.mentorship_submodules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submodules
CREATE POLICY "Admins can manage all submodules"
ON public.mentorship_submodules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Published submodules viewable by mentorship members"
ON public.mentorship_submodules
FOR SELECT
USING (
  is_published = true AND (
    has_role(auth.uid(), 'mentorship_diy'::app_role) OR 
    has_role(auth.uid(), 'mentorship_guided'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submodules_module ON public.mentorship_submodules(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_submodule ON public.mentorship_lessons(submodule_id);

-- Add trigger for updated_at
CREATE TRIGGER update_mentorship_submodules_updated_at
BEFORE UPDATE ON public.mentorship_submodules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.mentorship_submodules IS 'Sub-modules (e.g., Week 1, Week 2) within mentorship modules';
COMMENT ON COLUMN public.mentorship_lessons.submodule_id IS 'Reference to the sub-module this lesson belongs to';