# EXECUTE AGORA – Stack Oficial PNPM + Docker (Nov/2025)

Documento vivo que espelha exatamente o estado atual do deploy RS Prólipsi (VPS Hostinger – `deploy@72.60.144.245`). Sempre que o padrão for ajustado aqui, o mesmo deve ser aplicado na VPS.

---

## 1. Objetivo

- Padronizar todo o ecossistema RS Prólipsi (Consultor, Admin, Marketplace, CD, Logista, Wallet, Studio, Ops) com **PNPM + Docker**.
- Garantir builds reprodutíveis, imagens consistentes e boot único via `docker compose`.
- Servir como checklist oficial para devs e SRE.

---

## 2. Acesso e Provisionamento Base

1. **SSH via VS Code**  
   `F1 → Remote-SSH: Connect to Host... → deploy@72.60.144.245`
2. **Confirmar usuário**  

   ```bash
   whoami
   [ "$REPLY" = "root" ] && su - deploy
   ```

3. **Rodar script de preparação** (mantido em `infra/setup-vps-dev-machine.sh`) – ele:  
   - Atualiza sistema / instala Docker 29+, Compose v2 e adiciona `deploy` ao grupo docker.  
   - Instala **Node 20.10 via NVM**, habilita `corepack` e `pnpm@latest`.  
   - Instala PM2, baixa todos os repositórios listados abaixo e aplica `.env.template`.

> Sempre que ajustar o script, atualize este arquivo e replique na VPS (`curl -o setup-vps.sh ...`).

---

## 3. Stack Oficial (deve existir em toda máquina)

| Item | Versão/Status |
| --- | --- |
| Node | 20.10 (NVM) |
| PNPM | corepack → `pnpm -v` >= 9 |
| Docker Engine | 29.x (Desktop/WSL) |
| Docker Compose v2 | `docker compose version` >= 2.24 |
| PM2 | Global (modo produção legado) |
| Git | Configurado com `rsprolipsioficial@gmail.com` |

### Convenções obrigatórias

- **Gerenciador único:** PNPM. Nenhum `npm install`/`npm ci` em produção.  
- **Lockfile único:** `pnpm-lock.yaml` versionado em todos os módulos.  
- **Dockerfiles:** Multi-stage Node 20, `corepack enable`, `pnpm install --frozen-lockfile`, `pnpm build`, `CMD pnpm start` (ou `node dist/...`).  
- **Docker Compose:** usa `infra/docker/docker-compose.core.yml` + `.env.core`.  
- **Sem `package-lock.json`** – deve ser removido e git clean.

---

## 4. Procedimento por Módulo (executar em cada repo)

Repos monitorados: `rs-admin`, `rs-consultor`, `rs-marketplace`, `rs-api`, `rs-studio`, `rs-walletpay`, `rs-logistica`, `rs-config`, `rs-core`, `rs-docs`, `rs-rotafacil`, `rs-template-game`, `rs-ops`, `rs-site` (front corporativo) e quaisquer novos apps.

Para cada pasta:

```bash
cd ~/dev/<repo>
rm -f package-lock.json
pnpm import         # converte lock antigo, quando existir
pnpm install        # gera pnpm-lock.yaml definitivo
pnpm build && pnpm dev --port <oficial>  # smoke test
git add pnpm-lock.yaml package.json Dockerfile
git commit -m "chore: migrate to pnpm standard"
```

> Se o projeto não possuir lock anterior, apenas rode `pnpm install` para criar o arquivo.

Checklist por módulo (marcar quando concluído):

- [ ] pnpm import/install executado  
- [ ] `pnpm-lock.yaml` versionado  
- [ ] `package-lock.json` inexistente  
- [ ] Scripts `build`/`start` funcionais com PNPM  
- [ ] Dockerfile atualizado (ver padrão abaixo)

---

## 5. Padrão Único de Dockerfile

