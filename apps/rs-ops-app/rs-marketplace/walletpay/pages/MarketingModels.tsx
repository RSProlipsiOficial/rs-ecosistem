
import React, { useState } from 'react';
import { MOCK_MARKETING_MODELS, USER_REFERRAL_LINKS } from '../constants';

const IconCopy = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);
  
const IconCheck = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const MarketingModelCard: React.FC<{ model: typeof MOCK_MARKETING_MODELS[0] }> = ({ model }) => {
    const [copied, setCopied] = useState(false);

    const processText = (text: string) => {
        return text
            .replace(/{{link_cadastro}}/g, USER_REFERRAL_LINKS.cadastro)
            .replace(/{{link_loja}}/g, USER_REFERRAL_LINKS.loja)
            .replace(/{{link_produtos}}/g, USER_REFERRAL_LINKS.produtos);
    };

    const personalizedText = processText(model.contentText);

    const handleCopy = () => {
        navigator.clipboard.writeText(personalizedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    // Highlight links in the display text
    const displayText = personalizedText.split(/(\bhttps?:\/\/\S+\b)/g).map((part, index) => {
        if (part.startsWith('http')) {
            return <span key={index} className="text-gold font-semibold">{part}</span>;
        }
        return part;
    });

    return (
        <div className="bg-card rounded-2xl border border-border shadow-custom-lg overflow-hidden flex flex-col">
            <img src={model.imageUrl} alt={model.title} className="w-full h-48 object-cover" />
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-text-title">{model.title}</h3>
                <div className="my-4 p-4 bg-surface rounded-lg text-sm text-text-body whitespace-pre-wrap flex-1">
                    {displayText}
                </div>
                <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center text-center py-2 px-4 font-semibold rounded-lg transition-colors duration-200 ${
                        copied
                        ? 'bg-success/20 text-success border border-success'
                        : 'bg-gold text-card hover:bg-gold-hover'
                    }`}
                >
                    {copied ? (
                        <>
                            <IconCheck className="w-5 h-5 mr-2" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <IconCopy className="w-5 h-5 mr-2" />
                            Copiar Texto
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


const MarketingModels: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Modelos para Divulgação</h1>
                <p className="text-text-body mt-1">Use estes modelos prontos para divulgar em suas redes sociais e contatos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {MOCK_MARKETING_MODELS.map(model => (
                    <MarketingModelCard key={model.id} model={model} />
                ))}
            </div>
        </div>
    );
};

export default MarketingModels;


