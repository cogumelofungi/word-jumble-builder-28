import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useLanguage } from "@/hooks/useLanguage";
import { AlertCircle, CreditCard, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";

const InactiveAccount = () => {
  const { cancellationMessage, isActive, isLoading: statusLoading } = useUserStatus();
  const { hasActivePlan, isLoading: planLoading } = useUserPlan();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirecionamento baseado no status do usuário
  useEffect(() => {
    // Aguarda o carregamento dos dados
    if (statusLoading || planLoading) return;
    
    // Se o usuário está ativo, redireciona conforme o plano
    if (isActive) {
      if (hasActivePlan) {
        navigate('/app', { replace: true });
      } else {
        navigate('/pricing', { replace: true });
      }
    }
  }, [isActive, hasActivePlan, statusLoading, planLoading, navigate]);

  const handleGoToPricing = () => {
    navigate('/pricing');
  };

  const handleContactSupport = () => {
    navigate('/suporte');
  };

  // Mostra loading enquanto verifica o status
  if (statusLoading || planLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se chegou até aqui, o usuário está inativo, pode mostrar a página

  return (
    <div className="min-h-screen bg-app-bg">
      <Header />
      
      {/* Conteúdo Principal */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)] pt-20">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">{t("inactive.title")}</CardTitle>
            <CardDescription>
              {t("inactive.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {cancellationMessage || t("inactive.default_message")}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleGoToPricing} 
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {t("inactive.reactivate_button")}
              </Button>
              
              <Button 
                onClick={handleContactSupport} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Entrar em Contato com Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InactiveAccount;