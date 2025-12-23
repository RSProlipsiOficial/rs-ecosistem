import { Cart, Customer, Order } from '../types';

export type AntiFraudStatus = 'approved' | 'rejected' | 'pending' | 'error';

export interface AntiFraudResponse {
    status: AntiFraudStatus;
    score: number; // 0 a 100 (0 = seguro, 100 = fraude)
    transactionId: string;
    message?: string;
}

// Configuração (Em produção, viria de variáveis de ambiente)
const ANTIFRAUD_API_URL = 'https://api.clearsale.com.br/api/v1/orders'; // Exemplo
const API_TOKEN = process.env.NEXT_PUBLIC_ANTIFRAUD_TOKEN || '';

export const antiFraudService = {
    /**
     * Analisa o risco de uma transação antes da captura do pagamento.
     */
    async analyzeOrder(
        cart: Cart, 
        customerInfo: { name: string; email: string; phone: string; document?: string },
        shippingAddress: any,
        paymentHash: string // Token do cartão ou hash do pagamento
    ): Promise<AntiFraudResponse> {
        
        // 1. Construção do Payload (Padrão de Mercado - ClearSale/Konduto)
        const payload = {
            code: cart.id,
            session_id: 'sess_' + crypto.randomUUID(), // Device Fingerprint ID
            date: new Date().toISOString(),
            email: customerInfo.email,
            phone: customerInfo.phone,
            document: customerInfo.document,
            name: customerInfo.name,
            total: cart.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
            items: cart.items.map(i => ({
                id: i.productId,
                title: i.productName,
                unit_price: i.unitPrice,
                quantity: i.quantity,
                risk: 'Low' // Categoria do produto
            })),
            billing: {
                name: customerInfo.name,
                address: shippingAddress 
            },
            shipping: {
                name: customerInfo.name,
                address: shippingAddress,
                delivery_type: 'Express'
            },
            payments: [{
                type: 'CreditCard',
                bin: '411111', 
                end: '1111',   
                amount: cart.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
            }]
        };

        try {
            // --- SIMULAÇÃO DE RESPOSTA DA API ---
            // Simula latência de rede e regras de negócio para teste de UI
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            const emailLower = customerInfo.email.toLowerCase();
            const totalValue = payload.total;

            // REGRA 1: Simular Fraude (Recusado)
            if (emailLower.includes('fraude') || emailLower.includes('rejeitar')) {
                return {
                    status: 'rejected',
                    score: 95.5,
                    transactionId: `AF-${Date.now()}-REJ`,
                    message: 'Alto risco de fraude detectado. Score: 95/100'
                };
            }

            // REGRA 2: Simular Análise Manual (Pendente)
            if (emailLower.includes('analise') || totalValue > 5000) {
                return {
                    status: 'pending',
                    score: 65.0,
                    transactionId: `AF-${Date.now()}-REV`,
                    message: 'Pedido em revisão manual. Score: 65/100'
                };
            }

            // PADRÃO: Aprovado
            return {
                status: 'approved',
                score: 12.5,
                transactionId: `AF-${Date.now()}-APR`,
                message: 'Baixo risco. Transação autorizada automaticamente.'
            };

        } catch (error) {
            console.error("Erro no serviço antifraude:", error);
            return {
                status: 'error',
                score: 0,
                transactionId: 'ERR-' + Date.now(),
                message: 'Erro técnico na verificação. Enviado para análise preventiva.'
            };
        }
    }
};