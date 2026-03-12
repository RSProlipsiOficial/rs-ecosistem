

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import FeaturedCollections from './components/FeaturedCollections';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import ConsultantLogin from './components/ConsultantLogin';
import ConsultantStore from './components/ConsultantStore';
import ManageProducts from './components/ManageProducts';
import AddEditProduct from './components/AddEditProduct';
import ManageInventory from './components/ManageInventory';
import ManageOrders from './components/ManageOrders';
import OrderDetail from './components/OrderDetail';
import CustomerChatWidget from './components/CustomerChatWidget';
import ManageReturns from './components/ManageReturns';
import ReturnDetail from './components/ReturnDetail';
import ManageDropshippingOrders from './components/ManageDropshippingOrders';
import StoreBannerEditor from './components/AnalyticsDashboard';
import ManagePromotions from './components/ManagePromotions';
import AddEditCoupon from './components/AddEditCoupon';
import VirtualOfficeMarketplace from './components/VirtualOfficeMarketplace';
import VirtualOfficeDropshipping from './components/VirtualOfficeDropshipping';
import StorefrontEditor from './components/StorefrontEditor';
import ManageAffiliateLinks from './components/ManageAffiliateLinks';
import ManageMarketingPixels from './components/ManageMarketingPixels';
import LinkShortener from './components/LinkShortener';
import AddEditMarketingPixel from './components/AddEditMarketingPixel';
import { AdminLayout } from './components/AdminLayout';
import Carousel from './components/Carousel';
import Offers from './components/Offers';
import MidPageBanner from './components/MidPageBanner';
import ManagePayments from './components/ManagePayments';
import ManageShipping from './components/ManageShipping';
import CartView from './components/CartView';
import FloatingCartStatus from './components/FloatingCartStatus';
import CheckoutView from './components/CheckoutView';
import CDSelectionModal from './components/CDSelectionModal';
import SellerRegistration from './components/SellerRegistration';
import BannerDashboard from './components/SalesReport';
import DashboardEditor from './components/VirtualOfficeMyData';
import ManageCollections from './components/ManageCollections';
import AddEditCollection from './components/AddEditCollection';
import CollectionView from './components/CollectionView';
import CustomerLogin from './components/CustomerLogin';
import CustomerRegister from './components/CustomerRegister';
import CustomerAccount from './components/CustomerAccount';
import CustomerForgotPassword from './components/CustomerForgotPassword';
import Bestsellers from './components/Bestsellers';
import DropshippingCatalog from './components/DropshippingCatalog';
import ManageAffiliates from './components/ManageAffiliates';
import WalletSalesReport from './components/WalletSalesReport';
import WalletOverview from './components/WalletOverview';
import WalletTransfers from './components/WalletTransfers';
import WalletCharges from './components/WalletCharges';
import WalletSettingsComponent from './components/WalletSettings';
import UserProfileEditor from './components/UserProfileEditor';
import ConsultantProfileForm from './components/ConsultantProfileForm';
import RSStudio from './components/RSStudio';
import CommunicationCenter from './components/CommunicationCenter';
import OrderConfirmation from './components/OrderConfirmation';
import ManageOrderBump from './components/ManageOrderBump';
import ManageUpsell from './components/ManageUpsell';
import ManagePromotionBoost from './components/ManagePromotionBoost';
import ManageAbandonedCarts from './components/ManageAbandonedCarts';
import ManageReviews from './components/ManageReviews';
import ManageAnnouncements from './components/ManageAnnouncements';
import AddEditAnnouncement from './components/AddEditAnnouncement';
import ManageTrainings from './components/ManageTrainings';
import AddEditTraining from './components/AddEditTraining';
import TrainingModuleDetail from './components/TrainingModuleDetail';
import ManageMarketingAssets from './components/ManageMarketingAssets';
// Lazy loaded apps to reduce initial bundle size
const RSCDAdminApp = React.lazy(() => import('./RS-CDS/AppWrapper'));
// const CheckoutProApp = React.lazy(() => import('./checkout-pro-rs-prÃ³lipsi/App')); // Commented out - folder not found
const RSControleDropApp = React.lazy(() => import('./rs-controle-drop/AppWrapper'));
// import { CheckoutProvider } from './checkout-pro-rs-prÃ³lipsi/context/CheckoutContext'; // Commented out - folder not found
import AddEditMarketingAsset from './components/AddEditMarketingAsset';
import CustomerWishlist from './components/CustomerWishlist';
import ProductQA from './components/ProductQA';
import RecentlyViewed from './components/RecentlyViewed';
import OrderLookupView from './components/OrderLookupView';
import OrderStatusView from './components/OrderStatusView';
import { storeCustomizationAPI, consultantAPI, productsAPI, ordersAPI, collectionsAPI, marketingPixelsAPI, distributorsAPI, customersAPI, dashboardLayoutAPI, careerAPI, adminSettingsAPI, sigmaAPI } from './services/marketplaceAPI';
import { supabase } from './services/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as reviewService from './services/reviewService';
import MarketplaceAdminDashboard from './components/MarketplaceAdminDashboard';
import MarketplaceAdminOrders from './components/MarketplaceAdminOrders';
import MarketplaceAdminProducts from './components/MarketplaceAdminProducts';
import MarketplaceAdminFinancial from './components/MarketplaceAdminFinancial';
import { isSponsoredCampaignActive, rotateSponsoredProducts } from './utils/sponsored';


// import './rs-controle-drop/styles.css'; // Commented out - folder not found

import { Product, View, Order, ReturnRequest, DropshippingOrder, DropshippingProduct, Coupon, MarketingPixel, PartnerStore, ShortenedLink, StoreCustomization, PaymentSettings, ShippingSettings, CartItem, CompensationSettings, Banner, DashboardSettings, UserProfile, Collection, Customer, NetworkActivityItem, Charge, WalletSettings, ProductVariant, OrderItem, AbandonedCart, Review, Announcement, Training, MarketingAsset, Question, Answer, Distributor, DistributorInventoryItem, SponsoredSettings, CheckoutRoutingContext, ProductPricingTier } from './types';

import { initialStoreCustomization } from './data/storeCustomization';

const initialDashboardBanners: Banner[] = [];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const resolveConsultantNumericCode = async (params: { slug?: string | null; email?: string | null; name?: string | null; }): Promise<string> => {
    const candidates = [params.slug, params.email, params.name]
        .map(value => String(value || '').trim())
        .filter(Boolean);

    for (const candidate of candidates) {
        try {
            const response = await fetch(`${API_URL}/admin/consultor/search?q=${encodeURIComponent(candidate)}`);
            const payload = await response.json();
            const results = Array.isArray(payload?.results) ? payload.results : [];
            const match = results.find((item: any) => {
                const sameEmail = params.email && item?.email && String(item.email).trim().toLowerCase() === String(params.email).trim().toLowerCase();
                const sameName = params.name && item?.nome && String(item.nome).trim().toLowerCase() === String(params.name).trim().toLowerCase();
                return sameEmail || sameName || candidate.toLowerCase() === String(item?.username || '').trim().toLowerCase();
            }) || results[0];

            if (match?.numericId) {
                return String(match.numericId);
            }
        } catch {
            // noop
        }
    }

    return '';
};

type MarketplaceReferrerProfile = {
    id: string;
    numericId: string;
    loginId: string;
    name: string;
};

const resolveMarketplaceReferrer = async (params: { slug?: string | null; email?: string | null; name?: string | null; }): Promise<MarketplaceReferrerProfile | null> => {
    const candidates = [params.slug, params.email, params.name]
        .map(value => String(value || '').trim())
        .filter(Boolean);

    for (const candidate of candidates) {
        try {
            const response = await fetch(`${API_URL}/admin/consultor/search?q=${encodeURIComponent(candidate)}`);
            const payload = await response.json();
            const results = Array.isArray(payload?.results) ? payload.results : [];
            const loweredCandidate = candidate.toLowerCase();
            const match = results.find((item: any) => {
                const resultLogin = String(item?.loginId || item?.username || '').trim().toLowerCase();
                const resultEmail = String(item?.email || '').trim().toLowerCase();
                const resultName = String(item?.nome || '').trim().toLowerCase();
                return resultLogin === loweredCandidate || resultEmail === loweredCandidate || resultName === loweredCandidate;
            }) || results[0];

            if (match?.id) {
                return {
                    id: String(match.id),
                    numericId: String(match.numericId || ''),
                    loginId: String(match.loginId || params.slug || ''),
                    name: String(match.nome || params.name || params.slug || 'Loja Central RS Prólipsi')
                };
            }
        } catch {
            // noop
        }
    }

    return null;
};

const parseMaybeJson = <T,>(value: unknown, fallback: T): T | unknown => {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return fallback;

    const looksLikeJson = (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    );

    if (!looksLikeJson) return value;

    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return fallback;
    }
};

const normalizeRecord = (value: unknown): Record<string, any> => {
    const parsed = parseMaybeJson<Record<string, any> | null>(value, null);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, any>
        : {};
};

const normalizeStringArray = (value: any): string[] => {
    const parsed = parseMaybeJson<any[]>(value, []);

    if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
    }

    if (typeof parsed === 'string' && parsed.length > 0) {
        return [parsed];
    }

    return [];
};

const MARKETPLACE_SSO_TOKEN_KEY = 'rs-marketplace-sso-token';
const MARKETPLACE_SPONSOR_STORAGE_KEY = 'rs-marketplace-sponsor-ref';
const MARKETPLACE_DISTRIBUTOR_STORAGE_KEY = 'rs-marketplace-selected-distributor';
const DEFAULT_MARKETPLACE_SPONSOR_REF = 'rsprolipsi';
const CENTRAL_MARKETPLACE_DISTRIBUTOR_ID = 'cd-oficial-matriz';

const normalizeInventoryLookupKey = (value?: string | null) => String(value || '').trim().toLowerCase();
const normalizeInventoryLookupLooseKey = (value?: string | null) => normalizeInventoryLookupKey(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const MARKETPLACE_OPERATOR_ROLES = ['lojista', 'seller', 'marketplace_admin', 'super_admin', 'admin'] as const;
const roleAllowsMarketplaceCdFlow = (role: any) => MARKETPLACE_OPERATOR_ROLES.includes(String(role || '').trim().toLowerCase() as any);

const createEmptyMarketplaceUserProfile = (): UserProfile => ({
    name: '',
    id: '',
    code: '',
    loginId: '',
    idNumerico: '',
    idConsultor: '',
    graduation: '',
    accountStatus: '',
    monthlyActivity: '',
    category: '',
    referralLink: '',
    affiliateLink: '',
    avatarUrl: 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png'
});

const normalizeAvatarUrl = (value: unknown) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed || ['null', 'undefined', '[object Object]'].includes(trimmed)) return '';
    return trimmed;
};

const applyDistributorInventoryToProducts = (catalog: Product[], inventoryItems: DistributorInventoryItem[], distributorName?: string) => {
    const unavailableMessage = distributorName
        ? `Indisponivel no CD ${distributorName}`
        : 'Indisponivel no CD selecionado';
    const lowStockMessage = distributorName
        ? `Estoque baixo no CD ${distributorName}`
        : 'Estoque baixo no CD selecionado';

    if (!Array.isArray(catalog) || catalog.length === 0) return catalog;
    if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
        return catalog.map((product) => ({
            ...product,
            inventorySource: 'cd',
            inventoryStatusLabel: 'Sem estoque',
            inventoryStatusMessage: unavailableMessage,
            inventory: product.trackQuantity === false ? product.inventory : 0,
            variants: Array.isArray(product.variants)
                ? product.variants.map((variant) => ({
                    ...variant,
                    inventory: product.trackQuantity === false ? variant.inventory : 0
                }))
                : product.variants
        }));
    }

    const inventoryBySku = new Map<string, DistributorInventoryItem>();
    const inventoryByName = new Map<string, DistributorInventoryItem>();
    const inventoryByLooseName = new Map<string, DistributorInventoryItem>();
    const inventoryByProductId = new Map<string, DistributorInventoryItem>();

    inventoryItems.forEach((item) => {
        const productIdKey = normalizeInventoryLookupKey(item.productId);
        const skuKey = normalizeInventoryLookupKey(item.sku);
        const nameKey = normalizeInventoryLookupKey(item.name);
        const looseNameKey = normalizeInventoryLookupLooseKey(item.name);
        if (productIdKey) inventoryByProductId.set(productIdKey, item);
        if (skuKey) inventoryBySku.set(skuKey, item);
        if (nameKey) inventoryByName.set(nameKey, item);
        if (looseNameKey) inventoryByLooseName.set(looseNameKey, item);
    });

    return catalog.map((product) => {
        const productIdKey = normalizeInventoryLookupKey(product.id);
        const productSkuKey = normalizeInventoryLookupKey(product.sku);
        const productNameKey = normalizeInventoryLookupKey(product.name);
        const productLooseNameKey = normalizeInventoryLookupLooseKey(product.name);
        const matchedInventory =
            (productIdKey ? inventoryByProductId.get(productIdKey) : null) ||
            (productSkuKey ? inventoryBySku.get(productSkuKey) : null) ||
            (productNameKey ? inventoryByName.get(productNameKey) : null) ||
            (productLooseNameKey ? inventoryByLooseName.get(productLooseNameKey) : null) ||
            null;
        const distributorStock = matchedInventory ? Math.max(0, Number(matchedInventory.stockLevel || 0)) : 0;
        const minStock = Math.max(0, Number(matchedInventory?.minStock || 0));
        const inventoryStatusLabel = distributorStock <= 0 ? 'Sem estoque' : (minStock > 0 && distributorStock <= minStock ? 'Estoque baixo' : '');
        const inventoryStatusMessage = distributorStock <= 0 ? unavailableMessage : (minStock > 0 && distributorStock <= minStock ? lowStockMessage : '');

        return {
            ...product,
            inventorySource: 'cd',
            inventoryStatusLabel,
            inventoryStatusMessage,
            inventory: product.trackQuantity === false ? product.inventory : distributorStock,
            variants: Array.isArray(product.variants)
                ? product.variants.map((variant) => ({
                    ...variant,
                    inventory: product.trackQuantity === false
                        ? variant.inventory
                        : Math.max(0, Math.min(Number(variant.inventory ?? distributorStock), distributorStock))
                }))
                : product.variants
        };
    });
};

type MarketplaceSignupContext = {
    sponsorRef: string;
    sponsorSource: 'default' | 'referral';
    initialView: 'home' | 'sellerRegistration';
};

const readMarketplaceHashRoute = () => {
    if (typeof window === 'undefined') {
        return {
            path: '',
            params: new URLSearchParams()
        };
    }

    const rawHash = window.location.hash || '';
    const normalizedHash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
    const [pathPart = '', queryPart = ''] = normalizedHash.split('?');

    return {
        path: pathPart,
        params: new URLSearchParams(queryPart)
    };
};

const extractMarketplaceSponsorRef = () => {
    if (typeof window === 'undefined') return '';

    const searchParams = new URLSearchParams(window.location.search);
    const hashRoute = readMarketplaceHashRoute();

    const directRef = [
        searchParams.get('ref'),
        searchParams.get('sponsor'),
        searchParams.get('indicacao'),
        hashRoute.params.get('ref'),
        hashRoute.params.get('sponsor'),
        hashRoute.params.get('indicacao')
    ].find((value) => typeof value === 'string' && value.trim().length > 0);

    if (directRef) {
        return String(directRef).trim().toLowerCase();
    }

    const routeTarget = `${window.location.pathname}${hashRoute.path}`;
    const routeMatch = routeTarget.match(/\/(?:indicacao|cadastro|signup|loja)\/([a-zA-Z0-9-_]+)/i);
    return routeMatch?.[1] ? String(routeMatch[1]).trim().toLowerCase() : '';
};

const hasMarketplaceExplicitSignup = () => {
    if (typeof window === 'undefined') return false;

    const searchParams = new URLSearchParams(window.location.search);
    const hashRoute = readMarketplaceHashRoute();
    const routeTarget = `${window.location.pathname}${hashRoute.path}`.toLowerCase();

    return (
        searchParams.get('signup') === '1' ||
        hashRoute.params.get('signup') === '1' ||
        routeTarget.includes('/signup') ||
        routeTarget.includes('/cadastro')
    );
};

const resolveMarketplaceSignupContext = (): MarketplaceSignupContext => {
    if (typeof window === 'undefined') {
        return {
            sponsorRef: DEFAULT_MARKETPLACE_SPONSOR_REF,
            sponsorSource: 'default',
            initialView: 'home'
        };
    }

    const extractedSponsorRef = extractMarketplaceSponsorRef();
    const sponsorRef = (extractedSponsorRef || DEFAULT_MARKETPLACE_SPONSOR_REF).trim().toLowerCase() || DEFAULT_MARKETPLACE_SPONSOR_REF;

    if (extractedSponsorRef) {
        localStorage.setItem(MARKETPLACE_SPONSOR_STORAGE_KEY, sponsorRef);
    } else {
        localStorage.removeItem(MARKETPLACE_SPONSOR_STORAGE_KEY);
    }

    return {
        sponsorRef,
        sponsorSource: sponsorRef === DEFAULT_MARKETPLACE_SPONSOR_REF ? 'default' : 'referral',
        initialView: hasMarketplaceExplicitSignup() ? 'sellerRegistration' : 'home'
    };
};

type MarketplaceBridgePayload = {
    token?: string;
    accessToken?: string;
    userId?: string;
    uid?: string;
    userEmail?: string;
    email?: string;
    source?: string;
    autoLogin?: boolean;
};

const parseMarketplaceBridgePayload = (value: string): MarketplaceBridgePayload | null => {
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed as MarketplaceBridgePayload : null;
    } catch {
        try {
            const decoded = decodeURIComponent(escape(atob(value)));
            const parsed = JSON.parse(decoded);
            return parsed && typeof parsed === 'object' ? parsed as MarketplaceBridgePayload : null;
        } catch {
            return null;
        }
    }
};

const extractMarketplaceBridgeToken = () => {
    if (typeof window === 'undefined') return null;

    const fromSearch = new URLSearchParams(window.location.search).get('token');
    if (fromSearch) return fromSearch;

    const hash = window.location.hash || '';
    const queryIndex = hash.indexOf('?');
    if (queryIndex >= 0) {
        const params = new URLSearchParams(hash.slice(queryIndex + 1));
        return params.get('token');
    }

    return null;
};

const normalizeMarketplaceAccessToken = (rawToken: string) => {
    const payload = parseMarketplaceBridgePayload(rawToken);
    const accessToken = String(payload?.accessToken || payload?.token || rawToken || '').trim();
    return { payload, accessToken };
};

const normalizeProductMerchandising = (value: any): Product['merchandising'] => ({
    comboProductIds: normalizeStringArray(value?.comboProductIds),
    relatedProductIds: normalizeStringArray(value?.relatedProductIds),
    sponsored: {
        enabled: Boolean(value?.sponsored?.enabled),
        priority: Number(value?.sponsored?.priority ?? 10),
        label: String(value?.sponsored?.label ?? 'Patrocinado'),
        placements: normalizeStringArray(value?.sponsored?.placements).length > 0
            ? normalizeStringArray(value?.sponsored?.placements)
            : ['product_detail_related'],
        startsAt: value?.sponsored?.startsAt ? String(value.sponsored.startsAt) : undefined,
        endsAt: value?.sponsored?.endsAt ? String(value.sponsored.endsAt) : undefined,
    }
});

const normalizeProductMaterials = (value: any): Product['materials'] => {
    const parsed = parseMaybeJson<any[]>(value, []);

    if (typeof parsed === 'string' && parsed.length > 0) {
        return [{
            name: parsed.split('/').pop() || 'arquivo',
            url: parsed
        }];
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((item) => {
            if (typeof item === 'string') {
                return {
                    name: item.split('/').pop() || 'arquivo',
                    url: item
                };
            }

            if (!item?.url) return null;

            return {
                name: item.name || item.url.split('/').pop() || 'arquivo',
                url: item.url,
                size: item.size,
                mimeType: item.mimeType || item.type
            };
        })
        .filter(Boolean) as Product['materials'];
};

const normalizeProductOptions = (value: any): Product['options'] => {
    const parsed = parseMaybeJson<any[]>(value, []);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item, index) => ({
        id: String(item?.id ?? `opt-${index}`),
        name: String(item?.name ?? `Opcao ${index + 1}`),
        values: normalizeStringArray(item?.values)
    }));
};

const normalizeProductVariants = (value: any, fallbackPrice = 0): Product['variants'] => {
    const parsed = parseMaybeJson<any[]>(value, []);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item, index) => {
        const options = normalizeRecord(item?.options);

        return {
            id: String(item?.id ?? `var-${index}`),
            options: Object.fromEntries(
                Object.entries(options).map(([key, optionValue]) => [String(key), String(optionValue ?? '')])
            ),
            price: Number(item?.price ?? fallbackPrice ?? 0),
            inventory: Number(item?.inventory ?? 0),
            sku: String(item?.sku ?? ''),
            imageId: item?.imageId ? String(item.imageId) : undefined
        };
    });
};

const readCachedDashboardBanners = (): Banner[] => {
    if (typeof window === 'undefined') return initialDashboardBanners;
    try {
        const raw = localStorage.getItem('rs-marketplace-dashboard-banners');
        if (!raw) return initialDashboardBanners;

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : initialDashboardBanners;
    } catch {
        return initialDashboardBanners;
    }
};

const mapPromoBannersToCarousel = (promoBanners: any[] = []): Banner[] => {
    return promoBanners
        .map((banner, index) => {
            const image = banner?.imageDataUrl || banner?.imageUrl || banner?.desktopImage || banner?.mobileImage || '';
            return {
                id: String(banner?.id || `dash-banner-${index + 1}`),
                desktopImage: banner?.desktopImage || image,
                mobileImage: banner?.mobileImage || image,
                link: banner?.link || '#',
                title: banner?.title || '',
                subtitle: banner?.preTitle || ''
            } as Banner;
        })
        .filter(banner => Boolean(banner.desktopImage || banner.mobileImage));
};

const initialDashboardSettings: DashboardSettings = {
    components: [
        { id: 'comp-1', column: 'left', type: 'userInfo', enabled: true, visibleFields: { id: true, graduation: true, accountStatus: true, monthlyActivity: true, category: true, referralLink: true, affiliateLink: true } },
        { id: 'comp-2', column: 'right', type: 'adminBanner', enabled: true },
        { id: 'comp-3', column: 'right', type: 'bonusCards', enabled: true },
        { id: 'comp-4', column: 'left', type: 'qualificationProgress', enabled: true, title: 'QualificaÃ§Ã£o Atual', value: 4500, max: 15000, startLabel: 'Iniciante', endLabel: 'Prata', startIcon: 'StarOutlineIcon', endIcon: 'TrophyIcon' },
        { id: 'comp-5', column: 'left', type: 'qualificationProgress', enabled: true, title: 'QualificaÃ§Ã£o do MÃªs', value: 800, max: 2500, startLabel: 'Base', endLabel: 'Bronze', startIcon: 'UserIcon', endIcon: 'GlobalIcon' },
        { id: 'comp-6', column: 'right', type: 'incentivesProgram', enabled: true, title: 'Programa de Incentivos e PremiaÃ§Ãµes', content: [{ title: 'Viagem Nacional', progress: 60 }, { title: 'Carro 0km', progress: 30 }] },
        { id: 'comp-7', column: 'left', type: 'referralLinks', enabled: true },
        { id: 'comp-8', column: 'right', type: 'networkActivity', enabled: true, title: 'Atividade da Rede' },
        { id: 'comp-9', column: 'right', type: 'performanceChart', enabled: true, title: 'BÃ´nus Semanal' },
        { id: 'comp-10', column: 'left', type: 'shortcut', enabled: true, title: 'Gerenciar Produtos', url: 'manageProducts', icon: 'ProductsIcon' },
        { id: 'comp-11', column: 'left', type: 'shortcut', enabled: true, title: 'VisÃ£o Geral WalletPay', url: 'walletOverview', icon: 'WalletIcon' },
    ],
    cards: [
        { id: 'card-1', title: 'BÃ´nus Ciclo Global', icon: 'GlobalIcon', dataKey: 'cycleBonus' },
        { id: 'card-2', title: 'BÃ´nus Top Sigme', icon: 'TrophyIcon', dataKey: 'topSigmeBonus' },
        { id: 'card-3', title: 'BÃ´nus Plano de Carreira', icon: 'StarOutlineIcon', dataKey: 'careerPlanBonus' },
    ]
};

const emptyPaymentSettings: PaymentSettings = {
    mercadoPago: { enabled: false, publicKey: '', accessToken: '' },
    pagSeguro: { enabled: false, email: '', token: '' },
    pix: { enabled: false, pixKeyType: 'CPF', pixKey: '' },
    appmax: { enabled: false, apiKey: '' },
    asaas: { enabled: false, apiKey: '' },
    pagarme: { enabled: false, apiKey: '', encryptionKey: '' },
    stripe: { enabled: false, publishableKey: '', secretKey: '' }
};

const emptyShippingSettings: ShippingSettings = {
    frenet: { enabled: false, apiKey: '', apiSecret: '' },
    melhorEnvio: { enabled: false, apiToken: '' },
    correios: { enabled: false, contrato: '', senha: '' },
    superFrete: { enabled: false, apiToken: '' },
    jadlog: { enabled: false, apiToken: '' },
    loggi: { enabled: false, apiKey: '' }
};

const emptyWalletSettings: WalletSettings = {
    automaticTransfers: {
        enabled: false,
        frequency: 'Semanal',
        dayOfWeek: 5,
        dayOfMonth: undefined,
        minimumAmount: 0
    },
    notifications: {
        onNewCommission: false,
        onTransferSuccess: false,
        onTransferFail: false
    },
    security: {
        twoFactorAuth: false
    }
};

const emptyCompensationSettings: CompensationSettings = {
    dropshippingPointsPerBrl: 0,
    affiliatePointsPerBrl: 0,
    frequency: 'Trimestral',
    tiers: []
};

const emptySponsoredSettings: SponsoredSettings = {
    placements: [],
    packages: [],
    autoApprovePaidRequests: false,
    rotationEnabled: true,
    rotationWindowMinutes: 60,
    maxVisibleProductsPerPlacement: 8
};

const emptyBonusTotals = {
    cycleBonus: 0,
    topSigmeBonus: 0,
    careerPlanBonus: 0,
    affiliateBonus: 0,
    dropshipBonus: 0,
    logisticsBonus: 0,
};

const normalizePaymentSettings = (value: any): PaymentSettings => ({
    ...emptyPaymentSettings,
    ...value,
    mercadoPago: { ...emptyPaymentSettings.mercadoPago, ...(value?.mercadoPago || {}) },
    pagSeguro: { ...emptyPaymentSettings.pagSeguro, ...(value?.pagSeguro || {}) },
    pix: { ...emptyPaymentSettings.pix, ...(value?.pix || {}) },
    appmax: { ...emptyPaymentSettings.appmax, ...(value?.appmax || {}) },
    asaas: { ...emptyPaymentSettings.asaas, ...(value?.asaas || {}) },
    pagarme: { ...emptyPaymentSettings.pagarme, ...(value?.pagarme || {}) },
    stripe: { ...emptyPaymentSettings.stripe, ...(value?.stripe || {}) }
});

const normalizeShippingSettings = (value: any): ShippingSettings => ({
    ...emptyShippingSettings,
    ...value,
    frenet: { ...emptyShippingSettings.frenet, ...(value?.frenet || {}) },
    melhorEnvio: { ...emptyShippingSettings.melhorEnvio, ...(value?.melhorEnvio || {}) },
    correios: { ...emptyShippingSettings.correios, ...(value?.correios || {}) },
    superFrete: { ...emptyShippingSettings.superFrete, ...(value?.superFrete || {}) },
    jadlog: { ...emptyShippingSettings.jadlog, ...(value?.jadlog || {}) },
    loggi: { ...emptyShippingSettings.loggi, ...(value?.loggi || {}) }
});

const normalizeWalletSettings = (value: any): WalletSettings => ({
    ...emptyWalletSettings,
    ...value,
    automaticTransfers: { ...emptyWalletSettings.automaticTransfers, ...(value?.automaticTransfers || {}) },
    notifications: { ...emptyWalletSettings.notifications, ...(value?.notifications || {}) },
    security: { ...emptyWalletSettings.security, ...(value?.security || {}) }
});

const APP_CACHE_TTL_MS = 5 * 60 * 1000;
const APP_CACHE_KEYS = {
    storeCustomization: 'rs-marketplace-home-customization-cache',
    products: 'rs-marketplace-home-products-cache',
    collections: 'rs-marketplace-home-collections-cache'
} as const;

const readCachedAppState = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;

    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return fallback;

        const timestamp = Number(parsed.timestamp || 0);
        if (!timestamp || Date.now() - timestamp > APP_CACHE_TTL_MS) return fallback;

        return (parsed.data as T) ?? fallback;
    } catch {
        return fallback;
    }
};

const writeCachedAppState = <T,>(key: string, data: T) => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify({
            timestamp: Date.now(),
            data
        }));
    } catch { }
};

const scheduleNonCriticalTask = (task: () => void | Promise<void>, timeout = 1200) => {
    if (typeof window === 'undefined') {
        void task();
        return () => { };
    }

    let cancelled = false;
    const safeTask = () => {
        if (cancelled) return;
        void task();
    };

    const idleWindow = window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
        const handle = idleWindow.requestIdleCallback(() => safeTask(), { timeout });
        return () => {
            cancelled = true;
            idleWindow.cancelIdleCallback?.(handle);
        };
    }

    const handle = window.setTimeout(safeTask, Math.min(timeout, 350));
    return () => {
        cancelled = true;
        window.clearTimeout(handle);
    };
};

const mapMarketplaceProducts = (items: any[] = []): Product[] => {
    const mapped: Product[] = items.map((it: any) => ({
        id: String(it.id ?? ''),
        name: String(it.name ?? it.title ?? 'Produto'),
        seller: String(it.seller ?? ''),
        price: Number(it.price ?? it.sale_price ?? 0),
        dropshipPrice: Number(it.dropship_price ?? it.specifications?.dropshipPrice ?? 0),
        costPerItem: Number(it.cost ?? it.cost_per_item ?? 0),
        currency: String(it.currency ?? 'BRL'),
        shortDescription: String(it.short_description ?? it.description ?? ''),
        description: String(it.description ?? ''),
        featured_image: String(it.featured_image ?? it.image_url ?? (Array.isArray(it.images) && it.images[0]) ?? ''),
        images: Array.isArray(it.images) ? it.images : [String(it.image_url ?? it.featured_image ?? '')].filter(Boolean),
        rating: Number(it.rating ?? 0),
        reviewCount: Number(it.review_count ?? 0),
        collectionId: it.collection_id ?? null,
        status: String(it.status ?? 'Ativo'),
        inventory: Number(it.inventory ?? 0),
        type: String(it.type ?? 'FÃ­sico'),
        requiresShipping: Boolean(it.requires_shipping ?? true),
        trackQuantity: Boolean(it.track_quantity ?? true),
        chargeTax: Boolean(it.charge_tax ?? true),
        continueSelling: Boolean(it.continue_selling ?? false),
        seoTitle: String(it.seo_title ?? it.name ?? ''),
        seoDescription: String(it.seo_description ?? it.short_description ?? ''),
        urlHandle: String(it.url_handle ?? ''),
        options: Array.isArray(it.options) ? it.options : [],
        variants: Array.isArray(it.variants) ? it.variants : [],
        compareAtPrice: it.compare_at_price !== undefined ? Number(it.compare_at_price) : undefined,
        memberPrice: it.member_price !== undefined ? Number(it.member_price) : undefined,
        productType: (it.product_type ?? it.specifications?.productType ?? 'physical') as Product['productType'],
        commissionOrigin: (it.commission_origin ?? it.specifications?.commissionOrigin ?? 'rs_physical') as Product['commissionOrigin'],
        affiliateModel: (it.affiliate_model ?? it.specifications?.affiliateModel ?? 'none') as Product['affiliateModel'],
        ownerUserId: it.owner_user_id ?? it.specifications?.ownerUserId ?? null,
        ownerLoginId: String(it.owner_login_id ?? it.specifications?.ownerLoginId ?? ''),
        ownerType: String(it.owner_type ?? it.specifications?.ownerType ?? ''),
        isRSProduct: Boolean(it.is_rs_product ?? it.specifications?.isRSProduct ?? false),
        fulfillmentOriginType: (it.fulfillment_origin_type ?? it.specifications?.fulfillmentOriginType ?? 'central') as Product['fulfillmentOriginType'],
        fulfillmentOriginId: it.fulfillment_origin_id ?? it.specifications?.fulfillmentOriginId ?? null,
        fulfillmentOriginName: String(it.fulfillment_origin_name ?? it.specifications?.fulfillmentOriginName ?? ''),
        fulfillmentOriginZip: String(it.fulfillment_origin_zip ?? it.specifications?.fulfillmentOriginZip ?? ''),
        subcategory: it.specifications?.subcategory || '',
        supplier: it.specifications?.supplier || '',
        barcode: it.specifications?.barcode || '',
        weight: it.specifications?.weight,
        weightUnit: it.specifications?.weightUnit || 'kg',
        collectionIds: it.specifications?.collections || [],
    }));

    return mapped.map((product, index) => {
        const source = items[index] || {};
        const specifications = normalizeRecord(source.specifications);
        const normalizedSourceImages = normalizeStringArray(source.images);
        const images = normalizedSourceImages.length > 0
            ? normalizedSourceImages
            : product.images;
        const collectionIds = normalizeStringArray(specifications.collections);
        const options = normalizeProductOptions(specifications.options);
        const variants = normalizeProductVariants(
            specifications.variants,
            Number(source.price ?? source.sale_price ?? product.price ?? 0)
        );

        return {
            ...product,
            costPerItem: source.cost_price !== undefined
                ? Number(source.cost_price)
                : product.costPerItem,
            shortDescription: String(source.short_description ?? specifications.shortDescription ?? product.shortDescription ?? ''),
            featured_image: String(source.featured_image ?? source.image_url ?? images[0] ?? ''),
            images,
            videos: normalizeStringArray(specifications.videos),
            materials: normalizeProductMaterials(specifications.materials),
            collectionId: source.collection_id ?? collectionIds[0] ?? product.collectionId ?? null,
            collectionIds: collectionIds.length > 0
                ? collectionIds
                : (source.collection_id ? [String(source.collection_id)] : (product.collectionIds || [])),
            status: source.published === false || source.is_active === false ? 'Rascunho' : 'Ativo',
            inventory: Number(source.inventory ?? source.stock_quantity ?? source.stock ?? product.inventory ?? 0),
            type: String(specifications.type ?? source.type ?? product.type ?? 'FÃ­sico'),
            sku: String(source.sku ?? specifications.sku ?? product.sku ?? ''),
            barcode: String(specifications.barcode ?? product.barcode ?? ''),
            requiresShipping: Boolean(specifications.requiresShipping ?? source.requires_shipping ?? product.requiresShipping ?? true),
            trackQuantity: Boolean(specifications.trackQuantity ?? source.track_quantity ?? product.trackQuantity ?? true),
            seoDescription: String(source.seo_description ?? source.short_description ?? specifications.shortDescription ?? product.seoDescription ?? ''),
            options: options.length > 0 ? options : normalizeProductOptions(product.options),
            variants: variants.length > 0 ? variants : normalizeProductVariants(product.variants, Number(product.price ?? 0)),
            compareAtPrice: source.compare_price !== undefined
                ? Number(source.compare_price)
                : product.compareAtPrice,
            dropshipPrice: source.dropship_price !== undefined
                ? Number(source.dropship_price)
                : (specifications.dropshipPrice !== undefined ? Number(specifications.dropshipPrice) : product.dropshipPrice),
            subcategory: specifications.subcategory || product.subcategory || '',
            supplier: specifications.supplier || product.supplier || '',
            weight: specifications.weight ?? product.weight,
            weightUnit: specifications.weightUnit || product.weightUnit || 'kg',
            category: String(source.category ?? specifications.subcategory ?? product.category ?? ''),
            productType: (source.product_type ?? specifications.productType ?? product.productType ?? 'physical') as Product['productType'],
            commissionOrigin: (source.commission_origin ?? specifications.commissionOrigin ?? product.commissionOrigin ?? 'rs_physical') as Product['commissionOrigin'],
            affiliateModel: (source.affiliate_model ?? specifications.affiliateModel ?? product.affiliateModel ?? 'none') as Product['affiliateModel'],
                            ownerUserId: source.owner_user_id ?? specifications.ownerUserId ?? product.ownerUserId ?? null,
                            ownerLoginId: String(source.owner_login_id ?? specifications.ownerLoginId ?? product.ownerLoginId ?? ''),
                            ownerType: String(source.owner_type ?? specifications.ownerType ?? product.ownerType ?? ''),
                            isRSProduct: Boolean(source.is_rs_product ?? specifications.isRSProduct ?? product.isRSProduct ?? false),
                            fulfillmentOriginType: (source.fulfillment_origin_type ?? specifications.fulfillmentOriginType ?? product.fulfillmentOriginType ?? 'central') as Product['fulfillmentOriginType'],
                            fulfillmentOriginId: source.fulfillment_origin_id ?? specifications.fulfillmentOriginId ?? product.fulfillmentOriginId ?? null,
            fulfillmentOriginName: String(source.fulfillment_origin_name ?? specifications.fulfillmentOriginName ?? product.fulfillmentOriginName ?? ''),
            fulfillmentOriginZip: String(source.fulfillment_origin_zip ?? specifications.fulfillmentOriginZip ?? product.fulfillmentOriginZip ?? ''),
            merchandising: normalizeProductMerchandising(specifications.merchandising),
        };
    });
};

const normalizeFulfillmentOriginType = (value: unknown): Product['fulfillmentOriginType'] =>
    value === 'seller_store' ? 'seller_store' : 'central';

const getFulfillmentOriginKey = (item: Pick<CartItem, 'fulfillmentOriginType' | 'fulfillmentOriginId' | 'ownerUserId' | 'productId'>) => {
    const originType = normalizeFulfillmentOriginType(item.fulfillmentOriginType);
    if (originType === 'seller_store') {
        const originId = String(item.fulfillmentOriginId || item.ownerUserId || item.productId || '').trim() || 'seller_store';
        return `${originType}:${originId}`;
    }
    return 'central:central';
};

const mapMarketplaceCollections = (items: any[] = []): Collection[] => (
    items.map((c: any) => ({
        id: String(c.id ?? ''),
        title: String(c.title ?? c.name ?? 'ColeÃ§Ã£o'),
        description: String(c.description ?? ''),
        imageUrl: String(c.image ?? c.image_url ?? c.banner_url ?? ''),
        productIds: Array.isArray(c.product_ids) ? c.product_ids : (Array.isArray(c.products) ? c.products : []),
        ownerUserId: c.owner_user_id ?? c.ownerUserId ?? null,
        ownerLoginId: String(c.owner_login_id ?? c.ownerLoginId ?? ''),
    }))
);

