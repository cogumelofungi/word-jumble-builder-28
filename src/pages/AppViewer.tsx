import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Smartphone, Eye, Download, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeRenderer } from "@/components/ThemeRenderer";
import { PdfViewer } from "@/components/PdfViewer";
import DeactivatedApp from "@/components/DeactivatedApp";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { 
  detectDevice, 
  isPWAInstalled, 
  markPWAAsInstalled, 
  logPWADebugInfo 
} from "@/utils/pwaDetection";

interface PublishedApp {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  slug: string;
  allow_pdf_download?: boolean;
  template?: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  icone_url?: string;
  capa_url?: string;
  produto_principal_url?: string;
  bonus1_url?: string;
  bonus2_url?: string;
  bonus3_url?: string;
  bonus4_url?: string;
  bonus5_url?: string;
  bonus6_url?: string;
  bonus7_url?: string;
  bonus8_url?: string;
  bonus9_url?: string;
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_label?: string;
  bonus2_label?: string;
  bonus3_label?: string;
  bonus4_label?: string;
  bonus5_label?: string;
  bonus6_label?: string;
  bonus7_label?: string;
  bonus8_label?: string;
  bonus9_label?: string;
  bonus1_thumbnail?: string;
  bonus2_thumbnail?: string;
  bonus3_thumbnail?: string;
  bonus4_thumbnail?: string;
  mainProductThumbnail?: string;
  theme_config?: any;
}

const AppViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [app, setApp] = useState<PublishedApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [userPlanLimits, setUserPlanLimits] = useState<number>(10);
  const [isUserActive, setIsUserActive] = useState<boolean | null>(null);
  const [deviceInfo] = useState(() => detectDevice());

  useEffect(() => {
    const loadApp = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        
        // Adicionar cache-busting com timestamp para evitar problemas de cache
        const cacheKey = `app_${slug}_${Date.now()}`;
        
        console.log(`[AppViewer] Carregando app com slug: ${slug}`);
        
        // Primeiro, buscar app publicado
        const { data: appData, error } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'publicado')
          .maybeSingle();

        console.log(`[AppViewer] Resposta da busca do app:`, { appData, error });

        if (error) {
          console.error('Error loading app:', error);
          toast({
            title: "Erro",
            description: `Erro ao carregar o aplicativo: ${error.message}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!appData) {
          console.warn(`[AppViewer] App não encontrado para slug: ${slug}`);
          
          toast({
            title: "App não encontrado",
            description: "Este app não existe ou foi removido. Verifique se o link está correto.",
            variant: "destructive",
          });
          setApp(null);
          setIsLoading(false);
          return;
        }

        // Depois, verificar status do usuário proprietário
        const { data: userStatus, error: userError } = await supabase
          .from('user_status')
          .select('is_active')
          .eq('user_id', appData.user_id)
          .maybeSingle();

        if (userError) {
          console.error('Error checking user status:', userError);
          // Se não conseguir verificar o status, assume que está ativo
          setIsUserActive(true);
        } else {
          const userActive = userStatus?.is_active ?? true;
          setIsUserActive(userActive);
          console.log(`[AppViewer] Status do usuário: ${userActive}`);
        }

        console.log(`[AppViewer] App carregado com sucesso:`, appData);

        // Type-safe template validation with fallback
        const validatedApp: PublishedApp = {
          ...appData,
          template: (['classic', 'corporate', 'showcase', 'modern', 'minimal'].includes(appData.template)) 
            ? appData.template as 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal'
            : 'classic' as const,
          // Garantir que campos críticos não sejam undefined
          nome: appData.nome || 'App sem nome',
          cor: appData.cor || '#4783F6',
          slug: appData.slug || slug
        };

        setApp(validatedApp);
        
        // Gerar manifest.json dinâmico
        generateManifest(validatedApp);
        
        // Registrar service worker
        registerServiceWorker();
        
        // Setup PWA install prompt - agora inicializado no mount

        console.log(`[AppViewer] App configurado com sucesso para visualização`);
        
      } catch (error) {
        console.error('Erro ao carregar app:', error);
        
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar o aplicativo. Tente recarregar a página.",
          variant: "destructive",
        });
        
        setApp(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadApp();
  }, [slug, toast]); // Adicionado toast como dependência

  // Inicializar listeners do PWA o mais cedo possível
  useEffect(() => {
    if (app) {
      setupPWAInstallPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  const setupPWAInstallPrompt = () => {
    const currentAppId = window.location.pathname;
    
    // Log de debug completo
    logPWADebugInfo(deviceInfo, currentAppId);
    
    // Verificar se já está instalado
    const installed = isPWAInstalled(currentAppId);
    setIsAppInstalled(installed);
    
    if (installed) {
      console.log('[PWA] App já está instalado');
      setShowInstallBanner(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt evento capturado');
      e.preventDefault();
      setDeferredPrompt(e);
      
      if (!isPWAInstalled(currentAppId)) {
        setShowInstallBanner(true);
        console.log('[PWA] Banner de instalação habilitado');
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App instalado com sucesso');
      setIsAppInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      
      markPWAAsInstalled(currentAppId);
      
      // Definir rota padrão para abrir o PWA sempre no app publicado
      try {
        if (app?.slug) {
          localStorage.setItem('pwaDefaultRoute', `/app/${app.slug}/`);
        }
      } catch (e) {
        console.warn('[PWA] Não foi possível salvar pwaDefaultRoute', e);
      }
      
      toast({
        title: "✅ App Instalado!",
        description: "O aplicativo foi adicionado à sua tela inicial.",
      });
    };

    // Listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listener para mudanças no display mode
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      if (standaloneMediaQuery.matches) {
        handleAppInstalled();
      }
    };
    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);

    // Mostrar banner após delay em dispositivos compatíveis
    // Opera e outros navegadores Android mostram banner mesmo sem beforeinstallprompt capturado
    if (deviceInfo.supportsInstallPrompt || (deviceInfo.isIOS && deviceInfo.isSafari) || deviceInfo.isFirefox) {
      const bannerTimeout = setTimeout(() => {
        if (!isPWAInstalled(currentAppId)) {
          console.log('[PWA] Mostrando banner em dispositivo compatível');
          setShowInstallBanner(true);
        }
      }, deviceInfo.isOpera ? 3000 : 2000); // 3 segundos para Opera, 2 segundos para outros

      return () => {
        clearTimeout(bannerTimeout);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  };

  const handleInstallApp = async () => {
    console.log(`[PWA] Tentativa de instalação iniciada. Prompt disponível: ${!!deferredPrompt}`);
    
    if (!deferredPrompt) {
      console.warn('[PWA] Prompt não capturado - verifique se o app atende os critérios de instalabilidade');
      toast({
        title: "Erro na instalação",
        description: "Use o menu do navegador (⋮) e selecione 'Adicionar à tela inicial'",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('[PWA] Executando prompt de instalação');
      await deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Escolha do usuário:', outcome);
      
      if (outcome === 'accepted') {
        const currentAppId = window.location.pathname;
        markPWAAsInstalled(currentAppId);
        
        setShowInstallBanner(false);
        setIsAppInstalled(true);
        
        toast({
          title: "✅ Instalado!",
          description: "App adicionado à tela inicial com sucesso.",
        });
      } else {
        toast({
          title: "Instalação cancelada",
          description: "Você pode instalar depois usando o menu do navegador.",
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Erro ao instalar:', error);
      toast({
        title: "Erro na instalação",
        description: "Tente novamente ou use o menu do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    
    // Reexibir banner após 24 horas
    try {
      const dismissTime = Date.now();
      localStorage.setItem('pwaBannerDismissed', dismissTime.toString());
      
      setTimeout(() => {
        const currentAppId = window.location.pathname;
        if (!isPWAInstalled(currentAppId)) {
          setShowInstallBanner(true);
        }
      }, 24 * 60 * 60 * 1000); // 24 horas
    } catch (e) {
      console.warn('[PWA] Erro ao salvar dismissTime:', e);
    }
  };

  const generateManifest = (appData: PublishedApp) => {
    const appPath = `/app/${appData.slug}`;
    
    const manifest = {
      id: appPath,
      name: appData.nome,
      short_name: appData.nome.length > 12 ? appData.nome.substring(0, 12) : appData.nome,
      description: appData.descricao || `${appData.nome} - Progressive Web App`,
      start_url: `${appPath}/`,
      display: "standalone",
      background_color: appData.cor,
      theme_color: appData.cor,
      orientation: "portrait",
      scope: `${appPath}/`,
      categories: ["productivity", "utilities"],
      icons: [
        {
          src: appData.icone_url || "/placeholder.svg",
          sizes: "192x192",
          type: appData.icone_url ? "image/png" : "image/svg+xml",
          purpose: "any"
        },
        {
          src: appData.icone_url || "/placeholder.svg",
          sizes: "192x192",
          type: appData.icone_url ? "image/png" : "image/svg+xml",
          purpose: "maskable"
        },
        {
          src: appData.icone_url || "/placeholder.svg", 
          sizes: "512x512",
          type: appData.icone_url ? "image/png" : "image/svg+xml",
          purpose: "any"
        },
        {
          src: appData.icone_url || "/placeholder.svg", 
          sizes: "512x512",
          type: appData.icone_url ? "image/png" : "image/svg+xml",
          purpose: "maskable"
        }
      ]
    };

    // Criar blob do manifest e registrar
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    // Atualizar/criar link do manifest
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', manifestURL);

    console.log('[PWA] Manifest gerado:', manifest);

    // Persistir rota padrão do PWA
    try {
      localStorage.setItem('pwaDefaultRoute', `${appPath}/`);
    } catch (e) {
      console.warn('[PWA] Erro ao salvar pwaDefaultRoute', e);
    }

    // Atualizar meta tags
    updateMetaTags(appData);
  };

  const updateMetaTags = (appData: PublishedApp) => {
    // Theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', appData.cor);

    // Apple mobile web app capable
    let appleMobileWebAppCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebAppCapable) {
      appleMobileWebAppCapable = document.createElement('meta');
      appleMobileWebAppCapable.setAttribute('name', 'apple-mobile-web-app-capable');
      document.head.appendChild(appleMobileWebAppCapable);
    }
    appleMobileWebAppCapable.setAttribute('content', 'yes');

    // Apple mobile web app status bar style
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleStatusBar);
    }
    appleStatusBar.setAttribute('content', 'black-translucent');

    // Apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.setAttribute('href', appData.icone_url || '/placeholder.svg');

    // Title
    document.title = appData.nome;

    console.log('[PWA] Meta tags atualizadas');
  };

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        // Manter apenas o service worker do app
        registrations.forEach(registration => {
          if (!registration.scope.includes('/app/')) {
            registration.unregister();
            console.log('[PWA] Service worker removido:', registration.scope);
          }
        });
      });
      
      // Registrar service worker específico para apps publicados
      navigator.serviceWorker.register('/sw-app.js', {
        scope: '/app/'
      }).then(registration => {
        console.log('[PWA] Service Worker registrado com sucesso');
        console.log('[PWA] Scope:', registration.scope);
        
        // Verificar atualizações
        registration.update();
        
        // Listener para atualizações
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] Atualização de Service Worker encontrada');
        });
      }).catch(error => {
        console.error('[PWA] Falha ao registrar Service Worker:', error);
      });
    }
  };

  const handleViewPdf = (url: string, title: string) => {
    setPdfUrl(url);
    setPdfTitle(title);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download iniciado",
        description: `${filename} está sendo baixado.`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
    }
  };

  // Mapear dados para o formato esperado pelo ThemeRenderer
  const mapAppDataForRenderer = (app: PublishedApp) => {
    return {
      nome: app.nome,
      descricao: app.descricao,
      cor: app.cor,
      icone_url: app.icone_url,
      capa_url: app.capa_url,
      produto_principal_url: app.produto_principal_url,
      main_product_label: app.main_product_label,
      main_product_description: app.main_product_description,
      bonuses_label: app.bonuses_label,
      bonus1_url: app.bonus1_url,
      bonus1_label: app.bonus1_label,
      bonus1_thumbnail: null, // Campo não existe na tabela
      bonus2_url: app.bonus2_url,
      bonus2_label: app.bonus2_label,
      bonus2_thumbnail: null, // Campo não existe na tabela
      bonus3_url: app.bonus3_url,
      bonus3_label: app.bonus3_label,
      bonus3_thumbnail: null, // Campo não existe na tabela
      bonus4_url: app.bonus4_url,
      bonus4_label: app.bonus4_label,
      bonus4_thumbnail: null, // Campo não existe na tabela
      bonus5_url: app.bonus5_url,
      bonus5_label: app.bonus5_label,
      bonus6_url: app.bonus6_url,
      bonus6_label: app.bonus6_label,
      bonus7_url: app.bonus7_url,
      bonus7_label: app.bonus7_label,
      bonus8_url: app.bonus8_url,
      bonus8_label: app.bonus8_label,
      bonus9_url: app.bonus9_url,
      bonus9_label: app.bonus9_label,
      mainProductThumbnail: null, // Campo não existe na tabela
      allow_pdf_download: app.allow_pdf_download
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se o usuário proprietário não está ativo, mostrar tela de app desativado
  if (isUserActive === false && app) {
    return (
      <DeactivatedApp 
        appName={app.nome}
        appColor={app.cor}
      />
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-app-text mb-2">App não encontrado</h1>
          <p className="text-app-muted mb-4">Este app não existe ou foi removido.</p>
          <p className="text-sm text-app-muted mb-6">
            Verifique se o link está correto ou entre em contato com quem compartilhou este app.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeRenderer
        template={app.template || 'classic'}
        appData={mapAppDataForRenderer(app)}
        userPlanLimits={userPlanLimits}
        onViewPdf={handleViewPdf}
        onDownload={handleDownload}
        isPreview={false}
      />

      {/* PWA Install Banner */}
      {showInstallBanner && !isAppInstalled && (
        <PWAInstallBanner
          onInstall={handleInstallApp}
          onDismiss={handleDismissBanner}
          hasPrompt={!!deferredPrompt}
        />
      )}

      {/* App Installed Indicator */}
      {isAppInstalled && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div 
            style={{ backgroundColor: app.cor }}
            className="px-4 py-2 rounded-lg shadow-lg text-white text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            App Instalado
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {pdfUrl && (
        <PdfViewer
          pdfUrl={pdfUrl}
          title={pdfTitle}
          isOpen={!!pdfUrl}
          onClose={() => setPdfUrl(null)}
          allowDownload={app.allow_pdf_download !== false}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

export default AppViewer;
