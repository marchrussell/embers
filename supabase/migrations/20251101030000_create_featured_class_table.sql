-- Create featured_class table for highlighting a class on the homepage
CREATE TABLE public.featured_class (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.featured_class ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active featured class
CREATE POLICY "Anyone can view featured class"
ON public.featured_class
FOR SELECT
USING (true);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_featured_class_updated_at 
BEFORE UPDATE ON public.featured_class
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

