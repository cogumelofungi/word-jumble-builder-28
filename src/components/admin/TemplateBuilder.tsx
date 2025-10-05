import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Layout, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  Settings, 
  Grid3X3, 
  Square,
  Circle,
  Monitor,
  Smartphone,
  Crown,
  Copy,
  Download,
  Wand2,
  RefreshCw,
  Layers,
  Type,
  ArrowUpDown
} from 'lucide-react';
import { 
  LayoutSelector, 
  HEADER_LAYOUTS, 
  CONTENT_LAYOUTS, 
  BUTTON_STYLES, 
  CARD_STYLES,
  SPACING_OPTIONS,
  TYPOGRAPHY_OPTIONS
} from './LayoutSelector';
import { ThemeRenderer } from '@/components/ThemeRenderer';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { CustomTemplate, TEMPLATE_CATEGORIES, DEFAULT_CUSTOM_TEMPLATE } from '@/types/customTemplate';

const TemplateBuilder = () => {
  const {
    customTemplates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    activateTemplate,
    publishTemplate,
    duplicateTemplate,
    getActiveTemplate,
    getPublishedTemplates
  } = useCustomTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTemplate, setNewTemplate] = useState<Partial<CustomTemplate>>(DEFAULT_CUSTOM_TEMPLATE);
  const [livePreview, setLivePreview] = useState(true);

  // Mock app data for preview - agora usa as configurações do template em tempo real
  const mockAppData = {
    nome: newTemplate.name || "Template Preview",
    descricao: newTemplate.description || "Visualização do template personalizado",
    cor: newTemplate.colors?.primary || '#4783F6',
    icone_url: "https://via.placeholder.com/64x64/4783F6/ffffff?text=T",
    capa_url: "https://via.placeholder.com/400x200/gradient",
    produto_principal_url: "dummy-url",
    main_product_label: "Produto Principal",
    main_product_description: "Descrição do produto principal com layout personalizado",
    bonuses_label: "Bônus Exclusivos",
    bonus1_url: "dummy-url",
    bonus1_label: "Bônus 1",
    bonus2_url: "dummy-url",
    bonus2_label: "Bônus 2",
    bonus3_url: "dummy-url",
    bonus3_label: "Bônus 3",
    mainProductThumbnail: "https://via.placeholder.com/100x100",
    allow_pdf_download: true
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.description) {
      return;
    }

    try {
      const template = await createTemplate(newTemplate);
      setIsCreating(false);
      setNewTemplate(DEFAULT_CUSTOM_TEMPLATE);
      // Ativar automaticamente o template criado para preview
      if (template) {
        await activateTemplate(template.id);
      }
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  // Função para gerar template aleatório
  const generateRandomTemplate = () => {
    const randomHeaderLayout = HEADER_LAYOUTS[Math.floor(Math.random() * HEADER_LAYOUTS.length)];
    const randomContentLayout = CONTENT_LAYOUTS[Math.floor(Math.random() * CONTENT_LAYOUTS.length)];
    const randomButtonStyle = BUTTON_STYLES[Math.floor(Math.random() * BUTTON_STYLES.length)];
    const randomCardStyle = CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)];
    const randomSpacing = SPACING_OPTIONS[Math.floor(Math.random() * SPACING_OPTIONS.length)];
    const randomTypography = TYPOGRAPHY_OPTIONS[Math.floor(Math.random() * TYPOGRAPHY_OPTIONS.length)];
    
    // Paleta de cores aleatória
    const colors = [
      '#4783F6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setNewTemplate(prev => ({
      ...prev,
      colors: {
        ...prev.colors!,
        primary: randomColor,
        accent: randomColor
      },
      layout: {
        ...prev.layout!,
        headerStyle: randomHeaderLayout.value as any,
        contentLayout: randomContentLayout.value as any,
        buttonStyle: randomButtonStyle.value as any,
        cardStyle: randomCardStyle.value as any,
        spacing: randomSpacing.value as any,
        typography: randomTypography.value as any
      }
    }));
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? customTemplates 
    : customTemplates.filter(t => t.category === selectedCategory);

  const activeTemplate = getActiveTemplate();
  const publishedTemplates = getPublishedTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="h-6 w-6" />
            Template Builder Avançado
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          </h2>
          <p className="text-muted-foreground">Crie templates únicos com liberdade total de design</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLivePreview(!livePreview)} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview {livePreview ? 'Ativo' : 'Pausado'}
          </Button>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  Seus Templates
                  <Badge variant="secondary" className="ml-2">
                    {filteredTemplates.length}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: template.colors.primary }}
                    >
                      <Layout className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {template.isActive && (
                          <Badge variant="default" className="text-xs">Preview Ativo</Badge>
                        )}
                        {template.isPublished && (
                          <Badge variant="secondary" className="text-xs">Publicado</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {TEMPLATE_CATEGORIES[template.category]?.icon} {TEMPLATE_CATEGORIES[template.category]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                      disabled={isLoading}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate(template.id)}
                      disabled={isLoading}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={template.isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => activateTemplate(template.id)}
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={template.isPublished ? "default" : "outline"}
                      size="sm"
                      onClick={() => publishTemplate(template.id, !template.isPublished)}
                      disabled={isLoading}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Wand2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedCategory === 'all' 
                      ? 'Nenhum template criado ainda' 
                      : `Nenhum template na categoria ${TEMPLATE_CATEGORIES[selectedCategory as keyof typeof TEMPLATE_CATEGORIES]?.label}`
                    }
                  </h3>
                  <p className="text-sm mb-4">
                    Crie templates únicos com total controle sobre o design
                  </p>
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Preview Tempo Real
                {livePreview && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-4">
              <div className="relative">
                <div className="w-[200px] h-[350px] bg-gray-800 rounded-[1.5rem] p-1.5 shadow-xl">
                  <div className="w-full h-full bg-black rounded-[1rem] overflow-hidden">
                    <ThemeRenderer
                      template={(isCreating ? newTemplate : activeTemplate)?.template || 'classic'}
                      appData={{
                        ...mockAppData,
                        cor: (isCreating ? newTemplate : activeTemplate)?.colors?.primary || mockAppData.cor
                      }}
                      userPlanLimits={7}
                      isPreview={true}
                      customTheme={isCreating ? newTemplate as CustomTemplate : activeTemplate || undefined}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {(activeTemplate || (isCreating && newTemplate.name)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configurações Ativas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Nome:</span> {(isCreating ? newTemplate : activeTemplate)?.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Layout Header:</span> {(isCreating ? newTemplate : activeTemplate)?.layout?.headerStyle}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Layout Conteúdo:</span> {(isCreating ? newTemplate : activeTemplate)?.layout?.contentLayout}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Cor:</span>
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: (isCreating ? newTemplate : activeTemplate)?.colors?.primary }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Criar Template Personalizado
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomTemplate}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Gerar Aleatório
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic" className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Básico
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Cores
                  </TabsTrigger>
                  <TabsTrigger value="structure" className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Estrutura
                  </TabsTrigger>
                  <TabsTrigger value="spacing" className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    Espaçamento
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    Tipografia
                  </TabsTrigger>
                  <TabsTrigger value="effects" className="flex items-center gap-1">
                    <Circle className="h-3 w-3" />
                    Efeitos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Template</Label>
                      <Input
                        id="name"
                        value={newTemplate.name || ''}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Template Moderno Premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newTemplate.category || 'custom'}
                        onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva as características e o estilo do seu template"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Cores Principais</h3>
                      <div>
                        <Label htmlFor="primary">Cor Primária</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newTemplate.colors?.primary || '#4783F6'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, primary: e.target.value }
                            }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={newTemplate.colors?.primary || '#4783F6'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, primary: e.target.value }
                            }))}
                            className="flex-1"
                            placeholder="#4783F6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="accent">Cor de Destaque</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newTemplate.colors?.accent || '#6366f1'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, accent: e.target.value }
                            }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={newTemplate.colors?.accent || '#6366f1'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, accent: e.target.value }
                            }))}
                            className="flex-1"
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Cores de Fundo</h3>
                      <div>
                        <Label htmlFor="background">Fundo Principal</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newTemplate.colors?.background || '#1a1a1a'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, background: e.target.value }
                            }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={newTemplate.colors?.background || '#1a1a1a'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, background: e.target.value }
                            }))}
                            className="flex-1"
                            placeholder="#1a1a1a"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="surface">Superfície</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newTemplate.colors?.surface || '#2d2d2d'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, surface: e.target.value }
                            }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={newTemplate.colors?.surface || '#2d2d2d'}
                            onChange={(e) => setNewTemplate(prev => ({
                              ...prev,
                              colors: { ...prev.colors!, surface: e.target.value }
                            }))}
                            className="flex-1"
                            placeholder="#2d2d2d"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="structure" className="space-y-6">
                  <LayoutSelector
                    title="Estilo do Cabeçalho"
                    value={newTemplate.layout?.headerStyle || 'full-cover'}
                    options={HEADER_LAYOUTS}
                    onChange={(value) => setNewTemplate(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, headerStyle: value as any }
                    }))}
                  />
                  
                  <Separator />
                  
                  <LayoutSelector
                    title="Layout do Conteúdo"
                    value={newTemplate.layout?.contentLayout || 'single-column'}
                    options={CONTENT_LAYOUTS}
                    onChange={(value) => setNewTemplate(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, contentLayout: value as any }
                    }))}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <LayoutSelector
                      title="Estilo dos Botões"
                      value={newTemplate.layout?.buttonStyle || 'rounded'}
                      options={BUTTON_STYLES}
                      onChange={(value) => setNewTemplate(prev => ({
                        ...prev,
                        layout: { ...prev.layout!, buttonStyle: value as any }
                      }))}
                    />
                    
                    <LayoutSelector
                      title="Estilo dos Cartões"
                      value={newTemplate.layout?.cardStyle || 'elevated'}
                      options={CARD_STYLES}
                      onChange={(value) => setNewTemplate(prev => ({
                        ...prev,
                        layout: { ...prev.layout!, cardStyle: value as any }
                      }))}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="spacing" className="space-y-6">
                  <LayoutSelector
                    title="Espaçamento Geral"
                    value={newTemplate.layout?.spacing || 'normal'}
                    options={SPACING_OPTIONS}
                    onChange={(value) => setNewTemplate(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, spacing: value as any }
                    }))}
                  />
                </TabsContent>

                <TabsContent value="typography" className="space-y-6">
                  <LayoutSelector
                    title="Estilo Tipográfico"
                    value={newTemplate.layout?.typography || 'modern'}
                    options={TYPOGRAPHY_OPTIONS}
                    onChange={(value) => setNewTemplate(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, typography: value as any }
                    }))}
                  />
                </TabsContent>

                <TabsContent value="effects" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Animações</Label>
                          <p className="text-sm text-muted-foreground">Transições suaves</p>
                        </div>
                        <Switch
                          checked={newTemplate.effects?.animations || false}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            effects: { ...prev.effects!, animations: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Sombras</Label>
                          <p className="text-sm text-muted-foreground">Profundidade visual</p>
                        </div>
                        <Switch
                          checked={newTemplate.effects?.shadows || false}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            effects: { ...prev.effects!, shadows: checked }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Gradientes</Label>
                          <p className="text-sm text-muted-foreground">Cores em gradiente</p>
                        </div>
                        <Switch
                          checked={newTemplate.effects?.gradients || false}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            effects: { ...prev.effects!, gradients: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Desfoque</Label>
                          <p className="text-sm text-muted-foreground">Efeito glassmorphism</p>
                        </div>
                        <Switch
                          checked={newTemplate.effects?.blur || false}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({
                            ...prev,
                            effects: { ...prev.effects!, blur: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setNewTemplate(DEFAULT_CUSTOM_TEMPLATE);
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateTemplate} 
                  className="gap-2"
                  disabled={isLoading || !newTemplate.name || !newTemplate.description}
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Criando...' : 'Criar & Ativar Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Template Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Editar Template: {selectedTemplate.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Nome do Template</Label>
                  <Input
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={selectedTemplate.description}
                    onChange={(e) => setSelectedTemplate(prev => 
                      prev ? { ...prev, description: e.target.value } : null
                    )}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedTemplate.colors.primary}
                      onChange={(e) => setSelectedTemplate(prev => 
                        prev ? {
                          ...prev,
                          colors: { ...prev.colors, primary: e.target.value }
                        } : null
                      )}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={selectedTemplate.colors.primary}
                      onChange={(e) => setSelectedTemplate(prev => 
                        prev ? {
                          ...prev,
                          colors: { ...prev.colors, primary: e.target.value }
                        } : null
                      )}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    if (selectedTemplate) {
                      try {
                        await updateTemplate(selectedTemplate.id, selectedTemplate);
                        setSelectedTemplate(null);
                      } catch (error) {
                        // Erro já tratado pelo hook
                      }
                    }
                  }}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;