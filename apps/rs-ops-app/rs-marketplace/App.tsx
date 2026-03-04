

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
import SellerRegistration from './components/SellerRegistration';
import CompensationPlan from './components/CompensationPlan';
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
// const CheckoutProApp = React.lazy(() => import('./checkout-pro-rs-prólipsi/App')); // Commented out - folder not found
const RSControleDropApp = React.lazy(() => import('./rs-controle-drop/AppWrapper'));
// import { CheckoutProvider } from './checkout-pro-rs-prólipsi/context/CheckoutContext'; // Commented out - folder not found
import AddEditMarketingAsset from './components/AddEditMarketingAsset';
import CustomerWishlist from './components/CustomerWishlist';
import ProductQA from './components/ProductQA';
import RecentlyViewed from './components/RecentlyViewed';
import OrderLookupView from './components/OrderLookupView';
import OrderStatusView from './components/OrderStatusView';
import { storeCustomizationAPI, consultantAPI, productsAPI, ordersAPI, collectionsAPI, marketingPixelsAPI, distributorsAPI, customersAPI, orderTrackingAPI } from './services/marketplaceAPI';
import { supabase } from './services/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as reviewService from './services/reviewService';

// import './rs-controle-drop/styles.css'; // Commented out - folder not found

import { Product, View, Order, ReturnRequest, DropshippingOrder, DropshippingProduct, Coupon, MarketingPixel, PartnerStore, ShortenedLink, StoreCustomization, PaymentSettings, ShippingSettings, CartItem, CompensationSettings, Banner, DashboardSettings, UserProfile, Collection, Customer, NetworkActivityItem, Charge, WalletSettings, ProductVariant, OrderItem, AbandonedCart, Review, Announcement, Training, MarketingAsset, Question, Answer, Distributor } from './types';

import { products as initialProducts } from './data/products';
import { orders as initialOrders } from './data/orders';
import { returns as initialReturns } from './data/returns';
import { dropshippingProducts as initialDropshippingProducts, dropshippingOrders as initialDropshippingOrders } from './data/dropshipping';
import { coupons as initialCoupons } from './data/promotions';
import { marketingPixels as initialMarketingPixels } from './data/marketingPixels';
import { partnerStores as initialPartnerStores } from './data/partnerStores';
import { shortenedLinks as initialShortenedLinks } from './data/shortenedLinks';
import { initialStoreCustomization } from './data/storeCustomization';
import { initialPaymentSettings } from './data/paymentSettings';
import { initialShippingSettings } from './data/shippingSettings';
import { initialCompensationSettings } from './data/compensationSettings';
import { collections as initialCollections } from './data/collections';
import { customers as initialCustomers } from './data/customers';
import { networkActivity as initialNetworkActivity } from './data/networkActivity';
import { weeklyBonuses as initialWeeklyBonuses } from './data/weeklyBonuses';
import { initialReviews } from './data/reviews';
import { initialQuestions } from './data/questions';
import { announcements as initialAnnouncements, trainings as initialTrainings, marketingAssets as initialMarketingAssets } from './data/communications';
import { initialAbandonedCarts } from './data/abandonedCarts';
import { initialCharges } from './data/charges';
import { affiliates as initialAffiliates } from './data/affiliates';
import { initialWalletSettings } from './data/walletSettings';
import { distributors as initialDistributors } from './data/distributors';

const initialDashboardBanners: Banner[] = [
    {
        id: 'dash-banner-1',
        desktopImage: 'https://picsum.photos/seed/launch/1200/400',
        mobileImage: 'https://picsum.photos/seed/launch-m/400/300',
        link: '#',
    },
    {
        id: 'dash-banner-2',
        desktopImage: 'https://picsum.photos/seed/logistics/1200/400',
        mobileImage: 'https://picsum.photos/seed/logistics-m/400/300',
        link: '#',
    },
];

const initialDashboardSettings: DashboardSettings = {
    components: [
        { id: 'comp-1', column: 'left', type: 'userInfo', enabled: true, visibleFields: { id: true, graduation: true, accountStatus: true, monthlyActivity: true, category: true, referralLink: true, affiliateLink: true } },
        { id: 'comp-2', column: 'right', type: 'adminBanner', enabled: true },
        { id: 'comp-3', column: 'right', type: 'bonusCards', enabled: true },
        { id: 'comp-4', column: 'left', type: 'qualificationProgress', enabled: true, title: 'Qualificação Atual', value: 4500, max: 15000, startLabel: 'Iniciante', endLabel: 'Prata', startIcon: 'StarOutlineIcon', endIcon: 'TrophyIcon' },
        { id: 'comp-5', column: 'left', type: 'qualificationProgress', enabled: true, title: 'Qualificação do Mês', value: 800, max: 2500, startLabel: 'Base', endLabel: 'Bronze', startIcon: 'UserIcon', endIcon: 'GlobalIcon' },
        { id: 'comp-6', column: 'right', type: 'incentivesProgram', enabled: true, title: 'Programa de Incentivos e Premiações', content: [{ title: 'Viagem Nacional', progress: 60 }, { title: 'Carro 0km', progress: 30 }] },
        { id: 'comp-7', column: 'left', type: 'referralLinks', enabled: true },
        { id: 'comp-8', column: 'right', type: 'networkActivity', enabled: true, title: 'Atividade da Rede' },
        { id: 'comp-9', column: 'right', type: 'performanceChart', enabled: true, title: 'Bônus Semanal' },
        { id: 'comp-10', column: 'left', type: 'shortcut', enabled: true, title: 'Gerenciar Produtos', url: 'manageProducts', icon: 'ProductsIcon' },
        { id: 'comp-11', column: 'left', type: 'shortcut', enabled: true, title: 'Visão Geral WalletPay', url: 'walletOverview', icon: 'WalletIcon' },
    ],
    cards: [
        { id: 'card-1', title: 'Bônus Ciclo Global', icon: 'GlobalIcon', dataKey: 'cycleBonus' },
        { id: 'card-2', title: 'Bônus Top Sigme', icon: 'TrophyIcon', dataKey: 'topSigmeBonus' },
        { id: 'card-3', title: 'Bônus Plano de Carreira', icon: 'StarOutlineIcon', dataKey: 'careerPlanBonus' },
    ]
};

