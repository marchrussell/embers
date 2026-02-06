-- Create table for weekly client notes
CREATE TABLE public.client_weekly_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 20),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, week_number)
);

-- Enable RLS
ALTER TABLE public.client_weekly_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage weekly notes
CREATE POLICY "Admins can manage client weekly notes"
  ON public.client_weekly_notes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_client_weekly_notes_updated_at
  BEFORE UPDATE ON public.client_weekly_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.client_weekly_notes IS 'Weekly notes for tracking client progress over 5 months (20 weeks)';
COMMENT ON COLUMN public.client_weekly_notes.week_number IS 'Week number from 1-20 representing 5 months of mentorship';