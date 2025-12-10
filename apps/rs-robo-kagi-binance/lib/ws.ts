

export function connectWS(
  onMsg: (data: any) => void,
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void,
) {
  let reconnectDelay = 1000; // Start with 1 second
  const maxReconnectDelay = 30000; // Cap at 30 seconds
  let priceUpdateInterval: number | undefined;


  const getWsUrl = () => {
    // Protocol-aware WebSocket URL to support both production (wss) and development (ws on port 8000).
    const isProd = window.location.protocol === 'https:';
    const protocol = isProd ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost'; // Fallback to localhost
    const port = isProd ? '' : ':8000';
    return `${protocol}://${hostname}${port}/ws`;
  };

  const connect = () => {
    onStatusChange('connecting');
    const ws = new WebSocket(getWsUrl());
    
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
      console.log("WebSocket connected");
      onStatusChange('connected');
      reconnectDelay = 1000; // Reset delay on successful connection

      // SIMULATE REAL-TIME PRICE FEEDS
      if (priceUpdateInterval) clearInterval(priceUpdateInterval);
      const symbolsToUpdate = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
      let lastPrices: Record<string, number> = { 'BTC/USDT': 68000, 'ETH/USDT': 3800, 'SOL/USDT': 165, 'BNB/USDT': 600 };
      priceUpdateInterval = window.setInterval(() => {
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
      }, 1000); // Send updates every second
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected. Reconnecting in ${reconnectDelay / 1000} seconds...`);
      onStatusChange('disconnected');
       if (priceUpdateInterval) clearInterval(priceUpdateInterval); // Stop simulation on disconnect
      setTimeout(connect, reconnectDelay);
      // Increase delay for next attempt
      reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    };

    ws.onerror = () => {
      // The 'onerror' event is automatically followed by the 'onclose' event,
      // which handles the reconnection logic. Logging an error here is redundant
      // and can be alarming when the backend is intentionally offline during development.
      // The UI already provides clear feedback on the connection status.
    };

    return ws;
  }

  return connect();
}
