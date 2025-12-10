/**
 * RS Prólipsi - Domain Registry
 * Mapeamento de domínios por ambiente
 */

import { ServiceId } from './services';

export type Environment = 'development' | 'production' | 'staging';

export const DOMAIN_REGISTRY: Record<Environment, Record<ServiceId, string>> = {
    production: {
        'rs-api': 'https://api.rsprolipsi.com.br',
        'rs-config': 'N/A',
        'rs-core': 'N/A',
        'rs-logistica': 'https://logistica.rsprolipsi.com.br',
        'rs-ops': 'https://ops.rsprolipsi.com.br',
        'rs-docs': 'https://docs.rsprolipsi.com.br',
        'rs-admin': 'https://admin.rsprolipsi.com.br',
        'rs-marketplace': 'https://loja.rsprolipsi.com.br',
        'rs-walletpay': 'https://walletpay.rsprolipsi.com.br',
        'rs-rotafacil': 'https://rotafacil.rsprolipsi.com.br',
        'rs-robo': 'https://robo.rsprolipsi.com.br'
    },
    development: {
        'rs-api': 'http://localhost:8080',
        'rs-config': 'N/A',
        'rs-core': 'N/A',
        'rs-logistica': 'http://localhost:3005',
        'rs-ops': 'http://localhost:3006',
        'rs-docs': 'http://localhost:3007',
        'rs-admin': 'http://localhost:3001',
        'rs-marketplace': 'http://localhost:3002',
        'rs-walletpay': 'http://localhost:3004',
        'rs-rotafacil': 'http://localhost:3013',
        'rs-robo': 'http://localhost:5009'
    },
    staging: {
        'rs-api': 'https://api-staging.rsprolipsi.com.br',
        'rs-config': 'N/A',
        'rs-core': 'N/A',
        'rs-logistica': 'https://logistica-staging.rsprolipsi.com.br',
        'rs-ops': 'https://ops-staging.rsprolipsi.com.br',
        'rs-docs': 'https://docs-staging.rsprolipsi.com.br',
        'rs-admin': 'https://admin-staging.rsprolipsi.com.br',
        'rs-marketplace': 'https://loja-staging.rsprolipsi.com.br',
        'rs-walletpay': 'https://walletpay-staging.rsprolipsi.com.br',
        'rs-rotafacil': 'https://rotafacil-staging.rsprolipsi.com.br',
        'rs-robo': 'https://robo-staging.rsprolipsi.com.br'
    }
};

export function getDomain(serviceId: ServiceId, env: Environment = 'production'): string {
    return DOMAIN_REGISTRY[env][serviceId] || '';
}
