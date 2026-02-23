---
name: rs-workflow-integrar-api-externa
description: >
  Workflow para integração segura de APIs externas,
  com pausa para chaves, retomada e validação.
---

## OBJETIVO
Integrar serviços externos sem quebra de fluxo.

## PASSOS
1) Identificar API externa
2) Listar chaves necessárias
3) Pausar execução
4) Solicitar chaves
5) Armazenar em env/secrets
6) Retomar execução
7) Validar webhooks
8) Logar integração

## SAÍDA
- API integrada
- Webhooks ativos
