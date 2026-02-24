#!/bin/bash

echo "================================================"
echo "🚀 ROTAFACIL - DEPLOY DOCKER AUTOMÁTICO"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
APP_DIR="/root/rotafacil"
APP_NAME="rotafacil"

# Função para log
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# [1/8] Criar diretório
echo "[1/8] Preparando diretório..."
mkdir -p $APP_DIR
cd $APP_DIR || exit 1
log_success "Diretório preparado"
echo ""

# [2/8] Criar Dockerfile
echo "[2/8] Criando Dockerfile..."
cat > Dockerfile << 'DOCKERFILE_END'
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE_END
log_success "Dockerfile criado"
echo ""

# [3/8] Criar nginx.conf
echo "[3/8] Criando nginx.conf..."
cat > nginx.conf << 'NGINX_END'
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
NGINX_END
log_success "nginx.conf criado"
echo ""

# [4/8] Criar docker-compose.yml
echo "[4/8] Criando docker-compose.yml..."
cat > docker-compose.yml << 'COMPOSE_END'
version: '3.8'

services:
  rotafacil:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: rotafacil-app
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    networks:
      - rotafacil-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  rotafacil-network:
    driver: bridge
COMPOSE_END
log_success "docker-compose.yml criado"
echo ""

# [5/8] Criar .dockerignore
echo "[5/8] Criando .dockerignore..."
cat > .dockerignore << 'DOCKERIGNORE_END'
node_modules
dist
.git
.gitignore
*.md
.env.local
npm-debug.log*
*.log
.DS_Store
coverage
testsprite_tests
external
supabase
*.bat
*.ps1
*.mjs
test-*
pg_log.txt
DOCKERIGNORE_END
log_success ".dockerignore criado"
echo ""

# [6/8] Verificar código fonte
echo "[6/8] Verificando código fonte..."
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado!"
    log_info "Você precisa:"
    echo "   1. Fazer git clone/pull do seu repositório, OU"
    echo "   2. Fazer upload manual dos arquivos via FTP/SCP"
    echo ""
    echo "Execute este script novamente após ter os arquivos."
    exit 1
fi
log_success "Código fonte encontrado"
echo ""

# [7/8] Build e Deploy
echo "[7/8] Fazendo build e deploy (isso pode demorar)..."
docker-compose down 2>/dev/null || true
docker-compose build
if [ $? -ne 0 ]; then
    log_error "Erro no build!"
    exit 1
fi

docker-compose up -d
if [ $? -ne 0 ]; then
    log_error "Erro ao iniciar container!"
    exit 1
fi
log_success "Deploy concluído"
echo ""

# [8/8] Verificação
echo "[8/8] Verificando status..."
sleep 3
docker ps | grep $APP_NAME
echo ""

# Finalização
echo "================================================"
log_success "DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================================"
echo ""
echo "🌐 Aplicação: http://72.60.144.245:8080"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs:     docker logs -f rotafacil-app"
echo "   Parar:        docker-compose stop"
echo "   Reiniciar:    docker-compose restart"
echo ""
