# Etapa base
FROM node:20

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Gera o client do Prisma
RUN npx prisma generate

# Expõe a porta da aplicação
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "dev"]
