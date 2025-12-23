

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  BOLETO = 'BOLETO',
  WALLET_BALANCE = 'WALLET_BALANCE',
  PAY_IN_STORE = 'PAY_IN_STORE',
}

export enum CheckoutStep {
  IDENTIFICATION = 'IDENTIFICATION',
  REVIEW = 'REVIEW',
  PAYMENT = 'PAYMENT',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: 'PHYSICAL' | 'DIGITAL';
  sku?: string;
}

export interface OrderBump {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CONSULTANT' | 'STORE' | 'CUSTOMER';
}

export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface ShippingQuote {
  id: string;
  name: string;
  price: number;
  days: number;
  icon?: string;
  arrivalDate: string; 
  isFastest?: boolean;
  isBestPrice?: boolean;
}

export interface CustomerData {
  email: string;
  cpf: string;
  name: string;       
  phone: string;      
  birthDate: string;  
  address?: Address;
  hasAcceptedTerms: boolean;
}

export interface CreditCardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  installments: number;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  orderBump: number;
  balanceUsed: number;
  total: number;
  sigmaPoints: number; 
  quantity: number;
}

export interface TransactionResult {
  orderId: string;
  status: 'APPROVED' | 'PENDING' | 'AWAITING_STORE_PAYMENT' | 'FAILED';
  message: string;
  pixCode?: string;
  boletoUrl?: string;
}

// --- Context Types ---

export interface CheckoutState {
  step: CheckoutStep;
  customer: CustomerData;
  paymentMethod: PaymentMethod;
  orderSummary: OrderSummary;
  product: Product;
  error: string | null;
  loading: boolean;
  refCode: string | null;
  installments: number;
  
  shippingQuotes: ShippingQuote[];
  selectedShippingQuote: ShippingQuote | null;

  isOrderBumpSelected: boolean;
  orderBumpProduct: OrderBump;
  couponCode: string | null;
  discountAmount: number;
  
  walletBalance: number;
  balanceToUse: number; // Replaced useWalletBalance boolean
}

export interface CheckoutContextData extends CheckoutState {
  setStep: (step: CheckoutStep) => void;
  updateCustomer: (data: Partial<CustomerData>) => void; 
  setPaymentMethod: (method: PaymentMethod) => void;
  setInstallments: (n: number) => void;
  processCheckout: (cardData?: CreditCardData) => Promise<void>;
  clearError: () => void;
  
  fetchShippingQuotes: (zipCode: string) => Promise<void>;
  selectShippingQuote: (quote: ShippingQuote) => void;

  toggleOrderBump: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  setBalanceToUse: (amount: number) => void; // Replaced toggleWalletBalance
}
