import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';
import axios from 'axios';

const { calculateCommission } = require('../services/productService');
const { creditWallet } = require('../services/salesService');

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
const hasOwn = (obj: any, key: string) => Object.prototype.hasOwnProperty.call(obj, key);
const cleanUndefined = <T extends Record<string, any>>(data: T): T => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

const PAID_PAYMENT_STATUSES = new Set(['paid', 'pago', 'completed', 'approved']);
const MARKETPLACE_PROCESS_MARKER = '__marketplace_paid_processed__';

const asNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeOrderNotes = (notes: any) => typeof notes === 'string' ? notes : '';

const appendProcessingMarker = (notes: string, summary: string) => {
  const trimmed = notes.trim();
  const marker = `${MARKETPLACE_PROCESS_MARKER}:${summary}`;
  return trimmed ? `${trimmed}\n${marker}` : marker;
};

const getSpecifications = (product: any) => (
  product?.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)
    ? product.specifications
    : {}
);

const MARKETPLACE_OPERATOR_ROLES = new Set(['admin', 'superadmin', 'super_admin', 'marketplace_admin', 'lojista', 'seller', 'master']);
const DEFAULT_MARKETPLACE_SPONSOR_REF = 'rsprolipsi';

const normalizeRole = (value: any) => String(value || '').trim().toLowerCase();
const normalizeText = (value: any) => String(value || '').trim().toLowerCase();
const normalizeFulfillmentOriginType = (value: any) => String(value || 'central').trim().toLowerCase();
const localPart = (value: any) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized.includes('@')) return normalized;
  return normalized.split('@')[0] || '';
};

const getBearerToken = (req: Request) => {
  const header = String(req.headers.authorization || '').trim();
  return header.startsWith('Bearer ') ? header.slice(7) : '';
};

type MarketplaceOperator = {
  authUserId: string;
  email: string;
  role: string;
  loginRefs: Set<string>;
  isMarketplaceOperator: boolean;
};

const resolveMarketplaceOperator = async (req: Request): Promise<MarketplaceOperator | null> => {
  const token = getBearerToken(req);
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const role = normalizeRole(user.user_metadata?.role || user.app_metadata?.role);
  const email = String(user.email || '').trim().toLowerCase();

  const { data: consultor } = await supabaseAdmin
    .from('consultores')
    .select('user_id, email, username, slug')
    .eq('user_id', user.id)
    .maybeSingle();

  const loginRefs = new Set(
    [
      user.id,
      email,
      localPart(email),
      consultor?.username,
      consultor?.slug,
      consultor?.email,
      localPart(consultor?.email),
      user.user_metadata?.loginId,
      user.user_metadata?.idConsultor,
      user.user_metadata?.slug,
    ]
      .map(normalizeText)
      .filter(Boolean)
  );

  const isMarketplaceOperator = (
    MARKETPLACE_OPERATOR_ROLES.has(role) ||
    loginRefs.has(DEFAULT_MARKETPLACE_SPONSOR_REF) ||
    email === 'rsprolipsioficial@gmail.com'
  );

  return {
    authUserId: String(user.id),
    email,
    role,
    loginRefs,
    isMarketplaceOperator,
  };
};

const resolveMarketplaceOperatorLoginId = (operator: MarketplaceOperator | null) => {
  if (!operator) return '';
  const preferred = Array.from(operator.loginRefs).find((ref) => (
    ref &&
    ref !== operator.authUserId &&
    !ref.includes('@')
  ));
  return preferred || localPart(operator.email) || operator.authUserId;
};

const isRSManagedProductRow = (product: any) => {
  const specifications = getSpecifications(product);
  const ownerType = String(product?.owner_type || specifications.ownerType || '').trim().toUpperCase();
  const isRSProduct = Boolean(product?.is_rs_product ?? specifications.isRSProduct ?? false);
  const fulfillmentOriginType = normalizeFulfillmentOriginType(product?.fulfillment_origin_type || specifications.fulfillmentOriginType);

  return ownerType === 'RS' || isRSProduct || fulfillmentOriginType !== 'seller_store';
};

const isProductManagedByOperator = (product: any, operator: MarketplaceOperator | null) => {
  if (!operator) return false;
  if (operator.isMarketplaceOperator) return isRSManagedProductRow(product);

  const specifications = getSpecifications(product);
  const fulfillmentOriginType = normalizeFulfillmentOriginType(product?.fulfillment_origin_type || specifications.fulfillmentOriginType);
  if (fulfillmentOriginType !== 'seller_store') return false;

  const ownerUserId = String(product?.owner_user_id || specifications.ownerUserId || '').trim();
  const ownerLoginId = normalizeText(product?.owner_login_id || specifications.ownerLoginId);

  return Boolean(
    (ownerUserId && ownerUserId === operator.authUserId) ||
    (ownerLoginId && operator.loginRefs.has(ownerLoginId))
  );
};

const filterProductIdsForOperator = (productIds: any, operator: MarketplaceOperator | null, productsById: Map<string, any>) => {
  const normalizedIds = Array.isArray(productIds) ? productIds.map((item) => String(item || '').trim()).filter(Boolean) : [];
  if (!operator) return [];
  return normalizedIds.filter((productId) => {
    const product = productsById.get(String(productId));
    return product ? isProductManagedByOperator(product, operator) : false;
  });
};

const isCollectionManagedByOperator = (collection: any, operator: MarketplaceOperator | null, productsById: Map<string, any>) => {
  if (!operator) return false;

  const ownerUserId = String(collection?.owner_user_id || collection?.ownerUserId || '').trim();
  const ownerLoginId = normalizeText(collection?.owner_login_id || collection?.ownerLoginId);
  const productIds = Array.isArray(collection?.product_ids)
    ? collection.product_ids.map((item: any) => String(item || '').trim()).filter(Boolean)
    : [];

  if (operator.isMarketplaceOperator) {
    if (ownerUserId || ownerLoginId) {
      return Boolean(
        (ownerUserId && ownerUserId === operator.authUserId) ||
        (ownerLoginId && operator.loginRefs.has(ownerLoginId))
      );
    }
    return productIds.length === 0 || productIds.some((productId) => {
      const product = productsById.get(productId);
      return product ? isRSManagedProductRow(product) : false;
    });
  }

  if ((ownerUserId && ownerUserId === operator.authUserId) || (ownerLoginId && operator.loginRefs.has(ownerLoginId))) {
    return true;
  }

  return productIds.some((productId) => {
    const product = productsById.get(productId);
    return product ? isProductManagedByOperator(product, operator) : false;
  });
};

