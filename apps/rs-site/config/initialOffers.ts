import { Offer } from '../types';

export const initialOffers: Offer[] = [
  {
    id: 'bump_1',
    type: 'order_bump',
    name: 'Order Bump Principal',
    triggerProductIds: ['prod-p1'],
    offerProductId: 'prod-d1',
    discountPercentage: 20,
    headline: '🔥 OFERTA ESPECIAL! 🔥',
    description: 'Adicione nosso Gerenciador de Mídias Sociais ao seu pedido com 20% de desconto!',
    imageUrl: 'https://picsum.photos/seed/dprod1-1/800/800',
    isActive: true,
  },
  {
    id: 'upsell_1',
    type: 'upsell',
    name: 'Upsell Principal',
    triggerProductIds: ['prod-d1'],
    offerProductId: 'prod-p1',
    discountPercentage: 15,
    headline: 'Espere! Sua compra está quase completa...',
    description: 'Aproveite para levar nosso Kit de Suplementos Essenciais com um desconto exclusivo de 15%!',
    imageUrl: 'https://picsum.photos/seed/pprod1-1/800/800',
    isActive: true,
  }
];
