import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface InternalPdfViewerProps {
  pdfUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  allowDownload?: boolean;
  onDownload?: (url: string, filename: string) => void;
}

interface PageCache {
  [key: number]: HTMLCanvasElement;
}

export const InternalPdfViewer = ({ 
  pdfUrl, 
  title, 
  isOpen, 
  onClose, 
  allowDownload = true,
  onDownload 
}: InternalPdfViewerProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<HTMLDivElement>(null);
  
  // PDF states
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pageCache] = useState<PageCache>({});
  
  // Touch states
  const [isPinching, setIsPinching] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  // Reset states when opening/closing
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setScale(isMobile ? 1.0 : 1.2);
      setRotation(0);
      setError(null);
      setRetryCount(0);
      setViewOffset({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  // PDF loading with fallback
  const loadPdf = useCallback(async (url: string, attempt: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Primary: Normal PDF.js loading
      const loadingTask = pdfjs.getDocument({
        url,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        maxImageSize: 4096 * 4096,
        disableFontFace: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setIsLoading(false);
      
      // Pre-load first few pages
      preloadPages(pdf, 1, Math.min(3, pdf.numPages));
      
    } catch (err: any) {
      console.error(`PDF loading attempt ${attempt} failed:`, err);
      
      if (attempt < 3) {
        // Retry with different options
        setTimeout(() => {
          const retryOptions = attempt === 2 ? { disableWorker: true } : {};
          loadPdf(url, attempt + 1);
        }, 1000 * attempt);
      } else {
        // Final fallback: try as blob
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          await loadPdf(blobUrl, 4);
        } catch (blobErr) {
          setError('Falha ao carregar o PDF. Verifique sua conexão e tente novamente.');
          setIsLoading(false);
        }
      }
      setRetryCount(attempt);
    }
  }, []);

  // Pre-load adjacent pages for smooth navigation
  const preloadPages = useCallback(async (pdf: any, start: number, end: number) => {
    for (let pageNum = start; pageNum <= end; pageNum++) {
      if (!pageCache[pageNum] && pageNum <= pdf.numPages) {
        setLoadingPages(prev => new Set(prev).add(pageNum));
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          
          pageCache[pageNum] = canvas;
        } catch (err) {
          console.error(`Failed to preload page ${pageNum}:`, err);
        } finally {
          setLoadingPages(prev => {
            const newSet = new Set(prev);
            newSet.delete(pageNum);
            return newSet;
          });
        }
      }
    }
  }, [pageCache]);

  // Load PDF when component opens
  useEffect(() => {
    if (isOpen && pdfUrl) {
      loadPdf(pdfUrl);
    }
  }, [isOpen, pdfUrl, loadPdf]);

  // Touch gesture handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      setLastPinchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && isPinching) {
      const distance = getTouchDistance(e.touches);
      const scaleFactor = distance / lastPinchDistance;
      const newScale = Math.max(0.5, Math.min(3.0, scale * scaleFactor));
      setScale(newScale);
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;
      
      setViewOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPinching(false);
    setIsDragging(false);
    setLastPinchDistance(0);
  };

  // Navigation functions
  const goToPage = (pageNumber: number) => {
    const newPage = Math.max(1, Math.min(numPages, pageNumber));
    setCurrentPage(newPage);
    
    // Pre-load adjacent pages
    if (pdfDocument) {
      const start = Math.max(1, newPage - 1);
      const end = Math.min(numPages, newPage + 1);
      preloadPages(pdfDocument, start, end);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(3.0, prev + 0.25));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.25));
  const resetZoom = () => {
    setScale(isMobile ? 1.0 : 1.2);
    setViewOffset({ x: 0, y: 0 });
  };

  // Rotation
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Download
  const handleDownload = () => {
    if (onDownload) {
      const filename = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      onDownload(pdfUrl, filename);
    }
  };

  // Retry loading
  const retryLoad = () => {
    setRetryCount(0);
    loadPdf(pdfUrl);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevPage();
          break;
        case 'ArrowRight':
          nextPage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'r':
          rotate();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentPage, numPages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className={cn("flex items-center justify-between", isMobile ? "p-2" : "p-4")}>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">{title}</h2>
            <p className="text-muted-foreground text-sm">
              {numPages > 0 && `Página ${currentPage} de ${numPages}`}
            </p>
          </div>
          
          <div className={cn("flex items-center gap-1", isMobile ? "ml-2" : "ml-4 gap-2")}>
            {/* Navigation */}
            {numPages > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= numPages}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {/* Zoom Controls */}
            <Button variant="ghost" size="sm" onClick={zoomOut} className="p-2">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomIn} className="p-2">
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {/* Rotate */}
            <Button variant="ghost" size="sm" onClick={rotate} className="p-2">
              <RotateCw className="w-4 h-4" />
            </Button>
            
            {/* Fullscreen */}
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="p-2">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            {/* Download */}
            {allowDownload && onDownload && (
              <Button variant="ghost" size="sm" onClick={handleDownload} className="p-2">
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            {/* Close */}
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        ref={containerRef}
        className={cn("absolute inset-0 overflow-auto", isMobile ? "pt-16" : "pt-20")}
        style={{ backgroundColor: '#f5f5f5' }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={retryLoad} variant="outline">
                Tentar Novamente
              </Button>
              {retryCount > 0 && (
                <p className="text-muted-foreground text-sm mt-2">
                  Tentativa {retryCount}/3
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={touchRef}
            className="flex items-center justify-center min-h-full p-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {pdfDocument && (
              <div 
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg) translate(${viewOffset.x}px, ${viewOffset.y}px)`,
                  transformOrigin: 'center',
                  transition: isPinching || isDragging ? 'none' : 'transform 0.2s ease'
                }}
              >
                <Document
                  file={pdfDocument}
                  loading={null}
                  error={null}
                >
                  <Page
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={true}
                    width={isMobile ? Math.min(window.innerWidth - 32, 800) : 900}
                    className="shadow-lg"
                    loading={
                      <div className="flex items-center justify-center bg-card border rounded p-8 min-h-[600px]">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Carregando página {currentPage}...</p>
                        </div>
                      </div>
                    }
                  />
                </Document>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Instructions */}
      {isMobile && !error && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 text-center">
            <p className="text-muted-foreground text-sm">
              💡 Use gestos de pinça para zoom • Deslize para navegar
            </p>
          </div>
        </div>
      )}

      {/* Page Navigation for Mobile */}
      {isMobile && numPages > 1 && !error && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2">
            <span className="text-sm font-medium">
              {currentPage} / {numPages}
            </span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="bg-background border border-border rounded-lg p-6 flex items-center gap-3 shadow-lg">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando PDF...</span>
          </div>
        </div>
      )}
    </div>
  );
};