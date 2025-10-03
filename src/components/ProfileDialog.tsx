import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trash2, Edit, RefreshCw, RotateCcw, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useSubscriptionHistory } from "@/hooks/useSubscriptionHistory";
import { usePlanManagement } from "@/hooks/usePlanManagement";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { CreditCard, ArrowDown } from "lucide-react";

interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
}

interface UserApp {
  id: string;
  nome: string;
  status: string;
  created_at: string;
  updated_at: string;
  slug: string;
}

export const ProfileDialog = () => {
  const { user } = useAuth();
  const { updateProfile } = useAuthActions();
  const { toast } = useToast();
  const { planName, hasActivePlan, isLoading: loadingPlan } = useUserPlan();
  const { hasEverSubscribed, isLoading: loadingHistory } = useSubscriptionHistory();
  const { canDowngrade } = usePlanManagement();
  const { subscribed: hasStripeSubscription, refresh: refreshSubscription } = useStripeSubscription();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userApps, setUserApps] = useState<UserApp[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
      fetchUserApps();
    }
  }, [user, isOpen]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return;
      }

      // Se não existe registro na tabela profiles, criar um
      if (!data) {
        const phoneFromMetadata = user.user_metadata?.phone || "";
        const fullNameFromMetadata = user.user_metadata?.full_name || user.user_metadata?.display_name || "";
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || "",
            full_name: fullNameFromMetadata,
            phone: phoneFromMetadata
          });

        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
        }

        setProfile({
          full_name: fullNameFromMetadata,
          phone: phoneFromMetadata,
          email: user.email || "",
        });
        return;
      }

      // Buscar o telefone tanto da tabela profiles quanto do user metadata
      const phoneFromProfiles = data.phone || "";
      const phoneFromMetadata = user.user_metadata?.phone || "";
      const fullNameFromProfiles = data.full_name || "";
      const fullNameFromMetadata = user.user_metadata?.full_name || user.user_metadata?.display_name || "";
      
      setProfile({
        full_name: fullNameFromProfiles || fullNameFromMetadata,
        phone: phoneFromProfiles || phoneFromMetadata,
        email: user.email || "",
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const fetchUserApps = async () => {
    if (!user) return;

    setIsLoadingApps(true);
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("id, nome, status, created_at, updated_at, slug")
        .eq("user_id", user.id)
        .eq("status", "publicado")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar apps:", error);
        return;
      }

      setUserApps(data || []);
    } catch (error) {
      console.error("Erro ao buscar apps:", error);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const handleEditApp = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", appId)
        .single();

      if (error || !data) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do app.",
          variant: "destructive",
        });
        return;
      }

      // Criar o event customizado para carregar o app no builder
      const loadAppEvent = new CustomEvent('loadAppForEdit', {
        detail: data
      });
      
      window.dispatchEvent(loadAppEvent);
      
      toast({
        title: "App carregado",
        description: "O app foi carregado no builder para edição.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao carregar app:", error);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar app.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
      });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    setIsCancellingSubscription(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        throw new Error('Erro na comunicação com o servidor');
      }

      if (!data?.success) {
        console.error('Edge function retornou erro:', data?.error);
        throw new Error(data?.error || 'Falha ao cancelar assinatura');
      }

      toast({
        title: "Assinatura cancelada",
        description: data.message || "Sua assinatura foi cancelada e você manterá acesso até o final do período pago.",
      });

      // Refresh subscription status
      await refreshSubscription();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      toast({
        title: "Erro",
        description: `Erro ao cancelar assinatura: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      console.log('Iniciando exclusão da conta própria...');
      
      // Obter sessão atual
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Call the edge function to delete account completely
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      console.log('Resposta da edge function:', { data, error });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        throw new Error('Erro na comunicação com o servidor');
      }

      if (!data?.success) {
        console.error('Edge function retornou erro:', data?.error);
        throw new Error(data?.error || 'Falha ao excluir conta');
      }

      console.log('Conta excluída com sucesso, fazendo logout...');
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast({
        title: "Erro",
        description: `Erro ao excluir a conta: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccountWithSubscriptionCheck = async () => {
    // If user has active subscription, show warning modal
    if (hasActivePlan || hasStripeSubscription) {
      setShowDeleteConfirm(true);
      return;
    }
    
    // If no active subscription, proceed with deletion
    await handleDeleteAccount();
  };

  const handleConfirmDeleteWithSubscription = async () => {
    setShowDeleteConfirm(false);
    await handleDeleteAccount();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e apps publicados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Seção de Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Pessoais</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="+55 (11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Assinatura */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Minha Assinatura</h3>
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Plano {planName || "Gratuito"}
                  </CardTitle>
                  <Badge variant={hasActivePlan ? "default" : "secondary"}>
                    {hasActivePlan ? "Ativo" : "Gratuito"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingPlan ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : planName === "Empresarial" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Você possui o plano mais avançado disponível
                      </span>
                      <Badge variant="default">Plano Máximo</Badge>
                    </div>
                    
                    {/* Opção de Downgrade para plano Empresarial */}
                    {canDowngrade && (
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Quer reduzir seu plano?
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('/suporte', '_blank')}
                          className="h-8"
                        >
                          <ArrowDown className="h-3 w-3 mr-1" />
                          Contatar Suporte
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {planName === "Profissional" ? "Faça upgrade para o plano Empresarial" : "Faça upgrade para ter mais recursos"}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => window.open('/pricing', '_blank')}
                        className="h-8"
                      >
                        Fazer Upgrade
                      </Button>
                    </div>
                    
                    {/* Opção de Downgrade */}
                    {canDowngrade && (
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Quer reduzir seu plano?
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('/suporte', '_blank')}
                          className="h-8"
                        >
                          <ArrowDown className="h-3 w-3 mr-1" />
                          Contatar Suporte
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* CTA de Renovação para ex-assinantes */}
                {!hasActivePlan && hasEverSubscribed && !loadingHistory && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Renove sua assinatura
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-300">
                          Recupere o acesso aos recursos premium
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open('/pricing', '_blank')}
                        className="h-8 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Renovar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Botão Cancelar Assinatura */}
                {hasActivePlan && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Gerenciar Assinatura
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cancele sua assinatura a qualquer momento
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(true)}
                        className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar Assinatura
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Seção de Apps Publicados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Meus Apps Publicados</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUserApps}
                disabled={isLoadingApps}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingApps ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            
            {isLoadingApps ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userApps.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userApps.map((app) => (
                  <Card key={app.id} className="border border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{app.nome}</CardTitle>
                        <Badge variant="secondary">
                          {app.status === 'publicado' ? 'Publicado' : app.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        Criado em {new Date(app.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Atualizado em {new Date(app.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditApp(app.id)}
                            className="h-8"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/app/${app.slug}`, '_blank')}
                            className="h-8"
                          >
                            Ver App
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum app publicado ainda.</p>
                <p className="text-sm">Seus apps publicados aparecerão aqui.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Seção de Exclusão de Conta */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
            <p className="text-sm text-muted-foreground">
              Excluir sua conta remove permanentemente todos os seus dados. Esta ação não pode ser desfeita.
            </p>
            
            <Button
              variant="outline"
              disabled={isDeleting}
              className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDeleteAccountWithSubscriptionCheck}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {isDeleting ? "Excluindo..." : "Excluir Conta"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Modal de Confirmação para Cancelar Assinatura */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja cancelar sua assinatura? Você não será mais cobrado e perderá o acesso após o período vigente.
              {hasActivePlan && (
                <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded text-orange-800 dark:text-orange-200 text-sm">
                  <strong>Atenção:</strong> Você manterá acesso aos recursos premium até o final do período já pago.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancellingSubscription}>
              Manter Assinatura
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              disabled={isCancellingSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancellingSubscription ? "Cancelando..." : "Sim, Cancelar Assinatura"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação para Exclusão de Conta com Assinatura Ativa */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Assinatura Ativa Detectada
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  ⚠️ Sua assinatura ainda está ativa. Você deve cancelar antes de excluir a conta.
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <div className="font-semibold mb-1">O que acontecerá:</div>
                    <div>• Sua assinatura será cancelada automaticamente na Stripe</div>
                    <div>• Todos os seus dados serão excluídos permanentemente</div>
                    <div>• Esta ação não pode ser desfeita</div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="flex-1" disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowCancelConfirm(true);
                  }}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Apenas Cancelar Assinatura
                </Button>
              </div>
              <AlertDialogAction 
                onClick={handleConfirmDeleteWithSubscription}
                disabled={isDeleting}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Excluindo..." : "Cancelar Assinatura e Excluir Conta"}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};