import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStatus {
  isActive: boolean;
  isLoading: boolean;
  cancellationMessage: string;
  reactivateAccount: () => Promise<void>;
}

export const useUserStatus = (): UserStatus => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellationMessage, setCancellationMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserStatus();
      fetchCancellationMessage();
    }
  }, [user]);

  const fetchUserStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar status do usuário:', error);
        setIsActive(true); // Default para ativo em caso de erro
      } else {
        setIsActive(data?.is_active ?? true);
      }
    } catch (error) {
      console.error('Erro ao buscar status do usuário:', error);
      setIsActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCancellationMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'cancellation_message')
        .single();

      if (!error && data) {
        setCancellationMessage(data.value);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagem de cancelamento:', error);
    }
  };

  const reactivateAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_status')
        .update({ is_active: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao reativar conta:', error);
        throw error;
      } else {
        setIsActive(true);
      }
    } catch (error) {
      console.error('Erro ao reativar conta:', error);
      throw error;
    }
  };

  return {
    isActive,
    isLoading,
    cancellationMessage,
    reactivateAccount
  };
};