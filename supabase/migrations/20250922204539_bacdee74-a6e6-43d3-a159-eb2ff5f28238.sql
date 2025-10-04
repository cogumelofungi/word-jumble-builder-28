-- Trigger para despublicar apps quando conta for inativada
CREATE OR REPLACE FUNCTION handle_user_deactivation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o usuário foi desativado (is_active = false)
  IF OLD.is_active = true AND NEW.is_active = false THEN
    -- Despublicar todos os apps do usuário (mudar status de 'publicado' para 'draft')
    UPDATE public.apps 
    SET status = 'draft',
        updated_at = now()
    WHERE user_id = NEW.user_id 
      AND status = 'publicado';
    
    -- Log da ação
    INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
    VALUES (
      auth.uid(), 
      NEW.user_id, 
      'user_deactivated_apps_unpublished',
      jsonb_build_object(
        'reason', 'account_deactivated',
        'timestamp', now()
      )
    );
  END IF;
  
  -- Se o usuário foi reativado (is_active = true)
  IF OLD.is_active = false AND NEW.is_active = true THEN
    -- Log da reativação
    INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
    VALUES (
      auth.uid(), 
      NEW.user_id, 
      'user_reactivated',
      jsonb_build_object(
        'reason', 'account_reactivated', 
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS user_status_change_trigger ON public.user_status;
CREATE TRIGGER user_status_change_trigger
  AFTER UPDATE ON public.user_status
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deactivation();