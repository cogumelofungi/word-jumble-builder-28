import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, CreditCard, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { subscribed, planName, subscription_end, isLoading, refresh } = useStripeSubscription();

  // Refresh subscription status when component mounts (after payment success)
  useEffect(() => {
    refresh();
  }, []);

  const { language } = useLanguage();
  
  const formatDate = (dateString) => {
    const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'BRL') => {
    const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("payment_success.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("payment_success.subtitle")}
          </p>
        </div>

        {/* Subscription Details */}
        {subscribed && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                {t("payment_success.plan_title").replace("{plan}", planName)}
              </CardTitle>
              <CardDescription className="text-green-700">
                Sua assinatura foi ativada com sucesso!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Subscription Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-green-200">
                {subscription_end && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-green-600">{t("payment_success.next_billing")}</div>
                      <div className="font-semibold text-green-800">
                        {formatDate(subscription_end)}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-green-600">Plano Ativo</div>
                    <div className="font-semibold text-green-800">
                      {planName}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/app')}
            className="w-full sm:w-auto h-12 text-lg font-semibold px-8"
            size="lg"
          >
            {t("payment_success.access_app")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;