/**
 * RS Prólipsi - Service Registry Definitions
 */

export type ServiceId =
    | 'rs-api'
    | 'rs-config'
    | 'rs-core'
    | 'rs-logistica'
    | 'rs-ops'
    | 'rs-docs'
    | 'rs-admin'
    | 'rs-marketplace'
    | 'rs-walletpay'
    | 'rs-rotafacil'
    | 'rs-robo';

export interface ServiceRegistryItem {
    id: ServiceId;
    name: string;
    description: string;
    domain: string;          // ex.: api.rsprolipsi.com.br
    internalPort: number;    // porta dentro do container
    dockerService?: string;  // nome do serviço no docker-compose
    healthcheckPath?: string;
    tags?: string[];
    type: 'service' | 'frontend' | 'library' | 'tooling';
}

export const SERVICE_REGISTRY: Record<ServiceId, ServiceRegistryItem> = {
    'rs-api': {
        id: 'rs-api',
        name: 'RS API Gateway',
        description: 'Gateway principal REST API e orquestrador',
        domain: 'api.rsprolipsi.com.br',
        internalPort: 8080,
        dockerService: 'rs-api',
        healthcheckPath: '/health',
        tags: ['backend', 'core', 'api'],
        type: 'service'
    },
    'rs-config': {
        id: 'rs-config',
        name: 'RS Config',
        description: 'Sistema Central de Configuração (Library)',
        domain: 'N/A',
        internalPort: 0, // Lib
        tags: ['library', 'config'],
        type: 'library'
    },
    'rs-core': {
        id: 'rs-core',
        name: 'RS Core (SIGMA)',
        description: 'Núcleo de regras de negócio e banco de dados',
        domain: 'core.rsprolipsi.com.br', // Internal domain usually, but good to have
        internalPort: 4001,
        dockerService: 'rs-core',
        healthcheckPath: '/health',
        tags: ['backend', 'core', 'database'],
        type: 'service'
    },
    'rs-logistica': {
        id: 'rs-logistica',
        name: 'RS Logística',
        description: 'Gestão de CDs, estoque e entregas',
        domain: 'logistica.rsprolipsi.com.br',
        internalPort: 3005,
        dockerService: 'rs-logistica',
        healthcheckPath: '/health',
        tags: ['backend', 'logistics'],
        type: 'service'
    },
    'rs-ops': {
        id: 'rs-ops',
        name: 'RS Ops',
        description: 'Dashboard operacional e automação',
        domain: 'ops.rsprolipsi.com.br',
        internalPort: 3006,
        dockerService: 'rs-ops',
        tags: ['tooling', 'dashboard'],
        type: 'tooling'
    },
    'rs-docs': {
        id: 'rs-docs',
        name: 'RS Docs',
        description: 'Central de documentação',
        domain: 'docs.rsprolipsi.com.br',
        internalPort: 3007,
        dockerService: 'rs-docs',
        tags: ['docs', 'static'],
        type: 'service'
    },
    'rs-admin': {
        id: 'rs-admin',
        name: 'RS Admin Panel',
        description: 'Painel Administrativo Geral',
        domain: 'admin.rsprolipsi.com.br',
        internalPort: 3001,
        dockerService: 'rs-admin',
        tags: ['frontend', 'admin'],
        type: 'frontend'
    },
    'rs-marketplace': {
        id: 'rs-marketplace',
        name: 'RS Marketplace',
        description: 'Loja Virtual / E-commerce',
        domain: 'loja.rsprolipsi.com.br',
        internalPort: 3002,
        dockerService: 'rs-marketplace',
        tags: ['frontend', 'ecommerce'],
        type: 'frontend'
    },
    'rs-walletpay': {
        id: 'rs-walletpay',
        name: 'RS WalletPay',
        description: 'Carteira Digital e Pagamentos',
        domain: 'walletpay.rsprolipsi.com.br',
        internalPort: 3004,
        dockerService: 'rs-walletpay',
        tags: ['frontend', 'fintech'],
        type: 'frontend'
    },
    'rs-rotafacil': {
        id: 'rs-rotafacil',
        name: 'RS Rotafácil',
        description: 'Gestão de Rotas e Entregas',
        domain: 'rotafacil.rsprolipsi.com.br',
        internalPort: 3013,
        dockerService: 'rs-rotafacil',
        tags: ['frontend', 'logistics'],
        type: 'frontend'
    },
    'rs-robo': {
        id: 'rs-robo',
        name: 'RS Robo Kagi',
        description: 'Robô de Operações',
        domain: 'robo.rsprolipsi.com.br',
        internalPort: 5009,
        dockerService: 'rs-robo',
        tags: ['frontend', 'bot'],
        type: 'frontend'
    }
};
