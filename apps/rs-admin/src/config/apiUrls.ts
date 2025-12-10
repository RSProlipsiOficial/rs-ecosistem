// Configuração centralizada de URLs da API V1

/**
 * Helper para construir URLs com query parameters
 */
export const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * URLs da API V1 - Padrão unificado
 */
export const API_URLS = {
  // 🔐 Autenticação
  AUTH: {
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    VERIFY: '/v1/auth/verify',
    REFRESH: '/v1/auth/refresh',
  },

  // 👥 Consultores
  CONSULTANTS: {
    GET_ALL: '/admin/consultants',
    GET_BY_ID: '/admin/consultor/:id',
    CREATE: '/v1/consultants',
    LOOKUP: '/v1/consultants/lookup',
    SPREADSHEET_MODEL: '/v1/consultants/spreadsheet-model',
    UPDATE: '/admin/consultor/:id',
    DELETE: '/v1/consultants/:id',
    UPDATE_STATUS: '/v1/consultants/:id/status',
    GET_STATS: '/v1/consultants/stats',
  },

  // ⚙️ Configurações SIGMA
  SIGMA: {
    MATRIX_CONFIG: '/v1/sigma/matrix/config',
    TOP_CONFIG: '/v1/sigma/top/config',
    CALCULATE: '/v1/sigma/calculate',
    GET_HISTORY: '/v1/sigma/history',
  },

  // 📊 Dashboard & Relatórios
  DASHBOARD: {
    OVERVIEW: '/v1/dashboard/overview',
    PERFORMANCE: '/v1/dashboard/performance',
    FINANCIAL: '/v1/dashboard/financial',
  },

  // 📢 Comunicações
  COMMUNICATIONS: {
    ANNOUNCEMENTS: '/v1/communications/announcements',
    AGENDA: '/v1/communications/agenda',
    TRAININGS: '/v1/communications/trainings',
    MATERIALS: '/v1/communications/materials',
    CATALOGS: '/v1/communications/catalogs',
    INCREMENT_CATALOG_DOWNLOAD: '/v1/communications/catalogs/:id/increment-download',
    INCREMENT_MATERIAL_DOWNLOAD: '/v1/communications/materials/:id/increment-download',
  },

  // 💰 Wallet & Pagamentos
  WALLET: {
    BALANCE: '/v1/wallet/balance',
    TRANSACTIONS: '/v1/wallet/transactions',
    WITHDRAW: '/v1/wallet/withdraw',
    GET_BANK_ACCOUNTS: '/v1/wallet/bank-accounts',
    ADD_BANK_ACCOUNT: '/v1/wallet/bank-accounts',
  },

  // 🎨 AlicePaint & MarkupPlates
  ALICE_PAINT: {
    PROJECTS: '/v1/alice-paint/projects',
    CREATE_PROJECT: '/v1/alice-paint/projects',
    GET_PROJECT: '/v1/alice-paint/projects/:id',
    UPDATE_PROJECT: '/v1/alice-paint/projects/:id',
    DELETE_PROJECT: '/v1/alice-paint/projects/:id',
    RENDER: '/v1/alice-paint/render',
  },

  MARKUP_PLATES: {
    TEMPLATES: '/v1/markup-plates/templates',
    CREATE_TEMPLATE: '/v1/markup-plates/templates',
    GET_TEMPLATE: '/v1/markup-plates/templates/:id',
    UPDATE_TEMPLATE: '/v1/markup-plates/templates/:id',
    DELETE_TEMPLATE: '/v1/markup-plates/templates/:id',
    APPLY_MARKUP: '/v1/markup-plates/apply',
  },

  // 📦 Produtos & Catálogo
  PRODUCTS: {
    GET_ALL: '/v1/products',
    GET_BY_ID: '/v1/products/:id',
    GET_CATEGORIES: '/v1/products/categories',
    SEARCH: '/v1/products/search',
  },

  // 👤 Perfil & Configurações
  PROFILE: {
    GET: '/v1/profile',
    UPDATE: '/v1/profile',
    CHANGE_PASSWORD: '/v1/profile/change-password',
    UPLOAD_AVATAR: '/v1/profile/avatar',
  },

  // 📊 Analytics & Métricas
  ANALYTICS: {
    VISITS: '/v1/analytics/visits',
    CONVERSIONS: '/v1/analytics/conversions',
    PERFORMANCE: '/v1/analytics/performance',
  },

  // 💰 Compensação & Planos
  COMPENSATION: {
    SETTINGS: '/v1/compensation/settings',
  },

  // 📈 Relatórios
  REPORTS: {
    FINANCIAL: '/v1/reports/financial',
    PERFORMANCE: '/v1/reports/performance',
    NETWORK: '/v1/reports/network',
    SALES: '/v1/reports/sales',
    EXPORT: '/v1/reports/export',
  },

  // 🛍️ Shop API
  SHOP: {
    PRODUCTS: '/v1/shop/products',
    ORDERS: '/v1/shop/orders',
    AFFILIATE_LINKS: '/v1/shop/affiliate-links',
    GENERATE_LINK: '/v1/shop/generate-link',
    CATEGORIES: '/v1/shop/categories',
    INVENTORY: '/v1/shop/inventory',
  },

  // 🎨 Studio API
  STUDIO: {
    GENERATE: '/v1/studio/generate',
    CREATIONS: '/v1/studio/creations',
    TEMPLATES: '/v1/studio/templates',
    HISTORY: '/v1/studio/history',
  },
} as const;
