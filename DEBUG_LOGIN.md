# Debug do Login - Formato de Dados

## Problema Resolvido

O erro 422 "Unprocessable Content" ocorria porque o `OAuth2PasswordRequestForm` do FastAPI espera dados em formato `application/x-www-form-urlencoded`, mas estávamos enviando `FormData`.

## Correção Aplicada

### Antes (❌ Causava erro 422):

```typescript
const formData = new FormData();
formData.append("username", username);
formData.append("password", password);
```

### Depois (✅ Formato correto):

```typescript
const formData = new URLSearchParams();
formData.append("username", username);
formData.append("password", password);
```

## Como Verificar se Está Funcionando

### 1. **No Browser DevTools**:

Abra o DevTools (F12) → Network tab → Faça login

Você deve ver:

```
Request URL: http://localhost:8000/login
Request Method: POST
Content-Type: application/x-www-form-urlencoded

Form Data:
username: seu_usuario
password: sua_senha
```

### 2. **No Backend (logs)**:

O FastAPI deve agora processar corretamente e retornar status 200 em vez de 422.

### 3. **Teste Manual com curl**:

```bash
curl -X POST "http://localhost:8000/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=seu_usuario&password=sua_senha"
```

## Formato de Dados Enviados

### URLSearchParams (✅ Correto para OAuth2):

- Gera: `username=usuario&password=senha`
- Content-Type: `application/x-www-form-urlencoded`
- Compatível com `OAuth2PasswordRequestForm`

### FormData (❌ Não funciona com OAuth2):

- Gera dados multipart/form-data
- Content-Type: `multipart/form-data`
- Usado para upload de arquivos

## Estrutura Final da Requisição

```http
POST /login HTTP/1.1
Host: localhost:8000
Content-Type: application/x-www-form-urlencoded
Content-Length: 35

username=meuusuario&password=minhasenha
```

## Se Ainda Houver Erro 422

Verifique se:

1. **Backend está rodando** na porta correta
2. **Usuário existe** no sistema Nexus
3. **Senha está correta**
4. **Endpoint é `/login`** (não `/auth/login`)
5. **CORS está configurado** no backend

## Log de Debug Adicional

Para debug adicional, você pode temporariamente adicionar logs no AuthContext:

```typescript
console.log("Sending login request:", {
  username,
  formData: formData.toString(), // Mostra: "username=xxx&password=xxx"
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});
```
