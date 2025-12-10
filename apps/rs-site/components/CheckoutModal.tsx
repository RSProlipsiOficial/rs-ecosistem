import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useOffers } from '../context/OffersContext';
import { useProductContext } from '../context/ProductContext';
import { useOrders } from '../context/OrdersContext';
import { CheckoutFormData, CartItem, Offer } from '../types';
import { CloseIcon } from './Icons';

const initialFormData: CheckoutFormData = {
  fullName: '', email: '', cpf: '', phone: '',
  zipCode: '', street: '', number: '', complement: '',
  neighborhood: '', city: '', state: '',
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Mask functions
const formatCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
};

const formatPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
};

type PaymentMethod = 'CREDIT_CARD' | 'BOLETO' | 'PIX';
type Step = 'form' | 'processing' | 'upsell' | 'complete';

const PaymentMethodButton: React.FC<{ label: string, value: PaymentMethod, selected: PaymentMethod, onSelect: (method: PaymentMethod) => void }> = ({ label, value, selected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(value)}
        className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${selected === value ? 'bg-accent/10 border-accent' : 'bg-surface border-border hover:border-gray-600'}`}
    >
        <span className="font-semibold">{label}</span>
    </button>
);

const CheckoutModal: React.FC = () => {
    const { isCheckoutOpen, closeCheckout, cartItems, subtotal, totalShipping, discount, totalPrice, clearCart } = useCart();
    const { products } = useProductContext();
    const { offers } = useOffers();
    const { addOrder } = useOrders();

    const [step, setStep] = useState<Step>('form');
    const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
    const [orderBumpAdded, setOrderBumpAdded] = useState(false);
    
    const [finalOrderDetails, setFinalOrderDetails] = useState<{
        formData: CheckoutFormData;
        cartItems: CartItem[];
        subtotal: number;
        totalShipping: number;
        discount: number;
        totalPrice: number;
        orderBumpItem?: CartItem;
        upsellItem?: CartItem;
    } | null>(null);

    const findOffer = (type: 'order_bump' | 'upsell'): Offer | null => {
        const activeOffers = offers.filter(o => o.isActive && o.type === type);
        for (const offer of activeOffers) {
            const isTriggered = offer.triggerProductIds.some(triggerId => 
                cartItems.some(item => item.product.id === triggerId)
            );
            const isOfferAlreadyInCart = cartItems.some(item => item.product.id === offer.offerProductId);
            
            if (isTriggered && !isOfferAlreadyInCart) {
                return offer;
            }
        }
        return null;
    };
    
    const orderBumpOffer = useMemo(() => findOffer('order_bump'), [offers, cartItems]);
    const upsellOffer = useMemo(() => findOffer('upsell'), [offers, cartItems]);


    const orderBumpItem: CartItem | undefined = useMemo(() => {
        if (!orderBumpOffer) return undefined;
        const offerProduct = products.find(p => p.id === orderBumpOffer.offerProductId);
        if (offerProduct && offerProduct.variants[0]) {
             const price = offerProduct.variants[0].price * (1 - (orderBumpOffer.discountPercentage / 100));
             const bumpedVariant = { ...offerProduct.variants[0], price: price };
             return { product: offerProduct, variant: bumpedVariant, quantity: 1, shippingCost: 0 };
        }
        return undefined;
    }, [orderBumpOffer, products]);

    const displaySubtotal = subtotal + (orderBumpAdded && orderBumpItem ? orderBumpItem.variant.price : 0);
    const displayTotalPrice = totalPrice + (orderBumpAdded && orderBumpItem ? orderBumpItem.variant.price : 0);

    useEffect(() => {
        if (isCheckoutOpen) {
            setStep('form');
            setFormData(initialFormData);
            setIsProcessing(false);
            setOrderBumpAdded(false);
            setFinalOrderDetails(null);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isCheckoutOpen]);

    useEffect(() => {
        const cep = formData.zipCode.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        setFormData(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }));
                    }
                })
                .catch(err => console.error("CEP lookup failed:", err));
        }
    }, [formData.zipCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'cpf') formattedValue = formatCPF(value);
        if (name === 'phone') formattedValue = formatPhone(value);
        if (name === 'zipCode') formattedValue = value.replace(/\D/g, '').substring(0, 8);
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name as keyof CheckoutFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Nome é obrigatório";
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email inválido";
        if (formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = "CPF inválido";
        if (!formData.zipCode.trim() || formData.zipCode.length !== 8) newErrors.zipCode = "CEP inválido";
        if (!formData.street.trim()) newErrors.street = "Rua é obrigatória";
        if (!formData.number.trim()) newErrors.number = "Número é obrigatório";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsProcessing(true);
        setStep('processing');
        
        setTimeout(() => {
            const currentCartItems = [...cartItems];
            if (orderBumpAdded && orderBumpItem) {
                currentCartItems.push(orderBumpItem);
            }
    
            const orderDetails = { // This is Omit<Order, 'id' | 'orderDate'>
                customer: formData,
                items: currentCartItems,
                subtotal: displaySubtotal,
                shipping: totalShipping,
                discount,
                total: displayTotalPrice,
                paymentStatus: 'pending' as const,
            };
    
            setFinalOrderDetails({ // This is just for the UI state of the modal
                formData,
                cartItems: currentCartItems,
                subtotal: displaySubtotal,
                totalShipping,
                discount,
                totalPrice: displayTotalPrice,
                orderBumpItem: orderBumpAdded ? orderBumpItem : undefined,
            });
    
            if (upsellOffer) {
                setStep('upsell');
            } else {
                addOrder(orderDetails);
                setStep('complete');
                clearCart();
            }
            setIsProcessing(false);
        }, 2000);
    };
    
    const handleUpsellDecision = (accepted: boolean) => {
        const baseOrder = {
            customer: finalOrderDetails!.formData,
            items: [...finalOrderDetails!.cartItems],
            subtotal: finalOrderDetails!.subtotal,
            shipping: finalOrderDetails!.totalShipping,
            discount: finalOrderDetails!.discount,
            total: finalOrderDetails!.totalPrice,
            paymentStatus: 'pending' as const,
        };
        
        let displayDetails = { ...finalOrderDetails! }; // For the UI
    
        if (accepted && upsellOffer) {
            const offerProduct = products.find(p => p.id === upsellOffer.offerProductId);
            if (offerProduct && offerProduct.variants[0]) {
                const price = offerProduct.variants[0].price * (1 - (upsellOffer.discountPercentage / 100));
                const upsellVariant = { ...offerProduct.variants[0], price };
                const upsellCartItem: CartItem = { product: offerProduct, variant: upsellVariant, quantity: 1, shippingCost: 0 };
                
                baseOrder.items.push(upsellCartItem);
                baseOrder.total += upsellCartItem.variant.price;
                baseOrder.subtotal += upsellCartItem.variant.price;
                
                displayDetails.cartItems.push(upsellCartItem);
                displayDetails.totalPrice = baseOrder.total;
                displayDetails.upsellItem = upsellCartItem;
            }
        }
        
        addOrder(baseOrder);
        setFinalOrderDetails(displayDetails);
        setStep('complete');
        clearCart();
    };
    
    if (!isCheckoutOpen) return null;

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col lg:flex-row overflow-hidden">
            <div className="lg:w-3/5 p-6 overflow-y-auto space-y-8">
                <Section title="1. Seus Dados">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required />
                        <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                        <FormInput label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} maxLength={14} error={errors.cpf} required />
                        <FormInput label="WhatsApp / Celular" name="phone" type="tel" value={formData.phone} onChange={handleChange} maxLength={15} required />
                    </div>
                </Section>
                <Section title="2. Endereço de Entrega">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1"><FormInput label="CEP" name="zipCode" value={formData.zipCode} onChange={handleChange} maxLength={8} error={errors.zipCode} required /></div>
                        <div className="sm:col-span-2"><FormInput label="Rua" name="street" value={formData.street} onChange={handleChange} error={errors.street} required /></div>
                        <div className="sm:col-span-1"><FormInput label="Número" name="number" value={formData.number} onChange={handleChange} error={errors.number} required /></div>
                        <div className="sm:col-span-2"><FormInput label="Complemento" name="complement" value={formData.complement} onChange={handleChange} /></div>
                        <FormInput label="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
                        <FormInput label="Cidade" name="city" value={formData.city} onChange={handleChange} required />
                        <FormInput label="Estado" name="state" value={formData.state} onChange={handleChange} maxLength={2} required />
                    </div>
                </Section>
                <Section title="3. Pagamento">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <PaymentMethodButton label="Cartão de Crédito" value="CREDIT_CARD" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                        <PaymentMethodButton label="PIX" value="PIX" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                        <PaymentMethodButton label="Boleto" value="BOLETO" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                    </div>
                    <div className="p-4 bg-surface rounded-md border border-border text-center mt-4">
                        <p className="text-text-secondary">Ao clicar em "Pagar com Segurança", você será direcionado para um ambiente seguro para concluir sua compra.</p>
                    </div>
                </Section>
            </div>

            <aside className="lg:w-2/5 bg-surface p-6 border-l border-border flex flex-col">
                <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-2">Resumo do Pedido</h3>
                <div className="flex-grow space-y-3 overflow-y-auto">
                    {cartItems.map(item => (
                        <div key={`${item.product.id}-${item.variant.id}`} className="flex items-center space-x-3">
                            <img src={item.product.imageUrls[0]} alt="" className="w-16 h-16 object-cover rounded-md bg-gray-700" />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm">{item.product.translations.pt.name}</p>
                                <p className="text-xs text-text-secondary">{item.variant.name} (x{item.quantity})</p>
                            </div>
                            <span className="text-sm font-semibold">{formatCurrency(item.variant.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                {orderBumpOffer && orderBumpItem && (
                    <div className="my-4 p-4 border-2 border-dashed border-accent rounded-lg bg-accent/10 animate-fade-in">
                        <h4 className="font-bold text-accent text-center text-lg mb-2">{orderBumpOffer.headline}</h4>
                        <div className="flex items-center gap-4">
                            <img src={orderBumpOffer.imageUrl} alt={orderBumpItem.product.translations.pt.name} className="w-20 h-20 object-cover rounded-md" />
                            <div>
                                <p className="font-semibold text-text-primary">{orderBumpOffer.description}</p>
                                <p className="text-sm text-text-secondary">Apenas {formatCurrency(orderBumpItem.variant.price)}</p>
                            </div>
                        </div>
                        <label className="flex items-center gap-3 mt-4 p-3 bg-background/50 rounded-md cursor-pointer hover:bg-background">
                            <input type="checkbox" checked={orderBumpAdded} onChange={(e) => setOrderBumpAdded(e.target.checked)} className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent" />
                            <span className="text-sm font-semibold text-text-primary">Sim, quero aproveitar esta oferta!</span>
                        </label>
                    </div>
                )}

                <div className="flex-shrink-0 pt-4 border-t border-border space-y-4">
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatCurrency(displaySubtotal)}</span></div>
                        <div className="flex justify-between text-text-secondary"><span>Frete</span><span>{formatCurrency(totalShipping)}</span></div>
                        {discount > 0 && <div className="flex justify-between text-green-400"><span>Desconto</span><span>- {formatCurrency(discount)}</span></div>}
                        <div className="flex justify-between text-lg font-bold text-text-primary mt-2"><span>Total</span><span>{formatCurrency(displayTotalPrice)}</span></div>
                    </div>
                    <button type="submit" disabled={isProcessing} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait">
                        {isProcessing ? 'Processando...' : `Pagar ${formatCurrency(displayTotalPrice)}`}
                    </button>
                </div>
            </aside>
        </form>
    );

    const renderProcessing = () => (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-2xl font-bold text-accent mb-4">Processando seu pedido...</h3>
            <p className="text-text-secondary">Por favor, aguarde. Estamos finalizando sua compra.</p>
        </div>
    );
    
    const renderUpsell = () => {
        if (!upsellOffer) return renderComplete();
        const offerProduct = products.find(p => p.id === upsellOffer.offerProductId);
        if(!offerProduct) return renderComplete();
        const variant = offerProduct.variants[0];
        const finalPrice = variant.price * (1 - upsellOffer.discountPercentage/100);

        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <h3 className="text-3xl font-bold text-accent mb-2">{upsellOffer.headline}</h3>
                <p className="text-lg text-text-secondary mb-6">{upsellOffer.description}</p>
                
                <div className="max-w-md w-full bg-surface border border-border rounded-lg p-6">
                    <img src={upsellOffer.imageUrl} alt={offerProduct.translations.pt.name} className="w-full h-48 object-cover rounded-md mb-4" />
                    <h4 className="text-xl font-bold">{offerProduct.translations.pt.name}</h4>
                    <p className="text-2xl font-bold text-accent my-2">{formatCurrency(finalPrice)}</p>
                    <button onClick={() => handleUpsellDecision(true)} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 my-4">
                        Sim, Adicionar ao Pedido!
                    </button>
                    <button onClick={() => handleUpsellDecision(false)} className="text-sm text-text-secondary hover:underline">
                        Não, obrigado.
                    </button>
                </div>
            </div>
        );
    };

    const renderComplete = () => {
        if (!finalOrderDetails) return null;

        const allItems = finalOrderDetails.cartItems;
        const finalTotal = finalOrderDetails.totalPrice;

        return (
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden animate-fade-in">
                <div className="lg:w-3/5 p-8 overflow-y-auto space-y-6">
                    <h3 className="text-2xl font-bold text-green-400">Obrigado, {finalOrderDetails.formData.fullName.split(' ')[0]}!</h3>
                    <p className="text-text-secondary">Seu pedido foi confirmado. Enviamos os detalhes para <span className="font-semibold text-text-primary">{finalOrderDetails.formData.email}</span>.</p>
                    
                    <Section title="Informações de Entrega">
                        <div className="text-sm text-text-secondary leading-relaxed">
                            <p>{finalOrderDetails.formData.fullName}</p>
                            <p>{finalOrderDetails.formData.street}, {finalOrderDetails.formData.number} {finalOrderDetails.formData.complement && `- ${finalOrderDetails.formData.complement}`}</p>
                            <p>{finalOrderDetails.formData.neighborhood}, {finalOrderDetails.formData.city} - {finalOrderDetails.formData.state}</p>
                            <p>CEP: {finalOrderDetails.formData.zipCode}</p>
                        </div>
                    </Section>
                    
                    <p className="text-sm text-yellow-400 bg-yellow-900/50 p-3 rounded-md">Nota: A integração de pagamento foi simulada para esta demonstração.</p>

                    <button onClick={closeCheckout} className="mt-8 bg-accent text-button-text font-bold py-3 px-8 rounded-full">Continuar Navegando</button>
                </div>
                <aside className="lg:w-2/5 bg-surface p-6 border-l border-border flex flex-col">
                    <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-2">Extrato do Pedido</h3>
                    <div className="flex-grow space-y-3 overflow-y-auto">
                        {allItems.map((item, index) => (
                            <div key={`${item.product.id}-${item.variant.id}-${index}`} className="flex items-center space-x-3">
                                <img src={item.product.imageUrls[0]} alt="" className="w-16 h-16 object-cover rounded-md bg-gray-700" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{item.product.translations.pt.name}</p>
                                    <p className="text-xs text-text-secondary">{item.variant.name} (x{item.quantity})</p>
                                </div>
                                <span className="text-sm font-semibold">{formatCurrency(item.variant.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 pt-4 border-t border-border space-y-4">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatCurrency(finalOrderDetails.subtotal)}</span></div>
                            <div className="flex justify-between text-text-secondary"><span>Frete</span><span>{formatCurrency(finalOrderDetails.totalShipping)}</span></div>
                            {finalOrderDetails.discount > 0 && <div className="flex justify-between text-green-400"><span>Desconto</span><span>- {formatCurrency(finalOrderDetails.discount)}</span></div>}
                            <div className="flex justify-between text-xl font-bold text-text-primary mt-2"><span>TOTAL PAGO</span><span>{formatCurrency(finalTotal)}</span></div>
                        </div>
                    </div>
                </aside>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
                <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-accent">Finalizar Compra</h2>
                    <button onClick={closeCheckout} className="text-text-secondary hover:text-text-primary"><CloseIcon/></button>
                </header>

                {step === 'form' && renderForm()}
                {step === 'processing' && renderProcessing()}
                {step === 'upsell' && renderUpsell()}
                {step === 'complete' && renderComplete()}
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

const Section: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
    <section>
        <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-2">{title}</h3>
        {children}
    </section>
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, error, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}{props.required && '*'}</label>
        <input
            id={name}
            name={name}
            {...props}
            className={`w-full bg-surface border rounded-md p-2 text-text-primary focus:ring-accent focus:border-accent ${error ? 'border-red-500' : 'border-border'}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);


export default CheckoutModal;