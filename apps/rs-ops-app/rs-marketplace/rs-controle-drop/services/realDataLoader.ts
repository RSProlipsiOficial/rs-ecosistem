
import { supabase } from './supabaseClient';
import { Product, Order, Customer, Supplier, DistributionCenter } from '../types';

export async function loadRealProducts(): Promise<Product[]> {
    try {
        console.log('[realDataLoader] Buscando produtos oficiais no Supabase...');
        // Filtramos pelo Tenant ID oficial da RS Prólipsi para evitar produtos de teste (Diag/Test)
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', 'd107da4e-e266-41b0-947a-0c66b2f2b9ef')
            .eq('published', true);

        if (error) throw error;

        console.log(`[realDataLoader] ${data?.length || 0} produtos oficiais encontrados.`);

        return (data || []).map((p: any) => ({
            id: String(p.id),
            name: p.name || 'Produto sem nome',
            sku: p.sku || `PROD-${String(p.id).slice(0, 4)}`,
            category: p.category || 'Geral',
            salePrice: Number(p.price) || Number(p.sale_price) || 0,
            shippingCost: 0,
            shippingCharged: 0,
            gatewayFeeRate: 0,
            currentStock: Number(p.stock) || Number(p.inventory) || 0,
            minStock: 5,
            status: 'Active',
            visibility: ['loja', 'venda'],
            userId: p.user_id || 'system',
            description: p.description || '',
            images: Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : (p.image_url ? [p.image_url] : (p.featured_image ? [p.featured_image] : ['https://placehold.co/400x400?text=Produto']))
        }));
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        return [];
    }
}

export async function loadRealOrders(): Promise<Order[]> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map((o: any) => ({
            id: String(o.id),
            userId: o.user_id || o.consultant_id || 'system',
            customerName: o.customer_name || 'Cliente',
            customerEmail: o.customer_email || '',
            customerPhone: o.customer_phone || '',
            status: o.status || 'pending',
            paymentStatus: o.payment_status || 'pending',
            items: Array.isArray(o.items) ? o.items : [],
            itemsTotal: Number(o.total_amount) || Number(o.subtotal) || 0,
            shippingTotal: Number(o.shipping_cost) || 0,
            total: (Number(o.total_amount) || Number(o.total) || 0),
            createdAt: o.created_at,
            updatedAt: o.updated_at || o.created_at,
            shippingAddress: o.shipping_address || {},
            paymentMethod: o.payment_method || 'N/A',
            affiliateId: o.affiliate_id || null // Para vendas por link
        }));
    } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        return [];
    }
}

export async function loadRealCustomers(): Promise<Customer[]> {
    try {
        // Tenta pegar de 'user_profiles' ou 'customers' se existir
        const { data, error } = await supabase.from('user_profiles').select('*');
        if (error) throw error;
        return (data || []).map((c: any) => ({
            id: c.user_id || c.id,
            name: c.nome_completo || c.name || 'Cliente',
            email: c.email,
            phone: c.telefone || c.phone,
            ordersCount: 0, // Calcular depois se necessário
            totalSpent: 0,
            lastOrderDate: c.created_at,
            createdAt: c.created_at,
            tags: []
        }));
    } catch (err) {
        console.error('Erro ao carregar clientes:', err);
        return [];
    }
}

export async function loadRealConsultants(): Promise<User[]> {
    try {
        const { data, error } = await supabase.from('minisite_profiles').select('*');
        if (error) throw error;
        return (data || []).map((p: any) => ({
            id: p.consultant_id || p.id,
            name: p.name || 'Consultor RS',
            email: p.email || '',
            avatarUrl: p.avatar_url || '',
            role: p.role || 'LOGISTA'
        }));
    } catch (err) {
        console.error('Erro ao carregar consultores:', err);
        return [];
    }
}
