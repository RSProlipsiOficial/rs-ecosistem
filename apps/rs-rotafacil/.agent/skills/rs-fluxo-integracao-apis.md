---
name: rs-fluxo-integracao-apis
description: >
  Skill que define como integrar APIs externas:
  pedido de chaves, armazenamento seguro,
  webhooks, retries e retomada de execução.
---

## OBJETIVO
Padronizar integrações externas no RS.

## FLUXO OBRIGATÓRIO
1) Identificar API externa
2) Listar chaves necessárias
3) Pausar execução
4) Solicitar chaves ao operador
5) Armazenar em env/secrets
6) Retomar execução automaticamente

## REGRAS
- Chave nunca hardcoded
- Webhook sempre idempotente
- Retry com backoff
