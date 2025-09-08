# Escolhe uma imagem Node para build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
  elif [ -f yarn.lock ]; then yarn install; \
  else npm install; fi

# Copia o restante do código
COPY . .

COPY .env .env

# Builda o projeto para produção
RUN npm run build

# Usa uma imagem Nginx leve para servir os arquivos estáticos
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove arquivos default do nginx
RUN rm -rf ./*

# Copia o build do React para o Nginx
COPY --from=builder /app/dist .

# Copia um nginx.conf customizado (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8085

CMD ["nginx", "-g", "daemon off;"]