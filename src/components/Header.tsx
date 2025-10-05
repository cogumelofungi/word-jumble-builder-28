import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RotateCcw, Globe, Sun, Moon, LogOut } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { ProfileDialog } from "@/components/ProfileDialog";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

interface HeaderProps {
  onResetApp?: () => void;
}

const Header = ({ onResetApp }: HeaderProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { platformName } = usePlatformSettings();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-app-surface/95 backdrop-blur-sm border-b border-app-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">AB</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{platformName}</h1>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("pt")}>
                🇧🇷 Português
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("es")}>
                🇪🇸 Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Profile */}
          <ProfileDialog />

          {/* Reset App */}
          {onResetApp && (
            <Button variant="ghost" size="sm" onClick={onResetApp} className="h-8 w-8 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Logout */}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;