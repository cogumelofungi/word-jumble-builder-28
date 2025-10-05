-- Adicionar foreign key entre user_status e profiles
ALTER TABLE user_status 
ADD CONSTRAINT fk_user_status_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Garantir que todos os usuários da tabela auth.users tenham um profile
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Garantir que todos os profiles tenham um user_status
INSERT INTO user_status (user_id, plan_id, is_active)
SELECT p.id, pl.id, true 
FROM profiles p
CROSS JOIN (SELECT id FROM plans WHERE name = 'Empresarial' LIMIT 1) pl
WHERE p.id NOT IN (SELECT user_id FROM user_status)
ON CONFLICT (user_id) DO NOTHING;