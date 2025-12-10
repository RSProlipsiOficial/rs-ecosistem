/**
 * RS Prólipsi - Static Business Rules
 */

export const RULES = {
    SIGMA: {
        CYCLE_VALUE: 360.00,
        POINTS_PER_REAL: 1,
        MAX_LEVEL: 'PRESIDENTE',
    },
    LOGISTICS: {
        DEFAULT_SHIPPING_COST: 0, // Frete grátis por enquanto?
        MAX_DELIVERY_DAYS: 15,
        MIN_STOCK_ALERT: 10,
    },
    WALLETPAY: {
        MIN_WITHDRAWAL: 50.00,
        TRANSFER_FEE: 0.00,
    },
    SYSTEM: {
        MAINTENANCE_MODE_KEY: 'RS_MAINTENANCE_MODE',
        SUPPORT_EMAIL: 'suporte@rsprolipsi.com.br',
    }
};
