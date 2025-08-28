# Authentication Implementation Guide

## Overview

This document describes the authentication system implemented in the Nexus Leads application.

## Features Implemented

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)

- JWT token management with automatic refresh
- User session persistence
- Automatic logout on token expiration
- HTTP interceptor for seamless token refresh

### 2. Theme Context (`src/contexts/ThemeContext.tsx`)

- Dark/Light/System theme switching
- Theme persistence in localStorage
- Automatic system theme detection

### 3. Login Page (`src/pages/Login.tsx`)

- Form validation with Zod schema
- Password visibility toggle
- Loading states and error handling
- Beautiful UI with shadcn-ui components

### 4. Protected Routes (`src/components/ProtectedRoute.tsx`)

- Automatic redirect to login for unauthenticated users
- Loading state while checking authentication
- Return to intended page after login

### 5. Responsive Sidebar (`src/components/layout/Sidebar.tsx`)

- Desktop: Fixed sidebar with navigation menu
- Mobile: Collapsible sidebar with hamburger menu
- User profile dropdown with logout
- Theme switcher integration

### 6. Layout System (`src/components/layout/Layout.tsx`)

- Responsive design (desktop/mobile)
- Conditional rendering based on authentication
- Mobile-first approach

## Route Structure

```
/login          - Login page (public)
/dashboard      - Main dashboard (protected)
/leads          - Leads management (protected)
/users          - User management (protected)
/settings       - Settings page (protected)
```

## Backend Integration

### User Structure

O sistema utiliza a seguinte estrutura para representar usuários (baseada no `UsuarioOutput` do backend):

```typescript
interface User {
  id: string; // ID único do usuário
  nome: string; // Nome completo
  cargo: string; // Cargo/função do usuário
  status: string; // Status: "ativo", "inativo", "suspenso"
  tipo: string; // Tipo: "admin", "vendedor", "consultor", "operador"
  gam_guid: string; // GUID do sistema GAM
  id_vendedor_vinculado?: number; // ID do vendedor vinculado (opcional)
  id_cliente_vinculado?: number; // ID do cliente vinculado (opcional)
  id_operador?: number; // ID do operador (opcional)
}
```

### Required Endpoints

Your backend should provide these endpoints:

```typescript
// Login endpoint (OAuth2PasswordRequestForm)
POST /login
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password

Response:
{
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": "user_id",
    "nome": "Nome do Usuário",
    "cargo": "Administrador",
    "status": "ativo",
    "tipo": "admin",
    "gam_guid": "guid-do-usuario",
    "id_vendedor_vinculado": null,
    "id_cliente_vinculado": null,
    "id_operador": 123
  },
  "token_type": "bearer"
}

// Token refresh endpoint
POST /auth/refresh
{
  "refreshToken": "jwt_refresh_token"
}

Response:
{
  "token": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token"
}

// Optional: User info endpoint for token validation
GET /auth/me
Headers: Authorization: Bearer {token}

Response:
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

## Usage Instructions

### For Development

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. You'll be redirected to `/login`
4. For testing, you can temporarily modify the AuthContext to skip real authentication

### For Production

1. Update the `httpClient.ts` to point to your production API
2. Update the AuthContext to use your actual authentication endpoints
3. Configure proper CORS settings on your backend

## Customization

### Adding New Protected Routes

```tsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPageComponent />
    </ProtectedRoute>
  }
/>
```

### Modifying Theme Colors

Update `tailwind.config.ts` and the CSS variables in `src/index.css`

### Adding Navigation Items

Update the `menuItems` array in `src/components/layout/Sidebar.tsx`

## Security Notes

1. **Token Storage**: Currently uses localStorage. Consider httpOnly cookies for production
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Implement proper token expiration handling
4. **CORS**: Configure CORS properly on your backend
5. **CSP**: Consider implementing Content Security Policy headers

## Testing the Authentication

For testing purposes, you can temporarily modify the `login` function in `AuthContext.tsx` to simulate successful login:

```typescript
const login = async (username: string, password: string) => {
  // Temporary for testing - remove in production
  if (username === "test" && password === "test123") {
    const mockUser = {
      id: "1",
      nome: "Usuário Teste",
      cargo: "Administrador",
      status: "ativo",
      tipo: "admin",
      gam_guid: "test-guid",
      id_vendedor_vinculado: null,
      id_cliente_vinculado: null,
      id_operador: 1,
    };

    localStorage.setItem("authToken", "mock-token");
    setUser(mockUser);
    return;
  }

  // Real implementation with OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await httpClient.post("/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  // ... rest of the real implementation
};
```

## Theme Switching

The theme switcher is located in the sidebar and supports:

- **Light**: Standard light theme
- **Dark**: Dark theme
- **System**: Automatically follows system preference

The theme preference is saved in localStorage and persists across sessions.
