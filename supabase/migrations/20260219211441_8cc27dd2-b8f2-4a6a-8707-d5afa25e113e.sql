-- Drop the existing composite unique constraint on name+address
ALTER TABLE public.cafes DROP CONSTRAINT IF EXISTS cafes_name_address_key;

-- Add a unique constraint on name only
ALTER TABLE public.cafes ADD CONSTRAINT cafes_name_key UNIQUE (name);