import { Product, Order, AbandonmentLog, ProductSupplier, PriceSuggestion } from '../types';

const TARGET_MARGIN_PERCENT = 25; // Target a 25% net margin after costs

export const generatePriceSuggestions = (
    products: Product[],
    orders: Order[],
    abandonmentLogs: AbandonmentLog[],
    productSuppliers: ProductSupplier[]
): PriceSuggestion[] => {
    
    const suggestions: PriceSuggestion[] = [];

    products.forEach(product => {
        if (product.status !== 'Active') return;
        
        // --- 1. Calculate Metrics ---
        
        // Cost
        const supplierCosts = productSuppliers.filter(ps => ps.productId === product.id).map(ps => ps.costPrice);
        if (supplierCosts.length === 0) return; // Cannot suggest without cost
        const lowestCost = Math.min(...supplierCosts);

        // Sales Volume
        const productOrders = orders.filter(o => o.items.some(i => i.productId === product.id));
        const salesVolume = productOrders.reduce((sum, o) => {
            const item = o.items.find(i => i.productId === product.id);
            return sum + (item?.quantity || 0);
        }, 0);

        // Abandonment Rate
        const abandonments = abandonmentLogs.filter(log => log.itemsSummary.some(i => i.name === product.name));
        const totalOpportunities = salesVolume + abandonments.length;
        const abandonmentRate = totalOpportunities > 0 ? (abandonments.length / totalOpportunities) * 100 : 0;
        
        // Current Margin
        const fees = product.salePrice * (product.gatewayFeeRate / 100);
        const currentProfit = product.salePrice - lowestCost - fees;
        const currentMargin = product.salePrice > 0 ? (currentProfit / product.salePrice) * 100 : 0;
        
        // --- 2. Generate Suggestion Logic ---
        
        let suggestedPrice = product.salePrice;
        let justification = "Preço atual parece adequado. Nenhuma alteração recomendada.";
        
        // Scenario 1: High abandonment rate, low sales. Price might be too high.
        if (abandonmentRate > 60 && salesVolume < 10 && currentMargin > TARGET_MARGIN_PERCENT + 10) {
            suggestedPrice = product.salePrice * 0.9; // Suggest a 10% decrease
            justification = "Alta taxa de abandono. Sugestão de redução de preço para testar a conversão.";
        }
        // Scenario 2: Low abandonment, high sales. Opportunity to increase margin.
        else if (abandonmentRate < 20 && salesVolume > 20 && currentMargin < TARGET_MARGIN_PERCENT) {
            // Calculate price needed for target margin
            const targetPrice = (lowestCost + fees) / (1 - (TARGET_MARGIN_PERCENT / 100));
            suggestedPrice = Math.min(targetPrice, product.salePrice * 1.1); // Increase, but cap at 10%
            justification = "Bom volume de vendas e baixo abandono. Oportunidade para aumentar a margem de lucro.";
        }
        // Scenario 3: Price is simply too low to be profitable
        else if (currentMargin < 15) {
            const targetPrice = (lowestCost + fees) / (1 - (TARGET_MARGIN_PERCENT / 100));
            suggestedPrice = targetPrice;
            justification = "Margem de lucro atual muito baixa. Ajuste de preço necessário para atingir a meta de lucratividade.";
        }
        
        // Round to nearest .90
        suggestedPrice = Math.floor(suggestedPrice) + 0.90;

        const projectedProfit = suggestedPrice - lowestCost - (suggestedPrice * (product.gatewayFeeRate / 100));
        const projectedMargin = suggestedPrice > 0 ? (projectedProfit / suggestedPrice) * 100 : 0;
        
        suggestions.push({
            id: product.id, // for DataTable
            productId: product.id,
            productName: product.name,
            currentPrice: product.salePrice,
            suggestedPrice,
            currentMargin,
            projectedMargin,
            justification,
            metrics: { salesVolume, abandonmentRate },
        });
    });

    return suggestions;
};