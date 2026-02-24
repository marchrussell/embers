-- Create junction table for many-to-many relationship between classes and categories
CREATE TABLE IF NOT EXISTS public.class_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, category_id)
);

-- Migrate existing one-to-one data into the junction table
INSERT INTO public.class_categories (class_id, category_id)
SELECT id, category_id
FROM public.classes
WHERE category_id IS NOT NULL
ON CONFLICT (class_id, category_id) DO NOTHING;

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_class_categories_class_id ON public.class_categories(class_id);
CREATE INDEX IF NOT EXISTS idx_class_categories_category_id ON public.class_categories(category_id);

-- Enable RLS
ALTER TABLE public.class_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read (same as classes/categories tables)
CREATE POLICY "Anyone can view class_categories"
  ON public.class_categories
  FOR SELECT
  USING (true);

-- Only admins can write (admin role is stored in user_roles table)
CREATE POLICY "Admins can manage class_categories"
  ON public.class_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
