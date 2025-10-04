import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { Search, UserCheck, UserX, Eye, Calendar, Package, User, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  created_at: string;
  is_active: boolean;
  app_count: number;
  plan_name?: string;
  plan_id?: string;
  plan_app_limit?: number;
  last_renewal_date?: string;
}

interface UserApp {
  id: string;
  nome: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const StudentsPanel = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [plans, setPlans] = useState<Array<{id: string; name: string; app_limit: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Iniciando busca de usuários...');
      
      // Buscar todos os planos disponíveis
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*');
      
      if (plansError) {
        console.error('❌ Erro ao buscar planos:', plansError);
        throw plansError;
      }
      
      console.log('✅ Planos encontrados:', plansData?.length || 0);
      setPlans(plansData || []);
      
      // Buscar usuários com metadados usando a função RPC
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_users_with_metadata');
        
      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        throw usersError;
      }
      
      console.log('✅ Usuários encontrados:', usersData?.length || 0);

      // Buscar user_status separadamente
      const { data: userStatusData, error: statusError } = await supabase
        .from('user_status')
        .select('*');
        
      if (statusError) {
        console.error('❌ Erro ao buscar user_status:', statusError);
        // Não vamos lançar erro aqui, apenas loggar
      }
      
      console.log('✅ User status encontrados:', userStatusData?.length || 0);

      // Buscar contagem de apps por usuário
      const { data: appCounts, error: appError } = await supabase
        .from('apps')
        .select('user_id')
        .eq('status', 'publicado');
        
      if (appError) {
        console.error('❌ Erro ao buscar apps:', appError);
        // Não vamos lançar erro aqui, apenas loggar
      }
      
      console.log('✅ Apps encontrados:', appCounts?.length || 0);

      // Processar dados dos usuários
      const userData: UserData[] = (usersData || []).map(user => {
        const userStatus = userStatusData?.find(us => us.user_id === user.id);
        const appCount = appCounts?.filter(app => app.user_id === user.id).length || 0;
        const plan = plansData?.find(p => p.id === userStatus?.plan_id);
        
        console.log(`📄 Processando usuário: ${user.email}`, {
          userStatus,
          appCount,
          plan,
          display_name: user.display_name
        });
        
        return {
          id: user.id,
          email: user.email || `usuario${user.id.slice(-4)}@email.com`,
          phone: user.phone || '',
          full_name: user.display_name || '',
          created_at: user.created_at,
          is_active: userStatus?.is_active ?? true,
          app_count: appCount,
          plan_id: userStatus?.plan_id || null,
          plan_name: plan?.name || 'Gratuito',
          plan_app_limit: plan?.app_limit || 0, // Plano gratuito tem limite 0
          last_renewal_date: null // Field doesn't exist in current schema
        };
      });

      console.log('✅ Dados processados:', userData);
      setUsers(userData);
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar dados dos usuários: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar apps do usuário
  const fetchUserApps = async (userId: string): Promise<UserApp[]> => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('id, nome, status, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar apps do usuário:', error);
      return [];
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // First, check if user_status record exists
      const { data: existingStatus, error: checkError } = await supabase
        .from('user_status')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let updateError;
      
      if (existingStatus) {
        // Update existing record
        const { error } = await supabase
          .from('user_status')
          .update({ is_active: newStatus })
          .eq('user_id', userId);
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_status')
          .insert({
            user_id: userId,
            is_active: newStatus
          });
        updateError = error;
      }

      if (updateError) throw updateError;

