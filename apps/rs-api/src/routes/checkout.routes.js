/**
 * RS PRÓLIPSI - ROTAS DE CHECKOUT
 * Checkout integrado: Pedido + Pagamento + Matriz SIGMA
 */

const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/checkout/create
 * Cria pedido completo com pagamento
 * Pode ser chamado do marketplace OU do escritório do consultor
 */
router.post('/create', checkoutController.createCheckout);

/**
 * GET /api/checkout/status/:orderId
 * Verifica status do pedido e pagamento
 */
router.get('/status/:orderId', checkoutController.getCheckoutStatus);

module.exports = router;
