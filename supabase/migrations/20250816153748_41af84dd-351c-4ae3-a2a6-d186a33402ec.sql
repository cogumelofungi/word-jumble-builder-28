-- Fix critical security vulnerability: Restrict access to user profiles and status data

-- Drop the overly permissive policy on profiles table
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create secure policy: Users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow admins to view all profiles (for admin management)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add policies for profile updates (users can update their own)
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Review and tighten user_status admin policy
-- The current "Admins can manage all user status" policy is too broad
-- Let's make it more specific

-- First, let's see current policies and drop if needed
DROP POLICY IF EXISTS "Admins can manage all user status" ON public.user_status;

-- Create more specific admin policies for user_status
CREATE POLICY "Admins can view all user status"
ON public.user_status
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user status"
ON public.user_status
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user status"
ON public.user_status
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));