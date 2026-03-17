import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LayoutDashboard, ShoppingCart, BarChart3, Users, Package, Menu, X, Wallet, Settings as SettingsIcon, Truck, TrendingDown, Building, Store, Target, ChevronsRight, AlertOctagon, Bot, Headphones, Zap, Ship, RefreshCw, Star, Globe, Warehouse, FileText, Image as ImageIcon, TestTube2, Sliders, UserCheck, Tag, Map, Bell, Filter, Repeat, TrendingUp } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProductManager } from './components/ProductManager';
import { OrderManager } from './components/OrderManager';
import { TrafficManager } from './components/TrafficManager';
import { LeadsManager } from './components/LeadsManager';
import { CustomerManager } from './components/CustomerManager';
import { SupplierManager } from './components/SupplierManager';
import { PaymentAnalysis } from './components/PaymentAnalysis';
import { SalesChannelAnalysis } from './components/SalesChannelAnalysis';
import { PostSaleAnalysis } from './components/PostSaleAnalysis';
import { SettingsManager } from './components/SettingsManager';
import { MarketingTools } from './components/MarketingTools';
import { Breadcrumb } from './components/Breadcrumb';
import { analyzePerformance } from './services/geminiService';
import { generateAlerts } from './services/alertService';
import { Order, TrafficSpend, Lead, MonthlySummary, PaymentMethodConfig, Customer, PostSaleEvent, Supplier, ProductSupplier, AppAlert, User, ShippingConfig, TrackingPixel, ShortLink, AuditLog, AuditAction, AuditEntity, AuditChange, MessageTemplate, Ticket, AutomationRule, AutomationLog, RMA, ProductReview, GlobalProduct, Product, DistributionCenter, ProductStockLocation, LandingPage, AovBoostConfig, ProductPageTemplate, Experiment, ExperimentDataPoint, Affiliate, PushNotificationLog, CustomerWithMetrics, Subscription } from './types';
import { useProducts } from './contexts/ProductContext';
import { useCartCheckout } from './contexts/CartCheckoutContext';
import { ToastContainer } from './components/Toast';
import { FunnelMonitor } from './components/FunnelMonitor';
import { RecoveryManager } from './components/RecoveryManager';
import { AICopilot } from './components/AICopilot';
import { SupportManager } from './components/SupportManager';
import { ShippingManager } from './components/ShippingManager';
import { AutomationManager } from './components/AutomationManager';
import { RmaManager } from './components/RmaManager';
import { ReviewManager } from './components/ReviewManager';
import { CatalogManager } from './components/CatalogManager';
import { DistributionCenterManager } from './components/DistributionCenterManager';
import { ProductQualityDashboard } from './components/ProductQualityDashboard';
import { LandingPageManager } from './components/LandingPageManager';
import { AbTestManager } from './components/AbTestManager';
import { PriceOptimizer } from './components/PriceOptimizer';
import { Storefront } from './components/Storefront';
import { CrmManager } from './components/CrmManager';
import { AffiliateManager } from './components/AffiliateManager';
import { TrackingPage } from './components/TrackingPage';
import { PushManager } from './components/PushManager';
import { notificationService } from './services/notificationService';
import { FunnelAnalysis } from './components/FunnelAnalysis';
import { ProductReports } from './components/ProductReports';
import { SubscriptionManager } from './components/SubscriptionManager';
import { marketingTrackingService } from './marketingTrackingService';
import {
  activateCatalogProductForCd,
  appendRealExperimentData,
  createRealCatalogProduct,
  createRealSupplier,
  createRealCustomer,
  createRealOrder,
  deleteRealCatalogProduct,
  deleteRealSupplier,
  deleteRealCustomer,
  deleteRealOrder,
  loadRealCatalogProducts,
  loadRealCustomers,
  loadRealDistributionCenters,
  loadRealExperimentData,
  loadRealExperiments,
  loadRealOrders,
  loadRealProductPageTemplates,
  loadRealSuppliers,
  saveRealCatalogProducts,
  saveRealExperiments,
  saveRealProductPageTemplates,
  updateRealCatalogProduct,
  updateRealSupplier,
  updateRealCustomer,
  updateRealOrder,
} from './services/realDataLoader';

const DEFAULT_BRANDING_ASSET = 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png';

const normalizeAssetUrl = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  if (!normalized || ['null', 'undefined', '[object Object]'].includes(normalized)) {
    return '';
  }
  return normalized;
};

