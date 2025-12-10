#!/usr/bin/env bash
set -euo pipefail
apt update
apt install -y nginx certbot python3-certbot-nginx curl git
systemctl enable nginx
mkdir -p /var/www/certbot
