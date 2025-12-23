import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-5xl mx-auto space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold">RS Controle Drop</h1>
                <p className="text-gray-300">
                    Módulo RS Controle Drop carregado.
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
