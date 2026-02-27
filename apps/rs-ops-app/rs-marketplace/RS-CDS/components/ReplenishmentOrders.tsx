
import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Package, Search, Filter, Eye, X, Calendar, DollarSign, Clock, Truck, ChevronRight } from 'lucide-react';

interface ReplenishmentOrdersProps {
    cdId: string;
}

const ReplenishmentOrders: React.FC<ReplenishmentOrdersProps> = ({ cdId }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const data = await dataService.getReplenishmentOrders(cdId);
            setOrders(data);
            setLoading(false);
        };
        fetchOrders();
    }, [cdId]);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDENTE': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
            case 'APROVADO': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
            case 'PAGO': return 'bg-green-500/20 text-green-500 border-green-500/20';
            case 'ENVIADO': return 'bg-purple-500/20 text-purple-500 border-purple-500/20';
            case 'ENTREGUE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
            case 'CANCELADO': return 'bg-red-500/20 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Sincronizando Histórico...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="text-gold-400" />
                        Meus Abastecimentos
                    </h2>
                    <p className="text-gray-400 text-sm">Acompanhe as suas solicitações de reposição de estoque à Sede.</p>
                </div>
            </div>

            <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-800 text-gray-200 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Data / Hora</th>
                                <th className="px-6 py-4">ID do Pedido</th>
                                <th className="px-6 py-4">Itens</th>
                                <th className="px-6 py-4 text-right">Valor Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic">
                                        Nenhuma solicitação de abastecimento encontrada.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-white font-medium">
                                                    <Calendar size={12} className="text-gold-400" />
                                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                                    <Clock size={10} />
                                                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-300 bg-dark-950 px-2 py-1 rounded border border-dark-800">
                                                {order.id.split('-')[0].toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package size={12} className="text-blue-400" />
                                                <span className="text-white text-xs font-medium">{order.items_count} volumes</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gold-400 font-bold">
                                            R$ {Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className="mb-6 pb-4 border-b border-dark-800">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Truck className="text-gold-400" />
                                Detalhes do Abastecimento
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Pedido <span className="text-white font-mono font-bold">#{selectedOrder.id}</span> • Solicitado em {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Status Atual</span>
                                    <p className={`font-bold ${getStatusColor(selectedOrder.status).split(' ')[1]}`}>{selectedOrder.status}</p>
                                </div>
                                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Total do Pedido</span>
                                    <p className="text-gold-400 font-black text-xl">R$ {Number(selectedOrder.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <Package size={16} />
                                    Itens Solicitados
                                </h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-dark-800/30 p-3 rounded border border-dark-800">
                                            <div>
                                                <p className="text-white text-sm font-medium">{item.product_name}</p>
                                                <p className="text-[10px] text-gray-500">Cód: {item.product_id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold text-sm">
                                                    {item.quantity}x <span className="text-gray-400 font-normal text-xs">R$ {Number(item.unit_price).toFixed(2)}</span>
                                                </p>
                                                <p className="text-gold-400 text-xs font-bold">R$ {(item.quantity * Number(item.unit_price)).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-dark-800 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-2 bg-dark-800 text-white font-bold rounded-lg hover:bg-dark-700 transition-all border border-dark-700"
                            >
                                FECHAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReplenishmentOrders;
