import React from 'react';
import { Distributor } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { CloseIcon } from './icons/CloseIcon';

interface CDSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    distributors: Distributor[];
    onSelect: (distributor: Distributor) => void;
    title?: string;
}

const CDSelectionModal: React.FC<CDSelectionModalProps> = ({
    isOpen,
    onClose,
    distributors,
    onSelect,
    title = "Escolha onde quer comprar"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-zinc-950 border border-rs-gold/30 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(200,167,78,0.2)] animate-fade-in-up">

                {/* Header */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter font-display flex items-center gap-3">
                            <span className="text-rs-gold">📍</span> {title}
                        </h2>
                        <p className="text-zinc-500 text-xs mt-1 font-medium">Selecione o centro de distribuição mais próximo de você.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-white rounded-full p-2 transition-all"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid gap-4">
                        {distributors.map((dist) => (
                            <button
                                key={dist.id}
                                onClick={() => onSelect(dist)}
                                className="group flex items-center justify-between p-5 bg-zinc-900/50 hover:bg-rs-gold/10 border border-white/5 hover:border-rs-gold/50 rounded-2xl transition-all duration-300 text-left"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-zinc-800 group-hover:bg-rs-gold/20 rounded-xl flex items-center justify-center text-rs-gold transition-colors">
                                        <MapPinIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm tracking-wide group-hover:text-rs-gold transition-colors">{dist.name}</h3>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {dist.stores[0]?.city}, {dist.stores[0]?.state}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-zinc-600 group-hover:text-rs-gold transition-colors pr-2">
                                    <span className="text-lg">→</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-900/30 text-center">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                        RS Prólipsi © Ecossistema Oficial
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CDSelectionModal;
