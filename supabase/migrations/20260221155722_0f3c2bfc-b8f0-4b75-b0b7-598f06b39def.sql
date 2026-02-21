
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.matcha_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVPs are publicly readable" ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can un-RSVP" ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id);
