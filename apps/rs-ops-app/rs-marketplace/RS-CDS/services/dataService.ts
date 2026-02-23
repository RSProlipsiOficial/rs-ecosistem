import { supabase, adminSupabase } from './supabaseClient';
import { CDProfile, Order, Product, Transaction, Customer } from '../types';

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
