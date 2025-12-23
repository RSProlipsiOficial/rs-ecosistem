
import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { Button } from './ui/Button';

export const CouponInput: React.FC = () => {
  const { applyCoupon, removeCoupon, couponCode } = useCheckout();
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setStatus('LOADING');
    setTimeout(() => {
      const success = applyCoupon(inputCode);
      if (success) {
        setStatus('SUCCESS');
        setInputCode('');
      } else {
        setStatus('ERROR');
      }
    }, 600);
  };

  const handleRemove = () => {
    removeCoupon();
    setStatus('IDLE');
    setInputCode('');
  };

  if (couponCode) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-between animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Tag className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-green-400 font-bold uppercase tracking-wide">Cupom Aplicado</p>
            <p className="text-sm text-white font-mono font-bold">{couponCode}</p>
          </div>
        </div>
        <button 
          onClick={handleRemove}
          className="p-2 hover:bg-white/5 rounded-lg text-rs-muted hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex gap-2">
         <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rs-muted">
                <Tag className="w-4 h-4" />
            </div>
            <input 
                type="text"
                placeholder="Cupom de Desconto"
                className={`
                   w-full bg-[#161920] border rounded-lg pl-9 pr-4 py-2.5 text-sm text-rs-text placeholder-rs-muted/50 focus:outline-none transition-all
                   ${status === 'ERROR' ? 'border-red-500/50 focus:border-red-500' : 'border-rs-border focus:border-rs-gold'}
                `}
                value={inputCode}
                onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    if (status === 'ERROR') setStatus('IDLE');
                }}
            />
         </div>
         <Button 
            type="submit" 
            variant="secondary" 
            className="px-4 py-2 text-xs font-bold uppercase h-auto"
            disabled={!inputCode || status === 'LOADING'}
         >
            {status === 'LOADING' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
         </Button>
      </div>
      {status === 'ERROR' && (
         <p className="absolute -bottom-5 left-1 text-[10px] text-red-400 font-medium animate-in slide-in-from-top-1">
            Cupom inválido ou expirado.
         </p>
      )}
    </form>
  );
};