```dockerfile
# build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install --prod --frozen-lockfile
ENV PORT=4000
EXPOSE 4000
CMD ["pnpm","start"]  # ou ["node","dist/server.js"]
```

Regras adicionais:

- Sempre expor a porta definida em `infra/docker/.env.core`.  
- Não copiar `node_modules` do host.  
- Se houver assets estáticos, copie depois do build para reduzir contexto.  
- Utilize `ARG NODE_ENV=production` se necessário e configure variáveis via Compose.

---

## 6. Docker Compose Core

- Arquivo: `infra/docker/docker-compose.core.yml`.  
- Variáveis: `infra/docker/.env.core` (ports oficiais).  
- Comando padrão de boot:

```bash
docker compose --env-file infra/docker/.env.core \
  -f infra/docker/docker-compose.core.yml up -d --build
```

- Serviços obrigatórios que precisam subir sem erro:

| Serviço | Porta |
| --- | --- |
| rs-api | 4000 |
| rs-admin | 3001 |
| rs-consultor | 3002 |
| rs-marketplace | 3003 |
| rs-site (institucional) | 3004 |
| rs-walletpay | 3005 |
| rs-studio | 3006 |
| rs-logistica | 3007 |
| rs-config | 3008 |
| rs-core | 3009 |
| rs-docs | 3010 |
| rs-rotafacil | 3011 |
| rs-template-game / logos | 3013 |
| rs-ops | 3014 |

### Passos de validação

```bash
docker compose -f infra/docker/docker-compose.core.yml ps
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Todos os containers devem aparecer como `Up (healthy)` e acessíveis via `http://localhost:<porta>`.

---

## 7. Pós-boot e Observabilidade

- `docker compose logs -f <serviço>` para rastrear build.  
- `pm2 ls` permanece disponível apenas para processos legados (não obrigatório quando Docker estiver ativo).  
- Healthchecks esperados: `GET /health` e `GET /version` em todos os serviços.

---

## 8. Troubleshooting imediato

| Cenário | Ação |
| --- | --- |
| `pnpm install` falha | Verificar `corepack enable`, limpar `node_modules`, remover `.pnpm-store` local |
| Build Docker quebra | Confirmar existência de `pnpm-lock.yaml` e scripts `build/start` no `package.json` |
| Porta em uso | `sudo lsof -i :<porta>` → `sudo kill -9 <PID>` antes de subir containers |
| Compose não encontra variável | Revisar `infra/docker/.env.core` e exportar novamente |
| Serviço não responde após boot | `docker compose logs <serviço>` e validar `.env` específico |

---

## 9. Resultado Esperado

Após concluir TODOS os passos acima:

- Nenhum `package-lock.json` no monorepo.  
- Todos os repositórios com `pnpm-lock.yaml`.  
- Dockerfiles padronizados e revisados.  
- `docker compose ... up -d --build` sobe o ecossistema completo sem erros.  
- Todas as portas oficiais respondendo localmente (ou via Nginx na VPS).  
- Documentação (este arquivo) alinhada com o estado real do deploy.

> Qualquer mudança futura (novos módulos, portas, tokens) deve ser refletida aqui antes de chegar na VPS.

---

## 10. Referências Rápidas

- `infra/setup-vps-dev-machine.sh` – script completo.  
- `infra/docker/.env.core` – mapa de portas.  
- `Documentação RS Prólipsi (Ver Sempre)/POWER_DEPLOY_RS_PROLIPSI_MAX_v2.txt` – playbook estendido.  
- `Documentação RS Prólipsi (Ver Sempre)/Credenciais Geral – RSPrólipsi.txt` – credenciais base (uso controlado).

---

**Checklist final antes de liberar para o time:**

- [ ] Todos os módulos migrados para PNPM com lock novo.  
- [ ] Dockerfiles ajustados e testados.  
- [ ] Compose executado com sucesso (`up -d --build`).  
- [ ] Serviços respondendo nas portas oficiais.  
- [ ] Este arquivo revisado/aprovado.
