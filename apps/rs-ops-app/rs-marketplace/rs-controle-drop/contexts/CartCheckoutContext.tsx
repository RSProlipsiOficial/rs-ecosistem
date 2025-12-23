
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Cart, Checkout, CartStatus, CheckoutStatus, User, CheckoutFunnelStep, AbandonmentLog, RecoveryStatus, Customer, CartItem, CustomerConsents, MarketingOffer } from '../types';

// --- MOCK INITIAL DATA ---
const now = new Date();
const oneMinAgo = new Date(now.getTime() - 1 * 60 * 1000).toISOString();
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

const INITIAL_CARTS: Cart[] = [
    {
        id: 'cart-1', userId: 'logista1', status: 'aberto',
        items: [{ id: 'ci1', productId: '1', productName: 'Inflamax Pro 60 Caps', quantity: 1, unitPrice: 197.00 }],
        createdAt: now.toISOString(), updatedAt: now.toISOString(), utmSource: 'facebook', utmCampaign: 'black_friday'
    },
    {
        id: 'cart-2', userId: 'logista2', status: 'abandonado',
        items: [{ id: 'ci2', productId: '3', productName: 'Ultra Vision 30ml', quantity: 2, unitPrice: 149.00 }],
        createdAt: thirtyMinAgo, updatedAt: thirtyMinAgo, utmSource: 'google', utmCampaign: 'remarketing'
    },
    {
        id: 'cart-3', userId: 'logista1', status: 'convertido',
        items: [{ id: 'ci3', productId: '2', productName: 'Pro3+ Joint Relief', quantity: 1, unitPrice: 249.00 }],
        createdAt: tenMinAgo, updatedAt: tenMinAgo, utmSource: 'instagram', utmCampaign: 'stories'
    }
];

const INITIAL_CHECKOUTS: Checkout[] = [
    {
        id: 'chk-1', cartId: 'cart-3', userId: 'logista1', status: 'concluido',
        customerInfo: { name: 'Roberto Silva' }, shippingInfo: { method: 'SEDEX', cost: 25.00 },
        paymentInfo: { method: 'Cartão de Crédito', status: 'paid' }, total: 222.00,
        consents: { transactional: true, marketing: true },
        createdAt: tenMinAgo, updatedAt: tenMinAgo, utmSource: 'facebook', currentStep: 'pagamento'
    },
    {
        id: 'chk-2', cartId: 'cart-4', userId: 'logista2', status: 'abandonado',
        customerInfo: { name: 'Ana Souza', phone: '21988888888' }, shippingInfo: {},
        paymentInfo: { method: 'PIX' }, total: 249.00,
        consents: { transactional: true, marketing: false },
        createdAt: thirtyMinAgo, updatedAt: thirtyMinAgo, utmSource: 'google', currentStep: 'dados_pessoais'
    },
    {
        id: 'chk-3', cartId: 'cart-5', userId: 'logista2', status: 'em_andamento',
        customerInfo: { name: 'Bruno Lima', phone: '11977777777' }, shippingInfo: { method: 'Jadlog', cost: 18.00 },
        paymentInfo: {}, total: 167.00,
        consents: { transactional: true, marketing: true },
        createdAt: now.toISOString(), updatedAt: now.toISOString(), utmSource: 'tiktok', currentStep: 'endereco_frete'
    },
];

const INITIAL_ABANDONMENT_LOGS: AbandonmentLog[] = [
    {
        id: 'log-1', referenceId: 'cart-2', type: 'CART_ABANDONED', recoveryStatus: 'pendente', funnelStep: 'carrinho',
        utmSource: 'google', utmCampaign: 'remarketing', value: 298.00, abandonedAt: thirtyMinAgo,
        itemsSummary: [{ name: 'Ultra Vision 30ml', quantity: 2 }]
    },
    {
        id: 'log-2', referenceId: 'chk-2', type: 'CHECKOUT_ABANDONED', recoveryStatus: 'em_contato', funnelStep: 'dados_pessoais',
        customerName: 'Ana Souza', contact: '21988888888', consents: { transactional: true, marketing: false },
        utmSource: 'google', value: 249.00, abandonedAt: thirtyMinAgo,
        itemsSummary: [{ name: 'Pro3+ Joint Relief', quantity: 1 }], notes: "Cliente visualizou o WhatsApp mas não respondeu."
    }
];

