import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { Save, Mail, Zap, RefreshCw, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { activeCampaignService } from '@/services/activeCampaignService';
import { supabase } from '@/integrations/supabase/client';

interface ActiveCampaignList {
  id: string;
  name: string;
}

interface ActiveCampaignTag {
  id: string;
  tag: string;
}

interface ActiveCampaignAutomation {
  id: string;
  name: string;
  type: 'automation' | 'tag' | 'campaign';
}

const IntegrationsPanel = () => {
  const { t } = useLanguage();
  const [activeCampaignData, setActiveCampaignData] = useState({
    apiUrl: '',
    apiKey: '',
    selectedListId: '',
    selectedTags: [] as string[]
  });

  const [acLists, setAcLists] = useState<ActiveCampaignList[]>([]);
  const [acTags, setAcTags] = useState<ActiveCampaignTag[]>([]);
  const [acAutomations, setAcAutomations] = useState<ActiveCampaignAutomation[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Purchase Events Configuration
  const [purchaseEvents, setPurchaseEvents] = useState({
    purchase: '',
    refund: '',
    subscriptionCancel: ''
  });

  const [makeData, setMakeData] = useState({
    webhookUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  
  // Carregar configurações salvas do admin_settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .in('key', ['activecampaign_config', 'make_config']);

        if (error) throw error;

        if (data) {
          // Carregar ActiveCampaign
          const acSetting = data.find(s => s.key === 'activecampaign_config');
          if (acSetting?.value) {
            try {
              const config = JSON.parse(acSetting.value);
              setActiveCampaignData({
                apiUrl: config.api_url || '',
                apiKey: config.api_key || '',
                selectedListId: config.list_id || '',
                selectedTags: config.tags || []
              });
              
              if (config.purchase_events) {
                setPurchaseEvents(config.purchase_events);
              }

              // Se tem credenciais, testar conexão
              if (config.api_url && config.api_key) {
                setConnectionStatus('idle');
              }
            } catch (e) {
              console.error('Erro ao fazer parse do ActiveCampaign config:', e);
            }
          }

          // Carregar Make
          const makeSetting = data.find(s => s.key === 'make_config');
          if (makeSetting?.value) {
            try {
              const config = JSON.parse(makeSetting.value);
              setMakeData({
                webhookUrl: config.webhook_url || ''
              });
            } catch (e) {
              console.error('Erro ao fazer parse do Make config:', e);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar as configurações salvas",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, []);


  // Test ActiveCampaign connection and load data
  const testActiveCampaignConnection = async () => {
    if (!activeCampaignData.apiUrl || !activeCampaignData.apiKey) {
      toast({
        title: "Dados incompletos",
        description: "Preencha a URL da API e a chave da API primeiro",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('testing');
    setConnectionError(null);
    setIsUsingDemoData(false);
    
    try {
      // First test the connection
      const testResult = await activeCampaignService.testConnection({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      if (testResult.error) {
        throw new Error(testResult.error || 'Connection test failed');
      }

      // If connection test passed, load real data
      await Promise.all([
        loadActiveCampaignLists(),
        loadActiveCampaignTags(),
        loadActiveCampaignAutomations()
      ]);
      
      setConnectionStatus('success');
      toast({
        title: "Conexão estabelecida ✅",
        description: isUsingDemoData 
          ? "Usando dados de demonstração (API indisponível)" 
          : "Dados reais carregados da sua conta ActiveCampaign",
      });
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error.message);
      toast({
        title: "Erro de conexão",
        description: error.message || "Verifique suas credenciais do ActiveCampaign",
        variant: "destructive",
      });
    }
  };

  const loadActiveCampaignLists = async () => {
    setIsLoadingLists(true);
    try {
      const lists = await activeCampaignService.getLists({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      setAcLists(lists);
      
      // Check if it's demo data (demo items have "demo" in their ID)
      const isDemoData = lists.some(list => list.id.includes('demo'));
      setIsUsingDemoData(isDemoData);
    } catch (error) {
      // Fallback to demo data with clear indication
      setAcLists([
        { id: 'demo-1', name: '📋 Newsletter Subscribers (DEMO)' },
        { id: 'demo-2', name: '⭐ VIP Customers (DEMO)' },
        { id: 'demo-3', name: '🔄 Trial Users (DEMO)' },
        { id: 'demo-4', name: '🎯 Prospects (DEMO)' }
      ]);
      setIsUsingDemoData(true);
      console.log('Using demo data for lists:', error.message);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const loadActiveCampaignTags = async () => {
    setIsLoadingTags(true);
    try {
      const tags = await activeCampaignService.getTags({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      setAcTags(tags);
      
      // Check if it's demo data (demo items have "demo" in their ID)
      const isDemoData = tags.some(tag => tag.id.includes('demo'));
      setIsUsingDemoData(isDemoData);
    } catch (error) {
      // Fallback to demo data with clear indication
      setAcTags([
        { id: 'demo-1', tag: '👤 cliente (DEMO)' },
        { id: 'demo-2', tag: '🎯 prospect (DEMO)' },
        { id: 'demo-3', tag: '📧 lead (DEMO)' },
        { id: 'demo-4', tag: '⭐ vip (DEMO)' },
        { id: 'demo-5', tag: '🔄 trial (DEMO)' },
        { id: 'demo-6', tag: '📰 newsletter (DEMO)' }
      ]);
      setIsUsingDemoData(true);
      console.log('Using demo data for tags:', error.message);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const loadActiveCampaignAutomations = async () => {
    setIsLoadingAutomations(true);
    try {
      const automations = await activeCampaignService.getAutomations({
        apiUrl: activeCampaignData.apiUrl,
        apiKey: activeCampaignData.apiKey
      });
      
      setAcAutomations(automations);
      
      // Check if it's demo data (demo items have "demo" in their ID)
      const isDemoData = automations.some(automation => automation.id.includes('demo'));
      setIsUsingDemoData(isDemoData);
    } catch (error) {
      // Fallback to demo data with clear indication
      setAcAutomations([
        { id: 'demo-auto-1', name: '🎉 Boas-vindas para novos clientes (DEMO)', type: 'automation' },
        { id: 'demo-auto-2', name: '📦 Sequência pós-compra (DEMO)', type: 'automation' },
        { id: 'demo-auto-3', name: '🔄 Reativação de clientes inativos (DEMO)', type: 'automation' },
        { id: 'demo-tag-1', name: '⭐ Cliente VIP (DEMO)', type: 'tag' },
        { id: 'demo-tag-2', name: '🔁 Comprador recorrente (DEMO)', type: 'tag' },
        { id: 'demo-camp-1', name: '📰 Newsletter mensal (DEMO)', type: 'campaign' },
        { id: 'demo-camp-2', name: '🎁 Ofertas especiais (DEMO)', type: 'campaign' }
      ]);
      setIsUsingDemoData(true);
      console.log('Using demo data for automations:', error.message);
    } finally {
      setIsLoadingAutomations(false);
    }
  };

  // Auto-load data when API credentials change
  useEffect(() => {
    if (activeCampaignData.apiUrl && activeCampaignData.apiKey && connectionStatus === 'idle') {
      const timeoutId = setTimeout(() => {
        testActiveCampaignConnection();
      }, 1000); // Debounce API calls

      return () => clearTimeout(timeoutId);
    }
  }, [activeCampaignData.apiUrl, activeCampaignData.apiKey]);

  const handleTagSelection = (tagId: string) => {
    setActiveCampaignData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Preparar config do ActiveCampaign
      const acConfig = {
        api_url: activeCampaignData.apiUrl,
        api_key: activeCampaignData.apiKey,
        list_id: activeCampaignData.selectedListId,
        tags: activeCampaignData.selectedTags,
        purchase_events: purchaseEvents
      };

      // Salvar ActiveCampaign no admin_settings
      const { error: acError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'activecampaign_config',
          value: JSON.stringify(acConfig)
        }, {
          onConflict: 'key'
        });

      if (acError) throw acError;

      // Preparar config do Make
      const makeConfig = {
        webhook_url: makeData.webhookUrl
      };

      // Salvar Make no admin_settings
      const { error: makeError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'make_config',
          value: JSON.stringify(makeConfig)
        }, {
          onConflict: 'key'
        });

      if (makeError) throw makeError;

      toast({
        title: "Configurações salvas",
        description: "As integrações foram atualizadas com sucesso",
      });

    } catch (error) {
      console.error('Erro ao salvar integrações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-app-surface border-app-border p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('integrations.title')}</h2>
            <p className="text-sm text-app-muted">{t('integrations.subtitle')}</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-neon w-full sm:w-auto"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? t('integrations.saving') : t('integrations.save')}
          </Button>
        </div>

        <div className="space-y-8">
          {/* ActiveCampaign */}
          <Card className="bg-app-surface-hover border-app-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('integrations.activecampaign.title')}</h3>
                  <p className="text-sm text-app-muted">{t('integrations.activecampaign.subtitle')}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  {getConnectionStatusIcon()}
                  {isUsingDemoData && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      DEMO
                    </div>
                  )}
                </div>
                <Button
                  onClick={testActiveCampaignConnection}
                  variant="outline"
                  size="sm"
                  disabled={connectionStatus === 'testing' || !activeCampaignData.apiUrl || !activeCampaignData.apiKey}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            </div>

            {/* Connection Status Message */}
            {connectionError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Erro de Conexão</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{connectionError}</p>
                  </div>
                </div>
              </div>
            )}

            {isUsingDemoData && connectionStatus === 'success' && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Dados de Demonstração</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Não foi possível conectar com a API do ActiveCampaign. Os dados exibidos são fictícios para demonstração.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac-api-url">{t('integrations.activecampaign.api_url')}</Label>
                  <Input
                    id="ac-api-url"
                    placeholder={t('integrations.activecampaign.api_url.placeholder')}
                    value={activeCampaignData.apiUrl}
                    onChange={(e) => {
                      setActiveCampaignData(prev => ({ ...prev, apiUrl: e.target.value }));
                      setConnectionStatus('idle');
                    }}
                    className="bg-app-surface border-app-border"
                  />
                </div>
                <div>
                  <Label htmlFor="ac-api-key">{t('integrations.activecampaign.api_key')}</Label>
                  <Input
                    id="ac-api-key"
                    type="password"
                    placeholder={t('integrations.activecampaign.api_key.placeholder')}
                    value={activeCampaignData.apiKey}
                    onChange={(e) => {
                      setActiveCampaignData(prev => ({ ...prev, apiKey: e.target.value }));
                      setConnectionStatus('idle');
                    }}
                    className="bg-app-surface border-app-border"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac-lists">Lista</Label>
                  <Select 
                    value={activeCampaignData.selectedListId} 
                    onValueChange={(value) => setActiveCampaignData(prev => ({ ...prev, selectedListId: value }))}
                    disabled={isLoadingLists || acLists.length === 0}
                  >
                    <SelectTrigger className="bg-app-surface border-app-border">
                      <SelectValue placeholder={
                        isLoadingLists 
                          ? "Carregando listas..." 
                          : acLists.length === 0 
                            ? "Configure a API primeiro" 
                            : "Selecione uma lista"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                      {acLists.map((list) => (
                        <SelectItem 
                          key={list.id} 
                          value={list.id}
                          className="hover:bg-app-surface-hover"
                        >
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingLists && (
                    <p className="text-xs text-app-muted mt-1 flex items-center">
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      Carregando listas...
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ac-tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="max-h-32 overflow-y-auto border border-app-border rounded-md bg-app-surface p-2">
                      {isLoadingTags ? (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-app-muted">Carregando tags...</span>
                        </div>
                      ) : acTags.length === 0 ? (
                        <p className="text-sm text-app-muted text-center py-4">
                          Configure a API primeiro
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {acTags.map((tag) => (
                            <label
                              key={tag.id}
                              className="flex items-center space-x-2 p-1 hover:bg-app-surface-hover rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={activeCampaignData.selectedTags.includes(tag.id)}
                                onChange={() => handleTagSelection(tag.id)}
                                className="rounded border-app-border"
                              />
                              <span className="text-sm text-foreground">{tag.tag}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {activeCampaignData.selectedTags.length > 0 && (
                      <p className="text-xs text-app-muted">
                        {activeCampaignData.selectedTags.length} tag(s) selecionada(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Events Section */}
            {connectionStatus === 'success' && (
              <Card className="bg-app-surface border-app-border p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Automação de Eventos de Compra</h4>
                    <p className="text-sm text-app-muted">
                      Conecte suas vendas com o ActiveCampaign. Configure quais eventos serão enviados automaticamente para sua conta ActiveCampaign.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Purchase Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Compra Efetuada</h5>
                      <p className="text-sm text-app-muted">Disparado quando uma compra é realizada</p>
                    </div>
                    <div>
                      <Select 
                        value={purchaseEvents.purchase} 
                        onValueChange={(value) => setPurchaseEvents(prev => ({ ...prev, purchase: value }))}
                        disabled={isLoadingAutomations}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder={
                            isLoadingAutomations 
                              ? "Carregando automações..." 
                              : "Selecione uma automação"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          {acAutomations.map((automation) => (
                            <SelectItem 
                              key={automation.id} 
                              value={automation.id}
                              className="hover:bg-app-surface-hover"
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  automation.type === 'automation' ? 'bg-blue-100 text-blue-800' :
                                  automation.type === 'tag' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {automation.type}
                                </span>
                                <span>{automation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Refund Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Reembolso</h5>
                      <p className="text-sm text-app-muted">Disparado quando um reembolso é processado</p>
                    </div>
                    <div>
                      <Select 
                        value={purchaseEvents.refund} 
                        onValueChange={(value) => setPurchaseEvents(prev => ({ ...prev, refund: value }))}
                        disabled={isLoadingAutomations}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder={
                            isLoadingAutomations 
                              ? "Carregando automações..." 
                              : "Selecione uma automação"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          {acAutomations.map((automation) => (
                            <SelectItem 
                              key={automation.id} 
                              value={automation.id}
                              className="hover:bg-app-surface-hover"
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  automation.type === 'automation' ? 'bg-blue-100 text-blue-800' :
                                  automation.type === 'tag' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {automation.type}
                                </span>
                                <span>{automation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subscription Cancel Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-app-border rounded-lg bg-app-surface-hover">
                    <div>
                      <h5 className="font-medium text-foreground">Cancelamento de Assinatura</h5>
                      <p className="text-sm text-app-muted">Disparado quando uma assinatura é cancelada</p>
                    </div>
                    <div>
                      <Select 
                        value={purchaseEvents.subscriptionCancel} 
                        onValueChange={(value) => setPurchaseEvents(prev => ({ ...prev, subscriptionCancel: value }))}
                        disabled={isLoadingAutomations}
                      >
                        <SelectTrigger className="bg-app-surface border-app-border">
                          <SelectValue placeholder={
                            isLoadingAutomations 
                              ? "Carregando automações..." 
                              : "Selecione uma automação"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-app-surface border-app-border max-h-48 overflow-y-auto z-50">
                          {acAutomations.map((automation) => (
                            <SelectItem 
                              key={automation.id} 
                              value={automation.id}
                              className="hover:bg-app-surface-hover"
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  automation.type === 'automation' ? 'bg-blue-100 text-blue-800' :
                                  automation.type === 'tag' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {automation.type}
                                </span>
                                <span>{automation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Purchase Events Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => {
                        // Mock save for purchase events
                        toast({
                          title: "Eventos de compra salvos",
                          description: "Configurações de automação atualizadas com sucesso",
                        });
                        // Here you would save to localStorage or send to backend
                        localStorage.setItem('activecampaign_purchase_events', JSON.stringify(purchaseEvents));
                      }}
                      variant="outline"
                      className="border-app-border hover:bg-app-surface-hover"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </Card>

          {/* Make */}
          <Card className="bg-app-surface-hover border-app-border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('integrations.make.title')}</h3>
                <p className="text-sm text-app-muted">{t('integrations.make.subtitle')}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="make-webhook">{t('integrations.make.webhook_url')}</Label>
              <Input
                id="make-webhook"
                placeholder={t('integrations.make.webhook_url.placeholder')}
                value={makeData.webhookUrl}
                onChange={(e) => setMakeData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                className="bg-app-surface border-app-border"
              />
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationsPanel;
