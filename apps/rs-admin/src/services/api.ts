// API Service atualizado usando o novo client unificado V1
// Este arquivo mantém compatibilidade com código existente enquanto migra para a API V1

import { apiServices, apiUtils, ApiResponse, ApiError } from './apiClient';
import { API_URLS, buildUrl } from '../config/apiUrls';

// Re-export types for backward compatibility
export type { ApiResponse, ApiError };

// Preserve existing api instance for compatibility
// Note: New code should use apiServices directly
const api = {
  // Proxy methods to maintain compatibility
  get: (url: string, config?: any) => apiServices._legacy.get(url, config),
  post: (url: string, data?: any, config?: any) => apiServices._legacy.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiServices._legacy.put(url, data, config),
  delete: (url: string, config?: any) => apiServices._legacy.delete(url, config),
  patch: (url: string, data?: any, config?: any) => apiServices._legacy.patch(url, data, config),
};

// ============================================
// 🔐 AUTH API - Autenticação Admin (V1)
// ============================================
export const authAPI = {
  login: (email: string, password: string) =>
    apiServices.auth.login({ email, password }),

  logout: () =>
    apiServices.auth.logout(),

  verifyToken: () =>
    apiServices.auth.verifyToken(),

  getProfile: (): Promise<ApiResponse> =>
    apiUtils.get(API_URLS.PROFILE.GET)
};

// ============================================
// 👥 CONSULTANTS API - Gestão de Consultores (V1)
// ============================================
export const consultantsAPI = {
  getAll: (filters?: any): Promise<ApiResponse<any[]>> =>
    apiServices.consultants.list(filters),

  getById: (id: string): Promise<ApiResponse> =>
    apiServices.consultants.get(id),

  getNetworkTree: (id: string, depth: number = 4): Promise<ApiResponse<{ tree: any }>> =>
    apiUtils.get(`/v1/admin/network/tree/${id}?depth=${depth}`),

  getNetworkChildren: (id: string): Promise<ApiResponse<{ children: any[] }>> =>
    apiUtils.get(`/v1/admin/network/children/${id}`),
  getNetworkRoot: (): Promise<ApiResponse<{ root: any }>> =>
    apiUtils.get(`/v1/admin/network/root`),

  create: (data: any): Promise<ApiResponse> =>
    apiServices.consultants.create(data),

  update: (id: string, data: any): Promise<ApiResponse> =>
    apiServices.consultants.update(id, data),

  delete: (id: string): Promise<ApiResponse> =>
    apiServices.consultants.delete(id),

  updateStatus: (id: string, status: string): Promise<ApiResponse> =>
    apiServices.consultants.updateStatus(id, status),

  lookup: (q: string): Promise<ApiResponse> =>
    apiServices.consultants.lookup(q),

  getSpreadsheetModel: (format: 'xlsx' | 'csv' = 'xlsx'): Promise<ApiResponse> =>
    apiServices.consultants.getSpreadsheetModel(format),
};

// ============================================
// ⚙️ SIGMA CONFIG API - Configurações SIGMA (V1)
// ============================================
export const sigmaConfigAPI = {
  // Matriz SIGMA
  getMatrixConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/sigma/matrix/config'),

  updateMatrixConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/sigma/matrix/config', data),

  // Top SIGMA
  getTopSigmaConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/sigma/top/config'),

  updateTopSigmaConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/sigma/top/config', data),

  // Bonuses
  getBonusConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/sigma/bonuses/config'),

  updateBonusConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/sigma/bonuses/config', data),

  // Commissions
  getCommissionConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/sigma/commissions/config'),

  updateCommissionConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/sigma/commissions/config', data),

  getMatrixTree: (id: string, depth: number = 3): Promise<ApiResponse<{ tree: any }>> =>
    apiUtils.get(`/v1/matrix/tree/${id}?depth=${depth}`)
};

// ============================================
// ⚙️ SETTINGS API - Configurações Gerais (V1)
// ============================================
export const settingsAPI = {
  getGeneralSettings: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/settings/general'),

  updateGeneralSettings: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/settings/general', data),

  getNotificationSettings: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/settings/notifications'),

  updateNotificationSettings: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/settings/notifications', data),

  syncNetwork: (): Promise<ApiResponse> =>
    apiUtils.post('/v1/ops/sync-network'),

  recalcBonuses: (period: string = 'daily'): Promise<ApiResponse> =>
    apiUtils.post('/v1/ops/recalc-bonuses', { period }),

  getAllSettings: async (): Promise<ApiResponse> => {
    const [general, notifications] = await Promise.all([
      apiUtils.get('/v1/admin/settings/general'),
      apiUtils.get('/v1/admin/settings/notifications')
    ]);
    return {
      data: {
        general: (general as ApiResponse).data,
        notifications: (notifications as ApiResponse).data
      },
      status: 200
    };
  }
};

