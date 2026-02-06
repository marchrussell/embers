-- Create a table for guest teachers
CREATE TABLE public.guest_teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  photo_url TEXT,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_title TEXT NOT NULL,
  what_to_expect TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guest_teachers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active guest teachers" 
ON public.guest_teachers 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage guest teachers" 
ON public.guest_teachers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_guest_teachers_updated_at
BEFORE UPDATE ON public.guest_teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();