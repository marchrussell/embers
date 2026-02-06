-- Drop the duplicate foreign key constraint that was left over from the table rename
-- The table was renamed from 'sessions' to 'classes' but the old FK constraint name remained
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS sessions_category_id_fkey;

-- Verify we still have the correct constraint
-- classes_category_id_fkey should remain