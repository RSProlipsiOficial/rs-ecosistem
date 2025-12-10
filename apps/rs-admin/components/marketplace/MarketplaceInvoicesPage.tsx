import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../src/services/api';
import { DocumentTextIcon, ArrowDownTrayIcon } from '../icons';
// FIX: Import Invoice type from central types file to break circular dependency
import type { Order, Invoice } from '../../types';
import InvoiceDetailModal from './InvoiceDetailModal';

// Cleared mock data
const mockInvoices: Invoice[] = [];

const statusClasses: Record<string, string> = {
  Emitida: 'bg-green-600/20 text-green-400',
  Pendente: 'bg-yellow-500/20 text-yellow-400',
  Cancelada: 'bg-red-600/20 text-red-400',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

interface MarketplaceInvoicesPageProps {
    setActiveView: (view: string) => void;
}

const MarketplaceInvoicesPage: React.FC<MarketplaceInvoicesPageProps> = ({ setActiveView }) => {
    const [invoices, setInvoices] = useState(mockInvoices);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => { loadInvoices(); }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const res = await marketplaceAPI.getAllInvoices();
            if (res?.data?.success) setInvoices(res.data.invoices || mockInvoices);
        } catch (err) {
            setError('Erro ao carregar notas fiscais');
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <DocumentTextIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Notas Fiscais</h1>
            </header>
            
            <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <input type="text" placeholder="Buscar por NF, pedido, cliente..." className={baseInputClasses} />
                    <select className={baseInputClasses}><option>Todos os Status</option><option>Emitida</option><option>Pendente</option><option>Cancelada</option></select>
                     <div className="flex items-center gap-2">
                        <input type="date" className={baseInputClasses} />
                        <span className="text-gray-400">a</span>
                        <input type="date" className={baseInputClasses} />
                    </div>
                    <button className="bg-yellow-500 text-black font-bold py-2.5 px-5 rounded-lg hover:bg-yellow-600 transition-colors w-full">Filtrar</button>
                </div>
            </div>
            
            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-6 py-4">Nota Fiscal</th>
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Emissão</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockInvoices.length > 0 ? mockInvoices.map(i => (
                                <tr key={i.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono">{i.id}</td>
                                    <td className="px-6 py-4 font-mono">
                                        <button onClick={() => setActiveView('Marketplace Pedidos')} className="hover:text-yellow-400 transition-colors">{i.orderId}</button>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <button onClick={() => setActiveView('Consultores')} className="hover:text-yellow-400 transition-colors">{i.customer}</button>
                                    </td>
                                    <td className="px-6 py-4">{new Date(i.issueDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{i.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[i.status]}`}>{i.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        {i.status === 'Emitida' ? (
                                             <button onClick={() => handleViewInvoice(i)} className="font-medium text-yellow-500 hover:text-yellow-400">
                                                Ver Nota Fiscal
                                            </button>
                                        ) : (
                                             <button className="font-medium text-gray-500 cursor-not-allowed">
                                                -
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">Nenhuma nota fiscal encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InvoiceDetailModal 
                isOpen={isModalOpen}
                invoice={selectedInvoice}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default MarketplaceInvoicesPage;