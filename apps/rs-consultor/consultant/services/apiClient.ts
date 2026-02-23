/**
 * CLIENTE DE API - RS CONSULTOR
 * Centraliza as chamadas para a rs-api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
console.log('[API CLIENT] Base URL:', API_BASE_URL);

export interface ApiResponse<T = any> {
    data: T;
    success: boolean;
    error?: string;
}

/**
 * Utilitário para chamadas de API usando fetch
 */
async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Adicionar cabeçalhos padrão
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    } as any;

    // Injetar token de autenticação se existir
    const token = localStorage.getItem('consultorToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                data: null as any,
                success: false,
                error: data.error || data.message || `Erro HTTP: ${response.status}`,
            };
        }

        return {
            data: data.data || data,
            success: true,
        };
    } catch (error: any) {
        console.error(`Erro na chamada de API (${endpoint}):`, error);
        return {
            data: null as any,
            success: false,
            error: error.message || 'Erro de conexão com o servidor',
        };
    }
}

export const apiClient = {
    get: <T = any>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
    post: <T = any>(endpoint: string, body: any) => apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T = any>(endpoint: string, body: any) => apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T = any>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
};
