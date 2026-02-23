/**
 * RS PRÓLIPSI - COMMUNICATION API
 * API profissional para gerenciar comunicação, treinamentos e materiais
 */
import { supabase } from '../lib/supabaseClient'; // Importa o cliente Supabase

// =====================================================
// CONFIGURAÇÃO DA API CENTRAL
// =====================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TENANT_ID = import.meta.env.VITE_TENANT_ID; // Essencial para todas as chamadas

const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${path}`, { ...options, headers });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
        }
        return data;
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};


// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface Announcement {
    id?: string;
    type: 'alert' | 'info' | 'promo';
    title: string;
    content: string;
    audience?: string[];
    is_new: boolean;
    is_published: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
}

export interface AgendaItem { id?: string; category: 'Boas-vindas' | 'Aniversariantes' | 'PINs' | 'Datas Comemorativas'; title: string; content: string; is_deletable: boolean; active: boolean; created_at?: string; updated_at?: string; }
export interface Training { id?: string; title: string; description?: string; category?: string; cover_image?: string; video_url?: string; video_type?: 'youtube' | 'vimeo' | 'upload' | 'none'; duration?: number; difficulty?: 'beginner' | 'intermediate' | 'advanced'; order_index?: number; is_published: boolean; created_at?: string; updated_at?: string; created_by?: string; view_count?: number; }
export interface TrainingLesson { id?: string; training_id: string; title: string; content?: string; video_url?: string; duration?: number; order_index?: number; created_at?: string; updated_at?: string; }
export interface Catalog { id?: string; title: string; description?: string; cover_image?: string; pdf_url?: string; source_type?: 'file' | 'url' | 'none'; file_name?: string; file_size?: number; category?: string; is_published: boolean; download_count?: number; created_at?: string; updated_at?: string; created_by?: string; }
export interface DownloadMaterial { id?: string; title: string; description?: string; icon_type: 'photo' | 'document' | 'presentation'; file_url?: string; source_type?: 'file' | 'url' | 'none'; file_name?: string; file_size?: number; category?: string; is_published: boolean; download_count?: number; created_at?: string; updated_at?: string; created_by?: string; }

// =====================================================
// CRUD GENÉRICO - TODOS OS RECURSOS VIA API CENTRAL
// =====================================================

const createAPIHandlers = (resourcePath: string) => ({
    getAll: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não está configurado.' };
        return apiFetch(`${resourcePath}?tenantId=${TENANT_ID}`);
    },
    create: async (item: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não está configurado.' };
        const body = { ...item, tenantId: TENANT_ID };
        return apiFetch(resourcePath, { method: 'POST', body: JSON.stringify(body) });
    },
    update: async (id: string, item: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não está configurado.' };
        const body = { ...item, tenantId: TENANT_ID };
        return apiFetch(`${resourcePath}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    delete: async (id: string) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não está configurado.' };
        return apiFetch(`${resourcePath}/${id}?tenantId=${TENANT_ID}`, { method: 'DELETE' });
    },
});

// =====================================================
// ENDPOINTS - TODOS VIA rs-api
// =====================================================

const announcementsAPI = createAPIHandlers('/v1/communications/announcements');
export const agendaAPI = createAPIHandlers('/v1/communications/agenda');
export const trainingsAPI = createAPIHandlers('/v1/communications/trainings');
export const lessonsAPI = createAPIHandlers('/v1/communications/lessons'); // New API for lessons
export const catalogsAPI = createAPIHandlers('/v1/communications/catalogs');
export const materialsAPI = createAPIHandlers('/v1/communications/materials');

export const searchAPI = {
    searchAll: async (query: string) => {
        try {
            const { data, error } = await supabase.rpc('search_content', { search_term: query });
            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
};

// =====================================================
// EXPORTS
// =====================================================

export default {
    announcements: announcementsAPI,
    agenda: agendaAPI,
    trainings: trainingsAPI,
    lessons: lessonsAPI,
    catalogs: catalogsAPI,
    materials: materialsAPI,
    search: searchAPI,
};
