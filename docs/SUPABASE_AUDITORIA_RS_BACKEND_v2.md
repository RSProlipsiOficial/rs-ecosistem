# Relatório de Auditoria Supabase - RS Backend (v2)

**Data:** 20/11/2025
**Status:** Planejamento de Migração Concluído

## 1. Resumo da Situação

A auditoria inicial identificou a falta de tabelas críticas para Logística e SIGMA, além de RPCs não validadas.
Foi gerado um arquivo de migração (`supabase/migrations/rs-backend-sync-001.sql`) contendo as propostas de criação para esses objetos, sem execução automática.

## 2. Status das Tabelas

| Tabela | Status Atual | Ação Proposta (SQL) |
| :--- | :--- | :--- |
| `wallets` | **[OK]** | Nenhuma. |
| `wallet_transactions` | **[OK]** | Nenhuma. |
| `logistics_orders` | **[FALTANTE]** | **[PLANEJADO]** Criar tabela com campos `order_id`, `items`, `status`, `customer`. |
| `cycles` | **[FALTANTE]** | **[PLANEJADO]** Criar tabela com `cycle_id`, `consultor_id`, `slots_filled`. |

## 3. Status das RPCs (Funções)

| Função (RPC) | Status Atual | Ação Proposta (SQL) |
| :--- | :--- | :--- |
| `get_wallet_statement` | **[DÚVIDA]** | **[PLANEJADO]** Criar função retornando tabela de transações filtrada por data. |
| `confirm_deposit` | **[DÚVIDA]** | **[PLANEJADO]** Criar função (mock inicial) para confirmar depósitos. |
| `process_deposit` | **[DÚVIDA]** | **[PLANEJADO]** Criar função (mock inicial) para registrar depósitos. |
| `transfer_between_wallets` | **[DÚVIDA]** | **[PLANEJADO]** Criar função transacional para débito/crédito entre usuários. |

## 4. Próximos Passos (DBA)

1. Acessar o painel do Supabase (SQL Editor).
2. Abrir o arquivo `supabase/migrations/rs-backend-sync-001.sql`.
3. Revisar os blocos marcados como `-- SUGESTÃO`.
4. Executar os comandos SQL manualmente para criar as tabelas e funções faltantes.
5. Após execução, o backend `rs-api`, `rs-core` e `rs-logistica` estará totalmente alinhado com o banco.
