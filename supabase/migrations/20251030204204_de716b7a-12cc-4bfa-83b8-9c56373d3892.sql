-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TEXT NOT NULL,
  address TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  price INTEGER NOT NULL, -- in cents
  total_tickets INTEGER NOT NULL,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_bookings table
CREATE TABLE public.event_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount INTEGER NOT NULL, -- in cents
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  signature_data TEXT NOT NULL, -- base64 signature image
  has_accepted_safety BOOLEAN NOT NULL DEFAULT true,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view published events"
ON public.events FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage events"
ON public.events FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Event bookings policies
CREATE POLICY "Users can view own bookings"
ON public.event_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
ON public.event_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON public.event_bookings FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();