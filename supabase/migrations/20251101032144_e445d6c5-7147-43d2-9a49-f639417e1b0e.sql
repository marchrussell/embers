-- Add RLS policies for admins to manage featured_class table
CREATE POLICY "Admins can insert featured class"
ON public.featured_class
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update featured class"
ON public.featured_class
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete featured class"
ON public.featured_class
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));