
-- Allow admins to view all cafe ownership claims
CREATE POLICY "Admins can view all claims"
ON public.cafe_owners
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update claims (approve/reject)
CREATE POLICY "Admins can update claims"
ON public.cafe_owners
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete claims (reject)
CREATE POLICY "Admins can delete claims"
ON public.cafe_owners
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles (to see claimant info)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
