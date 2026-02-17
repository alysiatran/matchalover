
-- Create events table for matcha cafe events in Seattle
CREATE TABLE public.matcha_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cafe_name TEXT,
  venue TEXT NOT NULL,
  address TEXT,
  event_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  event_time TEXT,
  tags TEXT[] DEFAULT '{}',
  price TEXT,
  url TEXT,
  image_url TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matcha_events ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Events are publicly readable"
ON public.matcha_events
FOR SELECT
USING (true);

-- Only service role can insert/update
CREATE POLICY "Only service role can insert events"
ON public.matcha_events
FOR INSERT
WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Only service role can update events"
ON public.matcha_events
FOR UPDATE
USING (auth.role() = 'service_role'::text);

-- Unique constraint to prevent duplicate events
CREATE UNIQUE INDEX idx_matcha_events_unique ON public.matcha_events (title, venue, event_date);

-- Trigger for updated_at
CREATE TRIGGER update_matcha_events_updated_at
BEFORE UPDATE ON public.matcha_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
