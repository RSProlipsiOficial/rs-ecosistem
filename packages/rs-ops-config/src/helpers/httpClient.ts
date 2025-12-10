/**
 * RS Prólipsi - HTTP Client Helper
 */

import { ServiceId } from '../registry/services';
import { getDomain } from '../registry/domains';
import { Environment } from '../registry/domains';

export class ServiceHttpClient {
    private env: Environment;

    constructor(env: Environment = 'production') {
        this.env = env;
    }

    private getBaseUrl(serviceId: ServiceId): string {
        return getDomain(serviceId, this.env);
    }

    async get<T>(serviceId: ServiceId, path: string, headers: Record<string, string> = {}): Promise<T> {
        const baseUrl = this.getBaseUrl(serviceId);
        const url = `${baseUrl}${path}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status} calling ${serviceId}: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    async post<T>(serviceId: ServiceId, path: string, body: any, headers: Record<string, string> = {}): Promise<T> {
        const baseUrl = this.getBaseUrl(serviceId);
        const url = `${baseUrl}${path}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status} calling ${serviceId}: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }
}
