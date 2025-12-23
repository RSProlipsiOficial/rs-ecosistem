
import { Order, Product, TrafficSpend, Cart, Checkout, AbandonmentLog, MessageTemplate, Supplier, AIUserContext, ChatMessage, ChatSession } from '../types';

export interface AIContext {
    orders: Order[];
    products: Product[];
    traffic: TrafficSpend[];
    carts: Cart[];
    checkouts: Checkout[];
    abandonmentLogs: AbandonmentLog[];
    suppliers?: Supplier[];
    templates?: MessageTemplate[];
    
    // Security Context
    userId: string;
    userRole: 'Admin' | 'Logista';
}

export interface AIActionContext {
    updateProduct: (p: Product) => void;
    updateOrder: (o: Order) => void;
    updateAbandonmentLog: (id: string, updates: any) => void;
}

// Helper: Filter items by date range relative to today
const filterByDate = <T extends { [key: string]: any }>(items: T[], dateField: keyof T, range?: string): T[] => {
    if (!range || range === 'all') return items;
    
    const now = new Date();
    const today = new Date(now.setHours(0,0,0,0));
    
    return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        
        switch(range) {
            case 'today':
                return itemDate >= today;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return itemDate >= yesterday && itemDate < today;
            case 'week': // Last 7 days
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                return itemDate >= weekAgo;
            case 'month': // Last 30 days
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);
                return itemDate >= monthAgo;
            case 'last_month': // Previous calendar month
                const startLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                return itemDate >= startLastMonth && itemDate <= endLastMonth;
            default:
                return true;
        }
    });
};

// Helper: Strict User Filter
const enforceUserScope = <T extends { userId: string }>(items: T[], ctx: AIContext): T[] => {
    if (ctx.userRole === 'Admin') return items;
    return items.filter(i => i.userId === ctx.userId);
};

export const aiMemoryService = {
    getUserContext: (userId: string): AIUserContext => {
        const stored = localStorage.getItem(`rs_ai_context_${userId}`);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            userId,
            lastInteraction: new Date().toISOString(),
            recentTopics: [],
            preferences: [],
            lastActions: [],
            sessions: []
        };
    },

    saveUserContext: (ctx: AIUserContext) => {
        localStorage.setItem(`rs_ai_context_${ctx.userId}`, JSON.stringify(ctx));
    },

    updateContext: (userId: string, updates: Partial<AIUserContext>) => {
        const current = aiMemoryService.getUserContext(userId);
        const updated = { ...current, ...updates, lastInteraction: new Date().toISOString() };
        aiMemoryService.saveUserContext(updated);
    },

    addTopic: (userId: string, topic: string) => {
        const current = aiMemoryService.getUserContext(userId);
        if (!current.recentTopics.includes(topic)) {
            const newTopics = [topic, ...current.recentTopics].slice(0, 5); // Keep last 5
            aiMemoryService.updateContext(userId, { recentTopics: newTopics });
        }
    },

    addAction: (userId: string, action: string, details?: string) => {
        const current = aiMemoryService.getUserContext(userId);
        const newActions = [{ action, timestamp: new Date().toISOString(), details }, ...current.lastActions].slice(0, 5);
        aiMemoryService.updateContext(userId, { lastActions: newActions });
    },

    saveSession: (userId: string, messages: ChatMessage[]) => {
        if (messages.length === 0) return;
        const current = aiMemoryService.getUserContext(userId);
        const sessionId = messages[0].id; // Use first message ID as session ID or generate one
        const sessionTitle = messages.length > 1 && messages[1].role === 'user' ? messages[1].content.slice(0, 30) + '...' : 'Nova Conversa';
        
        const newSession: ChatSession = {
            id: sessionId,
            title: sessionTitle,
            date: new Date().toISOString(),
            messages: messages
        };

        // Remove if exists, then add to top
        const otherSessions = current.sessions.filter(s => s.id !== sessionId);
        const updatedSessions = [newSession, ...otherSessions].slice(0, 20); // Keep last 20
        
        aiMemoryService.updateContext(userId, { sessions: updatedSessions });
    }
};

