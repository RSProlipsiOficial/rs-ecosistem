export const brandingApi = {
    getBranding: async () => {
        try {
            // No Chef, estamos num ambiente Remix/Vite.
            const baseUrl = 'http://localhost:4000/v1'; // Fallback fixo para o ecossistema RS
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
