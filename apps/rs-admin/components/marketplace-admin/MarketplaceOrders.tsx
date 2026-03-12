import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/services/supabase';
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
    PENDENTE: 'PAGO', PAGO: 'SEPARACAO', SEPARACAO: 'ENVIADO', ENVIADO: 'ENTREGUE',
};

const MarketplaceOrders: React.FC = () => {
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
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false })
                .limit(300);
            if (!error && data) setOrders(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) setSelectedOrder((o: any) => ({ ...o, status: newStatus }));
        } catch { alert('Erro ao atualizar status'); }
        finally { setUpdatingId(null); }
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
        } finally { setUpdatingId(null); }
    };

    const filtered = orders.filter(o => {
        const matchStatus = statusFilter === 'TODOS' || (o.status || '').toUpperCase() === statusFilter;
        const matchSearch = !search ||
            (o.id || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.customer_name || o.buyer_name || o.name || '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">Gestão de Pedidos</h2>
                    <p className="text-sm text-gray-500">{filtered.length} pedidos encontrados</p>
                </div>
                <button onClick={loadOrders} className="px-4 py-2 bg-[#1E1E1E] border border-gray-800 rounded-lg text-sm text-white hover:border-yellow-500/50 transition-colors">🔄 Atualizar</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                    <input type="text" placeholder="Buscar por ID ou cliente..." className="w-full bg-[#1E1E1E] border border-gray-800 text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-500/50" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${statusFilter === s ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-[#1E1E1E] text-gray-500 border-gray-800 hover:text-white'}`}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Modal Detalhes */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                        <h3 className="text-lg font-bold text-white mb-4">Pedido #{(selectedOrder.id || '').toString().slice(0, 8).toUpperCase()}</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="text-white font-medium">{selectedOrder.customer_name || selectedOrder.buyer_name || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="text-yellow-500 font-bold">R$ {Number(selectedOrder.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusColors[(selectedOrder.status || '').toUpperCase()] || ''}`}>{selectedOrder.status}</span></div>
                            {selectedOrder.tracking_code && <div className="flex justify-between"><span className="text-gray-500">Rastreio</span><span className="text-white font-mono text-xs">{selectedOrder.tracking_code}</span></div>}
                            {selectedOrder.shipping_address && <div className="flex justify-between"><span className="text-gray-500">Endereço</span><span className="text-white text-right max-w-[60%]">{selectedOrder.shipping_address}</span></div>}
                            {selectedOrder.order_items?.length > 0 && (
                                <div className="mt-4 border-t border-gray-800 pt-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Itens do Pedido</p>
                                    {selectedOrder.order_items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm py-1">
                                            <span className="text-white">{item.product_name || item.name} x{item.quantity}</span>
                                            <span className="text-yellow-500">R$ {Number(item.unit_price || item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!selectedOrder.tracking_code && !['ENTREGUE', 'CANCELADO'].includes((selectedOrder.status || '').toUpperCase()) && (
                                <div className="mt-4 border-t border-gray-800 pt-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Adicionar Código de Rastreio</p>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Ex: BR123456789BR" className="flex-1 bg-black/40 border border-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500/50" value={trackingInputs[selectedOrder.id] || ''} onChange={e => setTrackingInputs(p => ({ ...p, [selectedOrder.id]: e.target.value }))} />
                                        <button onClick={() => saveTracking(selectedOrder.id)} disabled={updatingId === selectedOrder.id} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">Salvar</button>
                                    </div>
                                </div>
                            )}
                            {nextStatus[(selectedOrder.status || '').toUpperCase()] && (
                                <button onClick={() => updateStatus(selectedOrder.id, nextStatus[(selectedOrder.status || '').toUpperCase()])} disabled={updatingId === selectedOrder.id} className="w-full mt-4 py-2.5 bg-yellow-500 text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                                    {updatingId === selectedOrder.id ? 'Atualizando...' : `Avançar para: ${nextStatus[(selectedOrder.status || '').toUpperCase()]}`}
                                </button>
                            )}
                            <button onClick={() => updateStatus(selectedOrder.id, 'CANCELADO')} disabled={updatingId === selectedOrder.id || (selectedOrder.status || '').toUpperCase() === 'CANCELADO'} className="w-full py-2 border border-red-800/50 text-red-400 font-medium rounded-xl text-sm hover:bg-red-900/20 disabled:opacity-30">Cancelar Pedido</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500"><Inbox className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhum pedido encontrado</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-black/20">
                                <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-left">Data</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((order, i) => (
                                    <tr key={order.id || i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{(order.id || '').toString().slice(0, 8).toUpperCase()}</td>
                                        <td className="px-4 py-3 text-white font-medium">{order.customer_name || order.buyer_name || 'Cliente'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td className="px-4 py-3 text-right font-bold text-yellow-500">R$ {Number(order.total || order.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 text-xs font-bold rounded border ${statusColors[(order.status || '').toUpperCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>{order.status || '—'}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 bg-black/40 border border-gray-800 text-white text-xs font-medium rounded-lg hover:border-yellow-500/50">Ver</button>
                                                {nextStatus[(order.status || '').toUpperCase()] && (
                                                    <button onClick={() => updateStatus(order.id, nextStatus[(order.status || '').toUpperCase()])} disabled={updatingId === order.id} className="px-3 py-1.5 bg-yellow-500/90 text-black text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
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

export default MarketplaceOrders;
