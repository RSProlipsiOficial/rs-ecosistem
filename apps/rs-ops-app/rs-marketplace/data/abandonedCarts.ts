import { AbandonedCart } from '../types';

export const initialAbandonedCarts: AbandonedCart[] = [
  {
    id: 'ac-1',
    customerName: 'Joana Martins',
    customerEmail: 'joana.m@example.com',
    customerPhone: '11987654321',
    items: [
      { id: '2-default', productId: '2', variantId: 'default', name: 'Bolsa de Ombro de Designer em Couro', price: 2100.00, image: 'https://picsum.photos/seed/bag1/600/600', quantity: 1, variantText: '' }
    ],
    total: 2100.00,
    abandonedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    recoveryStatus: 'Não enviado',
  },
  {
    id: 'ac-2',
    customerName: 'Ricardo Alves',
    customerEmail: 'ricardo.alves@example.com',
    customerPhone: '21912345678',
    items: [
      { id: '1-var1', productId: '1', variantId: 'var1', name: 'Relógio de Pulso Clássico de Couro', price: 1250.00, image: 'https://picsum.photos/seed/watch1/600/600', quantity: 1, variantText: 'Cor da Pulseira: Marrom, Cor da Caixa: Prata' },
      { id: '4-default', productId: '4', variantId: 'default', name: 'Óculos de Sol Aviador Polarizados', price: 720.00, image: 'https://picsum.photos/seed/glasses1/600/600', quantity: 1, variantText: '' }
    ],
    total: 1970.00,
    abandonedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    recoveryStatus: 'Enviado',
  },
  {
    id: 'ac-3',
    customerName: 'Cliente Anônimo',
    customerEmail: 'visitante@email.com',
    customerPhone: '31999998888',
    items: [
      { id: '3-default', productId: '3', variantId: 'default', name: 'Caneta-tinteiro Executiva', price: 850.00, image: 'https://picsum.photos/seed/pen1/600/600', quantity: 2, variantText: '' }
    ],
    total: 1700.00,
    abandonedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    recoveryStatus: 'Recuperado',
  },
];