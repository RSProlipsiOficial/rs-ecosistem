// types.ts

export interface UplinePayment {
  recipientId: number;
  recipientName: string;
  bonusType: 'Profundidade' | 'Plano de Carreira' | 'Top SIGME' | 'Matriz SIGMA';
  theoreticalLevel: number;
  effectiveLevel: number; // For dynamic compression
  amount: number;
}

export interface PurchaseEvent {
  id: string; // purchase/order ID
  date: string;
  description: string; // e.g., "Compra de Ativação", "Pedido #1256"
  totalValue: number;
  uplinePayments: UplinePayment[];
}

export interface ConsultantPermissions {
  name: boolean;
  cpfCnpj: boolean;
  contact: {
    email: boolean;
    phone: boolean;
  };
  address: {
    street: boolean;
    city: boolean;
    state: boolean;
    zip: boolean;
  };
  bankInfo: {
    bank: boolean;
    agency: boolean;
    account: boolean;
  };
  pin: boolean;
  cycle: boolean;
  network: boolean;
  networkDetails: {
    directs: boolean;
    l1: boolean;

    l2: boolean;
    l3: boolean;
  };
  balance: boolean;
  status: boolean;
}


export interface Consultant {
  id: number | string;
  uuid?: string;
  code?: string;
  username?: string;
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
  };

  // Dados de Negócio
  cycle: number;
  networkDetails: {
    directs: number;
    l1: number;
    l2: number;
    l3: number;
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
  directsCount?: number;
  teamSize?: number;
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
