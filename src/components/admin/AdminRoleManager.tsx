import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { canAccessAdmin } from '@/utils/adminUtils';
import { usePermissions } from '@/hooks/usePermissions';

const AdminRoleManager = () => {
  const { user } = useAuthContext();
  const { isAdmin } = usePermissions();
  const [isChecking, setIsChecking] = useState(false);

  const checkAdminStatus = async () => {
    if (!user) return;

    setIsChecking(true);
    try {
      const hasAccess = await canAccessAdmin(user.id);
      toast({
        title: hasAccess ? "Acesso confirmado" : "Acesso negado",
        description: hasAccess 
          ? "Você possui privilégios de administrador" 
          : "Você não possui privilégios de administrador",
        variant: hasAccess ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar status de administrador",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // SECURITY: Removed self-assignment functionality
  // Admin roles must be assigned by existing admins through proper channels

  // Only show admin status if user has admin access
  if (!isAdmin) {
    return (
      <Card className="bg-app-surface border-app-border p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Acesso Restrito</h3>
          </div>
          <p className="text-sm text-app-muted">
            Você não possui privilégios de administrador. Entre em contato com um administrador para solicitar acesso.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-app-surface border-app-border p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Status de Administrador</h3>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button
            onClick={checkAdminStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            {isChecking ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Verificar Status Admin
          </Button>
        </div>
        
        <p className="text-xs text-app-muted">
          Acesso de administrador confirmado. Use este botão para verificar seu status atual.
        </p>
      </div>
    </Card>
  );
};

export default AdminRoleManager;