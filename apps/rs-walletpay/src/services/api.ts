/**
 * API SERVICE
 * Servico para comunicacao com a API REST
 */

import axios from 'axios';
import { LedgerEventType, LedgerState } from '../../types';
import { clearWalletSession, readWalletSession } from '../utils/walletSession';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const V1_API_URL = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '/v1') : `${API_URL}/v1`;

const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = readWalletSession().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearWalletSession();
        window.location.href = '/#/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient(API_URL);
const v1Api = createApiClient(V1_API_URL);

const normalizeLedgerType = (rawType: string | undefined) => {
  const value = String(rawType || '').trim().toLowerCase();

  if (value.includes('withdraw')) return LedgerEventType.WITHDRAWAL;
  if (value.includes('transfer')) return LedgerEventType.TRANSFER;
  if (value.includes('fee') || value.includes('taxa')) return LedgerEventType.FEES;
  if (value.includes('chargeback')) return LedgerEventType.CHARGEBACK;
  if (value.includes('purchase') || value.includes('compra') || value === 'debit') return LedgerEventType.PURCHASE;
  if (value.includes('referral') || value.includes('affiliate') || value.includes('indicacao')) return LedgerEventType.COMMISSION_REFERRAL;
  if (value.includes('commission') || value.includes('sale') || value.includes('dropship') || value === 'credit') return LedgerEventType.COMMISSION_SHOP;
  if (value.includes('bonus')) return LedgerEventType.BONUS;

  return LedgerEventType.ADJUSTMENT;
};

const normalizeLedgerState = (rawState: string | undefined) => {
  const value = String(rawState || '').trim().toLowerCase();

  if (value === 'paid' || value === 'approved' || value === 'completed' || value === 'success') {
    return LedgerState.PAID;
  }
  if (value === 'failed' || value === 'rejected' || value === 'error') {
    return LedgerState.FAILED;
  }
  if (value === 'held' || value === 'blocked') {
    return LedgerState.HELD;
  }
  if (value === 'reversed') {
    return LedgerState.REVERSED;
  }
  if (value === 'pending' || value === 'processing') {
    return LedgerState.PENDING;
  }

  return LedgerState.POSTED;
};

const normalizeLedgerEntry = (entry: any, fallbackIndex = 0) => ({
  seq: Number(entry?.seq ?? entry?.sequence ?? fallbackIndex + 1),
  hash: String(entry?.hash ?? ''),
  type: normalizeLedgerType(entry?.type ?? entry?.reference_type),
  origin: (entry?.origin || 'user') as 'marketplace' | 'sigma' | 'admin' | 'user',
  refId: String(entry?.refId ?? entry?.ref_id ?? entry?.reference_id ?? entry?.order_id ?? entry?.id ?? ''),
  description: String(entry?.description ?? entry?.titulo ?? 'Transacao'),
  amount: Number(entry?.amount ?? 0),
  fee: Number(entry?.fee ?? 0),
  balanceAfter: Number(entry?.balanceAfter ?? entry?.balance_after ?? 0),
  state: normalizeLedgerState(entry?.state ?? entry?.status),
  occurredAt: String(entry?.occurredAt ?? entry?.occurred_at ?? entry?.created_at ?? new Date().toISOString()),
  user: entry?.user,
  details: entry?.details ?? {},
});

const normalizePixKey = (pixKey: any) => ({
  id: String(pixKey?.id ?? ''),
  type: String(pixKey?.type ?? pixKey?.key_type ?? ''),
  key: String(pixKey?.key ?? pixKey?.key_value ?? ''),
  isPrimary: Boolean(pixKey?.isPrimary ?? pixKey?.is_primary ?? false),
});

// ================================================
// WALLET ENDPOINTS
// ================================================

export const walletAPI = {
  getBalance: (userId: string) =>
    api.get(`/wallet/balance/${userId}`),

  getTransactions: async (userId: string, params?: any) => {
    const response = await api.get(`/wallet/transactions/${userId}`, { params });
    return {
      ...response,
      data: {
        ...response.data,
        success: Boolean(response.data?.success),
        transactions: Array.isArray(response.data?.transactions)
          ? response.data.transactions.map((entry: any, index: number) => normalizeLedgerEntry(entry, index))
          : [],
      },
    };
  },

  getStatement: (userId: string, startDate: string, endDate: string) =>
    api.get(`/wallet/statement/${userId}`, { params: { start_date: startDate, end_date: endDate } }),

  requestWithdraw: (data: any) =>
    api.post('/wallet/withdraw', data),

  getWithdrawals: async (userId: string) => {
    const response = await api.get(`/wallet/withdrawals/${userId}`);
    return {
      ...response,
      data: {
        ...response.data,
        success: Boolean(response.data?.success),
        withdrawals: Array.isArray(response.data?.withdrawals)
          ? response.data.withdrawals.map((entry: any, index: number) => normalizeLedgerEntry({
              ...entry,
              type: 'withdrawal',
              description: entry?.description || 'Saque solicitado',
              amount: Math.abs(Number(entry?.amount ?? 0)) * -1,
              fee: Number(entry?.fee ?? 0),
              status: entry?.status,
              occurredAt: entry?.created_at,
              refId: entry?.transaction_id || entry?.id,
              details: {
                pix: entry?.pix_key || '',
              },
            }, index))
          : [],
      },
    };
  },

  transfer: (data: any) =>
    api.post('/wallet/transfer', data),

  createPixKey: (data: any) =>
    api.post('/wallet/pix/create', data),

  listPixKeys: async (userId: string) => {
    const response = await api.get(`/wallet/pix/list/${userId}`);
    return {
      ...response,
      data: {
        ...response.data,
        success: Boolean(response.data?.success),
        pix_keys: Array.isArray(response.data?.pix_keys)
          ? response.data.pix_keys.map((pixKey: any) => normalizePixKey(pixKey))
          : [],
      },
    };
  },

  deletePixKey: (id: string) =>
    api.delete(`/wallet/pix/${id}`),

  createDeposit: (data: any) =>
    api.post('/wallet/deposit', data),
};

