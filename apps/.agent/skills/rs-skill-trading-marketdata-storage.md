---
name: rs-skill-trading-marketdata-storage
description: Skill RS para integrar Binance (REST/WS), normalizar dados e armazenar histórico (candles/trades/orderbook) com índices, retenção e reprocessamento idempotente.
---

# RS Skill — Trading: Market Data + Storage

## Objetivo
Garantir dados consistentes para estratégia, backtest e gráficos.

## Regras
- Normalize tudo em schema único (symbol, ts, interval, ohlcv, volume)
- Use WebSocket para tempo real; REST para histórico e reconciliação
- Rate limit e reconexão obrigatórios
- Persistir:
  - candles (klines)
  - trades/aggTrades (se necessário)
  - snapshots de book (se estratégia exigir)

## Checklist mínimo
- [ ] Conexão WS com reconnect + backoff
- [ ] Coleta REST para preencher buracos no histórico
- [ ] Índices por symbol+interval+open_time
- [ ] Job de “data integrity” (buracos, duplicidades)
