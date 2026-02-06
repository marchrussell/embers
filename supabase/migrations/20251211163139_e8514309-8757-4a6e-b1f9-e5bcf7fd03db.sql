-- Add new columns for 2026 event booking system
ALTER TABLE public.event_bookings 
ADD COLUMN IF NOT EXISTS event_date text,
ADD COLUMN IF NOT EXISTS event_type text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_bookings_event_type_date 
ON public.event_bookings(event_type, event_date);

-- Create index for payment status filtering
CREATE INDEX IF NOT EXISTS idx_event_bookings_payment_status 
ON public.event_bookings(payment_status);