// ============================================
// 📊 DASHBOARD API - Métricas e Estatísticas (V1)
// ============================================
export const dashboardAPI = {
  getStats: (): Promise<ApiResponse> =>
    apiServices.dashboard.getStats(),

  getMetrics: (period?: string): Promise<ApiResponse> =>
    apiServices.dashboard.getMetrics(period),

  getKPI: (): Promise<ApiResponse> =>
    apiServices.dashboard.getKPI()
};

// ============================================
// 📢 COMMUNICATIONS API - Comunicações (V1)
// ============================================
export const communicationsAPI = {
  getAnnouncements: (): Promise<ApiResponse> =>
    apiServices.communications.getAnnouncements(),

  getAgenda: (): Promise<ApiResponse> =>
    apiServices.communications.getAgenda(),

  getTrainings: (): Promise<ApiResponse> =>
    apiServices.communications.getTrainings(),

  getMaterials: (): Promise<ApiResponse> =>
    apiServices.communications.getMaterials(),

  getCatalogs: (): Promise<ApiResponse> =>
    apiServices.communications.getCatalogs(),

  incrementCatalogDownload: (id: string): Promise<ApiResponse> =>
    apiServices.communications.incrementCatalogDownload(id),

  incrementMaterialDownload: (id: string): Promise<ApiResponse> =>
    apiServices.communications.incrementMaterialDownload(id)
};

// ============================================
// 💰 WALLET API - Gestão Financeira (V1)
// ============================================
export const walletAPI = {
  getBalance: (): Promise<ApiResponse> =>
    apiServices.wallet.getBalance(),

  getTransactions: (filters?: any): Promise<ApiResponse> =>
    apiServices.wallet.getTransactions(filters),

  requestWithdrawal: (amount: number, method: string): Promise<ApiResponse> =>
    apiServices.wallet.requestWithdrawal({ amount, method })
};

// ============================================
// 🛍️ SHOP API - Marketplace (V1)
// ============================================
export const shopAPI = {
  getProducts: (filters?: any): Promise<ApiResponse> =>
    apiServices.shop.getProducts(filters),

  getOrders: (filters?: any): Promise<ApiResponse> =>
    apiServices.shop.getOrders(filters),

  createOrder: (data: any): Promise<ApiResponse> =>
    apiServices.shop.createOrder(data),

  getAffiliateLinks: (): Promise<ApiResponse> =>
    apiServices.shop.getAffiliateLinks(),

  generateLink: (productId: string): Promise<ApiResponse> =>
    apiServices.shop.generateLink(productId),

  getCategories: (): Promise<ApiResponse> =>
    apiUtils.get(API_URLS.SHOP.CATEGORIES),

  getInventory: (): Promise<ApiResponse> =>
    apiUtils.get(API_URLS.SHOP.INVENTORY)
};

// ============================================
// 🎨 STUDIO API - IA e Conteúdo (V1)
// ============================================
export const studioAPI = {
  generateContent: (prompt: string, type: string): Promise<ApiResponse> =>
    apiServices.studio.generateContent(prompt, type),

  getCreations: (): Promise<ApiResponse> =>
    apiServices.studio.getCreations(),

  saveCreation: (data: any): Promise<ApiResponse> =>
    apiServices.studio.saveCreation(data),

  getTemplates: (): Promise<ApiResponse> =>
    apiUtils.get(API_URLS.STUDIO.TEMPLATES),

  getHistory: (): Promise<ApiResponse> =>
    apiUtils.get(API_URLS.STUDIO.HISTORY)
};

