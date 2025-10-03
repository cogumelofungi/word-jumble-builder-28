/**
 * Utilitários para detecção de dispositivos e capacidades PWA
 */

export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isSamsung: boolean;
  isBrave: boolean;
  isStandalone: boolean;
  supportsInstallPrompt: boolean;
  browserName: string;
  osName: string;
}

/**
 * Detecta informações detalhadas sobre o dispositivo e navegador
 */
export const detectDevice = (): DeviceInfo => {
  const ua = navigator.userAgent || '';
  
  // Detecção de OS
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /android/i.test(ua);
  
  // Detecção de navegadores
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPR/.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edg|OPR/.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isEdge = /Edg/i.test(ua);
  const isOpera = /OPR|Opera|OPiOS/i.test(ua);
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isBrave = !!(navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
  
  // Detecção de modo standalone (PWA instalado)
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (navigator as any).standalone === true; // iOS Safari
  
  // Suporte ao prompt de instalação
  // Opera e Firefox não suportam beforeinstallprompt de forma confiável
  const supportsInstallPrompt = 
    'BeforeInstallPromptEvent' in window ||
    (isAndroid && (isChrome || isSamsung || isEdge || isOpera || isBrave)) ||
    (isChrome || isEdge || isOpera || isBrave); // Desktop também

  // Nome do navegador
  let browserName = 'Unknown';
  if (isSafari) browserName = 'Safari';
  else if (isBrave) browserName = 'Brave'; // ← ADICIONAR ANTES DO CHROME
  else if (isChrome) browserName = 'Chrome';
  else if (isFirefox) browserName = 'Firefox';
  else if (isEdge) browserName = 'Edge';
  else if (isOpera) browserName = 'Opera';
  else if (isSamsung) browserName = 'Samsung Internet';
  
  // Nome do OS
  let osName = 'Unknown';
  if (isIOS) osName = 'iOS';
  else if (isAndroid) osName = 'Android';
  else if (/Windows/i.test(ua)) osName = 'Windows';
  else if (/Mac/i.test(ua)) osName = 'macOS';
  else if (/Linux/i.test(ua)) osName = 'Linux';
  
  return {
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isOpera,
    isSamsung,
    isBrave,
    isStandalone,
    supportsInstallPrompt,
    browserName,
    osName
  };
};

/**
 * Verifica se o PWA está instalado baseado em múltiplas verificações
 */
export const isPWAInstalled = (appId: string): boolean => {
  const device = detectDevice();
  
  // 1. Verificar display mode
  if (device.isStandalone) {
    return true;
  }
  
  // 2. Verificar localStorage (histórico de instalações)
  try {
    const installedApps = JSON.parse(localStorage.getItem('installedPWAs') || '[]');
    if (installedApps.includes(appId)) {
      // Se está no localStorage mas não em standalone, foi desinstalado
      if (!device.isStandalone) {
        const updatedApps = installedApps.filter((id: string) => id !== appId);
        localStorage.setItem('installedPWAs', JSON.stringify(updatedApps));
        return false;
      }
      return true;
    }
  } catch (e) {
    console.warn('[PWA Detection] Erro ao verificar localStorage:', e);
  }
  
  return false;
};

/**
 * Marca um PWA como instalado
 */
export const markPWAAsInstalled = (appId: string): void => {
  try {
    const installedApps = JSON.parse(localStorage.getItem('installedPWAs') || '[]');
    if (!installedApps.includes(appId)) {
      installedApps.push(appId);
      localStorage.setItem('installedPWAs', JSON.stringify(installedApps));
    }
  } catch (e) {
    console.warn('[PWA Detection] Erro ao marcar como instalado:', e);
  }
};

/**
 * Remove um PWA da lista de instalados
 */
export const markPWAAsUninstalled = (appId: string): void => {
  try {
    const installedApps = JSON.parse(localStorage.getItem('installedPWAs') || '[]');
    const updatedApps = installedApps.filter((id: string) => id !== appId);
    localStorage.setItem('installedPWAs', JSON.stringify(updatedApps));
  } catch (e) {
    console.warn('[PWA Detection] Erro ao remover da lista:', e);
  }
};

/**
 * Obtém instruções de instalação específicas para o dispositivo
 */
export const getInstallInstructions = (device: DeviceInfo): string => {
  if (device.isIOS && device.isSafari) {
    return 'Toque no botão de compartilhar e depois em "Adicionar à Tela de Início"';
  }
  
  if (device.isIOS) {
    return 'Abra este link no Safari e use "Compartilhar → Adicionar à Tela de Início"';
  }
  
  if (device.isAndroid && device.isChrome) {
    return 'Toque no menu (⋮) e selecione "Adicionar à tela inicial"';
  }
  
  if (device.isAndroid && device.isFirefox) {
    return 'Abra o menu e toque em "Instalar" ou "Adicionar à tela inicial"';
  }
  
  if (device.isAndroid && device.isSamsung) {
    return 'Toque no menu e selecione "Adicionar página a" → "Tela inicial"';
  }
  
  if (device.isAndroid && device.isOpera) {
    return 'Toque no menu (⋮) no canto superior direito → "Adicionar à" → "Tela inicial"';
  }

  if (device.isIOS && device.isOpera) {
    return 'Abra este link no Safari e use "Compartilhar → Adicionar à Tela de Início"';
  }
  
    if (device.isAndroid && device.isFirefox) {
      return 'Toque no menu (⋮) e selecione "Instalar" ou "Adicionar à tela inicial"';
    }
    
    if (device.isIOS && device.isFirefox) {
      return 'Abra este link no Safari e use "Compartilhar → Adicionar à Tela de Início"';
    }
  
    // Adicionar ANTES da última linha (linha 182)
  
  if (device.isAndroid && device.isBrave) {
    return 'Toque no menu Brave (⋮) e selecione "Adicionar à tela inicial"';
  }
  
  if (device.isBrave) {
    return 'Clique no menu Brave (⋮) e selecione "Instalar aplicativo"';
  }
  
  return 'Use o menu do navegador para adicionar à tela inicial';

};

/**
 * Log detalhado para debug de PWA
 */
export const logPWADebugInfo = (device: DeviceInfo, appId: string): void => {
  const isInstalled = isPWAInstalled(appId);
  
  console.group('🔍 PWA Debug Information');
  console.log('📱 Device:', {
    OS: device.osName,
    Browser: device.browserName,
    isStandalone: device.isStandalone,
    supportsInstallPrompt: device.supportsInstallPrompt
  });
  console.log('📦 Installation:', {
    appId,
    isInstalled,
    localStorage: localStorage.getItem('installedPWAs')
  });
  console.log('🌐 Environment:', {
    userAgent: navigator.userAgent,
    displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    serviceWorker: 'serviceWorker' in navigator
  });
  console.groupEnd();
};
