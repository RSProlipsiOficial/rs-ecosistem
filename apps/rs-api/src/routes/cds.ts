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

const pickPrimaryCd = (items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const normalized = items.filter(Boolean);
  const explicitFederalSede = normalized.find((item) => Boolean(item?.is_federal_sede));
  if (explicitFederalSede) return explicitFederalSede;

  const consultantIdMatch = normalized.find((item) =>
    String(item?.consultant_id || item?.managerId || item?.manager_id || '').trim().toLowerCase() === DEFAULT_CENTRAL_MARKETPLACE_REF
  );
  if (consultantIdMatch) return consultantIdMatch;

  const slugMatch = normalized.find((item) =>
    String(item?.slug || '').trim().toLowerCase() === DEFAULT_CENTRAL_MARKETPLACE_REF
  );
  if (slugMatch) return slugMatch;

  const sedeByName = normalized.find((item) => {
    const name = String(item?.name || item?.manager_name || '').trim().toLowerCase();
    return name.includes('sede rs prólipsi') || name.includes('sede rs prolipsi');
  });
  if (sedeByName) return sedeByName;

  return normalized[0] || null;
};

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const normalizeLookupKey = (value?: string | null) => String(value || '').trim().toLowerCase();
const normalizeLookupLooseKey = (value?: string | null) =>
  normalizeLookupKey(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const resolveCdId = async (rawId: string) => {
  if (isUuid(rawId)) return rawId;
  const { data: profile } = await supabaseAdmin
    .from('minisite_profiles')
    .select('id')
    .or(`consultant_id.eq.${rawId},email.eq.${rawId},slug.eq.${rawId}`)
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

  const { data: allProducts } = await supabaseAdmin
    .from('products')
    .select('id, name, sku')
    .limit(5000);

  const skuKey = normalizeLookupKey(sku);
  const skuLooseKey = normalizeLookupLooseKey(sku);
  const nameKey = normalizeLookupKey(name);
  const nameLooseKey = normalizeLookupLooseKey(name);

  const looseMatch = (allProducts || []).find((product: any) => {
    const productSkuKey = normalizeLookupKey(product?.sku);
    const productSkuLooseKey = normalizeLookupLooseKey(product?.sku);
    const productNameKey = normalizeLookupKey(product?.name);
    const productNameLooseKey = normalizeLookupLooseKey(product?.name);

    return Boolean(
      (skuKey && productSkuKey === skuKey) ||
      (skuLooseKey && productSkuLooseKey === skuLooseKey) ||
      (nameKey && productNameKey === nameKey) ||
      (nameLooseKey && productNameLooseKey === nameLooseKey)
    );
  });

  if (looseMatch?.id) return String(looseMatch.id);

  return null;
};

const resolveCatalogProductSnapshotFromCdRow = async (cdRow: any) => {
  const directProductId = String(cdRow?.product_id || '').trim();
  if (directProductId && isUuid(directProductId)) {
    const { data: productById } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, category, price, pv_points, image_url, images')
      .eq('id', directProductId)
      .maybeSingle();
    if (productById?.id) return productById;
  }

  const sku = String(cdRow?.sku || '').trim();
  const name = String(cdRow?.name || '').trim();
  const skuKey = normalizeLookupKey(sku);
  const skuLooseKey = normalizeLookupLooseKey(sku);
  const nameKey = normalizeLookupKey(name);
  const nameLooseKey = normalizeLookupLooseKey(name);

  if (sku) {
    const { data: productBySku } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, category, price, pv_points, image_url, images')
      .eq('sku', sku)
      .maybeSingle();
    if (productBySku?.id) return productBySku;
  }

  if (name) {
    const { data: productByName } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, category, price, pv_points, image_url, images')
      .ilike('name', name)
      .maybeSingle();
    if (productByName?.id) return productByName;
  }

  const { data: allProducts } = await supabaseAdmin
    .from('products')
    .select('id, name, sku, category, price, pv_points, image_url, images')
    .limit(5000);

  const looseMatch = (allProducts || []).find((product: any) => {
    const productSkuKey = normalizeLookupKey(product?.sku);
    const productSkuLooseKey = normalizeLookupLooseKey(product?.sku);
    const productNameKey = normalizeLookupKey(product?.name);
    const productNameLooseKey = normalizeLookupLooseKey(product?.name);

    return Boolean(
      (skuKey && productSkuKey === skuKey) ||
      (skuLooseKey && productSkuLooseKey === skuLooseKey) ||
      (nameKey && productNameKey === nameKey) ||
      (nameLooseKey && productNameLooseKey === nameLooseKey)
    );
  });

  return looseMatch || null;
};

const matchesCdRowToCatalog = (row: any, catalogProduct: any, looseNames: string[] = []) => {
  if (!row || !catalogProduct) return false;

  const catalogSkuLoose = normalizeLookupLooseKey(catalogProduct?.sku);
  const catalogNameLoose = normalizeLookupLooseKey(catalogProduct?.name);
  const rowSkuLoose = normalizeLookupLooseKey(row?.sku);
  const rowNameLoose = normalizeLookupLooseKey(row?.name);

  if (catalogSkuLoose && rowSkuLoose && catalogSkuLoose === rowSkuLoose) return true;
  if (catalogNameLoose && rowNameLoose && catalogNameLoose === rowNameLoose) return true;

  return looseNames.some((value) => {
    const loose = normalizeLookupLooseKey(value);
    return Boolean(loose && (loose === rowSkuLoose || loose === rowNameLoose));
  });
};

const mapDbOrderStatusToDropStatus = (status?: string | null) => {
  const normalized = String(status || '').trim().toUpperCase();
  switch (normalized) {
    case 'PENDING':
    case 'PENDENTE':
    case 'NEW':
      return 'New';
    case 'PACKING':
    case 'SEPARACAO':
    case 'SEPARAÇÃO':
      return 'Packing';
    case 'SHIPPED':
    case 'EM_TRANSPORTE':
      return 'Shipped';
    case 'DELIVERED':
    case 'CONCLUIDO':
    case 'CONCLUÍDO':
      return 'Delivered';
    case 'RETURNED':
    case 'DEVOLVIDO':
      return 'Returned';
    case 'REFUNDED':
    case 'REEMBOLSADO':
      return 'Refunded';
    default:
      return 'New';
  }
};

const mapDropStatusToDbStatus = (status?: string | null) => {
  const normalized = String(status || '').trim();
  switch (normalized) {
    case 'New':
      return 'NEW';
    case 'Packing':
      return 'PACKING';
    case 'Shipped':
      return 'SHIPPED';
    case 'Delivered':
      return 'DELIVERED';
    case 'Returned':
      return 'RETURNED';
    case 'Refunded':
      return 'REFUNDED';
    default:
      return 'NEW';
  }
};

const buildShippingAddressText = (source: any) =>
  [
    source?.shipping_street || source?.address_street,
    source?.shipping_number || source?.address_number,
    source?.shipping_complement || source?.address_complement,
    source?.shipping_neighborhood || source?.address_neighborhood,
    source?.shipping_city || source?.address_city,
    source?.shipping_state || source?.address_state,
    source?.shipping_zip_code || source?.address_zip_code,
  ]
    .filter(Boolean)
    .join(', ');

const parseMissingSchemaColumn = (message?: string | null) => {
  const normalized = String(message || '');
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column\s+["']?[\w.]+["']?\."?([\w_]+)"?\s+does not exist/i,
    /column\s+"?([\w_]+)"?\s+does not exist/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const omitColumnFromPayload = (payload: any, column: string): any => {
  if (Array.isArray(payload)) {
    return payload.map((item) => omitColumnFromPayload(item, column));
  }

  if (!payload || typeof payload !== 'object') return payload;

  const next = { ...payload };
  delete next[column];
  return next;
};

const payloadHasColumn = (payload: any, column: string): boolean => {
  if (Array.isArray(payload)) {
    return payload.some((item) => payloadHasColumn(item, column));
  }

  if (!payload || typeof payload !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(payload, column);
};

const executeWithSchemaFallback = async <T>(
  initialPayload: any,
  runner: (payload: any) => Promise<{ data: T; error: any }>
) => {
  let payload = initialPayload;
  let attempts = 0;

  while (attempts < 12) {
    const result = await runner(payload);
    if (!result.error) {
      return { data: result.data, payload };
    }

    const missingColumn = parseMissingSchemaColumn(result.error?.message);
    if (!missingColumn || !payloadHasColumn(payload, missingColumn)) {
      throw result.error;
    }

    payload = omitColumnFromPayload(payload, missingColumn);
    attempts += 1;
  }

  throw new Error('Nao foi possivel ajustar o payload ao schema atual do Supabase.');
};

const safeMaybeSingleByColumn = async (
  table: string,
  column: string,
  value: string,
  extraFilters: Array<{ column: string; value: string }> = []
) => {
  let query = supabaseAdmin.from(table).select('*');

  for (const filter of extraFilters) {
    query = query.eq(filter.column, filter.value);
  }

  const { data, error } = await query.eq(column, value).maybeSingle();
  if (error) {
    const missingColumn = parseMissingSchemaColumn(error.message);
    if (missingColumn === column) {
      return null;
    }
    throw error;
  }

  return data;
};

const CD_SUPPLIERS_CONFIG_PREFIX = 'rs_drop_suppliers:';
const CD_PRODUCT_META_CONFIG_PREFIX = 'rs_drop_product_meta:';
const CD_PRODUCT_PAGE_TEMPLATES_CONFIG_PREFIX = 'rs_drop_product_page_templates:';
const CD_EXPERIMENTS_CONFIG_PREFIX = 'rs_drop_experiments:';
const CD_EXPERIMENT_DATA_CONFIG_PREFIX = 'rs_drop_experiment_data:';
const CD_SUBSCRIPTIONS_CONFIG_PREFIX = 'rs_drop_subscriptions:';

const getJsonAppConfig = async <T>(key: string, fallback: T): Promise<T> => {
  const { data, error } = await supabaseAdmin
    .from('app_configs')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.warn(`[CDS] Falha ao ler app_config ${key}:`, error.message);
    return fallback;
  }

  if (data?.value === null || data?.value === undefined) {
    return fallback;
  }

  return data.value as T;
};

const saveJsonAppConfig = async (key: string, value: any) => {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('app_configs')
    .select('key')
    .eq('key', key)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing?.key) {
    const { error } = await supabaseAdmin
      .from('app_configs')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) throw error;
    return;
  }

  const { error } = await supabaseAdmin
    .from('app_configs')
    .insert([{ key, value }]);

  if (error) throw error;
};

const getCdSuppliersConfigKey = (cdId: string) => `${CD_SUPPLIERS_CONFIG_PREFIX}${cdId}`;
const getCdProductMetaConfigKey = (cdId: string) => `${CD_PRODUCT_META_CONFIG_PREFIX}${cdId}`;
const getCdProductPageTemplatesConfigKey = (cdId: string) => `${CD_PRODUCT_PAGE_TEMPLATES_CONFIG_PREFIX}${cdId}`;
const getCdExperimentsConfigKey = (cdId: string) => `${CD_EXPERIMENTS_CONFIG_PREFIX}${cdId}`;
const getCdExperimentDataConfigKey = (cdId: string) => `${CD_EXPERIMENT_DATA_CONFIG_PREFIX}${cdId}`;
const getCdSubscriptionsConfigKey = (cdId: string) => `${CD_SUBSCRIPTIONS_CONFIG_PREFIX}${cdId}`;

const normalizeSubscriptionStatus = (value?: string | null) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['active', 'paused', 'cancelled', 'past_due', 'unpaid'].includes(normalized)) {
    return normalized;
  }
  return 'active';
};

