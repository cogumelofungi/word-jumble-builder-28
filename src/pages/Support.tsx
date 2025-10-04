import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SupportSettings {
  support_whatsapp_link?: string;
  support_title?: string;
  support_description?: string;
  support_button_text?: string;
}

const Support = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SupportSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSupportSettings();
  }, []);

  const fetchSupportSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['support_whatsapp_link', 'support_title', 'support_description', 'support_button_text']);

      if (error) throw error;

      const settingsObj: SupportSettings = {};
      data?.forEach(setting => {
        settingsObj[setting.key as keyof SupportSettings] = setting.value;
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching support settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de suporte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = () => {
    const whatsappLink = settings.support_whatsapp_link;
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    } else {
      // Fallback para email se não houver WhatsApp configurado
      const supportEmail = "suporte@exemplo.com";
      const subject = "Solicitação de Suporte";
      const body = "Olá, preciso de ajuda.";
      const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {settings.support_title || 'Central de Suporte'}
          </CardTitle>
          <CardDescription className="text-center">
            {settings.support_description || 'Entre em contato conosco para obter ajuda e suporte especializado.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={handleContactSupport}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {settings.support_button_text || 'Entrar em Contato'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Responderemos o mais rápido possível</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;