// ============================================
// 🏆 CAREER PLAN API - Plano de Carreira
// ============================================
export const careerPlanAPI = {
  getLevels: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/career/levels'),

  updateLevel: (id: string | number, data: any): Promise<ApiResponse> =>
    apiUtils.put(`/v1/admin/career/levels/${id}`, data),

  createLevel: (data: any): Promise<ApiResponse> =>
    apiUtils.post('/v1/admin/career/levels', data),

  uploadImage: (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiUtils.post('/v1/upload/pin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteLevel: (id: string | number): Promise<ApiResponse> =>
    apiUtils.delete(`/v1/admin/career/levels/${id}`)
};

export const digitalCareerAPI = {
  getLevels: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/career/digital-levels'),

  updateLevel: (id: string | number, data: any): Promise<ApiResponse> =>
    apiUtils.put(`/v1/admin/career/digital-levels/${id}`, data),

  createLevel: (data: any): Promise<ApiResponse> =>
    apiUtils.post('/v1/admin/career/digital-levels', data),

  uploadImage: (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiUtils.post('/v1/upload/pin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteLevel: (id: string | number): Promise<ApiResponse> =>
    apiUtils.delete(`/v1/admin/career/digital-levels/${id}`)
};

export const sigmaPinsAPI = {
  getPins: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/sigma/pins'),

  getAll: (): Promise<ApiResponse> => // Alias for component compatibility
    apiUtils.get('/v1/admin/sigma/pins'),

  updatePin: (id: number, data: any): Promise<ApiResponse> =>
    apiUtils.put(`/v1/admin/sigma/pins/${id}`, data)
};

// ============================================
// 🚛 LOGISTICS API - Gestão de CDs e Logística
// ============================================
export const logisticsAPI = {
  getDistributionCenters: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/logistics/cds'),

  updateDistributionCenter: (id: number, data: any): Promise<ApiResponse> =>
    apiUtils.put(`/v1/admin/logistics/cds/${id}`, data),

  createDistributionCenter: (data: any): Promise<ApiResponse> =>
    apiUtils.post('/v1/admin/logistics/cds', data),

  deleteDistributionCenter: (id: number): Promise<ApiResponse> =>
    apiUtils.delete(`/v1/admin/logistics/cds/${id}`),

  updateBalance: (id: number, amount: number, type: 'add' | 'remove'): Promise<ApiResponse> =>
    apiUtils.post(`/v1/admin/logistics/cds/${id}/balance`, { amount, type })
};

// ============================================
// 🏪 MARKETPLACE API - Gestão de Marketplace
// ============================================
export const marketplaceAPI = {
  getSettings: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/marketplace/settings'),

  updateSettings: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/marketplace/settings', data),

  getOrders: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl('/v1/admin/marketplace/orders', filters)),

  getProducts: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl('/v1/admin/marketplace/products', filters)),

  getInvoices: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl('/v1/admin/marketplace/invoices', filters)),

  // Aliases for compatibility
  getMarketplaceConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/marketplace/settings'),

  updateMarketplaceConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/marketplace/settings', data),

  getAllOrders: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl('/v1/admin/marketplace/orders', filters)),

  getAllProducts: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl('/v1/admin/marketplace/products', filters)),

  getAllInvoices: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl('/v1/admin/marketplace/invoices', filters))
};

// ============================================
// 🎨 DASHBOARD LAYOUT API - Editor de Dashboard
// ============================================
export const dashboardLayoutAPI = {
  getConsultantLayoutConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/dashboard/layout/consultant'),

  updateConsultantLayoutConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/dashboard/layout/consultant', data),

  getMarketplaceLayoutConfig: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/dashboard/layout/marketplace'),

  updateMarketplaceLayoutConfig: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/dashboard/layout/marketplace', data),

  getLayout: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/dashboard/layout'),

  updateLayout: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/dashboard/layout', data),

  resetLayout: (): Promise<ApiResponse> =>
    apiUtils.post('/v1/admin/dashboard/layout/reset')
};

export const pinsVisibilityAPI = {
  getVisibility: (): Promise<ApiResponse> =>
    apiUtils.get('/v1/admin/sigma/pins/visibility'),

  updateVisibility: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/sigma/pins/visibility', data),

  // Alias para compatibilidade com DashboardEditorFull.tsx
  update: (data: any): Promise<ApiResponse> =>
    apiUtils.put('/v1/admin/sigma/pins/visibility', data)
};

// ============================================
// 📈 REPORTS API - Relatórios (V1)
// ============================================
export const reportsAPI = {
  getFinancialReports: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl(API_URLS.REPORTS.FINANCIAL, filters)),

  getPerformanceReports: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl(API_URLS.REPORTS.PERFORMANCE, filters)),

  getNetworkReports: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl(API_URLS.REPORTS.NETWORK, filters)),

  getSalesReports: (filters?: any): Promise<ApiResponse> =>
    apiUtils.get(apiUtils.buildUrl(API_URLS.REPORTS.SALES, filters)),

  exportReport: (type: string, filters?: any): Promise<ApiResponse> =>
    apiUtils.post(API_URLS.REPORTS.EXPORT, { type, ...filters })
};

// ============================================
// 🔄 CYCLE CLOSING API - Fechamento de Ciclos
// ============================================
export const cycleClosingAPI = {
  close: (type: 'MENSAL' | 'TRIMESTRAL'): Promise<ApiResponse> =>
    apiUtils.post('/v1/admin/cycle/close', { type }),

  getHistory: (): Promise<ApiResponse<{ history: any[] }>> =>
    apiUtils.get('/v1/admin/cycle/history')
};

// Export do client base para uso direto quando necessário
export { apiUtils as api };
