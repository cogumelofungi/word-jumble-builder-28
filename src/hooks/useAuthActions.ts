import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export const useAuthActions = () => {
  const { toast } = useToast();

  const signUp = async ({ email, password, fullName, phone }: SignUpData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/pricing`,
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta e escolher seu plano.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro na criação da conta",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      toast({
        title: "Logout realizado com sucesso!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email de recuperação enviado!",
        description: "Verifique sua caixa de entrada.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro na recuperação de senha",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada com sucesso!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (data: { full_name?: string; phone?: string }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não encontrado");

      // Update auth user with phone and metadata
      const { error: authError } = await supabase.auth.updateUser({
        phone: data.phone,
        data: {
          full_name: data.full_name,
          phone: data.phone
        }
      });

      if (authError) throw authError;

      // Update or insert profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.user.id,
          full_name: data.full_name,
          phone: data.phone,
          email: user.user.email
        });

      if (profileError) throw profileError;

      toast({
        title: "Perfil atualizado com sucesso!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    signUp,
    signInWithPassword,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  };
};