const App: React.FC = () => {
    // Identidade Ãšnica da InstÃ¢ncia v3.4 (Diferencia Editor de Preview)
    const instanceId = useMemo(() => Math.random().toString(36).substring(2, 11), []);

    // v6.0: DetecÃ§Ã£o de Preview Consolidada e ImutÃ¡vel no Ciclo da Janela
    const isPreviewDetected = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.name === 'preview-iframe' || window.location.search.includes('preview=true');
    }, []);

    const [isLivePreview] = useState(isPreviewDetected);
    const isLivePreviewRef = useRef(isPreviewDetected);
    // Trava de loop v3.6: Previne que o estado recebido via rede reative o envio.
    const [isReceivingSync, setIsReceivingSync] = useState(false);
    const initialSignupContextRef = useRef<MarketplaceSignupContext>(resolveMarketplaceSignupContext());

    const [signupContext, setSignupContext] = useState<MarketplaceSignupContext>(initialSignupContextRef.current);
    const [view, setView] = useState<View>(initialSignupContextRef.current.initialView);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [selectedMarketingPixel, setSelectedMarketingPixel] = useState<MarketingPixel | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [viewBeforeCheckout, setViewBeforeCheckout] = useState<View>('home');
    const [viewAfterCustomerAuth, setViewAfterCustomerAuth] = useState<View | null>(null);
    const lastSyncTimestampRef = useRef<number>(0);
    const lastSyncSourceRef = useRef<string>('NENHUMA'); // v9.0: Rastreia a fonte do sinal
    const lastSyncVersionRef = useRef<string>('0.0'); // v9.0: VersÃ£o do payload

    // Data states
    const [products, setProducts] = useState<Product[]>(() => readCachedAppState<Product[]>(APP_CACHE_KEYS.products, []));
    const persistedProductIdsRef = useRef<Set<string>>(new Set());
    const [orders, setOrders] = useState<Order[]>([]);
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [dropshippingOrders, setDropshippingOrders] = useState<DropshippingOrder[]>([]);
    const [dropshippingProducts] = useState<DropshippingProduct[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [marketingPixels, setMarketingPixels] = useState<MarketingPixel[]>([]);
    const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
    const [shortenedLinks, setShortenedLinks] = useState<ShortenedLink[]>([]);
    // v4.4: Estado inicial inteligente: Prioriza o rascunho do editor se estiver em modo PREVIEW (Iframe)
    const [storeCustomization, setStoreCustomization] = useState<StoreCustomization>(() => {
        if (typeof window !== 'undefined') {
            // v6.0: Uso da detecÃ§Ã£o consolidada para inicializaÃ§Ã£o
            const cachedCustomization = readCachedAppState<Record<string, any> | null>(APP_CACHE_KEYS.storeCustomization, null);
            const saved = isPreviewDetected ? localStorage.getItem('rs_editor_draft') : localStorage.getItem('rs-store-customization');
            const fallback = localStorage.getItem('rs-store-customization');

            const finalSaved = saved || fallback || (cachedCustomization ? JSON.stringify(cachedCustomization) : null);
            if (finalSaved) {
                try {
                    const parsed = JSON.parse(finalSaved);
                    // Garante que o buffer de logo seja aplicado se o rascunho referenciÃ¡-lo v4.4
                    if (parsed.logoUrl === 'BUFFERED_IN_LOGO_KEY') {
                        const buffer = localStorage.getItem('rs_logo_buffer');
                        if (buffer) parsed.logoUrl = buffer;
                    }
                    // Merge granular do footer: preserva links estÃ¡ticos, sÃ³ substitui campos personalizÃ¡veis
                    const parsedFooter = parsed.footer || {};
                    const safeFooter = {
                        ...initialStoreCustomization.footer,
                        ...(parsedFooter.description !== undefined && { description: parsedFooter.description }),
                        ...(parsedFooter.socialLinks !== undefined && { socialLinks: parsedFooter.socialLinks }),
                        ...(parsedFooter.contactEmail !== undefined && { contactEmail: parsedFooter.contactEmail }),
                        ...(parsedFooter.cnpj !== undefined && { cnpj: parsedFooter.cnpj }),
                        ...(parsedFooter.businessAddress !== undefined && { businessAddress: parsedFooter.businessAddress }),
                    };
                    const baseResult = { ...initialStoreCustomization, ...parsed, footer: safeFooter };

                    // Auto-repair: restaura nomes das seÃ§Ãµes se estiverem incorretos
                    const defaultSectionNames: Record<string, string> = {
                        hero: 'Banner Principal (Hero)', carousel: 'Carrossel de Banners',
                        featuredProducts: 'Produtos em Destaque', offers: 'Ofertas Especiais',
                        bestsellers: 'Mais Vendidos', featuredCollections: 'ColeÃ§Ãµes em Destaque',
                        recentlyViewed: 'Vistos Recentemente', midPageBanner: 'Banner de Meio da PÃ¡gina',
                    };
                    if (Array.isArray(baseResult.homepageSections)) {
                        baseResult.homepageSections = baseResult.homepageSections.map((s: any) =>
                            defaultSectionNames[s.id] && !String(s?.name || '').trim()
                                ? { ...s, name: defaultSectionNames[s.id] }
                                : s
                        );
                    }
                    return baseResult;

                } catch (e) { }
            }
        }
        return initialStoreCustomization;
    });
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(emptyPaymentSettings);
    const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(emptyShippingSettings);
    const [walletSettings, setWalletSettings] = useState<WalletSettings>(emptyWalletSettings);
    const [sponsoredSettings, setSponsoredSettings] = useState<SponsoredSettings>(emptySponsoredSettings);
    const [compensationSettings, setCompensationSettings] = useState<CompensationSettings>(emptyCompensationSettings);
    const [dashboardUserPoints, setDashboardUserPoints] = useState(0);
    const [dashboardMonthlyUserPoints, setDashboardMonthlyUserPoints] = useState(0);
    const [dashboardCareerProgress, setDashboardCareerProgress] = useState({
        currentPinName: '',
        nextPinName: '',
        nextLevelVolume: 0
    });
    const [dashboardBanners, setDashboardBanners] = useState<Banner[]>(() => readCachedDashboardBanners());
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(initialDashboardSettings);
    const hasLoadedDashboardLayoutRef = useRef(false);
    const [collections, setCollections] = useState<Collection[]>(() => readCachedAppState<Collection[]>(APP_CACHE_KEYS.collections, []));
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [isConsultantSession, setIsConsultantSession] = useState(false);
    const [resolvedMarketplaceSponsor, setResolvedMarketplaceSponsor] = useState<MarketplaceReferrerProfile | null>(null);
    const distributorStorageKey = currentCustomer?.id
        ? `${MARKETPLACE_DISTRIBUTOR_STORAGE_KEY}:${currentCustomer.id}`
        : MARKETPLACE_DISTRIBUTOR_STORAGE_KEY;
    const [reviews, setReviews] = useState<Review[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);

    const loadCareerDashboardData = async () => {
        try {
            const [levelsResult, statsResult, bonusesResult] = await Promise.all([
                careerAPI.getDigitalLevels(),
                careerAPI.getDigitalStats(),
                sigmaAPI.getBonuses()
            ]);

            const levels = Array.isArray(levelsResult?.data) ? levelsResult.data : [];
            if (levels.length > 0) {
                const mappedTiers = levels
                    .map((level: any, index: number) => ({
                        id: String(level.id ?? `digital-tier-${index + 1}`),
                        name: String(level.name ?? `Nivel ${index + 1}`),
                        pointsRequired: Number(level.requiredVolume ?? level.required_volume ?? 0),
                        reward: Number(level.reward ?? level.bonus_amount ?? 0),
                        pinImageUrl: String(level.imageUrl ?? level.pin_image ?? level.image_url ?? ''),
                        bannerImageUrl: String(level.bannerImageUrl ?? level.banner_image ?? '')
                    }))
                    .sort((a, b) => a.pointsRequired - b.pointsRequired);

                setCompensationSettings(prev => ({
                    ...prev,
                    tiers: mappedTiers
                }));
            }

            const stats = statsResult?.data;
            if (statsResult && statsResult.success !== false && stats) {
                const currentVolume = Number(stats.currentVolume ?? 0);
                setDashboardUserPoints(currentVolume);
                setDashboardMonthlyUserPoints(currentVolume);
                setDashboardCareerProgress({
                    currentPinName: String(stats.currentPin ?? ''),
                    nextPinName: String(stats.nextPin ?? ''),
                    nextLevelVolume: Number(stats.nextLevelVolume ?? 0)
                });
            }
            const bonusSummary = bonusesResult?.summary || bonusesResult?.data?.summary;
            if (bonusesResult && bonusesResult.success !== false && bonusSummary) {
                setBonuses({
                    cycleBonus: Number(bonusSummary.cycleBonus ?? 0),
                    topSigmeBonus: Number(bonusSummary.topSigmeBonus ?? 0),
                    careerPlanBonus: Number(bonusSummary.careerPlanBonus ?? 0),
                    affiliateBonus: Number(bonusSummary.affiliateBonus ?? 0),
                    dropshipBonus: Number(bonusSummary.dropshipBonus ?? 0),
                    logisticsBonus: Number(bonusSummary.logisticsBonus ?? 0),
                });
            } else {
                setBonuses(emptyBonusTotals);
            }
        } catch (error) {
            setBonuses(emptyBonusTotals);
            console.warn('[Career Dashboard] Falha ao carregar niveis reais do rs-admin:', error);
        }
    };

    useEffect(() => {
        const loadMarketplaceDashboardBanners = async () => {
            try {
                const [marketplaceResult, consultantResult] = await Promise.all([
                    dashboardLayoutAPI.getMarketplaceLayoutConfig(),
                    dashboardLayoutAPI.getConsultantLayoutConfig()
                ]);

                const marketplaceFailed = !marketplaceResult || marketplaceResult.success === false;
                const consultantFailed = !consultantResult || consultantResult.success === false;

                if (marketplaceFailed && consultantFailed) {
                    console.warn('[Dashboard Banners] Layout indisponivel:', marketplaceResult?.error || consultantResult?.error);
                    return;
                }

                const marketplaceConfig = marketplaceResult?.config || marketplaceResult?.data?.config || marketplaceResult?.data;
                const consultantConfig = consultantResult?.config || consultantResult?.data?.config || consultantResult?.data;

                const marketplaceBanners = marketplaceFailed
                    ? []
                    : mapPromoBannersToCarousel(Array.isArray(marketplaceConfig?.promoBanners) ? marketplaceConfig.promoBanners : []);
                const consultantBanners = consultantFailed
                    ? []
                    : mapPromoBannersToCarousel(Array.isArray(consultantConfig?.promoBanners) ? consultantConfig.promoBanners : []);
                const hasPositiveResult = marketplaceBanners.length > 0 || consultantBanners.length > 0;
                const bothSucceededEmpty = !marketplaceFailed && !consultantFailed && marketplaceBanners.length === 0 && consultantBanners.length === 0;

                if (!hasPositiveResult && !bothSucceededEmpty) {
                    return;
                }

                const mappedBanners = marketplaceBanners.length > 0 ? marketplaceBanners : consultantBanners;
                setDashboardBanners(mappedBanners);
                localStorage.setItem('rs-marketplace-dashboard-banners', JSON.stringify(mappedBanners));
            } catch (error) {
                console.warn('[Dashboard Banners] Falha ao carregar layout do marketplace:', error);
            }
        };

        const refreshWhenVisible = () => {
            if (document.hidden) return;
            void loadMarketplaceDashboardBanners();
        };

        const refreshAfterAuth = () => {
            void loadMarketplaceDashboardBanners();
        };

        void loadMarketplaceDashboardBanners();
        window.addEventListener('focus', refreshWhenVisible);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        window.addEventListener('rs-marketplace-auth-updated', refreshAfterAuth);

        return () => {
            window.removeEventListener('focus', refreshWhenVisible);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            window.removeEventListener('rs-marketplace-auth-updated', refreshAfterAuth);
        };
    }, []);

    // v11.0: Carregamento Inicial Robusto via API (Banco de Dados)
    useEffect(() => {
        const loadCustomization = async () => {
            console.log('%c[App v11.0] ðŸ“¡ Carregando customizaÃ§Ã£o do banco...', 'color: #ff00ff; font-weight: bold;');
            const result = await storeCustomizationAPI.get();

            if (result && result.success !== false && result.data) {
                const dbData = result.data;
                writeCachedAppState(APP_CACHE_KEYS.storeCustomization, dbData);
                console.log('[App v11.0] âœ… Dados do banco recebidos:', dbData);

                setStoreCustomization(prev => {
                    // MissÃ£o 11.0: Preserva o rascunho local apenas se estiver em modo Preview
                    if (isPreviewDetected) {
                        const savedDraft = localStorage.getItem('rs_editor_draft');
                        if (savedDraft) {
                            try {
                                const parsed = JSON.parse(savedDraft);
                                console.log('[App v11.0] ðŸ“” Mantendo rascunho local em modo Preview.');
                                return { ...prev, ...parsed };
                            } catch (e) { }
                        }
                    }

                    // Se nÃ£o for preview ou nÃ£o tiver rascunho, usa o banco
                    // Mas aplica o Auto-Reparo de seÃ§Ãµes dinÃ¢micas (MissÃ£o 10.0/11.0)
                    // Merge granular: preserve static links, only override customizable footer fields from DB
                    const dbFooter = dbData.footer || {};
                    const mergedFooter = {
                        ...initialStoreCustomization.footer,  // starts with static links (buyerLinks, sellerLinks, companyLinks)
                        // override only customizable fields from DB
                        ...(dbFooter.description !== undefined && { description: dbFooter.description }),
                        ...(dbFooter.socialLinks !== undefined && { socialLinks: dbFooter.socialLinks }),
                        ...(dbFooter.contactEmail !== undefined && { contactEmail: dbFooter.contactEmail }),
                        ...(dbFooter.cnpj !== undefined && { cnpj: dbFooter.cnpj }),
                        ...(dbFooter.businessAddress !== undefined && { businessAddress: dbFooter.businessAddress }),
                    };

                    let finalCustom = {
                        ...initialStoreCustomization,
                        ...dbData,
                        footer: mergedFooter,
                        hero: dbData.hero && dbData.hero.title ? dbData.hero : initialStoreCustomization.hero,
                        homepageSections: dbData.homepageSections || initialStoreCustomization.homepageSections
                    };

                    if (Array.isArray(finalCustom.homepageSections)) {
                        const defaultSections = [
                            { id: 'hero', name: 'Banner Principal (Hero)' },
                            { id: 'carousel', name: 'Carrossel de Banners' },
                            { id: 'featuredProducts', name: 'Produtos em Destaque' },
                            { id: 'offers', name: 'Ofertas Especiais' },
                            { id: 'bestsellers', name: 'Mais Vendidos' },
                            { id: 'featuredCollections', name: 'ColeÃ§Ãµes em Destaque' },
                            { id: 'recentlyViewed', name: 'Vistos Recentemente' },
                            { id: 'midPageBanner', name: 'Banner de Meio da PÃ¡gina' },
                        ];

                        const dbSections = [...finalCustom.homepageSections];
                        const existingIds = dbSections.map((s: any) => s.id);
                        let changed = false;

                        // Adiciona o que falta e corrige nomes incorretos
                        defaultSections.forEach((def) => {
                            const existingIdx = dbSections.findIndex((s: any) => s.id === def.id);
                            if (existingIdx === -1) {
                                dbSections.push({
                                    id: def.id,
                                    name: def.name,
                                    enabled: true,
                                    order: dbSections.length + 1
                                });
                                changed = true;
                            } else if (!String(dbSections[existingIdx]?.name || '').trim()) {
                                dbSections[existingIdx] = { ...dbSections[existingIdx], name: def.name };
                                changed = true;
                            }
                        });

                        // Garante que todos tenham uma ordem se estiverem nulos, mas respeita a ordem do DB
                        dbSections.forEach((s: any, i: number) => {
                            if (s.order === undefined || s.order === null) {
                                s.order = i + 1;
                                changed = true;
                            }
                        });

                        finalCustom.homepageSections = dbSections.sort((a, b) => (a.order || 0) - (b.order || 0));
                    }

                    return finalCustom;
                });
            } else {
                console.warn('[App v11.0] âš ï¸ Falha ao carregar do banco. Usando fallback local.');
            }
        };

        const loadPublicPaymentSettings = async () => {
            const result = await adminSettingsAPI.getPublicPaymentSettings();
            if (result && result.success !== false && result.data) {
                setPaymentSettings(normalizePaymentSettings(result.data));
                return;
            }

            setPaymentSettings(emptyPaymentSettings);
        };

        const loadPublicSponsoredSettings = async () => {
            const result = await adminSettingsAPI.getPublicSponsoredSettings();
            if (result && result.success !== false && result.data) {
                setSponsoredSettings({
                    ...emptySponsoredSettings,
                    ...result.data
                });
                return;
            }

            setSponsoredSettings(emptySponsoredSettings);
        };

        const loadOperationalSettings = async () => {
            const [paymentResult, shippingResult, walletResult] = await Promise.all([
                adminSettingsAPI.getPaymentSettings(),
                adminSettingsAPI.getShippingSettings(),
                adminSettingsAPI.getWalletSettings()
            ]);

            setPaymentSettings(
                paymentResult && paymentResult.success !== false && paymentResult.data
                    ? normalizePaymentSettings(paymentResult.data)
                    : emptyPaymentSettings
            );
            setShippingSettings(
                shippingResult && shippingResult.success !== false && shippingResult.data
                    ? normalizeShippingSettings(shippingResult.data)
                    : emptyShippingSettings
            );
            setWalletSettings(
                walletResult && walletResult.success !== false && walletResult.data
                    ? normalizeWalletSettings(walletResult.data)
                    : emptyWalletSettings
            );
        };

        const loadCustomerSession = async (sessionOverride?: any) => {
            const activeSession = sessionOverride || (await supabase.auth.getSession()).data.session;
            if (!activeSession?.user) {
                setCurrentCustomer(null);
                setIsConsultantSession(false);
                await loadPublicPaymentSettings();
                setShippingSettings(emptyShippingSettings);
                setWalletSettings(emptyWalletSettings);
                setCompensationSettings(emptyCompensationSettings);
                setBonuses(emptyBonusTotals);
                setDashboardUserPoints(0);
                setDashboardMonthlyUserPoints(0);
                setDashboardCareerProgress({
                    currentPinName: '',
                    nextPinName: '',
                    nextLevelVolume: 0
                });
                return;
            }

            if (activeSession.access_token) {
                localStorage.setItem('token', activeSession.access_token);
                localStorage.setItem(MARKETPLACE_SSO_TOKEN_KEY, activeSession.access_token);
            }

            const persistedRole = typeof window !== 'undefined'
                ? String(localStorage.getItem('rs-role') || '').trim().toLowerCase()
                : '';
            const userRole = activeSession.user?.user_metadata?.role || activeSession.user?.app_metadata?.role || persistedRole;
            if (userRole) {
                localStorage.setItem('rs-role', String(userRole));
            }

            if (activeSession?.user) {
                await loadOperationalSettings();

                // [RS-SYNC v12.0] Sincronia Robusta Dual-Table
                try {
                    // Busca paralela em user_profiles e consultores
                    const [profileRes, consultorRes] = await Promise.all([
                        supabase.from('user_profiles').select('*').eq('user_id', activeSession.user.id).maybeSingle(),
                        supabase.from('consultores').select('*').eq('user_id', activeSession.user.id).eq('user_id', activeSession.user.id).maybeSingle()
                    ]);

                    const realProfile = profileRes.data;
                    const realConsultor = consultorRes.data;

                    if (realProfile || realConsultor) {
                        const resolvedName =
                            realProfile?.full_name ||
                            realConsultor?.nome_completo ||
                            activeSession.user?.user_metadata?.full_name ||
                            activeSession.user?.user_metadata?.name ||
                            (activeSession.user?.email ? String(activeSession.user.email).split('@')[0] : '');
                        const resolvedSlug =
                            realConsultor?.id_consultor ||
                            realConsultor?.username ||
                            realProfile?.slug ||
                            (activeSession.user?.email ? String(activeSession.user.email).split('@')[0] : '');
                        const fallbackCode = await resolveConsultantNumericCode({
                            slug: resolvedSlug,
                            email: activeSession.user.email || realProfile?.email || realConsultor?.email,
                            name: resolvedName,
                        });

                        setUserProfile(prev => {
                            const newProfile: UserProfile = {
                                ...prev,
                                id: activeSession.user.id,
                                email: activeSession.user.email || prev.email,
                                name: resolvedName || '',
                                avatarUrl: normalizeAvatarUrl(realProfile?.avatar_url || realConsultor?.avatar_url || prev.avatarUrl) || prev.avatarUrl,
                                graduation: realConsultor?.graduacao || realProfile?.graduation || prev.graduation || 'CONSULTOR',
                                accountStatus: realConsultor?.status_conta || realProfile?.account_status || prev.accountStatus || 'Ativo',
                                monthlyActivity: realConsultor?.atividade_mensal || realProfile?.monthly_activity || prev.monthlyActivity || 'Ativo',
                                category: realConsultor?.categoria || realProfile?.category || (
                                    ['lojista', 'seller', 'marketplace_admin', 'super_admin', 'admin'].includes(String(userRole || '').trim().toLowerCase())
                                        ? 'LOJISTA'
                                        : prev.category || ''
                                ),
                                cpfCnpj: realProfile?.cpf_cnpj || realConsultor?.cpf_cnpj || prev.cpfCnpj,
                                code: String(realConsultor?.codigo_consultor || realConsultor?.id_numerico || realProfile?.id_numerico || fallbackCode || prev.code || ''),
                                loginId: realConsultor?.username || realConsultor?.id_consultor || realProfile?.slug || resolvedSlug || '',
                                idNumerico: realConsultor?.id_numerico || realConsultor?.codigo_consultor || realProfile?.id_numerico || fallbackCode || prev.idNumerico,
                                idConsultor: resolvedSlug || '',
                                slug: realConsultor?.slug || realProfile?.slug || resolvedSlug || ''
                            };

                            // SÃ³ atualiza se houver mudanÃ§a real (evita loops e flashes)
                            if (JSON.stringify(prev) === JSON.stringify(newProfile)) {
                                return prev;
                            }

                            localStorage.setItem('rs-consultant-profile', JSON.stringify(newProfile));
                            window.dispatchEvent(new StorageEvent('storage', {
                                key: 'rs-consultant-profile',
                                newValue: JSON.stringify(newProfile)
                            }));
                            window.dispatchEvent(new Event('rs-consultant-profile-updated'));
                            return newProfile;
                        });
                    }
                    if (realConsultor) {
                        setIsConsultantSession(true);
                        setCurrentCustomer({
                            id: realConsultor.id,
                            name: realConsultor.name || realConsultor.nome_completo || 'Cliente',
                            email: activeSession.user.email!,
                            passwordHash: ''
                        });
                    } else {
                        const canOperateMarketplaceAsConsultant = roleAllowsMarketplaceCdFlow(userRole);
                        setIsConsultantSession(canOperateMarketplaceAsConsultant);
                        // Tenta na tabela profiles se nÃ£o achar em consultores
                        const { data: userProfileData } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('email', activeSession.user.email)
                            .maybeSingle();

                        if (realProfile || userProfileData || canOperateMarketplaceAsConsultant) {
                            setCurrentCustomer({
                                id: activeSession.user.id,
                                name: realProfile?.full_name || userProfileData?.full_name || userProfileData?.name || 'Cliente',
                                email: activeSession.user.email!,
                                passwordHash: ''
                            });
                        }
                    }
                } catch (err) {
                    setIsConsultantSession(false);
                    console.warn('[Sync Consultant Profile] Erro na sincronia robusta:', err);
                }

                void loadCareerDashboardData();
            }
        };

        loadCustomization();
        void loadPublicSponsoredSettings();

        const hydrateCustomerFromBridgeToken = async (rawToken: string) => {
            const { accessToken } = normalizeMarketplaceAccessToken(rawToken);
            if (!accessToken) return false;

            try {
                const authApi = supabase.auth as any;
                const response = await authApi.getUser(accessToken);
                const bridgeUser = response?.data?.user;

                if (!bridgeUser) {
                    return false;
                }

                localStorage.setItem('token', accessToken);
                localStorage.setItem(MARKETPLACE_SSO_TOKEN_KEY, accessToken);
                await loadCustomerSession({
                    user: bridgeUser,
                    access_token: accessToken
                });

                if (typeof window !== 'undefined' && window.location.hash.includes('/sso')) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                return true;
            } catch (error) {
                console.error('[Marketplace] SSO hydration failed:', error);
                localStorage.removeItem(MARKETPLACE_SSO_TOKEN_KEY);
                return false;
            }
        };

        const initializeMarketplaceAuth = async () => {
            const bridgeToken = extractMarketplaceBridgeToken();
            if (bridgeToken) {
                const hydrated = await hydrateCustomerFromBridgeToken(bridgeToken);
                if (hydrated) {
                    return;
                }
            }

            const storedToken = localStorage.getItem(MARKETPLACE_SSO_TOKEN_KEY);
            if (storedToken) {
                const hydrated = await hydrateCustomerFromBridgeToken(storedToken);
                if (hydrated) {
                    return;
                }
            }

            await loadCustomerSession();
        };

        void initializeMarketplaceAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                localStorage.removeItem(MARKETPLACE_SSO_TOKEN_KEY);
            } else if (session?.access_token) {
                localStorage.setItem(MARKETPLACE_SSO_TOKEN_KEY, session.access_token);
            }

            if (!session) {
                localStorage.removeItem('token');
                localStorage.removeItem('rs-role');
                setCurrentCustomer(null);
                setIsConsultantSession(false);
            }

            void loadCustomerSession(session);
            window.dispatchEvent(new Event('rs-marketplace-auth-updated'));
        });

        reviewService.fetchAllReviews().then(data => {
            if (data.length > 0) setReviews(data);
        }).catch(() => { });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [isPreviewDetected]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [marketingAssets, setMarketingAssets] = useState<MarketingAsset[]>([]);
    const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
    const [charges, setCharges] = useState<Charge[]>([]);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
    const [selectedDistributorInventory, setSelectedDistributorInventory] = useState<DistributorInventoryItem[]>([]);
    const [isDistributorSelectionModalOpen, setIsDistributorSelectionModalOpen] = useState(false);
    const [selectedCDId, setSelectedCDId] = useState<string>('');

    useEffect(() => {
        let isMounted = true;

        void resolveMarketplaceReferrer({ slug: signupContext.sponsorRef }).then((resolved) => {
            if (isMounted) {
                setResolvedMarketplaceSponsor(resolved);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [signupContext.sponsorRef]);

    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('rs-consultant-profile');

        // Initial default (Safe fallback)
        let profile: UserProfile = createEmptyMarketplaceUserProfile();

        if (saved) {
            try {
                const parsed = JSON.parse(saved) as UserProfile;
                // v12.0: Garantir que campos de carreira existem no objeto recuperado
                return {
                    ...profile, // Campos padrÃ£o
                    ...parsed,  // Sobrescreve com o que tem no cache
                };
            } catch { }
        }
        return profile;
    });
    const [bonuses, setBonuses] = useState(emptyBonusTotals);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Cart State
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const savedCart = localStorage.getItem('rs-marketplace-cart');
            const parsedCart = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsedCart) ? parsedCart : [];
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showFloatingCartStatus, setShowFloatingCartStatus] = useState(false);

    useEffect(() => {
        localStorage.setItem('rs-marketplace-cart', JSON.stringify(cart));
    }, [cart]);

    const normalizedConsultantCategory = String(userProfile.category || '').trim().toUpperCase();
    const storedMarketplaceRole = typeof window !== 'undefined'
        ? String(localStorage.getItem('rs-role') || '').trim().toLowerCase()
        : '';
    const normalizedSessionLoginId = String(userProfile.loginId || userProfile.idConsultor || userProfile.slug || '').trim().toLowerCase();
    const normalizedSessionEmail = String(userProfile.email || '').trim().toLowerCase();
    const hasMarketplaceOperatorIdentity = (
        roleAllowsMarketplaceCdFlow(storedMarketplaceRole) ||
        normalizedSessionLoginId === DEFAULT_MARKETPLACE_SPONSOR_REF ||
        normalizedSessionEmail === 'rsprolipsioficial@gmail.com'
    );
    const isLojistaSession = hasMarketplaceOperatorIdentity || (
        isConsultantSession && /(LOJISTA|LOGISTA)/i.test(normalizedConsultantCategory)
    );
    const canUseMemberPricing = isConsultantSession;
    const activePricingTier: ProductPricingTier = canUseMemberPricing ? 'consultant' : 'retail';
    const currentOperatorUserId = String(currentCustomer?.id || userProfile.id || '').trim();
    const currentOperatorLoginRefs = new Set(
        [
            currentCustomer?.loginId,
            userProfile.loginId,
            userProfile.idConsultor,
            userProfile.slug,
            currentCustomer?.email ? String(currentCustomer.email).split('@')[0] : '',
            userProfile.email ? String(userProfile.email).split('@')[0] : '',
        ]
            .map((value) => String(value || '').trim().toLowerCase())
            .filter(Boolean)
    );
    const isRSManagedProduct = (product: Product) => {
        const ownerType = String((product as any).ownerType || (product as any).owner_type || '').trim().toUpperCase();
        return (
            ownerType === 'RS' ||
            (product as any).isRSProduct === true ||
            (product as any).is_rs_product === true ||
            normalizeFulfillmentOriginType(product.fulfillmentOriginType) !== 'seller_store'
        );
    };
    const isManagedByCurrentOperator = (product: Product) => {
        if (hasMarketplaceOperatorIdentity) {
            return isRSManagedProduct(product);
        }

        if (normalizeFulfillmentOriginType(product.fulfillmentOriginType) !== 'seller_store') {
            return false;
        }

        const ownerUserId = String(product.ownerUserId || '').trim();
        const ownerLoginId = String(product.ownerLoginId || '').trim().toLowerCase();

        return Boolean(
            (ownerUserId && currentOperatorUserId && ownerUserId === currentOperatorUserId) ||
            (ownerLoginId && currentOperatorLoginRefs.has(ownerLoginId))
        );
    };
    const managedStoreProducts = useMemo(
        () => products.filter(isManagedByCurrentOperator),
        [products, hasMarketplaceOperatorIdentity, currentOperatorUserId, currentOperatorLoginRefs]
    );
    const managedStoreProductIds = useMemo(
        () => new Set(managedStoreProducts.map((product) => String(product.id))),
        [managedStoreProducts]
    );
    const managedStoreCollections = useMemo(() => {
        if (hasMarketplaceOperatorIdentity) {
            return collections.filter((collection) => {
                const collectionProductIds = Array.isArray(collection.productIds) ? collection.productIds : [];
                return collectionProductIds.length === 0 || collectionProductIds.some((productId) => {
                    const product = products.find((candidate) => String(candidate.id) === String(productId));
                    return product ? isRSManagedProduct(product) : false;
                });
            });
        }

        return collections.filter((collection) => {
            const ownerUserId = String((collection as any).ownerUserId || '').trim();
            const ownerLoginId = String((collection as any).ownerLoginId || '').trim().toLowerCase();
            if ((ownerUserId && currentOperatorUserId && ownerUserId === currentOperatorUserId) || (ownerLoginId && currentOperatorLoginRefs.has(ownerLoginId))) {
                return true;
            }
            return (collection.productIds || []).some((productId) => managedStoreProductIds.has(String(productId)));
        });
    }, [collections, currentOperatorLoginRefs, currentOperatorUserId, hasMarketplaceOperatorIdentity, managedStoreProductIds, products]);
    const managedStoreOrders = useMemo(() => {
        const orderBelongsToCurrentOperator = (order: Order) => {
            const orderOriginType = normalizeFulfillmentOriginType(order.fulfillmentOriginType);
            const orderOwnerUserId = String((order as any).ownerUserId || '').trim();
            const orderOwnerLoginId = String((order as any).ownerLoginId || '').trim().toLowerCase();
            const itemOwnerMatches = (order.items || []).some((item) => {
                const ownerUserId = String(item.ownerUserId || '').trim();
                const ownerLoginId = String(item.ownerLoginId || '').trim().toLowerCase();
                return Boolean(
                    (ownerUserId && currentOperatorUserId && ownerUserId === currentOperatorUserId) ||
                    (ownerLoginId && currentOperatorLoginRefs.has(ownerLoginId))
                );
            });
            const hasSellerStoreItems = (order.items || []).some((item) => normalizeFulfillmentOriginType(item.fulfillmentOriginType) === 'seller_store');

            if (hasMarketplaceOperatorIdentity) {
                if (orderOriginType === 'seller_store' || hasSellerStoreItems) {
                    return false;
                }
                return true;
            }

            return Boolean(
                (orderOriginType === 'seller_store' && ((orderOwnerUserId && currentOperatorUserId && orderOwnerUserId === currentOperatorUserId) || (orderOwnerLoginId && currentOperatorLoginRefs.has(orderOwnerLoginId)))) ||
                itemOwnerMatches
            );
        };

        return orders.filter(orderBelongsToCurrentOperator);
    }, [currentOperatorLoginRefs, currentOperatorUserId, hasMarketplaceOperatorIdentity, orders]);

    const storefrontProducts = useMemo(() => {
        if (!isLojistaSession || !selectedDistributor) return products;
        return applyDistributorInventoryToProducts(products, selectedDistributorInventory, selectedDistributor.name);
    }, [isLojistaSession, products, selectedDistributor, selectedDistributorInventory]);

    const pricedProducts = useMemo(() => {
        if (!canUseMemberPricing) return storefrontProducts;

        return storefrontProducts.map((product) => {
            const retailPrice = Number(product.price || 0);
            const consultantPrice = Number(product.memberPrice || 0);

            if (!consultantPrice || consultantPrice <= 0 || consultantPrice >= retailPrice) {
                return product;
            }

            const pricingFactor = retailPrice > 0 ? consultantPrice / retailPrice : 1;
            const compareAtPrice = Number(product.compareAtPrice || 0);

            return {
                ...product,
                price: Number(consultantPrice.toFixed(2)),
                compareAtPrice: compareAtPrice > consultantPrice ? compareAtPrice : retailPrice,
                variants: Array.isArray(product.variants)
                    ? product.variants.map((variant) => ({
                        ...variant,
                        price: Number((Number(variant.price || 0) * pricingFactor).toFixed(2))
                    }))
                    : product.variants
            };
        });
    }, [canUseMemberPricing, storefrontProducts]);

    const selectedProductForDisplay = useMemo(() => {
        if (!selectedProduct) return null;
        return pricedProducts.find((product) => String(product.id) === String(selectedProduct.id)) || selectedProduct;
    }, [pricedProducts, selectedProduct]);

    // Offer products: has compareAtPrice OR is marked as 'Sale'. Falls back to first 4 active products so the section always renders.
    const offerProducts = useMemo(() => {
        const markedOffers = pricedProducts.filter(p =>
            (p.compareAtPrice && p.compareAtPrice > p.price) ||
            (p.status && ['Sale', 'Oferta', 'PromoÃ§Ã£o'].includes(p.status))
        );
        return markedOffers.length > 0 ? markedOffers : pricedProducts.filter(p => p.status === 'Ativo').slice(0, 4);
    }, [pricedProducts]);
    const homeSponsoredProducts = useMemo(() => {
        const sponsoredPool = pricedProducts
            .filter((product) => isSponsoredCampaignActive(product, 'home_featured_strip'))
            .sort((a, b) => Number(a.merchandising?.sponsored?.priority ?? 999) - Number(b.merchandising?.sponsored?.priority ?? 999));

        return rotateSponsoredProducts(sponsoredPool, 'home_featured_strip', sponsoredSettings);
    }, [pricedProducts, sponsoredSettings]);
    const recentlyViewedProducts = useMemo(() => recentlyViewedIds.map(id => pricedProducts.find(p => p.id === id)).filter((p): p is Product => Boolean(p)), [recentlyViewedIds, pricedProducts]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return pricedProducts;
        const query = searchQuery.toLowerCase();
        return pricedProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }, [pricedProducts, searchQuery]);

    useEffect(() => {
        setCart((previousCart) => {
            let changed = false;

            const nextCart = previousCart.flatMap((item) => {
                const product = pricedProducts.find((candidate) => String(candidate.id) === String(item.productId));
                if (!product) return [item];

                const pricedVariant = product.variants?.find((variant) => String(variant.id) === String(item.variantId));
                const nextPrice = Number(pricedVariant?.price ?? product.price ?? item.price);
                const maxAvailable = Math.max(0, Number(pricedVariant?.inventory ?? product.inventory ?? 0));

                if (maxAvailable <= 0 && product.trackQuantity !== false) {
                    changed = true;
                    return [];
                }

                const nextQuantity = product.trackQuantity === false
                    ? item.quantity
                    : Math.min(item.quantity, maxAvailable);

                if (
                    Math.abs(nextPrice - Number(item.price || 0)) < 0.001 &&
                    nextQuantity === item.quantity
                ) {
                    return [item];
                }

                changed = true;
                return [{
                    ...item,
                    price: nextPrice,
                    quantity: nextQuantity
                }];
            });

            return changed ? nextCart : previousCart;
        });
    }, [pricedProducts]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    // SincronizaÃ§Ã£o em Tempo Real (Triple Channel) v4.2
    useEffect(() => {
        let heartbeatInterval: any = null;

        if (isLivePreview) {
            // Handshake Heartbeat v3.1
            const handshakeChannelToken = new BroadcastChannel('rs_live_preview_handshake');
            const sendHandshake = () => {
                handshakeChannelToken.postMessage({ type: 'PREVIEW_READY', timestamp: Date.now() });
            };
            sendHandshake();
            heartbeatInterval = setInterval(sendHandshake, 2000);
        }

        const channel = new BroadcastChannel('rs_live_preview');
        const handleSync = (payload: any) => {
            // v6.0 Blindagem Absoluta: Apenas a instÃ¢ncia PREVIEW processa sync. 
            // Ignora se for enviada pela prÃ³pria instÃ¢ncia (loop prevention).
            if (!isLivePreviewRef.current) return;
            if (payload.senderId === instanceId) return;

            if (payload?.type === 'LIVE_PREVIEW_UPDATE' && payload.data) {
                const msgTimestamp = payload.timestamp || Date.now();
                if (msgTimestamp <= lastSyncTimestampRef.current && lastSyncTimestampRef.current !== 0) {
                    return;
                }
                lastSyncTimestampRef.current = msgTimestamp;

                let finalData = { ...payload.data };
                const dataVersion = payload.version || 'unknown';
                lastSyncVersionRef.current = dataVersion;
                lastSyncSourceRef.current = payload.source || 'UNK';

                console.log(`%c[Sync ${dataVersion}] ðŸ“¥ Recebido: ${payload.data.hero?.title || 'Update'} | Logo: ${finalData.logoUrl ? (finalData.logoUrl.length > 50 ? finalData.logoUrl.substring(0, 30) + '...' : finalData.logoUrl) + ' (' + finalData.logoUrl.length + ' ch)' : 'N/A'}`, 'color: #00ff00; font-weight: bold;');

                try {
                    // v8.0: RecuperaÃ§Ã£o de Buffer sÃ³ se necessÃ¡rio
                    if (finalData.logoUrl === 'BUFFERED_IN_LOGO_KEY') {
                        const bufferedLogo = localStorage.getItem('rs_logo_buffer');
                        if (bufferedLogo) {
                            finalData.logoUrl = bufferedLogo;
                            console.log(`%c[Sync v8.0] ðŸ“¦ Logo pesado recuperado do BUFFER (${bufferedLogo.length} chars)`, 'color: #00ffff;');
                        } else {
                            console.warn('[Sync v8.0] âš ï¸ Buffer placeholder found but no data in storage!');
                        }
                    }

                    // v4.1: RecuperaÃ§Ã£o Universal de Buffer (Banners)
                    const hasBufferedBanners = finalData.carouselBanners?.some((b: any) => b.desktopImage === 'BUFFERED' || b.id === 'BUFFERED');
                    if (hasBufferedBanners || (!finalData.carouselBanners?.length && localStorage.getItem('rs_banners_buffer'))) {
                        const bufferedBanners = localStorage.getItem('rs_banners_buffer');
                        if (bufferedBanners) {
                            try {
                                finalData.carouselBanners = JSON.parse(bufferedBanners);
                                console.log('[Sync v8.0] ðŸ“¦ Banners recuperados do buffer');
                            } catch (e) { }
                        }
                    }
                } catch (e) {
                    console.warn('[Sync Receptor] Storage access failed', e);
                }

                setStoreCustomization(finalData);
            }
        };

        channel.onmessage = (event) => {
            if (event.data) handleSync({ ...event.data, source: 'BROADCAST' });
        };

        const handleWindowMessage = (event: MessageEvent) => {
            if (event.data?.type === 'LIVE_PREVIEW_UPDATE') handleSync({ ...event.data, source: 'WINDOW' });
        };
        window.addEventListener('message', handleWindowMessage);

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'rs_preview_buffer' && event.newValue) {
                try {
                    const payload = JSON.parse(event.newValue);
                    if (payload.type === 'LIVE_PREVIEW_UPDATE') handleSync({ ...payload, source: 'STORAGE' });
                } catch (e) { }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            channel.close();
            window.removeEventListener('message', handleWindowMessage);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [instanceId]); // v4.3: Removido isLivePreview para evitar reconexÃ£o constante

    // Master Identity Cleanup & Enforcement
    useEffect(() => {
        const isMaster =
            userProfile.idConsultor?.toLowerCase().includes('rsprolipsi') ||
            userProfile.slug?.toLowerCase().includes('rsprolipsi') ||
            (userProfile.email && userProfile.email.includes('rsprolipsi')) ||
            userProfile.id === 'rsprolipsioficial' ||
            userProfile.id === 'rsprolipsi';

        if (isMaster) {
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003';
            const isLocal = currentOrigin.includes('localhost');
            const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';

            const officialId = 'rsprolipsi';
            const officialReferralLink = `${marketplaceDomain}/indicacao/${officialId}#/signup`;
            const officialAffiliateLink = `${marketplaceDomain}/loja/${officialId}`;

            const needsUpdate =
                userProfile.idConsultor !== officialId ||
                userProfile.id !== officialId ||
                userProfile.referralLink !== officialReferralLink ||
                userProfile.affiliateLink !== officialAffiliateLink;

            if (needsUpdate) {
                const updatedProfile = {
                    ...userProfile,
                    id: officialId,
                    idConsultor: officialId,
                    slug: officialId,
                    referralLink: officialReferralLink,
                    affiliateLink: officialAffiliateLink,
                    avatarUrl: userProfile.avatarUrl || 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png'
                };
                setUserProfile(updatedProfile);
                localStorage.setItem('rs-consultant-profile', JSON.stringify(updatedProfile));
            }
        }
    }, [userProfile]);

    useEffect(() => {
        // Nao force a identidade oficial da RS pelo param `ref`.
        // O referral precisa influenciar a venda, nao sobrescrever o perfil autenticado.
    }, []);

    useEffect(() => {
        const isDev = (import.meta as any).env?.DEV ?? true;
        if (isDev && typeof window !== 'undefined') {
            try {
                if (!localStorage.getItem('rs-role')) localStorage.setItem('rs-role', 'super_admin');
            } catch { }
        }
    }, []);

    useEffect(() => {
        const syncSignupContext = () => {
            setSignupContext(resolveMarketplaceSignupContext());
        };

        syncSignupContext();
        window.addEventListener('hashchange', syncSignupContext);
        window.addEventListener('popstate', syncSignupContext);

        return () => {
            window.removeEventListener('hashchange', syncSignupContext);
            window.removeEventListener('popstate', syncSignupContext);
        };
    }, []);

    useEffect(() => {
        const resolveViewFromHash = () => {
            const hash = (window.location.hash || '').replace('#', '');
            const currentSignupContext = resolveMarketplaceSignupContext();

            setSignupContext(currentSignupContext);

            if (hash.startsWith('/cd')) {
                setView('rsCD');
            } else if (hash.startsWith('/market-drop') || hash.startsWith('/drop-afiliado')) {
                setView('rsControleDrop');
            } else {
                switch (hash) {
                    case '/customer-login':
                        setView('customerLogin');
                        break;
                    case '/customer-register':
                        setView('customerRegister');
                        break;
                    case '/seller-register':
                    case '/signup':
                    case '/cadastro':
                        setView('sellerRegistration');
                        break;
                    case '/customer-forgot-password':
                        setView('customerForgotPassword');
                        break;
	                    case '/dashboard-editor': {
	                        const isSuperAdmin = (typeof window !== 'undefined' && (localStorage.getItem('rs-role') === 'super_admin' || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')));
	                        setView(isSuperAdmin ? 'dashboardEditor' : 'consultantStore');
	                        break;
	                    }
	                    case '/store-editor':
	                        setView('storeEditor');
	                        break;
	                    case '/store-banners':
	                        setView('storeBannerEditor');
	                        break;
	                    case '/consultant-profile':
	                        setView('consultantProfile');
	                        break;
                    case '/checkout':
                        setView('checkout');
                        break;
                    case '/seller':
                        setView('consultantStore');
                        break;
                    default:
                        setView(currentSignupContext.initialView);
                        break;
                }
            }
        };
        resolveViewFromHash();
        window.addEventListener('hashchange', resolveViewFromHash);
        return () => window.removeEventListener('hashchange', resolveViewFromHash);
    }, []);

    useEffect(() => {
        if (view === 'checkout') {
            const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
            const paramProductId = params.get('productId');
            const hasCartItems = cart.length > 0;
            const hasSelectedProduct = Boolean(selectedProduct?.id);
            if (!paramProductId && !hasCartItems && !hasSelectedProduct) {
                setView('home');
                try { if (typeof window !== 'undefined') window.location.hash = ''; } catch { }
            }
        }
    }, [view, cart.length, selectedProduct]);

    useEffect(() => {
        let cancelled = false;
        const cleanupTasks: Array<() => void> = [];

        (async () => {
            try {
                const [prodResult, colResult] = await Promise.allSettled([
                    productsAPI.getAll(),
                    collectionsAPI.getAll()
                ]);
                if (cancelled) return;
                const prodRes: any = prodResult.status === 'fulfilled' ? prodResult.value : null;
                const colRes: any = colResult.status === 'fulfilled' ? colResult.value : null;

                if (prodResult.status === 'rejected') {
                    console.warn('[Marketplace bootstrap] Falha ao carregar produtos:', prodResult.reason);
                }
                if (colResult.status === 'rejected') {
                    console.warn('[Marketplace bootstrap] Falha ao carregar colecoes:', colResult.reason);
                }
                if (prodRes && prodRes.success !== false && Array.isArray(prodRes.data)) {
                    const mapped: Product[] = prodRes.data.map((it: any) => ({
                        id: String(it.id ?? ''),
                        name: String(it.name ?? it.title ?? 'Produto'),
                        seller: String(it.seller ?? ''),
                        price: Number(it.price ?? it.sale_price ?? 0),
                        dropshipPrice: Number(it.dropship_price ?? it.specifications?.dropshipPrice ?? 0),
                        costPerItem: Number(it.cost ?? it.cost_per_item ?? 0),
                        currency: String(it.currency ?? 'BRL'),
                        shortDescription: String(it.short_description ?? it.description ?? ''),
                        description: String(it.description ?? ''),
                        featured_image: String(it.featured_image ?? it.image_url ?? (Array.isArray(it.images) && it.images[0]) ?? ''),
                        images: Array.isArray(it.images) ? it.images : [String(it.image_url ?? it.featured_image ?? '')].filter(Boolean),
                        rating: Number(it.rating ?? 0),
                        reviewCount: Number(it.review_count ?? 0),
                        collectionId: it.collection_id ?? null,
                        status: String(it.status ?? 'Ativo'),
                        inventory: Number(it.inventory ?? 0),
                        type: String(it.type ?? 'FÃ­sico'),
                        requiresShipping: Boolean(it.requires_shipping ?? true),
                        trackQuantity: Boolean(it.track_quantity ?? true),
                        chargeTax: Boolean(it.charge_tax ?? true),
                        continueSelling: Boolean(it.continue_selling ?? false),
                        seoTitle: String(it.seo_title ?? it.name ?? ''),
                        seoDescription: String(it.seo_description ?? it.short_description ?? ''),
                        urlHandle: String(it.url_handle ?? ''),
                        options: Array.isArray(it.options) ? it.options : [],
                        variants: Array.isArray(it.variants) ? it.variants : [],
                        compareAtPrice: it.compare_at_price !== undefined ? Number(it.compare_at_price) : undefined,
                        memberPrice: it.member_price !== undefined ? Number(it.member_price) : undefined,
                        productType: (it.product_type ?? it.specifications?.productType ?? 'physical') as Product['productType'],
                        commissionOrigin: (it.commission_origin ?? it.specifications?.commissionOrigin ?? 'rs_physical') as Product['commissionOrigin'],
                        affiliateModel: (it.affiliate_model ?? it.specifications?.affiliateModel ?? 'none') as Product['affiliateModel'],
                        ownerUserId: it.owner_user_id ?? it.specifications?.ownerUserId ?? null,
                        ownerLoginId: String(it.owner_login_id ?? it.specifications?.ownerLoginId ?? ''),
                        ownerType: String(it.owner_type ?? it.specifications?.ownerType ?? ''),
                        isRSProduct: Boolean(it.is_rs_product ?? it.specifications?.isRSProduct ?? false),
                        fulfillmentOriginType: (it.fulfillment_origin_type ?? it.specifications?.fulfillmentOriginType ?? 'central') as Product['fulfillmentOriginType'],
                        fulfillmentOriginId: it.fulfillment_origin_id ?? it.specifications?.fulfillmentOriginId ?? null,
                        fulfillmentOriginName: String(it.fulfillment_origin_name ?? it.specifications?.fulfillmentOriginName ?? ''),
                        fulfillmentOriginZip: String(it.fulfillment_origin_zip ?? it.specifications?.fulfillmentOriginZip ?? ''),
                        subcategory: it.specifications?.subcategory || '',
                        supplier: it.specifications?.supplier || '',
                        barcode: it.specifications?.barcode || '',
                        weight: it.specifications?.weight,
                        weightUnit: it.specifications?.weightUnit || 'kg',
                        collectionIds: it.specifications?.collections || [],
                    }));
                    const normalizedMapped: Product[] = mapped.map((product, index) => {
                        const source = prodRes.data[index] || {};
                        const specifications = normalizeRecord(source.specifications);
                        const normalizedSourceImages = normalizeStringArray(source.images);
                        const images = normalizedSourceImages.length > 0
                            ? normalizedSourceImages
                            : product.images;
                        const collectionIds = normalizeStringArray(specifications.collections);
                        const options = normalizeProductOptions(specifications.options);
                        const variants = normalizeProductVariants(
                            specifications.variants,
                            Number(source.price ?? source.sale_price ?? product.price ?? 0)
                        );

                        return {
                            ...product,
                            costPerItem: source.cost_price !== undefined
                                ? Number(source.cost_price)
                                : product.costPerItem,
                            shortDescription: String(source.short_description ?? specifications.shortDescription ?? product.shortDescription ?? ''),
                            featured_image: String(source.featured_image ?? source.image_url ?? images[0] ?? ''),
                            images,
                            videos: normalizeStringArray(specifications.videos),
                            materials: normalizeProductMaterials(specifications.materials),
                            collectionId: source.collection_id ?? collectionIds[0] ?? product.collectionId ?? null,
                            collectionIds: collectionIds.length > 0
                                ? collectionIds
                                : (source.collection_id ? [String(source.collection_id)] : (product.collectionIds || [])),
                            status: source.published === false || source.is_active === false ? 'Rascunho' : 'Ativo',
                            inventory: Number(source.inventory ?? source.stock_quantity ?? source.stock ?? product.inventory ?? 0),
                            type: String(specifications.type ?? source.type ?? product.type ?? 'FÃƒÂ­sico'),
                            sku: String(source.sku ?? specifications.sku ?? product.sku ?? ''),
                            barcode: String(specifications.barcode ?? product.barcode ?? ''),
                            requiresShipping: Boolean(specifications.requiresShipping ?? source.requires_shipping ?? product.requiresShipping ?? true),
                            trackQuantity: Boolean(specifications.trackQuantity ?? source.track_quantity ?? product.trackQuantity ?? true),
                            seoDescription: String(source.seo_description ?? source.short_description ?? specifications.shortDescription ?? product.seoDescription ?? ''),
                            options: options.length > 0 ? options : normalizeProductOptions(product.options),
                            variants: variants.length > 0 ? variants : normalizeProductVariants(product.variants, Number(product.price ?? 0)),
                            compareAtPrice: source.compare_price !== undefined
                                ? Number(source.compare_price)
                                : product.compareAtPrice,
                            dropshipPrice: source.dropship_price !== undefined
                                ? Number(source.dropship_price)
                                : (specifications.dropshipPrice !== undefined ? Number(specifications.dropshipPrice) : product.dropshipPrice),
                            subcategory: specifications.subcategory || product.subcategory || '',
                            supplier: specifications.supplier || product.supplier || '',
                            weight: specifications.weight ?? product.weight,
                            weightUnit: specifications.weightUnit || product.weightUnit || 'kg',
                            category: String(source.category ?? specifications.subcategory ?? product.category ?? ''),
                            productType: (source.product_type ?? specifications.productType ?? product.productType ?? 'physical') as Product['productType'],
                            commissionOrigin: (source.commission_origin ?? specifications.commissionOrigin ?? product.commissionOrigin ?? 'rs_physical') as Product['commissionOrigin'],
                            affiliateModel: (source.affiliate_model ?? specifications.affiliateModel ?? product.affiliateModel ?? 'none') as Product['affiliateModel'],
                            ownerUserId: source.owner_user_id ?? specifications.ownerUserId ?? product.ownerUserId ?? null,
                            ownerLoginId: String(source.owner_login_id ?? specifications.ownerLoginId ?? product.ownerLoginId ?? ''),
                            ownerType: String(source.owner_type ?? specifications.ownerType ?? product.ownerType ?? ''),
                            isRSProduct: Boolean(source.is_rs_product ?? specifications.isRSProduct ?? product.isRSProduct ?? false),
                            fulfillmentOriginType: (source.fulfillment_origin_type ?? specifications.fulfillmentOriginType ?? product.fulfillmentOriginType ?? 'central') as Product['fulfillmentOriginType'],
                            fulfillmentOriginId: source.fulfillment_origin_id ?? specifications.fulfillmentOriginId ?? product.fulfillmentOriginId ?? null,
                            fulfillmentOriginName: String(source.fulfillment_origin_name ?? specifications.fulfillmentOriginName ?? product.fulfillmentOriginName ?? ''),
                            fulfillmentOriginZip: String(source.fulfillment_origin_zip ?? specifications.fulfillmentOriginZip ?? product.fulfillmentOriginZip ?? ''),
                            merchandising: normalizeProductMerchandising(specifications.merchandising),
                        };
                    });
                    persistedProductIdsRef.current = new Set(normalizedMapped.map((product) => String(product.id)));



                    setProducts(normalizedMapped);
                    writeCachedAppState(APP_CACHE_KEYS.products, normalizedMapped);
                } else if (prodRes?.success !== false && Array.isArray(prodRes?.data)) {
                    persistedProductIdsRef.current = new Set();
                    setProducts([]);
                    writeCachedAppState(APP_CACHE_KEYS.products, []);
                } else {
                    console.warn('[Marketplace bootstrap] Produtos indisponiveis, mantendo cache atual.');
                }
                if (colRes && colRes.success !== false && Array.isArray(colRes.data)) {
                    const cols: Collection[] = mapMarketplaceCollections(colRes.data);
                    setCollections(cols);
                    writeCachedAppState(APP_CACHE_KEYS.collections, cols);
                } else if (colRes?.success !== false && Array.isArray(colRes?.data)) {
                    setCollections([]);
                    writeCachedAppState(APP_CACHE_KEYS.collections, []);
                } else {
                    console.warn('[Marketplace bootstrap] Colecoes indisponiveis, mantendo cache atual.');
                }
                cleanupTasks.push(scheduleNonCriticalTask(async () => {
                    const [mpResult, cdResult] = await Promise.allSettled([
                        marketingPixelsAPI.list(),
                        distributorsAPI.list()
                    ]);
                    if (cancelled) return;
                    const mpRes: any = mpResult.status === 'fulfilled' ? mpResult.value : null;
                    const cdRes: any = cdResult.status === 'fulfilled' ? cdResult.value : null;

                    if (mpRes && mpRes.success !== false && Array.isArray(mpRes.data)) {
                        setMarketingPixels(mpRes.data.map((p: any) => ({
                            id: String(p.id ?? ''),
                            type: String(p.type ?? 'Facebook') as any,
                            name: String(p.name ?? p.campaign_name ?? 'Pixel'),
                            pixelId: String(p.pixel_id ?? p.tag_id ?? p.measurement_id ?? ''),
                            idLabel: p.label ? String(p.label) : undefined,
                            status: Boolean(p.active) ? 'Ativo' : 'Inativo'
                        })));
                    } else if (mpResult.status === 'rejected') {
                        console.warn('[Marketplace bootstrap] Falha ao carregar pixels:', mpResult.reason);
                    }

                    if (cdRes && cdRes.success !== false && Array.isArray(cdRes.data)) {
                        const cds: Distributor[] = cdRes.data.map((d: any) => ({
                            id: String(d.id ?? ''),
                            name: String(d.name ?? 'CD'),
                            ownerName: String(d.owner_name ?? d.ownerName ?? ''),
                            cpfCnpj: String(d.cnpj_cpf ?? ''),
                            email: String(d.email ?? ''),
                            phone: String(d.phone ?? ''),
                            stores: Array.isArray(d.stores) ? d.stores : [],
                        }));
                        setDistributors(cds);
                    } else if (cdResult.status === 'rejected') {
                        console.warn('[Marketplace bootstrap] Falha ao carregar CDs:', cdResult.reason);
                    }
                }, 1500));
            } catch (e) {
                console.warn('[Marketplace bootstrap] Falha no carregamento inicial:', e);
            }
        })();

        return () => {
            cancelled = true;
            cleanupTasks.forEach((cleanup) => cleanup());
        };
    }, []);

    useEffect(() => {
        const shouldLoadDashboardLayout = ['consultantStore', 'compensationPlan', 'dashboardEditor', 'bannerDashboard'].includes(view);
        if (!shouldLoadDashboardLayout || hasLoadedDashboardLayoutRef.current) return;

        hasLoadedDashboardLayoutRef.current = true;
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
        (async () => {
            try {
                if (!navigator.onLine) return;
                const res = await fetch(`${API_URL}/v1/dashboard-layout/marketplace`);
                if (res.ok) {
                    const json = await res.json().catch(() => ({}));
                    if (json && json.success && json.config) {
                        const cfg = json.config as any;
                        const srcMap: Record<string, string> = {
                            bonusCicloGlobal: 'cycleBonus',
                            bonusTopSigme: 'topSigmeBonus',
                            bonusPlanoCarreira: 'careerPlanBonus'
                        };
                        const mappedCards = Array.isArray(cfg.bonusCards)
                            ? cfg.bonusCards.map((c: any, idx: number) => ({
                                id: `card-${idx + 1}`,
                                title: c.title || 'BÃ´nus',
                                icon: c.icon || 'IconAward',
                                dataKey: srcMap[c.source] || 'custom'
                            }))
                            : initialDashboardSettings.cards;

                        setDashboardSettings(prev => ({
                            ...prev,
                            cards: mappedCards
                        }));
                    }
                }
            } catch (error) {
                console.warn('Dashboard layout fetch failed, using defaults:', error);
            }
        })();
    }, [view]);

    useEffect(() => {
        if ((view === 'rsCD' as View) && !selectedCDId && distributors.length > 0) {
            setSelectedCDId(distributors[0].id);
        }
    }, [view, selectedCDId, distributors]);

    useEffect(() => {
        if (typeof window === 'undefined' || distributors.length === 0) return;

        const storedDistributorId = localStorage.getItem(distributorStorageKey);
        if (!storedDistributorId) {
            setSelectedDistributor(null);
            return;
        }

        const matchedDistributor = distributors.find((distributor) => distributor.id === storedDistributorId);
        if (matchedDistributor) {
            setSelectedDistributor((previous) => previous?.id === matchedDistributor.id ? previous : matchedDistributor);
        } else {
            setSelectedDistributor(null);
        }
    }, [distributorStorageKey, distributors]);

    useEffect(() => {
        let cancelled = false;

        const loadDistributorInventory = async () => {
            if (!isLojistaSession || !selectedDistributor?.id) {
                setSelectedDistributorInventory([]);
                return;
            }

            try {
                const response: any = await distributorsAPI.getInventory(selectedDistributor.id);
                if (cancelled) return;

                if (response && response.success !== false && Array.isArray(response.data)) {
                    setSelectedDistributorInventory(response.data.map((item: any) => ({
                        id: String(item.id ?? ''),
                        productId: item.productId ? String(item.productId) : (item.product_id ? String(item.product_id) : null),
                        sku: String(item.sku ?? ''),
                        name: String(item.name ?? ''),
                        category: String(item.category ?? ''),
                        stockLevel: Number(item.stockLevel ?? item.stock_level ?? 0),
                        minStock: Number(item.minStock ?? item.min_stock ?? 0),
                        price: Number(item.price ?? 0),
                        costPrice: Number(item.costPrice ?? item.cost_price ?? 0),
                        points: Number(item.points ?? 0),
                        status: String(item.status ?? '')
                    })));
                    return;
                }

                setSelectedDistributorInventory([]);
            } catch (error) {
                if (!cancelled) {
                    console.warn('[Marketplace] Falha ao carregar inventario do CD:', error);
                    setSelectedDistributorInventory([]);
                }
            }
        };

        void loadDistributorInventory();

        return () => {
            cancelled = true;
        };
    }, [isLojistaSession, selectedDistributor?.id]);

    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon && storeCustomization.faviconUrl) {
            favicon.href = storeCustomization.faviconUrl;
        }
    }, [storeCustomization.faviconUrl]);

    useEffect(() => {
        const injected: string[] = [];
        const addScript = (id: string, src: string, onload?: () => void) => {
            if (document.getElementById(id)) return;
            const s = document.createElement('script');
            s.id = id; s.async = true; s.src = src; if (onload) s.onload = onload;
            document.head.appendChild(s);
            injected.push(id);
        };
        const addInline = (id: string, code: string) => {
            if (document.getElementById(id)) return;
            const s = document.createElement('script'); s.id = id; s.innerHTML = code; document.head.appendChild(s); injected.push(id);
        };
        const actives = marketingPixels.filter(p => p.status === 'Ativo');
        actives.forEach(p => {
            if (p.type === 'Facebook' && p.pixelId) {
                addScript('fb-pixel-lib', 'https://connect.facebook.net/en_US/fbevents.js');
                addInline(`fb-pixel-init-${p.pixelId}`, `window.fbq=window.fbq||function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};window._fbq||(window._fbq=window.fbq);fbq('init','${p.pixelId}');fbq('track','PageView');`);
            } else if ((p.type === 'Google Ads' || p.type === 'Google Analytics') && p.pixelId && navigator.onLine) {
                addScript('gtag-lib', 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(p.pixelId));
                addInline(`gtag-init-${p.pixelId}`, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${p.pixelId}');`);
            } else if (p.type === 'TikTok' && p.pixelId) {
                addInline(`ttq-init-${p.pixelId}`, `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','upload'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var a=document.createElement('script');a.type='text/javascript';a.async=true;a.src=i;var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(a,s)};ttq.load('${p.pixelId}');ttq.page();}(window,document,'ttq');`);
            } else if (p.type === 'Pinterest' && p.pixelId) {
                addInline(`pin-init-${p.pixelId}`, `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=document.createElement('script');n.async=!0,n.src='https://s.pinimg.com/ct/core.js';var t=document.getElementsByTagName('script')[0];t.parentNode.insertBefore(n,t),window.pintrk.queue=[],window.pintrk.version='3.0'}}();pintrk('load','${p.pixelId}');pintrk('page');`);
            }
        });
        return () => { injected.forEach(id => { const el = document.getElementById(id); if (el) el.remove(); }); };
    }, [marketingPixels]);

    const handleAddToCart = (product: Product, quantity: number, selectedVariant: ProductVariant) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id && item.variantId === selectedVariant.id);
            const sourceProduct = storefrontProducts.find((candidate) => String(candidate.id) === String(product.id)) || product;
            const isCdInventory = sourceProduct.inventorySource === 'cd';
            const availableInventory = Math.max(0, Number(sourceProduct.inventory || 0));
            const existingQuantity = existingItem ? Number(existingItem.quantity || 0) : 0;
            const sourceFulfillmentType = normalizeFulfillmentOriginType(sourceProduct.fulfillmentOriginType);
            const sourceFulfillmentId = sourceFulfillmentType === 'seller_store'
                ? String(sourceProduct.fulfillmentOriginId || sourceProduct.ownerUserId || sourceProduct.id || '').trim()
                : 'central';
            const sourceFulfillmentKey = `${sourceFulfillmentType}:${sourceFulfillmentId || 'central'}`;
            const existingFulfillmentKeys = new Set(prevCart.map(item => getFulfillmentOriginKey(item)));

            if (isCdInventory && availableInventory <= 0) {
                alert(sourceProduct.inventoryStatusMessage || 'Produto indisponivel no CD selecionado.');
                return prevCart;
            }

            if (isCdInventory && existingQuantity + quantity > availableInventory) {
                alert(`Estoque insuficiente no CD selecionado. Disponivel: ${availableInventory}.`);
                return prevCart;
            }

            if (existingFulfillmentKeys.size > 1 || (existingFulfillmentKeys.size > 0 && !existingFulfillmentKeys.has(sourceFulfillmentKey))) {
                alert('Finalize o carrinho atual antes de misturar produtos com origens de atendimento diferentes.');
                return prevCart;
            }

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === existingItem.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            const newCartItemId = `${product.id}-${selectedVariant.id}-${Date.now()}`;
            const variantText = Object.values(selectedVariant.options).join(' / ');

            return [...prevCart, {
                id: newCartItemId,
                productId: product.id,
                variantId: selectedVariant.id,
                name: product.name,
                price: selectedVariant.price,
                image: product.images[0],
                quantity,
                variantText,
                pricingTier: activePricingTier,
                retailPrice: Number(sourceProduct.price || 0),
                consultantPrice: Number(sourceProduct.memberPrice || 0),
                dropshipPrice: Number(sourceProduct.dropshipPrice || 0),
                commissionOrigin: sourceProduct.commissionOrigin || 'rs_physical',
                affiliateModel: sourceProduct.affiliateModel || 'none',
                productType: sourceProduct.productType || 'physical',
                ownerUserId: sourceProduct.ownerUserId || null,
                ownerLoginId: sourceProduct.ownerLoginId || '',
                fulfillmentOriginType: sourceProduct.fulfillmentOriginType || 'central',
                fulfillmentOriginId: sourceProduct.fulfillmentOriginId || null,
                fulfillmentOriginName: sourceProduct.fulfillmentOriginName || '',
                fulfillmentOriginZip: sourceProduct.fulfillmentOriginZip || '',
            }];
        });

        setShowFloatingCartStatus(true);
        setTimeout(() => setShowFloatingCartStatus(false), 5000);
    };

    const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== cartItemId);
            }
            return prevCart.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const handleRemoveFromCart = (cartItemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    };

    const handleFinalizePurchase = async (order: Order) => {
        const paymentStatusMap: Record<string, string> = {
            Pago: 'paid',
            Pendente: 'pending',
            Reembolsado: 'refunded',
            'Parcialmente Pago': 'partial',
            Cancelado: 'cancelled'
        };

        const orderPayload = {
            customerId: order.customerId || currentCustomer?.id || null,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerCpf: order.customerCpf,
            customerPhone: order.customerPhone,
            items: order.items,
            subtotal: order.subtotal,
            shipping: order.shippingCost,
            shippingCost: order.shippingCost,
            discount: order.discount,
            total: order.total,
            status: 'pending',
            paymentMethod: order.paymentMethod || 'pix',
            paymentStatus: paymentStatusMap[order.paymentStatus] || 'pending',
            shippingAddress: order.shippingAddress,
            shippingMethod: order.shippingMethod,
            notes: order.notes,
            buyerType: order.buyerType || checkoutRouting.buyerType,
            distributorId: order.distributorId ?? checkoutRouting.distributorId ?? null,
            distributorName: order.distributorName || checkoutRouting.distributorName || '',
            referrerId: order.referrerId ?? checkoutRouting.referrerId ?? null,
            referrerName: order.referrerName || checkoutRouting.referrerName || '',
            referredBy: order.referrerId ?? checkoutRouting.referrerId ?? null,
            buyerId: order.customerId || currentCustomer?.id || null,
            buyerEmail: order.customerEmail,
            buyerName: order.customerName,
            buyerPhone: order.customerPhone,
            paymentBreakdown: order.paymentBreakdown || [],
            pricingTierApplied: order.pricingTierApplied || null,
            recognizedConsultantId: order.recognizedConsultantId || null,
            recognizedConsultantLoginId: order.recognizedConsultantLoginId || '',
            recognizedConsultantNumericId: order.recognizedConsultantNumericId || '',
            fulfillmentOriginType: order.fulfillmentOriginType || checkoutRouting.fulfillmentOriginType,
            fulfillmentOriginId: order.fulfillmentOriginId ?? checkoutRouting.fulfillmentOriginId ?? null,
            fulfillmentOriginName: order.fulfillmentOriginName || checkoutRouting.fulfillmentOriginName || '',
            fulfillmentOriginZip: order.fulfillmentOriginZip || checkoutRouting.fulfillmentOriginZip || '',
        };

        const createdOrderResult: any = await ordersAPI.create(orderPayload);
        if (createdOrderResult?.success === false) {
            throw new Error(createdOrderResult.error || 'Falha ao registrar o pedido no marketplace.');
        }

        const backendOrderId = createdOrderResult?.data?.id ? String(createdOrderResult.data.id) : '';
        const persistedOrder: Order = {
            ...order,
            backendId: backendOrderId || order.backendId,
        };

        setLastConfirmedOrder(persistedOrder);
        setOrders(prev => [...prev, persistedOrder]);
        setCart([]);
        setIsCartOpen(false);
        setView('orderConfirmation');
    }

    const handleAcceptUpsell = (originalOrder: Order, upsellProduct: Product, offerPrice: number) => {
        const upsellItem: OrderItem = {
            productId: upsellProduct.id,
            variantId: upsellProduct.variants?.[0]?.id || 'default',
            productName: `${upsellProduct.name} (Upsell)`,
            quantity: 1,
            price: offerPrice,
        };

        const updatedOrder: Order = {
            ...originalOrder,
            items: [...originalOrder.items, upsellItem],
            total: originalOrder.total + offerPrice,
            subtotal: originalOrder.subtotal + offerPrice,
        };
        setOrders(prev => prev.map(o => o.id === originalOrder.id ? updatedOrder : o));
        setLastConfirmedOrder(updatedOrder);
    };

    const handleNavigate = (newView: View, data?: any) => {
        console.log(' Navegando para:', newView);
        const isSuperAdmin = (typeof window !== 'undefined' && (localStorage.getItem('rs-role') === 'super_admin' || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')));
        const adminOnlyViews: View[] = ['userProfileEditor', 'dashboardEditor', 'bannerDashboard'];
        if (!isSuperAdmin && adminOnlyViews.includes(newView)) {
            setView('consultantStore');
            return;
        }
        if (newView === 'compensationPlan') {
            setView('consultantStore');
            return;
        }
        if (newView === 'marketplaceAdmin') {
            window.location.hash = '#/marketplace-admin';
        }
        if (newView === 'rsCD') {
            window.location.hash = '#/cd';
        }
        if (newView === 'rsControleDrop') {
            const RS_DROP_URL = (import.meta as any).env?.VITE_RS_DROP_URL || 'http://localhost:2021';
            window.location.href = RS_DROP_URL;
            return;
        }
        if (newView === 'checkout') {
            console.log(' Iniciando checkout, view anterior:', view);
            setViewBeforeCheckout(view);
            setIsCartOpen(false);
        }
        if (newView === 'productDetail' && data) {
            const productId = (data as Product).id;
            setRecentlyViewedIds(prev =>
                [productId, ...prev.filter(id => id !== productId)].slice(0, 4)
            );
        }
        if (newView === 'addEditProduct' && data && !isManagedByCurrentOperator(data as Product)) {
            alert('Este produto pertence a outro lojista ou a sede e nao pode ser editado por esta conta.');
            setView('manageProducts');
            return;
        }
        if (newView === 'addEditCollection' && data && !managedStoreCollections.some((collection) => String(collection.id) === String((data as Collection).id))) {
            alert('Esta colecao nao pode ser editada por esta conta.');
            setView('manageCollections');
            return;
        }
        if ((newView === 'orderDetail' || newView === 'orderStatus') && data && !managedStoreOrders.some((order) => String(order.id) === String((data as Order).id))) {
            alert('Este pedido nao pertence a esta conta.');
            setView('manageOrders');
            return;
        }

        setView(newView);

        setSelectedProduct(null);
        setSelectedOrder(null);
        setSelectedReturn(null);
        setSelectedCoupon(null);
        setSelectedMarketingPixel(null);
        setSelectedCollection(null);

        if (data) {
            if (newView === 'productDetail') setSelectedProduct(data as Product);
            else if (newView === 'orderDetail' || newView === 'orderStatus') setSelectedOrder(data as Order);
            else if (newView === 'returnDetail') setSelectedReturn(data as ReturnRequest);
            else if (newView === 'addEditCoupon') setSelectedCoupon(data as Coupon);
            else if (newView === 'addEditMarketingPixel') setSelectedMarketingPixel(data as MarketingPixel);
            else if (newView === 'addEditProduct') setSelectedProduct(data as Product);
            else if (newView === 'collectionView') setSelectedCollection(data as Collection);
            else if (newView === 'addEditCollection') setSelectedCollection(data as Collection);
            else if (newView === 'trainingModuleDetail') setSelectedTrainingModule(data as Training);
            else if (newView === 'addEditAnnouncement') setSelectedAnnouncement(data as Announcement);
            else if (newView === 'addEditMarketingAsset') setSelectedMarketingAsset(data as MarketingAsset);
            else if (newView === 'addEditTraining') setSelectedTrainingModule(data as Training);
            else if (newView === 'cdRegions' || newView === 'cdStock' || newView === 'cdOrders' || newView === 'rsCD') setSelectedCDId((data as Distributor)?.id || selectedCDId);
        }
    };

    const handleStoreCustomizationChange = (updatedData: Partial<StoreCustomization>) => {
        setStoreCustomization(prev => {
            const newCustomization = { ...prev, ...updatedData };
            try {
                localStorage.setItem('rs-store-customization', JSON.stringify(newCustomization));
            } catch (e) {
                console.error('Erro ao salvar customizaÃ§Ã£o:', e);
            }
            return newCustomization;
        });

        // alert('AparÃªncia da loja atualizada com sucesso!'); // v9.0: Removido para nÃ£o travar thread de ediÃ§Ã£o
    };

    const handleOrderBumpSave = async (orderBump: StoreCustomization['orderBump']) => {
        const updatedCustomization = { ...storeCustomization, orderBump };
        const result = await storeCustomizationAPI.update(updatedCustomization);

        if (result?.success === false) {
            throw new Error(result.error || 'Nao foi possivel salvar o order bump.');
        }

        handleStoreCustomizationChange({ orderBump });
    };
    const handlePromotionRequestsSave = async (promotionRequests: StoreCustomization['promotionRequests']) => {
        const updatedCustomization = { ...storeCustomization, promotionRequests };
        const result = await storeCustomizationAPI.update(updatedCustomization);

        if (result?.success === false) {
            throw new Error(result.error || 'Nao foi possivel salvar as solicitacoes de impulsionamento.');
        }

        handleStoreCustomizationChange({ promotionRequests });
    };
    const handleDashboardBannersUpdate = (newBanners: Banner[]) => {
        setDashboardBanners(newBanners);
        try {
            localStorage.setItem('rs-marketplace-dashboard-banners', JSON.stringify(newBanners));
        } catch { }
        alert('Banners do painel atualizados com sucesso!');
    };

    const handleDashboardSettingsUpdate = (newSettings: DashboardSettings) => {
        setDashboardSettings(newSettings);
        alert('Painel atualizado com sucesso!');
    };

    const handlePaymentSettingsSave = async (newSettings: PaymentSettings) => {
        const result = await adminSettingsAPI.updatePaymentSettings(newSettings);
        if (result && result.success !== false) {
            setPaymentSettings(normalizePaymentSettings(newSettings));
            alert('ConfiguraÃ§Ãµes de pagamento salvas com sucesso!');
            return;
        }

        alert(`Falha ao salvar configuraÃ§Ãµes de pagamento: ${result?.error || 'erro desconhecido'}`);
    };

    const handleShippingSettingsSave = async (newSettings: ShippingSettings) => {
        const result = await adminSettingsAPI.updateShippingSettings(newSettings);
        if (result && result.success !== false) {
            setShippingSettings(normalizeShippingSettings(newSettings));
            alert('ConfiguraÃ§Ãµes de frete salvas com sucesso!');
            return;
        }

        alert(`Falha ao salvar configuraÃ§Ãµes de frete: ${result?.error || 'erro desconhecido'}`);
    };

    const handleWalletSettingsSave = async (newSettings: WalletSettings) => {
        const result = await adminSettingsAPI.updateWalletSettings(newSettings);
        if (result && result.success !== false) {
            setWalletSettings(normalizeWalletSettings(newSettings));
            alert('ConfiguraÃ§Ãµes da carteira salvas com sucesso!');
            return;
        }

        alert(`Falha ao salvar configuraÃ§Ãµes da carteira: ${result?.error || 'erro desconhecido'}`);
    };

    const handleCompensationSettingsSave = (newSettings: CompensationSettings) => {
        setCompensationSettings(newSettings);
        alert('Plano de compensaÃ§Ã£o salvo com sucesso!');
    };

    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
        try { localStorage.setItem('rs-consultant-profile', JSON.stringify(updatedProfile)); } catch { }
        alert('Perfil atualizado com sucesso!');
    };

    const slugify = (text: string) =>
        text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/-+$/, '');

    const handleProductSave = async (productToSave: Product) => {
        const productId = String(productToSave.id || '').trim();
        const isNew = !productId || !persistedProductIdsRef.current.has(productId);
        const existingProduct = products.find((product) => String(product.id) === productId);

        if (!isNew && existingProduct && !isManagedByCurrentOperator(existingProduct)) {
            alert('Voce nao pode editar produtos da sede ou de outro lojista por este painel.');
            handleNavigate('manageProducts');
            return;
        }

        const fulfillmentOriginType = hasMarketplaceOperatorIdentity
            ? normalizeFulfillmentOriginType(productToSave.fulfillmentOriginType)
            : 'seller_store';
        const ownerUserId = fulfillmentOriginType === 'seller_store'
            ? String(productToSave.ownerUserId || currentCustomer?.id || userProfile.id || '').trim() || null
            : null;
        const ownerLoginId = fulfillmentOriginType === 'seller_store'
            ? String(productToSave.ownerLoginId || currentCustomer?.loginId || userProfile.loginId || userProfile.idConsultor || '').trim()
            : '';
        const fulfillmentOriginId = fulfillmentOriginType === 'seller_store'
            ? String(productToSave.fulfillmentOriginId || ownerUserId || '').trim() || null
            : null;
        const fulfillmentOriginName = fulfillmentOriginType === 'seller_store'
            ? String(productToSave.fulfillmentOriginName || productToSave.seller || currentCustomer?.name || userProfile.name || '').trim()
            : '';
        const fulfillmentOriginZip = fulfillmentOriginType === 'seller_store'
            ? String(productToSave.fulfillmentOriginZip || '').trim()
            : '';

        // Mapeia campos do frontend para o formato que a API aceita
        const apiPayload: any = {
            name: productToSave.name,
            description: productToSave.description,
            shortDescription: productToSave.shortDescription,
            price: productToSave.price,
            memberPrice: productToSave.memberPrice,
            dropshipPrice: productToSave.dropshipPrice,
            compareAtPrice: productToSave.compareAtPrice,
            costPrice: productToSave.costPerItem,
            images: productToSave.images || [],
            videos: productToSave.videos || [],
            materials: productToSave.materials || [],
            sku: productToSave.sku,
            inventory: productToSave.inventory,
            subcategory: productToSave.subcategory,
            supplier: productToSave.supplier,
            ownerUserId,
            ownerLoginId,
            fulfillmentOriginType,
            fulfillmentOriginId,
            fulfillmentOriginName,
            fulfillmentOriginZip,
            barcode: productToSave.barcode,
            weight: productToSave.weight,
            weightUnit: productToSave.weightUnit,
            category: productToSave.category || productToSave.subcategory,
            collections: productToSave.collectionIds || (productToSave.collectionId ? [productToSave.collectionId] : []),
            published: productToSave.status === 'Ativo',
            isActive: productToSave.status === 'Ativo',
            seoTitle: productToSave.seoTitle,
            seoDescription: productToSave.seoDescription,
            featuredImage: productToSave.featured_image ?? productToSave.images?.[0] ?? null,
            specifications: {
                shortDescription: productToSave.shortDescription,
                requiresShipping: productToSave.requiresShipping,
                trackQuantity: productToSave.trackQuantity,
                options: productToSave.options,
                variants: productToSave.variants,
                type: productToSave.type,
                videos: productToSave.videos || [],
                materials: productToSave.materials || [],
                subcategory: productToSave.subcategory,
                supplier: productToSave.supplier,
                ownerUserId,
                ownerLoginId,
                fulfillmentOriginType,
                fulfillmentOriginId,
                fulfillmentOriginName,
                fulfillmentOriginZip,
                barcode: productToSave.barcode,
                weight: productToSave.weight,
                weightUnit: productToSave.weightUnit,
                dropshipPrice: productToSave.dropshipPrice,
                productType: productToSave.productType,
                commissionOrigin: productToSave.commissionOrigin,
                affiliateModel: productToSave.affiliateModel,
                collections: productToSave.collectionIds || (productToSave.collectionId ? [productToSave.collectionId] : []),
                merchandising: productToSave.merchandising,
            }
        };

        try {
            if (isNew) {
                const { VITE_TENANT_ID } = import.meta.env as any;
                apiPayload.tenantId = VITE_TENANT_ID;
                const res: any = await productsAPI.create(apiPayload);
                if (res && res.success === false) {
                    alert('Erro ao criar produto: ' + (res.error || 'Tente novamente.'));
                    return;
                }
                if (res && res.data) {
                    const savedProduct: Product = {
                        ...productToSave,
                        ...res.data,
                        id: String(res.data.id),
                        featured_image: res.data.featured_image ?? res.data.image_url ?? (Array.isArray(res.data.images) && res.data.images[0]) ?? null,
                    };
                    persistedProductIdsRef.current.add(savedProduct.id);
                    setProducts(prev => {
                        const exists = prev.find(p => p.id === savedProduct.id);
                        if (exists) return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
                        return [...prev, savedProduct];
                    });
                } else {
                    const savedProduct = res?.data ? { ...productToSave, id: String(res.data.id) } : productToSave;
                    setProducts(prev => [...prev, savedProduct]);
                }
            } else {
                const res: any = await productsAPI.update(productToSave.id, apiPayload);
                if (res && res.success === false) {
                    console.error('[handleProductSave] Erro da API no UPDATE:', res);
                    alert(`Erro ao atualizar produto: ${res.error?.message || res.error || 'Erro interno'}. Tente novamente.`);
                    return;
                }

                if (res && res.data) {
                    const updatedProduct: Product = {
                        ...productToSave,
                        ...res.data,
                        id: String(res.data.id ?? productToSave.id),
                        featured_image: res.data.featured_image ?? res.data.image_url ?? (Array.isArray(res.data.images) && res.data.images[0]) ?? null,
                    };
                    persistedProductIdsRef.current.add(updatedProduct.id);
                    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                } else {
                    persistedProductIdsRef.current.add(productId);
                    setProducts(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
                }
            }
        } catch (e: any) {
            console.error('[handleProductSave] ExceÃ§Ã£o na requisiÃ§Ã£o:', e);
            alert(`Erro ao salvar produto: ${e?.message || 'falha de rede'}`);
            return;
        }

        handleNavigate('manageProducts');
    };

    const handleProductDelete = async (productIds: string[]) => {
        const deletableIds = productIds.filter((productId) => {
            const product = products.find((item) => String(item.id) === String(productId));
            return product ? isManagedByCurrentOperator(product) : false;
        });

        if (deletableIds.length === 0) {
            alert('Nenhum dos produtos selecionados pode ser removido por esta conta.');
            return;
        }

        if (deletableIds.length !== productIds.length) {
            alert('Alguns produtos foram ignorados porque pertencem a outro lojista ou a sede.');
        }

        if (window.confirm(`Tem certeza de que deseja excluir ${deletableIds.length} produto(s) ? `)) {
            const deletedIds = new Set<string>();

            for (const productId of deletableIds) {
                const result: any = await productsAPI.delete(productId);
                if (!result || result.success === false) {
                    alert(`Falha ao excluir o produto ${productId}: ${result?.error || 'erro interno'}`);
                    continue;
                }
                deletedIds.add(String(productId));
            }

            if (deletedIds.size > 0) {
                deletedIds.forEach((productId) => persistedProductIdsRef.current.delete(String(productId)));
                setProducts(prev => prev.filter(p => !deletedIds.has(String(p.id))));
            }
        }
    };

    const handleInventorySave = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
        alert('Estoque atualizado com sucesso!');
    };

    const handleDeleteProduct = (id: string) => void handleProductDelete([id]);

    const handleOrderUpdate = (orderId: string, updates: Partial<Order>) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, ...updates } : o));
    };

    const handleDropshippingOrderUpdate = (orderId: string, updates: Partial<DropshippingOrder>) => {
        setDropshippingOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, ...updates } : o));
    };

    const handleReturnStatusUpdate = (returnIds: string[], status: ReturnRequest['status']) => {
        setReturns(prev => prev.map(r => returnIds.includes(r.id) ? { ...r, status } : r));
    };

    const handleReturnDelete = (returnIds: string[]) => {
        if (window.confirm(`Tem certeza de que deseja excluir ${returnIds.length} devoluÃ§Ã£o(Ãµes) ? `)) {
            setReturns(prev => prev.filter(r => !returnIds.includes(r.id)));
        }
    };

    const handleCouponSave = (couponToSave: Coupon) => {
        setCoupons(prevCoupons => {
            const exists = prevCoupons.find(c => c.id === couponToSave.id);
            if (exists) {
                return prevCoupons.map(c => c.id === couponToSave.id ? couponToSave : c);
            }
            return [...prevCoupons, { ...couponToSave, id: `CUP - ${Date.now()} ` }];
        });
        handleNavigate('managePromotions');
    };

    const handleCouponDelete = (couponId: string) => {
        if (window.confirm(`Tem certeza de que deseja excluir este cupom ? `)) {
            setCoupons(prev => prev.filter(c => c.id !== couponId));
        }
    };

    const handleCouponStatusToggle = (couponId: string, newStatus: 'Ativo' | 'Inativo') => {
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: newStatus } : c));
    };

    const handleMarketingPixelSave = async (pixelToSave: MarketingPixel) => {
        const payload = {
            id: pixelToSave.id,
            type: pixelToSave.type,
            name: pixelToSave.name,
            pixel_id: pixelToSave.pixelId,
            label: pixelToSave.idLabel,
            active: pixelToSave.status === 'Ativo',
        };
        const res: any = pixelToSave.id ? await marketingPixelsAPI.update(pixelToSave.id, payload) : await marketingPixelsAPI.create(payload);
        if (res && res.success === false) {
            alert(res.error || 'Falha ao salvar pixel');
            return;
        }
        const list: any = await marketingPixelsAPI.list();
        if (list && list.success !== false && Array.isArray(list.data)) {
            setMarketingPixels(list.data.map((p: any) => ({ id: String(p.id), type: String(p.type) as any, name: String(p.name), pixelId: String(p.pixel_id || ''), idLabel: p.label ? String(p.label) : undefined, status: Boolean(p.active) ? 'Ativo' : 'Inativo' })));
        }
        handleNavigate('virtualOfficePixels');
    };

    const handleMarketingPixelDelete = async (pixelId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este pixel?')) return;
        const res: any = await marketingPixelsAPI.delete(pixelId);
        if (res && res.success === false) { alert(res.error || 'Falha ao excluir pixel'); return; }
        const list: any = await marketingPixelsAPI.list();
        if (list && list.success !== false && Array.isArray(list.data)) {
            setMarketingPixels(list.data.map((p: any) => ({ id: String(p.id), type: String(p.type) as any, name: String(p.name), pixelId: String(p.pixel_id || ''), idLabel: p.label ? String(p.label) : undefined, status: Boolean(p.active) ? 'Ativo' : 'Inativo' })));
        }
    };

    const handleMarketingPixelStatusToggle = async (pixelId: string) => {
        const current = marketingPixels.find(p => p.id === pixelId);
        const next = current?.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const res: any = await marketingPixelsAPI.setStatus(pixelId, next === 'Ativo' ? 'Ativo' : 'Inativo');
        if (res && res.success === false) { alert(res.error || 'Falha ao atualizar status'); return; }
        const list: any = await marketingPixelsAPI.list();
        if (list && list.success !== false && Array.isArray(list.data)) {
            setMarketingPixels(list.data.map((p: any) => ({ id: String(p.id), type: String(p.type) as any, name: String(p.name), pixelId: String(p.pixel_id || ''), idLabel: p.label ? String(p.label) : undefined, status: Boolean(p.active) ? 'Ativo' : 'Inativo' })));
        }
    };

    const handleMarketingPixelDuplicate = (pixelId: string) => {
        const pixelToDuplicate = marketingPixels.find(p => p.id === pixelId);
        if (pixelToDuplicate) {
            const newPixel = {
                ...pixelToDuplicate,
                id: `PIX - ${Date.now()} `,
                name: `${pixelToDuplicate.name} (CÃ³pia)`
            };
            setMarketingPixels(prev => [...prev, newPixel]);
        }
    };

    const handlePartnerStoreCommissionChange = (storeId: string, newCommission: number) => {
        setPartnerStores(prevStores =>
            prevStores.map(store =>
                store.id === storeId ? { ...store, commission: newCommission } : store
            )
        );
    };

    const handleImportDropshippingProduct = (productToImport: DropshippingProduct) => {
        const newProduct: Product = {
            id: `imported - ${productToImport.id} -${Date.now()} `,
            name: productToImport.name,
            seller: 'Ana Carolina',
            price: productToImport.suggestedRetailPrice,
            costPerItem: productToImport.costPrice,
            currency: 'BRL',
            shortDescription: productToImport.description.substring(0, 150) + (productToImport.description.length > 150 ? '...' : ''),
            description: productToImport.description,
            images: productToImport.images,
            rating: 0,
            reviewCount: 0,
            collectionId: null,
            status: 'Rascunho',
            inventory: productToImport.inventory,
            type: 'Dropshipping',
            requiresShipping: true,
            trackQuantity: true,
            chargeTax: true,
            continueSelling: false,
            seoTitle: productToImport.name,
            seoDescription: productToImport.description.substring(0, 320),
            urlHandle: slugify(productToImport.name),
            options: [],
            variants: [],
        };

        setProducts(prevProducts => {
            const exists = prevProducts.find(p => p.name === newProduct.name && p.type === 'Dropshipping');
            if (exists) {
                alert('Este produto jÃ¡ foi importado para a sua loja.');
                return prevProducts;
            }
            alert(`Produto "${newProduct.name}" importado com sucesso! Ele estÃ¡ disponÃ­vel como rascunho em "Gerenciar Produtos".`);
            return [...prevProducts, newProduct];
        });
    };

    const handleNavigateToEditDropshipping = (productToEdit: DropshippingProduct) => {
        const productTemplate: Product = {
            id: '',
            name: productToEdit.name,
            seller: 'Ana Carolina',
            price: productToEdit.suggestedRetailPrice,
            costPerItem: productToEdit.costPrice,
            currency: 'BRL',
            shortDescription: productToEdit.description.substring(0, 150) + (productToEdit.description.length > 150 ? '...' : ''),
            description: productToEdit.description,
            images: productToEdit.images,
            rating: 0,
            reviewCount: 0,
            collectionId: null,
            status: 'Rascunho',
            inventory: productToEdit.inventory,
            type: 'Dropshipping',
            requiresShipping: true,
            trackQuantity: true,
            chargeTax: true,
            continueSelling: false,
            seoTitle: productToEdit.name,
            seoDescription: productToEdit.description.substring(0, 320),
            urlHandle: slugify(productToEdit.name),
            options: [],
            variants: [],
        };
        setSelectedProduct(productTemplate);
        handleNavigate('addEditProduct');
    };

    const handleCollectionSave = async (collectionToSave: Collection) => {
        const scopedProductIds = (collectionToSave.productIds || collectionToSave.products || [])
            .map((productId: string) => String(productId))
            .filter((productId: string) => hasMarketplaceOperatorIdentity || managedStoreProductIds.has(productId));
        const payload = {
            id: collectionToSave.id,
            name: collectionToSave.title || collectionToSave.name || 'Nova ColeÃ§Ã£o',
            description: collectionToSave.description,
            image: collectionToSave.imageUrl || collectionToSave.image,
            active: collectionToSave.status === 'Ativo',
            productIds: scopedProductIds,
            ownerUserId: hasMarketplaceOperatorIdentity ? null : (currentCustomer?.id || userProfile.id || null),
            ownerLoginId: hasMarketplaceOperatorIdentity ? '' : (currentCustomer?.loginId || userProfile.loginId || userProfile.idConsultor || ''),
            tenantId: import.meta.env.VITE_TENANT_ID || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
        };

        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(collectionToSave.id);
        const isNew = !collections.find(c => c.id === collectionToSave.id) || !isValidUUID;

        try {
            if (isNew) {
                const res: any = await collectionsAPI.create(payload);
                if (res && res.success === false) {
                    alert('Erro ao criar coleÃ§Ã£o: ' + (res.error?.message || res.error || 'Erro interno'));
                    return;
                }
                const savedCol = res?.data ? {
                    ...collectionToSave,
                    id: String(res.data.id),
                    productIds: scopedProductIds,
                    ownerUserId: payload.ownerUserId,
                    ownerLoginId: payload.ownerLoginId,
                } : {
                    ...collectionToSave,
                    productIds: scopedProductIds,
                    ownerUserId: payload.ownerUserId,
                    ownerLoginId: payload.ownerLoginId,
                };
                setCollections(prev => [...prev, savedCol]);
            } else {
                const res: any = await collectionsAPI.update(collectionToSave.id, payload);
                if (res && res.success === false) {
                    console.error('[handleCollectionSave] Erro da API:', res);
                    alert(`Erro ao atualizar coleÃ§Ã£o: ${res.error?.message || res.error || 'Tente novamente.'}`);
                    return;
                }
                setCollections(prev => prev.map(c => c.id === collectionToSave.id ? {
                    ...collectionToSave,
                    name: collectionToSave.title,
                    productIds: scopedProductIds,
                    ownerUserId: payload.ownerUserId,
                    ownerLoginId: payload.ownerLoginId,
                } : c));
            }
        } catch (e: any) {
            console.error('[handleCollectionSave] Exception:', e);
            alert(`Erro ao salvar coleção: ${e?.message || 'falha de rede'}`);
            return;
        }
        handleNavigate('manageCollections');
    };

    const handleQuickCollectionCreate = async (collectionName: string) => {
        const payload = {
            name: collectionName,
            description: '',
            image: '',
            active: true,
            productIds: [],
            ownerUserId: hasMarketplaceOperatorIdentity ? null : (currentCustomer?.id || userProfile.id || null),
            ownerLoginId: hasMarketplaceOperatorIdentity ? '' : (currentCustomer?.loginId || userProfile.loginId || userProfile.idConsultor || ''),
            tenantId: import.meta.env.VITE_TENANT_ID
        };
        try {
            const res: any = await collectionsAPI.create(payload);
            if (res && res.success !== false && res.data) {
                const newCol: Collection = {
                    id: String(res.data.id),
                    title: res.data.name,
                    name: res.data.name,
                    description: '',
                    imageUrl: '',
                    ownerUserId: payload.ownerUserId,
                    ownerLoginId: payload.ownerLoginId,
                    status: 'Ativo',
                    products: []
                };
                setCollections(prev => [...prev, newCol]);
                return newCol;
            } else {
                alert('Erro ao criar coleÃ§Ã£o: ' + (res.error?.message || res.error || 'Erro interno'));
            }
        } catch (e) { console.error(e); }
        return null;
    };

    const handleCollectionDelete = async (collectionId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta coleÃ§Ã£o?')) return;
        const collection = collections.find((item) => String(item.id) === String(collectionId));
        const isCollectionManaged = collection ? managedStoreCollections.some((item) => String(item.id) === String(collection.id)) : false;
        if (!isCollectionManaged) {
            alert('Esta coleção pertence a outro lojista ou à sede e não pode ser removida por esta conta.');
            return;
        }
        const res: any = await collectionsAPI.delete(collectionId);
        if (res && res.success === false) {
            alert(res.error || 'Falha ao excluir a coleÃ§Ã£o');
            return;
        }
        setCollections(prev => prev.filter(c => c.id !== collectionId));
    };

    const handleNavigateToStoreLogin = (returnView: View = view) => {
        setViewAfterCustomerAuth(returnView);
        handleNavigate('customerLogin');
    };

    const handleMarketplaceLogout = async () => {
        await customersAPI.logout();

        setCurrentCustomer(null);
        setIsConsultantSession(false);
        setSelectedDistributor(null);
        setSelectedDistributorInventory([]);
        setIsDistributorSelectionModalOpen(false);
        setViewAfterCustomerAuth(null);
        setUserProfile(createEmptyMarketplaceUserProfile());

        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('rs-consultant-profile');
                localStorage.removeItem('rs-consultant-full-profile');
                localStorage.removeItem('token');
                localStorage.removeItem('rs-role');
                localStorage.removeItem(MARKETPLACE_SSO_TOKEN_KEY);
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');

                const distributorKeys: string[] = [];
                for (let i = 0; i < localStorage.length; i += 1) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(MARKETPLACE_DISTRIBUTOR_STORAGE_KEY)) {
                        distributorKeys.push(key);
                    }
                }
                distributorKeys.forEach((key) => localStorage.removeItem(key));

                window.dispatchEvent(new Event('rs-consultant-profile-updated'));
            } catch { }
        }

        setView('home');
    };

    const handleCustomerLogin = (customer: Customer) => {
        setCurrentCustomer(customer);

        const customerActsAsConsultant = Boolean(
            customer.isConsultant ||
            roleAllowsMarketplaceCdFlow(customer.role) ||
            /(LOJISTA|LOGISTA|CONSULTOR)/i.test(String(customer.consultantCategory || ''))
        );

        setIsConsultantSession(customerActsAsConsultant);

        if (customerActsAsConsultant) {
            setUserProfile(prev => ({
                ...prev,
                id: customer.id || prev.id,
                email: customer.email || prev.email,
                name: customer.name || prev.name,
                loginId: customer.loginId || prev.loginId,
                code: customer.numericId || prev.code,
                idNumerico: customer.numericId || prev.idNumerico,
                cpfCnpj: customer.cpfCnpj || prev.cpfCnpj,
                category: customer.consultantCategory || prev.category || 'CONSULTOR',
            }));
        }

        const targetView = viewAfterCustomerAuth || 'home';
        setViewAfterCustomerAuth(null);
        handleNavigate(targetView);
    };

    const handleCustomerRegister = () => {
        handleNavigate('customerLogin');
    };

    const handleDistributorSelection = (distributor: Distributor) => {
        setSelectedDistributor(distributor);
        if (typeof window !== 'undefined') {
            localStorage.setItem(distributorStorageKey, distributor.id);
        }
        setIsDistributorSelectionModalOpen(false);
    };

    const handleReviewUpdateStatus = async (ids: string[], status: Review['status']) => {
        const isApproved = status === 'Aprovada';
        for (const id of ids) {
            await reviewService.updateReviewStatus(id, isApproved);
        }
        setReviews(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    };
    const handleReviewDelete = async (ids: string[]) => {
        if (window.confirm(`Tem certeza ? `)) {
            await reviewService.deleteReviews(ids);
            setReviews(prev => prev.filter(r => !ids.includes(r.id)));
        }
    };
    const handleReviewSubmit = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
        const saved = await reviewService.submitReview(reviewData);
        if (saved) {
            setReviews(prev => [saved, ...prev]);
        } else {
            // Fallback local se Supabase nÃ£o responder
            const newReview: Review = {
                ...reviewData,
                id: `rev - ${Date.now()} `,
                createdAt: new Date().toISOString(),
                status: 'Pendente'
            };
            setReviews(prev => [newReview, ...prev]);
        }
        alert('Sua avaliaÃ§Ã£o foi enviada para moderaÃ§Ã£o. Obrigado!');
    };

    const handleAnnouncementSave = (data: Announcement) => {
        setAnnouncements(prev => {
            const exists = prev.find(a => a.id === data.id);
            if (exists) return prev.map(a => a.id === data.id ? { ...exists, ...data } : a);
            return [{ ...data, id: `ann - ${Date.now()} ` }, ...prev];
        });
        handleNavigate('manageAnnouncements');
    };
    const handleAnnouncementsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza ? `)) setAnnouncements(prev => prev.filter(a => !ids.includes(a.id)));
    };
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const handleTrainingSave = (data: Training) => {
        setTrainings(prev => {
            const exists = prev.find(t => t.id === data.id);
            if (exists) return prev.map(t => t.id === data.id ? { ...exists, ...data } : t);
            return [{ ...data, id: `train - ${Date.now()} ` }, ...prev];
        });
        handleNavigate('manageTrainings');
    };
    const handleTrainingsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza ? `)) setTrainings(prev => prev.filter(t => !ids.includes(t.id)));
    };
    const [selectedTrainingModule, setSelectedTrainingModule] = useState<Training | null>(null);

    const handleMarketingAssetSave = (data: MarketingAsset) => {
        setMarketingAssets(prev => {
            const exists = prev.find(a => a.id === data.id);
            if (exists) return prev.map(a => a.id === data.id ? { ...exists, ...data } : a);
            return [{ ...data, id: `asset - ${Date.now()} ` }, ...prev];
        });
        handleNavigate('manageMarketingAssets');
    };
    const handleMarketingAssetsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza ? `)) setMarketingAssets(prev => prev.filter(a => !ids.includes(a.id)));
    };
    const [selectedMarketingAsset, setSelectedMarketingAsset] = useState<MarketingAsset | null>(null);

    const handleToggleLessonComplete = (lessonId: string) => {
        setCompletedLessons(prev => {
            if (prev.includes(lessonId)) {
                return prev.filter(id => id !== lessonId);
            }
            return [...prev, lessonId];
        });
    };

    const handleLikeLesson = (moduleId: string, lessonId: string) => {
        setTrainings(prev => prev.map(module => {
            if (module.id === moduleId) {
                return {
                    ...module,
                    lessons: module.lessons.map(lesson => {
                        if (lesson.id === lessonId) {
                            return { ...lesson, likes: (lesson.likes || 0) + 1 };
                        }
                        return lesson;
                    })
                };
            }
            return module;
        }));
    };

    const handleToggleWishlist = (productId: string) => {
        if (!currentCustomer) {
            alert('Por favor, faÃ§a login para adicionar itens Ã  sua lista de desejos.');
            handleNavigate('customerLogin');
            return;
        }
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const handleQuestionSubmit = async (questionData: Omit<Question, 'id' | 'createdAt' | 'answers'>) => {
        const saved = await reviewService.submitQuestion(questionData);
        if (saved) {
            setQuestions(prev => [saved, ...prev]);
        } else {
            const newQuestion: Question = {
                ...questionData,
                id: `q - ${Date.now()} `,
                createdAt: new Date().toISOString(),
                answers: []
            };
            setQuestions(prev => [newQuestion, ...prev]);
        }
        alert('Sua pergunta foi enviada e serÃ¡ respondida em breve.');
    };

    const handleAnswerSubmit = async (questionId: string, answerData: Omit<Answer, 'id' | 'createdAt'>) => {
        const saved = await reviewService.submitAnswer(questionId, answerData);
        if (saved) {
            setQuestions(prev => prev.map(q =>
                q.id === questionId ? { ...q, answers: [...q.answers, saved] } : q
            ));
        } else {
            const newAnswer: Answer = {
                ...answerData,
                id: `a - ${Date.now()} `,
                createdAt: new Date().toISOString(),
            };
            setQuestions(prev => prev.map(q =>
                q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
            ));
        }
    };

    const handleChargeSave = (chargeData: Omit<Charge, 'id' | 'paymentLink'>): Charge => {
        const newCharge: Charge = {
            ...chargeData,
            id: `CHG - ${Date.now()} `,
            paymentLink: `https://rs.shp/pay/${Math.random().toString(36).substring(2, 10)}`,
        };
        setCharges(prev => [newCharge, ...prev]);
        return newCharge;
    };

    const adminViewTitles: Partial<Record<View, string>> = {
        consultantStore: 'Painel do Consultor',
        manageProducts: 'Produtos',
        addEditProduct: 'Adicionar/Editar Produto',
        editDropshippingProduct: 'Editar Produto Dropshipping',
        manageInventory: 'Gerenciar Estoque',
        manageOrders: 'Pedidos',
        orderDetail: 'Detalhes do Pedido',
        manageReturns: 'Gerenciar DevoluÃ§Ãµes',
        returnDetail: 'Detalhes da DevoluÃ§Ã£o',
        manageDropshippingOrders: 'Pedidos Dropshipping',
        dropshippingCatalog: 'CatÃ¡logo Dropshipping',
        managePromotions: 'Cupons de Desconto',
        addEditCoupon: 'Adicionar/Editar Cupom',
        manageAffiliates: 'Links de IndicaÃ§Ã£o',
        storeEditor: 'AparÃªncia da Loja',
        storeBannerEditor: 'Banners da Loja',
        virtualOfficeDropshipping: 'Produtos Dropshipping',
        virtualOfficeAffiliateLinks: 'Links de Afiliado',
        virtualOfficePixels: 'Pixels de Marketing',
        virtualOfficeLinkShortener: 'Encurtador de Link',
        addEditMarketingPixel: 'Adicionar/Editar Pixel',
        bannerDashboard: 'Banners do Painel',
        dashboardEditor: 'Editor do Painel',
        managePayments: 'ConfiguraÃ§Ãµes de Pagamento',
        manageShipping: 'ConfiguraÃ§Ãµes de Frete',
        compensationPlan: 'Painel do Consultor',
        manageCollections: 'ColeÃ§Ãµes',
        addEditCollection: 'Adicionar/Editar ColeÃ§Ã£o',
        userProfileEditor: 'Meu Perfil',
        consultantProfile: 'Perfil do Consultor',
        walletOverview: 'WalletPay - VisÃ£o Geral',
        walletReports: 'WalletPay - Extrato e RelatÃ³rios',
        walletTransfers: 'WalletPay - TransferÃªncias',
        walletCharges: 'WalletPay - CobranÃ§as',
        walletSettings: 'WalletPay - ConfiguraÃ§Ãµes',
        rsStudio: 'RS Studio',
        orderConfirmation: 'ConfirmaÃ§Ã£o de Pedido',
        manageOrderBump: 'Order Bump',
        managePromotionBoost: 'Impulsionamento',
        manageUpsell: 'Upsell PÃ³s-Compra',
        manageAbandonedCarts: 'Carrinhos Abandonados',
        manageReviews: 'Moderar AvaliaÃ§Ãµes',
        manageAnnouncements: 'Gerenciar Comunicados',
        addEditAnnouncement: 'Adicionar/Editar Comunicado',
        manageTrainings: 'Gerenciar Treinamentos',
        addEditTraining: 'Adicionar/Editar Treinamento',
        trainingModuleDetail: 'Detalhes do Treinamento',
        manageMarketingAssets: 'Gerenciar Materiais de Marketing',
        addEditMarketingAsset: 'Adicionar/Editar Material de Marketing',
        customerWishlist: 'Minha Lista de Desejos',
        rsCD: 'Centros de DistribuiÃ§Ã£o (RS-CD)',
        rsControleDrop: 'Market / Drop / Afiliado',
        // Admin do Marketplace
        marketplaceAdmin: 'ðŸª Admin â€” VisÃ£o Geral',
        marketplaceAdminOrders: 'ðŸª Admin â€” GestÃ£o de Pedidos',
        marketplaceAdminProducts: 'ðŸª Admin â€” Produtos',
        marketplaceAdminFinancial: 'ðŸª Admin â€” Financeiro',
    };

    const renderAdminContent = () => {
        let content;
        switch (view) {
            case 'marketplaceAdmin': content = <MarketplaceAdminDashboard />; break;
            case 'marketplaceAdminOrders': content = <MarketplaceAdminOrders />; break;
            case 'marketplaceAdminProducts': content = <MarketplaceAdminProducts />; break;
            case 'marketplaceAdminFinancial': content = <MarketplaceAdminFinancial />; break;
            case 'consultantStore': content = <ConsultantStore onNavigate={handleNavigate} banners={dashboardBanners} settings={dashboardSettings} userProfile={userProfile} bonuses={bonuses} networkActivity={[]} userPoints={dashboardUserPoints} monthlyUserPoints={dashboardMonthlyUserPoints} compensationSettings={compensationSettings} weeklyBonuses={[]} careerProgress={dashboardCareerProgress} />; break;
            case 'manageProducts': content = <ManageProducts onNavigate={handleNavigate} products={managedStoreProducts} onDelete={handleProductDelete} />; break;
            case 'addEditProduct': content = <AddEditProduct product={selectedProduct} collections={managedStoreCollections} currentUserId={currentCustomer?.id || userProfile.id || null} currentUserName={currentCustomer?.name || userProfile.name || ''} currentUserLoginId={currentCustomer?.loginId || userProfile.loginId || userProfile.idConsultor || ''} forceSellerStoreOrigin={!hasMarketplaceOperatorIdentity} onSave={handleProductSave} onCancel={() => handleNavigate('manageProducts')} onCollectionCreated={handleQuickCollectionCreate} />; break;
            case 'editDropshippingProduct': content = <AddEditProduct product={selectedProduct} collections={managedStoreCollections} currentUserId={currentCustomer?.id || userProfile.id || null} currentUserName={currentCustomer?.name || userProfile.name || ''} currentUserLoginId={currentCustomer?.loginId || userProfile.loginId || userProfile.idConsultor || ''} forceSellerStoreOrigin={!hasMarketplaceOperatorIdentity} onSave={handleProductSave} onCancel={() => handleNavigate('virtualOfficeDropshipping')} onCollectionCreated={handleQuickCollectionCreate} />; break;
            case 'manageInventory': content = <ManageInventory products={managedStoreProducts} onSave={handleInventorySave} onNavigate={handleNavigate} />; break;
            case 'manageOrders': content = <ManageOrders orders={managedStoreOrders} onNavigate={handleNavigate} />; break;
            case 'orderDetail': content = selectedOrder && <OrderDetail order={selectedOrder} onUpdateOrder={handleOrderUpdate} onBack={() => handleNavigate('manageOrders')} />; break;
            case 'manageReturns': content = <ManageReturns returns={returns} onUpdateStatus={handleReturnStatusUpdate} onDelete={handleReturnDelete} onNavigate={handleNavigate} />; break;
            case 'returnDetail': content = selectedReturn && <ReturnDetail returnRequest={selectedReturn} onUpdateStatus={(id, status) => handleReturnStatusUpdate([id], status)} onNavigate={handleNavigate} />; break;
            case 'manageDropshippingOrders': content = <ManageDropshippingOrders orders={dropshippingOrders} mainOrders={orders} onUpdateOrder={handleDropshippingOrderUpdate} onNavigate={handleNavigate} />; break;
            case 'dropshippingCatalog': content = <DropshippingCatalog products={dropshippingProducts} onImport={handleImportDropshippingProduct} onEdit={handleNavigateToEditDropshipping} onNavigate={handleNavigate} />; break;
            case 'managePromotions': content = <ManagePromotions coupons={coupons} onNavigate={handleNavigate} onDelete={handleCouponDelete} onStatusToggle={handleCouponStatusToggle} />; break;
            case 'addEditCoupon': content = <AddEditCoupon coupon={selectedCoupon} onSave={handleCouponSave} onCancel={() => handleNavigate('managePromotions')} />; break;
            case 'manageAffiliates': content = <ManageAffiliates userProfile={userProfile} />; break;

            case 'rsCD': content = (
                <Suspense fallback={<div className="p-8 text-center text-gold-400">Carregando painel CD...</div>}>
                    <RSCDAdminApp cdId={selectedCDId} onBack={() => handleNavigate('home')} />
                </Suspense>
            ); break;
            case 'rsControleDrop': content = (
                <Suspense fallback={<div className="p-8 text-center text-gold-400">Carregando Drop Market...</div>}>
                    <RSControleDropApp />
                </Suspense>
            ); break;
            case 'storeEditor': content = <StorefrontEditor senderId={instanceId} customization={storeCustomization} isReceivingSync={isReceivingSync} onUpdate={handleStoreCustomizationChange} onNavigate={handleNavigate} />; break;
            case 'storeBannerEditor': content = <StoreBannerEditor senderId={instanceId} customization={storeCustomization} onUpdate={handleStoreCustomizationChange} />; break;
            case 'virtualOfficeDropshipping': content = <VirtualOfficeDropshipping products={dropshippingProducts} onEditProduct={handleNavigateToEditDropshipping} />; break;
            case 'virtualOfficeAffiliateLinks': content = <ManageAffiliateLinks stores={partnerStores} onCommissionChange={handlePartnerStoreCommissionChange} />; break;
            case 'virtualOfficePixels': content = <ManageMarketingPixels pixels={marketingPixels} onNavigate={handleNavigate} onDelete={handleMarketingPixelDelete} onStatusToggle={handleMarketingPixelStatusToggle} onDuplicate={handleMarketingPixelDuplicate} />; break;
            case 'virtualOfficeLinkShortener': content = <LinkShortener links={shortenedLinks} setLinks={setShortenedLinks} />; break;
            case 'addEditMarketingPixel': content = <AddEditMarketingPixel pixel={selectedMarketingPixel} onSave={handleMarketingPixelSave} onCancel={() => handleNavigate('virtualOfficePixels')} />; break;
            case 'bannerDashboard': content = <BannerDashboard banners={dashboardBanners} onUpdate={handleDashboardBannersUpdate} />; break;
            case 'dashboardEditor': content = <DashboardEditor settings={dashboardSettings} onUpdate={handleDashboardSettingsUpdate} />; break;
            case 'managePayments': content = <ManagePayments settings={paymentSettings} onSave={handlePaymentSettingsSave} onNavigate={handleNavigate} />; break;
            case 'manageShipping': content = <ManageShipping settings={shippingSettings} onSave={handleShippingSettingsSave} onNavigate={handleNavigate} />; break;
            case 'compensationPlan': content = <ConsultantStore onNavigate={handleNavigate} banners={dashboardBanners} settings={dashboardSettings} userProfile={userProfile} bonuses={bonuses} networkActivity={[]} userPoints={dashboardUserPoints} monthlyUserPoints={dashboardMonthlyUserPoints} compensationSettings={compensationSettings} weeklyBonuses={[]} careerProgress={dashboardCareerProgress} />; break;
            case 'manageCollections': content = <ManageCollections collections={managedStoreCollections} products={managedStoreProducts} onNavigate={handleNavigate} onCollectionDelete={handleCollectionDelete} />; break;
            case 'addEditCollection': content = <AddEditCollection collection={selectedCollection} products={managedStoreProducts} onSave={handleCollectionSave} onCancel={() => handleNavigate('manageCollections')} onNavigate={handleNavigate} />; break;
            case 'userProfileEditor': content = <UserProfileEditor userProfile={userProfile} onSave={handleProfileUpdate} />; break;
            case 'consultantProfile': content = <ConsultantProfileForm />; break;
            case 'walletOverview': content = <WalletOverview onNavigate={handleNavigate} orders={managedStoreOrders} />; break;
            case 'walletReports': content = <WalletSalesReport orders={managedStoreOrders} onNavigate={handleNavigate} />; break;
            case 'walletTransfers': content = <WalletTransfers orders={managedStoreOrders} products={managedStoreProducts} onNavigate={handleNavigate} paymentSettings={paymentSettings} />; break;
            case 'walletCharges': content = <WalletCharges charges={charges} products={products} onSave={handleChargeSave} />; break;
            case 'walletSettings': content = <WalletSettingsComponent settings={walletSettings} onSave={handleWalletSettingsSave} paymentSettings={paymentSettings} onNavigate={handleNavigate} />; break;
            case 'rsStudio': content = <RSStudio products={products} onNavigate={handleNavigate} />; break;
            case 'communication': content = <CommunicationCenter onNavigate={(v: any) => handleNavigate(v)} />; break;
            case 'manageOrderBump': content = <ManageOrderBump settings={storeCustomization.orderBump} products={managedStoreProducts} onSave={handleOrderBumpSave} />; break;
            case 'manageUpsell': content = <ManageUpsell settings={storeCustomization.upsell} products={managedStoreProducts} onSave={(s) => handleStoreCustomizationChange({ upsell: s })} />; break;
            case 'managePromotionBoost': content = <ManagePromotionBoost products={managedStoreProducts} collections={managedStoreCollections} requests={storeCustomization.promotionRequests || []} onSave={handlePromotionRequestsSave} />; break;
            case 'manageAbandonedCarts': content = <ManageAbandonedCarts carts={abandonedCarts} />; break;
            case 'manageReviews': content = <ManageReviews reviews={reviews} onUpdateStatus={handleReviewUpdateStatus} onDelete={handleReviewDelete} />; break;
            case 'manageAnnouncements': content = <ManageAnnouncements announcements={announcements} onNavigate={handleNavigate} onDelete={handleAnnouncementsDelete} />; break;
            case 'addEditAnnouncement': content = <AddEditAnnouncement announcement={selectedAnnouncement} onSave={handleAnnouncementSave} onCancel={() => handleNavigate('manageAnnouncements')} />; break;
            case 'manageTrainings':
                const updatedSelectedTrainingModule = selectedTrainingModule
                    ? trainings.find(t => t.id === selectedTrainingModule.id)
                    : null;
                content = <ManageTrainings trainings={trainings} onNavigate={handleNavigate} completedLessons={completedLessons} />;
                break;
            case 'addEditTraining':
                const currentEditTrainingModule = selectedTrainingModule
                    ? trainings.find(t => t.id === selectedTrainingModule.id)
                    : null;
                content = <AddEditTraining training={currentEditTrainingModule} onSave={handleTrainingSave} onCancel={() => handleNavigate('manageTrainings')} />;
                break;
            case 'trainingModuleDetail':
                const currentTrainingModule = selectedTrainingModule
                    ? trainings.find(t => t.id === selectedTrainingModule.id)
                    : null;
                content = currentTrainingModule && <TrainingModuleDetail module={currentTrainingModule} onNavigate={handleNavigate} completedLessons={completedLessons} onToggleLessonComplete={handleToggleLessonComplete} onLikeLesson={handleLikeLesson} />;
                break;
            case 'manageMarketingAssets': content = <ManageMarketingAssets assets={marketingAssets} onNavigate={handleNavigate} onDelete={handleMarketingAssetsDelete} />; break;
            case 'addEditMarketingAsset': content = <AddEditMarketingAsset asset={selectedMarketingAsset} onSave={handleMarketingAssetSave} onCancel={() => handleNavigate('manageMarketingAssets')} />; break;
            default: content = <div>View not found</div>;


        }
        return (
            <AdminLayout title={adminViewTitles[view]} currentView={view} onNavigate={handleNavigate} onLogout={handleMarketplaceLogout}>
                {content}
            </AdminLayout>
        );
    };

    const renderPublicContent = () => {
        switch (view) {
            case 'productDetail':
                return selectedProductForDisplay && <ProductDetail
                    product={selectedProductForDisplay}
                    products={pricedProducts}
                    sponsoredSettings={sponsoredSettings}
                    collections={collections}
                    onBack={() => handleNavigate('home')}
                    onAddToCart={handleAddToCart}
                    onProductClick={(product) => handleNavigate('productDetail', product)}
                    onNavigate={handleNavigate}
                    reviews={reviews}
                    onReviewSubmit={handleReviewSubmit}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    questions={questions}
                    onQuestionSubmit={handleQuestionSubmit}
                    onAnswerSubmit={handleAnswerSubmit}
                />;
            case 'collectionView':
                return selectedCollection && <CollectionView collection={selectedCollection} products={pricedProducts} sponsoredSettings={sponsoredSettings} onProductClick={(p) => handleNavigate('productDetail', p)} onBack={() => handleNavigate('home')} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />;
            case 'customerAccount':
                return currentCustomer && <CustomerAccount customer={currentCustomer} onNavigate={handleNavigate} />;
            case 'customerWishlist':
                return currentCustomer && <CustomerWishlist wishlist={wishlist} products={pricedProducts} onNavigate={handleNavigate} onToggleWishlist={handleToggleWishlist} />;
            case 'orderConfirmation':
                return <OrderConfirmation order={lastConfirmedOrder} onContinueShopping={() => handleNavigate('home')} upsellSettings={storeCustomization.upsell} allProducts={pricedProducts} onAcceptUpsell={handleAcceptUpsell} />;
            case 'orderLookup':
                return <OrderLookupView onOrderFound={(order) => handleNavigate('orderStatus', order)} />;
            case 'orderStatus':
                return selectedOrder && <OrderStatusView order={selectedOrder} onBack={() => handleNavigate('home')} />;
            case 'home':
            default:
                const renderHomepageSection = (sectionId: string) => {
                    const section = storeCustomization.homepageSections.find(s => s.id === sectionId);
                    if (!section || !section.enabled) return null;

                    const sectionProps = {
                        title: section.name,
                        subtitle: section.subtitle,
                        titleColor: section.titleColor,
                        subtitleColor: section.subtitleColor,
                        backgroundColor: section.backgroundColor
                    };

                    switch (sectionId) {
                        case 'hero':
                            return <Hero key="hero" content={{
                                ...storeCustomization.hero,
                                title: section.name || storeCustomization.hero.title,
                                subtitle: section.subtitle || storeCustomization.hero.subtitle,
                                titleColor: section.titleColor || storeCustomization.hero.titleColor,
                                subtitleColor: section.subtitleColor || storeCustomization.hero.subtitleColor || section.titleColor,
                                backgroundColor: section.backgroundColor || storeCustomization.hero.backgroundColor
                            }} />;
                        case 'carousel':
                            return (
                                <Carousel
                                    key="carousel"
                                    banners={storeCustomization.carouselBanners}
                                    height={storeCustomization.carouselHeight}
                                    mobileHeight={storeCustomization.carouselHeightMobile}
                                    fullWidth={storeCustomization.carouselFullWidth}
                                />
                            );
                        case 'featuredProducts':
                            return <FeaturedProducts
                                key="featuredProducts"
                                products={searchQuery ? filteredProducts : pricedProducts.filter(p => !p.collectionId || p.collectionId === 'featured')}
                                onProductClick={(p) => handleNavigate('productDetail', p)}
                                wishlist={wishlist}
                                onToggleWishlist={handleToggleWishlist}
                                {...sectionProps}
                            />;
                        case 'offers':
                            return offerProducts.length > 0 ? (
                                <Offers
                                    key="offers"
                                    products={offerProducts}
                                    onProductClick={(p) => handleNavigate('productDetail', p)}
                                    wishlist={wishlist}
                                    onToggleWishlist={handleToggleWishlist}
                                    {...sectionProps}
                                />
                            ) : null;
                        case 'bestsellers':
                            return (
                                <Bestsellers
                                    key="bestsellers"
                                    products={pricedProducts}
                                    onProductClick={(p) => handleNavigate('productDetail', p)}
                                    orders={orders}
                                    wishlist={wishlist}
                                    onToggleWishlist={handleToggleWishlist}
                                    {...sectionProps}
                                />
                            );
                        case 'featuredCollections':
                            return <FeaturedCollections key="featuredCollections" collections={collections} onNavigate={handleNavigate} {...sectionProps} />;
                        case 'recentlyViewed':
                            return (
                                <RecentlyViewed
                                    key="recentlyViewed"
                                    products={recentlyViewedProducts}
                                    onProductClick={(p) => handleNavigate('productDetail', p)}
                                    wishlist={wishlist}
                                    onToggleWishlist={handleToggleWishlist}
                                    {...sectionProps}
                                />
                            );
                        case 'midPageBanner':
                            return (
                                <MidPageBanner
                                    key="midPageBanner"
                                    banner={{
                                        ...storeCustomization.midPageBanner,
                                        title: section.name || storeCustomization.midPageBanner.title,
                                        backgroundColor: section.backgroundColor || storeCustomization.midPageBanner.backgroundColor,
                                        titleColor: section.titleColor,
                                        subtitle: section.subtitle,
                                        subtitleColor: section.subtitleColor
                                    }}
                                />
                            );
                        default:
                            return null;
                    }
                };

                return (
                    <div style={{ backgroundColor: storeCustomization.storeBackgroundColor || 'transparent' }}>
                        {/* Se houver busca, mantÃ©m Hero e Carousel no topo, mas foca nos resultados */}
                        {searchQuery ? (
                            <>
                                <Hero content={storeCustomization.hero} />
                                <Carousel
                                    banners={storeCustomization.carouselBanners}
                                    height={storeCustomization.carouselHeight}
                                    mobileHeight={storeCustomization.carouselHeightMobile}
                                />
                                <div className="container mx-auto px-4 mt-8">
                                    <h2 className="text-2xl font-display text-[rgb(var(--color-brand-gold))]">
                                        Resultados para: "{searchQuery}"
                                        <span className="ml-4 text-sm font-sans text-[rgb(var(--color-brand-text-dim))] uppercase tracking-widest">
                                            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                                        </span>
                                    </h2>
                                </div>
                                {filteredProducts.length > 0 ? (
                                    <FeaturedProducts products={filteredProducts} onProductClick={(p) => handleNavigate('productDetail', p)} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />
                                ) : (
                                    <div className="container mx-auto px-4 py-20 text-center">
                                        <div className="max-w-md mx-auto bg-[rgb(var(--color-brand-gray))]/[.50] backdrop-blur-md border border-[rgb(var(--color-brand-gold))]/[.20] p-10 rounded-2xl shadow-2xl">
                                            <div className="text-6xl mb-4">ðŸ”</div>
                                            <h3 className="text-2xl font-display text-[rgb(var(--color-brand-gold))] mb-2">Ops! Nenhum produto encontrado</h3>
                                            <p className="text-[rgb(var(--color-brand-text-dim))] mb-6">NÃ£o encontramos resultados para "{searchQuery}". Tente usar palavras-chave diferentes ou verifique a ortografia.</p>
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] px-8 py-3 rounded-full font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all transform hover:scale-105"
                                            >
                                                Limpar Busca
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* RenderizaÃ§Ã£o DinÃ¢mica por Ordem das SeÃ§Ãµes */
                            <>
                                {homeSponsoredProducts.length > 0 && (
                                    <FeaturedProducts
                                        title="Produtos premium"
                                        subtitle="Patrocinado"
                                        sponsoredPlacementId="home_featured_strip"
                                        products={homeSponsoredProducts}
                                        onProductClick={(p) => handleNavigate('productDetail', p)}
                                        wishlist={wishlist}
                                        onToggleWishlist={handleToggleWishlist}
                                    />
                                )}
                                {[...(storeCustomization.homepageSections || [])]
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map(section => section.enabled && renderHomepageSection(section.id))}
                            </>
                        )}
                        <CustomerChatWidget orders={orders} />
                    </div>
                );
        }
    };

    const isAuthView = ['consultantLogin', 'sellerRegistration', 'customerLogin', 'customerRegister', 'customerForgotPassword'].includes(view);
    const authBranding = {
        logo: storeCustomization.logoUrl || '/logo-rs.png',
        companyName: 'RS Prolipsi'
    };
    const isAdminDashboardView = [
        'consultantStore', 'manageProducts', 'addEditProduct', 'editDropshippingProduct', 'manageInventory',
        'manageOrders', 'orderDetail', 'manageReturns', 'returnDetail', 'manageDropshippingOrders',
        'dropshippingCatalog', 'managePromotions', 'addEditCoupon', 'manageAffiliates', 'storeEditor',
        'storeBannerEditor', 'virtualOfficeDropshipping', 'virtualOfficeAffiliateLinks',
        'virtualOfficePixels', 'virtualOfficeLinkShortener', 'addEditMarketingPixel', 'bannerDashboard',
        'dashboardEditor', 'consultantProfile', 'managePayments', 'manageShipping', 'compensationPlan', 'manageCollections',
        'addEditCollection', 'userProfileEditor', 'walletOverview', 'walletReports', 'walletTransfers',
        'walletCharges', 'walletSettings', 'rsStudio', 'communication', 'manageOrderBump', 'manageUpsell',
        'managePromotionBoost', 'manageAbandonedCarts', 'manageReviews', 'manageAnnouncements', 'addEditAnnouncement',
        'manageTrainings', 'addEditTraining', 'trainingModuleDetail', 'manageMarketingAssets',
        'addEditMarketingAsset', 'rsCD', 'rsControleDrop',
        'marketplaceAdmin', 'marketplaceAdminOrders', 'marketplaceAdminProducts', 'marketplaceAdminFinancial'
    ].includes(view);

    const cartFulfillmentContext = useMemo(() => {
        const normalizedOrigins = cart
            .map(item => {
                const type = normalizeFulfillmentOriginType(item.fulfillmentOriginType);
                const id = type === 'seller_store'
                    ? String(item.fulfillmentOriginId || item.ownerUserId || '').trim()
                    : CENTRAL_MARKETPLACE_DISTRIBUTOR_ID;
                const name = type === 'seller_store'
                    ? String(item.fulfillmentOriginName || item.ownerLoginId || item.name || '').trim()
                    : 'Sede RS Prólipsi';
                const zip = String(item.fulfillmentOriginZip || '').trim();
                return { key: `${type}:${id || 'central'}`, type, id: id || null, name, zip };
            })
            .filter(origin => origin.type !== 'seller_store' || Boolean(origin.id));

        if (normalizedOrigins.length === 0) {
            return {
                type: 'central' as const,
                id: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                name: 'Sede RS Prólipsi',
                zip: '',
                mixed: false,
            };
        }

        const uniqueOrigins = new Map(normalizedOrigins.map(origin => [origin.key, origin]));
        if (uniqueOrigins.size > 1) {
            return {
                type: 'central' as const,
                id: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                name: 'Sede RS Prólipsi',
                zip: '',
                mixed: true,
            };
        }

        const [origin] = Array.from(uniqueOrigins.values());
        return {
            type: origin.type,
            id: origin.id,
            name: origin.name,
            zip: origin.zip,
            mixed: false,
        };
    }, [cart]);

    const checkoutRouting = useMemo<CheckoutRoutingContext>(() => {
        const currentRouteTarget = typeof window !== 'undefined'
            ? `${window.location.pathname}${readMarketplaceHashRoute().path}`
            : '';
        const explicitRouteMatch = currentRouteTarget.match(/\/(?:indicacao|cadastro|signup|loja)\/([a-zA-Z0-9-_]+)/i);
        const explicitRouteRef = explicitRouteMatch?.[1] ? String(explicitRouteMatch[1]).trim().toLowerCase() : '';
        const isCentralCompanyRoute = explicitRouteRef === DEFAULT_MARKETPLACE_SPONSOR_REF;
        const hasExplicitLinkedRoute = Boolean(explicitRouteRef);
        const hasLockedReferralRoute = (signupContext.sponsorSource === 'referral' || hasExplicitLinkedRoute) && !isCentralCompanyRoute;
        const effectiveDistributor = isLojistaSession ? selectedDistributor : null;

        if (hasLockedReferralRoute) {
            return {
                mode: 'referral',
                buyerType: isConsultantSession ? 'consultor' : 'cliente',
                sponsorRef: signupContext.sponsorRef,
                sponsorSource: signupContext.sponsorSource,
                referrerId: resolvedMarketplaceSponsor?.id || null,
                referrerName: resolvedMarketplaceSponsor?.name || signupContext.sponsorRef || 'Indicador',
                referrerLoginId: resolvedMarketplaceSponsor?.loginId || signupContext.sponsorRef,
                distributorId: null,
                distributorName: '',
                requiresDistributorSelection: false,
                fulfillmentOriginType: cartFulfillmentContext.type,
                fulfillmentOriginId: cartFulfillmentContext.type === 'seller_store' ? cartFulfillmentContext.id : CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                fulfillmentOriginName: cartFulfillmentContext.type === 'seller_store' ? cartFulfillmentContext.name : 'Sede RS Prólipsi',
                fulfillmentOriginZip: cartFulfillmentContext.zip,
            };
        }

        if (isCentralCompanyRoute && !isLojistaSession) {
            return {
                mode: 'central',
                buyerType: isConsultantSession ? 'consultor' : 'cliente',
                sponsorRef: DEFAULT_MARKETPLACE_SPONSOR_REF,
                sponsorSource: 'default',
                referrerId: null,
                referrerName: 'Loja Central RS Prólipsi',
                referrerLoginId: '',
                distributorId: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                distributorName: 'Sede RS Prólipsi',
                requiresDistributorSelection: false,
                fulfillmentOriginType: 'central',
                fulfillmentOriginId: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                fulfillmentOriginName: 'Sede RS Prólipsi',
                fulfillmentOriginZip: '',
            };
        }

        if (isLojistaSession) {
            if (cartFulfillmentContext.type === 'seller_store') {
                return {
                    mode: 'seller_store',
                    buyerType: 'consultor',
                    sponsorRef: signupContext.sponsorRef,
                    sponsorSource: signupContext.sponsorSource,
                    referrerId: null,
                    referrerName: '',
                    referrerLoginId: '',
                    distributorId: null,
                    distributorName: '',
                    requiresDistributorSelection: false,
                    fulfillmentOriginType: 'seller_store',
                    fulfillmentOriginId: cartFulfillmentContext.id,
                    fulfillmentOriginName: cartFulfillmentContext.name,
                    fulfillmentOriginZip: cartFulfillmentContext.zip,
                };
            }
            return {
                mode: 'consultant_cd',
                buyerType: 'consultor',
                sponsorRef: signupContext.sponsorRef,
                sponsorSource: signupContext.sponsorSource,
                referrerId: null,
                referrerName: '',
                referrerLoginId: '',
                distributorId: effectiveDistributor?.id || null,
                distributorName: effectiveDistributor?.name || '',
                requiresDistributorSelection: !effectiveDistributor,
                fulfillmentOriginType: 'cd',
                fulfillmentOriginId: effectiveDistributor?.id || null,
                fulfillmentOriginName: effectiveDistributor?.name || '',
                fulfillmentOriginZip: String((effectiveDistributor as any)?.address_zip || (effectiveDistributor as any)?.zipCode || ''),
            };
        }

        if (isConsultantSession) {
            if (cartFulfillmentContext.type === 'seller_store') {
                return {
                    mode: 'seller_store',
                    buyerType: 'consultor',
                    sponsorRef: signupContext.sponsorRef,
                    sponsorSource: signupContext.sponsorSource,
                    referrerId: null,
                    referrerName: '',
                    referrerLoginId: '',
                    distributorId: null,
                    distributorName: '',
                    requiresDistributorSelection: false,
                    fulfillmentOriginType: 'seller_store',
                    fulfillmentOriginId: cartFulfillmentContext.id,
                    fulfillmentOriginName: cartFulfillmentContext.name,
                    fulfillmentOriginZip: cartFulfillmentContext.zip,
                };
            }
            return {
                mode: 'central',
                buyerType: 'consultor',
                sponsorRef: signupContext.sponsorRef,
                sponsorSource: signupContext.sponsorSource,
                referrerId: null,
                referrerName: 'Loja Central RS Prólipsi',
                referrerLoginId: '',
                distributorId: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                distributorName: 'Sede RS Prólipsi',
                requiresDistributorSelection: false,
                fulfillmentOriginType: 'central',
                fulfillmentOriginId: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
                fulfillmentOriginName: 'Sede RS Prólipsi',
                fulfillmentOriginZip: '',
            };
        }

        if (cartFulfillmentContext.type === 'seller_store') {
            return {
                mode: 'seller_store',
                buyerType: 'cliente',
                sponsorRef: signupContext.sponsorRef,
                sponsorSource: signupContext.sponsorSource,
                referrerId: null,
                referrerName: '',
                referrerLoginId: '',
                distributorId: null,
                distributorName: '',
                requiresDistributorSelection: false,
                fulfillmentOriginType: 'seller_store',
                fulfillmentOriginId: cartFulfillmentContext.id,
                fulfillmentOriginName: cartFulfillmentContext.name,
                fulfillmentOriginZip: cartFulfillmentContext.zip,
            };
        }

        return {
            mode: 'central',
            buyerType: 'cliente',
            sponsorRef: signupContext.sponsorRef,
            sponsorSource: signupContext.sponsorSource,
            referrerId: null,
            referrerName: 'Loja Central RS Prólipsi',
            referrerLoginId: '',
            distributorId: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
            distributorName: 'Sede RS Prólipsi',
            requiresDistributorSelection: false,
            fulfillmentOriginType: 'central',
            fulfillmentOriginId: CENTRAL_MARKETPLACE_DISTRIBUTOR_ID,
            fulfillmentOriginName: 'Sede RS Prólipsi',
            fulfillmentOriginZip: '',
        };
    }, [
        cartFulfillmentContext.id,
        cartFulfillmentContext.name,
        cartFulfillmentContext.type,
        cartFulfillmentContext.zip,
        isConsultantSession,
        isLojistaSession,
        resolvedMarketplaceSponsor,
        selectedDistributor,
        signupContext.sponsorRef,
        signupContext.sponsorSource,
    ]);

    const shouldPromptDistributorSelection = (
        checkoutRouting.mode === 'consultant_cd' &&
        checkoutRouting.requiresDistributorSelection &&
        distributors.length > 0 &&
        !isAuthView &&
        !isAdminDashboardView &&
        ['home', 'productDetail', 'collectionView', 'checkout'].includes(view)
    );

    const shouldShowDistributorModal = distributors.length > 0 && (isDistributorSelectionModalOpen || shouldPromptDistributorSelection);

    useEffect(() => {
        if (shouldPromptDistributorSelection) {
            setIsDistributorSelectionModalOpen(true);
        } else {
            setIsDistributorSelectionModalOpen(false);
        }
    }, [shouldPromptDistributorSelection]);

    const marketplaceTopbarContext = useMemo(() => {
        const clean = (value?: string | null) => String(value || '').trim();
        const isConsultantStoreRoute =
            typeof window !== 'undefined' &&
            /\/loja\/[a-zA-Z0-9-_]+/i.test(`${window.location.pathname}${readMarketplaceHashRoute().path}`);

        if (checkoutRouting.mode === 'referral') {
            return {
                label: isConsultantStoreRoute ? 'Loja do consultor' : 'Indicador oficial',
                primary: clean(resolvedMarketplaceSponsor?.name) || clean(checkoutRouting.referrerName) || (isConsultantStoreRoute ? 'Consultor RS Prolipsi' : 'Indicador RS Prolipsi'),
                secondary: clean(checkoutRouting.referrerLoginId) ? `LOGIN/MMN: ${clean(checkoutRouting.referrerLoginId).toUpperCase()}` : '',
                distributorLabel: '',
                canChooseDistributor: false
            };
        }

        if (checkoutRouting.mode === 'consultant_cd') {
            const distributorName = clean(selectedDistributor?.name) || clean(checkoutRouting.distributorName);

            return {
                label: 'Atendimento oficial',
                primary: distributorName || 'Centro de distribuicao RS Prolipsi',
                secondary: clean(userProfile.loginId) ? `LOGIN/MMN: ${clean(userProfile.loginId).toUpperCase()}` : '',
                distributorLabel: distributorName ? `CD: ${distributorName}` : 'CD nao selecionado',
                canChooseDistributor: distributors.length > 0
            };
        }

        if (checkoutRouting.fulfillmentOriginType === 'seller_store') {
            return {
                label: 'Atendimento oficial',
                primary: clean(checkoutRouting.fulfillmentOriginName) || 'Loja parceira',
                secondary: isConsultantSession && clean(userProfile.loginId)
                    ? `LOGIN/MMN: ${clean(userProfile.loginId).toUpperCase()}`
                    : (!currentCustomer ? 'Entrar na Loja' : ''),
                distributorLabel: 'Origem: Loja do lojista',
                canChooseDistributor: false
            };
        }

        return {
            label: 'Atendimento oficial',
            primary: clean(checkoutRouting.referrerName) || 'Loja Central RS Prolipsi',
            secondary: isConsultantSession && clean(userProfile.loginId)
                ? `LOGIN/MMN: ${clean(userProfile.loginId).toUpperCase()}`
                : (!currentCustomer ? 'Entrar na Loja' : ''),
            distributorLabel: clean(checkoutRouting.distributorName) ? `CD: ${clean(checkoutRouting.distributorName)}` : 'CD: Loja Central',
            canChooseDistributor: false
        };
    }, [
        checkoutRouting.distributorName,
        checkoutRouting.fulfillmentOriginName,
        checkoutRouting.fulfillmentOriginType,
        checkoutRouting.mode,
        checkoutRouting.referrerLoginId,
        checkoutRouting.referrerName,
        currentCustomer?.name,
        distributors.length,
        isConsultantSession,
        resolvedMarketplaceSponsor?.name,
        selectedDistributor?.name,
        userProfile.loginId,
        userProfile.name
    ]);


    if (isAuthView) {
        switch (view) {
            case 'consultantLogin': return <ConsultantLogin branding={authBranding} onLoginSuccess={() => handleNavigate('consultantStore')} onBackToHome={() => handleNavigate('home')} onNavigateToRegister={() => handleNavigate('sellerRegistration')} />;
            case 'sellerRegistration': return <SellerRegistration branding={authBranding} sponsorRef={signupContext.sponsorRef} sponsorSource={signupContext.sponsorSource} onRegisterSuccess={() => handleNavigate('consultantLogin')} onBackToHome={() => handleNavigate('home')} onNavigateToLogin={() => handleNavigate('consultantLogin')} />;
            case 'customerLogin': return <CustomerLogin branding={authBranding} onLoginSuccess={handleCustomerLogin} onBackToHome={() => handleNavigate('home')} onNavigateToRegister={() => handleNavigate('customerRegister')} onNavigateToForgotPassword={() => handleNavigate('customerForgotPassword')} />;
            case 'customerRegister': return <CustomerRegister branding={authBranding} sponsorRef={signupContext.sponsorRef} sponsorSource={signupContext.sponsorSource} onRegister={handleCustomerRegister} onBackToHome={() => handleNavigate('home')} onNavigateToLogin={() => handleNavigate('customerLogin')} />;
            case 'customerForgotPassword': return <CustomerForgotPassword onForgotPasswordRequest={(email) => alert(`Link de recuperaÃ§Ã£o enviado para ${email}`)} onBackToLogin={() => handleNavigate('customerLogin')} />;
            default: return null; // Should not happen
        }
    }

    if (view === 'checkout') {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const paramProductId = params.get('productId') || undefined;
        const mainProductId = cart[0]?.productId || selectedProduct?.id || paramProductId;
        const cartItemsForCheckout = cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId
        }));

        const checkoutCustomer = currentCustomer || (
            (isConsultantSession || isLojistaSession) && userProfile.email
                ? {
                    id: userProfile.id || userProfile.loginId || 'marketplace-session-user',
                    name: userProfile.name || 'Consultor',
                    email: userProfile.email,
                    passwordHash: ''
                }
                : null
        );

        return (
            <>
                <style>{storeCustomization.customCss}</style>
                <CheckoutView
                    cartItems={cart}
                    onBack={() => handleNavigate('home')}
                    onFinalizePurchase={handleFinalizePurchase}
                    logoUrl={storeCustomization.logoUrl}
                    currentCustomer={checkoutCustomer}
                    coupons={coupons}
                    orderBumpConfig={storeCustomization.orderBump}
                    allProducts={pricedProducts}
                    paymentSettings={paymentSettings}
                    selectedDistributor={selectedDistributor}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveFromCart}
                    salesRouting={checkoutRouting}
                    onRequestDistributorSelection={() => setIsDistributorSelectionModalOpen(true)}
                    onRequestStoreLogin={() => handleNavigateToStoreLogin('checkout')}
                />
                <CDSelectionModal
                    isOpen={shouldShowDistributorModal}
                    onClose={() => setIsDistributorSelectionModalOpen(false)}
                    distributors={distributors}
                    onSelect={handleDistributorSelection}
                    title="Escolha o centro de distribuicao para esta compra"
                />
            </>
        )
    }

    // NOTE: rsCD e rsControleDrop sÃ£o renderizados dentro do AdminLayout via renderAdminContent()

    if (isAdminDashboardView) {
        return (
            <ErrorBoundary>
                <style>{storeCustomization.customCss}</style>
                {renderAdminContent()}
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <style>{storeCustomization.customCss}</style>
            <div className="bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))] font-sans relative">
                {isLivePreview && (
                    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
                        <div className="flex items-center gap-2 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] px-3 py-1 rounded-full text-[10px] font-bold shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-pulse border border-[rgb(var(--color-brand-gold-light))]">
                            <span className="w-1.5 h-1.5 bg-[rgb(var(--color-brand-dark))] rounded-full"></span>
                            PREVIEW: {userProfile.name?.toUpperCase() || 'MODO LIVE'}
                        </div>
                        <div className="bg-black/95 border border-[rgb(var(--color-brand-gold))]/40 p-3 rounded-lg text-[10px] font-mono text-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-l-4 border-l-[rgb(var(--color-brand-gold))]">
                            <div className="text-[rgb(var(--color-brand-gold))] border-b border-[rgb(var(--color-brand-gold))]/20 mb-2 pb-1 font-black tracking-widest flex justify-between items-center">
                                <span>RS SYNC HUD v9.5</span>
                                <span className="opacity-40 text-[8px] bg-white/10 px-1 rounded">{instanceId.substring(0, 4)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="text-white/40 uppercase">Status:</span> <span className={lastSyncTimestampRef.current ? "text-green-400 font-bold" : "text-amber-400"}>{lastSyncTimestampRef.current ? 'SINCRO OK' : 'AGUARDANDO...'}</span>
                                <span className="text-white/40 uppercase">Fonte:</span> <span className="text-gold-400 font-bold">{lastSyncSourceRef.current}</span>
                                <span className="text-white/40 uppercase">VersÃ£o:</span> <span className="text-white/70">{lastSyncVersionRef.current}</span>
                                <span className="text-white/40 uppercase">Ãšltima:</span> <span className="text-white/70">{lastSyncTimestampRef.current ? new Date(lastSyncTimestampRef.current).toLocaleTimeString() : '--:--:--'}</span>
                                <span className="text-white/40 uppercase">Logo:</span> <span className="text-purple-400 font-bold">{storeCustomization.logoUrl ? (storeCustomization.logoUrl.startsWith('data:') ? 'BASE64' : 'URL') : 'VAZIO'}</span>
                                <span className="text-white/40 uppercase">Tamanho:</span> <span className="text-blue-400">{storeCustomization.logoUrl?.length || 0} bytes</span>
                                <span className="text-white/40 uppercase">Hero Text:</span> <span className="text-white truncate max-w-[80px]" title={storeCustomization.hero?.title}>{storeCustomization.hero?.title || '---'}</span>
                            </div>
                        </div>
                    </div>
                )}
                {!isLivePreview && (
                    <div className="bg-[rgb(var(--color-brand-gray))] border-b border-[rgb(var(--color-brand-gold))]/[.20] py-1.5 relative z-50">
                        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
                            <span className="text-[10px] font-bold text-[rgb(var(--color-brand-gold))] uppercase tracking-widest opacity-80">
                                {marketplaceTopbarContext.label}:
                            </span>
                            <span className="text-xs font-black text-white uppercase tracking-tight">
                                {marketplaceTopbarContext.primary}
                            </span>
                            {marketplaceTopbarContext.secondary && (
                                <button
                                    type="button"
                                    onClick={() => currentCustomer ? handleNavigate('consultantStore') : handleNavigateToStoreLogin(view)}
                                    className="rounded-full border border-[rgb(var(--color-brand-gold))]/35 bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[rgb(var(--color-brand-gold))] transition hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]"
                                    title={currentCustomer ? 'Acessar painel da loja' : 'Entrar na loja com seu cadastro'}
                                >
                                    {marketplaceTopbarContext.secondary}
                                </button>
                            )}
                            {marketplaceTopbarContext.distributorLabel && (
                                <span className="rounded-full border border-[rgb(var(--color-brand-gold))]/35 bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">
                                    {marketplaceTopbarContext.distributorLabel}
                                </span>
                            )}
                            {marketplaceTopbarContext.canChooseDistributor && (
                                <button
                                    type="button"
                                    onClick={() => setIsDistributorSelectionModalOpen(true)}
                                    className="rounded-full border border-[rgb(var(--color-brand-gold))]/45 bg-[rgb(var(--color-brand-gold))]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[rgb(var(--color-brand-gold))] transition hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]"
                                >
                                    {selectedDistributor ? 'Trocar CD' : 'Escolher CD'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <Header
                    logoUrl={storeCustomization.logoUrl}
                    logoMaxWidth={storeCustomization.logoMaxWidth}
                    onLogoClick={() => handleNavigate('home')}
                    onConsultantClick={() => handleNavigate(currentCustomer ? 'consultantStore' : 'consultantLogin')}
                    cartItems={cart}
                    onCartClick={() => setIsCartOpen(true)}
                    collections={collections}
                    onNavigate={handleNavigate}
                    currentCustomer={currentCustomer}
                    onLogout={handleMarketplaceLogout}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                />
                <main>
                    {renderPublicContent()}
                </main>
                <Footer logoUrl={storeCustomization.logoUrl} content={{
                    ...initialStoreCustomization.footer,
                    description: storeCustomization.footer?.description || initialStoreCustomization.footer.description,
                    socialLinks: storeCustomization.footer?.socialLinks || initialStoreCustomization.footer.socialLinks,
                    contactEmail: storeCustomization.footer?.contactEmail || initialStoreCustomization.footer.contactEmail,
                    cnpj: storeCustomization.footer?.cnpj || initialStoreCustomization.footer.cnpj,
                    businessAddress: storeCustomization.footer?.businessAddress || initialStoreCustomization.footer.businessAddress,
                }} onConsultantClick={() => handleNavigate('consultantLogin')} onNavigate={handleNavigate} currentCustomer={currentCustomer} />
            </div>
            {showFloatingCartStatus && cart.length > 0 && (
                <FloatingCartStatus cartItems={cart} onViewCart={() => {
                    setIsCartOpen(true);
                    setShowFloatingCartStatus(false);
                }} />
            )}
            <CartView
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveFromCart}
                onNavigate={handleNavigate}
            />
            <CDSelectionModal
                isOpen={shouldShowDistributorModal}
                onClose={() => setIsDistributorSelectionModalOpen(false)}
                distributors={distributors}
                onSelect={handleDistributorSelection}
                title="Escolha o centro de distribuicao para esta compra"
            />
        </ErrorBoundary>
    );
};

export default App;



