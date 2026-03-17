const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 3016;

// Middleware
app.use(cors());
app.use(express.json());

// Logger & Compatibility
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Suporte para rotas de branding que o frontend pode pedir com ou sem v1
    if (req.url.includes('/admin/settings/general')) {
        return res.json({
            ok: true,
            data: {
                site_name: 'Robô Kagi Binance',
                site_logo: '/logo-rs.png',
                primary_color: '#f59e0b'
            }
        });
    }
    next();
});

// Supabase (Usando Service Role para ignorar RLS no backend)
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenRouter API
const OPENROUTER_API_KEY = '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';

// Estado global dos robôs
let robotStates = {
    kagi_bot_running: false,
    ai_bot_running: false,
    focus: 'BTC/USDT',
    ai_monitored_symbols: ['BTC/USDT', 'ETH/USDT']
};

// ==================== BINANCE API ====================

class BinanceAPI {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = 'https://fapi.binance.com'; // Futures
    }

    sign(params) {
        const queryString = Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
    }

    async request(endpoint, params = {}, method = 'GET') {
        params.timestamp = Date.now();
        params.signature = this.sign(params);

        const url = `${this.baseUrl}${endpoint}?${Object.keys(params).map(k => `${k}=${params[k]}`).join('&')}`;

        try {
            const response = await axios({
                method,
                url,
                headers: { 'X-MBX-APIKEY': this.apiKey }
            });
            return response.data;
        } catch (error) {
            console.error(`Binance API Error [${endpoint}]:`, error.response?.data || error.message);
            if (error.response?.data) {
                console.error('Detalhes do Erro Binance:', JSON.stringify(error.response.data));
            }
            throw error;
        }
    }

    async getKlines(symbol, interval, limit = 100) {
        const endpoint = '/fapi/v1/klines';
        const params = { symbol: symbol.replace('/', ''), interval, limit };
        return await axios.get(`${this.baseUrl}${endpoint}`, { params }).then(res => res.data);
    }

    async getAccountInfo() {
        return await this.request('/fapi/v2/account');
    }

    async getPositions() {
        return await this.request('/fapi/v2/positionRisk');
    }
}

// ==================== ENDPOINTS ====================

// Branding & Settings Resilience
const sendBranding = (res) => {
    res.json({
        ok: true,
        data: {
            site_name: 'Robô Kagi Binance',
            site_logo: '/logo-rs.png',
            primary_color: '#f59e0b',
            favicon: '/logo-rs.png'
        }
    });
};

app.get('/v1/admin/settings/general', (req, res) => sendBranding(res));
app.get('/admin/settings/general', (req, res) => sendBranding(res));
app.get('/v1/branding', (req, res) => sendBranding(res));
app.get('/branding', (req, res) => sendBranding(res));

// Config
app.get('/config', (req, res) => {
    res.json({ live_mode: false, ...robotStates });
});

app.post('/config', (req, res) => {
    Object.assign(robotStates, req.body);
    res.json({ success: true });
});

