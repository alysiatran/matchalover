
CREATE TABLE public.visited_cafes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cafe_id uuid NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, cafe_id)
);

ALTER TABLE public.visited_cafes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visited cafes"
  ON public.visited_cafes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark cafes as visited"
  ON public.visited_cafes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark visited cafes"
  ON public.visited_cafes FOR DELETE
  USING (auth.uid() = user_id);
