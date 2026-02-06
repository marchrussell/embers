-- Add short_description field to sessions table for abbreviated descriptions shown in category views
ALTER TABLE public.sessions 
ADD COLUMN short_description text;