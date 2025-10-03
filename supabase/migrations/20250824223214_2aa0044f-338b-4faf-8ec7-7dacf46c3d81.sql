-- Fix critical security issue: Remove public access to profiles table
-- Replace with proper authenticated user access

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new secure policy: Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Admins can still view all profiles (this policy already exists)
-- "Admins can manage all profiles" policy covers admin access

-- Enhance security: Add policy to prevent unauthorized profile creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- Add audit logging for admin role changes
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_user UUID,
  action_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only log if current user is admin
  IF has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
    VALUES (auth.uid(), target_user, action_type, action_details);
  END IF;
END;
$$;

-- Update admin role assignment function to include logging and security
CREATE OR REPLACE FUNCTION public.admin_assign_role(
  target_user_id UUID,
  role_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify admin access
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Prevent self-assignment of admin role (security measure)
  IF role_name = 'admin' AND target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Security violation: Cannot self-assign admin role';
  END IF;
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, role_name)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the action
  PERFORM log_admin_action('role_assigned', target_user_id, jsonb_build_object('role', role_name));
  
  RETURN TRUE;
END;
$$;