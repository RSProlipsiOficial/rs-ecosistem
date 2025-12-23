import { Customer, Product, Subscription, SubscriptionInterval } from '../types';

export interface GatewaySubscriptionResponse {
    id: string;
    status: 'active' | 'past_due' | 'canceled' | 'paused';
    current_period_end: string;
    plan: {
        id: string;
        interval: string;
        amount: number;
    };
}

export const paymentGatewayService = {
    /**
     * Cria uma assinatura recorrente no gateway de pagamento.
     */
    async createSubscription(
        customer: Customer, 
        product: Product, 
        interval: SubscriptionInterval,
        price: number
    ): Promise<GatewaySubscriptionResponse> {
        
        console.log(`[Gateway] Creating subscription for ${customer.name} - Plan: ${product.name} (${interval})`);

        // Simulação de chamada de rede
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!customer.email) {
                    reject(new Error("Dados do cliente incompletos para o gateway (Email)."));
                    return;
                }

                const mockResponse: GatewaySubscriptionResponse = {
                    id: `sub_${Math.random().toString(36).substring(2, 9)}`,
                    status: 'active',
                    current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                    plan: {
                        id: `plan_${product.id}`,
                        interval: interval,
                        amount: price * 100 
                    }
                };
                
                resolve(mockResponse);
            }, 1500);
        });
    },

    async cancelSubscription(subscriptionId: string): Promise<boolean> {
        console.log(`[Gateway] Canceling subscription ${subscriptionId}`);
        return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    },

    async pauseSubscription(subscriptionId: string): Promise<boolean> {
        console.log(`[Gateway] Pausing subscription ${subscriptionId}`);
        return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    },

    async resumeSubscription(subscriptionId: string): Promise<boolean> {
        console.log(`[Gateway] Resuming subscription ${subscriptionId}`);
        return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    },

    async syncSubscriptionStatus(subscriptionId: string): Promise<GatewaySubscriptionResponse['status']> {
        console.log(`[Gateway] Syncing status for ${subscriptionId}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const rand = Math.random();
                if (rand > 0.9) resolve('past_due');
                else if (rand > 0.95) resolve('canceled');
                else resolve('active');
            }, 1200);
        });
    }
};