/**
 * RS Prólipsi - Logistics Contracts
 * Baseado em README-LOGISTICA.md
 */

export interface LogisticsOrderPayload {
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

export interface LogisticsPaymentConfirmation {
    orderId: string;
    paymentId: string;
    amount: number;
    timestamp?: string;
}

export interface LogisticsTrackingUpdate {
    orderId: string;
    status: 'pending' | 'preparing' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'completed' | 'delivery_failed';
    location?: {
        lat: number;
        lng: number;
        description?: string;
    };
    estimatedDelivery?: string;
}

export interface CDInventoryItem {
    productId: string;
    cdId: string;
    quantity: number;
    reserved: number;
    available: number;
    threshold: number;
    status: 'available' | 'low_stock' | 'out_of_stock';
}
