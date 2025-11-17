#!/bin/bash

set -e

GITHUB_TOKEN="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"

echo "=== Clonando Repositórios ==="
cd /srv/rsprolipsi

if [ ! -d "rs-ecosystem" ]; then
  git clone https://${GITHUB_TOKEN}@github.com/RSProlipsiOficial/rs-ecosystem.git
fi

if [ ! -d "rs-studio" ]; then
  git clone https://${GITHUB_TOKEN}@github.com/RSProlipsiOficial/rs-studio.git
fi

if [ ! -d "bolt.new" ]; then
  git clone https://${GITHUB_TOKEN}@github.com/RSProlipsiOficial/bolt.new.git
fi

if [ ! -d "n8n" ]; then
  git clone https://${GITHUB_TOKEN}@github.com/RSProlipsiOficial/n8n.git
fi

if [ ! -d "evolution-api" ]; then
  git clone https://${GITHUB_TOKEN}@github.com/RSProlipsiOficial/evolution-api.git
fi

if [ ! -d "openhunter" ]; then
  git clone https://${GITHUB_TOKEN}@github.com/RSProlipsiOficial/openhunter.git
fi

echo "=== Repositórios Clonados ==="
ls -la

echo "=== Instalando Dependências Node.js ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 22 || nvm install 22

cd /srv/rsprolipsi/bolt.new
pnpm install --force

cd /srv/rsprolipsi/n8n
pnpm install --force

cd /srv/rsprolipsi/evolution-api
pnpm install --force

cd /srv/rsprolipsi/openhunter
pnpm install --force

echo "=== Construindo Aplicações ==="
cd /srv/rsprolipsi/bolt.new
pnpm run build

cd /srv/rsprolipsi/n8n/packages/cli
pnpm run build

echo "=== Configurando Docker Compose ==="
cd /srv/rsprolipsi/rs-ecosystem/infra/docker

echo "=== Iniciando Containers RS Studio ==="
docker-compose -f docker-compose.rs-studio.yml down
docker-compose -f docker-compose.rs-studio.yml build --no-cache
docker-compose -f docker-compose.rs-studio.yml up -d

echo "=== Aguardando containers iniciarem ==="
sleep 10

echo "=== Status dos Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "=== Recarregando Nginx ==="
sudo nginx -t && sudo nginx -s reload

echo "=== Deployment Concluído ==="
echo "Bolt (Dev): http://studio.rsprolipsi.com.br/dev/"
echo "Bolt (Builder): http://studio.rsprolipsi.com.br/builder/"
echo "n8n: http://studio.rsprolipsi.com.br/agents/"
echo "Evolution API: http://studio.rsprolipsi.com.br/whatsapp/"