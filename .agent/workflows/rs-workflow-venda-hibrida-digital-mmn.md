---
name: rs-workflow-venda-hibrida-digital-mmn
description: Workflow RS de venda híbrida. Orquestra venda digital, split de receita, comissão afiliado e bônus MMN, garantindo ordem correta, elegibilidade e auditoria.
agent: rs-encarregado-geral
skills:
  - rs-lei-split-receita-plataforma
  - rs-lei-afiliado-mmn-hibrido
  - rs-lei-elegibilidade-ganhos
  - rs-constitucional-financeira
---

# RS — Workflow Venda Híbrida (Digital + MMN)

## FASE 1 — Criação do pedido
- Criar pedido
- Travar valores
- Definir `order_status = pending_payment`
- Auditoria: ORDER_CREATED

---

## FASE 2 — Pagamento
- Criar cobrança
- Aguardar confirmação real
- Auditoria: PAYMENT_CONFIRMED

---

## FASE 3 — Split de receita
- Aplicar taxa RS
- Calcular comissão afiliado
- Auditoria: PLATFORM_FEE_APPLIED

---

## FASE 4 — Comissão afiliado
- Criar comissão
- Verificar retenção
- Auditoria: AFFILIATE_COMMISSION_CREATED

---

## FASE 5 — MMN
- Verificar elegibilidade
- Calcular bônus SIGME
- Auditoria: MMN_BONUS_CALCULATED

---

## FASE 6 — Finalização
- Atualizar pedido para `completed`
- Auditoria: ORDER_COMPLETED
