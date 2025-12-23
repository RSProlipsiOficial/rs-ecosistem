
// New User types for multi-tenancy
export type UserRole = 'Admin' | 'Logista';
export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// --- NEW: Global Catalog ---
export interface GlobalProduct {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  sku: string;
  suggestedPrice: number;
  minAllowedPrice: number; // For price range control
  maxAllowedPrice: number;
  defaultCommissionPercent?: number;
  isActive: boolean;
}

// --- NEW: Multi-CD ---
export interface DistributionCenter {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  zipCodeRanges: { start: string, end: string }[];
  userId: string; // Admin-level entity, but can be associated
}

export interface ProductStockLocation {
  productId: string;
  centerId: string;
  stock: number;
}


export interface PaymentMethodConfig {
  id: string;
  name: string;
  defaultFeePercent: number;
  defaultFeeFixed: number;
  userId: string;
}

export interface ShippingConfig {
  id: string;
  name: string;
  defaultCost: number;
  userId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  userId: string;
}

export interface ProductSupplier {
  productId: string;
  supplierId: string;
  costPrice: number;
  leadTimeDays?: number;
  isDefault?: boolean; // PRT-020: Default Supplier Flag
}

// PRT-019: Product Variant Entity
export interface ProductVariant {
  id: string;
  name: string; // Attribute combination (e.g. "Red - M")
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
}

// AUDITORIA: Histórico de Estoque
export type StockMovementReason = 'VENDA' | 'DEVOLUÇÃO' | 'AJUSTE_MANUAL' | 'COMPRA_ESTOQUE';
export interface StockMovement {
    id: string;
    productId: string;
    variantId?: string;
    date: string;
    quantityChange: number; // -10 for sale, +10 for return
    reason: StockMovementReason;
    relatedOrderId?: string;
    notes?: string;
}

// --- NEW: Bundles ---
export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface BundleConfig {
  items: BundleItem[];
  pricing: {
    type: 'fixed_price' | 'percent_discount' | 'fixed_discount';
    value: number;
  };
}

// --- NEW: Product Page Editor ---
export type ProductPageBlockType = 'description' | 'benefits' | 'reviews' | 'faq' | 'guarantee' | 'cta';

export interface ProductPageBlock {
  type: ProductPageBlockType;
  // Content is implicit from product data, this just controls order and existence
}

export interface ProductPageLayout {
  mainLayout: 'image-left' | 'image-right' | 'gallery';
  blocks: ProductPageBlock[];
}

export interface ProductPageTemplate {
    id: string;
    name: string;
    layout: ProductPageLayout;
}


export interface Product {
  id:string;
  name: string;
  sku?: string;
  category?: string; // PRT-023: Category for filtering
  salePrice: number;
  shippingCost: number;
  shippingCharged: number;
  gatewayFeeRate: number;
  currentStock: number; // This will become a calculated sum of stock locations
  minStock: number;
  status: 'Active' | 'Inactive';
  
  // --- NEW: Bundles ---
  productType?: 'simple' | 'bundle';
  bundleConfig?: BundleConfig;

  // --- NEW: Shipping Fields ---
  weightKg?: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };

  // PRT-019: Support for variations
  variants?: ProductVariant[];
  
  globalProductId?: string; // Links to the GlobalProduct
  userId: string;

  // --- NEW: Product Page Layout ---
  pageLayout?: ProductPageLayout;

  // --- NEW: Affiliate ---
  affiliateCommissionPercent?: number;

  // AUDITORIA: Visibilidade por Canal
  visibility?: ('loja' | 'marketplace')[];
}

// --- NEW: LGPD Consents ---
export interface CustomerConsents {
    transactional: boolean; // Order updates, recovery (Legitimate Interest/Contract)
    marketing: boolean;     // Promotions, newsletter (Requires Opt-in)
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  userId: string;
  consents?: CustomerConsents; // Stored consent profile
}

export interface OrderItem {
  id: string;
  productId: string;
  supplierId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discount: number;
}

export type OrderStatus = 'New' | 'Packing' | 'Shipped' | 'Delivered' | 'Returned' | 'Refunded';

export type PostSaleEventType = 'Return' | 'Partial Refund' | 'Full Refund' | 'Chargeback';

export interface PostSaleEvent {
  id: string;
  orderId: string;
  type: PostSaleEventType;
  amount: number;
  date: string;
  reason: string;
}

