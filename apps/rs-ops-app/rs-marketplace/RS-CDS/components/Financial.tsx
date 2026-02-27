
import React, { useState, useEffect } from 'react';
import { Transaction, CDProfile } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, DollarSign, Download, Calendar, X, AlertTriangle, CheckCircle, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { adminSupabase } from '../services/supabaseClient';

interface FinancialProps {
    profile: CDProfile;
    transactions: Transaction[];
    cdId?: string;
}

interface WithdrawRequest {
    id: string;
    amount: number;
    fee: number;
    net_amount: number;
    status: string;
    scheduled_date: string;
    requested_at: string;
    admin_notes?: string;
}

const Financial: React.FC<FinancialProps> = ({ profile, transactions: propTransactions, cdId }) => {
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawDate, setWithdrawDate] = useState('');
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Real data states
    const [withdrawHistory, setWithdrawHistory] = useState<WithdrawRequest[]>([]);
    const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Merge prop transactions with real ones
    const allTransactions = [...propTransactions, ...realTransactions];

    // Calculations
    const totalIn = allTransactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = allTransactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalIn - totalOut;

    const chartData = [
        { name: 'Entradas', value: totalIn, color: '#10B981' },
        { name: 'Saídas', value: totalOut, color: '#EF4444' },
        { name: 'Lucro', value: Math.max(0, netProfit), color: '#FFD700' }
    ];

    // Load real financial data
    useEffect(() => {
        if (!cdId) {
            setLoadingData(false);
            return;
        }
        loadFinancialData();
    }, [cdId]);

    const loadFinancialData = async () => {
        if (!cdId) return;
        setLoadingData(true);
        try {
            // Load withdraw requests
            const { data: withdraws } = await adminSupabase
                .from('cd_withdraw_requests')
                .select('*')
                .eq('cd_id', cdId)
                .order('requested_at', { ascending: false });

            if (withdraws) setWithdrawHistory(withdraws);

            // Load transactions from cd_transactions
            const { data: txns } = await adminSupabase
                .from('cd_transactions')
                .select('*')
                .eq('cd_id', cdId)
                .order('date', { ascending: false })
                .limit(50);

            if (txns) {
                const mapped: Transaction[] = txns.map((t: any) => ({
                    id: t.id,
                    type: t.type as 'IN' | 'OUT',
                    category: t.category,
                    description: t.description,
                    amount: parseFloat(t.amount),
                    status: t.status,
                    date: t.date
                }));
                setRealTransactions(mapped);
            }
        } catch (err) {
            console.error('[RS-CDS Financial] Error loading data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    // Date validation
    const validateWithdrawDate = (dateString: string) => {
        if (!dateString) return false;
        const parts = dateString.split('-');
        if (parts.length !== 3) return false;
        const day = parseInt(parts[2], 10);
        return (day >= 1 && day <= 5) || (day >= 10 && day <= 15);
    };

    // REAL withdraw request - saves to Supabase
    const handleRequestWithdraw = async () => {
        setWithdrawError(null);
        setWithdrawSuccess(false);

        const cleanAmountStr = withdrawAmount.replace(/\./g, '').replace(',', '.');
        const amount = parseFloat(cleanAmountStr);

        if (isNaN(amount) || amount <= 0) {
            setWithdrawError("Digite um valor válido.");
            return;
        }
        if (amount < 150) {
            setWithdrawError("Valor mínimo para saque: R$ 150,00.");
            return;
        }
        if (amount > profile.walletBalance) {
            setWithdrawError("Saldo insuficiente.");
            return;
        }
        if (!withdrawDate) {
            setWithdrawError("Selecione uma data para o saque.");
            return;
        }
        if (!validateWithdrawDate(withdrawDate)) {
            setWithdrawError("Data inválida. Saques permitidos apenas entre dias 01-05 e 10-15.");
            return;
        }
        if (!cdId) {
            setWithdrawError("CD não identificado. Recarregue a página.");
            return;
        }

        setSubmitting(true);
        try {
            const fee = Math.max(amount * 0.02, 5);
            const netAmount = amount - fee;

            // Save to Supabase
            const { error } = await adminSupabase
                .from('cd_withdraw_requests')
                .insert({
                    cd_id: cdId,
                    cd_name: profile.name,
                    amount: amount,
                    fee: fee,
                    net_amount: netAmount,
                    status: 'pending',
                    scheduled_date: withdrawDate,
                    pix_key: null
                });

            if (error) {
                setWithdrawError(`Erro ao salvar: ${error.message}`);
                return;
            }

            // Also record as transaction
            await adminSupabase
                .from('cd_transactions')
                .insert({
                    cd_id: cdId,
                    type: 'OUT',
                    category: 'SAQUE',
                    description: `Solicitação de saque agendada para ${withdrawDate.split('-').reverse().join('/')}`,
                    amount: amount,
                    status: 'PENDENTE',
                    reference_id: `SAQUE-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0]
                });

            setWithdrawSuccess(true);
            setWithdrawAmount('');
            setWithdrawDate('');

            // Reload data
            await loadFinancialData();

            // Close modal after 2s
            setTimeout(() => {
                setIsWithdrawModalOpen(false);
                setWithdrawSuccess(false);
            }, 2500);

        } catch (err: any) {
            setWithdrawError(`Erro: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const statusLabels: Record<string, { label: string; cls: string }> = {
        pending: { label: 'PENDENTE', cls: 'bg-yellow-900/20 text-yellow-500' },
        approved: { label: 'APROVADO', cls: 'bg-green-900/20 text-green-500' },
        rejected: { label: 'REJEITADO', cls: 'bg-red-900/20 text-red-500' },
        paid: { label: 'PAGO', cls: 'bg-emerald-900/20 text-emerald-400' },
        cancelled: { label: 'CANCELADO', cls: 'bg-gray-800 text-gray-500' }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-gold-400" />
                        Gestão Financeira
                    </h2>
                    <p className="text-gray-400 text-sm">Controle de fluxo de caixa, comissões e despesas.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadFinancialData} className="text-gray-400 hover:text-gold-400 p-2 rounded-lg hover:bg-dark-800 transition-colors" title="Atualizar">
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={() => { setIsWithdrawModalOpen(true); setWithdrawSuccess(false); setWithdrawError(null); }}
                        className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-gold-500/20 transition-colors"
                    >
                        <Download size={16} />
                        Solicitar Saque
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 text-xs font-bold uppercase">Saldo Disponível</p>
                        <div className="p-2 bg-gold-500/10 text-gold-400 rounded-lg"><Wallet size={20} /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">R$ {profile.walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-gray-500 mt-1">Atualizado agora</p>
                </div>

                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 text-xs font-bold uppercase">Entradas (Mês)</p>
                        <div className="p-2 bg-green-900/20 text-green-500 rounded-lg"><ArrowUpRight size={20} /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><TrendingUp size={12} /> Vendas e comissões</p>
                </div>

                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 text-xs font-bold uppercase">Saídas (Mês)</p>
                        <div className="p-2 bg-red-900/20 text-red-500 rounded-lg"><ArrowDownRight size={20} /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-gray-500 mt-1">Compras de estoque e taxas</p>
                </div>

                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 text-xs font-bold uppercase">Lucro Líquido</p>
                        <div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg"><DollarSign size={20} /></div>
                    </div>
                    <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-white' : 'text-red-500'}`}>R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-xs text-gray-500 mt-1">Margem operacional</p>
                </div>
            </div>

            {/* Withdraw History */}
            {withdrawHistory.length > 0 && (
                <div className="bg-dark-900 rounded-xl border border-dark-800">
                    <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><Clock size={18} className="text-gold-400" /> Solicitações de Saque</h3>
                        <span className="text-xs text-gray-500">{withdrawHistory.length} registro(s)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-dark-950 text-gray-500 font-bold text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3">Data Solicitação</th>
                                    <th className="px-6 py-3">Data Agendada</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                    <th className="px-6 py-3 text-right">Taxa</th>
                                    <th className="px-6 py-3 text-right">Líquido</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-800">
                                {withdrawHistory.map(w => {
                                    const st = statusLabels[w.status] || statusLabels.pending;
                                    return (
                                        <tr key={w.id} className="hover:bg-dark-800/50 transition-colors">
                                            <td className="px-6 py-4">{new Date(w.requested_at).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-6 py-4">{w.scheduled_date ? w.scheduled_date.split('-').reverse().join('/') : '-'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-white">R$ {Number(w.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right text-red-500">-R$ {Number(w.fee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right font-bold text-green-500">R$ {Number(w.net_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-center"><span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${st.cls}`}>{st.label}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction History */}
                <div className="lg:col-span-2 bg-dark-900 rounded-xl border border-dark-800 flex flex-col">
                    <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                        <h3 className="font-bold text-white">Histórico de Transações</h3>
                        <span className="text-xs text-gray-500">{allTransactions.length} registro(s)</span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-dark-950 text-gray-500 font-bold text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Descrição</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-800">
                                {allTransactions.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">Nenhuma transação registrada.</td></tr>
                                ) : (
                                    allTransactions.map(t => (
                                        <tr key={t.id} className="hover:bg-dark-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">{t.date.split('-').reverse().join('/')}</td>
                                            <td className="px-6 py-4 font-medium text-white">{t.description}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-dark-800 px-2 py-1 rounded border border-dark-700">
                                                    {t.category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${t.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                                {t.type === 'IN' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${t.status === 'CONCLUIDO' ? 'bg-green-900/20 text-green-500' :
                                                    t.status === 'PENDENTE' ? 'bg-yellow-900/20 text-yellow-500' :
                                                        'bg-red-900/20 text-red-500'
                                                    }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex flex-col">
                    <h3 className="font-bold text-white mb-6">Fluxo de Caixa</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                                <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 text-xs text-gray-500 text-center">
                        Resumo consolidado do mês atual
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsWithdrawModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Download size={24} className="text-gold-400" />
                            Solicitação de Saque
                        </h3>

                        {withdrawSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <p className="text-lg font-bold text-white">Saque Solicitado!</p>
                                <p className="text-sm text-gray-400 mt-2">A solicitação foi enviada ao painel administrativo para aprovação.</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 mb-6">
                                    <p className="text-sm text-gray-400 mb-1">Saldo Disponível</p>
                                    <p className="text-2xl font-bold text-white">R$ {profile.walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Valor do Saque</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400 font-bold">R$</span>
                                            <input
                                                type="text"
                                                className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold-400 outline-none font-bold"
                                                placeholder="0,00"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data Agendada</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold-400 outline-none"
                                                value={withdrawDate}
                                                onChange={(e) => setWithdrawDate(e.target.value)}
                                            />
                                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        </div>
                                    </div>

                                    {withdrawAmount && parseFloat(withdrawAmount.replace(/\./g, '').replace(',', '.')) > 0 && (
                                        <div className="p-3 bg-dark-950 border border-dark-800 rounded-lg text-xs text-gray-400 space-y-1">
                                            <div className="flex justify-between"><span>Valor bruto:</span><span className="text-white font-bold">R$ {withdrawAmount}</span></div>
                                            <div className="flex justify-between"><span>Taxa (2%, mín. R$ 5):</span><span className="text-red-500">-R$ {Math.max(parseFloat(withdrawAmount.replace(/\./g, '').replace(',', '.')) * 0.02, 5).toFixed(2)}</span></div>
                                            <div className="border-t border-dark-700 pt-1 flex justify-between font-bold"><span className="text-gray-300">Valor líquido:</span><span className="text-green-400">R$ {(parseFloat(withdrawAmount.replace(/\./g, '').replace(',', '.')) - Math.max(parseFloat(withdrawAmount.replace(/\./g, '').replace(',', '.')) * 0.02, 5)).toFixed(2)}</span></div>
                                        </div>
                                    )}

                                    <div className="p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg flex gap-3">
                                        <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                        <div>
                                            <p className="text-yellow-500 font-bold text-xs mb-1">Janelas de Saque Permitidas</p>
                                            <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                                                <li>1º Período: Dias <strong className="text-white">01 a 05</strong></li>
                                                <li>2º Período: Dias <strong className="text-white">10 a 15</strong></li>
                                            </ul>
                                        </div>
                                    </div>

                                    {withdrawError && (
                                        <p className="text-red-500 text-sm font-bold text-center animate-pulse">{withdrawError}</p>
                                    )}
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setIsWithdrawModalOpen(false)}
                                        className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRequestWithdraw}
                                        disabled={submitting}
                                        className={`flex-1 py-3 font-bold rounded-lg text-sm shadow-lg flex items-center justify-center gap-2 ${submitting ? 'bg-dark-700 text-gray-500 cursor-wait' : 'bg-gold-500 hover:bg-gold-400 text-black shadow-gold-500/20'}`}
                                    >
                                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Confirmar Saque'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Financial;
