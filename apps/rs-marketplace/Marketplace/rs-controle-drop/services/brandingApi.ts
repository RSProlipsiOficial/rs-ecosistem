export const brandingApi = {
    getBranding: async () => {
        try {
            // Using the same endpoint as others
            const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/v1';
            const response = await fetch(`${baseUrl}/admin/settings/general`);
            const data = await response.json(); // Parse JSON data regardless of response.ok for error details

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('consultorToken');
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return {
                    data: null as any,
                    success: false,
                    error: data.error || data.message || `Erro HTTP: ${response.status}`,
                };
            }

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
