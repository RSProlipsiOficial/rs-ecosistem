/**
 * RS PRÓLIPSI - SALES SERVICE
 * Processa vendas e integra com matriz SIGMA
 */

const { createClient } = require('@supabase/supabase-js');
const { processarCompra } = require('./matrixService');
const { calculateCommission } = require('./productService'); // Import logic

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
 * Processa acumulador de R$ 60 para matriz e comissões
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

  // 1b. Buscar Nível do Consultor (Vendedor)
  let sellerLevel = 'RS One Star'; // Default
  if (order.referred_by) {
    const { data: perf } = await supabase
      .from('consultant_performance')
      .select('current_rank')
      .eq('consultant_id', order.referred_by)
      .single();
    if (perf && perf.current_rank) sellerLevel = perf.current_rank;
  }

  // 2. Processar cada item do pedido
  const sales = [];
  let totalMatrixValue = 0;

  for (const item of order.items) {
    // Buscar produto
    const { data: product } = await supabase
      .from('products')
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

    // --- CÁLCULO DE COMISSÃO (STAR SYSTEM) ---
    if (order.referred_by) {
      try {
        const commission = await calculateCommission(product, sellerLevel);

        if (commission.value > 0) {
          const totalCommission = commission.value * item.quantity;

          // Registrar Bônus
          await supabase.from('bonuses').insert({
            consultor_id: order.referred_by,
            bonus_type: 'direct_sale', // Venda Direta
            amount: totalCommission,
            description: `Comissão ${commission.type} - ${product.name} (x${item.quantity})`,
            status: 'available', // Disponível imediatamente (ou 'pending' se preferir)
            processed_at: new Date().toISOString()
          });

          // Creditar Carteira
          await creditWallet(order.referred_by, totalCommission, 'sale', `Comissão Venda #${order.id}`);
          console.log(`💰 Comissão Creditada: R$ ${totalCommission} para ${order.referred_by}`);
        }
      } catch (commError) {
        console.error('❌ Erro ao calcular comissão:', commError);
      }
    }
  }

  // --- BÔNUS DE PROFUNDIDADE (DEPTH BONUSES) PARA UPLINES DA REDE ---
  // Distribui 6.81% do valor da venda para até 6 níveis da rede acima do comprador
  if (order.buyer_id && totalMatrixValue > 0) {
    try {
      console.log('🌐 Distribuindo bônus de profundidade na rede...');

      // Regras de profundidade
      const DEPTH_TOTAL_PCT = 6.81;
      const DEPTH_WEIGHTS = [7, 8, 10, 15, 25, 35];
      const weightSum = DEPTH_WEIGHTS.reduce((a, b) => a + b, 0);
      const depthBase = totalMatrixValue * (DEPTH_TOTAL_PCT / 100);

      // Buscar uplines ativos (com compressão dinâmica)
      const uplines = [];
      let currentId = order.buyer_id;
      let nivel = 0;

      while (nivel < 6) {
        const { data: consultor } = await supabase
          .from('consultores')
          .select('id, patrocinador_id, status, user_id')
          .eq('id', currentId)
          .single();

        if (!consultor || !consultor.patrocinador_id) break;

        // Buscar o patrocinador
        const { data: patrocinador } = await supabase
          .from('consultores')
          .select('id, nome, status, user_id')
          .eq('id', consultor.patrocinador_id)
          .single();

        if (!patrocinador) break;

        currentId = patrocinador.id;

        // Compressão dinâmica: pula inativos mas sobe sem contar nível
        if (patrocinador.status === 'ativo') {
          uplines.push({
            consultor_id: patrocinador.id,
            user_id: patrocinador.user_id,
            nome: patrocinador.nome,
            nivel: nivel + 1
          });
          nivel++;
        } else {
          console.log(`  ⏭️  Upline ${patrocinador.id} inativo, compressão aplicada`);
        }
      }

      console.log(`  📊 ${uplines.length} uplines ativos encontrados`);

      // Distribuir bônus para cada nível
      for (let i = 0; i < uplines.length; i++) {
        const upline = uplines[i];
        const weight = DEPTH_WEIGHTS[i];
        const bonusAmount = +((depthBase * weight) / weightSum).toFixed(2);

        if (bonusAmount <= 0) continue;

        console.log(`  💰 L${upline.nivel}: ${upline.nome || upline.consultor_id} → R$ ${bonusAmount}`);

        // Registrar bônus na tabela bonuses
        await supabase.from('bonuses').insert({
          consultor_id: upline.consultor_id,
          bonus_type: 'depth_bonus',
          amount: bonusAmount,
          description: `Bônus Profundidade L${upline.nivel} - Venda #${orderId} (R$ ${totalMatrixValue.toFixed(2)})`,
          status: 'available',
          processed_at: new Date().toISOString()
        });

        // Creditar na wallet
        await creditWallet(
          upline.consultor_id,
          bonusAmount,
          'depth_bonus',
          `Bônus Profundidade L${upline.nivel} - Venda #${orderId}`
        );
      }

      const totalDepthPaid = uplines.reduce((sum, u, i) => {
        const w = DEPTH_WEIGHTS[i];
        return sum + +((depthBase * w) / weightSum).toFixed(2);
      }, 0);
      console.log(`  ✅ Total depth bonuses pagos: R$ ${totalDepthPaid.toFixed(2)} para ${uplines.length} uplines`);

    } catch (depthError) {
      console.error('❌ Erro ao distribuir bônus de profundidade:', depthError);
      // Não falha a venda, apenas registra
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
      .from('products')
      .select('*')
      .eq('id', item.product_id)
      .single();

    if (!product) {
      throw new Error(`Produto ${item.product_id} não encontrado`);
    }

    // Determinar preço baseado no tipo de comprador
    // Fallback: price_base vira price. price_consultor e price_cd podem não existir.
    const basePrice = product.price_base || product.price || 0;
    let priceToUse = basePrice;
    let discountPercent = 0;

    if (buyerType === 'consultor') {
      priceToUse = product.price_consultor || basePrice * 0.5;
      discountPercent = product.discount_consultor || 50;
    } else if (buyerType === 'cd') {
      priceToUse = product.price_cd || basePrice * 0.424; // 50% + 15.2%
      discountPercent = product.discount_cd || 57.6;
    }

    const quantity = item.quantity || 1;
    const total = priceToUse * quantity;
    const itemDiscount = (basePrice - priceToUse) * quantity;

    subtotal += basePrice * quantity;
    discount += itemDiscount;

    itemsProcessed.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_image: product.image_url || product.featured_image,
      price_original: basePrice,
      price_discount: itemDiscount,
      price_final: priceToUse,
      quantity,
      total,
      contributes_to_matrix: product.contributes_to_matrix || false,
      matrix_value: (product.contributes_to_matrix || false) ? total : 0,
      tenant_id: product.tenant_id || '00000000-0000-0000-0000-000000000000'
    });
  }

  const total = subtotal - discount + parseFloat(shippingCost);

  // 2. Resolver buyer_id real (consultores.id) a partir do auth.users.id
  // A tabela orders tem FK buyer_id -> consultores.id, mas o frontend envia auth.users.id
  let resolvedBuyerId = buyerId;

  if (buyerId) {
    // Primeiro tenta achar diretamente em consultores.id
    const { data: directMatch } = await supabase
      .from('consultores')
      .select('id')
      .eq('id', buyerId)
      .single();

    if (!directMatch) {
      // Se não achou, busca por consultores.user_id (auth.users.id)
      const { data: consultorByUser } = await supabase
        .from('consultores')
        .select('id')
        .eq('user_id', buyerId)
        .single();

      if (consultorByUser) {
        resolvedBuyerId = consultorByUser.id;
        console.log(`🔄 buyer_id resolvido: auth(${buyerId}) → consultor(${resolvedBuyerId})`);
      } else {
        // Se não achou por user_id, tenta por email
        if (buyerEmail) {
          const { data: consultorByEmail } = await supabase
            .from('consultores')
            .select('id')
            .eq('email', buyerEmail)
            .single();

          if (consultorByEmail) {
            resolvedBuyerId = consultorByEmail.id;
            console.log(`🔄 buyer_id resolvido por email: ${buyerEmail} → consultor(${resolvedBuyerId})`);
          } else {
            console.warn(`⚠️ Consultor não encontrado para buyerId=${buyerId} / email=${buyerEmail}. Usando ID original.`);
          }
        }
      }
    }
  }

  // 3. Criar pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: resolvedBuyerId,
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
      payment_status: 'pending',
      tenant_id: itemsProcessed.length > 0 ? itemsProcessed[0].tenant_id : '00000000-0000-0000-0000-000000000000'
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
