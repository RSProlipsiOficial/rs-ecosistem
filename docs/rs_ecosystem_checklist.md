# Checklist Técnico - RS Prólipsi Ecosystem

Este documento lista o status atual de cada módulo e pacote do monorepo, identificando pontos de atenção, código ausente e tarefas pendentes.

## 1. Status dos Aplicativos (`/apps`)

| App | Status | Descrição do Problema / Observação | Prioridade |
|---|---|---|---|
| `rs-ops-app` | 🟢 **OK** | Único app funcional. Motor de cálculo de bônus, ciclos e monitoramento. Usa TS e Supabase. | - |
| `rs-logistica` | 🟢 **MOVED** | Módulo de logística movido para `/apps`. Compilando corretamente. | - |
| `rs-admin` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | ALTA |
| `rs-api` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | ALTA |
| `rs-consultor` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | ALTA |
| `rs-marketplace` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | ALTA |
| `rs-walletpay` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | ALTA |
| `rs-studio` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | MÉDIA |
| `rs-site` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | MÉDIA |
| `rs-rotafacil` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | MÉDIA |
| `rs-template-game`| 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | BAIXA |
| `rs-robo-kagi...` | 🟡 **STUB** | Estrutura de placeholder criada. Aguardando código fonte. | BAIXA |

## 2. Status dos Pacotes (`/packages`)

| Pacote | Status | Utilização | Observação |
|---|---|---|---|
| `rs-ops-config` | 🟢 **OK** | Usado por `rs-ops-app`. | Configurações compartilhadas. |
| `supabase-client`| 🟢 **OK** | Usado por `rs-ops-app` e outros. | Cliente Supabase unificado. |
| `rs-config` | 🟢 **CREATED** | Criado para centralizar configurações. Contém stubs para build do `rs-ops`. | Em desenvolvimento. |

## 3. Infraestrutura e Configuração

*   [x] **pnpm-workspace.yaml**: Corrigido erro de digitação (`supabse` -> `supabase`).
*   [ ] **docker-compose.yml**: Existe configuração para backends, mas precisa ser validada com os apps reais.
*   [ ] **Deploy Scripts**: Scripts em `infra/` e `apps/rs-ops-app/src/deploy/` parecem robustos, mas dependem da existência dos apps em `/srv/rsprolipsi`.

## 4. Pontos de Atenção (Issues)

1.  **Código Ausente**: A maior parte do ecossistema definido nos PRDs ainda não foi importada. Os placeholders servem apenas para manter a estrutura.
2.  **Duplicidade de Configs**: `rs-ops-app` tinha configs hardcoded ou imports quebrados que foram corrigidos movendo para `packages/rs-config`.

## 5. Próximos Passos (TODOs)

### Prioridade ALTA
- [ ] Importar/Implementar o código real dos apps marcados como **STUB**.
- [ ] Validar rotas de produção para `rs-logistica` na nova localização.

### Prioridade MÉDIA
- [ ] Centralizar mais configurações do `rs-ops-app` no `rs-config`.

### Prioridade BAIXA
- [ ] Documentar API endpoints quando `rs-api` for populado.
