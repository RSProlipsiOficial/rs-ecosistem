

export type ProductPricingTier = 'retail' | 'consultant' | 'dropship';
export type ProductCommercialType = 'physical' | 'digital';
export type ProductCommissionOrigin = 'rs_physical' | 'rs_digital' | 'affiliate_physical' | 'affiliate_digital';
export type ProductAffiliateModel = 'none' | 'essential' | 'professional' | 'premium';
export type ProductFulfillmentOriginType = 'central' | 'seller_store';

export interface Product {
  id: string;
  name: string;
  seller: string;
  price: number;
  memberPrice?: number;
  dropshipPrice?: number;
  costPerItem?: number;
  compareAtPrice?: number;
  currency: string;
  shortDescription: string;
  description: string;
  images: string[];
  videos?: string[];
  materials?: ProductMaterial[];
  rating: number;
  reviewCount: number;
  collectionId: string | null;           // retrocompatibilidade (primeira coleção)
  collectionIds?: string[];              // múltiplas coleções
  subcategory?: string;                  // subcategoria dentro da coleção
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
  category?: string;
  featured_image?: string | null;
  merchandising?: ProductMerchandising;
  productType?: ProductCommercialType;
  commissionOrigin?: ProductCommissionOrigin;
  affiliateModel?: ProductAffiliateModel;
  ownerUserId?: string | null;
  ownerLoginId?: string;
  ownerType?: string;
  isRSProduct?: boolean;
  fulfillmentOriginType?: ProductFulfillmentOriginType;
  fulfillmentOriginId?: string | null;
  fulfillmentOriginName?: string;
  fulfillmentOriginZip?: string;
  inventorySource?: 'global' | 'cd';
  inventoryStatusLabel?: string;
  inventoryStatusMessage?: string;
  inventoryLoading?: boolean;
}

export interface ProductMerchandising {
  comboProductIds: string[];
  relatedProductIds: string[];
  sponsored: {
    enabled: boolean;
    priority?: number;
    label?: string;
    placements?: string[];
    startsAt?: string;
    endsAt?: string;
  };
}

export interface SponsoredPlacement {
  id: string;
  label: string;
  description: string;
  active: boolean;
}

export interface SponsoredPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  placementIds: string[];
  maxProducts: number;
  label: string;
  priority: number;
  active: boolean;
}

export interface SponsoredSettings {
  placements: SponsoredPlacement[];
  packages: SponsoredPackage[];
  autoApprovePaidRequests?: boolean;
  rotationEnabled?: boolean;
  rotationWindowMinutes?: number;
  maxVisibleProductsPerPlacement?: number;
}

export type SponsoredRequestStatus = 'rascunho' | 'pendente' | 'aprovado' | 'rejeitado';

export interface SponsoredPlacementMetrics {
  impressions: number;
  clicks: number;
  lastImpressionAt?: string;
  lastClickAt?: string;
}

export interface SponsoredRequestMetrics {
  impressions: number;
  clicks: number;
  lastImpressionAt?: string;
  lastClickAt?: string;
  byPlacement?: Record<string, SponsoredPlacementMetrics>;
}

export interface SponsoredRequest {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  productImage?: string;
  productSku?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  durationDays: number;
  placementIds: string[];
  requesterName?: string;
  requesterEmail?: string;
  objective?: string;
  notes?: string;
  status: SponsoredRequestStatus;
  campaignStartAt?: string;
  campaignEndAt?: string;
  paymentMethod?: 'pix' | 'boleto';
  paymentStatus?: 'nao_gerado' | 'pendente' | 'pago' | 'cancelado' | 'falhou';
  paymentAmount?: number;
  paymentId?: string;
  paymentQrCode?: string;
  paymentQrCodeBase64?: string;
  paymentTicketUrl?: string;
  paymentGeneratedAt?: string;
  paidAt?: string;
  requestedAt: string;
  updatedAt: string;
  adminNotes?: string;
  metrics?: SponsoredRequestMetrics;
}

export interface ProductMaterial {
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
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
  pricingTier?: ProductPricingTier;
  retailPrice?: number;
  consultantPrice?: number;
  dropshipPrice?: number;
  commissionOrigin?: ProductCommissionOrigin;
  affiliateModel?: ProductAffiliateModel;
  productType?: ProductCommercialType;
  ownerUserId?: string | null;
  ownerLoginId?: string;
  fulfillmentOriginType?: ProductFulfillmentOriginType;
  fulfillmentOriginId?: string | null;
  fulfillmentOriginName?: string;
  fulfillmentOriginZip?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isConsultant?: boolean;
  role?: string;
  loginId?: string;
  numericId?: string;
  cpfCnpj?: string;
  consultantCategory?: string;
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
  pricingTier?: ProductPricingTier;
  retailPrice?: number;
  consultantPrice?: number;
  dropshipPrice?: number;
  commissionOrigin?: ProductCommissionOrigin;
  affiliateModel?: ProductAffiliateModel;
  productType?: ProductCommercialType;
  ownerUserId?: string | null;
  ownerLoginId?: string;
  fulfillmentOriginType?: ProductFulfillmentOriginType;
  fulfillmentOriginId?: string | null;
  fulfillmentOriginName?: string;
  fulfillmentOriginZip?: string;
}

