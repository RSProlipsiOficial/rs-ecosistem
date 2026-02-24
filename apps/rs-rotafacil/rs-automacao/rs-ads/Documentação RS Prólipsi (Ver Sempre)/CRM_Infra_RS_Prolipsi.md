CRM de Infraestrutura • RS Prólipsi
Data: 18/11/2025

Visão geral
- VPS: Ubuntu 24.04 LTS • Host: srv990916.hstgr.cloud • IP: 72.60.144.245
- Usuários: root, deploy
- SSH deploy: ~/.ssh/authorized_keys (600) • ~/.ssh (700)
- Diretório de projetos: /home/deploy/dev
- Ferramentas: Node 20.10.0 (NVM) • PNPM 10.22.0 (Corepack) • PM2 6.x • Docker 29.x • NGINX • Certbot

Repositórios (15)
- rs-admin, rs-consultor, rs-marketplace, rs-api, rs-studio, rs-walletpay, rs-logistica, rs-config, rs-site, rs-core, rs-docs, rs-rotafacil, rs-robo-kagi-binance, rs-template-game, rs-ops

Mapeamento de domínios e origem
- rsprolipsi.com.br → SPA estático em /var/www/rs-site (fallback SPA)
- admin.rsprolipsi.com.br → 3001 (SPA)
- escritorio.rsprolipsi.com.br → 3002 (SPA)
- marketplace.rsprolipsi.com.br → 3003 (SPA)
- wallet.rsprolipsi.com.br → 3005 (SPA)
- logistica.rsprolipsi.com.br → 3007 (SPA)
- config.rsprolipsi.com.br → 3008 (SPA)
- core.rsprolipsi.com.br → 3009 (SPA)
- docs.rsprolipsi.com.br → 3010 (SPA)
- rotafacil.rsprolipsi.com.br → 3011 (SPA)
- logos.rsprolipsi.com.br → 3013 (SPA)
- ops.rsprolipsi.com.br → 3014 (SPA)
- api.rsprolipsi.com.br → 4000 (PM2 start compilado)
- studio.rsprolipsi.com.br → paths:
  - /bot → 18080 (Evolution)
  - /agente → 5680 (n8n)
  - /dev → 33006 (Bolt)

Política NGINX
- SPAs: servir estático com fallback para /index.html
- Serviços: proxy_pass para 127.0.0.1:<porta>
- Evitar blocos duplicados/antigos; validar com nginx -t antes de reload

Bloco NGINX (SPA padrão)
server {
  listen 80;
  server_name <dominio>;
  root /var/www/<repo>;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
}

Bloco NGINX (Studio com paths)
server {
  listen 80;
  server_name studio.rsprolipsi.com.br;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  location /bot { proxy_pass http://127.0.0.1:18080; }
  location /agente { proxy_pass http://127.0.0.1:5680; }
  location /dev { proxy_pass http://127.0.0.1:33006; }
}

SSL (Certbot)
- Raiz: certbot --nginx -d rsprolipsi.com.br -d www.rsprolipsi.com.br --redirect --agree-tos -m rsprolipsioficial@gmail.com
- Subdomínios: certbot --nginx -d <dominio> --redirect --agree-tos -m rsprolipsioficial@gmail.com

PM2 (serviços)
- rs-api: pnpm start (dist) • PORT=4000
- Demais SPAs devem preferir NGINX/estático em produção

Docker (serviços auxiliares)
- Evolution API: /home/deploy/dev/docker-compose.evolution.yml
  - image: atendai/evolution-api:latest
  - ports: 18080:8080
  - env_file: /home/deploy/dev/evolution/.env
  - environment: DATABASE_PROVIDER=filesystem
  - volumes: evolution_store:/evolution/store, evolution_instances:/evolution/instances
- n8n: /home/deploy/dev/docker-compose.n8n.yml (5680) • volume /home/deploy/data/n8n owner 1000:1000
- Bolt (Studio): /home/deploy/dev/docker-compose.rs-studio.yml (33006)

CI/CD (GitHub → VPS)
Arquivo por repo: .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Over SSH
        uses: appleboy/ssh-action@v0.1.14
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          known_hosts: ${{ secrets.SSH_KNOWN_HOSTS }}
          script: |
            set -e
            cd /home/deploy/dev/<repo>
            git pull
            pnpm i --prefer-frozen-lockfile || pnpm i
            if [ -f package.json ] && jq -e '.scripts.build' package.json >/dev/null 2>&1; then pnpm build; fi
            pm2 restart <process-name> --update-env
Secrets na organização GitHub: SSH_HOST, SSH_USER, SSH_KEY, SSH_KNOWN_HOSTS

Runbooks
- Publicar SPA:
  - cd /home/deploy/dev/<repo> && pnpm i && pnpm build
  - sudo mkdir -p /var/www/<repo>
  - sudo rsync -a --delete dist/ /var/www/<repo>/
  - criar bloco NGINX (acima), nginx -t, reload
  - certbot --nginx -d <dominio> --redirect --agree-tos -m rsprolipsioficial@gmail.com
- Validar:
  - curl -I https://<dominio> | head -n 1
  - nginx -t • systemctl is-active nginx
  - pm2 list • docker ps

Healthchecks
- HTTP: curl -I http://127.0.0.1:<porta> | head -n 1
- HTTPS: curl -I https://<dominio> | head -n 1
- PM2: pm2 logs --nostream --lines 30
- Docker: docker logs <container> --tail 100

Credenciais e acessos
- Não armazenar valores de chaves neste CRM.
- Referência central: "Credenciais Geral – RSPrólipsi.txt" (pasta Documentação RS Prólipsi (Ver Sempre)).
- Itens: Supabase (anon/service role), SMTP, IA, Mercado Pago, chaves SSH, tokens de API, etc.

Observações importantes
- Evitar blocos NGINX quebrados/duplicados em sites-enabled; sempre validar com nginx -t.
- SPAs em produção devem ser servidas por NGINX como estático (não usar pm2 dev/serve).
- Evolution/n8n/Bolt sob Studio via paths (/bot, /agente, /dev).