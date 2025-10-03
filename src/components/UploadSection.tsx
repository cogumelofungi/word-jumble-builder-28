import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Gift, FolderUp, HelpCircle, Download, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { UploadErrorHandler } from "@/components/UploadErrorHandler";


interface UploadBlock {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fieldName: keyof ReturnType<typeof useAppBuilder>['appData'];
}

interface UploadSectionProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const UploadSection = ({ appBuilder }: UploadSectionProps) => {
  const { appData, handleFileUpload, isLoading, updateAppData } = appBuilder;
  const { t } = useLanguage();
  const [importData, setImportData] = useState({
    json: "",
    appId: "",
  });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [retryingStates, setRetryingStates] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { maxProducts, planName, isLoading: planLoading } = usePlanLimits();
  const { hasAppImport } = useFeatureAccess();

  const uploadBlocks: UploadBlock[] = [
    {
      id: "main",
      title: t("upload.main"),
      description: t("upload.pdf.description"),
      icon: <FileText className="w-6 h-6" />,
      fieldName: "mainProduct",
    },
    {
      id: "bonus1",
      title: t("upload.bonus") + " 1",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus1",
    },
    {
      id: "bonus2",
      title: t("upload.bonus") + " 2", 
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus2",
    },
    {
      id: "bonus3",
      title: t("upload.bonus") + " 3",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus3",
    },
    {
      id: "bonus4",
      title: t("upload.bonus") + " 4",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus4",
    },
    {
      id: "bonus5",
      title: t("upload.bonus") + " 5",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus5",
    },
    {
      id: "bonus6",
      title: t("upload.bonus") + " 6",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus6",
    },
    {
      id: "bonus7",
      title: t("upload.bonus") + " 7",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus7",
    },
    {
      id: "bonus8",
      title: t("upload.bonus") + " 8",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus8",
    },
    {
      id: "bonus9",
      title: t("upload.bonus") + " 9",
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: "bonus9",
    },
  ];

  const handleFileSelect = async (blockId: string, fieldName: keyof ReturnType<typeof useAppBuilder>['appData'], file: File) => {
    setLoadingStates(prev => ({ ...prev, [blockId]: true }));
    setUploadErrors(prev => ({ ...prev, [blockId]: '' }));
    try {
      await handleFileUpload(fieldName, file, blockId);
    } catch (error: any) {
      setUploadErrors(prev => ({ ...prev, [blockId]: error.message || 'Erro no upload' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [blockId]: false }));
    }
  };

  const handleRetryUpload = async (blockId: string, fieldName: keyof ReturnType<typeof useAppBuilder>['appData']) => {
    setRetryingStates(prev => ({ ...prev, [blockId]: true }));
    setUploadErrors(prev => ({ ...prev, [blockId]: '' }));
    
    // Simular retry - na prática, você manteria uma referência ao arquivo
    // Por enquanto, apenas limpamos o erro para permitir novo upload
    setTimeout(() => {
      setRetryingStates(prev => ({ ...prev, [blockId]: false }));
      toast({
        title: "Pronto para retry",
        description: "Selecione o arquivo novamente para tentar o upload.",
      });
    }, 1000);
  };

