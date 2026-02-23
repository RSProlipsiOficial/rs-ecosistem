---
name: rs-lei-dados-e-metricas
description: Lei do RS para dados e métricas. Governa fontes de verdade, consolidação, periodicidade e uso de métricas para decisões humanas e de IA.
---

# RS — Lei de Dados & Métricas

## Princípio
📊 Métrica só é válida se nasce de **evento confirmado**.

---

## Fontes válidas
- auditoria imutável
- pagamentos confirmados
- estados finais (paid, delivered, released)

Fontes inválidas:
- intenção
- cache de frontend
- cálculos não auditados

---

## Consolidação
- diária (operacional)
- mensal (executiva)
- sem sobrescrever histórico

---

## Uso permitido
- dashboards
- alertas
- aprendizado do sistema
- decisões estratégicas

---

## Auditoria obrigatória
Eventos:
- METRICS_AGGREGATED
- METRICS_PUBLISHED
