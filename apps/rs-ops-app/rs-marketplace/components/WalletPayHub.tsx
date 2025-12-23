import React, { useEffect } from 'react';
import { View } from '../types';

interface WalletPayHubProps {
    onNavigate?: (view: View, data?: any) => void;
}

const WalletPayHub: React.FC<WalletPayHubProps> = () => {
    // Gerar token de autenticação (pode usar user ID ou session)
    const authToken = btoa(JSON.stringify({
        timestamp: Date.now(),
        source: 'escritorio',
        autoLogin: true
    }));

    const walletPayUrl = `https://walletpay.rsprolipsi.com.br?token=${authToken}`;

    useEffect(() => {
        // Abre automaticamente em nova aba
        window.open(walletPayUrl, '_blank');
    }, []);

    const handleOpenWalletPay = () => {
        window.open(walletPayUrl, '_blank');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <div className="text-center p-12 bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl border border-dark-700 max-w-md">
                {/* Ícone Wallet animado */}
                <div className="mb-6 relative">
                    <svg className="w-24 h-24 mx-auto text-gold-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                </div>

                {/* Título */}
                <h2 className="text-3xl font-bold text-white mb-3">Wallet Pay</h2>
                <p className="text-gray-400 mb-2">Sistema de Pagamentos RS Prólipsi</p>
                
                {/* Badge de auto-login */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-full mb-6">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-400 font-medium">Acesso Direto (sem senha)</span>
                </div>

                <p className="text-gray-500 text-sm mb-8">Abrindo em nova aba...</p>
                
                {/* Botão principal */}
                <button
                    onClick={handleOpenWalletPay}
                    className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105"
                >
                    <div className="flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Abrir Wallet Pay
                    </div>
                </button>

                {/* Informações adicionais */}
                <div className="mt-8 pt-6 border-t border-dark-800">
                    <p className="text-xs text-gray-600 mb-2">Funcionalidades:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-dark-800 text-gray-400 text-xs rounded-full">Extratos</span>
                        <span className="px-3 py-1 bg-dark-800 text-gray-400 text-xs rounded-full">Transferências</span>
                        <span className="px-3 py-1 bg-dark-800 text-gray-400 text-xs rounded-full">Saques</span>
                        <span className="px-3 py-1 bg-dark-800 text-gray-400 text-xs rounded-full">Cobranças</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPayHub;
