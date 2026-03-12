import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/services/supabase';
import { Banknote, PiggyBank, ArrowLeftRight, ClipboardList, BarChart2, Clock, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type Tab = 'OVERVIEW' | 'SAQUES' | 'DEPOSITOS' | 'TRANSFERENCIAS' | 'TRANSACOES';

const fmt = (v: number) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

const WITHDRAWAL_STATUS_NEXT: Record<string, string> = {
    requested: 'pending_approval',
    pending_approval: 'approved',
    approved: 'processing',
    processing: 'paid',
};

const statusColor: Record<string, string> = {
    requested: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    pending_approval: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    processing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-red-900/30 text-red-400 border-red-900/40',
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_PT: Record<string, string> = {
    requested: 'solicitado',
    pending_approval: 'aguardando aprovação',
    approved: 'aprovado',
    processing: 'processando',
    paid: 'pago',
    rejected: 'recusado',
    cancelled: 'cancelado',
    confirmed: 'confirmado',
    pending: 'pendente',
    completed: 'concluído',
    failed: 'falhou',
    ativa: 'ativa',
    inativa: 'inativa'
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`px-2 py-0.5 text-xs font-bold rounded border whitespace-nowrap uppercase ${statusColor[status?.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {STATUS_PT[status?.toLowerCase()] || status || '—'}
    </span>
);

const WalletPayAdmin: React.FC = () => {
    const [tab, setTab] = useState<Tab>('OVERVIEW');
    const [loading, setLoading] = useState(true);

    // Data
    const [wallets, setWallets] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [consultores, setConsultores] = useState<Record<string, string>>({});

    // UI
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [withdrawalFilter, setWithdrawalFilter] = useState('TODOS');
    const [depositFilter, setDepositFilter] = useState('TODOS');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [walletsRes, withdrawRes, depositRes, transferRes, txRes, consultRes] = await Promise.allSettled([
                supabase.from('wallets').select('*').order('total_received', { ascending: false }).limit(200),
                supabase.from('wallet_withdrawals').select('*').order('requested_at', { ascending: false }).limit(300),
                supabase.from('wallet_deposits').select('*').order('created_at', { ascending: false }).limit(300),
                supabase.from('wallet_transfers').select('*').order('created_at', { ascending: false }).limit(200),
                supabase.from('transactions').select('id, wallet_id, consultor_id, tipo, valor, status, descricao, created_at').order('created_at', { ascending: false }).limit(200),
                supabase.from('consultores').select('id, user_id, nome, email'),
            ]);

            if (walletsRes.status === 'fulfilled' && !walletsRes.value.error) setWallets(walletsRes.value.data || []);
            if (withdrawRes.status === 'fulfilled' && !withdrawRes.value.error) setWithdrawals(withdrawRes.value.data || []);
            if (depositRes.status === 'fulfilled' && !depositRes.value.error) setDeposits(depositRes.value.data || []);
            if (transferRes.status === 'fulfilled' && !transferRes.value.error) setTransfers(transferRes.value.data || []);
            if (txRes.status === 'fulfilled' && !txRes.value.error) setTransactions(txRes.value.data || []);
            if (consultRes.status === 'fulfilled' && !consultRes.value.error) {
                const map: Record<string, string> = {};
                (consultRes.value.data || []).forEach((c: any) => {
                    if (c.user_id) map[c.user_id] = c.nome || c.email || c.user_id;
                    map[c.id] = c.nome || c.email || c.id;
                });
                setConsultores(map);
            }
        } catch (e) { console.error('[WalletPayAdmin]', e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const getName = (userId: string) => consultores[userId] || userId?.slice(0, 8) || '—';

    // KPIs
    const totalBalance = wallets.reduce((a, w) => a + Number(w.balance || 0), 0);
    const totalPending = wallets.reduce((a, w) => a + Number(w.balance_pending || 0), 0);
    const totalBlocked = wallets.reduce((a, w) => a + Number(w.balance_blocked || 0), 0);
    const totalReceived = wallets.reduce((a, w) => a + Number(w.total_received || 0), 0);
    const totalWithdrawn = wallets.reduce((a, w) => a + Number(w.total_withdrawn || 0), 0);

    const pendingWithdrawals = withdrawals.filter(w => ['requested', 'pending_approval', 'approved', 'processing'].includes(w.status));
    const pendingWithdrawalsTotal = pendingWithdrawals.reduce((a, w) => a + Number(w.amount || 0), 0);

    const confirmedDeposits = deposits.filter(d => d.status === 'confirmed');
    const confirmedDepositsTotal = confirmedDeposits.reduce((a, d) => a + Number(d.amount || 0), 0);

    // Withdrawal actions
    const advanceWithdrawal = async (id: string, currentStatus: string) => {
        const next = WITHDRAWAL_STATUS_NEXT[currentStatus];
        if (!next) return;
        setUpdating(id);
        try {
            const update: any = { status: next };
            if (next === 'approved') update.approved_at = new Date().toISOString();
            if (next === 'processing') update.processed_at = new Date().toISOString();
            if (next === 'paid') update.paid_at = new Date().toISOString();
            await supabase.from('wallet_withdrawals').update(update).eq('id', id);
            setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, ...update } : w));
            if (selectedWithdrawal?.id === id) setSelectedWithdrawal((w: any) => ({ ...w, ...update }));
        } finally { setUpdating(null); }
    };

    const rejectWithdrawal = async (id: string) => {
        if (!rejectReason.trim()) { alert('Informe o motivo da rejeição.'); return; }
        setUpdating(id);
        try {
            await supabase.from('wallet_withdrawals').update({ status: 'rejected', rejection_reason: rejectReason }).eq('id', id);
            setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected', rejection_reason: rejectReason } : w));
            setSelectedWithdrawal(null);
            setRejectReason('');
        } finally { setUpdating(null); }
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        withdrawalFilter === 'TODOS' || w.status === withdrawalFilter.toLowerCase()
    );
    const filteredDeposits = deposits.filter(d =>
        depositFilter === 'TODOS' || d.status === depositFilter.toLowerCase()
    );

    const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'OVERVIEW', label: 'Visão Geral', icon: <BarChart2 className="w-4 h-4" /> },
        { key: 'SAQUES', label: `Saques${pendingWithdrawals.length > 0 ? ` (${pendingWithdrawals.length})` : ''}`, icon: <Banknote className="w-4 h-4" /> },
        { key: 'DEPOSITOS', label: 'Depósitos', icon: <PiggyBank className="w-4 h-4" /> },
        { key: 'TRANSFERENCIAS', label: 'Transferências', icon: <ArrowLeftRight className="w-4 h-4" /> },
        { key: 'TRANSACOES', label: 'Transações', icon: <ClipboardList className="w-4 h-4" /> },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">Admin WalletPay</h2>
                    <p className="text-sm text-gray-500">Visão master de carteiras, saques, depósitos e transferências</p>
                </div>
                <button onClick={loadData} className="px-4 py-2 bg-[#1E1E1E] border border-gray-800 rounded-lg text-sm text-white hover:border-yellow-500/50 transition-colors">🔄 Atualizar</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-800 overflow-x-auto">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${tab === t.key ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-500 hover:text-white'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW ─────────────────────────────────────────── */}
            {tab === 'OVERVIEW' && (
                <div className="space-y-6">
                    {/* KPI Grid idêntico ao WalletOverview do rs-marketplace */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button onClick={() => setTab('TRANSFERENCIAS')} className="bg-black border border-gray-800 rounded-lg p-6 text-left w-full hover:bg-gray-800/50 hover:border-yellow-600/50 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <CreditCard className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <h4 className="text-gray-400 text-sm font-medium">Saldo Disponível (Plataforma)</h4>
                                    <p className="text-2xl font-bold text-white">{fmt(totalBalance)}</p>
                                </div>
                            </div>
                        </button>

                        <button onClick={() => setTab('TRANSACOES')} className="bg-black border border-gray-800 rounded-lg p-6 text-left w-full hover:bg-gray-800/50 hover:border-yellow-600/50 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <BarChart2 className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <h4 className="text-gray-400 text-sm font-medium">Total de Vendas (Pago)</h4>
                                    <p className="text-2xl font-bold text-white">{fmt(confirmedDepositsTotal)}</p>
                                </div>
                            </div>
                        </button>

                        <button onClick={() => setTab('SAQUES')} className="bg-black border border-gray-800 rounded-lg p-6 text-left w-full hover:bg-gray-800/50 hover:border-yellow-600/50 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <Clock className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <h4 className="text-gray-400 text-sm font-medium">Transferências/Saques Pendentes</h4>
                                    <p className="text-2xl font-bold text-white">{fmt(pendingWithdrawalsTotal)}</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Transações Recentes (Plataforma)</h3>
                            <button onClick={() => setTab('TRANSACOES')} className="text-sm font-semibold text-yellow-500 hover:underline">Ver Extrato Completo</button>
                        </div>
                        <div className="space-y-2">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-gray-500">Nenhuma transação recente no ledger.</p>
                            ) : transactions.slice(0, 10).map(tx => (
                                <div key={tx.id} className="w-full flex items-center justify-between p-3 bg-gray-800/30 border border-transparent rounded-md text-left hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {tx.valor > 0 ? (
                                            <span className="text-green-400 bg-green-500/10 p-1.5 rounded-full"><ArrowDownLeft className="w-5 h-5" /></span>
                                        ) : (
                                            <span className="text-red-400 bg-red-500/10 p-1.5 rounded-full"><ArrowUpRight className="w-5 h-5" /></span>
                                        )}
                                        <div>
                                            <p className="font-semibold text-white">{tx.tipo}</p>
                                            <p className="text-xs text-gray-500">{tx.descricao || `ID: ${tx.id.slice(0, 8)}`} - {getName(tx.consultor_id)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${tx.valor > 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(tx.valor)}</p>
                                        <p className="text-xs text-gray-500">{fmtDate(tx.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── SAQUES ─────────────────────────────────────────── */}
            {tab === 'SAQUES' && (
                <div className="space-y-4">
                    {/* Modal Saque */}
                    {selectedWithdrawal && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                                <button onClick={() => { setSelectedWithdrawal(null); setRejectReason(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Banknote className="w-5 h-5 text-yellow-500" /> Saque #{selectedWithdrawal.id?.slice(0, 8).toUpperCase()}</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Usuário</span><span className="text-white font-medium">{getName(selectedWithdrawal.user_id)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Valor Bruto</span><span className="text-yellow-500 font-bold">{fmt(selectedWithdrawal.amount)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Taxa</span><span className="text-red-400">{fmt(selectedWithdrawal.fee)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Valor Líquido</span><span className="text-green-400 font-bold">{fmt(selectedWithdrawal.net_amount)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Método</span><span className="text-white">{selectedWithdrawal.method}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={selectedWithdrawal.status} /></div>
                                    {selectedWithdrawal.pix_key && (
                                        <div className="flex justify-between"><span className="text-gray-500">Chave PIX</span><span className="text-white font-mono text-xs">{selectedWithdrawal.pix_key}</span></div>
                                    )}
                                    {selectedWithdrawal.pix_key_type && (
                                        <div className="flex justify-between"><span className="text-gray-500">Tipo PIX</span><span className="text-white uppercase text-xs">{selectedWithdrawal.pix_key_type}</span></div>
                                    )}
                                    {selectedWithdrawal.bank_data && (
                                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-gray-800">
                                            <p className="text-xs font-bold text-gray-500 mb-1">Dados Bancários</p>
                                            <pre className="text-xs text-gray-400 overflow-auto">{JSON.stringify(selectedWithdrawal.bank_data, null, 2)}</pre>
                                        </div>
                                    )}
                                    {selectedWithdrawal.rejection_reason && (
                                        <div className="flex justify-between"><span className="text-gray-500">Motivo Rejeição</span><span className="text-red-400 text-xs">{selectedWithdrawal.rejection_reason}</span></div>
                                    )}
                                    <div className="flex justify-between"><span className="text-gray-500">Solicitado em</span><span className="text-gray-400 text-xs">{fmtDate(selectedWithdrawal.requested_at)}</span></div>
                                </div>

                                {/* Ações */}
                                {WITHDRAWAL_STATUS_NEXT[selectedWithdrawal.status] && (
                                    <button onClick={() => advanceWithdrawal(selectedWithdrawal.id, selectedWithdrawal.status)} disabled={updating === selectedWithdrawal.id} className="w-full mt-5 py-2.5 bg-yellow-500 text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                                        {updating === selectedWithdrawal.id ? 'Processando...' : `→ Avançar para: ${STATUS_PT[WITHDRAWAL_STATUS_NEXT[selectedWithdrawal.status]]?.toUpperCase() || WITHDRAWAL_STATUS_NEXT[selectedWithdrawal.status]}`}
                                    </button>
                                )}

                                {!['paid', 'rejected', 'cancelled'].includes(selectedWithdrawal.status) && (
                                    <div className="mt-3 space-y-2">
                                        <input type="text" placeholder="Motivo da rejeição (obrigatório)" className="w-full bg-black/40 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                                        <button onClick={() => rejectWithdrawal(selectedWithdrawal.id)} disabled={updating === selectedWithdrawal.id || !rejectReason.trim()} className="w-full py-2 border border-red-800/50 text-red-400 font-medium rounded-xl text-sm hover:bg-red-900/20 disabled:opacity-30">
                                            Rejeitar Saque
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                        {['TODOS', 'requested', 'pending_approval', 'approved', 'processing', 'paid', 'rejected'].map(s => (
                            <button key={s} onClick={() => setWithdrawalFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${withdrawalFilter === s ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-[#1E1E1E] text-gray-500 border-gray-800 hover:text-white'}`}>
                                {s === 'TODOS' ? 'Todos' : STATUS_PT[s] ? STATUS_PT[s].toUpperCase() : s}
                                {s === 'pending_approval' && pendingWithdrawals.filter(w => w.status === 'pending_approval').length > 0 && <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1">{pendingWithdrawals.filter(w => w.status === 'pending_approval').length}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-black/20">
                                    <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">Usuário</th>
                                        <th className="px-4 py-3 text-left">Data</th>
                                        <th className="px-4 py-3 text-center">Método</th>
                                        <th className="px-4 py-3 text-right">Valor</th>
                                        <th className="px-4 py-3 text-right">Líquido</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredWithdrawals.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-600"><Banknote className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhum saque encontrado</p></td></tr>
                                    ) : filteredWithdrawals.slice(0, 50).map(w => (
                                        <tr key={w.id} className={`hover:bg-white/5 transition-colors ${['requested', 'pending_approval'].includes(w.status) ? 'bg-yellow-500/5' : ''}`}>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">#{w.id?.slice(0, 8).toUpperCase()}</td>
                                            <td className="px-4 py-3 text-white">{getName(w.user_id)}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(w.requested_at)}</td>
                                            <td className="px-4 py-3 text-center"><span className="text-xs text-gray-400">{w.method}</span></td>
                                            <td className="px-4 py-3 text-right font-bold text-yellow-500">{fmt(w.amount)}</td>
                                            <td className="px-4 py-3 text-right text-green-400 font-bold">{fmt(w.net_amount)}</td>
                                            <td className="px-4 py-3 text-center"><StatusBadge status={w.status} /></td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => setSelectedWithdrawal(w)} className="px-2 py-1 bg-black/40 border border-gray-800 text-white text-xs font-medium rounded-lg hover:border-yellow-500/50">Ver</button>
                                                    {WITHDRAWAL_STATUS_NEXT[w.status] && (
                                                        <button onClick={() => advanceWithdrawal(w.id, w.status)} disabled={updating === w.id} className="px-2 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
                                                            {updating === w.id ? '...' : '→'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DEPÓSITOS ─────────────────────────────────────────── */}
            {tab === 'DEPOSITOS' && (
                <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {['TODOS', 'pending', 'confirmed', 'failed', 'cancelled'].map(s => (
                            <button key={s} onClick={() => setDepositFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${depositFilter === s ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-[#1E1E1E] text-gray-500 border-gray-800 hover:text-white'}`}>
                                {s === 'TODOS' ? 'Todos' : STATUS_PT[s] ? STATUS_PT[s].toUpperCase() : s}
                            </button>
                        ))}
                    </div>
                    <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-black/20">
                                    <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">Usuário</th>
                                        <th className="px-4 py-3 text-left">Data</th>
                                        <th className="px-4 py-3 text-center">Método</th>
                                        <th className="px-4 py-3 text-right">Valor</th>
                                        <th className="px-4 py-3 text-right">Taxa</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredDeposits.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-600"><PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhum depósito encontrado</p></td></tr>
                                    ) : filteredDeposits.slice(0, 50).map(d => (
                                        <tr key={d.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">#{d.id?.slice(0, 8).toUpperCase()}</td>
                                            <td className="px-4 py-3 text-white">{getName(d.user_id)}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(d.created_at)}</td>
                                            <td className="px-4 py-3 text-center"><span className="text-xs text-gray-400 uppercase">{d.method}</span></td>
                                            <td className="px-4 py-3 text-right font-bold text-yellow-500">{fmt(d.amount)}</td>
                                            <td className="px-4 py-3 text-right text-red-400">{fmt(d.fee)}</td>
                                            <td className="px-4 py-3 text-center"><StatusBadge status={d.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TRANSFERÊNCIAS ─────────────────────────────────────────── */}
            {tab === 'TRANSFERENCIAS' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-black/20">
                                <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">De</th>
                                    <th className="px-4 py-3 text-left">Para</th>
                                    <th className="px-4 py-3 text-left">Data</th>
                                    <th className="px-4 py-3 text-right">Valor</th>
                                    <th className="px-4 py-3 text-right">Taxa</th>
                                    <th className="px-4 py-3 text-center">2FA</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {transfers.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-600"><ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhuma transferência ainda</p></td></tr>
                                ) : transfers.slice(0, 50).map(t => (
                                    <tr key={t.id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{t.id?.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-4 py-3 text-white text-sm">{getName(t.from_user_id)}</td>
                                        <td className="px-4 py-3 text-white text-sm">{getName(t.to_user_id)}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(t.created_at)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-yellow-500">{fmt(t.amount)}</td>
                                        <td className="px-4 py-3 text-right text-red-400">{fmt(t.fee)}</td>
                                        <td className="px-4 py-3 text-center"><span className={`text-xs font-bold ${t.two_fa_verified ? 'text-green-400' : 'text-red-400'}`}>{t.two_fa_verified ? '✓' : '✗'}</span></td>
                                        <td className="px-4 py-3 text-center"><StatusBadge status={t.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TRANSAÇÕES ─────────────────────────────────────────── */}
            {tab === 'TRANSACOES' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-base font-bold text-white flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gray-400" /> Ledger de Transações</h3>
                        <span className="text-xs text-gray-500">{transactions.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-black/20">
                                <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Consultor</th>
                                    <th className="px-4 py-3 text-left">Data</th>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-right">Valor</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-left">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-600"><ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhuma transação no ledger ainda</p></td></tr>
                                ) : transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{t.id?.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-4 py-3 text-white text-sm">{getName(t.consultor_id)}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(t.created_at)}</td>
                                        <td className="px-4 py-3"><span className="text-xs font-bold bg-black/40 px-2 py-0.5 rounded text-gray-300">{t.tipo}</span></td>
                                        <td className="px-4 py-3 text-right font-bold text-yellow-500">{fmt(t.valor)}</td>
                                        <td className="px-4 py-3 text-center"><StatusBadge status={t.status} /></td>
                                        <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[200px]">{t.descricao || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPayAdmin;
