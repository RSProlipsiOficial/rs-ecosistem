import React, { useEffect, useMemo, useState } from 'react';
import { marketplaceAPI } from '../../src/services/api';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  GiftIcon,
  PresentationChartBarIcon,
  SparklesIcon,
  SpinnerIcon,
  Squares2X2Icon,
  TrashIcon,
} from '../icons';
import type {
  Product,
  SponsoredDailyMetrics,
  SponsoredPackage,
  SponsoredPlacement,
  SponsoredRequest,
  SponsoredSettings
} from '../../types';

const getTenantId = () => {
  const envTenantId = (import.meta as any).env?.VITE_TENANT_ID || (import.meta as any).env?.VITE_MARKETPLACE_TENANT_ID;
  if (envTenantId) return envTenantId;

  if (typeof window !== 'undefined') {
    const keys = ['tenantId', 'tenant_id', 'marketplaceTenantId', 'storeTenantId'];
    for (const key of keys) {
      const value = window.localStorage.getItem(key);
      if (value) return value;
    }
  }

  return 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
};

const DEFAULT_TENANT_ID = getTenantId();

const extractArrayResponse = (response: any) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.data?.requests)) return response.data.data.requests;
  if (Array.isArray(response?.data?.requests)) return response.data.requests;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const mapProduct = (apiProduct: any): Product => {
  const specifications = apiProduct?.specifications || {};
  const images = Array.isArray(apiProduct?.images) ? apiProduct.images.filter((item: any) => typeof item === 'string') : [];
  const collectionIds = Array.isArray(specifications?.collections) ? specifications.collections.map(String) : [];

  return {
    id: String(apiProduct?.id || ''),
    tenantId: apiProduct?.tenant_id,
    name: String(apiProduct?.name || ''),
    sku: String(apiProduct?.sku || ''),
    description: String(apiProduct?.description || ''),
    shortDescription: String(apiProduct?.short_description || specifications?.shortDescription || ''),
    images,
    videos: Array.isArray(specifications?.videos) ? specifications.videos : [],
    materials: Array.isArray(specifications?.materials) ? specifications.materials : [],
    category: String(apiProduct?.category || ''),
    tags: Array.isArray(apiProduct?.tags) ? apiProduct.tags : [],
    fullPrice: Number(apiProduct?.price ?? apiProduct?.compare_price ?? 0),
    consultantPrice: Number(apiProduct?.member_price ?? apiProduct?.price ?? 0),
    costPrice: Number(apiProduct?.cost_price ?? 0),
    stock: Number(apiProduct?.stock_quantity ?? 0),
    trackStock: specifications?.trackQuantity ?? true,
    status: apiProduct?.published === false || apiProduct?.is_active === false ? 'Inativo' : 'Ativo',
    featuredImage: apiProduct?.featured_image || images[0] || null,
    collectionId: apiProduct?.collection_id ?? collectionIds[0] ?? null,
    collectionIds,
    subcategory: String(specifications?.subcategory || ''),
    supplier: String(specifications?.supplier || ''),
    barcode: String(specifications?.barcode || ''),
    weight: specifications?.weight,
    weightUnit: specifications?.weightUnit || 'kg',
    merchandising: {
      comboProductIds: Array.isArray(specifications?.merchandising?.comboProductIds) ? specifications.merchandising.comboProductIds : [],
      relatedProductIds: Array.isArray(specifications?.merchandising?.relatedProductIds) ? specifications.merchandising.relatedProductIds : [],
      sponsored: {
        enabled: Boolean(specifications?.merchandising?.sponsored?.enabled),
        priority: Number(specifications?.merchandising?.sponsored?.priority ?? 10),
        label: String(specifications?.merchandising?.sponsored?.label ?? 'Patrocinado'),
        placements: Array.isArray(specifications?.merchandising?.sponsored?.placements)
          ? specifications.merchandising.sponsored.placements
          : ['product_detail_related'],
        startsAt: specifications?.merchandising?.sponsored?.startsAt || undefined,
        endsAt: specifications?.merchandising?.sponsored?.endsAt || undefined,
      }
    },
    mlm: {
      qualifiesForCycle: specifications?.mlm?.qualifiesForCycle ?? specifications?.qualifiesForCycle ?? true
    }
  };
};

const buildProductPayload = (product: Product) => ({
  tenantId: product.tenantId || DEFAULT_TENANT_ID,
  name: product.name,
  description: product.description,
  shortDescription: product.shortDescription || '',
  sku: product.sku,
  category: product.category,
  subcategory: product.subcategory || '',
  tags: product.tags,
  price: product.fullPrice,
  memberPrice: product.consultantPrice,
  costPrice: product.costPrice,
  stock: product.stock,
  images: product.images,
  videos: product.videos,
  materials: product.materials,
  featuredImage: product.featuredImage || product.images[0] || null,
  published: product.status === 'Ativo',
  isActive: product.status === 'Ativo',
  trackStock: product.trackStock,
  collectionIds: product.collectionIds || (product.collectionId ? [String(product.collectionId)] : []),
  collections: product.collectionIds || (product.collectionId ? [String(product.collectionId)] : []),
  mlm: product.mlm,
  specifications: {
    shortDescription: product.shortDescription || '',
    trackQuantity: product.trackStock,
    videos: product.videos,
    materials: product.materials,
    subcategory: product.subcategory || '',
    supplier: product.supplier || '',
    barcode: product.barcode || '',
    weight: product.weight,
    weightUnit: product.weightUnit,
    collections: product.collectionIds || (product.collectionId ? [String(product.collectionId)] : []),
    merchandising: product.merchandising,
    mlm: product.mlm,
    qualifiesForCycle: product.mlm?.qualifiesForCycle ?? true,
  }
});

