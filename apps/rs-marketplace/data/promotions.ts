import { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    id: 'CUP-001',
    code: 'BEMVINDO10',
    type: 'Porcentagem',
    value: 10,
    status: 'Ativo',
    usageCount: 45,
    usageLimit: 1000,
    startDate: '2024-07-01T00:00:00Z',
    endDate: null,
  },
  {
    id: 'CUP-002',
    code: 'INVERNO50',
    type: 'Valor Fixo',
    value: 50,
    status: 'Ativo',
    usageCount: 120,
    usageLimit: 500,
    startDate: '2024-06-15T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
  },
  {
    id: 'CUP-003',
    code: 'FRETEGRATIS',
    type: 'Valor Fixo', 
    value: 0,
    status: 'Inativo',
    usageCount: 250,
    usageLimit: null,
    startDate: '2024-05-01T00:00:00Z',
    endDate: '2024-05-31T23:59:59Z',
  },
];
