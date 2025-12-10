import React, { useState, useEffect } from 'react';
import { walletAPI } from '../../src/services/api';
import { DocumentPlusIcon, TrashIcon, LinkIcon, CloseIcon } from '../icons';
import type { Consultant } from '../../types';
import ConsultantDetailModal from '../ConsultantDetailModal';

// --- TYPES AND MOCK DATA ---
type BillingStatus = 'Pago' | 'Pendente' | 'Vencido';
interface Billing {
    id: string;
    consultant: Consultant;
    description: string;
    amount: number;
    dueDate: string;
    status: BillingStatus;
}

interface Product {
    id: string;
    name: string;
    price: number;
}

// Cleared mock data
const mockConsultantsForPage: Consultant[] = [];
const mockBillings: Billing[] = [];
const mockProducts: Product[] = [];


interface InvoiceItem {
    id: number;
    productId: string;
    quantity: number;
    price: number;
}


const statusClasses: Record<BillingStatus, string> = {
  'Pago': 'bg-green-600/20 text-green-400 focus:ring-green-500',
  'Pendente': 'bg-yellow-500/20 text-yellow-400 focus:ring-yellow-500',
  'Vencido': 'bg-red-600/20 text-red-400 focus:ring-red-500',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

const WalletBillingPage: React.FC = () => {
    const [billings, setBillings] = useState(mockBillings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { loadBillings(); }, []);

    const loadBillings = async () => {
        try {
            setLoading(true);
            const res = await walletAPI.getBillings();
            if (res?.data?.success) setBillings(res.data.billings || mockBillings);
        } catch (err) {
            setError('Erro ao carregar cobranças');
        } finally {
            setLoading(false);
        }
    };
    const [newBillingConsultantId, setNewBillingConsultantId] = useState('');
    const [newBillingDueDate, setNewBillingDueDate] = useState('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
        { id: Date.now(), productId: '', quantity: 1, price: 0 }
    ]);

    const [isConsultantModalOpen, setConsultantModalOpen] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
    
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [billingToDelete, setBillingToDelete] = useState<Billing | null>(null);
    
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);
    const [billingForLink, setBillingForLink] = useState<Billing | null>(null);

    const invoiceTotal = useMemo(() => {
        return invoiceItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [invoiceItems]);
    
    const handleItemChange = (itemId: number, field: 'productId' | 'quantity', value: string) => {
        setInvoiceItems(currentItems => 
            currentItems.map(item => {
                if (item.id === itemId) {
                    if (field === 'productId') {
                        const product = mockProducts.find(p => p.id === value);
                        return { ...item, productId: value, price: product ? product.price : 0 };
                    }
                    if (field === 'quantity') {
                        const quantity = parseInt(value, 10);
                        return { ...item, quantity: quantity >= 1 ? quantity : 1 };
                    }
                }
                return item;
            })
        );
    };

    const addItem = () => {
        setInvoiceItems([...invoiceItems, { id: Date.now(), productId: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (itemId: number) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
    };


    const handleCreateBilling = (e: React.FormEvent) => {
        e.preventDefault();
        const consultant = mockConsultantsForPage.find(c => c.id === parseInt(newBillingConsultantId));
        if (consultant && newBillingDueDate && invoiceTotal > 0 && invoiceItems.every(i => i.productId)) {
            const description = invoiceItems
                .map(item => {
                    const product = mockProducts.find(p => p.id === item.productId);
                    return `${item.quantity}x ${product?.name || 'Produto'}`;
                })
                .join(', ');

            const createdBilling: Billing = {
                id: `b${Date.now()}`,
                consultant,
                description: description.length > 50 ? description.substring(0, 47) + '...' : description,
                amount: invoiceTotal,
                dueDate: newBillingDueDate,
                status: 'Pendente',
            };
            setBillings([createdBilling, ...billings]);
            // Reset form
            setNewBillingConsultantId('');
            setNewBillingDueDate('');
            setInvoiceItems([{ id: Date.now(), productId: '', quantity: 1, price: 0 }]);
        } else {
            alert('Por favor, preencha todos os campos e adicione ao menos um produto válido.');
        }
    };
    
    const handleStatusChange = (billingId: string, newStatus: BillingStatus) => {
        setBillings(currentBillings => currentBillings.map(b => b.id === billingId ? { ...b, status: newStatus } : b));
    };
    
    const openDeleteModal = (billing: Billing) => {
        setBillingToDelete(billing);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (billingToDelete) {
            setBillings(billings.filter(b => b.id !== billingToDelete.id));
            setDeleteModalOpen(false);
            setBillingToDelete(null);
        }
    };
    
    const openLinkModal = (billing: Billing) => {
        setBillingForLink(billing);
        setLinkModalOpen(true);
    };
    
    const openConsultantModal = (consultant: Consultant) => {
        setSelectedConsultant(consultant);
        setConsultantModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <DocumentPlusIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Gestão de Cobranças</h1>
            </header>

            <form onSubmit={handleCreateBilling} className="mb-8 p-6 bg-black/50 border border-gray-800 rounded-xl">
                 <h2 className="text-xl font-semibold text-white mb-4">Criar Nova Cobrança</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Consultor</label>
                        <select value={newBillingConsultantId} onChange={(e) => setNewBillingConsultantId(e.target.value)} className={baseInputClasses} required>
                            <option value="">Selecione um consultor</option>
                            {mockConsultantsForPage.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Data de Vencimento</label>
                         <input type="date" value={newBillingDueDate} onChange={(e) => setNewBillingDueDate(e.target.value)} className={baseInputClasses} required />
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <label className="block text-sm font-medium text-gray-300">Itens da Fatura</label>
                    {invoiceItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                                <select value={item.productId} onChange={e => handleItemChange(item.id, 'productId', e.target.value)} className={baseInputClasses} required>
                                    <option value="">Selecione um produto</option>
                                    {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className={baseInputClasses} min="1" required />
                            </div>
                            <div className="col-span-2 text-center p-2.5 bg-gray-900/50 rounded-lg">
                                <span className="text-sm text-gray-400">{item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                            </div>
                            <div className="col-span-2 text-center p-2.5 bg-gray-900/50 rounded-lg font-semibold">
                                {(item.price * item.quantity).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                            </div>
                            <div className="col-span-1 text-center">
                                {invoiceItems.length > 1 && (
                                    <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-gray-700/50">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <button type="button" onClick={addItem} className="text-sm bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                    Adicionar Produto
                </button>

                <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-700">
                    <div className="text-right">
                        <p className="text-gray-400">Total da Fatura</p>
                        <p className="text-2xl font-bold text-yellow-500">{invoiceTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                    </div>
                    <button type="submit" className="bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors text-lg">
                        Gerar Cobrança
                    </button>
                </div>
            </form>

            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-6 py-4">Consultor</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4 text-right">Valor (R$)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billings.length > 0 ? billings.map(b => (
                                <tr key={b.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium">
                                        <button onClick={() => openConsultantModal(b.consultant)} className="hover:text-yellow-400 hover:underline transition-colors">
                                            {b.consultant.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{b.description}</td>
                                    <td className="px-6 py-4">{new Date(b.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{b.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-6 py-4 text-center">
                                         <select
                                            value={b.status}
                                            onChange={(e) => handleStatusChange(b.id, e.target.value as BillingStatus)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-full appearance-none outline-none ring-2 ring-transparent focus:ring-yellow-500/50 cursor-pointer ${statusClasses[b.status]}`}
                                            style={{backgroundColor: 'transparent' }}
                                        >
                                            <option value="Pendente" className="bg-gray-800 text-yellow-400">Pendente</option>
                                            <option value="Pago" className="bg-gray-800 text-green-400">Pago</option>
                                            <option value="Vencido" className="bg-gray-800 text-red-400">Vencido</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                         <button onClick={() => openLinkModal(b)} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors rounded-full hover:bg-gray-700/50" title="Gerar Link de Pagamento">
                                            <LinkIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => openDeleteModal(b)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-700/50" title="Remover Cobrança">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">Nenhuma cobrança encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isConsultantModalOpen && <ConsultantDetailModal isOpen={isConsultantModalOpen} consultant={selectedConsultant} onClose={() => setConsultantModalOpen(false)} onSave={() => {}} />}
            
            {isDeleteModalOpen && (
                 <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md">
                        <header className="p-4 border-b border-gray-700"><h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2></header>
                        <main className="p-6"><p className="text-gray-300">Tem certeza de que deseja remover a cobrança para <strong className="text-yellow-500">{billingToDelete?.consultant.name}</strong> no valor de <strong className="text-yellow-500">{billingToDelete?.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>? Esta ação não pode ser desfeita.</p></main>
                        <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end space-x-3 rounded-b-2xl">
                            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Excluir</button>
                        </footer>
                    </div>
                </div>
            )}
            
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg">
                        <header className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">Link de Pagamento</h2>
                            <button onClick={() => setLinkModalOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                        </header>
                        <main className="p-6 space-y-3">
                            <p className="text-sm text-gray-300">Link de pagamento para <strong className="text-yellow-500">{billingForLink?.consultant.name}</strong> referente a <strong className="text-yellow-500">{billingForLink?.description}</strong>.</p>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={`https://walletpay.rsprolipsi.com/pay/${billingForLink?.id}`} className={`${baseInputClasses} font-mono`} />
                                <button onClick={() => navigator.clipboard.writeText(`https://walletpay.rsprolipsi.com/pay/${billingForLink?.id}`)} className="bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm">Copiar</button>
                            </div>
                        </main>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WalletBillingPage;