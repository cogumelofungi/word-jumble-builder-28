-- Normalize empty platform settings to proper defaults
UPDATE admin_settings 
SET value = 'MigraBook' 
WHERE key = 'platform_name' AND (value = '' OR value IS NULL);

UPDATE admin_settings 
SET value = 'Crie e publique seus apps facilmente' 
WHERE key = 'platform_description' AND (value = '' OR value IS NULL);

-- Insert default values if they don't exist
INSERT INTO admin_settings (key, value) 
VALUES ('platform_name', 'MigraBook')
ON CONFLICT (key) DO NOTHING;

INSERT INTO admin_settings (key, value) 
VALUES ('platform_description', 'Crie e publique seus apps facilmente')
ON CONFLICT (key) DO NOTHING;

INSERT INTO admin_settings (key, value) 
VALUES ('default_language', 'pt')
ON CONFLICT (key) DO NOTHING;