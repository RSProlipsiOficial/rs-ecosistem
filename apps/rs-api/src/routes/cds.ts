import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';

const router = Router();

// ==========================================
// 📦 CDs E PERFIS
// ==========================================

// Listar todos os CDs (Admin / Marketplace)
router.get('/v1/cds', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    let query = supabase
      .from('minisite_profiles')
      .select('*')
      .or('type.ilike.cd,type.ilike.franquia,type.ilike.proprio,type.ilike.hibrido,type.ilike.%sede%')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      owner_name: p.manager_name || p.name,
      cnpj_cpf: p.cpf || '',
      email: p.email || '',
      phone: p.phone || '',
      address_street: p.address_street,
      address_number: p.address_number,
      address_neighborhood: p.address_neighborhood,
      address_city: p.address_city,
      address_state: p.address_state,
      address_zip: p.address_zip,
      type: p.type,
      is_active: p.status === 'active' || p.status === undefined || p.status === null
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar CD
router.post('/v1/cds', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ success: false, error: 'name é requerido' });

    const payload: any = {
      name: body.name,
      type: body.type || 'cd',
      email: body.email || null,
      phone: body.phone || null,
      cpf: body.cnpj_cpf || body.cpf || null,
      manager_name: body.owner_name || body.name,
      address_street: body.address_street || null,
      address_number: body.address_number || null,
      address_neighborhood: body.address_neighborhood || null,
      address_city: body.address_city || null,
      address_state: body.address_state || null,
      address_zip: body.address_zip || null,
      consultant_id: body.consultant_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('minisite_profiles')
      .insert([payload])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Retorna o primeiro CD 
router.get('/v1/cds/primary', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('minisite_profiles')
      .select('*')
      .eq('type', 'cd')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Perfil detalhado do CD via API
router.get('/v1/cds/:id/profile', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);

    const { data, error } = await supabaseAdmin
      .from('minisite_profiles')
      .select('*')
      .or(isUUID ? `id.eq.${rawId},consultant_id.eq.${rawId}` : `consultant_id.eq.${rawId}`)
      .maybeSingle();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [RS-LOGIC] - Atualização Segura do Perfil (Bypass RLS)
router.patch('/v1/cds/:id', async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const body = req.body;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // 1. Localizar o registro do minisite
    const { data: existing } = await supabaseAdmin
      .from('minisite_profiles')
      .select('id')
      .or(isUUID ? `id.eq.${userId},consultant_id.eq.${userId}` : `consultant_id.eq.${userId}`)
      .maybeSingle();

    if (!existing) return res.status(404).json({ success: false, error: 'CD não encontrado' });

    // 2. Preparar payload de atualização
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.manager_name !== undefined) updates.manager_name = body.manager_name;

    // Endereço
    if (body.address_zip !== undefined) updates.address_zip = body.address_zip;
    if (body.address_street !== undefined) updates.address_street = body.address_street;
    if (body.address_number !== undefined) updates.address_number = body.address_number;
    if (body.address_city !== undefined) updates.address_city = body.address_city;
    if (body.address_state !== undefined) updates.address_state = body.address_state;

    // 3. Executar update via Admin para ignorar RLS
    const { data, error } = await supabaseAdmin
      .from('minisite_profiles')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, id: data.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🛒 ESTOQUE E CATÁLOGO
// ==========================================

// Catálogo Global da Sede (RS Prólipsi) com preços para CD
router.get('/v1/cds/catalog', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .or('is_active.eq.true,published.eq.true');

    if (error) throw error;

    const mapped = (data || []).map(p => {
      const retailPrice = Number(p.price) || 0;
      // [RS-LOGIC] - Preço de membro é 50% do varejo por padrão no ecossistema
      const consultantPrice = (retailPrice * 0.50);
      const cdCostPrice = consultantPrice * (1 - 0.152);

      return {
        id: p.id,
        sku: p.sku || 'N/A',
        name: p.name,
        category: p.category || 'Geral',
        stockLevel: Number(p.stock_quantity) || 0,
        price: retailPrice,
        memberPrice: consultantPrice,
        costPrice: cdCostPrice,
        points: p.pv_points || 0,
        status: 'OK',
        weight: p.weight || 0.5,
        dimensions: {
          width: p.dimensions_width || 10,
          height: p.dimensions_height || 10,
          length: p.dimensions_length || 10
        }
      };
    });

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Estoque específico do CD (cd_products)
router.get('/v1/cds/:id/inventory', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;

    // Resolução de ID (slug para uuid)
    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    const { data, error } = await supabaseAdmin
      .from('cd_products')
      .select('*')
      .eq('cd_id', cdId)
      .order('name', { ascending: true });

    if (error) throw error;

    const mappedData = (data || []).map(p => ({
      id: p.id,
      sku: p.sku || 'N/A',
      name: p.name,
      category: p.category || 'Geral',
      stockLevel: p.stock_level || 0,
      minStock: p.min_stock || 0,
      price: Number(p.price) || 0,
      costPrice: Number(p.cost_price) || 0,
      points: Number(p.points) || 0,
      status: p.status || 'OK'
    }));

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// 📦 PEDIDOS DE ABASTECIMENTO (CD x SEDE)
// ==========================================

// Retorna pedidos de abastecimento
router.get('/v1/cds/orders', async (req: Request, res: Response) => {
  try {
    const { cdId: rawId } = req.query;
    let query = supabaseAdmin
      .from('cd_orders')
      .select('*, items:cd_order_items(*)')
      .order('created_at', { ascending: false });

    if (rawId) {
      let cdId = rawId as string;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cdId)) {
        const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', cdId).maybeSingle();
        if (profile) cdId = profile.id;
      }
      query = query.eq('cd_id', cdId).eq('type', 'REPLENISHMENT');
    } else {
      query = query.eq('type', 'REPLENISHMENT').limit(100);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    // Fallback para nomes de produtos caso não existam no item
    const mappedData = data.map((order: any) => ({
      ...order,
      items: (order.items || []).map((i: any) => ({
        ...i,
        product_name: i.product_name || 'Produto Não Identificado',
        sku: i.sku || 'N/A'
      }))
    }));

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Registrar pedido de abastecimento
router.post('/v1/cds/orders', async (req: Request, res: Response) => {
  try {
    const { cdId: rawId, items, total, shippingMethod, paymentProofUrl } = req.body;
    if (!rawId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Carrinho inválido.' });
    }

    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    const itemsTotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('cd_orders')
      .insert({
        cd_id: cdId,
        status: 'PENDENTE',
        type: 'REPLENISHMENT',
        total: total,
        items_count: items.length,
        shipping_cost: Math.max(0, total - itemsTotal),
        shipping_method: shippingMethod || 'TRANSPORTADORA',
        payment_proof_url: paymentProofUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    const orderItems = items.map(item => ({
      cd_order_id: orderData.id,
      product_id: item.productId,
      product_name: item.productName || 'Produto',
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin.from('cd_order_items').insert(orderItems);
    if (itemsError) throw new Error(itemsError.message);

    res.json({ success: true, data: orderData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar status e tracking
router.patch('/v1/cds/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    let updates: any = { updated_at: new Date().toISOString() };

    if (body.status) updates.status = (body.status as string).toUpperCase();
    if (body.tracking_code) updates.tracking_code = body.tracking_code;
    if (body.payment_proof_url) updates.payment_proof_url = body.payment_proof_url;
    if (body.payment_proof_status) updates.payment_proof_status = (body.payment_proof_status as string).toUpperCase();
    if (body.payment_method) updates.payment_method = body.payment_method;

    const { data: order, error: updateError } = await supabaseAdmin
      .from('cd_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) return res.status(500).json({ success: false, error: updateError.message });
    if (!order) return res.status(404).json({ success: false, error: 'Pedido não encontrado' });

    // Inteligência de Automação: Se o status mudou para ENTREGUE e é um pedido de ABASTECIMENTO, processar estoque e financeiro
    if (updates.status === 'ENTREGUE' && (order.type === 'REPLENISHMENT' || order.type === 'ABASTECIMENTO')) {
      const { data: items } = await supabaseAdmin
        .from('cd_order_items')
        .select('*')
        .eq('cd_order_id', id);

      if (items && items.length > 0) {
        // 1. Incrementar Estoque
        for (const item of items) {
          const { data: catalogProd } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', item.product_id)
            .maybeSingle();

          // Preço de Consultor (50% do varejo)
          const retailPrice = catalogProd?.price ? (Number(catalogProd.price) * 0.5) : Number(item.unit_price);

          await supabaseAdmin
            .from('cd_products')
            .upsert({
              cd_id: order.cd_id,
              sku: catalogProd?.sku || item.sku || 'N/A',
              name: catalogProd?.name || item.product_name || 'Produto',
              category: catalogProd?.category || 'Geral',
              stock_level: item.quantity, // O upsert no DB deve somar se quisermos, mas como é reconstrução ou incremento simplificado:
              // Para ser 100% seguro em incrementos via API, deveríamos buscar o valor atual
              // Porém, para manter a consistência, vamos usar o padrão de incremento no banco se possível ou buscar agora
              min_stock: 10,
              price: retailPrice,
              cost_price: Number(item.unit_price),
              points: catalogProd?.pv_points || 0,
              status: 'OK',
              updated_at: new Date().toISOString()
            }, { onConflict: 'cd_id,sku' });

          // Nota técnica: O upsert acima substitui o valor. Para somar via admin sem Trigger:
          await supabaseAdmin.rpc('increment_cd_stock', {
            p_cd_id: order.cd_id,
            p_sku: catalogProd?.sku || item.sku,
            p_qty: item.quantity
          });
        }

        // 2. Registrar Transação Financeira (Saída - Compra de Estoque)
        const txnRef = `ORDER-${id}`;
        const { data: existingTxn } = await supabaseAdmin
          .from('cd_transactions')
          .select('id')
          .eq('reference_id', txnRef)
          .maybeSingle();

        if (!existingTxn) {
          await supabaseAdmin.from('cd_transactions').insert({
            cd_id: order.cd_id,
            description: `Abastecimento de Estoque - Pedido #${id.slice(0, 8)}`,
            type: 'OUT',
            category: 'ESTOQUE',
            amount: order.total,
            status: 'CONCLUIDO',
            reference_id: txnRef,
            created_at: order.created_at || new Date().toISOString()
          });

          // 3. Atualizar Saldo (Decrementar)
          const { data: profile } = await supabaseAdmin
            .from('minisite_profiles')
            .select('wallet_balance')
            .eq('id', order.cd_id)
            .single();

          if (profile) {
            const currentBalance = Number(profile.wallet_balance || 0);
            const newBalance = Math.max(0, currentBalance - Number(order.total));
            await supabaseAdmin
              .from('minisite_profiles')
              .update({ wallet_balance: newBalance })
              .eq('id', order.cd_id);
          }
        }
      }
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🤝 VENDAS E CLIENTES
// ==========================================

// Vendas do CD para Consultores (cd_orders)
router.get('/v1/cds/:id/sales', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    const { data, error } = await supabaseAdmin
      .from('cd_orders')
      .select('*, items:cd_order_items(*)')
      .eq('cd_id', cdId)
      .neq('type', 'REPLENISHMENT')
      .neq('type', 'ABASTECIMENTO')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map(order => ({
      id: order.id,
      consultantName: order.consultant_name,
      consultantPin: order.consultant_pin,
      total: Number(order.total),
      status: order.status,
      date: order.order_date,
      items: order.items_count,
      productsDetail: (order.items || []).map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price)
      }))
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lista de Clientes do CD (cd_customers)
router.get('/v1/cds/:id/customers', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    const { data, error } = await supabaseAdmin
      .from('cd_customers')
      .select('*')
      .eq('cd_id', cdId)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 💰 FINANCEIRO DO CD (TRANSAÇÕES E SAQUES)
// ==========================================

router.get('/v1/cds/:id/financial', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    const [withdrawsRes, txnsRes] = await Promise.all([
      supabaseAdmin.from('cd_withdraw_requests').select('*').eq('cd_id', cdId).order('created_at', { ascending: false }),
      supabaseAdmin.from('cd_transactions').select('*').eq('cd_id', cdId).order('created_at', { ascending: false }).limit(50)
    ]);

    if (withdrawsRes.error || txnsRes.error) throw new Error("Erro ao buscar dados financeiros.");
    res.json({ success: true, data: { withdraws: withdrawsRes.data, transactions: txnsRes.data } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/withdraws', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const { amount, fee, net_amount, scheduled_date, cd_name } = req.body;

    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    const { error: withdrawError } = await supabaseAdmin
      .from('cd_withdraw_requests')
      .insert({
        cd_id: cdId,
        cd_name: cd_name || 'CD Local',
        amount, fee, net_amount,
        status: 'pending',
        scheduled_date
      });

    if (withdrawError) throw new Error(withdrawError.message);

    const { error: txnError } = await supabaseAdmin
      .from('cd_transactions')
      .insert({
        cd_id: cdId,
        type: 'OUT',
        category: 'SAQUE',
        description: `Solicitação de saque agendada para ${scheduled_date.split('-').reverse().join('/')}`,
        amount,
        status: 'PENDENTE',
        reference_id: `SAQUE-${Date.now()}`,
        created_at: new Date().toISOString()
      });

    if (txnError) throw new Error(txnError.message);
    res.json({ success: true, message: 'Saque solicitado com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🔧 REPARO E MANUTENÇÃO
// ==========================================

router.post('/v1/cds/:id/repair-stock', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    let cdId = rawId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      const { data: profile } = await supabaseAdmin.from('minisite_profiles').select('id').eq('consultant_id', rawId).maybeSingle();
      if (profile) cdId = profile.id;
    }

    // 1. Buscar pedidos válidos para estoque
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('cd_orders')
      .select('id')
      .eq('cd_id', cdId)
      .in('status', ['PAGO', 'EM SEPARAÇÃO', 'EM TRÂNSITO', 'ENTREGUE']);

    if (ordersError) throw ordersError;
    if (!orders || orders.length === 0) {
      return res.json({ success: true, fixedCount: 0, message: 'Nenhum pedido elegível encontrado.' });
    }

    const orderIds = orders.map(o => o.id);

    // 2. Buscar todos os itens desses pedidos
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('cd_order_items')
      .select('*')
      .in('cd_order_id', orderIds);

    if (itemsError) throw itemsError;

    // 3. Consolidar quantidades
    const stockMap = new Map();
    for (const item of items) {
      const prodId = item.product_id;
      const current = stockMap.get(prodId) || { qty: 0, name: item.product_name, price: item.unit_price };
      stockMap.set(prodId, {
        qty: current.qty + (item.quantity || 0),
        name: item.product_name,
        price: item.unit_price
      });
    }

    // 4. Upsert no cd_products
    let fixedCount = 0;
    for (const [prodId, info] of stockMap.entries()) {
      const { data: catalogProd } = await supabaseAdmin
        .from('products')
        .select('sku, category, price, pv_points')
        .eq('id', prodId)
        .maybeSingle();

      const retailPrice = catalogProd?.price ? (Number(catalogProd.price) * 0.5) : (Number(info.price));
      const cdCostPrice = Number(info.price);

      const { error: upsertError } = await supabaseAdmin
        .from('cd_products')
        .upsert({
          cd_id: cdId,
          sku: catalogProd?.sku || 'N/A',
          name: info.name,
          category: catalogProd?.category || 'Geral',
          stock_level: info.qty,
          min_stock: 10,
          price: retailPrice, // Preço para o Consultor (50% do varejo)
          cost_price: cdCostPrice,
          points: catalogProd?.pv_points || 0,
          status: 'OK',
          updated_at: new Date().toISOString()
        }, { onConflict: 'cd_id,sku' });

      if (!upsertError) fixedCount++;
      else console.error(`Erro ao upsert produto ${prodId}:`, upsertError);
    }

    // 5. Reconstruir transações financeiras (Histórico)
    const { data: existingTxns } = await supabaseAdmin
      .from('cd_transactions')
      .select('reference_id')
      .eq('cd_id', cdId);

    const txnRefs = new Set((existingTxns || []).map(t => t.reference_id));

    for (const orderId of orderIds) {
      const refId = `ORDER-${orderId}`;
      if (!txnRefs.has(refId)) {
        const { data: orderData } = await supabaseAdmin.from('cd_orders').select('*').eq('id', orderId).single();
        if (orderData && (['PAGO', 'ENTREGUE', 'EM SEPARAÇÃO', 'EM TRÂNSITO'].includes(orderData.status))) {
          await supabaseAdmin.from('cd_transactions').insert({
            cd_id: cdId,
            description: `Abastecimento de Estoque - Pedido #${orderId.slice(0, 8)}`,
            type: 'OUT',
            category: 'ESTOQUE',
            amount: orderData.total,
            status: 'CONCLUIDO',
            reference_id: refId,
            created_at: orderData.created_at || new Date().toISOString()
          });
        }
      }
    }

    res.json({ success: true, fixedCount, message: `${fixedCount} produtos e transações restaurados.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🚀 SINCRONIZAÇÃO (MASTER SYNC)
// ==========================================

router.post('/v1/cds/:id/sync', async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const { email: optEmail, document: optDoc } = req.body;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // [RS-LOGIC] - Busca Branding Global do Admin para centralização
    let globalLogo = null;
    let globalFavicon = null;
    try {
      const { data: config } = await supabaseAdmin.from('app_configs').select('value').eq('key', 'general_branding_settings').maybeSingle();
      if (config?.value) {
        globalLogo = config.value.logo || null;
        globalFavicon = config.value.favicon || null;
      }
    } catch (e) {
      console.warn('[Sync] Erro ao carregar branding global:', e);
    }

    const [consultor, profile, minisite] = await Promise.all([
      supabaseAdmin.from('consultores').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
      // Busca segura: primeiro por consultant_id, depois por id se for UUID
      (async () => {
        const byConsultant = await supabaseAdmin.from('minisite_profiles').select('*').eq('consultant_id', userId).maybeSingle();
        if (byConsultant.data) return byConsultant;
        if (isUUID) return await supabaseAdmin.from('minisite_profiles').select('*').eq('id', userId).maybeSingle();
        return { data: null, error: null };
      })()
    ]);

    const masterData = {
      // Preserve existing id or generate a new UUID (required NOT NULL)
      id: minisite.data?.id || crypto.randomUUID(),
      consultant_id: userId,
      type: minisite.data?.type || 'cd',
      name: minisite.data?.name || consultor.data?.nome || profile.data?.nome_completo || 'CD Em Configuração',
      avatar_url: minisite.data?.avatar_url || profile.data?.avatar_url || null,
      // [CENTRALIZAÇÃO] Injeta branding vindo do Admin
      favicon_url: globalFavicon || minisite.data?.favicon_url || null,
      logo_url: globalLogo || minisite.data?.logo_url || null,
      email: minisite.data?.email || consultor.data?.email || profile.data?.email || optEmail,
      phone: minisite.data?.phone || consultor.data?.whatsapp || profile.data?.telefone || null,
      cpf: minisite.data?.cpf || consultor.data?.cpf || profile.data?.cpf || optDoc?.replace(/\D/g, ''),
      address_zip: minisite.data?.address_zip || consultor.data?.cep || '',
      address_street: minisite.data?.address_street || consultor.data?.endereco || '',
      address_number: minisite.data?.address_number || consultor.data?.numero || '',
      address_neighborhood: minisite.data?.address_neighborhood || consultor.data?.bairro || '',
      address_city: minisite.data?.address_city || consultor.data?.cidade || '',
      address_state: minisite.data?.address_state || consultor.data?.estado || '',
      updated_at: new Date().toISOString()
    };

    const { error: saveError } = await supabaseAdmin
      .from('minisite_profiles')
      .upsert(masterData, { onConflict: 'consultant_id' });

    if (saveError) throw saveError;
    res.json({ success: true, message: 'Sync concluído!', data: masterData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
