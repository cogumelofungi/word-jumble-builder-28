import { appDataSchema } from '@/schemas/appValidation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { ThemeConfig, THEME_PRESETS } from '@/types/theme';
import { getAppUrl } from '@/config/domains';
import { pdfValidationSchema, imageValidationSchema } from '@/schemas/appValidation';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface AppBuilderData {
  id?: string;
  appName: string;
  appDescription: string;
  appColor: string;
  customLink: string;
  customDomain: string;
  allowPdfDownload: boolean;
  template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  themeConfig?: ThemeConfig;
  appIcon?: UploadedFile;
  appCover?: UploadedFile;
  mainProduct?: UploadedFile;
  mainProductThumbnail?: UploadedFile;
  bonus1?: UploadedFile;
  bonus1Thumbnail?: UploadedFile;
  bonus2?: UploadedFile;
  bonus2Thumbnail?: UploadedFile;
  bonus3?: UploadedFile;
  bonus3Thumbnail?: UploadedFile;
  bonus4?: UploadedFile;
  bonus4Thumbnail?: UploadedFile;
  bonus5?: UploadedFile;
  bonus5Thumbnail?: UploadedFile;
  bonus6?: UploadedFile;
  bonus6Thumbnail?: UploadedFile;
  bonus7?: UploadedFile;
  bonus7Thumbnail?: UploadedFile;
  bonus8?: UploadedFile;
  bonus8Thumbnail?: UploadedFile;
  bonus9?: UploadedFile;
  bonus9Thumbnail?: UploadedFile;
  // Textos personalizáveis
  mainProductLabel: string;
  mainProductDescription: string;
  bonusesLabel: string;
  bonus1Label: string;
  bonus2Label: string;
  bonus3Label: string;
  bonus4Label: string;
  bonus5Label: string;
  bonus6Label: string;
  bonus7Label: string;
  bonus8Label: string;
  bonus9Label: string;
}

const defaultAppData: AppBuilderData = {
  appName: '',
  appDescription: '',
  appColor: '#4783F6',
  customLink: '',
  customDomain: '',
  allowPdfDownload: true,
  template: 'classic',
  themeConfig: THEME_PRESETS.classic,
  // Textos padrão
  mainProductLabel: 'PRODUTO PRINCIPAL',
  mainProductDescription: 'Disponível para download',
  bonusesLabel: 'BÔNUS EXCLUSIVOS',
  bonus1Label: 'Bônus 1',
  bonus2Label: 'Bônus 2',
  bonus3Label: 'Bônus 3',
  bonus4Label: 'Bônus 4',
  bonus5Label: 'Bônus 5',
  bonus6Label: 'Bônus 6',
  bonus7Label: 'Bônus 7',
  bonus8Label: 'Bônus 8',
  bonus9Label: 'Bônus 9',
};

