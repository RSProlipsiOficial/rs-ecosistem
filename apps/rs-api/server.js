/**
 * RS PRÓLIPSI API SERVER
 * Servidor principal da API REST
 */

require('dotenv').config({ path: __dirname + '/.env' });
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
    'https://studio.rsprolipsi.com.br'
  ],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});
app.use(limiter);

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ================================================
// ROTAS
// ================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/users.routes'));
app.use('/api/sigma', require('./src/routes/sigma.routes'));
app.use('/api/career', require('./src/routes/career.routes'));
app.use('/api/wallet', require('./src/routes/wallet.routes'));
app.use('/api/marketplace', require('./src/routes/marketplace.routes'));
app.use('/api/studio', require('./src/routes/studio.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/shipping', require('./src/routes/shipping.routes'));
app.use('/api/payment', require('./src/routes/payment.routes'));
app.use('/api/checkout', require('./src/routes/checkout.routes')); // ← NOVO!
app.use('/api/webhook', require('./src/routes/webhook.routes'));

// Comunicação (rotas públicas de leitura, compatíveis com Admin/Consultor/Marketplace)
try {
  const communications = require('./src/routes/communications');
  app.use(communications.default || communications);
} catch (e) {
  console.warn('Aviso: rota communications não carregada:', e?.message);
}
try {
  const consultantComms = require('./src/routes/consultantCommunications');
  app.use(consultantComms.default || consultantComms);
} catch (e) {
  console.warn('Aviso: rota consultantCommunications não carregada:', e?.message);
}

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// ================================================
// ERROR HANDLER
// ================================================

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: err.message
    });
  }
  
  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado'
    });
  }
  
  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ================================================
// INICIAR SERVIDOR
// ================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('================================================');
  console.log('🚀 RS PRÓLIPSI API');
  console.log('================================================');
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`✅ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('================================================');
  console.log('📡 Rotas disponíveis:');
  console.log('   /api/auth        - Autenticação');
  console.log('   /api/users       - Usuários');
  console.log('   /api/sigma       - Matriz SIGMA');
  console.log('   /api/career      - Carreira');
  console.log('   /api/wallet      - Carteira');
  console.log('   /api/marketplace - Marketplace');
  console.log('   /api/checkout    - Checkout integrado'); // ← NOVO!
  console.log('   /api/studio      - RS Studio');
  console.log('   /api/admin       - Admin');
  console.log('   /api/webhook     - Webhooks');
  console.log('   /v1/communications/*        - Comunicação (Admin/consultor/loja)');
  console.log('   /consultor/communications/* - Comunicação (Consultor/loja)');
  console.log('================================================');
  console.log('💛🖤 API PRONTA PARA USO!');
  console.log('================================================\n');
  
  // Iniciar listener de eventos de ciclo
  console.log('🔄 Inicializando serviços de background...');
  const { startCycleEventListener } = require('./src/services/cycleEventListener');
  startCycleEventListener();
  console.log('================================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});
