
CREATE TABLE public.cafe_ambience_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  seating INTEGER NOT NULL CHECK (seating BETWEEN 1 AND 5),
  loudness INTEGER NOT NULL CHECK (loudness BETWEEN 1 AND 5),
  wifi_speed INTEGER NOT NULL CHECK (wifi_speed BETWEEN 1 AND 5),
  laptop_friendly BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cafe_id)
);

ALTER TABLE public.cafe_ambience_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambience ratings are publicly readable" ON public.cafe_ambience_ratings FOR SELECT USING (true);
CREATE POLICY "Users can submit their own rating" ON public.cafe_ambience_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rating" ON public.cafe_ambience_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rating" ON public.cafe_ambience_ratings FOR DELETE USING (auth.uid() = user_id);