const normalizeSubscriptionInterval = (value?: string | null) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['monthly', 'quarterly', 'yearly'].includes(normalized)) {
    return normalized;
  }
  return 'monthly';
};

const normalizeSubscriptionRecord = (record: any, cdId: string) => ({
  id: String(record?.id || crypto.randomUUID()),
  userId: String(record?.userId || cdId),
  customerId: String(record?.customerId || ''),
  customerName: String(record?.customerName || ''),
  productId: String(record?.productId || ''),
  productName: String(record?.productName || ''),
  status: normalizeSubscriptionStatus(record?.status),
  interval: normalizeSubscriptionInterval(record?.interval),
  price: Number(record?.price || 0),
  startDate: String(record?.startDate || new Date().toISOString().slice(0, 10)),
  nextBillingDate: String(record?.nextBillingDate || new Date().toISOString().slice(0, 10)),
  gatewayId: String(record?.gatewayId || '').trim() || undefined,
  gatewayStatus: String(record?.gatewayStatus || '').trim() || undefined,
  paymentMethodToken: String(record?.paymentMethodToken || '').trim() || undefined,
  failureReason: String(record?.failureReason || '').trim() || undefined,
});

const mapCatalogProductToDropGlobal = (row: any) => {
  const specifications = row?.specifications && typeof row.specifications === 'object' ? row.specifications : {};
  return {
    id: String(row?.id || ''),
    name: String(row?.name || 'Produto'),
    description: String(row?.short_description || row?.description || specifications?.catalogDescription || ''),
    imageUrl: String(
      row?.featured_image ||
      row?.image_url ||
      (Array.isArray(row?.images) ? row.images[0] : '') ||
      ''
    ).trim() || undefined,
    videoUrl: String(specifications?.videoUrl || '').trim() || undefined,
    sku: String(row?.sku || '').trim(),
    category: String(row?.category || '').trim() || undefined,
    points: Number(row?.pv_points || 0),
    stockLevel: Number(row?.stock_quantity || 0),
    memberPrice: Number(row?.member_price || specifications?.minAllowedPrice || 0),
    suggestedPrice: Number(row?.price) || 0,
    minAllowedPrice: Number(row?.member_price || specifications?.minAllowedPrice || 0),
    maxAllowedPrice: Number(specifications?.maxAllowedPrice || row?.price || 0),
    defaultCommissionPercent: Number(specifications?.defaultCommissionPercent || 0),
    isActive: row?.is_active !== false && row?.published !== false,
  };
};

const normalizeProductPageTemplateRecord = (template: any) => ({
  id: String(template?.id || crypto.randomUUID()),
  name: String(template?.name || '').trim() || 'Template',
  layout: template?.layout && typeof template.layout === 'object'
    ? template.layout
    : { mainLayout: 'image-left', blocks: [{ type: 'description' }] },
});

const normalizeExperimentRecord = (experiment: any, fallbackUserId: string) => ({
  id: String(experiment?.id || crypto.randomUUID()),
  userId: String(experiment?.userId || fallbackUserId || ''),
  name: String(experiment?.name || '').trim() || 'Teste A/B',
  productId: String(experiment?.productId || '').trim(),
  status: ['running', 'paused', 'completed'].includes(String(experiment?.status))
    ? String(experiment.status)
    : 'running',
  type: ['price', 'headline', 'page_layout'].includes(String(experiment?.type))
    ? String(experiment.type)
    : 'price',
  variations: Array.isArray(experiment?.variations) && experiment.variations.length === 2
    ? experiment.variations.map((variation: any, index: number) => ({
        id: index === 0 ? 'A' : 'B',
        name: String(variation?.name || (index === 0 ? 'Controle' : 'Variação B')),
        split: Number(variation?.split) || 50,
        value: typeof variation?.value === 'number' ? Number(variation.value) : String(variation?.value || ''),
      }))
    : [
        { id: 'A', name: 'Controle', split: 50, value: '' },
        { id: 'B', name: 'Variação B', split: 50, value: '' },
      ],
  winnerVariationId: ['A', 'B'].includes(String(experiment?.winnerVariationId))
    ? String(experiment.winnerVariationId)
    : undefined,
  createdAt: String(experiment?.createdAt || new Date().toISOString()),
  completedAt: experiment?.completedAt ? String(experiment.completedAt) : undefined,
});

const normalizeExperimentDataRecord = (point: any) => ({
  id: String(point?.id || crypto.randomUUID()),
  experimentId: String(point?.experimentId || '').trim(),
  variationId: String(point?.variationId || 'A') === 'B' ? 'B' : 'A',
  sessionId: String(point?.sessionId || '').trim() || crypto.randomUUID(),
  eventType: String(point?.eventType || 'visit') === 'conversion' ? 'conversion' : 'visit',
  revenue: point?.revenue === undefined ? undefined : Number(point.revenue) || 0,
  timestamp: String(point?.timestamp || new Date().toISOString()),
});

const normalizeCdSupplierRecord = (supplier: any, fallbackUserId: string) => ({
  id: String(supplier?.id || crypto.randomUUID()),
  name: String(supplier?.name || '').trim(),
  contactPerson: String(supplier?.contactPerson || supplier?.contact_person || '').trim(),
  phone: String(supplier?.phone || '').trim(),
  email: String(supplier?.email || '').trim(),
  userId: String(supplier?.userId || supplier?.user_id || fallbackUserId || ''),
  marketplaceLoginId: String(supplier?.marketplaceLoginId || supplier?.marketplace_login_id || '').trim() || undefined,
  marketplaceUserId: String(supplier?.marketplaceUserId || supplier?.marketplace_user_id || '').trim() || undefined,
  sourceType: String(supplier?.sourceType || supplier?.source_type || '').trim().toLowerCase() === 'marketplace' ? 'marketplace' : 'manual',
  linkedProductCount: Number(supplier?.linkedProductCount || supplier?.linked_product_count || 0),
  logoUrl: String(supplier?.logoUrl || supplier?.logo_url || '').trim() || undefined,
});

const isSubscriptionLikeMarketplaceProduct = (row: any) => {
  const specifications = row?.specifications && typeof row.specifications === 'object' ? row.specifications : {};
  const haystack = [
    row?.category,
    row?.name,
    specifications?.productType,
    specifications?.category,
    specifications?.subcategory,
    specifications?.affiliateModel,
    specifications?.commissionOrigin,
  ]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)
    .join(' ');

  if (!haystack) return false;

  return [
    'assinatura',
    'subscription',
    'plano',
    'digital',
    'servico',
    'serviço',
    'minisite',
    'mini site',
    'wallet',
  ].some((token) => haystack.includes(token));
};

const mapMarketplaceProductToDropSubscriptionProduct = (row: any, userId: string) => ({
  id: String(row?.id || ''),
  name: String(row?.name || 'Plano'),
  sku: String(row?.sku || '').trim() || undefined,
  category: String(row?.category || 'Assinaturas'),
  salePrice: Number(row?.member_price || row?.price || 0),
  shippingCost: 0,
  shippingCharged: 0,
  gatewayFeeRate: 0,
  currentStock: Number(row?.stock_quantity || 0),
  minStock: 0,
  status: row?.is_active === false || row?.published === false ? 'Inactive' : 'Active',
  userId,
  visibility: ['loja', 'marketplace'],
});

const loadMarketplaceSupplierCandidates = async () => {
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name, featured_image, images, specifications, published, is_active')
    .eq('published', true)
    .eq('is_active', true)
    .limit(5000);

  if (error) throw error;

  const candidateMap = new Map<string, any>();
  const ownerLoginIds = new Set<string>();

  for (const product of products || []) {
    const specifications = product?.specifications && typeof product.specifications === 'object' ? product.specifications : {};
    const ownerLoginId = String(specifications?.ownerLoginId || specifications?.fulfillmentOriginName || '').trim().toLowerCase();
    const ownerUserId = String(specifications?.ownerUserId || specifications?.fulfillmentOriginId || '').trim();
    const isRSProduct = Boolean(specifications?.isRSProduct) || String(specifications?.ownerType || '').trim().toUpperCase() === 'RS';
    const supplierName = String(specifications?.supplier || '').trim();
    const inferredLogin = isRSProduct ? DEFAULT_CENTRAL_MARKETPLACE_REF : ownerLoginId;
    const inferredName = supplierName || (isRSProduct ? 'SEDE RS PRÓLIPSI' : ownerLoginId || 'Fornecedor');
    const candidateKey = normalizeLookupLooseKey(ownerUserId || inferredLogin || inferredName);

    if (!candidateKey) continue;
    if (inferredLogin) ownerLoginIds.add(inferredLogin);

    const current = candidateMap.get(candidateKey) || {
      id: ownerUserId || inferredLogin || crypto.randomUUID(),
      name: inferredName,
      contactPerson: '',
      phone: '',
      email: '',
      userId: ownerUserId || inferredLogin || '',
      marketplaceLoginId: inferredLogin || undefined,
      marketplaceUserId: ownerUserId || undefined,
      sourceType: 'marketplace',
      linkedProductCount: 0,
      logoUrl:
        String(product?.featured_image || '').trim() ||
        (Array.isArray(product?.images) && product.images[0] ? String(product.images[0]).trim() : '') ||
        undefined,
    };

    current.linkedProductCount += 1;
    if (!current.logoUrl) {
      current.logoUrl =
        String(product?.featured_image || '').trim() ||
        (Array.isArray(product?.images) && product.images[0] ? String(product.images[0]).trim() : '') ||
        undefined;
    }

    candidateMap.set(candidateKey, current);
  }

  if (ownerLoginIds.size > 0) {
    const loginIds = Array.from(ownerLoginIds);
    const { data: consultants } = await supabaseAdmin
      .from('consultores')
      .select('id, user_id, username, nome, email, whatsapp')
      .in('username', loginIds);

    for (const consultant of consultants || []) {
      const candidateKey = normalizeLookupLooseKey(consultant?.username);
      const candidate = candidateMap.get(candidateKey);
      if (!candidate) continue;
      candidate.name = String(consultant?.nome || candidate.name || '').trim() || candidate.name;
      candidate.contactPerson = String(consultant?.nome || candidate.contactPerson || '').trim();
      candidate.phone = String(consultant?.whatsapp || candidate.phone || '').trim();
      candidate.email = String(consultant?.email || candidate.email || '').trim();
      candidate.marketplaceUserId = String(consultant?.user_id || candidate.marketplaceUserId || '').trim() || candidate.marketplaceUserId;
      candidate.userId = String(consultant?.user_id || candidate.userId || '').trim() || candidate.userId;
      candidateMap.set(candidateKey, candidate);
    }
  }

  return Array.from(candidateMap.values()).sort((a, b) =>
    String(a?.name || '').localeCompare(String(b?.name || ''), 'pt-BR')
  );
};

