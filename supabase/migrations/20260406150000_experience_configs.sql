CREATE TABLE public.experience_configs (
  id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_type  TEXT        NOT NULL UNIQUE,
  title            TEXT        NOT NULL,
  subtitle         TEXT,
  recurrence_type  TEXT        CHECK (recurrence_type IN ('nthWeekday','weekly','nthDay')),
  weekday          INTEGER,
  nth              INTEGER,
  weekdays         INTEGER[],
  nth_day          INTEGER,
  time             TEXT,
  timezone         TEXT        NOT NULL DEFAULT 'GMT',
  duration         TEXT,
  recurrence_label TEXT,
  cta_label        TEXT,
  cta_link         TEXT,
  event_type       TEXT        CHECK (event_type IN ('free','paid','online-member')),
  format           TEXT,
  location         TEXT,
  venue            TEXT,
  price            TEXT,
  image_url        TEXT,
  max_capacity     INTEGER     NOT NULL DEFAULT 15,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active experience configs"
  ON public.experience_configs FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage experience configs"
  ON public.experience_configs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_experience_configs_updated_at
  BEFORE UPDATE ON public.experience_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.experience_configs
  (experience_type, title, subtitle, recurrence_type, weekday, nth,
   time, timezone, duration, recurrence_label, cta_label, cta_link,
   event_type, format, location, venue, price, max_capacity)
VALUES
  (
    'breath-presence-inperson',
    'Breath, Presence & Heart Connection',
    'An in-person evening to open, reconnect, and come back into yourself — together.',
    'nthWeekday', 3, 3,
    '20:00', 'GMT', '90 mins', 'Every 3rd Wednesday',
    'Book', 'https://calendly.com/march-marchrussell/breath-presence-in-person',
    'paid', 'In-Person', 'Soho', 'AUFI, 20 Eastcastle St, London W1W 8DB', '£20', 15
  ),
  (
    'breathwork-to-dub',
    'Breathwork to Dub',
    'A movement + breath experience to energise the body and awaken your senses.',
    'nthWeekday', 6, 1,
    '11:30', 'GMT', '1 hour', 'Every 1st Saturday',
    'Book', 'https://calendly.com/march-marchrussell/breathwork-to-dub',
    'paid', 'In-Person', 'Soho', 'AUFI, 20 Eastcastle St, London W1W 8DB', '£15', 15
  );

-- Dates for each occurrence of an experience
CREATE TABLE public.experience_dates (
  id                   UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_type      TEXT        NOT NULL,
  experience_config_id UUID        REFERENCES public.experience_configs(id) ON DELETE CASCADE,
  date                 DATE        NOT NULL,
  time                 TEXT,
  is_cancelled         BOOLEAN     NOT NULL DEFAULT false,
  notes                TEXT,
  max_capacity         INTEGER     NOT NULL DEFAULT 15,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_experience_date UNIQUE (experience_type, date)
);

ALTER TABLE public.experience_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view non-cancelled experience dates"
  ON public.experience_dates FOR SELECT
  USING (is_cancelled = false OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage experience dates"
  ON public.experience_dates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_experience_dates_type_date
  ON public.experience_dates (experience_type, date);
