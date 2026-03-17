
import { createClient } from '@supabase/supabase-js';
import { CDRegistry, ExternalConsultant, ReplenishmentOrder, GlobalSalesOrder, FranchiseRule } from '../../types';

// Reusing the client from supabase.ts if possible, otherwise creating a new one if not exported correctly.
// Based on file analysis, I will import from './supabase'
import { supabase } from './supabase';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const headquartersService = {
    // --- CD Registry (Rede de CDs) ---
    async getCDRegistry(): Promise<CDRegistry[]> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds`);
            const json = await res.json();

            if (!json?.success) {
                console.error('Error fetching CD registry:', json?.error);
                return [];
            }

            return (json.data || []).map((profile: any) => ({
                id: profile.id,
                name: profile.name,
                managerName: profile.owner_name || profile.name,
                managerId: profile.manager_id || profile.id,
                email: profile.email || '',
                phone: profile.phone || '',
                document: profile.cnpj_cpf || '',
                addressStreet: profile.address_street || '',
                addressNumber: profile.address_number || '',
                addressNeighborhood: profile.address_neighborhood || '',
                addressZip: profile.address_zip || '',
                city: profile.address_city || profile.stores?.[0]?.city || 'N/A',
                state: profile.address_state || profile.stores?.[0]?.state || 'N/A',
                type: (profile.type || 'FRANQUIA') as any,
                status: profile.is_active ? 'ATIVO' : 'BLOQUEADO',
                joinDate: profile.created_at || new Date().toISOString(),
                source: profile.source
            })) as any;
        } catch (error) {
            console.error('Error fetching CD registry:', error);
            return [];
        }
    },

    // --- External Consultants (Search) ---
    async searchConsultant(query: string): Promise<ExternalConsultant | null> {
        const cleanQuery = query.replace(/\D/g, '');
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

        // Priority: Search in consultants table
        let masterQuery = supabase.from('consultores').select('*');
        if (isUUID) {
            masterQuery = masterQuery.eq('id', query);
        } else if (cleanQuery.length >= 11) {
            masterQuery = masterQuery.eq('cpf', cleanQuery);
        } else {
            return null;
        }

        const { data: masterData } = await masterQuery.maybeSingle();

        if (masterData) {
            return {
                id: masterData.id,
                name: masterData.nome,
                cpf: masterData.cpf,
                email: masterData.email,
                phone: (masterData as any).whatsapp || '',
                level: masterData.pin_atual || 'CONSULTOR',
                status: (masterData.status || '').toUpperCase() === 'ATIVO' ? 'ATIVO' : 'INATIVO',
                joinDate: masterData.created_at
            };
        }

        // Fallback: Search in minisite_profiles
        let miniQuery = supabase.from('minisite_profiles').select('*');
        if (isUUID) {
            miniQuery = miniQuery.eq('id', query);
        } else if (cleanQuery.length >= 11) {
            miniQuery = miniQuery.eq('cpf', cleanQuery);
        }

        const { data: miniData } = await miniQuery.maybeSingle();

        if (!miniData) return null;

        return {
            id: miniData.id,
            name: miniData.name,
            cpf: miniData.cpf,
            email: miniData.email,
            phone: miniData.phone,
            level: 'CONSULTOR',
            status: miniData.status === 'active' ? 'ATIVO' : 'INATIVO',
            joinDate: miniData.created_at
        };
    },

    // --- Franchise Rules ---
    // Assuming a 'system_settings' or 'franchise_rules' table. 
    // If not exists, might need to create or use a placeholder storage 
    // like a specific row in a settings table.
    async getFranchiseRules(): Promise<FranchiseRule> {
        const { data, error } = await supabase
            .from('franchise_rules')
            .select('*')
            .eq('active', true)
            .maybeSingle();

        if (error || !data) {
            // Default rules if table/data missing
            return {
                initialCost: 2000,
                royaltyPercentage: 0,
                minStockPurchase: 500,
                marketingFee: 0,
                commissionPercentage: 15.2,
                allowedPaymentMethods: ['PIX', 'BOLETO', 'CARTAO'],
                contractTerms: '',
                active: true
            };
        }

        return {
            initialCost: data.initial_cost,
            royaltyPercentage: data.royalty_percentage,
            minStockPurchase: data.min_stock_purchase,
            marketingFee: data.marketing_fee,
            commissionPercentage: data.commission_percentage || 15.2,
            allowedPaymentMethods: data.allowed_payment_methods || ['PIX', 'BOLETO', 'CARTAO'],
            contractTerms: data.contract_terms || '',
            active: data.active
        };
    },

    async updateFranchiseRules(rules: FranchiseRule): Promise<boolean> {
        const { error } = await supabase
            .from('franchise_rules')
            .upsert({
                id: 1, // Assumindo uma única linha de regras globais
                initial_cost: rules.initialCost,
                royalty_percentage: rules.royaltyPercentage,
                min_stock_purchase: rules.minStockPurchase,
                marketing_fee: rules.marketingFee,
                commission_percentage: rules.commissionPercentage,
                allowed_payment_methods: rules.allowedPaymentMethods,
                contract_terms: rules.contractTerms,
                active: true,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error updating franchise rules:', error);
            return false;
        }
        return true;
    },

    // --- Pedidos de Abastecimento (CDs requisitando estoque da central) ---
    async getReplenishmentOrders(): Promise<ReplenishmentOrder[]> {
        try {
            const res = await fetch(`${apiBaseUrl}/v1/cds/orders`);
            const json = await res.json();

            if (!json.success) {
                console.error('[HQ] Erro na API ao buscar pedidos de abastecimento:', json.error);
                return [];
            }

            const orders = json.data || [];

            // Busca nomes reais em paralelo (CD e Perfil Geral) para mesclar
            const [{ data: cds }, { data: profiles }, { data: products }] = await Promise.all([
                supabase.from('cd_profiles').select('*'),
                supabase.from('minisite_profiles').select('*'),
                supabase.from('products').select('id, name, sku')
            ]);

            // Merge de dados (minisite_profiles tem precedência)
            const cdMap = new Map();
            (cds || []).forEach(c => cdMap.set(c.id, c));
            (profiles || []).forEach(p => cdMap.set(p.id, p));

            const prodMap = new Map();
            (products || []).forEach(p => prodMap.set(p.id, p));

            return orders.map((order: any) => {
                const cdData = cdMap.get(order.cd_id) || {};

                return {
                    id: order.id,
                    cdId: order.cd_id,
                    cdName: cdData.name || `CD: ${order.cd_id.substring(0, 8).toUpperCase()}`,
                    itemsCount: order.items_count || 0,
                    items: (order.items || []).map((i: any) => {
                        const realProd = prodMap.get(i.product_id) || {};
                        return {
                            sku: i.sku || realProd.sku || i.product_id || '', // Lê o SKU priorizado da API ou intercepta o produto real
                            name: i.product_name || realProd.name || 'Produto sem nome', // Prioriza o nome salvo no ato do carrinho legitimo
                            quantity: i.quantity || 0,
                            unitCost: i.unit_price || 0
                        };
                    }),
                    totalValue: Number(order.total) || 0,
                    status: (order.status || 'PENDENTE').toUpperCase(),
                    requestDate: order.created_at,
                    date: order.created_at,
                    expectedDelivery: order.updated_at,
                    marketplace_order_id: order.marketplace_order_id,
                    trackingCode: order.tracking_code || '',
                    paymentProofUrl: order.payment_proof_url || '',
                    paymentProofStatus: order.payment_proof_status || '',
                    shippingMethod: order.shipping_method || 'Transportadora',
                    cdDetails: {
                        document: cdData.cpf || cdData.cnpj || '',
                        email: cdData.email || '',
                        phone: cdData.phone || '',
                        addressStreet: cdData.address_street || '',
                        addressNumber: cdData.address_number || '',
                        addressNeighborhood: cdData.address_neighborhood || '',
                        city: cdData.address_city || cdData.city || '',
                        state: cdData.address_state || cdData.state || '',
                        addressZip: cdData.address_zip || '',
                    }
                };
            });
        } catch (error) {
            console.error('[HQ] Erro ao buscar pedidos de abastecimento:', error);
            return [];
        }
    },

    async updateReplenishmentOrderStatus(orderId: string, status: string, trackingCode?: string): Promise<boolean> {
        try {
            const updateData: any = { status: status.toUpperCase() };
            if (trackingCode !== undefined) {
                updateData.tracking_code = trackingCode;
            }

            const res = await fetch(`${apiBaseUrl}/v1/cds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            const json = await res.json();

            if (!json.success) {
                console.error('[HQ] Erro na API ao atualizar status do pedido:', json.error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('[HQ] Exception ao atualizar status do pedido:', error);
            return false;
        }
    },

    async confirmPaymentProof(orderId: string, isApproved: boolean): Promise<boolean> {
        try {
            const newStatus = isApproved ? 'PAGO' : 'AGUARDANDO PAGAMENTO';
            const newProofStatus = isApproved ? 'CONFIRMADO' : 'REJEITADO';

            const res = await fetch(`${apiBaseUrl}/v1/cds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    payment_proof_status: newProofStatus
                })
            });
            const json = await res.json();

            if (!json.success) {
                console.error('[HQ] Erro na API ao confirmar comprovante:', json.error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('[HQ] Exception ao confirmar comprovante:', error);
            return false;
        }
    },

    // --- Vendas Globais (todos os pedidos do marketplace) ---
    async getGlobalSales(): Promise<GlobalSalesOrder[]> {
        // Busca pedidos e nomes reais em paralelo de ambas as fontes (CD e Perfil Geral)
        const [{ data: ordersData, error: ordersError }, { data: cdsData }, { data: profilesData }] = await Promise.all([
            supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100),
            supabase.from('cd_profiles').select('id, name'),
            supabase.from('minisite_profiles').select('id, name')
        ]);

        if (ordersError) {
            console.error('[HQ] Erro ao buscar vendas globais:', ordersError);
            return [];
        }

        // Merge de nomes para resolução rápida
        const cdMap = new Map();
        (cdsData || []).forEach(c => cdMap.set(c.id, c.name));
        (profilesData || []).forEach(p => cdMap.set(p.id, p.name));

        // Filtra apenas vendas reais (remove IDs nulos se houver sujeira/mockup no banco)
        return (ordersData || [])
            .filter(order => order.id)
            .map((order: any) => {
                const shortId = order.id ? order.id.toString().split('-')[0].toUpperCase() : 'N/A';
                const cdName = order.distributor_id ? (cdMap.get(order.distributor_id) || `CD: ${order.distributor_id.substring(0, 8).toUpperCase()}`) : 'Sede RS';

                return {
                    id: shortId,
                    customerName: order.buyer_name || order.customer_name || 'Cliente',
                    customerEmail: order.buyer_email || order.customer_email || '',
                    cdId: order.distributor_id || '',
                    cdName: cdName,
                    items: [],
                    totalValue: Number(order.total) || 0,
                    status: (order.status || 'pending').toUpperCase(),
                    saleDate: order.created_at,
                    date: order.created_at,
                    sellerName: cdName,
                    total: Number(order.total) || 0,
                    paymentMethod: order.payment_method || 'PIX'
                } as any as GlobalSalesOrder;
            }) as any[] as GlobalSalesOrder[];
    },

    async updateCDRegistry(id: string, updates: Partial<CDRegistry>): Promise<boolean> {
        const mappedUpdates: any = {};
        if (updates.name) mappedUpdates.name = updates.name;
        if (updates.email) mappedUpdates.email = updates.email;
        if (updates.phone) mappedUpdates.phone = updates.phone;
        if (updates.city) mappedUpdates.address_city = updates.city;
        if (updates.state) mappedUpdates.address_state = updates.state;
        if (updates.addressStreet) mappedUpdates.address_street = updates.addressStreet;
        if (updates.addressNumber) mappedUpdates.address_number = updates.addressNumber;
        if (updates.addressNeighborhood) mappedUpdates.address_neighborhood = updates.addressNeighborhood;
        if (updates.addressZip) mappedUpdates.address_zip = updates.addressZip;
        if (updates.type) mappedUpdates.type = updates.type;
        if (updates.status) mappedUpdates.status = updates.status === 'ATIVO' ? 'active' : 'blocked';

        const { error } = await supabase
            .from('minisite_profiles')
            .update(mappedUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating CD registry:', error);
            return false;
        }
        return true;
    }
};
