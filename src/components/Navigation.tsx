import { useState } from "react";
import { Search, Plus, Bell, User, Settings, List, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddProgramDialog } from "./AddProgramDialog";
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";
import { Program } from "@/data/programs";

interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  activeCategory: string;
  onAddProgram: (program: Program) => void;
  onOpenPlaylists?: () => void;
}

const categories = [
  { id: "home", name: "Início" },
  { id: "series", name: "Séries" },
  { id: "movies", name: "Filmes" },
  { id: "favorites", name: "Minha Lista" },
  { id: "recent", name: "Adicionados Recentemente" }
];

export function Navigation({ onSearch, onCategoryChange, activeCategory, onAddProgram, onOpenPlaylists }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <header className="main-header fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-foreground hidden xs:block">StreamVault</span>
              <span className="text-lg font-semibold text-foreground block xs:hidden">SV</span>
            </div>

            {/* Navigation Categories - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-md ${
                    activeCategory === category.id
                      ? "text-foreground bg-secondary/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative">
              {isSearchVisible ? (
                <div className="search-input flex items-center rounded-lg overflow-hidden min-w-[200px] sm:min-w-[250px]">
                  <Search className="w-4 h-4 text-muted-foreground ml-3" />
                  <Input
                    type="text"
                    placeholder="Buscar títulos..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchVisible(false)}
                    className="bg-transparent border-0 focus:ring-0 text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchVisible(true)}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>

            <AddProgramDialog onAddProgram={onAddProgram} />
            
            <Link to="/versao">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                Versão
              </Button>
            </Link>

            {onOpenPlaylists && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenPlaylists}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <List className="w-5 h-5" />
              </Button>
            )}

            <ThemeToggle />
            
            <Link to="/painel">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="search-input flex items-center rounded-lg overflow-hidden">
                <Search className="w-4 h-4 text-muted-foreground ml-3" />
                <Input
                  type="text"
                  placeholder="Buscar títulos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-0 focus:ring-0 text-sm"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-sm font-medium transition-colors duration-200 p-3 rounded-lg text-left ${
                      activeCategory === category.id
                        ? "text-foreground bg-secondary/70"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <AddProgramDialog onAddProgram={onAddProgram} />
                  {onOpenPlaylists && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onOpenPlaylists}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/versao">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Versão
                    </Button>
                  </Link>
                  <Link to="/painel">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}