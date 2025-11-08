# Usar uma imagem oficial do Node.js como base
FROM node:18 AS build

# Criar e definir o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copiar os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Construir a aplicação React
RUN npm run build

# Usar uma imagem do servidor Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copiar os arquivos do build para o diretório do Nginx
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expor a porta usada pelo Nginx
EXPOSE 80

# Comando padrão do Nginx
CMD ["nginx", "-g", "daemon off;"]
