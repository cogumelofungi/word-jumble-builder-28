import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Upload, Palette, Type, Image, Link, Globe, Layout, Lock, Crown } from "lucide-react";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { usePremiumTemplates } from "@/hooks/usePremiumTemplates";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import CustomDomainDialog from "./CustomDomainDialog";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { getAppDomainForDisplay } from "@/config/domains";

interface CustomizationPanelProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const CustomizationPanel = ({ appBuilder }: CustomizationPanelProps) => {
  const { t } = useLanguage();
  const { maxProducts } = usePlanLimits();
  const { hasPremiumAccess, isLoading: premiumLoading } = usePremiumTemplates();
  const { hasCustomDomain, hasAppImport } = useFeatureAccess();
  const appData = appBuilder?.appData || {
    appName: '', 
    appDescription: '',
    appColor: '#4783F6', 
    customLink: '', 
    customDomain: '',
    allowPdfDownload: true,
    template: 'classic' as 'classic' | 'corporate' | 'showcase',
    appIcon: undefined, 
    appCover: undefined,
    mainProduct: undefined,
    mainProductThumbnail: undefined,
    bonus1: undefined,
    bonus1Thumbnail: undefined,
    bonus2: undefined,
    bonus2Thumbnail: undefined,
    bonus3: undefined,
    bonus3Thumbnail: undefined,
    bonus4: undefined,
    bonus4Thumbnail: undefined,
    bonus5: undefined,
    bonus5Thumbnail: undefined,
    bonus6: undefined,
    bonus6Thumbnail: undefined,
    bonus7: undefined,
    bonus7Thumbnail: undefined,
    bonus8: undefined,
    bonus8Thumbnail: undefined,
    bonus9: undefined,
    bonus9Thumbnail: undefined,
    mainProductLabel: 'PRODUTO PRINCIPAL',
    mainProductDescription: 'Disponível para download',
    bonusesLabel: 'BÔNUS EXCLUSIVOS',
    bonus1Label: 'Bônus 1',
    bonus2Label: 'Bônus 2',
    bonus3Label: 'Bônus 3',
    bonus4Label: 'Bônus 4',
    bonus5Label: 'Bônus 5',
    bonus6Label: 'Bônus 6',
    bonus7Label: 'Bônus 7',
    bonus8Label: 'Bônus 8',
    bonus9Label: 'Bônus 9'
  };
  const updateAppData = appBuilder?.updateAppData || (() => {});
  const handleFileUpload = appBuilder?.handleFileUpload || (() => Promise.resolve());
  const resetApp = appBuilder?.resetApp || (() => Promise.resolve());
  const isLoading = appBuilder?.isLoading || false;

