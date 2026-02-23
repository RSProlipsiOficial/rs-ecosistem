// types.ts

export interface UplinePayment {
  recipientId: number;
  recipientName: string;
  bonusType: 'Profundidade' | 'Plano de Carreira' | 'Top SIGME' | 'Matriz SIGMA';
  theoreticalLevel: number;
  effectiveLevel: number; // For dynamic compression
  amount: number;
}

export type BonusPayment = UplinePayment;

export interface PurchaseEvent {
  id: string; // purchase/order ID
  date: string;
  description: string; // e.g., "Compra de Ativação", "Pedido #1256"
  totalValue: number;
  uplinePayments: UplinePayment[];
  items: { name: string; qty: number; }[];
}

export interface ConsultantPermissions {
  // Field Locks (Cadeadinhos)
  personalDataLocked: boolean;
  bankDataLocked: boolean;

  // System/Bonus Permissions (Eligibility)
  bonus_cycle: boolean;
  bonus_fidelity: boolean;
  bonus_matrix_fidelity: boolean;
  bonus_leadership: boolean;
  bonus_career: boolean; // Novo: Bônus de Carreira
  bonus_digital: boolean; // Novo: Bônus Digital (Drop)
  access_platform: boolean;
}

export interface Consultant {
  id: number | string;
  uuid?: string;
  code?: string;
  username?: string;
  registration_order?: number;
  name: string;
  avatar: string;
  pin: string;
  network: string; // Rede
  balance: number;
  status: 'Ativo' | 'Inativo' | 'Pendente';

  // Dados Cadastrais
  cpfCnpj: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  bankInfo: {
    bank: string;
    agency: string;
    account: string;
    pixType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'CELULAR' | 'ALEATORIA';
    pixKey?: string;
  };

  // Dados de Negócio
  cycle: number;
  networkDetails: {
    directs: number;
    // L1, L2, L3 removed as obsolete
  };
  activationHistory: {
    date: string;
    event: string;
  }[];

  // Financeiro
  walletStatement: {
    date: string;
    description: string;
    amount: number;
  }[];

  // Permissões
  permissions: ConsultantPermissions;

  // New fields for User Report
  sponsor: { id: number | string; name: string } | null;
  registrationDate: string;
  salesHistory: Array<{
    id: string;
    date: string;
    items: { name: string; qty: number }[];
    total: number;
  }>;
  commissionHistory: Array<{
    id: string;
    date: string;
    bonusType: 'Matriz SIGMA' | 'Top SIGME' | 'Fidelidade' | 'Plano de Carreira' | 'Profundidade';
    description: string;
    points: number;
    amount: number;
    status: 'Pago' | 'Pendente';
  }>;
  purchaseHistory: PurchaseEvent[];

  // Enriched metrics (optional)
  sigmaActive?: boolean;
  sigmaCyclesMonth?: number;
  careerPoints?: number;
  careerPinCurrent?: string;
  careerPinNext?: { name: string; pointsRemaining: number } | null;
  topSigmaPosition?: number | null;
  totalSales?: number;
  teamSales?: number;
  teamSize?: number;

  // Digital Career (Drop)
  digitalCareerPoints?: number;
  digitalCareerPinCurrent?: string;
  digitalCareerPinNext?: { name: string; pointsRemaining: number } | null;
}

export interface Product {
  id: number;
  name: string;
  images: string[]; // First image is primary
  sku: string;
  description: string;
  category: string;
  tags: string[];
  fullPrice: number; // Preço cheio / sugerido para o cliente final
  consultantPrice: number; // Preço com desconto para o consultor
  costPrice: number; // Custo do produto para a empresa
  stock: number;
  trackStock: boolean;
  status: 'Ativo' | 'Inativo';
  mlm: {
    qualifiesForCycle: boolean;
  };
}

export interface OrderItem {
  productId: number;
  productName: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'Pendente' | 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';

export interface Order {
  id: string; // e.g., '#1256'
  customer: {
    id: number;
    name: string;
    email: string;
  };
  date: string;
  total: number;
  payment: {
    method: 'PIX' | 'Cartão' | 'Boleto';
    status: 'Aprovado' | 'Pendente' | 'Recusado';
  };
  status: OrderStatus;
  items: OrderItem[];
  shipping: {
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    method: string;
    cost: number;
    trackingCode?: string;
  };
  history: {
    date: string;
    status: string;
    notes: string;
  }[];
}

// FIX: Moved Invoice type here to resolve circular dependency
export interface Invoice {
  id: string;
  orderId: string;
  customer: string;
  issueDate: string;
  total: number;
  status: 'Emitida' | 'Pendente' | 'Cancelada';
  orderData: Order;
}
export interface NetworkNode {
  id: string;
  name: string;
  pin: string;
  status: string;
  avatar: string;
  is_empty?: boolean;
  linha?: number;
  level?: number;
  directCount?: number;
  hasChildren?: boolean;
  children?: NetworkNode[];
}

// --- NOVOS TIPOS PARA GESTÃO DE REDE DE CDS (MIGRAÇÃO) ---

export type CDType = 'PROPRIO' | 'FRANQUIA' | 'HIBRIDO' | 'DIRETO DA SEDE';

export interface CDRegistry {
  id: string;
  name: string;
  managerName: string;
  managerId: string; // ID do Consultor no Sistema Principal
  email: string;
  phone: string;
  document?: string; // CPF ou CNPJ
  addressStreet?: string;
  addressNumber?: string;
  addressNeighborhood?: string;
  city: string;
  state: string;
  addressZip?: string;
  type: CDType;
  status: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE_APROVACAO';
  joinDate: string;
}

export interface FranchiseRule {
  initialCost: number;       // Custo de Adesão da Franquia
  royaltyPercentage: number; // Porcentagem sobre vendas
  minStockPurchase: number;  // Compra mínima inicial de estoque
  marketingFee: number;      // Taxa de Marketing
  commissionPercentage: number; // [NOVO] Porcentagem de desconto/comissão para o CD
  allowedPaymentMethods: ('PIX' | 'BOLETO' | 'CARTAO')[]; // Simplificado
  contractTerms: string;
  active: boolean;
}

// Interface para simular a busca no sistema legado da empresa
export interface ExternalConsultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  level: string; // Diamante, Ouro, etc.
  status: 'ATIVO' | 'INATIVO';
  joinDate: string;
}

// Pedido de Abastecimento (CD pedindo para Matriz)
export interface ReplenishmentOrder {
  id: string;
  cdId: string;
  cdName: string;
  date: string;
  itemsCount: number;
  totalValue: number;
  status: 'PENDENTE' | 'APROVADO' | 'ENVIADO' | 'ENTREGUE';
  trackingCode?: string;
  shippingMethod: string;
  items: {
    sku: string;
    name: string;
    quantity: number;
    unitCost: number;
  }[];
}

// Histórico Geral de Vendas (Todos os CDs vendendo para Consumidor Final)
export interface GlobalSalesOrder extends Order {
  cdId: string;
  cdName: string;
  consultantName: string;
  consultantPin: string;
  totalPoints: number;
}
