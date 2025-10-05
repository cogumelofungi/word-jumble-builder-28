import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Globe, ArrowLeft, ArrowRight, Check, ChevronDown, Copy, ExternalLink, Loader2, AlertCircle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { useLanguage } from "@/hooks/useLanguage";
import { useDomainVerification } from "@/hooks/useDomainVerification";

interface DomainInfo {
  domain: string;
  isValid: boolean;
  provider: string | null;
  providerDisplayName: string;
  nameservers: string[];
  hasCloudflare: boolean;
  canAutoConnect: boolean;
  confidence: 'high' | 'medium' | 'low';
}

interface VerificationResult {
  isVerified: boolean;
  recordsFound: {
    aRecord: boolean;
    txtRecord: boolean;
  };
  errors: string[];
}

interface CustomDomainDialogProps {
  children: React.ReactNode;
}

const CustomDomainDialog = ({ children }: CustomDomainDialogProps) => {
  const { hasCustomDomain } = useFeatureAccess();
  const { t } = useLanguage();
  const { verifyDomain, verifyDNSRecords, autoConnect, isVerifying, isConnecting } = useDomainVerification();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isRecordAdded, setIsRecordAdded] = useState(false);
  const [isSubdomainOpen, setIsSubdomainOpen] = useState(false);
  const [isTxtOpen, setIsTxtOpen] = useState(false);

  const handleDomainChange = (value: string) => {
    setDomain(value);
    setDomainInfo(null);
  };

  const handleVerifyDomain = async () => {
    if (!domain) return;
    
    try {
      const info = await verifyDomain(domain);
      setDomainInfo(info);
      
      if (info.canAutoConnect) {
        setCurrentStep(3);
      } else if (info.isValid) {
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      // Continue to next step even if verification fails
      setCurrentStep(4);
    }
  };

  const handleContinue = () => {
    if (currentStep === 2) {
      handleVerifyDomain();
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAutoConnect = async () => {
    if (!domain) return;
    
    const success = await autoConnect(domain);
    if (success) {
      // Conectado com sucesso - fechar dialog ou mostrar sucesso
      setCurrentStep(1);
      setDomain("");
      setDomainInfo(null);
    } else {
      // Falha - ir para configuração manual
      setCurrentStep(4);
    }
  };

  const handleVerifyRecords = async () => {
    if (!domain) return;
    
    const result = await verifyDNSRecords(domain);
    setVerificationResult(result);
    
    if (result.isVerified) {
      // Sucesso na verificação
      setCurrentStep(1);
      setDomain("");
      setDomainInfo(null);
      setVerificationResult(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleManualConnection = () => {
    setCurrentStep(4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Tela 1 - Introdução/Escolha
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{t('domain.step1.title')}</h2>
        <p className="text-muted-foreground">{t('domain.step1.subtitle')}</p>
      </div>

      <Card className="cursor-pointer border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary"></div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{t('domain.step1.own_domain')}</h3>
              <p className="text-sm text-muted-foreground">{t('domain.step1.connect')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="text-center text-sm text-muted-foreground space-y-2 px-4">
          <p>{t('domain.step1.dns_info')}</p>
          <p>{t('domain.step1.no_changes')}</p>
          <a 
            href="#" 
            className="text-primary hover:text-primary/80 underline font-medium inline-flex items-center gap-1 transition-colors"
          >
            {t('domain.step1.view_steps')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
            {t('domain.step1.continue')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Tela 2 - Inserir domínio
  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{t('domain.step2.title')}</h2>
        <p className="text-muted-foreground">{t('domain.step2.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            placeholder={t('domain.step2.placeholder')}
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="text-center text-lg h-12"
          />
        </div>

        {isVerifying && domain && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Verificando domínio...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {domainInfo && (
          <Card className={cn(
            "border-2",
            domainInfo.isValid 
              ? domainInfo.canAutoConnect 
                ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
              : "border-red-200 bg-red-50 dark:bg-red-950/20"
          )}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {domainInfo.isValid ? (
                    domainInfo.canAutoConnect ? (
                      <Wifi className="w-4 h-4 text-green-600" />
                    ) : (
                      <Check className="w-4 h-4 text-blue-600" />
                    )
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {domainInfo.isValid 
                      ? domainInfo.canAutoConnect
                        ? "Conexão automática disponível"
                        : "Domínio válido - configuração manual necessária"
                      : "Domínio inválido"
                    }
                  </span>
                </div>
                
                {domainInfo.providerDisplayName && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>Provedor detectado: {domainInfo.providerDisplayName}</span>
                    {domainInfo.confidence === 'high' && (
                      <Check className="w-3 h-3 text-green-500" />
                    )}
                    {domainInfo.confidence === 'medium' && (
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                )}

                {domainInfo.canAutoConnect && (
                  <p className="text-sm text-green-600 dark:text-green-300">
                    ✨ Conexão automática disponível via {domainInfo.providerDisplayName}
                  </p>
                )}
                
                {domainInfo.isValid && !domainInfo.canAutoConnect && (
                  <div className="text-sm">
                    <p className="text-blue-600 dark:text-blue-300">
                      ✅ Domínio válido - configuração manual necessária
                    </p>
                    {domainInfo.providerDisplayName !== 'Configuração Manual' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Instruções específicas serão fornecidas para {domainInfo.providerDisplayName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('domain.back')}
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!domain || isVerifying || (domainInfo && !domainInfo.isValid)}
          className="bg-primary hover:bg-primary/90"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              {t('domain.continue')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Tela 3 - Conexão automática
  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Conectar automaticamente</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Detectamos que <strong>{domain}</strong> usa Cloudflare. Podemos conectar automaticamente usando a API do Cloudflare.
          </p>
          {domainInfo?.providerDisplayName && (
            <div className="bg-muted/50 rounded-lg p-3 mt-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                Informações do domínio:
                {domainInfo.confidence === 'high' && <Check className="w-3 h-3 text-green-500" />}
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Provedor: {domainInfo.providerDisplayName}</p>
                <p>Nameservers: {domainInfo.nameservers.slice(0, 2).join(', ')}</p>
                <p className="text-xs">Confiança: {
                  domainInfo.confidence === 'high' ? 'Alta' :
                  domainInfo.confidence === 'medium' ? 'Média' : 'Baixa'
                }</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleAutoConnect}
          disabled={isConnecting}
          className="w-full h-12 bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            "Conectar automaticamente"
          )}
        </Button>
        
        <div className="text-center">
          <button
            onClick={handleManualConnection}
            disabled={isConnecting}
            className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50"
          >
            Configurar manualmente
          </button>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('domain.back')}
        </Button>
      </div>
    </div>
  );

  // Tela 4 - Configuração DNS
  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{t('domain.step4.title')}</h2>
        <p className="text-muted-foreground">{t('domain.step4.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {/* Status da verificação */}
        {verificationResult && (
          <Card className={cn(
            "border-2",
            verificationResult.isVerified 
              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
              : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
          )}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {verificationResult.isVerified ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">
                    {verificationResult.isVerified ? "Domínio verificado com sucesso!" : "Verificação pendente"}
                  </span>
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    {verificationResult.recordsFound.aRecord ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span>Registro A: {verificationResult.recordsFound.aRecord ? "Encontrado" : "Não encontrado"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {verificationResult.recordsFound.txtRecord ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span>Registro TXT: {verificationResult.recordsFound.txtRecord ? "Encontrado" : "Não encontrado"}</span>
                  </div>
                </div>

                {verificationResult.errors.length > 0 && (
                  <div className="text-xs text-red-600 mt-2">
                    {verificationResult.errors.map((error, index) => (
                      <p key={index}>• {error}</p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registro A principal */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Adicionar registro A</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Host/Nome</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded">@</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("@")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground">Valor</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded">185.158.133.1</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("185.158.133.1")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registro A para subdomínio */}
        <Collapsible open={isSubdomainOpen} onOpenChange={setIsSubdomainOpen}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">{t('domain.step4.subdomain')}</h3>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isSubdomainOpen && "rotate-180")} />
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Host/Nome</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded">www</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("www")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Valor</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded">185.158.133.1</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("185.158.133.1")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Registro TXT */}
        <Collapsible open={isTxtOpen} onOpenChange={setIsTxtOpen}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">{t('domain.step4.txt_record')}</h3>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isTxtOpen && "rotate-180")} />
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Host/Nome</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded">@</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("@")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Valor TXT</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-xs">lovable-verify=abc123def456</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("lovable-verify=abc123def456")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleVerifyRecords}
          disabled={isVerifying}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando registros...
            </>
          ) : (
            "Verificar configuração"
          )}
        </Button>

        <div className="flex justify-start">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <PremiumOverlay
          isBlocked={!hasCustomDomain}
          title={t('domain.title')}
          description={t('domain.description')}
          requiredPlan={getRequiredPlan('hasCustomDomain')}
          variant="overlay"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>{t('domain.title')}</span>
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {currentStep}/4
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Progress bar */}
          <div className="w-full bg-muted h-2 rounded-full mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {renderCurrentStep()}
        </PremiumOverlay>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDomainDialog;