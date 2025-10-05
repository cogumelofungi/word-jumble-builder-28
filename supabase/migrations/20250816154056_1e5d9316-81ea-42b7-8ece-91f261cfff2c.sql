-- Fix critical security vulnerability: Restrict access to integrations table containing API keys and webhook URLs

-- Drop the overly permissive policy that allows anyone to view integrations
DROP POLICY IF EXISTS "Anyone can view integrations" ON public.integrations;

-- Create secure policies: Only admins can manage integrations
CREATE POLICY "Only admins can view integrations"
ON public.integrations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert integrations"
ON public.integrations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update integrations"
ON public.integrations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete integrations"
ON public.integrations
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));