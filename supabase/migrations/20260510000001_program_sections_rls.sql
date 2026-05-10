ALTER TABLE public.program_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program sections are viewable by everyone"
ON public.program_sections
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert program sections"
ON public.program_sections
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update program sections"
ON public.program_sections
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete program sections"
ON public.program_sections
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
