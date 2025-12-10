
import React, { useState, useRef, useEffect } from 'react';
import { SettingsData } from '../types';
import { Save, User, Building, CreditCard, Truck, MapPin, Search, AlertCircle, CheckCircle, Smartphone, Mail, Lock, Eye, EyeOff, Camera, Upload } from 'lucide-react';
import { mockSettings } from '../services/mockData';

interface SettingsProps {
  initialData?: SettingsData;
  onSaveProfile?: (data: SettingsData['profile']) => void;
}

const Settings: React.FC<SettingsProps> = ({ initialData, onSaveProfile }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'BANK' | 'PAYMENT' | 'SHIPPING'>('PROFILE');
  
  // Initialize state with props or fallback to mock
  const [settings, setSettings] = useState<SettingsData>(initialData || mockSettings);
  
  const [loadingCep, setLoadingCep] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop updates
  useEffect(() => {
    if (initialData) {
        setSettings(initialData);
    }
  }, [initialData]);

  // --- UTILS ---
  const formatDocument = (doc: string) => {
    const clean = doc.replace(/\D/g, '');
    if (clean.length <= 11) { // CPF
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else { // CNPJ
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const validateDocument = (doc: string) => {
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 0) return true;
    
    // Simples validação visual para UX (não é validação fiscal completa)
    if (clean.length !== 11 && clean.length !== 14) {
      setDocError('Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos.');
      return false;
    }
    
    // Reject common invalid sequences
    if (/^(\d)\1+$/.test(clean)) {
       setDocError('Documento inválido.');
       return false;
    }

    setDocError(null);
    return true;
  };

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            address: {
              ...prev.profile.address,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf
            }
          }
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  // --- HANDLERS ---
  const handleProfileChange = (field: string, value: string) => {
    if (field === 'document') {
       const formatted = formatDocument(value);
       validateDocument(formatted);
       value = formatted;
    }

    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  // --- AVATAR UPLOAD HANDLER ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update local state with base64 string
        setSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, avatarUrl: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    if (field === 'cep') {
      value = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
      if (value.length === 9) fetchAddress(value);
    }
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        address: { ...prev.profile.address, [field]: value }
      }
    }));
  };

  const handleBankChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      bank: { ...prev.bank, [field]: value }
    }));
  };

  const handleIntegrationChange = (type: 'paymentGateway' | 'shippingGateway', field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleSave = () => {
      if (onSaveProfile) {
          onSaveProfile(settings.profile);
      }
      alert("Configurações e Perfil salvos com sucesso!");
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="text-gold-400" />
            Configurações & Perfil
          </h2>
          <p className="text-gray-400 text-sm">Gerencie dados do CD, integrações e financeiro.</p>
        </div>
        <button 
            onClick={handleSave}
            className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-gold-500/20 flex items-center gap-2 transition-colors"
        >
            <Save size={18} />
            Salvar Alterações
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-dark-800">
        {[
          { id: 'PROFILE', label: 'Perfil & Endereço', icon: <User size={18}/> },
          { id: 'BANK', label: 'Dados Bancários', icon: <Building size={18}/> },
          { id: 'PAYMENT', label: 'Pagamento (API)', icon: <CreditCard size={18}/> },
          { id: 'SHIPPING', label: 'Integração Frete', icon: <Truck size={18}/> }
        ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
               activeTab === tab.id 
               ? 'bg-dark-900 text-gold-400 border-b-2 border-gold-400' 
               : 'text-gray-400 hover:text-white hover:bg-dark-800'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
        ))}
      </div>

      {/* --- TAB: PROFILE --- */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Personal Info */}
          <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 space-y-4">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <User className="text-gold-400" size={20}/> Dados Cadastrais
             </h3>

             {/* FOTO DE PERFIL / AVATAR UPLOAD */}
             <div className="flex flex-col items-center mb-6 p-4 border border-dark-800 rounded-xl bg-dark-950/50">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <div className="w-24 h-24 rounded-full border-2 border-gold-500 overflow-hidden flex items-center justify-center bg-dark-800">
                         {settings.profile.avatarUrl ? (
                             <img src={settings.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                             <User size={40} className="text-gray-500" />
                         )}
                     </div>
                     <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white" size={24} />
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                     />
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Clique para alterar foto</p>
             </div>
             
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Fantasia (CD)</label>
               <input 
                 type="text" 
                 className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                 value={settings.profile.fantasyName}
                 onChange={(e) => handleProfileChange('fantasyName', e.target.value)}
                 placeholder="Ex: CD São Paulo Sul"
               />
             </div>

             <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Razão Social / Nome Completo</label>
               <input 
                 type="text" 
                 className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                 value={settings.profile.companyName}
                 onChange={(e) => handleProfileChange('companyName', e.target.value)}
                 placeholder="Nome da Empresa LTDA"
               />
             </div>

             <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CPF / CNPJ</label>
               <div className="relative">
                 <input 
                   type="text" 
                   maxLength={18}
                   className={`w-full bg-dark-950 border ${docError ? 'border-red-500 focus:border-red-500' : 'border-dark-700 focus:border-gold-400'} rounded-lg px-4 py-3 text-white outline-none`}
                   value={settings.profile.document}
                   onChange={(e) => handleProfileChange('document', e.target.value)}
                   placeholder="00.000.000/0000-00"
                 />
                 {docError && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />}
               </div>
               {docError && <p className="text-xs text-red-500 mt-1">{docError}</p>}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-gold-400 outline-none"
                      value={settings.profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="email@empresa.com"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Telefone</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-gold-400 outline-none"
                      value={settings.profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>
             </div>
          </div>

          {/* Address */}
          <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 space-y-4">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <MapPin className="text-gold-400" size={20}/> Endereço de Distribuição
             </h3>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CEP</label>
                   <div className="relative">
                     <input 
                       type="text" 
                       maxLength={9}
                       className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                       placeholder="00000-000"
                       value={settings.profile.address.cep}
                       onChange={(e) => handleAddressChange('cep', e.target.value)}
                     />
                     {loadingCep && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>}
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estado (UF)</label>
                   <input 
                     type="text" 
                     className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                     value={settings.profile.address.state}
                     onChange={(e) => handleAddressChange('state', e.target.value)}
                   />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cidade</label>
                <input 
                  type="text" 
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                  value={settings.profile.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
             </div>

             <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rua / Logradouro</label>
                    <input 
                      type="text" 
                      className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                      value={settings.profile.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Número</label>
                    <input 
                      type="text" 
                      className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                      value={settings.profile.address.number}
                      onChange={(e) => handleAddressChange('number', e.target.value)}
                    />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bairro</label>
                    <input 
                      type="text" 
                      className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                      value={settings.profile.address.neighborhood}
                      onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Complemento</label>
                    <input 
                      type="text" 
                      className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                      value={settings.profile.address.complement}
                      onChange={(e) => handleAddressChange('complement', e.target.value)}
                    />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- TAB: BANK --- */}
      {activeTab === 'BANK' && (
        <div className="bg-dark-900 p-8 rounded-xl border border-dark-800 animate-fade-in max-w-3xl mx-auto">
             <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
               <Building className="text-gold-400" size={24}/> Dados para Recebimento (Saque)
             </h3>
             <p className="text-sm text-gray-500 mb-8">Conta bancária onde serão depositados os valores de vendas e comissões.</p>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Banco</label>
                        <select 
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                            value={settings.bank.bankName}
                            onChange={(e) => handleBankChange('bankName', e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            <option>Banco Itaú</option>
                            <option>Banco Bradesco</option>
                            <option>Banco do Brasil</option>
                            <option>Santander</option>
                            <option>Nubank</option>
                            <option>Inter</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo de Conta</label>
                         <select 
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                            value={settings.bank.accountType}
                            onChange={(e) => handleBankChange('accountType', e.target.value)}
                        >
                            <option value="CORRENTE">Conta Corrente</option>
                            <option value="POUPANCA">Conta Poupança</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Agência</label>
                        <input 
                            type="text" 
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                            value={settings.bank.agency}
                            onChange={(e) => handleBankChange('agency', e.target.value)}
                            placeholder="0000"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Conta</label>
                        <input 
                            type="text" 
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                            value={settings.bank.accountNumber}
                            onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                            placeholder="00000-0"
                        />
                    </div>
                </div>

                <div className="bg-dark-950 p-6 rounded-lg border border-dark-700/50">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <Smartphone size={16} className="text-gold-400"/> Chave Pix Principal
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                             <select 
                                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-3 text-white focus:border-gold-400 outline-none text-sm"
                                value={settings.bank.pixKeyType}
                                onChange={(e) => handleBankChange('pixKeyType', e.target.value)}
                            >
                                <option value="CPF">CPF</option>
                                <option value="CNPJ">CNPJ</option>
                                <option value="EMAIL">E-mail</option>
                                <option value="PHONE">Celular</option>
                                <option value="RANDOM">Chave Aleatória</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                             <input 
                                type="text" 
                                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                                placeholder="Informe sua chave Pix"
                                value={settings.bank.pixKey}
                                onChange={(e) => handleBankChange('pixKey', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* --- TAB: PAYMENT INTEGRATION --- */}
      {activeTab === 'PAYMENT' && (
         <div className="bg-dark-900 p-8 rounded-xl border border-dark-800 animate-fade-in max-w-3xl mx-auto">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <CreditCard className="text-gold-400" size={24}/> Gateway de Pagamento
                    </h3>
                    <p className="text-sm text-gray-500">Configure suas credenciais de API para receber pagamentos online.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${settings.paymentGateway.enabled ? 'text-green-500' : 'text-gray-500'}`}>
                        {settings.paymentGateway.enabled ? 'ATIVADO' : 'DESATIVADO'}
                    </span>
                    <button 
                        onClick={() => handleIntegrationChange('paymentGateway', 'enabled', !settings.paymentGateway.enabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.paymentGateway.enabled ? 'bg-green-500/20 border border-green-500' : 'bg-dark-800 border border-dark-600'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-current transform transition-transform ${settings.paymentGateway.enabled ? 'translate-x-6 text-green-500' : 'text-gray-500'}`} />
                    </button>
                 </div>
             </div>

             <div className={`space-y-6 ${!settings.paymentGateway.enabled && 'opacity-50 pointer-events-none'}`}>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Provedor</label>
                    <select 
                        className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                        value={settings.paymentGateway.provider}
                        onChange={(e) => handleIntegrationChange('paymentGateway', 'provider', e.target.value)}
                    >
                        <option value="MERCADO_PAGO">Mercado Pago</option>
                        <option value="STONE">Stone / Pagar.me</option>
                        <option value="ASAAS">Asaas</option>
                        <option value="VODAFONE">Vodafone / Vindi</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Public Key (Chave Pública)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-gold-400 outline-none font-mono text-sm"
                            value={settings.paymentGateway.apiKey}
                            onChange={(e) => handleIntegrationChange('paymentGateway', 'apiKey', e.target.value)}
                            placeholder="Ex: APP_USR-..."
                        />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Access Token / Secret Key</label>
                    <div className="relative">
                        <input 
                            type={showSecret ? "text" : "password"}
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-10 py-3 text-white focus:border-gold-400 outline-none font-mono text-sm"
                            value={settings.paymentGateway.apiToken || ''}
                            onChange={(e) => handleIntegrationChange('paymentGateway', 'apiToken', e.target.value)}
                            placeholder="Insira o token secreto de produção"
                        />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                         <button 
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                         >
                             {showSecret ? <EyeOff size={16}/> : <Eye size={16}/>}
                         </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Este token é usado para processar transações. Mantenha em segurança.</p>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ambiente</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="env_pay" 
                                checked={settings.paymentGateway.environment === 'SANDBOX'}
                                onChange={() => handleIntegrationChange('paymentGateway', 'environment', 'SANDBOX')}
                            />
                            <span className="text-gray-300">Sandbox (Teste)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="env_pay" 
                                checked={settings.paymentGateway.environment === 'PRODUCTION'}
                                onChange={() => handleIntegrationChange('paymentGateway', 'environment', 'PRODUCTION')}
                            />
                            <span className="text-gold-400 font-bold">Produção</span>
                        </label>
                    </div>
                 </div>
             </div>
         </div>
      )}

      {/* --- TAB: SHIPPING INTEGRATION --- */}
      {activeTab === 'SHIPPING' && (
         <div className="bg-dark-900 p-8 rounded-xl border border-dark-800 animate-fade-in max-w-3xl mx-auto">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <Truck className="text-gold-400" size={24}/> Integração de Frete
                    </h3>
                    <p className="text-sm text-gray-500">Configure a API para cálculo de frete e geração de etiquetas.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${settings.shippingGateway.enabled ? 'text-green-500' : 'text-gray-500'}`}>
                        {settings.shippingGateway.enabled ? 'ATIVADO' : 'DESATIVADO'}
                    </span>
                    <button 
                        onClick={() => handleIntegrationChange('shippingGateway', 'enabled', !settings.shippingGateway.enabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.shippingGateway.enabled ? 'bg-green-500/20 border border-green-500' : 'bg-dark-800 border border-dark-600'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-current transform transition-transform ${settings.shippingGateway.enabled ? 'translate-x-6 text-green-500' : 'text-gray-500'}`} />
                    </button>
                 </div>
             </div>

             <div className={`space-y-6 ${!settings.shippingGateway.enabled && 'opacity-50 pointer-events-none'}`}>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Plataforma</label>
                    <select 
                        className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none"
                        value={settings.shippingGateway.provider}
                        onChange={(e) => handleIntegrationChange('shippingGateway', 'provider', e.target.value)}
                    >
                        <option value="MELHOR_ENVIO">Melhor Envio</option>
                        <option value="KANGU">Kangu (7th Net)</option>
                        <option value="CORREIOS">Correios WebService</option>
                        <option value="JADLOG">Jadlog</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">API Token</label>
                    <div className="relative">
                        <input 
                            type={showSecret ? "text" : "password"}
                            className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-10 py-3 text-white focus:border-gold-400 outline-none font-mono text-sm"
                            value={settings.shippingGateway.apiToken}
                            onChange={(e) => handleIntegrationChange('shippingGateway', 'apiToken', e.target.value)}
                            placeholder="Cole o token de produção aqui"
                        />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                         <button 
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                         >
                             {showSecret ? <EyeOff size={16}/> : <Eye size={16}/>}
                         </button>
                    </div>
                 </div>

                 <div className="p-4 bg-dark-950 rounded-lg border border-dark-800 flex items-start gap-3">
                    <AlertCircle className="text-gold-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-gray-300 font-bold mb-1">Configuração de Remetente</p>
                        <p className="text-xs text-gray-500">
                            As etiquetas serão geradas utilizando os dados de endereço preenchidos na aba 
                            <button onClick={() => setActiveTab('PROFILE')} className="text-gold-400 underline ml-1">Perfil</button>.
                        </p>
                    </div>
                 </div>
             </div>
         </div>
      )}

    </div>
  );
};

export default Settings;