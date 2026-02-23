---
name: rs-padrao-auditoria-e-logs
description: Skill que define o padrão oficial de auditoria e logs do ecossistema RS Prólipsi. Garante rastreabilidade de ações críticas (pagamentos, bônus, comissões, permissões), correlação de eventos, logs estruturados e suporte a conciliação e compliance. Keywords: audit, logs, observability, payments, ledger, bonus, commission, security.
---

# RS Prólipsi — Padrão Oficial de Auditoria e Logs

## Objetivo da Skill
Garantir que toda ação crítica no RS Prólipsi seja:
- **rastreável**
- **auditável**
- **reproduzível**
- **confiável**

Auditoria não é “log bonito”.  
Auditoria é **prova técnica**.

---

## 1) O que DEVE ser auditado (obrigatório)

### 1.1 — Financeiro / WalletPay
- Criação de cobrança PIX
- Confirmação de pagamento
- Webhook recebido (válido ou inválido)
- Alteração de `payment_status`
- Movimentações de ledger
- Saques
- Conciliações automáticas

---

### 1.2 — Marketplace
- Criação de pedido
- Aprovação de pedido
- Liberação de comissão
- Split de valores
- Cancelamento/reembolso

---

### 1.3 — SIGME / MMN / Bônus
- Geração de bônus
- Cálculo de bônus
- Alteração de regras
- Derramamento de matriz
- Promoção de PIN
- Ajustes manuais

---

### 1.4 — Configurações / Permissões
- Alteração de plano
- Upgrade/downgrade
- Ativação/desativação de módulo
- Mudança de perfil/permissão
- Acesso administrativo

---

## 2) Estrutura mínima de um log de auditoria

Todo evento auditável DEVE registrar:

```json
{
  "event_type": "PAYMENT_CONFIRMED",
  "entity_type": "payment",
  "entity_id": "payment_123",
  "user_id": "user_456",
  "origin": "walletpay_webhook",
  "request_id": "req_abc",
  "metadata": {},
  "created_at": "timestamp"
}
