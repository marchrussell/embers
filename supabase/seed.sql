-- Seed script for courses and programs tables
-- Run with: supabase db reset (includes seed) or supabase db seed

-- =============================================
-- CATEGORIES (if needed for programs)
-- =============================================
INSERT INTO public.categories (id, name, description, image_url)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Breathwork', 'Foundational breathing techniques for wellness', NULL),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'RESILIENCE & CAPACITY', 'Build lasting resilience and expand your capacity', NULL),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'TRANSFORM', 'Transform your state and reset your nervous system', NULL),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Sleep', 'Sessions designed to improve sleep quality', NULL),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Energy', 'Energizing practices to boost vitality', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- =============================================
-- PROGRAMS
-- =============================================
INSERT INTO public.programs (id, title, description, short_description, category_id, is_published, lesson_count, requires_subscription, teacher_name, image_url, thumbnail_url)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Breathing Basics',
    'Master the foundational breathing techniques that form the basis of all breathwork practices. This program covers diaphragmatic breathing, box breathing, and coherent breathing patterns.',
    'Learn essential breathing techniques',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true,
    5,
    false,
    'March Russell',
    NULL,
    NULL
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Anxiety Reset Protocol',
    'A comprehensive program designed to help you manage anxiety through proven breathwork and nervous system regulation techniques.',
    'Regulate your nervous system',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    true,
    7,
    true,
    'March Russell',
    NULL,
    NULL
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Sleep Restoration',
    'Transform your sleep quality with this guided program featuring calming breathwork and body-based practices designed for deep rest.',
    'Improve your sleep naturally',
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    true,
    6,
    true,
    'March Russell',
    NULL,
    NULL
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Morning Energy Activation',
    'Start your day with energy and clarity. This program combines energizing breathwork with movement to help you feel alive and focused.',
    'Energize your mornings',
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    true,
    4,
    true,
    'March Russell',
    NULL,
    NULL
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Start Here',
    'New to breathwork? Start here. This introductory program will guide you through the essentials and help you build a sustainable practice.',
    'Your breathwork journey begins',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true,
    3,
    false,
    'March Russell',
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  is_published = EXCLUDED.is_published,
  lesson_count = EXCLUDED.lesson_count,
  requires_subscription = EXCLUDED.requires_subscription,
  teacher_name = EXCLUDED.teacher_name;

-- =============================================
-- COURSES
-- =============================================
INSERT INTO public.courses (id, title, slug, description, short_description, duration_days, price_cents, currency, is_published, order_index, stripe_price_id, image_url)
VALUES 
  (
    'aaaa1111-aaaa-1111-aaaa-111111111111',
    'Anxiety Reset',
    'anxiety-reset',
    'A 7-day reset designed to soften anxiety, release tension, and restore clarity and calm — even when your nervous system feels wired, tight, or constantly "on."',
    'Soften anxiety and restore calm through daily breathwork.',
    7,
    4700,
    'gbp',
    true,
    1,
    'price_1SaMgHGBlPMRpwZ6bgIvIC6t',
    NULL
  ),
  (
    'bbbb2222-bbbb-2222-bbbb-222222222222',
    'Emotional Regulation Toolkit',
    'emotional-first-aid-kit',
    'A 3-day stabilisation toolkit to help you calm overwhelm, soften emotional intensity, and prevent shutdown — especially when life feels "too much."',
    'Calm overwhelm, soften emotional intensity, and feel safe in your body again.',
    3,
    5700,
    'gbp',
    true,
    2,
    'price_1Scmc3GBlPMRpwZ6I5x7a4lq',
    NULL
  ),
  (
    'cccc3333-cccc-3333-cccc-333333333333',
    'Sleep & NSDR Pack',
    'sleep-nsdr-pack',
    'A 14-day programme to repair stress-shaped sleep, deepen rest, and rebuild your body''s natural ability to unwind — even if your mind doesn''t want to switch off.',
    'Restore steadiness, reduce overwhelm, and help your body feel safe again.',
    14,
    9700,
    'gbp',
    true,
    3,
    'price_1Scmm1GBlPMRpwZ61IAp4cXj',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  duration_days = EXCLUDED.duration_days,
  price_cents = EXCLUDED.price_cents,
  is_published = EXCLUDED.is_published,
  order_index = EXCLUDED.order_index,
  stripe_price_id = EXCLUDED.stripe_price_id;

-- =============================================
-- Verify the seeded data
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Seeded % categories', (SELECT COUNT(*) FROM public.categories);
  RAISE NOTICE 'Seeded % programs', (SELECT COUNT(*) FROM public.programs);
  RAISE NOTICE 'Seeded % courses', (SELECT COUNT(*) FROM public.courses);
END $$;
