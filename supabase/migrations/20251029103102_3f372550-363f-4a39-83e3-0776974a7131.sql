-- Add support for multiple files per lesson and sequential completion

-- Add new columns to mentorship_lessons
ALTER TABLE mentorship_lessons 
ADD COLUMN IF NOT EXISTS files_json jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS requires_completion_of uuid REFERENCES mentorship_lessons(id) ON DELETE SET NULL;

-- Create index for better performance on prerequisite lookups
CREATE INDEX IF NOT EXISTS idx_mentorship_lessons_prerequisite ON mentorship_lessons(requires_completion_of);

-- Add comment to explain files_json structure
COMMENT ON COLUMN mentorship_lessons.files_json IS 'Array of file objects: [{"type": "video|pdf|audio", "url": "...", "title": "...", "description": "..."}]';