// --- MOCK DATA ---
const INITIAL_GLOBAL_PRODUCTS: GlobalProduct[] = [];
const INITIAL_DISTRIBUTION_CENTERS: DistributionCenter[] = [];
const INITIAL_STOCK_LOCATIONS: ProductStockLocation[] = [];
const INITIAL_PAYMENT_CONFIGS: PaymentMethodConfig[] = [];
const INITIAL_SHIPPING_CONFIGS: ShippingConfig[] = [];
const INITIAL_SUPPLIERS: Supplier[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_ORDERS: Order[] = [];
const INITIAL_TRAFFIC: TrafficSpend[] = [];
const INITIAL_LEADS: Lead[] = [];
const INITIAL_SHORT_LINKS: ShortLink[] = [];
const INITIAL_TICKETS: Ticket[] = [];
const INITIAL_AUTOMATION_RULES: AutomationRule[] = [];
const INITIAL_RMAS: RMA[] = [];
const INITIAL_REVIEWS: ProductReview[] = [];
const INITIAL_LANDING_PAGES: LandingPage[] = [];
const INITIAL_EXPERIMENTS: Experiment[] = [];
const INITIAL_EXPERIMENT_DATA: ExperimentDataPoint[] = [];
const INITIAL_AFFILIATES: Affiliate[] = [];
const INITIAL_PUSH_LOGS: PushNotificationLog[] = [];
const INITIAL_SUBSCRIPTIONS: Subscription[] = [];


const BREADCRUMB_PATHS: { [key: string]: { label: string }[] } = {
  dashboard: [{ label: 'Dashboard' }],
  orders: [{ label: 'Pedidos' }],
  customers: [{ label: 'Clientes' }],
  'crm-clientes': [{ label: 'Clientes' }, { label: 'CRM' }],
  'subscriptions': [{ label: 'Clientes' }, { label: 'Assinaturas' }],
  products: [{ label: 'Produtos' }],
  'product-reports': [{ label: 'Produtos' }, { label: 'Relatórios' }],
  catalog: [{ label: 'Produtos' }, { label: 'Catálogo RS' }],
  suppliers: [{ label: 'Fornecedores' }],
  'funnel-monitor': [{ label: 'Operação' }, { label: 'Monitor do Funil' }],
  recovery: [{ label: 'Operação' }, { label: 'Recuperação de Vendas' }],
  support: [{ label: 'Operação' }, { label: 'Atendimento / Tickets' }],
  rma: [{ label: 'Operação' }, { label: 'Trocas & Devoluções' }],
  shipping: [{ label: 'Operação' }, { label: 'Gerenciador de Envios' }],
  "distribution-centers": [{ label: 'Operação' }, { label: 'Centros de Distribuição' }],
  automations: [{ label: 'Operação' }, { label: 'Automações' }],
  tracking: [{ label: 'Operação' }, { label: 'Página de Rastreio' }],
  reviews: [{ label: 'Marketing' }, { label: 'Avaliações de Produtos' }],
  "landing-pages": [{ label: 'Marketing' }, { label: 'Landing Pages' }],
  'ab-tests': [{ label: 'Marketing' }, { label: 'Testes A/B' }],
  'price-optimizer': [{ label: 'Marketing' }, { label: 'Otimizador de Preços' }],
  affiliates: [{ label: 'Marketing' }, { label: 'Afiliados' }],
  'push-notifications': [{ label: 'Marketing' }, { label: 'Notificações Push' }],
  channels: [{ label: 'Análises' }, { label: 'Análise Atribuição' }],
  'funnel-analysis': [{ label: 'Análises' }, { label: 'Funil de Vendas' }],
  payments: [{ label: 'Análises' }, { label: 'Análise Pagto' }],
  postsale: [{ label: 'Análises' }, { label: 'Pós-Venda' }],
  "product-quality": [{ label: 'Análises' }, { label: 'Qualidade de Produtos' }],
  traffic: [{ label: 'Marketing' }, { label: 'Tráfego Pago' }],
  leads: [{ label: 'Marketing' }, { label: 'Leads' }],
  'marketing-tools': [{ label: 'Marketing' }, { label: 'Pixel & Links' }],
  settings: [{ label: 'Sistema' }, { label: 'Configurações' }],
  ai: [{ label: 'Inteligência' }, { label: 'RS.AI Copiloto' }],
  storefront: [{ label: 'Vitrine (Preview)' }],
};

interface AppProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  auditLogs: AuditLog[];
  logAction: (action: AuditAction, entity: AuditEntity, entityId: string, details: string, changes?: AuditChange[]) => void;
  whatsAppTemplates: MessageTemplate[];
  setWhatsAppTemplates: (templates: MessageTemplate[]) => void;
}

