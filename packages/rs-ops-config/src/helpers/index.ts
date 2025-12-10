/**
 * RS Prólipsi - Ops Helpers
 * Utilitários para operações e monitoramento
 */

import { ServiceName, getServiceUrl } from '../registry';

export interface HealthCheckResponse {
    status: 'ok' | 'error' | 'maintenance';
    service: string;
    version: string;
    timestamp: string;
    uptime?: number;
}

export function createHealthCheck(serviceName: string, version: string): HealthCheckResponse {
    return {
        status: 'ok',
        service: serviceName,
        version,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
}

export function getServiceHealthUrl(service: ServiceName, env: 'development' | 'production' = 'production'): string {
    const baseUrl = getServiceUrl(service, env);
    // Remove trailing slash if exists
    const cleanUrl = baseUrl.replace(/\/$/, '');
    return `${cleanUrl}/health`;
}

export const Logger = {
    info: (context: string, message: string, meta?: any) => {
        console.log(JSON.stringify({ level: 'info', context, message, meta, timestamp: new Date() }));
    },
    error: (context: string, message: string, error?: any) => {
        console.error(JSON.stringify({ level: 'error', context, message, error, timestamp: new Date() }));
    },
    warn: (context: string, message: string, meta?: any) => {
        console.warn(JSON.stringify({ level: 'warn', context, message, meta, timestamp: new Date() }));
    },
};
