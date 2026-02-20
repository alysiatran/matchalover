
-- Allow admins to insert chat rooms
CREATE POLICY "Admins can insert chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat rooms
CREATE POLICY "Admins can delete chat rooms"
ON public.chat_rooms FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
