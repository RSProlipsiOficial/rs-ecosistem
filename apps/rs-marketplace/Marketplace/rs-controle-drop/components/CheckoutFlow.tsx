
import React, { useState, useMemo, useEffect } from 'react';
import { Cart, Checkout, CheckoutFunnelStep, MarketingOffer } from '../types';
import { useCartCheckout } from '../contexts/CartCheckoutContext';
import { ModalWrapper } from './ModalWrapper';
import { User, MapPin, Truck, CreditCard, Lock, CheckCircle, ArrowRight, ShieldCheck, Plus, ShoppingBag, X } from 'lucide-react';

interface CheckoutFlowProps {
    cart: Cart;
    onClose: () => void;
}

type Step = 'dados_pessoais' | 'endereco_frete' | 'pagamento' | 'upsell';

// Mock Offers
const MOCK_BUMPS: MarketingOffer[] = [
    { id: 'bump1', type: 'bump', name: 'Garantia Estendida 12 Meses', description: 'Proteja sua compra contra defeitos por mais 1 ano.', price: 29.90, productId: 'serv-01' },
    { id: 'bump2', type: 'bump', name: 'Envio Prioritário', description: 'Seu pedido será embalado e enviado na frente dos outros.', price: 9.90, productId: 'serv-02' },
];

