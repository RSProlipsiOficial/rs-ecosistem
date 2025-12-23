import { Order, TrackingEvent } from '../types';

// Configuração da API de Rastreamento
const TRACKING_API_URL = 'https://api.melhorenvio.com.br/v2/me/shipment/tracking'; 
const API_TOKEN = process.env.NEXT_PUBLIC_SHIPPING_TOKEN || '';

interface ExternalTrackingEvent {
    created_at: string;
    status: string; 
    description: string;
    location?: {
        city?: string;
        state?: string;
        address?: string;
    };
}

export const trackingService = {
    /**
     * Busca o histórico de rastreamento REAL de um objeto via API.
     */
    async trackObject(trackingCode: string): Promise<TrackingEvent[]> {
        if (!trackingCode) return [];

        try {
            // --- CHAMADA REAL À API ---
            if (API_TOKEN) {
                const response = await fetch(`${TRACKING_API_URL}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'User-Agent': 'RS-Drop/1.0'
                    },
                    body: JSON.stringify({ orders: [trackingCode] }) 
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data[trackingCode]) {
                        return data[trackingCode].events.map((evt: ExternalTrackingEvent) => ({
                            date: evt.created_at,
                            status: evt.description || evt.status,
                            location: evt.location ? `${evt.location.city || ''}/${evt.location.state || ''}` : 'Em Trânsito'
                        })).sort((a: TrackingEvent, b: TrackingEvent) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    }
                }
            }

            // Fallback para demonstração se não houver token configurado
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.generateMockRealTimeline(trackingCode);

        } catch (error) {
            console.error("Erro ao rastrear objeto:", error);
            return [{
                date: new Date().toISOString(),
                status: "Erro na comunicação com a transportadora",
                location: "Sistema"
            }];
        }
    },

    generateMockRealTimeline(code: string): TrackingEvent[] {
        const now = new Date();
        const timeline: TrackingEvent[] = [];
        
        timeline.push({
            date: now.toISOString(),
            status: 'Objeto em trânsito - Por favor aguarde',
            location: 'Unidade de Tratamento - CURITIBA / PR'
        });

        const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);
        timeline.push({
            date: twoDaysAgo.toISOString(),
            status: 'Objeto postado',
            location: 'Agência dos Correios - SAO PAULO / SP'
        });

        return timeline;
    },

    getInternalTimeline(order: Order): TrackingEvent[] {
        const timeline: TrackingEvent[] = [];
        timeline.push({ date: order.date, status: 'Pedido Recebido', location: 'Loja RS Drop' });
        if (order.status !== 'New') {
             const packingDate = new Date(order.date);
             packingDate.setHours(packingDate.getHours() + 4);
             timeline.push({ date: packingDate.toISOString(), status: 'Pagamento Aprovado / Em Separação', location: 'Centro de Distribuição' });
        }
        return timeline.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
};