import { ReturnRequest } from '../types';

export const returns: ReturnRequest[] = [
  {
    id: 'RET-001',
    orderId: '#2024-001',
    customerName: 'Carlos Silva',
    customerEmail: 'carlos.silva@example.com',
    requestDate: '2024-07-29T14:00:00Z',
    items: [
      { productId: '1', productName: 'Relógio de Pulso Clássico de Couro', quantity: 1, reason: 'Defeito no fecho' },
    ],
    status: 'Pendente',
    resolutionType: 'Troca',
  },
  {
    id: 'RET-002',
    orderId: '#2024-004',
    customerName: 'Ana Costa',
    customerEmail: 'ana.costa@example.com',
    requestDate: '2024-07-28T09:30:00Z',
    items: [
      { productId: '2', productName: 'Bolsa de Ombro de Designer em Couro', quantity: 1, reason: 'Não gostei da cor' },
    ],
    status: 'Aprovada',
    resolutionType: 'Reembolso',
  },
    {
    id: 'RET-003',
    orderId: '#2024-005',
    customerName: 'Lucas Martins',
    customerEmail: 'lucas.martins@example.com',
    requestDate: '2024-07-27T11:00:00Z',
    items: [
      { productId: '2', productName: 'Bolsa de Ombro de Designer em Couro', quantity: 1, reason: 'Tamanho incorreto' },
    ],
    status: 'Concluída',
    resolutionType: 'Troca',
  },
];
