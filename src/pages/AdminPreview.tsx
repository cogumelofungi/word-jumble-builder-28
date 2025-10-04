import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Palette, Smartphone, Tablet, Monitor, Settings } from 'lucide-react';
import TemplateBuilder from '@/components/admin/TemplateBuilder';
import { useNavigate } from 'react-router-dom';
import { ThemeRenderer } from '@/components/ThemeRenderer';
import { useActiveCustomTemplate } from '@/hooks/useActiveCustomTemplate';

// Import preview images
import previewCover from '@/assets/preview-cover.jpg';
import previewIcon from '@/assets/preview-icon.jpg';
import previewMainProduct from '@/assets/preview-main-product.jpg';
import previewBonus1 from '@/assets/preview-bonus1.jpg';
import previewBonus2 from '@/assets/preview-bonus2.jpg';
import previewBonus3 from '@/assets/preview-bonus3.jpg';
import previewBonus4 from '@/assets/preview-bonus4.jpg';
import previewBonus5 from '@/assets/preview-bonus5.jpg';
import previewBonus6 from '@/assets/preview-bonus6.jpg';
import previewBonus7 from '@/assets/preview-bonus7.jpg';

const AdminPreview = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal'>('classic');

  // Estados editáveis para os dados do app
  const [appName, setAppName] = useState("Master Class Marketing Digital");
  const [appDescription, setAppDescription] = useState("O curso completo que vai transformar você em um especialista em marketing digital");
  const [appColor, setAppColor] = useState("#4783F6");

  const activeCustom = useActiveCustomTemplate();
  const effectiveTemplate = (activeCustom.template || selectedTemplate) as 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  const effectiveColor = activeCustom.primaryColor || appColor;

  // Dados do app baseados nos estados
  const mockAppData = {
    nome: appName,
    descricao: appDescription,
    cor: effectiveColor,
    icone_url: previewIcon,
    capa_url: previewCover,
    produto_principal_url: "dummy-url",
    main_product_label: "Curso Master Class Completo",
    main_product_description: "Mais de 40 horas de conteúdo exclusivo com estratégias avançadas de marketing digital",
    bonuses_label: "Bônus Exclusivos",
    bonus1_url: "dummy-url",
    bonus1_label: "E-book: 100 Templates de Posts",
    bonus1_thumbnail: previewBonus1,
    bonus2_url: "dummy-url", 
    bonus2_label: "Planilha de Planejamento",
    bonus2_thumbnail: previewBonus2,
    bonus3_url: "dummy-url",
    bonus3_label: "Pack de Imagens Premium",
    bonus3_thumbnail: previewBonus3,
    bonus4_url: "dummy-url",
    bonus4_label: "Mentoria Exclusiva 1:1",
    bonus4_thumbnail: previewBonus4,
    bonus5_url: "dummy-url",
    bonus5_label: "Acesso ao Grupo VIP",
    bonus5_thumbnail: previewBonus5,
    bonus6_url: "dummy-url",
    bonus6_label: "Certificado de Conclusão",
    bonus6_thumbnail: previewBonus6,
    bonus7_url: "dummy-url",
    bonus7_label: "Updates Vitalícios",
    bonus7_thumbnail: previewBonus7,
    mainProductThumbnail: previewMainProduct,
    allow_pdf_download: true
  };

  const templates = [
    { value: 'classic', label: 'Classic - Layout Clássico' },
    { value: 'corporate', label: 'Corporate - Profissional' },
    { value: 'showcase', label: 'Showcase - Moderno' },
    { value: 'modern', label: 'Modern - Contemporâneo' },
    { value: 'minimal', label: 'Minimal - Minimalista' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Admin
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Template Builder & Preview</h1>
                <p className="text-muted-foreground">Crie templates personalizados e visualize como ficará seu app</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecionar tema" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Template Builder
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Preview Mobile
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-2">
              <Tablet className="h-4 w-4" />
              Preview Tablet
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Preview Desktop
            </TabsTrigger>
          </TabsList>

          {/* Template Builder */}
          <TabsContent value="builder" className="mt-6">
            <TemplateBuilder />
          </TabsContent>
              
          {/* Mobile Preview */}
          <TabsContent value="mobile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Preview Mobile
                  <span className="text-sm font-normal text-muted-foreground">
                    ({templates.find(t => t.value === selectedTemplate)?.label})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-[320px] h-[640px] bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden">
                      <ThemeRenderer
                        template={selectedTemplate}
                        appData={mockAppData}
                        userPlanLimits={7}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tablet Preview */}
          <TabsContent value="tablet" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Preview Tablet
                  <span className="text-sm font-normal text-muted-foreground">
                    ({templates.find(t => t.value === selectedTemplate)?.label})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <div className="relative">
                  {/* Tablet Frame */}
                  <div className="w-[500px] h-[700px] bg-gray-800 rounded-[1.5rem] p-3 shadow-2xl">
                    <div className="w-full h-full bg-black rounded-[1rem] overflow-hidden">
                      <ThemeRenderer
                        template={selectedTemplate}
                        appData={mockAppData}
                        userPlanLimits={7}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desktop Preview */}
          <TabsContent value="desktop" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🖥️ Preview Desktop
                  <span className="text-sm font-normal text-muted-foreground">
                    ({templates.find(t => t.value === selectedTemplate)?.label})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative">
                  {/* Desktop Frame */}
                  <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-t-[1rem] p-1 shadow-2xl">
                    {/* Browser Top Bar */}
                    <div className="bg-gray-700 rounded-t-[0.75rem] p-2 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-300 font-mono">
                        https://app.lovable.app/your-app
                      </div>
                    </div>
                    {/* Browser Content */}
                    <div className="w-full h-[600px] bg-black overflow-hidden">
                      <div className="scale-75 origin-top-left w-[133.33%] h-[133.33%]">
                        <ThemeRenderer
                          template={selectedTemplate}
                          appData={mockAppData}
                          userPlanLimits={7}
                          isPreview={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPreview;