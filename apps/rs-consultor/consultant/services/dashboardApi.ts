/**
 * SERVIÇO DE DASHBOARD - RS CONSULTOR
 * Interface de comunicação com o backend para configurações de layout
 */

import { apiClient, ApiResponse } from './apiClient';

export const dashboardApi = {
    /**
     * Busca a configuração de layout do consultor
     */
    getConsultantLayout: (): Promise<ApiResponse> =>
        apiClient.get('/v1/admin/dashboard/layout/consultant'),

    /**
     * Busca a configuração de layout do marketplace
     */
    getMarketplaceLayout: (): Promise<ApiResponse> =>
        apiClient.get('/v1/admin/dashboard/layout/marketplace'),

    /**
     * Busca a configuração genérica de layout
     */
    getLayout: (): Promise<ApiResponse> =>
        apiClient.get('/v1/admin/dashboard/layout'),

    /**
     * Busca as configurações gerais de branding e empresa
     */
    getGeneralSettings: (): Promise<ApiResponse> =>
        apiClient.get('/v1/admin/settings/general')
};
