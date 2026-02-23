/**
 * SERVIÇO SIGME - RS CONSULTOR
 * Interface de comunicação com o backend para o módulo SIGME
 */

import { apiClient } from './apiClient';

export interface SigmaLevel {
    level: number;
    percent: number;
    label?: string;
    target?: number;
}

export interface SigmaConfig {
    cycle: {
        value: number;
        payoutValue: number;
        payoutPercent: number;
    };
    depthBonus: {
        basePercent: number;
        baseOverValue: number;
        levels: SigmaLevel[];
    };
    fidelityBonus: {
        percentTotal: number;
        levels: SigmaLevel[];
    };
    topSigma: {
        percentTotal: number;
        ranks: { rank: number; percent: number }[];
    };
    career: {
        percentTotal: number;
        valuePerCycle: number;
        pins: {
            name: string;
            cyclesRequired: number;
            minLinesRequired: number;
            vmecDistribution: string;
            rewardValue: number;
            orderIndex: number;
            imageUrl?: string;
        }[];
    };
    matrix: {
        activationValue: number;
        reentryValue: number;
    };
}

// Mock completo de configuração SIGMA
const mockSigmaConfig: SigmaConfig = {
    cycle: {
        value: 60.00,
        payoutValue: 108.00,
        payoutPercent: 180
    },
    depthBonus: {
        basePercent: 20,
        baseOverValue: 60,
        levels: [
            { level: 1, percent: 7, label: 'Nível 1', target: 6 },
            { level: 2, percent: 8, label: 'Nível 2', target: 36 },
            { level: 3, percent: 10, label: 'Nível 3', target: 216 },
            { level: 4, percent: 12, label: 'Nível 4', target: 1296 },
            { level: 5, percent: 15, label: 'Nível 5', target: 7776 },
            { level: 6, percent: 18, label: 'Nível 6', target: 46656 },
            { level: 7, percent: 20, label: 'Nível 7', target: 279936 },
            { level: 8, percent: 25, label: 'Nível 8', target: 1679616 }
        ]
    },
    fidelityBonus: {
        percentTotal: 9,
        levels: [
            { level: 1, percent: 20, label: '1º Ciclo: 20%' },
            { level: 2, percent: 25, label: '2º Ciclo: 25%' },
            { level: 3, percent: 30, label: '3º-4º Ciclos: 30%' },
            { level: 4, percent: 35, label: '5º-7º Ciclos: 35%' },
            { level: 5, percent: 40, label: '8º-10º Ciclos: 40%' },
            { level: 6, percent: 50, label: '11º+ Ciclos: 50%' }
        ]
    },
    topSigma: {
        percentTotal: 5,
        ranks: [
            { rank: 1, percent: 20 },
            { rank: 2, percent: 15 },
            { rank: 3, percent: 12 },
            { rank: 4, percent: 10 },
            { rank: 5, percent: 8 },
            { rank: 6, percent: 7 },
            { rank: 7, percent: 6 },
            { rank: 8, percent: 5 },
            { rank: 9, percent: 4 },
            { rank: 10, percent: 3 },
            { rank: 11, percent: 2.5 },
            { rank: 12, percent: 2 },
            { rank: 13, percent: 1.5 },
            { rank: 14, percent: 1.5 },
            { rank: 15, percent: 1.5 }
        ]
    },
    career: {
        percentTotal: 6,
        valuePerCycle: 3.60,
        pins: [
            { name: 'Bronze', cyclesRequired: 1, minLinesRequired: 1, vmecDistribution: '100%', rewardValue: 0, orderIndex: 1, imageUrl: 'https://api.sigma.rsprolipsi.com.br/assets/pins/bronze.png' },
            { name: 'Prata', cyclesRequired: 3, minLinesRequired: 2, vmecDistribution: '50/50', rewardValue: 0, orderIndex: 2, imageUrl: 'https://api.sigma.rsprolipsi.com.br/assets/pins/prata.png' },
            { name: 'Ouro', cyclesRequired: 10, minLinesRequired: 3, vmecDistribution: '34/33/33', rewardValue: 500, orderIndex: 3, imageUrl: 'https://api.sigma.rsprolipsi.com.br/assets/pins/ouro.png' },
            { name: 'Diamante', cyclesRequired: 30, minLinesRequired: 4, vmecDistribution: '25/25/25/25', rewardValue: 2000, orderIndex: 4, imageUrl: 'https://api.sigma.rsprolipsi.com.br/assets/pins/diamante.png' },
            { name: 'Diamante Black', cyclesRequired: 50, minLinesRequired: 5, vmecDistribution: ' 20/20/20/20/20', rewardValue: 5000, orderIndex: 5, imageUrl: 'https://api.sigma.rsprolipsi.com.br/assets/pins/diamante-black.png' }
        ]
    },
    matrix: {
        idMestre: 'master',
        activationValue: 60.00,
        reentryValue: 60.00
    }
};

