/**
 * RS Prólipsi - Env Config Helper
 */

export function getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value;
}

export function getEnvNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    const num = Number(value);
    if (isNaN(num)) {
        throw new Error(`Environment variable ${key} must be a number.`);
    }
    return num;
}

export function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value.toLowerCase() === 'true' || value === '1';
}
