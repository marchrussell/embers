-- Add week structure and content types to mentorship lessons
ALTER TABLE mentorship_lessons 
ADD COLUMN week_number integer DEFAULT 1,
ADD COLUMN content_type text DEFAULT 'lecture' CHECK (content_type IN ('lecture', 'document', 'practice')),
ADD COLUMN document_url text;

COMMENT ON COLUMN mentorship_lessons.week_number IS 'Week number within the module (1-4 typically)';
COMMENT ON COLUMN mentorship_lessons.content_type IS 'Type of content: lecture (video lesson), document (PDF/guide), practice (practice session video)';
COMMENT ON COLUMN mentorship_lessons.document_url IS 'URL for viewable documents (optional, for document type)';

-- Add calendar integration fields to mentorship calls
ALTER TABLE mentorship_calls 
ADD COLUMN calendar_event_id text,
ADD COLUMN calendar_invite_sent boolean DEFAULT false;

COMMENT ON COLUMN mentorship_calls.calendar_event_id IS 'Google Calendar event ID for tracking';
COMMENT ON COLUMN mentorship_calls.calendar_invite_sent IS 'Whether calendar invite has been sent to user';