// Símbolos
app.get('/symbols', async (req, res) => {
    try {
        const response = await axios.get('https://fapi.binance.com/fapi/v1/exchangeInfo');
        const symbols = response.data.symbols
            .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
            .map(s => s.symbol.replace('USDT', '/USDT'))
            .slice(0, 50);
        res.json({ symbols });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// OHLCV
app.get('/ohlcv', async (req, res) => {
    try {
        const { symbol, timeframe } = req.query;
        const intervalMap = { '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '4h': '4h', '1D': '1d' };

        const response = await axios.get('https://fapi.binance.com/fapi/v1/klines', {
            params: {
                symbol: symbol.replace('/', ''),
                interval: intervalMap[timeframe] || '1h',
                limit: 100
            }
        });

        const candles = response.data.map(k => [
            k[0], // time (ms)
            parseFloat(k[1]), // open
            parseFloat(k[2]), // high
            parseFloat(k[3]), // low
            parseFloat(k[4]), // close
            parseFloat(k[5])  // volume
        ]);

        res.json({ candles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Kagi Chart (simulado)
app.get('/kagi', async (req, res) => {
    try {
        const { symbol, timeframe } = req.query;
        // Buscar OHLCV e converter para Kagi (simplificado)
        const intervalMap = { '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '4h': '4h', '1D': '1d' };

        const response = await axios.get('https://fapi.binance.com/fapi/v1/klines', {
            params: {
                symbol: symbol.replace('/', ''),
                interval: intervalMap[timeframe] || '1h',
                limit: 50
            }
        });

        const kagiData = response.data.map(k => [
            k[0], // time (ms)
            parseFloat(k[4]) // close price used as value
        ]);

        res.json({ kagi: kagiData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Market Overview
app.get('/market_overview', async (req, res) => {
    try {
        const response = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr');
        const top = response.data
            .filter(t => t.symbol.endsWith('USDT'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 10)
            .map(t => ({
                symbol: t.symbol.replace('USDT', '/USDT'),
                price: parseFloat(t.lastPrice),
                change_24h: parseFloat(t.priceChangePercent),
                volume_24h: parseFloat(t.quoteVolume)
            }));

        res.json({ top_gainers: top, top_losers: top.reverse() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Account (requer autenticação)
app.get('/account', async (req, res) => {
    try {
        // Buscar credenciais do Supabase
        const { data: keys, error: sbError } = await supabase
            .from('user_api_keys')
            .select('*')
            .limit(1)
            .single();

        if (sbError) {
            console.error('Supabase Error in /account:', sbError.message);
            return res.json({ balance: 0, positions: [], orders: [], error: 'Erro no banco de dados' });
        }

        if (!keys || !keys.binance_api_key) {
            console.warn('Nenhuma chave de API encontrada para o usuário.');
            return res.json({ balance: 0, positions: [], orders: [], error: 'Chaves não encontradas' });
        }

        console.log(`Tentando conectar na Binance com a chave: ${keys.binance_api_key.substring(0, 10)}...`);

        const binance = new BinanceAPI(keys.binance_api_key, keys.binance_api_secret);
        const account = await binance.getAccountInfo();
        const positions = await binance.getPositions();

        console.log('[DEBUG /account] Dados brutos recebidos:', { 
            hasAccount: !!account, 
            hasPositions: !!positions,
            walletBalance: account?.totalWalletBalance 
        });

        if (!account || !account.totalWalletBalance) {
            throw new Error(`Dados de conta inválidos da Binance: ${JSON.stringify(account)}`);
        }

        // Mapear para a interface AccountState do Frontend
        res.json({
            totalBalance: parseFloat(account.totalWalletBalance),
            availableBalance: parseFloat(account.availableBalance),
            totalUnrealizedPnl: parseFloat(account.totalUnrealizedProfit),
            marginUsed: parseFloat(account.totalInitialMargin),
            positions: positions.filter(p => parseFloat(p.positionAmt) !== 0).map(p => ({
                symbol: p.symbol.replace('USDT', '/USDT'),
                side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
                size: Math.abs(parseFloat(p.positionAmt)),
                entryPrice: parseFloat(p.entryPrice),
                markPrice: parseFloat(p.markPrice),
                pnl: parseFloat(p.unRealizedProfit),
                margin: parseFloat(p.isolatedMargin) || 0
            })),
            orders: []
        });
    } catch (error) {
        console.error('Account error:', error.response?.data || error.message);
        res.status(500).json({ 
            totalBalance: 0, 
            availableBalance: 0, 
            totalUnrealizedPnl: 0, 
            marginUsed: 0, 
            positions: [], 
            orders: [], 
            error: error.message 
        });
    }
});

// AI Monitor List
app.get('/ai_monitor_list', (req, res) => {
    res.json({ symbols: robotStates.ai_monitored_symbols });
});

app.post('/ai_monitor_list', (req, res) => {
    robotStates.ai_monitored_symbols = req.body.symbols || [];
    res.json({ success: true });
});

// Bot Control
app.get('/start_kagi_bot', (req, res) => {
    robotStates.kagi_bot_running = true;
    robotStates.focus = req.query.mode || 'BTC/USDT';
    res.json({ success: true, message: 'Kagi bot started' });
});

app.get('/stop_kagi_bot', (req, res) => {
    robotStates.kagi_bot_running = false;
    res.json({ success: true, message: 'Kagi bot stopped' });
});

app.get('/start_ai_bot', (req, res) => {
    robotStates.ai_bot_running = true;
    res.json({ success: true, message: 'AI bot started' });
});

app.get('/stop_ai_bot', (req, res) => {
    robotStates.ai_bot_running = false;
    res.json({ success: true, message: 'AI bot stopped' });
});

// ==================== WEBSOCKET ====================

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('✅ Cliente WebSocket conectado');

    // Enviar estado inicial
    ws.send(JSON.stringify({
        type: 'state',
        data: robotStates
    }));

    // Simulação removida para usar dados reais da Binance via fetch/ohlcv
    // const priceInterval = setInterval(() => { ... }, 1000);

    // Keep-alive (Ping-Pong)
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('close', () => {
        console.log('❌ Cliente WebSocket desconectado');
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });
});

// Ping interval para detectar conexões mortas (keep-alive)
const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(pingInterval);
});

// ==================== SERVER START ====================

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Backend do Robô Kagi Binance rodando!`);
    console.log(`📡 HTTP Server: http://localhost:${PORT}`);
    console.log(`📡 Network: http://192.168.100.7:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`🔌 WebSocket Network: ws://192.168.100.7:${PORT}/ws`);
    console.log(`\n✅ Pronto para receber conexões do frontend!\n`);
});

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    }
});
