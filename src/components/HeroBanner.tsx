import { Play, Info, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

interface Program {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre: string;
  year: number;
  isFavorite: boolean;
  description?: string;
}

interface HeroBannerProps {
  featuredProgram: Program | null;
  onPlay: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function HeroBanner({ featuredProgram, onPlay, onToggleFavorite }: HeroBannerProps) {
  // Early return with defensive checks
  if (!featuredProgram || typeof featuredProgram !== 'object') {
    return null;
  }

  return (
    <div className="relative h-[45vh] md:h-[55vh] lg:h-[60vh] xl:h-[70vh] hero-banner overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithSkeleton
          src={featuredProgram.poster || "/placeholder.svg"}
          alt={`Poster de ${featuredProgram.title || "Programa"}`}
          className="w-full h-full object-cover scale-110 transition-transform duration-[10s] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Em Destaque
              </Badge>
              <Badge variant="outline" className="border-border/50">
                {featuredProgram.genre || "Desconhecido"}
              </Badge>
              <Badge variant="outline" className="border-border/50">
                {featuredProgram.year || "N/A"}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
              {featuredProgram.title || "Sem Título"}
            </h1>

            {/* Description */}
            {featuredProgram.description && (
              <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-6 leading-relaxed max-w-lg lg:max-w-xl line-clamp-3">
                {featuredProgram.description}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-2 md:px-3 py-1">
                <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold text-sm md:text-base">{featuredProgram.rating || "N/A"}</span>
              </div>
              <span className="text-white/70 text-xs md:text-sm">IMDb</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-wrap">
              <Button
                size="default"
                className="btn-primary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base h-10 md:h-11"
                onClick={() => featuredProgram.id && onPlay(featuredProgram.id)}
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-white" />
                Assistir Agora
              </Button>
              
              <Button
                variant="secondary"
                size="default"
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white transition-all duration-300 text-sm md:text-base h-10 md:h-11"
              >
                <Info className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Mais Informações
              </Button>

              <Button
                variant="ghost"
                size="default"
                onClick={() => featuredProgram.id && onToggleFavorite(featuredProgram.id)}
                className="text-white hover:bg-white/20 border border-white/30 transition-all duration-300 hover:scale-105 h-10 md:h-11 w-10 md:w-11 p-0"
                aria-label={featuredProgram.isFavorite ? "Remover da lista" : "Adicionar à lista"}
              >
                <Plus className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${featuredProgram.isFavorite ? 'rotate-45 text-primary' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}