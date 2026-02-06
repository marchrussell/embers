-- Add reminder tracking to event_bookings
ALTER TABLE public.event_bookings 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of upcoming events needing reminders
CREATE INDEX IF NOT EXISTS idx_event_bookings_reminder 
ON public.event_bookings (event_date, reminder_sent_at) 
WHERE reminder_sent_at IS NULL AND payment_status = 'completed';