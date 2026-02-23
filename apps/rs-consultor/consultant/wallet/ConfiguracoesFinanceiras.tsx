import React, { useState } from 'react';
import Card from '../../components/Card';
import { IconActive, IconGitFork } from '../../components/icons';
import { useUser } from '../ConsultantLayout';
import { mockCDProducts } from '../data'; // Import product data

const InputField: React.FC<{label: string; type: string; defaultValue: string; gridSpan?: string}> = ({ label, type, defaultValue, gridSpan = 'md:col-span-1' }) => (
    <div className={gridSpan}>
        <label className="text-sm text-gray-400 block mb-1">{label}</label>
        <input 
            type={type} 
            defaultValue={defaultValue} 
            className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
        />
    </div>
);

const SaveButton: React.FC<{ formId: string; label: string; saveStatus: string | null;}> = ({ formId, label, saveStatus }) => {
    const isSaving = saveStatus === formId;
    return (
        <button 
            type="submit" 
            disabled={isSaving}
            className={`font-bold px-6 py-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[220px] ${
                isSaving 
                ? 'bg-green-500 text-white cursor-not-allowed' 
                : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'
            }`}
        >
            {isSaving ? (
                <>
                    <IconActive className="mr-2" size={20} />
                    Salvo com sucesso!
                </>
            ) : (
                label
            )}
        </button>
    );
};

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

const ConfiguracoesFinanceiras: React.FC = () => {
    const { user } = useUser();
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // State for the new reinvestment feature
    const [isAutoReinvestActive, setIsAutoReinvestActive] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(mockCDProducts[0]?.id || '');
    const [shippingMethod, setShippingMethod] = useState('delivery');
    const [reinvestSaveStatus, setReinvestSaveStatus] = useState<string | null>(null);

    const handleSave = (e: React.FormEvent, formId: string) => {
      e.preventDefault();
      setSaveStatus(formId);
      setTimeout(() => {
          setSaveStatus(null);
      }, 2500);
    };

    const handleReinvestSave = (e: React.FormEvent) => {
        e.preventDefault();
        setReinvestSaveStatus('reinvest-settings');
        setTimeout(() => {
            setReinvestSaveStatus(null);
        }, 2500);
    };
    
    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-xl font-bold text-white mb-6">Dados Bancários para Saque</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => handleSave(e, 'dados-bancarios')}>
                     <InputField label="Banco" type="text" defaultValue={user.bankAccount.bank} />
                     <div>
                        <label className="text-sm text-gray-400 block mb-1">Tipo de Conta</label>
                        <select defaultValue={user.bankAccount.accountType} className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow h-[42px]">
                            <option value="checking">Conta Corrente</option>
                            <option value="savings">Conta Poupança</option>
                        </select>
                     </div>
                     <InputField label="Agência" type="text" defaultValue={user.bankAccount.agency} />
                     <InputField label="Número da Conta" type="text" defaultValue={user.bankAccount.accountNumber} />
                     <InputField label="Chave PIX" type="text" defaultValue={user.bankAccount.pixKey} gridSpan="md:col-span-2" />
                     <div className="md:col-span-2 text-right mt-4">
                        <SaveButton formId="dados-bancarios" label="Salvar Dados Bancários" saveStatus={saveStatus} />
                    </div>
                </form>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <IconGitFork className="mr-3 text-brand-gold"/> Reinvestimento Automático do Ciclo Global
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Mantenha-se ativo no Ciclo Global automaticamente. A cada novo ciclo, o sistema realizará a compra do produto selecionado para garantir sua participação.
              </p>
            
              <form onSubmit={handleReinvestSave}>
                <div className="flex items-center justify-between p-4 bg-brand-gray-light rounded-lg">
                  <label htmlFor="auto-reinvest-toggle" className="font-semibold text-white cursor-pointer select-none">
                    Ativar Reinvestimento Automático
                  </label>
                  <label htmlFor="auto-reinvest-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="auto-reinvest-toggle" 
                        className="sr-only peer" 
                        checked={isAutoReinvestActive}
                        onChange={() => setIsAutoReinvestActive(!isAutoReinvestActive)}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                  </label>
                </div>
                
                {isAutoReinvestActive && (
                  <div className="mt-6 space-y-6 animate-fade-in">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Produto para Ativação Automática</label>
                      <select 
                        value={selectedProductId} 
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow h-[42px]"
                      >
                        {mockCDProducts.map(product => {
                           const discountedPrice = product.fullPrice * (1 - product.discount / 100);
                           return (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {formatCurrency(discountedPrice)}
                                </option>
                           )
                        })}
                      </select>
                    </div>
            
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Método de Entrega</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${shippingMethod === 'delivery' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                          <input type="radio" name="shipping" value="delivery" checked={shippingMethod === 'delivery'} onChange={(e) => setShippingMethod(e.target.value)} className="hidden" />
                          <h4 className="font-semibold text-white">Envio via Correios</h4>
                          <p className="text-xs text-gray-400">Será enviado para seu endereço cadastrado.</p>
                        </label>
                        <label className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${shippingMethod === 'pickup' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                          <input type="radio" name="shipping" value="pickup" checked={shippingMethod === 'pickup'} onChange={(e) => setShippingMethod(e.target.value)} className="hidden" />
                          <h4 className="font-semibold text-white">Retirada no Local</h4>
                          <p className="text-xs text-gray-400">Você deverá retirar no Centro de Distribuição.</p>
                        </label>
                      </div>
                    </div>
            
                    {shippingMethod === 'delivery' && (
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Endereço de Entrega</label>
                        <div className="p-4 bg-brand-gray-light rounded-lg text-sm text-gray-300">
                          <p>{user.address.street}, {user.address.number}</p>
                          <p>{user.address.neighborhood} - {user.address.city}, {user.address.state}</p>
                          <p>CEP: {user.address.zipCode}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="md:col-span-2 text-right mt-4">
                         <SaveButton formId="reinvest-settings" label="Salvar Configurações" saveStatus={reinvestSaveStatus} />
                    </div>
                  </div>
                )}
              </form>
            </Card>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ConfiguracoesFinanceiras;