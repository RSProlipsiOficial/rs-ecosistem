

import { CDProfile, Order, Product, Transaction, SettingsData, Customer, CDRegistry, FranchiseRule, ExternalConsultant, ReplenishmentOrder, GlobalSalesOrder } from '../types';

// Perfil inicial para Produção (Aguardando Configuração)
export const mockProfile: CDProfile = {
  id: 'CD-01',
  name: 'CD São Paulo Central',
  type: 'PROPRIO',
  managerName: 'Roberto Santos',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  region: 'São Paulo - SP',
  walletBalance: 15450.00,
  activeCustomers: 124,
  monthlyCycles: 45
};

// Configurações Limpas para Inserção de Dados Reais
export const mockSettings: SettingsData = {
  profile: {
    fantasyName: 'CD São Paulo Central',
    companyName: 'RS Logística Ltda',
    document: '12.345.678/0001-90',
    email: 'contato@cdsp.com.br',
    phone: '(11) 99999-0000',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    address: {
      cep: '01001-000',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 101',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    }
  },
  bank: {
    bankName: 'Banco do Brasil',
    accountType: 'CORRENTE',
    agency: '1234',
    accountNumber: '56789-0',
    pixKey: '12.345.678/0001-90',
    pixKeyType: 'CNPJ'
  },
  paymentGateway: {
    provider: 'MERCADO_PAGO',
    enabled: true,
    apiKey: 'TEST-123456',
    apiToken: 'TEST-SECRET-123456',
    environment: 'SANDBOX'
  },
  shippingGateway: {
    provider: 'MELHOR_ENVIO',
    enabled: true,
    apiToken: 'TEST-TOKEN',
    environment: 'SANDBOX'
  }
};

// Arrays preenchidos para demonstração
export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Ana Clara',
    email: 'ana.clara@email.com',
    phone: '(11) 98888-1111',
    lastPurchaseDate: '2025-02-20',
    ordersCount: 5,
    totalSpent: 1250.00,
    status: 'ATIVO'
  },
  {
    id: 'CUST-002',
    name: 'Bruno Ferreira',
    email: 'bruno.ferreira@email.com',
    phone: '(11) 97777-2222',
    lastPurchaseDate: '2025-02-15',
    ordersCount: 2,
    totalSpent: 450.00,
    status: 'ATIVO'
  },
  {
    id: 'CUST-003',
    name: 'Carla Dias',
    email: 'carla.dias@email.com',
    phone: '(11) 96666-3333',
    lastPurchaseDate: '2024-12-10',
    ordersCount: 1,
    totalSpent: 120.00,
    status: 'INATIVO'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Shake Morango',
    sku: 'SHK-MOR-01',
    price: 120.00,
    costPrice: 60.00,
    stockLevel: 50,
    minStock: 10,
    points: 50,
    category: 'Nutrição',
    status: 'OK'
  },
  {
    id: 'PROD-002',
    name: 'Chá Verde Detox',
    sku: 'CHA-VRD-01',
    price: 85.00,
    costPrice: 35.00,
    stockLevel: 120,
    minStock: 20,
    points: 30,
    category: 'Bebidas',
    status: 'OK'
  },
  {
    id: 'PROD-003',
    name: 'Colágeno Hidrolisado',
    sku: 'COL-HID-01',
    price: 150.00,
    costPrice: 70.00,
    stockLevel: 5,
    minStock: 15,
    points: 60,
    category: 'Suplementos',
    status: 'BAIXO'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    consultantName: 'Ana Clara',
    consultantPin: '12345',
    date: '2025-02-24',
    total: 240.00,
    totalPoints: 100,
    status: 'CONCLUIDO',
    type: 'ENTREGA',
    items: 2,
    productsDetail: [
      { productId: 'PROD-001', productName: 'Shake Morango', quantity: 2, unitPrice: 120.00, points: 50 }
    ]
  },
  {
    id: 'ORD-2025-002',
    consultantName: 'Bruno Ferreira',
    consultantPin: '67890',
    date: '2025-02-25',
    total: 85.00,
    totalPoints: 30,
    status: 'PENDENTE',
    type: 'RETIRADA',
    items: 1,
    productsDetail: [
      { productId: 'PROD-002', productName: 'Chá Verde Detox', quantity: 1, unitPrice: 85.00, points: 30 }
    ]
  }
];
export const mockTransactions: Transaction[] = [];

// Dados Corporativos (Administrador) - Iniciando vazio
export const mockCDRegistry: CDRegistry[] = [];

export const mockFranchiseRules: FranchiseRule = {
  initialCost: 0,
  royaltyPercentage: 0,
  minStockPurchase: 0,
  marketingFee: 0,
  allowedPaymentMethods: ['PIX', 'BOLETO'],
  contractTerms: '',
  active: false
};

// --- NOVOS MOCKS PARA FUNCIONALIDADES ADICIONADAS ---

// Simulação de banco de dados da empresa principal (RS Prólipsi)
export const mockExternalConsultants: ExternalConsultant[] = [
  { id: '1001', name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 99999-1001', cpf: '123.456.789-00', level: 'DIAMANTE', status: 'ATIVO' },
  { id: '1002', name: 'Mariana Costa', email: 'mariana@email.com', phone: '(21) 98888-2002', cpf: '234.567.890-11', level: 'PRESIDENTE', status: 'ATIVO' },
  { id: '1003', name: 'Roberto Almeida', email: 'roberto@email.com', phone: '(31) 97777-3003', cpf: '345.678.901-22', level: 'OURO', status: 'INATIVO' },
];

// Simulação de Pedidos de Abastecimento (CD -> Matriz)
export const mockReplenishmentOrders: ReplenishmentOrder[] = [
  {
    id: 'REQ-2025-001',
    cdId: 'CD-01',
    cdName: 'CD São Paulo Zona Sul',
    date: '2025-02-25',
    itemsCount: 150,
    totalValue: 4500.00,
    status: 'PENDENTE',
    shippingMethod: 'Transportadora Padrão',
    items: [
      { sku: 'PROD-001', name: 'Shake Morango', quantity: 100, unitCost: 35.00 },
      { sku: 'PROD-002', name: 'Chá Verde', quantity: 50, unitCost: 20.00 },
    ]
  },
  {
    id: 'REQ-2025-002',
    cdId: 'CD-05',
    cdName: 'CD Rio de Janeiro Barra',
    date: '2025-02-24',
    itemsCount: 300,
    totalValue: 9800.00,
    status: 'ENVIADO',
    trackingCode: 'BR123456789TR',
    shippingMethod: 'Entrega Expressa',
    items: [
      { sku: 'PROD-005', name: 'Colágeno', quantity: 150, unitCost: 40.00 },
      { sku: 'PROD-001', name: 'Shake Morango', quantity: 150, unitCost: 35.00 },
    ]
  }
];

// Histórico Global de Vendas (Todos os CDs) - Vazio para produção
export const mockGlobalSales: GlobalSalesOrder[] = [];