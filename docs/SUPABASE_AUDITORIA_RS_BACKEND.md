# Relatório de Auditoria Supabase - RS Backend

**Data:** 20/11/2025
**Responsável:** RS2 Auditor
**Status:** Concluído com ressalvas

## 1. Resumo Geral

A auditoria foi realizada conectando ao projeto Supabase via credenciais encontradas em `apps/rs-api/.env` (ou `rs-core`).
O objetivo foi validar a existência de tabelas e funções (RPCs) exigidas pelo código do backend (`rs-api`, `rs-core`, `rs-logistica`).

* **Tabelas Críticas (Wallet):** ✅ Encontradas (`wallets`, `transactions`, `withdrawals`, `pix_keys`).
* **Tabelas Operacionais (Core/Logística):** ⚠️ Parcialmente ausentes (`logistics_orders`, `cycles`).
* **RPCs (Funções):** ⚠️ Não foi possível validar assinatura exata via API, mas o erro retornado sugere que as funções podem não existir ou exigem parâmetros obrigatórios não testados. Requer revisão SQL manual.

## 2. Tabelas – Conferência Detalhada

| Tabela | Status | Observação |
| :--- | :--- | :--- |
| `wallets` | **[OK]** | Tabela principal de saldo encontrada. |
| `wallet_transactions` | **[OK]** | Histórico de transações encontrado. |
| `wallet_withdrawals` | **[OK]** | Solicitações de saque encontradas. |
| `wallet_pix_keys` | **[OK]** | Chaves PIX encontradas. |
| `sales` | **[OK]** | Tabela de vendas (Core) encontrada. |
| `cycle_events` | **[OK]** | Eventos de ciclo (Core) encontrados. |
| `logistics_orders` | **[ERRO]** | **Tabela não encontrada.** Necessária para `rs-logistica`. |
| `cycles` | **[ERRO]** | **Tabela não encontrada.** Necessária para `rs-core` (SIGMA). |

### Análise de Risco (Tabelas)

* A falta de `logistics_orders` impedirá o `rs-logistica` de persistir pedidos recebidos.
* A falta de `cycles` impedirá o `rs-core` de gerenciar os ciclos do SIGMA.

## 3. RPCs – Conferência Detalhada

As seguintes funções são chamadas pelo código (`wallet.controller.js`), mas não puderam ser confirmadas com certeza via API REST (erro de "function not found in schema cache" ao chamar sem parâmetros). Isso geralmente indica que a função não existe ou a assinatura está incorreta.

| Função (RPC) | Status | Risco |
| :--- | :--- | :--- |
| `get_wallet_statement` | **[ATENÇÃO]** | Relatórios de extrato podem falhar. |
| `block_balance` | **[ATENÇÃO]** | Saques podem não bloquear saldo (risco financeiro). |
| `debit_balance` | **[ATENÇÃO]** | Débitos podem falhar. |
| `unblock_balance` | **[ATENÇÃO]** | Rejeição de saque pode não devolver saldo. |
| `transfer_between_wallets` | **[ATENÇÃO]** | Transferências P2P podem falhar. |
| `process_deposit` | **[ATENÇÃO]** | Depósitos podem não ser processados. |
| `confirm_deposit` | **[ATENÇÃO]** | Webhooks de pagamento falharão. |

## 4. Sugestões de Ajustes (SQL)

Abaixo estão os scripts SQL sugeridos para corrigir as ausências identificadas.
**NÃO EXECUTAR AUTOMATICAMENTE.** Revisar e aplicar via SQL Editor do Supabase.

```sql
-- SUGESTÃO SQL (NÃO EXECUTADA, APENAS PROPOSTA)

-- 1. Criar tabela logistics_orders
CREATE TABLE IF NOT EXISTS public.logistics_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    amount NUMERIC,
    customer JSONB,
    items JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela cycles (SIGMA)
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cycle_id TEXT UNIQUE NOT NULL,
    consultor_id TEXT NOT NULL,
    slots_filled INTEGER DEFAULT 0,
    slots_total INTEGER DEFAULT 6,
    status TEXT DEFAULT 'open', -- open, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Exemplo de RPC faltante (confirm_deposit)
CREATE OR REPLACE FUNCTION public.confirm_deposit(p_deposit_id TEXT, p_transaction_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit RECORD;
    v_new_balance NUMERIC;
BEGIN
    -- Lógica de confirmação aqui
    -- ...
    RETURN jsonb_build_object('success', true);
END;
$$;
```

## 5. Conclusão

O banco de dados possui a estrutura básica da Wallet (`wallets`, `transactions`), mas carece de tabelas operacionais críticas para a Logística e o Core (`cycles`). As funções RPC também precisam ser validadas/recriadas para garantir a integridade das transações financeiras. Recomenda-se rodar os scripts de criação das tabelas faltantes e revisar a implementação das RPCs no Supabase.
