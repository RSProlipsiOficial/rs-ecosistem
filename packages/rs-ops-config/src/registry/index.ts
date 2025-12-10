/**
 * RS Prólipsi - Service Registry
 * Mapeamento central de todos os serviços e domínios
 */

export type Environment = 'development' | 'production';

export interface ServiceConfig {
    name: string;
    url: string;
    internalUrl?: string; // URL para comunicação interna (Docker/K8s)
    description: string;
}

export const SERVICES = {
    API: 'rs-api',
    CONFIG: 'rs-config',
    CORE: 'rs-core',
    LOGISTICA: 'rs-logistica',
    OPS: 'rs-ops',
    DOCS: 'rs-docs',
    ADMIN: 'rs-admin',
    MARKETPLACE: 'rs-marketplace',
    WALLETPAY: 'rs-walletpay',
    ROTAFACIL: 'rs-rotafacil',
} as const;

export type ServiceName = typeof SERVICES[keyof typeof SERVICES];

const REGISTRY: Record<Environment, Record<ServiceName, ServiceConfig>> = {
    production: {
        [SERVICES.API]: {
            name: 'RS API',
            url: 'https://api.rsprolipsi.com.br',
            description: 'Gateway principal REST API',
        },
        [SERVICES.CONFIG]: {
            name: 'RS Config',
            url: 'N/A', // Lib interna
            description: 'Sistema central de configuração',
        },
        [SERVICES.CORE]: {
            name: 'RS Core',
            url: 'N/A', // Lib interna / DB
            description: 'Núcleo do sistema (SIGMA)',
        },
        [SERVICES.LOGISTICA]: {
            name: 'RS Logística',
            url: 'https://logistica.rsprolipsi.com.br',
            description: 'Gestão de CDs e entregas',
        },
        [SERVICES.OPS]: {
            name: 'RS Ops',
            url: 'https://ops.rsprolipsi.com.br',
            description: 'Dashboard operacional e orquestração',
        },
        [SERVICES.DOCS]: {
            name: 'RS Docs',
            url: 'https://docs.rsprolipsi.com.br',
            description: 'Documentação técnica',
        },
        [SERVICES.ADMIN]: {
            name: 'RS Admin',
            url: 'https://admin.rsprolipsi.com.br',
            description: 'Painel administrativo',
        },
        [SERVICES.MARKETPLACE]: {
            name: 'RS Marketplace',
            url: 'https://loja.rsprolipsi.com.br',
            description: 'E-commerce principal',
        },
        [SERVICES.WALLETPAY]: {
            name: 'RS WalletPay',
            url: 'https://walletpay.rsprolipsi.com.br',
            description: 'Carteira digital e pagamentos',
        },
        [SERVICES.ROTAFACIL]: {
            name: 'RS Rotafácil',
            url: 'https://rotafacil.rsprolipsi.com.br',
            description: 'Gestão de rotas e entregas',
        },
    },
    development: {
        [SERVICES.API]: {
            name: 'RS API (Dev)',
            url: 'http://localhost:8080',
            description: 'Gateway principal REST API',
        },
        [SERVICES.CONFIG]: {
            name: 'RS Config (Dev)',
            url: 'N/A',
            description: 'Sistema central de configuração',
        },
        [SERVICES.CORE]: {
            name: 'RS Core (Dev)',
            url: 'N/A',
            description: 'Núcleo do sistema (SIGMA)',
        },
        [SERVICES.LOGISTICA]: {
            name: 'RS Logística (Dev)',
            url: 'http://localhost:3005',
            description: 'Gestão de CDs e entregas',
        },
        [SERVICES.OPS]: {
            name: 'RS Ops (Dev)',
            url: 'http://localhost:3006',
            description: 'Dashboard operacional',
        },
        [SERVICES.DOCS]: {
            name: 'RS Docs (Dev)',
            url: 'http://localhost:3007',
            description: 'Documentação técnica',
        },
        [SERVICES.ADMIN]: {
            name: 'RS Admin (Dev)',
            url: 'http://localhost:3001',
            description: 'Painel administrativo',
        },
        [SERVICES.MARKETPLACE]: {
            name: 'RS Marketplace (Dev)',
            url: 'http://localhost:3002',
            description: 'E-commerce principal',
        },
        [SERVICES.WALLETPAY]: {
            name: 'RS WalletPay (Dev)',
            url: 'http://localhost:3004',
            description: 'Carteira digital',
        },
        [SERVICES.ROTAFACIL]: {
            name: 'RS Rotafácil (Dev)',
            url: 'http://localhost:3013',
            description: 'Gestão de rotas',
        },
    },
};

export function getServiceUrl(service: ServiceName, env: Environment = 'production'): string {
    return REGISTRY[env][service].url;
}

export function getServiceConfig(service: ServiceName, env: Environment = 'production'): ServiceConfig {
    return REGISTRY[env][service];
}

export default REGISTRY;
