#!/bin/bash
# Reload Services Script
# Reinicia todos os serviços após merge

echo "🔄 Recarregando serviços RS Prólipsi..."
echo "===================================="

# Nginx
echo "📡 Recarregando Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    nginx -s reload
    echo "✅ Nginx OK"
else
    echo "❌ Erro no Nginx"
    exit 1
fi

# PM2
echo "🔄 Reiniciando PM2..."
pm2 reload all
pm2 save

# Verifica status
echo "✅ Status dos serviços:"
pm2 status

echo "===================================="
echo "✅ Serviços recarregados!"
echo "Data: $(date)"
