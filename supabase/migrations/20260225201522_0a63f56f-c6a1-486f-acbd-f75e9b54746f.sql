
-- Create cafe_reviews table
CREATE TABLE public.cafe_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One review per user per cafe
CREATE UNIQUE INDEX idx_cafe_reviews_unique ON public.cafe_reviews(cafe_id, user_id);

ALTER TABLE public.cafe_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
ON public.cafe_reviews FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.cafe_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.cafe_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.cafe_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_cafe_reviews_updated_at
BEFORE UPDATE ON public.cafe_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for review photos
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);

CREATE POLICY "Anyone can view review photos"
ON storage.objects FOR SELECT USING (bucket_id = 'review-photos');

CREATE POLICY "Authenticated users can upload review photos"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own review photos"
ON storage.objects FOR DELETE USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
