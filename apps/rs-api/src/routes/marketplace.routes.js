/**
 * MARKETPLACE ROUTES - RS Shopping
 * Rotas para e-commerce e afiliação
 */

const express = require('express');
const router = express.Router();
const { supabaseAuth, isOwnerOrAdmin } = require('../middlewares/supabaseAuth');
const marketplaceController = require('../controllers/marketplace.controller');

// ================================================
// PRODUTOS
// ================================================

router.get('/products', marketplaceController.listProducts);
router.get('/products/:id', marketplaceController.getProduct);
router.post('/products', supabaseAuth, marketplaceController.createProduct);
router.put('/products/:id', supabaseAuth, marketplaceController.updateProduct);
router.delete('/products/:id', supabaseAuth, marketplaceController.deleteProduct);

// ================================================
// CATEGORIAS
// ================================================

router.get('/categories', marketplaceController.listCategories);
router.post('/categories', supabaseAuth, marketplaceController.createCategory);

// ================================================
// PEDIDOS
// ================================================

router.post('/orders', supabaseAuth, marketplaceController.createOrder);
router.get('/orders/:userId', supabaseAuth, isOwnerOrAdmin(), marketplaceController.getUserOrders);
router.get('/orders/detail/:id', supabaseAuth, marketplaceController.getOrderDetail);
router.put('/orders/:id/status', supabaseAuth, marketplaceController.updateOrderStatus);

// ================================================
// CARRINHO
// ================================================

router.post('/cart/add', supabaseAuth, marketplaceController.addToCart);
router.get('/cart/:userId', supabaseAuth, isOwnerOrAdmin(), marketplaceController.getCart);
router.delete('/cart/:id', supabaseAuth, marketplaceController.removeFromCart);

// ================================================
// AFILIAÇÃO
// ================================================

router.post('/affiliate/link', supabaseAuth, marketplaceController.generateAffiliateLink);
router.get('/commission/:userId', supabaseAuth, isOwnerOrAdmin(), marketplaceController.getCommissions);
router.get('/sales/:userId', supabaseAuth, isOwnerOrAdmin(), marketplaceController.getSales);

// ================================================
// DROPSHIPPING
// ================================================

router.post('/dropship/order', supabaseAuth, marketplaceController.createDropshipOrder);
router.get('/dropship/suppliers', supabaseAuth, marketplaceController.listSuppliers);

// ================================================
// PIXELS E TRACKING
// ================================================

router.get('/pixels/:storeId', marketplaceController.getPixels);
router.post('/track/event', marketplaceController.trackEvent);

// ================================================
// AVALIAÇÕES
// ================================================

router.post('/review', supabaseAuth, marketplaceController.createReview);
router.get('/reviews/:productId', marketplaceController.getProductReviews);

module.exports = router;
