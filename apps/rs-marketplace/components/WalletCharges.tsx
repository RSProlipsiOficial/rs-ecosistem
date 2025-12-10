

import React, { useState, useMemo } from 'react';
import { Charge, Product, ChargeItem, ShippingAddress } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ReceiptPercentIcon } from './icons/ReceiptPercentIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { UserIcon } from './icons/UserIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';


interface WalletChargesProps {
    charges: Charge[];
    products: Product[];
    onSave: (charge: Omit<Charge, 'id' | 'paymentLink'>) => Charge;
}

const ChargeDetailModal: React.FC<{ charge: Charge; onClose: () => void; }> = ({ charge, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-black border border-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-dark-800">
                    <h2 className="text-xl font-bold text-white">Detalhes da Cobrança</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><UserIcon className="w-5 h-5 text-gold-400" /> Cliente</h3>
                        <div className="bg-dark-800/50 p-4 rounded-lg space-y-2">
                           <p><span className="text-gray-400">Nome:</span> {charge.customerName}</p>
                           <p><span className="text-gray-400">Email:</span> {charge.customerEmail}</p>
                           <p><span className="text-gray-400">CPF/CNPJ:</span> {charge.customerCpf}</p>
                           {charge.customerPhone && <p><span className="text-gray-400">Telefone:</span> {charge.customerPhone}</p>}
                        </div>
                    </div>
                    {charge.customerAddress && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-gold-400" /> Endereço</h3>
                            <div className="bg-dark-800/50 p-4 rounded-lg space-y-1 text-sm">
                                <p>{charge.customerAddress.street}, {charge.customerAddress.number}</p>
                                <p>{charge.customerAddress.neighborhood}, {charge.customerAddress.city} - {charge.customerAddress.state}</p>
                                <p>CEP: {charge.customerAddress.zipCode}</p>
                            </div>
                        </div>
                    )}
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Itens</h3>
                        <div className="divide-y divide-gray-800 border border-dark-800 rounded-lg">
                            {charge.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3">
                                    <p>{item.description} (x{item.quantity})</p>
                                    <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                                </div>
                            ))}
                             <div className="flex justify-between items-center p-3 bg-dark-900/50">
                                <p>Frete</p>
                                <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(charge.shipping)}</p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-center text-xl font-bold p-3 bg-dark-800/50 rounded-lg">
                            <span className="text-gold-400">TOTAL</span>
                            <span className="text-gold-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(charge.total)}</span>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Link de Pagamento</h3>
                        <div className="bg-dark-800 border-2 border-dashed border-dark-700 rounded-lg p-4 space-y-4">
                            <p className="text-gold-400 font-mono break-all">{charge.paymentLink}</p>
                            <div className="flex justify-center flex-wrap gap-4">
                                 <a href={charge.paymentLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500">
                                    <ArrowUpRightIcon className="w-5 h-5"/> Abrir Link
                                </a>
                                <button onClick={() => navigator.clipboard.writeText(charge.paymentLink)} className="flex items-center gap-2 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                                    <CopyIcon className="w-5 h-5"/> Copiar Link
                                </button>
                                <a href={`https://wa.me/?text=Olá, ${charge.customerName}! Aqui está o link para o pagamento da sua cobrança: ${charge.paymentLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500">
                                    <WhatsappIcon className="w-5 h-5"/> Enviar via WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const CreateChargeModal: React.FC<{
    products: Product[];
    onClose: () => void;
    onSave: (charge: Omit<Charge, 'id' | 'paymentLink'>) => Charge;
}> = ({ products, onClose, onSave }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCpf, setCustomerCpf] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState<Partial<ShippingAddress>>({});
    
    const [items, setItems] = useState<ChargeItem[]>([]);
    const [shipping, setShipping] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [newCharge, setNewCharge] = useState<Charge | null>(null);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5);
    }, [productSearch, products]);

    const handleAddProduct = (product: Product) => {
        setItems(prev => [...prev, { id: product.id, description: product.name, quantity: 1, price: product.price }]);
        setProductSearch('');
    };

    const handleAddCustomItem = () => {
        setItems(prev => [...prev, { id: `custom-${Date.now()}`, description: 'Item Personalizado', quantity: 1, price: 0 }]);
    };

    const handleItemChange = (index: number, field: keyof ChargeItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
        setAddress(prev => ({...prev, [field]: value}));
    };

    const total = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shipping, [items, shipping]);
    
    const handleCreateCharge = () => {
        if (!customerName || !customerEmail || items.length === 0) {
            alert('Por favor, preencha as informações do cliente e adicione pelo menos um item.');
            return;
        }
        
        const chargeData = {
            customerName,
            customerEmail,
            customerCpf,
            customerPhone,
            customerAddress: address as ShippingAddress,
            items,
            shipping,
            total,
            status: 'Pendente' as const,
            createdAt: new Date().toISOString(),
            dueDate,
        };
        const savedCharge = onSave(chargeData);
        setNewCharge(savedCharge);
    };
    
    if (newCharge) {
        return (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                 <div className="bg-black border border-dark-800 rounded-lg w-full max-w-lg text-center p-8" onClick={e => e.stopPropagation()}>
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-white mb-2">Cobrança Criada!</h2>
                    <p className="text-gray-400 mb-6">Compartilhe o link de pagamento com seu cliente.</p>
                    <div className="bg-dark-800 border-2 border-dashed border-dark-700 rounded-lg p-4 space-y-4">
                        <p className="text-gold-400 font-mono break-all">{newCharge.paymentLink}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => navigator.clipboard.writeText(newCharge.paymentLink)} className="flex items-center gap-2 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                                <CopyIcon className="w-5 h-5"/> Copiar Link
                            </button>
                             <a href={`https://wa.me/?text=Olá, ${newCharge.customerName}! Aqui está o link para o pagamento da sua cobrança: ${newCharge.paymentLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500">
                                <WhatsappIcon className="w-5 h-5"/> Enviar via WhatsApp
                            </a>
                        </div>
                    </div>
                    <button onClick={onClose} className="mt-8 text-sm font-bold bg-gold-500 text-black py-2 px-6 rounded-md hover:bg-gold-400">
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-black border border-dark-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-dark-800">
                    <h2 className="text-xl font-bold text-white">Criar Nova Cobrança</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    {/* Customer Info */}
                    <div className="bg-dark-900/50 p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold text-white">Informações do Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do Cliente *" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                             <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" placeholder="E-mail do Cliente *" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                             <input value={customerCpf} onChange={e => setCustomerCpf(e.target.value)} placeholder="CPF/CNPJ do Cliente" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                             <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="tel" placeholder="WhatsApp / Telefone" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                        </div>
                        <details className="pt-2">
                          <summary className="cursor-pointer text-sm font-semibold text-gold-400">Adicionar Endereço</summary>
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                            <input onChange={e => handleAddressChange('zipCode', e.target.value)} placeholder="CEP" className="md:col-span-2 w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                            <input onChange={e => handleAddressChange('street', e.target.value)} placeholder="Rua / Logradouro" className="md:col-span-4 w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                            <input onChange={e => handleAddressChange('number', e.target.value)} placeholder="Número" className="md:col-span-2 w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                            <input onChange={e => handleAddressChange('complement', e.target.value)} placeholder="Complemento" className="md:col-span-4 w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                            <input onChange={e => handleAddressChange('neighborhood', e.target.value)} placeholder="Bairro" className="md:col-span-3 w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                            <input onChange={e => handleAddressChange('city', e.target.value)} placeholder="Cidade" className="md:col-span-2 w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                            <input onChange={e => handleAddressChange('state', e.target.value)} placeholder="UF" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                          </div>
                        </details>
                    </div>
                    {/* Items */}
                    <div className="bg-dark-900/50 p-4 rounded-lg space-y-4">
                         <h3 className="font-semibold text-white">Itens da Cobrança</h3>
                         <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2 bg-dark-800 p-2 rounded-md">
                                    <input value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Descrição" className="flex-grow bg-dark-700 border border-dark-700 rounded-md py-1 px-2 text-white text-sm" disabled={!!products.find(p=>p.id === item.id)} />
                                    <input value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} type="number" placeholder="Qtd" className="w-16 bg-dark-700 border border-dark-700 rounded-md py-1 px-2 text-white text-sm" />
                                    <input value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} type="number" placeholder="Preço" className="w-24 bg-dark-700 border border-dark-700 rounded-md py-1 px-2 text-white text-sm" />
                                    <button onClick={() => handleRemoveItem(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                         </div>
                         <div className="relative">
                            <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar produto..." className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                             {filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-dark-800 border border-dark-700 rounded-b-md shadow-lg z-10">
                                    {filteredProducts.map(p => <button key={p.id} onClick={() => handleAddProduct(p)} className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-700">{p.name}</button>)}
                                </div>
                            )}
                         </div>
                         <button onClick={handleAddCustomItem} className="text-sm font-semibold text-gold-400 hover:underline">+ Adicionar item personalizado</button>
                    </div>
                     {/* Shipping & Due Date */}
                     <div className="bg-dark-900/50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-white mb-1">Frete</label>
                             <input value={shipping} onChange={e => setShipping(Number(e.target.value))} type="number" placeholder="R$ 0,00" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-white mb-1">Data de Vencimento</label>
                             <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"/>
                        </div>
                     </div>
                </main>
                 <footer className="p-4 bg-black border-t border-dark-800 flex justify-between items-center">
                    <div>
                        <span className="text-gray-400">Total:</span>
                        <p className="text-2xl font-bold text-gold-400">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(total)}</p>
                    </div>
                    <button onClick={handleCreateCharge} className="font-bold bg-gold-500 text-black py-3 px-6 rounded-md hover:bg-gold-400">Criar Cobrança</button>
                </footer>
            </div>
        </div>
    );
};

