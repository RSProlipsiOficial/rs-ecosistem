#!/bin/bash

echo "================================================"
echo "🚀 ROTAFACIL INFRA - SETUP n8n & EVOLUTION"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variáveis
INFRA_DIR="/root/rotafacil-infra"

# [1/4] Preparar Diretório
echo "[1/4] Preparando diretório de infra..."
mkdir -p $INFRA_DIR
cd $INFRA_DIR || exit 1

# [2/4] Criar .env
echo "[2/4] Criando arquivo .env padrão..."
cat > .env << 'ENV_END'
# Configurações de Banco
POSTGRES_USER=root
POSTGRES_PASSWORD=root123
POSTGRES_DB=infra_db

# Domínios (Substitua pelos seus)
N8N_DOMAIN=n8n.seusistema.com
EVO_DOMAIN=api.seusistema.com

# Credenciais n8n
N8N_USER=admin
N8N_PASS=admin123

# Evolution API Key
EVO_API_KEY=429683C4C977415CAAFCCE10F0D57110
ENV_END
echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo $INFRA_DIR/.env para configurar seus domínios!${NC}"

# [3/4] Copiar Docker Compose
# (O script assume que o docker-compose-infra.yml está no diretório atual de onde foi baixado)
echo "[3/4] Configurando Docker Compose..."
# (Aqui poderíamos fazer um curl para baixar o arquivo do repositório se necessário)

# [4/4] Subir serviços
echo "[4/4] Iniciando serviços (Docker)..."
docker-compose -f docker-compose-infra.yml up -d

echo ""
echo "================================================"
echo -e "${GREEN}✅ INFRAESTRUTURA CONFIGURADA!${NC}"
echo "================================================"
echo ""
echo "🔗 n8n: http://seu-ip:5678"
echo "🔗 Evolution: http://seu-ip:8081"
echo ""
echo "Lembre-se de configurar o Nginx para usar SSL e os domínios configurados."
