export interface DisplayableOrderLike {
  id?: string | null;
  marketplaceOrderId?: string | null;
}

const normalizeString = (value?: string | null) => String(value || '').trim();
const isUuidLike = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const isNumericLike = (value: string) => /^\d+$/.test(value);

const formatMarketplaceCode = (value: string) => {
  if (isNumericLike(value)) return `#${value}`;
  if (isUuidLike(value)) return `#RS-${value.split('-')[0].toUpperCase()}`;
  return `#RS-${value.slice(0, 8).toUpperCase()}`;
};

export const getDisplayOrderCode = (order?: DisplayableOrderLike | null): string => {
  const marketplaceOrderId = normalizeString(order?.marketplaceOrderId);
  if (marketplaceOrderId) return formatMarketplaceCode(marketplaceOrderId);

  const rawId = normalizeString(order?.id);
  if (!rawId) return '#--';

  return `#AC-${rawId.split('-')[0].toUpperCase()}`;
};

export const getDisplayOrderHeading = (order?: DisplayableOrderLike | null): string => {
  const marketplaceOrderId = normalizeString(order?.marketplaceOrderId);
  if (marketplaceOrderId) return `Pedido RS Prólipsi ${getDisplayOrderCode(order)}`;
  return `Pedido CD ${getDisplayOrderCode(order)}`;
};
