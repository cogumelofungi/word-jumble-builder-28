import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { VideoLoader } from './VideoLoader';
import { useToast } from '@/hooks/use-toast';
import { 
  isGoogleDriveUrl, 
  getGoogleDriveVideoInfo, 
  convertGoogleDriveUrlToDirect,
  getGoogleDriveInstructions
} from '@/utils/googleDriveUtils';


interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({ isOpen, onClose, videoUrl, title, onProgress }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [useDirectVideo, setUseDirectVideo] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState('');
  const { toast } = useToast();

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract Google Drive file ID from URL
  const getGoogleDriveId = (url: string) => {
    const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is Google Drive (using utility)
  const isDriveUrl = isGoogleDriveUrl(videoUrl);
  const driveInfo = isDriveUrl ? getGoogleDriveVideoInfo(videoUrl) : null;

  // Check if URL is Archive.org
  const isArchiveOrgUrl = (url: string) => {
    return url.includes('archive.org');
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const youtubeId = isYouTubeUrl(videoUrl) ? getYouTubeId(videoUrl) : null;
  const googleDriveId = isDriveUrl ? driveInfo?.id || null : null;
  const isArchive = isArchiveOrgUrl(videoUrl);

  // Refs e timers para carregamento do Google Drive
  const driveLoadStartRef = useRef<number | null>(null);
  const fallbackErrorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('VideoPlayer opened with URL:', videoUrl);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setShowErrorDialog(false);
      setUseDirectVideo(false);

      // Process the video URL based on its type
      if (isDriveUrl && driveInfo) {
        console.log('Google Drive video detected:', driveInfo.id);
        
        // Try direct video URL first for better compatibility
        const directUrl = convertGoogleDriveUrlToDirect(videoUrl);
        setProcessedVideoUrl(directUrl);
        setUseDirectVideo(true);
        
        console.log('Converted Google Drive URL:', directUrl);
        
        // Set a reasonable timeout for loading
        driveLoadStartRef.current = Date.now();
        if (fallbackErrorTimerRef.current) {
          clearTimeout(fallbackErrorTimerRef.current as any);
        }
        
        // Fallback to iframe if direct video fails after 8 seconds
        fallbackErrorTimerRef.current = window.setTimeout(() => {
          console.log('Direct video timeout - trying iframe fallback');
          toast({
            title: "Tentando método alternativo",
            description: "Carregando vídeo do Google Drive via iframe...",
            duration: 3000,
          });
          setUseDirectVideo(false);
          setProcessedVideoUrl(driveInfo.previewUrl);
        }, 8000);
        
      } else if (isArchive) {
        console.log('Archive.org video detected');
        setProcessedVideoUrl(videoUrl);
        driveLoadStartRef.current = Date.now();
      } else if (youtubeId) {
        console.log('YouTube video detected:', youtubeId);
        setProcessedVideoUrl(videoUrl);
        setIsLoading(false);
      } else {
        console.log('Direct video URL detected');
        setProcessedVideoUrl(videoUrl);
      }
    }
    
    return () => {
      if (fallbackErrorTimerRef.current) {
        clearTimeout(fallbackErrorTimerRef.current as any);
        fallbackErrorTimerRef.current = null;
      }
    };
  }, [isOpen, videoUrl, isDriveUrl, driveInfo, isArchive, youtubeId]);

  const handleVideoLoad = () => {
    const start = driveLoadStartRef.current ?? Date.now();
    const elapsed = Date.now() - start;

    console.log('Video loaded, elapsed time:', elapsed, 'ms');
    setIsLoading(false);

    if (fallbackErrorTimerRef.current) {
      clearTimeout(fallbackErrorTimerRef.current as any);
      fallbackErrorTimerRef.current = null;
    }

    console.log('Video loaded successfully');
  };

  const handleVideoError = (error?: any) => {
    console.error('Video error:', error);
    
    if (isDriveUrl && useDirectVideo && driveInfo) {
      console.log('Direct video failed, trying iframe fallback');
      toast({
        title: "Tentando método alternativo",
        description: "O método direto falhou. Tentando carregar via iframe...",
        duration: 3000,
      });
      setUseDirectVideo(false);
      setProcessedVideoUrl(driveInfo.previewUrl);
      setIsLoading(true);
    } else if (isDriveUrl && !useDirectVideo) {
      // Both methods failed
      toast({
        title: "Problema com vídeo do Google Drive",
        description: driveInfo ? getGoogleDriveInstructions(driveInfo.id) : "Verifique se o link está público e acessível.",
        variant: "destructive",
        duration: 10000,
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
      toast({
        title: "Erro ao carregar vídeo",
        description: "Não foi possível carregar o vídeo. Verifique o link e tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    onClose();
    // Voltar para a tela inicial
    window.location.href = '/';
  };

  const renderPlayer = () => {
    if (youtubeId) {
      // YouTube embed with minimal controls
      return (
        <div className="relative w-full h-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&fs=1&iv_load_policy=3&disablekb=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }

    if (isDriveUrl && driveInfo) {
      // Google Drive: try direct video first, fallback to iframe
      if (useDirectVideo) {
        return (
          <div className="relative w-full h-full bg-black">
            {isLoading && <VideoLoader title={title} />}
            <video
              src={processedVideoUrl}
              className="w-full h-full object-contain"
              autoPlay
              controls
              crossOrigin="anonymous"
              playsInline
              onLoadStart={() => {
                console.log('Google Drive direct video load started');
                setIsLoading(true);
              }}
              onCanPlay={() => {
                console.log('Google Drive direct video can play');
                handleVideoLoad();
              }}
              onError={(e) => {
                console.error('Google Drive direct video error:', e);
                handleVideoError(e);
              }}
              onTimeUpdate={(e) => {
                const video = e.target as HTMLVideoElement;
                setCurrentTime(video.currentTime);
                if (onProgress && video.duration && video.currentTime <= video.duration) {
                  const progressPercent = Math.min((video.currentTime / video.duration) * 100, 100);
                  onProgress(progressPercent);
                }
              }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                setDuration(video.duration);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        );
      } else {
        // Fallback to iframe
        return (
          <div className="relative w-full h-full bg-black">
            {isLoading && <VideoLoader title={title} />}
            <iframe
              src={processedVideoUrl}
              title={title}
              className="w-full h-full"
              onLoad={handleVideoLoad}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        );
      }
    }

    if (isArchive) {
      // Archive.org embed similar to Google Drive
      return (
        <div className="relative w-full h-full bg-black">
          {isLoading && <VideoLoader title={title} />}
          <iframe
            src={processedVideoUrl}
            title={title}
            className="w-full h-full"
            onLoad={handleVideoLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{
              border: 'none',
              zoom: 1,
              transform: 'scale(1)',
              objectFit: 'contain'
            }}
          />
        </div>
      );
    }

    // For other video URLs (direct video files) - with loading events
    return (
      <div className="relative w-full h-full bg-black">
        {isLoading && <VideoLoader title={title} />}
        <video
          src={processedVideoUrl}
          className="w-full h-full object-contain"
          autoPlay
          controls
          onLoadStart={() => {
            console.log('Video load started');
            setIsLoading(true);
          }}
          onCanPlay={() => {
            console.log('Video can play - removing loading');
            handleVideoLoad();
          }}
          onWaiting={() => {
            console.log('Video waiting - showing loading');
            setIsLoading(true);
          }}
          onError={handleVideoError}
          onLoadedData={() => {
            console.log('Video data loaded');
            setIsLoading(false);
          }}
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            setCurrentTime(video.currentTime);
            if (onProgress && video.duration && video.currentTime <= video.duration) {
              const progressPercent = Math.min((video.currentTime / video.duration) * 100, 100);
              onProgress(progressPercent);
            }
          }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            setDuration(video.duration);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={(e) => {
            const video = e.target as HTMLVideoElement;
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }}
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="video-player-dialog bg-black border-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-[60]">
          {/* Full screen video */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {renderPlayer()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog for Google Drive Issues */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Episódio com problema
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este episódio está temporariamente indisponível devido a uma limitação do Google Drive. 
              Nossa equipe já está trabalhando para resolver este problema o mais rápido possível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              Voltar à tela inicial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}