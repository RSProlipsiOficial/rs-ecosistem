import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, Customer, Distributor, Order, Coupon, OrderBump, OrderBumpRule, Product, OrderItem, PaymentSettings, CheckoutRoutingContext, ProductPricingTier } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { LockIcon } from './icons/LockIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { PixIcon } from './icons/PixIcon';
import { VisaIcon } from './icons/VisaIcon';
import { MastercardIcon } from './icons/MastercardIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TruckIcon } from './icons/TruckIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { TrashIcon } from './icons/TrashIcon';
import { WalletIcon } from './icons/WalletIcon';


interface ShippingOption {
    id: string;
    name: string;
    delivery_time: string;
    price: number;
}

interface ActiveBumpOffer {
    key: string;
    ruleId: string;
    ruleTitle: string;
    ruleDescription: string;
    product: Product;
    offerPrice: number;
}

type CheckoutPaymentMethod = 'wallet' | 'credit-card' | 'pix' | 'boleto';
type ExternalPaymentMethod = Exclude<CheckoutPaymentMethod, 'wallet'>;

interface CheckoutConsultantMatch {
    id: string;
    userId?: string;
    numericId?: string;
    loginId?: string;
    name: string;
    email?: string;
    cpfCnpj?: string;
}

interface CheckoutViewProps {
    cartItems: CartItem[];
    onBack: () => void;
    onFinalizePurchase: (order: Order) => Promise<void> | void;
    logoUrl?: string;
    currentCustomer: Customer | null;
    coupons: Coupon[];
    orderBumpConfig: OrderBump;
    allProducts: Product[];
    paymentSettings: PaymentSettings;
    selectedDistributor?: Distributor | null;
    onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
    onRemoveItem: (cartItemId: string) => void;
    salesRouting: CheckoutRoutingContext;
    onRequestDistributorSelection: () => void;
    onRequestStoreLogin: () => void;
}

const DEFAULT_MARKETPLACE_ORIGIN_ZIP = '83314326';

const DEFAULT_ORDER_BUMP_TITLE = 'SIM, EU QUERO ESTA OFERTA ESPECIAL!';
const SEEDED_ORDER_BUMP_RULES: OrderBumpRule[] = [
    {
        id: 'seed-pro3-inflamaxi',
        name: 'Pro 3+ -> Inflamaxi',
        title: 'SIM, QUERO LEVAR O INFLAMAXI COM DESCONTO',
        description: 'Ao comprar o Pro 3+, adicione Inflamaxi ao pedido com preco especial.',
        triggerProductIds: ['802529e1-ead9-4eef-bf20-4ce63e25ec92'],
        offers: [{ productId: '486f290d-500f-4c1c-8889-f8d2db87c2bc', offerPrice: 99.9 }],
    },
    {
        id: 'seed-alpha-diva',
        name: 'AlphaLipsi -> DivaLipsi',
        title: 'COMBINE COM DIVALIPSI E PAGUE MENOS',
        description: 'Quem leva AlphaLipsi pode incluir DivaLipsi no mesmo pedido com valor promocional.',
        triggerProductIds: ['d8da03a4-d45a-4390-8698-9a35d43647c8'],
        offers: [{ productId: 'b98c42b9-52c5-478e-b172-faee36c6ba2c', offerPrice: 99.9 }],
    },
    {
        id: 'seed-diva-alpha',
        name: 'DivaLipsi -> AlphaLipsi',
        title: 'LEVE TAMBEM O ALPHALIPSI COM DESCONTO',
        description: 'Ao comprar DivaLipsi, ofereca AlphaLipsi como complemento com preco especial.',
        triggerProductIds: ['b98c42b9-52c5-478e-b172-faee36c6ba2c'],
        offers: [{ productId: 'd8da03a4-d45a-4390-8698-9a35d43647c8', offerPrice: 99.9 }],
    },
];

const normalizeOrderBumpRule = (rule: Partial<OrderBumpRule>, config: OrderBump): OrderBumpRule => ({
    id: rule.id || `order-bump-rule-${Math.random().toString(36).slice(2, 8)}`,
    name: rule.name || '',
    title: rule.title || config.title || DEFAULT_ORDER_BUMP_TITLE,
    description: rule.description || config.description || '',
    triggerProductIds: Array.isArray(rule.triggerProductIds) ? Array.from(new Set(rule.triggerProductIds.filter(Boolean).map(String))) : [],
    offers: (Array.isArray(rule.offers) ? rule.offers : [])
        .filter((offer) => offer?.productId)
        .map((offer) => ({
            productId: String(offer.productId),
            offerPrice: Number(offer.offerPrice || 0),
        })),
});

const normalizeOrderBumpConfig = (config: OrderBump) => {
    const legacyOffers = Array.isArray(config.offers) && config.offers.length > 0
        ? config.offers
        : (config.productId ? [{ productId: config.productId, offerPrice: Number(config.offerPrice || 0) }] : []);

    const hasLegacyRuleData = Boolean(
        legacyOffers.length > 0 ||
        (config.triggerProductIds || []).length > 0
    );

    const rules = Array.isArray(config.rules) && config.rules.length > 0
        ? config.rules.map((rule) => normalizeOrderBumpRule(rule, config))
        : (String(config.productId || '') === '3'
            ? SEEDED_ORDER_BUMP_RULES.map((rule) => normalizeOrderBumpRule(rule, config))
        : (hasLegacyRuleData
            ? [normalizeOrderBumpRule({
                id: 'legacy-order-bump',
                name: config.title || 'Oferta principal',
                title: config.title || DEFAULT_ORDER_BUMP_TITLE,
                description: config.description || '',
                triggerProductIds: config.triggerProductIds || [],
                offers: legacyOffers,
            }, config)]
            : []));

    const firstRule = rules[0];

    return {
        ...config,
        title: firstRule?.title || config.title || DEFAULT_ORDER_BUMP_TITLE,
        description: firstRule?.description || config.description || '',
        triggerProductIds: firstRule?.triggerProductIds || [],
        offers: firstRule?.offers || [],
        rules,
    };
};

