import React from 'react';

interface ConsultantBannerProps {
    consultant: { name: string; slug: string } | null;
    onClear: () => void;
}

const ConsultantBanner: React.FC<ConsultantBannerProps> = ({ consultant, onClear }) => {
    if (!consultant) return null;

    return (
        <div className="bg-rs-gold-dark text-black py-2 px-4 text-center text-xs font-bold uppercase tracking-wider relative z-50 shadow-md">
            <div className="container mx-auto flex justify-center items-center gap-2">
                <span>
                    Você está comprando na loja de: <span className="underline decoration-black/30">{consultant.name}</span>
                </span>
                {/* Opcional: Botão para remover indicação */}
                {/* <button onClick={onClear} className="ml-2 hover:bg-black/10 rounded-full p-1" title="Alterar consultor">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button> */}
            </div>
        </div>
    );
};

export default ConsultantBanner;
