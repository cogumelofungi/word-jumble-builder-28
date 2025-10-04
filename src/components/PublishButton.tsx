import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Loader2, Check, Copy, ExternalLink, Eye, FileText, Gift, Image, Palette, AlertTriangle, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useAppLimit } from "@/hooks/useAppLimit";
import { supabase } from "@/integrations/supabase/client";

interface PublishButtonProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const PublishButton = ({ appBuilder }: PublishButtonProps) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string>("");
  const [isRepublishing, setIsRepublishing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentApps, maxApps, planName, canCreateApp, isLoading: limitLoading, refreshLimit } = useAppLimit();

  // Função para traduzir nomes dos planos
  const getTranslatedPlanName = (planName: string) => {
    const planTranslations: Record<string, string> = {
      'Empresarial': t("pricing.plan.empresarial"),
      'Profissional': t("pricing.plan.profissional"), 
      'Essencial': t("pricing.plan.essencial"),
      'Premium': t("pricing.plan.profissional"),
      'Básico': t("pricing.plan.essencial"),
      'Basic': t("pricing.plan.essencial"),
      'Professional': t("pricing.plan.profissional"),
      'Business': t("pricing.plan.empresarial"),
      'Essential': t("pricing.plan.essencial")
    };
    return planTranslations[planName] || planName;
  };

  // Verificar se é uma republicação
  useEffect(() => {
    const checkRepublication = async () => {
      if (!appBuilder.appData.customLink.trim()) {
        setIsRepublishing(false);
        return;
      }

      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data: existingApp } = await supabase
          .from('apps')
          .select('user_id')
          .eq('slug', appBuilder.appData.customLink.trim())
          .eq('user_id', user.id)
          .maybeSingle();

        setIsRepublishing(!!existingApp);
      } catch (error) {
        console.error('Erro ao verificar republicação:', error);
        setIsRepublishing(false);
      }
    };

    checkRepublication();
  }, [appBuilder.appData.customLink]);

  const handlePublishClick = async () => {
    // Verificar limite considerando se é atualização
    await refreshLimit(appBuilder.appData.customLink.trim());
    
    // Se é republicação, permitir sempre. Se não é, verificar limite
    if (!isRepublishing && !canCreateApp && !limitLoading) {
      setShowLimitDialog(true);
      return;
    }
    setShowReviewModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowReviewModal(false);
    const url = await appBuilder.publishApp();
    if (url) {
      setPublishedUrl(url);
      setShowSuccessModal(true);
      refreshLimit(); // Atualizar contador após publicação
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      toast({
        title: t("toast.copy.success.title"),
        description: t("toast.copy.success.description"),
      });
    } catch {
      toast({
        title: t("toast.copy.error.title"),
        description: t("toast.copy.error.description"),
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    window.open('/pricing', '_blank');
  };

  return (
    <>
      <Card className="bg-app-surface border-app-border p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("publish.ready")}
            </h3>
            <p className="text-sm text-app-muted mb-4">
              {t("publish.subtitle")}
            </p>
          </div>

          {/* Informações do plano */}
          {!limitLoading && (
            <div className="flex items-center justify-between p-3 bg-app-surface-hover border border-app-border rounded-lg">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t("publish.plan")} {getTranslatedPlanName(planName)}
                </span>
              </div>
              <span className="text-sm text-app-muted">
                {currentApps}/{maxApps} {t("publish.apps")}
              </span>
            </div>
          )}

          <Button
            onClick={handlePublishClick}
            disabled={appBuilder.isPublishing || !appBuilder.appData.appName || limitLoading}
            className="w-full btn-publish font-semibold py-3 h-12"
          >
            {appBuilder.isPublishing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("publish.publishing")}
              </>
            ) : limitLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("publish.checking")}
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                {isRepublishing ? t("publish.republish") : t("publish.button")}
              </>
            )}
          </Button>

          {appBuilder.isSaving && (
            <div className="flex items-center justify-center text-xs text-app-muted">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              {t("publish.saving")}
            </div>
          )}
        </div>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-app-surface border-app-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-foreground">
              <Eye className="w-6 h-6 mr-2 text-primary" />
              {t("publish.review.title")}
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              {t("publish.review.subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* App Info */}
            <div className="bg-app-surface-hover rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {t("publish.info.title")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-muted">{t("publish.info.name")}</span>
                  <span className="text-foreground font-medium">{appBuilder.appData.appName || t("publish.info.undefined")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-muted">{t("publish.info.description")}</span>
                  <span className="text-foreground">{appBuilder.appData.appDescription}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-app-muted">{t("publish.info.color")}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border border-app-border" 
                      style={{ backgroundColor: appBuilder.appData.appColor }}
                    ></div>
                    <span className="text-foreground">{appBuilder.appData.appColor}</span>
                  </div>
                </div>
                {appBuilder.appData.customLink && (
                  <div className="flex justify-between">
                    <span className="text-app-muted">{t("publish.info.link")}</span>
                    <span className="text-foreground">/{appBuilder.appData.customLink}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Uploads */}
            <div className="bg-app-surface-hover rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Gift className="w-4 h-4 mr-2" />
                {t("publish.products.title")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-muted">{t("publish.products.main")}</span>
                  <span className={`${appBuilder.appData.mainProduct?.url ? 'text-green-500' : 'text-red-500'}`}>
                    {appBuilder.appData.mainProduct?.url ? `✓ ${t("publish.products.loaded")}` : `✗ ${t("publish.products.notloaded")}`}
                  </span>
                </div>
                {[1, 2, 3, 4].map(num => {
                  const bonus = appBuilder.appData[`bonus${num}` as keyof typeof appBuilder.appData] as any;
                  return (
                    <div key={num} className="flex justify-between">
                      <span className="text-app-muted">{t("publish.products.bonus")} {num}:</span>
                      <span className={`${bonus?.url ? 'text-green-500' : 'text-app-muted'}`}>
                        {bonus?.url ? `✓ ${t("publish.products.loaded")}` : `○ ${t("publish.products.optional")}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Assets */}
            <div className="bg-app-surface-hover rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                {t("publish.visual.title")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-muted">{t("publish.visual.icon")}</span>
                  <span className={`${appBuilder.appData.appIcon?.url ? 'text-green-500' : 'text-app-muted'}`}>
                    {appBuilder.appData.appIcon?.url ? `✓ ${t("publish.products.loaded")}` : `○ ${t("publish.products.optional")}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-muted">{t("publish.visual.cover")}</span>
                  <span className={`${appBuilder.appData.appCover?.url ? 'text-green-500' : 'text-app-muted'}`}>
                    {appBuilder.appData.appCover?.url ? `✓ ${t("publish.products.loaded")}` : `○ ${t("publish.products.optional")}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewModal(false)}
              className="flex-1 border-app-border"
            >
              {t("publish.back")}
            </Button>
            <Button 
              onClick={handleConfirmPublish}
              disabled={appBuilder.isPublishing || !appBuilder.appData.appName}
              className="flex-1 btn-publish"
            >
              {appBuilder.isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("publish.publishing")}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  {t("publish.confirm")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-app-surface border-app-border">
          <DialogHeader>
            <DialogTitle className="flex items-center text-foreground">
              <Check className="w-6 h-6 mr-2 text-green-500" />
              {t("publish.success.title")}
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              {t("publish.success.subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-app-surface-hover rounded-lg p-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t("publish.success.link")}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publishedUrl}
                  readOnly
                  className="flex-1 bg-app-surface border border-app-border rounded-md px-3 py-2 text-sm text-foreground"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="border-app-border hover:bg-app-surface-hover"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(publishedUrl, '_blank')}
                  className="border-app-border hover:bg-app-surface-hover"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gradient-neon/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                {t("publish.success.steps")}
              </h4>
              <ul className="text-sm text-app-muted space-y-1">
                <li>• {t("publish.success.share")}</li>
                <li>• {t("publish.success.pwa")}</li>
                <li>• {t("publish.success.track")}</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de limite atingido */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="max-w-md bg-app-surface border-app-border">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{t("publish.limit.title")}</span>
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              {t("publish.limit.subtitle")} {maxApps} {t("publish.apps")} do seu plano {getTranslatedPlanName(planName)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {t("publish.limit.description")}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLimitDialog(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1 btn-publish"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t("publish.limit.upgrade")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublishButton;