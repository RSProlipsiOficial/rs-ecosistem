import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../src/services/api';
import { CubeIcon } from '../icons';
import type { Order } from '../../types';
import OrderDetailModal from './OrderDetailModal';

// Cleared mock data
const mockOrders: Order[] = [];


const statusClasses: Record<string, string> = {
    Pendente: 'bg-yellow-500/20 text-yellow-400',
    Processando: 'bg-cyan-500/20 text-cyan-400',
    Enviado: 'bg-blue-600/20 text-blue-400',
    Entregue: 'bg-green-600/20 text-green-400',
    Cancelado: 'bg-red-600/20 text-red-400',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

interface MarketplaceOrdersPageProps {
    setActiveView: (view: string) => void;
}

const MarketplaceOrdersPage: React.FC<MarketplaceOrdersPageProps> = ({ setActiveView }) => {
    const [orders, setOrders] = useState(mockOrders);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await marketplaceAPI.getAllOrders();
            // [RS-MAPPING] Nested data support
            const actualData = res.data?.data || res.data;
            if (actualData?.success || actualData?.orders) {
                setOrders(actualData.orders || actualData || mockOrders);
            }
        } catch (err) {
            setError('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleSaveOrder = (updatedOrder: Order) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        // Keep modal open for a moment to show save confirmation
        setTimeout(() => {
            handleCloseModal();
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <CubeIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Pedidos do Marketplace</h1>
            </header>

            <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <input type="text" placeholder="Buscar por pedido, cliente..." className={baseInputClasses} />
                    <select className={baseInputClasses}><option>Todos os Status</option><option>Pendente</option><option>Enviado</option><option>Entregue</option><option>Cancelado</option></select>
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
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Pagamento</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map(o => (
                                <tr key={o.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono">{o.id}</td>
                                    <td className="px-6 py-4 font-medium">
                                        <button onClick={() => setActiveView('Consultores')} className="hover:text-yellow-400 transition-colors">{o.customer.name}</button>
                                    </td>
                                    <td className="px-6 py-4">{new Date(o.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{o.payment.method}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{o.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[o.status]}`}>{o.status}</span></td>
                                    <td className="px-6 py-4 text-center"><button onClick={() => handleViewDetails(o)} className="font-medium text-yellow-500 hover:text-yellow-400">Ver Detalhes</button></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">Nenhum pedido encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailModal
                isOpen={isModalOpen}
                order={selectedOrder}
                onClose={handleCloseModal}
                onSave={handleSaveOrder}
            />
        </div>
    );
};

export default MarketplaceOrdersPage;