---
name: rs-skill-trading-charts-reports
description: Skill RS para gerar gráficos (candles + indicadores + marcações de trades) e relatórios (PnL, drawdown, win rate, exposure, slippage) exportáveis.
---

# RS Skill — Trading: Charts + Reports

## Objetivo
Gerar gráficos reais e relatórios auditáveis do robô.

## Gráficos (mínimo)
- Candles OHLCV
- Volume
- Indicadores configuráveis (EMA, RSI, VWAP etc)
- Marcadores:
  - entry/exit
  - stop/take
  - posição aberta/fechada

## Relatórios (mínimo)
- Equity curve
- PnL por dia/semana
- Drawdown máximo
- Win rate / payoff
- Slippage e fees
- Latência (ordem enviada → fill)

## Regras RS
- Gráfico não pode depender de “achismo”; usa dados persistidos
- Cada trade tem ID e aparece no gráfico e no relatório
