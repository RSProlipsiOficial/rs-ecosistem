
import { CreditCardData, PaymentMethod, TransactionResult, Address, ShippingQuote } from '../types';
import { MOCK_USER, WALLET_COMMISSION_PERCENTAGE } from '../constants';

// Utility delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- ADDRESS SERVICE (Real API via ViaCEP) ---

export const getAddressByCep = async (cep: string): Promise<Address | null> => {
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error("CEP não encontrado");
    }

    return {
      zipCode: cleanCep,
      street: data.logouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      number: '', // User must fill this
      complement: ''
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    // Fallback or rethrow depending on strategy. 
    // For this demo, we return null to let the user fill manually if offline.
    return null;
  }
};

// --- SHIPPING SERVICE (Robust Calculation) ---

const addBusinessDays = (startDate: Date, daysToAdd: number): Date => {
  const result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // 0 is Sunday, 6 is Saturday. Skip them.
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  return result;
};

const formatDatePTBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
};

export const getShippingQuotes = async (zipCode: string): Promise<ShippingQuote[]> => {
  await delay(800); // Simulate API latency

  const cleanCep = zipCode.replace(/\D/g, '');
  const regionDigit = parseInt(cleanCep.charAt(0));

  // Logic: Determine Base Cost & Days based on Region (First Digit)
  // 0, 1 = SP (Local)
  // 2 = RJ/ES
  // 3 = MG
  // 4 = BA/SE
  // 5 = NE
  // 6 = NO
  // 7 = CO
  // 8 = PR/SC
  // 9 = RS
  
  let basePrice = 15.00;
  let baseDays = 2;

  if (regionDigit >= 2 && regionDigit <= 3) { // Sudeste (non-SP)
    basePrice = 22.00;
    baseDays = 3;
  } else if (regionDigit === 8 || regionDigit === 9) { // Sul
    basePrice = 28.00;
    baseDays = 4;
  } else if (regionDigit === 7) { // Centro-Oeste
    basePrice = 35.00;
    baseDays = 5;
  } else { // Norte/Nordeste
    basePrice = 45.00;
    baseDays = 8;
  }

  const today = new Date();

  // Generate Options
  const quotes: ShippingQuote[] = [
    {
      id: 'pac',
      name: 'Correios PAC',
      price: basePrice,
      days: baseDays + 2,
      icon: 'box',
      arrivalDate: formatDatePTBR(addBusinessDays(today, baseDays + 2)),
      isBestPrice: true
    },
    {
      id: 'sedex',
      name: 'Correios SEDEX',
      price: basePrice * 1.8,
      days: Math.max(1, baseDays - 1),
      icon: 'truck',
      arrivalDate: formatDatePTBR(addBusinessDays(today, Math.max(1, baseDays - 1))),
      isFastest: true
    },
    {
      id: 'jadlog',
      name: 'Jadlog Express',
      price: basePrice * 1.4,
      days: baseDays,
      icon: 'truck',
      arrivalDate: formatDatePTBR(addBusinessDays(today, baseDays))
    }
  ];

  // Special "Motoboy" for São Paulo Capital (CEPs starting with 01-05)
  const spCapitalRegex = /^0[1-5]/;
  if (spCapitalRegex.test(cleanCep)) {
    quotes.push({
      id: 'moto',
      name: 'Flash Moto (Entrega hoje)',
      price: 18.90,
      days: 0,
      icon: 'moto',
      arrivalDate: 'Hoje, até as 22h',
      isFastest: true
    });
    // Adjust badges if Moto exists
    const sedex = quotes.find(q => q.id === 'sedex');
    if (sedex) sedex.isFastest = false;
  }

  return quotes.sort((a, b) => a.price - b.price);
};

// --- PAYMENT SERVICE ---

export const processPayment = async (
  amount: number, 
  method: PaymentMethod, 
  cardData?: CreditCardData
): Promise<TransactionResult> => {
  console.log(`[API] Processing Payment: ${method}`, { amount, cardData });
  
  await delay(2000); // Simulate processing

  // Handle Pay in Store specifically
  if (method === PaymentMethod.PAY_IN_STORE) {
    return {
      orderId: `ORD-${Date.now()}`,
      status: 'AWAITING_STORE_PAYMENT',
      message: 'Pedido finalizado. Aguardando pagamento na loja.'
    };
  }

  // Simulate success for other methods
  return {
    orderId: `ORD-${Date.now()}`,
    status: 'APPROVED',
    message: 'Pagamento aprovado com sucesso.',
    pixCode: method === PaymentMethod.PIX ? '00020126580014BR.GOV.BCB.PIX...' : undefined,
    boletoUrl: method === PaymentMethod.BOLETO ? 'https://boleto.url/123' : undefined
  };
};
