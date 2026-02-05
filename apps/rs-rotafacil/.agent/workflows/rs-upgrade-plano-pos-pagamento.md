---
description: Workflow RS para upgrade automático de plano e liberação de módulos/permissões após confirmação real de pagamento (WalletPay/PSP). Garante idempotência, auditoria, consistência entre backend/frontend e bloqueio de acesso em pagamento pendente.
---

rs-upgrade-plano-pos-pagamento.md
---
name: upgrade-plano-pos-pagamento
description: Workflow RS para upgrade automático de plano e liberação de módulos/permissões após confirmação real de pagamento (WalletPay/PSP). Garante idempotência, auditoria, consistência entre backend/frontend e bloqueio de acesso em pagamento pendente. 
agent: rs-encarregado-geral
skills:
  - rs-matriz-de-roteamento
  - rs-contrato-api-e-erros
  - rs-padrao-auditoria-e-logs
  - rs-checklist-validacao-final
---

# RS Prólipsi — Workflow: Upgrade de Plano Pós-Pagamento

## Prioridade
🔥 **ALTA** — monetização + controle de acesso + experiência do usuário.

---

## Objetivo
Garantir que:
- usuário compra um plano
- pagamento é confirmado de forma real
- plano é atualizado automaticamente
- módulos e permissões são liberados automaticamente
- tudo é idempotente e auditável

---

## FASE 1 — Criação da intenção de upgrade (Config/Perfis)

### 1.1 Solicitação
Ao solicitar upgrade:
- registrar intenção:
  - `upgrade_request_id`
  - `user_id`
  - `from_plan`
  - `to_plan`
  - `status = pending_payment`
- gerar cobrança no WalletPay
- vincular:
  - `payment_id`
  - `txid`
- auditoria:
  - `PLAN_UPGRADE_REQUESTED`

❌ Não liberar módulo agora

---

## FASE 2 — Pagamento (WalletPay)

### 2.1 PIX/QR criado
- `payment_status = pending`
- auditoria:
  - `PAYMENT_CREATED`

### 2.2 Confirmação real
- webhook validado e idempotente
- consulta ativa como fallback

Quando confirmado:
- `payment_status = paid`
- auditoria:
  - `PAYMENT_CONFIRMED`

---

## FASE 3 — Aplicar upgrade (transação)

Somente após:
- `payment_status = paid`

Executar como operação transacional:
1) Atualizar plano do usuário:
   - `current_plan = to_plan`
2) Atualizar permissões:
   - roles/permissions conforme catálogo do plano
3) Ativar módulos:
   - setar `module_status` de cada módulo do plano

Auditoria:
- `PLAN_UPGRADED`
- `MODULE_ENABLED` (para cada módulo liberado)

---

## FASE 4 — Idempotência

Regras:
- Se o webhook repetir, não pode aplicar upgrade duas vezes
- `upgrade_request_id` deve impedir duplicidade
- Se já estiver em `to_plan`, retornar sucesso e registrar evento duplicado

Evento opcional:
- `PLAN_UPGRADE_DUPLICATED_EVENT`

---

## FASE 5 — Frontend / UI

- Enquanto `pending_payment`:
  - mostrar status “Aguardando pagamento”
  - não liberar telas/módulos bloqueados
- Após `paid`:
  - refletir plano atualizado
  - liberar navegação e recursos
- Não confiar em “cache do front”
  - revalidar plano ao logar/abrir painel

---

## FASE 6 — Auditoria e logs

Eventos mínimos:
- `PLAN_UPGRADE_REQUESTED`
- `PAYMENT_CREATED`
- `PAYMENT_CONFIRMED`
- `PLAN_UPGRADED`
- `MODULE_ENABLED`

---

## FASE 7 — Validação final

Executar `rs-checklist-validacao-final`:

- [ ] Sem pagamento, sem upgrade
- [ ] Pagamento duplicado não duplica upgrade
- [ ] Módulos liberados batem com plano
- [ ] Auditoria completa
- [ ] UI reflete plano real do backend

---

## Declaração de sucesso
O workflow está correto quando:
- upgrade é automático e confiável
- não existe “liberação antecipada”
- eventos duplicados não causam duplicidade
- logs permitem rastrear qualquer caso
