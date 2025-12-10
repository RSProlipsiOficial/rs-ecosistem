/**
 * RS Prólipsi - Container Registry
 * Mapeamento de containers Docker e portas
 */

import { ServiceId } from './services';

export interface ContainerConfig {
    serviceId: ServiceId;
    containerName: string;
    internalPort: number;
    externalPort: number;
    network: string;
}

export const CONTAINER_REGISTRY: Record<ServiceId, ContainerConfig> = {
    'rs-api': {
        serviceId: 'rs-api',
        containerName: 'rs-api',
        internalPort: 8080,
        externalPort: 8080,
        network: 'rs-network'
    },
    'rs-config': {
        serviceId: 'rs-config',
        containerName: 'N/A',
        internalPort: 0,
        externalPort: 0,
        network: 'N/A'
    },
    'rs-core': {
        serviceId: 'rs-core',
        containerName: 'N/A',
        internalPort: 0,
        externalPort: 0,
        network: 'N/A'
    },
    'rs-logistica': {
        serviceId: 'rs-logistica',
        containerName: 'rs-logistica',
        internalPort: 3005,
        externalPort: 3005,
        network: 'rs-network'
    },
    'rs-ops': {
        serviceId: 'rs-ops',
        containerName: 'rs-ops',
        internalPort: 3006,
        externalPort: 3006,
        network: 'rs-network'
    },
    'rs-docs': {
        serviceId: 'rs-docs',
        containerName: 'rs-docs',
        internalPort: 3007,
        externalPort: 3007,
        network: 'rs-network'
    },
    'rs-admin': {
        serviceId: 'rs-admin',
        containerName: 'rs-admin',
        internalPort: 80, // Nginx internal
        externalPort: 3001,
        network: 'rs-network'
    },
    'rs-marketplace': {
        serviceId: 'rs-marketplace',
        containerName: 'rs-marketplace',
        internalPort: 80, // Nginx internal
        externalPort: 3002,
        network: 'rs-network'
    },
    'rs-walletpay': {
        serviceId: 'rs-walletpay',
        containerName: 'rs-walletpay',
        internalPort: 80, // Nginx internal
        externalPort: 3004,
        network: 'rs-network'
    },
    'rs-rotafacil': {
        serviceId: 'rs-rotafacil',
        containerName: 'rs-rotafacil',
        internalPort: 80, // Nginx internal
        externalPort: 3013,
        network: 'rs-network'
    },
    'rs-robo': {
        serviceId: 'rs-robo',
        containerName: 'rs-robo',
        internalPort: 80, // Nginx internal
        externalPort: 5009,
        network: 'rs-network'
    }
};

export function getContainerConfig(serviceId: ServiceId): ContainerConfig {
    return CONTAINER_REGISTRY[serviceId];
}
