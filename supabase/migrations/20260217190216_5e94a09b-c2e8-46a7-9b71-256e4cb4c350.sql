
-- Tighten INSERT/UPDATE to service role only (anon can't write)
DROP POLICY "Service role can insert cafes" ON public.cafes;
DROP POLICY "Service role can update cafes" ON public.cafes;

CREATE POLICY "Only service role can insert cafes"
  ON public.cafes FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update cafes"
  ON public.cafes FOR UPDATE
  USING (auth.role() = 'service_role');
