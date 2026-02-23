// types.ts

export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface BankAccount {
  bank: string;
  agency: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  pixKey: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  whatsapp: string;
  status: 'active' | 'inactive' | 'pending';
  pin: string;
  cpfCnpj: string;
  birthDate: string;
  registrationDate: string;
  hasPurchased: boolean;
  address: Address;
  bankAccount: BankAccount;
  idConsultor?: string;
  idNumerico?: number;
  isNetworkActive?: boolean;
  graduacao?: string;
  categoria?: string;
  linkIndicacao?: string;
  linkAfiliado?: string;
  patrocinador_id?: string;
  personalVolume?: number;
  groupVolume?: number;
  totalVolume?: number;
  bonusCicloGlobal?: number;
  bonusTopSigme?: number;
  bonusPlanoCarreira?: number;
  totalCycles?: number;
  upline?: {
    name: string;
    avatarUrl: string;
    idConsultor: string;
    whatsapp: string;
  };
}

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: 'alert' | 'announcement' | 'promotion';
}

export type WalletTransactionType =
  | 'commission_cycle'
  | 'commission_shop'
  | 'bonus_career'
  | 'bonus_compensation'
  | 'withdrawal'
  | 'deposit'
  | 'transfer_in'
  | 'transfer_out'
  | 'bonus_sigme'
  | 'bonus_fidelity';

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: WalletTransactionType;
  status: 'completed' | 'pending' | 'failed';
  details?: {
    bonusType: string;
    sourceUser: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    networkLevel: number;
    dynamicCompressionLevel?: number;
  };
}

export interface ShopOrder {
  id: string;
  date: string;
  product: string;
  status: 'shipped' | 'completed' | 'pending';
  commission: number;
}

export interface CycleInfo {
  level: number;
  completed: boolean;
  participants: User[];
  personalConsumption: number;
  cycleTotal: number;
  divisionBase: number;
  amountReceived: number;
}

export interface NetworkNode extends User {
  level: number;
  children: NetworkNode[];
  isEmpty?: boolean;
}

export interface Invoice {
  id: string;
  customerName: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Subscription {
  id: string;
  planName: string;
  customerName: string;
  nextBillingDate: string;
  amount: number;
  status: 'active' | 'paused' | 'cancelled';
}

export interface AnticipationRequest {
  id: string;
  requestDate: string;
  requestedAmount: number;
  feeAmount: number;
  netAmount: number;
  status: 'approved' | 'pending' | 'denied';
}

export interface Lesson {
  id: string;
  title: string;
  videoId: string;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  iconName: string;
  modules: Module[];
}

export interface CDInfo {
  name: string;
  email: string;
  phone: string;
  address: Address;
  payment: {
    pixKey: {
      type: 'email' | 'cpf' | 'cnpj' | 'phone' | 'random' | 'pix';
      key: string;
    };
    apiKeys: {
      mercadoPago: string;
      pagSeguro: string;
      cielo: string;
      getnet: string;
      stone: string;
      pagoFacil: string;
      redLink: string;
      emax: string;
    }
  };
  shipping: {
    allowLocalPickup: boolean;
    apiKeys: {
      melhorEnvio: string;
      loggi: string;
      superFrete: string;
      correios: string;
      frenet: string;
    }
  }
}

export interface CDProduct {
  id: string;
  name: string;
  imageUrl: string;
  fullPrice: number;
  discount: number;
  pv: number;
}

export interface CDConsultantOrder {
  id: string;
  date: string;
  consultant: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shipping: {
    type: 'delivery' | 'pickup';
    cost: number;
    address?: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  total: number;
  status: 'pending_payment' | 'paid' | 'shipped' | 'completed';
}

export interface CDInventoryItem {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type MediaSubTool = 'Image' | 'Video';

export interface AppState {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  baseImage: string | null;
  baseImageMimeType: string | null;
  maskImage: string | null;
  maskImageMimeType: string | null;
  blendImage: string | null;
  blendImageMimeType: string | null;
  mediaSubTool: MediaSubTool;
}

export interface MediaResult {
  type: 'image' | 'video';
  url: string;
  text: string;
  base64: string;
  mimeType: string;
}

export interface Creation {
  id: string;
  prompt: string;
  mediaResult: MediaResult;
  createdAt: string;
  appState: AppState;
}

export type SocialPlatform = 'Instagram' | 'Facebook' | 'X' | 'TikTok' | 'LinkedIn';

export type WorkflowNodeType =
  // Start
  | 'start'
  // Triggers
  | 'newUser'
  | 'schedule'
  | 'webhook'
  | 'newSale'
  | 'pinAchieved'
  | 'birthday'
  // Actions
  | 'whatsappMessage'
  | 'instagramPost'
  | 'facebookPost'
  | 'tiktokPost'
  | 'youtubeVideo'
  | 'sendEmail'
  | 'googleSheetAddRow'
  | 'discordMessage'
  | 'linkedInPost'
  // Logic
  | 'delay'
  | 'condition'
  | 'loop'
  // AI
  | 'aiAction'
  | 'aiContent'
  | 'aiDecision';


export interface WorkflowNodeParameter {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'readonly' | 'select';
  value: string;
  description?: string;
  options?: { value: string; label: string }[];
}

export interface WorkflowNodeOutput {
  name: string; // e.g., 'newUser.name'
  label: string; // e.g., 'Nome do Novo Indicado'
  description?: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  parameters: WorkflowNodeParameter[];
  outputs?: WorkflowNodeOutput[];
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // e.g., 'true', 'false', 'loop', 'done', 'error'
}
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive?: boolean;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  grayscale: number;
  invert: number;
  hueRotate: number;
  blur: number;
}

export interface ImageTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
}

export interface EditHistory {
  adjustments: ImageAdjustments;
  transform: ImageTransform;
}

export interface Incentive {
  id: string;
  name: string;
  progress: number;
  target: number;
}