// --- NEW: Tracking Page ---
export interface TrackingEvent {
    date: string;
    status: string;
    location: string;
}

export interface Order {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  itemsTotal: number;
  discountTotal: number;
  shippingCost: number;
  shippingCharged: number;
  paymentMethod: string;
  paymentFee: number;
  platformFee: number;
  otherExpenses: number;
  status: OrderStatus;
  trackingCode?: string;
  shippingMethod?: string;
  shippingDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  salesChannel?: string;
  campaign?: string; // Legacy/Simple campaign field
  
  // --- NEW: Shipping & Fulfillment ---
  shippingLabelUrl?: string;
  fulfillmentCenterId?: string; // Links to DistributionCenter

  // UTM Attribution Fields
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  
  notes?: string;
  postSaleEvents?: PostSaleEvent[];
  userId: string;
  
  // --- NEW: Affiliate ---
  affiliateId?: string;
  affiliateCommission?: number;
  commissionPaid?: boolean;

  // AUDITORIA: Antifraude
  antifraud?: {
    status: 'pending' | 'approved' | 'rejected' | 'error';
    score: number;
    manualReview?: boolean;
  };
}

/** @deprecated Use the Order interface directly. This alias is for transitional purposes. */
export interface Sale extends Order {} 

export interface TrafficSpend {
  id: string;
  date: string;
  platform: 'Meta Ads' | 'Google Ads' | 'TikTok Ads';
  amountSpent: number;
  salesCount: number;
  revenueGenerated: number;
  roas: number;
  userId: string;
}

export interface Lead {
  id: string;
  date: string;
  name: string;
  phone?: string;
  city: string;
  state: string;
  source: string; 
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  linkedSaleId?: string;
  userId: string;
}

export interface MonthlySummary {
  grossRevenue: number;
  discounts: number;
  refundsAndChargebacks: number;
  netSales: number;
  productCost: number;
  shippingCost: number;
  shippingRevenue: number;
  shippingProfit: number;
  taxCost: number;
  otherExpenses: number;
  grossProfit: number;
  adSpend: number;
  netProfit: number;
  globalRoi: number;
  profitMargin: number;
  avgTicket: number;
  leadConversionRate: number;
  salesCount: number;
  ordersCount: number;
  leadsCount: number;
  leadsFromTraffic: number;
}

export type AlertType = 
  | 'LOW_STOCK'
  | 'NEGATIVE_ROI_STREAK'
  | 'LOW_PRODUCT_MARGIN'
  | 'HIGH_RETURN_RATE';

export type AlertSeverity = 'CRITICAL' | 'WARNING';

export interface AppAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedEntityId?: string;
}

// Marketing Tools Types
export type TrackingPixelPlatform = 'meta' | 'google_ga4' | 'google_ads' | 'tiktok' | 'taboola' | 'pinterest' | 'linkedin';

export interface TrackingPixel {
    id: string;
    userId: string;
    platform: TrackingPixelPlatform;
    name: string;
    config: { [key: string]: string }; // Stores IDs like pixelId, conversionLabel, etc.
    createdAt: string;
}

export interface ShortLinkClick {
    id: string;
    timestamp: string;
    location?: string;
    userAgent?: string;
}

export interface ShortLink {
    id: string;
    userId: string;
    slug: string; // rs.co/slug
    originalUrl: string;
    finalUrl: string; // URL with UTMs
    name: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    isActive: boolean;
    clicks: ShortLinkClick[];
    createdAt: string;
}

// Audit Logs (PRT-018)
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditEntity = 'Product' | 'Order' | 'Customer' | 'Supplier' | 'Pixel' | 'User' | 'Subscription';

export interface AuditChange {
    field: string;
    old: any;
    new: any;
}

export interface AuditLog {
    id: string;
    date: string;
    userId: string;
    userName: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId: string;
    details: string;
    changes?: AuditChange[];
}

// --- NEW: Offers & Funnel ---
export interface MarketingOffer {
    id: string;
    type: 'bump' | 'upsell';
    name: string;
    description: string;
    price: number;
    productId: string; // For inventory linking
}

// --- NEW: Cart & Checkout States ---

