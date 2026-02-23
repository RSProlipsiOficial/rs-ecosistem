

/// <reference types="vite/client" />

export function connectWS(
  onMsg: (data: any) => void,
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void,
) {
  let reconnectDelay = 1000; // Start with 1 second
  const maxReconnectDelay = 30000; // Cap at 30 seconds
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let priceUpdateInterval: number | undefined;
  let isIntentionallyClosed = false;
  let currentWs: WebSocket | null = null;


  const getWsUrl = () => {
    // Detectar se estamos em ambiente local
    const currentHostname = window.location.hostname;
    const isLocal = currentHostname === 'localhost' ||
      currentHostname.startsWith('192.168.') ||
      currentHostname.startsWith('10.') ||
      currentHostname.startsWith('127.0.');

    // Se for local, SEMPRE tentar conectar no mesmo IP, porta 4000
    if (isLocal) {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      console.log(`[WebSocket] Ambiente local detectado. Tentando conectar em ${protocol}://${currentHostname}:4000/ws`);
      return `${protocol}://${currentHostname}:4000/ws`;
    }

    // Se não for local, usar a URL de produção do env
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    if (backendUrl) {
      console.log(`[WebSocket] Ambiente de produção. Conectando em ${backendUrl}/ws`);
      return backendUrl.replace(/^http/, 'ws') + '/ws';
    }

    // Fallback final
    const isProd = window.location.protocol === 'https:';
    const protocol = isProd ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    const port = isProd ? '' : ':4000';
    return `${protocol}://${hostname}${port}/ws`;
  };

  const connect = () => {
    if (isIntentionallyClosed) {
      console.log('[WebSocket] Conexão foi fechada intencionalmente, não reconectando');
      return;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('[WebSocket] Máximo de tentativas de reconexão atingido');
      onStatusChange('disconnected');
      return;
    }

    onStatusChange('connecting');
    const ws = new WebSocket(getWsUrl());
    currentWs = ws;

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'state') {
          // Initial state for both bots
          onMsg({ type: 'kagi_bot_state', data: { running: msg.data.kagi_bot_running, focus: msg.data.focus } });
          onMsg({ type: 'ai_bot_state', data: { running: msg.data.ai_bot_running } });
          onMsg({ type: 'ai_monitor_list', data: { symbols: msg.data.ai_monitored_symbols } });

        } else {
          onMsg(msg);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onopen = () => {
      console.log("[WebSocket] Conectado com sucesso");
      onStatusChange('connected');
      reconnectDelay = 1000; // Reset delay on successful connection
      reconnectAttempts = 0; // Reset attempts on successful connection

      // SIMULATE REAL-TIME PRICE FEEDS
      if (priceUpdateInterval) clearInterval(priceUpdateInterval);
      const symbolsToUpdate = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
      let lastPrices: Record<string, number> = { 'BTC/USDT': 68000, 'ETH/USDT': 3800, 'SOL/USDT': 165, 'BNB/USDT': 600 };
      priceUpdateInterval = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          symbolsToUpdate.forEach(symbol => {
            const change = (Math.random() - 0.5) * (lastPrices[symbol] * 0.0005);
            lastPrices[symbol] += change;
            const priceUpdate = {
              type: 'price_update',
              data: {
                symbol: symbol,
                price: lastPrices[symbol],
                time: Date.now()
              }
            };
            onMsg(priceUpdate);
          });
        }
      }, 1000); // Send updates every second
    };

    ws.onclose = () => {
      if (isIntentionallyClosed) {
        console.log('[WebSocket] Conexão fechada intencionalmente');
        return;
      }

      reconnectAttempts++;
      console.log(`[WebSocket] Desconectado. Tentativa ${reconnectAttempts}/${maxReconnectAttempts}. Reconectando em ${reconnectDelay / 1000}s...`);
      onStatusChange('disconnected');
      if (priceUpdateInterval) clearInterval(priceUpdateInterval); // Stop simulation on disconnect

      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(connect, reconnectDelay);
        // Increase delay for next attempt
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Erro:', error);
      // The 'onerror' event is automatically followed by the 'onclose' event,
      // which handles the reconnection logic.
    };

    return ws;
  };

  const initialWs = connect();

  // Return cleanup function
  return () => {
    isIntentionallyClosed = true;
    if (priceUpdateInterval) clearInterval(priceUpdateInterval);
    if (currentWs && currentWs.readyState === WebSocket.OPEN) {
      currentWs.close();
    }
  };
}
