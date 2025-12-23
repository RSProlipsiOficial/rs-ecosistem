const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

function resolveTenantId(): string {
    try {
        const qs = new URLSearchParams(window.location.search);
        const fromQuery = qs.get('tenantId');
        if (fromQuery && fromQuery.length > 0) {
            localStorage.setItem('rs-tenant-id', fromQuery);
            return fromQuery;
        }
        const hash = (window.location.hash || '').toLowerCase();
        const m = hash.match(/tenant=([0-9a-f\-]{36})/);
        if (m && m[1]) {
            localStorage.setItem('rs-tenant-id', m[1]);
            return m[1];
        }
        const fromStorage = localStorage.getItem('rs-tenant-id');
        if (fromStorage && fromStorage.length > 0) return fromStorage;
    } catch { }
    const envTenant = (import.meta as any).env?.VITE_TENANT_ID;
    return envTenant || '00000000-0000-0000-0000-000000000000';
}

let TENANT_ID = resolveTenantId();
window.addEventListener('hashchange', () => { TENANT_ID = resolveTenantId(); });
window.addEventListener('popstate', () => { TENANT_ID = resolveTenantId(); });

const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
};

// Interfaces que correspondem às tabelas do Supabase
export interface Announcement {
    id: string;
    type: 'alert' | 'info' | 'promo';
    title: string;
    content: string;
    is_new: boolean;
    published: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface AgendaItem {
    id: string;
    category: 'Boas-vindas' | 'Aniversariantes' | 'PINs' | 'Datas Comemorativas';
    title: string;
    content: string;
    is_deletable: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Training {
    id: string;
    title: string;
    description?: string;
    category?: string;
    cover_image?: string;
    video_url?: string;
    video_type?: 'youtube' | 'vimeo' | 'upload' | 'none';
    duration?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    order_index: number;
    published: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface Catalog {
    id: string;
    title: string;
    description?: string;
    cover_image?: string;
    pdf_url?: string;
    source_type?: 'file' | 'url' | 'none';
    file_name?: string;
    file_size?: number;
    category?: string;
    published: boolean;
    download_count: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface DownloadMaterial {
    id: string;
    title: string;
    description?: string;
    icon_type?: 'photo' | 'document' | 'presentation';
    file_url?: string;
    source_type?: 'file' | 'url' | 'none';
    file_name?: string;
    file_size?: number;
    category?: string;
    published: boolean;
    download_count: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

const communicationAPI = {
    // COMUNICADOS (READ-ONLY)
    announcements: {
        getAll: async (): Promise<ApiResponse<Announcement[]>> => {
            try {
                let r: any = await apiFetch(`/consultor/communications/announcements?tenantId=${TENANT_ID}`);
                let data = r?.data || r;
                if (!Array.isArray(data) || data.length === 0) {
                    r = await apiFetch(`/v1/communications/announcements?tenantId=${TENANT_ID}&audience=marketplace`);
                    data = r?.data || r;
                }
                return { success: true, data };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        acknowledge: async (id: string, userId: string): Promise<ApiResponse<null>> => {
            try {
                await apiFetch(`/consultor/communications/announcements/${encodeURIComponent(id)}/ack?tenantId=${TENANT_ID}&userId=${encodeURIComponent(userId)}`, { method: 'POST' });
                return { success: true };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    },

    // AGENDA (READ-ONLY)
    agendaItems: {
        getAll: async (): Promise<ApiResponse<AgendaItem[]>> => {
            try {
                let r: any = await apiFetch(`/consultor/communications/agenda?tenantId=${TENANT_ID}`);
                let data = r?.data || r;
                if (!Array.isArray(data) || data.length === 0) {
                    r = await apiFetch(`/v1/communications/agenda?tenantId=${TENANT_ID}`);
                    data = r?.data || r;
                }
                return { success: true, data };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    },

    // TREINAMENTOS (READ-ONLY)
    trainings: {
        getAll: async (): Promise<ApiResponse<Training[]>> => {
            try {
                let primary = await apiFetch(`/consultor/communications/trainings?tenantId=${TENANT_ID}`);
                let data = primary?.data || primary;
                return { success: true, data };
            } catch (error: any) {
                try {
                    const alt = await apiFetch(`/v1/communications/trainings?tenantId=${TENANT_ID}`);
                    return { success: true, data: alt?.data || alt };
                } catch (err2: any) {
                    return { success: false, error: error.message };
                }
            }
        },
        getModules: async (trainingId?: string): Promise<ApiResponse<any[]>> => {
            try {
                const qs = trainingId ? `&trainingId=${encodeURIComponent(trainingId)}` : '';
                const r = await apiFetch(`/v1/communications/training-modules?tenantId=${TENANT_ID}${qs}`);
                return { success: true, data: r?.data || r };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        getLessons: async (trainingId?: string, moduleId?: string): Promise<ApiResponse<any[]>> => {
            try {
                const qsT = trainingId ? `&trainingId=${encodeURIComponent(trainingId)}` : '';
                const qsM = moduleId ? `&moduleId=${encodeURIComponent(moduleId)}` : '';
                const r = await apiFetch(`/v1/communications/lessons?tenantId=${TENANT_ID}${qsT}${qsM}`);
                return { success: true, data: r?.data || r };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        completeLesson: async (lessonId: string, userId: string, trainingId?: string): Promise<ApiResponse<null>> => {
            try {
                const qs = `${trainingId ? `&trainingId=${encodeURIComponent(trainingId)}` : ''}`;
                await apiFetch(`/consultor/communications/lessons/${encodeURIComponent(lessonId)}/complete?tenantId=${TENANT_ID}&userId=${encodeURIComponent(userId)}${qs}`, { method: 'POST' });
                return { success: true };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    },

    // CATÁLOGOS (READ-ONLY)
    catalogs: {
        getAll: async (): Promise<ApiResponse<Catalog[]>> => {
            try {
                let r: any = await apiFetch(`/consultor/communications/catalogs?tenantId=${TENANT_ID}`);
                let data = r?.data || r;
                if (!Array.isArray(data) || data.length === 0) {
                    r = await apiFetch(`/v1/communications/catalogs?tenantId=${TENANT_ID}`);
                    data = r?.data || r;
                }
                return { success: true, data };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },

        incrementDownload: async (id: string): Promise<ApiResponse<null>> => {
            try {
                await apiFetch(`/v1/communications/catalogs/${id}/increment-download?tenantId=${TENANT_ID}`, { method: 'POST' });
                return { success: true };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    },

    // MATERIAIS DE DOWNLOAD (READ-ONLY)
    downloadMaterials: {
        getAll: async (iconType?: string): Promise<ApiResponse<DownloadMaterial[]>> => {
            try {
                const filter = iconType && iconType !== 'all' ? `&iconType=${encodeURIComponent(iconType)}` : '';
                let r: any = await apiFetch(`/consultor/communications/materials?tenantId=${TENANT_ID}${filter}`);
                let data = r?.data || r;
                if (!Array.isArray(data) || data.length === 0) {
                    r = await apiFetch(`/v1/communications/materials?tenantId=${TENANT_ID}${filter}`);
                    data = r?.data || r;
                }
                return { success: true, data };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },

        incrementDownload: async (id: string): Promise<ApiResponse<null>> => {
            try {
                await apiFetch(`/v1/communications/materials/${id}/increment-download?tenantId=${TENANT_ID}`, { method: 'POST' });
                return { success: true };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    },
};

export default communicationAPI;
