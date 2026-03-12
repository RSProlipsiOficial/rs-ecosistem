import React, { useEffect, useState } from 'react';
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

    const userId = (userProfile?.idConsultor || userProfile?.id || 'rsprolipsi').toLowerCase();

    useEffect(() => {
        const currentOrigin = window.location.origin;
        const isLocalhost = currentOrigin.includes('localhost');
        const marketplaceDomain = isLocalhost ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';

        const storeUrl = marketplaceDomain;
        const referralUrl = `${storeUrl}/?ref=${userId}`;
        const registerUrl = `${storeUrl}/indicacao/${encodeURIComponent(userId)}#/signup`;

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
            <div className="rounded-lg border border-dark-800 bg-black p-6">
                <h3 className="mb-2 text-xl font-bold text-white">Seus Links de Indicacao</h3>
                <p className="mb-6 text-sm text-gray-400">
                    Copie seus links abaixo para compartilhar com clientes e novos parceiros. Seu ID atual e: <strong className="text-gold-400">{userId}</strong>
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Link da Loja Geral (Marketplace)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={urls.store}
                                className="flex-1 rounded-md border border-dark-700 bg-dark-800 px-3 py-2 text-sm text-white focus:outline-none"
                            />
                            <button
                                onClick={() => handleCopy(urls.store, 'store')}
                                className="min-w-[120px] whitespace-nowrap rounded-md bg-dark-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-600"
                            >
                                {copiedLink === 'store' ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">Seu Link de Indicacao (Para Clientes)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={urls.referral}
                                className="flex-1 rounded-md border border-gold-900/50 bg-dark-800 px-3 py-2 text-sm text-gold-400 focus:outline-none"
                            />
                            <button
                                onClick={() => handleCopy(urls.referral, 'referral')}
                                className="min-w-[120px] whitespace-nowrap rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-gold-400"
                            >
                                {copiedLink === 'referral' ? 'Copiado!' : 'Copiar Link'}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Envie este link para seus clientes. As compras realizadas atraves dele garantirao sua comissao.
                        </p>
                    </div>

                    <div className="border-t border-dark-800 pt-4">
                        <label className="mb-2 block text-sm font-medium text-gray-400">Link de Cadastro (Para Novos Consultores/Lojistas)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={urls.register}
                                className="flex-1 rounded-md border border-blue-900/50 bg-dark-800 px-3 py-2 text-sm text-blue-400 focus:outline-none"
                            />
                            <button
                                onClick={() => handleCopy(urls.register, 'register')}
                                className="min-w-[120px] whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500"
                            >
                                {copiedLink === 'register' ? 'Copiado!' : 'Copiar Link'}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Este link abre o cadastro completo do Marketplace ja vinculado ao seu ID.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAffiliates;