  return (
    <Card className="bg-app-surface border-app-border p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t("custom.title")}</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetApp}
          disabled={isLoading}
          className="border-app-border hover:bg-app-surface-hover w-full sm:w-auto"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("custom.reset")}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-app-surface-hover h-auto sm:h-10">
          <TabsTrigger value="general" className="data-[state=active]:bg-background h-10">{t("custom.tabs.general")}</TabsTrigger>
          <TabsTrigger value="labels" className="data-[state=active]:bg-background h-10">{t("custom.tabs.labels")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="app-name" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.name")}</span>
            </Label>
            <Input
              id="app-name"
              value={appData.appName}
              onChange={(e) => updateAppData('appName', e.target.value)}
              placeholder={t("custom.name.placeholder")}
              className="bg-app-surface-hover border-app-border focus:border-primary"
            />
          </div>

          {/* App Description */}
          <div className="space-y-2">
            <Label htmlFor="app-description" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.description")}</span>
            </Label>
            <Input
              id="app-description"
              value={appData.appDescription}
              onChange={(e) => updateAppData('appDescription', e.target.value)}
              placeholder={t("custom.description.placeholder")}
              className="bg-app-surface-hover border-app-border focus:border-primary"
            />
          </div>

          {/* App Color */}
          <div className="space-y-2">
            <Label htmlFor="app-color" className="flex items-center space-x-2 text-foreground">
              <Palette className="w-4 h-4" />
              <span>{t("custom.color")}</span>
            </Label>
            <div className="flex space-x-3">
              <Input
                id="app-color"
                type="color"
                value={appData.appColor}
                onChange={(e) => updateAppData('appColor', e.target.value)}
                className="w-16 h-10 bg-app-surface-hover border-app-border cursor-pointer"
              />
              <Input
                value={appData.appColor}
                onChange={(e) => updateAppData('appColor', e.target.value)}
                placeholder="#4783F6"
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
          </div>

          {/* App Icon Upload */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-foreground">
              <Upload className="w-4 h-4" />
              <span>{t("custom.icon")}</span>
            </Label>
            <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-16 h-16 bg-app-surface-hover rounded-xl flex items-center justify-center">
                  {appData.appIcon ? (
                    <img 
                      src={appData.appIcon.url} 
                      alt="App Icon" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-app-muted" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground">PNG 512x512</p>
                  <p className="text-xs text-app-muted">Fundo transparente recomendado</p>
                </div>
              </div>
              <Input
                type="file"
                accept=".png"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('appIcon', file, 'icon');
                }}
              />
            </div>
          </div>

          {/* App Cover Upload */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-foreground">
              <Image className="w-4 h-4" />
              <span>{t("custom.cover")}</span>
            </Label>
            <div className="upload-zone relative cursor-pointer hover:bg-app-surface-hover rounded-xl transition-colors">
              <div className="flex flex-col items-center space-y-2 p-4">
                <div className="w-full h-24 bg-app-surface-hover rounded-xl flex items-center justify-center overflow-hidden">
                  {appData.appCover ? (
                    <img 
                      src={appData.appCover.url} 
                      alt="App Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-app-muted" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground">PNG ou JPG 1920x1080</p>
                  <p className="text-xs text-app-muted">Imagem de fundo do app</p>
                </div>
              </div>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('appCover', file, 'cover');
                }}
              />
            </div>
          </div>

          {/* Custom Link */}
          <div className="space-y-2">
            <Label htmlFor="custom-link" className="flex items-center space-x-2 text-foreground">
              <Link className="w-4 h-4" />
              <span>{t("custom.link")}</span>
            </Label>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="text-sm text-app-muted break-all">{getAppDomainForDisplay()}</span>
              <Input
                id="custom-link"
                value={appData.customLink}
                onChange={(e) => updateAppData('customLink', e.target.value)}
                placeholder={t("custom.link.placeholder")}
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
            <p className="text-xs text-app-muted">
              {t("custom.link.help")}
            </p>
          </div>

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-foreground">
              <Globe className="w-4 h-4" />
              <span>{t("custom.domain")}</span>
            </Label>
            <CustomDomainDialog>
              <Button 
                variant="outline" 
                className="justify-start text-foreground border-app-border hover:bg-app-surface-hover"
              >
                <span className="underline">{t("domain.button")}</span>
              </Button>
            </CustomDomainDialog>
          </div>
        </TabsContent>


        <TabsContent value="labels" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Main Product Label */}
          <div className="space-y-2">
            <Label htmlFor="main-product-label" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.main.title")}</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="main-product-label"
                value={appData.mainProductLabel}
                onChange={(e) => updateAppData('mainProductLabel', e.target.value)}
                placeholder={t('phone.main.title')}
                className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                  title="Upload de miniatura PWA"
                >
                  {appData.mainProductThumbnail ? (
                    <img 
                      src={appData.mainProductThumbnail.url} 
                      alt="Miniatura Principal" 
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <Image className="w-4 h-4 text-app-muted" />
                  )}
                </Button>
                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('mainProductThumbnail', file, 'main-thumbnail');
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-app-muted">Clique no ícone para fazer upload da miniatura PWA (PNG/JPG 512x512)</p>
          </div>

          {/* Main Product Description */}
          <div className="space-y-2">
            <Label htmlFor="main-product-description" className="flex items-center space-x-2 text-foreground">
              <Type className="w-4 h-4" />
              <span>{t("custom.main.description")}</span>
            </Label>
            <Input
              id="main-product-description"
              type="text"
              value={appData.mainProductDescription}
              onChange={(e) => updateAppData('mainProductDescription', e.target.value)}
              placeholder={t('phone.main.description')}
              className="bg-app-surface-hover border-app-border focus:border-primary"
            />
          </div>

          {/* Bonuses Label */}
          {maxProducts > 1 && (
            <div className="space-y-2">
              <Label htmlFor="bonuses-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonuses.title")}</span>
              </Label>
              <Input
                id="bonuses-label"
                value={appData.bonusesLabel}
                onChange={(e) => updateAppData('bonusesLabel', e.target.value)}
                placeholder={t('phone.bonus.title')}
                className="bg-app-surface-hover border-app-border focus:border-primary"
              />
            </div>
          )}