interface CartCheckoutContextType {
    carts: Cart[];
    checkouts: Checkout[];
    abandonmentLogs: AbandonmentLog[];
    interactWithCart: (cartId: string) => void;
    interactWithCheckout: (checkoutId: string, nextStep?: CheckoutFunnelStep) => void;
    updateAbandonmentLog: (logId: string, updates: Partial<Pick<AbandonmentLog, 'recoveryStatus' | 'notes'>>) => void;
    startCheckout: (cartId: string, customerInfo: { name: string; email: string; phone: string; }, consents: CustomerConsents) => string | undefined;
    updateCartItemQuantity: (cartId: string, itemId: string, quantity: number) => void;
    removeCartItem: (cartId: string, itemId: string) => void;
    updateCheckoutDetails: (checkoutId: string, details: Partial<Pick<Checkout, 'customerInfo' | 'shippingInfo' | 'paymentInfo'>>, nextStep: CheckoutFunnelStep) => void;
    completeCheckout: (checkoutId: string) => void;
    addOfferToCheckout: (checkoutId: string, offer: MarketingOffer) => void;
}

const CartCheckoutContext = createContext<CartCheckoutContextType | undefined>(undefined);

interface CartCheckoutProviderProps {
    children: React.ReactNode;
    currentUser: User;
}

// Timeout durations in ms for demonstration
const CART_ABANDON_TIMEOUT = 30 * 1000; // 30 seconds
const CHECKOUT_ABANDON_TIMEOUT = 60 * 1000; // 60 seconds

