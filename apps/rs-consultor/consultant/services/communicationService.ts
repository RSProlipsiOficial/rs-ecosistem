import { SystemMessage } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Interfaces mapeadas da API

export interface AgendaItem {
    id: string;
    category: 'Boas-vindas' | 'Aniversariantes' | 'PINs' | 'Datas Comemorativas';
    title: string;
    content: string;
    active: boolean;
    created_at: string;
    // ... outros campos db
}

export interface Training {
    id: string;
    title: string;
    description?: string;
    cover_image?: string;
    video_url?: string;
    duration?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    order_index?: number;
    // ...
}

export interface Catalog {
    id: string;
    title: string;
    description?: string;
    cover_image?: string;
    pdf_url?: string;
    file_name?: string;
    // ...
}

export interface Material {
    id: string;
    title: string;
    description?: string;
    icon_type: 'photo' | 'document' | 'presentation';
    file_url?: string;
    file_name?: string;
    format?: string;
    // ...
}

const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!TENANT_ID) {
        console.error('VITE_TENANT_ID not defined');
        return { success: false, error: 'Configuração de Tenant ausente' };
    }
    try {
        const url = new URL(`${API_URL}${endpoint}`);
        url.searchParams.append('tenantId', TENANT_ID);

        const response = await fetch(url.toString(), {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        });
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
};

export const communicationService = {
    getAnnouncements: () => apiFetch<any[]>('/v1/communications/announcements'),
    getAgenda: () => apiFetch<AgendaItem[]>('/v1/communications/agenda'),
    getTrainings: () => apiFetch<Training[]>('/v1/communications/trainings'),
    getTrainingModules: (trainingId: string) => apiFetch<any[]>('/v1/communications/training-modules?trainingId=' + trainingId),
    getLessons: (trainingId: string) => apiFetch<any[]>('/v1/communications/lessons?trainingId=' + trainingId),
    getTrainingProgress: (userId: string) => apiFetch<any[]>('/v1/communications/training-progress?userId=' + userId),
    getCatalogs: () => apiFetch<Catalog[]>('/v1/communications/catalogs'),
    getMaterials: () => apiFetch<Material[]>('/v1/communications/materials'),
    ackAnnouncement: (id: string, userId: string) => apiFetch(`/v1/communications/announcements/${id}/ack?userId=${userId}`, { method: 'POST' }),
    completeLesson: (lessonId: string, userId: string, trainingId?: string) => apiFetch(`/v1/communications/lessons/${lessonId}/complete?userId=${userId}&trainingId=${trainingId}`, { method: 'POST' }),
};
