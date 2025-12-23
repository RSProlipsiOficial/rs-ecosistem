
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CheckoutStep, 
  CustomerData, 
  PaymentMethod, 
  OrderSummary, 
  CheckoutContextData, 
  CreditCardData,
  ShippingQuote
} from '../types';
import { MOCK_PRODUCT, POINTS_MULTIPLIER, MOCK_ORDER_BUMP, VALID_COUPONS, MOCK_WALLET_BALANCE } from '../constants';
import { processPayment, getShippingQuotes } from '../services/api';
import { pixel } from '../services/pixel';

const CheckoutContext = createContext<CheckoutContextData | undefined>(undefined);

const STORAGE_KEY = 'rs_checkout_state_v1';

interface CheckoutProviderProps {
  children: ReactNode;
}

const INITIAL_PRODUCT = MOCK_PRODUCT;
const INITIAL_QUANTITY = 1;

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [step, setStepState] = useState<CheckoutStep>(CheckoutStep.IDENTIFICATION);
  
  const [customer, setCustomer] = useState<CustomerData>({
    email: '', cpf: '', name: '', phone: '', birthDate: '', hasAcceptedTerms: false, address: undefined
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  const [installments, setInstallments] = useState<number>(1);
  const [refCode, setRefCode] = useState<string | null>(null);
  
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [selectedShippingQuote, setSelectedShippingQuote] = useState<ShippingQuote | null>(null);

  const [isOrderBumpSelected, setIsOrderBumpSelected] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [walletBalance] = useState(MOCK_WALLET_BALANCE);
  const [balanceToUse, setBalanceToUseState] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- DERIVED STATE & CALCULATIONS ---
  const shippingCost = INITIAL_PRODUCT.type === 'DIGITAL' 
    ? 0 
    : (selectedShippingQuote?.price || 0);
  
  const subtotal = INITIAL_PRODUCT.price * INITIAL_QUANTITY;
  const bumpPrice = isOrderBumpSelected ? MOCK_ORDER_BUMP.price : 0;
  
  const preBalanceTotal = subtotal + shippingCost + bumpPrice - discountAmount;
  
  const balanceUsed = balanceToUse;
  const finalTotal = Math.max(0, preBalanceTotal - balanceUsed);
  
  const orderSummary: OrderSummary = {
    subtotal: subtotal,
    shipping: shippingCost,
    orderBump: bumpPrice,
    discount: discountAmount,
    balanceUsed: balanceUsed,
    total: finalTotal,
    sigmaPoints: Math.floor(finalTotal * POINTS_MULTIPLIER),
    quantity: INITIAL_QUANTITY
  };
  
  const setStep = (newStep: CheckoutStep) => {
    if (newStep !== step) {
       if (newStep === CheckoutStep.PAYMENT) pixel.track('AddPaymentInfo');
    }
    setStepState(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // --- ACTIONS ---
  const setBalanceToUse = (amount: number) => {
    const amountAsNumber = Number(amount) || 0;
    const clampedAmount = Math.max(0, Math.min(amountAsNumber, walletBalance, preBalanceTotal));
    setBalanceToUseState(clampedAmount);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) setRefCode(ref);
    }
    pixel.track('InitiateCheckout', { value: orderSummary.total, currency: 'BRL', content_name: INITIAL_PRODUCT.name });
  }, []);
  
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.step !== CheckoutStep.SUCCESS) {
            setStepState(parsed.step);
            setCustomer(parsed.customer);
            setPaymentMethod(parsed.paymentMethod);
            if (parsed.refCode) setRefCode(parsed.refCode);
            if (parsed.selectedShippingQuote) setSelectedShippingQuote(parsed.selectedShippingQuote);
            if (parsed.isOrderBumpSelected) setIsOrderBumpSelected(parsed.isOrderBumpSelected);
            if (parsed.couponCode) { setCouponCode(parsed.couponCode); setDiscountAmount(parsed.discountAmount || 0); }
            if (parsed.balanceToUse) setBalanceToUse(parsed.balanceToUse);
        }
      } catch (e) { console.error("Failed to parse stored state", e); }
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      step, customer, paymentMethod, refCode, selectedShippingQuote, 
      isOrderBumpSelected, couponCode, discountAmount, balanceToUse
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [step, customer, paymentMethod, refCode, selectedShippingQuote, isOrderBumpSelected, couponCode, discountAmount, balanceToUse]);

  const updateCustomer = (data: Partial<CustomerData>) => setCustomer(prev => ({ ...prev, ...data }));
  const fetchShippingQuotesAction = async (zipCode: string) => {
    if (INITIAL_PRODUCT.type === 'DIGITAL') return;
    setSelectedShippingQuote(null);
    try {
      const quotes = await getShippingQuotes(zipCode);
      setShippingQuotes(quotes);
    } catch (e) { console.error("Failed to fetch shipping", e); }
  };
  const selectShippingQuote = (quote: ShippingQuote) => setSelectedShippingQuote(quote);
  const toggleOrderBump = () => setIsOrderBumpSelected(prev => !prev);

  const applyCoupon = (code: string): boolean => {
    const normalizedCode = code.toUpperCase();
    const discount = VALID_COUPONS[normalizedCode];
    if (discount !== undefined) {
      setCouponCode(normalizedCode);
      if (discount < 1) setDiscountAmount((subtotal + bumpPrice) * discount);
      else setDiscountAmount(discount);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const processCheckout = async (cardData?: CreditCardData) => {
    setLoading(true);
    setError(null);
    try {
      setStep(CheckoutStep.PROCESSING);

      const finalPaymentMethod = orderSummary.total <= 0 && balanceToUse > 0 ? PaymentMethod.WALLET_BALANCE : paymentMethod;
      console.log('Processing order for:', customer, 'Ref:', refCode, 'Bump:', isOrderBumpSelected, 'Payment Method:', finalPaymentMethod, 'Balance Used:', orderSummary.balanceUsed);
      
      const result = await processPayment(orderSummary.total, finalPaymentMethod, cardData);
      
      if (result.status === 'APPROVED' || result.status === 'AWAITING_STORE_PAYMENT') {
        pixel.track('Purchase', { value: preBalanceTotal, currency: 'BRL', order_id: result.orderId });
        setStep(CheckoutStep.SUCCESS);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao processar pagamento.');
      setStep(CheckoutStep.PAYMENT);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <CheckoutContext.Provider value={{
      step, setStep, customer, updateCustomer, paymentMethod, setPaymentMethod,
      installments, setInstallments, refCode, orderSummary, product: INITIAL_PRODUCT,
      error, clearError, loading, processCheckout, shippingQuotes, selectedShippingQuote,
      fetchShippingQuotes: fetchShippingQuotesAction, selectShippingQuote,
      isOrderBumpSelected, orderBumpProduct: MOCK_ORDER_BUMP, couponCode, discountAmount,
      toggleOrderBump, applyCoupon, removeCoupon, walletBalance, balanceToUse, setBalanceToUse
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextData => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
