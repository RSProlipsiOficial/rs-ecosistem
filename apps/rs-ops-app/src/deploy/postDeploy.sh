#!/bin/bash
# Post-Deploy Script
# Executa após deploy via GitHub Actions

echo "🚀 RS Prólipsi - Post Deploy"
echo "===================================="

# Navega para diretório do projeto
cd /var/www/rs-prolipsi/rs-ops || exit

# Instala dependências
echo "📦 Instalando dependências..."
npm install --production

# Build TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Reinicia PM2
echo "🔄 Reiniciando serviços PM2..."
pm2 restart rs-ops
pm2 save

# Verifica status
echo "✅ Verificando status..."
pm2 status rs-ops

# Limpa logs antigos
echo "🧹 Limpando logs antigos..."
pm2 flush rs-ops

echo "===================================="
echo "✅ Deploy concluído com sucesso!"
echo "Data: $(date)"