export type CartStatus = 'aberto' | 'atualizado' | 'abandonado' | 'convertido';
export type CheckoutStatus = 'iniciado' | 'em_andamento' | 'abandonado' | 'concluido' | 'falha_pagamento';
export type CheckoutFunnelStep = 'dados_pessoais' | 'endereco_frete' | 'pagamento' | 'upsell' | 'concluido';

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface Cart {
    id: string;
    userId: string; // Can be a guest session ID or a logged-in user ID
    status: CartStatus;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
    utmSource?: string;
    utmCampaign?: string;
}

export interface Checkout {
    id: string;
    cartId: string;
    userId: string;
    status: CheckoutStatus;
    customerInfo: Partial<Customer>;
    shippingInfo: {
        method?: string;
        cost?: number;
    };
    paymentInfo: {
        method?: string;
        status?: 'pending' | 'paid' | 'failed';
    };
    consents?: CustomerConsents; // LGPD
    acceptedOffers?: MarketingOffer[]; // Track accepted Bumps/Upsells
    currentStep?: CheckoutFunnelStep;
    total: number;
    createdAt: string;
    updatedAt: string;
    utmSource?: string;
    utmCampaign?: string;
}

// --- NEW: Abandonment Log Structure ---
export type RecoveryStatus = 'pendente' | 'em_contato' | 'recuperado' | 'nao_recuperado';

export interface AbandonmentLog {
    id: string;
    referenceId: string; // cartId or checkoutId
    type: 'CART_ABANDONED' | 'CHECKOUT_ABANDONED';
    recoveryStatus: RecoveryStatus;
    funnelStep: string; // 'carrinho', 'dados_pessoais', etc.
    customerName?: string;
    contact?: string; // Phone or Email if available
    consents?: CustomerConsents; // LGPD in Log
    utmSource?: string;
    utmCampaign?: string;
    value: number;
    itemsSummary: { name: string; quantity: number }[];
    abandonedAt: string;
    notes?: string;
}

// --- NEW: Message Templates ---
export interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    type?: 'transactional' | 'marketing'; // To classify templates
}

// --- NEW: AI Copilot & Memory ---
export type ChatRole = 'user' | 'model' | 'system';

// --- NEW: Ad Creative Suggestion ---
export interface AdCreativeSuggestion {
    headlines: string[];
    copies: string[];
    imageInstructions: string[];
}

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    timestamp: string;
    isAction?: boolean; 
    uiType?: 'default' | 'recovery_list' | 'product_list' | 'ad_creative_list'; // For rich UI
    data?: any; // Payload for rich UI
}

// AI Contextual Memory
export interface UserPreference {
    key: string;
    value: any;
}

export interface ChatSession {
    id: string;
    title: string;
    date: string;
    messages: ChatMessage[];
}

export interface AIUserContext {
    userId: string;
    lastInteraction: string;
    recentTopics: string[]; // e.g. ['finance', 'inventory']
    preferences: UserPreference[];
    lastActions: { action: string, timestamp: string, details?: string }[];
    sessions: ChatSession[];
}

// --- NEW: Ticket / Help Desk ---
export type TicketStatus = 'Novo' | 'Em Andamento' | 'Resolvido' | 'Arquivado';
export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Ticket {
  id: string;
  orderId?: string; // Linked to Order
  customerId: string; // Linked to Customer
  customerName: string;
  userId: string; // The store owner
  channel: 'WhatsApp' | 'Email' | 'Instagram' | 'Outros';
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// --- NEW: Post-Sale Automation ---
export type AutomationTriggerEvent = 'ORDER_CREATED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'DAYS_AFTER_DELIVERY';
export type AutomationAction = 'SEND_WHATSAPP' | 'SEND_EMAIL' | 'CREATE_TASK' | 'CREATE_TICKET';

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: AutomationTriggerEvent;
  delayDays: number; // e.g., wait 2 days after delivery
  action: AutomationAction;
  templateId?: string; // Link to a MessageTemplate
  isActive: boolean;
  userId: string;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  orderId: string;
  customerId: string;
  triggeredAt: string;
  action: AutomationAction;
  details: string; // e.g., "Sent WhatsApp using template 'Avaliação'"
}

// --- NEW: RMA (Exchanges & Returns) ---
export type RMAType = 'Troca' | 'Devolução' | 'Reembolso Parcial';
export type RMAStatus = 'Solicitado' | 'Em Análise' | 'Aprovado' | 'Recusado' | 'Concluído';
export type RMAReason = 'Produto Danificado' | 'Arrependimento' | 'Erro de Envio' | 'Tamanho Errado' | 'Outro';

