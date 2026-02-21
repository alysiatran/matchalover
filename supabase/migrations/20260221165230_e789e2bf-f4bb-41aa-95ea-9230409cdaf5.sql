CREATE POLICY "Admins can update cafes"
ON public.cafes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));