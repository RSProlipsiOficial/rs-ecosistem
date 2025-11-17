#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../infra/docker"
docker compose -f docker-compose.rs-studio.yml up -d --build
sleep 6
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
for p in 5601 5678 8080; do
  ss -lntp | grep ":$p " || true
done
curl -sI http://127.0.0.1:5601 | head -n1 || true
curl -sI http://127.0.0.1:5678 | head -n1 || true
curl -sI http://127.0.0.1:8080 | head -n1 || true
sudo -n nginx -t || true
sudo -n systemctl reload nginx || true