-- Final fix: Make the apps table completely private for anonymous users
-- Only authenticated users and admins can access it directly

-- Drop the public policy that still allows anonymous access
DROP POLICY IF EXISTS "Published apps basic info is publicly viewable" ON public.apps;

-- Create restrictive policy for anonymous users - no direct table access
CREATE POLICY "No anonymous access to apps table" 
ON public.apps 
FOR ALL 
TO anon
USING (false);

-- Maintain existing policies for authenticated users and admins
-- (These are already secure as they only allow users to see their own apps)

-- The get_public_app function will handle public access securely