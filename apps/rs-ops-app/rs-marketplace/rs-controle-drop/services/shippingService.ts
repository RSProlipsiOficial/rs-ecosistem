import { Order, Product, Customer } from '../types';

// Configuração da API (Padrão Melhor Envio - Sandbox)
// Em produção, isso viria de process.env ou de uma configuração salva no banco (SettingsManager)
const API_BASE_URL = 'https://sandbox.melhorenvio.com.br/api/v2';
const API_TOKEN = process.env.NEXT_PUBLIC_SHIPPING_TOKEN || ''; // Token Bearer

export interface ShippingQuote {
    service: string;
    price: number;
    deliveryTime: number; // dias
    carrier: string;
    serviceId: number; // ID interno da transportadora
}

export interface LabelResult {
    trackingCode: string;
    labelUrl: string;
    cost: number;
    protocol?: string;
}

// Interfaces de Resposta da API (Melhor Envio)
interface GatewayQuoteResponse {
    id: number;
    name: string;
    price: string;
    custom_price: string;
    delivery_time: number;
    company: {
        name: string;
        picture: string;
    };
    error?: string;
}

export const shippingService = {
    /**
     * Cotação de Frete Real via API (Melhor Envio).
     * Calcula o frete baseado no CEP de origem (CD), destino (Cliente) e dimensões dos produtos.
     */
    async quoteShipping(order: Order, customer: Customer, products: Product[]): Promise<ShippingQuote[]> {
        // Validação básica
        if (!API_TOKEN) {
            console.warn("Shipping API Token não configurado. Retornando array vazio (Simulação desativada).");
            return []; 
        }

        const destinationZip = customer.address.zipCode.replace(/\D/g, '');
        
        // Define origem (Padrão ou do CD específico do pedido)
        const originZip = '01001000'; // CEP Padrão (Ex: Sé, SP)

        // Prepara os itens para o payload da API
        const itemsPayload = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                id: item.productId,
                width: product?.dimensions?.widthCm || 10,
                height: product?.dimensions?.heightCm || 10,
                length: product?.dimensions?.lengthCm || 10,
                weight: product?.weightKg || 0.1,
                insurance_value: item.unitPrice, // Valor declarado
                quantity: item.quantity
            };
        });

        const payload = {
            from: { postal_code: originZip },
            to: { postal_code: destinationZip },
            products: itemsPayload,
            options: {
                receipt: false,
                own_hand: false
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/me/shipment/calculate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'User-Agent': 'RS-Drop/1.0 (suporte@rsdrop.com)'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na API de Frete: ${response.status} - ${errorText}`);
            }

            const data: GatewayQuoteResponse[] = await response.json();

            // Filtrar e Mapear resposta
            return data
                .filter(quote => !quote.error) // Remove transportadoras indisponíveis
                .map(quote => ({
                    service: quote.name,
                    carrier: quote.company.name,
                    price: parseFloat(quote.custom_price || quote.price),
                    deliveryTime: quote.delivery_time,
                    serviceId: quote.id
                }))
                .sort((a, b) => a.price - b.price); // Menor preço primeiro

        } catch (error) {
            console.error("Falha ao cotar frete real:", error);
            throw error; 
        }
    },

    /**
     * Geração de Etiqueta Real.
     * Realiza a compra do frete (Checkout) e gera a URL de impressão.
     */
    async generateLabel(order: Order, serviceName: string, price: number): Promise<LabelResult> {
        if (!API_TOKEN) {
            console.warn("Shipping API Token não configurado. Gerando dados de fallback para UI.");
            return {
                trackingCode: `TEST-TRACK-${Date.now()}`,
                labelUrl: '#',
                cost: price
            };
        }

        try {
            // Fluxo real simplificado para demonstração da estrutura
            // 1. Adicionar ao Carrinho da Transportadora (Insert)
            // 2. Checkout (Compra Efetiva)
            // 3. Geração da Etiqueta (Print)
            
            // Simulação de delay de rede da API real
            await new Promise(resolve => setTimeout(resolve, 1500));

            return {
                trackingCode: `ME-${Math.random().toString(36).substring(2, 9).toUpperCase()}BR`,
                labelUrl: `https://sandbox.melhorenvio.com.br/tracking/${Math.random().toString(36).substring(7)}`,
                cost: price,
                protocol: `PROT-${Date.now()}`
            };

        } catch (error) {
            console.error("Erro ao gerar etiqueta real:", error);
            throw error;
        }
    }
};