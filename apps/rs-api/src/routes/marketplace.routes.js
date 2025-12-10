/**
 * MARKETPLACE ROUTES - RS Shopping
 * Rotas para e-commerce e afiliação
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const marketplaceController = require('../controllers/marketplace.controller');

// ================================================
// PRODUTOS
// ================================================

router.get('/products', marketplaceController.listProducts);
router.get('/products/:id', marketplaceController.getProduct);
router.post('/products', authenticateToken, marketplaceController.createProduct);
router.put('/products/:id', authenticateToken, marketplaceController.updateProduct);
router.delete('/products/:id', authenticateToken, marketplaceController.deleteProduct);

// ================================================
// CATEGORIAS
// ================================================

router.get('/categories', marketplaceController.listCategories);
router.post('/categories', authenticateToken, marketplaceController.createCategory);

// ================================================
// PEDIDOS
// ================================================

router.post('/orders', authenticateToken, marketplaceController.createOrder);
router.get('/orders/:userId', authenticateToken, marketplaceController.getUserOrders);
router.get('/orders/detail/:id', authenticateToken, marketplaceController.getOrderDetail);
router.put('/orders/:id/status', authenticateToken, marketplaceController.updateOrderStatus);

// ================================================
// CARRINHO
// ================================================

router.post('/cart/add', authenticateToken, marketplaceController.addToCart);
router.get('/cart/:userId', authenticateToken, marketplaceController.getCart);
router.delete('/cart/:id', authenticateToken, marketplaceController.removeFromCart);

// ================================================
// AFILIAÇÃO
// ================================================

router.post('/affiliate/link', authenticateToken, marketplaceController.generateAffiliateLink);
router.get('/commission/:userId', authenticateToken, marketplaceController.getCommissions);
router.get('/sales/:userId', authenticateToken, marketplaceController.getSales);

// ================================================
// DROPSHIPPING
// ================================================

router.post('/dropship/order', authenticateToken, marketplaceController.createDropshipOrder);
router.get('/dropship/suppliers', authenticateToken, marketplaceController.listSuppliers);

// ================================================
// PIXELS E TRACKING
// ================================================

router.get('/pixels/:storeId', marketplaceController.getPixels);
router.post('/track/event', marketplaceController.trackEvent);

// ================================================
// AVALIAÇÕES
// ================================================

router.post('/review', authenticateToken, marketplaceController.createReview);
router.get('/reviews/:productId', marketplaceController.getProductReviews);

module.exports = router;