// ================================================
// SIGMA ENDPOINTS
// ================================================

export const sigmaAPI = {
  getNetwork: () =>
    v1Api.get('/network/tree'),

  getMatrix: () =>
    v1Api.get('/sigma/tree'),

  getDownlines: async (_userId?: string, params?: any) => {
    const response = await v1Api.get('/sigma/downlines', { params });
    return {
      ...response,
      data: {
        success: true,
        downlines: Array.isArray(response.data?.data) ? response.data.data : [],
      },
    };
  },

  getCycles: () =>
    v1Api.get('/sigma/cycle-journey'),

  getCycleStatus: () =>
    v1Api.get('/sigma/config'),

  getDepthBonus: () =>
    v1Api.get('/sigma/bonuses'),

  getStats: async (_userId?: string) => {
    const response = await v1Api.get('/sigma/stats');
    return {
      ...response,
      data: {
        success: true,
        stats: response.data?.data || null,
      },
    };
  },
};

// ================================================
// CAREER ENDPOINTS
// ================================================

export const careerAPI = {
  getLevel: () =>
    v1Api.get('/career/digital-levels'),

  getProgress: () =>
    v1Api.get('/career/digital-stats'),

  getNextLevel: () =>
    v1Api.get('/career/digital-stats'),

  calculateVMEC: () =>
    v1Api.get('/career/digital-stats'),

  getCareerBonus: () =>
    v1Api.get('/sigma/bonuses'),

  getRanking: () =>
    v1Api.get('/career/digital-levels'),
};

// ================================================
// MARKETPLACE ENDPOINTS
// ================================================

export const marketplaceAPI = {
  listProducts: (params?: any) =>
    api.get('/marketplace/products', { params }),

  getProduct: (id: string) =>
    api.get(`/marketplace/products/${id}`),

  createOrder: (data: any) =>
    api.post('/marketplace/orders', data),

  getUserOrders: (userId: string) =>
    api.get(`/marketplace/orders/${userId}`),

  generateAffiliateLink: (data: any) =>
    api.post('/marketplace/affiliate/link', data),

  getCommissions: (userId: string) =>
    api.get(`/marketplace/commission/${userId}`),
};

// ================================================
// STUDIO ENDPOINTS
// ================================================

export const studioAPI = {
  sendMessage: (data: any) =>
    api.post('/studio/chat', data),

  getChatHistory: (userId: string) =>
    api.get(`/studio/chat/history/${userId}`),

  listTrainings: (params?: any) =>
    api.get('/studio/trainings', { params }),

  getTraining: (id: string) =>
    api.get(`/studio/trainings/${id}`),

  updateProgress: (data: any) =>
    api.post('/studio/training/progress', data),

  generateImage: (data: any) =>
    api.post('/studio/content/generate/image', data),

  generateText: (data: any) =>
    api.post('/studio/content/generate/text', data),
};

// ================================================
// AUTH ENDPOINTS
// ================================================

export const authAPI = {
  login: (email: string, password: string) =>
    v1Api.post('/auth/login', { email, password }),

  register: (data: any) =>
    v1Api.post('/auth/register', data),

  logout: () =>
    v1Api.post('/auth/logout'),

  refreshToken: () =>
    v1Api.post('/auth/refresh'),

  forgotPassword: (email: string) =>
    v1Api.post('/auth/forgot-password', { email }),
};

// ================================================
// ADMIN ENDPOINTS
// ================================================

export const adminAPI = {
  creditUser: (data: { userId: string; amount: number; description?: string; type?: string }) =>
    api.post('/wallet/admin/credit', data),

  debitUser: (data: { userId: string; amount: number; description?: string }) =>
    api.post('/wallet/admin/debit', data),

  getAllTransactions: (params?: any) =>
    api.get('/wallet/admin/transactions', { params }),
};

export default api;
