import React, { useEffect, useState } from 'react';
import { brandingApi } from './services/brandingApi';

const App: React.FC = () => {
    const [branding, setBranding] = useState({
        logo: '/logo-rs.png',
        favicon: '/favicon.ico',
        companyName: 'RS Controle Drop'
    });

    useEffect(() => {
        const fetchBranding = async () => {
            const res = await brandingApi.getBranding();
            if (res.success && res.data) {
                const { logo, favicon, companyName } = res.data;
                setBranding({
                    logo: logo || '/logo-rs.png',
                    favicon: favicon || '/favicon.ico',
                    companyName: companyName || 'RS Controle Drop'
                });

                if (favicon) {
                    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                    if (link) link.href = favicon;
                }
            }
        };

        // Listen for cross-tab branding updates
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'rs-branding-update') fetchBranding();
        };
        window.addEventListener('storage', handleStorageChange);

        fetchBranding();

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center gap-4 mb-8">
                    <img src={branding.logo} alt="Logo" className="h-12 w-auto" />
                    <h1 className="text-2xl md:text-3xl font-bold">{branding.companyName}</h1>
                </div>
                <p className="text-gray-300">
                    Módulo {branding.companyName} carregado.
                </p>
                <div className="mt-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
                    <p className="text-gray-300 mb-2">
                        Versão temporária do painel de controle de dropshipping.
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        O objetivo é apenas destravar o carregamento do Marketplace enquanto recuperamos
                        ou reconstruímos o painel completo do RS Controle Drop (produtos, pedidos,
                        integrações, etc.).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default App;
