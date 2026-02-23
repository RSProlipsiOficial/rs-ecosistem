---
name: rs-lei-auditoria-total
description: Lei de auditoria total do RS. Governa rastreabilidade de eventos humanos, automáticos e de IA, garantindo integridade, prova e investigação.
---

# RS — Lei de Auditoria Total

## Princípio
🧾 Sem auditoria, o evento **não existe**.

---

## Eventos auditáveis
- financeiros
- MMN
- afiliados
- lojas
- IA
- segurança
- deploy

---

## Requisitos mínimos
Cada evento deve conter:
- entity_id
- actor (humano/IA/sistema)
- ação
- timestamp
- origem

---

## Verdade única
- auditoria é imutável
- auditoria não é editável
- correção gera novo evento

---

## Auditoria obrigatória
Eventos:
- AUDIT_EVENT_RECORDED
- AUDIT_QUERY_EXECUTED
