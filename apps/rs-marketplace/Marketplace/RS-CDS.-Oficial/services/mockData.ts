

import { CDProfile, Order, Product, Transaction, SettingsData, Customer, CDRegistry, FranchiseRule, ExternalConsultant, ReplenishmentOrder, GlobalSalesOrder } from '../types';

// Perfil inicial para Produção (Aguardando Configuração)
export const mockProfile: CDProfile = {
  id: '',
  name: 'CD (Não Configurado)',
  type: 'PROPRIO',
  managerName: '',
  avatarUrl: '', // Inicia sem foto
  region: '',
  walletBalance: 0.00,
  activeCustomers: 0,
  monthlyCycles: 0
};

// Configurações Limpas para Inserção de Dados Reais
export const mockSettings: SettingsData = {
  profile: {
    fantasyName: '',
    companyName: '',
    document: '',
    email: '',
    phone: '',
    avatarUrl: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  },
  bank: {
    bankName: '',
    accountType: 'CORRENTE',
    agency: '',
    accountNumber: '',
    pixKey: '',
    pixKeyType: 'CNPJ'
  },
  paymentGateway: {
    provider: 'MERCADO_PAGO',
    enabled: false,
    apiKey: '', // Chave Pública
    apiToken: '', // Access Token / Secret
    environment: 'PRODUCTION'
  },
  shippingGateway: {
    provider: 'MELHOR_ENVIO',
    enabled: false,
    apiToken: '',
    environment: 'PRODUCTION'
  }
};

// Arrays vazios para início da operação real
export const mockCustomers: Customer[] = [];
export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
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