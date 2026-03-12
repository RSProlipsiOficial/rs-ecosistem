import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/services/supabase';
import { Inbox, PiggyBank, Package, ShoppingBag, AlertTriangle } from 'lucide-react';

interface KPI { label: string; value: string; sub?: string; icon: React.ReactNode; color: string; }

const StatCard: React.FC<KPI> = ({ label, value, sub, icon, color }) => (
    <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800 hover:border-yellow-500/40 transition-all">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
                <h3 className={`text-3xl font-black mt-1 ${color}`}>{value}</h3>
                {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
            </div>
            <div className="opacity-80 flex items-center justify-center w-10 h-10">{icon}</div>
        </div>
    </div>
);

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        'PENDENTE': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'PAGO': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'ENVIADO': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        'ENTREGUE': 'bg-green-500/20 text-green-400 border-green-500/30',
        'CANCELADO': 'bg-red-500/20 text-red-400 border-red-500/30',
        'COMPLETO': 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${map[status?.toUpperCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
            {status || 'N/A'}
        </span>
    );
};

const MarketplaceDashboard: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [ordersRes, productsRes] = await Promise.allSettled([
                    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
                    supabase.from('products').select('*').order('name', { ascending: true }),
                ]);
                if (ordersRes.status === 'fulfilled' && !ordersRes.value.error) setOrders(ordersRes.value.data || []);
                if (productsRes.status === 'fulfilled' && !productsRes.value.error) setProducts(productsRes.value.data || []);
            } catch (e) {
                console.error('[MarketplaceDashboard] Erro:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const PAID_STATUSES = ['PAGO', 'PAID', 'ENTREGUE', 'DELIVERED', 'COMPLETO', 'COMPLETED', 'ENVIADO', 'SHIPPED', 'SEPARACAO'];
    const totalRevenue = orders
        .filter(o => PAID_STATUSES.includes((o.status || '').toUpperCase()))
        .reduce((acc, o) => acc + Number(o.total || o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => (o.status || '').toUpperCase() === 'PENDENTE' || (o.status || '').toUpperCase() === 'PENDING').length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => Number(p.stock_quantity || p.stock || 0) < 5).length;

    const kpis: KPI[] = [
        { label: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: `${orders.filter(o => PAID_STATUSES.includes((o.status || '').toUpperCase())).length} pedidos confirmados`, icon: <PiggyBank className="w-7 h-7" />, color: 'text-yellow-500' },
        { label: 'Pedidos Pendentes', value: String(pendingOrders), sub: `de ${orders.length} pedidos totais`, icon: <Package className="w-7 h-7" />, color: pendingOrders > 0 ? 'text-yellow-400' : 'text-green-400' },
        { label: 'Produtos Ativos', value: String(totalProducts), sub: `${lowStockProducts} com estoque baixo`, icon: <ShoppingBag className="w-7 h-7" />, color: 'text-blue-400' },
        { label: 'Estoque Crítico', value: String(lowStockProducts), sub: 'produtos com menos de 5 unidades', icon: <AlertTriangle className="w-7 h-7" />, color: lowStockProducts > 0 ? 'text-red-400' : 'text-green-400' },
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div></div>;
    }

    return (
        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-2xl font-black text-white">Visão Geral do Marketplace</h2>
                <p className="text-gray-500 text-sm mt-1">KPIs em tempo real da operação</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map(kpi => <StatCard key={kpi.label} {...kpi} />)}
            </div>

            {/* Últimos Pedidos */}
            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">📋 Últimos Pedidos</h3>
                    <span className="text-xs text-gray-500">{orders.length} registros</span>
                </div>
                <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-600">
                            <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
                            <p className="text-sm">Nenhum pedido encontrado. Aguardando primeiras vendas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-black/20">
                                <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-left">Data</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders.slice(0, 10).map((order, i) => (
                                    <tr key={order.id || i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{(order.id || '').toString().slice(0, 8).toUpperCase()}</td>
                                        <td className="px-4 py-3 text-white font-medium">{order.customer_name || order.buyer_name || order.name || 'Cliente'}</td>
                                        <td className="px-4 py-3 text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td className="px-4 py-3 text-right font-bold text-yellow-500">R$ {Number(order.total || order.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-center">{statusBadge(order.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Produtos com Estoque Crítico */}
            {lowStockProducts > 0 && (
                <div className="bg-red-900/10 rounded-xl border border-red-800/30">
                    <div className="px-6 py-4 border-b border-red-800/30">
                        <h3 className="text-base font-bold text-red-400">⚠️ Produtos com Estoque Crítico</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {products.filter(p => Number(p.stock_quantity || p.stock || 0) < 5).slice(0, 6).map((p, i) => (
                            <div key={p.id || i} className="flex items-center gap-3 bg-red-900/10 border border-red-800/20 rounded-lg p-3">
                                {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded" />}
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                                    <p className="text-red-400 text-xs font-bold">{Number(p.stock_quantity || p.stock || 0)} unidades restantes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceDashboard;
