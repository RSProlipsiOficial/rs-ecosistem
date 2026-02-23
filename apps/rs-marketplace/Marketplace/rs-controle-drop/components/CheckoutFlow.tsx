import React, { useState, useEffect } from 'react';
import { Cart, Checkout, CheckoutFunnelStep, MarketingOffer } from '../types';
import { useCartCheckout } from '../contexts/CartCheckoutContext';
import { ModalWrapper } from './ModalWrapper';
import { User, MapPin, Truck, CreditCard, Lock, CheckCircle, ArrowRight, ShieldCheck, Plus, ShoppingBag, X, Zap, Box, Gift, Copy } from 'lucide-react';

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
    const { startCheckout, updateCheckoutDetails, completeCheckout, addOfferToCheckout, calculateShipping, checkouts } = useCartCheckout();
    const [currentStep, setCurrentStep] = useState<Step>('dados_pessoais');
    const [checkoutId, setCheckoutId] = useState<string | null>(null);
    const [acceptedBumps, setAcceptedBumps] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customerInfo: { name: '', email: '', phone: '', cpf: '' },
        shippingInfo: { postalCode: '', address: '', number: '', complement: '', city: '', state: '', selectedOption: null as any },
        paymentInfo: { method: 'pix' },
        consents: { transactional: true, marketing: false }
    });

    // Shipping State
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

    // Pix State
    const [pixData, setPixData] = useState<{ qr_code: string, qr_code_base64: string } | null>(null);

    useEffect(() => {
        // Track InitiateCheckout on mount
        console.log("PIXEL EVENT: InitiateCheckout", {
            value: cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
            currency: 'BRL',
            content_ids: cart.items.map(i => i.productId)
        });
    }, []);

    const handleNextStep = async (nextStep: Step) => {
        if (!checkoutId && currentStep === 'dados_pessoais') {
            setIsLoading(true);
            const newId = await startCheckout(cart.id, formData.customerInfo, formData.consents);
            setIsLoading(false);

            if (newId) {
                setCheckoutId(newId);
                updateCheckoutDetails(newId, { customerInfo: formData.customerInfo }, nextStep as CheckoutFunnelStep);
                setCurrentStep(nextStep);
            }
        } else if (checkoutId) {
            if (currentStep === 'endereco_frete') {
                if (!formData.shippingInfo.selectedOption) {
                    alert("Selecione uma opção de frete.");
                    return;
                }
                updateCheckoutDetails(checkoutId, { shippingInfo: { method: formData.shippingInfo.selectedOption.name, cost: parseFloat(formData.shippingInfo.selectedOption.price) } }, nextStep as CheckoutFunnelStep);
            }
            setCurrentStep(nextStep);
        }
    };

    const handlePaymentComplete = () => {
        if (checkoutId) {
            acceptedBumps.forEach(bumpId => {
                const bump = MOCK_BUMPS.find(b => b.id === bumpId);
                if (bump) {
                    addOfferToCheckout(checkoutId, bump);
                }
            });
            setCurrentStep('upsell');
        }
    };

    const handleUpsellDecision = (accepted: boolean) => {
        if (checkoutId) {
            if (accepted) {
                addOfferToCheckout(checkoutId, MOCK_UPSELLS[0]);
                alert("Oferta adicionada ao seu pedido!");
            }
            completeCheckout(checkoutId);
            onClose();
        }
    };

    // Calculations
    const cartTotal = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const shippingCost = formData.shippingInfo.selectedOption ? parseFloat(formData.shippingInfo.selectedOption.price) : 0;
    const bumpsTotal = acceptedBumps.reduce((acc, id) => {
        const bump = MOCK_BUMPS.find(b => b.id === id);
        return acc + (bump ? bump.price : 0);
    }, 0);

    const total = cartTotal + shippingCost + bumpsTotal;

    const handleShippingCalculate = async () => {
        if (formData.shippingInfo.postalCode.length < 8) return;

        setIsCalculatingShipping(true);
        if (checkoutId) {
            const options = await calculateShipping(checkoutId, formData.shippingInfo.postalCode);
            setShippingOptions(options);
        }
        setIsCalculatingShipping(false);
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Finalizar Compra" size="5xl">
            <div className="flex flex-col lg:flex-row h-full">
                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {currentStep !== 'upsell' && <ProgressBar currentStep={currentStep} />}

                    <div className="mt-8">
                        {currentStep === 'dados_pessoais' && (
                            <StepContact
                                formData={formData}
                                setFormData={setFormData}
                                onNext={() => handleNextStep('endereco_frete')}
                                isLoading={isLoading}
                            />
                        )}
                        {currentStep === 'endereco_frete' && (
                            <StepShipping
                                formData={formData}
                                setFormData={setFormData}
                                onBack={() => setCurrentStep('dados_pessoais')}
                                onNext={() => handleNextStep('pagamento')}
                                onCalculate={handleShippingCalculate}
                                shippingOptions={shippingOptions}
                                isCalculating={isCalculatingShipping}
                            />
                        )}
                        {currentStep === 'pagamento' && (
                            <StepPayment
                                onBack={() => setCurrentStep('endereco_frete')}
                                onComplete={handlePaymentComplete}
                                acceptedBumps={acceptedBumps}
                                setAcceptedBumps={setAcceptedBumps}
                                checkoutId={checkoutId}
                                checkouts={checkouts}
                                pixData={pixData}
                                setPixData={setPixData}
                            />
                        )}
                        {currentStep === 'upsell' && (
                            <StepUpsell onAccept={() => handleUpsellDecision(true)} onDecline={() => handleUpsellDecision(false)} />
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                {currentStep !== 'upsell' && (
                    <div className="w-full lg:w-1/3 bg-black/20 p-8 border-l border-white/10 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-100 border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-rs-gold" /> Resumo do Pedido
                        </h3>
                        <div className="space-y-3 overflow-y-auto flex-1 max-h-[300px]">
                            {cart.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 group">
                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md relative flex-shrink-0 border border-white/5 group-hover:border-rs-gold/30 transition-colors">
                                        <span className="absolute -top-2 -right-2 bg-rs-gold text-rs-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate">{item.productName}</div>
                                    </div>
                                    <div className="text-sm font-medium text-slate-100">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                            {acceptedBumps.map(bumpId => {
                                const bump = MOCK_BUMPS.find(b => b.id === bumpId);
                                if (!bump) return null;
                                return (
                                    <div key={bump.id} className="flex items-center gap-4 bg-gradient-to-r from-yellow-500/10 to-transparent p-2 rounded border-l-2 border-yellow-500">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                            <ShieldCheck size={16} />
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
        { id: 'dados_pessoais', label: 'Identificação', icon: <User size={16} /> },
        { id: 'endereco_frete', label: 'Entrega', icon: <Truck size={16} /> },
        { id: 'pagamento', label: 'Pagamento', icon: <CreditCard size={16} /> },
    ];
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => (
                <div key={step.id} className="relative flex flex-col items-center group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${index <= currentIndex ? 'bg-rs-gold border-rs-gold text-rs-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-rs-dark border-slate-700 text-slate-500'}`}>
                        {index < currentIndex ? <CheckCircle size={18} /> : step.icon}
                    </div>
                    <div className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors ${index <= currentIndex ? 'text-rs-gold' : 'text-slate-500'}`}>{step.label}</div>

                    {/* Linha Conectora */}
                    {index < steps.length - 1 && (
                        <div className={`absolute top-5 left-10 w-[calc(100vw/5)] lg:w-[12rem] h-0.5 -z-0 transition-all duration-500 ${index < currentIndex ? 'bg-rs-gold' : 'bg-slate-700'}`}></div>
                    )}
                </div>
            ))}
        </div>
    );
};

const StepContact = ({ formData, setFormData, onNext, isLoading }: any) => {
    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, customerInfo: { ...prev.customerInfo, [field]: value } }));
    };
    const handleConsentChange = (type: 'transactional' | 'marketing', value: boolean) => {
        setFormData((prev: any) => ({ ...prev, consents: { ...prev.consents, [type]: value } }));
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span className="text-rs-gold">1.</span> Identificação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="label-text">Nome Completo</label><input type="text" value={formData.customerInfo.name} onChange={e => handleChange('name', e.target.value)} className="input-field" placeholder="Seu nome" /></div>
                <div><label className="label-text">E-mail</label><input type="email" value={formData.customerInfo.email} onChange={e => handleChange('email', e.target.value)} className="input-field" placeholder="seu@email.com" /></div>
                <div><label className="label-text">WhatsApp</label><input type="tel" value={formData.customerInfo.phone} onChange={e => handleChange('phone', e.target.value)} className="input-field" placeholder="(DD) 99999-9999" /></div>
                <div className="md:col-span-2"><label className="label-text">CPF</label><input type="text" value={formData.customerInfo.cpf || ''} onChange={e => handleChange('cpf', e.target.value)} className="input-field" placeholder="000.000.000-00" /></div>
            </div>

            <div className="pt-4 flex justify-end">
                <button onClick={onNext} disabled={isLoading} className="btn-primary w-full md:w-auto flex items-center justify-center gap-2">
                    {isLoading ? 'Processando...' : 'CONTINUAR PARA ENTREGA'} <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

const StepShipping = ({ formData, setFormData, onBack, onNext, onCalculate, shippingOptions, isCalculating }: any) => {
    const postalCode = formData.shippingInfo.postalCode || '';

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span className="text-rs-gold">2.</span> Endereço e Frete
            </h2>

            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="label-text">CEP</label>
                    <input
                        type="text"
                        value={postalCode}
                        onChange={e => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, postalCode: e.target.value } })}
                        className="input-field"
                        placeholder="00000-000"
                    />
                </div>
                <button
                    onClick={onCalculate}
                    disabled={isCalculating || postalCode.length < 8}
                    className="btn-secondary h-[42px] px-6"
                >
                    {isCalculating ? 'Calculando...' : 'Calcular Frete'}
                </button>
            </div>

            {shippingOptions.length > 0 && (
                <div className="space-y-3 mt-4">
                    <p className="text-sm text-slate-400 font-medium">Opções de envio disponíveis:</p>
                    {shippingOptions.map((option: any) => (
                        <div
                            key={option.id}
                            onClick={() => setFormData({ ...formData, shippingInfo: { ...formData.shippingInfo, selectedOption: option } })}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between group ${formData.shippingInfo.selectedOption?.id === option.id ? 'bg-rs-gold/10 border-rs-gold' : 'bg-black/20 border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.shippingInfo.selectedOption?.id === option.id ? 'bg-rs-gold text-rs-black' : 'bg-slate-800 text-slate-400'}`}>
                                    {option.name.toLowerCase().includes('moto') ? <Zap size={20} /> : <Box size={20} />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${formData.shippingInfo.selectedOption?.id === option.id ? 'text-rs-gold' : 'text-slate-200'}`}>{option.name}</h4>
                                    <p className="text-xs text-slate-400">Entrega em: {option.delivery_time} dias</p>
                                </div>
                            </div>
                            <span className="font-bold text-lg text-slate-200">R$ {parseFloat(option.price).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-8 flex justify-between gap-4">
                <button onClick={onBack} className="btn-secondary">Voltar</button>
                <button onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2">CONTINUAR PARA PAGAMENTO <ArrowRight size={16} /></button>
            </div>
        </div>
    )
};

const StepPayment = ({ onBack, onComplete, acceptedBumps, setAcceptedBumps, checkoutId, checkouts, pixData, setPixData }: any) => {
    const handleBumpToggle = (bumpId: string) => {
        if (acceptedBumps.includes(bumpId)) setAcceptedBumps(acceptedBumps.filter((id: string) => id !== bumpId));
        else setAcceptedBumps([...acceptedBumps, bumpId]);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span className="text-rs-gold">3.</span> Pagamento
            </h2>

            {/* Seletor de Método de Pagamento (Visual simplificado focado em PIX) */}
            <div className="bg-black/30 p-1 rounded-lg flex mb-6 border border-white/5">
                <button className="flex-1 py-3 px-4 rounded-md bg-rs-gold text-rs-black font-bold flex items-center justify-center gap-2 shadow-lg">
                    <Zap size={18} /> PIX Imediato
                </button>
                <button className="flex-1 py-3 px-4 rounded-md text-slate-500 font-medium flex items-center justify-center gap-2 hover:bg-white/5 disabled:opacity-50" disabled>
                    <CreditCard size={18} /> Cartão (Em breve)
                </button>
            </div>

            {/* Área do PIX */}
            <div className="space-y-6 animate-fade-in">
                {!pixData ? (
                    <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-slate-700">
                        <Zap size={48} className="mx-auto text-rs-gold mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold text-white mb-2">Pague com PIX e libere seu acesso agora!</h3>
                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">Ao pagar com PIX, seu pedido é aprovado instantaneamente e você recebe o acesso ao produto em segundos.</p>

                        <button
                            onClick={async () => {
                                const currentCheckout = checkouts.find((c: any) => c.id === checkoutId);
                                if (currentCheckout && currentCheckout.paymentInfo.metadata) {
                                    const meta = currentCheckout.paymentInfo.metadata;
                                    if (meta.qr_code_base64) {
                                        setPixData({ qr_code: meta.qr_code, qr_code_base64: meta.qr_code_base64 });
                                    } else {
                                        alert("Erro ao recuperar dados do PIX. Tente novamente.");
                                    }
                                } else {
                                    alert("Aguarde a geração do pedido...");
                                }
                            }}
                            className="bg-gradient-to-r from-[#d4af37] to-[#b4932a] text-black font-bold py-4 px-8 rounded hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105"
                        >
                            GERAR QR CODE PIX
                        </button>
                    </div>
                ) : (
                    // QR Code Display
                    <div className="flex flex-col items-center space-y-4 bg-white/5 p-8 rounded-xl border border-[#d4af37]/30 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                        <p className="text-[#d4af37] font-bold text-lg uppercase tracking-wide">Escaneie para pagar</p>

                        <div className="bg-white p-3 rounded-lg shadow-inner">
                            <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-56 h-56" />
                        </div>

                        <div className="w-full max-w-xs">
                            <button
                                onClick={() => navigator.clipboard.writeText(pixData.qr_code)}
                                className="w-full bg-black/40 hover:bg-black/60 text-slate-200 py-3 px-4 rounded border border-white/10 flex items-center justify-center gap-2 transition-all group"
                            >
                                <Copy size={16} className="text-[#d4af37] group-hover:scale-110 transition-transform" /> Copiar Código PIX
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aguardando confirmação...
                        </div>
                    </div>
                )}
            </div>

            {/* Order Bumps */}
            <div className="pt-6 border-t border-white/10">
                <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Gift size={18} className="text-rs-gold" /> Aproveite também:</h4>
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
                                    {isSelected && <CheckCircle size={14} />}
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
            </div>

            <div className="pt-4">
                <button onClick={onComplete} className="w-full btn-secondary py-3 text-slate-400 hover:text-white">Pular ofertas e Finalizar</button>
            </div>
        </div>
    );
};

const StepUpsell = ({ onAccept, onDecline }: any) => {
    const offer = MOCK_UPSELLS[0];
    return (
        <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full py-10">
            <h2 className="text-3xl font-extrabold text-white mb-2 max-w-lg">
                Seu pedido foi aprovado!
            </h2>
            <div className="bg-gradient-to-br from-rs-card to-rs-dark p-6 rounded-2xl border border-rs-gold shadow-2xl max-w-md w-full mb-8 relative overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-2">{offer.name}</h3>
                <button onClick={onAccept} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg text-lg flex items-center justify-center gap-2 mb-3 transition-colors shadow-lg shadow-emerald-500/20">
                    <Plus size={20} /> Adicionar ao meu pedido
                </button>
            </div>
        </div>
    );
};
