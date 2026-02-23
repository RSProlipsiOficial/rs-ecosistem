import React from 'react';

interface PageProps {
    onBack?: () => void;
}

const PrivacyPolicy: React.FC<PageProps> = ({ onBack }) => {
    const handleBack = () => {
        if (onBack) onBack();
        else window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#0F1115] text-[#d4af37] p-8">
            <div className="max-w-4xl mx-auto bg-[#161920] p-8 rounded-xl border border-[#C8A74E]/30">
                <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
                <p className="mb-4">
                    Na RS Prólipsi, levamos sua privacidade a sério. Esta política descreve como coletamos e usamos seus dados.
                </p>
                <ul className="list-disc list-inside space-y-2 text-[#9CA3AF]">
                    <li>Coleta de dados pessoais apenas para processamento de pedidos.</li>
                    <li>Não compartilhamento de dados com terceiros não autorizados.</li>
                    <li>Segurança e criptografia de transações.</li>
                    <li>Seus direitos sobre seus dados (LGPD).</li>
                </ul>
                <p className="mt-6 text-sm text-[#9CA3AF]">
                    Última atualização: Fevereiro de 2026.
                </p>
                <button
                    onClick={handleBack}
                    className="mt-8 px-6 py-2 bg-[#C8A74E] text-black font-bold rounded-lg hover:bg-[#b09344]"
                >
                    Voltar
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
