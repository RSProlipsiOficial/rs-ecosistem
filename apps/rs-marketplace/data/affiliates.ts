import { Affiliate } from '../types';

export const affiliates: Affiliate[] = [
  {
    id: 'AFF-001',
    name: 'Juliana Paes',
    email: 'juliana.paes@influencer.com',
    commissionRate: 15,
    referralCode: 'JULIANA15',
    totalSales: 25890.50,
    totalEarnings: 3883.58,
    paidOut: 3000.00,
  },
  {
    id: 'AFF-002',
    name: 'Marcos Mion',
    email: 'marcos.mion@parceiro.com',
    commissionRate: 12,
    referralCode: 'MION12',
    totalSales: 15230.00,
    totalEarnings: 1827.60,
    paidOut: 1500.00,
  },
  {
    id: 'AFF-003',
    name: 'Blog da Beleza',
    email: 'contato@blogdabeleza.com.br',
    commissionRate: 20,
    referralCode: 'BELEZA20',
    totalSales: 45780.00,
    totalEarnings: 9156.00,
    paidOut: 8000.00,
  },
];