const selectCollectionDataWithFallback = async (baseCollectionData: Record<string, any>, mode: 'insert' | 'update', collectionId?: string) => {
  const withOwnership = {
    ...baseCollectionData,
    owner_user_id: baseCollectionData.owner_user_id ?? null,
    owner_login_id: baseCollectionData.owner_login_id ?? ''
  };

  const execute = async (payload: Record<string, any>) => {
    if (mode === 'insert') {
      return supabase.from('collections').insert([payload]).select().single();
    }
    return supabase.from('collections').update(payload).eq('id', collectionId).select().single();
  };

  let result = await execute(withOwnership);
  if (!result.error) return result;

  if (!/owner_user_id|owner_login_id/i.test(String(result.error.message || ''))) {
    return result;
  }

  const fallbackPayload = { ...baseCollectionData };
  delete fallbackPayload.owner_user_id;
  delete fallbackPayload.owner_login_id;
  result = await execute(fallbackPayload);

  if (!result.error && result.data) {
    result.data = {
      ...result.data,
      owner_user_id: withOwnership.owner_user_id,
      owner_login_id: withOwnership.owner_login_id,
    };
  }

  return result;
};

const getMarketplaceCompensationSettings = async () => {
  try {
    const { data } = await supabase
      .from('app_configs')
      .select('value')
      .eq('key', 'marketplace_compensation_settings')
      .maybeSingle();

    const value = data?.value && typeof data.value === 'object' ? data.value : {};
    return {
      dropshippingPointsPerBrl: Math.max(asNumber((value as any).dropshippingPointsPerBrl, 1), 0),
      affiliatePointsPerBrl: Math.max(asNumber((value as any).affiliatePointsPerBrl, 1), 0),
    };
  } catch {
    return {
      dropshippingPointsPerBrl: 1,
      affiliatePointsPerBrl: 1,
    };
  }
};

const getMarketplaceBeneficiaryId = (order: any) => {
  if (order?.referrer_id) return String(order.referrer_id);
  if (String(order?.buyer_type || '').toLowerCase() === 'consultor' && order?.buyer_id) {
    return String(order.buyer_id);
  }
  return null;
};

const normalizeCdLookupKey = (value: any) => String(value || '').trim().toLowerCase();
const CENTRAL_DISTRIBUTOR_IDS = new Set(['cd-oficial-matriz', 'cd-oficial-matriz-fallback']);

const insertCdInventoryMovement = async (payload: {
  cdId: string;
  productId: string | null;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  orderId: string;
  reason: string;
}) => {
  if (!payload.cdId || !payload.productId) return;

  const { error } = await supabaseAdmin
    .from('inventory_movements')
    .insert({
      cd_id: payload.cdId,
      product_id: payload.productId,
      type: 'out',
      quantity: Math.max(0, Number(payload.quantity || 0)),
      previous_quantity: Math.max(0, Number(payload.previousQuantity || 0)),
      new_quantity: Math.max(0, Number(payload.newQuantity || 0)),
      reason: payload.reason,
      reference_id: payload.orderId,
      reference_type: 'marketplace_order',
      created_by: 'system',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.warn('[MARKETPLACE] Falha ao registrar inventory_movements:', error.message);
  }
};

const syncMarketplaceCdFulfillment = async (order: any, orderItems: any[], productMap: Map<string, any>) => {
  const cdId = String(order?.distributor_id || '').trim();
  if (!cdId || CENTRAL_DISTRIBUTOR_IDS.has(cdId)) {
    return { debitedItems: 0, missingItems: 0 };
  }

  const { data: inventoryRows, error: inventoryError } = await supabaseAdmin
    .from('cd_products')
    .select('id, sku, name, stock_level, min_stock')
    .eq('cd_id', cdId);

  if (inventoryError) {
    throw new Error(inventoryError.message);
  }

  const bySku = new Map<string, any>();
  const byName = new Map<string, any>();

  (inventoryRows || []).forEach((row: any) => {
    const skuKey = normalizeCdLookupKey(row?.sku);
    const nameKey = normalizeCdLookupKey(row?.name);
    if (skuKey) bySku.set(skuKey, row);
    if (nameKey) byName.set(nameKey, row);
  });

  let debitedItems = 0;
  let missingItems = 0;

  for (const item of orderItems) {
    const product = productMap.get(String(item?.productId || ''));
    const skuKey = normalizeCdLookupKey(item?.sku || product?.sku);
    const nameKey = normalizeCdLookupKey(item?.productName || item?.name || product?.name);
    const matchedRow =
      (skuKey ? bySku.get(skuKey) : null) ||
      (nameKey ? byName.get(nameKey) : null) ||
      null;

    if (!matchedRow) {
      missingItems += 1;
      continue;
    }

    const quantity = Math.max(asNumber(item?.quantity, 1), 1);
    const currentStock = Math.max(0, asNumber(matchedRow.stock_level, 0));
    const minStock = Math.max(0, asNumber(matchedRow.min_stock, 0));
    const nextStock = Math.max(0, currentStock - quantity);
    const status = nextStock <= 0 ? 'CRITICO' : (nextStock <= minStock ? 'BAIXO' : 'OK');

    const { error: updateError } = await supabaseAdmin
      .from('cd_products')
      .update({
        stock_level: nextStock,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchedRow.id)
      .eq('cd_id', cdId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await insertCdInventoryMovement({
      cdId,
      productId: String(item?.productId || product?.id || ''),
      quantity,
      previousQuantity: currentStock,
      newQuantity: nextStock,
      orderId: String(order.id),
      reason: 'VENDA_MARKETPLACE_CD',
    });

    matchedRow.stock_level = nextStock;
    matchedRow.status = status;
    debitedItems += 1;
  }

  await supabaseAdmin
    .from('cd_orders')
    .update({
      status: 'SEPARACAO',
      updated_at: new Date().toISOString()
    })
    .eq('marketplace_order_id', order.id)
    .eq('cd_id', cdId);

  return { debitedItems, missingItems };
};

const processMarketplacePaidOrder = async (order: any) => {
  const existingNotes = normalizeOrderNotes(order?.notes);
  if (existingNotes.includes(MARKETPLACE_PROCESS_MARKER)) {
    return;
  }

  const orderItems = Array.isArray(order?.items) ? order.items : [];
  if (orderItems.length === 0) {
    await supabase
      .from('orders')
      .update({ notes: appendProcessingMarker(existingNotes, 'empty'), updated_at: new Date().toISOString() })
      .eq('id', order.id);
    return;
  }

  const beneficiaryId = getMarketplaceBeneficiaryId(order);
  if (!beneficiaryId) {
    await supabase
      .from('orders')
      .update({ notes: appendProcessingMarker(existingNotes, 'no-beneficiary'), updated_at: new Date().toISOString() })
      .eq('id', order.id);
    return;
  }

  const productIds = Array.from(new Set(orderItems.map((item: any) => String(item?.productId || '')).filter(Boolean)));
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, member_price, specifications')
    .in('id', productIds);

  const productMap = new Map((products || []).map((product: any) => [String(product.id), product]));
  const compensationSettings = await getMarketplaceCompensationSettings();

  let sellerLevel = 'RS One Star';
  const { data: currentPerformance } = await supabase
    .from('consultant_performance')
    .select('points, current_rank, current_rank_digital')
    .eq('consultant_id', beneficiaryId)
    .maybeSingle();

  sellerLevel = String(currentPerformance?.current_rank_digital || currentPerformance?.current_rank || sellerLevel);

  let digitalPointsAccrued = 0;
  let commissionCredited = 0;
  let cdStockSummary = 'cd=skip';

  for (const item of orderItems) {
    const product = productMap.get(String(item?.productId || ''));
    const specs = getSpecifications(product);
    const commissionOrigin = String(item?.commissionOrigin || specs.commissionOrigin || 'rs_physical');
    const affiliateModel = String(item?.affiliateModel || specs.affiliateModel || 'none');
    const pricingTier = String(item?.pricingTier || 'retail');
    const quantity = Math.max(asNumber(item?.quantity, 1), 1);
    const unitPrice = asNumber(item?.price, asNumber(product?.price, 0));
    const lineAmount = unitPrice * quantity;

    if (lineAmount <= 0) continue;

    const isAffiliateOrigin = commissionOrigin === 'affiliate_physical' || commissionOrigin === 'affiliate_digital';
    const isDigitalOrigin = commissionOrigin === 'rs_digital' || commissionOrigin === 'affiliate_digital';
    const usesDropshipTier = pricingTier === 'dropship';

    if (isAffiliateOrigin || isDigitalOrigin || usesDropshipTier) {
      const factor = isAffiliateOrigin
        ? compensationSettings.affiliatePointsPerBrl
        : compensationSettings.dropshippingPointsPerBrl;
      digitalPointsAccrued += lineAmount * factor;
    }

    if (order?.referrer_id && (isAffiliateOrigin || isDigitalOrigin || usesDropshipTier)) {
      try {
        const commission = await calculateCommission({
          commission_origin: commissionOrigin,
          affiliate_model: affiliateModel,
          price_base: unitPrice,
        }, sellerLevel);

        const totalCommission = asNumber(commission?.value, 0) * quantity;
        if (totalCommission > 0) {
          await supabase.from('bonuses').insert({
            consultor_id: String(order.referrer_id),
            bonus_type: isAffiliateOrigin ? 'affiliate_referral' : (usesDropshipTier ? 'bonus_dropship' : 'direct_sale'),
            amount: totalCommission,
            description: `Comissao marketplace #${order.id} - ${item?.productName || product?.name || 'Produto'}`,
            status: 'available',
            processed_at: new Date().toISOString(),
          });

          try {
            await creditWallet(
              String(order.referrer_id),
              totalCommission,
              usesDropshipTier ? 'dropship_bonus' : (isAffiliateOrigin ? 'affiliate' : 'sale'),
              `Comissao marketplace #${order.id}`
            );
          } catch (walletError: any) {
            console.warn('[MARKETPLACE] Falha ao creditar wallet (nao-critico):', walletError?.message || walletError);
          }

          commissionCredited += totalCommission;
        }
      } catch (commissionError: any) {
        console.warn('[MARKETPLACE] Falha ao calcular comissao (nao-critico):', commissionError?.message || commissionError);
      }
    }
  }

  try {
    const cdSyncResult = await syncMarketplaceCdFulfillment(order, orderItems, productMap);
    cdStockSummary = `cd=debited:${cdSyncResult.debitedItems};missing:${cdSyncResult.missingItems}`;
  } catch (cdSyncError: any) {
    console.warn('[MARKETPLACE] Falha ao sincronizar estoque do CD (nao-critico):', cdSyncError?.message || cdSyncError);
    cdStockSummary = 'cd=error';
  }

  if (digitalPointsAccrued > 0) {
    const nextPoints = asNumber(currentPerformance?.points, 0) + digitalPointsAccrued;
    const { data: levels } = await supabase
      .from('career_levels_digital')
      .select('name, required_volume')
      .eq('active', true)
      .order('required_volume', { ascending: true });

    let currentRankDigital = 'Consultor';
    for (const level of (levels || [])) {
      if (nextPoints >= asNumber((level as any).required_volume, 0)) {
        currentRankDigital = String((level as any).name || currentRankDigital);
      }
    }

    if (currentPerformance) {
      await supabase
        .from('consultant_performance')
        .update({
          points: nextPoints,
          current_rank_digital: currentRankDigital,
          updated_at: new Date().toISOString(),
        })
        .eq('consultant_id', beneficiaryId);
    } else {
      await supabase
        .from('consultant_performance')
        .insert([{
          consultant_id: beneficiaryId,
          points: nextPoints,
          current_rank_digital: currentRankDigital,
        }]);
    }
  }

  const summary = `points=${digitalPointsAccrued.toFixed(2)};commission=${commissionCredited.toFixed(2)};${cdStockSummary}`;
  await supabase
    .from('orders')
    .update({ notes: appendProcessingMarker(existingNotes, summary), updated_at: new Date().toISOString() })
    .eq('id', order.id);
};

// =====================================================
// PRODUTOS - CRUD COMPLETO
// =====================================================

// Listar todos os produtos
router.get('/v1/marketplace/products', async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const { published } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (published !== undefined) {
      query = query.eq('published', published === 'true');
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obter produto por ID
router.get('/v1/marketplace/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar produto
router.post('/v1/marketplace/products', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });

    const operatorLoginId = resolveMarketplaceOperatorLoginId(operator);
    const forcedFulfillmentOriginType = operator.isMarketplaceOperator ? 'central' : 'seller_store';
    const ownerUserId = operator.isMarketplaceOperator ? null : operator.authUserId;
    const ownerLoginId = operator.isMarketplaceOperator ? '' : operatorLoginId;
    const ownerType = operator.isMarketplaceOperator ? 'RS' : 'SELLER';
    const isRSProduct = operator.isMarketplaceOperator;

    const specifications = cleanUndefined({
      ...(body.specifications || {}),
      shortDescription: body.shortDescription ?? body.specifications?.shortDescription,
      trackQuantity: body.trackStock ?? body.specifications?.trackQuantity,
      requiresShipping: body.requiresShipping ?? body.specifications?.requiresShipping,
      variants: body.variants ?? body.specifications?.variants,
      videos: body.videos ?? body.specifications?.videos,
      materials: body.materials ?? body.specifications?.materials,
      mlm: body.mlm ?? body.specifications?.mlm,
      subcategory: body.subcategory ?? body.specifications?.subcategory,
      supplier: body.supplier ?? body.specifications?.supplier,
      barcode: body.barcode ?? body.specifications?.barcode,
      weight: body.weight ?? body.specifications?.weight,
      weightUnit: body.weightUnit ?? body.specifications?.weightUnit,
      collections: body.collections ?? body.collectionIds ?? body.specifications?.collections,
      dropshipPrice: body.dropshipPrice ?? body.specifications?.dropshipPrice,
      productType: body.productType ?? body.specifications?.productType,
      commissionOrigin: body.commissionOrigin ?? body.specifications?.commissionOrigin,
      affiliateModel: body.affiliateModel ?? body.specifications?.affiliateModel,
      ownerUserId: ownerUserId,
      ownerLoginId: ownerLoginId,
      ownerType,
      isRSProduct,
      fulfillmentOriginType: forcedFulfillmentOriginType,
      fulfillmentOriginId: operator.isMarketplaceOperator
        ? (body.fulfillmentOriginId ?? body.specifications?.fulfillmentOriginId)
        : (body.fulfillmentOriginId ?? body.specifications?.fulfillmentOriginId ?? operator.authUserId),
      fulfillmentOriginName: operator.isMarketplaceOperator
        ? (body.fulfillmentOriginName ?? body.specifications?.fulfillmentOriginName)
        : (body.fulfillmentOriginName ?? body.specifications?.fulfillmentOriginName ?? operatorLoginId),
      fulfillmentOriginZip: body.fulfillmentOriginZip ?? body.specifications?.fulfillmentOriginZip
    });

    const productData = cleanUndefined({
      tenant_id: body.tenantId,
      name: body.name,
      description: body.description,
      short_description: body.shortDescription,
      price: body.price ?? body.fullPrice,
      compare_price: body.originalPrice ?? body.comparePrice ?? body.compareAtPrice,
      member_price: body.memberPrice ?? body.consultantPrice,
      cost_price: body.costPrice,
      stock_quantity: body.stock ?? body.inventory ?? body.currentStock ?? body.specifications?.inventory ?? 0,
      low_stock_alert: body.lowStockAlert ?? body.minStock,
      sku: body.sku ?? body.specifications?.sku,
      images: body.images || [],
      category: body.category ?? body.specifications?.subcategory,
      tags: body.tags || [],
      published: body.published !== false,
      featured: body.featured || false,
      is_active: body.isActive ?? body.published !== false,
      is_featured: body.isFeatured ?? body.featured ?? false,
      seo_title: body.seoTitle,
      seo_description: body.seoDescription,
      seo_keywords: body.seoKeywords,
      featured_image: Array.isArray(body.images) && body.images.length > 0
        ? body.images[0]
        : (body.featuredImage ?? null),
      specifications
    });

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar produto
router.put('/v1/marketplace/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });
    const { data: currentProduct, error: currentProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (currentProductError || !currentProduct) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    if (!isProductManagedByOperator(currentProduct, operator)) {
      return res.status(403).json({ success: false, error: 'Sem permissão para editar este produto' });
    }

    const operatorLoginId = resolveMarketplaceOperatorLoginId(operator);
    const forcedFulfillmentOriginType = operator.isMarketplaceOperator ? 'central' : 'seller_store';
    const ownerUserId = operator.isMarketplaceOperator ? null : operator.authUserId;
    const ownerLoginId = operator.isMarketplaceOperator ? '' : operatorLoginId;
    const ownerType = operator.isMarketplaceOperator ? 'RS' : 'SELLER';
    const isRSProduct = operator.isMarketplaceOperator;

    const productData: any = {};
    if (hasOwn(body, 'name')) productData.name = body.name;
    if (hasOwn(body, 'description')) productData.description = body.description;
    if (hasOwn(body, 'shortDescription')) productData.short_description = body.shortDescription;
    if (hasOwn(body, 'price') || hasOwn(body, 'fullPrice')) productData.price = body.price ?? body.fullPrice;
    if (hasOwn(body, 'memberPrice') || hasOwn(body, 'consultantPrice')) {
      productData.member_price = body.memberPrice ?? body.consultantPrice;
    }
    if (hasOwn(body, 'compareAtPrice') || hasOwn(body, 'originalPrice') || hasOwn(body, 'comparePrice')) {
      productData.compare_price = body.compareAtPrice ?? body.originalPrice ?? body.comparePrice;
    }
    if (hasOwn(body, 'costPrice')) productData.cost_price = body.costPrice;
    if (hasOwn(body, 'lowStockAlert') || hasOwn(body, 'minStock')) {
      productData.low_stock_alert = body.lowStockAlert ?? body.minStock;
    }

    const inventoryValue = body.inventory ?? body.stock ?? body.specifications?.inventory;
    if (inventoryValue !== undefined || hasOwn(body, 'currentStock')) {
      productData.stock_quantity = inventoryValue ?? body.currentStock;
    }

    const skuValue = body.sku ?? body.specifications?.sku;
    if (hasOwn(body, 'sku') || hasOwn(body, 'specifications')) productData.sku = skuValue;

    if (hasOwn(body, 'images')) {
      productData.images = body.images;
      productData.featured_image = Array.isArray(body.images) && body.images.length > 0
        ? body.images[0]
        : (hasOwn(body, 'featuredImage') ? body.featuredImage : null);
    } else if (hasOwn(body, 'featuredImage')) {
      productData.featured_image = body.featuredImage;
    }

    const categoryValue = body.category ?? body.specifications?.subcategory;
    if (hasOwn(body, 'category') || hasOwn(body, 'specifications')) productData.category = categoryValue;

    if (body.published !== undefined) productData.published = body.published;
    if (body.featured !== undefined) productData.featured = body.featured;
    if (body.isActive !== undefined) productData.is_active = body.isActive;
    if (body.isFeatured !== undefined) productData.is_featured = body.isFeatured;
    if (hasOwn(body, 'tags')) productData.tags = body.tags;

    if (body.seoTitle !== undefined) productData.seo_title = body.seoTitle;
    if (body.seoDescription !== undefined) productData.seo_description = body.seoDescription;
    if (body.seoKeywords !== undefined) productData.seo_keywords = body.seoKeywords;

    // Agrupando campos extra e coleções dentro de specifications
    const existingSpecifications = currentProduct.specifications || {};
    const specificationUpdates: Record<string, any> = {};

    if (body.specifications && typeof body.specifications === 'object') {
      Object.assign(specificationUpdates, body.specifications);
    }
    if (hasOwn(body, 'subcategory') || hasOwn(body, 'subCategory')) {
      specificationUpdates.subcategory = body.subCategory ?? body.subcategory;
    }
    if (hasOwn(body, 'supplier')) specificationUpdates.supplier = body.supplier;
    if (hasOwn(body, 'barcode')) specificationUpdates.barcode = body.barcode;
    if (hasOwn(body, 'weight')) specificationUpdates.weight = body.weight;
    if (hasOwn(body, 'weightUnit')) specificationUpdates.weightUnit = body.weightUnit;
    if (hasOwn(body, 'dropshipPrice')) specificationUpdates.dropshipPrice = body.dropshipPrice;
    if (hasOwn(body, 'productType')) specificationUpdates.productType = body.productType;
    if (hasOwn(body, 'commissionOrigin')) specificationUpdates.commissionOrigin = body.commissionOrigin;
    if (hasOwn(body, 'affiliateModel')) specificationUpdates.affiliateModel = body.affiliateModel;
    specificationUpdates.ownerUserId = ownerUserId;
    specificationUpdates.ownerLoginId = ownerLoginId;
    specificationUpdates.ownerType = ownerType;
    specificationUpdates.isRSProduct = isRSProduct;
    specificationUpdates.fulfillmentOriginType = forcedFulfillmentOriginType;
    specificationUpdates.fulfillmentOriginId = operator.isMarketplaceOperator
      ? (hasOwn(body, 'fulfillmentOriginId') ? body.fulfillmentOriginId : (existingSpecifications.fulfillmentOriginId ?? currentProduct.fulfillment_origin_id))
      : (existingSpecifications.fulfillmentOriginId ?? currentProduct.fulfillment_origin_id ?? operator.authUserId);
    specificationUpdates.fulfillmentOriginName = operator.isMarketplaceOperator
      ? (hasOwn(body, 'fulfillmentOriginName') ? body.fulfillmentOriginName : (existingSpecifications.fulfillmentOriginName ?? currentProduct.fulfillment_origin_name))
      : (existingSpecifications.fulfillmentOriginName ?? currentProduct.fulfillment_origin_name ?? operatorLoginId);
    if (hasOwn(body, 'fulfillmentOriginZip')) specificationUpdates.fulfillmentOriginZip = body.fulfillmentOriginZip;
    if (hasOwn(body, 'collectionIds') || hasOwn(body, 'collections')) {
      specificationUpdates.collections = body.collectionIds ?? body.collections;
    }
    if (hasOwn(body, 'trackStock')) specificationUpdates.trackQuantity = body.trackStock;
    if (hasOwn(body, 'requiresShipping')) specificationUpdates.requiresShipping = body.requiresShipping;
    if (hasOwn(body, 'shortDescription')) specificationUpdates.shortDescription = body.shortDescription;
    if (hasOwn(body, 'variants')) specificationUpdates.variants = body.variants;
    if (hasOwn(body, 'videos')) specificationUpdates.videos = body.videos;
    if (hasOwn(body, 'materials')) specificationUpdates.materials = body.materials;
    if (hasOwn(body, 'mlm')) specificationUpdates.mlm = body.mlm;
    if (hasOwn(body, 'qualifiesForCycle')) {
      specificationUpdates.mlm = {
        ...(existingSpecifications.mlm || {}),
        qualifiesForCycle: body.qualifiesForCycle
      };
    }

    if (Object.keys(specificationUpdates).length > 0) {
      productData.specifications = cleanUndefined({
        ...existingSpecifications,
        ...specificationUpdates
      });
    }

    productData.updated_at = new Date().toISOString();
    const cleanedProductData = cleanUndefined(productData);

    const { data, error } = await supabase
      .from('products')
      .update(cleanedProductData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar produto
router.delete('/v1/marketplace/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });

    const { data: currentProduct, error: currentProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (currentProductError || !currentProduct) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    if (!isProductManagedByOperator(currentProduct, operator)) {
      return res.status(403).json({ success: false, error: 'Sem permissão para excluir este produto' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar estoque
router.patch('/v1/marketplace/products/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ success: false, error: 'stock requerido' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: stock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// COLEÇÕES - CRUD COMPLETO
// =====================================================

// Listar coleções
router.get('/v1/marketplace/collections', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar coleção
router.post('/v1/marketplace/collections', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });

    const requestedProductIds = Array.isArray(body.productIds)
      ? body.productIds.map((item: any) => String(item || '').trim()).filter(Boolean)
      : [];
    const { data: referencedProducts, error: referencedProductsError } = requestedProductIds.length > 0
      ? await supabase.from('products').select('*').in('id', requestedProductIds)
      : { data: [], error: null } as any;
    if (referencedProductsError) return res.status(500).json({ success: false, error: referencedProductsError.message });

    const productsById = new Map((referencedProducts || []).map((product: any) => [String(product.id), product]));
    const collectionData = {
      tenant_id: body.tenantId,
      name: body.name,
      description: body.description,
      image: body.image,
      product_ids: filterProductIdsForOperator(requestedProductIds, operator, productsById),
      owner_user_id: operator.isMarketplaceOperator ? null : operator.authUserId,
      owner_login_id: operator.isMarketplaceOperator ? '' : resolveMarketplaceOperatorLoginId(operator)
    };

    const { data, error } = await selectCollectionDataWithFallback(collectionData, 'insert');

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar coleção
router.put('/v1/marketplace/collections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });

    const { data: currentCollection, error: currentCollectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (currentCollectionError || !currentCollection) {
      return res.status(404).json({ success: false, error: 'Coleção não encontrada' });
    }

    const requestedProductIds = Array.isArray(body.productIds)
      ? body.productIds.map((item: any) => String(item || '').trim()).filter(Boolean)
      : (Array.isArray(currentCollection.product_ids) ? currentCollection.product_ids.map((item: any) => String(item || '').trim()).filter(Boolean) : []);
    const allProductIds = Array.from(new Set([
      ...requestedProductIds,
      ...(Array.isArray(currentCollection.product_ids) ? currentCollection.product_ids.map((item: any) => String(item || '').trim()).filter(Boolean) : [])
    ]));
    const { data: referencedProducts, error: referencedProductsError } = allProductIds.length > 0
      ? await supabase.from('products').select('*').in('id', allProductIds)
      : { data: [], error: null } as any;
    if (referencedProductsError) return res.status(500).json({ success: false, error: referencedProductsError.message });

    const productsById = new Map((referencedProducts || []).map((product: any) => [String(product.id), product]));
    if (!isCollectionManagedByOperator(currentCollection, operator, productsById)) {
      return res.status(403).json({ success: false, error: 'Sem permissão para editar esta coleção' });
    }

    const collectionData: any = {
      updated_at: new Date().toISOString(),
      owner_user_id: operator.isMarketplaceOperator ? null : operator.authUserId,
      owner_login_id: operator.isMarketplaceOperator ? '' : resolveMarketplaceOperatorLoginId(operator)
    };
    if (body.name) collectionData.name = body.name;
    if (body.description) collectionData.description = body.description;
    if (body.image) collectionData.image = body.image;
    if (body.productIds) collectionData.product_ids = filterProductIdsForOperator(body.productIds, operator, productsById);

    const { data, error } = await selectCollectionDataWithFallback(collectionData, 'update', id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar coleção
router.delete('/v1/marketplace/collections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });

    const { data: currentCollection, error: currentCollectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (currentCollectionError || !currentCollection) {
      return res.status(404).json({ success: false, error: 'Coleção não encontrada' });
    }

    const productIds = Array.isArray(currentCollection.product_ids)
      ? currentCollection.product_ids.map((item: any) => String(item || '').trim()).filter(Boolean)
      : [];
    const { data: referencedProducts, error: referencedProductsError } = productIds.length > 0
      ? await supabase.from('products').select('*').in('id', productIds)
      : { data: [], error: null } as any;
    if (referencedProductsError) return res.status(500).json({ success: false, error: referencedProductsError.message });

    const productsById = new Map((referencedProducts || []).map((product: any) => [String(product.id), product]));
    if (!isCollectionManagedByOperator(currentCollection, operator, productsById)) {
      return res.status(403).json({ success: false, error: 'Sem permissão para excluir esta coleção' });
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// DASHBOARD LAYOUT - MARKETPLACE (stub)
// =====================================================

router.get('/v1/dashboard-layout/marketplace', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      config: {
        bonusCards: [
          { title: 'Bônus do Ciclo', icon: 'IconAward', source: 'bonusCicloGlobal' },
          { title: 'Top SIGMA', icon: 'IconTrophy', source: 'bonusTopSigme' },
          { title: 'Plano de Carreira', icon: 'IconBriefcase', source: 'bonusPlanoCarreira' }
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/dashboard/marketplace', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      config: {
        bonusCards: [
          { title: 'Bônus do Ciclo', icon: 'IconAward', source: 'bonusCicloGlobal' },
          { title: 'Top SIGMA', icon: 'IconTrophy', source: 'bonusTopSigme' },
          { title: 'Plano de Carreira', icon: 'IconBriefcase', source: 'bonusPlanoCarreira' }
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PEDIDOS - CRUD COMPLETO
// =====================================================

// Listar pedidos
router.get('/v1/marketplace/orders', async (req: Request, res: Response) => {
  try {
    const { tenantId, status } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const operator = await resolveMarketplaceOperator(req);
    if (!operator) return res.status(401).json({ success: false, error: 'Autenticação requerida' });

    let query = supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    const filteredData = (data || []).filter((order: any) => {
      const items = Array.isArray(order?.items) ? order.items : [];
      const orderOriginType = normalizeFulfillmentOriginType(order?.fulfillment_origin_type || order?.fulfillmentOriginType);
      const orderOwnerUserId = String(order?.owner_user_id || order?.ownerUserId || '').trim();
      const orderOwnerLoginId = normalizeText(order?.owner_login_id || order?.ownerLoginId);
      const hasSellerStoreItems = items.some((item: any) => normalizeFulfillmentOriginType(item?.fulfillmentOriginType) === 'seller_store');
      const itemOwnerMatches = items.some((item: any) => {
        const ownerUserId = String(item?.ownerUserId || '').trim();
        const ownerLoginId = normalizeText(item?.ownerLoginId);
        return Boolean(
          (ownerUserId && ownerUserId === operator.authUserId) ||
          (ownerLoginId && operator.loginRefs.has(ownerLoginId))
        );
      });

      if (operator.isMarketplaceOperator) {
        return orderOriginType !== 'seller_store' && !hasSellerStoreItems;
      }

      return Boolean(
        (orderOriginType === 'seller_store' && ((orderOwnerUserId && orderOwnerUserId === operator.authUserId) || (orderOwnerLoginId && operator.loginRefs.has(orderOwnerLoginId)))) ||
        itemOwnerMatches
      );
    });

    res.json({ success: true, data: filteredData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar pedido (com sincronização para RS-CDS)
router.post('/v1/marketplace/orders', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    // =====================================================
    // 1) INSERT NA TABELA PRINCIPAL (orders)
    // =====================================================
    const orderData: any = {
      tenant_id: body.tenantId,
      buyer_id: body.buyerId || body.customerId || null,
      buyer_name: body.buyerName || body.customerName || null,
      buyer_email: body.buyerEmail || body.customerEmail || null,
      buyer_phone: body.buyerPhone || body.customerPhone || null,
      buyer_type: body.buyerType || 'cliente',
      items: body.items,
      subtotal: body.subtotal,
      shipping: body.shipping,
      shipping_cost: body.shippingCost ?? body.shipping ?? 0,
      discount: body.discount || 0,
      total: body.total,
      status: body.status || 'pending',
      payment_method: body.paymentMethod,
      payment_status: body.paymentStatus || 'pending',
      shipping_address: body.shippingAddress,
      shipping_method: body.shippingMethod || null,
      notes: body.notes,
      distributor_id: body.distributorId || null,
      referrer_id: body.referrerId || body.referredBy || null,
      referred_by: body.referrerId || body.referredBy || null
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('[MARKETPLACE] Erro ao criar pedido em orders:', orderError.message);
      return res.status(500).json({ success: false, error: orderError.message });
    }

    // =====================================================
    // 2) DUAL INSERT — SINCRONIZAR COM RS-CDS (cd_orders)
    // =====================================================
    const distributorId = body.distributorId;
    if (distributorId && distributorId !== 'cd-oficial-matriz' && distributorId !== 'cd-oficial-matriz-fallback') {
      try {
        // Extrair dados do cliente para cd_orders
        const shippingAddr = body.shippingAddress || {};
        const addressStr = [
          shippingAddr.street,
          shippingAddr.number,
          shippingAddr.complement,
          shippingAddr.neighborhood,
          shippingAddr.city,
          shippingAddr.state,
          shippingAddr.zipCode
        ].filter(Boolean).join(', ');

        const cdOrderData = {
          cd_id: distributorId,
          consultant_name: body.customerName || body.referrerName || 'Cliente Direto',
          consultant_pin: body.referrerId || null,
          sponsor_name: null,
          sponsor_id: null,
          buyer_cpf: body.customerCpf || null,
          buyer_email: body.customerEmail || body.email || null,
          buyer_phone: body.customerPhone || null,
          shipping_address: addressStr || null,
          order_date: new Date().toISOString().split('T')[0],
          order_time: new Date().toTimeString().split(' ')[0],
          total: body.total || 0,
          total_points: 0,
          status: 'PENDENTE',
          type: 'MARKETPLACE',
          items_count: Array.isArray(body.items) ? body.items.length : 0,
          tracking_code: null,
          vehicle_plate: null,
          marketplace_order_id: order.id
        };

        const { data: cdOrder, error: cdOrderError } = await supabase
          .from('cd_orders')
          .insert([cdOrderData])
          .select('id')
          .single();

        if (cdOrderError) {
          console.warn('[MARKETPLACE→CDS] Erro ao inserir cd_orders (não-crítico):', cdOrderError.message);
        } else if (cdOrder && Array.isArray(body.items) && body.items.length > 0) {
          // Inserir itens do pedido em cd_order_items
          const cdItems = body.items.map((item: any) => ({
            cd_order_id: cdOrder.id,
            product_id: item.productId || item.id || 'unknown',
            product_name: item.productName || item.name || 'Produto',
            quantity: item.quantity || 1,
            unit_price: item.price || 0,
            points: 0
          }));

          const { error: itemsError } = await supabase
            .from('cd_order_items')
            .insert(cdItems);

          if (itemsError) {
            console.warn('[MARKETPLACE→CDS] Erro ao inserir cd_order_items (não-crítico):', itemsError.message);
          } else {
            console.log(`[MARKETPLACE→CDS] ✅ Pedido sincronizado com CD ${distributorId} (cd_order_id: ${cdOrder.id})`);
          }
        }
      } catch (syncErr: any) {
        // Sincronização com CDS é não-crítica: pedido principal já foi criado com sucesso
        console.warn('[MARKETPLACE→CDS] Falha na sincronização (não-crítico):', syncErr.message);
      }
    }

    if (PAID_PAYMENT_STATUSES.has(String(order.payment_status || '').toLowerCase())) {
      try {
        await processMarketplacePaidOrder(order);
      } catch (processingError: any) {
        console.warn('[MARKETPLACE] Falha ao processar pedido pago (nao-critico):', processingError?.message || processingError);
      }
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    console.error('[MARKETPLACE] Erro crítico ao criar pedido:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GERAÇÃO DE PIX REAL (MERCADO PAGO)
 * Usado pelo CD (Replenishment) e Marketplace
 */
router.post('/v1/marketplace/pix', async (req: Request, res: Response) => {
  try {
    const { amount, description, payer } = req.body;

    if (!amount || !payer || !payer.email) {
      console.error('[MARKETPLACE→PIX] Dados insuficientes:', req.body);
      return res.status(400).json({ success: false, error: 'Dados insuficientes (amount, payer.email)' });
    }

    // 1) Buscar Token da SEDE (Administrador do Marketplace/Central)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('mercadopago_access_token')
      .eq('nome_completo', 'SEDE RS PRÓLIPSI')
      .maybeSingle();

    if (profileError) {
      console.error('[MARKETPLACE→PIX] Erro ao buscar perfil da SEDE:', profileError);
    }

    // Fallback para env var se não encontrar no banco
    const accessToken = profile?.mercadopago_access_token || process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('[MARKETPLACE→PIX] Erro: Token de acesso MP não configurado.');
      return res.status(500).json({ success: false, error: 'Configuração de pagamento não encontrada no sistema' });
    }

    // 2) Gerar Idempotência (Baseado no valor e timestamp para evitar duplicados em curto prazo)
    const idempotencyKey = `pix-marketplace-${Math.floor(Date.now() / 1000)}`;

    // 3) Chamada Direta à API do Mercado Pago (v1/payments)
    console.log(`[MARKETPLACE→PIX] Gerando pagamento de R$ ${amount} para ${payer.email}...`);

    const mpPayload = {
      transaction_amount: Number(amount),
      description: description || 'Pagamento RS Prólipsi Marketplace',
      payment_method_id: 'pix',
      payer: {
        email: payer.email,
        first_name: payer.name || 'Cliente',
        identification: payer.cpf ? {
          type: 'CPF',
          number: payer.cpf.replace(/[^0-9]/g, '')
        } : undefined
      }
    };

    const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', mpPayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      validateStatus: () => true // Permitir tratar erros manualmente
    });

    if (mpResponse.status >= 400) {
      console.error('[MARKETPLACE→PIX] ❌ Erro Mercado Pago:', mpResponse.data);
      return res.status(mpResponse.status).json({
        success: false,
        error: mpResponse.data.message || 'Erro ao gerar pagamento no Mercado Pago',
        details: mpResponse.data
      });
    }

    const { id, status, point_of_interaction } = mpResponse.data;
    const trx = point_of_interaction?.transaction_data;

    console.log(`[MARKETPLACE→PIX] ✅ PIX Gerado com Sucesso! ID: ${id}`);

    res.json({
      success: true,
      paymentId: id,
      status: status,
      qr_code: trx?.qr_code,
      qr_code_base64: trx?.qr_code_base64,
      ticket_url: trx?.ticket_url
    });

  } catch (err: any) {
    console.error('[MARKETPLACE→PIX] Erro crítico:', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao processar PIX' });
  }
});

// Atualizar status do pedido
router.patch('/v1/marketplace/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({ success: false, error: 'status ou paymentStatus requerido' });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    if (PAID_PAYMENT_STATUSES.has(String(data?.payment_status || paymentStatus || '').toLowerCase())) {
      try {
        await processMarketplacePaidOrder(data);
      } catch (processingError: any) {
        console.warn('[MARKETPLACE] Falha ao processar pedido pago apos update (nao-critico):', processingError?.message || processingError);
      }
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// CUSTOMIZAÇÃO DA LOJA (STOREFRONT)
// =====================================================

router.get('/v1/marketplace/customization', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    let { data, error } = await supabase
      .from('store_customizations')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Not found
      return res.json({ success: true, data: null });
    }
    if (error) return res.status(500).json({ success: false, error: error.message });

    // Map DB fields to camelCase if needed, but for now assuming direct mapping or frontend handles snake_case
    // Actually frontend expects camelCase. I should map it.
    // Or better: Use userProfile / storeCustomization matching.
    // Frontend uses: logoUrl, faviconUrl, etc.
    // DB likely has: logo_url, favicon_url.

    // Extract footer and custom settings stored inside footer JSONB
    const footerRaw = data.footer || {};
    const customSettings = footerRaw.customSettings || {};
    const footerClean = { ...footerRaw };
    delete footerClean.customSettings;

    const mappedData = {
      id: data.id,
      tenantId: data.tenant_id,
      logoUrl: data.logo_url,
      faviconUrl: data.favicon_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      hero: data.hero || { title: '', subtitle: '', desktopImage: '', mobileImage: '', link: '' },
      carouselBanners: data.carousel_banners || [],
      carouselHeight: customSettings.carouselHeight,
      carouselHeightMobile: customSettings.carouselHeightMobile,
      carouselFullWidth: customSettings.carouselFullWidth,
      logoMaxWidth: customSettings.logoMaxWidth,
      faviconMaxWidth: customSettings.faviconMaxWidth,
      storeBackgroundColor: customSettings.storeBackgroundColor,
      orderBump: customSettings.orderBump,
      upsell: customSettings.upsell,
      promotionRequests: customSettings.promotionRequests || [],
      midPageBanner: data.mid_page_banner || { desktopImage: '', mobileImage: '', link: '' },
      footer: footerClean.description !== undefined ? footerClean : { description: '', socialLinks: [], businessAddress: '', contactEmail: '', cnpj: '' },
      homepageSections: data.sections || [],
      customCss: data.custom_css
    };

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/marketplace/customization', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    // Store extra layout settings inside footer.customSettings (avoids new DB columns)
    const customSettings: any = {};
    if (body.carouselHeight !== undefined) customSettings.carouselHeight = body.carouselHeight;
    if (body.carouselHeightMobile !== undefined) customSettings.carouselHeightMobile = body.carouselHeightMobile;
    if (body.carouselFullWidth !== undefined) customSettings.carouselFullWidth = body.carouselFullWidth;
    if (body.logoMaxWidth !== undefined) customSettings.logoMaxWidth = body.logoMaxWidth;
    if (body.faviconMaxWidth !== undefined) customSettings.faviconMaxWidth = body.faviconMaxWidth;
    if (body.storeBackgroundColor !== undefined) customSettings.storeBackgroundColor = body.storeBackgroundColor;
    if (body.orderBump !== undefined) customSettings.orderBump = body.orderBump;
    if (body.upsell !== undefined) customSettings.upsell = body.upsell;
    if (body.promotionRequests !== undefined) customSettings.promotionRequests = body.promotionRequests;

    const footerPayload = body.footer
      ? { ...body.footer, customSettings: Object.keys(customSettings).length ? customSettings : undefined }
      : (Object.keys(customSettings).length ? { customSettings } : undefined);

    const dbData: any = {
      tenant_id: body.tenantId,
      logo_url: body.logoUrl,
      favicon_url: body.faviconUrl,
      primary_color: body.primaryColor,
      secondary_color: body.secondaryColor,
      hero: body.hero,
      carousel_banners: body.carouselBanners,
      mid_page_banner: body.midPageBanner,
      footer: footerPayload,
      sections: body.homepageSections,
      custom_css: body.customCss,
      updated_at: new Date().toISOString()
    };

    // Remove undefined keys to avoid overwriting existing data
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    const { data, error } = await supabase
      .from('store_customizations')
      .upsert(dbData, { onConflict: 'tenant_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, message: 'Customização salva com sucesso' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPLOAD DE ASSETS
router.post('/v1/marketplace/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    const { type } = req.body;

    if (!file) return res.status(400).json({ success: false, error: 'Arquivo requerido' });

    const filename = `${type || 'misc'}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    // Ensure bucket exists or just try upload
    const bucketName = 'marketplace-assets';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      // If bucket not found, maybe try to create it? (Requires admin key)
      // But for now, report error.
      return res.status(500).json({ success: false, error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Upload Endpoint Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * CONSULTA STATUS DE PAGAMENTO PIX (MERCADO PAGO)
 */
router.get('/v1/marketplace/pix/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1) Buscar Token da SEDE
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('mercadopago_access_token')
      .eq('nome_completo', 'SEDE RS PRÓLIPSI')
      .maybeSingle();

    const accessToken = profile?.mercadopago_access_token || process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ success: false, error: 'Configuração de pagamento não encontrada' });
    }

    // 2) Consultar API do Mercado Pago
    console.log(`[MARKETPLACE→PIX] Consultando status do pagamento ${id}...`);

    const mpResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      validateStatus: () => true
    });

    if (mpResponse.status >= 400) {
      console.error('[MARKETPLACE→PIX] ❌ Erro ao consultar Mercado Pago:', mpResponse.data);
      return res.status(mpResponse.status).json({
        success: false,
        error: 'Erro ao consultar status no Mercado Pago'
      });
    }

    const { status, status_detail } = mpResponse.data;
    console.log(`[MARKETPLACE→PIX] Status do pagamento ${id}: ${status} (${status_detail})`);

    res.json({
      success: true,
      status: status, // approved, pending, in_process, rejected, cancelled, etc.
      statusDetail: status_detail,
      isPaid: status === 'approved'
    });

  } catch (err: any) {
    console.error('[MARKETPLACE→PIX] Erro crítico na consulta:', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao consultar PIX' });
  }
});

export default router;
// trigger restart
