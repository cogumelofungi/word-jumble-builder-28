-- Update plan limits according to requirements
UPDATE plans SET app_limit = 3 WHERE name = 'Essencial';
UPDATE plans SET app_limit = 5 WHERE name = 'Profissional';
UPDATE plans SET app_limit = 10 WHERE name = 'Empresarial';