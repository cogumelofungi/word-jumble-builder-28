import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect, useMemo } from "react";
import { usePremiumTemplates } from "@/hooks/usePremiumTemplates";
import { Button } from "@/components/ui/button";
import { ThemeRenderer } from "@/components/ThemeRenderer";
import { useCustomTemplates } from "@/hooks/useCustomTemplates";

interface PhoneMockupProps {
  appName?: string;
  appDescription?: string;
  appColor?: string;
  appIcon?: string;
  appCover?: string;
  mainProductLabel?: string;
  mainProductDescription?: string;
  mainProductThumbnail?: string;
  bonusesLabel?: string;
  bonus1Label?: string;
  bonus1Thumbnail?: string;
  bonus2Label?: string;
  bonus2Thumbnail?: string;
  bonus3Label?: string;
  bonus3Thumbnail?: string;
  bonus4Label?: string;
  bonus4Thumbnail?: string;
  template?: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  onTemplateChange?: (template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal') => void;
}

const PhoneMockup = ({ 
  appName = "",
  appDescription = "",
  appColor = "#4783F6",
  appIcon,
  appCover,
  mainProductLabel,
  mainProductDescription,
  mainProductThumbnail,
  bonusesLabel,
  bonus1Label = "Bônus 1",
  bonus1Thumbnail,
  bonus2Label = "Bônus 2",
  bonus2Thumbnail,
  bonus3Label = "Bônus 3",
  bonus3Thumbnail,
  bonus4Label = "Bônus 4",
  bonus4Thumbnail,
  template = "classic",
  onTemplateChange
}: PhoneMockupProps) => {
  const { t } = useLanguage();
  const { hasPremiumAccess } = usePremiumTemplates();
  const { customTemplates } = useCustomTemplates();
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  // Combinar templates padrão com templates customizados
  const defaultTemplates = useMemo(() => ([
    { id: 'classic', name: 'Classic', description: 'Layout padrão limpo e elegante', isPremium: false, type: 'default' as const },
    { id: 'corporate', name: 'Corporate', description: 'Layout profissional para empresas', isPremium: true, type: 'default' as const },
    { id: 'showcase', name: 'Showcase', description: 'Layout moderno para destaque visual', isPremium: true, type: 'default' as const },
    { id: 'modern', name: 'Modern', description: 'Design contemporâneo e minimalista', isPremium: true, type: 'default' as const },
    { id: 'minimal', name: 'Minimal', description: 'Interface limpa e focada no conteúdo', isPremium: true, type: 'default' as const }
  ]), []);

  // Adicionar templates customizados à lista
  const customTemplateItems = customTemplates.map(ct => ({
    id: ct.id,
    name: ct.name,
    description: ct.description,
    isPremium: ct.isPremium,
    type: 'custom' as const,
    customTemplate: ct
  }));

  const allTemplates = useMemo(() => [...defaultTemplates, ...customTemplateItems], [defaultTemplates, customTemplateItems]);

  // Sincronizar com a prop 'template' apenas quando ela mudar
  useEffect(() => {
    const index = allTemplates.findIndex(t => t.id === template);
    if (index !== -1 && currentTemplateIndex !== index) {
      setCurrentTemplateIndex(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  const handlePrevTemplate = () => {
    const newIndex = currentTemplateIndex > 0 ? currentTemplateIndex - 1 : allTemplates.length - 1;
    setCurrentTemplateIndex(newIndex);
    const newTemplate = allTemplates[newIndex];
    
    // Apenas aplicar o template se não for premium OU se tiver acesso premium
    // A visualização sempre acontece independente do acesso
    if (onTemplateChange && (!newTemplate.isPremium || hasPremiumAccess)) {
      onTemplateChange(newTemplate.id as any);
    }
  };

  const handleNextTemplate = () => {
    const newIndex = currentTemplateIndex < allTemplates.length - 1 ? currentTemplateIndex + 1 : 0;
    setCurrentTemplateIndex(newIndex);
    const newTemplate = allTemplates[newIndex];
    
    // Apenas aplicar o template se não for premium OU se tiver acesso premium
    // A visualização sempre acontece independente do acesso
    if (onTemplateChange && (!newTemplate.isPremium || hasPremiumAccess)) {
      onTemplateChange(newTemplate.id as any);
    }
  };

  const currentTemplate = allTemplates[currentTemplateIndex];

  // Determinar template e cor efetivos - SEMPRE mostrar o template atual, mesmo se premium
  let effectiveTemplate: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  let effectiveColor = appColor;
  let effectiveThemeConfig = null;

  if (currentTemplate.type === 'custom') {
    // Se é um template customizado, usar suas configurações
    effectiveTemplate = currentTemplate.customTemplate!.template;
    effectiveColor = currentTemplate.customTemplate!.colors?.primary || appColor;
    effectiveThemeConfig = currentTemplate.customTemplate;
  } else {
    // Se é um template padrão, usar o ID diretamente
    effectiveTemplate = currentTemplate.id as 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  }

  // Prepare app data for ThemeRenderer
  const appData = {
    nome: appName,
    descricao: appDescription,
    cor: effectiveColor,
    icone_url: appIcon,
    capa_url: appCover,
    produto_principal_url: "dummy-url", // For preview only
    main_product_label: mainProductLabel,
    main_product_description: mainProductDescription,
    bonuses_label: bonusesLabel,
    bonus1_url: "dummy-url",
    bonus1_label: bonus1Label,
    bonus1_thumbnail: bonus1Thumbnail,
    bonus2_url: "dummy-url", 
    bonus2_label: bonus2Label,
    bonus2_thumbnail: bonus2Thumbnail,
    bonus3_url: "dummy-url",
    bonus3_label: bonus3Label,
    bonus3_thumbnail: bonus3Thumbnail,
    bonus4_url: "dummy-url",
    bonus4_label: bonus4Label,
    bonus4_thumbnail: bonus4Thumbnail,
    mainProductThumbnail: mainProductThumbnail,
    allow_pdf_download: true
  };

  return (
    <div className="flex justify-center relative">
      {/* Template Navigation Buttons - Z-index maior que o overlay */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-40 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background shadow-lg"
        onClick={handlePrevTemplate}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-40 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background shadow-lg"
        onClick={handleNextTemplate}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="phone-mockup">
        {/* Phone Screen */}
        <div className="phone-screen relative">
          <div className="relative w-full h-full max-w-[280px] mx-auto">
            <div 
              className="w-full h-full rounded-[2.5rem] overflow-hidden"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <ThemeRenderer
                template={effectiveTemplate}
                appData={appData}
                userPlanLimits={4}
                isPreview={true}
                customTheme={effectiveThemeConfig}
              />
            </div>
          </div>
          
          {/* Premium Template Overlay - Centralizada e por cima */}
          {currentTemplate.isPremium && !hasPremiumAccess && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-[2.5rem] z-30 flex items-center justify-center">
              <div className="bg-black/80 rounded-xl p-6 mx-6 text-center border border-orange-500/30 max-w-xs">
                <Crown className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">{currentTemplate.name}</h3>
                <p className="text-white/70 text-sm mb-4">{currentTemplate.description}</p>
                <div className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
                  Plano Empresarial
                </div>
                <p className="text-white/60 text-xs mt-3">
                  Upgrade para acessar templates premium
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;