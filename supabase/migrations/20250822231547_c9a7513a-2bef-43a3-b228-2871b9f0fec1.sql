-- Adicionar campo para configuração do tema nos apps
ALTER TABLE public.apps 
ADD COLUMN theme_config JSONB DEFAULT NULL;

-- Comentário explicativo sobre o campo
COMMENT ON COLUMN public.apps.theme_config IS 'Configuração JSON do tema contendo cores, layout e estilos específicos do template';