-- Auto-maintain lesson_count on programs based on published classes only.
-- This replaces the manually-set value that was getting out of sync when
-- individual classes were published/unpublished outside the course edit dialog.

CREATE OR REPLACE FUNCTION update_program_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE programs
  SET lesson_count = (
    SELECT COUNT(*) FROM classes
    WHERE program_id = COALESCE(NEW.program_id, OLD.program_id)
    AND is_published = true
  )
  WHERE id = COALESCE(NEW.program_id, OLD.program_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_program_lesson_count
AFTER INSERT OR UPDATE OF is_published, program_id OR DELETE
ON classes
FOR EACH ROW
EXECUTE FUNCTION update_program_lesson_count();

-- Backfill existing programs to fix current stale counts
UPDATE programs p
SET lesson_count = (
  SELECT COUNT(*) FROM classes c
  WHERE c.program_id = p.id AND c.is_published = true
);