export const aiDataService = {
    // 1. Products Endpoint
    getProducts: (ctx: AIContext, args: { sort?: 'best_selling' | 'low_stock' | 'most_revenue', limit?: number, name?: string }) => {
        let result = enforceUserScope(ctx.products, ctx);
        
        if (args.name) {
            const search = args.name.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search));
        }

        if (args.sort === 'low_stock') {
            result = result.filter(p => p.status === 'Active' && p.currentStock <= p.minStock).sort((a,b) => a.currentStock - b.currentStock);
        } else if (args.sort === 'best_selling' || args.sort === 'most_revenue') {
            const stats = new Map<string, { qty: number, rev: number }>();
            const userOrders = enforceUserScope(ctx.orders, ctx);
            
            userOrders.forEach(o => o.items.forEach(i => {
                const current = stats.get(i.productId) || { qty: 0, rev: 0 };
                stats.set(i.productId, { qty: current.qty + i.quantity, rev: current.rev + (i.unitPrice * i.quantity) });
            }));
            
            result.sort((a,b) => {
                const statA = stats.get(a.id) || { qty: 0, rev: 0 };
                const statB = stats.get(b.id) || { qty: 0, rev: 0 };
                return args.sort === 'best_selling' ? statB.qty - statA.qty : statB.rev - statA.rev;
            });
        }

        return result.slice(0, args.limit || 5).map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: p.currentStock,
            price: p.salePrice,
            status: p.status
        }));
    },

    // 2. Orders Endpoint
    getOrders: (ctx: AIContext, args: { status?: string, period?: string, limit?: number }) => {
        let result = enforceUserScope(ctx.orders, ctx);
        result = filterByDate(result, 'date', args.period);
        
        if (args.status) {
            const statusLower = args.status.toLowerCase();
            result = result.filter(o => o.status.toLowerCase() === statusLower);
        }
        
        // Sort by date desc
        result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return result.slice(0, args.limit || 5).map(o => ({
            id: o.id,
            displayId: o.id.slice(0, 8),
            date: o.date,
            customer: o.customerName,
            total: o.itemsTotal + o.shippingCharged,
            status: o.status,
            items: o.items.length
        }));
    },

    // 3. Recovery Endpoint
    getRecoveryStats: (ctx: AIContext, args: { period?: string, status?: string }) => {
        const userCartIds = new Set(enforceUserScope(ctx.carts, ctx).map(c => c.id));
        const userCheckoutIds = new Set(enforceUserScope(ctx.checkouts, ctx).map(c => c.id));
        
        let logs = ctx.abandonmentLogs.filter(l => userCartIds.has(l.referenceId) || userCheckoutIds.has(l.referenceId));
        logs = filterByDate(logs, 'abandonedAt', args.period);
        
        if (args.status) {
            logs = logs.filter(l => l.recoveryStatus === args.status);
        }

        return {
            count: logs.length,
            logs: logs.slice(0, 5).map(l => ({
                id: l.id,
                customer: l.customerName || 'Visitante',
                contact: l.contact ? 'Sim' : 'Não',
                value: l.value,
                status: l.recoveryStatus,
                when: l.abandonedAt
            }))
        };
    },

    // 3.1 List Abandoned Carts (Detailed)
    listAbandonedCarts: (ctx: AIContext, args: { min_value?: number, limit?: number, period?: string }) => {
        const userCartIds = new Set(enforceUserScope(ctx.carts, ctx).map(c => c.id));
        const userCheckoutIds = new Set(enforceUserScope(ctx.checkouts, ctx).map(c => c.id));
        
        let logs = ctx.abandonmentLogs.filter(l => userCartIds.has(l.referenceId) || userCheckoutIds.has(l.referenceId));
        logs = filterByDate(logs, 'abandonedAt', args.period);
        
        // Filter by Pending status (Actionable)
        logs = logs.filter(l => l.recoveryStatus === 'pendente');

        if (args.min_value) {
            logs = logs.filter(l => l.value >= args.min_value!);
        }

        logs.sort((a, b) => b.value - a.value); // Higher value first

        return logs.slice(0, args.limit || 10).map(l => ({
            id: l.id,
            referenceId: l.referenceId,
            customer: l.customerName || 'Visitante',
            contact: l.contact,
            value: l.value,
            items: l.itemsSummary.map(i => i.name).join(', '),
            type: l.type,
            since: l.abandonedAt
        }));
    },

    // 3.2 Analyze Abandonment (Top Products/Recurrence)
    analyzeAbandonment: (ctx: AIContext, args: { type: 'products' | 'customers' }) => {
        const userCartIds = new Set(enforceUserScope(ctx.carts, ctx).map(c => c.id));
        const userCheckoutIds = new Set(enforceUserScope(ctx.checkouts, ctx).map(c => c.id));
        const logs = ctx.abandonmentLogs.filter(l => userCartIds.has(l.referenceId) || userCheckoutIds.has(l.referenceId));

        if (args.type === 'products') {
            const productStats = new Map<string, number>();
            logs.forEach(log => {
                log.itemsSummary.forEach(item => {
                    productStats.set(item.name, (productStats.get(item.name) || 0) + item.quantity);
                });
            });
            return Array.from(productStats.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ product: name, abandoned_count: count }));
        } else {
            const customerStats = new Map<string, number>();
            logs.forEach(log => {
                if (log.contact) {
                    const key = log.customerName ? `${log.customerName} (${log.contact})` : log.contact;
                    customerStats.set(key, (customerStats.get(key) || 0) + 1);
                }
            });
            return Array.from(customerStats.entries())
                .filter(([_, count]) => count > 1)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([customer, count]) => ({ customer, abandonment_count: count }));
        }
    },

    // 4. Marketing Endpoint
    getMarketingStats: (ctx: AIContext, args: { period?: string }) => {
        let traffic = enforceUserScope(ctx.traffic, ctx);
        traffic = filterByDate(traffic, 'date', args.period);
        
        const spend = traffic.reduce((acc, t) => acc + t.amountSpent, 0);
        const revenue = traffic.reduce((acc, t) => acc + t.revenueGenerated, 0);
        const sales = traffic.reduce((acc, t) => acc + t.salesCount, 0);
        const roas = spend > 0 ? revenue / spend : 0;

        return {
            period: args.period || 'all_time',
            ad_spend: spend,
            ad_revenue: revenue,
            sales_count: sales,
            roas: roas.toFixed(2)
        };
    },

    // 5. Finance Endpoint (DRE Light)
    getFinancialMetrics: (ctx: AIContext, args: { period?: string }) => {
        let orders = enforceUserScope(ctx.orders, ctx);
        orders = filterByDate(orders, 'date', args.period);
        
        const grossRevenue = orders.reduce((acc, o) => acc + o.itemsTotal + o.shippingCharged, 0);
        const discounts = orders.reduce((acc, o) => acc + o.discountTotal, 0);
        const refunds = orders.flatMap(o => o.postSaleEvents || []).reduce((acc, e) => acc + e.amount, 0);
        const netRevenue = grossRevenue - discounts - refunds;

        const productCosts = orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.unitCost * i.quantity, 0), 0);
        const shippingCosts = orders.reduce((acc, o) => acc + o.shippingCost, 0);
        const taxes = orders.reduce((acc, o) => acc + o.paymentFee + (o.platformFee || 0), 0);
        
        const grossProfit = netRevenue - productCosts - shippingCosts - taxes;
        
        let traffic = enforceUserScope(ctx.traffic, ctx);
        traffic = filterByDate(traffic, 'date', args.period);
        const adSpend = traffic.reduce((acc, t) => acc + t.amountSpent, 0);
        
        const netProfit = grossProfit - adSpend;
        const margin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

        return {
            orders_count: orders.length,
            gross_revenue: grossRevenue,
            net_revenue: netRevenue,
            costs: {
                products: productCosts,
                shipping: shippingCosts,
                taxes: taxes,
                marketing: adSpend
            },
            net_profit: netProfit,
            net_margin_percent: margin.toFixed(1)
        };
    },

    // 6. Supplier Metrics Endpoint
    getSupplierMetrics: (ctx: AIContext, args: { sort_by?: 'shipping_time' | 'returns' }) => {
        const stats = new Map<string, { id: string, name: string, daysSum: number, daysCount: number, itemsSold: number, itemsReturned: number }>();

        // Initialize with known suppliers
        const userSuppliers = enforceUserScope(ctx.suppliers || [], ctx);
        userSuppliers.forEach(s => {
            stats.set(s.id, { id: s.id, name: s.name, daysSum: 0, daysCount: 0, itemsSold: 0, itemsReturned: 0 });
        });

        const userOrders = enforceUserScope(ctx.orders, ctx);
        userOrders.forEach(o => {
            // Shipping Time
            let shippingDays = 0;
            if (o.date && o.shippingDate) {
                const start = new Date(o.date).getTime();
                const end = new Date(o.shippingDate).getTime();
                shippingDays = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
            }

            const isReturned = ['Returned', 'Refunded'].includes(o.status);

            o.items.forEach(item => {
                if (item.supplierId) {
                    const current = stats.get(item.supplierId) || { id: item.supplierId, name: 'Desconhecido', daysSum: 0, daysCount: 0, itemsSold: 0, itemsReturned: 0 };
                    
                    if (shippingDays > 0) {
                        current.daysSum += shippingDays;
                        current.daysCount++;
                    }
                    current.itemsSold += item.quantity;
                    if (isReturned) current.itemsReturned += item.quantity;
                    
                    stats.set(item.supplierId, current);
                }
            });
        });

        let result = Array.from(stats.values()).map(s => ({
            name: s.name,
            avg_shipping_days: s.daysCount > 0 ? parseFloat((s.daysSum / s.daysCount).toFixed(1)) : 0,
            return_rate: s.itemsSold > 0 ? parseFloat(((s.itemsReturned / s.itemsSold) * 100).toFixed(1)) : 0,
            volume: s.itemsSold
        }));

        if (args.sort_by === 'shipping_time') {
            result.sort((a,b) => b.avg_shipping_days - a.avg_shipping_days); // Worst (highest) first
        } else if (args.sort_by === 'returns') {
            result.sort((a,b) => b.return_rate - a.return_rate); // Worst (highest) first
        }

        return result;
    }
};

