# Integração de Autenticação - Frontend

Este documento descreve como o frontend foi integrado com o novo sistema de autenticação baseado em JWT.

## Arquivos Implementados

### 1. `src/services/authService.ts`

Serviço principal de autenticação que gerencia:

- Exchange de tokens do IdP para tokens internos
- Refresh automático de tokens
- Armazenamento seguro de tokens no localStorage
- Decodificação de claims do JWT
- Logout e limpeza de tokens

### 2. `src/hooks/use-auth.ts`

Hook React personalizado que fornece:

- Estado de autenticação
- Informações do usuário (claims)
- Funções de login/logout
- Processamento de redirects do IdP

### 3. `src/App.tsx`

Componente principal atualizado para:

- Verificar autenticação na inicialização
- Processar redirects do IdP automaticamente
- Mostrar tela de login quando não autenticado
- Proteger rotas da aplicação

### 4. `src/services/httpClient.ts`

Cliente HTTP atualizado para:

- Incluir Bearer token automaticamente nas requisições
- Fazer refresh automático quando receber 401
- Retry de requisições após refresh bem-sucedido

### 5. `src/components/layout/Sidebar.tsx`

Sidebar atualizada para:

- Mostrar informações do usuário logado
- Incluir botão de logout
- Exibir empresa e filial do usuário

## Como Funciona

### 1. Fluxo de Login

1. Usuário é redirecionado do IdP com `?token=<jwt_do_IdP>`
2. App.tsx detecta o token na URL
3. `authService.processIdpRedirect()` é chamado
4. Token do IdP é enviado para `POST /token/exchange`
5. Backend retorna `access_token` e `refresh_token`
6. Tokens são salvos no localStorage
7. URL é limpa (remove parâmetro token)
8. Usuário é autenticado e pode usar a aplicação

### 2. Requisições Autenticadas

1. Todas as requisições incluem `Authorization: Bearer <access_token>`
2. Se receber 401, automaticamente tenta refresh
3. Se refresh bem-sucedido, retry da requisição original
4. Se refresh falhar, usuário é deslogado

### 3. Refresh Automático

- O `refresh_token` é usado para obter novos tokens
- Endpoint: `POST /refresh`
- Se falhar, usuário é redirecionado para login

## Configuração

### Variáveis de Ambiente

```env
VITE_API_URL=https://api.nexusvitally.com.br
```

### Endpoints Utilizados

- `POST /token/exchange` - Exchange de token do IdP
- `POST /refresh` - Refresh de tokens
- Todas as outras rotas protegidas com Bearer token

## Claims do Usuário

O JWT contém as seguintes informações:

- `empresa` - Código da empresa
- `filial` - Código da filial
- `usuario` - Nome do usuário
- `sub` - Subject (ID do usuário)

## Uso nos Componentes

```typescript
import { useAuth } from "@/hooks/use-auth";

const MyComponent = () => {
  const { isAuthenticated, userClaims, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }

  return (
    <div>
      <p>Usuário: {userClaims?.usuario}</p>
      <p>Empresa: {userClaims?.empresa}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```

## Segurança

- Tokens são armazenados no localStorage (considerar httpOnly cookies em produção)
- Refresh automático previne expiração de sessão
- Logout limpa todos os tokens
- Requisições falham graciosamente se não autenticado

## Próximos Passos

1. Configurar URL de login do IdP no botão "Fazer Login"
2. Implementar tratamento de erros mais robusto
3. Adicionar loading states durante autenticação
4. Considerar usar httpOnly cookies para maior segurança
5. Implementar refresh token rotation se necessário
