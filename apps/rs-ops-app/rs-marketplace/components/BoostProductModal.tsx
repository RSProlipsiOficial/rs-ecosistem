import React, { useState } from 'react';
import { Product, BOOST_PLANS, BoostPlan } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface BoostProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (plan: BoostPlan) => void;
    walletBalance: number;
}

const BoostProductModal: React.FC<BoostProductModalProps> = ({
    product,
    isOpen,
    onClose,
    onConfirm,
    walletBalance
}) => {
    const [selectedPlanId, setSelectedPlanId] = useState<'basic' | 'pro' | 'elite'>('pro');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const selectedPlan = BOOST_PLANS.find(p => p.id === selectedPlanId)!;
    const canAfford = walletBalance >= selectedPlan.price;

    const handleConfirm = () => {
        setIsProcessing(true);
        // Simular delay de API
        setTimeout(() => {
            onConfirm(selectedPlan);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-zinc-950 border border-rs-gold/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(200,167,78,0.15)] animate-fade-in-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/5 p-6 md:p-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🚀</span>
                            <h2 className="text-2xl md:text-3xl font-black text-white font-display uppercase tracking-tight">
                                Impulsionar Vendas
                            </h2>
                        </div>
                        <p className="text-zinc-400 text-sm">
                            Destaque <span className="text-white font-bold">{product.name}</span> para milhares de clientes e aumente suas vendas.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors p-2 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh]">

                    {/* Plan Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {BOOST_PLANS.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`relative flex flex-col p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${isSelected
                                            ? 'border-rs-gold bg-rs-gold/5 shadow-[0_0_30px_rgba(200,167,78,0.1)] scale-105 z-10'
                                            : 'border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900'
                                        }`}
                                >
                                    {plan.id === 'elite' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rs-gold text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                            Recomendado
                                        </div>
                                    )}

                                    <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2" style={{ color: isSelected ? plan.color : 'white' }}>
                                        {plan.name}
                                    </h3>

                                    <div className="mb-6">
                                        <span className="text-3xl font-black text-white">R$ {plan.price.toFixed(2)}</span>
                                        <span className="text-zinc-500 text-xs font-bold block mt-1">por {plan.durationDays} dias</span>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                                                <span className="text-emerald-500 font-bold">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className={`mt-auto text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${isSelected ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'
                                        }`}>
                                        {isSelected ? 'Selecionado' : 'Selecionar'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Payment Summary */}
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-900 rounded-xl border border-white/10">
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block mb-1">Seu Saldo</span>
                                <span className={`text-xl font-black ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                                    R$ {walletBalance.toFixed(2)}
                                </span>
                            </div>
                            {!canAfford && (
                                <p className="text-red-400 text-xs max-w-[200px]">
                                    Saldo insuficiente. Recarregue sua carteira para continuar.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!canAfford || isProcessing}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${canAfford
                                    ? 'bg-rs-gold text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(200,167,78,0.3)]'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="animate-spin text-lg">↻</span>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    Confirmar Impulsionamento
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BoostProductModal;
