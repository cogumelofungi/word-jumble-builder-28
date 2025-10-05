import { useEffect } from "react";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import UploadSection from "@/components/UploadSection";
import PhoneMockup from "@/components/PhoneMockup";
import CustomizationPanel from "@/components/CustomizationPanel";
import PublishButton from "@/components/PublishButton";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const appBuilder = useAppBuilder();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const handleLoadAppForEdit = (event: CustomEvent) => {
      const appData = event.detail;
      
      // Mapear dados do app para o formato do appBuilder
      const mappedData = {
        appName: appData.nome || "",
        appDescription: appData.descricao || "",
        appColor: appData.cor || "#4783F6",
        template: appData.template || "classic",
        // Link personalizado (slug)
        customLink: appData.slug || appData.link_personalizado || "",
        customDomain: appData.custom_domain || "",
        allowPdfDownload: appData.allow_pdf_download !== false,
        mainProductLabel: appData.main_product_label || "PRODUTO PRINCIPAL",
        mainProductDescription: appData.main_product_description || "Disponível para download",
        bonusesLabel: appData.bonuses_label || "BÔNUS EXCLUSIVOS",
        bonus1Label: appData.bonus1_label || "Bônus 1",
        bonus2Label: appData.bonus2_label || "Bônus 2",
        bonus3Label: appData.bonus3_label || "Bônus 3",
        bonus4Label: appData.bonus4_label || "Bônus 4",
        bonus5Label: appData.bonus5_label || "Bônus 5",
        bonus6Label: appData.bonus6_label || "Bônus 6",
        bonus7Label: appData.bonus7_label || "Bônus 7",
        bonus8Label: appData.bonus8_label || "Bônus 8",
        bonus9Label: appData.bonus9_label || "Bônus 9",
        themeConfig: typeof appData.theme_config === 'string' ? JSON.parse(appData.theme_config) : appData.theme_config,
        // Arquivos e imagens
        appIcon: appData.icone_url ? { id: 'icon', name: 'Ícone', url: appData.icone_url, file: null } : null,
        appCover: appData.capa_url ? { id: 'cover', name: 'Capa', url: appData.capa_url, file: null } : null,
        // Produtos (PDFs)
        mainProduct: appData.produto_principal_url ? { id: 'main', name: 'Produto Principal', url: appData.produto_principal_url, file: null } : null,
        bonus1: appData.bonus1_url ? { id: 'bonus1', name: 'Bônus 1', url: appData.bonus1_url, file: null } : null,
        bonus2: appData.bonus2_url ? { id: 'bonus2', name: 'Bônus 2', url: appData.bonus2_url, file: null } : null,
        bonus3: appData.bonus3_url ? { id: 'bonus3', name: 'Bônus 3', url: appData.bonus3_url, file: null } : null,
        bonus4: appData.bonus4_url ? { id: 'bonus4', name: 'Bônus 4', url: appData.bonus4_url, file: null } : null,
        bonus5: appData.bonus5_url ? { id: 'bonus5', name: 'Bônus 5', url: appData.bonus5_url, file: null } : null,
        bonus6: appData.bonus6_url ? { id: 'bonus6', name: 'Bônus 6', url: appData.bonus6_url, file: null } : null,
        bonus7: appData.bonus7_url ? { id: 'bonus7', name: 'Bônus 7', url: appData.bonus7_url, file: null } : null,
        bonus8: appData.bonus8_url ? { id: 'bonus8', name: 'Bônus 8', url: appData.bonus8_url, file: null } : null,
        bonus9: appData.bonus9_url ? { id: 'bonus9', name: 'Bônus 9', url: appData.bonus9_url, file: null } : null,
        // Thumbnails (se existirem campos específicos, usa; senão deixa vazio para evitar imagem quebrada)
        mainProductThumbnail: (appData.main_product_thumbnail || appData.produto_principal_thumbnail) 
          ? { id: 'main-thumb', name: 'Thumbnail Principal', url: (appData.main_product_thumbnail || appData.produto_principal_thumbnail), file: null } 
          : null,
        bonus1Thumbnail: appData.bonus1_thumbnail ? { id: 'bonus1-thumb', name: 'Thumbnail Bônus 1', url: appData.bonus1_thumbnail, file: null } : null,
        bonus2Thumbnail: appData.bonus2_thumbnail ? { id: 'bonus2-thumb', name: 'Thumbnail Bônus 2', url: appData.bonus2_thumbnail, file: null } : null,
        bonus3Thumbnail: appData.bonus3_thumbnail ? { id: 'bonus3-thumb', name: 'Thumbnail Bônus 3', url: appData.bonus3_thumbnail, file: null } : null,
        bonus4Thumbnail: appData.bonus4_thumbnail ? { id: 'bonus4-thumb', name: 'Thumbnail Bônus 4', url: appData.bonus4_thumbnail, file: null } : null,
        bonus5Thumbnail: appData.bonus5_thumbnail ? { id: 'bonus5-thumb', name: 'Thumbnail Bônus 5', url: appData.bonus5_thumbnail, file: null } : null,
        bonus6Thumbnail: appData.bonus6_thumbnail ? { id: 'bonus6-thumb', name: 'Thumbnail Bônus 6', url: appData.bonus6_thumbnail, file: null } : null,
        bonus7Thumbnail: appData.bonus7_thumbnail ? { id: 'bonus7-thumb', name: 'Thumbnail Bônus 7', url: appData.bonus7_thumbnail, file: null } : null,
        bonus8Thumbnail: appData.bonus8_thumbnail ? { id: 'bonus8-thumb', name: 'Thumbnail Bônus 8', url: appData.bonus8_thumbnail, file: null } : null,
        bonus9Thumbnail: appData.bonus9_thumbnail ? { id: 'bonus9-thumb', name: 'Thumbnail Bônus 9', url: appData.bonus9_thumbnail, file: null } : null,
      };

      // Carregar dados no app builder
      Object.entries(mappedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          appBuilder.updateAppData(key as any, value);
        }
      });

      toast({
        title: "App carregado com sucesso",
        description: `O app "${appData.nome}" foi carregado para edição.`,
      });
    };

    window.addEventListener('loadAppForEdit', handleLoadAppForEdit as any);
    
    return () => {
      window.removeEventListener('loadAppForEdit', handleLoadAppForEdit as any);
    };
  }, [appBuilder, toast]);

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <Header onResetApp={appBuilder.resetApp} />
      
      {/* Progress Bar */}
      <div className="pt-16">
        <ProgressBar appBuilder={appBuilder} />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <UploadSection appBuilder={appBuilder} />
          </div>

          {/* Right Column - Preview & Customization */}
          <div className="space-y-6">
            {/* Phone Preview */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
                {t("preview.title")}
              </h2>
              <PhoneMockup
                appName={appBuilder.appData.appName}
                appDescription={appBuilder.appData.appDescription}
                appColor={appBuilder.appData.appColor}
                appIcon={appBuilder.appData.appIcon?.url}
                appCover={appBuilder.appData.appCover?.url}
                mainProductLabel={appBuilder.appData.mainProductLabel}
                mainProductDescription={appBuilder.appData.mainProductDescription}
                mainProductThumbnail={appBuilder.appData.mainProductThumbnail?.url}
                bonusesLabel={appBuilder.appData.bonusesLabel}
                bonus1Label={appBuilder.appData.bonus1Label}
                bonus1Thumbnail={appBuilder.appData.bonus1Thumbnail?.url}
                bonus2Label={appBuilder.appData.bonus2Label}
                bonus2Thumbnail={appBuilder.appData.bonus2Thumbnail?.url}
                bonus3Label={appBuilder.appData.bonus3Label}
                bonus3Thumbnail={appBuilder.appData.bonus3Thumbnail?.url}
                bonus4Label={appBuilder.appData.bonus4Label}
                bonus4Thumbnail={appBuilder.appData.bonus4Thumbnail?.url}
                template={appBuilder.appData.template}
                onTemplateChange={(template) => appBuilder.updateAppData('template', template)}
              />
            </div>

            {/* Customization Panel */}
            <CustomizationPanel appBuilder={appBuilder} />
            
            {/* Publish Button */}
            <PublishButton appBuilder={appBuilder} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;