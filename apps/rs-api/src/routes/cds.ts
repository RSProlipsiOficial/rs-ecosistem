import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';

const router = Router();
const DEFAULT_CENTRAL_MARKETPLACE_REF = 'rsprolipsi';

const normalizeCdStatus = (status?: string | null) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (!normalized) return true;
  return !['blocked', 'inactive', 'inativo', 'bloqueado'].includes(normalized);
};

const isLikelyCdMinisite = (row: any) => {
  const type = String(row?.type || '').trim().toLowerCase();
  const consultantId = String(row?.consultant_id || '').trim().toLowerCase();
  const slug = String(row?.slug || '').trim().toLowerCase();
  const name = String(row?.name || row?.manager_name || '').trim().toLowerCase();

  if (Boolean(row?.is_federal_sede)) return true;
  if (['cd', 'franquia', 'proprio', 'hibrido'].some((token) => type.includes(token))) return true;
  if (type.includes('sede')) return true;
  if (consultantId === DEFAULT_CENTRAL_MARKETPLACE_REF || slug === DEFAULT_CENTRAL_MARKETPLACE_REF) return true;
  if (name.includes('sede rs prólipsi') || name.includes('sede rs prolipsi')) return true;

  return false;
};

const buildCdMergeKey = (row: any) => {
  const consultantId = String(row?.consultant_id || '').trim();
  if (consultantId) return `consultant:${consultantId}`;

  const name = String(row?.name || row?.manager_name || '').trim().toLowerCase();
  const city = String(row?.address_city || row?.city || '').trim().toLowerCase();
  const state = String(row?.address_state || row?.state || row?.uf || '').trim().toLowerCase();
  if (name || city || state) return `profile:${name}:${city}:${state}`;

  return `id:${String(row?.id || '').trim()}`;
};

const mapCdSourceRow = (row: any, source: 'distribution_centers' | 'cd_profiles' | 'minisite_profiles') => {
  const city = String(row?.address_city || row?.city || '').trim();
  const state = String(row?.address_state || row?.state || row?.uf || '').trim();
  const street = String(row?.address_street || row?.address || '').trim();

  return {
    id: String(row?.id || ''),
    consultant_id: String(row?.consultant_id || ''),
    source,
    sourcePriority: source === 'minisite_profiles' ? 3 : source === 'cd_profiles' ? 2 : 1,
    mergeKey: buildCdMergeKey(row),
    managerId: String(row?.consultant_id || row?.id || ''),
    name: String(row?.name || row?.manager_name || 'CD'),
    manager_name: String(row?.manager_name || row?.name || 'CD'),
    owner_name: String(row?.manager_name || row?.name || 'CD'),
    cnpj_cpf: String(row?.cpf || row?.cnpj || row?.document || ''),
    cpf: String(row?.cpf || row?.cnpj || row?.document || ''),
    email: String(row?.email || ''),
    phone: String(row?.phone || row?.whatsapp || ''),
    address_street: street,
    address_number: String(row?.address_number || ''),
    address_neighborhood: String(row?.address_neighborhood || ''),
    address_city: city,
    address_state: state,
    address_zip: String(row?.address_zip || ''),
    slug: String(row?.slug || ''),
    type: String(row?.type || 'cd'),
    status: String(row?.status || (normalizeCdStatus(row?.status) ? 'ATIVO' : 'BLOQUEADO')),
    is_active: normalizeCdStatus(row?.status),
    is_federal_sede: Boolean(row?.is_federal_sede),
    avatar_url: String(row?.avatar_url || ''),
    logo_url: String(row?.logo_url || ''),
    favicon_url: String(row?.favicon_url || ''),
    wallet_balance: row?.wallet_balance ?? 0,
    created_at: row?.created_at || new Date().toISOString(),
    stores: [{
      id: `${String(row?.id || 'cd')}-store`,
      name: String(row?.name || row?.manager_name || 'CD'),
      city,
      state,
      address: street
    }]
  };
};

