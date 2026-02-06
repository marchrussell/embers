-- Create courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  duration_days integer NOT NULL DEFAULT 7,
  price_cents integer NOT NULL DEFAULT 4700,
  currency text NOT NULL DEFAULT 'gbp',
  stripe_price_id text,
  image_url text,
  is_published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create course_lessons table
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_type text NOT NULL DEFAULT 'video', -- 'video' or 'audio'
  media_url text NOT NULL,
  duration_minutes integer,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_course_purchases table
CREATE TABLE public.user_course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  stripe_session_id text,
  purchased_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

-- Create user_lesson_progress table
CREATE TABLE public.user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  last_position_seconds integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses policies (public can view published)
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Course lessons policies
CREATE POLICY "Anyone can view published lessons of published courses" ON public.course_lessons
  FOR SELECT USING (
    is_published = true AND EXISTS (
      SELECT 1 FROM public.courses WHERE courses.id = course_lessons.course_id AND courses.is_published = true
    )
  );

CREATE POLICY "Admins can manage lessons" ON public.course_lessons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- User course purchases policies
CREATE POLICY "Users can view own purchases" ON public.user_course_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON public.user_course_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.user_course_purchases
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage purchases" ON public.user_course_purchases
  FOR ALL USING (true) WITH CHECK (true);

-- User lesson progress policies
CREATE POLICY "Users can view own progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.user_lesson_progress
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX idx_user_course_purchases_user_id ON public.user_course_purchases(user_id);
CREATE INDEX idx_user_course_purchases_course_id ON public.user_course_purchases(course_id);
CREATE INDEX idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at
  BEFORE UPDATE ON public.user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();