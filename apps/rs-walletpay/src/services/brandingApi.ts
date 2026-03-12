export interface BrandingData {
    companyName: string;
    name: string;
    surname: string;
    avatar: string;
    logo: string;
    favicon: string;
    language: string;
    currency: string;
}

export const BRANDING_STORAGE_KEY = 'rs-walletpay-branding-cache';
export const BRANDING_UPDATE_EVENT = 'rs-walletpay-branding-updated';
const LEGACY_BRANDING_STORAGE_KEY = 'rs-branding-update';

export const DEFAULT_BRANDING: BrandingData = {
    companyName: 'RS Prolipsi',
    name: 'RS',
    surname: 'Prolipsi',
    avatar: '/logo-rs.png',
    logo: '/logo-rs.png',
    favicon: '/logo-rs.png',
    language: 'pt-BR',
    currency: 'BRL',
};

function resolveBrandingUrl() {
    const rawBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const normalizedBaseUrl = String(rawBaseUrl).replace(/\/+$/, '');

    if (normalizedBaseUrl.endsWith('/api')) {
        return `${normalizedBaseUrl.slice(0, -4)}/v1/admin/settings/general`;
    }

    if (normalizedBaseUrl.endsWith('/v1')) {
        return `${normalizedBaseUrl}/admin/settings/general`;
    }

    return `${normalizedBaseUrl}/v1/admin/settings/general`;
}

function normalizeBranding(data: any): BrandingData {
    return {
        ...DEFAULT_BRANDING,
        ...data,
        companyName: String(data?.companyName || DEFAULT_BRANDING.companyName),
        name: String(data?.name || DEFAULT_BRANDING.name),
        surname: String(data?.surname || DEFAULT_BRANDING.surname),
        logo: String(data?.logo || data?.avatar || DEFAULT_BRANDING.logo),
        avatar: String(data?.avatar || data?.logo || DEFAULT_BRANDING.avatar),
        favicon: String(data?.favicon || data?.logo || DEFAULT_BRANDING.favicon),
        language: String(data?.language || DEFAULT_BRANDING.language),
        currency: String(data?.currency || DEFAULT_BRANDING.currency),
    };
}

function readCachedBranding(): BrandingData {
    if (typeof window === 'undefined') return DEFAULT_BRANDING;

    try {
        const cached = localStorage.getItem(BRANDING_STORAGE_KEY);
        if (!cached) return DEFAULT_BRANDING;
        return normalizeBranding(JSON.parse(cached));
    } catch {
        return DEFAULT_BRANDING;
    }
}

function persistBranding(branding: BrandingData) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
        localStorage.setItem(LEGACY_BRANDING_STORAGE_KEY, String(Date.now()));
        window.dispatchEvent(new CustomEvent(BRANDING_UPDATE_EVENT, { detail: branding }));
    } catch (error) {
        console.error('[BrandingApi] Failed to persist branding cache:', error);
    }
}

export const brandingApi = {
    getCachedBranding: readCachedBranding,

    getBranding: async () => {
        try {
            const response = await fetch(resolveBrandingUrl());
            const payload = await response.json();
            const success = Boolean(payload?.success ?? payload?.ok);

            if (!response.ok || !success) {
                return {
                    success: false,
                    error: payload?.error || `HTTP error! status: ${response.status}`,
                    data: readCachedBranding(),
                };
            }

            const branding = normalizeBranding(payload?.data);
            persistBranding(branding);

            return {
                success: true,
                data: branding,
            };
        } catch (error) {
            console.error('[BrandingApi] Error fetching branding:', error);
            return {
                success: false,
                error,
                data: readCachedBranding(),
            };
        }
    },
};
