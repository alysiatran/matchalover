
-- Create cafes table to persist scraped data
CREATE TABLE public.cafes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  rating NUMERIC(2,1),
  reviews INTEGER,
  distance TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  hours TEXT,
  price_range TEXT,
  matcha_origin TEXT,
  matcha_grade TEXT,
  matcha_flavor_notes TEXT[] DEFAULT '{}',
  matcha_body TEXT,
  matcha_finish TEXT,
  menu JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, address)
);

-- Enable RLS
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;

-- Public read access (cafes are public data)
CREATE POLICY "Cafes are publicly readable"
  ON public.cafes FOR SELECT
  USING (true);

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can insert cafes"
  ON public.cafes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update cafes"
  ON public.cafes FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cafes_updated_at
  BEFORE UPDATE ON public.cafes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
