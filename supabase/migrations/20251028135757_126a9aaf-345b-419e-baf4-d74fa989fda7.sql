-- Update featured session with new image and teacher name
UPDATE public.featured_session 
SET 
  teacher_name = 'March Russell',
  category = 'BREATHE',
  image_url = 'humming-reset.jpg'
WHERE title = 'Humming Reset';