const normalizeCdProductMetaRecord = (product: any, supplierLinks?: any[]) => {
  const visibility = Array.isArray(product?.visibility)
    ? product.visibility.filter((channel: string) => channel === 'loja' || channel === 'marketplace')
    : [];

  const normalizedSupplierLinks = Array.isArray(supplierLinks)
    ? supplierLinks
        .filter((link) => link?.supplierId)
        .map((link) => ({
          productId: String(link.productId || ''),
          supplierId: String(link.supplierId || ''),
          costPrice: Number(link.costPrice) || 0,
          leadTimeDays: Number(link.leadTimeDays) || 0,
          isDefault: Boolean(link.isDefault),
        }))
    : Array.isArray(product?.supplierLinks)
      ? product.supplierLinks
          .filter((link: any) => link?.supplierId)
          .map((link: any) => ({
            productId: String(link.productId || ''),
            supplierId: String(link.supplierId || ''),
            costPrice: Number(link.costPrice) || 0,
            leadTimeDays: Number(link.leadTimeDays) || 0,
            isDefault: Boolean(link.isDefault),
          }))
      : [];

  return {
    status: product?.status === 'Inactive' ? 'Inactive' : 'Active',
    shippingCost: Number(product?.shippingCost) || 0,
    shippingCharged: Number(product?.shippingCharged) || 0,
    gatewayFeeRate: Number(product?.gatewayFeeRate) || 0,
    productType: product?.productType === 'bundle' ? 'bundle' : 'simple',
    bundleConfig: product?.bundleConfig && typeof product.bundleConfig === 'object'
      ? product.bundleConfig
      : { items: [], pricing: { type: 'fixed_price', value: 0 } },
    weightKg: Number(product?.weightKg) || 0,
    dimensions: {
      lengthCm: Number(product?.dimensions?.lengthCm) || 0,
      widthCm: Number(product?.dimensions?.widthCm) || 0,
      heightCm: Number(product?.dimensions?.heightCm) || 0,
    },
    variants: Array.isArray(product?.variants)
      ? product.variants.map((variant: any) => ({
          id: String(variant?.id || crypto.randomUUID()),
          name: String(variant?.name || ''),
          sku: String(variant?.sku || ''),
          price: Number(variant?.price) || 0,
          costPrice: Number(variant?.costPrice) || 0,
          stock: Number(variant?.stock) || 0,
          minStock: Number(variant?.minStock) || 0,
        }))
      : [],
    pageLayout: product?.pageLayout && typeof product.pageLayout === 'object'
      ? product.pageLayout
      : { mainLayout: 'image-left', blocks: [{ type: 'description' }] },
    affiliateCommissionPercent: Number(product?.affiliateCommissionPercent) || 0,
    visibility: visibility.length > 0 ? visibility : ['loja', 'marketplace'],
    supplierLinks: normalizedSupplierLinks,
  };
};

const mapCdProductToDropProduct = async (
  cdLookupKey: string,
  row: any,
  metadataMap: Record<string, any>
) => {
  const catalogProduct = await resolveCatalogProductSnapshotFromCdRow(row);
  const metadata = normalizeCdProductMetaRecord(metadataMap[String(row?.id || '')] || {});

  const product = {
    id: String(row?.id || ''),
    globalProductId: String(row?.product_id || catalogProduct?.id || '').trim() || undefined,
    name: String(catalogProduct?.name || row?.name || 'Produto'),
    sku: String(catalogProduct?.sku || row?.sku || '').trim() || undefined,
    category: String(catalogProduct?.category || row?.category || 'Geral'),
    salePrice: Number(row?.price || catalogProduct?.price || 0),
    shippingCost: Number(metadata.shippingCost) || 0,
    shippingCharged: Number(metadata.shippingCharged) || 0,
    gatewayFeeRate: Number(metadata.gatewayFeeRate) || 0,
    currentStock: Math.max(0, Number(row?.stock_level || 0)),
    minStock: Math.max(0, Number(row?.min_stock || 0)),
    status: metadata.status === 'Inactive' ? 'Inactive' : 'Active',
    productType: metadata.productType === 'bundle' ? 'bundle' : 'simple',
    bundleConfig: metadata.bundleConfig,
    weightKg: Number(metadata.weightKg) || 0,
    dimensions: metadata.dimensions,
    variants: Array.isArray(metadata.variants) ? metadata.variants : [],
    userId: cdLookupKey,
    pageLayout: metadata.pageLayout,
    affiliateCommissionPercent: Number(metadata.affiliateCommissionPercent) || 0,
    visibility: Array.isArray(metadata.visibility) && metadata.visibility.length > 0
      ? metadata.visibility
      : ['loja', 'marketplace'],
  };

  const productSuppliers = Array.isArray(metadata.supplierLinks)
    ? metadata.supplierLinks.map((link: any) => ({
        ...link,
        productId: String(row?.id || ''),
      }))
    : [];

  return { product, productSuppliers };
};

const mapCdCustomerToDrop = (row: any) => ({
  id: String(row?.id || ''),
  name: String(row?.name || 'Cliente'),
  email: String(row?.email || ''),
  phone: String(row?.phone || ''),
  document: String(row?.document || ''),
  address: {
    street: String(row?.address_street || ''),
    number: String(row?.address_number || ''),
    complement: String(row?.address_complement || ''),
    neighborhood: String(row?.address_neighborhood || ''),
    city: String(row?.address_city || ''),
    state: String(row?.address_state || ''),
    zipCode: String(row?.address_zip_code || ''),
  },
  notes: String(row?.notes || ''),
  userId: String(row?.user_id || row?.cd_id || ''),
  consents: {
    transactional: row?.transactional_consent !== false,
    marketing: Boolean(row?.marketing_consent),
  },
});

const mapCdOrderToDrop = (order: any) => {
  const items = (order?.items || []).map((item: any) => ({
    id: String(item?.id || ''),
    productId: String(item?.product_id || ''),
    supplierId: String(item?.supplier_id || ''),
    productName: String(item?.product_name || 'Produto'),
    quantity: Number(item?.quantity) || 0,
    unitPrice: Number(item?.unit_price) || 0,
    unitCost: Number(item?.unit_cost) || 0,
    discount: Number(item?.discount) || 0,
  }));

  return {
    id: String(order?.id || ''),
    date: String(order?.order_date || order?.created_at || '').slice(0, 10),
    customerId: String(order?.customer_id || ''),
    customerName: String(order?.consultant_name || 'Cliente'),
    customerDocument: String(order?.customer_document || order?.buyer_cpf || ''),
    customerEmail: String(order?.customer_email || order?.buyer_email || ''),
    customerPhone: String(order?.customer_phone || order?.buyer_phone || ''),
    shippingAddress: String(order?.shipping_address || ''),
    items,
    itemsTotal:
      Number(order?.items_total) ||
      items.reduce((total: number, item: any) => total + (Number(item.unitPrice) * Number(item.quantity)), 0),
    discountTotal: Number(order?.discount_total) || 0,
    shippingCost: Number(order?.shipping_cost) || 0,
    shippingCharged: Number(order?.shipping_charged) || 0,
    paymentMethod: String(order?.payment_method || ''),
    paymentFee: Number(order?.payment_fee) || 0,
    platformFee: Number(order?.platform_fee) || 0,
    otherExpenses: Number(order?.other_expenses) || 0,
    status: mapDbOrderStatusToDropStatus(order?.status),
    trackingCode: String(order?.tracking_code || ''),
    shippingMethod: String(order?.shipping_method || ''),
    shippingDate: order?.shipping_date || '',
    estimatedDeliveryDate: order?.estimated_delivery_date || '',
    actualDeliveryDate: order?.actual_delivery_date || '',
    salesChannel: String(order?.sales_channel || ''),
    campaign: String(order?.campaign || ''),
    shippingLabelUrl: String(order?.shipping_label_url || ''),
    fulfillmentCenterId: String(order?.fulfillment_center_id || ''),
    utmSource: String(order?.utm_source || ''),
    utmMedium: String(order?.utm_medium || ''),
    utmCampaign: String(order?.utm_campaign || ''),
    utmContent: String(order?.utm_content || ''),
    utmTerm: String(order?.utm_term || ''),
    notes: String(order?.notes || ''),
    postSaleEvents: [],
    userId: String(order?.cd_id || ''),
    affiliateId: order?.affiliate_id ? String(order.affiliate_id) : undefined,
    affiliateCommission: Number(order?.affiliate_commission) || undefined,
    commissionPaid: typeof order?.commission_paid === 'boolean' ? order.commission_paid : undefined,
  };
};

const resolveCdSaleType = (order: any): 'RETIRADA' | 'ENTREGA' => {
  const rawType = String(order?.type || '').trim().toUpperCase();
  if (rawType === 'RETIRADA' || rawType === 'ENTREGA') return rawType;

  const shippingMethod = String(order?.shipping_method || '').trim();
  const shippingAddress = String(order?.shipping_address || '').trim();
  const combined = `${shippingMethod} ${shippingAddress}`.toLowerCase();

  if (combined.includes('retirada') || combined.includes('pickup')) return 'RETIRADA';
  return 'ENTREGA';
};

