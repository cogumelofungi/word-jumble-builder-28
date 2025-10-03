-- Atualizar função para não despublicar apps quando conta for inativada
CREATE OR REPLACE FUNCTION public.handle_user_deactivation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o usuário foi desativado (is_active = false)
  IF OLD.is_active = true AND NEW.is_active = false THEN
    -- Apenas log da ação, sem despublicar os apps
    INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
    VALUES (
      auth.uid(), 
      NEW.user_id, 
      'user_deactivated',
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