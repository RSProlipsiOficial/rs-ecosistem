export interface Promotion {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export type Language = 'pt' | 'en' | 'es';

export interface ProductTranslation {
  name: string;
  description: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  text: string;
  likes: number;
  createdAt?: string; // ISO date string
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "P", "M", "Azul", "Vermelho"
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  category: 'Physical' | 'Digital';
  imageUrls: string[];
  translations: Record<Language, ProductTranslation>;
  variants: ProductVariant[];
  reviews: Review[];
  purchaseUrl?: string;
  status: 'active' | 'draft';
  tags: string[];
  shipping?: {
    weight: number; // in kg
    dimensions: { // in cm
      length: number;
      width: number;
      height: number;
    };
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
  eligibleForCartRecovery?: boolean;
  orderBumpOfferId?: string | null;
  upsellOfferId?: string | null;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  shippingCost: number | null;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  customer: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  orderDate: string; // ISO date string
  paymentStatus: 'pending' | 'paid';
}

export type TextImageLayout = 'image-left' | 'image-right' | 'image-top' | 'image-bottom';

export interface Column {
    id: string;
    containers: ContentContainer[];
}

export interface ContentContainer {
  id: string;
  type: 'text' | 'image' | 'textImage' | 'columns' | 'contactForm' | 'video' | 'hero' | 'about' | 'differentiators' | 'productsCarousel' | 'promotionsCarousel' | 'teamMembers' | 'downloadsList' | 'advertisingList' | 'bulkOrderForm';
  // Text & TextImage
  title?: string;
  subtitle?: string; // For hero, differentiators, promotions sections
  interstitialText?: string; // For hero section
  content?: string;
  // Image & TextImage
  imageUrl?: string;
  altText?: string;
  layout?: TextImageLayout; // For TextImage
  imageWidth?: '25%' | '50%' | '75%' | '100%'; // For Image & TextImage
  // Columns
  columns?: Column[];
  // Video
  videoUrl?: string;
  // For About, Differentiators: list of features/cards (actual content, not keys anymore)
  features?: { iconSvg: string; title: string; description: string; imageUrl?: string; imageAltText?: string }[];
  // For Products Carousel (HomeProductsSection) or Products List (StorePage)
  productIds?: string[]; // Empty means 'all' if used with a product list rendering
  // For Promotions Carousel
  promotionIds?: number[]; // References IDs from initialPromotions (static data)
  // For Team Members (KnowUsPage)
  teamMemberIds?: number[]; // References IDs from initialTeamMembers (static data)
  // For Downloads List (DownloadsPage)
  downloadType?: 'marketingPlan' | 'productCatalog'; // To specify which list to render
  // For Advertisements List (AdvertisingPage)
  advertisementIds?: string[]; // Empty means 'all active' if used with ad list rendering
  // Call to Action
  ctaText?: string;
  ctaLink?: string;
  // Styling for all containers
  styles?: {
    backgroundColor?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    textAlign?: 'left' | 'center' | 'right';
    justifyContent?: 'flex-start' | 'center' | 'flex-end'; // Vertical alignment for banners
    alignItems?: 'flex-start' | 'center' | 'flex-end'; // Horizontal alignment for banners
    textColor?: string;
    maxWidth?: string; // CSS value e.g., '800px', '75ch'
    minHeight?: string; // CSS value e.g., '400px', '50vh'
    backgroundImage?: string; // For hero or other sections
  };
}

export interface EditablePage {
  id: string;
  slug: string;
  title: string;
  showInNav: boolean;
  linkedProductId?: string | null;
  containers: ContentContainer[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  isStatic?: boolean; // New: Flag for static pages (Home, About, etc.)
  route?: string; // New: For static pages, defines their direct route (e.g., 'home', 'about')
  backgroundBanner?: {
    enabled: boolean;
    imageUrl: string;
    opacity: number;
  };
}

// Alias for CustomPage for existing components until they are refactored
export type CustomPage = EditablePage;

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

export type ButtonPreset = 'solid' | 'outline' | 'ghost' | 'glass' | 'gradient';

export interface ButtonStyle {
  preset: ButtonPreset;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number; // in px
  borderRadius: number; // in px
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  textTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  fontWeight: string; // e.g. '400', '700'
  padding: string; // e.g. '12px 24px'
}

export type ButtonStyles = Record<string, ButtonStyle>;

export interface CardStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect: 'none' | 'lift' | 'glow';
}

export type CardStyles = Record<string, CardStyle>;

export interface SocialLink {
  id: string;
  platform: string; // e.g., 'facebook', 'instagram', 'x'
  url: string;
}

export interface SiteSettings {
    socialLinks: SocialLink[];
}

export interface AISettings {
    chatbotName: string;
    chatbotIcon: string;
    chatbotSystemPrompt: string;
}

export interface IntegrationsSettings {
    mercadoPago: string;
    adyen: string;
    stripe: string;
    pagSeguro: string;
    stone: string;
    asaas: string;
    melhorEnvio?: string;
}

export interface BannerSettings {
  sideBanner: {
    enabled: boolean;
    imageUrl: string;
    link: string;
    position: 'left' | 'right';
    top: number;
    width: number;
  };
  backgroundBanner: {
    enabled: boolean;
    imageUrl: string;
    opacity: number;
  };
}

export type BackgroundPattern = 'dots' | 'grid' | 'geo' | 'gradient' | 'none';

export type AdminTab = 'home' | 'pages' | 'store' | 'theme' | 'banners' | 'settings' | 'ai_settings' | 'integrations' | 'offers' | 'carts' | 'orders';

export interface SiteFeatures {
    about: boolean;
    knowUs: boolean;
    store: boolean;
    advertising: boolean;
    downloads: boolean;
}

export interface TypographyStyle {
  fontFamily: string;
  fontWeight: string;
  textTransform: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

export type MobileMenuStyle = 'overlay' | 'sidepanel';

export interface Theme {
  colors: {
    accent: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    buttonBg: string;
    buttonText: string;
    surface: string;
    border: string;
    mobileMenuBackground: string;
    mobileMenuText: string;
    mobileMenuAccent: string;
  };
  typography: {
    body: TypographyStyle;
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    h4: TypographyStyle;
  };
  navigation: {
    mobileMenuStyle: MobileMenuStyle;
  };
}

export interface Offer {
  id: string;
  type: 'order_bump' | 'upsell';
  name: string;
  triggerProductIds: string[];
  offerProductId: string;
  discountPercentage: number;
  headline: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface AbandonedCart {
  id: string;
  customerEmail: string;
  items: CartItem[];
  cartValue: number;
  lastSeen: string; // ISO date string
  recoveryStatus: 'pending' | 'sent' | 'recovered';
}