-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY created_at DESC 
  LIMIT 1;
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update admin_settings RLS policies to use proper role checking
DROP POLICY IF EXISTS "Admins can delete admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can insert admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Anyone can view admin settings" ON public.admin_settings;

CREATE POLICY "Only admins can manage admin settings"
ON public.admin_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view admin settings"
ON public.admin_settings
FOR SELECT
USING (true);

-- Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial admin user (you'll need to update this with actual admin user ID)
-- This is a placeholder - replace with actual admin user ID after first login
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('REPLACE_WITH_ACTUAL_ADMIN_USER_ID', 'admin');