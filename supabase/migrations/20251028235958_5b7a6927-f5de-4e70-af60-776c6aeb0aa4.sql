-- Create mentorship_modules table
CREATE TABLE public.mentorship_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  program_type text NOT NULL CHECK (program_type IN ('diy', 'guided', 'both')),
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create mentorship_lessons table
CREATE TABLE public.mentorship_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.mentorship_modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  resources_json jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create mentorship_progress table
CREATE TABLE public.mentorship_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.mentorship_lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  last_position_seconds integer DEFAULT 0,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create mentorship_calls table
CREATE TABLE public.mentorship_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  zoom_link text,
  notes text,
  recording_url text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.mentorship_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentorship_modules
CREATE POLICY "Published modules viewable by mentorship members"
ON public.mentorship_modules
FOR SELECT
USING (
  is_published = true 
  AND (
    has_role(auth.uid(), 'mentorship_diy'::app_role) 
    OR has_role(auth.uid(), 'mentorship_guided'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins can manage all modules"
ON public.mentorship_modules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentorship_lessons
CREATE POLICY "Published lessons viewable by mentorship members"
ON public.mentorship_lessons
FOR SELECT
USING (
  is_published = true 
  AND (
    has_role(auth.uid(), 'mentorship_diy'::app_role) 
    OR has_role(auth.uid(), 'mentorship_guided'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins can manage all lessons"
ON public.mentorship_lessons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentorship_progress
CREATE POLICY "Users can view own progress"
ON public.mentorship_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.mentorship_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.mentorship_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.mentorship_progress
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentorship_calls
CREATE POLICY "Users can view own calls"
ON public.mentorship_calls
FOR SELECT
USING (
  auth.uid() = user_id 
  AND has_role(auth.uid(), 'mentorship_guided'::app_role)
);

CREATE POLICY "Admins can manage all calls"
ON public.mentorship_calls
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_mentorship_modules_updated_at
BEFORE UPDATE ON public.mentorship_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_lessons_updated_at
BEFORE UPDATE ON public.mentorship_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_progress_updated_at
BEFORE UPDATE ON public.mentorship_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_calls_updated_at
BEFORE UPDATE ON public.mentorship_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();