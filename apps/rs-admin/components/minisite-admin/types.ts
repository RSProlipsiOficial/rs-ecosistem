
// The core architecture: We save JSON, not HTML.

export type BlockType = 'hero' | 'text' | 'button' | 'gallery' | 'video' | 'social' | 'product' | 'image-text' | 'whatsapp' | 'divider' | 'spacer' | 'map' | 'countdown' | 'faq' | 'newsletter' | 'bento' | 'carousel';

export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube' | 'whatsapp' | 'website';

export type UserPlan = 'free' | 'start' | 'pro' | 'agency' | 'admin_master';

export interface PlanDefinition {
  id: UserPlan;
  name: string;
  maxPages: number;
  maxClients: number; // New field for Agency limits
  price: string;
  features: string[];
}

// Full Rota Fácil Profile Structure
export interface CheckoutProfile {
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string; // From login/auth
  empresa?: string;
  endereco_cep: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  referralCode?: string; // Unique code for referrals
  referredBy?: string;   // Code of the agency who referred this user

  // Payment Integration
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;

  // RS Prolipsi Profile Integration
  cpf?: string;
  phone?: string;
  avatarUrl?: string;
  consultantId?: string;
  idNumerico?: number;
  referralLink?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  clientsCount: number;
  revenue: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface AgencyClientAddress {
  line: string;
  number: string;
  city: string;
  state: string;
  zip: string;
}

export interface AgencyClient {
  id: string;
  agencyId: string; // Foreign Key equivalent
  name: string; // full_name
  email: string;
  createdAt: Date;
  updatedAt?: Date;

  // CRM Fields
  cpf?: string;
  phone?: string;
  birthDate?: string;
  address?: AgencyClientAddress;
  notes?: string;
  status: 'active' | 'inactive';

  // Financial
  monthlyFee?: number; // Valor cobrado do cliente final
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type PaymentMethod = 'pix' | 'card' | 'boleto' | 'cash' | 'transfer';

export interface ClientPayment {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  dueDate: Date;
  status: PaymentStatus;
  method: PaymentMethod;
  notes?: string;
}

export interface SystemLog {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string; // 'create_agency' | 'change_plan' | 'publish_site' | 'delete_item'
  target: string; // Description of what was affected
  timestamp: Date;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  buttonLabel?: string; // New: CTA button inside FAQ
  buttonUrl?: string;   // New: CTA link
}

// New Interface for Bento Grid Items
export interface BentoItem {
  type: 'image' | 'text' | 'link';
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  url?: string;
  backgroundColor?: string;
  textColor?: string;
}

// New Interface for Carousel Items
export interface CarouselItem {
  imageSrc: string;
  title?: string;
  url?: string;
}

export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: string;
  textAlign?: 'left' | 'center' | 'right';
  // New Background Fields
  backgroundType?: 'color' | 'image' | 'video'; // defaults to 'color' (or none)
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity?: number; // 0.0 to 1.0 (0% to 100%)

  // Spacer & Divider specific
  height?: string; // For spacer (e.g., '50px')
  dividerWidth?: string; // For divider (e.g., '80%')
  dividerThickness?: string; // For divider (e.g., '2px')
  dividerStyle?: 'solid' | 'dashed' | 'dotted'; // New
  dividerColor?: string; // Explicit divider color (overrides textColor)
  shadow?: string; // e.g. '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  gradient?: string; // e.g. 'linear-gradient(to right, #ff0000, #00ff00)'
}

export interface BlockContent {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  url?: string;
  label?: string;
  items?: string[]; // For gallery images
  galleryItems?: any[]; // New: for structured gallery items
  icon?: string;
  socialLinks?: SocialLink[];
  price?: string;    // New field for product
  oldPrice?: string; // New field for product
  whatsappNumber?: string; // For WhatsApp Block
  whatsappMessage?: string; // For WhatsApp Block

  // New Fields for Advanced Blocks
  faqItems?: FaqItem[];
  mapAddress?: string; // For Google Maps Embed
  targetDate?: string; // For Countdown ISO String
  placeholderText?: string; // For Newsletter Input
  buttonText?: string; // For Newsletter Button

  // Carousel Specific
  autoplay?: boolean;
  autoplaySpeed?: number; // in ms

  // Visual Variety
  bentoItems?: BentoItem[]; // Array of items
  carouselItems?: CarouselItem[];
  countdownShape?: 'square' | 'circle'; // New

  // Video Block
  videoUrl?: string;

  // Checkout Feature
  checkoutEnabled?: boolean;
}

export interface Section {
  id: string;
  type: BlockType;
  content: BlockContent;
  style: BlockStyle;
  clicks?: number; // Track clicks per section
}

export interface Theme {
  id: string;
  name: string;
  backgroundColor: string;
  primaryColor: string; // The Gold
  secondaryColor: string;
  textColor: string;
  fontFamily: string;

  // Global Background Fields
  backgroundType?: 'color' | 'image' | 'video';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOverlayOpacity?: number;

  // Footer Customization
  customFooterText?: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  image: string;
}

export interface TrackingPixels {
  // Legacy fields (optional support)
  metaPixelId?: string;
  googleAnalyticsId?: string;
  googleAdsId?: string;
  tiktokPixelId?: string;
  pinterestPixelId?: string;
  taboolaPixelId?: string;

  // Advanced Pixel Manager (Rota Fácil Port)
  pixelConfig?: {
    facebook_pixel_id?: string;
    facebook_pixel_enabled?: boolean;
    google_analytics_id?: string;
    google_analytics_enabled?: boolean;
    google_ads_id?: string;
    google_ads_enabled?: boolean;
    tiktok_pixel_id?: string;
    tiktok_pixel_enabled?: boolean;
    custom_head_scripts?: string;
    custom_body_scripts?: string;
  }
}

export interface BioSite {
  id: string;
  userId: string;
  clientId?: string; // Relationship: Optional Foreign Key to AgencyClient
  slug: string;
  name: string;
  plan?: UserPlan;
  sections: Section[];
  theme: Theme;
  isPublished: boolean;
  views: number;
  seo: SeoConfig;
  tracking?: TrackingPixels;
}

export type ViewMode = 'dashboard' | 'editor' | 'preview' | 'landing' | 'login' | 'signup' | 'admin' | 'admin-login';
