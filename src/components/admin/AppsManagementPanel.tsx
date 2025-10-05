import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Trash2, Eye, Calendar, User, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAppUrl } from '@/config/domains';

interface AppData {
  id: string;
  nome: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email?: string;
  plan_name?: string;
  views: number;
  downloads: number;
}

const AppsManagementPanel = () => {
  const { t } = useLanguage();
  const [apps, setApps] = useState<AppData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Array<{id: string; email: string; plan_name?: string}>>([]);

  useEffect(() => {
    fetchApps();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('👥 Buscando usuários para filtro...');
      
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (error) {
        console.error('❌ Erro ao buscar profiles:', error);
        throw error;
      }
      
      console.log('✅ Profiles encontrados para filtro:', profilesData?.length || 0);

      // Buscar user_status separadamente
      const { data: userStatusData, error: statusError } = await supabase
        .from('user_status')
        .select('user_id, plan_id');

      if (statusError) {
        console.error('❌ Erro ao buscar user_status:', statusError);
        // Não vamos lançar erro aqui, apenas loggar
      }

      // Buscar planos
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*');

      if (plansError) {
        console.error('❌ Erro ao buscar planos:', plansError);
        // Não vamos lançar erro aqui, apenas loggar
      }
      
      const usersData = (profilesData || []).map(profile => {
        const userStatus = userStatusData?.find(us => us.user_id === profile.id);
        const plan = plansData?.find(p => p.id === userStatus?.plan_id);
        return {
          id: profile.id,
          email: profile.email || `usuario${profile.id.slice(-4)}@email.com`,
          plan_name: plan?.name || 'Gratuito'
        };
      });
      
      console.log('✅ Usuários processados para filtro:', usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
    }
  };

  const fetchApps = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Iniciando busca de apps...');
      
      // Buscar apps
      const { data: appsData, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar apps:', error);
        throw error;
      }

      console.log('✅ Apps encontrados:', appsData?.length || 0);

      // Buscar dados dos usuários dos apps separadamente
      const userIds = [...new Set(appsData?.map(app => app.user_id) || [])];
      console.log('👥 Buscando dados de', userIds.length, 'usuários...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        // Não vamos lançar erro aqui, apenas loggar
      }

      console.log('✅ Profiles encontrados:', usersData?.length || 0);

      // Buscar user_status separadamente
      const { data: userStatusData, error: statusError } = await supabase
        .from('user_status')
        .select('user_id, plan_id')
        .in('user_id', userIds);

      if (statusError) {
        console.error('❌ Erro ao buscar user_status:', statusError);
      }

      console.log('✅ User status encontrados:', userStatusData?.length || 0);

      // Buscar planos
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*');

      if (plansError) {
        console.error('❌ Erro ao buscar planos:', plansError);
      }

      console.log('✅ Planos encontrados:', plansData?.length || 0);

      const processedApps: AppData[] = (appsData || []).map(app => {
        const userProfile = usersData?.find(user => user.id === app.user_id);
        const userStatus = userStatusData?.find(us => us.user_id === app.user_id);
        const plan = plansData?.find(p => p.id === userStatus?.plan_id);
        
        console.log(`📱 Processando app: ${app.nome}`, {
          userProfile,
          userStatus,
          plan
        });
        
        return {
          id: app.id,
          nome: app.nome,
          slug: app.slug,
          status: app.status,
          created_at: app.created_at,
          updated_at: app.updated_at,
          user_id: app.user_id,
          views: app.views || 0,
          downloads: app.downloads || 0,
          user_email: userProfile?.email || `usuario${app.user_id.slice(-4)}@email.com`,
          plan_name: plan?.name || 'Gratuito'
        };
      });

      console.log('✅ Apps processados:', processedApps.length);
      setApps(processedApps);
      
    } catch (error) {
      console.error('❌ Erro ao buscar apps:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar dados dos apps: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [deletingApp, setDeletingApp] = useState<string | null>(null);
  const deleteApp = async (appId: string, appName: string) => {
    setDeletingApp(appId);
    try {
      // Usar RPC para exclusão administrativa sem verificação de RLS
      const { error } = await supabase.rpc('admin_delete_app', { app_id: appId });

      if (error) throw error;

      // Atualizar lista localmente
      setApps(prev => prev.filter(app => app.id !== appId));
      
      toast({
        title: "App excluído",
        description: `O app "${appName}" foi excluído com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao excluir app:', error);
      toast({
        title: "Erro",
        description: `Erro ao excluir o app: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingApp(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "ID copiado para a área de transferência",
    });
  };

  const AppDetailsDialog = ({ app }: { app: AppData }) => {
    const appUrl = getAppUrl(app.slug);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Detalhes
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-app-surface border-app-border mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">Detalhes do App</DialogTitle>
            <DialogDescription className="text-app-muted">
              Informações completas do aplicativo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-app-surface-hover p-3 sm:p-4 rounded-lg border border-app-border">
              <div>
                <p className="text-xs sm:text-sm text-app-muted">Nome do App</p>
                <p className="font-medium text-foreground text-sm sm:text-base">{app.nome}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-app-muted">Status</p>
                <Badge variant={app.status === 'publicado' ? 'default' : 'secondary'}>
                  {app.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm text-app-muted">ID do App</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-xs text-foreground break-all">{app.id}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(app.id)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-app-muted">Slug</p>
                <p className="font-mono text-xs text-foreground break-all">{app.slug}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-app-muted">Criado em</p>
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {new Date(app.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm text-app-muted">Última atualização</p>
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {new Date(app.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Informações do usuário */}
            <div className="bg-app-surface-hover p-4 rounded-lg border border-app-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Proprietário</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-app-muted">Email</p>
                  <p className="font-medium text-foreground">{app.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-app-muted">Plano</p>
                  <p className="font-medium text-foreground">{app.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-app-muted">ID do Usuário</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-xs text-foreground">{app.user_id}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(app.user_id)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-app-surface-hover p-4 rounded-lg border border-app-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Estatísticas</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-app-muted">Visualizações</p>
                  <p className="font-medium text-foreground">{app.views}</p>
                </div>
                <div>
                  <p className="text-sm text-app-muted">Downloads</p>
                  <p className="font-medium text-foreground">{app.downloads}</p>
                </div>
                <div>
                  <p className="text-sm text-app-muted">URL do App</p>
                  <a 
                    href={appUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Ver App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = userFilter === 'all' || app.user_id === userFilter;
    return matchesSearch && matchesUser;
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
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Gerenciar Apps</h2>
            <p className="text-sm text-app-muted">Visualize e gerencie todos os aplicativos criados pelos usuários</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm text-app-muted">
              {apps.length} apps encontrados
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-app-muted" />
            <Input
              placeholder="Buscar por nome, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-app-surface-hover border-app-border"
            />
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-64 bg-app-surface-hover border-app-border">
              <SelectValue placeholder="Filtrar por usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email} ({user.plan_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="border border-app-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-app-border">
                  <TableHead className="whitespace-nowrap">Nome do App</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">ID</TableHead>
                  <TableHead className="whitespace-nowrap">Usuário</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Plano</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap hidden lg:table-cell">Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id} className="border-b border-app-border/50">
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="truncate">{app.nome}</p>
                        <div className="text-xs text-app-muted sm:hidden space-y-1">
                          <p className="truncate">ID: {app.id.slice(0, 8)}...</p>
                          <p className="md:hidden">{app.plan_name}</p>
                          <p className="lg:hidden">{new Date(app.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">{app.id.slice(0, 8)}...</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(app.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{app.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{app.plan_name}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'publicado' ? 'default' : 'secondary'}>
                        {app.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(app.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <AppDetailsDialog app={app} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 h-8 px-2"
                              disabled={deletingApp === app.id}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">
                                {deletingApp === app.id ? "..." : "Excluir"}
                              </span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-app-surface border-app-border mx-2 sm:mx-0">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o app "{app.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
                              <AlertDialogCancel disabled={deletingApp === app.id}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteApp(app.id, app.nome)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingApp === app.id}
                              >
                                {deletingApp === app.id ? "Excluindo..." : "Excluir"}
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

        {filteredApps.length === 0 && (
          <div className="text-center py-8">
            <p className="text-app-muted">Nenhum app encontrado</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AppsManagementPanel;