-- Rename guest_teachers to live_session_details so per-instance content
-- (description, photo, what_to_expect, featured person) applies to all session types.
ALTER TABLE public.guest_teachers RENAME TO live_session_details;

-- Update the index on linked_session_id if one exists
ALTER INDEX IF EXISTS guest_teachers_linked_session_id_idx
  RENAME TO live_session_details_linked_session_id_idx;

-- Rename RLS policies to match the new table name
ALTER POLICY "Admins can manage guest teachers" ON public.live_session_details
  RENAME TO "Admins can manage live session details";

ALTER POLICY "Anyone can view active guest teachers" ON public.live_session_details
  RENAME TO "Anyone can view active live session details";
