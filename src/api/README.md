# Serviços de API - Preparação para Supabase

Esta pasta contém os serviços que centralizam as chamadas de dados da aplicação. Atualmente usando dados mockados, mas preparados para futura integração com Supabase.

## Estrutura

- `userService.js` - Autenticação e dados de usuário
- `appService.js` - Dados dos aplicativos
- `planService.js` - Planos de assinatura e checkout
- `integrationService.js` - Integrações externas

## Autenticação (userService.js)

### Credenciais de teste:
- **Email:** admin@teste.com
- **Senha:** 123456

### Principais funções:
```javascript
// Login
const { data, error } = await userService.login(email, password);

// Logout
const { error } = await userService.logout();

// Usuário atual
const { data, error } = await userService.getCurrentUser();
```

### Hook recomendado:
Use o hook `useAuthService` que abstrai o userService:

```typescript
import { useAuthService } from '@/hooks/useAuthService';

const { user, isAuthenticated, signIn, signOut, isLoading } = useAuthService();
```

## Migração futura para Supabase

Quando conectar ao Supabase:

1. **Manter a mesma interface**: Os serviços já seguem o formato de resposta do Supabase
2. **Trocar implementação interna**: Substituir mocks por chamadas reais ao Supabase
3. **Sem refatoração no frontend**: Componentes continuam usando os mesmos serviços

### Exemplo de migração:
```javascript
// ANTES (mock)
async login(email, password) {
  return new Promise(resolve => {
    // mock logic
  });
}

// DEPOIS (Supabase)
async login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  return { data, error };
}
```

## Vantagens desta abordagem

- ✅ Desenvolvimento sem dependência de backend
- ✅ Interface consistente desde o início
- ✅ Migração simples e sem quebras
- ✅ Fácil troca entre mock e dados reais
- ✅ Código limpo e organizado
