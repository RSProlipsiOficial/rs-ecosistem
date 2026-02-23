import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import {
  mockCycleSummary,
  mockCDProducts,
} from '../data';
import { useUser } from '../ConsultantLayout';
import { sigmaApi } from '../services/sigmaApi';
import { IconGitFork, IconCheckCircle, IconTruck, IconMapPin, IconPlus, IconLock, IconBuilding2, IconShoppingCart, IconWhatsapp, IconMinus, IconTrash, IconChevronLeft, IconWallet, IconReceipt, IconHandCoins, IconCreditCard } from '../../components/icons';
import type { CDProduct } from '../../types';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

type DistributionCenter = any;
interface CartItem extends CDProduct {
  quantity: number;
}


const CicloGlobal: React.FC = () => {
  const { user, credits } = useUser();
  const [realCDs, setRealCDs] = useState<any[]>([]);
  const [realProducts, setRealProducts] = useState<CDProduct[]>([]);
  const [loadingCDs, setLoadingCDs] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const loadProducts = async (tenantId?: string) => {
    setLoadingProducts(true);
    try {
      const prodRes = await sigmaApi.getProducts(tenantId);
      if (prodRes.success && Array.isArray(prodRes.data)) {
        const mapped = prodRes.data.map((p: any) => {
          const basePrice = Number(p.price || 0);

          return {
            id: String(p.id),
            name: p.name,
            imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'https://api.sigma.rsprolipsi.com.br/assets/products/placeholder.png',
            fullPrice: basePrice,
            discount: 50, // Regra fixa de 50% para consultores
            pv: 0 // PV ocultado conforme solicitação do Roberto
          };
        });
        setRealProducts(mapped);
        console.log(`[DEBUG] ${mapped.length} produtos carregados para tenant: ${tenantId || 'default'}`);
      }
    } catch (err) {
      console.error("Erro ao carregar produtos SIGME:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // --- Data Loading (CDs) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoadingCDs(true);
      try {
        const cdRes = await sigmaApi.getCDs();
        if (cdRes.success) setRealCDs(cdRes.data);

        // Initial load for Sede
        await loadProducts((import.meta as any).env.VITE_TENANT_ID);
      } catch (err) {
        console.error("Erro ao carregar CDs SIGME:", err);
      } finally {
        setLoadingCDs(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectCD = async (cd: any) => {
    setSelectedDistributionCenter(cd);
    setModalStep(2);
    await loadProducts(cd.id);
  };

  const handleSelectAutoCD = async (cd: any) => {
    setTempSelectedDistributionCenter(cd);
    setAutoConfigStep(2);
    await loadProducts(cd.id);
  };

  // State for manual activation flow
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedDistributionCenter, setSelectedDistributionCenter] = useState<DistributionCenter | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState('correios');

  // State for auto reinvestment flow
  const [isAutoReinvestActive, setIsAutoReinvestActive] = useState(false);
  const [autoReinvestConfig, setAutoReinvestConfig] = useState<{ product: CDProduct | null, shippingMethod: string, distributionCenter: DistributionCenter | null }>({ product: null, shippingMethod: 'correios', distributionCenter: null });
  const [isAutoConfigModalOpen, setIsAutoConfigModalOpen] = useState(false);
  const [autoConfigStep, setAutoConfigStep] = useState(1);
  const [tempSelectedProduct, setTempSelectedProduct] = useState<CDProduct | null>(null);
  const [tempShippingMethod, setTempShippingMethod] = useState('correios');
  const [tempSelectedDistributionCenter, setTempSelectedDistributionCenter] = useState<DistributionCenter | null>(null);

  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [autoShippingOptions, setAutoShippingOptions] = useState<any[]>([]);
  const [isLoadingAutoShipping, setIsLoadingAutoShipping] = useState(false);
  const [realBalance, setRealBalance] = useState<number>(0);
  const [savedAutoConfigData, setSavedAutoConfigData] = useState<any>(null);
  const [pixPaymentData, setPixPaymentData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const walletBalance = realBalance;

  // Refresh balance
  const refreshBalance = async () => {
    if (user?.id) {
      const res = await sigmaApi.getWalletBalance(user.id);
      if (res.success && 'data' in res) setRealBalance(res.data);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, [user]);

  const calculateRealShipping = async () => {
    if (!selectedDistributionCenter || cart.length === 0 || !user?.address?.zipCode) return;
    setIsLoadingShipping(true);
    try {
      const from = { postal_code: selectedDistributionCenter.zip.replace(/\D/g, '') };
      const to = { postal_code: user.address.zipCode.replace(/\D/g, '') };
      const products = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        weight: 0.5, // Estimativa se não houver no objeto
        width: 15,
        height: 10,
        length: 20,
        insurance_value: item.fullPrice * (1 - item.discount / 100)
      }));

      const res = await sigmaApi.calculateShipping(from, to, products);
      if (res.success && 'data' in res && Array.isArray(res.data) && res.data.length > 0) {
        setShippingOptions(res.data);
        // Default to first option if current method not available
        setShippingMethod(String(res.data[0].id));
      } else {
        // Fallback options if API returns empty
        setShippingOptions([
          { id: 'correios-pac', name: 'Correios PAC (Fallback)', price: 25.90, delivery_time: 8, company: { name: 'Correios' } },
          { id: 'correios-sedex', name: 'Correios SEDEX (Fallback)', price: 45.50, delivery_time: 3, company: { name: 'Correios' } }
        ]);
        setShippingMethod('correios-pac');
      }
    } catch (err) {
      console.error('Erro ao calcular frete real:', err);
      // Fallback on error
      setShippingOptions([
        { id: 'standard', name: 'Entrega Padrão', price: 20.00, delivery_time: 7, company: { name: 'RS Logística' } }
      ]);
      setShippingMethod('standard');
    } finally {
      setIsLoadingShipping(false);
    }
  };

  useEffect(() => {
    if (modalStep === 3 && cart.length > 0) {
      calculateRealShipping();
    }
  }, [modalStep, selectedDistributionCenter, cart.length]);

  const calculateRealAutoShipping = async () => {
    if (!tempSelectedDistributionCenter || !tempSelectedProduct || !user?.address?.zipCode) return;
    setIsLoadingAutoShipping(true);
    try {
      const from = { postal_code: tempSelectedDistributionCenter.zip.replace(/\D/g, '') };
      const to = { postal_code: user.address.zipCode.replace(/\D/g, '') };
      const products = [{
        id: tempSelectedProduct.id,
        quantity: 1,
        weight: 0.5,
        width: 15,
        height: 10,
        length: 20,
        insurance_value: tempSelectedProduct.fullPrice * (1 - tempSelectedProduct.discount / 100)
      }];

      const res = await sigmaApi.calculateShipping(from, to, products);
      if (res.success && 'data' in res && Array.isArray(res.data) && res.data.length > 0) {
        setAutoShippingOptions(res.data);
        setTempShippingMethod(String(res.data[0].id));
      } else {
        // Fallback for Auto Flow
        const fallback = [
          { id: 'correios-pac-auto', name: 'PAC (Estimado)', price: 25.90, delivery_time: 8, company: { name: 'Correios' } },
          { id: 'correios-sedex-auto', name: 'SEDEX (Estimado)', price: 45.50, delivery_time: 3, company: { name: 'Correios' } }
        ];
        setAutoShippingOptions(fallback);
        setTempShippingMethod('correios-pac-auto');
      }
    } catch (err) {
      console.error('Erro ao calcular frete real auto:', err);
      setAutoShippingOptions([
        { id: 'standard-auto', name: 'Entrega Padrão', price: 20.00, delivery_time: 7, company: { name: 'RS Logística' } }
      ]);
      setTempShippingMethod('standard-auto');
    } finally {
      setIsLoadingAutoShipping(false);
    }
  };

  useEffect(() => {
    if (autoConfigStep === 3 && tempSelectedProduct) {
      calculateRealAutoShipping();
    }
  }, [autoConfigStep, tempSelectedDistributionCenter, tempSelectedProduct]);

  useEffect(() => {
    if (savedAutoConfigData && realCDs.length > 0 && realProducts.length > 0) {
      const cd = realCDs.find(c => String(c.id) === String(savedAutoConfigData.cdId));
      const product = realProducts.find(p => String(p.id) === String(savedAutoConfigData.productId));
      if (cd && product) {
        setAutoReinvestConfig({
          distributionCenter: cd,
          product: product,
          shippingMethod: savedAutoConfigData.shippingMethod || 'pickup'
        });
      }
    }
  }, [savedAutoConfigData, realCDs, realProducts]);

  // Cart Management
  const addToCart = (product: CDProduct, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const { subtotal, shippingCost, total } = useMemo(() => {
    let sub = 0;

    cart.forEach(item => {
      const discountedPrice = item.fullPrice * (1 - item.discount / 100);
      sub += discountedPrice * item.quantity;
    });

    let ship = 0;
    if (sub > 0) {
      const selectedOption = shippingOptions.find(o => String(o.id) === shippingMethod);
      if (selectedOption) {
        ship = Number(selectedOption.price);
      } else if (shippingMethod === 'pickup') {
        ship = 0;
      }
    }

    const tot = sub + ship;
    return { subtotal: sub, shippingCost: ship, total: tot };
  }, [cart, shippingMethod, shippingOptions]);


  const resetManualModal = () => {
    setIsActivationModalOpen(false);
    setTimeout(() => { // Delay reset to allow modal to close smoothly
      setModalStep(1);
      setSelectedDistributionCenter(null);
      setCart([]);
      setShippingMethod('correios');
      setPixPaymentData(null);
      setPaymentError(null);
      setIsProcessingPayment(false);
    }, 300);
  };

  const handlePayWithWallet = async () => {
    if (!user || total <= 0 || cart.length === 0) return;

    // Verificar saldo antes de tentar
    if (walletBalance < total) {
      setPaymentError(`Saldo insuficiente. Disponível: R$ ${walletBalance.toFixed(2)} — Necessário: R$ ${total.toFixed(2)}`);
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      // 1. Criar pedido via checkout (igual ao fluxo normal)
      const checkoutPayload = {
        buyerId: user.id,
        buyerEmail: user.email,
        buyerName: user.name,
        buyerPhone: user.phone || '',
        buyerCpf: user.cpfCnpj || user.cpf || '',
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_final: item.fullPrice * (1 - item.discount / 100)
        })),
        subtotal: cart.reduce((acc, item) => acc + item.fullPrice * item.quantity, 0),
        discount: cart.reduce((acc, item) => acc + (item.fullPrice * (item.discount / 100)) * item.quantity, 0),
        total: total,
        customerNotes: 'Ativação via Saldo da Carteira (SIGME)',
        shippingAddress: user.address,
        shippingMethod: shippingMethod,
        shippingCost: shippingCost,
        paymentMethod: 'wallet'
      };

      const checkoutRes = await sigmaApi.createCheckout(checkoutPayload);
      const checkoutData = checkoutRes.data || checkoutRes;

      if (!checkoutData.order?.id) {
        setPaymentError(checkoutData.error || 'Erro ao criar pedido para pagamento com saldo.');
        return;
      }

      // 2. Debitar saldo da carteira vinculando ao pedido
      const debitRes = await sigmaApi.debitWallet(user.id, total, checkoutData.order.id, 'Ativação de Ciclo Global (SIGME)');
      const debitData = debitRes.data || debitRes;

      if (debitData.success || debitRes.success) {
        setModalStep(6); // Success step
        refreshBalance();
      } else {
        setPaymentError(debitData.error || (debitRes as any).error || 'Erro ao debitar saldo da carteira.');
      }
    } catch (err) {
      console.error('Erro ao processar pagamento com saldo:', err);
      setPaymentError('Erro de conexão ao processar pagamento com saldo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayWithCard = async () => {
    if (cart.length === 0 || !user) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const payload = {
        buyerId: user.id,
        buyerEmail: user.email,
        buyerName: user.name,
        buyerPhone: user.phone || '',
        buyerCpf: user.cpfCnpj || user.cpf || '', // Envia vazio se não tiver, backend trata como undefined
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_final: item.fullPrice * (1 - item.discount / 100)
        })),
        subtotal: cart.reduce((acc, item) => acc + item.fullPrice * item.quantity, 0),
        discount: cart.reduce((acc, item) => acc + (item.fullPrice * (item.discount / 100)) * item.quantity, 0),
        total: total,
        customerNotes: 'Pedido via Ativação Manual (Frontend - Cartão)',
        shippingAddress: user.address,
        shippingMethod: shippingMethod,
        shippingCost: shippingCost,
        paymentMethod: 'checkout-pro'
      };

      const res = await sigmaApi.createCheckout(payload);

      console.log('🔍 [DEBUG] Resposta Checkout Pro FULL:', JSON.stringify(res, null, 2));

      // apiClient retorna { data: { success, order, payment }, success: true }
      // O "payment" está dentro de res.data
      const checkoutData = res.data || res;

      if (checkoutData.payment && checkoutData.payment.init_point) {
        // Redirecionar para o Checkout Pro do Mercado Pago
        window.location.href = checkoutData.payment.init_point;
      } else if (checkoutData.success && checkoutData.payment) {
        // Fallback caso a estrutura mude
        window.location.href = checkoutData.payment.init_point || checkoutData.payment.sandbox_init_point;
      } else {
        setPaymentError(checkoutData.error || res.error || 'Erro ao gerar sessão de pagamento no checkout.');
      }
    } catch (err) {
      console.error('Erro ao processar cartão:', err);
      setPaymentError('Erro interno ao processar checkout de cartão.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Estado para CPF editável no momento do checkout
  const [checkoutCpf, setCheckoutCpf] = useState(user.cpfCnpj || user.cpf || '');

  const handlePayWithPix = async () => {
    // Validação básica de CPF
    const sanitizedCpf = checkoutCpf.replace(/\D/g, '');
    if (sanitizedCpf.length !== 11) {
      setPaymentError("CPF inválido. Por favor, corrija o CPF acima (apenas números).");
      return;
    }

    if (!user || total <= 0) return;
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const payload = {
        buyerId: user.id,
        buyerEmail: user.email,
        buyerName: user.name,
        buyerPhone: user.phone || '',
        buyerCpf: sanitizedCpf, // CPF sanitizado do input
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_final: item.fullPrice * (1 - item.discount / 100)
        })),
        subtotal: cart.reduce((acc, item) => acc + item.fullPrice * item.quantity, 0),
        discount: cart.reduce((acc, item) => acc + (item.fullPrice * (item.discount / 100)) * item.quantity, 0),
        total: total,
        customerNotes: 'Pedido via Ativação Manual (Frontend - Pix)',
        shippingAddress: user.address,
        shippingMethod: shippingMethod,
        shippingCost: shippingCost,
        paymentMethod: 'pix'
      };

      console.log('🚀 [DEBUG] Enviando Payload Checkout:', payload);
      const res = await sigmaApi.createCheckout(payload);
      console.log('✅ [DEBUG] Resposta Checkout:', res);

      if (res.success && res.payment) {
        setPixPaymentData(res.payment);
        setModalStep(5); // Pix QR Code step
      } else {
        console.error('❌ [DEBUG] Erro Checkout:', res);
        setPaymentError(res.error || 'Erro ao gerar Pix no checkout.');
      }
    } catch (err) {
      console.error('❌ [DEBUG] Exception Checkout:', err);
      setPaymentError('Erro de conexão ao processar checkout.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const checkPixStatus = async () => {
    if (!pixPaymentData?.paymentId && !pixPaymentData?.id) return;
    const orderId = pixPaymentData.paymentId || pixPaymentData.id;
    setIsProcessingPayment(true);
    try {
      const res = await sigmaApi.getCheckoutStatus(orderId);
      if (res.success && (res.payment?.status === 'approved' || res.payment?.status === 'paid' || res.order?.payment_status === 'paid')) {
        setModalStep(6); // Sucesso
        refreshBalance();
      }
    } catch (err) {
      console.error("Erro ao verificar status PIX:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- CD Sorting Logic (Real Data) ---
  const federalSede = realCDs.find(cd => cd.isFederalSede);
  const regionalCDs = realCDs
    .filter(cd => cd !== federalSede)
    .sort((a, b) => (a.city || '').localeCompare(b.city || ''));

  const sortedCDs = [federalSede, ...regionalCDs].filter(Boolean);

  // --- Modal Renderers ---
  const renderManualModalContent = () => {
    switch (modalStep) {
      case 1: // CD Selection
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Passo 1: Escolha o CD</h3>
            <p className="text-sm text-gray-400">Selecione de onde seus produtos serão processados e enviados.</p>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {sortedCDs.map(cd => (
                <div key={cd.id} className={`flex items-center justify-between p-3 bg-brand-gray-light rounded-lg transition-all hover:bg-brand-gray ${cd.isFederalSede ? 'border-2 border-brand-gold/50' : ''}`}>
                  <button onClick={() => handleSelectCD(cd)} className="flex-grow text-left">
                    <div className="flex items-center gap-4">
                      <IconBuilding2 className="text-brand-gold flex-shrink-0" size={32} />
                      <div>
                        <p className={`font-semibold text-white ${cd.isFederalSede ? 'text-brand-gold' : ''}`}>{cd.name}</p>
                        <p className="text-sm text-gray-400">{cd.city}</p>
                      </div>
                    </div>
                  </button>
                  <a href={`https://wa.me/${cd.whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-3 bg-green-500/10 rounded-full hover:bg-green-500/30 text-green-400 ml-4 flex-shrink-0">
                    <IconWhatsapp size={24} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Product Selection
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-4">Passo 2: Escolha seus produtos</h3>
            <div className="flex-grow space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {realProducts.length > 0 ? realProducts.map(product => {
                const discountedPrice = product.fullPrice * (1 - product.discount / 100);
                return (
                  <div key={product.id} className="p-3 bg-brand-gray-light rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-lg font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                    </div>
                    <button onClick={() => addToCart(product, 1)} className="bg-brand-gold text-brand-dark font-bold py-2 px-3 rounded-lg hover:bg-yellow-400 flex items-center gap-1">
                      <IconPlus size={16} />
                    </button>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-400">
                  {loadingProducts ? 'Carregando produtos...' : 'Nenhum produto encontrado.'}
                </div>
              )}
            </div>
            <div className="pt-4 mt-4 border-t border-brand-gray-light flex justify-between items-center">
              <button onClick={() => setModalStep(1)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar para CDs</button>
              <button onClick={() => setModalStep(3)} disabled={cart.length === 0} className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 disabled:bg-brand-gray flex items-center gap-2">
                <IconShoppingCart size={16} />
                Ver Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})
              </button>
            </div>
          </div>
        );
      case 3: // Cart & Shipping
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Passo 3: Revisão e Entrega</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between pb-3 border-b border-brand-gray-light last:border-b-0">
                  <div className="text-sm text-white">{item.quantity}x {item.name}</div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><IconTrash size={16} /></button>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-brand-gray-light">
              <h4 className="font-semibold text-white">Método de Entrega</h4>
              {isLoadingShipping ? (
                <div className="py-4 text-center text-xs text-gray-400">Calculando frete...</div>
              ) : (
                <>
                  {shippingOptions.map(option => (
                    <label key={option.id} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${shippingMethod === String(option.id) ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                      <input type="radio" name="shipping" value={option.id} checked={shippingMethod === String(option.id)} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray" />
                      <IconTruck className="mx-3 text-brand-gold" />
                      <div className="flex-grow">
                        <span className="font-semibold block">{option.name}</span>
                        <span className="text-xs text-gray-400">{option.company?.name}</span>
                      </div>
                      <span className="font-bold text-brand-gold">{formatCurrency(Number(option.price))}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
            <div className="pt-4 border-t border-brand-gray-light">
              <div className="flex justify-between text-lg"><span className="text-white font-bold">Total:</span> <span className="font-extrabold text-brand-gold">{formatCurrency(total)}</span></div>
              <div className="pt-4 mt-4 flex justify-between">
                <button onClick={() => setModalStep(2)} className="text-sm text-gray-400 hover:text-white">Continuar Comprando</button>
                <button onClick={() => setModalStep(4)} className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400">Ir para Pagamento</button>
              </div>
            </div>
          </div>
        );
      case 4: // Payment Selection
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-center">Forma de Pagamento</h3>

            <div className="p-4 bg-brand-gray-light rounded-lg space-y-2 text-center mb-6">
              <span className="text-gray-400 text-sm">Total a pagar:</span>
              <p className="text-3xl font-black text-brand-gold">{formatCurrency(total)}</p>
            </div>
            <div className="space-y-3">
              {/* Botão Checkout Pro (Pix / Cartão) */}
              <button
                onClick={handlePayWithCard}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gold to-yellow-400 text-brand-dark font-bold py-4 rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-[1.02]"
              >
                {isProcessingPayment ? (
                  <>Processando...</>
                ) : (
                  <>
                    <IconCreditCard className="mr-1" /> Pagar com Pix / Cartão
                  </>
                )}
              </button>

              {/* Botão Pagar com Saldo */}
              <button
                onClick={handlePayWithWallet}
                disabled={isProcessingPayment || walletBalance < total}
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] ${walletBalance >= total
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                  }`}
              >
                {isProcessingPayment ? (
                  <>Processando...</>
                ) : (
                  <>
                    💰 Pagar com Saldo
                    <span className="text-xs ml-1 opacity-80">
                      (Disponível: R$ {walletBalance.toFixed(2)})
                    </span>
                  </>
                )}
              </button>
              {walletBalance < total && walletBalance > 0 && (
                <p className="text-xs text-yellow-400/80 text-center">
                  Saldo insuficiente. Faltam R$ {(total - walletBalance).toFixed(2)}
                </p>
              )}

              <button onClick={() => setModalStep(3)} className="w-full text-center text-gray-400 text-sm hover:text-white mt-4">
                Voltar ao Carrinho
              </button>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-center mt-4">
                <p className="text-red-400 text-sm font-bold">{paymentError}</p>
              </div>
            )}
          </div>
        );
      case 5: // Pix QR Code (LEGADO - Agora via Checkout Pro)
        return (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-black text-white">Pagamento via Pix</h3>
            <div className="bg-white p-4 rounded-xl mx-auto max-w-[200px] border-4 border-brand-gold/20">
              {pixPaymentData?.qr_code_base64 ? (
                <img src={`data:image/png;base64,${pixPaymentData.qr_code_base64}`} alt="QR Code Pix" className="w-full h-auto" />
              ) : (
                <div className="w-full h-[160px] flex items-center justify-center text-brand-dark font-bold text-xs uppercase">Gerando QR...</div>
              )}
            </div>
            <div className="bg-brand-gray-light p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Copia e Cola</p>
              <div className="flex items-center gap-2">
                <input readOnly value={pixPaymentData?.qr_code || ''} className="bg-transparent text-[10px] text-white flex-grow focus:outline-none font-mono truncate" />
                <button onClick={() => { navigator.clipboard.writeText(pixPaymentData?.qr_code || ''); alert('PIX Copiado!'); }} className="text-brand-gold text-xs font-bold whitespace-nowrap">COPIAR</button>
              </div>
            </div>
            <div className="space-y-3">
              <button onClick={checkPixStatus} disabled={isProcessingPayment} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                {isProcessingPayment ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><IconCheckCircle size={18} /> Verificar Pagamento</>}
              </button>
              <button onClick={resetManualModal} className="text-sm text-gray-500 hover:text-white">Cancelar e Sair</button>
            </div>
          </div>
        );
      case 6: // Success
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <IconCheckCircle size={48} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Sucesso Total!</h3>
              <p className="text-gray-400 mt-2">Sua ativação para o próximo ciclo foi confirmada e processada.</p>
            </div>
            <button onClick={resetManualModal} className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all">
              Voltar ao Início
            </button>
          </div>
        );
      default: return null;
    }
  };

  const renderAutoConfigModalContent = () => {
    switch (autoConfigStep) {
      case 1: // CD Selection
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Passo 1: Escolha o CD</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {sortedCDs.map(cd => (
                <div key={cd.id} className={`flex items-center justify-between p-3 bg-brand-gray-light rounded-lg transition-all hover:bg-brand-gray ${cd.isFederalSede ? 'border-2 border-brand-gold/50' : ''}`}>
                  <button onClick={() => handleSelectAutoCD(cd)} className="flex-grow text-left">
                    <div className="flex items-center gap-4">
                      <IconBuilding2 className="text-brand-gold flex-shrink-0" size={32} />
                      <div>
                        <p className={`font-semibold text-white ${cd.isFederalSede ? 'text-brand-gold' : ''}`}>{cd.name}</p>
                        <p className="text-sm text-gray-400">{cd.city}</p>
                      </div>
                    </div>
                  </button>
                  <a href={`https://wa.me/${cd.whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-3 bg-green-500/10 rounded-full hover:bg-green-500/30 text-green-400 ml-4 flex-shrink-0" aria-label={`Contact ${cd.name} on WhatsApp`}>
                    <IconWhatsapp size={24} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Product Selection
        return (
          <div className="space-y-4">
            <button onClick={() => setAutoConfigStep(1)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar para CDs</button>
            <h3 className="text-xl font-bold text-white">Passo 2: Escolha o produto para ativação</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {realProducts.length > 0 ? realProducts.map(product => {
                const discountedPrice = product.fullPrice * (1 - product.discount / 100);
                const isSelected = tempSelectedProduct?.id === product.id;
                return (
                  <button key={product.id} onClick={() => setTempSelectedProduct(product)} className={`w-full text-left p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gray border-2 transition-all ${isSelected ? 'border-brand-gold' : 'border-transparent'}`}>
                    <p className="font-semibold text-white">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                    </div>
                  </button>
                );
              }) : (
                <div className="text-center py-8 text-gray-400">
                  {loadingProducts ? 'Carregando produtos...' : 'Nenhum produto encontrado.'}
                </div>
              )}
            </div>
            <button onClick={() => { if (tempSelectedProduct) setAutoConfigStep(3); }} disabled={!tempSelectedProduct} className="w-full bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 mt-4 disabled:bg-brand-gray disabled:cursor-not-allowed">Continuar</button>
          </div>
        );
      case 3: // Shipping Selection
        return (
          <div className="space-y-4">
            <button onClick={() => setAutoConfigStep(2)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar para Produtos</button>
            <h3 className="text-xl font-bold text-white">Passo 3: Defina a entrega</h3>
            <div className="space-y-2">
              {isLoadingAutoShipping ? (
                <div className="py-4 text-center text-xs text-gray-400">Calculando frete real...</div>
              ) : (
                <>
                  {autoShippingOptions.map(option => (
                    <label key={option.id} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${tempShippingMethod === String(option.id) ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray hover:border-gray-600'}`}>
                      <input type="radio" name="tempShipping" value={option.id} checked={tempShippingMethod === String(option.id)} onChange={(e) => setTempShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray" />
                      <IconTruck className="mx-3 text-brand-gold" />
                      <div className="flex-grow">
                        <span className="font-semibold block">{option.name}</span>
                        <span className="text-xs text-gray-400">{option.company?.name} - {option.delivery_time} dias úteis</span>
                      </div>
                      <span className="font-bold text-brand-gold">{formatCurrency(Number(option.price))}</span>
                    </label>
                  ))}

                  {autoShippingOptions.length === 0 && !isLoadingAutoShipping && (
                    <p className="text-[10px] text-yellow-500/80 italic">Cotação dinâmica indisponível. Usando configuração manual.</p>
                  )}
                </>
              )}
            </div>
            <button onClick={handleSaveAutoConfig} className="w-full bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 mt-4">Salvar Configuração e Ativar</button>
          </div>
        );
      case 4: // Success
        return (
          <div className="text-center space-y-4 py-8">
            <IconCheckCircle size={48} className="mx-auto text-green-400" />
            <h3 className="text-2xl font-bold text-white">Configuração Salva!</h3>
            <p className="text-gray-300">A ativação automática foi ativada. O sistema entrará no próximo ciclo usando seu saldo assim que os critérios forem atingidos.</p>
            <button onClick={() => resetAutoConfigModal(false)} className="w-full bg-brand-gray-light font-semibold py-2 px-4 rounded-lg hover:bg-brand-gray mt-4">Fechar</button>
          </div>
        );
      default: return null;
    }
  };

  // --- Data Loading ---
  const [stats, setStats] = useState<any>(null);
  const [journey, setJourney] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const resStats = await sigmaApi.getStats();
      if (resStats.success) setStats(resStats.data);

      const resJourney = await sigmaApi.getCycleJourney();
      if (resJourney.success) setJourney(resJourney.data || []);

      const resConfig = await sigmaApi.getUserConfig();
      if (resConfig.success && resConfig.data) {
        setIsAutoReinvestActive(resConfig.data.autoReinvest);
        setSavedAutoConfigData(resConfig.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados SIGME:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers ---
  const handleAutoReinvestToggle = async () => {
    const newState = !isAutoReinvestActive;
    if (newState && (!autoReinvestConfig.product || !autoReinvestConfig.distributionCenter)) {
      handleOpenAutoConfig();
    } else {
      setIsAutoReinvestActive(newState);
      await sigmaApi.saveUserConfig({
        autoReinvest: newState,
        productId: autoReinvestConfig.product?.id,
        cdId: autoReinvestConfig.distributionCenter?.id
      });
    }
  };

  const handleOpenAutoConfig = () => {
    setTempSelectedProduct(autoReinvestConfig.product);
    setTempShippingMethod(autoReinvestConfig.shippingMethod);
    setTempSelectedDistributionCenter(autoReinvestConfig.distributionCenter);
    setAutoConfigStep(autoReinvestConfig.distributionCenter ? 2 : 1);
    setIsAutoConfigModalOpen(true);
  };

  const resetAutoConfigModal = (open = false) => {
    setIsAutoConfigModalOpen(open);
    setAutoConfigStep(1);
    setTempSelectedProduct(null);
    setTempShippingMethod('correios');
    setTempSelectedDistributionCenter(null);
  };

  const handleSaveAutoConfig = async () => {
    if (tempSelectedProduct && tempSelectedDistributionCenter) {
      const config = {
        product: tempSelectedProduct,
        shippingMethod: tempShippingMethod,
        distributionCenter: tempSelectedDistributionCenter,
      };
      setAutoReinvestConfig(config);
      setIsAutoReinvestActive(true);

      const res = await sigmaApi.saveUserConfig({
        autoReinvest: true,
        productId: tempSelectedProduct.id,
        cdId: tempSelectedDistributionCenter.id,
        shippingMethod: tempShippingMethod
      });

      if (res.success) {
        setAutoConfigStep(4); // Show success step
      } else {
        alert('Erro ao salvar configuração: ' + (res.error || 'Erro desconhecido'));
      }
    }
  };

  const totalAcumulado = stats?.totalEarnings || 0;
  const totalCiclosConcluidos = (journey || []).filter(j => j.completed > 0).length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-gold">Bônus Matriz SIGME</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-brand-gray-light rounded-full">
            <IconHandCoins size={24} className="text-brand-gold" />
          </div>
          <div>
            <h4 className="text-sm text-brand-text-dim">Ganhos Acumulados</h4>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalAcumulado)}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-brand-gray-light rounded-full">
            <IconGitFork size={24} className="text-brand-gold" />
          </div>
          <div>
            <h4 className="text-sm text-brand-text-dim">Ciclos Concluídos</h4>
            <p className="text-2xl font-bold text-white">{totalCiclosConcluidos}</p>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Ativação para o Próximo Ciclo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Painel Automático */}
          <Card className="bg-brand-gray-light p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Ativação Automática</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">Configure a ativação automática para entrar no próximo ciclo usando seu saldo em carteira.</p>

            <div className="space-y-4">
              <label htmlFor="auto-reinvest-toggle" className="flex items-center justify-between cursor-pointer p-3 bg-brand-gray rounded-lg">
                <span className="font-semibold text-white">Reinvestimento automático</span>
                <div className="relative">
                  <input type="checkbox" id="auto-reinvest-toggle" className="sr-only peer" checked={isAutoReinvestActive} onChange={handleAutoReinvestToggle} />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                </div>
              </label>
              {isAutoReinvestActive && autoReinvestConfig.product && autoReinvestConfig.distributionCenter && (
                <div className="text-xs text-gray-400 bg-brand-gray p-2 rounded-md space-y-1">
                  <p>CD: <span className="font-semibold text-gray-300">{autoReinvestConfig.distributionCenter.name}</span></p>
                  <p>Produto: <span className="font-semibold text-gray-300">{autoReinvestConfig.product.name}</span></p>
                </div>
              )}
              <button onClick={handleOpenAutoConfig} className="w-full bg-brand-gray text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                Configurar
              </button>
            </div>
          </Card>

          {/* Painel Manual */}
          <Card className="bg-brand-gray-light p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Ativação Manual</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">Ative manualmente comprando produtos. Você poderá pagar com saldo ou outros meios.</p>
            <button
              onClick={() => setIsActivationModalOpen(true)}
              className="w-full bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Ativar Manualmente
            </button>
          </Card>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-6 text-center md:text-left">
            <IconGitFork size={40} className="text-brand-gold flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-white">Estrutura do Ciclo Atual</h2>
              <p className="text-gray-400 mt-1 max-w-md">Visualize sua rede de 6 indicados do ciclo atual para acompanhar seu progresso de fechamento.</p>
            </div>
          </div>
          <Link
            to="/consultant/sigme/arvore-interativa/ciclo-global"
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
          >
            Abrir Árvore Interativa
          </Link>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Sua Jornada de Ciclos</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {(() => {
            let hasRenderedNextCycleCard = false;
            // Se journey estiver vazio, o primeiro card é o Ciclo 1 como "Próximo"
            const displayedJourney = journey.length > 0 ? journey : [{ level: 1, completed: 0, bonus: 108 }];

            return displayedJourney.map((summary, idx) => {
              if (summary.completed > 0) {
                return ( // --- Completed Card ---
                  <div key={summary.level} className="w-60 h-72 flex-shrink-0 bg-brand-gray border border-brand-gold/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent"></div>
                    <div className="relative z-10 text-center">
                      <h3 className="text-lg font-bold text-white">Ciclo {summary.level}</h3>
                      <div className="my-6">
                        <IconCheckCircle size={48} className="mx-auto text-green-400" />
                        <p className="mt-2 text-sm font-semibold text-green-400">Concluído</p>
                      </div>
                    </div>
                    <div className="relative z-10 text-center">
                      <p className="text-sm text-gray-400 flex items-center justify-center gap-2"><IconShoppingCart size={14} />Bônus de Ativação</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(summary.bonus || 108.00)}</p>
                    </div>
                  </div>
                );
              } else if (!hasRenderedNextCycleCard) {
                hasRenderedNextCycleCard = true;
                if (isAutoReinvestActive && autoReinvestConfig.product) {
                  return (
                    <div key={summary.level} className="w-60 h-72 flex-shrink-0 bg-brand-gray-light border-2 border-green-500 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-lg">
                      <IconCheckCircle size={40} className="text-green-400" />
                      <h3 className="text-lg font-bold text-white mt-4">Ativação Automática</h3>
                      <p className="text-7xl font-extrabold text-green-400 my-4">{summary.level}</p>
                      <p className="text-sm text-gray-300">será ativado ao final do ciclo atual.</p>
                    </div>
                  );
                }
                return ( // --- Next to Activate Card ---
                  <div key={summary.level} className="w-60 h-72 flex-shrink-0 bg-brand-gray-light border-2 border-brand-gold rounded-xl p-4 flex flex-col justify-center items-center text-center animate-pulse-gold shadow-gold-glow-lg">
                    <h3 className="text-lg font-bold text-white">Próximo Ciclo</h3>
                    <p className="text-7xl font-extrabold text-brand-gold my-4">{summary.level}</p>
                    <p className="text-sm text-gray-300 mb-6">Pronto para ativar!</p>
                    <button
                      onClick={() => setIsActivationModalOpen(true)}
                      className="w-full bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      Ativar Novo Ciclo
                    </button>
                  </div>
                );
              } else {
                return ( // --- Locked Card ---
                  <div key={summary.level} className="w-60 h-72 flex-shrink-0 bg-brand-gray-light opacity-60 border border-dashed border-brand-gray rounded-xl p-4 flex flex-col justify-center items-center text-center">
                    <IconLock size={40} className="text-gray-500" />
                    <p className="text-6xl font-extrabold text-gray-600 my-4">{summary.level}</p>
                    <p className="font-semibold text-gray-500">Bloqueado</p>
                  </div>
                );
              }
            });
          })()}
        </div>
      </div>

      <Modal isOpen={isActivationModalOpen} onClose={resetManualModal} title="Ativação Manual de Ciclo">
        {renderManualModalContent()}
      </Modal>

      <Modal isOpen={isAutoConfigModalOpen} onClose={() => resetAutoConfigModal()} title="Configurar Ativação Automática">
        {renderAutoConfigModalContent()}
      </Modal>

      <style>{`
            @keyframes pulse-gold {
              0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
              50% { box-shadow: 0 0 15px 8px rgba(255, 215, 0, 0); }
            }
            .animate-pulse-gold { animation: pulse-gold 2.5s infinite; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

            .form-radio, .form-checkbox { appearance: none; -webkit-appearance: none; -moz-appearance: none; width: 1.25rem; height: 1.25rem; border: 2px solid #4a5563; border-radius: 50%; display: inline-block; vertical-align: middle; position: relative; cursor: pointer; }
            .form-checkbox { border-radius: 0.25rem; }
            .form-radio:checked, .form-checkbox:checked { background-color: #ffd700; border-color: #ffd700; }
            .form-radio:checked::after { content: ''; display: block; width: 0.625rem; height: 0.625rem; background: #121212; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .form-checkbox:checked::after { content: '✓'; display: block; font-size: 1rem; line-height: 1.25rem; font-weight: bold; color: #121212; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        `}</style>
    </div>
  );
};

export default CicloGlobal;