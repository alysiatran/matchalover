
-- Chat rooms table
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat rooms are publicly readable" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Only service role can manage rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.role() = 'service_role'::text);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are publicly readable" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Seed default rooms
INSERT INTO public.chat_rooms (name, description) VALUES
  ('General', 'General matcha chat'),
  ('Cafe Recs', 'Share and ask for cafe recommendations'),
  ('Recipes', 'Matcha recipe tips and tricks'),
  ('Events', 'Discuss upcoming matcha events');
