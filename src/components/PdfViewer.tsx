import { useState, useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PdfViewerProps {
  pdfUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  allowDownload?: boolean;
  onDownload?: (url: string, filename: string) => void;
}

export const PdfViewer = ({ 
  pdfUrl, 
  title, 
  isOpen, 
  onClose, 
  allowDownload = true,
  onDownload 
}: PdfViewerProps) => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Detectar tipo de dispositivo e navegador para otimizações específicas
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafariIOS = isIOS && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);
  const isChromeIOS = isIOS && /CriOS/i.test(userAgent);
  const isFirefoxIOS = isIOS && /FxiOS/i.test(userAgent);
  const isOperaIOS = isIOS && (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent));
  const isEdgeIOS = isIOS && /EdgiOS/i.test(userAgent);
  const isEdgeAndroid = isAndroid && /EdgA/i.test(userAgent);
  const isChromeAndroid = isAndroid && /Chrome/i.test(userAgent) && !/EdgA/.test(userAgent);
  const isFirefoxAndroid = isAndroid && /Firefox/i.test(userAgent);
  const isOperaAndroid = isAndroid && (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent));
  const isDesktop = !isAndroid && !isIOS;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, pdfUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Erro ao carregar o PDF');
  };

  const handleDownload = () => {
    if (onDownload) {
      const filename = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      onDownload(pdfUrl, filename);
    }
  };

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  // Estratégia de visualização baseada no dispositivo e navegador
  const getPdfViewerUrl = () => {
    // Safari iOS: usar Google Docs Viewer para garantir ajuste à tela
    if (isSafariIOS) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Chrome iOS: usar Google Docs Viewer para garantir ajuste à tela
    if (isChromeIOS) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Firefox iOS: usar Google Docs Viewer para garantir ajuste à tela
    if (isFirefoxIOS) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Opera iOS: usar Google Docs Viewer para garantir ajuste à tela
    if (isOperaIOS) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }

    // Edge iOS: usar Google Docs Viewer para garantir ajuste à tela
    if (isEdgeIOS) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }

    // Edge Android: usar Google Docs Viewer para maior compatibilidade  
    if (isEdgeAndroid) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Chrome Android: usar Google Docs Viewer para maior compatibilidade
    if (isChromeAndroid) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Firefox Android: usar Google Docs Viewer para maior compatibilidade
    if (isFirefoxAndroid) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Opera Android: usar Google Docs Viewer para maior compatibilidade
    if (isOperaAndroid) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    // Outros navegadores Android: ajuste horizontal
    if (isAndroid) {
      return `${pdfUrl}#view=FitH&zoom=page-width`;
    }
    
    // Desktop: visualização padrão otimizada
    if (isDesktop) {
      return `${pdfUrl}#view=FitH&toolbar=1&navpanes=0`;
    }
    
    // Fallback genérico
    return pdfUrl;
  };

  const iframeSrc = getPdfViewerUrl();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex-1 min-w-0">
            <h2 className={`font-semibold truncate ${isMobile ? 'text-base' : 'text-lg'}`}>{title}</h2>
          </div>
          
          <div className={`flex items-center ${isMobile ? 'gap-1 ml-2' : 'gap-2 ml-4'}`}>
            
            {/* Download */}
            {allowDownload && onDownload && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDownload}
                className="p-2"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            {/* Close */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-2"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        className={`absolute inset-0 ${isMobile ? 'pt-14' : 'pt-16'}`} 
        style={{ 
          backgroundColor: '#f5f5f5',
          // iOS: permitir scroll vertical, sem horizontal
          ...(isIOS && {
            overflowX: 'hidden',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            height: '100vh',
            width: '100vw'
          }),
          // Android: otimizações para manter no app
          ...(isAndroid && {
            overflow: 'hidden',
            touchAction: 'manipulation'
          })
        }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="bg-background border border-border rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando PDF...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center">
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Recarregar página
                </Button>
                <Button onClick={openInNewTab} variant="outline" size="sm">
                  Abrir em nova aba
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Iframe */}
        {!error && (
          <iframe
            src={iframeSrc}
            className="w-full h-full border-0"
            title={title}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            {...(isMobile ? {
              sandbox: "allow-same-origin allow-scripts allow-popups allow-forms"
            } : {})}
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              border: 'none',
              outline: 'none',
              // Otimizações específicas para Safari iOS
              ...(isSafariIOS && {
                transform: 'translateZ(0)',
                WebkitOverflowScrolling: 'touch',
                objectFit: 'contain',
                maxWidth: '100vw',
                overflow: 'auto',
              }),
              // Otimizações específicas para outros iOS
              ...(isIOS && !isSafariIOS && {
                transform: 'translateZ(0)',
                objectFit: 'contain',
              }),
              // Otimizações específicas para Edge iOS
              ...(isEdgeIOS && {
                transform: 'translateZ(0)',
                WebkitOverflowScrolling: 'touch',
                objectFit: 'contain',
              }),
              // Otimizações específicas para Edge Android
              ...(isEdgeAndroid && {
                touchAction: 'pan-y pinch-zoom',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }),
              // Otimizações específicas para Chrome Android
              ...(isChromeAndroid && {
                touchAction: 'pan-y pinch-zoom',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }),
              // Otimizações para outros Android
              ...(isAndroid && !isChromeAndroid && {
                touchAction: 'manipulation',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }),
              // Desktop: sem restrições especiais
              ...(isDesktop && {
                overflow: 'auto',
              })
            }}
            // Atributos específicos para Android para manter no app
            {...(isAndroid && {
              'data-turbo': 'false',
              'data-turbo-track': 'false'
            })}
          />
        )}
      </div>
    </div>
  );
};
