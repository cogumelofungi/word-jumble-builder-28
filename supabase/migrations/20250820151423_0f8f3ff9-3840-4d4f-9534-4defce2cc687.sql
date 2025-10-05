-- Create admin user directly in the database
-- This is a one-time setup for the admin user

-- First, insert the user into auth.users (this is normally done via Supabase Auth API, but for admin setup we'll do it manually)
-- Note: In production, you should create this user via Supabase Dashboard > Authentication > Users
-- For now, we'll create the necessary records assuming the user will be created via the Auth API

-- Function to setup admin user after they sign up
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email in profiles table
  SELECT id INTO target_user_id 
  FROM public.profiles 
  WHERE email = user_email;
  
  -- If user exists, make them admin
  IF target_user_id IS NOT NULL THEN
    -- Insert admin role for the user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create a unique constraint to prevent duplicate role assignments
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);