      // Update local state immediately
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: newStatus }
          : user
      ));

      toast({
        title: "Status atualizado",
        description: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      });
      
      // Refetch data to ensure consistency
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive",
      });
      
      // Refetch data in case of error to restore correct state
      fetchUsers();
    }
  };

  const updateUserPlan = async (userId: string, planId: string) => {
    try {
      const { error } = await supabase
        .from('user_status')
        .update({ plan_id: planId })
        .eq('user_id', userId);

      if (error) throw error;

      const selectedPlan = plans.find(p => p.id === planId);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              plan_id: planId,
              plan_name: selectedPlan?.name || 'Gratuito',
              plan_app_limit: selectedPlan?.app_limit || 0 // Plano gratuito tem limite 0
            }
          : user
      ));

      toast({
        title: "Plano atualizado",
        description: `Plano do usuário alterado para ${selectedPlan?.name} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano do usuário",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    setDeletingUser(userId);
    try {
      // Usar a edge function para exclusão completa (dados + autenticação)
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: { target_user_id: userId }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Falha ao excluir usuário');
      }

      // Atualizar lista localmente
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "Usuário excluído",
        description: `O usuário "${userEmail}" foi excluído completamente`,
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: `Erro ao excluir o usuário: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  // Componente para os detalhes do usuário
  const UserDetailsDialog = ({ user }: { user: UserData }) => {
    const [userApps, setUserApps] = useState<UserApp[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(false);

    const loadUserApps = async () => {
      setIsLoadingApps(true);
      const apps = await fetchUserApps(user.id);
      setUserApps(apps);
      setIsLoadingApps(false);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadUserApps}
            className="bg-app-surface-hover border-app-border hover:bg-app-surface"
          >
            <Eye className="w-4 h-4 mr-1" />
            {t('admin.students.details')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-app-surface border-app-border mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">Detalhes do Cliente</DialogTitle>
            <DialogDescription className="text-app-muted">
              Informações completas do usuário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Dados do Cliente */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Dados do Cliente</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-app-surface-hover p-3 sm:p-4 rounded-lg border border-app-border">
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">Nome completo</p>
                  <p className="font-medium text-foreground text-sm sm:text-base">{user.full_name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">Email</p>
                  <p className="font-medium text-foreground text-sm sm:text-base break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">Telefone</p>
                  <p className="font-medium text-foreground text-sm sm:text-base">{user.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-app-muted">Data de cadastro</p>
                  <p className="font-medium text-foreground text-sm sm:text-base">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Plano Contratado */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Plano Contratado</h3>
              </div>
              <div className="bg-app-surface-hover p-4 rounded-lg border border-app-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-app-muted">Plano atual</p>
                    <p className="font-medium text-foreground">
                      {user.plan_name} ({user.plan_app_limit} Apps)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-app-muted">Apps publicados</p>
                    <p className="font-medium text-foreground">
                      {user.app_count}/{user.plan_app_limit}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-app-muted">Data da última renovação</p>
                    <p className="font-medium text-foreground">
                      {user.last_renewal_date 
                        ? new Date(user.last_renewal_date).toLocaleDateString('pt-BR')
                        : 'Não informado'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico de Apps */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Histórico de Apps</h3>
              </div>
              <div className="bg-app-surface-hover p-4 rounded-lg border border-app-border">
                {isLoadingApps ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : userApps.length > 0 ? (
                  <div className="space-y-3">
                    {userApps.map((app) => (
                      <div key={app.id} className="flex justify-between items-center p-3 bg-background rounded border border-app-border">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{app.nome}</p>
                          <div className="flex items-center space-x-4 text-sm text-app-muted mt-1">
                            <span>
                              Status: <Badge variant={app.status === 'publicado' ? 'default' : 'secondary'}>
                                {app.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                              </Badge>
                            </span>
                            <span>
                              Data da publicação: {app.status === 'publicado' 
                                ? new Date(app.created_at).toLocaleDateString('pt-BR')
                                : '—'
                              }
                            </span>
                            <span>
                              Última edição: {new Date(app.updated_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-app-muted text-center py-4">Nenhum app encontrado</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card className="bg-app-surface border-app-border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-app-surface border-app-border p-3 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('admin.students.title')}</h2>
            <p className="text-sm text-app-muted">{t('admin.students.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="text-xs sm:text-sm text-app-muted">
              {users.filter(u => u.is_active).length} {t('admin.students.active')}
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-app-muted" />
            <Input
              placeholder={t('admin.students.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-app-surface-hover border-app-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-48 bg-app-surface-hover border-app-border">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.students.all')}</SelectItem>
              <SelectItem value="active">{t('admin.students.active.filter')}</SelectItem>
              <SelectItem value="inactive">{t('admin.students.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="border border-app-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-app-border">
                  <TableHead className="whitespace-nowrap">{t('admin.students.email')}</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">{t('admin.students.phone')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.students.plan')}</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">{t('admin.students.apps')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.students.status')}</TableHead>
                  <TableHead className="whitespace-nowrap hidden lg:table-cell">{t('admin.students.created')}</TableHead>
                  <TableHead className="text-right">{t('admin.students.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-app-border/50">
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="truncate">{user.email}</p>
                        <p className="text-xs text-app-muted sm:hidden truncate">
                          {user.phone || 'Sem telefone'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.phone || '—'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Select 
                          value={user.plan_id || ''} 
                          onValueChange={(value) => updateUserPlan(user.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-app-surface-hover border-app-border">
                            <SelectValue>
                              <span className="truncate">{user.plan_name}</span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} ({plan.app_limit} Apps)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-app-muted md:hidden">
                          {user.app_count}/{user.plan_app_limit} apps
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {user.app_count}/{user.plan_app_limit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className="hidden sm:inline text-xs">
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <UserDetailsDialog user={user} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                              disabled={deletingUser === user.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-app-surface border-app-border mx-2 sm:mx-0">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário "{user.email}"? 
                                Esta ação não pode ser desfeita e todos os dados do usuário serão perdidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
                              <AlertDialogCancel disabled={deletingUser === user.id}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser(user.id, user.email)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingUser === user.id}
                              >
                                {deletingUser === user.id ? "Excluindo..." : "Excluir"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-app-muted">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentsPanel;