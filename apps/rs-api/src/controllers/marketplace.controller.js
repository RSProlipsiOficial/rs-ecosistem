/**
 * MARKETPLACE CONTROLLER
 * Lógica de negócio para RS Shopping
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ================================================
// PRODUTOS
// ================================================

exports.listProducts = async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
    
    if (category) query = query.eq('category_id', category);
    if (search) query = query.ilike('title', `%${search}%`);
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, products: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, product: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, product: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, product: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Produto removido' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// CATEGORIAS
// ================================================

exports.listCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json({ success: true, categories: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, parent_id })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, category: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// PEDIDOS
// ================================================

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Usar o salesService integrado com matriz
    const { createOrder } = require('../services/salesService');
    
    const order = await createOrder({
      buyerId: orderData.buyer_id || orderData.user_id,
      buyerEmail: orderData.buyer_email || orderData.email,
      buyerName: orderData.buyer_name || orderData.name,
      buyerPhone: orderData.buyer_phone || orderData.phone,
      buyerType: orderData.buyer_type || 'cliente',
      referredBy: orderData.referred_by || orderData.patrocinador_id,
      items: orderData.items,
      shippingAddress: orderData.shipping_address || orderData.endereco,
      shippingMethod: orderData.shipping_method,
      shippingCost: orderData.shipping_cost || 0,
      customerNotes: orderData.notes
    });
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, orders: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, order: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, order: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// CARRINHO
// ================================================

exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id, product_id, quantity })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, item: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({ success: true, cart: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Item removido' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// AFILIAÇÃO
// ================================================

exports.generateAffiliateLink = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    
    const link = `https://marketplace.rsprolipsi.com.br/p/${product_id}?ref=${user_id}`;
    
    res.json({ success: true, link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCommissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('affiliate_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, commissions: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('affiliate_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, sales: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// DROPSHIPPING
// ================================================

exports.createDropshipOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    const { data, error } = await supabase
      .from('dropship_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, order: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listSuppliers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    
    res.json({ success: true, suppliers: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// PIXELS E TRACKING
// ================================================

exports.getPixels = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const { data, error } = await supabase
      .from('store_pixels')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true);
    
    if (error) throw error;
    
    res.json({ success: true, pixels: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.trackEvent = async (req, res) => {
  try {
    const { event_type, user_id, product_id, metadata } = req.body;
    
    const { data, error } = await supabase
      .from('tracking_events')
      .insert({ event_type, user_id, product_id, metadata })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, event: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// AVALIAÇÕES
// ================================================

exports.createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;
    
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({ user_id, product_id, rating, comment })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, review: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, user:users(nome)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, reviews: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
