import React, { useState, useEffect } from 'react';
import { logisticsAPI } from '../../src/services/api';
import { TruckIcon, CogIcon, UserPlusIcon, CloseIcon, CheckCircleIcon, SpinnerIcon, WalletIcon, WhatsAppIcon, BuildingStorefrontIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '../icons';

interface DistributionCenter {
    id: number;
    consultantId: number;
    responsible: string;
    cpf: string;
    whatsapp: string;
    address: {
        cep: string;
        street: string;
        number: string;
        district: string;
        city: string;
        state: string;
    };
    balance: number;
    status: 'Ativo' | 'Inativo';
    pixKeyType: 'CPF' | 'Email' | 'Telefone' | 'Aleatória' | '';
    pixKey: string;
    shippingMethod: string;
    shippingNotes: string;
}

// Cleared mock data
const mockCDs: DistributionCenter[] = [];

const statusClasses = { Ativo: 'bg-green-600/20 text-green-400', Inativo: 'bg-red-600/20 text-red-400' };
const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 disabled:opacity-50";

type SaveStatus = 'idle' | 'saving' | 'success';

const SaveButton: React.FC<{ status: SaveStatus; onClick: () => void; text?: string; }> = ({ status, onClick, text = "Salvar" }) => (
    <button onClick={onClick} disabled={status !== 'idle'} className={`flex items-center justify-center gap-2 font-bold py-2 px-5 rounded-lg transition-all duration-300 w-44 text-center ${status === 'idle' ? 'bg-yellow-500 text-black hover:bg-yellow-600' : status === 'saving' ? 'bg-yellow-500/50 text-black cursor-wait' : 'bg-green-600 text-white'}`}>
        {status === 'idle' && text}
        {status === 'saving' && <><SpinnerIcon className="w-5 h-5 animate-spin" /> Salvando...</>}
        {status === 'success' && <><CheckCircleIcon className="w-5 h-5" /> Salvo!</>}
    </button>
);

const BalanceActionModal: React.FC<{
    action: 'add' | 'remove';
    cd: DistributionCenter;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
}> = ({ action, cd, isOpen, onClose, onConfirm }) => {
    const [amount, setAmount] = useState(0);

    if (!isOpen) return null;

    const title = action === 'add' ? 'Adicionar Saldo' : 'Retirar Saldo';
    const buttonText = action === 'add' ? 'Adicionar' : 'Retirar';
    const colorClass = action === 'add' ? 'green' : 'red';

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-sm">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{title} para {cd.responsible}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Valor (R$)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={baseInputClasses} autoFocus />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Motivo/Descrição</label>
                        <input type="text" placeholder="Ex: Adiantamento, Acerto de contas..." className={baseInputClasses} />
                    </div>
                </main>
                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={() => onConfirm(amount)} className={`px-4 py-2 text-sm font-medium text-white bg-${colorClass}-600 rounded-lg hover:bg-${colorClass}-700`}>{buttonText}</button>
                </footer>
            </div>
        </div>
    );
};

