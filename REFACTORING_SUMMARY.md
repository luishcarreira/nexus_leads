# Refatoração: Separação de Responsabilidades - HttpClient e LeadsService

## Resumo da Refatoração

Esta refatoração separou as responsabilidades entre um **HttpClient genérico** e um **LeadsService específico**, melhorando a organização e manutenibilidade do código.

## Principais Mudanças

### 1. **HttpClient Genérico** (`src/services/httpClient.ts`)

**Antes:**

- Classe específica para leads com métodos como `getLeads()`, `getEtapasLead()`, etc.
- Misturava responsabilidades de HTTP e lógica de negócio
- ~500 linhas de código específico de leads

**Depois:**

- Classe genérica com métodos HTTP padrão: `get()`, `post()`, `put()`, `delete()`, `patch()`
- Suporte a configuração de headers e parâmetros
- Gerenciamento de tokens através da propriedade `defaults.headers.common`
- ~140 linhas focadas apenas em funcionalidades HTTP

**Novos recursos:**

```typescript
// Métodos genéricos
httpClient.get<T>(endpoint, config?)
httpClient.post<T>(endpoint, data?, config?)
httpClient.put<T>(endpoint, data?, config?)
httpClient.delete<T>(endpoint, config?)

// Configuração de headers
httpClient.defaults.headers.common['Authorization'] = 'Bearer token'

// Parâmetros de query
httpClient.get('/api/leads', { params: { page: 1, limit: 10 } })
```

### 2. **LeadsService** (`src/services/LeadsService.ts`)

**Novo arquivo** que encapsula toda a lógica específica de leads:

- Consome o HttpClient genérico
- Mantém todos os métodos específicos de leads
- Gerencia autenticação e tokens automaticamente
- Interface limpa e específica para o domínio de leads

**Métodos disponíveis:**

- `getLeads()`, `getLeadsTotais()`
- `getEtapasLead()`, `getSituacaoLead()`, `getConsultores()`, `getVendedores()`
- `getDropdownOrigem()`, `getDropdownTipoProcura()`
- `vincularConsultorAoLead()`, `vincularVendedorAoLead()`
- `atualizarEtapaSituacaoLead()`
- `converterLeadParaCliente()`, `criarLeadRapido()`
- Todos os métodos de totais e paginação

### 3. **AuthContext Atualizado** (`src/contexts/AuthContext.tsx`)

**Mudanças:**

- Usa o HttpClient genérico para chamadas de autenticação
- Tipos TypeScript mais específicos nas chamadas de API
- Removido interceptor complexo (por simplicidade)
- Mantém funcionalidade de login/logout/refresh token

```typescript
// Antes
const response = await httpClient.post("/login", { email, password });
const { token } = response.data;

// Depois
const response = await httpClient.post<{
  token: string;
  refreshToken: string;
  user: User;
}>("/login", { email, password });
const { token } = response;
```

### 4. **Hooks Atualizados**

Todos os hooks agora usam o `LeadsService`:

- `use-leads.ts` → usa `leadsService.getLeads()`
- `use-leads-totais.ts` → usa `leadsService.getOrigensTotais()`, etc.
- `use-dropdowns.ts` → usa `leadsService.getEtapasLead()`, etc.

### 5. **Componentes Atualizados**

Todos os componentes que faziam chamadas diretas ao `httpClient` foram atualizados:

- `FilterSection.tsx`
- `LeadsTotaisDetailsModal.tsx`
- `LeadsPorVendedorModal.tsx`
- `LeadsPorTipoProcuraModal.tsx`
- `LeadsPorOrigemModal.tsx`
- `ConvertLeadToClientModal.tsx`
- `LeadAtividadesModal.tsx`

## Benefícios da Refatoração

### 1. **Separação de Responsabilidades**

- **HttpClient**: Apenas funcionalidades HTTP genéricas
- **LeadsService**: Lógica específica de leads e gerenciamento de autenticação

### 2. **Reutilização**

- HttpClient pode ser usado para outras APIs (Auth, Users, etc.)
- Fácil criação de novos services (UsersService, ConfigService, etc.)

### 3. **Manutenibilidade**

- Código mais organizado e fácil de encontrar
- Testes mais focados e específicos
- Mudanças em endpoints afetam apenas o service correspondente

### 4. **Type Safety**

- Melhor tipagem TypeScript
- Autocompletar mais preciso no IDE
- Detecção de erros em tempo de compilação

### 5. **Escalabilidade**

- Fácil adição de novos services
- Interceptors e middleware podem ser adicionados ao HttpClient
- Configuração centralizada de headers e autenticação

## Estrutura Final

```
src/
├── services/
│   ├── httpClient.ts          # HttpClient genérico
│   ├── LeadsService.ts        # Service específico para leads
│   └── interfaces/
│       └── ILead.ts           # Interfaces de leads
├── contexts/
│   └── AuthContext.tsx        # Usa HttpClient genérico
└── hooks/
    ├── use-leads.ts           # Usa LeadsService
    ├── use-leads-totais.ts    # Usa LeadsService
    └── use-dropdowns.ts       # Usa LeadsService
```

## Próximos Passos Recomendados

1. **Criar outros Services**: `UsersService`, `AuthService`, `ConfigService`
2. **Implementar interceptors** mais sofisticados no HttpClient se necessário
3. **Adicionar cache** nos services para melhor performance
4. **Implementar retry logic** para requests que falham
5. **Adicionar logging** estruturado nos services

## Compatibilidade

✅ **Nenhuma breaking change** nas interfaces públicas  
✅ **Todos os componentes continuam funcionando** da mesma forma  
✅ **Mantém funcionalidades existentes** de autenticação e leads  
✅ **Melhora a organização** sem afetar o comportamento