          {/* Bonus 1 Label */}
          {maxProducts > 1 && (
            <div className="space-y-2">
              <Label htmlFor="bonus1-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 1</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus1-label"
                  value={appData.bonus1Label}
                  onChange={(e) => updateAppData('bonus1Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 1'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus1Thumbnail ? (
                      <img 
                        src={appData.bonus1Thumbnail.url} 
                        alt="Miniatura Bônus 1" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus1Thumbnail', file, 'bonus1-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 2 Label */}
          {maxProducts > 2 && (
            <div className="space-y-2">
              <Label htmlFor="bonus2-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 2</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus2-label"
                  value={appData.bonus2Label}
                  onChange={(e) => updateAppData('bonus2Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 2'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus2Thumbnail ? (
                      <img 
                        src={appData.bonus2Thumbnail.url} 
                        alt="Miniatura Bônus 2" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus2Thumbnail', file, 'bonus2-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 3 Label */}
          {maxProducts > 3 && (
            <div className="space-y-2">
              <Label htmlFor="bonus3-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 3</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus3-label"
                  value={appData.bonus3Label}
                  onChange={(e) => updateAppData('bonus3Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 3'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus3Thumbnail ? (
                      <img 
                        src={appData.bonus3Thumbnail.url} 
                        alt="Miniatura Bônus 3" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus3Thumbnail', file, 'bonus3-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 4 Label */}
          {maxProducts > 4 && (
            <div className="space-y-2">
              <Label htmlFor="bonus4-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 4</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus4-label"
                  value={appData.bonus4Label}
                  onChange={(e) => updateAppData('bonus4Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 4'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus4Thumbnail ? (
                      <img 
                        src={appData.bonus4Thumbnail.url} 
                        alt="Miniatura Bônus 4" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus4Thumbnail', file, 'bonus4-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 5 Label */}
          {maxProducts > 5 && (
            <div className="space-y-2">
              <Label htmlFor="bonus5-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 5</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus5-label"
                  value={appData.bonus5Label}
                  onChange={(e) => updateAppData('bonus5Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 5'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus5Thumbnail ? (
                      <img 
                        src={appData.bonus5Thumbnail.url} 
                        alt="Miniatura Bônus 5" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus5Thumbnail', file, 'bonus5-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 6 Label */}
          {maxProducts > 6 && (
            <div className="space-y-2">
              <Label htmlFor="bonus6-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 6</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus6-label"
                  value={appData.bonus6Label}
                  onChange={(e) => updateAppData('bonus6Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 6'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus6Thumbnail ? (
                      <img 
                        src={appData.bonus6Thumbnail.url} 
                        alt="Miniatura Bônus 6" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus6Thumbnail', file, 'bonus6-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 7 Label */}
          {maxProducts > 7 && (
            <div className="space-y-2">
              <Label htmlFor="bonus7-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 7</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus7-label"
                  value={appData.bonus7Label}
                  onChange={(e) => updateAppData('bonus7Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 7'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus7Thumbnail ? (
                      <img 
                        src={appData.bonus7Thumbnail.url} 
                        alt="Miniatura Bônus 7" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus7Thumbnail', file, 'bonus7-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 8 Label */}
          {maxProducts > 8 && (
            <div className="space-y-2">
              <Label htmlFor="bonus8-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 8</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus8-label"
                  value={appData.bonus8Label}
                  onChange={(e) => updateAppData('bonus8Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 8'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus8Thumbnail ? (
                      <img 
                        src={appData.bonus8Thumbnail.url} 
                        alt="Miniatura Bônus 8" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus8Thumbnail', file, 'bonus8-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bonus 9 Label */}
          {maxProducts > 9 && (
            <div className="space-y-2">
              <Label htmlFor="bonus9-label" className="flex items-center space-x-2 text-foreground">
                <Type className="w-4 h-4" />
                <span>{t("custom.bonus.name")} 9</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="bonus9-label"
                  value={appData.bonus9Label}
                  onChange={(e) => updateAppData('bonus9Label', e.target.value)}
                  placeholder={t('custom.bonus.name') + ' 9'}
                  className="flex-1 bg-app-surface-hover border-app-border focus:border-primary"
                />
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 border-app-border hover:bg-app-surface-hover"
                    title="Upload de miniatura PWA"
                  >
                    {appData.bonus9Thumbnail ? (
                      <img 
                        src={appData.bonus9Thumbnail.url} 
                        alt="Miniatura Bônus 9" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-app-muted" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('bonus9Thumbnail', file, 'bonus9-thumbnail');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CustomizationPanel;