const CDDetailModal: React.FC<{
    cd: DistributionCenter | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (cd: DistributionCenter) => void;
    navigateToCdStore: (id: number) => void;
}> = ({ cd, isOpen, onClose, onSave, navigateToCdStore }) => {
    const [formData, setFormData] = useState<DistributionCenter | null>(null);
    const [activeTab, setActiveTab] = useState('dados');
    const [balanceAction, setBalanceAction] = useState<'add' | 'remove' | null>(null);

    useEffect(() => {
        if (cd) setFormData(JSON.parse(JSON.stringify(cd)));
        else setFormData(null);
        setActiveTab('dados');
    }, [cd]);
    
    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, address: { ...prev.address, [name]: value } } : null);
    };

    const handleBalanceConfirm = (amount: number) => {
        if (balanceAction === 'add') {
            setFormData(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
        } else if (balanceAction === 'remove') {
            setFormData(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
        }
        setBalanceAction(null);
    };

    const TabButton = ({ tabId, label }: { tabId: string; label: string }) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Detalhes do CD: {cd?.responsible}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>

                <div className="border-b border-gray-700 px-4"><nav className="-mb-px flex space-x-4"><TabButton tabId="dados" label="Dados do Responsável" /><TabButton tabId="endereco" label="Endereço do CD" /><TabButton tabId="financeiro" label="Financeiro" /><TabButton tabId="config" label="Configurações" /></nav></div>

                <main className="p-6 overflow-y-auto space-y-4">
                    {activeTab === 'dados' && <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-medium text-gray-400 mb-1">ID do Consultor</label><input type="text" value={formData.consultantId} disabled className={baseInputClasses} /></div>
                            <div><label className="block text-xs font-medium text-gray-400 mb-1">Nome Completo</label><input type="text" name="responsible" value={formData.responsible} onChange={handleChange} className={baseInputClasses} /></div>
                            <div><label className="block text-xs font-medium text-gray-400 mb-1">CPF</label><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className={baseInputClasses} /></div>
                            <div><label className="block text-xs font-medium text-gray-400 mb-1">WhatsApp</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={baseInputClasses} />
                                    <a href={`https://wa.me/${formData.whatsapp}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600"><WhatsAppIcon className="w-5 h-5" /></a>
                                </div>
                            </div>
                        </div>
                    </>}
                    {activeTab === 'endereco' && <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1"><label className="block text-xs font-medium text-gray-400 mb-1">CEP</label><input type="text" name="cep" value={formData.address.cep} onChange={handleAddressChange} className={baseInputClasses} /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Rua / Logradouro</label><input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} className={baseInputClasses} /></div>
                            <div className="md:col-span-1"><label className="block text-xs font-medium text-gray-400 mb-1">Número</label><input type="text" name="number" value={formData.address.number} onChange={handleAddressChange} className={baseInputClasses} /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Bairro</label><input type="text" name="district" value={formData.address.district} onChange={handleAddressChange} className={baseInputClasses} /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Cidade</label><input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} className={baseInputClasses} /></div>
                            <div className="md:col-span-1"><label className="block text-xs font-medium text-gray-400 mb-1">Estado (UF)</label><input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} className={baseInputClasses} /></div>
                        </div>
                    </>}
                    {activeTab === 'financeiro' && <>
                        <div className="p-4 bg-black/50 rounded-lg text-center">
                            <p className="text-sm text-gray-400">Saldo Atual do CD</p>
                            <p className="text-4xl font-bold text-yellow-400 my-2">{formData.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button onClick={() => setBalanceAction('add')} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"><ArrowUpCircleIcon className="w-6 h-6"/>Adicionar Saldo</button>
                            <button onClick={() => setBalanceAction('remove')} className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"><ArrowDownCircleIcon className="w-6 h-6"/>Retirar Saldo</button>
                        </div>
                    </>}
                     {activeTab === 'config' && <>
                        <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3">Dados de Pagamento (PIX)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tipo de Chave PIX</label>
                                <select name="pixKeyType" value={formData.pixKeyType} onChange={handleChange} className={baseInputClasses}>
                                    <option value="">Não configurado</option>
                                    <option value="CPF">CPF</option>
                                    <option value="Email">E-mail</option>
                                    <option value="Telefone">Telefone</option>
                                    <option value="Aleatória">Chave Aleatória</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Chave PIX</label>
                                <input type="text" name="pixKey" value={formData.pixKey} onChange={handleChange} className={baseInputClasses} />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-yellow-500 border-b border-gray-700 pb-2 mb-3 pt-6">Configurações de Envio</h3>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Método de Envio Preferencial</label>
                            <select name="shippingMethod" value={formData.shippingMethod} onChange={handleChange} className={baseInputClasses}>
                                <option>Correios SEDEX</option>
                                <option>Correios PAC</option>
                                <option>Jadlog</option>
                                <option>Buslog</option>
                                <option>Transportadora Própria</option>
                                <option>Retirada no Local</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Observações de Envio</label>
                            <textarea name="shippingNotes" value={formData.shippingNotes} onChange={handleChange} rows={3} className={baseInputClasses}></textarea>
                        </div>
                    </>}
                </main>
                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-between items-center">
                    <button onClick={() => navigateToCdStore(formData.id)} className="flex items-center gap-2 text-sm font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 hover:bg-yellow-500/20"><BuildingStorefrontIcon className="w-5 h-5"/>Ver Loja Interna</button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                        <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600">Salvar Alterações</button>
                    </div>
                </footer>
                {balanceAction && <BalanceActionModal action={balanceAction} cd={formData} isOpen={!!balanceAction} onClose={() => setBalanceAction(null)} onConfirm={handleBalanceConfirm} />}
            </div>
        </div>
    );
};

interface ManageCDsPageProps {
    navigateToCdStore: (id: number) => void;
}

const ManageCDsPage: React.FC<ManageCDsPageProps> = ({ navigateToCdStore }) => {
    const [cds, setCds] = useState(mockCDs);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { loadCDs(); }, []);

    const loadCDs = async () => {
        try {
            setLoading(true);
            const res = await logisticsAPI.getAllCDs();
            if (res?.data?.success) setCds(res.data.cds || mockCDs);
        } catch (err) {
            setError('Erro ao carregar CDs');
        } finally {
            setLoading(false);
        }
    };

    const [discount, setDiscount] = useState<number>(15.2);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCD, setEditingCD] = useState<DistributionCenter | null>(null);

    const handleSaveSettings = () => {
        setSaveStatus('saving');
        setTimeout(() => { setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 2000); }, 1500);
    };

    const openEditModal = (cd: DistributionCenter) => {
        setEditingCD(cd);
        setIsModalOpen(true);
    };

    const handleSaveCD = (cd: DistributionCenter) => {
        setCds(cds.map(c => c.id === cd.id ? cd : c));
        setIsModalOpen(false);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8"><TruckIcon className="w-8 h-8 text-yellow-500" /><h1 className="text-3xl font-bold text-yellow-500 ml-3">Gerenciar Centros de Distribuição</h1></header>
            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg mb-8">
                <header className="flex items-center p-4 bg-black/30 border-b border-gray-800"><CogIcon className="w-6 h-6 text-yellow-500" /><h2 className="text-xl font-semibold text-white ml-3">Configurações Globais do CD</h2></header>
                <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"><div><label className="text-sm font-medium text-gray-300">Desconto para Compra de Estoque</label><p className="text-xs text-gray-500 mt-1">Percentual de desconto que o CD recebe ao comprar produtos da empresa.</p></div><div className="md:col-span-2 flex items-center"><div className="relative w-full max-w-xs"><input type="number" step="0.1" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className={baseInputClasses} /><span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">%</span></div></div></div></div>
                <footer className="p-4 bg-black/30 border-t border-gray-800 flex justify-end"><SaveButton status={saveStatus} onClick={handleSaveSettings} text="Salvar" /></footer>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-black/30 border-b border-gray-800"><h2 className="text-xl font-semibold text-white">CDs Cadastrados</h2></header>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30"><tr><th className="px-6 py-4">Responsável (ID)</th><th className="px-6 py-4">Localização</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Ações</th></tr></thead>
                        <tbody>
                            {cds.length > 0 ? cds.map(cd => (
                                <tr key={cd.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium">{cd.responsible} ({cd.consultantId})</td>
                                    <td className="px-6 py-4">{cd.address.city} - {cd.address.state}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[cd.status]}`}>{cd.status}</span></td>
                                    <td className="px-6 py-4 text-center"><button onClick={() => openEditModal(cd)} className="font-medium text-yellow-500 hover:text-yellow-400 p-2">Gerenciar</button></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">Nenhum Centro de Distribuição cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <CDDetailModal cd={editingCD} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCD} navigateToCdStore={navigateToCdStore} />
        </div>
    );
};

export default ManageCDsPage;