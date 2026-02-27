import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ManageAffiliatesProps {
    userProfile?: UserProfile;
}

const ManageAffiliates: React.FC<ManageAffiliatesProps> = ({ userProfile }) => {
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [urls, setUrls] = useState({
        store: '',
        referral: '',
        register: ''
    });

    // O ID amigável (idConsultor/username) é melhor para links - sempre em minúsculas para URLs
    const userId = (userProfile?.idConsultor || userProfile?.id || 'rsprolipsi').toLowerCase();

    useEffect(() => {
        // Detecta o ambiente para gerar links corretos
        const currentOrigin = window.location.origin;
        const isLocalhost = currentOrigin.includes('localhost');

        // Configura os domínios base
        const marketplaceDomain = isLocalhost ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
        const rotaFacilDomain = isLocalhost ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

        const storeUrl = marketplaceDomain;
        const referralUrl = `${storeUrl}/?ref=${userId}`;
        const registerUrl = `${rotaFacilDomain}/indicacao/${userId}`;

        setUrls({
            store: storeUrl,
            referral: referralUrl,
            register: registerUrl
        });
    }, [userId]);

    const handleCopy = (link: string, type: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(type);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-black border border-dark-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-2">Seus Links de Indicação</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Copie seus links abaixo para compartilhar com clientes e novos lojistas. Seu ID atual é: <strong className="text-gold-400">{userId}</strong>
                </p>

                <div className="space-y-6">
                    {/* Link da Loja Geral */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Link da Loja Geral (Marketplace)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={urls.store}
                                className="flex-1 bg-dark-800 border border-dark-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none"
                            />
                            <button
                                onClick={() => handleCopy(urls.store, 'store')}
                                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap min-w-[120px]"
                            >
                                {copiedLink === 'store' ? '✅ Copiado' : '📋 Copiar'}
                            </button>
                        </div>
                    </div>

                    {/* Link de Indicação (Afiliado/Consultor) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Seu Link de Indicação (Para Clientes)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={urls.referral}
                                className="flex-1 bg-dark-800 border border-gold-900/50 rounded-md py-2 px-3 text-gold-400 text-sm focus:outline-none"
                            />
                            <button
                                onClick={() => handleCopy(urls.referral, 'referral')}
                                className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black text-sm font-bold rounded-md transition-colors whitespace-nowrap min-w-[120px]"
                            >
                                {copiedLink === 'referral' ? '✅ Copiado!' : '📋 Copiar Link'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Envie este link para seus clientes. As compras realizadas através dele garantirão sua comissão.
                        </p>
                    </div>

                    {/* Link de Cadastro de Novos Lojistas */}
                    <div className="pt-4 border-t border-dark-800">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Link de Cadastro (Para Novos Consultores/Lojistas)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={urls.register}
                                className="flex-1 bg-dark-800 border border-blue-900/50 rounded-md py-2 px-3 text-blue-400 text-sm focus:outline-none"
                            />
                            <button
                                onClick={() => handleCopy(urls.register, 'register')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-md transition-colors whitespace-nowrap min-w-[120px]"
                            >
                                {copiedLink === 'register' ? '✅ Copiado!' : '📋 Copiar Link'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Este link aponta para o sistema **Rota Fácil**, garantindo que o novo parceiro entre na sua rede MMN.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAffiliates;