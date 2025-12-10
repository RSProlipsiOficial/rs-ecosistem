#!/bin/bash
# SSL Certificate Renewal Script
# Renova certificados Let's Encrypt

echo "🔒 Renovando certificados SSL..."

# Renova certificados
certbot renew --quiet

# Recarrega Nginx
if [ $? -eq 0 ]; then
    echo "✅ Certificados renovados"
    echo "🔄 Recarregando Nginx..."
    nginx -t && nginx -s reload
    echo "✅ Nginx recarregado"
else
    echo "❌ Erro ao renovar certificados"
    exit 1
fi

echo "Data: $(date)"