const MOCK_UPSELLS: MarketingOffer[] = [
    { id: 'upsell1', type: 'upsell', name: 'Kit Complementar Premium', description: 'Leve o par perfeito para o seu produto com 40% de desconto. Só agora!', price: 89.90, productId: 'prod-99' }
];

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ cart, onClose }) => {
    const { startCheckout, updateCheckoutDetails, completeCheckout, addOfferToCheckout } = useCartCheckout();
    const [currentStep, setCurrentStep] = useState<Step>('dados_pessoais');
    const [checkoutId, setCheckoutId] = useState<string | null>(null);
    const [acceptedBumps, setAcceptedBumps] = useState<string[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        customerInfo: { name: '', email: '', phone: '' },
        shippingInfo: { address: '', number: '', complement: '', city: '', state: '', zip: '' },
        paymentInfo: { method: 'credit_card' },
        consents: { transactional: true, marketing: false }
    });

    useEffect(() => {
        // Track InitiateCheckout on mount
        console.log("PIXEL EVENT: InitiateCheckout", { 
            value: cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0), 
            currency: 'BRL',
            content_ids: cart.items.map(i => i.productId)
        });
    }, []);

    const handleNextStep = (nextStep: Step) => {
        if (!checkoutId && currentStep === 'dados_pessoais') {
            const newId = startCheckout(cart.id, formData.customerInfo, formData.consents);
            if (newId) {
                setCheckoutId(newId);
                updateCheckoutDetails(newId, { customerInfo: formData.customerInfo }, nextStep as CheckoutFunnelStep);
                setCurrentStep(nextStep);
                
                // Track AddPaymentInfo (simulated transition) or Contact
                console.log("PIXEL EVENT: Contact", { email: formData.customerInfo.email });
            } else {
                alert("Erro ao iniciar checkout. Tente novamente.");
            }
        } else if (checkoutId) {
            if (currentStep === 'endereco_frete') {
                 updateCheckoutDetails(checkoutId, { shippingInfo: { method: 'SEDEX', cost: 25.00 } }, nextStep as CheckoutFunnelStep);
                 console.log("PIXEL EVENT: AddShippingInfo");
            }
            setCurrentStep(nextStep);
        }
    };

    const handlePaymentComplete = () => {
        // Here we don't complete the checkout status yet, we move to Upsell
        if (checkoutId) {
            // Apply selected bumps
            acceptedBumps.forEach(bumpId => {
                const bump = MOCK_BUMPS.find(b => b.id === bumpId);
                if (bump) {
                    addOfferToCheckout(checkoutId, bump);
                    console.log("PIXEL EVENT: AddToCart (Bump)", { id: bump.productId, value: bump.price });
                }
            });
            console.log("PIXEL EVENT: AddPaymentInfo");
            setCurrentStep('upsell');
        }
    };

    const handleUpsellDecision = (accepted: boolean) => {
        if (checkoutId) {
            if (accepted) {
                // Add upsell logic
                addOfferToCheckout(checkoutId, MOCK_UPSELLS[0]);
                console.log("PIXEL EVENT: AddToCart (Upsell)", { id: MOCK_UPSELLS[0].productId, value: MOCK_UPSELLS[0].price });
                alert("Oferta adicionada ao seu pedido!");
            }
            completeCheckout(checkoutId);
            
            // Final Purchase Event
            console.log("PIXEL EVENT: Purchase", { 
                transaction_id: checkoutId,
                value: cartTotal + shippingCost + bumpsTotal + (accepted ? MOCK_UPSELLS[0].price : 0),
                currency: 'BRL'
            });
            
            onClose();
        }
    };

    // Calculations
    const cartTotal = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const shippingCost = currentStep !== 'dados_pessoais' ? 25.00 : 0;
    const bumpsTotal = acceptedBumps.reduce((acc, id) => {
        const bump = MOCK_BUMPS.find(b => b.id === id);
        return acc + (bump ? bump.price : 0);
    }, 0);
    
    const total = cartTotal + shippingCost + bumpsTotal;
    
    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Finalizar Compra" size="5xl">
            <div className="flex flex-col lg:flex-row h-full">
                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {currentStep !== 'upsell' && <ProgressBar currentStep={currentStep} />}
                    
                    <div className="mt-8">
                        {currentStep === 'dados_pessoais' && (
                            <StepContact formData={formData} setFormData={setFormData} onNext={() => handleNextStep('endereco_frete')} />
                        )}
                        {currentStep === 'endereco_frete' && (
                            <StepShipping formData={formData} setFormData={setFormData} onBack={() => setCurrentStep('dados_pessoais')} onNext={() => handleNextStep('pagamento')} />
                        )}
                        {currentStep === 'pagamento' && (
                            <StepPayment 
                                onBack={() => setCurrentStep('endereco_frete')} 
                                onComplete={handlePaymentComplete}
                                acceptedBumps={acceptedBumps}
                                setAcceptedBumps={setAcceptedBumps}
                            />
                        )}
                        {currentStep === 'upsell' && (
                            <StepUpsell onAccept={() => handleUpsellDecision(true)} onDecline={() => handleUpsellDecision(false)} />
                        )}
                    </div>
                </div>

                {/* Order Summary (Hidden on Upsell for focus) */}
                {currentStep !== 'upsell' && (
                    <div className="w-full lg:w-1/3 bg-black/20 p-8 border-l border-white/10 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-100 border-b border-white/10 pb-4 mb-4">Resumo do Pedido</h3>
                        <div className="space-y-3 overflow-y-auto flex-1 max-h-[300px]">
                            {cart.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-rs-dark rounded-md relative flex-shrink-0">
                                        <span className="absolute -top-2 -right-2 bg-rs-gold text-rs-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate">{item.productName}</div>
                                    </div>
                                    <div className="text-sm font-medium">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                            {acceptedBumps.map(bumpId => {
                                const bump = MOCK_BUMPS.find(b => b.id === bumpId);
                                if (!bump) return null;
                                return (
                                    <div key={bump.id} className="flex items-center gap-4 bg-yellow-500/5 p-2 rounded">
                                        <div className="w-16 h-16 bg-yellow-500/10 rounded-md flex items-center justify-center flex-shrink-0 text-yellow-500">
                                            <ShieldCheck size={20}/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-yellow-200 truncate">{bump.name}</div>
                                        </div>
                                        <div className="text-sm font-medium text-yellow-200">R$ {bump.price.toFixed(2)}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Frete</span><span>{shippingCost > 0 ? `R$ ${shippingCost.toFixed(2)}` : 'A calcular'}</span></div>
                            {bumpsTotal > 0 && <div className="flex justify-between text-yellow-300"><span className="">Extras</span><span>R$ {bumpsTotal.toFixed(2)}</span></div>}
                            <div className="border-t border-dashed border-white/10 my-2"></div>
                            <div className="flex justify-between font-bold text-lg"><span className="text-slate-200">Total</span><span className="text-rs-gold">R$ {total.toFixed(2)}</span></div>
                        </div>
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
};

// --- Sub-components ---

const ProgressBar = ({ currentStep }: { currentStep: Step }) => {
    const steps: { id: Step, label: string, icon: React.ReactNode }[] = [
        { id: 'dados_pessoais', label: 'Contato', icon: <User size={16} /> },
        { id: 'endereco_frete', label: 'Envio', icon: <Truck size={16} /> },
        { id: 'pagamento', label: 'Pagamento', icon: <CreditCard size={16} /> },
    ];
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${index <= currentIndex ? 'bg-rs-gold border-rs-gold text-rs-black scale-110' : 'bg-rs-dark border-slate-600 text-slate-400'}`}>
                           {index < currentIndex ? <CheckCircle size={16} /> : step.icon}
                        </div>
                        <div className={`mt-2 text-xs font-bold transition-colors ${index <= currentIndex ? 'text-rs-gold' : 'text-slate-400'}`}>{step.label}</div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${index < currentIndex ? 'bg-rs-gold' : 'bg-slate-600'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const StepContact = ({ formData, setFormData, onNext }: any) => {
    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, customerInfo: { ...prev.customerInfo, [field]: value } }));
    };
    const handleConsentChange = (type: 'transactional' | 'marketing', value: boolean) => {
        setFormData((prev: any) => ({ ...prev, consents: { ...prev.consents, [type]: value } }));
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">Informações de Contato</h2>
            <div className="space-y-4">
                <div><label className="label-text">Nome Completo</label><input type="text" value={formData.customerInfo.name} onChange={e => handleChange('name', e.target.value)} className="input-field" placeholder="Seu nome" /></div>
                <div><label className="label-text">E-mail</label><input type="email" value={formData.customerInfo.email} onChange={e => handleChange('email', e.target.value)} className="input-field" placeholder="seu@email.com" /></div>
                <div><label className="label-text">WhatsApp</label><input type="tel" value={formData.customerInfo.phone} onChange={e => handleChange('phone', e.target.value)} className="input-field" placeholder="(DD) 99999-9999" /></div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-bold"><ShieldCheck size={16}/> Privacidade (LGPD)</div>
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.consents.transactional} onChange={e => handleConsentChange('transactional', e.target.checked)} className="w-4 h-4 accent-rs-gold rounded border-slate-600 mt-1" />
                    <div className="text-xs text-slate-300 leading-relaxed"><span className="font-bold text-slate-200">Essencial:</span> Concordo em receber atualizações do pedido via WhatsApp/E-mail.</div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.consents.marketing} onChange={e => handleConsentChange('marketing', e.target.checked)} className="w-4 h-4 accent-rs-gold rounded border-slate-600 mt-1" />
                    <div className="text-xs text-slate-300 leading-relaxed"><span className="font-bold text-slate-200">Ofertas:</span> Quero receber descontos exclusivos.</div>
                </label>
            </div>
            <div className="pt-4 flex justify-end">
                <button onClick={onNext} className="btn-primary flex items-center gap-2">Continuar <ArrowRight size={16}/></button>
            </div>
        </div>
    );
};

const StepShipping = ({ onBack, onNext }: any) => (
    <div className="animate-fade-in space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Endereço de Entrega</h2>
        <div><label className="label-text">CEP</label><input type="text" className="input-field" placeholder="00000-000" /></div>
        <div><label className="label-text">Endereço</label><input type="text" className="input-field" placeholder="Rua, Av..." /></div>
        <div className="pt-4 flex justify-between">
            <button onClick={onBack} className="btn-secondary">Voltar</button>
            <button onClick={onNext} className="btn-primary flex items-center gap-2">Continuar <ArrowRight size={16}/></button>
        </div>
    </div>
);

const StepPayment = ({ onBack, onComplete, acceptedBumps, setAcceptedBumps }: any) => {
    const handleBumpToggle = (bumpId: string) => {
        if (acceptedBumps.includes(bumpId)) {
            setAcceptedBumps(acceptedBumps.filter((id: string) => id !== bumpId));
        } else {
            setAcceptedBumps([...acceptedBumps, bumpId]);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">Pagamento</h2>
            
            {/* Order Bump Area */}
            <div className="space-y-3">
                {MOCK_BUMPS.map(bump => {
                    const isSelected = acceptedBumps.includes(bump.id);
                    return (
                        <div 
                            key={bump.id}
                            onClick={() => handleBumpToggle(bump.id)}
                            className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all flex items-start gap-4 ${isSelected ? 'bg-yellow-500/10 border-yellow-500' : 'bg-black/20 border-slate-600 hover:border-slate-500'}`}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-1 ${isSelected ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-slate-500'}`}>
                                {isSelected && <CheckCircle size={14}/>}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${isSelected ? 'text-yellow-400' : 'text-slate-200'}`}>SIM, adicionar {bump.name}</span>
                                    <span className="font-bold text-slate-100">R$ {bump.price.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{bump.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                <Lock size={20} className="text-emerald-400"/>
                <p className="text-sm text-emerald-300">Ambiente seguro. Seus dados são criptografados.</p>
            </div>
            
            <div><label className="label-text">Número do Cartão</label><input type="text" className="input-field" placeholder="**** **** **** ****" /></div>
            
            <div className="pt-4 flex justify-between">
                <button onClick={onBack} className="btn-secondary">Voltar</button>
                <button onClick={onComplete} className="btn-primary text-lg py-3 px-6 flex items-center gap-2">Finalizar Compra</button>
            </div>
        </div>
    );
};

const StepUpsell = ({ onAccept, onDecline }: any) => {
    const offer = MOCK_UPSELLS[0];
    return (
        <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full py-10">
            <div className="mb-6 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                Espere! Oferta Especial
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2 max-w-lg">
                Seu pedido foi aprovado, mas...
            </h2>
            <p className="text-slate-400 mb-8 max-w-md">
                Temos uma oportunidade única para você adicionar este item exclusivo ao seu pedido sem digitar seus dados novamente.
            </p>

            <div className="bg-gradient-to-br from-rs-card to-rs-dark p-6 rounded-2xl border border-rs-gold shadow-2xl max-w-md w-full mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rs-gold text-rs-black font-bold text-xs px-2 py-1 rounded-bl-lg">-40% OFF</div>
                <div className="w-32 h-32 bg-slate-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <ShoppingBag size={48} className="text-slate-600"/>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{offer.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{offer.description}</p>
                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-slate-500 line-through text-sm">R$ {(offer.price * 1.6).toFixed(2)}</span>
                    <span className="text-2xl font-bold text-emerald-400">R$ {offer.price.toFixed(2)}</span>
                </div>
                
                <button onClick={onAccept} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg text-lg flex items-center justify-center gap-2 mb-3 transition-colors shadow-lg shadow-emerald-500/20">
                    <Plus size={20}/> Adicionar ao meu pedido
                </button>
                <button onClick={onDecline} className="text-xs text-slate-500 underline hover:text-slate-300">
                    Não, obrigado. Vou perder essa chance.
                </button>
            </div>
        </div>
    );
};
