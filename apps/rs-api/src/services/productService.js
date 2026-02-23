/**
 * RS PRÓLIPSI - PRODUCT SERVICE
 * Lógica de negócios para produtos e comissões
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Calcula a comissão para um produto baseado no nível do consultor
 * @param {object} product - Objeto do produto da tabela product_catalog
 * @param {string} consultantLevel - Nível do consultor (Ex: 'RS One Star')
 * @returns {object} - { value, percentage, type }
 */
async function calculateCommission(product, consultantLevel) {
    // Se não tiver nível, assume Iniciante (sem comissão de carreira, apenas direta se houver)
    if (!consultantLevel) return { value: 0, percentage: 0, type: 'none' };

    // Buscar regras do nível na tabela career_levels_digital
    const { data: levelData, error } = await supabase
        .from('career_levels_digital')
        .select('*')
        .eq('name', consultantLevel)
        .single();

    if (error || !levelData) {
        console.warn(`Nível ${consultantLevel} não encontrado ou erro:`, error?.message);
        return { value: 0, percentage: 0, type: 'error' };
    }

    let commissionPercentage = 0;
    let commissionType = 'unknown';

    // Lógica de seleção baseada no tipo do produto
    // 'commission_origin' deve vir do BD (adicionado via migration)
    const origin = product.commission_origin || 'rs_physical'; // Default fallback

    switch (origin) {
        case 'rs_physical':
            commissionPercentage = levelData.commission_physical_rs;
            commissionType = 'RS Físico';
            break;
        case 'rs_digital':
            commissionPercentage = levelData.commission_rs_digital;
            commissionType = 'RS Digital';
            break;
        case 'affiliate_physical':
            commissionPercentage = levelData.commission_physical_affiliate;
            commissionType = 'Afiliado Físico';
            break;
        case 'affiliate_digital':
            // Para digitais afiliados, depende do modelo (Essential, Professional, Premium)
            const model = product.affiliate_model || 'essential';
            if (model === 'essential') commissionPercentage = levelData.commission_affiliate_digital_essential;
            else if (model === 'professional') commissionPercentage = levelData.commission_affiliate_digital_professional;
            else if (model === 'premium') commissionPercentage = levelData.commission_affiliate_digital_premium;
            commissionType = `Afiliado Digital (${model})`;
            break;
        default:
            commissionPercentage = 0;
    }

    const commissionValue = (product.price_base * commissionPercentage) / 100;

    return {
        value: commissionValue,
        percentage: commissionPercentage,
        type: commissionType
    };
}

module.exports = {
    calculateCommission
};
