import { CDProfile } from '../types';

export interface ShippingQuote {
    id: string;
    service: string;
    carrier: string;
    price: number;
    delivery_time: number;
    isPickup?: boolean;
}

/**
 * Motor de frete do RS-CDS vinculado à Matriz SIGME.
 * Tenta a API real (porta 4000). Em caso de falha, usa os
 * valores-base oficiais da Matriz (PAC/SEDEX Correios).
 */
export const shippingService = {
    async calculateShipping(profile: CDProfile | null, cart: any[]): Promise<ShippingQuote[]> {
        const rawCep = profile?.address?.cep?.replace(/\D/g, '') || '';
        const originCep = '82210100'; // CEP da Sede RS Prólipsi

        // Detectar região local (Curitiba/Piraquara — frete grátis por retirada)
        const isLocal = rawCep.startsWith('80') || rawCep.startsWith('81') ||
            rawCep.startsWith('82') || rawCep.startsWith('83');

        // Calcular peso total dos itens do carrinho
        const totalWeight = cart.reduce((acc, item) => acc + ((item.product?.weightKg || 0.5) * (item.quantity || 1)), 0);
        const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

        // === TENTATIVA 1: API Real (Porta 4000 - Melhor Envio) ===
        if (rawCep) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

                const response = await fetch('http://localhost:4000/api/shipping/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        from: { postal_code: originCep },
                        to: { postal_code: rawCep },
                        products: cart.map(item => ({
                            weight: item.product?.weightKg || 0.5,
                            height: item.product?.dimensions?.heightCm || 10,
                            width: item.product?.dimensions?.widthCm || 10,
                            length: item.product?.dimensions?.lengthCm || 10,
                            quantity: item.quantity || 1,
                            insurance_value: item.product?.costPrice || 50
                        }))
                    })
                });

                clearTimeout(timeout);

                if (response.ok) {
                    const data = await response.json();
                    const mapped: ShippingQuote[] = Array.isArray(data) ? data
                        .filter((opt: any) => !opt.error && opt.price != null)
                        .map((opt: any) => ({
                            id: String(opt.id),
                            service: opt.custom ? 'PICKUP' :
                                (String(opt.name).toLowerCase().includes('express') || String(opt.name).toLowerCase().includes('sedex') ? 'EXPRESS' : 'STANDARD'),
                            carrier: opt.name || opt.company?.name || 'Transportadora',
                            price: parseFloat(String(opt.price).replace(',', '.')),
                            delivery_time: opt.delivery_time || 5,
                            isPickup: !!opt.custom
                        })) : [];

                    if (mapped.length > 0) {
                        console.log('[ShippingService] ✅ Cotações reais da API:', mapped);
                        return mapped;
                    }
                }
            } catch (err: any) {
                console.warn('[ShippingService] API indisponível, usando Matriz Base.', err?.message || err);
            }
        }

        // === FALLBACK: Matriz SIGME Base (sempre garante valores) ===
        const weightAddon = parseFloat((totalWeight * 1.8).toFixed(2));
        const itemAddon = parseFloat((totalItems * 0.50).toFixed(2));

        const quotes: ShippingQuote[] = [];

        if (isLocal) {
            quotes.push({
                id: 'pickup',
                service: 'PICKUP',
                carrier: 'Retirada na Fábrica (Piraquara)',
                price: 0,
                delivery_time: 0,
                isPickup: true
            });
        }

        quotes.push({
            id: 'standard',
            service: 'STANDARD',
            carrier: 'Correios PAC',
            price: parseFloat((12.90 + weightAddon + itemAddon).toFixed(2)),
            delivery_time: 5
        });

        quotes.push({
            id: 'express',
            service: 'EXPRESS',
            carrier: 'SEDEX',
            price: parseFloat((15.90 + weightAddon + itemAddon + 4.00).toFixed(2)),
            delivery_time: 2
        });

        console.log('[ShippingService] 📦 Usando Matriz Base SIGME:', quotes);
        return quotes;
    }
};
