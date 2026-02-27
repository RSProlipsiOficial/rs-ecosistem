export const brandingApi = {
    getBranding: async () => {
        try {
            const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/v1';
            const response = await fetch(`${baseUrl}/admin/settings/general`);
            const data = await response.json();
            return {
                success: data.success || data.ok,
                data: data.data
            };
        } catch (error) {
            console.error('[BrandingApi] Error fetching branding:', error);
            return { success: false, error };
        }
    }
};
