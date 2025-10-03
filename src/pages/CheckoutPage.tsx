import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/auth";
import { useLanguage } from "@/hooks/useLanguage";
import CreditCardForm from "@/components/CreditCardForm";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthState();
  const { t } = useLanguage();
  const planParam = searchParams.get('plan');
  const billingParam = searchParams.get('billing') || 'monthly';
  const isAnnual = billingParam === 'annual';
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const plansData = {
    "032abf21-7e33-4f8f-95fd-ef5663657b77": {
      name: t("pricing.plan.essencial"),
      monthlyPrice: 19,
      description: t("pricing.plan.essencial.description"),
      appLimit: t("pricing.plan.essencial.apps"),
      pdfLimit: t("pricing.plan.essencial.pdfs"),
      planId: "032abf21-7e33-4f8f-95fd-ef5663657b77",
      features: [
        t("pricing.plan.essencial.pdfs"),
        t("pricing.features.customization"),
        t("pricing.features.email_support")
      ]
    },
    "7f0d0db4-e737-49be-ab41-f2003f908f9e": {
      name: t("pricing.plan.profissional"), 
      monthlyPrice: 49,
      description: t("pricing.plan.profissional.description"),
      appLimit: t("pricing.plan.profissional.apps"),
      pdfLimit: t("pricing.plan.profissional.pdfs"),
      planId: "7f0d0db4-e737-49be-ab41-f2003f908f9e",
      features: [
        t("pricing.plan.profissional.pdfs"),
        t("pricing.features.customization"),
        t("pricing.features.email_support"),
        t("pricing.features.whatsapp_support"),
        t("pricing.features.import_apps"),
        t("pricing.features.custom_domain")
      ]
    },
    "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7": {
      name: t("pricing.plan.empresarial"),
      monthlyPrice: 99,
      description: t("pricing.plan.empresarial.description"),
      appLimit: t("pricing.plan.empresarial.apps"),
      pdfLimit: t("pricing.plan.empresarial.pdfs"),
      planId: "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7",
      features: [
        t("pricing.plan.empresarial.pdfs"),
        t("pricing.features.customization"),
        t("pricing.features.email_support"),
        t("pricing.features.whatsapp_support"),
        t("pricing.features.import_apps"),
        t("pricing.features.custom_domain"),
        t("pricing.features.premium_templates")
      ]
    }
  };

  const getDisplayPrice = (plan) => {
    if (isAnnual) {
      const annualPrice = plan.monthlyPrice * 10;
      return `R$${annualPrice}`;
    }
    return `R$${plan.monthlyPrice}`;
  };

  const getPeriod = () => {
    return isAnnual ? t("checkout.price.annual") : t("checkout.price.monthly");
  };

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      navigate('/pricing');
      return;
    }

    if (!planParam || !plansData[planParam]) {
      navigate('/pricing');
      return;
    }
    setSelectedPlan(plansData[planParam]);
  }, [planParam, navigate, isAuthenticated]);

  const handleStartPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: selectedPlan.planId,
          billingCycle: isAnnual ? 'yearly' : 'monthly',
        },
      });

      if (error) throw new Error(error.message || 'Erro ao iniciar checkout');
      if (!data?.url) throw new Error('URL de checkout não retornada');

      // Abre o checkout da Stripe na mesma guia
      window.location.href = data.url as string;
    } catch (err) {
      console.error('Erro ao criar sessão de checkout:', err);
      toast({
        title: t('checkout.error.title'),
        description: t('checkout.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handlePaymentConfirmed = async () => {
    if (!user || !selectedPlan) return;

    setIsProcessing(true);
    try {
      // Atualizar o plano do usuário no banco de dados
      const { error } = await supabase
        .from('user_status')
        .update({ 
          plan_id: selectedPlan.planId,
          last_renewal_date: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t("checkout.success.title"),
        description: t("checkout.success.description").replace("{planName}", selectedPlan.name),
      });

      // Redirecionar para a página de sucesso
      setTimeout(() => {
        navigate('/payment-success');
      }, 2000);

    } catch (error) {
      console.error('Erro ao ativar plano:', error);
      toast({
        title: t("checkout.error.title"),
        description: t("checkout.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToPricing = () => {
    navigate('/pricing');
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showCreditCardForm) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <CreditCardForm
            planName={selectedPlan.name}
            amount={getDisplayPrice(selectedPlan)}
            planId={selectedPlan.planId}
            billing={billingParam}
            monthlyPrice={selectedPlan.monthlyPrice}
            onPaymentSuccess={handlePaymentConfirmed}
            onCancel={handleBackToPricing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("checkout.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("checkout.subtitle")}
          </p>
        </div>

        {/* Plan Summary Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              {t("checkout.plan.title")} {selectedPlan.name}
            </CardTitle>
            <div className="mb-4">
              <span className="text-5xl font-bold text-primary">{getDisplayPrice(selectedPlan)}</span>
              <span className="text-xl text-muted-foreground">{getPeriod()}</span>
              {isAnnual && (
                <div className="text-sm text-muted-foreground mt-1">
                  {t("checkout.price.equivalent")} R${selectedPlan.monthlyPrice}{t("checkout.price.monthly")}
                </div>
              )}
            </div>
            <CardDescription className="text-lg">{selectedPlan.description}</CardDescription>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xl font-semibold text-foreground">
                {selectedPlan.appLimit}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t("checkout.benefits.title")}
              </h3>
              <ul className="space-y-3">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-foreground">
                  {isAnnual ? t("checkout.total.annual") : t("checkout.total.monthly")}
                </span>
                <span className="text-2xl font-bold text-primary">{getDisplayPrice(selectedPlan)}</span>
              </div>
              
              <Button 
                onClick={handleStartPayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg font-semibold hover:scale-105 transition-all duration-300"
                size="lg"
              >
                {isProcessing ? t("checkout.processing") : t("checkout.subscribe.button")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Pricing */}
        <div className="text-center">
          <Button 
            onClick={handleBackToPricing}
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("checkout.back.button")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;