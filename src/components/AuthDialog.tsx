import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket } from "lucide-react";
import { PhoneField } from "@/components/PhoneField";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  redirectAfterLogin?: string;
}

export const AuthDialog = ({ open, onOpenChange, onSuccess, redirectAfterLogin }: AuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { platformName, platformDescription } = usePlatformSettings();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error("Nome completo é obrigatório");
        }
        if (!phone.trim()) {
          throw new Error("Telefone é obrigatório");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectAfterLogin ? `${window.location.origin}${redirectAfterLogin}` : `${window.location.origin}/app`,
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
        
        onOpenChange(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Verificar se o email foi confirmado
        if (data.user && !data.user.email_confirmed_at) {
          // Email não confirmado - reenviar email de confirmação
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email
          });

          if (resendError) {
            toast({
              title: "Erro ao reenviar email",
              description: resendError.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Email não confirmado",
              description: "Reenviamos um email de confirmação. Verifique sua caixa de entrada e confirme sua conta antes de fazer login.",
              variant: "destructive",
            });
          }

          // Fazer logout para que o usuário não fique em um estado inconsistente
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Login realizado com sucesso!",
        });
        
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Erro na autenticação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setIsSignUp(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-gradient-neon rounded-xl flex items-center justify-center mx-auto mb-3">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {platformName}
          </DialogTitle>
          <DialogDescription>
            {platformDescription}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="login" 
              onClick={() => setIsSignUp(false)}
            >
              {t("auth.login.button")}
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              onClick={() => setIsSignUp(true)}
            >
              {t("auth.signup.button")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t("auth.login.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("auth.login.subtitle")}
            </p>
          </TabsContent>

          <TabsContent value="signup" className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t("auth.signup.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("auth.signup.subtitle")}
            </p>
          </TabsContent>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {t("auth.full_name")}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.full_name.placeholder")}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email.placeholder")}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("auth.phone")}
                </Label>
                <PhoneField
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  placeholder={t("auth.phone.placeholder")}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password.placeholder")}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? t("auth.signup.loading") : t("auth.login.loading")}
                </>
              ) : (
                <>
                  {isSignUp ? t("auth.signup.button") : t("auth.login.button")}
                </>
              )}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};