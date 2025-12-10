/**
 * RS Prólipsi - WalletPay Contracts
 */

export interface WalletTransaction {
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    category: 'bonus' | 'purchase' | 'withdrawal' | 'refund' | 'transfer';
    description: string;
    referenceId?: string;
    metadata?: Record<string, any>;
}

export interface WalletBalance {
    userId: string;
    available: number;
    blocked: number;
    future: number;
    currency: string;
}

export interface PaymentRequest {
    orderId: string;
    amount: number;
    method: 'pix' | 'credit_card' | 'wallet';
    payer: {
        name: string;
        email: string;
        document: string;
    };
}
