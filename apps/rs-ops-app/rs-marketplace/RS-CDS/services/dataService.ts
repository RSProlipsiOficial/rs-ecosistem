import { supabase } from './supabaseClient';
import { CDProfile, Order, Product, Transaction, Customer } from '../types';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const dataService = {
    // --- Perfil e Configurações (API ou Local) ---
    async getCDProfile(userId: string): Promise<CDProfile | null> {
        // [RS-CDS] Busca principal na API agora para evitar RLS vindo de chaves anon
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${userId}/profile`);
            const json = await res.json();
            if (!json.success) {
                // Fallback para Supabase se a API falhar ou não encontrar
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
                const { data, error } = await supabase
                    .from('minisite_profiles')
                    .select('*')
                    .or(isUUID ? `id.eq.${userId},consultant_id.eq.${userId}` : `consultant_id.eq.${userId}`)
                    .maybeSingle();

                if (error || !data) return null;
                return this._mapProfile(data);
            }
            return this._mapProfile(json.data);
        } catch (e) {
            return null;
        }
    },

    _mapProfile(data: any): CDProfile {
        const city = data.address_city || data.city || '';
        const state = data.address_state || data.state || '';
        return {
            id: data.id,
            name: data.name || data.fantasy_name || 'CD sem nome',
            managerName: data.manager_name || data.name || 'Gerente',
            email: data.email || '',
            phone: data.phone || '',
            document: data.cpf || data.cnpj || data.document || '',
            type: (data.type === 'cd' ? 'CD REGIONAL' : data.type === 'FRANQUIA' ? 'FRANQUIA' : 'CD REGIONAL') as any,
            status: (data.status || 'ATIVO') as any,
            joinDate: data.created_at || new Date().toISOString(),
            region: city && state ? `${city} - ${state}` : (city || state || 'Não informado'),
            walletBalance: parseFloat(data.wallet_balance || '0'),
            activeCustomers: parseInt(data.active_customers || '0', 10),
            monthlyCycles: parseInt(data.monthly_cycles || '0', 10),
            logoUrl: data.logo_url,
            faviconUrl: data.favicon_url,
            avatarUrl: data.avatar_url,
            address: {
                cep: data.address_zip || data.zip_code || '',
                street: data.address_street || data.street || '',
                number: data.address_number || data.number || '',
                complement: data.address_complement || data.complement || '',
                neighborhood: data.address_neighborhood || data.neighborhood || '',
                city,
                state
            },
            consultantId: data.consultant_id ? data.consultant_id.split('-')[0].toUpperCase() : undefined
        };
    },

    async getPrimaryCD(): Promise<any | null> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/primary`);
            if (!res.ok) throw new Error('API offline');
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        } catch (error) {
            console.warn('[CDS] Erro ao buscar CD primário via API, tentando fallback Supabase:', error);
            // Fallback: buscar o primeiro perfil de CD no Supabase
            const { data, error: sbError } = await supabase
                .from('minisite_profiles')
                .select('*')
                .eq('type', 'cd')
                .limit(1)
                .maybeSingle();

            if (sbError || !data) {
                // Tenta buscar qualquer perfil se o filtro 'type' falhar (alguns bancos usam 'FRANQUIA' ou 'cd' no texto)
                const { data: anyData } = await supabase.from('minisite_profiles').select('*').limit(1).maybeSingle();
                return anyData || null;
            }
            return data;
        }
    },

    async getCDProfileFromAPI(cdId: string): Promise<any | null> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/profile`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        } catch (error) {
            console.error('[CDS] Erro ao buscar perfil na API:', error);
            return null;
        }
    },

    async updateCDProfile(userId: string, updates: Partial<CDProfile>): Promise<boolean> {
        // [RS-LOGIC] - Agora utilizamos prioritariamente a nova rota PATCH da API (Bypass RLS)
        try {
            const payload: any = {};
            if (updates.name !== undefined) payload.name = updates.name;
            if (updates.managerName !== undefined) payload.manager_name = updates.managerName;
            if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

            // Endereço
            if (updates.address) {
                const addr = updates.address as any;
                if (addr.cep !== undefined) payload.address_zip = addr.cep;
                if (addr.street !== undefined) payload.address_street = addr.street;
                if (addr.number !== undefined) payload.address_number = addr.number;
                if (addr.city !== undefined) payload.address_city = addr.city;
                if (addr.state !== undefined) payload.address_state = addr.state;
            }

            const res = await fetch(`${apiBaseUrl}/v1/cds/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) return true;

            throw new Error(json.error || 'Falha na API');
        } catch (error) {
            console.warn('[CDS] Erro ao atualizar perfil via API, tentando fallback direto no Supabase:', error);

            // Fallback direto via Supabase Client (sujeito a RLS)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
            const payload: any = { updated_at: new Date().toISOString() };

            if (updates.name || updates.managerName) payload.name = updates.name || updates.managerName;
            if (updates.managerName) payload.manager_name = updates.managerName;
            if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

            const addr = updates.address as any;
            if (addr) {
                if (addr.cep !== undefined) payload.address_zip = addr.cep;
                if (addr.street !== undefined) payload.address_street = addr.street;
                if (addr.number !== undefined) payload.address_number = addr.number;
                if (addr.city !== undefined) payload.address_city = addr.city;
                if (addr.state !== undefined) payload.address_state = addr.state;
            }

            const { data: existing } = await supabase
                .from('minisite_profiles')
                .select('id')
                .or(isUUID ? `id.eq.${userId},consultant_id.eq.${userId}` : `consultant_id.eq.${userId}`)
                .maybeSingle();

            if (!existing) return false;

            const { error: sbError } = await supabase
                .from('minisite_profiles')
                .update(payload)
                .eq('id', existing.id);

            return !sbError;
        }
    },

    async getCDSettingsExt(cdId: string): Promise<{ bank?: any, paymentGateway?: any, shippingGateway?: any } | null> {
        try {
            const { data, error } = await supabase
                .from('app_configs')
                .select('value')
                .eq('key', `cd_settings_${cdId}`)
                .maybeSingle();

            if (error || !data) return null;
            return data.value;
        } catch (error) {
            console.error('[CDS] Erro ao buscar configurações extras do CD:', error);
            return null;
        }
    },

    async updateCDSettingsExt(cdId: string, settings: { bank?: any, paymentGateway?: any, shippingGateway?: any }): Promise<boolean> {
        try {
            const key = `cd_settings_${cdId}`;
            const { data: existing } = await supabase
                .from('app_configs')
                .select('key')
                .eq('key', key)
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('app_configs')
                    .update({ value: settings, updated_at: new Date().toISOString() })
                    .eq('key', key);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('app_configs')
                    .insert({ key, value: settings, updated_at: new Date().toISOString() });
                if (error) throw error;
            }
            return true;
        } catch (error) {
            console.error('[CDS] Erro ao atualizar configurações extras do CD:', error);
            return false;
        }
    },

    // --- Pedidos (Vendas do CD para Clientes) ---
    async getOrders(cdId: string): Promise<Order[]> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/sales`);
            if (!res.ok) throw new Error('API offline');
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        } catch (error) {
            console.error('[CDS] Erro ao buscar vendas via API, ativando fallback Supabase:', error);
            const { data, error: sbError } = await supabase
                .from('cd_orders')
                .select('*, items:cd_order_items(*)')
                .eq('cd_id', cdId)
                .neq('type', 'REPLENISHMENT')
                .neq('type', 'ABASTECIMENTO')
                .order('created_at', { ascending: false });

            if (sbError || !data) return [];

            return data.map((order: any) => ({
                id: order.id,
                consultantName: order.consultant_name,
                consultantPin: order.consultant_pin,
                total: Number(order.total),
                status: order.status,
                date: order.order_date,
                items: order.items_count,
                productsDetail: (order.items || []).map((item: any) => ({
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    unitPrice: Number(item.unit_price)
                }))
            }));
        }
    },

    async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const json = await res.json();
            return json.success;
        } catch (error) {
            return false;
        }
    },

    async confirmSalePayment(cdId: string, orderId: string, total: number): Promise<boolean> {
        try {
            // 1. Atualizar status do pedido
            const { error: orderError } = await supabase
                .from('cd_orders')
                .update({ status: 'SEPARACAO', updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (orderError) throw orderError;

            // 2. Registrar transação financeira (Entrada)
            const { error: txError } = await supabase
                .from('cd_transactions')
                .insert({
                    cd_id: cdId,
                    type: 'IN',
                    category: 'VENDA_CONSULTOR',
                    amount: total,
                    description: `Recebimento Pedido #${orderId.split('-')[0].toUpperCase()}`,
                    status: 'CONCLUIDO',
                    created_at: new Date().toISOString()
                });

            if (txError) console.warn('[CDS] Erro ao registrar transação:', txError.message);

            // 3. Atualizar saldo da carteira do CD
            const { data: profile } = await supabase
                .from('minisite_profiles')
                .select('id, wallet_balance')
                .eq('id', cdId)
                .single();

            if (profile) {
                const newBalance = Number(profile.wallet_balance || 0) + total;
                await supabase
                    .from('minisite_profiles')
                    .update({ wallet_balance: newBalance })
                    .eq('id', cdId);
            }

            // 4. Baixa de Estoque (cd_products)
            const { data: items } = await supabase
                .from('cd_order_items')
                .select('product_id, quantity')
                .eq('cd_order_id', orderId);

            if (items) {
                for (const item of items) {
                    const { data: product } = await supabase
                        .from('cd_products')
                        .select('stock_level')
                        .eq('cd_id', cdId)
                        .eq('id', item.product_id)
                        .maybeSingle();

                    if (product) {
                        const newStock = Math.max(0, Number(product.stock_level) - Number(item.quantity));
                        await supabase
                            .from('cd_products')
                            .update({
                                stock_level: newStock,
                                updated_at: new Date().toISOString(),
                                status: newStock <= 0 ? 'CRITICO' : (newStock <= 5 ? 'BAIXO' : 'OK')
                            })
                            .eq('cd_id', cdId)
                            .eq('id', item.product_id);
                    }
                }
            }

            return true;
        } catch (e) {
            console.error('[CDS] Erro no confirmSalePayment:', e);
            return false;
        }
    },

    // --- Abastecimento (CD comprando da Sede) ---
    async createReplenishmentOrder(cdId: string, items: any[], totalValue: number, shippingMethod: string = 'TRANSPORTADORA'): Promise<string | null> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cdId,
                    items: items.map(i => ({
                        productId: i.product.id,
                        productName: i.product.name,
                        sku: i.product.sku,
                        quantity: i.quantity,
                        price: i.product.costPrice
                    })),
                    total: totalValue,
                    shippingMethod
                })
            });
            const json = await res.json();
            return json.success ? json.data.id : null;
        } catch (error) {
            console.error('[CDS] Erro ao criar abastecimento:', error);
            return null;
        }
    },

    async getReplenishmentOrders(cdId: string): Promise<any[]> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/orders?cdId=${cdId}`);
            if (!res.ok) throw new Error('API offline');
            const json = await res.json();
            if (!json.success) throw new Error(json.error || 'Erro');
            return json.data;
        } catch (error) {
            console.error('[CDS] Erro ao buscar pedidos de abastecimento via API, ativando fallback Supabase:', error);
            const { data, error: sbError } = await supabase
                .from('cd_orders')
                .select('*, items:cd_order_items(*)')
                .eq('cd_id', cdId)
                .in('type', ['REPLENISHMENT', 'ABASTECIMENTO'])
                .order('created_at', { ascending: false });

            if (sbError || !data) return [];

            return data.map((order: any) => ({
                ...order,
                items: (order.items || []).map((i: any) => ({
                    ...i,
                    product_name: i.product_name || 'Produto Não Identificado',
                    sku: i.sku || 'N/A'
                }))
            }));
        }
    },

    // --- Financeiro ---
    async getFinancialData(cdId: string): Promise<{ withdraws: any[], transactions: any[] } | null> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/financial`);
            if (!res.ok) throw new Error('API offline');
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (error) {
            console.warn('[CDS] Erro ao buscar dados financeiros via API, tentando fallback Supabase:', error);

            // Buscar Transações
            const { data: transactions } = await supabase
                .from('cd_transactions')
                .select('*')
                .eq('cd_id', cdId)
                .order('created_at', { ascending: false })
                .limit(50);

            // Buscar Saques
            const { data: withdraws } = await supabase
                .from('cd_withdraw_requests')
                .select('*')
                .eq('cd_id', cdId)
                .order('created_at', { ascending: false });

            return {
                withdraws: withdraws || [],
                transactions: transactions || []
            };
        }
    },

    async getTransactions(cdId: string): Promise<Transaction[]> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/financial`);
            if (!res.ok) throw new Error('API offline');
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data.transactions;
        } catch (error) {
            console.error('[CDS] Erro ao buscar transações via API, ativando fallback:', error);
            const { data } = await supabase
                .from('cd_transactions')
                .select('*')
                .eq('cd_id', cdId)
                .order('created_at', { ascending: false })
                .limit(50);
            return (data as unknown as Transaction[]) || [];
        }
    },

    async requestWithdraw(cdId: string, payload: any): Promise<boolean> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/withdraws`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            return json.success;
        } catch (error) {
            console.error('[CDS] Erro ao solicitar saque via API, tentando fallback Supabase:', error);
            // Fallback: Inserir diretamente na tabela de solicitações
            const { error: sbError } = await supabase
                .from('cd_withdraw_requests')
                .insert({
                    cd_id: cdId,
                    cd_name: payload.cd_name,
                    amount: payload.amount,
                    fee: payload.fee,
                    net_amount: payload.net_amount,
                    status: 'PENDENTE',
                    scheduled_date: payload.scheduled_date,
                    created_at: new Date().toISOString()
                });

            return !sbError;
        }
    },

    async uploadPaymentProof(orderId: string, proofBase64: string): Promise<boolean> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_proof_url: proofBase64,
                    payment_proof_status: 'PAGO',
                    status: 'EM SEPARAÇÃO'
                })
            });
            const json = await res.json();
            return json.success;
        } catch (error) {
            return false;
        }
    },

    async completeOrder(orderId: string): Promise<boolean> {
        try {
            // A inteligência agora reside no Backend (apps/rs-api/src/routes/cds.ts)
            // Ao marcar como ENTREGUE, a API incrementa o estoque e registra transações.
            const res = await fetch(`${apiBaseUrl}/v1/cds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ENTREGUE' })
            });
            const json = await res.json();
            return json.success;
        } catch (error) {
            console.error('[CDS] Erro ao concluir pedido:', error);

            // Fallback de emergência caso a API falhe totalmente, apenas para mudar o status
            const { error: sbError } = await supabase
                .from('cd_orders')
                .update({ status: 'ENTREGUE', updated_at: new Date().toISOString() })
                .eq('id', orderId);

            return !sbError;
        }
    },

    // --- Estoque e Catálogo ---
    async getGlobalCatalog(): Promise<Product[]> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/catalog`);
            if (!res.ok) throw new Error('API offline');
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        } catch (error) {
            console.error('[CDS] Erro ao buscar catálogo da Sede via API, ativando fallback Supabase:', error);
            const { data, error: sbError } = await supabase
                .from('products')
                .select('*')
                .or('is_active.eq.true,published.eq.true');

            if (sbError || !data) return [];

            return data.map(p => {
                const retailPrice = Number(p.price) || 0;
                const consultantPrice = (retailPrice * 0.50);
                const cdCostPrice = consultantPrice * (1 - 0.152);

                return {
                    id: p.id,
                    sku: p.sku || 'N/A',
                    name: p.name,
                    category: p.category || 'Geral',
                    stockLevel: Number(p.stock_quantity) || 0,
                    price: retailPrice,
                    memberPrice: consultantPrice,
                    costPrice: cdCostPrice,
                    points: p.pv_points || 0,
                    status: 'OK' as const,
                    imageUrl: p.image_url || (Array.isArray(p.images) && p.images[0]) || undefined,
                    weight: p.weight || 0.5,
                    dimensions: {
                        width: p.dimensions_width || 10,
                        height: p.dimensions_height || 10,
                        length: p.dimensions_length || 10
                    }
                } as any;
            });
        }
    },

    async getProducts(cdId: string): Promise<Product[]> {
        console.log(`[CDS] Buscando estoque para CD: ${cdId}`);
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/inventory`);
            if (!res.ok) throw new Error(`API offline: ${res.status}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            console.log(`[CDS] Estoque via API carregado: ${json.data?.length || 0} produtos`);
            return json.data;
        } catch (error) {
            console.warn('[CDS] Erro ao buscar estoque via API, ativando fallback Supabase:', error);
            const { data, error: sbError } = await supabase
                .from('cd_products')
                .select('*')
                .eq('cd_id', cdId)
                .order('name', { ascending: true });

            if (sbError || !data) return [];

            return data.map(p => ({
                id: p.id,
                sku: p.sku || 'N/A',
                name: p.name,
                category: p.category || 'Geral',
                stockLevel: p.stock_level || 0,
                minStock: p.min_stock || 0,
                price: Number(p.price) || 0,
                costPrice: Number(p.cost_price) || 0,
                points: Number(p.points) || 0,
                imageUrl: p.image_url || undefined,
                status: (p.status || 'OK') as 'OK' | 'BAIXO' | 'CRITICO'
            })) as Product[];
        }
    },

    async updateStock(productId: string, newLevel: number, minStock: number = 5): Promise<boolean> {
        // [RS-CDS] Mantém via RLS se o usuário estiver autenticado, ou migrar se necessário
        const { error } = await supabase
            .from('cd_products')
            .update({
                stock_level: newLevel,
                min_stock: minStock,
                updated_at: new Date().toISOString(),
                status: newLevel <= 0 ? 'CRITICO' : (newLevel <= minStock ? 'BAIXO' : 'OK')
            })
            .eq('id', productId);

        return !error;
    },

    /**
     * Função para corrigir inconsistências de estoque.
     * Utiliza o backend para processar pedidos e reconstruir o estoque com privilégios admin.
     */
    async fixStockInconsistency(cdId: string): Promise<{ success: boolean, fixedCount: number }> {
        console.log(`[CDS] Iniciando reparo de estoque via API para CD: ${cdId}`);
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/${cdId}/repair-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();

            if (json.success) {
                console.log(`[CDS] Reparo concluído: ${json.fixedCount} itens restaurados.`);
                return { success: true, fixedCount: json.fixedCount };
            } else {
                throw new Error(json.error || 'Erro desconhecido na API');
            }
        } catch (err: any) {
            console.error('[CDS] Falha no reparo de estoque:', err.message || err);
            return { success: false, fixedCount: 0 };
        }
    },

    async generatePix(amount: number, description: string, payer: any): Promise<any> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/marketplace/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description, payer })
            });
            const json = await res.json();
            return json.success ? json : null;
        } catch (error) {
            console.error('[CDS] Erro ao gerar Pix:', error);
            return null;
        }
    },

    async checkPixStatus(paymentId: string): Promise<any> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/marketplace/pix/${paymentId}`);
            const json = await res.json();
            return json;
        } catch (error) {
            console.error('[CDS] Erro ao verificar status do Pix:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
};
