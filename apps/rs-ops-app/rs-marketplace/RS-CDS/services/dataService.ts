import { supabase, adminSupabase } from './supabaseClient';
import { CDProfile, Order, Product, Transaction, Customer } from '../types';
import { products as initialProducts } from '../../data/products';

export const dataService = {
    // --- Perfil e Configurações ---
    async getCDProfile(userId: string): Promise<CDProfile | null> {
        // [RS-CDS] Busca principal na tabela de Minisite Profiles (CDs)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        const { data, error } = await adminSupabase
            .from('minisite_profiles')
            .select('*')
            .or(isUUID ? `id.eq.${userId},consultant_id.eq.${userId}` : `consultant_id.eq.${userId}`)
            .maybeSingle();

        if (error) {
            console.error("Erro ao buscar perfil CD:", error);
            return null;
        }

        if (data) {
            return {
                id: data.id,
                name: data.name,
                managerName: data.manager_name || data.name, // Fallback
                email: data.email,
                phone: data.phone,
                document: data.cpf || data.cnpj,
                type: data.type === 'cd' ? 'CD REGIONAL' : 'FRANQUIA',
                status: 'ATIVO',
                joinDate: data.created_at,
                walletBalance: 0, // TODO: Buscar do financeiro
                activeCustomers: 0,
                monthlyCycles: 0,
                avatarUrl: data.avatar_url,
                address: {
                    cep: data.address_zip || '',
                    street: data.address_street || '',
                    number: data.address_number || '',
                    complement: data.address_complement || '',
                    neighborhood: data.address_neighborhood || '',
                    city: data.address_city || '',
                    state: data.address_state || ''
                },
                consultantId: data.consultant_id ? data.consultant_id.split('-')[0].toUpperCase() : undefined
            };
        }

        return null;
    },

    async updateCDProfile(userId: string, updates: Partial<CDProfile>): Promise<boolean> {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        // [RS-FIX] Montar payload COMPLETO — não apenas name/avatar
        // Log para debug
        console.log("[DataService] Atualizando perfil CD:", updates);

        const payload: any = {
            updated_at: new Date().toISOString()
        };

        // Campos de identificação
        if (updates.name || updates.managerName) payload.name = updates.name || updates.managerName;
        if (updates.managerName) payload.manager_name = updates.managerName; // Novo campo se existir no banco
        if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
        if ((updates as any).email) payload.email = (updates as any).email;
        if ((updates as any).phone) payload.phone = (updates as any).phone;
        if ((updates as any).document) payload.cpf = (updates as any).document;

        // Campos de endereço (se presentes)
        const addr = (updates as any).address;
        if (addr) {
            if (addr.cep !== undefined) payload.address_zip = addr.cep;
            if (addr.street !== undefined) payload.address_street = addr.street;
            if (addr.number !== undefined) payload.address_number = addr.number;
            if (addr.complement !== undefined) payload.address_complement = addr.complement;
            if (addr.neighborhood !== undefined) payload.address_neighborhood = addr.neighborhood;
            if (addr.city !== undefined) payload.address_city = addr.city;
            if (addr.state !== undefined) payload.address_state = addr.state;
        }

        // [RS-FIX] Primeiro buscar o ID real para update direto (Supabase não suporta .or() com .update() corretamente)
        const { data: existing } = await adminSupabase
            .from('minisite_profiles')
            .select('id')
            .or(isUUID ? `id.eq.${userId},consultant_id.eq.${userId}` : `consultant_id.eq.${userId}`)
            .maybeSingle();

        if (!existing) {
            console.warn('[RS-CDS dataService] Registro não encontrado para update. userId:', userId);
            return false;
        }

        const { data, error } = await adminSupabase
            .from('minisite_profiles')
            .update(payload)
            .eq('id', existing.id)
            .select();

        if (error) {
            console.error('[RS-CDS dataService] Erro ao atualizar perfil:', error);
            return false;
        }

        // [RS-FIX] Verificar se algum registro foi realmente atualizado
        if (!data || data.length === 0) {
            console.warn('[RS-CDS dataService] Nenhum registro atualizado para userId:', userId);
            return false;
        }

        console.log(`[RS-CDS dataService] ✅ Perfil atualizado (${data.length} registro(s))`);
        return true;
    },

    // --- Pedidos ---
    async getOrders(cdId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('cd_orders')
            .select('id, consultant_id, consultant_name, consultant_pin, sponsor_name, sponsor_id, buyer_cpf, buyer_email, buyer_phone, shipping_address, order_date, order_time, total, total_points, status, type, items_count, tracking_code, vehicle_plate, items:cd_order_items(product_id, product_name, quantity, unit_price, points)')
            .eq('cd_id', cdId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return (data || []).map(order => ({
            id: order.id,
            consultantName: order.consultant_name,
            consultantPin: order.consultant_pin,
            sponsorName: order.sponsor_name,
            sponsorId: order.sponsor_id,
            buyerCpf: order.buyer_cpf,
            buyerEmail: order.buyer_email,
            buyerPhone: order.buyer_phone,
            shippingAddress: order.shipping_address,
            date: order.order_date,
            time: order.order_time,
            total: Number(order.total),
            totalPoints: order.total_points,
            status: order.status,
            type: order.type,
            items: order.items_count,
            trackingCode: order.tracking_code,
            vehiclePlate: order.vehicle_plate,
            productsDetail: order.items.map((item: any) => ({
                productId: item.product_id,
                productName: item.product_name,
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                points: item.points
            }))
        }));
    },

    async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
        const { error } = await supabase
            .from('cd_orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }
        return true;
    },

    // --- Catálogo Global (Sede) ---
    async getGlobalCatalog(): Promise<Product[]> {
        const { data, error } = await adminSupabase
            .from('products')
            .select('*')
            .or('status.eq.active,status.eq.published');

        if (error) {
            console.error('[CDS] Erro ao buscar catálogo global:', error);
        }

        // Filtra apenas produtos da RS Prólipsi da API
        const apiProducts = (data || []).filter(p => p.seller === 'RS Prólipsi' || (p.name && p.name.toLowerCase().includes('lipsi')));

        // Calcula desconto CD: Prioriza Preço Consultor (memberPrice) e aplica -15.2%
        // Se não houver memberPrice (legado), aplica 50% e depois 15.2%
        const applyDiscount = (price: number, memberPrice?: number) => {
            const base = memberPrice || (price * 0.50);
            return base * (1 - 0.152);
        };

        const mappedApi = apiProducts.map(p => {
            const retailPrice = Number(p.price) || 0;
            const consultantPrice = Number(p.member_price) || (retailPrice * 0.50);
            const cdCostPrice = consultantPrice * (1 - 0.152);

            return {
                id: p.id,
                sku: p.sku || 'N/A',
                name: p.name,
                category: p.category_id || p.category || 'Geral',
                stockLevel: p.inventory || 0,
                minStock: 0,
                price: retailPrice,
                memberPrice: consultantPrice,
                costPrice: cdCostPrice,
                points: p.points || 0,
                status: 'OK' as const,
                weightKg: p.weight_kg || 0.5,
                dimensions: {
                    widthCm: p.width_cm || 10,
                    heightCm: p.height_cm || 10,
                    lengthCm: p.length_cm || 10
                }
            };
        });

        // Retorna exclusivamente os produtos reais do Banco para garantir IDs válidos (UUID)
        return mappedApi;
    },

    async createReplenishmentOrder(cdId: string, items: any[], totalValue: number): Promise<boolean> {
        const payload = {
            cd_id: cdId,
            items_count: items.reduce((acc, i) => acc + i.quantity, 0),
            total: totalValue,
            total_points: 0, // CD orders usually don't generate VP for the CD itself on buying stock, depends on rules
            status: 'PENDENTE',
            type: 'ABASTECIMENTO',
            order_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await adminSupabase.from('cd_orders').insert([payload]).select().single();
        if (error) {
            console.error('[CDS] Erro ao criar pedido de abastecimento:', error);
            return false;
        }

        // MAPA FALLBACK (DE-PARA) EM CASO DE CACHE NO NAVEGADOR COM IDs FALSOS (1-7)
        const FallbackIds: Record<string, string> = {
            '1': 'd8da03a4-d45a-4390-8698-9a35d43647c8', // AlphaLipsi
            '2': '850c41ec-2cde-4768-aa65-9630215ea407', // GlicoLipsi
            '3': 'b98c42b9-52c5-478e-b172-faee36c6ba2c', // DivaLipsi
            '4': '486f290d-500f-4c1c-8889-f8d2db87c2bc', // Inflamax
            '5': '1c337036-bde5-4f2d-aba5-6729b911b002', // OzoniPro
            '6': '802529e1-ead9-4eef-bf20-4ce63e25ec92', // Pro3+
            '7': '8445623a-2642-4e04-be6d-c815b1d337f6', // SlimLipsi

            // Tratativas nominais também prevenidos
            'AlphaLipsi': 'd8da03a4-d45a-4390-8698-9a35d43647c8',
            'GlicoLipsi': '850c41ec-2cde-4768-aa65-9630215ea407',
            'DivaLipsi': 'b98c42b9-52c5-478e-b172-faee36c6ba2c',
            'Inflamaxi': '486f290d-500f-4c1c-8889-f8d2db87c2bc',
            'Ozone Pro 3+': '1c337036-bde5-4f2d-aba5-6729b911b002',
            'Pro 3+': '802529e1-ead9-4eef-bf20-4ce63e25ec92',
            'SlimLipsi': '8445623a-2642-4e04-be6d-c815b1d337f6',
        };

        if (data && data.id && items.length > 0) {
            const itemsPayload = items.map(item => {
                const originalId = String(item.product.id);
                // Se o ID for numérico ou curto, busca o UUID real do fallback.
                const realId = originalId.length < 10 ? (FallbackIds[originalId] || FallbackIds[item.product.name] || originalId) : originalId;

                return {
                    order_id: data.id,
                    product_id: realId,
                    product_name: item.product.name,
                    quantity: item.quantity,
                    unit_price: item.product.costPrice,
                    points: item.product.points || 0
                };
            });

            const { error: itemsError } = await adminSupabase.from('cd_order_items').insert(itemsPayload);
            if (itemsError) {
                console.error('[CDS] Falha crítica ao inserir itens do pedido:', itemsError);
            }
        }
        return true;
    },

    async getReplenishmentOrders(cdId: string): Promise<any[]> {
        // Correção crítica: usar adminSupabase para não ser bloqueado por RLS (Row Level Security)
        const { data, error } = await adminSupabase
            .from('cd_orders')
            .select('*, items:cd_order_items(*)')
            .eq('cd_id', cdId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[CDS] Erro ao buscar histórico de abastecimento:', error);
            return [];
        }
        return data || [];
    },

    async uploadPaymentProof(orderId: string, url: string, paymentMethod: string): Promise<boolean> {
        const { error } = await adminSupabase
            .from('cd_orders')
            .update({
                payment_proof_url: url,
                payment_proof_status: 'PAGO', // Status de pagamento atualizado
                payment_method: paymentMethod,
                status: 'EM SEPARAÇÃO', // Move o pedido para o próximo estágio
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error('[CDS] Erro ao enviar comprovante:', error);
            return false;
        }
        return true;
    },

    async updateOrderTracking(orderId: string, trackingCode: string): Promise<boolean> {
        const { error } = await adminSupabase
            .from('cd_orders')
            .update({
                tracking_code: trackingCode,
                status: 'ENVIADO',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error('[CDS] Erro ao adicionar rastreio:', error);
            return false;
        }
        return true;
    },

    async completeOrder(orderId: string): Promise<boolean> {
        const { error } = await adminSupabase
            .from('cd_orders')
            .update({
                status: 'ENTREGUE',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error('[CDS] Erro ao confirmar recebimento:', error);
            return false;
        }
        return true;
    },

    // --- Estoque ---
    async getProducts(cdId: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('cd_products')
            .select('id, sku, name, category, stock_level, min_stock, price, cost_price, points, status')
            .eq('cd_id', cdId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return (data || []).map(p => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            stockLevel: p.stock_level,
            minStock: p.min_stock,
            price: Number(p.price),
            costPrice: Number(p.cost_price),
            points: p.points,
            status: p.status
        }));
    },

    async updateStock(productId: string, newLevel: number): Promise<boolean> {
        const { error } = await supabase
            .from('cd_products')
            .update({
                stock_level: newLevel,
                updated_at: new Date().toISOString(),
                status: newLevel <= 0 ? 'CRITICO' : (newLevel <= 5 ? 'BAIXO' : 'OK') // Example logic
            })
            .eq('id', productId);

        if (error) {
            console.error('Error updating stock:', error);
            return false;
        }
        return true;
    },

    async updateProductAlert(productId: string, minStock: number): Promise<boolean> {
        const { error } = await supabase
            .from('cd_products')
            .update({
                min_stock: minStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId);

        if (error) {
            console.error('Error updating product alert:', error);
            return false;
        }
        return true;
    },

    // --- Financeiro ---
    async getTransactions(cdId: string): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('cd_transactions')
            .select('id, created_at, description, type, category, amount, status')
            .eq('cd_id', cdId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return (data || []).map(t => ({
            id: t.id,
            date: t.created_at,
            description: t.description,
            type: t.type,
            category: t.category,
            amount: Number(t.amount),
            status: t.status
        }));
    },

    // --- Clientes ---
    async getCustomers(cdId: string): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('cd_customers')
            .select('id, name, phone, email, last_purchase_date, total_spent, orders_count, status')
            .eq('cd_id', cdId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching customers:', error);
            return [];
        }

        return (data || []).map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            lastPurchaseDate: c.last_purchase_date,
            totalSpent: Number(c.total_spent),
            ordersCount: c.orders_count,
            status: c.status
        }));
    }
};
