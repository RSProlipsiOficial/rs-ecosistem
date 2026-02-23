---
name: rs-fabrica-saas
description: >
  Skill que define o padrão oficial RS para criação de SaaS.
  Garante arquitetura consistente, multi-tenant, admin,
  auth, billing e prontidão para produção.
---

## OBJETIVO
Padronizar a criação de qualquer SaaS dentro do RS Ecosystem.

## ESTRUTURA MÍNIMA
Todo SaaS deve conter:
- frontend (app/admin)
- backend (api)
- auth + roles
- multi-tenant
- billing/planos
- logs/auditoria
- variáveis de ambiente

## REGRAS
- SaaS sem admin é inválido
- SaaS sem multi-tenant é bloqueado
- Sem checklist final não publica

## STACK PADRÃO (DEFAULT)
- Front: React/Next
- Back: Node (Fastify/Hono)
- DB: Supabase
- Auth: Supabase Auth + RBAC

## ENTREGA
Sempre gerar:
- estrutura de pastas
- README técnico
- checklist de deploy