export const useAppBuilder = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const getDefaultAppData = useCallback((): AppBuilderData => ({
    appName: '',
    appDescription: '',
    appColor: '#4783F6',
    customLink: '',
    customDomain: '',
    allowPdfDownload: true,
  template: 'classic',
  themeConfig: THEME_PRESETS.classic,
    // Textos padrão traduzidos
    mainProductLabel: t('phone.main.title'),
    mainProductDescription: t('phone.main.description'),
    bonusesLabel: t('phone.bonus.title'),
    bonus1Label: t('custom.bonus.name') + ' 1',
    bonus2Label: t('custom.bonus.name') + ' 2',
    bonus3Label: t('custom.bonus.name') + ' 3',
    bonus4Label: t('custom.bonus.name') + ' 4',
    bonus5Label: t('custom.bonus.name') + ' 5',
    bonus6Label: t('custom.bonus.name') + ' 6',
    bonus7Label: t('custom.bonus.name') + ' 7',
    bonus8Label: t('custom.bonus.name') + ' 8',
    bonus9Label: t('custom.bonus.name') + ' 9',
  }), [t]);

  const [appData, setAppData] = useState<AppBuilderData>(() => getDefaultAppData());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Update labels when language changes
  useEffect(() => {
    setAppData(prev => {
      // Only update if still using default values
      const newData = { ...prev };
      
      if (prev.mainProductLabel === 'PRODUTO PRINCIPAL' || prev.mainProductLabel === 'MAIN PRODUCT' || prev.mainProductLabel === 'PRODUCTO PRINCIPAL') {
        newData.mainProductLabel = t('phone.main.title');
      }
      
      if (prev.mainProductDescription === 'Disponível para download' || prev.mainProductDescription === 'Available for download' || prev.mainProductDescription === 'Disponible para descarga') {
        newData.mainProductDescription = t('phone.main.description');
      }
      
      if (prev.bonusesLabel === 'BÔNUS EXCLUSIVOS' || prev.bonusesLabel === 'EXCLUSIVE BONUSES' || prev.bonusesLabel === 'BONOS EXCLUSIVOS') {
        newData.bonusesLabel = t('phone.bonus.title');
      }

      // Update bonus labels if they match default pattern
      for (let i = 1; i <= 9; i++) {
        const key = `bonus${i}Label` as keyof AppBuilderData;
        const currentValue = prev[key] as string;
        
        if (currentValue === `Bônus ${i}` || currentValue === `Bonus ${i}` || currentValue === `Bono ${i}`) {
          (newData as any)[key] = t('custom.bonus.name') + ` ${i}`;
        }
      }
      
      return newData;
    });
  }, [t]);

  // Auto-save para rascunho
  const saveAsDraft = useCallback(async (data: AppBuilderData) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      setIsSaving(true);

      const draftData = {
        user_id: user.id,
        nome: data.appName,
        slug: data.customLink || `draft-${Date.now()}`, // Add slug field
        descricao: data.appDescription,
        cor: data.appColor,
        link_personalizado: data.customLink,
        allow_pdf_download: data.allowPdfDownload,
        template: data.template,
        icone_url: data.appIcon?.url,
        capa_url: data.appCover?.url,
        produto_principal_url: data.mainProduct?.url,
        bonus1_url: data.bonus1?.url,
        bonus2_url: data.bonus2?.url,
        bonus3_url: data.bonus3?.url,
        bonus4_url: data.bonus4?.url,
        bonus5_url: data.bonus5?.url,
        bonus6_url: data.bonus6?.url,
        bonus7_url: data.bonus7?.url,
        bonus8_url: data.bonus8?.url,
        bonus9_url: data.bonus9?.url,
        main_product_label: data.mainProductLabel,
        main_product_description: data.mainProductDescription,
        bonuses_label: data.bonusesLabel,
        bonus1_label: data.bonus1Label,
        bonus2_label: data.bonus2Label,
        bonus3_label: data.bonus3Label,
        bonus4_label: data.bonus4Label,
        bonus5_label: data.bonus5Label,
        bonus6_label: data.bonus6Label,
        bonus7_label: data.bonus7Label,
        bonus8_label: data.bonus8Label,
        bonus9_label: data.bonus9Label,
        status: 'draft' // Add status field for drafts
      };

      if (data.id) {
        const { error } = await supabase
          .from('apps')
          .update(draftData)
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { data: newDraft, error } = await supabase
          .from('apps')
          .insert(draftData)
          .select()
          .single();

        if (error) throw error;
        
        setAppData(prev => ({ ...prev, id: newDraft.id }));
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Upload de arquivo usando o novo serviço
  const uploadFile = useCallback(async (file: File, type: string, appId?: string): Promise<string> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuário não autenticado');

    // Se é upload de PDF de produto, usar o serviço específico
    if (file.type === 'application/pdf' && appId) {
      const { fileService } = await import('@/services/fileService');
      const result = await fileService.uploadProductPdf({
        appId,
        slot: type,
        file
      });
      return result.url;
    }

    // Para outros tipos de arquivo (ícones, capas), usar o bucket original
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('app-assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('app-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }, []);

  // Validar slug único com debounce
  const validateSlug = useCallback(async (slug: string): Promise<boolean> => {
    if (!slug.trim()) return true;
    
    const { data, error } = await supabase
      .from('apps')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Erro ao validar slug:', error);
      return false;
    }

    return !data; // true se slug disponível (não existe)
  }, []);

// Atualizar dados do app com validação
const updateAppData = useCallback((field: keyof AppBuilderData, value: any) => {
  setAppData(prev => {
    const newData = { ...prev, [field]: value };
    
    // Validar o campo específico
    try {
      const fieldSchema = appDataSchema.shape[field as keyof typeof appDataSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
    } catch (error: any) {
      // Mostrar erro de validação
      if (error.errors?.[0]) {
        toast({
          title: "Validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      // Mesmo com erro, atualiza o valor para permitir correção
    }
    
    return newData;
  });
}, [toast]);

  // Upload de arquivo e atualização
  const handleFileUpload = useCallback(async (
    field: keyof AppBuilderData,
    file: File,
    type: string
  ) => {
    try {
      setIsLoading(true);
      
// Validar APENAS PDF com Zod
try {
  pdfValidationSchema.parse({
    type: file.type,
    size: file.size,
    name: file.name,
  });
} catch (error: any) {
  if (error.errors?.[0]) {
    throw new Error(error.errors[0].message);
  }
  throw error;
}

      const appId = appData.id || `draft-${Date.now()}`;
      const url = await uploadFile(file, type, appId);
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        url,
        file
      };

      updateAppData(field, uploadedFile);

      toast({
        title: "Upload realizado com sucesso!",
        description: `${file.name} foi carregado.`,
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      
      let errorMessage = error.message || "Não foi possível fazer o upload do arquivo.";
      
      // Adicionar botão "Tentar novamente" para alguns erros específicos
      if (errorMessage.includes('Tentar novamente')) {
        // Toast já tem a mensagem adequada
      }
      
      toast({
        title: "Erro no upload", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [uploadFile, updateAppData, toast, appData.id]);

  // Reset dos dados
  const resetApp = useCallback(async () => {
    try {
      setAppData(getDefaultAppData());
      
      // Limpar rascunho do banco se existir
      if (appData.id) {
        const { error } = await supabase
          .from('apps')
          .delete()
          .eq('id', appData.id);

        if (error) throw error;
      }

      toast({
        title: "App resetado",
        description: "Todos os dados foram limpos.",
      });
    } catch (error) {
      console.error('Erro ao resetar:', error);
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível resetar o app.",
        variant: "destructive",
      });
    }
  }, [appData.id, toast, getDefaultAppData]);

  // Publicar app
  const publishApp = useCallback(async (): Promise<string | null> => {
    try {
      setIsPublishing(true);

      // Validar todos os dados antes de publicar
try {
  appDataSchema.parse({
    appName: appData.appName,
    appDescription: appData.appDescription,
    appColor: appData.appColor,
    customLink: appData.customLink,
    customDomain: appData.customDomain,
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
  });
} catch (error: any) {
  if (error.errors?.[0]) {
    throw new Error(error.errors[0].message);
  }
  throw new Error('Dados inválidos. Verifique os campos.');
}
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      // Validar campos obrigatórios
      if (!appData.appName.trim()) {
        throw new Error('Nome do app é obrigatório');
      }
      if (!appData.appColor) {
        throw new Error('Cor do app é obrigatória');
      }

      // Verificar limite de apps antes de publicar
      const { data: userStatus, error: userError } = await supabase
        .from('user_status')
        .select(`
          plans (
            name,
            app_limit
          )
        `)
        .eq('user_id', user.id)
        .single();

      const plan = userStatus?.plans || { name: 'Empresarial', app_limit: 10 };

      // Contar apps publicados do usuário
      const { data: existingApps, error: countError } = await supabase
        .from('apps')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'publicado');

      if (countError) throw countError;

      const currentAppsCount = existingApps?.length || 0;

      // Verificar se é uma republicação (por slug personalizado)
      let republicationApp = null;
      if (appData.customLink.trim()) {
        const { data } = await supabase
          .from('apps')
          .select('slug, user_id')
          .eq('slug', appData.customLink.trim())
          .eq('user_id', user.id)
          .maybeSingle();
        republicationApp = data;
      }

      // Se não é republicação e atingiu o limite, bloquear
      if (!republicationApp && currentAppsCount >= plan.app_limit) {
        throw new Error(`LIMIT_REACHED:${plan.name}:${currentAppsCount}:${plan.app_limit}`);
      }

      let finalSlug = '';
      
      if (republicationApp) {
        // Republicar mantendo o mesmo slug
        finalSlug = republicationApp.slug;
      } else {
        // Verificar se o slug personalizado está disponível
        if (appData.customLink.trim()) {
          const isSlugAvailable = await validateSlug(appData.customLink);
          if (!isSlugAvailable) {
            throw new Error('Este link já existe, escolha outro.');
          }
          finalSlug = appData.customLink.trim();
        } else {
          // Gerar slug único para novo app
          const { data: slugData, error: slugError } = await supabase
            .rpc('generate_unique_slug', {
              base_name: appData.appName
            });

          if (slugError) throw slugError;
          finalSlug = slugData as string;
        }
      }

      const appPublicData = {
        user_id: user.id,
        nome: appData.appName,
        descricao: appData.appDescription,
        slug: finalSlug,
        cor: appData.appColor,
        link_personalizado: appData.customLink,
        allow_pdf_download: appData.allowPdfDownload,
        template: appData.template,
        theme_config: JSON.stringify(appData.themeConfig),
        icone_url: appData.appIcon?.url,
        capa_url: appData.appCover?.url,
        produto_principal_url: appData.mainProduct?.url,
        bonus1_url: appData.bonus1?.url,
        bonus2_url: appData.bonus2?.url,
        bonus3_url: appData.bonus3?.url,
        bonus4_url: appData.bonus4?.url,
        bonus5_url: appData.bonus5?.url,
        bonus6_url: appData.bonus6?.url,
        bonus7_url: appData.bonus7?.url,
        bonus8_url: appData.bonus8?.url,
        bonus9_url: appData.bonus9?.url,
        main_product_label: appData.mainProductLabel,
        main_product_description: appData.mainProductDescription,
        bonuses_label: appData.bonusesLabel,
        bonus1_label: appData.bonus1Label,
        bonus2_label: appData.bonus2Label,
        bonus3_label: appData.bonus3Label,
        bonus4_label: appData.bonus4Label,
        bonus5_label: appData.bonus5Label,
        bonus6_label: appData.bonus6Label,
        bonus7_label: appData.bonus7Label,
        bonus8_label: appData.bonus8Label,
        bonus9_label: appData.bonus9Label,
        status: 'publicado'
      };

      if (republicationApp) {
        // Atualizar app existente
        const { error: updateError } = await supabase
          .from('apps')
          .update(appPublicData)
          .eq('user_id', user.id)
          .eq('slug', finalSlug);

        if (updateError) throw updateError;
      } else {
        // Inserir novo app
        const { error: insertError } = await supabase
          .from('apps')
          .insert(appPublicData);

        if (insertError) throw insertError;
      }

      // Limpar todos os rascunhos após publicação bem-sucedida
      await supabase
        .from('apps')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'draft');

      // Usar o domínio de produção para apps publicados
      const appUrl = getAppUrl(finalSlug);
      
      toast({
        title: "App publicado com sucesso!",
        description: `Seu app está disponível em: ${appUrl}`,
      });

      return appUrl;
    } catch (error: any) {
      console.error('Erro ao publicar:', error);
      
      let errorMessage = "Não foi possível publicar o app.";
      
      if (error.message?.includes('LIMIT_REACHED:')) {
        const [, planName, currentCount, maxCount] = error.message.split(':');
        errorMessage = `LIMIT_REACHED:${planName}:${currentCount}:${maxCount}`;
      } else if (error.message?.includes('duplicate key value violates unique constraint')) {
        errorMessage = "Este link já existe, escolha outro.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao publicar",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [appData, toast, validateSlug]);

  // Carregar rascunho existente
  const loadDraft = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data: draft, error } = await supabase
        .from('apps')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (draft) {
        const appRow = draft as any;
        setAppData({
          id: appRow.id,
          appName: appRow.nome,
          appDescription: appRow.descricao || 'Descrição do App',
          appColor: appRow.cor,
          customLink: appRow.link_personalizado || '',
          customDomain: '',
          allowPdfDownload: appRow.allow_pdf_download ?? true,
          template: appRow.template || 'classic',
          themeConfig: appRow.theme_config ? JSON.parse(appRow.theme_config) : THEME_PRESETS[appRow.template || 'classic'],
          mainProductLabel: appRow.main_product_label || 'PRODUTO PRINCIPAL',
          mainProductDescription: appRow.main_product_description || 'Disponível para download',
          bonusesLabel: appRow.bonuses_label || 'BÔNUS EXCLUSIVOS',
          bonus1Label: appRow.bonus1_label || 'Bônus 1',
          bonus2Label: appRow.bonus2_label || 'Bônus 2',
          bonus3Label: appRow.bonus3_label || 'Bônus 3',
          bonus4Label: appRow.bonus4_label || 'Bônus 4',
          bonus5Label: appRow.bonus5_label || 'Bônus 5',
          bonus6Label: appRow.bonus6_label || 'Bônus 6',
          bonus7Label: appRow.bonus7_label || 'Bônus 7',
          bonus8Label: appRow.bonus8_label || 'Bônus 8',
          bonus9Label: appRow.bonus9_label || 'Bônus 9',
          appIcon: draft.icone_url ? {
            id: 'icon',
            name: 'icon',
            url: draft.icone_url
          } : undefined,
          appCover: draft.capa_url ? {
            id: 'cover',
            name: 'cover',
            url: draft.capa_url
          } : undefined,
          mainProduct: draft.produto_principal_url ? {
            id: 'main',
            name: 'main',
            url: draft.produto_principal_url
          } : undefined,
          // As thumbnails ficam apenas em memória para pré-visualização
          mainProductThumbnail: undefined,
          bonus1: draft.bonus1_url ? {
            id: 'bonus1',
            name: 'bonus1',
            url: draft.bonus1_url
          } : undefined,
          bonus1Thumbnail: undefined,
          bonus2: draft.bonus2_url ? {
            id: 'bonus2',
            name: 'bonus2',
            url: draft.bonus2_url
          } : undefined,
          bonus2Thumbnail: undefined,
          bonus3: draft.bonus3_url ? {
            id: 'bonus3',
            name: 'bonus3',
            url: draft.bonus3_url
          } : undefined,
          bonus3Thumbnail: undefined,
          bonus4: draft.bonus4_url ? {
            id: 'bonus4',
            name: 'bonus4',
            url: draft.bonus4_url
          } : undefined,
          bonus4Thumbnail: undefined,
          bonus5: (draft as any).bonus5_url ? {
            id: 'bonus5',
            name: 'bonus5',
            url: (draft as any).bonus5_url
          } : undefined,
          bonus5Thumbnail: undefined,
          bonus6: (draft as any).bonus6_url ? {
            id: 'bonus6',
            name: 'bonus6',
            url: (draft as any).bonus6_url
          } : undefined,
          bonus6Thumbnail: undefined,
          bonus7: (draft as any).bonus7_url ? {
            id: 'bonus7',
            name: 'bonus7',
            url: (draft as any).bonus7_url
          } : undefined,
          bonus7Thumbnail: undefined,
          bonus8: (draft as any).bonus8_url ? {
            id: 'bonus8',
            name: 'bonus8',
            url: (draft as any).bonus8_url
          } : undefined,
          bonus8Thumbnail: undefined,
          bonus9: (draft as any).bonus9_url ? {
            id: 'bonus9',
            name: 'bonus9',
            url: (draft as any).bonus9_url
          } : undefined,
          bonus9Thumbnail: undefined,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remover carregamento automático de rascunho - usuário deve iniciar do zero

  // Atualizar template e tema juntos
  const updateTemplate = useCallback((template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal') => {
    const themeConfig = THEME_PRESETS[template];
    if (themeConfig) {
      // Manter a cor primária atual se existir
      const updatedThemeConfig = {
        ...themeConfig,
        colors: {
          ...themeConfig.colors,
          primary: appData.appColor || themeConfig.colors.primary
        }
      };
      
      setAppData(prev => ({
        ...prev,
        template,
        themeConfig: updatedThemeConfig
      }));
      
      // Não fazer auto-save automático
    }
  }, [saveAsDraft]); // Removido appData da dependência para evitar loop

  return {
    appData,
    isLoading,
    isSaving,
    isPublishing,
    updateAppData,
    handleFileUpload,
    resetApp,
    publishApp,
    loadDraft,
    validateSlug,
    updateTemplate,
    saveAsDraft // Expor função para salvamento manual
  };
};
