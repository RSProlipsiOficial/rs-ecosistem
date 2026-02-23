/**
 * API SERVICE
 * Serviço para comunicação com a API REST
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido, redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// ================================================
// WALLET ENDPOINTS
// ================================================

export const walletAPI = {
  // Saldo
  getBalance: (userId: string) =>
    api.get(`/wallet/balance/${userId}`),

  // Transações
  getTransactions: (userId: string, params?: any) =>
    api.get(`/wallet/transactions/${userId}`, { params }),

  // Extrato
  getStatement: (userId: string, startDate: string, endDate: string) =>
    api.get(`/wallet/statement/${userId}`, { params: { start_date: startDate, end_date: endDate } }),

  // Saques
  requestWithdraw: (data: any) =>
    api.post('/wallet/withdraw', data),

  getWithdrawals: (userId: string) =>
    api.get(`/wallet/withdrawals/${userId}`),

  // Transferências
  transfer: (data: any) =>
    api.post('/wallet/transfer', data),

  // PIX
  createPixKey: (data: any) =>
    api.post('/wallet/pix/create', data),

  listPixKeys: (userId: string) =>
    api.get(`/wallet/pix/list/${userId}`),

  deletePixKey: (id: string) =>
    api.delete(`/wallet/pix/${id}`),

  // Depósitos
  createDeposit: (data: any) =>
    api.post('/wallet/deposit', data),
};

// ================================================
// SIGMA ENDPOINTS
// ================================================

export const sigmaAPI = {
  // Rede
  getNetwork: (userId: string) =>
    api.get(`/sigma/network/${userId}`),

  getMatrix: (userId: string) =>
    api.get(`/sigma/matrix/${userId}`),

  getDownlines: (userId: string) =>
    api.get(`/sigma/downlines/${userId}`),

  // Ciclos
  getCycles: (userId: string) =>
    api.get(`/sigma/cycles/${userId}`),

  getCycleStatus: (userId: string) =>
    api.get(`/sigma/cycle/status/${userId}`),

  // Bônus
  getDepthBonus: (userId: string) =>
    api.get(`/sigma/depth/${userId}`),

  // Estatísticas
  getStats: (userId: string) =>
    api.get(`/sigma/stats/${userId}`),
};

// ================================================
// CAREER ENDPOINTS
// ================================================

export const careerAPI = {
  // Nível
  getLevel: (userId: string) =>
    api.get(`/career/level/${userId}`),

  getProgress: (userId: string) =>
    api.get(`/career/progress/${userId}`),

  getNextLevel: (userId: string) =>
    api.get(`/career/next/${userId}`),

  // VMEC
  calculateVMEC: (userId: string) =>
    api.get(`/career/vmec/${userId}`),

  // Bônus
  getCareerBonus: (userId: string) =>
    api.get(`/career/bonus/${userId}`),

  // Ranking
  getRanking: () =>
    api.get('/career/ranking'),
};

// ================================================
// MARKETPLACE ENDPOINTS
// ================================================

export const marketplaceAPI = {
  // Produtos
  listProducts: (params?: any) =>
    api.get('/marketplace/products', { params }),

  getProduct: (id: string) =>
    api.get(`/marketplace/products/${id}`),

  // Pedidos
  createOrder: (data: any) =>
    api.post('/marketplace/orders', data),

  getUserOrders: (userId: string) =>
    api.get(`/marketplace/orders/${userId}`),

  // Afiliação
  generateAffiliateLink: (data: any) =>
    api.post('/marketplace/affiliate/link', data),

  getCommissions: (userId: string) =>
    api.get(`/marketplace/commission/${userId}`),
};

// ================================================
// STUDIO ENDPOINTS
// ================================================

export const studioAPI = {
  // Chat
  sendMessage: (data: any) =>
    api.post('/studio/chat', data),

  getChatHistory: (userId: string) =>
    api.get(`/studio/chat/history/${userId}`),

  // Treinamentos
  listTrainings: (params?: any) =>
    api.get('/studio/trainings', { params }),

  getTraining: (id: string) =>
    api.get(`/studio/trainings/${id}`),

  updateProgress: (data: any) =>
    api.post('/studio/training/progress', data),

  // Conteúdo
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
    api.post('/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: () =>
    api.post('/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// ================================================
// ADMIN ENDPOINTS
// ================================================

export const adminAPI = {
  // Crédito Manual
  creditUser: (data: { userId: string; amount: number; description?: string; type?: string }) =>
    api.post('/wallet/admin/credit', data),

  // Débito Manual
  debitUser: (data: { userId: string; amount: number; description?: string }) =>
    api.post('/wallet/admin/debit', data),

  // Listar Todas Transações
  getAllTransactions: (params?: any) =>
    api.get('/wallet/admin/transactions', { params }),
};

export default api;
