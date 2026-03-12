import type { Product } from '../types';
import { adminSettingsAPI } from '../services/marketplaceAPI';

const IMPRESSION_TTL_MS = 15 * 60 * 1000;

const getImpressionKey = (placementId: string, productId: string) =>
  `rs-sponsored-impression:${placementId}:${productId}`;

const resolveTenantId = (product: Product) => {
  if (product?.tenantId) return String(product.tenantId);
  if (typeof window === 'undefined') return '';

  const keys = ['tenantId', 'tenant_id', 'marketplaceTenantId', 'storeTenantId'];
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return '';
};

const shouldSendImpression = (placementId: string, productId: string) => {
  if (typeof window === 'undefined') return true;

  const key = getImpressionKey(placementId, productId);
  const now = Date.now();

  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw) {
      const lastSeen = Number(raw);
      if (!Number.isNaN(lastSeen) && now - lastSeen < IMPRESSION_TTL_MS) {
        return false;
      }
    }

    window.sessionStorage.setItem(key, String(now));
  } catch {
    return true;
  }

  return true;
};

const sendEvent = (product: Product, placementId: string, type: 'impression' | 'click') => {
  const tenantId = resolveTenantId(product);
  if (!product?.id || !tenantId) return;

  void adminSettingsAPI.trackSponsoredEvent({
    tenantId,
    productId: String(product.id),
    placementId,
    type,
  }).catch(() => undefined);
};

export const trackSponsoredImpressions = (products: Product[], placementId: string) => {
  products.forEach((product) => {
    if (shouldSendImpression(placementId, String(product.id))) {
      sendEvent(product, placementId, 'impression');
    }
  });
};

export const trackSponsoredClick = (product: Product, placementId: string) => {
  sendEvent(product, placementId, 'click');
};