export interface RMAItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface RMA {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  userId: string;
  type: RMAType;
  status: RMAStatus;
  reason: RMAReason;
  items: RMAItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- NEW: Product Reviews ---
export type ReviewStatus = 'Pendente' | 'Aprovado' | 'Oculto';

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  customerId: string;
  customerName: string;
  userId: string;
  rating: number; // 1 to 5
  comment: string;
  imageUrl?: string; // Optional photo upload
  status: ReviewStatus;
  moderatorNotes?: string;
  isFeatured?: boolean;
  createdAt: string;
}

// --- NEW: Landing Pages ---
export type LandingPageBlockType = 'hero' | 'video' | 'testimonials' | 'faq';

export interface LandingPageBlock {
  id: string;
  type: LandingPageBlockType;
  content: any; // e.g., { title: string, subtitle: string } for hero
}

export interface LandingPage {
  id: string;
  userId: string;
  name: string;
  slug: string;
  mainProductId: string;
  headline: string;
  blocks: LandingPageBlock[];
  isActive: boolean;
  createdAt: string;
}

// --- NEW: AOV Boost ---
export interface AovBoostConfig {
  freeShippingThreshold: number;
}

// --- NEW: A/B Testing ---
export type ExperimentType = 'price' | 'headline' | 'page_layout';
export type ExperimentStatus = 'running' | 'paused' | 'completed';

export interface ExperimentVariation {
  id: 'A' | 'B'; // A is always control, B is variation
  name: string;
  split: number;
  value: string | number; // New price, new headline, or templateId
}

export interface Experiment {
  id: string;
  userId: string;
  name:string;
  productId: string;
  status: ExperimentStatus;
  type: ExperimentType;
  variations: [ExperimentVariation, ExperimentVariation]; // Always one control, one variation
  winnerVariationId?: 'A' | 'B';
  createdAt: string;
  completedAt?: string;
}

export interface ExperimentDataPoint {
  id: string;
  experimentId: string;
  variationId: 'A' | 'B';
  sessionId: string; // To count unique visitors
  eventType: 'visit' | 'conversion';
  revenue?: number; // Only for conversion
  timestamp: string;
}

// --- NEW: Price Optimizer ---
export interface PriceSuggestion {
  id: string;
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  currentMargin: number;
  projectedMargin: number;
  justification: string;
  metrics: {
    salesVolume: number;
    abandonmentRate: number;
  };
}

// --- NEW: CRM ---
export type CustomerSegment = 'VIPs' | 'Campeões' | 'Leais' | 'Potencial' | 'Em Risco' | 'Hibernando' | 'Novos';

export interface CustomerWithMetrics extends Customer {
    recency: number; // days since last purchase
    frequency: number; // total number of purchases
    monetary: number; // total value (LTV)
    segment: CustomerSegment;
}

// --- NEW: Affiliates ---
export interface Affiliate {
    id: string;
    userId: string;
    name: string;
    email: string;
    pixKey: string;
    isActive: boolean;
}

// --- NEW: Push Notifications ---
export interface PushSubscriptionRecord {
    id: string; // user/device identifier
    subscription: PushSubscriptionJSON; // The actual subscription object from the browser
    userId: string;
}

export interface PushNotificationLog {
    id: string;
    date: string;
    title: string;
    body: string;
    segment: string; // e.g., 'VIPs', 'All', or 'Internal'
    status: 'Sent' | 'Failed';
}

// AUDITORIA: Assinaturas com Gateway
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due' | 'unpaid';
export type SubscriptionInterval = 'monthly' | 'quarterly' | 'yearly';
export interface Subscription {
    id: string;
    userId: string;
    customerId: string;
    customerName: string;
    productId: string;
    productName: string;
    status: SubscriptionStatus;
    interval: SubscriptionInterval;
    price: number;
    startDate: string;
    nextBillingDate: string;
    
    // Gateway Integration Fields
    gatewayId?: string;       // ID da assinatura no Gateway (ex: sub_12345)
    gatewayStatus?: string;   // Status cru do gateway
    paymentMethodToken?: string; // Token do cartão salvo
    failureReason?: string;   // Motivo da última falha de cobrança
}

// AUDITORIA: Toast Notifications
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