const CheckoutView: React.FC<CheckoutViewProps> = ({ cartItems = [], onBack, onFinalizePurchase, logoUrl, currentCustomer, coupons, orderBumpConfig, allProducts, paymentSettings, selectedDistributor = null, onUpdateQuantity, onRemoveItem, salesRouting, onRequestDistributorSelection, onRequestStoreLogin }) => {
    const cartSubtotal = useMemo(() => (cartItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const TENANT_ID = (import.meta as any).env?.VITE_TENANT_ID || '';
    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const paymentGatewayAvailable = paymentSettings?.mercadoPago?.enabled !== false;

    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState({
        email: currentCustomer?.email || '',
        customerName: currentCustomer?.name || '',
        customerCpf: '',
        customerPhone: '',
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    });
    const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
    const [identifiedConsultant, setIdentifiedConsultant] = useState<CheckoutConsultantMatch | null>(null);
    const [isCheckingConsultant, setIsCheckingConsultant] = useState(false);
    const [consultantLookupMessage, setConsultantLookupMessage] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    const [isCepLoading, setIsCepLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

    const [selectedBumpOfferKeys, setSelectedBumpOfferKeys] = useState<string[]>([]);
    const [activePaymentMethod, setActivePaymentMethod] = useState<CheckoutPaymentMethod>('credit-card');
    const [useWalletBalance, setUseWalletBalance] = useState(false);
    const [secondaryHybridMethod, setSecondaryHybridMethod] = useState<ExternalPaymentMethod>('pix');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loadingWallet, setLoadingWallet] = useState(false);

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [pixData, setPixData] = useState<{ qrCodeUrl: string; copyPaste: string } | null>(null);
    const [pixCodeCopied, setPixCodeCopied] = useState(false);

    const normalizedOrderBump = useMemo(() => normalizeOrderBumpConfig(orderBumpConfig), [orderBumpConfig]);
    const cartProductIds = useMemo(() => cartItems.map(item => item.productId), [cartItems]);
    const activeOrderBumpRules = useMemo(() => {
        if (!normalizedOrderBump.enabled) return [];

        return (normalizedOrderBump.rules || []).filter((rule) => {
            if ((rule.triggerProductIds || []).length === 0) return true;
            return cartProductIds.some((productId) => (rule.triggerProductIds || []).includes(productId));
        });
    }, [normalizedOrderBump, cartProductIds]);
    const bumpOffers = useMemo(() => {
        if (activeOrderBumpRules.length === 0) return [];

        const itemsInCart = new Set(cartItems.map((item) => item.productId));

        return activeOrderBumpRules.flatMap((rule) =>
            (rule.offers || [])
                .map((offer): ActiveBumpOffer | null => {
                    const product = allProducts.find((candidate) => candidate.id === offer.productId);
                    if (!product || itemsInCart.has(product.id)) return null;

                    return {
                        key: `${rule.id}:${product.id}`,
                        ruleId: rule.id,
                        ruleTitle: rule.title,
                        ruleDescription: rule.description,
                        product,
                        offerPrice: Number(offer.offerPrice || 0),
                    };
                })
                .filter(Boolean) as ActiveBumpOffer[]
        );
    }, [activeOrderBumpRules, allProducts, cartItems]);
    const selectedBumpOffers = useMemo(() => {
        const selectedKeys = new Set(selectedBumpOfferKeys);
        return bumpOffers.filter((item) => selectedKeys.has(item.key));
    }, [bumpOffers, selectedBumpOfferKeys]);
    const bumpOffersByRule = useMemo(() => {
        const grouped = new Map<string, { title: string; description: string; items: ActiveBumpOffer[] }>();

        bumpOffers.forEach((item) => {
            const current = grouped.get(item.ruleId) || {
                title: item.ruleTitle,
                description: item.ruleDescription,
                items: [],
            };

            current.items.push(item);
            grouped.set(item.ruleId, current);
        });

        return Array.from(grouped.entries()).map(([ruleId, group]) => ({
            ruleId,
            ...group,
        }));
    }, [bumpOffers]);
    const bumpPrice = useMemo(
        () => selectedBumpOffers.reduce((sum, item) => sum + Number(item.offerPrice || 0), 0),
        [selectedBumpOffers]
    );
    const normalizeText = (value: any) => String(value || '').trim().toLowerCase();
    const normalizeDigits = (value: any) => String(value || '').replace(/\D/g, '');
    const isReferralCheckout = salesRouting.mode === 'referral';
    const allowPickupShipping = salesRouting.fulfillmentOriginType === 'cd';
    const consultantPricingUnlocked = !isReferralCheckout && Boolean(identifiedConsultant || salesRouting.buyerType === 'consultor');
    const effectiveCartItems = useMemo(() => (
        cartItems.map((item) => {
            if (!consultantPricingUnlocked) return item;
            const consultantPrice = Number(item.consultantPrice || 0);
            const retailPrice = Number(item.retailPrice || item.price || 0);

            if (!consultantPrice || consultantPrice <= 0) return item;
            if (retailPrice > 0 && consultantPrice >= retailPrice) return item;

            return {
                ...item,
                price: consultantPrice,
                pricingTier: 'consultant' as ProductPricingTier
            };
        })
    ), [cartItems, consultantPricingUnlocked]);
    const subtotal = useMemo(
        () => (effectiveCartItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0),
        [effectiveCartItems]
    );
    const shippingCost = selectedShipping?.price ?? 0;

    const fetchConsultantMatches = async (query: string) => {
        const cleanQuery = String(query || '').trim();
        if (!cleanQuery) return [];

        const response = await fetch(`${API_URL}/admin/consultor/search?q=${encodeURIComponent(cleanQuery)}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
            }
        });

        if (!response.ok) {
            throw new Error(`Falha ao consultar cadastro (${response.status})`);
        }

        const data = await response.json();
        return Array.isArray(data.results) ? data.results : [];
    };

    const resolveCheckoutConsultant = async (silent = false) => {
        if (isReferralCheckout) {
            setIdentifiedConsultant(null);
            if (!silent) {
                setConsultantLookupMessage('Venda por indicacao utiliza preco publico. O consultor do link recebe a atribuicao da venda, sem desconto no checkout.');
            }
            return null;
        }

        const email = normalizeText(formData.email || currentCustomer?.email);
        const cpf = normalizeDigits(formData.customerCpf);

        if (!email && cpf.length < 11) {
            setIdentifiedConsultant(null);
            if (!silent) setConsultantLookupMessage('');
            return null;
        }

        setIsCheckingConsultant(true);
        try {
            const [emailResults, cpfResults] = await Promise.all([
                email ? fetchConsultantMatches(email) : Promise.resolve([]),
                cpf.length >= 11 ? fetchConsultantMatches(cpf) : Promise.resolve([])
            ]);

            const candidates = [...emailResults, ...cpfResults].reduce<any[]>((acc, row) => {
                if (!row?.id || acc.some((item) => item.id === row.id)) return acc;
                acc.push(row);
                return acc;
            }, []);

            const match = candidates.find((row) => {
                const rowEmail = normalizeText(row.email);
                const rowCpf = normalizeDigits(row.cpfCnpj);

                if (email && cpf.length >= 11) return rowEmail === email && rowCpf === cpf;
                if (email) return rowEmail === email;
                if (cpf.length >= 11) return rowCpf === cpf;
                return false;
            }) || null;

            if (match) {
                const resolvedMatch: CheckoutConsultantMatch = {
                    id: String(match.id),
                    userId: String(match.userId || match.id || ''),
                    numericId: String(match.numericId || ''),
                    loginId: String(match.loginId || ''),
                    name: String(match.nome || match.name || 'Consultor'),
                    email: String(match.email || ''),
                    cpfCnpj: String(match.cpfCnpj || '')
                };

                setIdentifiedConsultant(resolvedMatch);
                setConsultantLookupMessage('Consultor identificado. Preco consultor aplicado a este pedido.');
                return resolvedMatch;
            }

            setIdentifiedConsultant(null);
            if (!silent && (email || cpf.length >= 11)) {
                setConsultantLookupMessage('Cadastro nao identificado como consultor. O checkout permanece com preco publico.');
            }
            return null;
        } catch (error: any) {
            console.error('[Checkout] Falha ao consultar cadastro de consultor:', error);
            if (!silent) setConsultantLookupMessage(error?.message || 'Nao foi possivel validar o cadastro do consultor agora.');
            return null;
        } finally {
            setIsCheckingConsultant(false);
        }
    };

    useEffect(() => {
        setSelectedBumpOfferKeys((prev) => prev.filter((offerKey) => bumpOffers.some((item) => item.key === offerKey)));
    }, [bumpOffers]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            email: currentCustomer?.email || prev.email,
            customerName: currentCustomer?.name || prev.customerName
        }));
    }, [currentCustomer?.email, currentCustomer?.name]);

    useEffect(() => {
        if (currentCustomer?.email && !isReferralCheckout) {
            void resolveCheckoutConsultant(true);
        }
    }, [currentCustomer?.email, isReferralCheckout]);

    const total = useMemo(() => {
        const newSubtotal = (effectiveCartItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
        const bump = bumpPrice;
        const shipping = selectedShipping?.price ?? 0;

        let calculatedDiscount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'Porcentagem') {
                calculatedDiscount = newSubtotal * (appliedCoupon.value / 100);
            } else {
                calculatedDiscount = appliedCoupon.value;
            }
        }
        setDiscount(calculatedDiscount);

        return newSubtotal + shipping - calculatedDiscount + bump;
    }, [effectiveCartItems, selectedShipping, appliedCoupon, bumpPrice]);

    const walletAuthToken = typeof window !== 'undefined'
        ? (localStorage.getItem('token') || localStorage.getItem('rs-marketplace-sso-token') || '')
        : '';
    const walletSessionEnabled = Boolean(
        currentCustomer?.id &&
        currentCustomer.id !== 'marketplace-session-user' &&
        walletAuthToken
    );
    const walletAppliedAmount = useMemo(() => {
        if (!walletSessionEnabled) return 0;
        if (activePaymentMethod === 'wallet') return Math.min(walletBalance, total);
        if (useWalletBalance) return Math.min(walletBalance, total);
        return 0;
    }, [activePaymentMethod, total, useWalletBalance, walletBalance, walletSessionEnabled]);
    const externalPaymentMethod: ExternalPaymentMethod = activePaymentMethod === 'wallet' ? secondaryHybridMethod : activePaymentMethod;
    const externalPaymentAmount = useMemo(
        () => Math.max(0, Number((total - walletAppliedAmount).toFixed(2))),
        [total, walletAppliedAmount]
    );
    const visiblePaymentMethod = activePaymentMethod === 'wallet' && externalPaymentAmount > 0
        ? secondaryHybridMethod
        : activePaymentMethod;

    const isStep1Valid = formData.customerName && formData.email && formData.customerCpf && formData.customerPhone;
    const isStep2Valid = isStep1Valid && selectedShipping;

    // Carregar saldo da carteira ao entrar na etapa de pagamento
    useEffect(() => {
        if (activeStep === 3 && walletSessionEnabled && currentCustomer && !loadingWallet) {
            const loadWalletBalance = async () => {
                setLoadingWallet(true);
                try {
                    const response = await fetch(`${API_URL}/api/wallet/balance/${currentCustomer.id}`, {
                        headers: {
                            'Authorization': `Bearer ${walletAuthToken}`
                        }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setWalletBalance(data.balance.available);
                    } else {
                        setWalletBalance(0);
                    }
                } catch (error) {
                    console.error('Erro ao carregar saldo:', error);
                    setWalletBalance(0);
                } finally {
                    setLoadingWallet(false);
                }
            };
            loadWalletBalance();
        }
    }, [API_URL, activeStep, currentCustomer, walletSessionEnabled]);

    // Gerar PIX dinamicamente ao entrar na etapa de pagamento
    useEffect(() => {
        if (activeStep === 3 && visiblePaymentMethod === 'pix' && externalPaymentAmount > 0 && !pixData) {
            const generatePix = async () => {
                setIsProcessingPayment(true);
                try {
                    const apiUrl = `${API_URL}/api/payment/pix`;

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            orderId: `order-${Date.now()}`,
                            amount: externalPaymentAmount,
                            buyer: {
                                email: currentCustomer?.email || formData.email,
                                name: currentCustomer?.name || formData.customerName,
                                cpf: formData.customerCpf
                            }
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API erro: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.success) {
                        setPixData({
                            qrCodeUrl: `data:image/png;base64,${data.qr_code_base64}`,
                            copyPaste: data.qr_code,
                        });
                    } else {
                        throw new Error(data.error || 'Erro ao gerar PIX');
                    }
                } catch (error) {
                    console.error('Erro ao gerar PIX:', error);
                    const mockPixCopyPaste = '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substr(2, 9) + '52040000530398654' + String(externalPaymentAmount).padStart(5, '0') + '5802BR5913RS Prolipsi6009SAO PAULO62070503***6304' + Math.random().toString(36).substr(2, 4).toUpperCase();
                    setPixData({
                        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCopyPaste)}`,
                        copyPaste: mockPixCopyPaste,
                    });
                }
                setIsProcessingPayment(false);
            };
            generatePix();
        }
    }, [API_URL, activeStep, currentCustomer, externalPaymentAmount, formData, pixData, visiblePaymentMethod]);

    useEffect(() => {
        setPixData(null);
    }, [externalPaymentAmount, visiblePaymentMethod]);

    useEffect(() => {
        if (!walletSessionEnabled) {
            setUseWalletBalance(false);
        }
    }, [walletSessionEnabled]);

    const handleContinueFromStep1 = async () => {
        if (!isStep1Valid) return;
        await resolveCheckoutConsultant(false);
        setActiveStep(2);
    };

    const processWalletDebit = async (amount: number) => {
        if (amount <= 0) return;
        if (!walletSessionEnabled || !currentCustomer?.id) {
            throw new Error('Para usar saldo da carteira, faca login na loja com sua conta.');
        }

        const response = await fetch(`${API_URL}/api/wallet/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${walletAuthToken}`
            },
            body: JSON.stringify({
                from_user_id: currentCustomer.id,
                to_tenant_id: TENANT_ID,
                amount,
                description: `Compra marketplace ${Date.now()}`
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            throw new Error(data.error || 'Falha ao debitar saldo da carteira');
        }
    };

    const processExternalPayment = async (method: ExternalPaymentMethod, amount: number) => {
        if (amount <= 0) {
            return { paymentStatus: 'Pago' as Order['paymentStatus'], paymentData: {} };
        }

        if (method === 'boleto') {
            try {
                const response = await fetch(`${API_URL}/api/payment/boleto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: `order-${Date.now()}`,
                        amount,
                        buyer: {
                            email: currentCustomer?.email || formData.email,
                            name: currentCustomer?.name || formData.customerName,
                            cpf: formData.customerCpf
                        }
                    })
                });
                const data = await response.json().catch(() => ({}));
                return {
                    paymentStatus: 'Pendente' as Order['paymentStatus'],
                    paymentData: {
                        boletoUrl: data?.boleto_url || data?.external_resource_url || `https://www.mercadopago.com.br/boletos/pdf/${Date.now()}`
                    }
                };
            } catch {
                return {
                    paymentStatus: 'Pendente' as Order['paymentStatus'],
                    paymentData: { boletoUrl: `https://www.mercadopago.com.br/boletos/pdf/${Date.now()}` }
                };
            }
        }

        if (method === 'pix') {
            if (!pixData) {
                throw new Error('Dados do PIX nao foram gerados. Tente novamente.');
            }
            return {
                paymentStatus: 'Pendente' as Order['paymentStatus'],
                paymentData: {
                    pixQrCodeUrl: pixData.qrCodeUrl,
                    pixCopyableCode: pixData.copyPaste
                }
            };
        }

        if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
            throw new Error('Preencha todos os dados do cartao.');
        }

        try {
            const response = await fetch(`${API_URL}/api/payment/card`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: `order-${Date.now()}`,
                    amount,
                    card: {
                        number: cardDetails.number.replace(/\s/g, ''),
                        name: cardDetails.name,
                        expiry: cardDetails.expiry,
                        cvv: cardDetails.cvv
                    },
                    buyer: {
                        email: currentCustomer?.email || formData.email,
                        name: currentCustomer?.name || formData.customerName,
                        cpf: formData.customerCpf
                    }
                })
            });
            const data = await response.json().catch(() => ({}));
            return {
                paymentStatus: data?.success ? 'Pago' as Order['paymentStatus'] : 'Pendente' as Order['paymentStatus'],
                paymentData: {}
            };
        } catch {
            return {
                paymentStatus: 'Pendente' as Order['paymentStatus'],
                paymentData: {}
            };
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const detectCardBrand = (number: string): 'visa' | 'mastercard' | 'unknown' => {
        if (number.startsWith('4')) return 'visa';
        if (number.match(/^5[1-5]/)) return 'mastercard';
        return 'unknown';
    };

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        if (name === 'number') {
            value = value.replace(/\D/g, '').slice(0, 16);
            setCardBrand(detectCardBrand(value));
            value = value.replace(/(.{4})/g, '$1 ').trim();
        }
        if (name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length > 2) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            }
        }
        if (name === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 4);
        }
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const resolveShippingOriginZip = () => {
        const fulfillmentOriginZip = String(salesRouting.fulfillmentOriginZip || '').replace(/\D/g, '');
        if (salesRouting.fulfillmentOriginType === 'seller_store' && fulfillmentOriginZip.length === 8) {
            return fulfillmentOriginZip;
        }
        if (!allowPickupShipping) {
            return DEFAULT_MARKETPLACE_ORIGIN_ZIP;
        }

        const distributorZip = String(
            (selectedDistributor as any)?.address_zip ||
            (selectedDistributor as any)?.zipCode ||
            ''
        ).replace(/\D/g, '');

        if (distributorZip.length === 8) return distributorZip;
        return DEFAULT_MARKETPLACE_ORIGIN_ZIP;
    };

    const fetchShippingOptions = async () => {
        try {
            // Use relative path to leverage Vite proxy to rs-api
            const response = await fetch('/api/shipping/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: {
                        postal_code: resolveShippingOriginZip()
                    },
                    to: {
                        postal_code: formData.zipCode.replace(/\D/g, '')
                    },
                    products: effectiveCartItems.map(item => ({
                        id: item.productId,
                        width: 11,
                        height: 17,
                        length: 11,
                        weight: 0.3,
                        insurance_value: item.price,
                        quantity: item.quantity
                    }))
                })
            });

            const data = await response.json();

            const options: ShippingOption[] = (Array.isArray(data) ? data : []).map((item: any) => ({
                id: String(item.id),
                name: String(item.name || 'Entrega'),
                delivery_time: Number(item.delivery_time) === 0 ? 'Imediato' : `${item.delivery_time} dias uteis`,
                price: parseFloat(String(item.price || 0))
            })).filter((option) => {
                if (allowPickupShipping) return true;
                return !/retira/i.test(option.name) && !String(option.id).includes('retirada');
            });

            setShippingOptions(options);
            if (options.length > 0) {
                setSelectedShipping(options.find((option) => option.price > 0) || options[0]);
            }
        } catch (error) {
            console.error('Erro ao buscar frete:', error);
            // Fallback para mock em caso de erro
            const mockOptions: ShippingOption[] = [
                { id: 'retirar', name: 'Retirar no Local', delivery_time: 'Imediato', price: 0.00 },
                { id: 'sedex', name: 'SEDEX', delivery_time: '3 dias uteis', price: 45.00 },
                { id: 'pac', name: 'PAC', delivery_time: '7 dias uteis', price: 25.50 },
            ].filter((option) => {
                if (allowPickupShipping) return true;
                return !/retira/i.test(option.name) && !String(option.id).includes('retirada');
            });
            setShippingOptions(mockOptions);
            if (mockOptions.length > 0) {
                setSelectedShipping(mockOptions.find((option) => option.price > 0) || mockOptions[0]);
            }
        }
    };


    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setIsCepLoading(true);
        setShippingOptions([]);
        setSelectedShipping(null);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
                fetchShippingOptions();
            } else {
                alert('CEP nÃ£o encontrado.');
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setIsCepLoading(false);
        }
    };

    const handleApplyCoupon = () => {
        setCouponError('');
        const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.status === 'Ativo');

        if (coupon) {
            setAppliedCoupon(coupon);
        } else {
            setCouponError('Cupom invÃ¡lido ou inativo.');
            setDiscount(0);
            setAppliedCoupon(null);
        }
    };

    const handleCopyPix = () => {
        if (!pixData) return;
        navigator.clipboard.writeText(pixData.copyPaste);
        setPixCodeCopied(true);
        setTimeout(() => setPixCodeCopied(false), 2000);
    }

        const processPayment = async () => {
        if (salesRouting.requiresDistributorSelection) {
            alert('Selecione um centro de distribuicao antes de finalizar a compra.');
            onRequestDistributorSelection();
            return;
        }

        if (!isStep2Valid) {
            alert('Por favor, preencha todos os dados e selecione um metodo de envio.');
            return;
        }

        setIsProcessingPayment(true);
        await new Promise(res => setTimeout(res, 600));

        let paymentSpecificData: Partial<Order> = {};
        let finalPaymentStatus: Order['paymentStatus'] = 'Pendente';
        const paymentBreakdown: NonNullable<Order['paymentBreakdown']> = [];

        try {
            const resolvedConsultant = isReferralCheckout
                ? null
                : (identifiedConsultant || (
                    (formData.email || formData.customerCpf)
                        ? await resolveCheckoutConsultant(true)
                        : null
                ));

            if (walletAppliedAmount > 0) {
                await processWalletDebit(walletAppliedAmount);
                paymentBreakdown.push({ method: 'wallet', amount: walletAppliedAmount });
            }

            if (externalPaymentAmount > 0) {
                const externalResult = await processExternalPayment(externalPaymentMethod, externalPaymentAmount);
                paymentSpecificData = { ...paymentSpecificData, ...externalResult.paymentData };
                finalPaymentStatus = externalResult.paymentStatus;
                paymentBreakdown.push({ method: externalPaymentMethod, amount: externalPaymentAmount });
            } else {
                finalPaymentStatus = 'Pago';
            }

            const orderItems: OrderItem[] = effectiveCartItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                variantText: item.variantText,
                pricingTier: item.pricingTier,
                retailPrice: item.retailPrice,
                consultantPrice: item.consultantPrice,
                dropshipPrice: item.dropshipPrice,
                commissionOrigin: item.commissionOrigin,
                affiliateModel: item.affiliateModel,
                productType: item.productType,
                ownerUserId: item.ownerUserId,
                ownerLoginId: item.ownerLoginId,
                fulfillmentOriginType: item.fulfillmentOriginType,
                fulfillmentOriginId: item.fulfillmentOriginId,
                fulfillmentOriginName: item.fulfillmentOriginName,
                fulfillmentOriginZip: item.fulfillmentOriginZip,
            }));

            selectedBumpOffers.forEach(({ product, offerPrice, ruleTitle }) => {
                orderItems.push({
                    productId: product.id,
                    variantId: product.variants?.[0]?.id || 'default',
                    productName: `${product.name} (${ruleTitle})`,
                    quantity: 1,
                    price: offerPrice,
                });
            });

            const newOrder: Order = {
                id: `#${Date.now().toString().slice(-6)}`,
                customerId: currentCustomer?.id,
                date: new Date().toISOString(),
                customerName: formData.customerName,
                customerEmail: formData.email,
                customerCpf: formData.customerCpf,
                customerPhone: formData.customerPhone,
                shippingAddress: {
                    street: formData.street,
                    number: formData.number,
                    complement: formData.complement,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                },
                items: orderItems,
                subtotal,
                shippingCost,
                discount,
                appliedCoupon: appliedCoupon?.code,
                total,
                currency: 'BRL',
                paymentStatus: finalPaymentStatus,
                fulfillmentStatus: 'Nao Realizado',
                shippingMethod: selectedShipping!.name,
                paymentMethod: paymentBreakdown.length > 1 ? 'hybrid' : (paymentBreakdown[0]?.method || visiblePaymentMethod),
                paymentBreakdown,
                pricingTierApplied: (consultantPricingUnlocked || Boolean(resolvedConsultant)) ? 'consultant' : 'retail',
                recognizedConsultantId: resolvedConsultant?.userId || resolvedConsultant?.id || null,
                recognizedConsultantLoginId: resolvedConsultant?.loginId || '',
                recognizedConsultantNumericId: resolvedConsultant?.numericId || '',
                buyerType: salesRouting.buyerType,
                routingMode: salesRouting.mode,
                referrerId: salesRouting.referrerId,
                referrerName: salesRouting.referrerName,
                referrerLoginId: salesRouting.referrerLoginId,
                distributorId: salesRouting.distributorId,
                distributorName: salesRouting.distributorName,
                fulfillmentOriginType: salesRouting.fulfillmentOriginType,
                fulfillmentOriginId: salesRouting.fulfillmentOriginId,
                fulfillmentOriginName: salesRouting.fulfillmentOriginName,
                fulfillmentOriginZip: salesRouting.fulfillmentOriginZip,
                ...paymentSpecificData
            };

            await onFinalizePurchase(newOrder);

        } catch (error) {
            alert(`Erro ao processar pagamento: ${error instanceof Error ? error.message : String(error)}`);
            setIsProcessingPayment(false);
        }
    };

    const toggleBumpOffer = (offerKey: string) => {
        setSelectedBumpOfferKeys(prev =>
            prev.includes(offerKey)
                ? prev.filter(id => id !== offerKey)
                : [...prev, offerKey]
        );
    };

        const getButtonText = () => {
        if (isProcessingPayment) return 'Processando...';
        if (activeStep !== 3) return 'Finalizar Pedido';
        if (walletAppliedAmount > 0 && externalPaymentAmount > 0) {
            return `Pagar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletAppliedAmount)} com saldo e concluir`;
        }
        if (visiblePaymentMethod === 'boleto') return 'Gerar boleto';
        if (visiblePaymentMethod === 'pix') return 'Confirmar pedido e gerar PIX';
        if (visiblePaymentMethod === 'wallet') return 'Pagar com saldo';
        return 'Pagar com cartao';
    }


    return (
        <div className="bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))] min-h-screen">
            <header className="bg-[rgb(var(--color-brand-gray))] backdrop-blur-sm border-b border-[rgb(var(--color-brand-gray-light))]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-3 items-center">
                    <div className="justify-self-start">
                        <button onClick={onBack} className="flex items-center gap-2 text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]">
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar</span>
                        </button>
                    </div>
                    <div className="justify-self-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="RS Prolipsi" className="h-12 w-auto max-w-[180px] object-contain" />
                        ) : (
                            <span className="text-3xl font-display text-[rgb(var(--color-brand-gold))]">RS Prolipsi</span>
                        )}
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    {/* Left Side: Form */}
                    <div className="lg:col-span-7 mb-12 lg:mb-0">
                        <div className="space-y-6">
                            <div className="rounded-lg border border-[rgb(var(--color-brand-gold))]/30 bg-[rgb(var(--color-brand-gray))] p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[rgb(var(--color-brand-gold))]">
                                            Direcionamento da compra
                                        </p>
                                        {salesRouting.fulfillmentOriginType === 'seller_store' && (
                                            <>
                                                <h3 className="mt-2 text-base font-bold text-white">Compra atendida pela loja do lojista</h3>
                                                <p className="mt-1 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                                    {salesRouting.fulfillmentOriginName || 'Loja parceira'}
                                                </p>
                                            </>
                                        )}
                                        {salesRouting.fulfillmentOriginType !== 'seller_store' && salesRouting.mode === 'referral' && (
                                            <>
                                                <h3 className="mt-2 text-base font-bold text-white">Venda vinculada ao indicador</h3>
                                                <p className="mt-1 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                                    {salesRouting.referrerName} ({salesRouting.referrerLoginId || salesRouting.sponsorRef})
                                                </p>
                                            </>
                                        )}
                                        {salesRouting.fulfillmentOriginType === 'cd' && (
                                            <>
                                                <h3 className="mt-2 text-base font-bold text-white">Compra atendida por centro de distribuicao</h3>
                                                <p className="mt-1 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                                    {salesRouting.distributorName || 'Nenhum centro selecionado.'}
                                                </p>
                                            </>
                                        )}
                                        {salesRouting.fulfillmentOriginType === 'central' && salesRouting.mode === 'central' && (
                                            <>
                                                <h3 className="mt-2 text-base font-bold text-white">Compra direta pela loja central</h3>
                                                <p className="mt-1 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                                    {salesRouting.referrerName}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {salesRouting.fulfillmentOriginType === 'cd' && (
                                        <button
                                            type="button"
                                            onClick={onRequestDistributorSelection}
                                            className="shrink-0 rounded-md border border-[rgb(var(--color-brand-gold))]/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--color-brand-gold))] transition-colors hover:bg-[rgb(var(--color-brand-gold))]/10"
                                        >
                                            {salesRouting.distributorName ? 'Trocar CD' : 'Escolher CD'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Step 1: IdentificaÃ§Ã£o */}
                            <div className={`bg-[rgb(var(--color-brand-gray))] rounded-lg border-2 ${activeStep === 1 ? 'border-[rgb(var(--color-brand-gold))]' : 'border-[rgb(var(--color-brand-gray-light))]'}`}>
                                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setActiveStep(1)}>
                                    <UserCircleIcon className={`w-8 h-8 ${activeStep === 1 ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-text-dim))]'}`} />
                                    <div>
                                        <h2 className="text-lg font-bold font-display">1. Seus Dados</h2>
                                        {activeStep > 1 && isStep1Valid && <p className="text-sm text-[rgb(var(--color-brand-text-dim))] truncate">{formData.customerName} - {formData.email}</p>}
                                    </div>
                                </button>
                                {activeStep === 1 && (
                                    <div className="p-6 border-t border-[rgb(var(--color-brand-gray-light))] space-y-4">
                                        <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Nome completo *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" name="customerCpf" value={formData.customerCpf} onChange={handleInputChange} placeholder="CPF ou CNPJ *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} placeholder="Telefone / WhatsApp *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                        </div>
                                        {Boolean(consultantLookupMessage) && (
                                            <div className={`rounded-lg border px-4 py-3 text-sm ${
                                                consultantPricingUnlocked
                                                    ? 'border-green-500/40 bg-green-500/10 text-green-300'
                                                    : 'border-[rgb(var(--color-brand-gold))]/30 bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-dim))]'
                                            }`}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span>{consultantLookupMessage}</span>
                                                    {isCheckingConsultant && <SpinnerIcon className="h-4 w-4 text-[rgb(var(--color-brand-gold))]" />}
                                                </div>
                                                {consultantPricingUnlocked && (identifiedConsultant || salesRouting.buyerType === 'consultor') && (
                                                    <p className="mt-2 text-xs text-[rgb(var(--color-brand-gold))]">
                                                        {identifiedConsultant
                                                            ? `ID conta ${identifiedConsultant.numericId || '--'} | Login ${identifiedConsultant.loginId || '--'}`
                                                            : 'Sessao de consultor identificada. Preco consultor ativo.'}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {!currentCustomer && !isReferralCheckout && (
                                            <div className="rounded-lg border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-dark))] px-4 py-3 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-semibold text-white">Ja tem cadastro na loja?</p>
                                                        <p>Entre com sua conta para aplicar automaticamente preco consultor, saldo da carteira e identificar seu cadastro sem depender so do CPF.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={onRequestStoreLogin}
                                                        className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--color-brand-gold))] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--color-brand-gold))] transition-colors hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]"
                                                    >
                                                        Entrar na loja
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button onClick={handleContinueFromStep1} disabled={!isStep1Valid || isCheckingConsultant} className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                            Continuar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Entrega */}
                            <div className={`bg-[rgb(var(--color-brand-gray))] rounded-lg border-2 ${activeStep === 2 ? 'border-[rgb(var(--color-brand-gold))]' : 'border-[rgb(var(--color-brand-gray-light))]'} ${!isStep1Valid ? 'opacity-50' : ''}`}>
                                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => isStep1Valid && setActiveStep(2)} disabled={!isStep1Valid}>
                                    <TruckIcon className={`w-8 h-8 ${activeStep === 2 ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-text-dim))]'}`} />
                                    <div>
                                        <h2 className="text-lg font-bold font-display">2. Entrega</h2>
                                        {activeStep > 2 && selectedShipping && <p className="text-sm text-[rgb(var(--color-brand-text-dim))] truncate">{selectedShipping.name} - {formData.street}, {formData.number}</p>}
                                    </div>
                                </button>
                                {activeStep === 2 && (
                                    <div className="p-6 border-t border-[rgb(var(--color-brand-gray-light))] space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                            <div className="relative sm:col-span-2">
                                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="CEP *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                                {isCepLoading && <SpinnerIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-brand-gold))]" />}
                                            </div>
                                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="EndereÃ§o *" className="sm:col-span-4 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="text" name="number" value={formData.number} onChange={handleInputChange} placeholder="NÃºmero *" className="sm:col-span-2 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="text" name="complement" value={formData.complement} onChange={handleInputChange} placeholder="Complemento" className="sm:col-span-4 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} placeholder="Bairro *" className="sm:col-span-3 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade *" className="sm:col-span-2 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="UF *" className="sm:col-span-1 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                        </div>
                                        {shippingOptions.length > 0 && (
                                            <div className="space-y-3 pt-4">
                                                {shippingOptions.map(option => (
                                                    <label key={option.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedShipping?.id === option.id ? 'bg-[rgb(var(--color-brand-gold))]/[.10] border-[rgb(var(--color-brand-gold))]' : 'bg-[rgb(var(--color-brand-dark))] border-[rgb(var(--color-brand-gray-light))] hover:border-[rgb(var(--color-brand-gray))]'}`}>
                                                        <div className="flex items-center"><input type="radio" name="shipping" checked={selectedShipping?.id === option.id} onChange={() => setSelectedShipping(option)} className="h-4 w-4 text-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gray))] border-[rgb(var(--color-brand-gray-light))] focus:ring-[rgb(var(--color-brand-gold))]" />
                                                            <div className="ml-3 text-sm"><p className="font-medium">{option.name}</p><p className="text-[rgb(var(--color-brand-text-dim))]">{option.delivery_time}</p></div>
                                                        </div>
                                                        <p className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(option.price)}</p>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        <button onClick={() => setActiveStep(3)} disabled={!isStep2Valid} className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                                            Continuar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Pagamento */}
                            <div className={`bg-[rgb(var(--color-brand-gray))] rounded-lg border-2 ${activeStep === 3 ? 'border-[rgb(var(--color-brand-gold))]' : 'border-[rgb(var(--color-brand-gray-light))]'} ${!isStep2Valid ? 'opacity-50' : ''}`}>
                                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => isStep2Valid && setActiveStep(3)} disabled={!isStep2Valid}>
                                    <CreditCardIcon className={`w-8 h-8 ${activeStep === 3 ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-text-dim))]'}`} />
                                    <h2 className="text-lg font-bold font-display">3. Pagamento</h2>
                                </button>
                                {activeStep === 3 && (
                                    <div className="p-6 border-t border-[rgb(var(--color-brand-gray-light))] space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[rgb(var(--color-brand-dark))] p-1 rounded-lg">
                                            <button onClick={() => setActivePaymentMethod('wallet')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'wallet' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><WalletIcon className="w-5 h-5" /> Saldo</button>
                                            <button onClick={() => setActivePaymentMethod('credit-card')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'credit-card' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><CreditCardIcon className="w-5 h-5" /> Cartao</button>
                                            <button onClick={() => setActivePaymentMethod('pix')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'pix' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><PixIcon className="w-5 h-5" /> Pix</button>
                                            <button onClick={() => setActivePaymentMethod('boleto')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'boleto' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><BarcodeIcon className="w-5 h-5" /> Boleto</button>
                                        </div>

                                        {!paymentGatewayAvailable && (
                                            <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">
                                                Gateway externo em modo local. Pix, boleto e cartao continuam visiveis para teste do fluxo.
                                            </p>
                                        )}

                                        {walletSessionEnabled && activePaymentMethod !== 'wallet' && (
                                            <label className="flex items-center gap-3 rounded-lg border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-dark))] px-4 py-3 text-sm text-[rgb(var(--color-brand-text-light))]">
                                                <input
                                                    type="checkbox"
                                                    checked={useWalletBalance}
                                                    onChange={(event) => setUseWalletBalance(event.target.checked)}
                                                    className="h-4 w-4 rounded border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-gold))] focus:ring-[rgb(var(--color-brand-gold))]"
                                                />
                                                <span>Usar saldo da carteira primeiro e completar com {activePaymentMethod === 'credit-card' ? 'cartao' : activePaymentMethod === 'pix' ? 'pix' : 'boleto'}</span>
                                            </label>
                                        )}

                                        {(activePaymentMethod === 'wallet' || useWalletBalance) && (
                                            <div className="p-4 bg-[rgb(var(--color-brand-dark))] rounded-lg space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-white">Saldo da carteira</p>
                                                    {loadingWallet && <SpinnerIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]" />}
                                                </div>

                                                {!walletSessionEnabled ? (
                                                    <div className="rounded-lg border border-[rgb(var(--color-error))]/40 bg-[rgb(var(--color-error))]/10 px-4 py-3 text-sm text-[rgb(var(--color-error))]">
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <span>Faca login na loja com sua conta de consultor para usar saldo e pagamento hibrido.</span>
                                                            <button
                                                                type="button"
                                                                onClick={onRequestStoreLogin}
                                                                className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--color-brand-gold))] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--color-brand-gold))] transition-colors hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]"
                                                            >
                                                                Entrar na loja
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg border border-[rgb(var(--color-brand-gold))] space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-[rgb(var(--color-brand-text-dim))]">Saldo disponivel:</span>
                                                                <span className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletBalance)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-[rgb(var(--color-brand-text-dim))]">Aplicado neste pedido:</span>
                                                                <span className="text-lg font-semibold text-white">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletAppliedAmount)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-[rgb(var(--color-brand-text-dim))]">Restante externo:</span>
                                                                <span className="text-lg font-semibold text-white">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(externalPaymentAmount)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {externalPaymentAmount > 0 && (
                                                            <div className="space-y-3">
                                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--color-brand-gold))]">
                                                                    Completar restante com
                                                                </p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                                    {(['credit-card', 'pix', 'boleto'] as ExternalPaymentMethod[]).map((method) => (
                                                                        <button
                                                                            key={`hybrid-${method}`}
                                                                            type="button"
                                                                            onClick={() => setSecondaryHybridMethod(method)}
                                                                            className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                                                                                secondaryHybridMethod === method
                                                                                    ? 'border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))] text-black'
                                                                                    : 'border-[rgb(var(--color-brand-gray-light))] hover:border-[rgb(var(--color-brand-gold))]/40'
                                                                            }`}
                                                                        >
                                                                            {method === 'credit-card' ? 'Cartao' : method === 'pix' ? 'Pix' : 'Boleto'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {visiblePaymentMethod === 'credit-card' && (
                                            <div className="space-y-3 pt-2">
                                                {walletAppliedAmount > 0 && externalPaymentAmount > 0 && (
                                                    <p className="text-xs text-[rgb(var(--color-brand-gold))]">
                                                        Restante no cartao: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(externalPaymentAmount)}
                                                    </p>
                                                )}
                                                <div className="relative"><input type="text" name="number" value={cardDetails.number} onChange={handleCardInputChange} placeholder="Numero do Cartao" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 pr-12 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" /><div className="absolute inset-y-0 right-0 pr-3 flex items-center">{cardBrand === 'visa' ? <VisaIcon className="h-6" /> : cardBrand === 'mastercard' && <MastercardIcon className="h-6" />}</div></div>
                                                <input type="text" name="name" value={cardDetails.name} onChange={handleCardInputChange} placeholder="Nome no Cartao" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="text" name="expiry" value={cardDetails.expiry} onChange={handleCardInputChange} placeholder="Validade (MM/AA)" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                                    <div className="relative"><input type="text" name="cvv" value={cardDetails.cvv} onChange={handleCardInputChange} placeholder="CVV" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 pr-10 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" /><div className="absolute inset-y-0 right-0 pr-3 flex items-center group cursor-help"><InformationCircleIcon className="w-5 h-5 text-[rgb(var(--color-brand-text-dim))]" /></div></div>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 pt-2 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                                    <LockIcon className="w-4 h-4" />
                                                    <span>Pagamento seguro</span>
                                                </div>
                                            </div>
                                        )}
                                        {visiblePaymentMethod === 'pix' && (
                                            <div className="text-center p-4 bg-[rgb(var(--color-brand-dark))] rounded-lg">
                                                <p className="font-semibold mb-2">Pague com PIX</p>
                                                {walletAppliedAmount > 0 && externalPaymentAmount > 0 && (
                                                    <p className="mb-4 text-xs text-[rgb(var(--color-brand-gold))]">
                                                        Restante no PIX: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(externalPaymentAmount)}
                                                    </p>
                                                )}
                                                {isProcessingPayment && !pixData ? (
                                                    <div className="h-[268px] flex flex-col items-center justify-center"><SpinnerIcon className="w-10 h-10 text-[rgb(var(--color-brand-gold))] mb-2" /> <p>Gerando PIX...</p></div>
                                                ) : pixData ? (
                                                    <>
                                                        <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="mx-auto bg-white p-2 rounded-md" />
                                                        <p className="text-sm mt-4 text-[rgb(var(--color-brand-text-dim))]">Aponte a cÃ¢mera do seu celular para pagar.</p>
                                                        <button onClick={handleCopyPix} className="mt-4 w-full bg-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-text-light))] font-semibold py-3 px-4 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2">
                                                            {pixCodeCopied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                                            {pixCodeCopied ? 'CÃ³digo Copiado!' : 'Copiar CÃ³digo PIX'}
                                                        </button>
                                                    </>
                                                ) : <p>NÃ£o foi possÃ­vel gerar o PIX.</p>}
                                            </div>
                                        )}
                                        {visiblePaymentMethod === 'boleto' && (
                                            <div className="text-center p-4 bg-[rgb(var(--color-brand-dark))] rounded-lg text-[rgb(var(--color-brand-text-dim))] space-y-3">
                                                <p className="font-semibold text-white">Boleto Bancario</p>
                                                <BarcodeIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-brand-gold))]" />
                                                {walletAppliedAmount > 0 && externalPaymentAmount > 0 && (
                                                    <p className="text-xs text-[rgb(var(--color-brand-gold))]">
                                                        Restante no boleto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(externalPaymentAmount)}
                                                    </p>
                                                )}
                                                <p>O boleto sera gerado apos a finalizacao da compra e podera ser pago em qualquer banco ou loterica ate o vencimento.</p>
                                            </div>
                                        )}
                                        <button onClick={processPayment} disabled={isProcessingPayment} className="mt-4 w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed">
                                            {isProcessingPayment ? <SpinnerIcon className="w-5 h-5" /> : <LockIcon className="w-5 h-5" />}
                                            {getButtonText()}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-[rgb(var(--color-brand-gray))] p-6 rounded-lg lg:sticky lg:top-28 self-start border border-[rgb(var(--color-brand-gray-light))]">
                            <h2 className="text-xl font-bold font-display text-[rgb(var(--color-brand-text-light))] mb-4">Resumo do Pedido</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4 border-b border-[rgb(var(--color-brand-gray-light))] pb-4">
                                {effectiveCartItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-4 py-3">
                                        <div className="relative flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                            <span className="absolute -top-2 -right-2 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{item.quantity}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm leading-tight">{item.name}</p>
                                            {item.variantText && <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{item.variantText}</p>}
                                            {consultantPricingUnlocked && Number(item.consultantPrice || 0) > 0 && Number(item.retailPrice || 0) > Number(item.consultantPrice || 0) && (
                                                <p className="mt-1 text-xs text-[rgb(var(--color-brand-gold))]">
                                                    Preco consultor aplicado. De {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.retailPrice || 0))} por {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.consultantPrice || item.price || 0))}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center border border-[rgb(var(--color-brand-gray-light))] rounded-full">
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-lg text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] rounded-l-full">-</button>
                                                    <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-lg text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] rounded-r-full">+</button>
                                                </div>
                                                <button onClick={() => onRemoveItem(item.id)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]" title="Remover item">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                                            {consultantPricingUnlocked && Number(item.retailPrice || 0) > Number(item.price || 0) && (
                                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))] line-through">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.retailPrice || 0) * item.quantity)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {bumpOffersByRule.length > 0 && (
                                <div className="my-6 space-y-4">
                                    {bumpOffersByRule.map((group) => (
                                        <div key={`bump-group-${group.ruleId}`} className="rounded-lg border-2 border-dashed border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/[.05] p-4">
                                            <div className="mb-4">
                                                <p className="text-sm font-bold text-[rgb(var(--color-brand-gold))]">{group.title}</p>
                                                {group.description && (
                                                    <p className="mt-1 text-xs text-[rgb(var(--color-brand-text-dim))]">{group.description}</p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                {group.items.map((item) => {
                                                    const checked = selectedBumpOfferKeys.includes(item.key);
                                                    const originalPrice = Number(item.product.price || 0);
                                                    const image = item.product.images?.[0] || item.product.featured_image || 'https://placehold.co/96x96?text=Produto';

                                                    return (
                                                        <label
                                                            key={`checkout-bump-${item.key}`}
                                                            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-all ${
                                                                checked
                                                                    ? 'border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/10'
                                                                    : 'border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-dark))]'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleBumpOffer(item.key)}
                                                                className="mt-1 h-5 w-5 rounded border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-gold))] focus:ring-[rgb(var(--color-brand-gold))]"
                                                            />
                                                            <img src={image} alt={item.product.name} className="h-14 w-14 rounded-md object-cover" />
                                                            <div className="min-w-0 flex-grow">
                                                                <p className="truncate text-sm font-semibold text-white">{item.product.name}</p>
                                                                <p className="truncate text-xs text-[rgb(var(--color-brand-text-dim))]">{item.product.seller || 'Marketplace RS'}</p>
                                                                <div className="mt-1 flex items-baseline gap-2">
                                                                    <span className="text-sm font-bold text-[rgb(var(--color-brand-gold))]">
                                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.offerPrice)}
                                                                    </span>
                                                                    <span className="text-xs text-[rgb(var(--color-brand-text-dim))] line-through">
                                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-2 py-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                                <div className="flex gap-2"><input value={couponCode} onChange={e => setCouponCode(e.target.value)} type="text" placeholder="Cupom de desconto" className="flex-grow bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-sm focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" /><button onClick={handleApplyCoupon} className="font-semibold bg-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">Aplicar</button></div>
                                {couponError && <p className="text-xs text-[rgb(var(--color-error))] mt-1">{couponError}</p>}
                                {appliedCoupon && <p className="text-xs text-[rgb(var(--color-success))] mt-1">Cupom "{appliedCoupon.code}" aplicado!</p>}
                            </div>
                            <div className="space-y-2 pt-4">
                                <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span></div>
                                {selectedBumpOffers.map(({ key, product, offerPrice, ruleTitle }) => (
                                    <div key={`selected-bump-${key}`} className="flex justify-between text-sm text-[rgb(var(--color-brand-gold))]">
                                        <span className="truncate pr-3">{ruleTitle}: {product.name}</span>
                                        <span>+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offerPrice)}</span>
                                    </div>
                                ))}
                                {consultantPricingUnlocked && cartSubtotal > subtotal && (
                                    <div className="flex justify-between text-sm text-[rgb(var(--color-success))]">
                                        <span>Desconto consultor:</span>
                                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal - subtotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm"><span>Frete:</span><span>{selectedShipping ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingCost) : 'Aguardando CEP'}</span></div>
                                {discount > 0 && <div className="flex justify-between text-sm text-[rgb(var(--color-success))]"><span>Desconto:</span><span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</span></div>}
                                <div className="flex justify-between font-bold text-xl text-[rgb(var(--color-brand-gold))] border-t border-[rgb(var(--color-brand-gray-light))] pt-2 mt-2"><span>Total:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutView;



