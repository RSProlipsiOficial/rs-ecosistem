/**
 * 📋 ENDPOINTS OFICIAIS V1 - RS-PROLIPSI API
 * 
 * Esta definição centraliza todos os endpoints oficiais do V1
 * seguindo o padrão de versionamento /v1/
 */

export const V1_ENDPOINTS = {
  // ==================== CORE & SYSTEM ====================
  SYSTEM: {
    CONFIG: '/v1/system/config',
    HEALTH: '/v1/system/health',
    VERSION: '/v1/system/version'
  },

  // ==================== AUTH & PROFILES ====================
  AUTH: {
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    PROFILE: '/v1/auth/profile',
    REFRESH: '/v1/auth/refresh'
  },

  // ==================== CONSULTOR ====================
  CONSULTOR: {
    DASHBOARD: '/v1/consultor/dashboard',
    NETWORK: '/v1/consultor/network',
    REFERRAL_LINK: '/v1/consultor/referral-link',
    SIGMA_TREE: '/v1/consultor/sigma-tree',
    PERFORMANCE: '/v1/consultor/performance'
  },

  // ==================== WALLETPAY ====================
  WALLET: {
    BALANCE: '/v1/wallet/balance',
    TRANSACTIONS: '/v1/wallet/transactions',
    STATEMENT: '/v1/wallet/statement',
    WITHDRAW: '/v1/wallet/withdraw',
    WITHDRAWALS: '/v1/wallet/withdrawals',
    COMMISSION: '/v1/wallet/register-commission',
    TRANSFER: '/v1/wallet/transfer',
    PIX: {
      CREATE: '/v1/wallet/pix/create',
      LIST: '/v1/wallet/pix/list',
      DELETE: '/v1/wallet/pix/delete'
    }
  },

  // ==================== ADMIN ====================
  ADMIN: {
    OVERVIEW: '/v1/admin/overview',
    CONSULTANTS: '/v1/admin/consultants',
    CONSULTANT_DETAIL: '/v1/admin/consultants/:id',
    FINANCIAL_REPORTS: '/v1/admin/financial-reports',
    SIGMA_CONFIG: '/v1/admin/sigma-config',
    PINS_CONFIG: '/v1/admin/pins-config',
    SYSTEM_LOGS: '/v1/admin/system-logs'
  },

  // ==================== SIGMA ====================
  SIGMA: {
    TREE: '/v1/sigma/tree',
    STATS: '/v1/sigma/stats',
    CONFIG: '/v1/sigma/config'
  }
} as const;

export type V1Endpoint = typeof V1_ENDPOINTS;

export function getV1Endpoint(category: keyof V1Endpoint, endpoint: string): string {
  return V1_ENDPOINTS[category][endpoint as keyof V1Endpoint[typeof category]];
}