const WalletCharges: React.FC<WalletChargesProps> = ({ charges, products, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | Charge['status']>('all');
    const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);


    const filteredCharges = useMemo(() => {
        if (filter === 'all') return charges;
        return charges.filter(c => c.status === filter);
    }, [charges, filter]);
    
    const StatusBadge: React.FC<{ status: Charge['status'] }> = ({ status }) => {
        const config = {
            'Pendente': { icon: ClockIcon, color: 'yellow' },
            'Pago': { icon: CheckCircleIcon, color: 'green' },
            'Vencido': { icon: XCircleIcon, color: 'red' },
            'Cancelado': { icon: XCircleIcon, color: 'gray' }
        };
        const { icon: Icon, color } = config[status];
        const colors = {
            yellow: 'bg-gold-500/10 text-gold-400',
            green: 'bg-green-500/10 text-green-400',
            red: 'bg-red-500/10 text-red-400',
            gray: 'bg-gray-500/10 text-gray-400',
        };
        return <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${colors[color]}`}><Icon className="w-3.5 h-3.5"/>{status}</span>;
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Gerenciar Cobranças</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400">
                    <PlusIcon className="w-5 h-5"/> Criar Cobrança
                </button>
            </div>

            <div className="bg-black border border-dark-800 rounded-lg">
                <div className="p-4 border-b border-dark-800 flex gap-2">
                    {(['all', 'Pendente', 'Pago', 'Vencido', 'Cancelado'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm rounded-full ${filter === f ? 'bg-gold-500 text-black font-semibold' : 'bg-dark-800 text-gray-300 hover:bg-dark-700'}`}>
                            {f === 'all' ? 'Todas' : f}
                        </button>
                    ))}
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-black">
                             <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                                <th className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCharges.map(charge => (
                                <tr key={charge.id} className="border-b border-dark-800 hover:bg-dark-800/50 cursor-pointer" onClick={() => setSelectedCharge(charge)}>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{charge.customerName}</p>
                                        <p className="text-xs text-gray-500">{charge.customerEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{new Date(charge.createdAt).toLocaleDateString('pt-BR')}</p>
                                        <p className="text-xs text-gray-500">Venc: {new Date(charge.dueDate).toLocaleDateString('pt-BR')}</p>
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={charge.status}/></td>
                                    <td className="px-6 py-4 text-right font-semibold text-white">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(charge.total)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button title="Copiar link de pagamento" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(charge.paymentLink); alert('Link copiado!'); }} className="p-1 text-gray-400 hover:text-gold-400"><LinkIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            {isModalOpen && <CreateChargeModal products={products} onClose={() => setIsModalOpen(false)} onSave={onSave} />}
            {selectedCharge && <ChargeDetailModal charge={selectedCharge} onClose={() => setSelectedCharge(null)} />}
        </div>
    );
};

export default WalletCharges;
