# RS Prólipsi Ecosystem Overview

## Visão Geral

O ecossistema **RS Prólipsi** é uma plataforma integrada de **Marketing Multinível (MMN)**, E-commerce, Logística e Gestão Financeira. Ele opera através de um monorepo que orquestra múltiplos aplicativos (frontends, APIs, serviços) e bibliotecas compartilhadas.

O objetivo principal do sistema é gerenciar uma rede de consultores, vendas de produtos físicos e digitais, distribuição de bônus, e logística de entrega através de Centros de Distribuição (CDs).

---

## Módulos e Aplicativos

Baseado na estrutura de pastas (`/apps`) e no documento de deploy (`POWER_DEPLOY_RS_PROLIPSI_MAX.txt`), os seguintes módulos compõem o ecossistema:

### 1. Frontends e Painéis

| App (Pasta) | Nome Oficial | Domínio | Tipo | Status no Repo |
|---|---|---|---|---|
| `rs-site` | **Site Institucional** | `rsprolipsi.com.br` | SPA (React/Next) | 🔴 **Vazio** |
| `rs-admin` | **Painel Administrador** | `admin.rsprolipsi.com.br` | SPA (React/Admin) | 🔴 **Vazio** |
| `rs-consultor` | **Escritório Virtual** | `escritorio.rsprolipsi.com.br` | SPA (React) | 🔴 **Vazio** |
| `rs-marketplace` | **RS Shopping** | `marketplace.rsprolipsi.com.br` | Next.js / React | 🔴 **Vazio** |
| `rs-studio` | **RS.IA Studio** | `studio.rsprolipsi.com.br` | SPA (React/IA) | 🔴 **Vazio** |
| `rs-rotafacil` | **Rota Fácil** | `rotafacil.rsprolipsi.com.br` | Sistema de Rotas | 🔴 **Vazio** |
| `rs-template-game`| **Logos Alpha e Ômega**| `logos.rsprolipsi.com.br` | Game / App | 🔴 **Vazio** |

### 2. Backends e Serviços

| App (Pasta) | Nome Oficial | Domínio / Função | Tecnologias | Status no Repo |
|---|---|---|---|---|
| `rs-api` | **API Gateway** | `api.rsprolipsi.com.br` | Node.js / Express | 🔴 **Vazio** (Deveria conter sub-apps: `crm`, `shop-bff`, etc.) |
| `rs-ops-app` | **Motor Operacional** | Interno / Cron Jobs | Node.js / TypeScript | 🟢 **Ativo** (Core de bônus e ciclos) |
| `rs-walletpay` | **RS WalletPay** | `wallet.payrsprolipsi.com.br` | Fintech Core | 🔴 **Vazio** |
| `rs-logistica` | **Módulo Logístico** | Gestão de CDs | Express / Node | 🟡 **Deslocado** (Está em `/logistica/`) |

### 3. Integrações Externas / Bots

| App (Pasta) | Nome Oficial | Domínio | Status no Repo |
|---|---|---|---|
| `rs-robo-kagi-binance` | **Robô Binance** | `robo.rsprolipsi.com.br` | 🔴 **Vazio** |

---

## Fluxo de Dados e Relacionamentos

1.  **Vendas e Pedidos**: Ocorrem no **Marketplace** (`rs-marketplace`) ou nos **CDs** (`rs-logistica`).
2.  **Processamento Financeiro**: Transações são enviadas para **WalletPay** (`rs-walletpay`), que gerencia saldos e splits.
3.  **Cálculo de Bônus**: O **Motor Operacional** (`rs-ops-app`) monitora vendas e ciclos da matriz, calculando bônus (Fidelidade, Profundidade, Liderança) e atualizando o saldo na Wallet.
4.  **Gestão**:
    *   **Consultores** acompanham rede e ganhos no `rs-consultor`.
    *   **Administradores** controlam tudo via `rs-admin`.
    *   **CDs** gerenciam estoque local via módulo logístico.

## Tecnologias Principais

*   **Linguagem**: TypeScript / JavaScript (Node.js)
*   **Banco de Dados**: Supabase (PostgreSQL)
*   **Infraestrutura**: VPS Ubuntu, Nginx, PM2, Docker (para desenvolvimento local)
*   **Gerenciador de Pacotes**: PNPM (Workspaces)

---

**Observação Crítica**: Atualmente, a maior parte do código fonte das aplicações de frontend e API Gateway (`rs-api`) não está presente neste repositório ou branch. Apenas o `rs-ops-app` e `rs-logistica` possuem código fonte identificável.
