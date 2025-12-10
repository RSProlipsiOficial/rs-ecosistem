import axios, { AxiosResponse } from 'axios';
import { API_URLS } from '../config/apiUrls';

// Base URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Timeout padrão
const TIMEOUT = 30000;

// Interface para respostas da API
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Interface para erros da API
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Criar instância do Axios
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para adicionar token (suporta admin e consultor)
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('consultorToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para tratar erros
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return {
        data: response.data,
        status: response.status,
        message: response.statusText,
      };
    },
    (error) => {
      if (error.response?.status === 401) {
        // Remove ambos os tokens em caso de não autorizado
        localStorage.removeItem('adminToken');
        localStorage.removeItem('consultorToken');
        window.location.href = '/login';
      }

      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'Erro desconhecido',
        status: error.response?.status || 500,
        code: error.response?.data?.code,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Instância principal da API
export const apiClient = createAxiosInstance();

// Utilitários para serviços da API
export const apiUtils = {
  // Helper para construir URLs com query parameters
  buildUrl: (baseUrl: string, params?: Record<string, any>): string => {
    if (!params) return baseUrl;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  // Helper para fetch legacy (compatibilidade com rs-consultor)
  legacyFetch: async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Métodos HTTP padrão delegando para o apiClient
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),
  patch: (url: string, data?: any, config?: any) => apiClient.patch(url, data, config),
};

// Serviços modulares da API V1
export const apiServices = {
  // Legacy proxy for backward compatibility
  _legacy: {
    get: (url: string, config?: any) => apiClient.get(url, config),
    post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
    put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
    delete: (url: string, config?: any) => apiClient.delete(url, config),
    patch: (url: string, data?: any, config?: any) => apiClient.patch(url, data, config),
  },
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post(API_URLS.AUTH.LOGIN, credentials),

    logout: () =>
      apiClient.post(API_URLS.AUTH.LOGOUT),

    verifyToken: () =>
      apiClient.get(API_URLS.AUTH.VERIFY),
  },

  consultants: {
    list: (filters?: any) =>
      apiClient.get(apiUtils.buildUrl(API_URLS.CONSULTANTS.GET_ALL, filters)),

    get: (id: string) =>
      apiClient.get(API_URLS.CONSULTANTS.GET_BY_ID.replace(':id', id)),

    create: (data: any) =>
      apiClient.post(API_URLS.CONSULTANTS.CREATE, data),

    update: (id: string, data: any) =>
      apiClient.put(API_URLS.CONSULTANTS.UPDATE.replace(':id', id), data),

    delete: (id: string) =>
      apiClient.delete(API_URLS.CONSULTANTS.DELETE.replace(':id', id)),

    updateStatus: (id: string, status: string) =>
      apiClient.patch(API_URLS.CONSULTANTS.UPDATE_STATUS.replace(':id', id), { status }),

    lookup: (q: string) =>
      apiClient.get(apiUtils.buildUrl(API_URLS.CONSULTANTS.LOOKUP, { q })),

    getSpreadsheetModel: (format: 'xlsx' | 'csv' = 'xlsx') =>
      apiClient.get(
        apiUtils.buildUrl(API_URLS.CONSULTANTS.SPREADSHEET_MODEL, { format }),
        { responseType: format === 'xlsx' ? 'blob' : 'json' }
      ),
  },

  sigma: {
    getMatrixConfig: () =>
      apiClient.get(API_URLS.SIGMA.MATRIX_CONFIG),

    updateMatrixConfig: (data: any) =>
      apiClient.put(API_URLS.SIGMA.MATRIX_CONFIG, data),

    getTopSigmaConfig: () =>
      apiClient.get(API_URLS.SIGMA.TOP_CONFIG),

    updateTopSigmaConfig: (data: any) =>
      apiClient.put(API_URLS.SIGMA.TOP_CONFIG, data),
  },

  communications: {
    getAnnouncements: () =>
      apiClient.get(API_URLS.COMMUNICATIONS.ANNOUNCEMENTS),

    getAgenda: () =>
      apiClient.get(API_URLS.COMMUNICATIONS.AGENDA),

    getTrainings: () =>
      apiClient.get(API_URLS.COMMUNICATIONS.TRAININGS),

    getMaterials: () =>
      apiClient.get(API_URLS.COMMUNICATIONS.MATERIALS),

    getCatalogs: () =>
      apiClient.get(API_URLS.COMMUNICATIONS.CATALOGS),

    incrementCatalogDownload: (id: string) =>
      apiClient.post(API_URLS.COMMUNICATIONS.INCREMENT_CATALOG_DOWNLOAD.replace(':id', id)),

    incrementMaterialDownload: (id: string) =>
      apiClient.post(API_URLS.COMMUNICATIONS.INCREMENT_MATERIAL_DOWNLOAD.replace(':id', id)),
  },

  dashboard: {
    getStats: () =>
      apiClient.get(API_URLS.DASHBOARD.OVERVIEW),

    getMetrics: (period?: string) =>
      apiClient.get(apiUtils.buildUrl(API_URLS.DASHBOARD.OVERVIEW, { period })),

    getKPI: () =>
      apiClient.get(API_URLS.DASHBOARD.PERFORMANCE),
  },

  wallet: {
    getBalance: () =>
      apiClient.get(API_URLS.WALLET.BALANCE),

    getTransactions: (filters?: any) =>
      apiClient.get(apiUtils.buildUrl(API_URLS.WALLET.TRANSACTIONS, filters)),

    requestWithdrawal: (data: { amount: number; method: string }) =>
      apiClient.post(API_URLS.WALLET.WITHDRAW, data),
  },

  shop: {
    getProducts: (filters?: any) =>
      apiClient.get(apiUtils.buildUrl(API_URLS.SHOP.PRODUCTS, filters)),

    getOrders: (filters?: any) =>
      apiClient.get(apiUtils.buildUrl(API_URLS.SHOP.ORDERS, filters)),

    createOrder: (data: any) =>
      apiClient.post(API_URLS.SHOP.ORDERS, data),

    getAffiliateLinks: () =>
      apiClient.get(API_URLS.SHOP.AFFILIATE_LINKS),

    generateLink: (productId: string) =>
      apiClient.post(API_URLS.SHOP.GENERATE_LINK, { productId }),
  },

  studio: {
    generateContent: (prompt: string, type: string) =>
      apiClient.post(API_URLS.STUDIO.GENERATE, { prompt, type }),

    getCreations: () =>
      apiClient.get(API_URLS.STUDIO.CREATIONS),

    saveCreation: (data: any) =>
      apiClient.post(API_URLS.STUDIO.CREATIONS, data),
  },
};
