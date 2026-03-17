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
const translateStatus = (status) => {
  const map = {
    'delivered': 'Entregue',
    'pending': 'Pendente',
    'Pago': 'Pago',
    'created': 'Criado',
    'expired': 'Expirado',
    'canceled': 'Cancelado',
    'processing': 'Processando',
    'shipped': 'Enviado'
  };
  return map[status] || status;
};

const translatePaymentMethod = (method) => {
  const map = {
    'store': 'Carteira/Saldo',
    'pix': 'PIX',
    'credit_card': 'Cartão de Crédito',
    'balance': 'Saldo RS'
  };
  return map[method] || method;
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[MARKETPLACE] Buscando compras unificadas e auditadas para: ${userId}`);
    
    // 1. Buscar Dados do Consultor
    const { data: consultant } = await supabase
      .from('consultores')
      .select('id, mmn_id, email, cpf, nome')
      .eq('id', userId)
      .single();

    if (!consultant) {
      return res.status(404).json({ success: false, error: 'Consultor não encontrado' });
    }

    const mmnId = consultant.mmn_id || userId.slice(0, 8).toUpperCase();
    const email = consultant.email;
    const cpf = consultant.cpf;

    // Segurança: Se e-mail e CPF forem nulos/vazios, não buscar em cd_orders para evitar leakage
    const hasValidFilters = (email && email.trim() !== '') || (cpf && cpf.trim() !== '');

    // 2. Buscar Pedidos da Sede (orders)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // 3. Buscar Pedidos de CDs (cd_orders)
    let cdOrders = [];
    if (hasValidFilters) {
      const { data, error } = await supabase
        .from('cd_orders')
        .select('*')
        .or(`buyer_email.eq.${email},buyer_cpf.eq.${cpf}`)
        .is('marketplace_order_id', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      cdOrders = data || [];
    }

    // 4. Buscar Mapas Auxiliares (CDs e Produtos)
    const [{ data: cds }, { data: allProducts }] = await Promise.all([
      supabase.from('distribution_centers').select('id, name'),
      supabase.from('products').select('id, name, sku')
    ]);

    const cdMap = (cds || []).reduce((acc, cd) => {
      acc[cd.id] = cd.name;
      return acc;
    }, { 'd107da4e-e266-41b0-947a-0c66b2f2b9ef': 'Sede RS (Matriz)' });

    const productMap = (allProducts || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    // 5. Buscar Itens de Pedidos
    const allOrders = [...(orders || [])];
    const orderIds = allOrders.map(o => o.id);
    const cdOrderIds = cdOrders.map(o => o.id);
    
    let itemsFromOrders = [];
    if (orderIds.length > 0) {
      const { data } = await supabase.from('order_items').select('*').in('order_id', orderIds);
      itemsFromOrders = data || [];
    }

    let itemsFromCdOrders = [];
    if (cdOrderIds.length > 0) {
      const { data } = await supabase.from('cd_order_items').select('*').in('cd_order_id', cdOrderIds);
      itemsFromCdOrders = (data || []).map(item => ({
        ...item,
        order_id: item.cd_order_id,
        price_final: Number(item.unit_price || 0)
      }));
    }

    // 6. Unificar e Normalizar
    const unifiedOrders = [
      ...allOrders.map(o => ({ ...o, _source: 'hq' })),
      ...cdOrders.map(o => ({ 
        ...o, 
        _source: 'cd',
        total: Number(o.total || o.matrix_accumulated || 0),
        status: o.status || 'paid'
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const normalizedOrders = unifiedOrders
      .map((order) => {
        let rawItems = order._source === 'hq' 
          ? itemsFromOrders.filter(i => i.order_id === order.id)
          : itemsFromCdOrders.filter(i => i.order_id === order.id);

        // Fallback para internal_notes (HQ)
        if (order._source === 'hq' && rawItems.length === 0 && order.internal_notes) {
          try {
            const marker = '__order_items__:';
            const line = order.internal_notes.split('\n').find(l => l.includes(marker));
            if (line) {
              const decoded = JSON.parse(decodeURIComponent(line.split(marker)[1]?.trim()));
              if (Array.isArray(decoded)) {
                rawItems = decoded.map(item => ({
                  product_id: item.productId || item.id,
                  product_name: item.productName || item.name || 'Produto',
                  quantity: item.quantity || 1,
                  price_final: Number(item.price || 0),
                  product_sku: item.sku || 'N/A'
                }));
              }
            }
          } catch (e) {}
        }

        if (rawItems.length === 0) return null;

        const mappedItems = rawItems.map(item => {
          const mainProd = productMap[item.product_id] || {};
          return {
            ...item,
            product_name: mainProd.name || item.product_name || 'Produto', // PRIORIDADE PRODUTO MESTRE
            product_sku: mainProd.sku || item.product_sku || 'N/A',
            price_final: Number(item.price_final || (item.total / item.quantity) || 0)
          };
        });

        // Identificação do CD de Origem
        const cdId = order.cd_id || (order._source === 'hq' ? 'd107da4e-e266-41b0-947a-0c66b2f2b9ef' : null);
        const cdName = cdMap[cdId] || (order.distribution_center?.name) || 'Outras Sedes';

        return {
          ...order,
          short_id: order.id.slice(0, 8).toUpperCase(),
          buyer_short_id: mmnId,
          total_amount: Number(order.total ?? 0),
          status_display: translateStatus(order.status || order.payment_status || 'pending'),
          payment_method_display: order._source === 'cd' ? `Venda Direta (${cdName})` : translatePaymentMethod(order.payment_method),
          buyer_name: order.buyer_name || consultant.nome || 'Consultor RS',
          origin_cd_name: cdName,
          items: mappedItems.map(item => ({
            ...item,
            product: { 
              name: item.product_name, 
              sku: item.product_sku
            }
          }))
        };
      })
      .filter(o => o !== null);

    res.json({ success: true, orders: normalizedOrders });
  } catch (error) {
    console.error('❌ Erro em getUserOrders:', error.message);
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
