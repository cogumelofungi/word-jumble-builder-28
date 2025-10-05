import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LayoutOption {
  value: string;
  label: string;
  description: string;
  preview: React.ReactNode;
}

interface LayoutSelectorProps {
  title: string;
  value: string;
  options: LayoutOption[];
  onChange: (value: string) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  title,
  value,
  options,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{title}</Label>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <Card
            key={option.value}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
              value === option.value
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onChange(option.value)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Preview Visual */}
                <div className="h-20 bg-muted rounded-md flex items-center justify-center border">
                  {option.preview}
                </div>
                
                {/* Labels */}
                <div className="text-center">
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Layout Options Data
export const HEADER_LAYOUTS: LayoutOption[] = [
  {
    value: 'full-cover',
    label: 'Capa Completa',
    description: 'Header cobrindo toda a tela',
    preview: (
      <div className="w-full h-full bg-gradient-to-b from-primary/80 to-primary/40 rounded flex items-center justify-center">
        <div className="w-8 h-8 bg-white/20 rounded" />
      </div>
    )
  },
  {
    value: 'hero-section',
    label: 'Seção Hero',
    description: 'Header hero com CTA',
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-primary/90 to-primary/50 rounded flex flex-col items-center justify-center gap-1">
        <div className="w-10 h-1 bg-white/40 rounded" />
        <div className="w-6 h-2 bg-white/60 rounded" />
      </div>
    )
  },
  {
    value: 'top-nav',
    label: 'Navegação Superior',
    description: 'Barra de navegação no topo',
    preview: (
      <div className="w-full h-full flex flex-col">
        <div className="h-2 bg-primary/60 rounded-t w-full" />
        <div className="flex-1 bg-muted-foreground/10 rounded-b flex items-center justify-center">
          <div className="w-6 h-6 bg-muted-foreground/40 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'split-screen',
    label: 'Tela Dividida',
    description: 'Header dividido em duas seções',
    preview: (
      <div className="w-full h-full flex rounded overflow-hidden">
        <div className="w-1/2 bg-primary/60 flex items-center justify-center">
          <div className="w-4 h-4 bg-white/40 rounded" />
        </div>
        <div className="w-1/2 bg-muted-foreground/20 flex items-center justify-center">
          <div className="w-6 h-2 bg-muted-foreground/60 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'centered',
    label: 'Centralizado',
    description: 'Conteúdo centralizado',
    preview: (
      <div className="w-full h-full bg-muted-foreground/10 rounded flex items-center justify-center">
        <div className="w-10 h-6 bg-primary/60 rounded" />
      </div>
    )
  },
  {
    value: 'floating',
    label: 'Flutuante',
    description: 'Header flutuante sobre conteúdo',
    preview: (
      <div className="w-full h-full bg-muted-foreground/10 rounded relative">
        <div className="absolute top-1 left-1 right-1 h-2 bg-primary/80 rounded shadow-sm" />
        <div className="pt-4 px-2 flex items-center justify-center">
          <div className="w-8 h-6 bg-muted-foreground/40 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'minimal',
    label: 'Minimalista',
    description: 'Design limpo e simples',
    preview: (
      <div className="w-full h-full bg-white/5 rounded flex items-start justify-center pt-2">
        <div className="w-8 h-1 bg-muted-foreground/40 rounded" />
      </div>
    )
  }
];

export const CONTENT_LAYOUTS: LayoutOption[] = [
  {
    value: 'single-column',
    label: 'Coluna Única',
    description: 'Conteúdo em linha vertical',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2">
        <div className="h-2 bg-primary/60 rounded w-full" />
        <div className="h-2 bg-muted-foreground/40 rounded w-4/5" />
        <div className="h-2 bg-muted-foreground/40 rounded w-3/4" />
        <div className="h-2 bg-muted-foreground/40 rounded w-full" />
      </div>
    )
  },
  {
    value: 'two-column',
    label: 'Duas Colunas',
    description: 'Conteúdo em duas colunas',
    preview: (
      <div className="w-full h-full flex gap-1 p-2">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-primary/60 rounded" />
          <div className="h-2 bg-muted-foreground/40 rounded w-3/4" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-muted-foreground/40 rounded" />
          <div className="h-2 bg-muted-foreground/40 rounded w-2/3" />
        </div>
      </div>
    )
  },
  {
    value: 'sidebar',
    label: 'Barra Lateral',
    description: 'Conteúdo com sidebar',
    preview: (
      <div className="w-full h-full flex gap-1 p-2">
        <div className="w-1/3 bg-primary/60 rounded" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-muted-foreground/40 rounded" />
          <div className="h-2 bg-muted-foreground/40 rounded w-3/4" />
          <div className="h-2 bg-muted-foreground/40 rounded w-1/2" />
        </div>
      </div>
    )
  },
  {
    value: 'masonry',
    label: 'Masonry',
    description: 'Layout tipo Pinterest',
    preview: (
      <div className="w-full h-full flex gap-1 p-2">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-3 bg-primary/60 rounded" />
          <div className="h-2 bg-muted-foreground/40 rounded" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-muted-foreground/40 rounded" />
          <div className="h-3 bg-muted-foreground/40 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'grid',
    label: 'Grade',
    description: 'Layout em grade uniforme',
    preview: (
      <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
        <div className="bg-primary/60 rounded" />
        <div className="bg-muted-foreground/40 rounded" />
        <div className="bg-muted-foreground/40 rounded" />
        <div className="bg-muted-foreground/40 rounded" />
      </div>
    )
  },
  {
    value: 'grid-3',
    label: 'Grade 3x3',
    description: 'Layout em grade 3 colunas',
    preview: (
      <div className="w-full h-full grid grid-cols-3 gap-0.5 p-1">
        <div className="bg-primary/60 rounded-sm" />
        <div className="bg-muted-foreground/40 rounded-sm" />
        <div className="bg-muted-foreground/40 rounded-sm" />
        <div className="bg-muted-foreground/40 rounded-sm" />
        <div className="bg-muted-foreground/40 rounded-sm" />
        <div className="bg-muted-foreground/40 rounded-sm" />
      </div>
    )
  },
  {
    value: 'cards',
    label: 'Cartões',
    description: 'Conteúdo em cards',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2">
        <div className="h-3 bg-primary/60 rounded-md border border-primary/30" />
        <div className="h-3 bg-muted-foreground/30 rounded-md border border-muted-foreground/30" />
        <div className="h-3 bg-muted-foreground/30 rounded-md border border-muted-foreground/30" />
      </div>
    )
  },
  {
    value: 'featured-grid',
    label: 'Grade Destacada',
    description: 'Item principal + grid',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2">
        <div className="h-4 bg-primary/60 rounded" />
        <div className="flex gap-1 flex-1">
          <div className="flex-1 bg-muted-foreground/40 rounded" />
          <div className="flex-1 bg-muted-foreground/40 rounded" />
        </div>
      </div>
    )
  }
];

