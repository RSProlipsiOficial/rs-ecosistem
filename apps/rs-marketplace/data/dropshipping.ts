import { DropshippingProduct, DropshippingOrder } from '../types';

export const dropshippingProducts: DropshippingProduct[] = [
  {
    id: 'DS-001',
    name: 'Fone de Ouvido Sem Fio ProSound X5',
    supplier: 'TechSupplier Inc.',
    costPrice: 120.00,
    suggestedRetailPrice: 249.90,
    images: ['https://picsum.photos/seed/headphone/600/600'],
    description: 'Experimente a liberdade do áudio sem fio com o ProSound X5. Cancelamento de ruído ativo, bateria de 20 horas e design ergonômico.',
    category: 'Eletrônicos',
    inventory: 500,
  },
  {
    id: 'DS-002',
    name: 'Smartwatch Fitness Tracker',
    supplier: 'HealthGadgets',
    costPrice: 85.50,
    suggestedRetailPrice: 199.90,
    images: ['https://picsum.photos/seed/smartwatch/600/600'],
    description: 'Monitore sua saúde e atividades físicas com este smartwatch completo. Medidor de frequência cardíaca, contador de passos e notificações inteligentes.',
    category: 'Eletrônicos',
    inventory: 1200,
  },
  {
    id: 'DS-003',
    name: 'Mochila Urbana Anti-furto',
    supplier: 'UrbanGear',
    costPrice: 95.00,
    suggestedRetailPrice: 219.00,
    images: ['https://picsum.photos/seed/backpack/600/600'],
    description: 'Mochila com design moderno, compartimento para notebook, porta USB para carregamento e zíperes ocultos para maior segurança.',
    category: 'Acessórios',
    inventory: 350,
  },
];

export const dropshippingOrders: DropshippingOrder[] = [
  {
    id: 'DSO-001',
    orderId: '#2024-001',
    supplier: 'TechSupplier Inc.',
    supplierOrderId: 'TS-98765',
    date: '2024-07-28T10:35:00Z',
    items: [
      { productId: 'DS-001', productName: 'Fone de Ouvido Sem Fio ProSound X5', quantity: 1, costPrice: 120.00 },
    ],
    totalCost: 120.00,
    status: 'Enviado',
    trackingCode: 'LP123456789CN',
  },
  {
    id: 'DSO-002',
    orderId: '#2024-002',
    supplier: 'HealthGadgets',
    supplierOrderId: 'HG-A5B4C',
    date: '2024-07-28T11:50:00Z',
    items: [
      { productId: 'DS-002', productName: 'Smartwatch Fitness Tracker', quantity: 2, costPrice: 85.50 },
    ],
    totalCost: 171.00,
    status: 'Processando',
  }
];
