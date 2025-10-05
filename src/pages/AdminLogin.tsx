import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
  const { signIn, signOut, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loginSchema = z.object({
    email: z.string().email(t('validation.email.invalid')),
    password: z.string().min(6, t('validation.password.min'))
  });

  // Redirecionar usuários já autenticados após verificar role de admin
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (isAuthenticated && user && !isLoggingIn) {
        setIsVerifyingAdmin(true);
        console.log('🔍 Verificando role de admin para:', user.email);
        
        try {
          // Verificar se o usuário é admin
          const { data: isAdmin, error } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });

          console.log('📊 Resultado verificação admin:', { isAdmin, error });

          if (error) {
            console.error('❌ Erro ao verificar admin:', error);
            toast({
              title: "Erro ao verificar permissões",
              description: "Tente novamente mais tarde",
              variant: "destructive",
            });
            await signOut();
            setIsVerifyingAdmin(false);
            return;
          }

          if (isAdmin) {
            console.log('✅ Usuário é admin, redirecionando...');
            toast({
              title: "Login realizado com sucesso",
              description: "Redirecionando para painel admin...",
            });
            navigate('/admin', { replace: true });
          } else {
            console.log('❌ Usuário não é admin');
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão de administrador",
              variant: "destructive",
            });
            await signOut();
          }
        } catch (err) {
          console.error('❌ Exceção ao verificar admin:', err);
          toast({
            title: "Erro ao verificar permissões",
            description: "Tente novamente mais tarde",
            variant: "destructive",
          });
          await signOut();
        } finally {
          setIsVerifyingAdmin(false);
        }
      }
    };

    checkAndRedirect();
  }, [isAuthenticated, user, navigate, isLoggingIn, signOut]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Validate input
      const validatedData = loginSchema.parse(credentials);
      
      console.log('🔐 Tentando fazer login...');
      
      // Sign in with Supabase
      const { error } = await signIn(validatedData.email, validatedData.password);
      
      if (error) {
        console.error('❌ Erro no login:', error);
        toast({
          title: t('toast.login.error.title'),
          description: error.message,
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }
      
      console.log('✅ Login bem-sucedido, aguardando verificação de admin...');
      // O useEffect cuidará da verificação e redirecionamento
    
    } catch (error) {
      console.error('❌ Exceção no login:', error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: t('toast.validation.title'),
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('toast.login.error.title'),
          description: t('toast.login.error.description'),
          variant: "destructive",
        });
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-app-surface border-app-border">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.login.title')}
          </h1>
          <p className="text-app-muted text-center">
            {t('admin.login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('admin.login.email')}</Label>
            <Input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="bg-app-surface-hover border-app-border"
              required
              disabled={isLoggingIn || isVerifyingAdmin}
            />
          </div>

          <div>
            <Label htmlFor="password">{t('admin.login.password')}</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="bg-app-surface-hover border-app-border"
              required
              disabled={isLoggingIn || isVerifyingAdmin}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-neon" disabled={isLoggingIn || isVerifyingAdmin}>
            {isLoggingIn ? t('admin.login.loading') : isVerifyingAdmin ? 'Verificando permissões...' : t('admin.login.submit')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
