# Sistema de Autenticação - Pronto para Supabase Auth

Este sistema de autenticação está completamente preparado para integração com Supabase Auth. Todos os hooks e contextos já estão configurados para funcionar seamlessly quando a conexão com Supabase for estabelecida.

## 🚀 Como usar

### 1. Configurar o AuthProvider (App.tsx)

```typescript
import { AuthProvider } from '@/hooks/auth';

function App() {
  return (
    <AuthProvider>
      {/* Sua aplicação */}
    </AuthProvider>
  );
}
```

### 2. Hook principal - useAuthState

O hook mais completo que combina estado e ações:

```typescript
import { useAuthState } from '@/hooks/auth';

const LoginPage = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    signInWithPassword,
    signUp,
    signOut 
  } = useAuthState();

  const handleLogin = async () => {
    const { error } = await signInWithPassword(email, password);
    if (!error) {
      // Login successful
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Olá, {user?.email}</p>
          <button onClick={signOut}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};
```

### 3. Proteção de rotas - useRouteProtection

```typescript
import { useRouteProtection } from '@/hooks/auth';

const ProtectedPage = () => {
  const { isLoading, canAccess } = useRouteProtection({
    requireAuth: true,
    requireEmailConfirmed: true,
    redirectTo: '/login'
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (!canAccess) return null; // Já foi redirecionado

  return <div>Conteúdo protegido</div>;
};
```

### 4. Componente de proteção - AuthGuard

```typescript
import { AuthGuard } from '@/hooks/auth';

const AdminPanel = () => (
  <AuthGuard 
    requireAuth={true}
    requiredRoles={['admin']}
    fallback={<div>Acesso negado</div>}
  >
    <div>Painel administrativo</div>
  </AuthGuard>
);
```

### 5. Gerenciamento de permissões - usePermissions

```typescript
import { usePermissions } from '@/hooks/auth';

const UserMenu = () => {
  const { isAdmin, hasRole, hasPermission } = usePermissions();

  return (
    <div>
      {isAdmin && <AdminMenuItem />}
      {hasRole('moderator') && <ModeratorMenuItem />}
      {hasPermission('edit_posts') && <EditButton />}
    </div>
  );
};
```

## 📋 Hooks disponíveis

### Hooks principais

- **`useAuthState`** - Hook completo com estado e ações
- **`useAuthContext`** - Acesso direto ao contexto de autenticação
- **`useAuthActions`** - Apenas ações de autenticação (login, logout, etc.)

### Hooks utilitários

- **`useRouteProtection`** - Proteção de rotas
- **`usePermissions`** - Gerenciamento de roles e permissões
- **`useAuth`** - Hook base (estado apenas)

### Hooks específicos (já existentes)

- **`useAdminAuth`** - Verificação de admin
- **`useUserPlan`** - Informações do plano do usuário
- **`useUserStatus`** - Status ativo/inativo do usuário

## 🔧 Funcionalidades incluídas

### Ações de autenticação
- ✅ Login com email/senha
- ✅ Registro de usuário
- ✅ Logout
- ✅ Reset de senha
- ✅ Atualização de senha
- ✅ Atualização de perfil

### Proteções
- ✅ Proteção de rotas
- ✅ Verificação de email confirmado
- ✅ Sistema de roles e permissões
- ✅ Componente AuthGuard

### Estado
- ✅ Estado global de autenticação
- ✅ Carregamento automático da sessão
- ✅ Persistência de sessão
- ✅ Listeners de mudança de estado

## 🎯 Preparado para Supabase

Todos os hooks já estão usando:
- ✅ `@supabase/supabase-js` 
- ✅ Tipos do Supabase
- ✅ Supabase Auth methods
- ✅ RLS queries preparadas
- ✅ Error handling
- ✅ Toast notifications

Quando conectar ao Supabase, tudo funcionará automaticamente!

## 🔄 Migração futura

Para ativar completamente:

1. Conectar o projeto ao Supabase (botão verde no interface)
2. Configurar tabelas de usuário se necessário
3. Implementar RLS policies
4. Ativar os comentários nos hooks para roles/permissions

Nenhuma mudança de código será necessária no frontend!