import React, { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../../types';
import { CloseIcon, UserCircleIcon, EnvelopeIcon, TruckIcon, CurrencyDollarIcon, PrinterIcon, ArchiveBoxIcon, CheckCircleIcon, SpinnerIcon } from '../icons';

interface ModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
    onSave: (order: Order) => void;
}

const statusClasses: Record<string, string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-400',
  Processando: 'bg-cyan-500/20 text-cyan-400',
  Enviado: 'bg-blue-600/20 text-blue-400',
  Entregue: 'bg-green-600/20 text-green-400',
  Cancelado: 'bg-red-600/20 text-red-400',
};
const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

type SaveStatus = 'idle' | 'saving' | 'success';

const OrderDetailModal: React.FC<ModalProps> = ({ isOpen, order, onClose, onSave }) => {
    const [formData, setFormData] = useState<Order | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        if (order) {
            setFormData(JSON.parse(JSON.stringify(order))); // Deep copy
        }
        setSaveStatus('idle');
        setEmailSent(false);
    }, [order, isOpen]);
    
    if (!isOpen || !formData) return null;

    const subtotal = formData.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const hasChanges = JSON.stringify(order) !== JSON.stringify(formData);

    const handleStatusChange = (newStatus: OrderStatus) => {
        setFormData(prev => {
            if (!prev) return null;
            const newHistory = [...prev.history, {
                date: new Date().toISOString(),
                status: newStatus,
                notes: `Status alterado para ${newStatus} pelo administrador.`
            }];
            return { ...prev, status: newStatus, history: newHistory };
        });
    };

    const handleTrackingCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => prev ? { ...prev, shipping: { ...prev.shipping, trackingCode: value } } : null);
    };

    const handleSaveChanges = () => {
        if (!hasChanges) return;
        setSaveStatus('saving');
        setTimeout(() => {
            onSave(formData);
            setSaveStatus('success');
        }, 1000); // Simulate API call
    };
    
    const handlePrint = () => window.print();

    const handleResendEmail = () => {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center p-4 print:p-0" aria-modal="true" role="dialog">
            <style>{`
                @media print {
                    body > *:not(.printable-order) { display: none; }
                    .printable-order {
                        position: absolute; left: 0; top: 0; width: 100%; height: 100%;
                        border: none; box-shadow: none; border-radius: 0; max-height: none;
                        color: black; background-color: white !important;
                    }
                    .no-print { display: none; }
                    .print-bg-gray { background-color: #f3f4f6 !important; }
                    .print-text-black { color: black !important; }
                    .print-border-gray { border-color: #d1d5db !important; }
                }
            `}</style>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col printable-order">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 print-border-gray no-print">
                    <div>
                        <h2 className="text-xl font-bold text-white">Detalhes do Pedido <span className="font-mono text-yellow-500">{formData.id}</span></h2>
                        <p className="text-xs text-gray-400">
                            {new Date(formData.date).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:p-8">
                    {/* Coluna Esquerda e Central */}
                    <div className="lg:col-span-2 space-y-6 print:col-span-3">
                        {/* Itens do Pedido */}
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 print-bg-gray print-border-gray">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 print-text-black"><ArchiveBoxIcon className="w-5 h-5 text-yellow-500"/>Itens do Pedido</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <tbody>
                                        {formData.items.map(item => (
                                            <tr key={item.productId} className="border-b border-gray-800 last:border-b-0 print-border-gray">
                                                <td className="py-3 pr-3 no-print"><img src={item.imageUrl} alt={item.productName} className="w-16 h-16 rounded-md object-cover"/></td>
                                                <td className="py-3 pr-3 text-gray-300 print-text-black">
                                                    <p className="font-semibold text-white print-text-black">{item.productName}</p>
                                                    <p className="text-xs font-mono">SKU: {item.sku}</p>
                                                </td>
                                                <td className="py-3 px-3 text-center text-gray-400 print-text-black">{item.quantity} x {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                <td className="py-3 pl-3 text-right font-semibold text-white print-text-black">{(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Histórico do Pedido */}
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 print-bg-gray print-border-gray no-print">
                             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-yellow-500"/>Histórico do Pedido</h3>
                             <ul className="space-y-4">
                                {formData.history.map((h, i) => (
                                    <li key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${statusClasses[h.status] || 'bg-gray-600'}`}><div className="w-2 h-2 bg-white rounded-full"></div></div>
                                            {i < formData.history.length - 1 && <div className="w-px flex-grow bg-gray-700"></div>}
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${statusClasses[h.status]?.replace('bg-', 'text-')}`}>{h.status}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{h.notes}</p>
                                            <p className="text-xs text-gray-500">{new Date(h.date).toLocaleString('pt-BR')}</p>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>

                    {/* Coluna Direita */}
                    <div className="lg:col-span-1 space-y-6 print:col-span-3">
                         {/* Status e Ações */}
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 no-print">
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Status do Pedido</label>
                            <select value={formData.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)} className={`${baseInputClasses} font-semibold ${statusClasses[formData.status]}`}>
                                <option value="Pendente">Pendente</option>
                                <option value="Processando">Processando</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                             <div className="mt-4">
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Código de Rastreio</label>
                                <input type="text" value={formData.shipping.trackingCode || ''} onChange={handleTrackingCodeChange} placeholder="Insira o código" className={baseInputClasses}/>
                             </div>
                        </div>
                        {/* Cliente e Endereço */}
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4 print-bg-gray print-border-gray">
                            <div>
                                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2 print-text-black"><UserCircleIcon className="w-5 h-5 text-yellow-500"/>Cliente</h3>
                                <p className="text-sm text-gray-300 print-text-black">{formData.customer.name}</p>
                                <p className="text-sm text-gray-400 flex items-center gap-1.5 print-text-black"><EnvelopeIcon className="w-4 h-4"/> {formData.customer.email}</p>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2 print-text-black"><TruckIcon className="w-5 h-5 text-yellow-500"/>Endereço de Entrega</h3>
                                <address className="text-sm text-gray-400 not-italic print-text-black">
                                    {formData.shipping.address.street}<br/>
                                    {formData.shipping.address.city}, {formData.shipping.address.state}<br/>
                                    CEP: {formData.shipping.address.zip}
                                </address>
                                <p className="text-xs text-gray-500 mt-2 italic no-print">Endereço obtido automaticamente do cadastro do cliente.</p>
                            </div>
                        </div>
                        {/* Financeiro */}
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 print-bg-gray print-border-gray">
                            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2 print-text-black"><CurrencyDollarIcon className="w-5 h-5 text-yellow-500"/>Financeiro</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-300 print-text-black"><span>Subtotal</span><span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                <div className="flex justify-between text-gray-300 print-text-black"><span>Frete ({formData.shipping.method})</span><span>{formData.shipping.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 text-white print-border-gray print-text-black"><span>Total</span><span className="text-yellow-400 print-text-black">{formData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 italic no-print">O custo do frete é calculado e incluído automaticamente.</p>
                        </div>
                    </div>
                </main>

                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-between items-center no-print">
                     <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-600 transition-colors"><PrinterIcon className="w-5 h-5"/>Imprimir</button>
                        <button onClick={handleResendEmail} disabled={emailSent} className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-600 transition-colors disabled:bg-green-500/20 disabled:text-green-400">
                           {emailSent ? <><CheckCircleIcon className="w-5 h-5"/> Enviado!</> : <><EnvelopeIcon className="w-5 h-5"/>Reenviar E-mail</>}
                        </button>
                    </div>
                    <button 
                        onClick={handleSaveChanges} 
                        disabled={!hasChanges || saveStatus !== 'idle'}
                        className="flex items-center justify-center gap-2 w-44 px-6 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {saveStatus === 'idle' && 'Salvar Alterações'}
                        {saveStatus === 'saving' && <><SpinnerIcon className="w-5 h-5 animate-spin" /> Salvando...</>}
                        {saveStatus === 'success' && <><CheckCircleIcon className="w-5 h-5" /> Salvo!</>}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default OrderDetailModal;