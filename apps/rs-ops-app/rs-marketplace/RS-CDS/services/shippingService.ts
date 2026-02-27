
import { CDProfile } from '../types';

export interface ShippingQuote {
    id: string;
    service: string;
    carrier: string;
    price: number;
    delivery_time: number;
    isPickup?: boolean;
}

export const shippingService = {
    /**
     * Calcula o frete seguindo a lógica da Matriz SIGME/API
     */
    async calculateShipping(profile: CDProfile, cart: any[]): Promise<ShippingQuote[]> {
        const destinationCep = profile.address?.cep?.replace(/\D/g, '') || '';
        const originCep = '83301010'; // CEP da Fábrica/Sede (Exemplo baseado no código da API)

        if (!destinationCep) {
            console.warn("[ShippingService] CEP de destino não informado.");
            return [];
        }

        const totalWeight = cart.reduce((acc, item) => acc + (item.quantity * (item.product.weightKg || 0.5)), 0);
        const subtotal = cart.reduce((acc, item) => acc + (item.product.costPrice * item.quantity), 0);

        // [LOGÍSTICA SIGME] Regra de Retirada Grátis
        // Faixas PR (Curitiba/Piraquara): 80-83
        const isLocal = destinationCep.startsWith('80') ||
            destinationCep.startsWith('81') ||
            destinationCep.startsWith('82') ||
            destinationCep.startsWith('83');

        // Em uma implementação real, chamaríamos: ${process.env.VITE_API_URL}/v1/shipping/calculate
        // Como o Roberto quer ver a lógica "vínculada", vamos replicar o motor da API aqui para o simualdo ser PRECISO

        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mágica dos cálculos baseados na API (shipping.routes.js)
        // Fallbacks oficiais da API: PAC (12.90) e SEDEX (15.90) + Adicionais de Peso
        const basePAC = 12.90;
        const baseSEDEX = 15.90;
        const weightAddon = totalWeight * 4.5; // Fator de peso SIGME
        const insuranceAddon = subtotal * 0.01; // 1% de seguro

        const quotes: ShippingQuote[] = [];

        // 1. Retirada (Se local)
        if (isLocal) {
            quotes.push({
                id: 'pickup',
                service: 'PICKUP',
                carrier: 'Retirada na Fábrica (SIGME)',
                price: 0,
                delivery_time: 0,
                isPickup: true
            });
        }

        // 2. Transportadora (Standard/PAC)
        quotes.push({
            id: 'standard',
            service: 'STANDARD',
            carrier: 'PAC (Correios)',
            price: basePAC + weightAddon + insuranceAddon,
            delivery_time: 5
        });

        // 3. Expressa (SEDEX)
        quotes.push({
            id: 'express',
            service: 'EXPRESS',
            carrier: 'SEDEX (Correios)',
            price: baseSEDEX + weightAddon + (insuranceAddon * 1.5),
            delivery_time: 2
        });

        return quotes;
    }
};
