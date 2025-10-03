import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, X, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuthState } from "@/hooks/auth";
import { useUserPlan } from "@/hooks/useUserPlan";
import { AuthDialog } from "@/components/AuthDialog";
import { LogOut } from "lucide-react";

const PricingPage = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string>("");
  const { t } = useLanguage();
  const { isAuthenticated, signOut } = useAuthState();
  const { planName, hasActivePlan } = useUserPlan();

  const allFeatures = [
    "pricing.features.customization",
    "pricing.features.email_support", 
    "pricing.features.whatsapp_support",
    "pricing.features.import_apps",
    "pricing.features.custom_domain",
    "pricing.features.premium_templates"
  ];

  const plans = [
    {
      nameKey: "pricing.plan.essencial",
      monthlyPrice: 19,
      descriptionKey: "pricing.plan.essencial.description",
      appLimitKey: "pricing.plan.essencial.apps",
      pdfLimitKey: "pricing.plan.essencial.pdfs",
      features: {
        "pricing.features.customization": true,
        "pricing.features.email_support": true,
        "pricing.features.whatsapp_support": false,
        "pricing.features.import_apps": false,
        "pricing.features.custom_domain": false,
        "pricing.features.premium_templates": false
      },
      planId: "032abf21-7e33-4f8f-95fd-ef5663657b77",
      highlight: false,
      badgeKey: "pricing.plan.essencial.badge"
    },
    {
      nameKey: "pricing.plan.profissional",
      monthlyPrice: 49,
      descriptionKey: "pricing.plan.profissional.description",
      appLimitKey: "pricing.plan.profissional.apps",
      pdfLimitKey: "pricing.plan.profissional.pdfs",
      features: {
        "pricing.features.customization": true,
        "pricing.features.email_support": true,
        "pricing.features.whatsapp_support": true,
        "pricing.features.import_apps": true,
        "pricing.features.custom_domain": true,
        "pricing.features.premium_templates": false
      },
      planId: "7f0d0db4-e737-49be-ab41-f2003f908f9e",
      highlight: true
    },
    {
      nameKey: "pricing.plan.empresarial",
      monthlyPrice: 99,
      descriptionKey: "pricing.plan.empresarial.description",
      appLimitKey: "pricing.plan.empresarial.apps",
      pdfLimitKey: "pricing.plan.empresarial.pdfs",
      features: {
        "pricing.features.customization": true,
        "pricing.features.email_support": true,
        "pricing.features.whatsapp_support": true,
        "pricing.features.import_apps": true,
        "pricing.features.custom_domain": true,
        "pricing.features.premium_templates": true
      },
      planId: "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7",
      highlight: false
    }
  ];

  const getPrice = (plan: any) => {
    if (isAnnual) {
      const annualPrice = plan.monthlyPrice * 10;
      return `R$${annualPrice}`;
    }
    return `R$${plan.monthlyPrice}`;
  };

  // Função para determinar se um plano está disponível para upgrade
  const isPlanAvailable = (plan: any) => {
    if (!hasActivePlan) {
      // Usuário gratuito pode fazer upgrade para qualquer plano pago
      return true;
    }

    // Mapear nomes dos planos para comparação
    const currentPlanName = planName?.toLowerCase();
    const targetPlanName = t(plan.nameKey).toLowerCase();

    // Plano Essencial: pode fazer upgrade para Profissional ou Empresarial
    if (currentPlanName === 'essencial') {
      return targetPlanName === 'profissional' || targetPlanName === 'empresarial';
    }
    
    // Plano Profissional: pode fazer upgrade apenas para Empresarial
    if (currentPlanName === 'profissional') {
      return targetPlanName === 'empresarial';
    }
    
    // Plano Empresarial: não pode fazer upgrade (plano máximo)
    if (currentPlanName === 'empresarial') {
      return false;
    }

    return false;
  };

  // Função para determinar se é o plano atual do usuário
  const isCurrentPlan = (plan: any) => {
    if (!hasActivePlan) return false;
    const currentPlanName = planName?.toLowerCase();
    const targetPlanName = t(plan.nameKey).toLowerCase();
    return currentPlanName === targetPlanName;
  };

  const getPeriod = () => {
    return isAnnual ? t("pricing.per_year") : t("pricing.per_month");
  };

  const handleSubscribe = (plan: any) => {
    // Verificar se o plano está disponível
    if (!isPlanAvailable(plan)) {
      return;
    }

    if (!isAuthenticated) {
      setPendingPlanId(plan.planId);
      setShowAuthDialog(true);
      return;
    }
    
    const billing = isAnnual ? 'annual' : 'monthly';
    navigate(`/checkout?plan=${plan.planId}&billing=${billing}`);
  };

  const handleAuthSuccess = () => {
    if (pendingPlanId) {
      const billing = isAnnual ? 'annual' : 'monthly';
      navigate(`/checkout?plan=${pendingPlanId}&billing=${billing}`);
      setPendingPlanId("");
    }
  };

  const handleBackToApp = () => {
    navigate('/app');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logout button - shown only when authenticated */}
        {isAuthenticated && (
          <div className="flex justify-end mb-8">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            {t("pricing.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("pricing.subtitle")}
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label htmlFor="billing-toggle" className={`text-lg ${!isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              {t("pricing.billing.monthly")}
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className={`text-lg ${isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              {t("pricing.billing.annual")}
            </Label>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {t("pricing.billing.save")}
              </Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const isAvailable = isPlanAvailable(plan);
            const isCurrent = isCurrentPlan(plan);
            const isMaxPlan = hasActivePlan && planName?.toLowerCase() === 'empresarial';
            
            return (
              <Card 
                key={plan.nameKey} 
                className={`relative transition-all duration-300 ${
                  !isAvailable && !isCurrent 
                    ? 'opacity-60 cursor-not-allowed bg-muted/30' 
                    : 'hover:shadow-2xl hover:-translate-y-2'
                } ${
                  plan.highlight && isAvailable
                    ? 'ring-2 ring-primary scale-105 shadow-xl border-primary/50' 
                    : 'hover:shadow-lg'
                } ${
                  isCurrent ? 'ring-2 ring-green-500 border-green-500' : ''
                }`}
              >
                {plan.highlight && isAvailable && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {t("pricing.popular")}
                    </span>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Plano Atual
                    </span>
                  </div>
                )}
                
                {isMaxPlan && t(plan.nameKey).toLowerCase() === 'empresarial' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Plano Máximo
                    </span>
                  </div>
                )}
                
                {plan.badgeKey && !isCurrent && isAvailable && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {t(plan.badgeKey)}
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-bold text-foreground mb-2">{t(plan.nameKey)}</CardTitle>
                   <div className="mb-4">
                     <span className="text-4xl font-bold text-primary">{getPrice(plan)}</span>
                     <span className="text-muted-foreground">{getPeriod()}</span>
                     {isAnnual && (
                       <div className="text-sm text-muted-foreground mt-1">
                         {t("pricing.equivalent")} R${plan.monthlyPrice}{t("pricing.per_month")}
                       </div>
                     )}
                   </div>
                  <CardDescription className="text-lg">{t(plan.descriptionKey)}</CardDescription>
                  <div className="mt-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-foreground">{t(plan.appLimitKey)}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">{t(plan.pdfLimitKey)}</span>
                  </li>
                  {allFeatures.map((feature) => (
                  <li key={feature} className="flex items-center">
                      {plan.features[feature] ? (
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${plan.features[feature] ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t(feature)}
                      </span>
                  </li>
                  ))}
                  </ul>
                  
                  {isCurrent ? (
                    <Button 
                      disabled
                      className="w-full h-11 opacity-60"
                      size="lg"
                      variant="outline"
                    >
                      Plano Atual
                    </Button>
                  ) : isAvailable ? (
                    <Button 
                      onClick={() => handleSubscribe(plan)}
                      className={`w-full transition-all duration-300 ${
                        plan.highlight 
                          ? 'h-12 text-lg font-semibold hover:scale-105' 
                          : 'h-11'
                      }`}
                      size="lg"
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {t("pricing.subscribe")} {t(plan.nameKey)}
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full h-11 opacity-40 cursor-not-allowed"
                      size="lg"
                      variant="outline"
                    >
                      {isMaxPlan ? 'Plano Indisponível' : 'Indisponível'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onSuccess={handleAuthSuccess}
          redirectAfterLogin={`/checkout?plan=${pendingPlanId}&billing=${isAnnual ? 'annual' : 'monthly'}`}
        />
      </div>
    </div>
  );
};

export default PricingPage;