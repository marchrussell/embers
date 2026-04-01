-- Rename guest_teachers to live_session_details
-- This table now stores per-instance content for all live session types,
-- not just guest sessions. Fields (name, title, photo_url, etc.) are all optional.

-- Drop old trigger before rename to recreate with correct name
DROP TRIGGER IF EXISTS update_guest_teachers_updated_at ON public.guest_teachers;

-- Rename the table
ALTER TABLE public.guest_teachers RENAME TO live_session_details;

-- Rename the sequence if it exists (UUID PKs don't have sequences, but just in case)
-- ALTER SEQUENCE IF EXISTS guest_teachers_id_seq RENAME TO live_session_details_id_seq;

-- Rename the index on linked_session_id if it exists
ALTER INDEX IF EXISTS guest_teachers_linked_session_id_idx
  RENAME TO live_session_details_linked_session_id_idx;

-- Recreate the trigger with the correct table name
CREATE TRIGGER update_live_session_details_updated_at
BEFORE UPDATE ON public.live_session_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Make previously NOT NULL fields optional since they may not apply to all session types
-- (name and title were required for guest teachers, but may not exist for other types)
ALTER TABLE public.live_session_details
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN session_date DROP NOT NULL,
  ALTER COLUMN session_title DROP NOT NULL;

-- RLS policies are automatically carried over on table rename, but let's rename them for clarity
ALTER POLICY "Anyone can view active guest teachers" ON public.live_session_details
  RENAME TO "Anyone can view active live session details";

ALTER POLICY "Admins can manage guest teachers" ON public.live_session_details
  RENAME TO "Admins can manage live session details";