#!/usr/bin/env bash
set -euo pipefail
DOMAIN="$1"
apt-get update -y
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" --redirect --agree-tos -m admin@rsprolipsi.com.br -n
