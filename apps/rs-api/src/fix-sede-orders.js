/**
 * RS PRÓLIPSI - FIX SEDE ORDERS & CUSTOMER NAMES
 * Corrige pedidos da Sede que não foram sincronizados e preenche nomes de clientes.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrders() {
  console.log('🚀 Iniciando correção de pedidos e nomes...');

  // 1. Resolver ID da Sede (rsprolipsi)
  let { data: sedeMs } = await supabase
    .from('minisite_profiles')
    .select('id, name')
    .or('consultant_id.eq.rsprolipsi,slug.eq.rsprolipsi')
    .maybeSingle();

  if (!sedeMs) {
    console.log('⚠️  Busca por consultant_id/slug falhou, tentando por nome...');
    const { data: sedeByName } = await supabase
      .from('minisite_profiles')
      .select('id, name')
      .ilike('name', '%SEDE RS%')
      .maybeSingle();
    sedeMs = sedeByName;
  }

  if (!sedeMs) {
    console.error('❌ Sede (rsprolipsi) não encontrada em minisite_profiles!');
    return;
  }
  const sedeId = sedeMs.id;
  console.log(`📍 ID da Sede detectado: ${sedeId} (${sedeMs.name})`);

  // 2. Corrigir nomes de clientes em cd_orders existentes que vieram do marketplace
  console.log('📝 Corrigindo nomes de clientes em cd_orders vindos do Marketplace...');
  const { data: cdOrdersToFix, error: fetchErr } = await supabase
    .from('cd_orders')
    .select('id, marketplace_order_id, consultant_name')
    .not('marketplace_order_id', 'is', null);

  if (fetchErr) {
    console.error('❌ Erro ao buscar cd_orders:', fetchErr);
  } else if (cdOrdersToFix && cdOrdersToFix.length > 0) {
    console.log(`🔍 Analisando ${cdOrdersToFix.length} pedidos em cd_orders...`);
    for (const cdOrder of cdOrdersToFix) {
      // Buscar o pedido original no marketplace para pegar o buyer_name real
      const { data: mkOrder } = await supabase
        .from('orders')
        .select('buyer_name')
        .eq('id', cdOrder.marketplace_order_id)
        .maybeSingle();

      if (mkOrder && mkOrder.buyer_name && mkOrder.buyer_name !== cdOrder.consultant_name) {
        console.log(`   🔸 Atualizando nome: ${cdOrder.consultant_name} -> ${mkOrder.buyer_name}`);
        const { error: upErr } = await supabase
          .from('cd_orders')
          .update({ consultant_name: mkOrder.buyer_name })
          .eq('id', cdOrder.id);
        
        if (upErr) console.error(`      ❌ Erro:`, upErr.message);
      }
    }
  }

  // 3. Sincronizar pedidos órfãos da Sede
  console.log('🔄 Sincronizando pedidos órfãos da Sede...');
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .in('status', ['paid', 'pago', 'approved', 'completed'])
    .order('created_at', { ascending: false });

  if (ordersErr) {
    console.error('❌ Erro ao buscar pedidos:', ordersErr);
    return;
  }

  console.log(`📊 Analisando ${orders.length} pedidos pagos no Marketplace...`);

  for (const order of orders) {
    // Verificar se já existe em cd_orders
    const { data: exists } = await supabase
      .from('cd_orders')
      .select('id')
      .eq('marketplace_order_id', order.id)
      .maybeSingle();

    if (exists) continue;

    // Se não existe, vamos sincronizar para a Sede
    console.log(`🆕 Sincronizando pedido #${order.id.slice(0,8)} para a Sede...`);
    
    const isPickupOrder = /retirad|pickup/i.test(order.shipping_method || '');
    const createdAt = order.created_at ? new Date(order.created_at) : new Date();

    const cdOrderData = {
      cd_id: sedeId,
      consultant_name: order.buyer_name || 'Cliente Direto',
      consultant_pin: order.referred_by && order.referred_by.length < 20 ? order.referred_by : null,
      buyer_cpf: order.buyer_cpf || null,
      buyer_email: order.buyer_email || null,
      buyer_phone: order.buyer_phone || null,
      shipping_address: typeof order.shipping_address === 'string' ? order.shipping_address : null,
      order_date: createdAt.toISOString().split('T')[0],
      order_time: createdAt.toTimeString().split(' ')[0],
      total: order.total || 0,
      status: 'SEPARACAO', // Pedidos pagos no marketplace já entram em SEPARACAO
      payment_method: order.payment_method || null,
      type: isPickupOrder ? 'RETIRADA' : 'ENTREGA',
      items_count: order.items?.length || 0,
      marketplace_order_id: order.id,
    };

    const { data: newCdOrder, error: insErr } = await supabase
      .from('cd_orders')
      .insert([cdOrderData])
      .select('id')
      .single();

    if (insErr) {
      console.error(`   ❌ Falha ao inserir: ${insErr.message}`);
      continue;
    }

    console.log(`   ✅ Sincronizado: cd_order_id=${newCdOrder.id}`);

    // Sincronizar itens
    if (order.items && order.items.length > 0) {
      const cdItems = order.items.map(item => ({
        cd_order_id: newCdOrder.id,
        product_id: item.product_id || 'unknown',
        product_name: item.product_name || 'Produto',
        quantity: item.quantity || 1,
        unit_price: item.price_final || 0,
        points: 0
      }));

      await supabase.from('cd_order_items').insert(cdItems);
    }

    // Atualizar distributor_id no orders
    await supabase.from('orders').update({ distributor_id: sedeId }).eq('id', order.id);
  }

  console.log('🏁 Processo finalizado!');
}

fixOrders();
