
# RS Ops Config Map

Este documento mapeia a configuração operacional do ecossistema RS Prólipsi, centralizada no pacote `rs-ops-config`.

## 1. Service Registry (`registry/services.ts`)

| ID | Nome | Porta Interna | Domínio | Tipo | Tags |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `rs-api` | RS API Gateway | 8080 | `api.rsprolipsi.com.br` | service | backend, core, api |
| `rs-core` | RS Core (SIGMA) | **4001** | `core.rsprolipsi.com.br` | service | backend, core, database |
| `rs-logistica` | RS Logística | **3005** | `logistica.rsprolipsi.com.br` | service | backend, logistics |
| `rs-ops` | RS Ops | 3006 | `ops.rsprolipsi.com.br` | tooling | tooling, dashboard |
| `rs-docs` | RS Docs | 3007 | `docs.rsprolipsi.com.br` | service | docs, static |
| `rs-admin` | RS Admin Panel | 3001 | `admin.rsprolipsi.com.br` | frontend | frontend, admin |
| `rs-marketplace` | RS Marketplace | 3002 | `loja.rsprolipsi.com.br` | frontend | frontend, ecommerce |
| `rs-walletpay` | RS WalletPay | 3004 | `walletpay.rsprolipsi.com.br` | frontend | frontend, fintech |
| `rs-rotafacil` | RS Rotafácil | 3013 | `rotafacil.rsprolipsi.com.br` | frontend | frontend, logistics |
| `rs-robo` | RS Robo Kagi | 5009 | `robo.rsprolipsi.com.br` | frontend | frontend, bot |

## 2. Fluxos de Comunicação (`contracts/*.ts`)

### Fluxo de Pedido e Bônus (End-to-End)

1. **Pedido Confirmado** (`rs-api` -> `rs-logistica`)
    * Rota: `POST /v1/logistics/payment-confirmed`
    * Contrato: `LogisticsPaymentConfirmation`
    * Ação: Inicia separação no CD.

2. **Entrega Confirmada** (`rs-logistica` -> `rs-core`)
    * Rota: `POST /v1/sigma/close-cycle`
    * Contrato: `SigmaCloseCyclePayload`
    * Ação: Logística confirma entrega e solicita fechamento de ciclo.

3. **Distribuição de Bônus** (`rs-core` -> `rs-api`)
    * Rota: `POST /v1/wallet/credit`
    * Contrato: `WalletTransaction` (implícito)
    * Segurança: Header `x-internal-token`
    * Ação: SIGMA calcula e credita bônus na wallet.

## 3. Configuração e Helpers

* **Env**: `getEnv`, `getEnvNumber`, `getEnvBoolean`.
* **Rules**: Regras de negócio estáticas (fallback) em `src/config/rules.ts`.
* **Dynamic Config**: `getRule(section, key, default)` busca regras do banco/API via `ConfigProvider`.
* **HTTP Client**: `ServiceHttpClient` para chamadas internas tipadas.
* **Healthcheck**: `createHealthCheck` padronizado.

## 4. Configuração Dinâmica (Painel Admin)

O sistema suporta alteração de regras de negócio em tempo real via Painel Admin.

1. **Frontend (`rs-admin`)**:
    * Consome endpoints `/admin/sigma/*` e `/admin/career/*`.
    * Envia atualizações para `rs-api`.

2. **Backend (`rs-api`)**:
    * Rotas em `src/routes/adminConfig.ts`.
    * Serviço `sigmaConfigService` persiste em tabelas `sigma_settings`, `sigma_depth_levels`, etc.

3. **Banco de Dados (Supabase)**:
    * Migration: `supabase/migrations/rs-backend-sync-001.sql` (criar tabelas)
    * Seed: `supabase/seeds/001-sigma-default-config.sql` (valores padrão)
    * Os valores iniciais vêm do seed e podem ser alterados pelo admin

4. **Consumo (`rs-core`, `rs-logistica`)**:
    * Utilizam `getRule` do `rs-ops-config`.
    * `SupabaseConfigProvider` busca valores dinâmicos do banco
    * Fallback para `RULES` estáticos em caso de falha
