# Guia de Visualização do Usuário - Nexus Leads

Este documento explica as melhorias implementadas na visualização das informações do usuário, empresa e filial que vêm do token de autenticação.

## Componentes Criados

### 1. UserInfo Component (`src/components/auth/UserInfo.tsx`)

Componente flexível que exibe informações do usuário em diferentes variantes:

#### Variantes Disponíveis:

- **`sidebar`**: Versão compacta para sidebar
- **`header`**: Versão horizontal para header
- **`card`**: Versão detalhada em card

#### Características:

- ✅ Avatar com iniciais do usuário
- ✅ Nome formatado (primeiro nome)
- ✅ Badges para empresa e filial
- ✅ Ícones informativos
- ✅ Botão de logout opcional
- ✅ Design responsivo

#### Uso:

```tsx
import { UserInfo } from '@/components/auth/UserInfo';

// Variante sidebar (compacta)
<UserInfo variant="sidebar" showLogout={true} />

// Variante header (horizontal)
<UserInfo variant="header" showLogout={true} />

// Variante card (detalhada)
<UserInfo variant="card" showLogout={true} />
```

### 2. UserProfile Component (`src/components/auth/UserProfile.tsx`)

Componente completo para página de perfil do usuário:

#### Características:

- ✅ Avatar grande com iniciais
- ✅ Informações detalhadas da empresa
- ✅ Status da sessão
- ✅ Estatísticas visuais
- ✅ Cards informativos
- ✅ Ações (configurar, sair)

#### Uso:

```tsx
import { UserProfile } from "@/components/auth/UserProfile";

<UserProfile showActions={true} />;
```

### 3. Header Component (`src/components/layout/Header.tsx`)

Header da aplicação com informações do usuário:

#### Características:

- ✅ Barra de pesquisa
- ✅ Notificações
- ✅ Informações do usuário
- ✅ Menu responsivo
- ✅ Botão de logout

#### Uso:

```tsx
import { Header } from "@/components/layout/Header";

<Header
  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
  showSearch={true}
  showNotifications={true}
/>;
```

## Melhorias Implementadas

### 1. Sidebar Atualizada

- ✅ Substituição da visualização simples por componente UserInfo
- ✅ Design mais elegante e informativo
- ✅ Avatar com iniciais do usuário
- ✅ Informações organizadas em badges
- ✅ Melhor hierarquia visual

### 2. Informações do Token

O sistema agora exibe de forma organizada:

- **Usuário**: Nome completo e primeiro nome
- **Empresa**: Badge com ícone de prédio
- **Filial**: Badge com ícone de localização
- **ID**: Identificador único do usuário
- **Status**: Status da sessão ativa

### 3. Design System

#### Cores e Ícones:

- 🔵 **Empresa**: Badge azul com ícone `Building2`
- 🟢 **Filial**: Badge verde com ícone `MapPin`
- 🔴 **Logout**: Botão vermelho com ícone `LogOut`
- 👤 **Usuário**: Avatar com iniciais

#### Responsividade:

- ✅ Mobile-first design
- ✅ Breakpoints para tablet e desktop
- ✅ Layout adaptativo
- ✅ Componentes flexíveis

## Estrutura dos Dados do Token

O sistema espera as seguintes informações no token JWT:

```typescript
interface UserClaims {
  usuario?: string; // Nome completo do usuário
  empresa?: string; // Nome da empresa
  filial?: string; // Nome/código da filial
  sub?: string; // ID único do usuário
}
```

## Exemplos de Uso

### 1. Em uma Página de Perfil

```tsx
import { UserProfile } from "@/components/auth/UserProfile";

function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
      <UserProfile showActions={true} />
    </div>
  );
}
```

### 2. Em um Header de Aplicação

```tsx
import { Header } from "@/components/layout/Header";

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header
        onMenuToggle={toggleSidebar}
        showSearch={true}
        showNotifications={true}
      />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{/* Conteúdo */}</main>
      </div>
    </div>
  );
}
```

### 3. Em um Card de Informações

```tsx
import { UserInfo } from "@/components/auth/UserInfo";

function DashboardCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <UserInfo variant="card" showLogout={false} />
      </CardContent>
    </Card>
  );
}
```

## Personalização

### Cores dos Badges

Você pode personalizar as cores dos badges modificando as classes CSS:

```tsx
// Badge da empresa
<Badge variant="secondary" className="bg-blue-100 text-blue-800">
  <Building2 className="h-3 w-3 mr-1" />
  {userClaims.empresa}
</Badge>

// Badge da filial
<Badge variant="outline" className="border-green-200 text-green-800">
  <MapPin className="h-3 w-3 mr-1" />
  Filial {userClaims.filial}
</Badge>
```

### Tamanhos dos Avatars

```tsx
// Avatar pequeno (sidebar)
<Avatar className="h-8 w-8">

// Avatar médio (header)
<Avatar className="h-10 w-10">

// Avatar grande (perfil)
<Avatar className="h-16 w-16">
```

## Acessibilidade

- ✅ Contraste adequado de cores
- ✅ Ícones descritivos
- ✅ Textos alternativos
- ✅ Navegação por teclado
- ✅ Screen reader friendly

## Performance

- ✅ Componentes otimizados com React.memo
- ✅ Lazy loading de ícones
- ✅ Renderização condicional
- ✅ Memoização de cálculos

## Próximos Passos

1. **Temas**: Implementar suporte a temas claro/escuro
2. **Internacionalização**: Adicionar suporte a múltiplos idiomas
3. **Animações**: Adicionar transições suaves
4. **Notificações**: Sistema de notificações em tempo real
5. **Configurações**: Página de configurações do usuário

## Troubleshooting

### Avatar não aparece

- Verifique se o `userClaims.usuario` está definido
- Confirme se o componente está dentro do contexto de autenticação

### Badges não mostram informações

- Verifique se `userClaims.empresa` e `userClaims.filial` estão definidos
- Confirme se o token JWT contém essas informações

### Layout quebrado em mobile

- Verifique se as classes de responsividade estão corretas
- Teste em diferentes tamanhos de tela
