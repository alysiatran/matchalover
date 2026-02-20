
-- Create saved_cafes table
CREATE TABLE public.saved_cafes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cafe_id)
);

-- Enable RLS
ALTER TABLE public.saved_cafes ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved cafes
CREATE POLICY "Users can view own saved cafes"
  ON public.saved_cafes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save cafes
CREATE POLICY "Users can save cafes"
  ON public.saved_cafes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave cafes
CREATE POLICY "Users can unsave cafes"
  ON public.saved_cafes FOR DELETE
  USING (auth.uid() = user_id);
