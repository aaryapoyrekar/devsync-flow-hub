
-- STEP 1: Create an enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- STEP 2: Create a user_roles table linking users to roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- STEP 3: Enable RLS and add policies so each user can read their own role
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- (Admins can be handled via backoffice/manual insert, or you can extend policies later)

-- Create a SECURITY DEFINER function to check if a user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