const mergeCdSources = (...sources: Array<{ rows: any[]; source: 'distribution_centers' | 'cd_profiles' | 'minisite_profiles' }>) => {
  const merged = new Map<string, any>();

  sources.forEach(({ rows, source }) => {
    rows.forEach((row) => {
      const candidate = mapCdSourceRow(row, source);
      const existing = merged.get(candidate.mergeKey);

      if (!existing) {
        merged.set(candidate.mergeKey, candidate);
        return;
      }

      const keep = existing.sourcePriority >= candidate.sourcePriority ? existing : candidate;
      const fill = existing.sourcePriority >= candidate.sourcePriority ? candidate : existing;

      merged.set(candidate.mergeKey, {
        ...fill,
        ...keep,
        id: keep.id || fill.id,
        managerId: keep.managerId || fill.managerId,
        stores: Array.isArray(keep.stores) && keep.stores.length > 0 ? keep.stores : fill.stores,
        is_federal_sede: Boolean(existing.is_federal_sede || candidate.is_federal_sede),
        is_active: Boolean(existing.is_active || candidate.is_active),
      });
    });
  });

  return Array.from(merged.values()).sort((a, b) => {
    if (a.is_federal_sede !== b.is_federal_sede) return a.is_federal_sede ? -1 : 1;
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR');
  });
};

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const resolveCdId = async (rawId: string) => {
  if (isUuid(rawId)) return rawId;
  const { data: profile } = await supabaseAdmin
    .from('minisite_profiles')
    .select('id')
    .eq('consultant_id', rawId)
    .maybeSingle();
  return profile?.id || rawId;
};

const resolveCatalogProductIdFromCdRow = async (cdRow: any) => {
  const directProductId = String(cdRow?.product_id || '').trim();
  if (directProductId && isUuid(directProductId)) return directProductId;

  const sku = String(cdRow?.sku || '').trim();
  if (sku) {
    const { data: productBySku } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .maybeSingle();
    if (productBySku?.id) return String(productBySku.id);
  }

  const name = String(cdRow?.name || '').trim();
  if (name) {
    const { data: productByName } = await supabaseAdmin
      .from('products')
      .select('id')
      .ilike('name', name)
      .maybeSingle();
    if (productByName?.id) return String(productByName.id);
  }

  return null;
};

