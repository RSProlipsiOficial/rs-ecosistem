import {
  Customer,
  DistributionCenter,
  Experiment,
  ExperimentDataPoint,
  GlobalProduct,
  Order,
  Product,
  ProductPageTemplate,
  ProductSupplier,
  Subscription,
  Supplier,
} from '../types';

const API_BASE_URL = 'http://localhost:4000';
const normalizeCdLookup = (value: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return '';
  if (normalized.includes('@')) return normalized.split('@')[0];
  return normalized;
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    throw new Error(json?.error || `Erro ao carregar ${url}`);
  }

  return json.data as T;
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export async function loadRealProducts(cdKey: string): Promise<Product[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];

  const data = await fetchJson<any[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/inventory`);

  return (data || []).map((product) => ({
    id: String(product.id),
    globalProductId: product.productId ? String(product.productId) : undefined,
    name: product.name || 'Produto',
    sku: product.sku || undefined,
    category: product.category || 'Geral',
    salePrice: Number(product.price) || 0,
    shippingCost: 0,
    shippingCharged: 0,
    gatewayFeeRate: 0,
    currentStock: Number(product.stockLevel) || 0,
    minStock: Number(product.minStock) || 0,
    status: normalizeText(product.status).toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
    userId: lookupKey,
      visibility: ['loja', 'marketplace'],
  }));
}

type RealProductPayload = {
  products: Product[];
  productSuppliers: ProductSupplier[];
};

export async function loadRealProductState(cdKey: string): Promise<RealProductPayload> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return { products: [], productSuppliers: [] };

  return fetchJson<RealProductPayload>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/products`);
}

export async function createRealProduct(
  cdKey: string,
  product: Product,
  supplierLinks: ProductSupplier[]
): Promise<{ product: Product; productSuppliers: ProductSupplier[] }> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<{ product: Product; productSuppliers: ProductSupplier[] }>(
    `${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/products`,
    {
      method: 'POST',
      body: JSON.stringify({
        product,
        supplierLinks,
      }),
    }
  );
}

export async function updateRealProduct(
  cdKey: string,
  product: Product,
  supplierLinks?: ProductSupplier[]
): Promise<{ product: Product; productSuppliers: ProductSupplier[] }> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<{ product: Product; productSuppliers: ProductSupplier[] }>(
    `${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/products/${encodeURIComponent(product.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        product,
        supplierLinks,
      }),
    }
  );
}

export async function deleteRealProduct(cdKey: string, productId: string): Promise<void> {
  const lookupKey = normalizeCdLookup(cdKey);
  await fetchJson(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export async function loadRealCatalogProducts(): Promise<GlobalProduct[]> {
  return fetchJson<GlobalProduct[]>(`${API_BASE_URL}/v1/cds/catalog-products`);
}

export async function saveRealCatalogProducts(products: GlobalProduct[]): Promise<GlobalProduct[]> {
  return fetchJson<GlobalProduct[]>(`${API_BASE_URL}/v1/cds/catalog-products`, {
    method: 'PUT',
    body: JSON.stringify({ products }),
  });
}

export async function createRealCatalogProduct(product: Omit<GlobalProduct, 'id'>): Promise<GlobalProduct> {
  return fetchJson<GlobalProduct>(`${API_BASE_URL}/v1/cds/catalog-products`, {
    method: 'POST',
    body: JSON.stringify({ product }),
  });
}

export async function updateRealCatalogProduct(product: GlobalProduct): Promise<GlobalProduct> {
  return fetchJson<GlobalProduct>(`${API_BASE_URL}/v1/cds/catalog-products/${encodeURIComponent(product.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ product }),
  });
}

export async function deleteRealCatalogProduct(productId: string): Promise<void> {
  await fetchJson(`${API_BASE_URL}/v1/cds/catalog-products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export async function activateCatalogProductForCd(cdKey: string, globalProduct: GlobalProduct): Promise<{ product: Product; productSuppliers: ProductSupplier[] }> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<{ product: Product; productSuppliers: ProductSupplier[] }>(
    `${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/catalog-activation`,
    {
      method: 'POST',
      body: JSON.stringify({ globalProduct }),
    }
  );
}

export async function loadRealSuppliers(cdKey: string): Promise<Supplier[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Supplier[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/suppliers`);
}

export async function createRealSupplier(cdKey: string, supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Supplier>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/suppliers`, {
    method: 'POST',
    body: JSON.stringify({
      supplier,
      userId: supplier.userId,
    }),
  });
}

export async function updateRealSupplier(cdKey: string, supplier: Supplier): Promise<Supplier> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Supplier>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/suppliers/${encodeURIComponent(supplier.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      supplier,
      userId: supplier.userId,
    }),
  });
}

export async function deleteRealSupplier(cdKey: string, supplierId: string): Promise<void> {
  const lookupKey = normalizeCdLookup(cdKey);
  await fetchJson(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/suppliers/${encodeURIComponent(supplierId)}`, {
    method: 'DELETE',
  });
}

