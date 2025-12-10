import React, { useState, useMemo } from 'react';
import { PaymentSplit } from '../types';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { PixIcon } from './icons/PixIcon';
import { WalletIcon } from './icons/WalletIcon';
import { BoletoIcon } from './icons/BoletoIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface UnifiedPaymentSplitterProps {
    totalAmount: number;
    walletBalance: number;
    onConfirmSplits: (splits: PaymentSplit[]) => Promise<void>;
    onCancel: () => void;
}

const UnifiedPaymentSplitter: React.FC<UnifiedPaymentSplitterProps> = ({
    totalAmount,
    walletBalance,
    onConfirmSplits,
    onCancel
}) => {
    const [splits, setSplits] = useState<Omit<PaymentSplit, 'id' | 'status' | 'createdAt'>[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<PaymentSplit['method']>('wallet');
    const [splitAmount, setSplitAmount] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const totalAllocated = useMemo(() => {
        return splits.reduce((sum, split) => sum + split.amount, 0);
    }, [splits]);

    const remainingAmount = totalAmount - totalAllocated;

    const canAddWallet = walletBalance > 0 && remainingAmount > 0;
    const maxWalletAmount = Math.min(walletBalance, remainingAmount);

    const methodConfig = {
        wallet: { icon: WalletIcon, label: 'Saldo da Carteira', color: 'text-purple-400' },
        pix: { icon: PixIcon, label: 'PIX', color: 'text-blue-400' },
        'credit-card': { icon: CreditCardIcon, label: 'Cartão de Crédito', color: 'text-gold-400' },
        boleto: { icon: BoletoIcon, label: 'Boleto', color: 'text-orange-400' }
    };

    const handleAddSplit = () => {
        const amount = parseFloat(splitAmount);
        
        if (isNaN(amount) || amount <= 0) {
            alert('Digite um valor válido.');
            return;
        }

        if (amount > remainingAmount) {
            alert(`O valor não pode ser maior que o restante: ${formatCurrency(remainingAmount)}`);
            return;
        }

        if (selectedMethod === 'wallet' && amount > walletBalance) {
            alert(`Saldo insuficiente. Disponível: ${formatCurrency(walletBalance)}`);
            return;
        }

        const newSplit: Omit<PaymentSplit, 'id' | 'status' | 'createdAt'> = {
            method: selectedMethod,
            amount,
            transactionId: undefined
        };

        setSplits(prev => [...prev, newSplit]);
        setSplitAmount('');
    };

    const handleRemoveSplit = (index: number) => {
        setSplits(prev => prev.filter((_, i) => i !== index));
    };

    const handleUseMaxWallet = () => {
        setSplitAmount(maxWalletAmount.toFixed(2));
        setSelectedMethod('wallet');
    };

    const handlePayRemaining = () => {
        if (remainingAmount > 0 && selectedMethod !== 'wallet') {
            setSplitAmount(remainingAmount.toFixed(2));
        }
    };

    const handleConfirm = async () => {
        if (remainingAmount > 0) {
            alert(`Ainda falta alocar ${formatCurrency(remainingAmount)}. Complete todas as divisões.`);
            return;
        }

        if (splits.length === 0) {
            alert('Adicione pelo menos uma forma de pagamento.');
            return;
        }

        setIsProcessing(true);
        try {
            // Converter para formato completo com IDs e status
            const completeSplits: PaymentSplit[] = splits.map((split, index) => ({
                ...split,
                id: `split-${Date.now()}-${index}`,
                status: 'pending',
                createdAt: new Date().toISOString()
            }));

            await onConfirmSplits(completeSplits);
        } catch (error) {
            console.error('Erro ao confirmar divisões:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg">
                <h3 className="font-bold text-lg text-[rgb(var(--color-brand-gold))] mb-2">
                    💳 Pagamento Unificado
                </h3>
                <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">
                    Divida o pagamento em múltiplos métodos
                </p>
            </div>

            {/* Resumo */}
            <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-brand-text-dim))]">Total da Compra:</span>
                    <span className="font-bold text-[rgb(var(--color-brand-text-light))]">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-brand-text-dim))]">Já Alocado:</span>
                    <span className="font-semibold text-green-400">
                        {formatCurrency(totalAllocated)}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[rgb(var(--color-brand-gray-light))]">
                    <span className="font-semibold">Restante:</span>
                    <span className={`text-xl font-bold ${remainingAmount > 0 ? 'text-[rgb(var(--color-brand-gold))]' : 'text-green-400'}`}>
                        {formatCurrency(remainingAmount)}
                    </span>
                </div>
            </div>

            {/* Divisões Existentes */}
            {splits.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-[rgb(var(--color-brand-text-dim))]">
                        Divisões Adicionadas:
                    </h4>
                    {splits.map((split, index) => {
                        const config = methodConfig[split.method];
                        const Icon = config.icon;
                        return (
                            <div key={index} className="bg-[rgb(var(--color-brand-dark))] p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${config.color}`}/>
                                    <div>
                                        <p className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))]">
                                            {config.label}
                                        </p>
                                        <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">
                                            {formatCurrency(split.amount)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveSplit(index)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                    title="Remover"
                                >
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Adicionar Nova Divisão */}
            {remainingAmount > 0 && (
                <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg space-y-4">
                    <h4 className="font-semibold">Adicionar Forma de Pagamento:</h4>
                    
                    {/* Saldo Disponível */}
                    {canAddWallet && (
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-purple-300">Saldo Disponível:</span>
                                <span className="font-bold text-purple-400">{formatCurrency(walletBalance)}</span>
                            </div>
                            <button
                                onClick={handleUseMaxWallet}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2 rounded-md"
                            >
                                Usar Saldo Máximo ({formatCurrency(maxWalletAmount)})
                            </button>
                        </div>
                    )}

                    {/* Seletor de Método */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(Object.keys(methodConfig) as PaymentSplit['method'][]).map(method => {
                            const config = methodConfig[method];
                            const Icon = config.icon;
                            const isDisabled = method === 'wallet' && !canAddWallet;
                            
                            return (
                                <button
                                    key={method}
                                    onClick={() => !isDisabled && setSelectedMethod(method)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                                        selectedMethod === method 
                                            ? 'border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/10' 
                                            : 'border-[rgb(var(--color-brand-gray-light))] hover:border-[rgb(var(--color-brand-gray))]'
                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Icon className={`w-6 h-6 ${config.color}`}/>
                                    <span className="text-xs font-semibold text-center">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Input de Valor */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold">Valor:</label>
                        <div className="flex gap-2">
                            <div className="flex-grow relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-brand-text-dim))]">R$</span>
                                <input
                                    type="number"
                                    value={splitAmount}
                                    onChange={(e) => setSplitAmount(e.target.value)}
                                    placeholder="0,00"
                                    step="0.01"
                                    min="0"
                                    max={remainingAmount}
                                    className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                />
                            </div>
                            <button
                                onClick={handlePayRemaining}
                                className="bg-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-text-light))] px-4 py-2 rounded-md hover:bg-gray-600 text-sm font-semibold whitespace-nowrap"
                            >
                                Usar Restante
                            </button>
                        </div>
                    </div>

                    {/* Botão Adicionar */}
                    <button
                        onClick={handleAddSplit}
                        disabled={!splitAmount || parseFloat(splitAmount) <= 0}
                        className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 flex items-center justify-center gap-2 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Adicionar Forma de Pagamento
                    </button>
                </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t border-[rgb(var(--color-brand-gray-light))]">
                <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 bg-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-text-light))] font-semibold py-3 rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={remainingAmount > 0 || splits.length === 0 || isProcessing}
                    className="flex-1 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 flex items-center justify-center gap-2 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <SpinnerIcon className="w-5 h-5"/>
                            Processando...
                        </>
                    ) : (
                        'Confirmar Pagamento'
                    )}
                </button>
            </div>
        </div>
    );
};

export default UnifiedPaymentSplitter;
