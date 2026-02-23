---
name: rs-workflow-robokagi-trading-completo
description: Workflow RS para evoluir o Kagi em robô completo: dados, storage, estratégia, risco, execução, backtest, paper, gráficos e observabilidade.
---

# RS Workflow — RoboKagi Trading Completo

## Quando usar
Sempre que o pedido envolver: Binance, day trade, gráfico, backtest, execução, risco, ordens.

## Passos
1) Identificar mercado (spot/futures), símbolos e intervalos
2) Implementar/adaptar MarketDataAdapter (REST/WS) + storage
3) Definir contrato StrategyEngine + RiskEngine + ExecutionEngine
4) Implementar BacktestEngine + PaperTrading
5) Implementar ChartEngine + ReportEngine
6) Observabilidade: logs + auditoria + run_id
7) Checklist final:
   - backtest ok
   - paper trading ok
   - live com limite mínimo e kill-switch