const insertInventoryMovement = async (payload: {
  cdId: string;
  productId: string | null;
  type: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceId?: string | null;
  referenceType?: string | null;
  createdBy?: string | null;
}) => {
  if (!payload.cdId || !payload.productId) return;

  const movementPayload = {
    cd_id: payload.cdId,
    product_id: payload.productId,
    type: payload.type,
    quantity: Math.max(0, Number(payload.quantity || 0)),
    previous_quantity: Math.max(0, Number(payload.previousQuantity || 0)),
    new_quantity: Math.max(0, Number(payload.newQuantity || 0)),
    reason: payload.reason,
    reference_id: payload.referenceId || null,
    reference_type: payload.referenceType || null,
    created_by: payload.createdBy || 'system',
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('inventory_movements')
    .insert(movementPayload);

  if (error) {
    console.warn('[CDS] Falha ao registrar inventory_movements:', error.message);
  }
};

// ==========================================
// 📦 CDs E PERFIS
// ==========================================

// Listar todos os CDs (Admin / Marketplace)
router.get('/v1/cds', async (req: Request, res: Response) => {
  try {
    const [centersResult, cdProfilesResult, minisiteResult] = await Promise.allSettled([
      supabaseAdmin
        .from('distribution_centers')
        .select('*')
        .order('is_federal_sede', { ascending: false })
        .order('name', { ascending: true }),
      supabaseAdmin
        .from('cd_profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('minisite_profiles')
        .select('*')
        .order('created_at', { ascending: false })
    ]);

    const centers = centersResult.status === 'fulfilled' && !centersResult.value.error ? (centersResult.value.data || []) : [];
    const cdProfiles = cdProfilesResult.status === 'fulfilled' && !cdProfilesResult.value.error ? (cdProfilesResult.value.data || []) : [];
    const minisitesRaw = minisiteResult.status === 'fulfilled' && !minisiteResult.value.error ? (minisiteResult.value.data || []) : [];
    const minisites = minisitesRaw.filter(isLikelyCdMinisite);

    const merged = mergeCdSources(
      { rows: centers, source: 'distribution_centers' },
      { rows: cdProfiles, source: 'cd_profiles' },
      { rows: minisites, source: 'minisite_profiles' }
    ).map((item) => ({
      id: item.id,
      manager_id: item.managerId,
      source: item.source,
      name: item.name,
      owner_name: item.owner_name,
      cnpj_cpf: item.cnpj_cpf,
      email: item.email,
      phone: item.phone,
      address_street: item.address_street,
      address_number: item.address_number,
      address_neighborhood: item.address_neighborhood,
      address_city: item.address_city,
      address_state: item.address_state,
      address_zip: item.address_zip,
      type: item.type,
      is_active: item.is_active,
      is_federal_sede: item.is_federal_sede,
      stores: item.stores,
      created_at: item.created_at
    }));

    res.json({ success: true, data: merged });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar CD
router.post('/v1/cds', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ success: false, error: 'name é requerido' });

    const authUserId = String(body.auth_user_id || body.consultant_id || '').trim();
    if (!authUserId) return res.status(400).json({ success: false, error: 'consultant_id requerido' });

    const payload: any = {
      name: body.name,
      type: body.type || 'cd',
      email: body.email || null,
      phone: body.phone || null,
      cpf: body.cnpj_cpf || body.cpf || null,
      address_street: body.address_street || null,
      address_number: body.address_number || null,
      address_neighborhood: body.address_neighborhood || null,
      address_city: body.address_city || null,
      address_state: body.address_state || null,
      address_zip: body.address_zip || null,
      consultant_id: authUserId,
      updated_at: new Date().toISOString()
    };

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('minisite_profiles')
      .select('id')
      .eq('consultant_id', authUserId)
      .maybeSingle();

    if (existingError) return res.status(500).json({ success: false, error: existingError.message });

    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('minisite_profiles')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.json({ success: true, data, mode: 'updated' });
    }

    const { data, error } = await supabaseAdmin
      .from('minisite_profiles')
      .insert([{ id: authUserId, ...payload, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data, mode: 'created' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Retorna o primeiro CD 
router.get('/v1/cds/primary', async (req: Request, res: Response) => {
  try {
    const [centersResult, cdProfilesResult, minisiteResult] = await Promise.allSettled([
      supabaseAdmin
        .from('distribution_centers')
        .select('*')
        .order('is_federal_sede', { ascending: false })
        .order('name', { ascending: true }),
      supabaseAdmin
        .from('cd_profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('minisite_profiles')
        .select('*')
        .order('created_at', { ascending: false })
    ]);

    const centers = centersResult.status === 'fulfilled' && !centersResult.value.error ? (centersResult.value.data || []) : [];
    const cdProfiles = cdProfilesResult.status === 'fulfilled' && !cdProfilesResult.value.error ? (cdProfilesResult.value.data || []) : [];
    const minisitesRaw = minisiteResult.status === 'fulfilled' && !minisiteResult.value.error ? (minisiteResult.value.data || []) : [];
    const minisites = minisitesRaw.filter(isLikelyCdMinisite);

    const [primary] = mergeCdSources(
      { rows: centers, source: 'distribution_centers' },
      { rows: cdProfiles, source: 'cd_profiles' },
      { rows: minisites, source: 'minisite_profiles' }
    );

    res.json({ success: true, data: primary || null });
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
      productId: p.product_id || null,
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

router.get('/v1/cds/:id/inventory-movements', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const cdId = await resolveCdId(rawId);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

    const { data: movements, error } = await supabaseAdmin
      .from('inventory_movements')
      .select('*')
      .eq('cd_id', cdId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const productIds = Array.from(new Set((movements || []).map((item: any) => String(item.product_id || '')).filter(Boolean)));
    const { data: productRows } = productIds.length
      ? await supabaseAdmin.from('products').select('id, name, image_url, images').in('id', productIds)
      : { data: [] as any[] };

    const productMap = new Map((productRows || []).map((product: any) => [String(product.id), product]));
    const mapped = (movements || []).map((movement: any) => {
      const product = productMap.get(String(movement.product_id || ''));
      return {
        id: movement.id,
        productId: movement.product_id,
        productName: product?.name || 'Produto',
        productImageUrl: product?.image_url || (Array.isArray(product?.images) ? product.images[0] : null),
        type: movement.type,
        quantity: Number(movement.quantity) || 0,
        previousQuantity: Number(movement.previous_quantity) || 0,
        newQuantity: Number(movement.new_quantity) || 0,
        reason: movement.reason || '',
        referenceId: movement.reference_id || null,
        referenceType: movement.reference_type || null,
        createdAt: movement.created_at,
      };
    });

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:cdId/inventory/:productId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.cdId);
    const { productId } = req.params;
    const newLevel = Number(req.body?.stockLevel);
    const minStock = Math.max(0, Number(req.body?.minStock ?? 5));

    if (!Number.isFinite(newLevel) || newLevel < 0) {
      return res.status(400).json({ success: false, error: 'stockLevel invalido' });
    }

    const { data: cdProduct, error: fetchError } = await supabaseAdmin
      .from('cd_products')
      .select('*')
      .eq('id', productId)
      .eq('cd_id', cdId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!cdProduct) return res.status(404).json({ success: false, error: 'Produto do CD nao encontrado' });

    const previousQuantity = Math.max(0, Number(cdProduct.stock_level || 0));
    const normalizedLevel = Math.max(0, Math.trunc(newLevel));
    const status = normalizedLevel <= 0 ? 'CRITICO' : (normalizedLevel <= minStock ? 'BAIXO' : 'OK');

    const { error: updateError } = await supabaseAdmin
      .from('cd_products')
      .update({
        stock_level: normalizedLevel,
        min_stock: minStock,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('cd_id', cdId);

    if (updateError) throw updateError;

    const catalogProductId = await resolveCatalogProductIdFromCdRow(cdProduct);
    if (normalizedLevel !== previousQuantity) {
      await insertInventoryMovement({
        cdId,
        productId: catalogProductId,
        type: 'adjustment',
        quantity: Math.abs(normalizedLevel - previousQuantity),
        previousQuantity,
        newQuantity: normalizedLevel,
        reason: 'AJUSTE_MANUAL_CD',
        referenceId: productId,
        referenceType: 'cd_product',
        createdBy: 'cd_admin',
      });
    }

    res.json({ success: true });
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
          const stockSku = catalogProd?.sku || item.sku || 'N/A';
          const { data: existingCdProduct } = await supabaseAdmin
            .from('cd_products')
            .select('*')
            .eq('cd_id', order.cd_id)
            .eq('sku', stockSku)
            .maybeSingle();
          const previousQuantity = Math.max(0, Number(existingCdProduct?.stock_level || 0));

          await supabaseAdmin
            .from('cd_products')
            .upsert({
              cd_id: order.cd_id,
              sku: stockSku,
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
            p_sku: stockSku,
            p_qty: item.quantity
          });

          const { data: updatedCdProduct } = await supabaseAdmin
            .from('cd_products')
            .select('stock_level')
            .eq('cd_id', order.cd_id)
            .eq('sku', stockSku)
            .maybeSingle();

          await insertInventoryMovement({
            cdId: order.cd_id,
            productId: catalogProd?.id || String(item.product_id || ''),
            type: 'in',
            quantity: Math.max(0, Number(item.quantity || 0)),
            previousQuantity,
            newQuantity: Math.max(0, Number(updatedCdProduct?.stock_level || previousQuantity + Number(item.quantity || 0))),
            reason: 'ABASTECIMENTO_ENTREGUE',
            referenceId: id,
            referenceType: 'cd_order',
            createdBy: 'system',
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
      // minisite_profiles.id referencia o usuario dono do minisite/CD
      id: minisite.data?.id || userId,
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