const upsertCdCustomer = async (cdId: string, customer: any, fallbackUserId?: string) => {
  if (!customer || !customer.name) return null;

  const normalizedDocument = String(customer.document || '').trim();
  const normalizedEmail = String(customer.email || '').trim().toLowerCase();
  const normalizedPhone = String(customer.phone || '').trim();

  let existing: any = null;

  if (customer.id && isUuid(String(customer.id))) {
    const { data } = await supabaseAdmin
      .from('cd_customers')
      .select('*')
      .eq('cd_id', cdId)
      .eq('id', customer.id)
      .maybeSingle();
    existing = data;
  }

  if (!existing && normalizedDocument) {
    existing = await safeMaybeSingleByColumn('cd_customers', 'document', normalizedDocument, [{ column: 'cd_id', value: cdId }]);
  }

  if (!existing && normalizedEmail) {
    const { data } = await supabaseAdmin
      .from('cd_customers')
      .select('*')
      .eq('cd_id', cdId)
      .eq('email', normalizedEmail)
      .maybeSingle();
    existing = data;
  }

  if (!existing && normalizedPhone) {
    const { data } = await supabaseAdmin
      .from('cd_customers')
      .select('*')
      .eq('cd_id', cdId)
      .eq('phone', normalizedPhone)
      .maybeSingle();
    existing = data;
  }

  const payload = {
    cd_id: cdId,
    name: customer.name,
    email: normalizedEmail || null,
    phone: normalizedPhone || null,
    document: normalizedDocument || null,
    notes: customer.notes || null,
    user_id: fallbackUserId || null,
    address_street: customer.address?.street || null,
    address_number: customer.address?.number || null,
    address_complement: customer.address?.complement || null,
    address_neighborhood: customer.address?.neighborhood || null,
    address_city: customer.address?.city || null,
    address_state: customer.address?.state || null,
    address_zip_code: customer.address?.zipCode || null,
    marketing_consent: Boolean(customer.consents?.marketing),
    transactional_consent: customer.consents?.transactional !== false,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data } = await executeWithSchemaFallback(payload, (sanitizedPayload) =>
      supabaseAdmin
        .from('cd_customers')
        .update(sanitizedPayload)
        .eq('id', existing.id)
        .select()
        .single()
    );
    return data;
  }

  const insertPayload = {
    ...payload,
    created_at: new Date().toISOString(),
    last_purchase_date: new Date().toISOString().slice(0, 10),
    total_spent: 0,
    orders_count: 0,
    status: 'ATIVO',
  };

  const { data } = await executeWithSchemaFallback(insertPayload, (sanitizedPayload) =>
    supabaseAdmin
      .from('cd_customers')
      .insert(sanitizedPayload)
      .select()
      .single()
  );

  return data;
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

