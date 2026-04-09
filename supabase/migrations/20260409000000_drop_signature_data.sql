-- Remove signature_data from event_bookings (signature collection removed from booking flow)
ALTER TABLE public.event_bookings
  DROP COLUMN IF EXISTS signature_data;
