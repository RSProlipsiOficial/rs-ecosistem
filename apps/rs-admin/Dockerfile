FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Expor porta
EXPOSE 5001

# Comando de inicialização
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5001"]