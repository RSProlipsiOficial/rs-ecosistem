import type { Product, SponsoredSettings } from '../types';

const toDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

export const normalizeSponsoredDisplaySettings = (settings?: Partial<SponsoredSettings> | null) => ({
  rotationEnabled: settings?.rotationEnabled !== false,
  rotationWindowMinutes: Math.max(5, Number(settings?.rotationWindowMinutes ?? 60) || 60),
  maxVisibleProductsPerPlacement: Math.max(1, Number(settings?.maxVisibleProductsPerPlacement ?? 8) || 8),
});

export const isSponsoredCampaignActive = (
  product: Product,
  placementId: string,
  options?: { collectionId?: string | number | null }
) => {
  const sponsored = product.merchandising?.sponsored;
  if (!sponsored?.enabled) return false;

  const placements = Array.isArray(sponsored.placements) ? sponsored.placements : [];
  if (!placements.includes(placementId)) return false;

  const now = new Date();
  const startsAt = toDate(sponsored.startsAt);
  const endsAt = toDate(sponsored.endsAt);

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  if (options?.collectionId) {
    const targetCollectionId = String(options.collectionId);
    const productCollectionIds = new Set<string>();

    if (product.collectionId) {
      productCollectionIds.add(String(product.collectionId));
    }

    (product.collectionIds || []).forEach((collectionId) => {
      if (collectionId !== null && collectionId !== undefined) {
        productCollectionIds.add(String(collectionId));
      }
    });

    if (!productCollectionIds.has(targetCollectionId)) return false;
  }

  return true;
};

export const rotateSponsoredProducts = (
  products: Product[],
  placementId: string,
  settings?: Partial<SponsoredSettings> | null,
  options?: { maxVisible?: number }
) => {
  const displaySettings = normalizeSponsoredDisplaySettings(settings);
  const maxVisible = Math.max(
    1,
    Number(options?.maxVisible ?? displaySettings.maxVisibleProductsPerPlacement) || displaySettings.maxVisibleProductsPerPlacement
  );

  if (!displaySettings.rotationEnabled || products.length <= 1) {
    return products.slice(0, maxVisible);
  }

  const bucket = Math.floor(Date.now() / (displaySettings.rotationWindowMinutes * 60 * 1000));
  const placementSeed = hashString(placementId);
  const grouped = new Map<number, Product[]>();

  products.forEach((product) => {
    const priority = Number(product.merchandising?.sponsored?.priority ?? 999);
    const currentGroup = grouped.get(priority) || [];
    currentGroup.push(product);
    grouped.set(priority, currentGroup);
  });

  const rotated = Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([, group]) => {
      if (group.length <= 1) return group;
      const offset = (bucket + placementSeed) % group.length;
      return [...group.slice(offset), ...group.slice(0, offset)];
    });

  return rotated.slice(0, maxVisible);
};
