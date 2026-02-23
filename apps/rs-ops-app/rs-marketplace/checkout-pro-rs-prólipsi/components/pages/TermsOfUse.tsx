import React from 'react';

interface PageProps {
    onBack?: () => void;
}

const TermsOfUse: React.FC<PageProps> = ({ onBack }) => {
    const handleBack = () => {
        if (onBack) onBack();
        else window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#0F1115] text-[#d4af37] p-8">
            <div className="max-w-4xl mx-auto bg-[#161920] p-8 rounded-xl border border-[#C8A74E]/30">
                <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
                <p className="mb-4">
                    Bem-vindo à RS Prólipsi. Ao utilizar nossos serviços, você concorda com os seguintes termos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-[#9CA3AF]">
                    <li>Uso aceitável da plataforma.</li>
                    <li>Política de pagamentos e reembolsos.</li>
                    <li>Responsabilidades do usuário.</li>
                    <li>Direitos autorais e propriedade intelectual.</li>
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

export default TermsOfUse;
