/**
 * RS PRÓLIPSI - MARKETPLACE API
 * Service layer para integração completa com backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.rsprolipsi.com.br';
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = {
        'Content-Type': 'application/json',
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
// PRODUTOS
// =====================================================

export const productsAPI = {
    getAll: async (published?: boolean) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        const query = published !== undefined ? `&published=${published}` : '';
        return apiFetch(`/v1/marketplace/products?tenantId=${TENANT_ID}${query}`);
    },

    getById: async (id: string) => {
        return apiFetch(`/v1/marketplace/products/${id}`);
    },

    create: async (product: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/marketplace/products', {
            method: 'POST',
            body: JSON.stringify({ ...product, tenantId: TENANT_ID })
        });
    },

    update: async (id: string, product: any) => {
        return apiFetch(`/v1/marketplace/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    },

    delete: async (id: string) => {
        return apiFetch(`/v1/marketplace/products/${id}`, { method: 'DELETE' });
    },

    updateStock: async (id: string, stock: number) => {
        return apiFetch(`/v1/marketplace/products/${id}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ stock })
        });
    }
};

// =====================================================
// COLEÇÕES
// =====================================================

export const collectionsAPI = {
    getAll: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch(`/v1/marketplace/collections?tenantId=${TENANT_ID}`);
    },

    create: async (collection: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/marketplace/collections', {
            method: 'POST',
            body: JSON.stringify({ ...collection, tenantId: TENANT_ID })
        });
    },

    update: async (id: string, collection: any) => {
        return apiFetch(`/v1/marketplace/collections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(collection)
        });
    },

    delete: async (id: string) => {
        return apiFetch(`/v1/marketplace/collections/${id}`, { method: 'DELETE' });
    }
};

// =====================================================
// PEDIDOS
// =====================================================

export const ordersAPI = {
    getAll: async (status?: string) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        const query = status ? `&status=${status}` : '';
        return apiFetch(`/v1/marketplace/orders?tenantId=${TENANT_ID}${query}`);
    },

    create: async (order: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/marketplace/orders', {
            method: 'POST',
            body: JSON.stringify({ ...order, tenantId: TENANT_ID })
        });
    },

    updateStatus: async (id: string, status: string) => {
        return apiFetch(`/v1/marketplace/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
};

// =====================================================
// DISTRIBUIDORES / CDs
// =====================================================

export const distributorsAPI = {
    list: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch(`/v1/cds?tenantId=${TENANT_ID}`);
    },
    create: async (cd: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/cds', {
            method: 'POST',
            body: JSON.stringify({ ...cd, tenantId: TENANT_ID })
        });
    },
    update: async (id: string, cd: any) => {
        return apiFetch(`/v1/cds/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cd)
        });
    },
    delete: async (id: string) => {
        return apiFetch(`/v1/cds/${id}`, { method: 'DELETE' });
    },
    // Regiões
    getRegions: async (cdId: string) => {
        return apiFetch(`/v1/cds/${cdId}/regions`);
    },
    addRegion: async (cdId: string, region: any) => {
        return apiFetch(`/v1/cds/${cdId}/regions`, { method: 'POST', body: JSON.stringify(region) });
    },
    deleteRegion: async (regionId: string) => {
        return apiFetch(`/v1/cds/regions/${regionId}`, { method: 'DELETE' });
    },
    // Estoque
    getStock: async (cdId: string) => {
        return apiFetch(`/v1/cds/${cdId}/stock`);
    },
    adjustStock: async (cdId: string, payload: any) => {
        return apiFetch(`/v1/cds/${cdId}/stock`, { method: 'PATCH', body: JSON.stringify(payload) });
    }
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
    products: productsAPI,
    collections: collectionsAPI,
    orders: ordersAPI
};

// Perfil do consultor
export const consultantAPI = {
    getProfile: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch(`/v1/consultants/profile?tenantId=${TENANT_ID}`);
    },
    updateProfile: async (profile: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/consultants/profile', {
            method: 'PUT',
            body: JSON.stringify({ ...profile, tenantId: TENANT_ID })
        });
    },
    uploadAvatar: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        form.append('tenantId', TENANT_ID || '');
        try {
            const res = await fetch(`${API_URL}/v1/consultants/avatar`, { method: 'POST', body: form });
            const data = await res.json().catch(() => ({ success: false }));
            return data;
        } catch (e) {
            return { success: false, error: 'Falha de rede' };
        }
    }
};

// =====================================================
// PIXELS DE MARKETING
// =====================================================

export const marketingPixelsAPI = {
    list: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch(`/v1/marketing/pixels?tenantId=${TENANT_ID}`);
    },
    create: async (pixel: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/marketing/pixels', {
            method: 'POST',
            body: JSON.stringify({ ...pixel, tenantId: TENANT_ID })
        });
    },
    update: async (id: string, pixel: any) => {
        return apiFetch(`/v1/marketing/pixels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(pixel)
        });
    },
    delete: async (id: string) => {
        return apiFetch(`/v1/marketing/pixels/${id}`, { method: 'DELETE' });
    },
    setStatus: async (id: string, status: 'Ativo' | 'Inativo') => {
        return apiFetch(`/v1/marketing/pixels/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
};

// =====================================================
// ENCURTADOR DE LINKS
// =====================================================

export const linksAPI = {
    list: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch(`/v1/links?tenantId=${TENANT_ID}`);
    },
    create: async (originalUrl: string) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/links', {
            method: 'POST',
            body: JSON.stringify({ originalUrl, tenantId: TENANT_ID })
        });
    },
    delete: async (id: string) => {
        return apiFetch(`/v1/links/${id}`, { method: 'DELETE' });
    },
    incrementClick: async (id: string) => {
        return apiFetch(`/v1/links/${id}/click`, { method: 'POST' });
    }
};

// =====================================================
// CUSTOMIZAÇÃO DA LOJA
// =====================================================

export const storeCustomizationAPI = {
    get: async () => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch(`/v1/marketplace/customization?tenantId=${TENANT_ID}`);
    },

    update: async (customization: any) => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };
        return apiFetch('/v1/marketplace/customization', {
            method: 'PUT',
            body: JSON.stringify({ ...customization, tenantId: TENANT_ID })
        });
    },

    uploadImage: async (file: File, type: 'logo' | 'favicon' | 'banner' | 'hero') => {
        if (!TENANT_ID) return { success: false, error: 'VITE_TENANT_ID não configurado' };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('tenantId', TENANT_ID);

        try {
            const response = await fetch(`${API_URL}/v1/marketplace/upload`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
};
