-- Create featured_session table
CREATE TABLE public.featured_session (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  session_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add columns to existing programs table
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS lesson_count INTEGER;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable Row Level Security
ALTER TABLE public.featured_session ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Featured session is viewable by everyone" 
ON public.featured_session 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_featured_session_updated_at
BEFORE UPDATE ON public.featured_session
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default featured session
INSERT INTO public.featured_session (title, teacher_name, duration, category, description, image_url, session_id)
VALUES (
  'Humming Reset',
  'Manoj D.',
  5,
  'BREATHE',
  'This short humming practice uses sound and vibration to calm your nervous system and steady your mind. Humming naturally slows the breath, stimulates the vagus nerve, and helps shift your body into a more relaxed state. Just a few minutes can reduce tension and bring a quiet sense of ease from within.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  '1'
);

-- Update existing program with new fields
UPDATE public.programs 
SET 
  teacher_name = 'March Russell',
  lesson_count = 10,
  image_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'
WHERE title = 'The Breathing Basics' OR teacher_name IS NULL;