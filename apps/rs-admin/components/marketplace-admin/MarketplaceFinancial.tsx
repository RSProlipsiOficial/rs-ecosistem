import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/services/supabase';
import { CreditCard, BarChart2, Download } from 'lucide-react';

interface FinancialEntry {
    id: string; created_at: string; description: string;
    type: 'IN' | 'OUT'; amount: number; status: string; order_id?: string;
}

const MONTH_PT: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

const MarketplaceFinancial: React.FC = () => {
    const [entries, setEntries] = useState<FinancialEntry[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'RESUMO' | 'TRANSACOES'>('RESUMO');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [trxRes, ordersRes] = await Promise.allSettled([
                    supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(200),
                    supabase.from('orders').select('id, total, status, created_at, customer_name, buyer_name').order('created_at', { ascending: false }).limit(500)
                ]);
                if (trxRes.status === 'fulfilled' && !trxRes.value.error) setEntries(trxRes.value.data || []);
                if (ordersRes.status === 'fulfilled' && !ordersRes.value.error) setOrders(ordersRes.value.data || []);
            } finally { setLoading(false); }
        };
        load();
    }, []);

    const PAID_STATUSES = ['PAGO', 'PAID', 'ENTREGUE', 'DELIVERED', 'COMPLETO', 'COMPLETED', 'ENVIADO', 'SHIPPED', 'SEPARACAO'];
    const paidOrders = orders.filter(o => PAID_STATUSES.includes((o.status || '').toUpperCase()));
    const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const pendingRevenue = orders.filter(o => ['PENDENTE', 'PENDING'].includes((o.status || '').toUpperCase())).reduce((acc, o) => acc + Number(o.total || 0), 0);
    const canceledRevenue = orders.filter(o => ['CANCELADO', 'CANCELED'].includes((o.status || '').toUpperCase())).reduce((acc, o) => acc + Number(o.total || 0), 0);

    const revenueByMonth: Record<string, number> = {};
    paidOrders.forEach(o => {
        if (!o.created_at) return;
        const key = o.created_at.substring(0, 7);
        revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(o.total || 0);
    });
    const months = Object.keys(revenueByMonth).sort().slice(-6);
    const maxMonthly = Math.max(...months.map(m => revenueByMonth[m]), 1);

    const filteredEntries = entries.filter(e => {
        if (startDate && e.created_at < startDate) return false;
        if (endDate && e.created_at > endDate + 'T23:59:59') return false;
        return true;
    });

    const exportCSV = () => {
        const headers = ['ID', 'Data', 'Descrição', 'Tipo', 'Valor (R$)', 'Status'];
        const rows = filteredEntries.map(e => [e.id, new Date(e.created_at).toLocaleDateString('pt-BR'), e.description, e.type, e.amount.toFixed(2), e.status].join(','));
        const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = `financeiro-marketplace-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">Financeiro do Marketplace</h2>
                    <p className="text-sm text-gray-500">Receita, transações e relatórios</p>
                </div>
                <button onClick={exportCSV} className="px-4 py-2 bg-yellow-500/90 text-black font-bold rounded-lg text-sm hover:opacity-90 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Exportar CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Receita Confirmada</p>
                    <h3 className="text-3xl font-black text-yellow-500 mt-1">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-gray-500 mt-1">{paidOrders.length} pedidos confirmados</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-xl p-5 border border-yellow-800/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Receita Pendente</p>
                    <h3 className="text-3xl font-black text-yellow-400 mt-1">R$ {pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-gray-500 mt-1">Aguardando pagamento</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-xl p-5 border border-red-900/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Cancelamentos</p>
                    <h3 className="text-3xl font-black text-red-400 mt-1">R$ {canceledRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-gray-500 mt-1">Receita não realizada</p>
                </div>
            </div>

            {/* Gráfico de Barras */}
            {months.length > 0 && (
                <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 p-6">
                    <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-yellow-500" /> Receita por Mês</h3>
                    <div className="flex items-end gap-3 h-40">
                        {months.map(m => {
                            const val = revenueByMonth[m];
                            const heightPct = Math.round((val / maxMonthly) * 100);
                            const [year, month] = m.split('-');
                            return (
                                <div key={m} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs text-yellow-500 font-bold">{val >= 1000 ? `R$${(val / 1000).toFixed(1)}k` : `R$${val.toFixed(0)}`}</span>
                                    <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-500/40 rounded-t-md transition-all" style={{ height: `${Math.max(4, heightPct)}%` }}></div>
                                    <span className="text-xs text-gray-500">{MONTH_PT[month]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex gap-2 border-b border-gray-800">
                {(['RESUMO', 'TRANSACOES'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${tab === t ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-500 hover:text-white'}`}>
                        {t === 'RESUMO' ? <><BarChart2 className="w-4 h-4" /> Resumo de Pedidos</> : <><CreditCard className="w-4 h-4" /> Transações</>}
                    </button>
                ))}
            </div>

            {tab === 'RESUMO' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-black/20">
                                <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3 text-left">Mês</th>
                                    <th className="px-4 py-3 text-right">Pedidos</th>
                                    <th className="px-4 py-3 text-right">Receita (R$)</th>
                                    <th className="px-4 py-3 text-right">Ticket Médio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {months.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-600">Nenhuma receita registrada ainda</td></tr>
                                ) : months.map(m => {
                                    const [year, month] = m.split('-');
                                    const monthOrders = paidOrders.filter(o => (o.created_at || '').startsWith(m));
                                    const rev = revenueByMonth[m];
                                    return (
                                        <tr key={m} className="hover:bg-white/5">
                                            <td className="px-4 py-3 text-white font-medium">{MONTH_PT[month]}/{year}</td>
                                            <td className="px-4 py-3 text-right text-gray-500">{monthOrders.length}</td>
                                            <td className="px-4 py-3 text-right font-bold text-yellow-500">R$ {rev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-3 text-right text-gray-500">R$ {monthOrders.length ? (rev / monthOrders.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'TRANSACOES' && (
                <div className="space-y-4">
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="flex gap-2 items-center bg-[#1E1E1E] p-1 rounded-lg border border-gray-800">
                            <input type="date" className="bg-black/40 border-none text-white px-3 py-1.5 rounded text-sm h-9 focus:outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span className="text-gray-500 text-xs">até</span>
                            <input type="date" className="bg-black/40 border-none text-white px-3 py-1.5 rounded text-sm h-9 focus:outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        {(startDate || endDate) && <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs text-gray-500 hover:text-white">✕ Limpar</button>}
                        <span className="text-xs text-gray-500">{filteredEntries.length} registros</span>
                    </div>
                    <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                        {filteredEntries.length === 0 ? (
                            <div className="p-12 text-center text-gray-600">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
                                <p>Nenhuma transação encontrada</p>
                                <p className="text-xs mt-1">As transações aparecem aqui conforme confirmadas no sistema</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-black/20">
                                        <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <th className="px-4 py-3 text-left">Data</th>
                                            <th className="px-4 py-3 text-left">Descrição</th>
                                            <th className="px-4 py-3 text-center">Tipo</th>
                                            <th className="px-4 py-3 text-right">Valor</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {filteredEntries.slice(0, 50).map((e, i) => (
                                            <tr key={e.id || i} className="hover:bg-white/5">
                                                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.created_at).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-4 py-3 text-white">{e.description || '—'}</td>
                                                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 text-xs font-bold rounded border ${e.type === 'IN' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{e.type === 'IN' ? '↑ Entrada' : '↓ Saída'}</span></td>
                                                <td className={`px-4 py-3 text-right font-bold ${e.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>{e.type === 'IN' ? '+' : '-'} R$ {Number(e.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-3 text-center"><span className="text-xs text-gray-500">{e.status || '—'}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceFinancial;
