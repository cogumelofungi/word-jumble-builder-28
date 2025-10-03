import { useState, useEffect } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectDevice, getInstallInstructions } from '@/utils/pwaDetection';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
  hasPrompt: boolean;
}

/**
 * Banner inteligente para instalação de PWA com instruções específicas por dispositivo
 */
export const PWAInstallBanner = ({ onInstall, onDismiss, hasPrompt }: PWAInstallBannerProps) => {
  const [device] = useState(() => detectDevice());
  const [showInstructions, setShowInstructions] = useState(false);

// Apenas iOS Safari e Firefox necessitam de instruções manuais
// Opera e Brave suportam beforeinstallprompt nativamente
const needsManualInstructions = 
  (device.isIOS && device.isSafari) || 
  (device.isFirefox && !hasPrompt) ||  // Firefox só se não tiver prompt
  (!hasPrompt && device.isAndroid);  // Android sem prompt mostra instruções

  const handleInstallClick = () => {
    if (needsManualInstructions) {
      setShowInstructions(true);
    } else {
      onInstall();
    }
  };

  if (showInstructions && needsManualInstructions) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-background/95 border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Share className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Como Instalar o Aplicativo</h3>
              <p className="text-sm text-muted-foreground mb-4">{getInstallInstructions(device)}</p>
              
              {device.isIOS && device.isSafari && (
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Toque no botão de <strong>Compartilhar</strong> <Share className="inline w-4 h-4" /> na barra inferior do Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <Plus className="inline w-4 h-4" /></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
                  </li>
                </ol>
              )}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Dica:</strong> Depois de instalado, o app ficará na sua tela inicial e funcionará como um aplicativo nativo.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowInstructions(false);
                onDismiss();
              }}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-card border border-border rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Instalar Aplicativo</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {needsManualInstructions 
                ? 'Adicione este app à sua tela inicial para acesso rápido' 
                : 'Instale para uma melhor experiência'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {needsManualInstructions ? 'Ver Instruções' : 'Instalar'}
              </Button>
              <Button
                onClick={onDismiss}
                variant="outline"
                size="sm"
              >
                Já instalei
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="flex-shrink-0 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