export const CartCheckoutProvider: React.FC<CartCheckoutProviderProps> = ({ children, currentUser }) => {
    const [carts, setCarts] = useState<Cart[]>(INITIAL_CARTS);
    const [checkouts, setCheckouts] = useState<Checkout[]>(INITIAL_CHECKOUTS);
    const [abandonmentLogs, setAbandonmentLogs] = useState<AbandonmentLog[]>(INITIAL_ABANDONMENT_LOGS);
    
    const cartsRef = useRef(carts);
    useEffect(() => { cartsRef.current = carts; }, [carts]);
    
    const checkoutsRef = useRef(checkouts);
    useEffect(() => { checkoutsRef.current = checkouts; }, [checkouts]);

    const abandonmentLogsRef = useRef(abandonmentLogs);
    useEffect(() => { abandonmentLogsRef.current = abandonmentLogs; }, [abandonmentLogs]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentTime = Date.now();
            const newLogs: AbandonmentLog[] = [];
            let cartsChanged = false;
            let checkoutsChanged = false;

            const nextCarts = cartsRef.current.map(cart => {
                if (['aberto', 'atualizado'].includes(cart.status) && (currentTime - new Date(cart.updatedAt).getTime() > CART_ABANDON_TIMEOUT)) {
                    cartsChanged = true;
                    const logExists = abandonmentLogsRef.current.some(log => log.referenceId === cart.id);
                    if (!logExists) {
                        newLogs.push({
                            id: crypto.randomUUID(),
                            referenceId: cart.id,
                            type: 'CART_ABANDONED',
                            recoveryStatus: 'pendente',
                            funnelStep: 'carrinho',
                            utmSource: cart.utmSource,
                            utmCampaign: cart.utmCampaign,
                            value: cart.items.reduce((a, b) => a + b.unitPrice * b.quantity, 0),
                            itemsSummary: cart.items.map(i => ({ name: i.productName, quantity: i.quantity })),
                            abandonedAt: new Date().toISOString(),
                        });
                    }
                    return { ...cart, status: 'abandonado' as CartStatus };
                }
                return cart;
            });

            const nextCheckouts = checkoutsRef.current.map(checkout => {
                if (['iniciado', 'em_andamento'].includes(checkout.status) && (currentTime - new Date(checkout.updatedAt).getTime() > CHECKOUT_ABANDON_TIMEOUT)) {
                    checkoutsChanged = true;
                    const logExists = abandonmentLogsRef.current.some(log => log.referenceId === checkout.id);
                    if (!logExists) {
                        const relatedCart = cartsRef.current.find(c => c.id === checkout.cartId);
                        newLogs.push({
                            id: crypto.randomUUID(),
                            referenceId: checkout.id,
                            type: 'CHECKOUT_ABANDONED',
                            recoveryStatus: 'pendente',
                            funnelStep: checkout.currentStep || 'iniciado',
                            customerName: checkout.customerInfo.name,
                            contact: checkout.customerInfo.phone || checkout.customerInfo.email,
                            consents: checkout.consents,
                            utmSource: checkout.utmSource,
                            utmCampaign: checkout.utmCampaign,
                            value: checkout.total,
                            itemsSummary: relatedCart?.items.map(i => ({ name: i.productName, quantity: i.quantity })) || [],
                            abandonedAt: new Date().toISOString(),
                        });
                    }
                    return { ...checkout, status: 'abandonado' as CheckoutStatus };
                }
                return checkout;
            });

            if (cartsChanged) setCarts(nextCarts);
            if (checkoutsChanged) setCheckouts(nextCheckouts);
            if (newLogs.length > 0) setAbandonmentLogs(prev => [...prev, ...newLogs]);
            
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const interactWithCart = (cartId: string) => {
        setCarts(prev => prev.map(c => 
            c.id === cartId 
            ? { ...c, updatedAt: new Date().toISOString(), status: c.status === 'aberto' ? 'atualizado' : c.status } 
            : c
        ));
    };

    const interactWithCheckout = (checkoutId: string, nextStep?: CheckoutFunnelStep) => {
        setCheckouts(prev => prev.map(c => {
            if (c.id === checkoutId) {
                const updatedCheckout = { ...c, status: 'em_andamento' as CheckoutStatus, updatedAt: new Date().toISOString() };
                if (nextStep) {
                    updatedCheckout.currentStep = nextStep;
                }
                return updatedCheckout;
            }
            return c;
        }));
    };

    const updateAbandonmentLog = (logId: string, updates: Partial<Pick<AbandonmentLog, 'recoveryStatus' | 'notes'>>) => {
        setAbandonmentLogs(prev => prev.map(log => 
            log.id === logId ? { ...log, ...updates } : log
        ));
    };

    const startCheckout = (cartId: string, customerInfo: { name: string; email: string; phone: string; }, consents: CustomerConsents) => {
        const cart = carts.find(c => c.id === cartId);
        if (!cart || !['aberto', 'atualizado'].includes(cart.status)) {
            console.error("Carrinho não encontrado ou em estado inválido para iniciar o checkout.");
            return undefined;
        }

        const newCheckoutId = `chk-${crypto.randomUUID().slice(0, 8)}`;
        const newCheckout: Checkout = {
            id: newCheckoutId,
            cartId: cart.id,
            userId: cart.userId,
            status: 'iniciado',
            customerInfo: { ...customerInfo },
            consents: consents,
            shippingInfo: {}, paymentInfo: {},
            currentStep: 'dados_pessoais',
            acceptedOffers: [],
            total: cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            utmSource: cart.utmSource,
            utmCampaign: cart.utmCampaign,
        };

        setCheckouts(prev => [newCheckout, ...prev]);
        setCarts(prev => prev.map(c => c.id === cartId ? { ...c, status: 'convertido' } : c));
        
        return newCheckoutId;
    };
    
    const updateCartItemQuantity = (cartId: string, itemId: string, quantity: number) => {
        setCarts(prev => prev.map(c => {
            if (c.id === cartId) {
                const updatedItems = quantity > 0
                    ? c.items.map(item => item.id === itemId ? { ...item, quantity } : item)
                    : c.items.filter(item => item.id !== itemId);
                return { ...c, items: updatedItems, updatedAt: new Date().toISOString(), status: 'atualizado' as CartStatus };
            }
            return c;
        }));
    };

    const removeCartItem = (cartId: string, itemId: string) => {
        updateCartItemQuantity(cartId, itemId, 0);
    };

    const updateCheckoutDetails = (checkoutId: string, details: Partial<Pick<Checkout, 'customerInfo' | 'shippingInfo' | 'paymentInfo'>>, nextStep: CheckoutFunnelStep) => {
        setCheckouts(prev => prev.map(c => 
            c.id === checkoutId 
            ? { 
                ...c, 
                ...details, 
                status: 'em_andamento' as CheckoutStatus,
                currentStep: nextStep,
                updatedAt: new Date().toISOString() 
              } 
            : c
        ));
    };

    const completeCheckout = (checkoutId: string) => {
        setCheckouts(prev => prev.map(c => 
            c.id === checkoutId 
            ? { ...c, status: 'concluido' as CheckoutStatus, currentStep: 'concluido', updatedAt: new Date().toISOString() }
            : c
        ));
    };

    const addOfferToCheckout = (checkoutId: string, offer: MarketingOffer) => {
        setCheckouts(prev => prev.map(c => {
            if (c.id === checkoutId) {
                const alreadyAccepted = c.acceptedOffers?.some(o => o.id === offer.id);
                if (alreadyAccepted) return c;

                const newAccepted = [...(c.acceptedOffers || []), offer];
                const newTotal = c.total + offer.price;
                return { 
                    ...c, 
                    acceptedOffers: newAccepted, 
                    total: newTotal,
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        }));
    };

    const value = { carts, checkouts, abandonmentLogs, interactWithCart, interactWithCheckout, updateAbandonmentLog, startCheckout, updateCartItemQuantity, removeCartItem, updateCheckoutDetails, completeCheckout, addOfferToCheckout };

    return (
        <CartCheckoutContext.Provider value={value}>
            {children}
        </CartCheckoutContext.Provider>
    );
};

export const useCartCheckout = () => {
    const context = useContext(CartCheckoutContext);
    if (context === undefined) {
        throw new Error('useCartCheckout must be used within a CartCheckoutProvider');
    }
    return context;
};
