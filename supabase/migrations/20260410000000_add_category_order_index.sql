-- Add order_index to categories table to control display order in library
ALTER TABLE public.categories ADD COLUMN order_index INTEGER;

-- Seed order for production categories
UPDATE public.categories SET order_index = 1 WHERE name = 'SLEEP';
UPDATE public.categories SET order_index = 2 WHERE name = 'CALM + RESTORE';
UPDATE public.categories SET order_index = 3 WHERE name = 'ENERGISE & ACTIVATE';
UPDATE public.categories SET order_index = 4 WHERE name = 'RELEASE + TRANSFORM';
UPDATE public.categories SET order_index = 5 WHERE name = 'NERVOUS SYSTEM RESILIENCE + CAPACITY';