export const BUTTON_STYLES: LayoutOption[] = [
  {
    value: 'rounded',
    label: 'Arredondado',
    description: 'Botões com bordas suaves',
    preview: (
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 bg-primary/80 rounded-md" />
        <div className="h-2 w-8 bg-muted-foreground/40 rounded-md" />
      </div>
    )
  },
  {
    value: 'square',
    label: 'Quadrado',
    description: 'Botões com cantos retos',
    preview: (
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 bg-primary/80" />
        <div className="h-2 w-8 bg-muted-foreground/40" />
      </div>
    )
  },
  {
    value: 'pill',
    label: 'Pílula',
    description: 'Botões totalmente arredondados',
    preview: (
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 bg-primary/80 rounded-full" />
        <div className="h-2 w-8 bg-muted-foreground/40 rounded-full" />
      </div>
    )
  },
  {
    value: 'minimal',
    label: 'Minimalista',
    description: 'Botões simples sem borda',
    preview: (
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 border-b-2 border-primary/80 bg-transparent" />
        <div className="h-2 w-8 border-b border-muted-foreground/40 bg-transparent" />
      </div>
    )
  }
];

export const CARD_STYLES: LayoutOption[] = [
  {
    value: 'elevated',
    label: 'Elevado',
    description: 'Cards com sombra',
    preview: (
      <div className="relative">
        <div className="absolute inset-0 bg-black/20 rounded translate-x-0.5 translate-y-0.5" />
        <div className="relative h-16 w-full bg-card border border-border rounded p-2">
          <div className="h-2 bg-primary/60 rounded w-3/4" />
          <div className="h-1 bg-muted-foreground/40 rounded w-1/2 mt-1" />
        </div>
      </div>
    )
  },
  {
    value: 'flat',
    label: 'Plano',
    description: 'Cards sem sombra',
    preview: (
      <div className="h-16 w-full bg-card border border-border rounded p-2">
        <div className="h-2 bg-primary/60 rounded w-3/4" />
        <div className="h-1 bg-muted-foreground/40 rounded w-1/2 mt-1" />
      </div>
    )
  },
  {
    value: 'outlined',
    label: 'Contornado',
    description: 'Cards apenas com borda',
    preview: (
      <div className="h-16 w-full bg-transparent border-2 border-border rounded p-2">
        <div className="h-2 bg-primary/60 rounded w-3/4" />
        <div className="h-1 bg-muted-foreground/40 rounded w-1/2 mt-1" />
      </div>
    )
  },
  {
    value: 'glassmorphism',
    label: 'Glassmorphism',
    description: 'Efeito de vidro translúcido',
    preview: (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded backdrop-blur-sm" />
        <div className="relative h-16 w-full bg-white/5 border border-white/10 rounded p-2 backdrop-blur-sm">
          <div className="h-2 bg-primary/60 rounded w-3/4" />
          <div className="h-1 bg-muted-foreground/40 rounded w-1/2 mt-1" />
        </div>
      </div>
    )
  }
];

