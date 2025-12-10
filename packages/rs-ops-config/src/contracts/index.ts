/**
 * RS Prólipsi - Shared Contracts
 * Interfaces para comunicação entre serviços
 */

// --- LOGISTICA ---

export interface OrderPayload {
    userId: string;
    products: Array<{
        id: string;
        qty: number;
    }>;
    cdId: string;
    shippingAddress: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

export interface PaymentConfirmation {
    orderId: string;
    paymentId: string;
    amount: number;
    timestamp: string;
}

export interface TrackingUpdate {
    orderId: string;
    status: 'pending' | 'preparing' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'completed' | 'delivery_failed';
    location?: {
        lat: number;
        lng: number;
        description?: string;
    };
    estimatedDelivery?: string;
}

// --- CORE (SIGMA) ---

export interface CloseCyclePayload {
    consultorId: string;
    orderId: string;
    cycleValue: number;
    timestamp: string;
}

// --- WALLETPAY ---

export interface WalletTransaction {
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    referenceId?: string; // orderId, etc
}
