
import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/marketplaceAPI';
import { supabase } from '../services/supabase';
import { Inbox } from 'lucide-react';

const STATUS_OPTIONS = ['TODOS', 'PENDENTE', 'PAGO', 'SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

const statusColors: Record<string, string> = {
    PENDENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PAGO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    SEPARACAO: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    ENVIADO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ENTREGUE: 'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELADO: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const nextStatus: Record<string, string> = {
    PENDENTE: 'PAGO',
    PAGO: 'SEPARACAO',
    SEPARACAO: 'ENVIADO',
    ENVIADO: 'ENTREGUE',
};

const MarketplaceAdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Busca diretamente no Supabase para ter mais controle
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false })
                .limit(200);
            if (!error && data) setOrders(data);
            else {
                // Fallback para API
                const res = await ordersAPI.getAll();
                setOrders(res?.data || res || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) setSelectedOrder((o: any) => ({ ...o, status: newStatus }));
        } catch (e) {
            alert('Erro ao atualizar status');
        } finally {
            setUpdatingId(null);
        }
    };

    const saveTracking = async (orderId: string) => {
        const code = trackingInputs[orderId]?.trim();
        if (!code) return;
        setUpdatingId(orderId);
        try {
            const { error } = await supabase.from('orders').update({ tracking_code: code, status: 'ENVIADO' }).eq('id', orderId);
            if (!error) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking_code: code, status: 'ENVIADO' } : o));
                if (selectedOrder?.id === orderId) setSelectedOrder((o: any) => ({ ...o, tracking_code: code, status: 'ENVIADO' }));
                setTrackingInputs(prev => { const n = { ...prev }; delete n[orderId]; return n; });
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = orders.filter(o => {
        const matchStatus = statusFilter === 'TODOS' || (o.status || '').toUpperCase() === statusFilter;
        const matchSearch = !search ||
            (o.id || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.customer_name || o.buyer_name || o.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.order_code || '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">Gestão de Pedidos</h2>
                    <div className="p-12 text-center text-gray-500"><Inbox className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhum pedido encontrado</p></div>
                </div>
                <button onClick={loadOrders} className="px-4 py-2 bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg text-sm text-white hover:border-[rgb(var(--color-brand-gold))]/50 transition-colors">
                    🔄 Atualizar
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-brand-text-dim))]">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por ID, cliente ou código..."
                        className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[rgb(var(--color-brand-gold))]/50"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${statusFilter === s
                                ? 'bg-[rgb(var(--color-brand-gold))]/20 text-[rgb(var(--color-brand-gold))] border-[rgb(var(--color-brand-gold))]/50'
                                : 'bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-dim))] border-[rgb(var(--color-brand-gray-light))] hover:text-white'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal Detalhes */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-[rgb(var(--color-brand-text-dim))] hover:text-white">✕</button>
                        <h3 className="text-lg font-bold text-white mb-4">Pedido #{(selectedOrder.id || '').toString().slice(0, 8).toUpperCase()}</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-[rgb(var(--color-brand-text-dim))]">Cliente</span><span className="text-white font-medium">{selectedOrder.customer_name || selectedOrder.buyer_name || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-[rgb(var(--color-brand-text-dim))]">Total</span><span className="text-[rgb(var(--color-brand-gold))] font-bold">R$ {Number(selectedOrder.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between"><span className="text-[rgb(var(--color-brand-text-dim))]">Status</span><span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusColors[(selectedOrder.status || '').toUpperCase()] || ''}`}>{selectedOrder.status}</span></div>
                            {selectedOrder.tracking_code && <div className="flex justify-between"><span className="text-[rgb(var(--color-brand-text-dim))]">Rastreio</span><span className="text-white font-mono text-xs">{selectedOrder.tracking_code}</span></div>}
                            {selectedOrder.shipping_address && <div className="flex justify-between"><span className="text-[rgb(var(--color-brand-text-dim))]">Endereço</span><span className="text-white text-right max-w-[60%]">{selectedOrder.shipping_address}</span></div>}
                            {/* Itens */}
                            {selectedOrder.order_items?.length > 0 && (
                                <div className="mt-4 border-t border-[rgb(var(--color-brand-gray-light))] pt-4">
                                    <p className="text-xs font-bold text-[rgb(var(--color-brand-text-dim))] uppercase mb-2">Itens do Pedido</p>
                                    {selectedOrder.order_items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm py-1">
                                            <span className="text-white">{item.product_name || item.name} x{item.quantity}</span>
                                            <span className="text-[rgb(var(--color-brand-gold))]">R$ {Number(item.unit_price || item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Tracking Input */}
                            {!selectedOrder.tracking_code && !['ENTREGUE', 'CANCELADO'].includes((selectedOrder.status || '').toUpperCase()) && (
                                <div className="mt-4 border-t border-[rgb(var(--color-brand-gray-light))] pt-4">
                                    <p className="text-xs font-bold text-[rgb(var(--color-brand-text-dim))] uppercase mb-2">Adicionar Código de Rastreio</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ex: BR123456789BR"
                                            className="flex-1 bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[rgb(var(--color-brand-gold))]/50"
                                            value={trackingInputs[selectedOrder.id] || ''}
                                            onChange={e => setTrackingInputs(p => ({ ...p, [selectedOrder.id]: e.target.value }))}
                                        />
                                        <button
                                            onClick={() => saveTracking(selectedOrder.id)}
                                            disabled={updatingId === selectedOrder.id}
                                            className="px-4 py-2 bg-[rgb(var(--color-brand-gold))] text-black font-bold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Avançar Status */}
                            {nextStatus[(selectedOrder.status || '').toUpperCase()] && (
                                <button
                                    onClick={() => updateStatus(selectedOrder.id, nextStatus[(selectedOrder.status || '').toUpperCase()])}
                                    disabled={updatingId === selectedOrder.id}
                                    className="w-full mt-4 py-2.5 bg-[rgb(var(--color-brand-gold))] text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                                >
                                    {updatingId === selectedOrder.id ? 'Atualizando...' : `Avançar para: ${nextStatus[(selectedOrder.status || '').toUpperCase()]}`}
                                </button>
                            )}
                            <button
                                onClick={() => updateStatus(selectedOrder.id, 'CANCELADO')}
                                disabled={updatingId === selectedOrder.id || (selectedOrder.status || '').toUpperCase() === 'CANCELADO'}
                                className="w-full py-2 border border-red-800/50 text-red-400 font-medium rounded-xl text-sm hover:bg-red-900/20 disabled:opacity-30 transition-colors"
                            >
                                Cancelar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-[rgb(var(--color-brand-gray))] rounded-xl border border-[rgb(var(--color-brand-gray-light))] overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(var(--color-brand-gold))]"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-[rgb(var(--color-brand-text-dim))]">
                        <p className="text-4xl mb-2">📭</p>
                        <p>Nenhum pedido encontrado com esses filtros</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[rgba(255,255,255,0.03)]">
                                <tr className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-brand-text-dim))]">
                                    <th className="px-4 py-3 text-left">ID / Código</th>
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-left">Data</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgb(var(--color-brand-gray-light))]">
                                {filtered.map((order, i) => (
                                    <tr key={order.id || i} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-xs text-white">#{(order.id || '').toString().slice(0, 8).toUpperCase()}</p>
                                            {order.order_code && <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{order.order_code}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-white font-medium">{order.customer_name || order.buyer_name || order.name || 'Cliente'}</p>
                                            {order.customer_email && <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{order.customer_email}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-[rgb(var(--color-brand-text-dim))] text-xs">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : order.date || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-[rgb(var(--color-brand-gold))]">
                                            R$ {Number(order.total || order.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded border ${statusColors[(order.status || '').toUpperCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                                {order.status || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="px-3 py-1.5 bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] text-white text-xs font-medium rounded-lg hover:border-[rgb(var(--color-brand-gold))]/50 transition-colors"
                                                >
                                                    Ver
                                                </button>
                                                {nextStatus[(order.status || '').toUpperCase()] && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, nextStatus[(order.status || '').toUpperCase()])}
                                                        disabled={updatingId === order.id}
                                                        className="px-3 py-1.5 bg-[rgb(var(--color-brand-gold))]/90 text-black text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                                                    >
                                                        {updatingId === order.id ? '...' : `→ ${nextStatus[(order.status || '').toUpperCase()]}`}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceAdminOrders;
