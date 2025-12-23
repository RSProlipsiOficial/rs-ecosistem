

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, CheckCircle, AlertTriangle, ChevronRight, Lock, Award, Shield, CreditCard, QrCode, FileText, Clock, FileCheck, Store } from 'lucide-react';
import { OrderSummaryCard } from './components/Summary';
import { Button } from './components/ui/Button';
import { IdentificationStep } from './components/IdentificationStep';
import { ReviewStep } from './components/ReviewStep'; 
import { ReviewStepSkeleton } from './components/ReviewStepSkeleton';
import { PaymentStep } from './components/PaymentStep';
import { SupportWidget } from './components/SupportWidget';
import { CheckoutStep, PaymentMethod } from './types';
import { useCheckout } from './context/CheckoutContext';

const App: React.FC = () => {
  const { 
    step, 
    setStep, 
    customer, 
    updateCustomer, 
    product, 
    orderSummary, 
    error,
    paymentMethod,
    installments
  } = useCheckout();

  // Scarcity Timer Logic
  const [timeLeft, setTimeLeft] = useState(600);
  
  // Animation state
  const prevStepRef = useRef(step);
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const stepOrder = [
    CheckoutStep.IDENTIFICATION,
    CheckoutStep.REVIEW,
    CheckoutStep.PAYMENT,
    CheckoutStep.PROCESSING,
    CheckoutStep.SUCCESS,
  ];

  useEffect(() => {
    const prevIndex = stepOrder.indexOf(prevStepRef.current);
    const currentIndex = stepOrder.indexOf(step);

    if (currentIndex > prevIndex) {
      setAnimationClass('animate-slide-in-right');
    } else if (currentIndex < prevIndex) {
      setAnimationClass('animate-slide-in-left');
    } else {
      setAnimationClass('animate-fade-in');
    }

    prevStepRef.current = step;
  }, [step]);
  
  useEffect(() => {
    if (step === CheckoutStep.SUCCESS) return;
    const timer = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIdentificationComplete = (data: any) => {
    updateCustomer(data);
    setIsTransitioning(true);
    // Simulate loading/processing before showing the review step
    setTimeout(() => {
        setStep(CheckoutStep.REVIEW);
        setIsTransitioning(false);
    }, 400); 
  };

  const getPaymentMethodLabel = () => {
    if (paymentMethod === PaymentMethod.PIX) return "PIX";
    if (paymentMethod === PaymentMethod.BOLETO) return "Boleto Bancário";
    if (paymentMethod === PaymentMethod.CREDIT_CARD) return "Cartão de Crédito";
    if (paymentMethod === PaymentMethod.PAY_IN_STORE) return "Pagamento na Loja";
    if (paymentMethod === PaymentMethod.WALLET_BALANCE) return "Saldo WalletPay";
    return "";
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-rs-muted mb-8 overflow-x-auto no-scrollbar py-2">
      <div className={`flex items-center gap-2 whitespace-nowrap transition-colors duration-300 ${step === CheckoutStep.IDENTIFICATION ? "text-rs-gold font-bold" : "text-rs-muted opacity-60"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all ${step === CheckoutStep.IDENTIFICATION ? "border-rs-gold bg-rs-gold/10 text-rs-gold shadow-[0_0_10px_rgba(200,167,78,0.2)]" : "border-rs-muted text-rs-muted"}`}>1</div>
        <span className="tracking-wide">Identificação</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-rs-border flex-shrink-0" />
      
      <div className={`flex items-center gap-2 whitespace-nowrap transition-colors duration-300 ${step === CheckoutStep.REVIEW ? "text-rs-gold font-bold" : "text-rs-muted opacity-60"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all ${step === CheckoutStep.REVIEW ? "border-rs-gold bg-rs-gold/10 text-rs-gold shadow-[0_0_10px_rgba(200,167,78,0.2)]" : "border-rs-muted text-rs-muted"}`}><FileCheck className="w-3 h-3" /></div>
        <span className="tracking-wide">Revisão</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-rs-border flex-shrink-0" />
      
      <div className={`flex items-center gap-2 whitespace-nowrap transition-colors duration-300 ${step === CheckoutStep.PAYMENT || step === CheckoutStep.PROCESSING ? "text-rs-gold font-bold" : "text-rs-muted opacity-60"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all ${step === CheckoutStep.PAYMENT || step === CheckoutStep.PROCESSING ? "border-rs-gold bg-rs-gold/10 text-rs-gold shadow-[0_0_10px_rgba(200,167,78,0.2)]" : "border-rs-muted text-rs-muted"}`}>3</div>
        <span className="tracking-wide">Pagamento</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-rs-border flex-shrink-0" />
      
      <div className={`flex items-center gap-2 whitespace-nowrap transition-colors duration-300 ${step === CheckoutStep.SUCCESS ? "text-rs-gold font-bold" : "text-rs-muted opacity-60"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all ${step === CheckoutStep.SUCCESS ? "border-rs-gold bg-rs-gold/10 text-rs-gold shadow-[0_0_10px_rgba(200,167,78,0.2)]" : "border-rs-muted text-rs-muted"}`}>4</div>
        <span className="tracking-wide">Conclusão</span>
      </div>
    </div>
  );

  if (step === CheckoutStep.SUCCESS) {
    const isStorePayment = paymentMethod === PaymentMethod.PAY_IN_STORE;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-rs-dark">
        <div className={`bg-rs-card max-w-lg w-full rounded-2xl p-8 border ${isStorePayment ? 'border-orange-500/30' : 'border-rs-gold/30'} text-center space-y-6 animate-zoom-in shadow-2xl relative overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isStorePayment ? 'via-orange-500' : 'via-rs-gold'} to-transparent`}></div>
          
          <div className={`w-24 h-24 ${isStorePayment ? 'bg-orange-500/10 ring-orange-500/30' : 'bg-green-500/10 ring-green-500/30'} rounded-full flex items-center justify-center mx-auto mb-4 ring-1 shadow-[0_0_30px_rgba(34,197,94,0.1)]`}>
            {isStorePayment 
              ? <Store className="w-12 h-12 text-orange-500" />
              : <CheckCircle className="w-12 h-12 text-green-500" />
            }
          </div>
          <div>
            <h1 className="text-3xl font-bold text-rs-text mb-2 tracking-tight">{isStorePayment ? 'Pedido Reservado' : 'Pedido Confirmado!'}</h1>
            <p className="text-rs-muted">
              {isStorePayment
                ? 'Seu pedido foi reservado. Por favor, realize o pagamento na loja em até 24h.'
                : `Obrigado pela compra. Enviamos os detalhes para `
              }
              {!isStorePayment && <span className="text-rs-gold font-medium">{customer.email}</span>.}
            </p>
          </div>
          
          <div className="bg-[#161920] p-5 rounded-xl border border-rs-border text-left shadow-inner relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <ShoppingBag className="w-32 h-32 text-rs-gold" />
             </div>
            <p className="text-[10px] text-rs-muted uppercase tracking-wider mb-1 font-bold">Código do Pedido</p>
            <p className="text-xl font-mono text-rs-gold font-bold tracking-wider">#RS-{Date.now().toString().slice(-6)}</p>
            
            <div className="mt-4 pt-4 border-t border-rs-border/50 flex items-center gap-3">
                 {paymentMethod === PaymentMethod.CREDIT_CARD && <CreditCard className="w-4 h-4 text-rs-gold" />}
                 {paymentMethod === PaymentMethod.PIX && <QrCode className="w-4 h-4 text-rs-gold" />}
                 {paymentMethod === PaymentMethod.BOLETO && <FileText className="w-4 h-4 text-rs-gold" />}
                 {paymentMethod === PaymentMethod.PAY_IN_STORE && <Store className="w-4 h-4 text-orange-500" />}
                 <span className="text-sm text-rs-text font-medium">{getPaymentMethodLabel()}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
             <div className="flex items-center gap-4 bg-rs-card/50 border border-rs-border/50 p-4 rounded-xl">
                <div className={`p-2 ${isStorePayment ? 'bg-gradient-to-br from-orange-500 to-orange-400' : 'bg-gradient-to-br from-rs-gold to-[#B69642]'} text-rs-dark rounded-lg shadow-md`}>
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] text-rs-muted uppercase font-bold tracking-wider">Status</p>
                    <p className="text-sm text-rs-text font-medium">{isStorePayment ? 'Aguardando Pagamento' : 'Processamento Iniciado'}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-rs-card/50 border border-rs-border/50 p-4 rounded-xl">
                <div className={`p-2 ${isStorePayment ? 'bg-gradient-to-br from-orange-500 to-orange-400' : 'bg-gradient-to-br from-rs-gold to-[#B69642]'} text-rs-dark rounded-lg shadow-md`}>
                    <Award className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] text-rs-muted uppercase font-bold tracking-wider">Benefício SIGMA</p>
                    <p className="text-sm text-rs-text font-medium">{isStorePayment ? 'Pontos serão creditados após pagamento' : `+${orderSummary.sigmaPoints} pontos creditados`}</p>
                </div>
             </div>
          </div>

          <Button fullWidth onClick={() => window.location.reload()} className="mt-4 text-black font-bold">Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    if (step === CheckoutStep.IDENTIFICATION) {
      return <IdentificationStep initialData={customer} onComplete={handleIdentificationComplete} />;
    }
    if (step === CheckoutStep.REVIEW) {
      // Show skeleton during the brief transition
      return isTransitioning ? <ReviewStepSkeleton /> : <ReviewStep />;
    }
    if (step === CheckoutStep.PAYMENT || step === CheckoutStep.PROCESSING) {
      return <PaymentStep />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-rs-dark text-rs-text font-sans selection:bg-rs-gold/30 selection:text-rs-gold flex flex-col justify-between">
      
      {/* Scarcity Bar */}
      <div className="bg-gradient-to-r from-[#B69642] to-rs-gold text-rs-dark text-center text-xs font-bold py-1.5 px-4 shadow-lg z-50 sticky top-0">
         <div className="flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>OFERTA ESPECIAL EXPIRA EM {formatTime(timeLeft)}</span>
         </div>
      </div>

      <div className="p-4 md:p-8 flex-grow">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Top Bar */}
          <header className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-rs-border gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rs-gold to-[#B69642] rounded-lg flex items-center justify-center text-rs-dark font-bold text-xl shadow-[0_0_15px_rgba(200,167,78,0.2)]">
                RS
              </div>
              <div className="flex flex-col">
                  <span className="text-lg font-bold text-rs-text tracking-wide leading-none">CHECKOUT <span className="text-rs-gold">PRO</span></span>
                  <span className="text-[10px] text-rs-muted uppercase tracking-[0.2em]">Ambiente Seguro</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-rs-muted bg-[#161920] px-4 py-2 rounded-full border border-rs-border shadow-sm">
              <Lock className="w-3 h-3 text-rs-gold" />
              <span className="font-medium">Criptografia Ponta a Ponta (256-bit)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            {/* LEFT COLUMN - STEPS */}
            <div className="lg:col-span-8">
              {renderBreadcrumb()}

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div key={step} className={animationClass}>
                {renderCurrentStep()}
              </div>
            </div>

            {/* RIGHT COLUMN - SUMMARY */}
            <div className="lg:col-span-4 relative">
              <OrderSummaryCard 
                  title={product.name}
                  description={product.description}
                  imageUrl={product.image}
                  isDigital={product.type === 'DIGITAL'}
                  subtotal={orderSummary.subtotal}
                  shippingLabel={orderSummary.shipping === 0 ? 'Grátis' : `R$ ${orderSummary.shipping.toFixed(2)}`}
                  total={orderSummary.total}
                  step={step}
                  paymentMethod={paymentMethod}
                  installments={installments}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Support Widget */}
      <SupportWidget />

      {/* Footer Institucional */}
      <footer className="border-t border-rs-border mt-12 bg-[#0F1115]">
          <div className="max-w-6xl mx-auto px-4 py-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="h-8 px-3 bg-rs-border/30 rounded flex items-center justify-center text-[10px] text-rs-muted gap-1">
                        <Shield className="w-3 h-3" /> SSL Secure
                    </div>
                    <div className="h-8 px-3 bg-rs-border/30 rounded flex items-center justify-center text-[10px] text-rs-muted gap-1">
                        <Lock className="w-3 h-3" /> Safe Browsing
                    </div>
                </div>
                <div className="text-center md:text-right text-[10px] text-rs-muted space-y-1">
                    <p className="font-bold">RS PRÓLIPSI TECNOLOGIA LTDA - CNPJ: 00.000.000/0001-00</p>
                    <p>Av. Paulista, 1000 - São Paulo, SP</p>
                    <p>&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
                </div>
             </div>
          </div>
       </footer>
    </div>
  );
};

export default App;