const App: React.FC<AppProps> = ({
  currentUser, setCurrentUser, users, auditLogs, logAction,
  whatsAppTemplates, setWhatsAppTemplates
}) => {
  const { products, productSuppliers, addProduct, updateProduct, updateProductStock, stockMovements, refreshProducts } = useProducts();
  const { carts, checkouts, abandonmentLogs, updateAbandonmentLog } = useCartCheckout();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [rmas, setRmas] = useState<RMA[]>(INITIAL_RMAS);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [globalProducts, setGlobalProducts] = useState<GlobalProduct[]>(INITIAL_GLOBAL_PRODUCTS);
  const [distributionCenters, setDistributionCenters] = useState<DistributionCenter[]>(INITIAL_DISTRIBUTION_CENTERS);
  const [stockLocations, setStockLocations] = useState<ProductStockLocation[]>(INITIAL_STOCK_LOCATIONS);
  const [landingPages, setLandingPages] = useState<LandingPage[]>(INITIAL_LANDING_PAGES);
  const [aovBoostConfig, setAovBoostConfig] = useState<AovBoostConfig>({ freeShippingThreshold: 250 });
  const [productPageTemplates, setProductPageTemplates] = useState<ProductPageTemplate[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>(INITIAL_EXPERIMENTS);
  const [experimentData, setExperimentData] = useState<ExperimentDataPoint[]>(INITIAL_EXPERIMENT_DATA);
  const [affiliates, setAffiliates] = useState<Affiliate[]>(INITIAL_AFFILIATES);
  const [pushLogs, setPushLogs] = useState<PushNotificationLog[]>(INITIAL_PUSH_LOGS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);

  // Unchanged States
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [traffic, setTraffic] = useState<TrafficSpend[]>(INITIAL_TRAFFIC);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentMethodConfig[]>(INITIAL_PAYMENT_CONFIGS);
  const [shippingConfigs, setShippingConfigs] = useState<ShippingConfig[]>(INITIAL_SHIPPING_CONFIGS);
  const [trackingPixels, setTrackingPixels] = useState<TrackingPixel[]>([]);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>(INITIAL_SHORT_LINKS);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(INITIAL_AUTOMATION_RULES);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [deepLinkParams, setDeepLinkParams] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [selectedLogistaId, setSelectedLogistaId] = useState<string>('all');
  const [branding, setBranding] = useState<any>(null);
  const [isOperationalDataLoading, setIsOperationalDataLoading] = useState(false);

  const visibleProducts = useMemo(() => products, [products]);
  const visibleOrders = useMemo(() => orders, [orders]);

  const monthlySummary = useMemo(() => ({ grossRevenue: 0, discounts: 0, refundsAndChargebacks: 0, netSales: 0, productCost: 0, shippingCost: 0, shippingRevenue: 0, shippingProfit: 0, taxCost: 0, otherExpenses: 0, grossProfit: 0, adSpend: 0, netProfit: 0, globalRoi: 0, profitMargin: 0, avgTicket: 0, leadConversionRate: 0, salesCount: 0, ordersCount: 0, leadsCount: 0, leadsFromTraffic: 0 }), []);

  // --- REAL TRACKING CONFIGURATION ---
  useEffect(() => {
    // Configure the tracking service whenever pixels change
    marketingTrackingService.configure(trackingPixels);
  }, [trackingPixels]);

  // Fetch Branding
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('http://localhost:4000/v1/admin/settings/general');
        const json = await res.json();
        const brandingData = json?.data?.data || json?.data;
        if (json.success && brandingData) {
          setBranding(brandingData);
        }
      } catch (e) {
        console.error('Error fetching branding:', e);
      }
    };
    fetchBranding();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'rs-branding-update') {
        fetchBranding();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const faviconUrl =
      normalizeAssetUrl(branding?.favicon) ||
      normalizeAssetUrl(branding?.logo) ||
      normalizeAssetUrl(branding?.avatar) ||
      DEFAULT_BRANDING_ASSET;
    const cacheBustedUrl = `${faviconUrl}${faviconUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

    const iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]') || document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = 'image/png';
    iconLink.href = cacheBustedUrl;
    if (!iconLink.parentNode) {
      document.head.appendChild(iconLink);
    }

    const shortcutIconLink =
      document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]') || document.createElement('link');
    shortcutIconLink.rel = 'shortcut icon';
    shortcutIconLink.type = 'image/png';
    shortcutIconLink.href = cacheBustedUrl;
    if (!shortcutIconLink.parentNode) {
      document.head.appendChild(shortcutIconLink);
    }

    const appleTouchLink =
      document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]') || document.createElement('link');
    appleTouchLink.rel = 'apple-touch-icon';
    appleTouchLink.href = cacheBustedUrl;
    if (!appleTouchLink.parentNode) {
      document.head.appendChild(appleTouchLink);
    }
  }, [branding]);

  useEffect(() => {
    let isMounted = true;

    const hydrateOperationalData = async () => {
      if (!currentUser?.id) return;

      setIsOperationalDataLoading(true);
      try {
        const [realOrders, realCustomers, realCenters, realSuppliers, realCatalog, realTemplates, realExperiments, realExperimentData] = await Promise.all([
          loadRealOrders(currentUser.id),
          loadRealCustomers(currentUser.id),
          loadRealDistributionCenters(),
          loadRealSuppliers(currentUser.id),
          loadRealCatalogProducts(),
          loadRealProductPageTemplates(currentUser.id),
          loadRealExperiments(currentUser.id),
          loadRealExperimentData(currentUser.id),
        ]);

        if (!isMounted) return;
        setOrders(realOrders);
        setCustomers(realCustomers);
        setDistributionCenters(realCenters);
        setSuppliers(realSuppliers);
        setGlobalProducts(realCatalog);
        setProductPageTemplates(realTemplates);
        setExperiments(realExperiments);
        setExperimentData(realExperimentData);
      } catch (error) {
        console.error('[RS Drop] Erro ao carregar dados operacionais reais:', error);
        if (!isMounted) return;
        setOrders([]);
        setCustomers([]);
        setDistributionCenters([]);
        setSuppliers([]);
        setGlobalProducts([]);
        setProductPageTemplates([]);
        setExperiments([]);
        setExperimentData([]);
      } finally {
        if (isMounted) {
          setIsOperationalDataLoading(false);
        }
      }
    };

    void hydrateOperationalData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // --- INTERNAL NOTIFICATION TRIGGERS ---
  const prevOrdersCount = useRef(orders.length);
  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0];
      notificationService.sendNotification(
        '🚀 Novo Pedido!',
        `Venda de R$ ${newOrder.itemsTotal.toFixed(2)} para ${newOrder.customerName}.`
      );
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  const prevTicketsCount = useRef(tickets.length);
  useEffect(() => {
    if (tickets.length > prevTicketsCount.current) {
      const newTicket = tickets[0];
      notificationService.sendNotification(
        '🎫 Novo Ticket de Suporte',
        `Assunto: "${newTicket.subject}" de ${newTicket.customerName}.`
      );
    }
    prevTicketsCount.current = tickets.length;
  }, [tickets]);

  const handleUpdateReview = (review: ProductReview) => { };
  const handleUpdateStockLocations = (productId: string, locations: ProductStockLocation[]) => { };

  const handleNavigate = (tab: string, params?: any) => {
    setDeepLinkParams(params || null);
    setActiveTab(tab);
  };

  const refreshOrderData = async () => {
    if (!currentUser?.id) return;

    const [realOrders, realCustomers] = await Promise.all([
      loadRealOrders(currentUser.id),
      loadRealCustomers(currentUser.id),
    ]);

    setOrders(realOrders);
    setCustomers(realCustomers);
  };

  const refreshSupplierData = async () => {
    if (!currentUser?.id) return;
    const realSuppliers = await loadRealSuppliers(currentUser.id);
    setSuppliers(realSuppliers);
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    const selectedCustomer = customers.find((customer) => customer.id === updatedOrder.customerId);
    const savedOrder = await updateRealOrder(
      currentUser.id,
      { ...updatedOrder, userId: currentUser.id },
      selectedCustomer
    );
    await refreshOrderData();
    logAction('UPDATE', 'Order', savedOrder.id, `Pedido #${savedOrder.id.slice(0, 8)} atualizado.`);
  };

  const handleAddOrder = async (order: Omit<Order, 'id'>) => {
    const selectedCustomer = customers.find((customer) => customer.id === order.customerId);
    const savedOrder = await createRealOrder(
      currentUser.id,
      { ...order, userId: currentUser.id },
      selectedCustomer
    );
    await refreshOrderData();
    savedOrder.items.forEach((item) => {
      updateProductStock(item.productId, -item.quantity, 'VENDA', savedOrder.id);
    });
    logAction('CREATE', 'Order', savedOrder.id, `Pedido #${savedOrder.id.slice(0, 8)} criado.`);
  };
  const handleDeleteOrder = async (id: string) => {
    await deleteRealOrder(currentUser.id, id);
    await refreshOrderData();
    logAction('DELETE', 'Order', id, `Pedido #${id.slice(0, 8)} excluído.`);
  };
  const handleAddCustomer = async (customer: Omit<Customer, 'id'>) => {
    const savedCustomer = await createRealCustomer(currentUser.id, {
      ...customer,
      userId: currentUser.id,
    });
    const realCustomers = await loadRealCustomers(currentUser.id);
    setCustomers(realCustomers);
    logAction('CREATE', 'Customer', savedCustomer.id, `Cliente ${savedCustomer.name} criado.`);
    return savedCustomer;
  };
  const handleUpdateCustomer = async (customer: Customer) => {
    const savedCustomer = await updateRealCustomer(currentUser.id, {
      ...customer,
      userId: customer.userId || currentUser.id,
    });
    const realCustomers = await loadRealCustomers(currentUser.id);
    setCustomers(realCustomers);
    logAction('UPDATE', 'Customer', savedCustomer.id, `Cliente ${savedCustomer.name} atualizado.`);
    return savedCustomer;
  };
  const handleDeleteCustomer = async (id: string) => {
    await deleteRealCustomer(currentUser.id, id);
    const realCustomers = await loadRealCustomers(currentUser.id);
    setCustomers(realCustomers);
    logAction('DELETE', 'Customer', id, `Cliente ${id.slice(0, 8)} excluÃ­do.`);
  };
  const handleAddSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const savedSupplier = await createRealSupplier(currentUser.id, {
      ...supplier,
      userId: supplier.userId || currentUser.id,
    });
    await refreshSupplierData();
    logAction('CREATE', 'Supplier', savedSupplier.id, `Fornecedor ${savedSupplier.name} criado.`);
  };
  const handleUpdateSupplier = async (supplier: Supplier) => {
    const savedSupplier = await updateRealSupplier(currentUser.id, supplier);
    await refreshSupplierData();
    logAction('UPDATE', 'Supplier', savedSupplier.id, `Fornecedor ${savedSupplier.name} atualizado.`);
  };
  const handleDeleteSupplier = async (id: string) => {
    await deleteRealSupplier(currentUser.id, id);
    await refreshSupplierData();
    logAction('DELETE', 'Supplier', id, `Fornecedor ${id.slice(0, 8)} excluído.`);
  };
  const handleActivateCatalogProduct = async (globalProduct: GlobalProduct) => {
    const saved = await activateCatalogProductForCd(currentUser.id, globalProduct);
    await refreshProducts();
    logAction('CREATE', 'Product', saved.product.id, `Produto ${saved.product.name} ativado a partir do catálogo RS.`);
  };
  const handleUpdateGlobalProducts = (nextProducts: GlobalProduct[]) => {
    setGlobalProducts(nextProducts);
    void saveRealCatalogProducts(nextProducts)
      .then(setGlobalProducts)
      .catch((error) => {
        console.error('[RS Drop] Erro ao salvar catálogo global:', error);
      });
  };
  const handleCreateGlobalProduct = async (product: Omit<GlobalProduct, 'id'>) => {
    const savedProduct = await createRealCatalogProduct(product);
    setGlobalProducts((prev) => [...prev, savedProduct].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    return savedProduct;
  };
  const handlePatchGlobalProduct = async (product: GlobalProduct) => {
    const savedProduct = await updateRealCatalogProduct(product);
    setGlobalProducts((prev) => prev.map((item) => (item.id === savedProduct.id ? savedProduct : item)));
    return savedProduct;
  };
  const handleDeleteGlobalProduct = async (productId: string) => {
    await deleteRealCatalogProduct(productId);
    setGlobalProducts((prev) => prev.filter((item) => item.id !== productId));
  };
  const handleUpdateProductPageTemplates = (templates: ProductPageTemplate[]) => {
    setProductPageTemplates(templates);
    void saveRealProductPageTemplates(currentUser.id, templates)
      .then(setProductPageTemplates)
      .catch((error) => {
        console.error('[RS Drop] Erro ao salvar templates da página do produto:', error);
      });
  };
  const handleUpdateExperiments = (nextExperiments: Experiment[]) => {
    setExperiments(nextExperiments);
    void saveRealExperiments(currentUser.id, nextExperiments)
      .then(setExperiments)
      .catch((error) => {
        console.error('[RS Drop] Erro ao salvar testes A/B:', error);
      });
  };
  const handleAddExperimentData = (dataPoints: ExperimentDataPoint[]) => {
    setExperimentData(prev => [...prev, ...dataPoints]);
    void appendRealExperimentData(currentUser.id, dataPoints).then(setExperimentData).catch((error) => {
      console.error('[RS Drop] Erro ao salvar dados de experimento:', error);
    });
  };
  const handleAddSubscription = (sub: Omit<Subscription, 'id' | 'userId'>) => {
    setSubscriptions(prev => [...prev, { ...sub, id: crypto.randomUUID(), userId: currentUser.id }]);
  };
  const handleUpdateSubscription = (sub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === sub.id ? sub : s));
  };
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const customerMetrics: CustomerWithMetrics[] = useMemo(() => [], [customers, orders]);
  const headerAvatar =
    normalizeAssetUrl(currentUser.avatar) ||
    normalizeAssetUrl(branding?.avatar) ||
    normalizeAssetUrl(branding?.logo) ||
    DEFAULT_BRANDING_ASSET;


  return (
    <div className="flex h-screen bg-rs-black text-slate-200 font-sans overflow-hidden">
      <ToastContainer />
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-rs-card border-r border-rs-goldDim/20 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        {/* Sidebar Brand Section - Compacta & Alinhada ao Header (80px) */}
        <div className="h-20 border-b border-rs-goldDim/10 flex items-center justify-center bg-black/40 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center px-4">
            {branding?.logo ? (
              <img src={branding.logo} alt="Logo" className="w-full h-12 object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.15)]" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-rs-gold/10 flex items-center justify-center text-rs-gold">
                <Package size={24} />
              </div>
            )}
          </div>
        </div>



        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          <SidebarItem icon={<LayoutDashboard size={18} />} label={<div className="flex items-center gap-2"><span className="text-[9px] font-black text-rs-gold/60 border-r border-white/10 pr-2">RS DROP</span> <span className="text-xs">Dashboard</span></div>} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Bot size={18} />} label={<span className="text-xs">RS.AI Copiloto</span>} isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />

          <div className="pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Operação</div>
          <SidebarItem icon={<ShoppingCart size={18} />} label={<span className="text-xs">Pedidos</span>} isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarItem icon={<Package size={18} />} label={<span className="text-xs">Meus Produtos</span>} isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarItem icon={<Globe size={18} />} label={<span className="text-xs">Catálogo RS</span>} isActive={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} />
          <SidebarItem icon={<Users size={18} />} label={<span className="text-xs">Clientes</span>} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <SidebarItem icon={<UserCheck size={18} />} label={<span className="text-xs">CRM Clientes</span>} isActive={activeTab === 'crm-clientes'} onClick={() => setActiveTab('crm-clientes')} />
          <SidebarItem icon={<Repeat size={18} />} label={<span className="text-xs">Assinaturas</span>} isActive={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} />
          <SidebarItem icon={<Building size={18} />} label={<span className="text-xs">Fornecedores</span>} isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
          <SidebarItem icon={<Ship size={18} />} label={<span className="text-xs">Envios</span>} isActive={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} />
          {currentUser.role === 'Admin' && <SidebarItem icon={<Warehouse size={18} />} label={<span className="text-xs">CDs</span>} isActive={activeTab === 'distribution-centers'} onClick={() => setActiveTab('distribution-centers')} />}
          <SidebarItem icon={<Headphones size={18} />} label={<span className="text-xs">Atendimento</span>} isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
          <SidebarItem icon={<RefreshCw size={18} />} label={<span className="text-xs">Trocas & Devoluções</span>} isActive={activeTab === 'rma'} onClick={() => setActiveTab('rma')} />
          <SidebarItem icon={<Zap size={18} />} label={<span className="text-xs">Automações</span>} isActive={activeTab === 'automations'} onClick={() => setActiveTab('automations')} />
          <SidebarItem icon={<AlertOctagon size={18} />} label={<span className="text-xs">Recuperação</span>} isActive={activeTab === 'recovery'} onClick={() => setActiveTab('recovery')} />
          <SidebarItem icon={<ChevronsRight size={18} />} label={<span className="text-xs">Monitor do Funil</span>} isActive={activeTab === 'funnel-monitor'} onClick={() => setActiveTab('funnel-monitor')} />
          <SidebarItem icon={<Map size={18} />} label={<span className="text-xs">Página de Rastreio</span>} isActive={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} />

          <div className="pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Marketing & Análise</div>
          <SidebarItem icon={<Tag size={18} />} label={<span className="text-xs">Afiliados</span>} isActive={activeTab === 'affiliates'} onClick={() => setActiveTab('affiliates')} />
          <SidebarItem icon={<ImageIcon size={18} />} label={<span className="text-xs">Landing Pages</span>} isActive={activeTab === 'landing-pages'} onClick={() => setActiveTab('landing-pages')} />
          <SidebarItem icon={<TestTube2 size={18} />} label={<span className="text-xs">Testes A/B</span>} isActive={activeTab === 'ab-tests'} onClick={() => setActiveTab('ab-tests')} />
          <SidebarItem icon={<Sliders size={18} />} label={<span className="text-xs">Otimizador de Preços</span>} isActive={activeTab === 'price-optimizer'} onClick={() => setActiveTab('price-optimizer')} />
          <SidebarItem icon={<Bell size={18} />} label={<span className="text-xs">Notificações Push</span>} isActive={activeTab === 'push-notifications'} onClick={() => setActiveTab('push-notifications')} />
          <SidebarItem icon={<Star size={18} />} label={<span className="text-xs">Avaliações</span>} isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
          <SidebarItem icon={<BarChart3 size={18} />} label={<span className="text-xs">Relatórios Produtos</span>} isActive={activeTab === 'product-reports'} onClick={() => setActiveTab('product-reports')} />
          <SidebarItem icon={<Filter size={18} />} label={<span className="text-xs">Análise de Funil</span>} isActive={activeTab === 'funnel-analysis'} onClick={() => setActiveTab('funnel-analysis')} />
          <SidebarItem icon={<TrendingUp size={18} />} label={<span className="text-xs">Qualidade Produtos</span>} isActive={activeTab === 'product-quality'} onClick={() => setActiveTab('product-quality')} />
          <SidebarItem icon={<BarChart3 size={18} />} label={<span className="text-xs">Tráfego Pago</span>} isActive={activeTab === 'traffic'} onClick={() => setActiveTab('traffic')} />
          <SidebarItem icon={<Users size={18} />} label={<span className="text-xs">Leads</span>} isActive={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <SidebarItem icon={<Target size={18} />} label={<span className="text-xs">Ferramentas Mkt</span>} isActive={activeTab === 'marketing-tools'} onClick={() => setActiveTab('marketing-tools')} />
          <SidebarItem icon={<Store size={18} />} label={<span className="text-xs">Canais & UTM</span>} isActive={activeTab === 'channels'} onClick={() => setActiveTab('channels')} />
          <SidebarItem icon={<Wallet size={18} />} label={<span className="text-xs">Pagamentos</span>} isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
          <SidebarItem icon={<TrendingDown size={18} />} label={<span className="text-xs">Pós-Venda</span>} isActive={activeTab === 'postsale'} onClick={() => setActiveTab('postsale')} />

          <div className="pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2 italic opacity-60">Sistema</div>
          <div className="grid grid-cols-1 gap-0.5 scale-90 origin-left">
            <SidebarItem icon={<SettingsIcon size={16} />} label={<span className="text-xs">Configurações</span>} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <SidebarItem icon={<Store size={16} />} label={<span className="text-xs">Vitrine (Preview)</span>} isActive={activeTab === 'storefront'} onClick={() => setActiveTab('storefront')} />
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-rs-black to-rs-dark">
        {/* Simplified Top Header */}
        <header className="h-20 bg-rs-card border-b border-rs-goldDim/10 px-8 flex justify-between items-center z-40 relative">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-rs-gold"><Menu size={24} /></button>
            <Breadcrumb path={BREADCRUMB_PATHS[activeTab] || [{ label: 'Dashboard' }]} />
          </div>


          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-white leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-rs-gold font-bold uppercase tracking-widest mt-1 opacity-80">{currentUser.role}</span>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rs-gold to-rs-goldDim rounded-full blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 rounded-full border-2 border-rs-gold/50 flex items-center justify-center bg-rs-black text-rs-gold font-bold text-xl cursor-all-scroll shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                {headerAvatar ? (
                  <img
                    src={headerAvatar}
                    alt="Avatar"
                    className="w-full h-full object-contain bg-black p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_BRANDING_ASSET;
                    }}
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="md:hidden mb-6">
            <Breadcrumb path={BREADCRUMB_PATHS[activeTab] || [{ label: 'Dashboard' }]} />
          </div>


          {activeTab === 'dashboard' && <Dashboard onAnalyze={() => { }} onAlertClick={() => { }} alerts={alerts} summary={monthlySummary} orders={visibleOrders} trafficData={traffic} products={visibleProducts} isAnalyzing={isOperationalDataLoading} aiAnalysis={null} currentMonth={currentMonth} onMonthChange={setCurrentMonth} currentUser={currentUser} users={users} selectedLogistaId={selectedLogistaId} onLogistaChange={setSelectedLogistaId} setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <ProductManager suppliers={suppliers} currentUser={currentUser} users={users} reviews={reviews} onUpdateReview={() => { }} onAddSupplier={handleAddSupplier} onViewOrders={(productName) => handleNavigate('orders', { search: productName })} distributionCenters={distributionCenters} stockLocations={stockLocations} onUpdateStockLocations={() => { }} productPageTemplates={productPageTemplates} onUpdateProductPageTemplates={handleUpdateProductPageTemplates} experiments={experiments} targetProductId={deepLinkParams?.id} onClearTargetProduct={() => setDeepLinkParams(null)} />}
          {activeTab === 'orders' && <OrderManager orders={orders} products={products} customers={customers} suppliers={suppliers} productSuppliers={productSuppliers} paymentConfigs={paymentConfigs} onAdd={handleAddOrder} onUpdate={handleUpdateOrder} onDelete={handleDeleteOrder} onCreateCustomer={handleAddCustomer} currentUser={currentUser} users={users} shippingConfigs={shippingConfigs} automationLogs={automationLogs} rmas={rmas} onAddRma={() => { }} distributionCenters={distributionCenters} stockLocations={stockLocations} affiliates={affiliates} initialSearch={deepLinkParams?.search} />}
          {activeTab === 'customers' && <CustomerManager customers={customers} orders={orders} leads={leads} tickets={tickets} rmas={rmas} onAdd={handleAddCustomer} onUpdate={handleUpdateCustomer} onDelete={handleDeleteCustomer} currentUser={currentUser} users={users} />}
          {activeTab === 'crm-clientes' && <CrmManager customers={customers} orders={orders} />}
          {activeTab === 'subscriptions' && <SubscriptionManager subscriptions={subscriptions} customers={customers} products={products} onAdd={handleAddSubscription} onUpdate={handleUpdateSubscription} onDelete={handleDeleteSubscription} />}
          {activeTab === 'suppliers' && <SupplierManager suppliers={suppliers} orders={orders} onAdd={handleAddSupplier} onUpdate={handleUpdateSupplier} onDelete={handleDeleteSupplier} currentUser={currentUser} users={users} />}
          {activeTab === 'traffic' && <TrafficManager trafficData={traffic} leadsData={leads} onAdd={() => { }} onUpdate={() => { }} onDelete={() => { }} currentUser={currentUser} users={users} onImport={() => { }} />}
          {activeTab === 'leads' && <LeadsManager leads={leads} onAdd={() => { }} onUpdate={() => { }} onDelete={() => { }} currentUser={currentUser} users={users} />}
          {activeTab === 'marketing-tools' && <MarketingTools pixels={trackingPixels} onAddPixel={(p) => setTrackingPixels(prev => [...prev, { ...p, id: crypto.randomUUID(), userId: currentUser.id, createdAt: new Date().toISOString() }])} onUpdatePixel={(p) => setTrackingPixels(prev => prev.map(pix => pix.id === p.id ? p : pix))} onDeletePixel={(id) => setTrackingPixels(prev => prev.filter(p => p.id !== id))} links={shortLinks} onAddLink={() => { }} onUpdateLink={() => { }} onDeleteLink={() => { }} currentUser={currentUser} users={users} orders={orders} leads={leads} onRegisterClick={() => { }} products={products} affiliates={affiliates} />}
          {activeTab === 'payments' && <PaymentAnalysis orders={orders} currentMonth={currentMonth} />}
          {activeTab === 'channels' && <SalesChannelAnalysis orders={orders} currentMonth={currentMonth} />}
          {activeTab === 'postsale' && <PostSaleAnalysis orders={orders} products={products} currentMonth={currentMonth} />}
          {activeTab === 'settings' && <SettingsManager paymentConfigs={paymentConfigs} onAddPaymentConfig={() => { }} onUpdatePaymentConfig={() => { }} onDeletePaymentConfig={() => { }} shippingConfigs={shippingConfigs} onAddShippingConfig={() => { }} onUpdateShippingConfig={() => { }} onDeleteShippingConfig={() => { }} auditLogs={auditLogs} whatsAppTemplates={whatsAppTemplates} onWhatsAppTemplatesChange={setWhatsAppTemplates} aovBoostConfig={aovBoostConfig} onAovBoostConfigChange={setAovBoostConfig} />}
          {activeTab === 'funnel-monitor' && <FunnelMonitor currentUser={currentUser} users={users} products={products} aovBoostConfig={aovBoostConfig} />}
          {activeTab === 'recovery' && <RecoveryManager currentUser={currentUser} users={users} whatsAppTemplates={whatsAppTemplates} />}
          {activeTab === 'support' && <SupportManager tickets={tickets} orders={orders} customers={customers} onAdd={() => { }} onUpdate={() => { }} onDelete={() => { }} currentUser={currentUser} users={users} />}
          {activeTab === 'shipping' && <ShippingManager orders={orders} onUpdateOrder={handleUpdateOrder} currentUser={currentUser} users={users} />}
          {activeTab === 'automations' && <AutomationManager rules={automationRules} templates={whatsAppTemplates} onAdd={() => { }} onUpdate={() => { }} onDelete={() => { }} />}
          {activeTab === 'rma' && <RmaManager rmas={rmas} orders={orders} customers={customers} onAdd={() => { }} onUpdate={() => { }} onDelete={() => { }} currentUser={currentUser} users={users} />}
          {activeTab === 'reviews' && <ReviewManager reviews={reviews} onUpdate={handleUpdateReview} />}
          {activeTab === 'catalog' && (
            <CatalogManager
              currentUser={currentUser}
              globalProducts={globalProducts}
              products={products}
              onActivate={(globalProduct) => {
                void handleActivateCatalogProduct(globalProduct);
              }}
              onUpdateGlobalProduct={handleUpdateGlobalProducts}
              onCreateGlobalProduct={handleCreateGlobalProduct}
              onPatchGlobalProduct={handlePatchGlobalProduct}
              onDeleteGlobalProduct={handleDeleteGlobalProduct}
            />
          )}
          {activeTab === 'distribution-centers' && <DistributionCenterManager centers={distributionCenters} onAdd={() => { }} onUpdate={() => { }} onDelete={() => { }} />}
          {activeTab === 'product-quality' && <ProductQualityDashboard orders={orders} rmas={rmas} tickets={tickets} abandonmentLogs={abandonmentLogs} />}
          {activeTab === 'landing-pages' && <LandingPageManager landingPages={landingPages} products={products} onUpdatePages={setLandingPages} />}
          {activeTab === 'ab-tests' && <AbTestManager experiments={experiments} experimentData={experimentData} products={products} productPageTemplates={productPageTemplates} onUpdateExperiments={handleUpdateExperiments} onAddExperimentData={handleAddExperimentData} onUpdateProduct={(product) => { void updateProduct(product); }} currentUser={currentUser} />}
          {activeTab === 'price-optimizer' && <PriceOptimizer products={products} orders={orders} abandonmentLogs={abandonmentLogs} productSuppliers={productSuppliers} onUpdateProduct={(product) => { void updateProduct(product); }} />}
          {activeTab === 'storefront' && <Storefront products={products} orders={orders} customers={customers} />}
          {activeTab === 'crm-clientes' && <CrmManager customers={customers} orders={orders} />}
          {activeTab === 'affiliates' && <AffiliateManager affiliates={affiliates} orders={orders} onUpdateAffiliates={setAffiliates} onUpdateOrders={setOrders} currentUser={currentUser} />}
          {activeTab === 'tracking' && <TrackingPage orders={orders} products={products} onNavigate={handleNavigate} />}
          {activeTab === 'funnel-analysis' && <FunnelAnalysis checkouts={checkouts} />}
          {activeTab === 'product-reports' && <ProductReports products={products} orders={orders} productSuppliers={productSuppliers} />}
          {activeTab === 'push-notifications' && <PushManager logs={pushLogs} onAddLog={(log) => setPushLogs(prev => [log, ...prev])} customerMetrics={customerMetrics} />}

          {activeTab === 'ai' && <AICopilot currentUser={currentUser} monthlySummary={monthlySummary} orders={orders} products={products} traffic={traffic} leads={leads} customers={customers} carts={carts} checkouts={checkouts} abandonmentLogs={abandonmentLogs} templates={whatsAppTemplates} suppliers={suppliers} alerts={alerts} productSuppliers={productSuppliers} onNavigate={(tab, params) => setActiveTab(tab)} onUpdateProduct={(product) => { void updateProduct(product); }} onUpdateOrder={(o) => { }} onUpdateAbandonmentLog={(id, u) => { }} />}
        </main>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-rs-gold/10 text-rs-gold shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
  >
    <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
      {icon}
    </div>
    <span className="truncate">{label}</span>
  </button>
);

export default App;
