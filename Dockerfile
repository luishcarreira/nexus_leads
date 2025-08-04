# Dockerfile simples para desenvolvimento
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 8080

# Comando para iniciar em modo desenvolvimento
CMD ["npm", "run", "dev"]