// Spacing Options
export const SPACING_OPTIONS: LayoutOption[] = [
  {
    value: 'compact',
    label: 'Compacto',
    description: 'Espaçamento reduzido',
    preview: (
      <div className="w-full h-full flex flex-col gap-0.5 p-1">
        <div className="h-2 bg-primary/60 rounded" />
        <div className="h-2 bg-muted-foreground/40 rounded" />
        <div className="h-2 bg-muted-foreground/40 rounded" />
        <div className="h-2 bg-muted-foreground/40 rounded" />
      </div>
    )
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Espaçamento padrão',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2">
        <div className="h-2 bg-primary/60 rounded" />
        <div className="h-2 bg-muted-foreground/40 rounded" />
        <div className="h-2 bg-muted-foreground/40 rounded" />
      </div>
    )
  },
  {
    value: 'spacious',
    label: 'Espaçoso',
    description: 'Espaçamento amplo',
    preview: (
      <div className="w-full h-full flex flex-col gap-2 p-3">
        <div className="h-2 bg-primary/60 rounded" />
        <div className="h-2 bg-muted-foreground/40 rounded" />
      </div>
    )
  },
  {
    value: 'luxurious',
    label: 'Luxuoso',
    description: 'Muito espaçamento',
    preview: (
      <div className="w-full h-full flex flex-col gap-3 p-4">
        <div className="h-1 bg-primary/60 rounded" />
        <div className="h-1 bg-muted-foreground/40 rounded" />
      </div>
    )
  }
];

// Typography Options
export const TYPOGRAPHY_OPTIONS: LayoutOption[] = [
  {
    value: 'modern',
    label: 'Moderno',
    description: 'Tipografia contemporânea',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2 items-start">
        <div className="h-2 w-12 bg-primary/80 rounded font-semibold" />
        <div className="h-1 w-8 bg-muted-foreground/60 rounded" />
        <div className="h-1 w-10 bg-muted-foreground/40 rounded" />
      </div>
    )
  },
  {
    value: 'classic',
    label: 'Clássico',
    description: 'Tipografia tradicional',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2 items-start">
        <div className="h-2 w-10 bg-primary/80 rounded border-b border-primary/40" />
        <div className="h-1 w-8 bg-muted-foreground/60 rounded" />
        <div className="h-1 w-12 bg-muted-foreground/40 rounded" />
      </div>
    )
  },
  {
    value: 'minimal',
    label: 'Minimalista',
    description: 'Tipografia limpa',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2 items-start">
        <div className="h-1 w-8 bg-primary/60 rounded" />
        <div className="h-1 w-6 bg-muted-foreground/40 rounded" />
        <div className="h-1 w-10 bg-muted-foreground/30 rounded" />
      </div>
    )
  },
  {
    value: 'bold',
    label: 'Forte',
    description: 'Tipografia impactante',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2 items-start">
        <div className="h-3 w-10 bg-primary/90 rounded font-bold" />
        <div className="h-2 w-8 bg-muted-foreground/70 rounded" />
        <div className="h-1 w-6 bg-muted-foreground/50 rounded" />
      </div>
    )
  },
  {
    value: 'elegant',
    label: 'Elegante',
    description: 'Tipografia sofisticada',
    preview: (
      <div className="w-full h-full flex flex-col gap-1 p-2 items-start">
        <div className="h-2 w-12 bg-gradient-to-r from-primary/80 to-primary/60 rounded" />
        <div className="h-1 w-10 bg-muted-foreground/50 rounded italic" />
        <div className="h-1 w-8 bg-muted-foreground/30 rounded" />
      </div>
    )
  }
];