const App: React.FC = () => {
    // Identidade Única da Instância v3.4 (Diferencia Editor de Preview)
    const instanceId = useMemo(() => Math.random().toString(36).substring(2, 11), []);

    // v6.0: Detecção de Preview Consolidada e Imutável no Ciclo da Janela
    const isPreviewDetected = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.name === 'preview-iframe' || window.location.search.includes('preview=true');
    }, []);

    const [isLivePreview] = useState(isPreviewDetected);
    const isLivePreviewRef = useRef(isPreviewDetected);
    // Trava de loop v3.6: Previne que o estado recebido via rede reative o envio.
    const [isReceivingSync, setIsReceivingSync] = useState(false);

    const [view, setView] = useState<View>('home');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [selectedMarketingPixel, setSelectedMarketingPixel] = useState<MarketingPixel | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [viewBeforeCheckout, setViewBeforeCheckout] = useState<View>('home');
    const lastSyncTimestampRef = useRef<number>(0);
    const lastSyncSourceRef = useRef<string>('NENHUMA'); // v9.0: Rastreia a fonte do sinal
    const lastSyncVersionRef = useRef<string>('0.0'); // v9.0: Versão do payload

    // Data states
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [returns, setReturns] = useState<ReturnRequest[]>(initialReturns);
    const [dropshippingOrders, setDropshippingOrders] = useState<DropshippingOrder[]>(initialDropshippingOrders);
    const [dropshippingProducts] = useState<DropshippingProduct[]>(initialDropshippingProducts);
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const [marketingPixels, setMarketingPixels] = useState<MarketingPixel[]>(initialMarketingPixels);
    const [partnerStores, setPartnerStores] = useState<PartnerStore[]>(initialPartnerStores);
    const [shortenedLinks, setShortenedLinks] = useState<ShortenedLink[]>(initialShortenedLinks);
    // v4.4: Estado inicial inteligente: Prioriza o rascunho do editor se estiver em modo PREVIEW (Iframe)
    const [storeCustomization, setStoreCustomization] = useState<StoreCustomization>(() => {
        if (typeof window !== 'undefined') {
            // v6.0: Uso da detecção consolidada para inicialização
            const saved = isPreviewDetected ? localStorage.getItem('rs_editor_draft') : localStorage.getItem('rs-store-customization');
            const fallback = localStorage.getItem('rs-store-customization');

            const finalSaved = saved || fallback;
            if (finalSaved) {
                try {
                    const parsed = JSON.parse(finalSaved);
                    // Garante que o buffer de logo seja aplicado se o rascunho referenciá-lo v4.4
                    if (parsed.logoUrl === 'BUFFERED_IN_LOGO_KEY') {
                        const buffer = localStorage.getItem('rs_logo_buffer');
                        if (buffer) parsed.logoUrl = buffer;
                    }
                    // Merge granular do footer: preserva links estáticos, só substitui campos personalizáveis
                    const parsedFooter = parsed.footer || {};
                    const safeFooter = {
                        ...initialStoreCustomization.footer,
                        ...(parsedFooter.description !== undefined && { description: parsedFooter.description }),
                        ...(parsedFooter.socialLinks !== undefined && { socialLinks: parsedFooter.socialLinks }),
                        ...(parsedFooter.contactEmail !== undefined && { contactEmail: parsedFooter.contactEmail }),
                        ...(parsedFooter.cnpj !== undefined && { cnpj: parsedFooter.cnpj }),
                        ...(parsedFooter.businessAddress !== undefined && { businessAddress: parsedFooter.businessAddress }),
                    };
                    return { ...initialStoreCustomization, ...parsed, footer: safeFooter };

                } catch (e) { }
            }
        }
        return initialStoreCustomization;
    });
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(initialPaymentSettings);
    const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(initialShippingSettings);
    const [compensationSettings, setCompensationSettings] = useState<CompensationSettings>(initialCompensationSettings);
    const [dashboardBanners, setDashboardBanners] = useState<Banner[]>(initialDashboardBanners);
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(initialDashboardSettings);
    const [collections, setCollections] = useState<Collection[]>(initialCollections);
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);

    // v11.0: Carregamento Inicial Robusto via API (Banco de Dados)
    useEffect(() => {
        const loadCustomization = async () => {
            console.log('%c[App v11.0] 📡 Carregando customização do banco...', 'color: #ff00ff; font-weight: bold;');
            const result = await storeCustomizationAPI.get();

            if (result && result.success !== false && result.data) {
                const dbData = result.data;
                console.log('[App v11.0] ✅ Dados do banco recebidos:', dbData);

                setStoreCustomization(prev => {
                    // Missão 11.0: Preserva o rascunho local apenas se estiver em modo Preview
                    if (isPreviewDetected) {
                        const savedDraft = localStorage.getItem('rs_editor_draft');
                        if (savedDraft) {
                            try {
                                const parsed = JSON.parse(savedDraft);
                                console.log('[App v11.0] 📔 Mantendo rascunho local em modo Preview.');
                                return { ...prev, ...parsed };
                            } catch (e) { }
                        }
                    }

                    // Se não for preview ou não tiver rascunho, usa o banco
                    // Mas aplica o Auto-Reparo de seções dinâmicas (Missão 10.0/11.0)
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
                            { id: 'featuredCollections', name: 'Coleções em Destaque' },
                            { id: 'recentlyViewed', name: 'Vistos Recentemente' },
                            { id: 'midPageBanner', name: 'Banner de Meio da Página' },
                        ];

                        const dbSections = [...finalCustom.homepageSections];
                        const existingIds = dbSections.map((s: any) => s.id);
                        let changed = false;

                        // Adiciona apenas o que falta, sem resetar o que já existe
                        defaultSections.forEach((def) => {
                            if (!existingIds.includes(def.id)) {
                                dbSections.push({
                                    id: def.id,
                                    name: def.name,
                                    enabled: true,
                                    order: dbSections.length + 1
                                });
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
                console.warn('[App v11.0] ⚠️ Falha ao carregar do banco. Usando fallback local.');
            }
        };

        const loadCustomerSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('consultores')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                if (profile) {
                    setCurrentCustomer({
                        id: profile.id,
                        name: profile.name || profile.full_name || 'Cliente',
                        email: session.user.email!,
                        passwordHash: ''
                    });
                } else {
                    // Tenta na tabela profiles se não achar em consultores
                    const { data: userProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('email', session.user.email)
                        .single();

                    if (userProfile) {
                        setCurrentCustomer({
                            id: userProfile.id,
                            name: userProfile.full_name || 'Cliente',
                            email: session.user.email!,
                            passwordHash: ''
                        });
                    }
                }
            }
        };

        loadCustomization();
        loadCustomerSession();

        reviewService.fetchAllReviews().then(data => {
            if (data.length > 0) setReviews(data);
        }).catch(() => { });
    }, [isPreviewDetected]);
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
    const [marketingAssets, setMarketingAssets] = useState<MarketingAsset[]>(initialMarketingAssets);
    const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(initialAbandonedCarts);
    const [charges, setCharges] = useState<Charge[]>(initialCharges);
    const [distributors, setDistributors] = useState<Distributor[]>(initialDistributors);
    const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
    const [selectedCDId, setSelectedCDId] = useState<string>('');

    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('rs-consultant-profile');
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003';
        const isLocal = currentOrigin.includes('localhost');
        const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
        const rotaFacilDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

        let profile: UserProfile = {
            name: 'RS PRÓLIPSI',
            id: 'rsprolipsi',
            idConsultor: 'rsprolipsi',
            graduation: 'DIAMANTE PRESIDENCIAL',
            accountStatus: 'Ativo',
            monthlyActivity: 'Ativo',
            category: 'DIAMANTE',
            referralLink: `${rotaFacilDomain}/indicacao/rsprolipsi`,
            affiliateLink: `${marketplaceDomain}/loja/rsprolipsi`,
            avatarUrl: 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png'
        };

        if (saved) {
            try {
                const parsed = JSON.parse(saved) as UserProfile;
                const isMaster = parsed.slug?.toLowerCase() === 'rsprolipsi' || parsed.idConsultor?.toLowerCase() === 'rsprolipsi' || (parsed.email && parsed.email.includes('rsprolipsioficial'));
                if (isMaster) {
                    return {
                        ...parsed,
                        name: 'RS PRÓLIPSI',
                        idConsultor: 'rsprolipsi',
                        slug: 'rsprolipsi',
                        referralLink: `${currentOrigin}/?ref=rsprolipsi`,
                        affiliateLink: `${currentOrigin}/loja/rsprolipsi`
                    };
                }
                return parsed;
            } catch { }
        }
        return profile;
    });
    const [bonuses, setBonuses] = useState({
        cycleBonus: 500.00,
        topSigmeBonus: 250.00,
        careerPlanBonus: 1000.00,
        affiliateBonus: 1572.50,
        dropshipBonus: 834.75,
        logisticsBonus: 212.30,
    });
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Cart State
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('rs-marketplace-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showFloatingCartStatus, setShowFloatingCartStatus] = useState(false);

    useEffect(() => {
        localStorage.setItem('rs-marketplace-cart', JSON.stringify(cart));
    }, [cart]);

    // Offer products: has compareAtPrice OR is marked as 'Sale'. Falls back to first 4 active products so the section always renders.
    const offerProducts = useMemo(() => {
        const markedOffers = products.filter(p =>
            (p.compareAtPrice && p.compareAtPrice > p.price) ||
            (p.status && ['Sale', 'Oferta', 'Promoção'].includes(p.status))
        );
        return markedOffers.length > 0 ? markedOffers : products.filter(p => p.status === 'Ativo').slice(0, 4);
    }, [products]);
    const recentlyViewedProducts = useMemo(() => recentlyViewedIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p)), [recentlyViewedIds, products]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    // Sincronização em Tempo Real (Triple Channel) v4.2
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
            // v6.0 Blindagem Absoluta: Apenas a instância PREVIEW processa sync. 
            // Ignora se for enviada pela própria instância (loop prevention).
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

                console.log(`%c[Sync ${dataVersion}] 📥 Recebido: ${payload.data.hero?.title || 'Update'} | Logo: ${finalData.logoUrl ? (finalData.logoUrl.length > 50 ? finalData.logoUrl.substring(0, 30) + '...' : finalData.logoUrl) + ' (' + finalData.logoUrl.length + ' ch)' : 'N/A'}`, 'color: #00ff00; font-weight: bold;');

                try {
                    // v8.0: Recuperação de Buffer só se necessário
                    if (finalData.logoUrl === 'BUFFERED_IN_LOGO_KEY') {
                        const bufferedLogo = localStorage.getItem('rs_logo_buffer');
                        if (bufferedLogo) {
                            finalData.logoUrl = bufferedLogo;
                            console.log(`%c[Sync v8.0] 📦 Logo pesado recuperado do BUFFER (${bufferedLogo.length} chars)`, 'color: #00ffff;');
                        } else {
                            console.warn('[Sync v8.0] ⚠️ Buffer placeholder found but no data in storage!');
                        }
                    }

                    // v4.1: Recuperação Universal de Buffer (Banners)
                    const hasBufferedBanners = finalData.carouselBanners?.some((b: any) => b.desktopImage === 'BUFFERED' || b.id === 'BUFFERED');
                    if (hasBufferedBanners || (!finalData.carouselBanners?.length && localStorage.getItem('rs_banners_buffer'))) {
                        const bufferedBanners = localStorage.getItem('rs_banners_buffer');
                        if (bufferedBanners) {
                            try {
                                finalData.carouselBanners = JSON.parse(bufferedBanners);
                                console.log('[Sync v8.0] 📦 Banners recuperados do buffer');
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
    }, [instanceId]); // v4.3: Removido isLivePreview para evitar reconexão constante

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
            const rotaFacilDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

            const officialId = 'rsprolipsi';
            const officialName = 'RS PRÓLIPSI';

            // Blindagem total de campos mestre
            const needsUpdate =
                userProfile.idConsultor !== officialId ||
                userProfile.id !== officialId ||
                userProfile.name !== officialName ||
                !userProfile.referralLink?.includes('3002');

            if (needsUpdate) {
                const updatedProfile = {
                    ...userProfile,
                    name: officialName,
                    id: officialId,
                    idConsultor: officialId,
                    slug: officialId,
                    referralLink: `${rotaFacilDomain}/indicacao/${officialId}`,
                    affiliateLink: `${marketplaceDomain}/loja/${officialId}`,
                    avatarUrl: 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png'
                };
                setUserProfile(updatedProfile);
                localStorage.setItem('rs-consultant-profile', JSON.stringify(updatedProfile));
            }
        }
    }, [userProfile]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref && ref.toLowerCase() === 'rsprolipsi' && userProfile.idConsultor !== 'rsprolipsi') {
                const officialId = 'rsprolipsi';
                const officialName = 'RS PRÓLIPSI';
                const updatedProfile = {
                    ...userProfile,
                    name: officialName,
                    id: officialId,
                    idConsultor: officialId,
                    slug: officialId,
                    avatarUrl: 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png'
                };
                setUserProfile(updatedProfile);
                localStorage.setItem('rs-consultant-profile', JSON.stringify(updatedProfile));
            }
        }
    }, [userProfile.idConsultor]);

    useEffect(() => {
        const isDev = (import.meta as any).env?.DEV ?? true;
        if (isDev && typeof window !== 'undefined') {
            try {
                if (!localStorage.getItem('rs-role')) localStorage.setItem('rs-role', 'super_admin');
            } catch { }
        }
    }, []);

    useEffect(() => {
        const resolveViewFromHash = () => {
            const hash = (window.location.hash || '').replace('#', '');
            if (hash.startsWith('/cd')) {
                setView('rsCD');
            } else if (hash.startsWith('/market-drop') || hash.startsWith('/drop-afiliado')) {
                setView('rsControleDrop');
            } else {
                switch (hash) {
                    case '/dashboard-editor': {
                        const isSuperAdmin = (typeof window !== 'undefined' && (localStorage.getItem('rs-role') === 'super_admin' || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')));
                        setView(isSuperAdmin ? 'dashboardEditor' : 'consultantStore');
                        break;
                    }
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
                        setView('home');
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
        (async () => {
            try {
                const prodRes: any = await productsAPI.getAll();
                if (prodRes && prodRes.success !== false && Array.isArray(prodRes.data)) {
                    const mapped: Product[] = prodRes.data.map((it: any) => ({
                        id: String(it.id ?? ''),
                        name: String(it.name ?? it.title ?? 'Produto'),
                        seller: String(it.seller ?? ''),
                        price: Number(it.price ?? it.sale_price ?? 0),
                        costPerItem: Number(it.cost ?? it.cost_per_item ?? 0),
                        currency: String(it.currency ?? 'BRL'),
                        shortDescription: String(it.short_description ?? it.description ?? ''),
                        description: String(it.description ?? ''),
                        images: Array.isArray(it.images) ? it.images : [String(it.image_url ?? '')].filter(Boolean),
                        rating: 0, // Dinâmico via Supabase reviews
                        reviewCount: 0, // Dinâmico via Supabase reviews
                        collectionId: it.collection_id ?? null,
                        status: String(it.status ?? 'Publicado'),
                        inventory: Number(it.inventory ?? 0),
                        type: String(it.type ?? 'Produto'),
                        requiresShipping: Boolean(it.requires_shipping ?? true),
                        trackQuantity: Boolean(it.track_quantity ?? true),
                        chargeTax: Boolean(it.charge_tax ?? true),
                        continueSelling: Boolean(it.continue_selling ?? false),
                        seoTitle: String(it.seo_title ?? it.name ?? ''),
                        seoDescription: String(it.seo_description ?? it.short_description ?? ''),
                        urlHandle: String(it.url_handle ?? ''),
                        options: Array.isArray(it.options) ? it.options : [],
                        variants: Array.isArray(it.variants) ? it.variants : [],
                        compareAtPrice: it.compare_at_price ?? undefined,
                    }));
                    // Master Fix: Ensure Premium products (initialProducts) are ALWAYS at the front.
                    const premiumIds = new Set(initialProducts.map(p => p.id));

                    // Filter: Only allow RS Prólipsi products, removing anything else as requested.
                    const filteredApiProducts = mapped.filter(mp =>
                        !premiumIds.has(mp.id) &&
                        (mp.seller === 'RS Prólipsi' || mp.name.toLowerCase().includes('lipsi'))
                    );

                    const allProducts = [...initialProducts, ...filteredApiProducts];

                    console.log('🚀 Marketplace Master: Merged', initialProducts.length, 'premium and', filteredApiProducts.length, 'API RS products. Mockups removed.');
                    setProducts(allProducts);
                } else {
                    console.log('⚠️ Marketplace Master: API failed or empty, using premium catalog.');
                    setProducts(initialProducts);
                }
                const colRes: any = await collectionsAPI.getAll();
                if (colRes && colRes.success !== false && Array.isArray(colRes.data)) {
                    const cols: Collection[] = colRes.data.map((c: any) => ({
                        id: String(c.id ?? ''),
                        title: String(c.title ?? c.name ?? 'Coleção'),
                        description: String(c.description ?? ''),
                        imageUrl: String(c.image_url ?? c.banner_url ?? ''),
                    }));
                    setCollections(cols.length > 0 ? cols : initialCollections);
                } else {
                    setCollections(initialCollections);
                }
                const mpRes: any = await marketingPixelsAPI.list();
                if (mpRes && mpRes.success !== false && Array.isArray(mpRes.data)) {
                    setMarketingPixels(mpRes.data.map((p: any) => ({
                        id: String(p.id ?? ''),
                        type: String(p.type ?? 'Facebook') as any,
                        name: String(p.name ?? p.campaign_name ?? 'Pixel'),
                        pixelId: String(p.pixel_id ?? p.tag_id ?? p.measurement_id ?? ''),
                        idLabel: p.label ? String(p.label) : undefined,
                        status: Boolean(p.active) ? 'Ativo' : 'Inativo'
                    })));
                }
                const cdRes: any = await distributorsAPI.list();
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
                } else {
                    setDistributors(initialDistributors);
                }
            } catch (e) {
                setProducts(initialProducts);
                setCollections(initialCollections);
                setMarketingPixels(initialMarketingPixels);
                setDistributors(initialDistributors);
            }
        })();
    }, []);

    useEffect(() => {
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
                                title: c.title || 'Bônus',
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
    }, []);

    useEffect(() => {
        if ((view === 'rsCD' as View) && !selectedCDId && distributors.length > 0) {
            setSelectedCDId(distributors[0].id);
        }
    }, [view, selectedCDId, distributors]);

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
                variantText
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

    const handleFinalizePurchase = (order: Order) => {
        setLastConfirmedOrder(order);
        setOrders(prev => [...prev, order]);
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
        if (newView === 'marketplaceAdmin') {
            window.location.hash = '#/marketplace-admin';
        }
        if (newView === 'rsCD') {
            window.location.hash = '#/cd';
        }
        if (newView === 'rsControleDrop') {
            window.location.hash = '#/market-drop';
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
                console.error('Erro ao salvar customização:', e);
            }
            return newCustomization;
        });

        // alert('Aparência da loja atualizada com sucesso!'); // v9.0: Removido para não travar thread de edição
    };

    const handleDashboardBannersUpdate = (newBanners: Banner[]) => {
        setDashboardBanners(newBanners);
        alert('Banners do painel atualizados com sucesso!');
    };

    const handleDashboardSettingsUpdate = (newSettings: DashboardSettings) => {
        setDashboardSettings(newSettings);
        alert('Painel atualizado com sucesso!');
    };

    const handlePaymentSettingsSave = (newSettings: PaymentSettings) => {
        setPaymentSettings(newSettings);
        alert('Configurações de pagamento salvas com sucesso!');
    };

    const handleShippingSettingsSave = (newSettings: ShippingSettings) => {
        setShippingSettings(newSettings);
        alert('Configurações de frete salvas com sucesso!');
    };

    const handleCompensationSettingsSave = (newSettings: CompensationSettings) => {
        setCompensationSettings(newSettings);
        alert('Plano de compensação salvo com sucesso!');
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

    const handleProductSave = (productToSave: Product) => {
        setProducts(prevProducts => {
            const exists = prevProducts.find(p => p.id === productToSave.id);
            if (exists) {
                return prevProducts.map(p => p.id === productToSave.id ? productToSave : p);
            }
            return [...prevProducts, { ...productToSave, id: String(Date.now()) }];
        });
        handleNavigate('manageProducts');
    };

    const handleProductDelete = (productIds: string[]) => {
        if (window.confirm(`Tem certeza de que deseja excluir ${productIds.length} produto(s)?`)) {
            setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
        }
    };

    const handleInventorySave = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
        alert('Estoque atualizado com sucesso!');
    };

    const handleDeleteProduct = (id: string) => handleProductDelete([id]);

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
        if (window.confirm(`Tem certeza de que deseja excluir ${returnIds.length} devolução(ões)?`)) {
            setReturns(prev => prev.filter(r => !returnIds.includes(r.id)));
        }
    };

    const handleCouponSave = (couponToSave: Coupon) => {
        setCoupons(prevCoupons => {
            const exists = prevCoupons.find(c => c.id === couponToSave.id);
            if (exists) {
                return prevCoupons.map(c => c.id === couponToSave.id ? couponToSave : c);
            }
            return [...prevCoupons, { ...couponToSave, id: `CUP-${Date.now()}` }];
        });
        handleNavigate('managePromotions');
    };

    const handleCouponDelete = (couponId: string) => {
        if (window.confirm(`Tem certeza de que deseja excluir este cupom?`)) {
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
                id: `PIX-${Date.now()}`,
                name: `${pixelToDuplicate.name} (Cópia)`
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
            id: `imported-${productToImport.id}-${Date.now()}`,
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
                alert('Este produto já foi importado para a sua loja.');
                return prevProducts;
            }
            alert(`Produto "${newProduct.name}" importado com sucesso! Ele está disponível como rascunho em "Gerenciar Produtos".`);
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

    const handleCollectionSave = (collectionToSave: Collection) => {
        setCollections(prev => {
            const exists = prev.find(c => c.id === collectionToSave.id);
            if (exists) {
                return prev.map(c => c.id === collectionToSave.id ? collectionToSave : c);
            }
            return [...prev, { ...collectionToSave, id: `col-${Date.now()}` }];
        });
        handleNavigate('manageCollections');
    };

    const handleCollectionDelete = async (collectionId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta coleção?')) return;
        const res: any = await collectionsAPI.delete(collectionId);
        if (res && res.success === false) {
            alert(res.error || 'Falha ao excluir a coleção');
            return;
        }
        setCollections(prev => prev.filter(c => c.id !== collectionId));
    };

    const handleCustomerLogin = (customer: Customer) => {
        setCurrentCustomer(customer);
        handleNavigate('home');
    };

    const handleCustomerRegister = () => {
        handleNavigate('customerLogin');
    };

    const handleReviewUpdateStatus = async (ids: string[], status: Review['status']) => {
        const isApproved = status === 'Aprovada';
        for (const id of ids) {
            await reviewService.updateReviewStatus(id, isApproved);
        }
        setReviews(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    };
    const handleReviewDelete = async (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) {
            await reviewService.deleteReviews(ids);
            setReviews(prev => prev.filter(r => !ids.includes(r.id)));
        }
    };
    const handleReviewSubmit = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
        const saved = await reviewService.submitReview(reviewData);
        if (saved) {
            setReviews(prev => [saved, ...prev]);
        } else {
            // Fallback local se Supabase não responder
            const newReview: Review = {
                ...reviewData,
                id: `rev-${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: 'Pendente'
            };
            setReviews(prev => [newReview, ...prev]);
        }
        alert('Sua avaliação foi enviada para moderação. Obrigado!');
    };

    const handleAnnouncementSave = (data: Announcement) => {
        setAnnouncements(prev => {
            const exists = prev.find(a => a.id === data.id);
            if (exists) return prev.map(a => a.id === data.id ? { ...exists, ...data } : a);
            return [{ ...data, id: `ann-${Date.now()}` }, ...prev];
        });
        handleNavigate('manageAnnouncements');
    };
    const handleAnnouncementsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) setAnnouncements(prev => prev.filter(a => !ids.includes(a.id)));
    };
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const handleTrainingSave = (data: Training) => {
        setTrainings(prev => {
            const exists = prev.find(t => t.id === data.id);
            if (exists) return prev.map(t => t.id === data.id ? { ...exists, ...data } : t);
            return [{ ...data, id: `train-${Date.now()}` }, ...prev];
        });
        handleNavigate('manageTrainings');
    };
    const handleTrainingsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) setTrainings(prev => prev.filter(t => !ids.includes(t.id)));
    };
    const [selectedTrainingModule, setSelectedTrainingModule] = useState<Training | null>(null);

    const handleMarketingAssetSave = (data: MarketingAsset) => {
        setMarketingAssets(prev => {
            const exists = prev.find(a => a.id === data.id);
            if (exists) return prev.map(a => a.id === data.id ? { ...exists, ...data } : a);
            return [{ ...data, id: `asset-${Date.now()}` }, ...prev];
        });
        handleNavigate('manageMarketingAssets');
    };
    const handleMarketingAssetsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) setMarketingAssets(prev => prev.filter(a => !ids.includes(a.id)));
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
            alert('Por favor, faça login para adicionar itens à sua lista de desejos.');
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
                id: `q-${Date.now()}`,
                createdAt: new Date().toISOString(),
                answers: []
            };
            setQuestions(prev => [newQuestion, ...prev]);
        }
        alert('Sua pergunta foi enviada e será respondida em breve.');
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
                id: `a-${Date.now()}`,
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
            id: `CHG-${Date.now()}`,
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
        manageReturns: 'Gerenciar Devoluções',
        returnDetail: 'Detalhes da Devolução',
        manageDropshippingOrders: 'Pedidos Dropshipping',
        dropshippingCatalog: 'Catálogo Dropshipping',
        managePromotions: 'Cupons de Desconto',
        addEditCoupon: 'Adicionar/Editar Cupom',
        manageAffiliates: 'Links de Indicação',
        storeEditor: 'Aparência da Loja',
        storeBannerEditor: 'Banners da Loja',
        virtualOfficeDropshipping: 'Produtos Dropshipping',
        virtualOfficeAffiliateLinks: 'Links de Afiliado',
        virtualOfficePixels: 'Pixels de Marketing',
        virtualOfficeLinkShortener: 'Encurtador de Link',
        addEditMarketingPixel: 'Adicionar/Editar Pixel',
        bannerDashboard: 'Banners do Painel',
        dashboardEditor: 'Editor do Painel',
        managePayments: 'Configurações de Pagamento',
        manageShipping: 'Configurações de Frete',
        compensationPlan: 'Plano de Compensação',
        manageCollections: 'Coleções',
        addEditCollection: 'Adicionar/Editar Coleção',
        userProfileEditor: 'Meu Perfil',
        consultantProfile: 'Perfil do Consultor',
        walletOverview: 'WalletPay - Visão Geral',
        walletReports: 'WalletPay - Extrato e Relatórios',
        walletTransfers: 'WalletPay - Transferências',
        walletCharges: 'WalletPay - Cobranças',
        walletSettings: 'WalletPay - Configurações',
        rsStudio: 'RS Studio',
        orderConfirmation: 'Confirmação de Pedido',
        manageOrderBump: 'Order Bump',
        manageUpsell: 'Upsell Pós-Compra',
        manageAbandonedCarts: 'Carrinhos Abandonados',
        manageReviews: 'Moderar Avaliações',
        manageAnnouncements: 'Gerenciar Comunicados',
        addEditAnnouncement: 'Adicionar/Editar Comunicado',
        manageTrainings: 'Gerenciar Treinamentos',
        addEditTraining: 'Adicionar/Editar Treinamento',
        trainingModuleDetail: 'Detalhes do Treinamento',
        manageMarketingAssets: 'Gerenciar Materiais de Marketing',
        addEditMarketingAsset: 'Adicionar/Editar Material de Marketing',
        customerWishlist: 'Minha Lista de Desejos',
        rsCD: 'Centros de Distribuição (RS-CD)',
        rsControleDrop: 'Market / Drop / Afiliado',
    };

    const renderAdminContent = () => {
        let content;
        switch (view) {
            case 'marketplaceAdmin': content = (
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold">Administração do Marketplace</h2>
                    <p className="text-gray-400">Gerencie registros, lojas e lojistas</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-sm text-gray-400">Registros Pendentes</p>
                            <p className="text-3xl font-bold text-yellow-500 mt-2">--</p>
                            <button className="mt-4 w-full bg-yellow-500 text-black font-bold py-2 rounded" onClick={() => (window.location.hash = '#/marketplace-admin')}>Ver Registros</button>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-sm text-gray-400">Lojas Ativas</p>
                            <p className="text-3xl font-bold text-yellow-500 mt-2">--</p>
                            <button className="mt-4 w-full bg-yellow-500 text-black font-bold py-2 rounded" onClick={() => (window.location.hash = '#/marketplace-admin')}>Gerenciar Lojas</button>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-sm text-gray-400">Lojistas</p>
                            <p className="text-3xl font-bold text-yellow-500 mt-2">--</p>
                            <button className="mt-4 w-full bg-yellow-500 text-black font-bold py-2 rounded" onClick={() => (window.location.hash = '#/marketplace-admin')}>Listar Lojistas</button>
                        </div>
                    </div>
                </div>
            ); break;
            case 'consultantStore': content = <ConsultantStore onNavigate={handleNavigate} banners={dashboardBanners} settings={dashboardSettings} userProfile={userProfile} bonuses={bonuses} networkActivity={initialNetworkActivity} userPoints={4500} monthlyUserPoints={800} compensationSettings={compensationSettings} weeklyBonuses={initialWeeklyBonuses} />; break;
            case 'manageProducts': content = <ManageProducts onNavigate={handleNavigate} products={products} onDelete={(ids) => setProducts(prev => prev.filter(p => !ids.includes(p.id)))} />; break;
            case 'addEditProduct': content = <AddEditProduct product={selectedProduct} collections={collections} onSave={handleProductSave} onCancel={() => handleNavigate('manageProducts')} />; break;
            case 'editDropshippingProduct': content = <AddEditProduct product={selectedProduct} collections={collections} onSave={handleProductSave} onCancel={() => handleNavigate('virtualOfficeDropshipping')} />; break;
            case 'manageInventory': content = <ManageInventory products={products} onSave={handleInventorySave} onNavigate={handleNavigate} />; break;
            case 'manageOrders': content = <ManageOrders orders={orders} onNavigate={handleNavigate} />; break;
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
            case 'compensationPlan': content = <CompensationPlan settings={compensationSettings} onSave={handleCompensationSettingsSave} onNavigate={handleNavigate} />; break;
            case 'manageCollections': content = <ManageCollections collections={collections} products={products} onNavigate={handleNavigate} onCollectionDelete={handleCollectionDelete} />; break;
            case 'addEditCollection': content = <AddEditCollection collection={selectedCollection} products={products} onSave={handleCollectionSave} onCancel={() => handleNavigate('manageCollections')} onNavigate={handleNavigate} />; break;
            case 'userProfileEditor': content = <UserProfileEditor userProfile={userProfile} onSave={handleProfileUpdate} />; break;
            case 'consultantProfile': content = <ConsultantProfileForm />; break;
            case 'walletOverview': content = <WalletOverview onNavigate={handleNavigate} orders={orders} />; break;
            case 'walletReports': content = <WalletSalesReport orders={orders} onNavigate={handleNavigate} />; break;
            case 'walletTransfers': content = <WalletTransfers orders={orders} products={products} onNavigate={handleNavigate} paymentSettings={paymentSettings} />; break;
            case 'walletCharges': content = <WalletCharges charges={charges} products={products} onSave={handleChargeSave} />; break;
            case 'walletSettings': content = <WalletSettingsComponent settings={initialWalletSettings} onSave={() => alert('Settings saved!')} paymentSettings={paymentSettings} onNavigate={handleNavigate} />; break;
            case 'rsStudio': content = <RSStudio products={products} onNavigate={handleNavigate} />; break;
            case 'communication': content = <CommunicationCenter onNavigate={(v: any) => handleNavigate(v)} />; break;
            case 'manageOrderBump': content = <ManageOrderBump settings={storeCustomization.orderBump} products={products} onSave={(s) => handleStoreCustomizationChange({ orderBump: s })} />; break;
            case 'manageUpsell': content = <ManageUpsell settings={storeCustomization.upsell} products={products} onSave={(s) => handleStoreCustomizationChange({ upsell: s })} />; break;
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
            <AdminLayout title={adminViewTitles[view]} currentView={view} onNavigate={handleNavigate} onLogout={async () => { await customersAPI.logout(); setCurrentCustomer(null); setView('home'); }}>
                {content}
            </AdminLayout>
        );
    };

    const renderPublicContent = () => {
        console.log('🔍 renderPublicContent - view:', view, 'products:', products.length);
        switch (view) {
            case 'productDetail':
                return selectedProduct && <ProductDetail
                    product={selectedProduct}
                    collections={collections}
                    onBack={() => handleNavigate('home')}
                    onAddToCart={handleAddToCart}
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
                return selectedCollection && <CollectionView collection={selectedCollection} products={products} onProductClick={(p) => handleNavigate('productDetail', p)} onBack={() => handleNavigate('home')} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />;
            case 'customerAccount':
                return currentCustomer && <CustomerAccount customer={currentCustomer} onNavigate={handleNavigate} />;
            case 'customerWishlist':
                return currentCustomer && <CustomerWishlist wishlist={wishlist} products={products} onNavigate={handleNavigate} onToggleWishlist={handleToggleWishlist} />;
            case 'orderConfirmation':
                return <OrderConfirmation order={lastConfirmedOrder} onContinueShopping={() => handleNavigate('home')} upsellSettings={storeCustomization.upsell} allProducts={products} onAcceptUpsell={handleAcceptUpsell} />;
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
                                products={searchQuery ? filteredProducts : products.filter(p => !p.collectionId || p.collectionId === 'featured')}
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
                                    products={products}
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
                        {/* Se houver busca, mantém Hero e Carousel no topo, mas foca nos resultados */}
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
                                            <div className="text-6xl mb-4">🔍</div>
                                            <h3 className="text-2xl font-display text-[rgb(var(--color-brand-gold))] mb-2">Ops! Nenhum produto encontrado</h3>
                                            <p className="text-[rgb(var(--color-brand-text-dim))] mb-6">Não encontramos resultados para "{searchQuery}". Tente usar palavras-chave diferentes ou verifique a ortografia.</p>
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
                            /* Renderização Dinâmica por Ordem das Seções */
                            [...(storeCustomization.homepageSections || [])]
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map(section => section.enabled && renderHomepageSection(section.id))
                        )}
                        <CustomerChatWidget orders={orders} />
                    </div>
                );
        }
    };

    const isAuthView = ['consultantLogin', 'sellerRegistration', 'customerLogin', 'customerRegister', 'customerForgotPassword'].includes(view);
    const isAdminDashboardView = [
        'consultantStore', 'manageProducts', 'addEditProduct', 'editDropshippingProduct', 'manageInventory',
        'manageOrders', 'orderDetail', 'manageReturns', 'returnDetail', 'manageDropshippingOrders',
        'dropshippingCatalog', 'managePromotions', 'addEditCoupon', 'manageAffiliates', 'storeEditor',
        'storeBannerEditor', 'virtualOfficeDropshipping', 'virtualOfficeAffiliateLinks',
        'virtualOfficePixels', 'virtualOfficeLinkShortener', 'addEditMarketingPixel', 'bannerDashboard',
        'dashboardEditor', 'consultantProfile', 'managePayments', 'manageShipping', 'compensationPlan', 'manageCollections',
        'addEditCollection', 'userProfileEditor', 'walletOverview', 'walletReports', 'walletTransfers',
        'walletCharges', 'walletSettings', 'rsStudio', 'communication', 'manageOrderBump', 'manageUpsell',
        'manageAbandonedCarts', 'manageReviews', 'manageAnnouncements', 'addEditAnnouncement',
        'manageTrainings', 'addEditTraining', 'trainingModuleDetail', 'manageMarketingAssets',
        'addEditMarketingAsset', 'rsCD', 'rsControleDrop'
    ].includes(view);

    if (isAuthView) {
        switch (view) {
            case 'consultantLogin': return <ConsultantLogin onLoginSuccess={() => handleNavigate('consultantStore')} onBackToHome={() => handleNavigate('home')} />;
            case 'sellerRegistration': return <SellerRegistration onRegisterSuccess={() => handleNavigate('home')} onBackToHome={() => handleNavigate('home')} />;
            case 'customerLogin': return <CustomerLogin onLoginSuccess={handleCustomerLogin} onBackToHome={() => handleNavigate('home')} onNavigateToRegister={() => handleNavigate('customerRegister')} onNavigateToForgotPassword={() => handleNavigate('customerForgotPassword')} />;
            case 'customerRegister': return <CustomerRegister onRegister={handleCustomerRegister} onBackToHome={() => handleNavigate('home')} onNavigateToLogin={() => handleNavigate('customerLogin')} />;
            case 'customerForgotPassword': return <CustomerForgotPassword onForgotPasswordRequest={(email) => alert(`Link de recuperação enviado para ${email}`)} onBackToLogin={() => handleNavigate('customerLogin')} />;
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

        return (
            <>
                <style>{storeCustomization.customCss}</style>
                <CheckoutView
                    cartItems={cart}
                    onBack={() => handleNavigate('home')}
                    onFinalizePurchase={handleFinalizePurchase}
                    currentCustomer={currentCustomer}
                    coupons={coupons}
                    orderBumpConfig={storeCustomization.orderBump}
                    allProducts={products}
                    paymentSettings={paymentSettings}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveFromCart}
                />
            </>
        )
    }

    // NOTE: rsCD e rsControleDrop são renderizados dentro do AdminLayout via renderAdminContent()

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
                                <span className="text-white/40 uppercase">Versão:</span> <span className="text-white/70">{lastSyncVersionRef.current}</span>
                                <span className="text-white/40 uppercase">Última:</span> <span className="text-white/70">{lastSyncTimestampRef.current ? new Date(lastSyncTimestampRef.current).toLocaleTimeString() : '--:--:--'}</span>
                                <span className="text-white/40 uppercase">Logo:</span> <span className="text-purple-400 font-bold">{storeCustomization.logoUrl ? (storeCustomization.logoUrl.startsWith('data:') ? 'BASE64' : 'URL') : 'VAZIO'}</span>
                                <span className="text-white/40 uppercase">Tamanho:</span> <span className="text-blue-400">{storeCustomization.logoUrl?.length || 0} bytes</span>
                                <span className="text-white/40 uppercase">Hero Text:</span> <span className="text-white truncate max-w-[80px]" title={storeCustomization.hero?.title}>{storeCustomization.hero?.title || '---'}</span>
                            </div>
                        </div>
                    </div>
                )}
                {userProfile.name && !isLivePreview && (
                    <div className="bg-[rgb(var(--color-brand-gray))] border-b border-[rgb(var(--color-brand-gold))]/[.20] py-1.5 text-center relative z-50">
                        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-[rgb(var(--color-brand-gold))] uppercase tracking-widest opacity-80">Consultor Oficial:</span>
                            <span className="text-xs font-black text-white uppercase tracking-tighter">{userProfile.name}</span>
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
                    onLogout={async () => { await customersAPI.logout(); setCurrentCustomer(null); }}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                />
                <main>
                    {renderPublicContent()}
                </main>
                <Footer logoUrl={storeCustomization.logoUrl} content={storeCustomization.footer} onConsultantClick={() => handleNavigate('consultantLogin')} onNavigate={handleNavigate} currentCustomer={currentCustomer} />
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
        </ErrorBoundary>
    );
};

export default App;
