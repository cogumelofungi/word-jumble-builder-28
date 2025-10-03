-- Remove all conflicting public/anonymous access policies on apps table
DROP POLICY IF EXISTS "No anonymous access to apps table" ON public.apps;
DROP POLICY IF EXISTS "Published apps basic info is publicly viewable" ON public.apps;
DROP POLICY IF EXISTS "Public apps are viewable by everyone" ON public.apps;
DROP POLICY IF EXISTS "Published apps are publicly viewable" ON public.apps;
DROP POLICY IF EXISTS "Published apps are publicly viewable with limited data" ON public.apps;
DROP POLICY IF EXISTS "No anonymous insert access to apps table" ON public.apps;
DROP POLICY IF EXISTS "No anonymous update access to apps table" ON public.apps;
DROP POLICY IF EXISTS "No anonymous delete access to apps table" ON public.apps;

-- Create a single clear policy for public read access to published apps
CREATE POLICY "allow_public_read_published_apps"
ON public.apps
FOR SELECT
TO public
USING (status = 'publicado');

-- Ensure authenticated user policies remain intact
-- (These should already exist, but we confirm them here)

-- Users can view their own apps (all statuses)
DROP POLICY IF EXISTS "Users can view their own apps" ON public.apps;
CREATE POLICY "Users can view their own apps"
ON public.apps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all apps
DROP POLICY IF EXISTS "Admins can view all apps" ON public.apps;
CREATE POLICY "Admins can view all apps"
ON public.apps
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users can create their own apps
DROP POLICY IF EXISTS "Users can create their own apps" ON public.apps;
CREATE POLICY "Users can create their own apps"
ON public.apps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own apps
DROP POLICY IF EXISTS "Users can update their own apps" ON public.apps;
CREATE POLICY "Users can update their own apps"
ON public.apps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own apps
DROP POLICY IF EXISTS "Users can delete their own apps" ON public.apps;
CREATE POLICY "Users can delete their own apps"
ON public.apps
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);