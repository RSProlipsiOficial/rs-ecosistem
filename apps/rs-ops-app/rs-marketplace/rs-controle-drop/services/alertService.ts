import { Order, Product, TrafficSpend, AppAlert, AlertSeverity, ProductSupplier } from '../types';

// 1. Low Stock Alert
const checkLowStock = (products: Product[]): AppAlert[] => {
  return products
    .filter(p => p.status === 'Active' && p.currentStock <= p.minStock)
    .map(p => ({
      id: `low-stock-${p.id}`,
      type: 'LOW_STOCK',
      severity: 'CRITICAL',
      title: 'Estoque Baixo Crítico',
      message: `O produto "${p.name}" atingiu o estoque mínimo. Apenas ${p.currentStock} unidades restantes.`,
      relatedEntityId: p.id,
    }));
};

// 2. Negative ROI Streak
const checkNegativeRoiStreak = (traffic: TrafficSpend[]): AppAlert[] => {
    const sortedTrafficByDate = [...traffic].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const dailySpend = new Map<string, { spend: number, revenue: number }>();
    sortedTrafficByDate.forEach(t => {
        const entry = dailySpend.get(t.date) || { spend: 0, revenue: 0 };
        entry.spend += t.amountSpent;
        entry.revenue += t.revenueGenerated;
        dailySpend.set(t.date, entry);
    });

    const dailyPerformance = Array.from(dailySpend.entries())
        .map(([date, data]) => ({ date, roas: data.spend > 0 ? data.revenue / data.spend : 1 }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let negativeStreak = 0;
    for (const day of dailyPerformance) {
        if (day.roas < 1) {
            negativeStreak++;
        } else {
            negativeStreak = 0;
        }
        if (negativeStreak >= 3) {
            return [{
                id: 'neg-roi-streak',
                type: 'NEGATIVE_ROI_STREAK',
                severity: 'CRITICAL',
                title: 'ROI de Tráfego Negativo',
                message: `O ROAS está abaixo de 1x por ${negativeStreak} dias consecutivos. Ações imediatas são necessárias nas campanhas.`,
            }];
        }
    }
    return [];
};


// 3. Low Product Margin
const checkLowProductMargin = (products: Product[], productSuppliers: ProductSupplier[]): AppAlert[] => {
    const alerts: AppAlert[] = [];
    products.forEach(p => {
        if (p.status !== 'Active') return;
        
        const supplierCosts = productSuppliers
            .filter(ps => ps.productId === p.id)
            .map(ps => ps.costPrice);
        
        if (supplierCosts.length === 0) return;

        const lowestCost = Math.min(...supplierCosts);
        const netRevenue = p.salePrice + p.shippingCharged;
        const fees = netRevenue * (p.gatewayFeeRate / 100);
        const costs = lowestCost + p.shippingCost + fees;
        const profit = netRevenue - costs;
        const margin = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
        
        if (margin < 25) {
            alerts.push({
                id: `low-margin-${p.id}`,
                type: 'LOW_PRODUCT_MARGIN',
                severity: 'WARNING',
                title: 'Margem de Lucro Baixa',
                message: `O produto "${p.name}" tem uma margem de contribuição estimada de apenas ${margin.toFixed(1)}%. Considere renegociar custos ou ajustar o preço.`,
                relatedEntityId: p.id,
            });
        }
    });
    return alerts;
};


// 4. High Return Rate
const checkHighReturnRate = (orders: Order[]): AppAlert[] => {
    const productStats = new Map<string, { salesCount: number, returnCount: number, name: string }>();

    orders.forEach(order => {
        const isReturnedOrRefunded = ['Returned', 'Refunded'].includes(order.status) || (order.postSaleEvents && order.postSaleEvents.length > 0);
        order.items.forEach(item => {
            const stat = productStats.get(item.productId) || { salesCount: 0, returnCount: 0, name: item.productName };
            stat.salesCount += item.quantity;
            if (isReturnedOrRefunded) {
                stat.returnCount += item.quantity;
            }
            productStats.set(item.productId, stat);
        });
    });

    const alerts: AppAlert[] = [];
    productStats.forEach((stat, productId) => {
        if (stat.salesCount >= 5) { // Threshold to avoid noise on low volume
            const returnRate = (stat.returnCount / stat.salesCount) * 100;
            if (returnRate > 10) { 
                alerts.push({
                    id: `high-return-${productId}`,
                    type: 'HIGH_RETURN_RATE',
                    severity: 'WARNING',
                    title: 'Alta Taxa de Devolução',
                    message: `O produto "${stat.name}" tem uma taxa de devolução de ${returnRate.toFixed(1)}%. Investigue a qualidade ou a descrição do produto.`,
                    relatedEntityId: productId,
                });
            }
        }
    });

    return alerts;
};


// Main function
export const generateAlerts = (
    orders: Order[], 
    products: Product[],
    productSuppliers: ProductSupplier[],
    traffic: TrafficSpend[]
): AppAlert[] => {
    const allAlerts: AppAlert[] = [];
    
    allAlerts.push(...checkLowStock(products));
    allAlerts.push(...checkNegativeRoiStreak(traffic));
    allAlerts.push(...checkLowProductMargin(products, productSuppliers));
    allAlerts.push(...checkHighReturnRate(orders));
    
    // Sort by severity: Critical first, then Warnings
    return allAlerts.sort((a, b) => {
        if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
        if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
        return 0;
    });
};
