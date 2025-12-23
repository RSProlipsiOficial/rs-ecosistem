import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { CreditCardData } from '../types';
import { INSTALLMENTS_OPTIONS } from '../constants';
import { useCheckout } from '../context/CheckoutContext';

interface CardPaymentProps {
  amount: number;
  isLoading: boolean;
  onSubmit: (data: CreditCardData) => void;
}

// Luhn Algorithm Implementation for Card Number Validation
const validateLuhn = (cardNumber: string) => {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) return false;
  
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i));

    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
};

// Card Brand Detection Helper
const getCardBrand = (number: string) => {
  const clean = number.replace(/\D/g, '');
  if (clean.match(/^4/)) return { name: 'Visa', color: 'text-blue-400' };
  if (clean.match(/^5[1-5]/)) return { name: 'Mastercard', color: 'text-red-400' };
  if (clean.match(/^3[47]/)) return { name: 'Amex', color: 'text-blue-300' };
  if (clean.match(/^6(?:011|5)/)) return { name: 'Discover', color: 'text-orange-400' };
  if (clean.match(/^606282|^3841(?:0|4|6)0|^60/)) return { name: 'Hipercard', color: 'text-red-500' };
  if (clean.match(/^4011(78|79)|^431274|^438935|^451416|^457631|^457632|^504175|^627780|^636297|^636368|^636369|^650031|^650032|^650033/)) return { name: 'Elo', color: 'text-yellow-500' };
  return null;
};

export const CardPayment: React.FC<CardPaymentProps> = ({ amount, isLoading, onSubmit }) => {
  const { setInstallments } = useCheckout();
  
  const [formData, setFormData] = useState<CreditCardData>({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
    installments: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardBrand, setCardBrand] = useState<{name: string, color: string} | null>(null);

  // Sync initial installment
  useEffect(() => {
    setInstallments(formData.installments);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Simple formatting masks
    let formattedValue: string | number = value;
    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
      setCardBrand(getCardBrand(formattedValue as string));
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'holder') {
        formattedValue = value.toUpperCase();
    } else if (name === 'installments') {
        formattedValue = parseInt(value, 10);
        setInstallments(formattedValue); // Update Global Context
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user types
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // 1. Validate Card Number (Luhn)
    const cleanNumber = formData.number.replace(/\D/g, '');
    if (cleanNumber.length < 13 || !validateLuhn(cleanNumber)) {
        newErrors.number = 'Número de cartão inválido.';
    }

    // 2. Validate CVV
    const cleanCVV = formData.cvv.replace(/\D/g, '');
    if (cleanCVV.length < 3 || cleanCVV.length > 4) {
        newErrors.cvv = 'CVV inválido.';
    }

    // 3. Validate Holder
    if (!formData.holder.trim()) {
        newErrors.holder = 'Nome impresso obrigatório.';
    }

    // 4. Validate Expiry (Simple format check MM/AA)
    const [month, year] = formData.expiry.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
        newErrors.expiry = 'Data inválida.';
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Vibrate for mobile feedback
        if (navigator.vibrate) navigator.vibrate(200);
        return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <Input
            label="Número do Cartão"
            name="number"
            placeholder="0000 0000 0000 0000"
            value={formData.number}
            onChange={handleChange}
            icon={<CreditCard className="w-5 h-5" />}
            error={errors.number}
            required
        />
        {cardBrand && (
            <div className={`absolute top-[1.95rem] right-3 text-xs font-bold uppercase tracking-wider ${cardBrand.color} bg-[#161920] px-2 py-0.5 rounded border border-rs-border shadow-sm`}>
                {cardBrand.name}
            </div>
        )}
      </div>

      <Input
        label="Nome Impresso no Cartão"
        name="holder"
        placeholder="NOME COMO NO CARTÃO"
        value={formData.holder}
        onChange={handleChange}
        icon={<User className="w-5 h-5" />}
        error={errors.holder}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Validade"
          name="expiry"
          placeholder="MM/AA"
          value={formData.expiry}
          onChange={handleChange}
          icon={<Calendar className="w-5 h-5" />}
          error={errors.expiry}
          required
        />
        <Input
          label="CVV"
          name="cvv"
          placeholder="123"
          type="password"
          value={formData.cvv}
          onChange={handleChange}
          icon={<Lock className="w-5 h-5" />}
          error={errors.cvv}
          required
        />
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-rs-muted uppercase tracking-wider mb-1.5 ml-1">
          Parcelamento
        </label>
        <div className="relative">
            <select
                name="installments"
                value={formData.installments}
                onChange={handleChange}
                className="block w-full bg-rs-card border border-rs-border rounded-xl text-rs-text focus:border-rs-gold focus:ring-1 focus:ring-rs-gold focus:outline-none transition-all duration-200 pl-4 pr-10 py-3 appearance-none"
            >
                {INSTALLMENTS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label} - R$ {(amount / opt.value).toFixed(2)}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-rs-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                </svg>
            </div>
        </div>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} className="mt-6">
        Pagar R$ {amount.toFixed(2)}
      </Button>
      
      <div className="flex items-center justify-center gap-2 text-xs text-rs-muted">
        <Lock className="w-3 h-3" />
        <span>Pagamento processado em ambiente seguro com criptografia AES.</span>
      </div>
    </form>
  );
};