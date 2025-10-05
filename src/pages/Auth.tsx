import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket, Globe, Sun, Moon } from "lucide-react";
import { PhoneField } from "@/components/PhoneField";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/components/PhoneField.css";


const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { platformName, platformDescription } = usePlatformSettings();

  useEffect(() => {
    // Verificar se já está logado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/app");
      }
    };
    checkUser();
  }, [navigate]);

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
          description: "Redirecionando...",
        });
        
        navigate("/app");
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

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      {/* Controls in top-right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-app-surface/50 backdrop-blur-sm">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("pt")}>
              🇧🇷 Português
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              🇺🇸 English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("es")}>
              🇪🇸 Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleTheme} 
          className="h-8 w-8 p-0 bg-app-surface/50 backdrop-blur-sm"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-neon rounded-xl flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {platformName}
          </h1>
          <p className="text-app-muted">
            {platformDescription}
          </p>
        </div>

        <Card className="bg-app-surface border-app-border p-6">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-app-surface-hover">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsSignUp(false)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("auth.login.button")}
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                onClick={() => setIsSignUp(true)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("auth.signup.button")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("auth.login.title")}
                </h3>
                <p className="text-sm text-app-muted">
                  {t("auth.login.subtitle")}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("auth.signup.title")}
                </h3>
                <p className="text-sm text-app-muted">
                  {t("auth.signup.subtitle")}
                </p>
              </div>
            </TabsContent>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    {t("auth.full_name")}
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("auth.full_name.placeholder")}
                    required
                    className="bg-app-surface-hover border-app-border focus:border-primary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.email.placeholder")}
                  required
                  className="bg-app-surface-hover border-app-border focus:border-primary"
                />
              </div>


              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
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
                <Label htmlFor="password" className="text-foreground">
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
                  className="bg-app-surface-hover border-app-border focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-neon hover:opacity-90 text-white font-semibold h-11"
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
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-app-muted">
            {t("auth.terms.text")}{" "}
            <span className="text-primary">{t("auth.terms.link")}</span> {t("auth.terms.and")}{" "}
            <span className="text-primary">{t("auth.privacy.link")}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;