  const handleImportById = async () => {
    if (!importData.appId.trim()) return;
    
    if (planName === 'Essencial') {
      toast({
        title: "Recurso não disponível",
        description: "Importar app está disponível apenas nos planos Profissional e Empresarial.",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Usuário não logado');

      const { data: app, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', importData.appId.trim())
        .single();

      if (error) throw error;
      
      if (!app) {
        toast({
          title: "App não encontrado",
          description: "Verifique se o ID está correto.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o usuário é o proprietário do app
      if (app.user_id !== currentUser.id) {
        toast({
          title: "Acesso negado",
          description: "Você só pode importar seus próprios apps.",
          variant: "destructive",
        });
        return;
      }

      // Preencher dados do app
      const importedData = {
        appName: app.nome || 'Meu App',
        appDescription: app.descricao || 'Descrição do App',
        appColor: app.cor || '#4783F6',
        customLink: app.link_personalizado || '',
        allowPdfDownload: app.allow_pdf_download ?? true,
        template: app.template || 'classic',
        themeConfig: app.theme_config,
        appIcon: app.icone_url ? { id: 'icon', name: 'icon', url: app.icone_url } : undefined,
        appCover: app.capa_url ? { id: 'cover', name: 'cover', url: app.capa_url } : undefined,
        mainProduct: app.produto_principal_url ? { id: 'main', name: 'main', url: app.produto_principal_url } : undefined,
        bonus1: app.bonus1_url ? { id: 'bonus1', name: 'bonus1', url: app.bonus1_url } : undefined,
        bonus2: app.bonus2_url ? { id: 'bonus2', name: 'bonus2', url: app.bonus2_url } : undefined,
        bonus3: app.bonus3_url ? { id: 'bonus3', name: 'bonus3', url: app.bonus3_url } : undefined,
        bonus4: app.bonus4_url ? { id: 'bonus4', name: 'bonus4', url: app.bonus4_url } : undefined,
        bonus5: (app as any).bonus5_url ? { id: 'bonus5', name: 'bonus5', url: (app as any).bonus5_url } : undefined,
        bonus6: (app as any).bonus6_url ? { id: 'bonus6', name: 'bonus6', url: (app as any).bonus6_url } : undefined,
        bonus7: (app as any).bonus7_url ? { id: 'bonus7', name: 'bonus7', url: (app as any).bonus7_url } : undefined,
        bonus8: (app as any).bonus8_url ? { id: 'bonus8', name: 'bonus8', url: (app as any).bonus8_url } : undefined,
        bonus9: (app as any).bonus9_url ? { id: 'bonus9', name: 'bonus9', url: (app as any).bonus9_url } : undefined,
        // Textos e rótulos personalizáveis
        mainProductLabel: app.main_product_label || 'PRODUTO PRINCIPAL',
        mainProductDescription: app.main_product_description || 'Disponível para download',
        bonusesLabel: app.bonuses_label || 'BÔNUS EXCLUSIVOS',
        bonus1Label: app.bonus1_label || 'Bônus 1',
        bonus2Label: app.bonus2_label || 'Bônus 2',
        bonus3Label: app.bonus3_label || 'Bônus 3',
        bonus4Label: app.bonus4_label || 'Bônus 4',
        bonus5Label: (app as any).bonus5_label || 'Bônus 5',
        bonus6Label: (app as any).bonus6_label || 'Bônus 6',
        bonus7Label: (app as any).bonus7_label || 'Bônus 7',
        bonus8Label: (app as any).bonus8_label || 'Bônus 8',
        bonus9Label: (app as any).bonus9_label || 'Bônus 9',
      };

      // Atualizar todos os campos
      Object.entries(importedData).forEach(([key, value]) => {
        if (value !== undefined) {
          appBuilder.updateAppData(key as keyof typeof importedData, value);
        }
      });

      toast({
        title: "App importado com sucesso!",
        description: `Dados do app "${app.nome}" foram carregados.`,
      });

      setImportData({ json: "", appId: "" });
    } catch (error) {
      console.error('Erro ao importar app:', error);
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar o app. Verifique o ID.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportAppAsJson = () => {
    const exportData = {
      appName: appData.appName,
      appDescription: appData.appDescription,
      appColor: appData.appColor,
      customLink: appData.customLink,
      customDomain: appData.customDomain,
      allowPdfDownload: appData.allowPdfDownload,
      template: appData.template,
      themeConfig: appData.themeConfig,
      appIcon: appData.appIcon,
      appCover: appData.appCover,
      mainProduct: appData.mainProduct,
      mainProductThumbnail: appData.mainProductThumbnail,
      bonus1: appData.bonus1,
      bonus1Thumbnail: appData.bonus1Thumbnail,
      bonus2: appData.bonus2,
      bonus2Thumbnail: appData.bonus2Thumbnail,
      bonus3: appData.bonus3,
      bonus3Thumbnail: appData.bonus3Thumbnail,
      bonus4: appData.bonus4,
      bonus4Thumbnail: appData.bonus4Thumbnail,
      bonus5: appData.bonus5,
      bonus5Thumbnail: appData.bonus5Thumbnail,
      bonus6: appData.bonus6,
      bonus6Thumbnail: appData.bonus6Thumbnail,
      bonus7: appData.bonus7,
      bonus7Thumbnail: appData.bonus7Thumbnail,
      bonus8: appData.bonus8,
      bonus8Thumbnail: appData.bonus8Thumbnail,
      bonus9: appData.bonus9,
      bonus9Thumbnail: appData.bonus9Thumbnail,
      // Textos e rótulos personalizáveis
      mainProductLabel: appData.mainProductLabel,
      mainProductDescription: appData.mainProductDescription,
      bonusesLabel: appData.bonusesLabel,
      bonus1Label: appData.bonus1Label,
      bonus2Label: appData.bonus2Label,
      bonus3Label: appData.bonus3Label,
      bonus4Label: appData.bonus4Label,
      bonus5Label: appData.bonus5Label,
      bonus6Label: appData.bonus6Label,
      bonus7Label: appData.bonus7Label,
      bonus8Label: appData.bonus8Label,
      bonus9Label: appData.bonus9Label,
      exportedAt: new Date().toISOString(),
      version: "2.0"
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appData.appName.replace(/[^a-zA-Z0-9]/g, '_')}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup criado!",
      description: "Arquivo JSON baixado com sucesso.",
    });
  };

  const handleJsonFileSelect = () => {
    if (planName === 'Essencial') {
      toast({
        title: "Recurso não disponível",
        description: "Importar app está disponível apenas nos planos Profissional e Empresarial.",
        variant: "destructive",
      });
      return;
    }
    jsonFileInputRef.current?.click();
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const jsonData = JSON.parse(jsonContent);
        
        // Validar estrutura do JSON
        if (!jsonData.appName && !jsonData.nome) {
          throw new Error("Formato JSON inválido");
        }

        // Preencher dados do app
        const importedData = {
          appName: jsonData.appName || jsonData.nome || 'Meu App',
          appDescription: jsonData.appDescription || jsonData.descricao || 'Descrição do App',
          appColor: jsonData.appColor || jsonData.cor || '#4783F6',
          customLink: jsonData.customLink || jsonData.link_personalizado || '',
          customDomain: jsonData.customDomain || '',
          allowPdfDownload: jsonData.allowPdfDownload ?? jsonData.allow_pdf_download ?? true,
          template: jsonData.template || 'classic',
          themeConfig: jsonData.themeConfig || jsonData.theme_config,
          appIcon: jsonData.appIcon || (jsonData.icone_url ? { id: 'icon', name: 'icon', url: jsonData.icone_url } : undefined),
          appCover: jsonData.appCover || (jsonData.capa_url ? { id: 'cover', name: 'cover', url: jsonData.capa_url } : undefined),
          mainProduct: jsonData.mainProduct || (jsonData.produto_principal_url ? { id: 'main', name: 'main', url: jsonData.produto_principal_url } : undefined),
          mainProductThumbnail: jsonData.mainProductThumbnail,
          bonus1: jsonData.bonus1 || (jsonData.bonus1_url ? { id: 'bonus1', name: 'bonus1', url: jsonData.bonus1_url } : undefined),
          bonus1Thumbnail: jsonData.bonus1Thumbnail,
          bonus2: jsonData.bonus2 || (jsonData.bonus2_url ? { id: 'bonus2', name: 'bonus2', url: jsonData.bonus2_url } : undefined),
          bonus2Thumbnail: jsonData.bonus2Thumbnail,
          bonus3: jsonData.bonus3 || (jsonData.bonus3_url ? { id: 'bonus3', name: 'bonus3', url: jsonData.bonus3_url } : undefined),
          bonus3Thumbnail: jsonData.bonus3Thumbnail,
          bonus4: jsonData.bonus4 || (jsonData.bonus4_url ? { id: 'bonus4', name: 'bonus4', url: jsonData.bonus4_url } : undefined),
          bonus4Thumbnail: jsonData.bonus4Thumbnail,
          bonus5: jsonData.bonus5 || (jsonData.bonus5_url ? { id: 'bonus5', name: 'bonus5', url: jsonData.bonus5_url } : undefined),
          bonus5Thumbnail: jsonData.bonus5Thumbnail,
          bonus6: jsonData.bonus6 || (jsonData.bonus6_url ? { id: 'bonus6', name: 'bonus6', url: jsonData.bonus6_url } : undefined),
          bonus6Thumbnail: jsonData.bonus6Thumbnail,
          bonus7: jsonData.bonus7 || (jsonData.bonus7_url ? { id: 'bonus7', name: 'bonus7', url: jsonData.bonus7_url } : undefined),
          bonus7Thumbnail: jsonData.bonus7Thumbnail,
          bonus8: jsonData.bonus8 || (jsonData.bonus8_url ? { id: 'bonus8', name: 'bonus8', url: jsonData.bonus8_url } : undefined),
          bonus8Thumbnail: jsonData.bonus8Thumbnail,
          bonus9: jsonData.bonus9 || (jsonData.bonus9_url ? { id: 'bonus9', name: 'bonus9', url: jsonData.bonus9_url } : undefined),
          bonus9Thumbnail: jsonData.bonus9Thumbnail,
          // Textos e rótulos personalizáveis
          mainProductLabel: jsonData.mainProductLabel || jsonData.main_product_label || 'PRODUTO PRINCIPAL',
          mainProductDescription: jsonData.mainProductDescription || jsonData.main_product_description || 'Disponível para download',
          bonusesLabel: jsonData.bonusesLabel || jsonData.bonuses_label || 'BÔNUS EXCLUSIVOS',
          bonus1Label: jsonData.bonus1Label || jsonData.bonus1_label || 'Bônus 1',
          bonus2Label: jsonData.bonus2Label || jsonData.bonus2_label || 'Bônus 2',
          bonus3Label: jsonData.bonus3Label || jsonData.bonus3_label || 'Bônus 3',
          bonus4Label: jsonData.bonus4Label || jsonData.bonus4_label || 'Bônus 4',
          bonus5Label: jsonData.bonus5Label || jsonData.bonus5_label || 'Bônus 5',
          bonus6Label: jsonData.bonus6Label || jsonData.bonus6_label || 'Bônus 6',
          bonus7Label: jsonData.bonus7Label || jsonData.bonus7_label || 'Bônus 7',
          bonus8Label: jsonData.bonus8Label || jsonData.bonus8_label || 'Bônus 8',
          bonus9Label: jsonData.bonus9Label || jsonData.bonus9_label || 'Bônus 9',
        };

        // Atualizar todos os campos
        Object.entries(importedData).forEach(([key, value]) => {
          if (value !== undefined) {
            appBuilder.updateAppData(key as keyof typeof importedData, value);
          }
        });

        toast({
          title: "JSON importado com sucesso!",
          description: "Dados do arquivo foram carregados.",
        });

        setImportData({ json: "", appId: "" });
      } catch (error) {
        console.error('Erro ao processar JSON:', error);
        toast({
          title: "Erro no JSON",
          description: "Arquivo JSON inválido ou formato incompatível.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Blocks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("upload.title")}
        </h2>
        
        {planLoading ? (
          // Show skeleton loading while plan is loading
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="bg-app-surface border-app-border">
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </Card>
          ))
        ) : (
          uploadBlocks.filter((block, index) => {
            // Show main product (index 0) + allowed bonus products based on plan
            return index < maxProducts;
          }).map((block) => {
          const uploadedFile = appData[block.fieldName] as any;
          const hasFile = uploadedFile?.url;
          const isBlockLoading = loadingStates[block.id];
          const uploadError = uploadErrors[block.id];
          const isRetrying = retryingStates[block.id];
          
          return (
            <div key={block.id}>
              <Card 
                className={`bg-app-surface border-app-border p-4 transition-smooth ${
                  hasFile ? 'border-primary/30 bg-primary/5' : 'hover:bg-app-surface-hover'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-smooth ${
                    hasFile ? 'bg-primary/20 text-primary' : 'bg-app-surface-hover text-app-muted'
                  }`}>
                    {hasFile ? <Check className="w-6 h-6" /> : block.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{block.title}</h3>
                    <p className="text-sm text-app-muted">{block.description}</p>
                    {hasFile && (
                      <p className="text-xs text-primary mt-1">
                        ✓ {uploadedFile.name || 'Arquivo carregado'}
                      </p>
                    )}
                  </div>

                  <div className="upload-zone w-32 h-16 flex flex-col items-center justify-center relative cursor-pointer border-2 border-dashed border-app-border rounded-lg hover:border-primary/50 transition-smooth">
                    {isBlockLoading || isRetrying ? (
                     <div className="flex items-center justify-center">
                       <span className="text-xs text-app-muted">{isRetrying ? "Tentando..." : t("upload.uploading")}</span>
                     </div>
                    ) : hasFile ? (
                     <div className="flex flex-col items-center text-primary">
                       <Check className="w-5 h-5 mb-1" />
                       <span className="text-xs">{t("upload.uploaded")}</span>
                     </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-app-muted mb-1" />
                        <span className="text-xs text-app-muted">{t("upload.send")}</span>
                      </>
                    )}
                    <Input
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={isBlockLoading || isRetrying}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validação rigorosa para PDFs
                          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            toast({
                              title: "Formato não suportado",
                              description: "Envie apenas PDFs até 100 MB.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // Validação de tamanho
                          if (file.size > 100 * 1024 * 1024) {
                            toast({
                              title: "Arquivo muito grande", 
                              description: "Envie apenas PDFs até 100 MB.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          handleFileSelect(block.id, block.fieldName, file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </Card>
              
              {/* Show upload error with retry option */}
              {uploadError && (
                <UploadErrorHandler
                  error={uploadError}
                  onRetry={() => handleRetryUpload(block.id, block.fieldName)}
                  isRetrying={isRetrying}
                />
              )}
            </div>
          );
        })
        )}
        
        {/* PDF Download Control */}
        <div className="flex items-center space-x-2 mt-4 p-3 bg-app-surface-hover rounded-lg border border-app-border">
          <Checkbox
            id="allow-pdf-download"
            checked={appData.allowPdfDownload}
            onCheckedChange={(checked) => updateAppData('allowPdfDownload', checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="allow-pdf-download" className="text-sm text-foreground cursor-pointer">
            {t("upload.allow.download")}
          </Label>
        </div>
      </div>

      {/* Import Existing App */}
      <PremiumOverlay
        isBlocked={!hasAppImport}
        title="Importação de Apps"
        description="Importe dados de apps existentes usando JSON ou ID"
        requiredPlan={getRequiredPlan('hasAppImport')}
        variant="overlay"
      >
        <Card className="bg-app-surface border-app-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-app-surface-hover rounded-lg flex items-center justify-center mx-auto sm:mx-0">
              <FolderUp className="w-5 h-5 sm:w-6 sm:h-6 text-app-muted" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <h3 className="font-medium text-foreground text-center sm:text-left">{t("import.title")}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="mx-auto sm:mx-0">
                      <HelpCircle className="w-4 h-4 text-app-muted" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-app-surface border-app-border">
                      <p className="max-w-xs">
                        {t("import.tooltip")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="json-import" className="text-sm text-app-muted">
                    {t("import.select.json")}
                  </Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full border-app-border justify-center sm:justify-start text-sm"
                              onClick={handleJsonFileSelect}
                              disabled={isImporting || planName === 'Essencial'}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {t("import.select.file")}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {planName === 'Essencial' && (
                          <TooltipContent className="bg-app-surface border-app-border">
                            <p>{t("import.premium.required")}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    {(planName === 'Profissional' || planName === 'Empresarial') && (
                      <Button 
                        variant="outline" 
                        onClick={exportAppAsJson}
                        className="w-full sm:w-auto border-app-border text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {t("import.backup")}
                      </Button>
                    )}
                    <input
                      ref={jsonFileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleJsonFileChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="id-import" className="text-sm text-app-muted">
                    {t("import.id")}
                  </Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                    <Input
                      id="id-import"
                      placeholder={t("import.id.placeholder")}
                      value={importData.appId}
                      onChange={(e) => setImportData(prev => ({ ...prev, appId: e.target.value }))}
                      className="bg-app-surface-hover border-app-border text-sm"
                      disabled={planName === 'Essencial'}
                    />
                    <Button 
                      size="sm" 
                      className="w-full sm:w-auto bg-gradient-neon text-sm"
                      disabled={!importData.appId.trim() || isImporting || planName === 'Essencial'}
                      onClick={handleImportById}
                    >
                      {isImporting ? "Importando..." : t("import.button")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </PremiumOverlay>
    </div>
  );
};

export default UploadSection;
