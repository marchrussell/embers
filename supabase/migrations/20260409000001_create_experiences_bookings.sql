-- Drop legacy tables if they exist (only present in local/dev environments, never in production)
DROP TABLE IF EXISTS public.event_bookings CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Create experiences_bookings table
CREATE TABLE public.experiences_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_type TEXT,            -- e.g. 'breath-presence-inperson'
  experience_date TEXT,            -- YYYY-MM-DD
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount INTEGER NOT NULL,   -- in pence
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  has_accepted_safety BOOLEAN NOT NULL DEFAULT true,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experiences_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bookings"
ON public.experiences_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
ON public.experiences_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON public.experiences_bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
ON public.experiences_bookings FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
ON public.experiences_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_experiences_bookings_type_date
  ON public.experiences_bookings (experience_type, experience_date);

CREATE INDEX idx_experiences_bookings_payment_status
  ON public.experiences_bookings (payment_status);

CREATE INDEX idx_experiences_bookings_reminder
  ON public.experiences_bookings (experience_date, reminder_sent_at)
  WHERE reminder_sent_at IS NULL AND payment_status = 'completed';
