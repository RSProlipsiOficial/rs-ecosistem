/**
 * RS PRÓLIPSI - SALES SERVICE
 * Processa vendas e integra com matriz SIGMA
 */

const { createClient } = require('@supabase/supabase-js');
const { processarCompra } = require('./matrixService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Busca pedido por ID
 */
async function getOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      buyer:buyer_id(*)
    `)
    .eq('id', orderId)
    .single();
  
  if (error) throw new Error(`Pedido não encontrado: ${error.message}`);
  return data;
}

/**
 * Registra venda quando pagamento é aprovado
 * Processa acumulador de R$ 60 para matriz
 */
async function registerSale(paymentData) {
  const { orderId, mpPaymentId, amount, method, receivedAt } = paymentData;
  
  console.log('📝 Registrando venda:', { orderId, mpPaymentId, amount });
  
  // 1. Buscar pedido completo
  const order = await getOrder(orderId);
  console.log('📦 Pedido encontrado:', {
    id: order.id,
    buyer: order.buyer_email,
    total: order.total,
    items: order.items?.length
  });
  
  // 2. Processar cada item do pedido
  const sales = [];
  let totalMatrixValue = 0;
  
  for (const item of order.items) {
    // Buscar produto
    const { data: product } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('id', item.product_id)
      .single();
    
    if (!product) {
      console.warn(`⚠️  Produto ${item.product_id} não encontrado, pulando...`);
      continue;
    }
    
    // Inserir venda individual
    const { data: sale, error } = await supabase
      .from('sales')
      .insert({
        buyer_id: order.buyer_id,
        buyer_type: order.buyer_type || 'cliente',
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        price_original: product.price_base,
        price_final: item.price_final,
        quantity: item.quantity,
        total_amount: item.total,
        contributes_to_matrix: product.contributes_to_matrix,
        payment_method: method,
        payment_status: 'completed',
        payment_id: mpPaymentId,
        paid_at: receivedAt,
        shipping_address: order.shipping_address,
        seller_id: order.referred_by // Quem indicou é o vendedor
      })
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Erro ao registrar venda do item ${item.id}:`, error.message);
      continue;
    }
    
    console.log(`✅ Venda registrada: ${sale.id} - ${sale.product_name}`);
    sales.push(sale);
    
    // Acumular valor para matriz
    if (product.contributes_to_matrix) {
      totalMatrixValue += parseFloat(item.total);
    }
  }
  
  // 3. Processar acumulador de matriz (R$ 60)
  if (totalMatrixValue > 0 && order.buyer_id) {
    console.log(`💎 Processando matriz: R$ ${totalMatrixValue.toFixed(2)}`);
    
    try {
      const matrixResult = await processarCompra(order.buyer_id, totalMatrixValue);
      
      console.log(`✅ Matriz processada:`, matrixResult);
      
      // Atualizar pedido com informação da matriz
      await supabase
        .from('orders')
        .update({
          matrix_accumulated: totalMatrixValue
        })
        .eq('id', order.id);
      
    } catch (matrixError) {
      console.error(`❌ Erro ao processar matriz:`, matrixError);
      // Não falha a venda, apenas registra o erro
    }
  }
  
  // 4. Atualizar status do pedido
  await supabase
    .from('orders')
    .update({
      payment_status: 'approved',
      payment_id: mpPaymentId,
      payment_date: receivedAt,
      status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
  
  console.log('✅ Pedido atualizado para: paid');
  
  return {
    sales,
    totalMatrixValue,
    order
  };
}

/**
 * Cria pedido no marketplace
 * Usado pelo checkout do marketplace
 */
async function createOrder(orderData) {
  console.log('📝 Criando pedido:', orderData);
  
  const {
    buyerId,
    buyerEmail,
    buyerName,
    buyerPhone,
    buyerType = 'cliente',
    referredBy, // ID do consultor que indicou
    items, // Array de { product_id, quantity }
    shippingAddress,
    shippingMethod,
    shippingCost = 0,
    customerNotes
  } = orderData;
  
  // 1. Calcular totais
  let subtotal = 0;
  let discount = 0;
  const itemsProcessed = [];
  
  for (const item of items) {
    const { data: product } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('id', item.product_id)
      .single();
    
    if (!product) {
      throw new Error(`Produto ${item.product_id} não encontrado`);
    }
    
    // Determinar preço baseado no tipo de comprador
    let priceToUse = product.price_base;
    let discountPercent = 0;
    
    if (buyerType === 'consultor') {
      priceToUse = product.price_consultor || product.price_base * 0.5;
      discountPercent = product.discount_consultor || 50;
    } else if (buyerType === 'cd') {
      priceToUse = product.price_cd || product.price_base * 0.424; // 50% + 15.2%
      discountPercent = product.discount_cd || 57.6;
    }
    
    const quantity = item.quantity || 1;
    const total = priceToUse * quantity;
    const itemDiscount = (product.price_base - priceToUse) * quantity;
    
    subtotal += product.price_base * quantity;
    discount += itemDiscount;
    
    itemsProcessed.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_image: product.image_url,
      price_original: product.price_base,
      price_discount: itemDiscount,
      price_final: priceToUse,
      quantity,
      total,
      contributes_to_matrix: product.contributes_to_matrix,
      matrix_value: product.contributes_to_matrix ? total : 0
    });
  }
  
  const total = subtotal - discount + parseFloat(shippingCost);
  
  // 2. Criar pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: buyerId,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_type: buyerType,
      referred_by: referredBy,
      subtotal,
      discount,
      shipping_cost: shippingCost,
      total,
      shipping_address: shippingAddress,
      shipping_method: shippingMethod,
      customer_notes: customerNotes,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single();
  
  if (orderError) throw new Error(`Erro ao criar pedido: ${orderError.message}`);
  
  console.log(`✅ Pedido criado: ${order.id}`);
  
  // 3. Criar itens do pedido
  for (const item of itemsProcessed) {
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        ...item
      });
  }
  
  console.log(`✅ ${itemsProcessed.length} itens adicionados ao pedido`);
  
  return order;
}

/**
 * Credita wallet do consultor
 */
async function creditWallet(consultorId, amount, type = 'sale', description = 'Venda de produto') {
  console.log(`💰 Creditando wallet: ${consultorId} + R$ ${amount}`);
  
  // 1. Buscar wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('consultor_id', consultorId)
    .single();
  
  if (!wallet) {
    throw new Error(`Carteira não encontrada para consultor ${consultorId}`);
  }
  
  // 2. Atualizar saldo (TRIGGER registra transação automaticamente!)
  const { data, error } = await supabase
    .from('wallets')
    .update({
      balance: parseFloat(wallet.balance) + parseFloat(amount),
      total_received: parseFloat(wallet.total_received) + parseFloat(amount),
      updated_at: new Date().toISOString()
    })
    .eq('id', wallet.id)
    .select()
    .single();
  
  if (error) throw new Error(`Erro ao creditar wallet: ${error.message}`);
  
  console.log(`✅ Wallet creditada: R$ ${amount.toFixed(2)}`);
  return data;
}

module.exports = {
  getOrder,
  registerSale,
  createOrder,
  creditWallet
};