export const aiActionService = {
    // 1. Update Product Action
    updateProduct: (ctx: AIContext, actionCtx: AIActionContext, args: { name_or_sku: string, field: 'price' | 'stock' | 'status', value: any }) => {
        const search = args.name_or_sku.toLowerCase();
        // Strict scope check
        const userProducts = enforceUserScope(ctx.products, ctx);
        const product = userProducts.find(p => p.id === args.name_or_sku || p.name.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search));
        
        if (!product) return { success: false, message: `Produto "${args.name_or_sku}" não encontrado ou acesso negado.` };

        const newProduct = { ...product };
        if (args.field === 'price') newProduct.salePrice = Number(args.value);
        if (args.field === 'stock') newProduct.currentStock = Number(args.value);
        if (args.field === 'status') newProduct.status = String(args.value) as 'Active' | 'Inactive';

        actionCtx.updateProduct(newProduct);
        return { success: true, message: `Produto "${product.name}" atualizado. ${args.field} agora é ${args.value}.` };
    },

    // 2. Update Order Status
    updateOrderStatus: (ctx: AIContext, actionCtx: AIActionContext, args: { order_id: string, new_status: string }) => {
        const userOrders = enforceUserScope(ctx.orders, ctx);
        const order = userOrders.find(o => o.id === args.order_id || o.id.startsWith(args.order_id));
        
        if (!order) return { success: false, message: `Pedido "${args.order_id}" não encontrado ou acesso negado.` };

        const updatedOrder = { ...order, status: args.new_status as any };
        actionCtx.updateOrder(updatedOrder);
        return { success: true, message: `Pedido #${order.id.slice(0,8)} marcado como ${args.new_status}.` };
    },

    // 3. Send Recovery Message (Bulk or Single)
    sendRecoveryMessage: (ctx: AIContext, actionCtx: AIActionContext, args: { target: 'single' | 'bulk_cart' | 'bulk_checkout', id?: string, period?: string }) => {
        let targets: AbandonmentLog[] = [];
        
        const userCartIds = new Set(enforceUserScope(ctx.carts, ctx).map(c => c.id));
        const userCheckoutIds = new Set(enforceUserScope(ctx.checkouts, ctx).map(c => c.id));
        const userLogs = ctx.abandonmentLogs.filter(l => userCartIds.has(l.referenceId) || userCheckoutIds.has(l.referenceId));

        if (args.target === 'single' && args.id) {
            const log = userLogs.find(l => l.id === args.id);
            if (log) targets.push(log);
        } else if (args.target.includes('bulk')) {
            // Filter by period (e.g., 'today') and pending status
            const logs = filterByDate(userLogs, 'abandonedAt', args.period || 'today');
            targets = logs.filter(l => l.recoveryStatus === 'pendente' && l.contact);
            
            if (args.target === 'bulk_cart') targets = targets.filter(l => l.type === 'CART_ABANDONED');
            if (args.target === 'bulk_checkout') targets = targets.filter(l => l.type === 'CHECKOUT_ABANDONED');
        }

        if (targets.length === 0) return { success: false, message: "Nenhum alvo encontrado para envio de mensagem." };

        let sentCount = 0;
        targets.forEach(log => {
            actionCtx.updateAbandonmentLog(log.id, { 
                recoveryStatus: 'em_contato', 
                notes: (log.notes || '') + '\n[RS.AI] Mensagem de recuperação enviada automaticamente.' 
            });
            sentCount++;
        });

        return { 
            success: true, 
            message: `${sentCount} mensagens de recuperação enviadas com sucesso!`,
            details: `Alvos: ${targets.map(t => t.customerName).join(', ')}`
        };
    }
};
