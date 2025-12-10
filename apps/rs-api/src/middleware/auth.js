/**
 * AUTHENTICATION MIDDLEWARE
 * Middleware para autenticação JWT
 */

const jwt = require('jsonwebtoken');

/**
 * Verifica token JWT
 */
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }
    
    req.user = user;
    next();
  });
};

/**
 * Verifica se é admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

/**
 * Verifica se é o próprio usuário ou admin
 */
exports.isOwnerOrAdmin = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Você só pode acessar seus próprios dados.'
    });
  }
  next();
};

/**
 * Rate limiting por usuário
 */
exports.rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.'
      });
    }
    
    recentRequests.push(now);
    requests.set(userId, recentRequests);
    
    next();
  };
};

/**
 * Log de auditoria
 */
exports.auditLog = async (req, res, next) => {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  // Salvar log após a resposta
  res.on('finish', async () => {
    try {
      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action: `${req.method} ${req.path}`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        status_code: res.statusCode,
        metadata: {
          body: req.body,
          query: req.query,
          params: req.params
        }
      });
    } catch (error) {
      console.error('Erro ao salvar log de auditoria:', error);
    }
  });
  
  next();
};
