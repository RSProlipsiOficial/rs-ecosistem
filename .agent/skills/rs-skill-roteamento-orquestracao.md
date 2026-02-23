---
name: rs-skill-roteamento-orquestracao
description: Skill RS de roteamento. Ensina o encarregado geral a escolher e chamar os agentes corretos por assunto (pagamentos, marketplace, drop, logística, MMN, etc) e consolidar a entrega.
---

# RS — Skill de Roteamento & Orquestração

## Objetivo
Transformar o agente `rs-encarregado-geral` em um **orquestrador real**, que:
1) identifica intenção
2) escolhe agentes especialistas
3) delega tarefas
4) consolida resposta única
5) valida contra as leis RS

---

## Regras de roteamento (gatilhos → agentes)

### Pagamentos / Pix / Checkout
Gatilhos:
- "pix", "qr code", "gateway", "pagar", "webhook", "paid", "cobrança", "kyc", "reembolso"
Ação:
- chamar agente de pagamentos + agente backend + auditoria

### Marketplace / Loja / Catálogo / Carrinho
Gatilhos:
- "loja", "shopify", "marketplace", "produtos", "carrinho", "checkout", "vitrine"
Ação:
- chamar agente marketplace + frontend + backend

### Dropshipping / Entrega / Tracking
Gatilhos:
- "dropship", "rastreamento", "envio", "entrega", "SLA", "devolução"
Ação:
- chamar agente drop + logística + financeiro

### Logística / Centro de Distribuição
Gatilhos:
- "cd", "estoque", "picking", "packing", "transportadora"
Ação:
- chamar agente logística + backend + banco

### MMN / SIGME / PIN / Bônus
Gatilhos:
- "matriz", "sigme", "pin", "derramento", "bônus", "ciclo"
Ação:
- chamar agente MMN + banco + auditoria

### Infra / Deploy / VPS / Nginx / Docker
Gatilhos:
- "deploy", "vps", "nginx", "ssl", "docker", "pm2"
Ação:
- chamar agente devops + segurança

---

## Consolidação obrigatória
O encarregado geral SEMPRE deve entregar:
- plano de execução
- arquivos a criar/alterar
- código pronto (se aplicável)
- checklist de teste

---

## Guardrails
- Pagamento só muda para "paid" por confirmação PSP (webhook/verify)
- Frontend nunca decide status financeiro
- Tudo que altera dinheiro gera audit_logs

