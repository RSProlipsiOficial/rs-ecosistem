
import React, { useState, useEffect } from 'react';
import { Wallet, MinusCircle } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { Button } from './ui/Button';

export const WalletBalanceToggle: React.FC = () => {
  const { walletBalance, balanceToUse, setBalanceToUse, orderSummary } = useCheckout();
  const [inputValue, setInputValue] = useState(balanceToUse > 0 ? balanceToUse.toFixed(2).replace('.', ',') : '');

  const preBalanceTotal = orderSummary.subtotal + orderSummary.shipping + orderSummary.orderBump - orderSummary.discount;

  useEffect(() => {
    // Sync local input when global state changes (e.g., from "Use Max" or load)
    if (balanceToUse > 0) {
        setInputValue(balanceToUse.toFixed(2).replace('.', ','));
    } else {
        setInputValue('');
    }
  }, [balanceToUse]);

  if (walletBalance <= 0) {
    return null; 
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.');
    setInputValue(value.replace('.', ','));
    setBalanceToUse(parseFloat(value) || 0);
  };
  
  const handleInputBlur = () => {
    if (balanceToUse > 0) {
      setInputValue(balanceToUse.toFixed(2).replace('.', ','));
    }
  };

  const handleUseMax = () => {
    const maxApplicable = Math.min(walletBalance, preBalanceTotal);
    setBalanceToUse(maxApplicable);
  };
  
  const handleClear = () => {
    setBalanceToUse(0);
  };

  const hasAppliedBalance = balanceToUse > 0;

  return (
    <div 
      className={`
        border rounded-xl p-4 transition-all duration-300 group select-none 
        ${hasAppliedBalance 
          ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
          : 'bg-[#161920] border-rs-border'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${hasAppliedBalance ? 'bg-blue-500 text-white' : 'bg-rs-border text-rs-muted'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-sm font-bold transition-colors ${hasAppliedBalance ? 'text-blue-400' : 'text-rs-text'}`}>
              Usar Saldo da WalletPay
            </p>
            <p className="text-xs text-rs-muted">
              Disponível: <span className="font-mono font-bold text-rs-text">R$ {walletBalance.toFixed(2)}</span>
            </p>
          </div>
        </div>
        {hasAppliedBalance ? (
            <button onClick={handleClear} className="text-xs flex items-center gap-1 text-rs-muted hover:text-red-400 font-bold transition-colors">
                <MinusCircle className="w-4 h-4" /> Remover
            </button>
        ) : (
             <Button onClick={handleUseMax} variant="ghost" className="h-auto px-3 py-1 text-xs">
                Usar Saldo Máximo
             </Button>
        )}
      </div>
      
      {!hasAppliedBalance && (
        <div className="mt-3 pt-3 border-t border-rs-border/50 animate-in fade-in slide-in-from-top-2">
           <label htmlFor="balance-input" className="text-xs text-rs-muted mb-1 block">Digite o valor a usar ou clique em "Usar Saldo Máximo".</label>
           <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rs-muted font-bold text-sm">R$</span>
                <input
                    id="balance-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-full bg-rs-dark border border-rs-border rounded-lg pl-9 pr-4 py-2 text-sm text-rs-text placeholder-rs-muted/50 focus:outline-none focus:border-rs-gold"
                />
           </div>
        </div>
      )}
      
      {hasAppliedBalance && (
        <div className="mt-3 pt-3 border-t border-blue-500/20 text-xs space-y-1 animate-in fade-in">
          <div className="flex justify-between text-rs-muted">
            <span>Saldo utilizado:</span>
            <span className="font-mono text-blue-400">- R$ {balanceToUse.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-rs-text">Valor restante a pagar:</span>
            <span className="font-mono text-rs-gold">R$ {orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
