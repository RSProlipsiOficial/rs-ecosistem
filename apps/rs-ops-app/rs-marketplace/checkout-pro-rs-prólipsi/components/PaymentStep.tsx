

import React from 'react';
import { CreditCard, QrCode, FileText, Lock, Store, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { CardPayment } from './CardPayment';
import { PixPayment } from './PixPayment';
import { CouponInput } from './CouponInput';
import { OrderBump } from './OrderBump';
import { FAQ } from './FAQ'; 
import { WalletBalanceToggle } from './WalletBalanceToggle';
import { PaymentMethod, CheckoutStep } from '../types';
import { useCheckout } from '../context/CheckoutContext';

export const PaymentStep: React.FC = () => {
  const { 
    paymentMethod, 
    setPaymentMethod, 
    step, 
    setStep, 
    orderSummary, 
    loading, 
    processCheckout, 
    customer,
    balanceToUse
  } = useCheckout();

  const isPaymentCoveredByBalance = orderSummary.total <= 0;

  return (
    <div className="bg-rs-card p-6 md:p-8 rounded-2xl border border-rs-border space-y-8 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-rs-border pb-6">
        <h2 className="text-xl font-semibold text-rs-text flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rs-gold text-rs-dark text-sm font-bold shadow-[0_0_10px_rgba(200,167,78,0.3)]">3</span>
          Pagamento
        </h2>
        <button onClick={() => setStep(CheckoutStep.REVIEW)} className="text-xs text-rs-gold hover:text-rs-goldHover font-medium underline-offset-4 hover:underline transition-all">
          Alterar dados
        </button>
      </div>

      <CouponInput />
      
      <div className="pb-4 border-b border-rs-border/50">
         <WalletBalanceToggle />
      </div>

      {isPaymentCoveredByBalance && balanceToUse > 0 ? (
         <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-zoom-in">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-inner">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div className="text-center max-w-sm space-y-2">
                <h4 className="text-rs-text font-bold text-lg">Pagamento Coberto pelo Saldo</h4>
                <p className="text-rs-muted text-sm leading-relaxed">Seu saldo da WalletPay é suficiente para cobrir o valor total deste pedido.</p>
            </div>
            <Button fullWidth onClick={() => processCheckout()} isLoading={loading} className="font-extrabold uppercase">
              Confirmar Pedido com Saldo
            </Button>
         </div>
      ) : (
        <>
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-[#161920] rounded-xl border border-rs-border/50">
              <button
                onClick={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs md:text-sm transition-all duration-300 transform ${
                  paymentMethod === PaymentMethod.CREDIT_CARD 
                    ? 'bg-rs-gold text-black font-extrabold shadow-md shadow-rs-gold/10 scale-[1.02]' 
                    : 'text-rs-muted font-bold hover:text-rs-text hover:bg-rs-card/50 hover:scale-[1.01]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Cartão</span>
                <span className="sm:hidden">Cartão</span>
              </button>
              <button
                onClick={() => setPaymentMethod(PaymentMethod.PIX)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs md:text-sm transition-all duration-300 transform ${
                  paymentMethod === PaymentMethod.PIX
                    ? 'bg-rs-gold text-black font-extrabold shadow-md shadow-rs-gold/10 scale-[1.02]' 
                    : 'text-rs-muted font-bold hover:text-rs-text hover:bg-rs-card/50 hover:scale-[1.01]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">PIX</span>
                  <span className="sm:hidden">PIX</span>
              </button>
              <button
                onClick={() => setPaymentMethod(PaymentMethod.BOLETO)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs md:text-sm transition-all duration-300 transform ${
                  paymentMethod === PaymentMethod.BOLETO
                    ? 'bg-rs-gold text-black font-extrabold shadow-md shadow-rs-gold/10 scale-[1.02]' 
                    : 'text-rs-muted font-bold hover:text-rs-text hover:bg-rs-card/50 hover:scale-[1.01]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Boleto</span>
                <span className="sm:hidden">Boleto</span>
              </button>
               <button
                onClick={() => setPaymentMethod(PaymentMethod.PAY_IN_STORE)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs md:text-sm transition-all duration-300 transform ${
                  paymentMethod === PaymentMethod.PAY_IN_STORE
                    ? 'bg-rs-gold text-black font-extrabold shadow-md shadow-rs-gold/10 scale-[1.02]' 
                    : 'text-rs-muted font-bold hover:text-rs-text hover:bg-rs-card/50 hover:scale-[1.01]'
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Na Loja</span>
                <span className="sm:hidden">Loja</span>
              </button>
            </div>

            <OrderBump />

            <div className="mt-2 min-h-[300px]">
              {step === CheckoutStep.PROCESSING ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="relative"><div className="w-16 h-16 border-4 border-rs-border rounded-full"></div><div className="w-16 h-16 border-4 border-rs-gold border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_15px_rgba(200,167,78,0.4)]"></div></div>
                    <div className="text-center space-y-2"><p className="text-rs-text font-medium animate-pulse">Processando pagamento...</p><p className="text-xs text-rs-muted">Conectando ao gateway seguro</p></div>
                  </div>
              ) : (
                <>
                  {balanceToUse > 0 && orderSummary.total > 0 && (
                    <div className="mb-6 p-3 bg-blue-900/20 border border-blue-800 rounded-lg text-center text-xs text-blue-200 animate-fade-in">
                      Você está usando <strong>R$ {orderSummary.balanceUsed.toFixed(2)}</strong> do seu saldo. Pague o valor restante abaixo.
                    </div>
                  )}

                  {paymentMethod === PaymentMethod.CREDIT_CARD && <CardPayment amount={orderSummary.total} isLoading={loading} onSubmit={processCheckout} />}
                  {paymentMethod === PaymentMethod.PIX && <PixPayment amount={orderSummary.total} onConfirm={() => processCheckout()} />}
                  {paymentMethod === PaymentMethod.BOLETO && (<div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fade-in"><div className="w-20 h-20 bg-rs-dark rounded-full flex items-center justify-center border border-rs-border shadow-inner"><FileText className="w-8 h-8 text-rs-gold" /></div><div className="text-center max-w-sm space-y-2"><h4 className="text-rs-text font-bold text-lg">Pagamento via Boleto</h4><p className="text-rs-muted text-sm leading-relaxed">O boleto será gerado e enviado para:<br/><span className="text-rs-gold font-medium">{customer.email}</span></p></div><div className="bg-[#161920] p-4 rounded-lg border border-rs-border w-full max-w-sm text-xs text-rs-muted space-y-3"><div className="flex justify-between border-b border-rs-border/50 pb-2"><span>Vencimento</span><span className="text-rs-text font-medium">3 dias úteis</span></div><div className="flex justify-between"><span>Confirmação Bancária</span><span className="text-rs-text font-medium">Até 48h</span></div></div><Button fullWidth onClick={() => processCheckout()} isLoading={loading} className="font-extrabold uppercase">Gerar Boleto (R$ {orderSummary.total.toFixed(2)})</Button></div>)}
                  {paymentMethod === PaymentMethod.PAY_IN_STORE && (<div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fade-in"><div className="w-20 h-20 bg-rs-dark rounded-full flex items-center justify-center border border-rs-border shadow-inner"><Store className="w-8 h-8 text-rs-gold" /></div><div className="text-center max-w-sm space-y-2"><h4 className="text-rs-text font-bold text-lg">Pagamento na Loja</h4><p className="text-rs-muted text-sm leading-relaxed">Finalize seu pedido agora e realize o pagamento diretamente no nosso Centro de Distribuição mais próximo. Válido por 24 horas.</p></div><Button fullWidth onClick={() => processCheckout()} isLoading={loading} className="font-extrabold uppercase">Finalizar Pedido</Button></div>)}
                </>
              )}
            </div>
        </>
      )}

      <FAQ />
    </div>
  );
};
