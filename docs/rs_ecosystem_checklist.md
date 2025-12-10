# Checklist Técnico - RS Prólipsi Ecosystem

Este documento lista o status atual de cada módulo e pacote do monorepo, identificando pontos de atenção, código ausente e tarefas pendentes.

## 1. Status dos Aplicativos (`/apps`)

| App | Status | Descrição do Problema / Observação | Prioridade |
|---|---|---|---|
| `rs-ops-app` | 🟢 **OK** | Único app funcional. Motor de cálculo de bônus, ciclos e monitoramento. Usa TS e Supabase. | - |
| `rs-admin` | 🔴 **MISSING** | Diretório vazio. Código fonte não encontrado. | ALTA |
| `rs-api` | 🔴 **MISSING** | Diretório vazio. Deveria ser um monorepo interno ou gateway para `crm`, `shop-bff`, `wallet`. | ALTA |
| `rs-consultor` | 🔴 **MISSING** | Diretório vazio. Painel do consultor ausente. | ALTA |
| `rs-marketplace` | 🔴 **MISSING** | Diretório vazio. E-commerce ausente. | ALTA |
| `rs-walletpay` | 🔴 **MISSING** | Diretório vazio. Core financeiro ausente. | ALTA |
| `rs-studio` | 🔴 **MISSING** | Diretório vazio. Módulo de IA ausente. | MÉDIA |
| `rs-site` | 🔴 **MISSING** | Diretório vazio. Site institucional ausente. | MÉDIA |
| `rs-rotafacil` | 🔴 **MISSING** | Diretório vazio. Sistema de rotas ausente. | MÉDIA |
| `rs-template-game`| 🔴 **MISSING** | Diretório vazio. Jogos ausentes. | BAIXA |
| `rs-robo-kagi...` | 🔴 **MISSING** | Diretório vazio. Robô de trading ausente. | BAIXA |
| `rs-logistica` | 🟡 **MOVED** | Código está na raiz `/logistica/rs-logistica`. Deveria estar em `/apps/`. | MÉDIA |

## 2. Status dos Pacotes (`/packages`)

| Pacote | Status | Utilização | Observação |
|---|---|---|---|
| `rs-ops-config` | 🟢 **OK** | Usado por `rs-ops-app`. | Configurações compartilhadas. |
| `supabase-client`| 🟢 **OK** | Usado por `rs-ops-app` e outros. | Cliente Supabase unificado. |
| `rs-config` | ⚪ **Empty** | Aparentemente vazio ou não utilizado. | Verificar necessidade. |

## 3. Infraestrutura e Configuração

*   [ ] **pnpm-workspace.yaml**: Contém erro de digitação (`supabse` ao invés de `supabase`).
*   [ ] **docker-compose.yml**: Existe configuração para backends, mas precisa ser validada com os apps reais.
*   [ ] **Deploy Scripts**: Scripts em `infra/` e `apps/rs-ops-app/src/deploy/` parecem robustos, mas dependem da existência dos apps em `/srv/rsprolipsi`.

## 4. Pontos de Atenção (Issues)

1.  **Código Ausente**: A maior parte do ecossistema definido nos PRDs não está commitada na branch `main`.
2.  **Estrutura de Pastas**: `rs-logistica` está fora do padrão do workspace (`/logistica` vs `/apps`).
3.  **Duplicidade de Configs**: `rs-ops-app` tem suas próprias configs que poderiam estar centralizadas em `packages/rs-config` ou `rs-ops-config` para uso global.
4.  **API Gateway**: A documentação de deploy menciona uma estrutura complexa dentro de `rs-api` (`apps/crm`, `apps/wallet`, etc.) que não existe aqui.

## 5. Próximos Passos (TODOs)

### Prioridade ALTA
- [ ] Localizar e commitar o código fonte dos apps faltantes (`rs-admin`, `rs-consultor`, `rs-marketplace`, `rs-api`).
- [ ] Mover `logistica/rs-logistica` para `apps/rs-logistica` e atualizar referências.
- [ ] Corrigir `pnpm-workspace.yaml`.

### Prioridade MÉDIA
- [ ] Verificar se `rs-walletpay` e a `app/wallet` dentro de `rs-api` (mencionado no deploy) são a mesma coisa ou serviços distintos.
- [ ] Padronizar nomes de pastas para bater com os scripts de deploy (ex: `rs-marketplace` vs `rs-market`).

### Prioridade BAIXA
- [ ] Limpar pastas vazias se os projetos forem ser recriados do zero.
- [ ] Documentar como rodar o ambiente local completo (Docker + Apps).
