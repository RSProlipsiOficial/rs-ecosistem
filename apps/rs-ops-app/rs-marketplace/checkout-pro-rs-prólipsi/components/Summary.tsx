

import React, { useState } from 'react';
import { Package, ShieldCheck, Zap, CreditCard, QrCode, FileText, Star, Quote, Award, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { PaymentMethod, CheckoutStep } from '../types';
import { useCheckout } from '../context/CheckoutContext';

interface OrderSummaryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  isDigital: boolean;
  subtotal: number;
  shippingLabel: string;
  total: number;
  step?: CheckoutStep;
  paymentMethod?: PaymentMethod;
  installments?: number;
}

const formatCurrencyBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  title,
  description,
  imageUrl,
  isDigital,
  subtotal,
  shippingLabel,
  total,
  step,
  paymentMethod,
  installments = 1,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { orderSummary, isOrderBumpSelected, orderBumpProduct } = useCheckout();
  const showPaymentInfo = step && (step === CheckoutStep.PAYMENT || step === CheckoutStep.PROCESSING || step === CheckoutStep.SUCCESS);

  const getPaymentLabel = () => {
    switch (paymentMethod) {
      case PaymentMethod.PIX: return 'PIX (Aprovação Imediata)';
      case PaymentMethod.BOLETO: return 'Boleto Bancário';
      case PaymentMethod.CREDIT_CARD: return `Cartão de Crédito (${installments}x)`;
      case PaymentMethod.WALLET_BALANCE: return 'Saldo da Wallet';
      case PaymentMethod.PAY_IN_STORE: return 'Pagamento na Loja';
      default: return 'Aguardando escolha...';
    }
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case PaymentMethod.PIX: return <QrCode className="w-4 h-4 text-rs-gold" />;
      case PaymentMethod.BOLETO: return <FileText className="w-4 h-4 text-rs-gold" />;
      case PaymentMethod.CREDIT_CARD: return <CreditCard className="w-4 h-4 text-rs-gold" />;
      case PaymentMethod.WALLET_BALANCE: return <Wallet className="w-4 h-4 text-blue-400" />;
      default: return <CreditCard className="w-4 h-4 text-rs-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1B2029] rounded-[16px] border border-rs-border h-fit sticky top-6 shadow-2xl shadow-black/40 overflow-hidden ring-1 ring-white/5 animate-in fade-in slide-in-from-right-4 duration-700">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-5 border-b border-rs-border/50 bg-[#161920] flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rs-gold/50"
          aria-expanded={!isCollapsed}
          aria-controls="order-summary-content"
        >
          <h3 className="text-base font-bold text-rs-text tracking-wide flex items-center gap-2 uppercase">
            <Package className="w-4 h-4 text-rs-gold" />
            Resumo do Pedido
          </h3>
          {isCollapsed 
            ? <ChevronDown className="w-5 h-5 text-rs-muted" /> 
            : <ChevronUp className="w-5 h-5 text-rs-muted" />}
        </button>
        
        <div 
          id="order-summary-content"
          className={`
            transition-all duration-700 ease-in-out overflow-hidden
            ${isCollapsed ? 'max-h-0' : 'max-h-[1000px]'}
          `}
        >
          <div className="p-6 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="relative w-16 h-16 flex-shrink-0">
                <img src={imageUrl} alt={title} className="w-full h-full rounded-lg object-cover border border-rs-border shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-rs-text text-sm leading-tight mb-1 line-clamp-2">{title}</h4>
                <p className="text-xs text-rs-muted line-clamp-2 mb-2">{description}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border tracking-wider uppercase ${isDigital ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                  {isDigital ? 'PRODUTO DIGITAL' : 'PRODUTO FÍSICO'}
                </span>
              </div>
            </div>

            {isOrderBumpSelected && (
               <div className="flex gap-4 items-start pt-4 border-t border-rs-border/50 animate-in fade-in slide-in-from-right-2">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={orderBumpProduct.image} alt={orderBumpProduct.name} className="w-full h-full rounded-lg object-cover border border-rs-border shadow-sm" />
                    <div className="absolute -top-1 -right-1 bg-rs-gold text-black text-[9px] px-1 rounded font-bold">ADD</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-rs-text text-xs leading-tight mb-1">{orderBumpProduct.name}</h4>
                    <p className="text-[10px] text-rs-muted">Oferta Adicional</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-rs-text">{formatCurrencyBRL(orderBumpProduct.price)}</span>
               </div>
            )}

            <div className="h-px bg-rs-border/50"></div>

            {showPaymentInfo && (
              <div className="bg-rs-card/50 rounded-xl p-3 border border-rs-border/50 animate-in fade-in slide-in-from-left-2">
                <div className="flex justify-between items-center mb-1"><span className="text-[10px] text-rs-muted uppercase font-bold tracking-wider">Forma de Pagamento</span></div>
                <div className="flex items-center gap-2 text-sm text-rs-text font-medium">{getPaymentIcon()}<span>{getPaymentLabel()}</span></div>
                {paymentMethod === PaymentMethod.CREDIT_CARD && installments > 1 && (<div className="text-xs text-rs-muted mt-1 ml-6">{installments}x de {formatCurrencyBRL(total / installments)}</div>)}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-rs-muted"><span>Subtotal</span><span className="font-mono text-rs-text">{formatCurrencyBRL(subtotal)}</span></div>
              <div className="flex justify-between text-rs-muted"><span>Frete</span><span className={`font-mono ${shippingLabel.includes('Grátis') || shippingLabel === 'A calcular' ? 'text-green-400 font-bold uppercase text-xs tracking-wider' : 'text-rs-text'}`}>{shippingLabel}</span></div>
              {orderSummary.orderBump > 0 && (<div className="flex justify-between text-rs-gold/80"><span>Adicional (Bump)</span><span className="font-mono">{formatCurrencyBRL(orderSummary.orderBump)}</span></div>)}
              {orderSummary.discount > 0 && (<div className="flex justify-between text-green-400"><span>Desconto</span><span className="font-mono">- {formatCurrencyBRL(orderSummary.discount)}</span></div>)}
              {orderSummary.balanceUsed > 0 && (<div className="flex justify-between text-blue-400"><span>Saldo Utilizado</span><span className="font-mono">- {formatCurrencyBRL(orderSummary.balanceUsed)}</span></div>)}
              
              <div className="pt-4 mt-2 border-t border-rs-border/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rs-text text-base">Total</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xl font-bold text-rs-gold text-shadow-sm leading-none">{formatCurrencyBRL(total)}</span>
                    {(!showPaymentInfo || paymentMethod !== PaymentMethod.CREDIT_CARD) && (<span className="text-[10px] text-rs-muted mt-1">em até 12x</span>)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-rs-gold/10 border border-rs-gold/20 rounded-lg p-2 flex items-center justify-between"><div className="flex items-center gap-2"><Award className="w-4 h-4 text-rs-gold" /><span className="text-xs font-bold text-rs-gold uppercase">Pontos SIGMA</span></div><span className="text-sm font-mono font-bold text-white">+{orderSummary.sigmaPoints}</span></div>
            <div className="bg-[#161920]/50 rounded-xl p-3 border border-white/5 space-y-2"><div className="flex items-center gap-2 text-[11px] text-rs-muted/80"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /><span>Compra Garantida RS.</span></div><div className="flex items-center gap-2 text-[11px] text-rs-muted/80"><Zap className="w-3.5 h-3.5 text-rs-gold" /><span>Acesso imediato após aprovação.</span></div></div>
          </div>
        </div>
      </div>

      <div className="bg-[#1B2029] rounded-[16px] border border-rs-border p-5 relative overflow-hidden hidden md:block opacity-80 hover:opacity-100 transition-opacity">
        <Quote className="absolute top-4 right-4 text-rs-gold/10 w-10 h-10" />
        <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-rs-gold fill-rs-gold" />)}</div>
        <p className="text-xs text-rs-text italic leading-relaxed mb-4">"O suporte e a plataforma da RS Prólipsi mudaram meu negócio. O kit chegou antes do prazo e a mentoria foi essencial."</p>
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-rs-gold/20 flex items-center justify-center text-rs-gold text-xs font-bold">MC</div><div><p className="text-xs font-bold text-white">Maria Clara</p><p className="text-[10px] text-rs-muted">Consultora Verificada</p></div></div>
      </div>
    </div>
  );
};
