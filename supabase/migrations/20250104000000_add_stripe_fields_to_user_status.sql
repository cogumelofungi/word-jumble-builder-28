-- Adicionar campos para identificar clientes Stripe
ALTER TABLE user_status 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('stripe', 'manual', 'pix')),
ADD COLUMN IF NOT EXISTS bypass_stripe_check BOOLEAN DEFAULT false;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_status_stripe_customer 
ON user_status(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_status_stripe_subscription 
ON user_status(stripe_subscription_id);

-- Marcar usuários existentes como manuais
UPDATE user_status 
SET payment_method = 'manual',
    bypass_stripe_check = true
WHERE plan_id IS NOT NULL 
AND stripe_subscription_id IS NULL;
