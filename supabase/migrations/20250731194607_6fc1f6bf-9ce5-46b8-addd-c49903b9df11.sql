-- Remover plano "Gratuito" e redirecionar usuários para "Essencial"
UPDATE user_status 
SET plan_id = (SELECT id FROM plans WHERE name = 'Essencial' LIMIT 1)
WHERE plan_id = (SELECT id FROM plans WHERE name = 'Gratuito' LIMIT 1);

-- Deletar plano "Gratuito"
DELETE FROM plans WHERE name = 'Gratuito';

-- Criar RLS policies para permitir admin salvar configurações
CREATE POLICY "Admins can update admin settings" 
ON admin_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can insert admin settings" 
ON admin_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can delete admin settings" 
ON admin_settings 
FOR DELETE 
USING (true);