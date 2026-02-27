

export interface Product {
  id: string;
  name: string;
  seller: string;
  price: number;
  memberPrice?: number;
  costPerItem?: number;
  compareAtPrice?: number;
  currency: string;
  shortDescription: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  collectionId: string | null;
  status: 'Ativo' | 'Rascunho';
  inventory: number;
  type: string;
  sku?: string;
  barcode?: string;
  requiresShipping: boolean;
  trackQuantity: boolean;
  chargeTax: boolean;
  continueSelling: boolean;
  seoTitle?: string;
  seoDescription?: string;
  urlHandle?: string;
  options: ProductOption[];
  variants: ProductVariant[];
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  supplier?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  options: { [key: string]: string };
  price: number;
  inventory: number;
  sku?: string;
  imageId?: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantText?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export type PaymentStatus = 'Pago' | 'Pendente' | 'Reembolsado' | 'Parcialmente Pago' | 'Cancelado';
export type FulfillmentStatus = 'Realizado' | 'Não Realizado' | 'Parcial';

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  quantity: number;
  price: number;
  variantText?: string;
  sku?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  appliedCoupon?: string;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingCode?: string;
  shippingMethod?: string;
  notes?: string;
  boletoUrl?: string;
  pixQrCodeUrl?: string;
  pixCopyableCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'Porcentagem' | 'Valor Fixo';
  value: number;
  status: 'Ativo' | 'Inativo';
  usageCount: number;
  usageLimit: number | null;
  startDate: string;
  endDate: string | null;
}

export interface OrderBump {
  enabled: boolean;
  productId: string;
  offerPrice: number;
  title: string;
  description: string;
}

export type PixKeyType = 'CPF' | 'CNPJ' | 'E-mail' | 'Telefone' | 'Chave Aleatória';

export interface PaymentSettings {
  mercadoPago: { enabled: boolean; publicKey: string; accessToken: string; };
  pagSeguro: { enabled: boolean; email: string; token: string; };
  pix: { enabled: boolean; pixKeyType: PixKeyType; pixKey: string; };
  appmax: { enabled: boolean; apiKey: string; };
  asaas: { enabled: boolean; apiKey: string; };
  pagarme: { enabled: boolean; apiKey: string; encryptionKey: string; };
  stripe: { enabled: boolean; publishableKey: string; secretKey: string; };
} // added closing bracket here

export type View = 'home' | 'productDetail' | 'consultantLogin' | 'sellerRegistration' | 'customerLogin' | 'customerRegister' | 'customerForgotPassword' | 'customerAccount' | 'customerWishlist' | 'collectionView' | 'checkout' | 'orderConfirmation' |
  'consultantStore' | 'manageProducts' | 'addEditProduct' | 'editDropshippingProduct' | 'manageInventory' | 'manageOrders' | 'orderDetail' | 'manageReturns' | 'returnDetail' | 'manageDropshippingOrders' | 'dropshippingCatalog' |
  'managePromotions' | 'addEditCoupon' | 'manageAffiliates' | 'storeEditor' | 'storeBannerEditor' | 'virtualOfficeDropshipping' | 'virtualOfficeAffiliateLinks' |
  'virtualOfficePixels' | 'virtualOfficeLinkShortener' | 'addEditMarketingPixel' | 'bannerDashboard' | 'dashboardEditor' | 'marketplaceAdmin' | 'consultantProfile' | 'managePayments' | 'manageShipping' |
  'compensationPlan' | 'manageCollections' | 'addEditCollection' | 'walletOverview' | 'walletReports' | 'walletTransfers' | 'walletCharges' | 'walletSettings' |
  'userProfileEditor' | 'rsStudio' | 'communicationCenter' | 'manageOrderBump' | 'manageUpsell' | 'manageAbandonedCarts' | 'manageReviews' | 'manageAnnouncements' | 'addEditAnnouncement' | 'manageTrainings' | 'addEditTraining' | 'trainingModuleDetail' | 'manageMarketingAssets' | 'addEditMarketingAsset' | 'productQA' | 'recentlyViewed' | 'orderLookup' | 'orderStatus' | 'cdRegions' | 'cdStock' | 'cdOrders' | 'rsCD' | 'rsControleDrop';

export interface Collection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  productIds: string[];
}

export interface Banner {
  id: string;
  desktopImage: string;
  mobileImage: string;
  link: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
}