export const sigmaApi = {
    /**
     * Busca a configuração global do SIGMA (Ciclo, Bônus, Carreira)
     */
    getConfig: async () => {
        try {
            const result = await apiClient.get<SigmaConfig>('/v1/sigma/config');
            return result;
        } catch (error) {
            console.warn('API Sigma Config falhou, usando mock:', error);
            // Fallback para mock se API falhar
            return {
                success: true,
                data: mockSigmaConfig
            };
        }
    },

    /**
     * Busca lista de CDs disponíveis (Reais do Banco)
     */
    getCDs: async () => {
        try {
            const { supabase } = await import('../services/supabaseClient');

            // Unification: CD management in Admin uses 'minisite_profiles'
            const { data, error } = await supabase
                .from('minisite_profiles')
                .select('id, name, address_city, address_state, address_zip, phone, type, status')
                .or('type.ilike.cd,type.ilike.franquia,type.ilike.proprio,type.ilike.hibrido,type.ilike.%sede%');

            if (error) throw error;

            const formattedCDs = (data || []).map(cd => ({
                id: cd.id,
                name: cd.name || 'CD Sem Nome',
                city: cd.address_city || 'Cidade N/A',
                state: cd.address_state || 'UF',
                zip: cd.address_zip || '',
                whatsapp: cd.phone || '',
                isFederalSede: (cd.name || '').toLowerCase().includes('prólipsi') || cd.status === 'active' && cd.type === 'PROPRIO'
            }));

            // Force "RS PRÓLIPSI" as top if exists
            const sortedCDs = formattedCDs.sort((a, b) => {
                if (a.name.toLowerCase().includes('prólipsi')) return -1;
                if (b.name.toLowerCase().includes('prólipsi')) return 1;
                return a.name.localeCompare(b.name);
            });

            return { success: true, data: sortedCDs };
        } catch (error) {
            console.error("Falha ao buscar CDs da minisite_profiles:", error);
            return { success: false, data: [] };
        }
    },

    /**
     * Busca o histórico de bônus do consultor logado
     */
    getBonuses: async () => {
        try {
            return await apiClient.get('/v1/sigma/bonuses');
        } catch (error) {
            console.error('Erro ao buscar bônus:', error);
            return {
                success: false,
                data: [],
                error: 'Falha ao buscar bônus'
            };
        }
    },

    /**
     * Busca as estatísticas de rede do consultor
     */
    getStats: async () => {
        try {
            return await apiClient.get('/v1/sigma/stats');
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                success: false,
                data: {
                    totalDownline: 0,
                    activeDirects: 0,
                    totalCycles: 0,
                    monthlyVolume: 0
                },
            };
        }
    },

    /**
     * Busca a estrutura de downlines da rede
     */
    getDownlines: async (depth: number = 3, type?: string) => {
        try {
            const query = type ? `?depth=${depth}&type=${type}` : `?depth=${depth}`;
            return await apiClient.get<any[]>(`/v1/sigma/downlines${query}`);
        } catch (error) {
            console.warn('Simulando Downlines via Mock...');
            const { mockDirects } = await import('../data');
            return {
                success: true,
                data: mockDirects
            };
        }
    },

    /**
     * Busca a jornada de ciclos real do consultor
     */
    getCycleJourney: async () => {
        try {
            return await apiClient.get<any[]>('/v1/sigma/cycle-journey');
        } catch (error) {
            console.error('Erro ao buscar jornada de ciclos:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Salva as configurações de reinvestimento do usuário
     */
    saveUserConfig: async (config: { autoReinvest: boolean, productId?: string, cdId?: string, shippingMethod?: string }) => {
        try {
            return await apiClient.put('/v1/sigma/user-config', config);
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            return { success: false };
        }
    },

    /**
     * Busca as configurações de reinvestimento do usuário
     */
    getUserConfig: async () => {
        try {
            return await apiClient.get('/v1/sigma/user-config');
        } catch (error) {
            console.error('Erro ao buscar configuração do usuário:', error);
            return { success: false, data: null };
        }
    },

    /**
     * Busca a estrutura real da matriz (6x6) com posições fixas
     */
    getMatrixTree: async (consultorId: string, depth: number = 3) => {
        try {
            return await apiClient.get<any>(`/v1/matrix/tree/${consultorId}?depth=${depth}`);
        } catch (error) {
            console.error('Erro ao buscar árvore da matriz:', error);
            return { success: false, data: null };
        }
    },

    /**
     * Busca a estrutura de downlines da rede (Unilevel recursivo)
     */
    getTree: async (type?: string) => {
        try {
            const query = type ? `?type=${type}` : '';
            return await apiClient.get<any>(`/v1/sigma/tree${query}`);
        } catch (error) {
            console.warn('Gerando Árvore Dinâmica via Mock...');
            const { mockUser, mockDirects, mockMatrixMembers, generateMatrixNetwork } = await import('../data');
            const tree = generateMatrixNetwork(6, 3, mockUser, mockDirects, mockMatrixMembers);
            return {
                success: true,
                data: { tree }
            };
        }
    },
    /**
     * Busca os produtos disponíveis (Reais do Marketplace)
     */
    getProducts: async (tenantId?: string) => {
        try {
            const query = tenantId ? `?tenantId=${tenantId}` : '';
            return await apiClient.get<any[]>(`/v1/marketplace/products${query}`);
        } catch (error) {
            console.error('Erro ao buscar produtos reais:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Calcula frete real via Melhor Envio / RS Logística
     */
    calculateShipping: async (from: any, to: any, products: any[]) => {
        try {
            return await apiClient.post('/api/shipping/calculate', { from, to, products });
        } catch (error) {
            console.error('Erro ao calcular frete:', error);
            return { success: false, error: 'Falha ao calcular frete' };
        }
    },

    /**
     * Gera pagamento Pix real via Mercado Pago
     */
    createPixPayment: async (orderId: string, amount: number, buyer: any) => {
        try {
            return await apiClient.post('/api/payment/pix', { orderId, amount, buyer });
        } catch (error) {
            console.error('Erro ao gerar Pix:', error);
            return { success: false, error: 'Falha ao gerar pagamento Pix' };
        }
    },

    /**
     * Cria checkout unificado (Pedido + Pagamento)
     * Usado para Pix e futuras integrações
     */
    createCheckout: async (payload: any) => {
        try {
            return await apiClient.post('/api/checkout/create', payload);
        } catch (error) {
            console.error('Erro ao realizar checkout:', error);
            return { success: false, error: 'Falha ao processar pedido' };
        }
    },

    /**
     * Gera sessão de pagamento (Cartão/Checkout Pro) via Mercado Pago
     */
    createCardPaymentSession: async (orderId: string, items: any[], buyer: any) => {
        try {
            return await apiClient.post('/api/payment/checkout-pro', { orderId, items, buyer });
        } catch (error) {
            console.error('Erro ao gerar sessão de cartão:', error);
            return { success: false, error: 'Falha ao processar checkout para cartão' };
        }
    },

    /**
     * Debita saldo real da carteira (WalletPay)
     */
    debitWallet: async (userId: string, amount: number, orderId: string, description?: string) => {
        try {
            return await apiClient.post('/api/wallet/debit', { userId, amount, orderId, description });
        } catch (error) {
            console.error('Erro ao debitar carteira:', error);
            return { success: false, error: 'Falha ao processar pagamento com saldo' };
        }
    },

    /**
     * Busca saldo real do consultor
     */
    getWalletBalance: async (userId: string) => {
        try {
            const result = await apiClient.get(`/api/wallet/balance/${userId}`);
            if (result.success && result.balance) {
                return { success: true, data: result.balance.available };
            }
            return { success: false, data: 0 };
        } catch (error) {
            console.error('Erro ao buscar saldo:', error);
            return { success: false, data: 0 };
        }
    },

    /**
     * Verifica status de um checkout/pedido
     */
    getCheckoutStatus: async (orderId: string) => {
        try {
            return await apiClient.get(`/api/checkout/status/${orderId}`);
        } catch (error) {
            console.error('Erro ao buscar status do checkout:', error);
            return { success: false, error: 'Falha ao buscar status do pedido' };
        }
    }
};
