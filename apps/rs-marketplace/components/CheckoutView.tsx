import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, View, Customer, Order, Coupon, ShippingAddress, OrderBump, Product, OrderItem, PaymentSettings, WalletBalance } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { LockIcon } from './icons/LockIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { PixIcon } from './icons/PixIcon';
import { BoletoIcon } from './icons/BoletoIcon';
import { VisaIcon } from './icons/VisaIcon';
import { MastercardIcon } from './icons/MastercardIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TruckIcon } from './icons/TruckIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { MercadoPagoIcon } from './icons/MercadoPagoIcon';
import { TrashIcon } from './icons/TrashIcon';
import { WalletIcon } from './icons/WalletIcon';


interface ShippingOption {
    id: string;
    name: string;
    delivery_time: string;
    price: number;
}

interface CheckoutViewProps {
    cartItems: CartItem[];
    onBack: () => void;
    onFinalizePurchase: (order: Order) => void;
    currentCustomer: Customer | null;
    coupons: Coupon[];
    orderBumpConfig: OrderBump;
    allProducts: Product[];
    paymentSettings: PaymentSettings;
    onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
    onRemoveItem: (cartItemId: string) => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ cartItems, onBack, onFinalizePurchase, currentCustomer, coupons, orderBumpConfig, allProducts, paymentSettings, onUpdateQuantity, onRemoveItem }) => {
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const TENANT_ID = (import.meta as any).env?.VITE_TENANT_ID || '';

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

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    const [isCepLoading, setIsCepLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

    const [isBumpAccepted, setIsBumpAccepted] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState<'credit-card' | 'pix' | 'boleto' | 'wallet'>('credit-card');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loadingWallet, setLoadingWallet] = useState(false);

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [pixData, setPixData] = useState<{ qrCodeUrl: string; copyPaste: string } | null>(null);
    const [pixCodeCopied, setPixCodeCopied] = useState(false);

    const bumpProduct = useMemo(() => {
        if (!orderBumpConfig.enabled) return null;
        return allProducts.find(p => p.id === orderBumpConfig.productId);
    }, [orderBumpConfig, allProducts]);

    const bumpPrice = isBumpAccepted && bumpProduct ? orderBumpConfig.offerPrice : 0;
    const shippingCost = selectedShipping?.price ?? 0;

    const total = useMemo(() => {
        const newSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const bump = isBumpAccepted && bumpProduct ? orderBumpConfig.offerPrice : 0;
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
    }, [cartItems, selectedShipping, appliedCoupon, isBumpAccepted, bumpProduct, orderBumpConfig.offerPrice]);

    const isStep1Valid = formData.customerName && formData.email && formData.customerCpf && formData.customerPhone;
    const isStep2Valid = isStep1Valid && selectedShipping;

    // Carregar saldo da carteira ao entrar na etapa de pagamento
    useEffect(() => {
        if (activeStep === 3 && currentCustomer && !loadingWallet) {
            const loadWalletBalance = async () => {
                setLoadingWallet(true);
                try {
                    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
                    const response = await fetch(`${API_URL}/api/wallet/balance/${currentCustomer.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    }, [activeStep, currentCustomer]);

    // Gerar PIX dinamicamente ao entrar na etapa de pagamento
    useEffect(() => {
        if (activeStep === 3 && activePaymentMethod === 'pix' && !pixData && paymentSettings.mercadoPago.enabled) {
            const generatePix = async () => {
                setIsProcessingPayment(true);
                try {
                    const apiUrl = `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'}/api/payment/pix`;

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            orderId: `order-${Date.now()}`,
                            amount: total,
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
                    console.error('❌ Erro ao gerar PIX:', error);
                    // Fallback para PIX mock em desenvolvimento
                    const mockPixCopyPaste = '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substr(2, 9) + '52040000530398654' + String(total).padStart(5, '0') + '5802BR5913RS Prolipsi6009SAO PAULO62070503***6304' + Math.random().toString(36).substr(2, 4).toUpperCase();
                    setPixData({
                        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCopyPaste)}`,
                        copyPaste: mockPixCopyPaste,
                    });
                }
                setIsProcessingPayment(false);
            };
            generatePix();
        }
    }, [activeStep, activePaymentMethod, pixData, paymentSettings.mercadoPago.enabled, total, currentCustomer, formData]);


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
                        postal_code: '04567000' // CEP da loja RS Prólipsi
                    },
                    to: {
                        postal_code: formData.zipCode.replace(/\D/g, '')
                    },
                    products: cartItems.map(item => ({
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

            // Adicionar "Retirar no Local" manualmente
            const options: ShippingOption[] = [
                { id: 'retirar', name: 'Retirar no Local', delivery_time: 'Imediato', price: 0.00 },
                ...data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    delivery_time: `${item.delivery_time} dias úteis`,
                    price: parseFloat(item.price)
                }))
            ];

            setShippingOptions(options);
            if (options.length > 0) {
                setSelectedShipping(options[0]);
            }
        } catch (error) {
            console.error('Erro ao buscar frete:', error);
            // Fallback para mock em caso de erro
            const mockOptions: ShippingOption[] = [
                { id: 'retirar', name: 'Retirar no Local', delivery_time: 'Imediato', price: 0.00 },
                { id: 'sedex', name: 'SEDEX', delivery_time: '3 dias úteis', price: 45.00 },
                { id: 'pac', name: 'PAC', delivery_time: '7 dias úteis', price: 25.50 },
            ];
            setShippingOptions(mockOptions);
            if (mockOptions.length > 0) {
                setSelectedShipping(mockOptions[0]);
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
                alert('CEP não encontrado.');
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
            setCouponError('Cupom inválido ou inativo.');
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
        if (!isStep2Valid) {
            alert('Por favor, preencha todos os dados e selecione um método de envio.');
            return;
        }

        setIsProcessingPayment(true);
        await new Promise(res => setTimeout(res, 2000));

        let paymentSpecificData: Partial<Order> = {};
        let finalPaymentStatus: Order['paymentStatus'] = 'Pendente';

        try {
            if (activePaymentMethod === 'boleto' && paymentSettings.mercadoPago.enabled) {
                // Gerar boleto real via API
                const API_URL = (import.meta as any).env?.VITE_API_URL || '';
                const apiUrl = `${API_URL}/api/payment/boleto`;

                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: `order-${Date.now()}`,
                            amount: total,
                            buyer: {
                                email: currentCustomer?.email || formData.email,
                                name: currentCustomer?.name || formData.customerName,
                                cpf: formData.customerCpf
                            }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            paymentSpecificData = { boletoUrl: data.boleto_url || data.external_resource_url };
                        } else {
                            // Fallback mock
                            paymentSpecificData = { boletoUrl: `https://www.mercadopago.com.br/boletos/pdf/${Date.now()}` };
                        }
                    } else {
                        // Fallback mock
                        paymentSpecificData = { boletoUrl: `https://www.mercadopago.com.br/boletos/pdf/${Date.now()}` };
                    }
                } catch (err) {
                    console.error('Erro ao gerar boleto:', err);
                    // Fallback mock
                    paymentSpecificData = { boletoUrl: `https://www.mercadopago.com.br/boletos/pdf/${Date.now()}` };
                }

                finalPaymentStatus = 'Pendente';
            } else if (activePaymentMethod === 'pix' && paymentSettings.mercadoPago.enabled) {
                if (!pixData) throw new Error("Dados do PIX não foram gerados. Tente novamente.");
                paymentSpecificData = { pixQrCodeUrl: pixData.qrCodeUrl, pixCopyableCode: pixData.copyPaste };
                finalPaymentStatus = 'Pendente';
            } else if (activePaymentMethod === 'credit-card' && paymentSettings.mercadoPago.enabled) {
                if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                    throw new Error("Preencha todos os dados do cartão.");
                }
                try {
                    const API_URL = (import.meta as any).env?.VITE_API_URL || '';
                    const apiUrl = `${API_URL}/api/payment/card`;
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: `order-${Date.now()}`,
                            amount: total,
                            card: { number: cardDetails.number.replace(/\s/g, ''), name: cardDetails.name, expiry: cardDetails.expiry, cvv: cardDetails.cvv },
                            buyer: { email: currentCustomer?.email || formData.email, name: currentCustomer?.name || formData.customerName, cpf: formData.customerCpf }
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            finalPaymentStatus = 'Pago';
                        } else {
                            finalPaymentStatus = 'Pendente';
                        }
                    } else {
                        finalPaymentStatus = 'Pendente';
                    }
                } catch (err) {
                    console.error('Erro ao processar cartão:', err);
                    finalPaymentStatus = 'Pendente';
                }
            } else if (activePaymentMethod === 'wallet') {
                if (walletBalance < total) {
                    throw new Error('Saldo insuficiente na carteira para concluir a compra.');
                }
                try {
                    const apiUrl = 'https://api.rsprolipsi.com.br/api/wallet/transfer';
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
                        body: JSON.stringify({
                            from_user_id: currentCustomer?.id,
                            to_tenant_id: TENANT_ID,
                            amount: total,
                            description: `Compra marketplace ${Date.now()}`
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            finalPaymentStatus = 'Pago';
                        } else {
                            throw new Error(data.error || 'Falha na transferência da carteira');
                        }
                    } else {
                        throw new Error('Erro ao debitar saldo da carteira');
                    }
                } catch (err) {
                    console.error('Erro carteira:', err);
                    throw err;
                }
            }

            const orderItems: OrderItem[] = cartItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                variantText: item.variantText,
            }));

            if (isBumpAccepted && bumpProduct) {
                orderItems.push({
                    productId: bumpProduct.id,
                    variantId: bumpProduct.variants?.[0]?.id || 'default',
                    productName: `${bumpProduct.name} (Oferta Especial)`,
                    quantity: 1,
                    price: orderBumpConfig.offerPrice,
                });
            }

            const newOrder: Order = {
                id: `#${Date.now().toString().slice(-6)}`,
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
                fulfillmentStatus: 'Não Realizado',
                shippingMethod: selectedShipping!.name,
                ...paymentSpecificData
            };

            onFinalizePurchase(newOrder);

        } catch (error) {
            alert(`Erro ao processar pagamento: ${error instanceof Error ? error.message : String(error)}`);
            setIsProcessingPayment(false);
        }
    };

    const getButtonText = () => {
        if (isProcessingPayment) return 'Processando...';
        if (activeStep !== 3) return 'Finalizar Pedido';
        if (activePaymentMethod === 'boleto') return 'Gerar Boleto via Mercado Pago';
        if (activePaymentMethod === 'pix') return 'Confirmar Pedido e Gerar PIX';
        return 'Pagar com Mercado Pago';
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
                        <span className="text-3xl font-display text-[rgb(var(--color-brand-gold))]">RS Prólipsi</span>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    {/* Left Side: Form */}
                    <div className="lg:col-span-7 mb-12 lg:mb-0">
                        <div className="space-y-6">
                            {/* Step 1: Identificação */}
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
                                            <input type="text" name="customerCpf" value={formData.customerCpf} onChange={handleInputChange} placeholder="CPF *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} placeholder="Telefone / WhatsApp *" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                        </div>
                                        <button onClick={() => setActiveStep(2)} disabled={!isStep1Valid} className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed">
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
                                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="Endereço *" className="sm:col-span-4 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
                                            <input type="text" name="number" value={formData.number} onChange={handleInputChange} placeholder="Número *" className="sm:col-span-2 w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
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
                                            {paymentSettings.mercadoPago.enabled && <button onClick={() => setActivePaymentMethod('credit-card')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'credit-card' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><CreditCardIcon className="w-5 h-5" /> Cartão</button>}
                                            {paymentSettings.mercadoPago.enabled && <button onClick={() => setActivePaymentMethod('pix')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'pix' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><PixIcon className="w-5 h-5" /> Pix</button>}
                                            {paymentSettings.mercadoPago.enabled && <button onClick={() => setActivePaymentMethod('boleto')} className={`py-2 px-3 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${activePaymentMethod === 'boleto' ? 'bg-[rgb(var(--color-brand-gold))] text-black' : 'hover:bg-[rgb(var(--color-brand-gray-light))]'}`}><BarcodeIcon className="w-5 h-5" /> Boleto</button>}
                                        </div>

                                        {activePaymentMethod === 'wallet' && (
                                            <div className="p-4 bg-[rgb(var(--color-brand-dark))] rounded-lg space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-white">Pagar com Saldo da Carteira</p>
                                                    {loadingWallet && <SpinnerIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]" />}
                                                </div>

                                                <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg border border-[rgb(var(--color-brand-gold))]">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-[rgb(var(--color-brand-text-dim))]">Saldo disponível:</span>
                                                        <span className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletBalance)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-[rgb(var(--color-brand-text-dim))]">Total da compra:</span>
                                                        <span className="text-lg font-semibold text-white">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {walletBalance >= total ? (
                                                    <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded-lg">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm font-semibold">Saldo suficiente para completar a compra</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold">Saldo insuficiente</p>
                                                            <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">
                                                                Faltam {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total - walletBalance)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-xs text-[rgb(var(--color-brand-text-dim))] text-center">
                                                    O valor será debitado imediatamente do seu saldo RS.
                                                </div>
                                            </div>
                                        )}

                                        {activePaymentMethod === 'credit-card' && (
                                            <div className="space-y-3 pt-2">
                                                <div className="relative"><input type="text" name="number" value={cardDetails.number} onChange={handleCardInputChange} placeholder="Número do Cartão" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 pr-12 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" /><div className="absolute inset-y-0 right-0 pr-3 flex items-center">{cardBrand === 'visa' ? <VisaIcon className="h-6" /> : cardBrand === 'mastercard' && <MastercardIcon className="h-6" />}</div></div>
                                                <input type="text" name="name" value={cardDetails.name} onChange={handleCardInputChange} placeholder="Nome no Cartão" className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" />
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
                                        {activePaymentMethod === 'pix' && (
                                            <div className="text-center p-4 bg-[rgb(var(--color-brand-dark))] rounded-lg">
                                                <p className="font-semibold mb-2">Pague com PIX</p>
                                                {isProcessingPayment && !pixData ? (
                                                    <div className="h-[268px] flex flex-col items-center justify-center"><SpinnerIcon className="w-10 h-10 text-[rgb(var(--color-brand-gold))] mb-2" /> <p>Gerando PIX...</p></div>
                                                ) : pixData ? (
                                                    <>
                                                        <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="mx-auto bg-white p-2 rounded-md" />
                                                        <p className="text-sm mt-4 text-[rgb(var(--color-brand-text-dim))]">Aponte a câmera do seu celular para pagar.</p>
                                                        <button onClick={handleCopyPix} className="mt-4 w-full bg-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-text-light))] font-semibold py-3 px-4 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2">
                                                            {pixCodeCopied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                                            {pixCodeCopied ? 'Código Copiado!' : 'Copiar Código PIX'}
                                                        </button>
                                                    </>
                                                ) : <p>Não foi possível gerar o PIX.</p>}
                                            </div>
                                        )}
                                        {activePaymentMethod === 'boleto' && (
                                            <div className="text-center p-4 bg-[rgb(var(--color-brand-dark))] rounded-lg text-[rgb(var(--color-brand-text-dim))] space-y-3">
                                                <p className="font-semibold text-white">Boleto Bancário</p>
                                                <BarcodeIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-brand-gold))]" />
                                                <p>O boleto será gerado após a finalização da compra e poderá ser pago em qualquer banco ou casa lotérica até a data de vencimento.</p>
                                            </div>
                                        )}
                                        <button onClick={processPayment} disabled={isProcessingPayment} className="mt-4 w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed">
                                            {isProcessingPayment ? <SpinnerIcon className="w-5 h-5" /> : <LockIcon className="w-5 h-5" />}
                                            {isProcessingPayment ? 'Processando...' : 'Pagar Agora'}
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
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-4 py-3">
                                        <div className="relative flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                            <span className="absolute -top-2 -right-2 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{item.quantity}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm leading-tight">{item.name}</p>
                                            {item.variantText && <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{item.variantText}</p>}
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
                                        <p className="font-semibold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            {bumpProduct && (
                                <div className="my-6 p-4 rounded-lg border-2 border-dashed border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/[.05]"><label className="flex items-center cursor-pointer"><input type="checkbox" checked={isBumpAccepted} onChange={() => setIsBumpAccepted(!isBumpAccepted)} className="h-5 w-5 rounded bg-[rgb(var(--color-brand-gray))] border-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-gold))] focus:ring-[rgb(var(--color-brand-gold))]" /><div className="ml-3 flex-grow"><p className="font-bold text-[rgb(var(--color-brand-gold))] text-sm">{orderBumpConfig.title}</p><div className="flex items-baseline gap-2"><span className="text-md font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderBumpConfig.offerPrice)}</span><span className="text-xs text-[rgb(var(--color-brand-text-dim))] line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bumpProduct.price)}</span></div></div></label></div>
                            )}

                            <div className="space-y-2 py-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                                <div className="flex gap-2"><input value={couponCode} onChange={e => setCouponCode(e.target.value)} type="text" placeholder="Cupom de desconto" className="flex-grow bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-sm focus:outline-none focus:border-[rgb(var(--color-brand-gold))]" /><button onClick={handleApplyCoupon} className="font-semibold bg-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">Aplicar</button></div>
                                {couponError && <p className="text-xs text-[rgb(var(--color-error))] mt-1">{couponError}</p>}
                                {appliedCoupon && <p className="text-xs text-[rgb(var(--color-success))] mt-1">Cupom "{appliedCoupon.code}" aplicado!</p>}
                            </div>
                            <div className="space-y-2 pt-4">
                                <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span></div>
                                {isBumpAccepted && bumpProduct && <div className="flex justify-between text-sm text-[rgb(var(--color-brand-gold))]"><span>Oferta Especial:</span><span>+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bumpPrice)}</span></div>}
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
