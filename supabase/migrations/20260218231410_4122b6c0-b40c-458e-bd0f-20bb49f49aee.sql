
-- App roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'business_owner', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  business_name TEXT,
  phone TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Cafe owners linking table
CREATE TABLE public.cafe_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cafe_id)
);

ALTER TABLE public.cafe_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own claims" ON public.cafe_owners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can claim cafes" ON public.cafe_owners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security definer to check if user owns a cafe
CREATE OR REPLACE FUNCTION public.owns_cafe(_user_id UUID, _cafe_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cafe_owners
    WHERE user_id = _user_id AND cafe_id = _cafe_id AND approved = true
  )
$$;

-- Allow approved business owners to update their cafes
CREATE POLICY "Business owners can update their cafes"
  ON public.cafes FOR UPDATE
  USING (public.owns_cafe(auth.uid(), id));

-- Allow approved business owners to insert events for their cafe
CREATE POLICY "Business owners can insert events"
  ON public.matcha_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cafes c
      JOIN public.cafe_owners co ON co.cafe_id = c.id
      WHERE co.user_id = auth.uid()
        AND co.approved = true
        AND c.name = cafe_name
    )
  );

-- Allow business owners to update their own events
CREATE POLICY "Business owners can update their events"
  ON public.matcha_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cafes c
      JOIN public.cafe_owners co ON co.cafe_id = c.id
      WHERE co.user_id = auth.uid()
        AND co.approved = true
        AND c.name = cafe_name
    )
  );

-- Allow business owners to delete their own events
CREATE POLICY "Business owners can delete their events"
  ON public.matcha_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cafes c
      JOIN public.cafe_owners co ON co.cafe_id = c.id
      WHERE co.user_id = auth.uid()
        AND co.approved = true
        AND c.name = cafe_name
    )
  );

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
