# Docker - Nexus Leads

## Arquivos Criados

- `Dockerfile` - Imagem simples para desenvolvimento
- `docker-compose.yml` - Configuração básica para subir apenas o frontend
- `.dockerignore` - Arquivos que não devem ir para a imagem

## Como Usar

### 1. Subir a aplicação

```bash
docker-compose up
```

### 2. Subir em background

```bash
docker-compose up -d
```

### 3. Parar a aplicação

```bash
docker-compose down
```

### 4. Rebuild (quando mudar dependências)

```bash
docker-compose up --build
```

## Configuração

- **Porta do container:** 8080
- **Porta exposta:** 3000 (http://localhost:3000)
- **API URL:** Configurada via `VITE_API_BASE_URL=http://localhost:8001`

## Volumes

- Código fonte é mapeado para desenvolvimento com hot-reload
- `node_modules` é mantido no container para performance

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Entrar no container
docker-compose exec nexus-leads sh

# Instalar nova dependência
docker-compose exec nexus-leads npm install <package>

# Parar e remover tudo
docker-compose down --volumes --remove-orphans
```

Simples e direto! 🚀
