

export type CDType = 'PROPRIO' | 'FRANQUIA' | 'HIBRIDO';

export interface CDProfile {
  id: string;
  name: string;
  type: CDType;
  managerName: string;
  avatarUrl?: string; // Novo campo para foto de perfil
  region: string;
  walletBalance: number;
  activeCustomers: number;
  monthlyCycles: number;
}

export interface BankInfo {
  bankName: string;
  accountType: 'CORRENTE' | 'POUPANCA';
  agency: string;
  accountNumber: string;
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
}

export interface IntegrationConfig {
  provider: string;
  enabled: boolean;
  apiKey?: string;
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  environment: 'SANDBOX' | 'PRODUCTION';
}

export interface SettingsData {
  profile: {
    fantasyName: string;
    companyName: string; // Razão Social
    document: string; // CPF or CNPJ
    email: string;
    phone: string;
    avatarUrl?: string; // Novo campo nas configurações
    address: {
      cep: string;
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
    }
  };
  bank: BankInfo;
  paymentGateway: IntegrationConfig; // Mercado Pago, Stone, etc.
  shippingGateway: IntegrationConfig; // Melhor Envio, Kangu, etc.
}

export interface Batch {
  id: string;
  code: string;
  expirationDate: string; // YYYY-MM-DD
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockLevel: number;
  minStock: number;
  price: number;     // Preço de Varejo (Venda Tabela)
  memberPrice?: number; // Preço de Consultor (Base para markup e desconto CD)
  costPrice: number; // Preço de Custo (CD paga à fabrica)
  points: number;    // VP (Volume Points) - Crítico para MMN
  status: 'OK' | 'BAIXO' | 'CRITICO';
  batches?: Batch[]; // Controle de Lotes e Validade
  weightKg?: number;
  dimensions?: {
    widthCm: number;
    heightCm: number;
    lengthCm: number;
  };
}

export interface OrderDetail {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  points: number; // Pontos gerados por este item
}

export interface Order {
  id: string;
  consultantName: string;
  consultantPin: string;
  sponsorName?: string; // Nome do Patrocinador
  sponsorId?: string;   // ID do Patrocinador
  buyerCpf?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  date: string;
  time?: string;        // Horário do pedido/retirada
  total: number;
  totalPoints: number;  // Total de VP do pedido
  status: 'PENDENTE' | 'SEPARACAO' | 'AGUARDANDO_RETIRADA' | 'EM_TRANSPORTE' | 'CONCLUIDO';
  type: 'RETIRADA' | 'ENTREGA';
  items: number;
  trackingCode?: string;
  vehiclePlate?: string; // Placa do veículo de retirada/entrega
  productsDetail?: OrderDetail[]; // Lista detalhada de itens
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: number;
  ordersCount: number;
  status: 'ATIVO' | 'INATIVO';
}

export type PaymentMethod = 'WALLET' | 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'CASH';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'IN' | 'OUT'; // Entrada (Venda/Comissão) ou Saída (Compra Estoque/Saque)
  category: 'VENDA' | 'COMPRA_ESTOQUE' | 'COMISSAO' | 'SAQUE' | 'TAXA';
  amount: number;
  status: 'CONCLUIDO' | 'PENDENTE' | 'CANCELADO';
}

// Novos Tipos para o Painel Administrador (Corporativo)
export interface FranchiseRule {
  initialCost: number;       // Custo de Adesão da Franquia
  royaltyPercentage: number; // Porcentagem sobre vendas
  minStockPurchase: number;  // Compra mínima inicial de estoque
  marketingFee: number;      // Taxa de Marketing
  allowedPaymentMethods: PaymentMethod[];
  contractTerms: string;
  active: boolean;
}

export interface CDRegistry {
  id: string;
  name: string;
  managerName: string;
  managerId: string; // ID do Consultor no Sistema Principal
  email: string;
  phone: string;
  city: string;
  state: string;
  type: CDType;
  status: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE_APROVACAO';
  joinDate: string;
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
  cdRegion: string;
}

export type ViewState = 'DASHBOARD' | 'PEDIDOS' | 'ESTOQUE' | 'FINANCEIRO' | 'IA_ADVISOR' | 'CONFIGURACOES' | 'HISTORICO' | 'ABASTECIMENTOS';