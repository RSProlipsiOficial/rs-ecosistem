

import { Product, User, OrderBump } from './types';

export const MOCK_PRODUCT: Product = {
  id: 'prod_rs_001',
  name: 'Kit Início Rápido RS (Físico)',
  description: 'Caixa exclusiva com materiais de apoio, produtos físicos e acesso premium à plataforma RS Prólipsi.',
  price: 297.90,
  image: 'https://picsum.photos/400/400',
  type: 'PHYSICAL', // Changed to PHYSICAL to enable Address/Shipping flow
};

export const MOCK_ORDER_BUMP: OrderBump = {
  id: 'bump_mentoria_01',
  name: 'Acesso Vitalício + Mentoria',
  description: 'Leve também o acesso vitalício às gravações e uma sessão de mentoria em grupo.',
  price: 47.90,
  originalPrice: 97.90, // Shows a ~50% discount perceived value
  image: 'https://picsum.photos/100/100', // Removed ?grayscale for better conversion
};

export const MOCK_USER: User = {
  id: 'usr_consultant_99',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  role: 'CONSULTANT'
};

export const INSTALLMENTS_OPTIONS = [
  { value: 1, label: '1x sem juros' },
  { value: 2, label: '2x sem juros' },
  { value: 3, label: '3x sem juros' },
  { value: 4, label: '4x com juros' },
  { value: 5, label: '5x com juros' },
  { value: 6, label: '6x com juros' },
  { value: 12, label: '12x com juros' },
];

// RS Ecosystem Configs
export const POINTS_MULTIPLIER = 1.5; // 1 BRL = 1.5 SIGMA Points
export const WALLET_COMMISSION_PERCENTAGE = 0.20; // 20% commission
export const MOCK_WALLET_BALANCE = 50.00; // User's available balance for testing

// Coupons
export const VALID_COUPONS: Record<string, number> = {
  'PROLIPSI10': 0.10, // 10% off
  'BEMVINDO': 20.00,  // R$ 20 off
};