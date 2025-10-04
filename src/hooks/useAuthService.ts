import { useState, useEffect } from 'react';
import { userService } from '@/api/userService';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão salva no localStorage ao inicializar
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const { data, error } = await userService.getCurrentUser();
      if (!error && data.user) {
        setUser(data.user);
        // Recuperar sessão do localStorage se existir
        const savedSession = localStorage.getItem('mockUserSession');
        if (savedSession) {
          setSession(JSON.parse(savedSession));
        }
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await userService.login(email, password);
      
      if (!error && data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
      }
      
      return { error };
    } catch (error) {
      return { error: { message: 'Erro interno do servidor' } };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await userService.logout();
      
      if (!error) {
        setSession(null);
        setUser(null);
      }
      
      return { error };
    } catch (error) {
      return { error: { message: 'Erro ao fazer logout' } };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    checkCurrentUser
  };
};