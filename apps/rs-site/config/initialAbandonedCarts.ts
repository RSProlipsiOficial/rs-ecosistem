import { AbandonedCart } from '../types';

export const initialAbandonedCarts: AbandonedCart[] = [
    {
        id: 'cart_1',
        customerEmail: 'cliente.exemplo@email.com',
        items: [], // This should be populated dynamically
        cartValue: 189.90,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        recoveryStatus: 'pending',
    },
    {
        id: 'cart_2',
        customerEmail: 'outro.cliente@email.com',
        items: [],
        cartValue: 99.90,
        lastSeen: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago
        recoveryStatus: 'sent',
    }
];