export interface Order {
  id: string;
  backendId?: string;
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
  paymentMethod?: string;
  paymentBreakdown?: Array<{
    method: string;
    amount: number;
  }>;
  pricingTierApplied?: ProductPricingTier;
  recognizedConsultantId?: string | null;
  recognizedConsultantLoginId?: string;
  recognizedConsultantNumericId?: string;
  buyerType?: 'cliente' | 'consultor' | 'cd';
  routingMode?: CheckoutRoutingMode;
  referrerId?: string | null;
  referrerName?: string;
  referrerLoginId?: string;
  distributorId?: string | null;
  distributorName?: string;
  fulfillmentOriginType?: ProductFulfillmentOriginType | 'cd';
  fulfillmentOriginId?: string | null;
  fulfillmentOriginName?: string;
  fulfillmentOriginZip?: string;
}

export type CheckoutRoutingMode = 'referral' | 'consultant_cd' | 'central' | 'seller_store';

export interface CheckoutRoutingContext {
  mode: CheckoutRoutingMode;
  buyerType: 'cliente' | 'consultor' | 'cd';
  sponsorRef: string;
  sponsorSource: 'default' | 'referral';
  referrerId: string | null;
  referrerName: string;
  referrerLoginId: string;
  distributorId: string | null;
  distributorName: string;
  requiresDistributorSelection: boolean;
  fulfillmentOriginType: ProductFulfillmentOriginType | 'cd';
  fulfillmentOriginId: string | null;
  fulfillmentOriginName: string;
  fulfillmentOriginZip?: string;
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

export interface OrderBumpOffer {
  productId: string;
  offerPrice: number;
}

export interface OrderBumpRule {
  id: string;
  name?: string;
  title: string;
  description: string;
  triggerProductIds: string[];
  offers: OrderBumpOffer[];
}

export interface OrderBump {
  enabled: boolean;
  productId: string;
  offerPrice: number;
  title: string;
  description: string;
  triggerProductIds?: string[];
  offers?: OrderBumpOffer[];
  rules?: OrderBumpRule[];
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
  'userProfileEditor' | 'rsStudio' | 'communication' | 'communicationCenter' | 'manageOrderBump' | 'manageUpsell' | 'managePromotionBoost' | 'manageAbandonedCarts' | 'manageReviews' | 'manageAnnouncements' | 'addEditAnnouncement' | 'manageTrainings' | 'addEditTraining' | 'trainingModuleDetail' | 'manageMarketingAssets' | 'addEditMarketingAsset' | 'productQA' | 'recentlyViewed' | 'orderLookup' | 'orderStatus' | 'cdRegions' | 'cdStock' | 'cdOrders' | 'rsCD' | 'rsControleDrop' |
  'marketplaceAdminOrders' | 'marketplaceAdminProducts' | 'marketplaceAdminFinancial';


export interface Collection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  productIds: string[];
  ownerUserId?: string | null;
  ownerLoginId?: string;
}

export interface Banner {
  id: string;
  desktopImage: string;
  mobileImage: string;
  link: string;
  position?: 'top' | 'middle' | 'bottom';
  height?: number;
  mobileHeight?: number;
  fullWidth?: boolean;
  title?: string;
  titleColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  backgroundColor?: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  buttonAnchor?: string;
  videoUrl?: string; // Optional background video (mp4 URL or YouTube embed URL)
  videoPoster?: string; // Fallback image while video loads
  titleColor?: string; // e.g. '#FFFFFF'
  subtitleColor?: string;
  buttonColor?: string;
  backgroundColor?: string;
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
  triggerProductId?: string;
  productId: string;
  offerPrice: number;
  title: string;
  description: string;
  acceptButtonText: string;
  declineButtonText: string;
}

export interface HomepageSection {
  id: 'hero' | 'carousel' | 'featuredProducts' | 'offers' | 'bestsellers' | 'featuredCollections' | 'recentlyViewed' | 'midPageBanner' | string;
  name: string;
  subtitle?: string;
  enabled: boolean;
  order?: number;
  titleColor?: string;
  subtitleColor?: string;
  backgroundColor?: string;
}

export interface StoreCustomization {
  logoUrl: string;
  logoMaxWidth?: number;
  faviconUrl: string;
  faviconMaxWidth?: number;
  hero: HeroContent;
  carouselBanners: Banner[];
  midPageBanner: Banner;
  footer: FooterContent;
  orderBump: OrderBump;
  upsell: UpsellSettings;
  promotionRequests: SponsoredRequest[];
  homepageSections: HomepageSection[];
  carouselHeight?: number;
  carouselHeightMobile?: number;
  carouselFullWidth?: boolean;
  storeBackgroundColor?: string;
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
  birthDate?: string;
  code?: string;
  loginId?: string;
  idNumerico?: number | string;
  idConsultor?: string;
  slug?: string;
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
  managerId?: string;
  name: string;
  ownerName: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  zipCode?: string;
  stores: StoreLocation[];
}

export interface DistributorInventoryItem {
  id: string;
  productId?: string | null;
  sku: string;
  name: string;
  category?: string;
  stockLevel: number;
  minStock?: number;
  price?: number;
  costPrice?: number;
  points?: number;
  status?: string;
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

export interface NetworkNode extends UserProfile {
  level: number;
  children: NetworkNode[];
  isEmpty?: boolean;
}
