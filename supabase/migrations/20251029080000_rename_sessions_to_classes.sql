-- Rename sessions table to classes
ALTER TABLE public.sessions RENAME TO classes;

-- Rename the column in user_progress from session_id to class_id
ALTER TABLE public.user_progress RENAME COLUMN session_id TO class_id;

-- Update the trigger name to match new table name
ALTER TRIGGER update_sessions_updated_at ON public.classes 
RENAME TO update_classes_updated_at;

