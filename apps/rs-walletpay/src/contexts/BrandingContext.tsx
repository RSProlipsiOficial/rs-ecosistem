import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    BRANDING_STORAGE_KEY,
    BRANDING_UPDATE_EVENT,
    DEFAULT_BRANDING,
    brandingApi,
    type BrandingData,
} from '../services/brandingApi';

interface BrandingContextValue {
    branding: BrandingData;
    refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue | null>(null);

function applyBrandingSideEffects(branding: BrandingData) {
    if (typeof document === 'undefined') return;

    if (branding.favicon) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
        if (link) link.href = branding.favicon;
    }

    document.title = `WalletPay | ${branding.companyName || DEFAULT_BRANDING.companyName}`;
}

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [branding, setBranding] = useState<BrandingData>(() => brandingApi.getCachedBranding());

    useEffect(() => {
        applyBrandingSideEffects(branding);
    }, [branding]);

    const refreshBranding = async () => {
        const result = await brandingApi.getBranding();
        if (result.success && result.data) {
            setBranding(result.data);
        }
    };

    useEffect(() => {
        void refreshBranding();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key !== BRANDING_STORAGE_KEY && event.key !== 'rs-branding-update') return;
            setBranding(brandingApi.getCachedBranding());
        };

        const handleBrandingUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<BrandingData>;
            if (customEvent.detail) {
                setBranding(customEvent.detail);
                return;
            }

            setBranding(brandingApi.getCachedBranding());
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(BRANDING_UPDATE_EVENT, handleBrandingUpdate as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(BRANDING_UPDATE_EVENT, handleBrandingUpdate as EventListener);
        };
    }, []);

    return (
        <BrandingContext.Provider
            value={{
                branding,
                refreshBranding,
            }}
        >
            {children}
        </BrandingContext.Provider>
    );
};

export function useBranding() {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }

    return context;
}