export interface FooterContent {
  description: string;
  buyerLinks: { label: string; url: string; isAction?: boolean }[];
  sellerLinks: { label: string; url: string; isAction?: boolean }[];
  companyLinks: { label: string; url: string }[];
  socialLinks: { platform: string; url: string }[];
  contactEmail: string;
  cnpj: string;
  businessAddress: string;
  paymentMethods: string[];
  shippingMethods: string[];
}

export interface UpsellSettings {
  enabled: boolean;
  productId: string;
  offerPrice: number;
  title: string;
  description: string;
  acceptButtonText: string;
  declineButtonText: string;
}

export interface HomepageSection {
  id: 'featuredProducts' | 'offers' | 'bestsellers' | 'featuredCollections' | 'recentlyViewed' | 'midPageBanner';
  name: string;
  enabled: boolean;
}

export interface StoreCustomization {
  logoUrl: string;
  faviconUrl: string;
  hero: HeroContent;
  carouselBanners: Banner[];
  midPageBanner: Banner;
  footer: FooterContent;
  orderBump: OrderBump;
  upsell: UpsellSettings;
  homepageSections: HomepageSection[];
  customCss: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  status: 'Aprovada' | 'Pendente' | 'Rejeitada';
}

export interface Answer {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Question {
  id: string;
  productId: string;
  author: string;
  text: string;
  createdAt: string;
  answers: Answer[];
}

export type SocialPlatform = 'Facebook' | 'Instagram' | 'TikTok' | 'Pinterest' | 'YouTube' | 'Kwai' | 'LinkedIn';

export interface ScheduledPost {
  id: string;
  platforms: SocialPlatform[];
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  linkUrl?: string;
  scheduledAt: string;
  status: 'Agendado' | 'Postado' | 'Falhou';
  facebookGroupIds?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'logo' | 'banner' | 'template';
  format: 'PNG' | 'JPG' | 'PDF';
  downloadUrl: string;
  previewUrl: string;
}

// Fix: Added missing 'MarketingAsset' type export as an alias for 'MediaAsset'.
export type MarketingAsset = MediaAsset;

export interface UserProfile {
  name: string;
  id: string;
  graduation: string;
  accountStatus: string;
  monthlyActivity: string;
  category: string;
  referralLink: string;
  affiliateLink: string;
  avatarUrl: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface NetworkActivityItem {
  id: string;
  icon: string;
  text: string;
  timestamp: string;
}

export type DashboardComponentType = 'userInfo' | 'referralLinks' | 'qualificationProgress' | 'adminBanner' | 'bonusCards' | 'incentivesProgram' | 'networkActivity' | 'shortcut' | 'performanceChart';

export interface DashboardCard {
  id: string;
  title: string;
  icon: string;
  dataKey: 'cycleBonus' | 'topSigmeBonus' | 'careerPlanBonus' | 'affiliateBonus' | 'dropshipBonus' | 'logisticsBonus' | 'custom';
}

export interface DashboardComponent {
  id: string;
  type: DashboardComponentType;
  column: 'left' | 'right';
  enabled: boolean;
  title?: string;
  visibleFields?: {
    id?: boolean;
    graduation?: boolean;
    accountStatus?: boolean;
    monthlyActivity?: boolean;
    category?: boolean;
    referralLink?: boolean;
    affiliateLink?: boolean;
  };
  value?: number;
  max?: number;
  startLabel?: string;
  endLabel?: string;
  startIcon?: string;
  endIcon?: string;
  content?: { title: string; progress: number }[];
  url?: string;
  icon?: string;
}

export interface DashboardSettings {
  components: DashboardComponent[];
  cards: DashboardCard[];
}

export type RewardFrequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export interface CompensationTier {
  id: string;
  name: string;
  pointsRequired: number;
  reward: number;
  pinImageUrl: string;
  bannerImageUrl: string;
}

export interface CompensationSettings {
  dropshippingPointsPerBrl: number;
  affiliatePointsPerBrl: number;
  frequency: RewardFrequency;
  tiers: CompensationTier[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  requestDate: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
  }[];
  status: 'Pendente' | 'Aprovada' | 'Rejeitada' | 'Concluída';
  resolutionType: 'Troca' | 'Reembolso';
}

export type DropshippingOrderStatus = 'Pendente' | 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';

export interface DropshippingOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
}

export interface DropshippingOrder {
  id: string;
  orderId: string;
  supplier: string;
  supplierOrderId: string;
  date: string;
  items: DropshippingOrderItem[];
  totalCost: number;
  status: DropshippingOrderStatus;
  trackingCode?: string;
}

export interface DropshippingProduct {
  id: string;
  name: string;
  supplier: string;
  costPrice: number;
  suggestedRetailPrice: number;
  images: string[];
  description: string;
  category: string;
  inventory: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  productCategories: string[];
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  commissionRate: number;
  referralCode: string;
  totalSales: number;
  totalEarnings: number;
  paidOut: number;
}

export type MarketingPixelType = 'Facebook' | 'Google Ads' | 'Google Analytics' | 'TikTok' | 'Pinterest' | 'Kwai' | 'Taboola' | 'LinkedIn' | 'Twitter' | 'Bing' | 'Criteo' | 'Hotjar' | 'Outbrain' | 'Snapchat';

export const MARKETING_PIXEL_TYPES: MarketingPixelType[] = ['Facebook', 'Google Ads', 'Google Analytics', 'TikTok', 'Pinterest', 'Kwai', 'Taboola', 'LinkedIn', 'Twitter', 'Bing', 'Criteo', 'Hotjar', 'Outbrain', 'Snapchat'];

export interface MarketingPixel {
  id: string;
  type: MarketingPixelType;
  name: string;
  pixelId: string;
  idLabel?: string;
  status: 'Ativo' | 'Inativo';
  events?: {
    pageView: boolean;
    viewContent: boolean;
    addToCart: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
  };
}
export type Pixel = MarketingPixel;

export interface PartnerStore {
  id: string;
  name: string;
  description: string;
  logo: string;
  commission: number;
}

export interface ShortenedLink {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
}

export interface ShippingSettings {
  frenet: { enabled: boolean; apiKey: string; apiSecret: string; };
  melhorEnvio: { enabled: boolean; apiToken: string; };
  correios: { enabled: boolean; contrato: string; senha: string; };
  superFrete: { enabled: boolean; apiToken: string; };
  jadlog: { enabled: boolean; apiToken: string; };
  loggi: { enabled: boolean; apiKey: string; };
}

export type TransferFrequency = 'Diário' | 'Semanal' | 'Mensal';

export interface WalletSettings {
  automaticTransfers: {
    enabled: boolean;
    frequency: TransferFrequency;
    dayOfWeek?: number;
    dayOfMonth?: number;
    minimumAmount: number;
  };
  notifications: {
    onNewCommission: boolean;
    onTransferSuccess: boolean;
    onTransferFail: boolean;
  };
  security: {
    twoFactorAuth: boolean;
  };
}

export interface AbandonedCart {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  abandonedAt: string;
  recoveryStatus: 'Não enviado' | 'Enviado' | 'Recuperado';
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  isPinned: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
  likes?: number;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  progress: number;
  lessons: Lesson[];
}

export interface ChargeItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Charge {
  id: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone?: string;
  customerAddress?: ShippingAddress;
  items: ChargeItem[];
  shipping: number;
  total: number;
  status: 'Pendente' | 'Pago' | 'Vencido' | 'Cancelado';
  createdAt: string;
  dueDate?: string;
  paymentLink: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  consultantIds: string[];
}

export interface Distributor {
  id: string;
  name: string;
  ownerName: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  stores: StoreLocation[];
}

// ===== NOVOS TIPOS PARA RECURSOS AVANÇADOS DE PAGAMENTO =====

export interface WalletBalance {
  customerId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface PaymentSplit {
  id: string;
  method: 'wallet' | 'pix' | 'credit-card' | 'boleto';
  amount: number;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  transactionId?: string;
  createdAt: string;
}

export interface UnifiedPayment {
  orderId: string;
  totalAmount: number;
  splits: PaymentSplit[];
  overallStatus: 'pending' | 'partial' | 'completed' | 'failed';
  createdAt: string;
}

export interface SharedOrder {
  id: string;
  teamId: string;
  coordinatorId: string;
  coordinatorName: string;
  deliveryAddress: ShippingAddress;
  status: 'pending' | 'collecting' | 'ready' | 'completed';
  totalAmount: number;
  participants: SharedOrderParticipant[];
  createdAt: string;
  expiresAt: string;
  shareLink: string;
}

export interface SharedOrderParticipant {
  id: string;
  sharedOrderId: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentLink?: string;
  paidAt?: string;
}

export interface WalletPaymentRequest {
  customerId: string;
  amount: number;
  orderId: string;
  description: string;
}

export interface WalletPaymentResponse {
  success: boolean;
  transactionId: string;
  remainingBalance: number;
  message: string;
}