export async function loadMarketplaceSupplierCandidates(cdKey: string): Promise<Supplier[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Supplier[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/marketplace-suppliers`);
}

export async function linkMarketplaceSupplier(cdKey: string, supplier: Omit<Supplier, 'id'> | Supplier): Promise<Supplier> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Supplier>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/suppliers/link-marketplace`, {
    method: 'POST',
    body: JSON.stringify({ supplier }),
  });
}

export async function loadRealSubscriptions(cdKey: string): Promise<Subscription[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Subscription[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/subscriptions`);
}

export async function createRealSubscription(
  cdKey: string,
  subscription: Omit<Subscription, 'id' | 'userId'>
): Promise<Subscription> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Subscription>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/subscriptions`, {
    method: 'POST',
    body: JSON.stringify({ subscription }),
  });
}

export async function updateRealSubscription(cdKey: string, subscription: Subscription): Promise<Subscription> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Subscription>(
    `${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/subscriptions/${encodeURIComponent(subscription.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ subscription }),
    }
  );
}

export async function deleteRealSubscription(cdKey: string, subscriptionId: string): Promise<void> {
  const lookupKey = normalizeCdLookup(cdKey);
  await fetchJson(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'DELETE',
  });
}

export async function loadRealSubscriptionProducts(cdKey: string): Promise<Product[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Product[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/subscription-products`);
}

export async function loadRealProductPageTemplates(cdKey: string): Promise<ProductPageTemplate[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<ProductPageTemplate[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/product-page-templates`);
}

export async function saveRealProductPageTemplates(cdKey: string, templates: ProductPageTemplate[]): Promise<ProductPageTemplate[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<ProductPageTemplate[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/product-page-templates`, {
    method: 'PUT',
    body: JSON.stringify({ templates }),
  });
}

export async function loadRealExperiments(cdKey: string): Promise<Experiment[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Experiment[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/experiments`);
}

export async function saveRealExperiments(cdKey: string, experiments: Experiment[]): Promise<Experiment[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Experiment[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/experiments`, {
    method: 'PUT',
    body: JSON.stringify({ experiments }),
  });
}

export async function loadRealExperimentData(cdKey: string): Promise<ExperimentDataPoint[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<ExperimentDataPoint[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/experiment-data`);
}

export async function appendRealExperimentData(cdKey: string, dataPoints: ExperimentDataPoint[]): Promise<ExperimentDataPoint[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<ExperimentDataPoint[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/experiment-data`, {
    method: 'POST',
    body: JSON.stringify({ dataPoints }),
  });
}

export async function loadRealOrders(cdKey: string): Promise<Order[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Order[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/store-orders`);
}

export async function loadRealCustomers(cdKey: string): Promise<Customer[]> {
  const lookupKey = normalizeCdLookup(cdKey);
  if (!lookupKey) return [];
  return fetchJson<Customer[]>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/customers`);
}

export async function createRealCustomer(cdKey: string, customer: Omit<Customer, 'id'>): Promise<Customer> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Customer>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/customers`, {
    method: 'POST',
    body: JSON.stringify({ customer }),
  });
}

export async function updateRealCustomer(cdKey: string, customer: Customer): Promise<Customer> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Customer>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/customers/${encodeURIComponent(customer.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ customer }),
  });
}

export async function deleteRealCustomer(cdKey: string, customerId: string): Promise<void> {
  const lookupKey = normalizeCdLookup(cdKey);
  await fetchJson(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/customers/${encodeURIComponent(customerId)}`, {
    method: 'DELETE',
  });
}

export async function loadRealDistributionCenters(): Promise<DistributionCenter[]> {
  const data = await fetchJson<any[]>(`${API_BASE_URL}/v1/cds`);

  return (data || []).map((center) => ({
    id: String(center.id),
    name: center.name || 'CD',
    address: {
      street: center.address_street || '',
      city: center.address_city || '',
      state: center.address_state || '',
      zipCode: center.address_zip || '',
    },
    zipCodeRanges: [],
    userId: center.manager_id || center.consultant_id || center.id,
  }));
}

export async function createRealOrder(
  cdKey: string,
  order: Omit<Order, 'id'>,
  customer?: Customer
): Promise<Order> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Order>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/store-orders`, {
    method: 'POST',
    body: JSON.stringify({
      order,
      customer,
      userId: order.userId,
    }),
  });
}

export async function updateRealOrder(
  cdKey: string,
  order: Order,
  customer?: Customer
): Promise<Order> {
  const lookupKey = normalizeCdLookup(cdKey);
  return fetchJson<Order>(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/store-orders/${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      order,
      customer,
      userId: order.userId,
    }),
  });
}

export async function deleteRealOrder(cdKey: string, orderId: string): Promise<void> {
  const lookupKey = normalizeCdLookup(cdKey);
  await fetchJson(`${API_BASE_URL}/v1/cds/${encodeURIComponent(lookupKey)}/store-orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  });
}
