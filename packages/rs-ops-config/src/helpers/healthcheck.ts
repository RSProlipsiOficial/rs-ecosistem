/**
 * RS Prólipsi - Healthcheck Helper
 */

import { ServiceId, SERVICE_REGISTRY } from '../registry/services';
import { ServiceHttpClient } from './httpClient';
import { Environment } from '../registry/domains';

export interface HealthStatus {
    serviceId: ServiceId;
    status: 'up' | 'down' | 'unknown';
    latency?: number;
    lastChecked: string;
    details?: any;
}

export class HealthChecker {
    private client: ServiceHttpClient;

    constructor(env: Environment = 'production') {
        this.client = new ServiceHttpClient(env);
    }

    async checkService(serviceId: ServiceId): Promise<HealthStatus> {
        const service = SERVICE_REGISTRY[serviceId];

        if (!service.healthcheckPath) {
            return {
                serviceId,
                status: 'unknown',
                lastChecked: new Date().toISOString(),
                details: 'No healthcheck path configured'
            };
        }

        const start = Date.now();
        try {
            await this.client.get(serviceId, service.healthcheckPath);
            const latency = Date.now() - start;

            return {
                serviceId,
                status: 'up',
                latency,
                lastChecked: new Date().toISOString()
            };
        } catch (error) {
            return {
                serviceId,
                status: 'down',
                lastChecked: new Date().toISOString(),
                details: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async checkAll(services: ServiceId[]): Promise<HealthStatus[]> {
        return Promise.all(services.map(id => this.checkService(id)));
    }
}
