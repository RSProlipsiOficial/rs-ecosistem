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

export const brandingApi = {
    getBranding: async () => {
        try {
            const response = await fetch(resolveBrandingUrl());
            const payload = await response.json();

            return {
                success: Boolean(payload?.success ?? payload?.ok),
                data: payload?.data
            };
        } catch (error) {
            console.error('[BrandingApi] Error fetching branding:', error);
            return { success: false, error };
        }
    }
};
