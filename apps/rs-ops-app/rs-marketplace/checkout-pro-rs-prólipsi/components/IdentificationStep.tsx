import React, { useState, useRef } from 'react';
import { Mail, FileText, Lock, CheckCircle2, Square, CheckSquare, User, Phone, Calendar, MapPin, Truck, Box, Zap, AlertCircle, Search, Loader2, Bike, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomerData, Address } from '../types';
import { getAddressByCep } from '../services/api';
import { useCheckout } from '../context/CheckoutContext';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal'; // Import Modal

interface IdentificationStepProps {
  initialData: CustomerData;
  onComplete: (data: CustomerData) => void;
}

export const IdentificationStep: React.FC<IdentificationStepProps> = ({ initialData, onComplete }) => {
  const { product, fetchShippingQuotes, shippingQuotes, selectedShippingQuote, selectShippingQuote } = useCheckout();
  const isPhysical = product.type === 'PHYSICAL'; 

  // Modal State
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Refs for focus management
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Personal Data State
  const [email, setEmail] = useState(initialData.email || '');
  const [cpf, setCpf] = useState(initialData.cpf || '');
  const [name, setName] = useState(initialData.name || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [birthDate, setBirthDate] = useState(initialData.birthDate || '');
  const [acceptedTerms, setAcceptedTerms] = useState(initialData.hasAcceptedTerms || false);

  // Address State
  const [zipCode, setZipCode] = useState(initialData.address?.zipCode || '');
  const [address, setAddress] = useState<Partial<Address>>(initialData.address || {});
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showGlobalError, setShowGlobalError] = useState(false);

  // --- MASKS ---
  const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  
  const maskPhone = (v: string) => {
    let r = v.replace(/\D/g, "");
    r = r.replace(/^0/, "");
    if (r.length > 11) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    else if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4})/, "($1) $2-$3");
    else if (r.length > 5) r = r.replace(/^(\d\d)(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    else r = r.replace(/^(\d*)/, "($1");
    return r;
  };

  const maskDate = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 10);
  const maskCEP = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

  // --- VALIDATORS ---
  const validateEmail = (email: string) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.toLowerCase());

  const validateCPF = (cpf: string) => {
    const strCPF = cpf.replace(/[^\d]/g, '');
    if (strCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(strCPF)) return false;
    let sum = 0, remainder;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(strCPF.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(strCPF.substring(10, 11))) return false;
    return true;
  };

  const validateDate = (date: string) => {
      if (date.length !== 10) return false;
      const [day, month, year] = date.split('/').map(Number);
      if (!day || !month || !year) return false;
      if (day > 31 || day < 1 || month > 12 || month < 1 || year < 1900 || year > new Date().getFullYear()) return false;
      return true;
  };

  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length >= 10;
  const validateCEP = (cep: string) => cep.replace(/\D/g, '').length === 8;

  // --- HANDLERS ---
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName: string, mask?: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = mask ? mask(e.target.value) : e.target.value;
    setter(val);
    if (showGlobalError) setShowGlobalError(false);
    if (fieldName === 'cpf' && val.length === 14) setTouched(prev => ({ ...prev, cpf: true }));
    if (fieldName === 'email' && validateEmail(val)) setTouched(prev => ({ ...prev, email: true }));
  };

  const handleAddressChange = (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(prev => ({ ...prev, [field]: e.target.value }));
    if (showGlobalError) setShowGlobalError(false);
  };

  const triggerCepSearch = async () => {
    if (!validateCEP(zipCode)) return;
    setTouched(prev => ({ ...prev, zipCode: true }));
    setIsLoadingAddress(true);
    setAddress({ street: '', neighborhood: '', city: '', state: '', number: '', complement: '' });
    try {
      const foundAddress = await getAddressByCep(zipCode);
      if (foundAddress) {
        setAddress(prev => ({ ...prev, street: foundAddress.street, neighborhood: foundAddress.neighborhood, city: foundAddress.city, state: foundAddress.state, zipCode: zipCode }));
        if (isPhysical) fetchShippingQuotes(zipCode);
        setTimeout(() => numberInputRef.current?.focus(), 100);
      }
    } catch (error) { console.error("CEP error", error); } 
    finally { setIsLoadingAddress(false); }
  };

  const handleCepBlur = () => {
    if (validateCEP(zipCode) && address.zipCode !== zipCode.replace(/\D/g, '')) triggerCepSearch();
    setTouched(p => ({...p, zipCode: true}));
  };

  const handleCepKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); triggerCepSearch(); }
  };

  const isEmailValid = validateEmail(email);
  const isCpfValid = validateCPF(cpf);
  const isNameValid = name.length > 3;
  const isPhoneValid = validatePhone(phone);
  const isDateValid = validateDate(birthDate);
  const isAddressValid = !isPhysical || (validateCEP(zipCode) && !!address.street && !!address.number && !!address.neighborhood && !!address.city && !!address.state && !!selectedShippingQuote);
  const isValid = isEmailValid && isCpfValid && isNameValid && isPhoneValid && isDateValid && acceptedTerms && isAddressValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onComplete({ email, cpf, name, phone, birthDate, hasAcceptedTerms: acceptedTerms, address: address as Address });
    } else {
        setTouched({ email: true, cpf: true, name: true, phone: true, birthDate: true, zipCode: true, street: true, number: true, neighborhood: true, city: true, state: true });
        setShowGlobalError(true);
        if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  const getShippingIcon = (icon?: string) => {
    if (icon === 'truck') return <Truck className="w-5 h-5 text-rs-gold" />;
    if (icon === 'box') return <Box className="w-5 h-5 text-rs-gold" />;
    if (icon === 'zap') return <Zap className="w-5 h-5 text-rs-gold" />;
    if (icon === 'moto') return <Bike className="w-5 h-5 text-rs-gold" />;
    return <Truck className="w-5 h-5 text-rs-gold" />;
  }

  const getError = (field: string, valid: boolean, value?: string) => {
    if (!touched[field]) return undefined;
    if (value !== undefined && (!value || value.length === 0)) return 'Campo obrigatório';
    if (!valid) {
        if (field === 'email') return 'E-mail inválido';
        if (field === 'cpf') return value && value.length < 14 ? 'CPF incompleto' : 'CPF inválido';
        if (field === 'phone') return 'Telefone inválido';
        if (field === 'birthDate') return 'Data inválida';
        if (field === 'zipCode') return 'CEP inválido';
        return 'Inválido';
    }
    return undefined;
  };

  return (
    <>
      <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title="Termos de Uso">
        <div className="space-y-4">
          <p>Ao utilizar este checkout, você concorda com os termos e condições da RS Prólipsi...</p>
          <p><strong>1. Uso da Plataforma:</strong> ...</p>
          <p><strong>2. Pagamentos:</strong> Todas as transações são processadas por gateways seguros. A RS Prólipsi não armazena seus dados de cartão.</p>
        </div>
      </Modal>
      <Modal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Política de Privacidade">
         <p>Nossa política de privacidade detalha como seus dados são coletados e utilizados...</p>
      </Modal>

      <div className="bg-rs-card p-6 md:p-8 rounded-2xl border border-rs-border space-y-8 shadow-xl shadow-black/20">
        
        <div className="flex items-center justify-between border-b border-rs-border pb-6">
          <h2 className="text-xl font-semibold text-rs-text flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rs-gold text-rs-dark text-sm font-bold shadow-[0_0_10px_rgba(200,167,78,0.3)]">1</span>
            Dados Pessoais
          </h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161A21] border-[#2A303B]">
            <Lock className="w-3 h-3 text-rs-gold" />
            <span className="text-[10px] text-rs-muted font-medium uppercase tracking-wider">Seguro</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Nome Completo" placeholder="Seu nome completo" value={name} onChange={handleChange(setName, 'name')} onBlur={() => setTouched(p => ({...p, name: true}))} error={getError('name', isNameValid, name)} icon={<User className="w-5 h-5" />} className="col-span-1 md:col-span-2" required />
              <Input label="E-mail" placeholder="seu@email.com" type="email" value={email} onChange={handleChange(setEmail, 'email')} onBlur={() => setTouched(p => ({...p, email: true}))} error={getError('email', isEmailValid, email)} icon={isEmailValid && touched.email ? <Check className="w-5 h-5 text-green-500" /> : <Mail className="w-5 h-5" />} required />
              <Input label="CPF" placeholder="000.000.000-00" value={cpf} onChange={handleChange(setCpf, 'cpf', maskCPF)} onBlur={() => setTouched(p => ({...p, cpf: true}))} error={getError('cpf', isCpfValid, cpf)} icon={isCpfValid && touched.cpf ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <FileText className="w-5 h-5" />} maxLength={14} required />
              <Input label="Celular / WhatsApp" placeholder="(00) 00000-0000" value={phone} onChange={handleChange(setPhone, 'phone', maskPhone)} onBlur={() => setTouched(p => ({...p, phone: true}))} error={getError('phone', isPhoneValid, phone)} icon={<Phone className="w-5 h-5" />} maxLength={15} required />
              <Input label="Data de Nascimento" placeholder="DD/MM/AAAA" value={birthDate} onChange={handleChange(setBirthDate, 'birthDate', maskDate)} onBlur={() => setTouched(p => ({...p, birthDate: true}))} error={getError('birthDate', isDateValid, birthDate)} icon={<Calendar className="w-5 h-5" />} maxLength={10} required />
          </div>

          <div className="pt-4 border-t border-rs-border/50 space-y-6">
              <h3 className="text-base font-semibold text-rs-text flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rs-gold" />
                  Endereço de Entrega
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative">
                      <Input label="CEP" placeholder="00000-000" value={zipCode} onChange={handleChange(setZipCode, 'zipCode', maskCEP)} onBlur={handleCepBlur} onKeyDown={handleCepKeyDown} error={getError('zipCode', validateCEP(zipCode), zipCode)} maxLength={9} required className="pr-10" />
                      <div className="absolute right-3 top-[2.3rem] pointer-events-none text-rs-muted">
                          {isLoadingAddress ? <Loader2 className="w-5 h-5 animate-spin text-rs-gold" /> : <Search className="w-5 h--5 hover:text-rs-gold transition-colors" />}
                      </div>
                  </div>
                  <div className="md:col-span-2"><a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="text-xs text-rs-muted hover:text-rs-gold underline mt-8 block">Não sei meu CEP</a></div>
                  {(address.street || validateCEP(zipCode)) && (
                    <>
                      <Input label="Endereço (Rua, Av.)" value={address.street || ''} onChange={handleAddressChange('street')} onBlur={() => setTouched(p => ({...p, street: true}))} error={getError('street', !!address.street, address.street)} className="md:col-span-3" disabled={isLoadingAddress} required />
                      <Input ref={numberInputRef} label="Número" value={address.number || ''} onChange={handleAddressChange('number')} onBlur={() => setTouched(p => ({...p, number: true}))} error={getError('number', !!address.number, address.number)} className="md:col-span-1" required />
                      <Input label="Complemento" placeholder="Apto, Bloco..." value={address.complement || ''} onChange={handleAddressChange('complement')} className="md:col-span-2" />
                      <Input label="Bairro" value={address.neighborhood || ''} onChange={handleAddressChange('neighborhood')} onBlur={() => setTouched(p => ({...p, neighborhood: true}))} error={getError('neighborhood', !!address.neighborhood, address.neighborhood)} className="md:col-span-2" disabled={isLoadingAddress} required />
                      <Input label="Cidade" value={address.city || ''} onChange={handleAddressChange('city')} onBlur={() => setTouched(p => ({...p, city: true}))} error={getError('city', !!address.city, address.city)} className="md:col-span-3" disabled={isLoadingAddress} required />
                      <Input label="UF" value={address.state || ''} onChange={handleAddressChange('state')} onBlur={() => setTouched(p => ({...p, state: true}))} error={getError('state', !!address.state, address.state)} className="md:col-span-1" disabled={isLoadingAddress} required />
                    </>
                  )}
              </div>
          </div>

          {isPhysical && shippingQuotes.length > 0 && (
               <div className={`pt-4 border-t border-rs-border/50 space-y-4 p-4 rounded-xl ${showGlobalError && !selectedShippingQuote ? 'bg-red-500/5 border border-red-500/20' : ''}`}>
                  <div className="flex justify-between items-center"><h3 className="text-base font-semibold text-rs-text flex items-center gap-2"><Truck className="w-4 h-4 text-rs-gold" /> Opções de Envio</h3>{showGlobalError && !selectedShippingQuote && (<span className="text-xs text-red-400 font-bold animate-pulse">Selecione uma opção de frete</span>)}</div>
                  <div className="space-y-3">
                      {shippingQuotes.map(quote => (<div key={quote.id} onClick={() => { selectShippingQuote(quote); if (showGlobalError) setShowGlobalError(false);}} className={`relative flex flex-col md:flex-row md:items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 gap-3 group hover:scale-[1.02] ${selectedShippingQuote?.id === quote.id ? 'bg-rs-gold/10 border-rs-gold shadow-[0_0_15px_rgba(200,167,78,0.1)]' : 'bg-[#161A21] border-[#2A303B] hover:border-rs-muted'}`}>
                          <div className="flex items-center gap-4 flex-1"><div className={`p-2 rounded-lg ${selectedShippingQuote?.id === quote.id ? 'bg-rs-gold text-black' : 'bg-rs-border text-rs-muted'}`}>{getShippingIcon(quote.icon)}</div><div><div className="flex items-center gap-2"><p className={`text-sm font-bold ${selectedShippingQuote?.id === quote.id ? 'text-rs-gold' : 'text-rs-text'}`}>{quote.name}</p>{quote.isBestPrice && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold uppercase border border-green-500/30">Melhor Preço</span>}{quote.isFastest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold uppercase border border-purple-500/30">Rápido</span>}</div><p className="text-xs text-rs-muted mt-0.5 flex items-center gap-1 capitalize">Chega até <span className="font-semibold text-rs-text">{quote.arrivalDate}</span></p></div></div>
                          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-rs-border/50 pt-2 md:pt-0 mt-1 md:mt-0"><p className="text-xs text-rs-muted md:hidden">Valor do frete:</p><p className="text-base font-bold text-rs-text">R$ {quote.price.toFixed(2)}</p></div>
                          {selectedShippingQuote?.id === quote.id && (<div className="absolute top-2 right-2 md:top-1/2 md:-translate-y-1/2 md:right-4 w-6 h-6 bg-rs-gold rounded-full flex items-center justify-center shadow-sm hidden md:flex"><CheckCircle2 className="w-4 h-4 text-rs-dark" /></div>)}
                      </div>))}
                  </div>
              </div>
          )}

          <div className={`flex items-start gap-3 pt-4 border-t border-rs-border/50 p-2 rounded-lg ${showGlobalError && !acceptedTerms ? 'bg-red-500/5 border border-red-500/20' : ''}`}>
              <button type="button" onClick={() => { setAcceptedTerms(!acceptedTerms); if (showGlobalError) setShowGlobalError(false); }} className={`flex-shrink-0 mt-0.5 transition-colors focus:outline-none ${acceptedTerms ? 'text-rs-gold' : showGlobalError ? 'text-red-400' : 'text-rs-muted hover:text-rs-text'}`}>{acceptedTerms ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
              <div className="text-xs text-rs-muted leading-relaxed">
                  Declaro que li e aceito os <span className="text-rs-gold hover:underline cursor-pointer" onClick={() => setIsTermsModalOpen(true)}>Termos de Uso</span> e <span className="text-rs-gold hover:underline cursor-pointer" onClick={() => setIsPrivacyModalOpen(true)}>Política de Privacidade</span> da RS Prólipsi, autorizando o processamento dos meus dados para a compra.
                  {showGlobalError && !acceptedTerms && <p className="text-red-400 font-bold mt-1">Você deve aceitar os termos.</p>}
              </div>
          </div>

          {showGlobalError && (<div className="flex items-center gap-2 justify-center text-red-400 bg-red-500/10 p-3 rounded-lg animate-pulse"><AlertCircle className="w-4 h-4" /><span className="text-sm font-medium">Verifique os campos em vermelho acima.</span></div>)}

          <div className="pt-2">
            <Button type="submit" fullWidth className="py-4 text-base font-extrabold tracking-wide uppercase transition-all duration-300 bg-rs-gold text-black hover:bg-rs-goldHover shadow-[0_4px_20px_rgba(200,167,78,0.25)]">
              Continuar para Pagamento
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};