/**
 * RS PRÓLIPSI API SERVER - MARKETPLACE
 * Servidor simplificado para checkout do marketplace
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ================================================
// MIDDLEWARE
// ================================================

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5003',
    'http://localhost:5004',
    'https://admin.rsprolipsi.com.br',
    'https://consultor.rsprolipsi.com.br',
    'https://marketplace.rsprolipsi.com.br',
    'https://agendaviva.rsprolipsi.com.br',
    'https://api.rsprolipsi.com.br',
    'https://rsprolipsi.com.br'
  ],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// Logging de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ================================================
// ROTAS DO MARKETPLACE
// ================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RS Prólipsi Marketplace API',
    timestamp: new Date().toISOString(),
    environment: {
      mercadoPagoConfigured: !!process.env.MP_ACCESS_TOKEN,
      melhorEnvioConfigured: !!process.env.MELHOR_ENVIO_TOKEN
    }
  });
});

// Rotas de shipping, payment, webhook e pedidos compartilhados
app.use('/api/shipping', require('./src/routes/shipping.routes'));
app.use('/api/payment', require('./src/routes/payment.routes'));
app.use('/api/webhook', require('./src/routes/webhook.routes'));
app.use('/api/shared-order', require('./src/routes/shared-order.routes'));

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// ================================================
// TRATAMENTO DE ERROS
// ================================================

app.use((err, req, res, next) => {
  console.error('ERRO NA API:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================================================
// SERVIDOR
// ================================================

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Escutar em todas as interfaces

app.listen(PORT, HOST, () => {
  console.log('================================================');
  console.log(`🚀 RS Prólipsi Marketplace API`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 Host: ${HOST} (acessível externamente)`);
  console.log(`💳 Mercado Pago: ${process.env.MP_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`📦 Melhor Envio: ${process.env.MELHOR_ENVIO_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log('================================================');
});

module.exports = app;
