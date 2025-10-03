-- Create RLS policy for admins to manage user_status
CREATE POLICY "Admins can manage all user status" 
ON public.user_status 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add unique constraint to plans.name
ALTER TABLE public.plans ADD CONSTRAINT plans_name_unique UNIQUE (name);

-- Insert default plans if they don't exist
INSERT INTO public.plans (name, app_limit) 
VALUES 
  ('Gratuito', 1),
  ('Profissional', 10),
  ('Empresarial', 100)
ON CONFLICT (name) DO NOTHING;

-- Ensure all users have a user_status record with default Empresarial plan
INSERT INTO public.user_status (user_id, plan_id, is_active)
SELECT 
  p.id,
  (SELECT id FROM public.plans WHERE name = 'Empresarial' LIMIT 1),
  true
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_status us WHERE us.user_id = p.id
);