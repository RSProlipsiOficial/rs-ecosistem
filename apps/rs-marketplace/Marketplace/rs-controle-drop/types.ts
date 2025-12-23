
// New User types for multi-tenancy
export type UserRole = 'Admin' | 'Logista';
export interface User {
  id: string;
  name: string;
  role: UserRole;
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
  stock: number;
  minStock: number;
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
  currentStock: number;
  minStock: number;
  status: 'Active' | 'Inactive';
  
  // PRT-019: Support for variations
  variants?: ProductVariant[];
  
  userId: string;
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
  // UTM Attribution Fields
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  
  notes?: string;
  postSaleEvents?: PostSaleEvent[];
  userId: string;
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
export type AuditEntity = 'Product' | 'Order' | 'Customer' | 'Supplier' | 'Pixel' | 'User';

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

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    timestamp: string;
    isAction?: boolean; 
    uiType?: 'default' | 'recovery_list' | 'product_list'; // For rich UI
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
