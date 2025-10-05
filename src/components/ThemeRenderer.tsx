import { ThemeConfig, THEME_PRESETS } from '@/types/theme';
import { Button } from '@/components/ui/button';
import { Eye, Download, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AppData {
  nome: string;
  descricao?: string;
  cor: string;
  icone_url?: string;
  capa_url?: string;
  produto_principal_url?: string;
  main_product_label?: string;
  main_product_description?: string;
  bonuses_label?: string;
  bonus1_url?: string;
  bonus1_label?: string;
  bonus1_thumbnail?: string;
  bonus2_url?: string;
  bonus2_label?: string;
  bonus2_thumbnail?: string;
  bonus3_url?: string;
  bonus3_label?: string;
  bonus3_thumbnail?: string;
  bonus4_url?: string;
  bonus4_label?: string;
  bonus4_thumbnail?: string;
  bonus5_url?: string;
  bonus5_label?: string;
  bonus6_url?: string;
  bonus6_label?: string;
  bonus7_url?: string;
  bonus7_label?: string;
  bonus8_url?: string;
  bonus8_label?: string;
  bonus9_url?: string;
  bonus9_label?: string;
  allow_pdf_download?: boolean;
  mainProductThumbnail?: string;
}

interface ThemeRendererProps {
  template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  appData: AppData;
  userPlanLimits?: number;
  onViewPdf?: (url: string, title: string) => void;
  onDownload?: (url: string, filename: string) => void;
  onTemplateChange?: (template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal') => void;
  isPreview?: boolean;
  customTheme?: any; // Allow custom theme overrides
}

export const ThemeRenderer = ({ 
  template, 
  appData, 
  userPlanLimits = 8, 
  onViewPdf, 
  onDownload, 
  onTemplateChange,
  isPreview = false,
  customTheme 
}: ThemeRendererProps) => {
  const [currentTime, setCurrentTime] = useState("");
  
  // Get theme config from preset or use custom theme
  const themeConfig = customTheme || THEME_PRESETS[template];
  
  useEffect(() => {
    if (isPreview) {
      const updateTime = () => {
        const now = new Date();
        const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // GMT-3
        const hours = brasiliaTime.getUTCHours().toString().padStart(2, '0');
        const minutes = brasiliaTime.getUTCMinutes().toString().padStart(2, '0');
        setCurrentTime(`${hours}:${minutes}`);
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Atualiza a cada minuto
      return () => clearInterval(interval);
    } else {
      setCurrentTime("9:41");
    }
  }, [isPreview]);

  const handleViewPdf = (url: string, title: string) => {
    if (onViewPdf) {
      onViewPdf(url, title);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    if (onDownload) {
      onDownload(url, filename);
    }
  };

  const renderStatusBar = () => {
    // Só mostra a barra de status na pré-visualização
    if (!isPreview) return null;
    
    return (
      <div className="flex justify-between items-center px-4 py-2 text-xs text-white">
        <span>{currentTime}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <span>100%</span>
      </div>
    );
  };

  const renderClassicTemplate = () => (
    <div className="min-h-screen bg-gray-900" style={{ backgroundColor: themeConfig.colors.background }}>
      {renderStatusBar()}
      
      {/* App Cover/Header */}
      <div 
        className="h-32 relative"
        style={{
          background: appData.capa_url 
            ? `url(${appData.capa_url}) center/cover` 
            : `linear-gradient(135deg, ${appData.cor}, ${appData.cor}88)`
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-black"
            style={{ backgroundColor: appData.cor }}
          >
            {appData.icone_url ? (
              <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
              <Smartphone className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{appData.nome}</h3>
            <p className="text-white/80 text-sm">{appData.descricao || "Descrição do App"}</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 space-y-4">
        {/* Main Product */}
        {appData.produto_principal_url && (
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: appData.cor }}>
                {appData.mainProductThumbnail ? (
                  <img src={appData.mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">PDF</span>
                )}
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{appData.main_product_label || "PRODUTO PRINCIPAL"}</h4>
                <p className="text-gray-400 text-xs">{appData.main_product_description || "Disponível para download"}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {appData.allow_pdf_download !== false && onDownload && (
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: appData.cor }}
                  onClick={() => handleDownload(appData.produto_principal_url!, 'produto-principal.pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button 
                variant={appData.allow_pdf_download === false ? "default" : "secondary"}
                style={appData.allow_pdf_download === false ? { backgroundColor: appData.cor, color: 'white' } : undefined}
                className={`${appData.allow_pdf_download === false ? 'flex-1 hover:opacity-90 transition-all' : 'flex-1 bg-gray-700 text-white hover:bg-gray-600'}`}
                onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "PRODUTO PRINCIPAL")}
              >
                <Eye className="w-4 h-4 mr-2" />
                <span>{appData.allow_pdf_download === false ? 'Visualizar PDF' : 'Ver'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Bonuses */}
        {userPlanLimits > 1 && (
          <div className="space-y-2">
            <h5 className="text-white font-medium text-sm">{appData.bonuses_label || "BÔNUS EXCLUSIVOS"}</h5>
            {[
              { url: appData.bonus1_url, label: appData.bonus1_label || "Bônus 1", thumbnail: appData.bonus1_thumbnail },
              { url: appData.bonus2_url, label: appData.bonus2_label || "Bônus 2", thumbnail: appData.bonus2_thumbnail },
              { url: appData.bonus3_url, label: appData.bonus3_label || "Bônus 3", thumbnail: appData.bonus3_thumbnail },
              { url: appData.bonus4_url, label: appData.bonus4_label || "Bônus 4", thumbnail: appData.bonus4_thumbnail },
              { url: appData.bonus5_url, label: appData.bonus5_label || "Bônus 5" },
              { url: appData.bonus6_url, label: appData.bonus6_label || "Bônus 6" },
              { url: appData.bonus7_url, label: appData.bonus7_label || "Bônus 7" },
              { url: appData.bonus8_url, label: appData.bonus8_label || "Bônus 8" },
              { url: appData.bonus9_url, label: appData.bonus9_label || "Bônus 9" }
            ].filter((bonus, index) => {
              return index < (userPlanLimits - 1) && bonus.url;
            }).map((bonus, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${appData.cor}20` }}>
                    {bonus.thumbnail ? (
                      <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent text-xs">🎁</span>
                    )}
                  </div>
                  <span className="text-gray-300 text-xs">{bonus.label}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={appData.allow_pdf_download === false ? "default" : "secondary"}
                    style={appData.allow_pdf_download === false ? { backgroundColor: appData.cor, color: 'white' } : undefined}
                    className={`${appData.allow_pdf_download === false ? 'hover:opacity-90 transition-all' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    <span>{appData.allow_pdf_download === false ? 'Visualizar' : 'Ver'}</span>
                  </Button>
                  {appData.allow_pdf_download !== false && onDownload && (
                    <Button
                      size="sm"
                      style={{ backgroundColor: appData.cor }}
                      onClick={() => handleDownload(bonus.url!, `bonus-${index + 1}.pdf`)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCorporateTemplate = () => (
    <div className="min-h-screen bg-gray-900" style={{ backgroundColor: themeConfig.colors.background }}>
      {renderStatusBar()}

      {/* Top Navigation Bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: appData.cor }}
          >
            {appData.icone_url ? (
              <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
              <Smartphone className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{appData.nome}</h3>
            <p className="text-gray-400 text-xs">{appData.descricao || "Descrição do App"}</p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 p-6 bg-gray-800 max-w-4xl mx-auto">
        {/* Main Product Card - Centralized and Enhanced */}
        {appData.produto_principal_url && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg" style={{ backgroundColor: appData.cor }}>
                {appData.mainProductThumbnail ? (
                  <img src={appData.mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-lg font-bold">PDF</span>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-bold text-lg">{appData.main_product_label || "PRODUTO PRINCIPAL"}</h4>
                <p className="text-gray-400 text-sm max-w-md">{appData.main_product_description || "Disponível para download"}</p>
              </div>
              <div className="flex space-x-3">
                {appData.allow_pdf_download !== false && onDownload && (
                  <button 
                    className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-md"
                    style={{ backgroundColor: appData.cor }}
                    onClick={() => handleDownload(appData.produto_principal_url!, 'produto-principal.pdf')}
                  >
                    Download PDF
                  </button>
                )}
                <button 
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${appData.allow_pdf_download === false ? 'text-white shadow-md' : 'text-gray-300 border border-gray-600 hover:bg-white/5'}`}
                  style={appData.allow_pdf_download === false ? { backgroundColor: appData.cor } : undefined}
                  onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "PRODUTO PRINCIPAL")}
                >
                  {appData.allow_pdf_download === false ? 'Visualizar PDF' : 'Visualizar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bonus Grid - Symmetrical Layout */}
        {userPlanLimits > 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h5 className="text-gray-200 font-bold text-lg mb-2">{appData.bonuses_label || "BÔNUS EXCLUSIVOS"}</h5>
              <div className="w-16 h-0.5 bg-gray-600 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { url: appData.bonus1_url, label: appData.bonus1_label || "Bônus 1", thumbnail: appData.bonus1_thumbnail },
                { url: appData.bonus2_url, label: appData.bonus2_label || "Bônus 2", thumbnail: appData.bonus2_thumbnail },
                { url: appData.bonus3_url, label: appData.bonus3_label || "Bônus 3", thumbnail: appData.bonus3_thumbnail },
                { url: appData.bonus4_url, label: appData.bonus4_label || "Bônus 4", thumbnail: appData.bonus4_thumbnail },
                { url: appData.bonus5_url, label: appData.bonus5_label || "Bônus 5" },
                { url: appData.bonus6_url, label: appData.bonus6_label || "Bônus 6" },
                { url: appData.bonus7_url, label: appData.bonus7_label || "Bônus 7" },
                { url: appData.bonus8_url, label: appData.bonus8_label || "Bônus 8" },
                { url: appData.bonus9_url, label: appData.bonus9_label || "Bônus 9" }
              ].filter((bonus, index) => {
                return index < (userPlanLimits - 1) && bonus.url;
              }).map((bonus, index) => (
                <div key={index} className="bg-gray-900 border border-gray-600/50 rounded-lg p-4 hover:border-gray-500/50 transition-all shadow-md">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shadow-sm" style={{ backgroundColor: `${appData.cor}20` }}>
                      {bonus.thumbnail ? (
                        <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-accent text-sm">🎁</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-200 text-sm font-medium block">{bonus.label}</span>
                    </div>
                    <div className="flex flex-col space-y-2 w-full">
                      <button 
                        className={`text-xs px-3 py-2 rounded-md transition-all w-full ${appData.allow_pdf_download === false ? 'text-white shadow-sm' : 'text-white bg-gray-700 hover:bg-gray-600'}`}
                        style={appData.allow_pdf_download === false ? { backgroundColor: appData.cor } : undefined}
                        onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                      >
                        {appData.allow_pdf_download === false ? 'Visualizar' : 'Ver PDF'}
                      </button>
                      {appData.allow_pdf_download !== false && onDownload && (
                        <button 
                          className="text-xs px-3 py-2 rounded-md text-white transition-all hover:opacity-90 shadow-sm w-full"
                          style={{ backgroundColor: appData.cor }}
                          onClick={() => handleDownload(bonus.url!, `bonus-${index + 1}.pdf`)}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderShowcaseTemplate = () => (
    <div className="min-h-screen bg-black" style={{ backgroundColor: themeConfig.colors.background }}>
      {/* Full Cover Header */}
      <div 
        className="h-40 relative"
        style={{
          background: appData.capa_url 
            ? `url(${appData.capa_url}) center/cover` 
            : `linear-gradient(135deg, ${appData.cor}, ${appData.cor}88)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        
        {/* Status Bar Overlay - só na pré-visualização */}
        {isPreview && (
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 text-xs text-white/90">
            <span>{currentTime}</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white/90 rounded-full"></div>
              <div className="w-1 h-1 bg-white/90 rounded-full"></div>
              <div className="w-1 h-1 bg-white/90 rounded-full"></div>
            </div>
            <span>100%</span>
          </div>
        )}

        {/* Centered App Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl overflow-hidden border-3 border-white/20 mx-auto mb-2"
            style={{ backgroundColor: appData.cor }}
          >
            {appData.icone_url ? (
              <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
              <Smartphone className="w-8 h-8 text-white" />
            )}
          </div>
          <h3 className="text-white font-bold text-lg">{appData.nome}</h3>
          <p className="text-white/80 text-sm">{appData.descricao || "Descrição do App"}</p>
        </div>
      </div>

      {/* Content Cards */}
      <div className="flex-1 p-4 space-y-4 bg-gradient-to-b from-purple-900/20 to-black">
        {/* Featured Product - Large Visual Card */}
        {appData.produto_principal_url && (
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3" style={{ backgroundColor: appData.cor }}>
              {appData.mainProductThumbnail ? (
                <img src={appData.mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-lg font-bold">📄</span>
              )}
            </div>
            <h4 className="text-white font-bold text-sm mb-2">{appData.main_product_label || "PRODUTO PRINCIPAL"}</h4>
            <p className="text-purple-200 text-xs mb-4">{appData.main_product_description || "Disponível para download"}</p>
            <div className="flex space-x-2 justify-center">
              {appData.allow_pdf_download !== false && onDownload && (
                <button 
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${appData.cor}, ${appData.cor}dd)`,
                    boxShadow: `0 4px 15px ${appData.cor}30`
                  }}
                  onClick={() => handleDownload(appData.produto_principal_url!, 'produto-principal.pdf')}
                >
                  ✨ Download
                </button>
              )}
              <button 
                className={`px-4 py-2 rounded-xl text-sm font-bold ${appData.allow_pdf_download === false ? 'text-white shadow-lg' : 'text-purple-200 border border-purple-500/30'}`}
                style={appData.allow_pdf_download === false ? { 
                  background: `linear-gradient(135deg, ${appData.cor}, ${appData.cor}dd)`,
                  boxShadow: `0 4px 15px ${appData.cor}30`
                } : undefined}
                onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "PRODUTO PRINCIPAL")}
              >
                ✨ {appData.allow_pdf_download === false ? 'Visualizar PDF' : 'Ver'}
              </button>
            </div>
          </div>
        )}

        {/* Bonus Showcase */}
        {userPlanLimits > 1 && (
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm text-center">{appData.bonuses_label || "BÔNUS EXCLUSIVOS"}</h5>
            {[
              { url: appData.bonus1_url, label: appData.bonus1_label || "Bônus 1", thumbnail: appData.bonus1_thumbnail },
              { url: appData.bonus2_url, label: appData.bonus2_label || "Bônus 2", thumbnail: appData.bonus2_thumbnail },
              { url: appData.bonus3_url, label: appData.bonus3_label || "Bônus 3", thumbnail: appData.bonus3_thumbnail },
              { url: appData.bonus4_url, label: appData.bonus4_label || "Bônus 4", thumbnail: appData.bonus4_thumbnail },
              { url: appData.bonus5_url, label: appData.bonus5_label || "Bônus 5" },
              { url: appData.bonus6_url, label: appData.bonus6_label || "Bônus 6" },
              { url: appData.bonus7_url, label: appData.bonus7_label || "Bônus 7" },
              { url: appData.bonus8_url, label: appData.bonus8_label || "Bônus 8" },
              { url: appData.bonus9_url, label: appData.bonus9_label || "Bônus 9" }
            ].filter((bonus, index) => {
              return index < (userPlanLimits - 1) && bonus.url;
            }).map((bonus, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-400/20 rounded-xl p-3 mx-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${appData.cor}40` }}>
                    {bonus.thumbnail ? (
                      <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm">🎁</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-medium text-xs block">{bonus.label}</span>
                    <p className="text-purple-200/80 text-xs">Bônus exclusivo</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-purple-300 hover:text-purple-200 transition-colors"
                      onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {appData.allow_pdf_download !== false && onDownload && (
                      <button 
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                        onClick={() => handleDownload(bonus.url!, `bonus-${index + 1}.pdf`)}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderModernTemplate = () => (
    <div className="min-h-screen bg-gray-950" style={{ backgroundColor: themeConfig.colors.background }}>
      {renderStatusBar()}
      
      {/* Minimalist header */}
      <div className="px-6 py-8 text-center border-b border-gray-800">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: appData.cor }}
        >
          {appData.icone_url ? (
            <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Smartphone className="w-10 h-10 text-white" />
          )}
        </div>
        <h1 className="text-white text-2xl font-light mb-2">{appData.nome}</h1>
        <p className="text-gray-400 text-sm">{appData.descricao || "Descrição do App"}</p>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Main product with modern card */}
        {appData.produto_principal_url && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 hover:bg-gray-900/70 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${appData.cor}20` }}
              >
                {appData.mainProductThumbnail ? (
                  <img src={appData.mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="text-white font-medium">PDF</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-lg mb-1 truncate">{appData.main_product_label || "PRODUTO PRINCIPAL"}</h3>
                <p className="text-gray-400 text-sm mb-4">{appData.main_product_description || "Disponível para download"}</p>
                <div className="flex space-x-3">
                  {appData.allow_pdf_download !== false && onDownload && (
                    <button
                      className="px-6 py-2 rounded-2xl text-white font-medium text-sm transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: appData.cor }}
                      onClick={() => handleDownload(appData.produto_principal_url!, 'produto-principal.pdf')}
                    >
                      Download
                    </button>
                  )}
                  <button
                    className={`px-6 py-2 rounded-2xl font-medium text-sm transition-all duration-200 hover:scale-105 ${appData.allow_pdf_download === false ? 'text-white' : 'text-gray-300 border border-gray-700 hover:border-gray-600'}`}
                    style={appData.allow_pdf_download === false ? { backgroundColor: appData.cor } : undefined}
                    onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "PRODUTO PRINCIPAL")}
                  >
                    {appData.allow_pdf_download === false ? 'Visualizar PDF' : 'Visualizar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bonuses with modern styling */}
        {userPlanLimits > 1 && (
          <div className="space-y-4">
            <h4 className="text-white font-light text-lg">{appData.bonuses_label || "BÔNUS EXCLUSIVOS"}</h4>
            <div className="space-y-3">
              {[
                { url: appData.bonus1_url, label: appData.bonus1_label || "Bônus 1", thumbnail: appData.bonus1_thumbnail },
                { url: appData.bonus2_url, label: appData.bonus2_label || "Bônus 2", thumbnail: appData.bonus2_thumbnail },
                { url: appData.bonus3_url, label: appData.bonus3_label || "Bônus 3", thumbnail: appData.bonus3_thumbnail },
                { url: appData.bonus4_url, label: appData.bonus4_label || "Bônus 4", thumbnail: appData.bonus4_thumbnail },
                { url: appData.bonus5_url, label: appData.bonus5_label || "Bônus 5" },
                { url: appData.bonus6_url, label: appData.bonus6_label || "Bônus 6" },
                { url: appData.bonus7_url, label: appData.bonus7_label || "Bônus 7" },
                { url: appData.bonus8_url, label: appData.bonus8_label || "Bônus 8" },
                { url: appData.bonus9_url, label: appData.bonus9_label || "Bônus 9" }
              ].filter((bonus, index) => {
                return index < (userPlanLimits - 1) && bonus.url;
              }).map((bonus, index) => (
                <div key={index} className="bg-gray-900/30 border border-gray-800 rounded-2xl p-4 hover:bg-gray-900/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${appData.cor}15` }}
                      >
                        {bonus.thumbnail ? (
                          <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-sm">🎁</span>
                        )}
                      </div>
                      <span className="text-gray-300 font-medium">{bonus.label}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                        onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {appData.allow_pdf_download !== false && onDownload && (
                        <button
                          className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                          onClick={() => handleDownload(bonus.url!, `bonus-${index + 1}.pdf`)}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className="min-h-screen bg-white text-gray-900" style={{ backgroundColor: themeConfig.colors.background, color: themeConfig.colors.text }}>
      {/* Clean header */}
      <div className="px-8 py-12 text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: appData.cor }}
        >
          {appData.icone_url ? (
            <img src={appData.icone_url} alt="App Icon" className="w-full h-full object-cover rounded-full" />
          ) : (
            <Smartphone className="w-8 h-8 text-white" />
          )}
        </div>
        <h1 className="text-3xl font-light mb-3" style={{ color: themeConfig.colors.text }}>{appData.nome}</h1>
        <p style={{ color: themeConfig.colors.textSecondary }}>{appData.descricao || "Descrição do App"}</p>
      </div>

      <div className="px-8 pb-12 space-y-8">
        {/* Clean main product */}
        {appData.produto_principal_url && (
          <div className="border border-gray-200 rounded-xl p-6" style={{ borderColor: `${themeConfig.colors.surface}40` }}>
            <h3 className="font-medium text-xl mb-2" style={{ color: themeConfig.colors.text }}>
              {appData.main_product_label || "PRODUTO PRINCIPAL"}
            </h3>
            <p className="mb-6" style={{ color: themeConfig.colors.textSecondary }}>
              {appData.main_product_description || "Disponível para download"}
            </p>
            <div className="flex space-x-3">
              {appData.allow_pdf_download !== false && onDownload && (
                <button
                  className="px-8 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: appData.cor }}
                  onClick={() => handleDownload(appData.produto_principal_url!, 'produto-principal.pdf')}
                >
                  Download
                </button>
              )}
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 ${appData.allow_pdf_download === false ? 'text-white' : 'border'}`}
                style={appData.allow_pdf_download === false ? 
                  { backgroundColor: appData.cor } : 
                  { borderColor: themeConfig.colors.surface, color: themeConfig.colors.text }
                }
                onClick={() => handleViewPdf(appData.produto_principal_url!, appData.main_product_label || "PRODUTO PRINCIPAL")}
              >
                {appData.allow_pdf_download === false ? 'Visualizar PDF' : 'Visualizar'}
              </button>
            </div>
          </div>
        )}

        {/* Clean bonuses */}
        {userPlanLimits > 1 && (
          <div className="space-y-4">
            <h4 className="font-light text-xl" style={{ color: themeConfig.colors.text }}>
              {appData.bonuses_label || "BÔNUS EXCLUSIVOS"}
            </h4>
            <div className="space-y-3">
              {[
                { url: appData.bonus1_url, label: appData.bonus1_label || "Bônus 1", thumbnail: appData.bonus1_thumbnail },
                { url: appData.bonus2_url, label: appData.bonus2_label || "Bônus 2", thumbnail: appData.bonus2_thumbnail },
                { url: appData.bonus3_url, label: appData.bonus3_label || "Bônus 3", thumbnail: appData.bonus3_thumbnail },
                { url: appData.bonus4_url, label: appData.bonus4_label || "Bônus 4", thumbnail: appData.bonus4_thumbnail },
                { url: appData.bonus5_url, label: appData.bonus5_label || "Bônus 5" },
                { url: appData.bonus6_url, label: appData.bonus6_label || "Bônus 6" },
                { url: appData.bonus7_url, label: appData.bonus7_label || "Bônus 7" },
                { url: appData.bonus8_url, label: appData.bonus8_label || "Bônus 8" },
                { url: appData.bonus9_url, label: appData.bonus9_label || "Bônus 9" }
              ].filter((bonus, index) => {
                return index < (userPlanLimits - 1) && bonus.url;
              }).map((bonus, index) => (
                <div key={index} className="border rounded-lg p-4 flex items-center justify-between" style={{ borderColor: `${themeConfig.colors.surface}40` }}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${appData.cor}15` }}
                    >
                      {bonus.thumbnail ? (
                        <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span>🎁</span>
                      )}
                    </div>
                    <span style={{ color: themeConfig.colors.text }}>{bonus.label}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: themeConfig.colors.textSecondary }}
                      onClick={() => handleViewPdf(bonus.url!, bonus.label)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {appData.allow_pdf_download !== false && onDownload && (
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: themeConfig.colors.textSecondary }}
                        onClick={() => handleDownload(bonus.url!, `bonus-${index + 1}.pdf`)}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render based on template
  switch (template) {
    case 'corporate':
      return renderCorporateTemplate();
    case 'showcase':
      return renderShowcaseTemplate();
    case 'modern':
      return renderModernTemplate();
    case 'minimal':
      return renderMinimalTemplate();
    default:
      return renderClassicTemplate();
  }
};