const createPackage = (): SponsoredPackage => ({
  id: `package-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  description: '',
  price: 0,
  durationDays: 7,
  placementIds: ['product_detail_related'],
  maxProducts: 1,
  label: 'Patrocinado',
  priority: 10,
  active: true,
});

const statusClasses: Record<string, string> = {
  rascunho: 'bg-gray-700/60 text-gray-200',
  pendente: 'bg-yellow-500/20 text-yellow-300',
  aprovado: 'bg-green-500/20 text-green-300',
  rejeitado: 'bg-red-500/20 text-red-300',
};

const paymentStatusClasses: Record<string, string> = {
  nao_gerado: 'bg-gray-700/60 text-gray-200',
  pendente: 'bg-yellow-500/20 text-yellow-300',
  pago: 'bg-green-500/20 text-green-300',
  cancelado: 'bg-red-500/20 text-red-300',
  falhou: 'bg-red-500/20 text-red-300',
};

const formatDateInput = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const toCampaignIso = (value: string, endOfDay = false) => {
  if (!value) return undefined;
  return `${value}${endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}`;
};

const formatCtr = (impressions = 0, clicks = 0) => {
  if (!impressions) return '0,00%';
  return `${((clicks / impressions) * 100).toFixed(2).replace('.', ',')}%`;
};

type PremiumMessage = { type: 'success' | 'error' | 'warning'; text: string };
type PremiumSectionKey = 'packages' | 'automation' | 'placements' | 'requests' | 'active' | 'reports';
type PremiumLoadWarningKey = 'settings' | 'requests' | 'products';

const DEFAULT_SPONSORED_SETTINGS: SponsoredSettings = {
  placements: [
    {
      id: 'product_detail_related',
      label: 'Detalhe do produto',
      description: 'Exibe o produto premium na pagina de detalhe do produto.',
      active: true,
    },
    {
      id: 'home_featured_strip',
      label: 'Home principal',
      description: 'Exibe o produto premium na faixa principal da home.',
      active: true,
    },
    {
      id: 'collection_spotlight',
      label: 'Colecoes',
      description: 'Exibe o produto premium dentro das colecoes da loja.',
      active: true,
    },
  ],
  packages: [
    {
      id: 'premium-7d',
      name: 'Kit 7 dias',
      description: 'Impulsionamento por 7 dias no detalhe do produto.',
      price: 79,
      durationDays: 7,
      placementIds: ['product_detail_related'],
      maxProducts: 1,
      label: 'Patrocinado',
      priority: 10,
      active: true,
    },
    {
      id: 'premium-15d',
      name: 'Kit 15 dias',
      description: 'Impulsionamento por 15 dias no detalhe do produto e nas colecoes.',
      price: 150,
      durationDays: 15,
      placementIds: ['product_detail_related', 'collection_spotlight'],
      maxProducts: 1,
      label: 'Patrocinado',
      priority: 8,
      active: true,
    },
    {
      id: 'premium-30d',
      name: 'Kit 30 dias',
      description: 'Impulsionamento por 30 dias no detalhe, colecoes e home.',
      price: 250,
      durationDays: 30,
      placementIds: ['product_detail_related', 'collection_spotlight', 'home_featured_strip'],
      maxProducts: 1,
      label: 'Patrocinado',
      priority: 5,
      active: true,
    },
  ],
  autoApprovePaidRequests: false,
  rotationEnabled: true,
  rotationWindowMinutes: 60,
  maxVisibleProductsPerPlacement: 8,
};

const cloneSponsoredSettings = (value: SponsoredSettings): SponsoredSettings => ({
  ...value,
  placements: (value.placements || []).map((placement) => ({ ...placement })),
  packages: (value.packages || []).map((pkg) => ({
    ...pkg,
    placementIds: [...(pkg.placementIds || [])],
  })),
});

const normalizeSponsoredSettings = (value: any): SponsoredSettings => {
  const defaults = cloneSponsoredSettings(DEFAULT_SPONSORED_SETTINGS);
  const incoming = value || {};
  const incomingPlacements = Array.isArray(incoming.placements) ? incoming.placements : [];
  const incomingPackages = Array.isArray(incoming.packages) ? incoming.packages : [];

  const placements = [
    ...defaults.placements.map((placement) => ({
      ...placement,
      ...(incomingPlacements.find((item: any) => String(item?.id) === placement.id) || {}),
    })),
    ...incomingPlacements
      .filter((item: any) => !defaults.placements.some((placement) => placement.id === String(item?.id)))
      .map((item: any) => ({
        id: String(item?.id || `placement-${Date.now()}`),
        label: String(item?.label || item?.id || 'Novo local'),
        description: String(item?.description || ''),
        active: item?.active !== false,
      })),
  ];

  const packages = incomingPackages.length > 0
    ? incomingPackages.map((pkg: any) => ({
        ...createPackage(),
        ...pkg,
        id: String(pkg?.id || createPackage().id),
        name: String(pkg?.name || 'Novo pacote'),
        description: String(pkg?.description || ''),
        price: Number(pkg?.price || 0),
        durationDays: Number(pkg?.durationDays || 7),
        placementIds: Array.isArray(pkg?.placementIds) && pkg.placementIds.length > 0
          ? pkg.placementIds.map(String)
          : ['product_detail_related'],
        maxProducts: Number(pkg?.maxProducts || 1),
        label: String(pkg?.label || 'Patrocinado'),
        priority: Number(pkg?.priority || 10),
        active: pkg?.active !== false,
      }))
    : defaults.packages;

  return {
    ...defaults,
    ...incoming,
    placements,
    packages,
    autoApprovePaidRequests: Boolean(incoming?.autoApprovePaidRequests ?? defaults.autoApprovePaidRequests),
    rotationEnabled: incoming?.rotationEnabled !== false,
    rotationWindowMinutes: Number(incoming?.rotationWindowMinutes ?? defaults.rotationWindowMinutes ?? 60),
    maxVisibleProductsPerPlacement: Number(incoming?.maxVisibleProductsPerPlacement ?? defaults.maxVisibleProductsPerPlacement ?? 8),
  };
};

const getApiStatus = (error: any) => Number(error?.response?.status || error?.status || 0);

const getApiErrorMessage = (error: any, fallback: string) => {
  const status = getApiStatus(error);
  if (status === 401) {
    return 'Sessao expirada ou sem permissao. Faca login novamente para editar esta area.';
  }

  return String(
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getScopedMetrics = (request: SponsoredRequest, placementFilter: string) => {
  if (placementFilter === 'all') {
    return {
      impressions: Number(request.metrics?.impressions || 0),
      clicks: Number(request.metrics?.clicks || 0),
    };
  }

  const placementMetrics = request.metrics?.byPlacement?.[placementFilter];
  return {
    impressions: Number(placementMetrics?.impressions || 0),
    clicks: Number(placementMetrics?.clicks || 0),
  };
};

const getScopedDailyMetrics = (dailyMetrics: SponsoredDailyMetrics | undefined, placementFilter: string) => {
  if (!dailyMetrics) {
    return { impressions: 0, clicks: 0 };
  }

  if (placementFilter === 'all') {
    return {
      impressions: Number(dailyMetrics.impressions || 0),
      clicks: Number(dailyMetrics.clicks || 0),
    };
  }

  const placementMetrics = dailyMetrics.byPlacement?.[placementFilter];
  return {
    impressions: Number(placementMetrics?.impressions || 0),
    clicks: Number(placementMetrics?.clicks || 0),
  };
};

const Premium: React.FC = () => {
  const [settings, setSettings] = useState<SponsoredSettings>(cloneSponsoredSettings(DEFAULT_SPONSORED_SETTINGS));
  const [requests, setRequests] = useState<SponsoredRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<PremiumMessage | null>(null);
  const [requestOverrides, setRequestOverrides] = useState<Record<string, { campaignStartAt: string; campaignEndAt: string; adminNotes: string }>>({});
  const [draggedPackageId, setDraggedPackageId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<PremiumSectionKey>('packages');
  const [usingFallbackSettings, setUsingFallbackSettings] = useState(false);
  const [sectionWarnings, setSectionWarnings] = useState<Partial<Record<PremiumLoadWarningKey, string>>>({});
  const [reportPlacementFilter, setReportPlacementFilter] = useState('all');

  const hydrateRequestOverrides = (nextRequests: SponsoredRequest[]) => {
    setRequestOverrides(
      nextRequests.reduce((acc, request) => {
        acc[request.id] = {
          campaignStartAt: formatDateInput(request.campaignStartAt),
          campaignEndAt: formatDateInput(request.campaignEndAt),
          adminNotes: request.adminNotes || '',
        };
        return acc;
      }, {} as Record<string, { campaignStartAt: string; campaignEndAt: string; adminNotes: string }>)
    );
  };

  const loadData = async () => {
    setLoading(true);

    const warnings: Partial<Record<PremiumLoadWarningKey, string>> = {};
    const results = await Promise.allSettled([
      marketplaceAPI.getSponsoredSettings(),
      marketplaceAPI.getSponsoredRequests(),
      marketplaceAPI.getProducts({ tenantId: DEFAULT_TENANT_ID }),
    ]);

    const [settingsResult, requestsResult, productsResult] = results;

    if (settingsResult.status === 'fulfilled') {
      const nextSettings = normalizeSponsoredSettings(settingsResult.value.data?.data || settingsResult.value.data || {});
      setSettings(nextSettings);
      setUsingFallbackSettings(false);
    } else {
      warnings.settings = `Configuracoes carregadas no modo local. ${getApiErrorMessage(settingsResult.reason, 'Nao foi possivel carregar os kits.')}`;
      setSettings(cloneSponsoredSettings(DEFAULT_SPONSORED_SETTINGS));
      setUsingFallbackSettings(true);
    }

    if (requestsResult.status === 'fulfilled') {
      const nextRequests = extractArrayResponse(requestsResult.value.data?.data ? requestsResult.value : requestsResult.value)
        .map((item: any) => item as SponsoredRequest);
      setRequests(nextRequests);
      hydrateRequestOverrides(nextRequests);
    } else {
      warnings.requests = getApiErrorMessage(requestsResult.reason, 'Nao foi possivel carregar as solicitacoes de impulsionamento.');
      setRequests([]);
      hydrateRequestOverrides([]);
    }

    if (productsResult.status === 'fulfilled') {
      setProducts(extractArrayResponse(productsResult.value).map(mapProduct));
    } else {
      warnings.products = getApiErrorMessage(productsResult.reason, 'Nao foi possivel carregar os produtos premium ativos.');
      setProducts([]);
    }

    setSectionWarnings(warnings);

    if (Object.keys(warnings).length > 0) {
      const warningMessages = [
        warnings.settings ? 'kits e automacao seguem editaveis nesta tela' : null,
        warnings.requests ? 'solicitacoes e relatorios precisam de login valido' : null,
        warnings.products ? 'lista de produtos premium ativos nao foi atualizada' : null,
      ].filter(Boolean);

      setMessage({
        type: 'warning',
        text: `Alguns dados foram carregados parcialmente: ${warningMessages.join('; ')}.`,
      });
    } else {
      setMessage(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const sponsoredProducts = useMemo(
    () => products.filter((product) => product.merchandising?.sponsored?.enabled),
    [products]
  );

  const placementOptions = useMemo(
    () => [{ id: 'all', label: 'Todos os locais' }, ...settings.placements.map((placement) => ({ id: placement.id, label: placement.label }))],
    [settings.placements]
  );

  const reportSummary = useMemo(() => {
    return requests.reduce((acc, request) => {
      const metrics = getScopedMetrics(request, reportPlacementFilter);
      acc.impressions += metrics.impressions;
      acc.clicks += metrics.clicks;
      if (request.status === 'aprovado') {
        acc.activeCampaigns += 1;
      }
      return acc;
    }, { impressions: 0, clicks: 0, activeCampaigns: 0 });
  }, [requests, reportPlacementFilter]);

  const placementBreakdown = useMemo(() => {
    const totals: Record<string, { impressions: number; clicks: number }> = {};

    requests.forEach((request) => {
      const metrics = request.metrics?.byPlacement || {};
      Object.entries(metrics).forEach(([placementId, placementMetrics]) => {
        if (reportPlacementFilter !== 'all' && placementId !== reportPlacementFilter) {
          return;
        }
        if (!totals[placementId]) {
          totals[placementId] = { impressions: 0, clicks: 0 };
        }
        totals[placementId].impressions += Number(placementMetrics.impressions || 0);
        totals[placementId].clicks += Number(placementMetrics.clicks || 0);
      });
    });

    return Object.entries(totals)
      .map(([placementId, metrics]) => ({
        placementId,
        impressions: metrics.impressions,
        clicks: metrics.clicks,
      }))
      .sort((left, right) => right.impressions - left.impressions);
  }, [requests, reportPlacementFilter]);

  const dailySeries = useMemo(() => {
    const totals: Record<string, { date: string; impressions: number; clicks: number }> = {};

    requests.forEach((request) => {
      Object.entries(request.metrics?.daily || {}).forEach(([dateKey, metrics]) => {
        const scoped = getScopedDailyMetrics(metrics, reportPlacementFilter);
        if (!totals[dateKey]) {
          totals[dateKey] = { date: dateKey, impressions: 0, clicks: 0 };
        }
        totals[dateKey].impressions += scoped.impressions;
        totals[dateKey].clicks += scoped.clicks;
      });
    });

    return Object.values(totals)
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-14);
  }, [requests, reportPlacementFilter]);

  const maxDailyImpressions = useMemo(
    () => dailySeries.reduce((maxValue, item) => Math.max(maxValue, item.impressions), 1),
    [dailySeries]
  );

  const topCampaigns = useMemo(() => {
    return requests
      .map((request) => ({
        request,
        metrics: getScopedMetrics(request, reportPlacementFilter),
      }))
      .sort((left, right) => {
        if (right.metrics.impressions !== left.metrics.impressions) {
          return right.metrics.impressions - left.metrics.impressions;
        }
        return right.metrics.clicks - left.metrics.clicks;
      })
      .slice(0, 8);
  }, [requests, reportPlacementFilter]);

  const sectionItems = useMemo(() => ([
    {
      key: 'packages' as PremiumSectionKey,
      title: 'Kits e pacotes',
      description: 'Preco, duracao e ordem de venda.',
      icon: GiftIcon,
      badge: `${settings.packages.length}`,
      warning: Boolean(sectionWarnings.settings),
    },
    {
      key: 'automation' as PremiumSectionKey,
      title: 'Automacao',
      description: 'Aprovacao, rotacao e limites.',
      icon: CogIcon,
      badge: `${settings.rotationWindowMinutes || 60} min`,
      warning: Boolean(sectionWarnings.settings),
    },
    {
      key: 'placements' as PremiumSectionKey,
      title: 'Locais de exibicao',
      description: 'Onde o patrocinado aparece.',
      icon: Squares2X2Icon,
      badge: `${settings.placements.length}`,
      warning: Boolean(sectionWarnings.settings),
    },
    {
      key: 'requests' as PremiumSectionKey,
      title: 'Impulsionamentos',
      description: 'Pedidos, pagamento e aprovacao.',
      icon: ClipboardDocumentListIcon,
      badge: `${requests.length}`,
      warning: Boolean(sectionWarnings.requests),
    },
    {
      key: 'reports' as PremiumSectionKey,
      title: 'Relatorios',
      description: 'Graficos, CTR e performance.',
      icon: PresentationChartBarIcon,
      badge: formatCtr(reportSummary.impressions, reportSummary.clicks),
      warning: Boolean(sectionWarnings.requests),
    },
    {
      key: 'active' as PremiumSectionKey,
      title: 'Produtos premium',
      description: 'Itens ativos na vitrine.',
      icon: SparklesIcon,
      badge: `${sponsoredProducts.length}`,
      warning: Boolean(sectionWarnings.products),
    },
  ]), [reportSummary.clicks, reportSummary.impressions, requests.length, sectionWarnings.products, sectionWarnings.requests, sectionWarnings.settings, settings.packages.length, settings.placements.length, settings.rotationWindowMinutes, sponsoredProducts.length]);

  const updatePlacement = (placementId: string, field: keyof SponsoredPlacement, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      placements: prev.placements.map((placement) =>
        placement.id === placementId ? { ...placement, [field]: value } : placement
      )
    }));
  };

  const updatePackage = (packageId: string, field: keyof SponsoredPackage, value: string | number | boolean | string[]) => {
    setSettings((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.id === packageId ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const togglePackagePlacement = (packageId: string, placementId: string) => {
    setSettings((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.id !== packageId) return pkg;
        const current = new Set(pkg.placementIds || []);
        if (current.has(placementId)) current.delete(placementId);
        else current.add(placementId);
        return { ...pkg, placementIds: Array.from(current) };
      })
    }));
  };

  const movePackage = (packageId: string, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const currentIndex = prev.packages.findIndex((pkg) => pkg.id === packageId);
      if (currentIndex === -1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.packages.length) return prev;

      const nextPackages = [...prev.packages];
      const [selectedPackage] = nextPackages.splice(currentIndex, 1);
      nextPackages.splice(targetIndex, 0, selectedPackage);

      return {
        ...prev,
        packages: nextPackages,
      };
    });
  };

  const duplicatePackage = (packageId: string) => {
    setSettings((prev) => {
      const packageIndex = prev.packages.findIndex((pkg) => pkg.id === packageId);
      if (packageIndex === -1) return prev;

      const sourcePackage = prev.packages[packageIndex];
      const clonedPackage: SponsoredPackage = {
        ...sourcePackage,
        ...createPackage(),
        name: sourcePackage.name ? `${sourcePackage.name} (copia)` : 'Novo pacote (copia)',
        description: sourcePackage.description,
        price: sourcePackage.price,
        durationDays: sourcePackage.durationDays,
        placementIds: [...(sourcePackage.placementIds || [])],
        maxProducts: sourcePackage.maxProducts,
        label: sourcePackage.label,
        priority: sourcePackage.priority,
        active: sourcePackage.active,
      };

      const nextPackages = [...prev.packages];
      nextPackages.splice(packageIndex + 1, 0, clonedPackage);

      return {
        ...prev,
        packages: nextPackages,
      };
    });
  };

  const deletePackage = (packageId: string) => {
    setSettings((prev) => ({
      ...prev,
      packages: prev.packages.filter((pkg) => pkg.id !== packageId),
    }));
  };

  const handlePackageDrop = (targetPackageId: string) => {
    if (!draggedPackageId || draggedPackageId === targetPackageId) {
      setDraggedPackageId(null);
      return;
    }

    setSettings((prev) => {
      const sourceIndex = prev.packages.findIndex((pkg) => pkg.id === draggedPackageId);
      const targetIndex = prev.packages.findIndex((pkg) => pkg.id === targetPackageId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const nextPackages = [...prev.packages];
      const [selectedPackage] = nextPackages.splice(sourceIndex, 1);
      nextPackages.splice(targetIndex, 0, selectedPackage);

      return {
        ...prev,
        packages: nextPackages,
      };
    });

    setDraggedPackageId(null);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const normalizedSettings = normalizeSponsoredSettings(settings);
      await marketplaceAPI.updateSponsoredSettings(normalizedSettings);
      setSettings(normalizedSettings);
      setUsingFallbackSettings(false);
      setMessage({ type: 'success', text: 'Configuracoes de produto premium salvas.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Nao foi possivel salvar as configuracoes de patrocinio.') });
    } finally {
      setSaving(false);
    }
  };

  const updateRequestOverride = (requestId: string, field: 'campaignStartAt' | 'campaignEndAt' | 'adminNotes', value: string) => {
    setRequestOverrides((prev) => ({
      ...prev,
      [requestId]: {
        campaignStartAt: prev[requestId]?.campaignStartAt || '',
        campaignEndAt: prev[requestId]?.campaignEndAt || '',
        adminNotes: prev[requestId]?.adminNotes || '',
        [field]: value,
      }
    }));
  };

  const handleSyncPaymentStatus = async (request: SponsoredRequest) => {
    try {
      setMessage(null);
      const response = await marketplaceAPI.syncSponsoredRequestPaymentStatus(request.id, request.tenantId);
      const updatedRequest = (response.data?.data || response.data || null) as SponsoredRequest | null;
      if (!updatedRequest) {
        throw new Error('Resposta de pagamento invalida');
      }

      setRequests((prev) => prev.map((item) => item.id === request.id ? updatedRequest : item));
      setRequestOverrides((prev) => ({
        ...prev,
        [request.id]: {
          campaignStartAt: formatDateInput(updatedRequest.campaignStartAt),
          campaignEndAt: formatDateInput(updatedRequest.campaignEndAt),
          adminNotes: updatedRequest.adminNotes || prev[request.id]?.adminNotes || '',
        }
      }));
      setMessage({ type: 'success', text: 'Status do pagamento atualizado.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Nao foi possivel atualizar o pagamento.') });
    }
  };

  const handleRequestDecision = async (request: SponsoredRequest, status: 'aprovado' | 'rejeitado') => {
    try {
      setMessage(null);
      const relatedPackage = settings.packages.find((pkg) => pkg.id === request.packageId);
      const override = requestOverrides[request.id];
      await marketplaceAPI.updateSponsoredRequest(request.id, {
        tenantId: request.tenantId,
        status,
        placementIds: relatedPackage?.placementIds || request.placementIds,
        label: relatedPackage?.label || request.packageName,
        priority: relatedPackage?.priority ?? 10,
        campaignStartAt: toCampaignIso(override?.campaignStartAt || formatDateInput(request.campaignStartAt)),
        campaignEndAt: toCampaignIso(override?.campaignEndAt || formatDateInput(request.campaignEndAt), true),
        adminNotes: override?.adminNotes || request.adminNotes,
      });

      await loadData();
      setMessage({ type: 'success', text: `Solicitacao ${status === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Nao foi possivel atualizar a solicitacao.') });
    }
  };

  const removeSponsoredFlag = async (product: Product) => {
    try {
      setMessage(null);
      const nextProduct: Product = {
        ...product,
        merchandising: {
          comboProductIds: product.merchandising?.comboProductIds || [],
          relatedProductIds: product.merchandising?.relatedProductIds || [],
          sponsored: {
            ...(product.merchandising?.sponsored || {}),
            enabled: false,
          }
        }
      };

      await marketplaceAPI.updateProduct(product.id, buildProductPayload(nextProduct));
      setProducts((prev) => prev.map((item) => item.id === product.id ? nextProduct : item));
      setMessage({ type: 'success', text: 'Produto removido da vitrine premium.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(error, 'Nao foi possivel remover o destaque premium.') });
    }
  };

  const renderWarningBox = (warning?: string) => {
    if (!warning) return null;

    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
        <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
        <span>{warning}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <ArrowTrendingUpIcon className="h-7 w-7 text-yellow-500" />
            Produto Premium / Patrocinado
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Organize kits, locais de exibicao, solicitacoes e relatorios da vitrine premium.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-black/60 px-4 py-2.5 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-60"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar dados
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-2.5 font-bold text-black hover:bg-yellow-400 disabled:opacity-60"
          >
            {saving ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            Salvar configuracoes
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-500/30 bg-green-500/10 text-green-200'
            : message.type === 'warning'
              ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-black/50 p-10 text-center text-gray-200">
          <span className="inline-flex items-center gap-2">
            <SpinnerIcon className="h-5 w-5 animate-spin text-yellow-400" />
            Carregando produto premium...
          </span>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-yellow-500/20 bg-black/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Submenu interno</p>
              <div className="mt-4 space-y-2">
                {sectionItems.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.key;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => setActiveSection(section.key)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        isActive
                          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100'
                          : 'border-zinc-800 bg-zinc-950/70 text-gray-200 hover:border-yellow-500/20 hover:bg-zinc-900'
                      }`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isActive ? 'bg-yellow-500/20 text-yellow-300' : 'bg-zinc-900 text-gray-300'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{section.title}</p>
                          {section.warning && (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-200">
                              aviso
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{section.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                          isActive ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-gray-300'
                        }`}>
                          {section.badge}
                        </span>
                        <ChevronRightIcon className={`h-4 w-4 ${isActive ? 'text-yellow-300' : 'text-gray-500'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-black/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Resumo rapido</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Kits ativos</p>
                  <p className="mt-2 text-2xl font-bold text-white">{settings.packages.filter((pkg) => pkg.active).length}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Campanhas ativas</p>
                  <p className="mt-2 text-2xl font-bold text-white">{reportSummary.activeCampaigns}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">CTR medio</p>
                  <p className="mt-2 text-2xl font-bold text-white">{formatCtr(reportSummary.impressions, reportSummary.clicks)}</p>
                </div>
              </div>
              {usingFallbackSettings && (
                <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-3 text-xs text-yellow-100">
                  Os kits permaneceram visiveis em modo local. Salve novamente quando o token estiver valido.
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            {activeSection === 'packages' && (
              <section className="rounded-2xl border border-yellow-500/20 bg-black/50 p-6">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Kits e pacotes</p>
                    <h3 className="mt-2 text-xl font-bold text-white">Pacotes visiveis para venda</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Defina valor, duracao, prioridade, quantidade de produtos e locais de exibicao de cada kit.
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings((prev) => ({ ...prev, packages: [...prev.packages, createPackage()] }))}
                    className="inline-flex items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/20"
                  >
                    Nova regra / novo pacote
                  </button>
                </div>

                {renderWarningBox(sectionWarnings.settings)}
                <div className="space-y-4">
                  {settings.packages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      draggable
                      onDragStart={() => setDraggedPackageId(pkg.id)}
                      onDragEnd={() => setDraggedPackageId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handlePackageDrop(pkg.id)}
                      className={`rounded-2xl border bg-zinc-950/70 p-5 transition ${
                        draggedPackageId === pkg.id
                          ? 'border-yellow-500/50 ring-1 ring-yellow-500/40'
                          : 'border-zinc-800'
                      }`}
                    >
                      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                            Pacote {index + 1} - arraste para reordenar
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-white">{pkg.name || 'Novo pacote'}</h4>
                          <p className="mt-1 text-sm text-gray-400">
                            Esse kit aparece no impulsionamento do lojista e do consultor.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => duplicatePackage(pkg.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200 hover:bg-yellow-500/20"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                            Duplicar
                          </button>
                          <button
                            type="button"
                            onClick={() => movePackage(pkg.id, 'up')}
                            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-200 hover:bg-zinc-900"
                          >
                            Subir
                          </button>
                          <button
                            type="button"
                            onClick={() => movePackage(pkg.id, 'down')}
                            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-200 hover:bg-zinc-900"
                          >
                            Descer
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePackage(pkg.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 hover:bg-red-500/10"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Excluir
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Nome do pacote</label>
                          <input value={pkg.name} onChange={(event) => updatePackage(pkg.id, 'name', event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Preco</label>
                          <input type="number" min="0" step="0.01" value={pkg.price} onChange={(event) => updatePackage(pkg.id, 'price', Number(event.target.value || 0))} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Duracao (dias)</label>
                          <input type="number" min="1" value={pkg.durationDays} onChange={(event) => updatePackage(pkg.id, 'durationDays', Number(event.target.value || 1))} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Maximo de produtos</label>
                          <input type="number" min="1" value={pkg.maxProducts} onChange={(event) => updatePackage(pkg.id, 'maxProducts', Number(event.target.value || 1))} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Selo exibido</label>
                          <input value={pkg.label} onChange={(event) => updatePackage(pkg.id, 'label', event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Prioridade</label>
                          <input type="number" min="1" value={pkg.priority} onChange={(event) => updatePackage(pkg.id, 'priority', Number(event.target.value || 1))} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Descricao comercial</label>
                        <textarea value={pkg.description} onChange={(event) => updatePackage(pkg.id, 'description', event.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Locais liberados no kit</p>
                        <div className="flex flex-wrap gap-3">
                          {settings.placements.filter((placement) => placement.active).map((placement) => (
                            <label key={placement.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-gray-200">
                              <input type="checkbox" checked={pkg.placementIds.includes(placement.id)} onChange={() => togglePackagePlacement(pkg.id, placement.id)} />
                              {placement.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-xl border border-yellow-500/15 bg-yellow-500/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">Status de venda</p>
                          <p className="text-xs text-gray-400">Quando inativo, o pacote sai da tela de impulsionamento.</p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                          <input type="checkbox" checked={pkg.active} onChange={(event) => updatePackage(pkg.id, 'active', event.target.checked)} />
                          Pacote ativo
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'automation' && (
              <section className="rounded-2xl border border-yellow-500/20 bg-black/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Automacao</p>
                <h3 className="mt-2 text-xl font-bold text-white">Regras operacionais do patrocinado</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Controle aprovacao automatica, rotacao dos anuncios e limite maximo exibido por bloco.
                </p>

                {renderWarningBox(sectionWarnings.settings)}

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">Aprovacao automatica</p>
                        <p className="mt-1 text-sm text-gray-400">Se o pagamento for confirmado, a campanha sobe sem acao manual.</p>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                        <input type="checkbox" checked={Boolean(settings.autoApprovePaidRequests)} onChange={(event) => setSettings((prev) => ({ ...prev, autoApprovePaidRequests: event.target.checked }))} />
                        Ativar
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">Rotacao dos patrocinados</p>
                        <p className="mt-1 text-sm text-gray-400">Produtos com prioridade semelhante revezam conforme a janela configurada.</p>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                        <input type="checkbox" checked={settings.rotationEnabled !== false} onChange={(event) => setSettings((prev) => ({ ...prev, rotationEnabled: event.target.checked }))} />
                        Ativar
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Janela de rotacao (minutos)</label>
                    <input type="number" min="5" value={Number(settings.rotationWindowMinutes ?? 60)} onChange={(event) => setSettings((prev) => ({ ...prev, rotationWindowMinutes: Number(event.target.value || 60) }))} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Maximo exibido por local</label>
                    <input type="number" min="1" value={Number(settings.maxVisibleProductsPerPlacement ?? 8)} onChange={(event) => setSettings((prev) => ({ ...prev, maxVisibleProductsPerPlacement: Number(event.target.value || 8) }))} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'placements' && (
              <section className="rounded-2xl border border-yellow-500/20 bg-black/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Locais de exibicao</p>
                <h3 className="mt-2 text-xl font-bold text-white">Onde os produtos premium aparecem</h3>
                <p className="mt-2 text-sm text-gray-400">Os IDs tecnicos sao usados pelo frontend. Aqui voce edita nome, descricao e status.</p>

                {renderWarningBox(sectionWarnings.settings)}

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {settings.placements.map((placement) => (
                    <div key={placement.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">ID tecnico</label>
                      <input value={placement.id} disabled className="mb-4 w-full rounded-lg border border-zinc-800 bg-black/60 px-3 py-2 text-sm text-gray-400" />
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Nome exibido</label>
                      <input value={placement.label} onChange={(event) => updatePlacement(placement.id, 'label', event.target.value)} className="mb-4 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Descricao</label>
                      <textarea value={placement.description} onChange={(event) => updatePlacement(placement.id, 'description', event.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                      <div className="mt-4 flex items-center justify-between rounded-xl border border-yellow-500/15 bg-yellow-500/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">Status do local</p>
                          <p className="text-xs text-gray-400">Desative se nao quiser vender esse placement.</p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                          <input type="checkbox" checked={placement.active} onChange={(event) => updatePlacement(placement.id, 'active', event.target.checked)} />
                          Ativo
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'requests' && (
              <section className="rounded-2xl border border-yellow-500/20 bg-black/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Impulsionamentos</p>
                <h3 className="mt-2 text-xl font-bold text-white">Solicitacoes recebidas</h3>
                <p className="mt-2 text-sm text-gray-400">Acompanhe pagamento, agenda de campanha, objetivo e aprovacao do produto premium.</p>

                {renderWarningBox(sectionWarnings.requests)}

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Impressoes</p>
                    <p className="mt-3 text-2xl font-bold text-white">{reportSummary.impressions}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Cliques</p>
                    <p className="mt-3 text-2xl font-bold text-white">{reportSummary.clicks}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">CTR medio</p>
                    <p className="mt-3 text-2xl font-bold text-white">{formatCtr(reportSummary.impressions, reportSummary.clicks)}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Campanhas ativas</p>
                    <p className="mt-3 text-2xl font-bold text-white">{reportSummary.activeCampaigns}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {requests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-700 px-4 py-8 text-sm text-gray-500">
                      Nenhuma solicitacao recebida ainda.
                    </div>
                  ) : requests.map((request) => {
                    const packageMatch = settings.packages.find((pkg) => pkg.id === request.packageId);
                    return (
                      <div key={request.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1 space-y-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-semibold text-white">{request.productName}</h4>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusClasses[request.status] || statusClasses.rascunho}`}>{request.status}</span>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${paymentStatusClasses[request.paymentStatus || 'nao_gerado'] || paymentStatusClasses.nao_gerado}`}>pagamento {request.paymentStatus || 'nao_gerado'}</span>
                              </div>
                              <p className="mt-2 text-sm text-gray-400">{request.packageName} - {request.durationDays} dias - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(request.packagePrice || 0))}</p>
                              <p className="mt-1 text-xs text-gray-500">Tenant {request.tenantId} - solicitado em {new Date(request.requestedAt).toLocaleString('pt-BR')}</p>
                              {request.objective && <p className="mt-2 text-sm text-gray-300">Objetivo: {request.objective}</p>}
                              {request.notes && <p className="text-sm text-gray-400">Observacao: {request.notes}</p>}
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Impressoes</p>
                                <p className="mt-2 text-lg font-bold text-white">{Number(request.metrics?.impressions || 0)}</p>
                              </div>
                              <div className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Cliques</p>
                                <p className="mt-2 text-lg font-bold text-white">{Number(request.metrics?.clicks || 0)}</p>
                              </div>
                              <div className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">CTR</p>
                                <p className="mt-2 text-lg font-bold text-white">{formatCtr(Number(request.metrics?.impressions || 0), Number(request.metrics?.clicks || 0))}</p>
                              </div>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-3">
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Inicio</label>
                                <input type="date" value={requestOverrides[request.id]?.campaignStartAt || ''} onChange={(event) => updateRequestOverride(request.id, 'campaignStartAt', event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Fim</label>
                                <input type="date" value={requestOverrides[request.id]?.campaignEndAt || ''} onChange={(event) => updateRequestOverride(request.id, 'campaignEndAt', event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Locais do pacote</label>
                                <div className="rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-gray-200">{(packageMatch?.placementIds || request.placementIds || []).join(', ') || '-'}</div>
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Notas do admin</label>
                              <textarea rows={2} value={requestOverrides[request.id]?.adminNotes || ''} onChange={(event) => updateRequestOverride(request.id, 'adminNotes', event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white" />
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-3 xl:w-[260px]">
                            <button onClick={() => handleSyncPaymentStatus(request)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/20">
                              <ArrowPathIcon className="h-4 w-4" />
                              Atualizar pagamento
                            </button>
                            <button onClick={() => handleRequestDecision(request, 'aprovado')} disabled={request.status === 'aprovado' || request.paymentStatus !== 'pago'} className="rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50">
                              Aprovar campanha
                            </button>
                            <button onClick={() => handleRequestDecision(request, 'rejeitado')} disabled={request.status === 'rejeitado'} className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-50">
                              Rejeitar campanha
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {activeSection === 'reports' && (
              <section className="rounded-2xl border border-yellow-500/20 bg-black/50 p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Relatorios</p>
                    <h3 className="mt-2 text-xl font-bold text-white">Performance por dia, local e campanha</h3>
                    <p className="mt-2 text-sm text-gray-400">Veja a constancia das campanhas, filtre o local e acompanhe CTR e volume.</p>
                  </div>
                  <div className="w-full max-w-sm">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Filtrar local de exibicao</label>
                    <select value={reportPlacementFilter} onChange={(event) => setReportPlacementFilter(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white">
                      {placementOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {renderWarningBox(sectionWarnings.requests)}

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"><p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Impressoes</p><p className="mt-3 text-2xl font-bold text-white">{reportSummary.impressions}</p></div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"><p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Cliques</p><p className="mt-3 text-2xl font-bold text-white">{reportSummary.clicks}</p></div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"><p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">CTR medio</p><p className="mt-3 text-2xl font-bold text-white">{formatCtr(reportSummary.impressions, reportSummary.clicks)}</p></div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"><p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Campanhas ativas</p><p className="mt-3 text-2xl font-bold text-white">{reportSummary.activeCampaigns}</p></div>
                </div>

                <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-white">Grafico por dia</p>
                      <p className="text-xs text-gray-500">Ultimos dias com metricas registradas.</p>
                    </div>

                    {dailySeries.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-8 text-sm text-gray-500">Ainda nao existem metricas diarias para o filtro selecionado.</div>
                    ) : (
                      <div className="flex h-[280px] items-end gap-3 overflow-x-auto pb-2">
                        {dailySeries.map((item) => {
                          const height = Math.max(16, Math.round((item.impressions / maxDailyImpressions) * 210));
                          return (
                            <div key={item.date} className="flex min-w-[70px] flex-1 flex-col items-center gap-2">
                              <div className="flex h-[220px] items-end">
                                <div className="w-10 rounded-t-lg bg-gradient-to-t from-yellow-700 via-yellow-500 to-yellow-300" style={{ height: `${height}px` }} title={`${item.date} - ${item.impressions} impressoes`} />
                              </div>
                              <div className="text-center">
                                <p className="text-[11px] font-semibold text-white">{item.date.slice(8, 10)}/{item.date.slice(5, 7)}</p>
                                <p className="text-[10px] text-gray-500">{item.impressions} imp.</p>
                                <p className="text-[10px] text-yellow-300">{formatCtr(item.impressions, item.clicks)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                      <p className="text-sm font-semibold text-white">Filtro por local</p>
                      <p className="mt-1 text-xs text-gray-500">Distribuicao total por placement.</p>
                      <div className="mt-4 space-y-3">
                        {placementBreakdown.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-sm text-gray-500">Nenhuma metrica de local disponivel.</div>
                        ) : placementBreakdown.map((item) => (
                          <div key={item.placementId} className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold text-white">{item.placementId}</p>
                              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">{formatCtr(item.impressions, item.clicks)}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">{item.impressions} impressoes - {item.clicks} cliques</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                      <p className="text-sm font-semibold text-white">Relatorio por campanha</p>
                      <p className="mt-1 text-xs text-gray-500">Top campanhas no filtro atual.</p>
                      <div className="mt-4 space-y-3">
                        {topCampaigns.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-sm text-gray-500">Nenhuma campanha com metricas ainda.</div>
                        ) : topCampaigns.map(({ request, metrics }) => (
                          <div key={request.id} className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{request.productName}</p>
                                <p className="mt-1 text-xs text-gray-500">{request.packageName}</p>
                              </div>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusClasses[request.status] || statusClasses.rascunho}`}>{request.status}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-2"><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Imp.</p><p className="mt-1 text-sm font-bold text-white">{metrics.impressions}</p></div>
                              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-2"><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Cliques</p><p className="mt-1 text-sm font-bold text-white">{metrics.clicks}</p></div>
                              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-2"><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">CTR</p><p className="mt-1 text-sm font-bold text-yellow-300">{formatCtr(metrics.impressions, metrics.clicks)}</p></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'active' && (
              <section className="rounded-2xl border border-yellow-500/20 bg-black/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">Produtos premium ativos</p>
                <h3 className="mt-2 text-xl font-bold text-white">Itens em destaque agora</h3>
                <p className="mt-2 text-sm text-gray-400">Lista rapida do que ja esta com patrocinio ativo neste tenant.</p>

                {renderWarningBox(sectionWarnings.products)}

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {sponsoredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-700 px-4 py-8 text-sm text-gray-500">Nenhum produto premium ativo no tenant atual.</div>
                  ) : sponsoredProducts.map((product) => (
                    <div key={String(product.id)} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <div className="flex items-start gap-4">
                        {product.featuredImage ? (
                          <img src={product.featuredImage} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-900 text-xs text-gray-500">Sem imagem</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-white">{product.name}</p>
                          <p className="mt-1 text-sm text-gray-400">Selo: {product.merchandising?.sponsored?.label || 'Patrocinado'}</p>
                          <p className="text-xs text-gray-500">Prioridade: {product.merchandising?.sponsored?.priority ?? 10}</p>
                          <p className="text-xs text-gray-500">Locais: {(product.merchandising?.sponsored?.placements || []).join(', ') || '-'}</p>
                          <p className="text-xs text-gray-500">Inicio: {formatDateInput(product.merchandising?.sponsored?.startsAt) || '-'}</p>
                          <p className="text-xs text-gray-500">Fim: {formatDateInput(product.merchandising?.sponsored?.endsAt) || '-'}</p>
                        </div>
                        <button onClick={() => removeSponsoredFlag(product)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 hover:bg-red-500/10">
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
