import React, { useState } from 'react';
import Card from '../../components/Card';
import { mockShopSettings } from '../data';
import { IconUserCog, IconActive } from '../../components/icons';
import { useUser } from '../ConsultantLayout';

const InputField: React.FC<{label: string; type: string; defaultValue: string; prefix?: string;}> = ({ label, type, defaultValue, prefix }) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1">{label}</label>
        <div className="flex items-stretch">
            {prefix && <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-brand-gray-light bg-brand-gray text-gray-400 text-sm">{prefix}</span>}
            <input 
                type={type} 
                defaultValue={defaultValue} 
                className={`w-full bg-brand-gray p-2 border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow ${prefix ? 'rounded-r-md' : 'rounded-md'}`}
            />
        </div>
    </div>
);


const MeusDados: React.FC = () => {
    const { user } = useUser();
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('dados-loja');
        setTimeout(() => setSaveStatus(null), 2500);
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center"><IconUserCog className="mr-3 text-brand-gold"/> Configurações da Loja</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div>
                    <h3 className="text-lg font-semibold text-white">Identidade da Loja</h3>
                    <p className="text-sm text-gray-400 mb-4">Personalize como sua loja aparece para os clientes.</p>
                    <InputField 
                        label="URL da sua Loja (Slug)" 
                        type="text" 
                        defaultValue={mockShopSettings.storeSlug}
                        prefix="https://rs-shop.com.br/"
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white">Informações de Pagamento</h3>
                    <p className="text-sm text-gray-400 mb-4">Como você deseja receber suas comissões da RS Shop.</p>
                    <div className="space-y-4">
                         <div>
                            <label className="text-sm text-gray-400 block mb-1">Método de Pagamento</label>
                            <select defaultValue={mockShopSettings.payoutMethod} className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow h-[42px]">
                                <option value="pix">PIX (Chave principal da conta)</option>
                                <option value="wallet">Saldo na RS Wallet</option>
                            </select>
                         </div>
                        <InputField 
                            label="Chave PIX (se aplicável)"
                            type="text"
                            defaultValue={user.bankAccount.pixKey}
                        />
                    </div>
                </div>

                <div className="pt-4 text-right">
                    <button 
                        type="submit" 
                        disabled={!!saveStatus}
                        className={`font-bold px-6 py-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[220px] ml-auto ${
                            saveStatus
                            ? 'bg-green-500 text-white cursor-not-allowed' 
                            : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'
                        }`}
                    >
                        {saveStatus ? (
                            <>
                                <IconActive className="mr-2" size={20} />
                                Salvo com sucesso!
                            </>
                        ) : (
                            "Salvar Configurações"
                        )}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default MeusDados;