const adjustCdInventoryForItems = async (payload: {
  cdId: string;
  orderId: string;
  items: Array<{ product_id: string; quantity: number; product_name?: string }>;
  mode: 'reserve' | 'restore';
  createdBy?: string | null;
}) => {
  const factor = payload.mode === 'reserve' ? -1 : 1;
  const movementType = payload.mode === 'reserve' ? 'OUT' : 'IN';
  const reason = payload.mode === 'reserve' ? 'PEDIDO_LOJA' : 'ESTORNO_PEDIDO_LOJA';

  for (const item of payload.items) {
    if (!item?.product_id) continue;

    const { data: cdProduct, error: productError } = await supabaseAdmin
      .from('cd_products')
      .select('id, stock_level')
      .eq('cd_id', payload.cdId)
      .eq('id', item.product_id)
      .maybeSingle();

    if (productError || !cdProduct) continue;

    const previousQuantity = Math.max(0, Number(cdProduct.stock_level) || 0);
    const delta = Math.max(0, Number(item.quantity) || 0) * factor;
    const newQuantity = Math.max(0, previousQuantity + delta);

    const { error: updateError } = await supabaseAdmin
      .from('cd_products')
      .update({
        stock_level: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cdProduct.id);

    if (!updateError) {
      await insertInventoryMovement({
        cdId: payload.cdId,
        productId: String(cdProduct.id),
        type: movementType,
        quantity: Math.max(0, Number(item.quantity) || 0),
        previousQuantity,
        newQuantity,
        reason,
        referenceId: payload.orderId,
        referenceType: 'DROP_ORDER',
        createdBy: payload.createdBy || 'system',
      });
    }
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

    cdId = await resolveCdId(rawId);

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

    const merged = mergeCdSources(
      { rows: centers, source: 'distribution_centers' },
      { rows: cdProfiles, source: 'cd_profiles' },
      { rows: minisites, source: 'minisite_profiles' }
    );

    res.json({ success: true, data: pickPrimaryCd(merged) });
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

    const resolvedRows = await Promise.all((data || []).map(async (p: any) => {
      const catalogProduct = await resolveCatalogProductSnapshotFromCdRow(p);
      return {
        ...p,
        resolvedProductId: String(catalogProduct?.id || '').trim() || null,
        catalogProduct,
      };
    }));
    const grouped = new Map<string, any>();

    resolvedRows.forEach((row: any) => {
      const productIdKey = String(row.resolvedProductId || '').trim();
      const skuKey = normalizeLookupLooseKey(row.sku);
      const nameKey = normalizeLookupLooseKey(row.name);
      const groupKey = productIdKey || skuKey || nameKey || String(row.id);
      const catalogProduct = row.catalogProduct || null;

      const current = grouped.get(groupKey);
      const nextStock = Math.max(0, Number(row.stock_level || 0));
      const nextMinStock = Math.max(0, Number(row.min_stock || 0));

      if (!current) {
        grouped.set(groupKey, {
          id: row.id,
          productId: productIdKey || null,
          sku: catalogProduct?.sku || row.sku || 'N/A',
          name: catalogProduct?.name || row.name || 'Produto',
          category: catalogProduct?.category || row.category || 'Geral',
          stockLevel: nextStock,
          minStock: nextMinStock,
          price: Number(row.price || catalogProduct?.price || 0),
          costPrice: Number(row.cost_price || 0),
          points: Number(row.points || catalogProduct?.pv_points || 0),
          status: row.status || 'OK',
          imageUrl: row.image_url || catalogProduct?.image_url || (Array.isArray(catalogProduct?.images) ? catalogProduct.images[0] : undefined),
        });
        return;
      }

      current.stockLevel += nextStock;
      current.minStock = Math.max(current.minStock, nextMinStock);
      if (!current.productId && productIdKey) current.productId = productIdKey;
      if (catalogProduct?.sku) current.sku = catalogProduct.sku;
      else if ((!current.sku || current.sku === 'N/A') && row.sku) current.sku = row.sku;
      if (catalogProduct?.name) current.name = catalogProduct.name;
      if (catalogProduct?.category) current.category = catalogProduct.category;
      if (!current.imageUrl && (row.image_url || catalogProduct?.image_url)) {
        current.imageUrl = row.image_url || catalogProduct?.image_url || (Array.isArray(catalogProduct?.images) ? catalogProduct.images[0] : undefined);
      }
      current.price = Math.max(Number(current.price || 0), Number(row.price || catalogProduct?.price || 0));
      current.costPrice = Math.max(Number(current.costPrice || 0), Number(row.cost_price || 0));
      current.points = Math.max(Number(current.points || 0), Number(row.points || catalogProduct?.pv_points || 0));
    });

    const mappedData = Array.from(grouped.values())
      .map((item: any) => {
        const stockLevel = Math.max(0, Number(item.stockLevel || 0));
        const minStock = Math.max(0, Number(item.minStock || 0));
        return {
          ...item,
          status: stockLevel <= 0 ? 'CRITICO' : (stockLevel <= minStock ? 'BAIXO' : 'OK'),
        };
      })
      .sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/catalog-products', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(mapCatalogProductToDropGlobal),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/cds/catalog-products', async (req: Request, res: Response) => {
  try {
    const incomingProducts = Array.isArray(req.body?.products) ? req.body.products : [];
    const { data: currentRows, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*');

    if (fetchError) throw fetchError;

    const currentById = new Map((currentRows || []).map((row: any) => [String(row.id), row]));
    const incomingIds = new Set(
      incomingProducts
        .map((product: any) => String(product?.id || '').trim())
        .filter(Boolean)
    );

    for (const product of incomingProducts) {
      const productId = String(product?.id || '').trim();
      const payload = {
        name: String(product?.name || '').trim(),
        sku: String(product?.sku || '').trim() || null,
        category: String(product?.category || '').trim() || null,
        short_description: String(product?.description || '').trim(),
        description: String(product?.description || '').trim(),
        price: Number(product?.suggestedPrice) || 0,
        member_price: Number(product?.minAllowedPrice) || 0,
        pv_points: Number(product?.points) || 0,
        is_active: product?.isActive !== false,
        published: product?.isActive !== false,
        featured_image: String(product?.imageUrl || '').trim() || null,
        images: product?.imageUrl ? [String(product.imageUrl).trim()] : [],
        specifications: {
          catalogDescription: String(product?.description || '').trim(),
          videoUrl: String(product?.videoUrl || '').trim() || null,
          minAllowedPrice: Number(product?.minAllowedPrice) || 0,
          maxAllowedPrice: Number(product?.maxAllowedPrice) || 0,
          defaultCommissionPercent: Number(product?.defaultCommissionPercent) || 0,
        },
        updated_at: new Date().toISOString(),
      };

      if (productId && currentById.has(productId)) {
        await executeWithSchemaFallback(payload, (sanitizedPayload) =>
          supabaseAdmin.from('products').update(sanitizedPayload).eq('id', productId).select('id').single()
        );
      } else {
        await executeWithSchemaFallback(payload, (sanitizedPayload) =>
          supabaseAdmin.from('products').insert(sanitizedPayload).select('id').single()
        );
      }
    }

    const removedIds = (currentRows || [])
      .map((row: any) => String(row.id))
      .filter((id: string) => !incomingIds.has(id));

    for (const productId of removedIds) {
      await executeWithSchemaFallback(
        { is_active: false, published: false, updated_at: new Date().toISOString() },
        (sanitizedPayload) =>
          supabaseAdmin.from('products').update(sanitizedPayload).eq('id', productId).select('id').single()
      );
    }

    const { data: finalRows, error: reloadError } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (reloadError) throw reloadError;

    res.json({ success: true, data: (finalRows || []).map(mapCatalogProductToDropGlobal) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/catalog-products', async (req: Request, res: Response) => {
  try {
    const product = req.body?.product || {};
    if (!String(product?.name || '').trim()) {
      return res.status(400).json({ success: false, error: 'Nome do produto é obrigatório.' });
    }

    const payload = {
      name: String(product?.name || '').trim(),
      sku: String(product?.sku || '').trim() || null,
      category: String(product?.category || '').trim() || null,
      short_description: String(product?.description || '').trim(),
      description: String(product?.description || '').trim(),
      price: Number(product?.suggestedPrice) || 0,
      member_price: Number(product?.minAllowedPrice) || 0,
      pv_points: Number(product?.points) || 0,
      is_active: product?.isActive !== false,
      published: product?.isActive !== false,
      featured_image: String(product?.imageUrl || '').trim() || null,
      images: product?.imageUrl ? [String(product.imageUrl).trim()] : [],
      specifications: {
        catalogDescription: String(product?.description || '').trim(),
        videoUrl: String(product?.videoUrl || '').trim() || null,
        minAllowedPrice: Number(product?.minAllowedPrice) || 0,
        maxAllowedPrice: Number(product?.maxAllowedPrice) || 0,
        defaultCommissionPercent: Number(product?.defaultCommissionPercent) || 0,
      },
      updated_at: new Date().toISOString(),
    };

    const { data: created } = await executeWithSchemaFallback(payload, (sanitizedPayload) =>
      supabaseAdmin.from('products').insert(sanitizedPayload).select('*').single()
    );

    res.json({ success: true, data: mapCatalogProductToDropGlobal(created) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/catalog-products/:productId', async (req: Request, res: Response) => {
  try {
    const product = req.body?.product || {};
    const payload = {
      name: String(product?.name || '').trim(),
      sku: String(product?.sku || '').trim() || null,
      category: String(product?.category || '').trim() || null,
      short_description: String(product?.description || '').trim(),
      description: String(product?.description || '').trim(),
      price: Number(product?.suggestedPrice) || 0,
      member_price: Number(product?.minAllowedPrice) || 0,
      pv_points: Number(product?.points) || 0,
      is_active: product?.isActive !== false,
      published: product?.isActive !== false,
      featured_image: String(product?.imageUrl || '').trim() || null,
      images: product?.imageUrl ? [String(product.imageUrl).trim()] : [],
      specifications: {
        catalogDescription: String(product?.description || '').trim(),
        videoUrl: String(product?.videoUrl || '').trim() || null,
        minAllowedPrice: Number(product?.minAllowedPrice) || 0,
        maxAllowedPrice: Number(product?.maxAllowedPrice) || 0,
        defaultCommissionPercent: Number(product?.defaultCommissionPercent) || 0,
      },
      updated_at: new Date().toISOString(),
    };

    const { data: updated } = await executeWithSchemaFallback(payload, (sanitizedPayload) =>
      supabaseAdmin.from('products').update(sanitizedPayload).eq('id', req.params.productId).select('*').single()
    );

    res.json({ success: true, data: mapCatalogProductToDropGlobal(updated) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/catalog-products/:productId', async (req: Request, res: Response) => {
  try {
    const payload = {
      is_active: false,
      published: false,
      updated_at: new Date().toISOString(),
    };

    await executeWithSchemaFallback(payload, (sanitizedPayload) =>
      supabaseAdmin.from('products').update(sanitizedPayload).eq('id', req.params.productId).select('id').single()
    );

    res.json({ success: true, data: { id: req.params.productId } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/product-page-templates', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const templates = await getJsonAppConfig<any[]>(getCdProductPageTemplatesConfigKey(cdId), []);
    res.json({ success: true, data: (templates || []).map(normalizeProductPageTemplateRecord) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/cds/:id/product-page-templates', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const templates = Array.isArray(req.body?.templates) ? req.body.templates.map(normalizeProductPageTemplateRecord) : [];
    await saveJsonAppConfig(getCdProductPageTemplatesConfigKey(cdId), templates);
    res.json({ success: true, data: templates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/experiments', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const experiments = await getJsonAppConfig<any[]>(getCdExperimentsConfigKey(cdId), []);
    res.json({
      success: true,
      data: (experiments || []).map((experiment) => normalizeExperimentRecord(experiment, req.params.id)),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/cds/:id/experiments', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const experiments = Array.isArray(req.body?.experiments)
      ? req.body.experiments.map((experiment: any) => normalizeExperimentRecord(experiment, req.params.id))
      : [];
    await saveJsonAppConfig(getCdExperimentsConfigKey(cdId), experiments);
    res.json({ success: true, data: experiments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/experiment-data', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const data = await getJsonAppConfig<any[]>(getCdExperimentDataConfigKey(cdId), []);
    res.json({ success: true, data: (data || []).map(normalizeExperimentDataRecord) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/experiment-data', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const existing = await getJsonAppConfig<any[]>(getCdExperimentDataConfigKey(cdId), []);
    const incoming = Array.isArray(req.body?.dataPoints) ? req.body.dataPoints.map(normalizeExperimentDataRecord) : [];
    const next = [...existing.map(normalizeExperimentDataRecord), ...incoming];
    await saveJsonAppConfig(getCdExperimentDataConfigKey(cdId), next);
    res.json({ success: true, data: next });
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

router.get('/v1/cds/:id/suppliers', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const suppliers = await getJsonAppConfig<any[]>(getCdSuppliersConfigKey(cdId), []);
    res.json({
      success: true,
      data: suppliers.map((supplier) => normalizeCdSupplierRecord(supplier, cdId)),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/marketplace-suppliers', async (_req: Request, res: Response) => {
  try {
    const candidates = await loadMarketplaceSupplierCandidates();
    res.json({ success: true, data: candidates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/suppliers/link-marketplace', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const supplierPayload = normalizeCdSupplierRecord(
      {
        ...(req.body?.supplier || {}),
        sourceType: 'marketplace',
      },
      cdId
    );

    if (!supplierPayload.name) {
      return res.status(400).json({ success: false, error: 'Fornecedor do marketplace invalido.' });
    }

    const suppliers = await getJsonAppConfig<any[]>(getCdSuppliersConfigKey(cdId), []);
    const dedupeKey = normalizeLookupLooseKey(
      supplierPayload.marketplaceUserId || supplierPayload.marketplaceLoginId || supplierPayload.name
    );

    const existing = suppliers.find((supplier) => {
      const currentKey = normalizeLookupLooseKey(
        supplier?.marketplaceUserId || supplier?.marketplaceLoginId || supplier?.name
      );
      return Boolean(currentKey && currentKey === dedupeKey);
    });

    const nextSupplier = existing
      ? normalizeCdSupplierRecord({ ...existing, ...supplierPayload, id: existing.id }, cdId)
      : supplierPayload;

    const nextSuppliers = [
      ...suppliers.filter((supplier) => String(supplier?.id || '') !== String(nextSupplier.id || '')),
      nextSupplier,
    ].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'pt-BR'));

    await saveJsonAppConfig(getCdSuppliersConfigKey(cdId), nextSuppliers);
    res.json({ success: true, data: nextSupplier });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/suppliers', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const supplierPayload = normalizeCdSupplierRecord(req.body?.supplier || {}, String(req.body?.userId || cdId));

    if (!supplierPayload.name) {
      return res.status(400).json({ success: false, error: 'Nome do fornecedor é obrigatório.' });
    }

    const suppliers = await getJsonAppConfig<any[]>(getCdSuppliersConfigKey(cdId), []);
    const nextSuppliers = [...suppliers.filter((supplier) => String(supplier?.id || '') !== supplierPayload.id), supplierPayload];
    await saveJsonAppConfig(getCdSuppliersConfigKey(cdId), nextSuppliers);

    res.json({ success: true, data: supplierPayload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:id/suppliers/:supplierId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const suppliers = await getJsonAppConfig<any[]>(getCdSuppliersConfigKey(cdId), []);
    const existing = suppliers.find((supplier) => String(supplier?.id || '') === req.params.supplierId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Fornecedor não encontrado.' });
    }

    const updatedSupplier = normalizeCdSupplierRecord(
      { ...existing, ...(req.body?.supplier || {}), id: req.params.supplierId },
      String(req.body?.userId || existing?.userId || cdId)
    );

    if (!updatedSupplier.name) {
      return res.status(400).json({ success: false, error: 'Nome do fornecedor é obrigatório.' });
    }

    const nextSuppliers = suppliers.map((supplier) =>
      String(supplier?.id || '') === req.params.supplierId ? updatedSupplier : supplier
    );
    await saveJsonAppConfig(getCdSuppliersConfigKey(cdId), nextSuppliers);

    res.json({ success: true, data: updatedSupplier });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/:id/suppliers/:supplierId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const suppliers = await getJsonAppConfig<any[]>(getCdSuppliersConfigKey(cdId), []);
    const nextSuppliers = suppliers.filter((supplier) => String(supplier?.id || '') !== req.params.supplierId);
    await saveJsonAppConfig(getCdSuppliersConfigKey(cdId), nextSuppliers);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/products', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const metadataMap = await getJsonAppConfig<Record<string, any>>(getCdProductMetaConfigKey(cdId), {});

    const { data, error } = await supabaseAdmin
      .from('cd_products')
      .select('*')
      .eq('cd_id', cdId)
      .order('name', { ascending: true });

    if (error) throw error;

    const mapped = await Promise.all((data || []).map((row) => mapCdProductToDropProduct(req.params.id, row, metadataMap)));

    res.json({
      success: true,
      data: {
        products: mapped.map((entry) => entry.product),
        productSuppliers: mapped.flatMap((entry) => entry.productSuppliers),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/products', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const productPayload = req.body?.product || {};
    const supplierLinks = Array.isArray(req.body?.supplierLinks) ? req.body.supplierLinks : [];

    if (!String(productPayload?.name || '').trim()) {
      return res.status(400).json({ success: false, error: 'Nome do produto é obrigatório.' });
    }

    const baseStock = Math.max(0, Number(productPayload?.currentStock || 0));
    const minStock = Math.max(0, Number(productPayload?.minStock || 0));
    const status = baseStock <= 0 ? 'CRITICO' : (baseStock <= minStock ? 'BAIXO' : 'OK');
    const supplierCost = supplierLinks.reduce((lowest: number, link: any) => {
      const current = Number(link?.costPrice);
      if (!Number.isFinite(current) || current <= 0) return lowest;
      if (!Number.isFinite(lowest) || lowest <= 0) return current;
      return Math.min(lowest, current);
    }, 0);

    const insertPayload = {
      cd_id: cdId,
      product_id: productPayload?.globalProductId || null,
      sku: String(productPayload?.sku || '').trim() || 'N/A',
      name: String(productPayload?.name || '').trim(),
      category: String(productPayload?.category || 'Geral').trim(),
      stock_level: baseStock,
      min_stock: minStock,
      price: Number(productPayload?.salePrice) || 0,
      cost_price: Number(supplierCost) || 0,
      points: 0,
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: createdRow } = await executeWithSchemaFallback(insertPayload, (sanitizedPayload) =>
      supabaseAdmin.from('cd_products').insert(sanitizedPayload).select('*').single()
    );

    const metadataMap = await getJsonAppConfig<Record<string, any>>(getCdProductMetaConfigKey(cdId), {});
    metadataMap[String(createdRow.id)] = normalizeCdProductMetaRecord(productPayload, supplierLinks);
    await saveJsonAppConfig(getCdProductMetaConfigKey(cdId), metadataMap);

    const mapped = await mapCdProductToDropProduct(req.params.id, createdRow, metadataMap);
    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:id/products/:productId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const productPayload = req.body?.product || {};
    const supplierLinks = Array.isArray(req.body?.supplierLinks) ? req.body.supplierLinks : undefined;

    const { data: existingRow, error: fetchError } = await supabaseAdmin
      .from('cd_products')
      .select('*')
      .eq('cd_id', cdId)
      .eq('id', req.params.productId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingRow) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado.' });
    }

    const baseStock = Math.max(0, Number(productPayload?.currentStock ?? existingRow.stock_level ?? 0));
    const minStock = Math.max(0, Number(productPayload?.minStock ?? existingRow.min_stock ?? 0));
    const status = baseStock <= 0 ? 'CRITICO' : (baseStock <= minStock ? 'BAIXO' : 'OK');
    const nextSupplierLinks = Array.isArray(supplierLinks)
      ? supplierLinks
      : (await getJsonAppConfig<Record<string, any>>(getCdProductMetaConfigKey(cdId), {}))[String(req.params.productId)]?.supplierLinks || [];
    const supplierCost = nextSupplierLinks.reduce((lowest: number, link: any) => {
      const current = Number(link?.costPrice);
      if (!Number.isFinite(current) || current <= 0) return lowest;
      if (!Number.isFinite(lowest) || lowest <= 0) return current;
      return Math.min(lowest, current);
    }, 0);

    const updatePayload = {
      product_id: productPayload?.globalProductId ?? existingRow.product_id ?? null,
      sku: String(productPayload?.sku ?? existingRow.sku ?? '').trim() || 'N/A',
      name: String(productPayload?.name ?? existingRow.name ?? '').trim(),
      category: String(productPayload?.category ?? existingRow.category ?? 'Geral').trim(),
      stock_level: baseStock,
      min_stock: minStock,
      price: Number(productPayload?.salePrice ?? existingRow.price ?? 0) || 0,
      cost_price: Number(supplierCost || existingRow.cost_price || 0),
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRow } = await executeWithSchemaFallback(updatePayload, (sanitizedPayload) =>
      supabaseAdmin
        .from('cd_products')
        .update(sanitizedPayload)
        .eq('cd_id', cdId)
        .eq('id', req.params.productId)
        .select('*')
        .single()
    );

    const metadataMap = await getJsonAppConfig<Record<string, any>>(getCdProductMetaConfigKey(cdId), {});
    metadataMap[String(req.params.productId)] = normalizeCdProductMetaRecord(
      { ...metadataMap[String(req.params.productId)], ...productPayload },
      nextSupplierLinks
    );
    await saveJsonAppConfig(getCdProductMetaConfigKey(cdId), metadataMap);

    const mapped = await mapCdProductToDropProduct(req.params.id, updatedRow, metadataMap);
    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/:id/products/:productId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const { productId } = req.params;

    const { error } = await supabaseAdmin
      .from('cd_products')
      .delete()
      .eq('cd_id', cdId)
      .eq('id', productId);

    if (error) throw error;

    const metadataMap = await getJsonAppConfig<Record<string, any>>(getCdProductMetaConfigKey(cdId), {});
    delete metadataMap[String(productId)];
    await saveJsonAppConfig(getCdProductMetaConfigKey(cdId), metadataMap);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/catalog-activation', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const globalProduct = req.body?.globalProduct || {};
    const globalProductId = String(globalProduct?.id || '').trim();

    if (!globalProductId) {
      return res.status(400).json({ success: false, error: 'Produto global inválido.' });
    }

    let { data: existingRow, error: existingError } = await supabaseAdmin
      .from('cd_products')
      .select('*')
      .eq('cd_id', cdId)
      .eq('product_id', globalProductId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (!existingRow) {
      const insertPayload = {
        cd_id: cdId,
        product_id: globalProductId,
        sku: String(globalProduct?.sku || '').trim() || 'N/A',
        name: String(globalProduct?.name || '').trim() || 'Produto',
        category: 'Geral',
        stock_level: 0,
        min_stock: 0,
        price: Number(globalProduct?.suggestedPrice) || 0,
        cost_price: Number(globalProduct?.minAllowedPrice) || 0,
        points: 0,
        status: 'CRITICO',
        updated_at: new Date().toISOString(),
      };

      const created = await executeWithSchemaFallback(insertPayload, (sanitizedPayload) =>
        supabaseAdmin.from('cd_products').insert(sanitizedPayload).select('*').single()
      );
      existingRow = created.data;
    }

    const metadataMap = await getJsonAppConfig<Record<string, any>>(getCdProductMetaConfigKey(cdId), {});
    metadataMap[String(existingRow.id)] = normalizeCdProductMetaRecord({
      globalProductId,
      name: globalProduct?.name,
      sku: globalProduct?.sku,
      salePrice: Number(globalProduct?.suggestedPrice) || 0,
      visibility: ['loja', 'marketplace'],
      pageLayout: { mainLayout: 'image-left', blocks: [{ type: 'description' }, { type: 'benefits' }, { type: 'faq' }, { type: 'cta' }] },
    });
    await saveJsonAppConfig(getCdProductMetaConfigKey(cdId), metadataMap);

    const mapped = await mapCdProductToDropProduct(req.params.id, existingRow, metadataMap);
    res.json({ success: true, data: mapped });
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
          const catalogSnapshot = catalogProd || await resolveCatalogProductSnapshotFromCdRow({
            product_id: item.product_id,
            sku: item.sku,
            name: item.product_name,
          });
          const retailPrice = catalogSnapshot?.price ? (Number(catalogSnapshot.price) * 0.5) : Number(item.unit_price);
          const stockSku = catalogSnapshot?.sku || item.sku || 'N/A';
          const canonicalName = catalogSnapshot?.name || item.product_name || 'Produto';
          const canonicalCategory = catalogSnapshot?.category || 'Geral';
          const productIdKey = String(catalogSnapshot?.id || item.product_id || '').trim();
          const { data: existingRows } = await supabaseAdmin
            .from('cd_products')
            .select('*')
            .eq('cd_id', order.cd_id);

          const matchingRows = (existingRows || []).filter((row: any) =>
            matchesCdRowToCatalog(row, catalogSnapshot, [item.product_name, item.sku])
          );
          const existingCdProduct = matchingRows[0];
          const previousQuantity = matchingRows.reduce((sum: number, row: any) => sum + Math.max(0, Number(row.stock_level || 0)), 0);
          const nextQuantity = previousQuantity + Math.max(0, Number(item.quantity || 0));
          const payload = {
            cd_id: order.cd_id,
            sku: stockSku,
            name: canonicalName,
            category: canonicalCategory,
            stock_level: nextQuantity,
            min_stock: Math.max(0, Number(existingCdProduct?.min_stock || 10)),
            price: retailPrice,
            cost_price: Number(item.unit_price),
            points: catalogSnapshot?.pv_points || 0,
            status: nextQuantity <= 0 ? 'CRITICO' : 'OK',
            updated_at: new Date().toISOString()
          };

          if (existingCdProduct?.id) {
            await supabaseAdmin
              .from('cd_products')
              .update(payload)
              .eq('id', existingCdProduct.id)
              .eq('cd_id', order.cd_id);
            const duplicateIds = matchingRows
              .slice(1)
              .map((row: any) => String(row.id || '').trim())
              .filter(Boolean);
            if (duplicateIds.length > 0) {
              await supabaseAdmin
                .from('cd_products')
                .delete()
                .eq('cd_id', order.cd_id)
                .in('id', duplicateIds);
            }
          } else {
            await supabaseAdmin
              .from('cd_products')
              .insert(payload);
          }

          await insertInventoryMovement({
            cdId: order.cd_id,
            productId: productIdKey || String(item.product_id || ''),
            type: 'in',
            quantity: Math.max(0, Number(item.quantity || 0)),
            previousQuantity,
            newQuantity: Math.max(0, nextQuantity),
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

    if (order.marketplace_order_id) {
      const marketplaceStatusMap: Record<string, string> = {
        PENDENTE: 'pending',
        SEPARACAO: 'processing',
        AGUARDANDO_RETIRADA: 'ready_for_pickup',
        EM_TRANSPORTE: 'in_transit',
        ENTREGUE: 'delivered',
        CONCLUIDO: 'delivered',
      };

      const marketplaceUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status) {
        marketplaceUpdates.status = marketplaceStatusMap[String(updates.status).toUpperCase()] || String(updates.status).toLowerCase();
      }

      await supabaseAdmin
        .from('orders')
        .update(marketplaceUpdates)
        .eq('id', order.marketplace_order_id);
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

    const mapped = (data || []).map(order => {
      const resolvedType = resolveCdSaleType(order);
      const shippingMethod = String(order.shipping_method || '').trim();
      const shippingAddress = String(order.shipping_address || '').trim();
      const combinedShipping = [shippingMethod, shippingAddress].filter(Boolean).join(' - ').trim();

      return {
        id: order.id,
        consultantName: order.customer_name || order.consultant_name || 'Cliente',
        consultantPin: order.consultant_pin,
        buyerCpf: order.customer_document || order.buyer_cpf || null,
        buyerEmail: order.customer_email || order.buyer_email || null,
        buyerPhone: order.customer_phone || order.buyer_phone || null,
        shippingAddress: combinedShipping || null,
        total: Number(order.total),
        status: order.status,
        type: resolvedType,
        paymentMethod: order.payment_method || null,
        marketplaceOrderId: order.marketplace_order_id || null,
        date: order.order_date,
        time: order.order_time || null,
        trackingCode: order.tracking_code || null,
        items: order.items_count,
        productsDetail: (order.items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price)
        }))
      };
    });

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lista de Clientes do CD (cd_customers)
router.get('/v1/cds/:id/customers', async (req: Request, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const cdId = await resolveCdId(rawId);

    const { data, error } = await supabaseAdmin
      .from('cd_customers')
      .select('*')
      .eq('cd_id', cdId)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: (data || []).map(mapCdCustomerToDrop) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/customers', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const customerPayload = req.body?.customer || null;

    if (!customerPayload?.name) {
      return res.status(400).json({ success: false, error: 'Nome do cliente é obrigatório.' });
    }

    const customerRow = await upsertCdCustomer(cdId, customerPayload, customerPayload?.userId);
    res.json({ success: true, data: mapCdCustomerToDrop(customerRow) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:id/customers/:customerId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const customerPayload = { ...(req.body?.customer || {}), id: req.params.customerId };

    if (!customerPayload?.name) {
      return res.status(400).json({ success: false, error: 'Nome do cliente é obrigatório.' });
    }

    const customerRow = await upsertCdCustomer(cdId, customerPayload, customerPayload?.userId);
    res.json({ success: true, data: mapCdCustomerToDrop(customerRow) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/:id/customers/:customerId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const { customerId } = req.params;

    const { count, error: countError } = await supabaseAdmin
      .from('cd_orders')
      .select('id', { count: 'exact', head: true })
      .eq('cd_id', cdId)
      .eq('customer_id', customerId)
      .in('type', ['DROP_ORDER', 'SALE', 'VENDA']);

    if (countError) throw countError;
    if ((count || 0) > 0) {
      return res.status(400).json({ success: false, error: 'Este cliente possui pedidos vinculados e não pode ser excluído.' });
    }

    const { error } = await supabaseAdmin
      .from('cd_customers')
      .delete()
      .eq('cd_id', cdId)
      .eq('id', customerId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/subscriptions', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const subscriptions = await getJsonAppConfig<any[]>(getCdSubscriptionsConfigKey(cdId), []);
    res.json({
      success: true,
      data: (subscriptions || []).map((subscription) => normalizeSubscriptionRecord(subscription, cdId)),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/subscription-products', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, category, price, member_price, stock_quantity, published, is_active, specifications')
      .eq('published', true)
      .eq('is_active', true)
      .limit(5000);

    if (error) throw error;

    const products = (data || [])
      .filter((row) => isSubscriptionLikeMarketplaceProduct(row))
      .map((row) => mapMarketplaceProductToDropSubscriptionProduct(row, cdId))
      .sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'pt-BR'));

    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/subscriptions', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const incoming = normalizeSubscriptionRecord(req.body?.subscription || {}, cdId);

    if (!incoming.customerId || !incoming.productId) {
      return res.status(400).json({ success: false, error: 'Cliente e produto sao obrigatorios.' });
    }

    const subscriptions = await getJsonAppConfig<any[]>(getCdSubscriptionsConfigKey(cdId), []);
    const nextSubscriptions = [
      ...subscriptions.filter((subscription) => String(subscription?.id || '') !== incoming.id),
      incoming,
    ].sort((a, b) => String(b?.startDate || '').localeCompare(String(a?.startDate || '')));

    await saveJsonAppConfig(getCdSubscriptionsConfigKey(cdId), nextSubscriptions);
    res.json({ success: true, data: incoming });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:id/subscriptions/:subscriptionId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const subscriptions = await getJsonAppConfig<any[]>(getCdSubscriptionsConfigKey(cdId), []);
    const existing = subscriptions.find((subscription) => String(subscription?.id || '') === req.params.subscriptionId);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Assinatura nao encontrada.' });
    }

    const updated = normalizeSubscriptionRecord(
      { ...existing, ...(req.body?.subscription || {}), id: req.params.subscriptionId },
      cdId
    );

    const nextSubscriptions = subscriptions.map((subscription) =>
      String(subscription?.id || '') === req.params.subscriptionId ? updated : subscription
    );

    await saveJsonAppConfig(getCdSubscriptionsConfigKey(cdId), nextSubscriptions);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/:id/subscriptions/:subscriptionId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const subscriptions = await getJsonAppConfig<any[]>(getCdSubscriptionsConfigKey(cdId), []);
    const nextSubscriptions = subscriptions.filter((subscription) => String(subscription?.id || '') !== req.params.subscriptionId);
    await saveJsonAppConfig(getCdSubscriptionsConfigKey(cdId), nextSubscriptions);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/cds/:id/store-orders', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);

    const { data, error } = await supabaseAdmin
      .from('cd_orders')
      .select('*, items:cd_order_items(*)')
      .eq('cd_id', cdId)
      .in('type', ['DROP_ORDER', 'SALE', 'VENDA'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: (data || []).map(mapCdOrderToDrop) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/store-orders', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const order = req.body?.order || {};
    const customerPayload = req.body?.customer || null;
    const actorUserId = String(req.body?.userId || '').trim() || null;

    if (!order.customerId && !customerPayload?.name) {
      return res.status(400).json({ success: false, error: 'Cliente é obrigatório.' });
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Itens do pedido são obrigatórios.' });
    }

    let customerRow = null;
    if (customerPayload?.name) {
      customerRow = await upsertCdCustomer(cdId, customerPayload, actorUserId || undefined);
    } else if (order.customerId && isUuid(String(order.customerId))) {
      const { data } = await supabaseAdmin
        .from('cd_customers')
        .select('*')
        .eq('cd_id', cdId)
        .eq('id', order.customerId)
        .maybeSingle();
      customerRow = data;
    }

    const normalizedItems = order.items.map((item: any) => ({
      product_id: item.productId,
      product_name: item.productName || 'Produto',
      supplier_id: item.supplierId || null,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unitPrice) || 0,
      unit_cost: Number(item.unitCost) || 0,
      discount: Number(item.discount) || 0,
      product_sku: item.productSku || null,
      product_catalog_id: item.productCatalogId || null,
    }));

    const calculatedItemsTotal = normalizedItems.reduce(
      (total: number, item: any) => total + (item.quantity * item.unit_price),
      0
    );

    const shippingAddressText = buildShippingAddressText(customerRow || order);

    const orderInsertPayload = {
      cd_id: cdId,
      customer_id: customerRow?.id || null,
      customer_name: customerRow?.name || order.customerName || '',
      customer_document: customerRow?.document || order.customerDocument || null,
      customer_email: customerRow?.email || order.customerEmail || null,
      customer_phone: customerRow?.phone || order.customerPhone || null,
      buyer_cpf: customerRow?.document || order.customerDocument || null,
      buyer_email: customerRow?.email || order.customerEmail || null,
      buyer_phone: customerRow?.phone || order.customerPhone || null,
      shipping_address: shippingAddressText || null,
      shipping_street: customerRow?.address_street || order.shippingStreet || order.shipping_address?.street || null,
      shipping_number: customerRow?.address_number || order.shippingNumber || order.shipping_address?.number || null,
      shipping_complement: customerRow?.address_complement || order.shippingComplement || order.shipping_address?.complement || null,
      shipping_neighborhood: customerRow?.address_neighborhood || order.shippingNeighborhood || order.shipping_address?.neighborhood || null,
      shipping_city: customerRow?.address_city || order.shippingCity || order.shipping_address?.city || null,
      shipping_state: customerRow?.address_state || order.shippingState || order.shipping_address?.state || null,
      shipping_zip_code: customerRow?.address_zip_code || order.shippingZipCode || order.shipping_address?.zipCode || null,
      order_date: order.date || new Date().toISOString().slice(0, 10),
      total: Number(order.itemsTotal || calculatedItemsTotal) - Number(order.discountTotal || 0) + Number(order.shippingCharged || 0),
      items_total: Number(order.itemsTotal || calculatedItemsTotal),
      discount_total: Number(order.discountTotal) || 0,
      shipping_cost: Number(order.shippingCost) || 0,
      shipping_charged: Number(order.shippingCharged) || 0,
      payment_method: order.paymentMethod || null,
      payment_fee: Number(order.paymentFee) || 0,
      platform_fee: Number(order.platformFee) || 0,
      other_expenses: Number(order.otherExpenses) || 0,
      status: mapDropStatusToDbStatus(order.status),
      type: 'DROP_ORDER',
      items_count: normalizedItems.length,
      tracking_code: order.trackingCode || null,
      shipping_method: order.shippingMethod || null,
      shipping_date: order.shippingDate || null,
      estimated_delivery_date: order.estimatedDeliveryDate || null,
      actual_delivery_date: order.actualDeliveryDate || null,
      shipping_label_url: order.shippingLabelUrl || null,
      fulfillment_center_id: order.fulfillmentCenterId || null,
      sales_channel: order.salesChannel || null,
      campaign: order.campaign || null,
      utm_source: order.utmSource || null,
      utm_medium: order.utmMedium || null,
      utm_campaign: order.utmCampaign || null,
      utm_content: order.utmContent || null,
      utm_term: order.utmTerm || null,
      notes: order.notes || null,
      affiliate_id: order.affiliateId || null,
      affiliate_commission: Number(order.affiliateCommission) || 0,
      commission_paid: Boolean(order.commissionPaid),
      updated_at: new Date().toISOString(),
    };

    const { data: createdOrder } = await executeWithSchemaFallback(orderInsertPayload, (sanitizedPayload) =>
      supabaseAdmin
        .from('cd_orders')
        .insert(sanitizedPayload)
        .select()
        .single()
    );

    const orderItemsPayload = normalizedItems.map((item: any) => ({
      cd_order_id: createdOrder.id,
      ...item,
    }));

    await executeWithSchemaFallback(orderItemsPayload, (sanitizedPayload) =>
      supabaseAdmin
        .from('cd_order_items')
        .insert(sanitizedPayload)
    );

    await adjustCdInventoryForItems({
      cdId,
      orderId: createdOrder.id,
      items: normalizedItems,
      mode: 'reserve',
      createdBy: actorUserId || customerRow?.email || customerRow?.name || 'system',
    });

    if (customerRow?.id) {
      try {
        const { data: customerOrders } = await supabaseAdmin
          .from('cd_orders')
          .select('total, order_date')
          .eq('cd_id', cdId)
          .eq('customer_id', customerRow.id)
          .in('type', ['DROP_ORDER', 'SALE', 'VENDA']);

        const ordersCount = (customerOrders || []).length;
        const totalSpent = (customerOrders || []).reduce((sum: number, row: any) => sum + (Number(row.total) || 0), 0);
        const lastPurchaseDate = (customerOrders || [])
          .map((row: any) => row.order_date)
          .filter(Boolean)
          .sort()
          .at(-1);

        await executeWithSchemaFallback(
          {
            orders_count: ordersCount,
            total_spent: totalSpent,
            last_purchase_date: lastPurchaseDate || null,
            updated_at: new Date().toISOString(),
          },
          (sanitizedPayload) =>
            supabaseAdmin
              .from('cd_customers')
              .update(sanitizedPayload)
              .eq('id', customerRow.id)
        );
      } catch (metricsError) {
        console.warn('[CDS] Nao foi possivel atualizar metricas do cliente:', (metricsError as any)?.message || metricsError);
      }
    }

    const { data: freshOrder, error: freshOrderError } = await supabaseAdmin
      .from('cd_orders')
      .select('*, items:cd_order_items(*)')
      .eq('id', createdOrder.id)
      .single();

    if (freshOrderError) throw freshOrderError;

    res.json({ success: true, data: mapCdOrderToDrop(freshOrder) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:id/store-orders/:orderId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const { orderId } = req.params;
    const order = req.body?.order || {};
    const customerPayload = req.body?.customer || null;
    const actorUserId = String(req.body?.userId || '').trim() || null;

    let customerRow = null;
    if (customerPayload?.name) {
      customerRow = await upsertCdCustomer(cdId, customerPayload, actorUserId || undefined);
    } else if (order.customerId && isUuid(String(order.customerId))) {
      const { data } = await supabaseAdmin
        .from('cd_customers')
        .select('*')
        .eq('cd_id', cdId)
        .eq('id', order.customerId)
        .maybeSingle();
      customerRow = data;
    }

    const normalizedItems = Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          product_id: item.productId,
          product_name: item.productName || 'Produto',
          supplier_id: item.supplierId || null,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unitPrice) || 0,
          unit_cost: Number(item.unitCost) || 0,
          discount: Number(item.discount) || 0,
          product_sku: item.productSku || null,
          product_catalog_id: item.productCatalogId || null,
        }))
      : [];

    const calculatedItemsTotal = normalizedItems.reduce(
      (total: number, item: any) => total + (item.quantity * item.unit_price),
      0
    );

    const shippingAddressText = buildShippingAddressText(customerRow || order);

    const { data: previousItems, error: previousItemsError } = await supabaseAdmin
      .from('cd_order_items')
      .select('product_id, quantity, product_name')
      .eq('cd_order_id', orderId);

    if (previousItemsError) throw previousItemsError;

    const orderUpdatePayload = {
      customer_id: customerRow?.id || order.customerId || null,
      customer_name: customerRow?.name || order.customerName || '',
      customer_document: customerRow?.document || order.customerDocument || null,
      customer_email: customerRow?.email || order.customerEmail || null,
      customer_phone: customerRow?.phone || order.customerPhone || null,
      buyer_cpf: customerRow?.document || order.customerDocument || null,
      buyer_email: customerRow?.email || order.customerEmail || null,
      buyer_phone: customerRow?.phone || order.customerPhone || null,
      shipping_address: shippingAddressText || null,
      shipping_street: customerRow?.address_street || order.shippingStreet || order.shipping_address?.street || null,
      shipping_number: customerRow?.address_number || order.shippingNumber || order.shipping_address?.number || null,
      shipping_complement: customerRow?.address_complement || order.shippingComplement || order.shipping_address?.complement || null,
      shipping_neighborhood: customerRow?.address_neighborhood || order.shippingNeighborhood || order.shipping_address?.neighborhood || null,
      shipping_city: customerRow?.address_city || order.shippingCity || order.shipping_address?.city || null,
      shipping_state: customerRow?.address_state || order.shippingState || order.shipping_address?.state || null,
      shipping_zip_code: customerRow?.address_zip_code || order.shippingZipCode || order.shipping_address?.zipCode || null,
      order_date: order.date || null,
      total: Number(order.itemsTotal || calculatedItemsTotal) - Number(order.discountTotal || 0) + Number(order.shippingCharged || 0),
      items_total: Number(order.itemsTotal || calculatedItemsTotal),
      discount_total: Number(order.discountTotal) || 0,
      shipping_cost: Number(order.shippingCost) || 0,
      shipping_charged: Number(order.shippingCharged) || 0,
      payment_method: order.paymentMethod || null,
      payment_fee: Number(order.paymentFee) || 0,
      platform_fee: Number(order.platformFee) || 0,
      other_expenses: Number(order.otherExpenses) || 0,
      status: mapDropStatusToDbStatus(order.status),
      items_count: normalizedItems.length,
      tracking_code: order.trackingCode || null,
      shipping_method: order.shippingMethod || null,
      shipping_date: order.shippingDate || null,
      estimated_delivery_date: order.estimatedDeliveryDate || null,
      actual_delivery_date: order.actualDeliveryDate || null,
      shipping_label_url: order.shippingLabelUrl || null,
      fulfillment_center_id: order.fulfillmentCenterId || null,
      sales_channel: order.salesChannel || null,
      campaign: order.campaign || null,
      utm_source: order.utmSource || null,
      utm_medium: order.utmMedium || null,
      utm_campaign: order.utmCampaign || null,
      utm_content: order.utmContent || null,
      utm_term: order.utmTerm || null,
      notes: order.notes || null,
      affiliate_id: order.affiliateId || null,
      affiliate_commission: Number(order.affiliateCommission) || 0,
      commission_paid: Boolean(order.commissionPaid),
      updated_at: new Date().toISOString(),
    };

    await executeWithSchemaFallback(orderUpdatePayload, (sanitizedPayload) =>
      supabaseAdmin
        .from('cd_orders')
        .update(sanitizedPayload)
        .eq('cd_id', cdId)
        .eq('id', orderId)
    );

    const { error: deleteItemsError } = await supabaseAdmin
      .from('cd_order_items')
      .delete()
      .eq('cd_order_id', orderId);

    if (deleteItemsError) throw deleteItemsError;

    if (normalizedItems.length > 0) {
        const orderItemsPayload = normalizedItems.map((item: any) => ({
          cd_order_id: orderId,
          ...item,
        }));
        await executeWithSchemaFallback(orderItemsPayload, (sanitizedPayload) =>
          supabaseAdmin
            .from('cd_order_items')
            .insert(sanitizedPayload)
        );
    }

    await adjustCdInventoryForItems({
      cdId,
      orderId,
      items: previousItems || [],
      mode: 'restore',
      createdBy: actorUserId || customerRow?.email || customerRow?.name || 'system',
    });

    if (normalizedItems.length > 0) {
      await adjustCdInventoryForItems({
        cdId,
        orderId,
        items: normalizedItems,
        mode: 'reserve',
        createdBy: actorUserId || customerRow?.email || customerRow?.name || 'system',
      });
    }

    const { data: freshOrder, error: freshOrderError } = await supabaseAdmin
      .from('cd_orders')
      .select('*, items:cd_order_items(*)')
      .eq('id', orderId)
      .single();

    if (freshOrderError) throw freshOrderError;

    res.json({ success: true, data: mapCdOrderToDrop(freshOrder) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/:id/store-orders/:orderId', async (req: Request, res: Response) => {
  try {
    const cdId = await resolveCdId(req.params.id);
    const { orderId } = req.params;

    const { data: previousItems, error: previousItemsError } = await supabaseAdmin
      .from('cd_order_items')
      .select('product_id, quantity, product_name')
      .eq('cd_order_id', orderId);

    if (previousItemsError) throw previousItemsError;

    await adjustCdInventoryForItems({
      cdId,
      orderId,
      items: previousItems || [],
      mode: 'restore',
      createdBy: 'system',
    });

    await supabaseAdmin.from('cd_order_items').delete().eq('cd_order_id', orderId);

    const { error } = await supabaseAdmin
      .from('cd_orders')
      .delete()
      .eq('cd_id', cdId)
      .eq('id', orderId)
      .in('type', ['DROP_ORDER', 'SALE', 'VENDA']);

    if (error) throw error;
    res.json({ success: true });
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

    const [withdrawsRes, txnsRes, profileRes] = await Promise.all([
      supabaseAdmin.from('cd_withdraw_requests').select('*').eq('cd_id', cdId).order('created_at', { ascending: false }),
      supabaseAdmin.from('cd_transactions').select('*').eq('cd_id', cdId).order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('minisite_profiles').select('wallet_balance').eq('id', cdId).maybeSingle()
    ]);

    if (withdrawsRes.error || txnsRes.error) throw new Error("Erro ao buscar dados financeiros.");

    const extractFinancialReference = (transaction: any): string => {
      const explicit = String(transaction.reference_id || '').trim();
      if (explicit) return explicit;

      const description = String(transaction.description || '').trim();
      const match = description.match(/#([A-Z0-9-]+)/i);
      return match ? match[1].toUpperCase() : '';
    };

    const transactionMap = new Map<string, any>();
    for (const transaction of (txnsRes.data || [])) {
      const extractedReference = extractFinancialReference(transaction);
      const key = extractedReference
        || `${String(transaction.type || '').trim().toUpperCase()}|${String(transaction.category || '').trim().toUpperCase()}|${String(transaction.description || '').trim()}|${Number(transaction.amount || 0).toFixed(2)}`;
      if (!transactionMap.has(key)) {
        transactionMap.set(key, transaction);
      }
    }

    const normalizedTransactions = Array.from(transactionMap.values()).sort((a: any, b: any) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return bDate - aDate;
    });

    const balanceFromTransactions = normalizedTransactions.reduce((acc: number, transaction: any) => {
      const status = String(transaction.status || '').trim().toUpperCase();
      if (status === 'CANCELADO' || status === 'REJEITADO') {
        return acc;
      }

      const amount = Number(transaction.amount || 0);
      const type = String(transaction.type || '').trim().toUpperCase();
      return type === 'IN' ? acc + amount : acc - amount;
    }, 0);

    const withdrawableBalance = normalizedTransactions.reduce((acc: number, transaction: any) => {
      const status = String(transaction.status || '').trim().toUpperCase();
      if (status === 'CANCELADO' || status === 'REJEITADO') {
        return acc;
      }

      const amount = Number(transaction.amount || 0);
      const type = String(transaction.type || '').trim().toUpperCase();
      const category = String(transaction.category || '').trim().toUpperCase();

      if (type === 'IN') {
        return acc + amount;
      }

      if (category.includes('SAQUE')) {
        return acc - amount;
      }

      return acc;
    }, 0);

    const storedBalance = Number(profileRes.data?.wallet_balance || 0);
    const availableBalance = Math.max(0, withdrawableBalance);

    res.json({
      success: true,
      data: {
        withdraws: withdrawsRes.data || [],
        transactions: normalizedTransactions,
        availableBalance,
        storedBalance,
        balanceFromTransactions,
        withdrawableBalance,
      }
    });
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
      const catalogSnapshot = await resolveCatalogProductSnapshotFromCdRow({
        product_id: item.product_id,
        sku: item.sku,
        name: item.product_name,
      });
      const productKey = String(catalogSnapshot?.id || item.product_id || item.sku || item.product_name || '').trim();
      const current = stockMap.get(productKey) || {
        qty: 0,
        name: catalogSnapshot?.name || item.product_name,
        price: item.unit_price,
        catalogProduct: catalogSnapshot || null,
      };
      stockMap.set(productKey, {
        qty: current.qty + (item.quantity || 0),
        name: catalogSnapshot?.name || item.product_name,
        price: item.unit_price,
        catalogProduct: catalogSnapshot || current.catalogProduct || null,
      });
    }

    // 4. Consolidar no cd_products com SKU/nome canonicos
    let fixedCount = 0;
    const { data: existingCdRows } = await supabaseAdmin
      .from('cd_products')
      .select('*')
      .eq('cd_id', cdId);

    for (const [prodId, info] of stockMap.entries()) {
      const catalogProd = info.catalogProduct || null;
      const retailPrice = catalogProd?.price ? (Number(catalogProd.price) * 0.5) : Number(info.price);
      const cdCostPrice = Number(info.price);
      const matchingRows = (existingCdRows || []).filter((row: any) =>
        matchesCdRowToCatalog(row, catalogProd, [info.name])
      );
      const primaryRow = matchingRows[0];
      const payload = {
        cd_id: cdId,
        sku: catalogProd?.sku || 'N/A',
        name: catalogProd?.name || info.name,
        category: catalogProd?.category || 'Geral',
        stock_level: info.qty,
        min_stock: Math.max(0, Number(primaryRow?.min_stock || 10)),
        price: retailPrice,
        cost_price: cdCostPrice,
        points: catalogProd?.pv_points || 0,
        status: info.qty <= 0 ? 'CRITICO' : 'OK',
        updated_at: new Date().toISOString()
      };

      let upsertError: any = null;
      if (primaryRow?.id) {
        const { error } = await supabaseAdmin
          .from('cd_products')
          .update(payload)
          .eq('id', primaryRow.id)
          .eq('cd_id', cdId);
        upsertError = error;

        const duplicateIds = matchingRows
          .slice(1)
          .map((row: any) => String(row.id || '').trim())
          .filter(Boolean);
        if (!upsertError && duplicateIds.length > 0) {
          const { error: deleteError } = await supabaseAdmin
            .from('cd_products')
            .delete()
            .eq('cd_id', cdId)
            .in('id', duplicateIds);
          if (deleteError) upsertError = deleteError;
        }
      } else {
        const { error } = await supabaseAdmin
          .from('cd_products')
          .insert(payload);
        upsertError = error;
      }

      if (!upsertError) fixedCount++;
      else console.error(`Erro ao consolidar produto ${prodId}:`, upsertError);
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
