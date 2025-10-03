-- Add RLS policies to allow admins to view all user data for the admin panel

-- Allow admins to view all user_status records
CREATE POLICY "Admins can view all user status" 
ON public.user_status 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow admins to manage all user_status records
CREATE POLICY "Admins can manage all user status" 
ON public.user_status 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow admins to view all user_roles records
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow admins to view all apps for management
CREATE POLICY "Admins can view all apps" 
ON public.apps 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));