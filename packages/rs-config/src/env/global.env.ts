/**
 * Configurações Globais do Sistema
 */

export interface GlobalConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    timezone: string;
    locale: string;
  };
  
  server: {
    apiUrl: string;
    adminUrl: string;
    consultorUrl: string;
    port: number;
  };
  
  system: {
    adminEmail: string;
    supportEmail: string;
    notificationEmail: string;
  };
  
  features: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
  };
  
  limits: {
    maxReentriesPerMonth: number;
    maxUploadSizeMB: number;
    sessionTimeoutMinutes: number;
  };
}

/**
 * Configuração global do sistema
 */
export const globalConfig: GlobalConfig = {
  app: {
    name: 'RS Prólipsi',
    version: '1.0.0',
    environment: (process.env.NODE_ENV as any) || 'development',
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
  },
  
  server: {
    apiUrl: process.env.API_URL || 'http://localhost:8080',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3000',
    consultorUrl: process.env.CONSULTOR_URL || 'http://localhost:3001',
    port: parseInt(process.env.PORT || '8080'),
  },
  
  system: {
    adminEmail: process.env.ADMIN_EMAIL || '',
    supportEmail: process.env.SUPPORT_EMAIL || '',
    notificationEmail: process.env.NOTIFICATION_EMAIL || '',
  },
  
  features: {
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  },
  
  limits: {
    maxReentriesPerMonth: parseInt(process.env.MAX_REENTRIES || '10'),
    maxUploadSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5'),
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT || '60'),
  },
};

/**
 * Retorna configuração atual
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig };
}

/**
 * Verifica se está em produção
 */
export function isProduction(): boolean {
  return globalConfig.app.environment === 'production';
}

/**
 * Verifica se está em modo manutenção
 */
export function isMaintenanceMode(): boolean {
  return globalConfig.features.maintenanceMode;
}
