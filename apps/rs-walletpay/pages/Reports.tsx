

import React, { useState, useMemo, useEffect } from 'react';
import { MARKETING_PLAN_DATA, MOCK_USER_PROFILE, typeLabels } from '../constants';
import { walletAPI } from '../src/services/api';
import { LedgerEntry, LedgerEventType } from '../types';

// Helper to format currency
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// KPI Card for the summary
const SummaryCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-card p-6 rounded-2xl border border-border">
        <p className="text-sm text-text-soft">{title}</p>
        <p className="text-3xl font-bold text-text-title mt-1">{value}</p>
        <p className="text-xs text-text-body mt-2">{description}</p>
    </div>
);

// Tab Button component
const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors
            ${active ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
            }`}
    >
        {label}
    </button>
);

// --- TABS CONTENT ---

// 1. Resumo de Ganhos Tab
const EarningsSummaryTab: React.FC<{ earningsData: LedgerEntry[] }> = ({ earningsData }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const summary = useMemo(() => {
        const filteredBySearch = earningsData.filter(entry => {
            if (!searchTerm.trim()) return true;
            const lowercasedFilter = searchTerm.toLowerCase();
            return entry.description.toLowerCase().includes(lowercasedFilter) ||
                entry.refId.toLowerCase().includes(lowercasedFilter);
        });

        const earnings = filteredBySearch.filter(e => e.amount > 0 && (
            e.type === LedgerEventType.BONUS ||
            e.type === LedgerEventType.COMMISSION_SHOP ||
            e.type === LedgerEventType.COMMISSION_REFERRAL
        ));
        const bonuses = earnings.filter(e => e.type === LedgerEventType.BONUS);
        const commissions = earnings.filter(e => e.type === LedgerEventType.COMMISSION_SHOP || e.type === LedgerEventType.COMMISSION_REFERRAL);

        const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
        const totalBonuses = bonuses.reduce((sum, e) => sum + e.amount, 0);
        const totalCommissions = commissions.reduce((sum, e) => sum + e.amount, 0);

        const breakdown = earnings.reduce((acc, entry) => {
            const type = typeLabels[entry.type] || entry.type;
            if (!acc[type]) {
                acc[type] = { count: 0, total: 0, latestDate: entry.occurredAt };
            } else {
                if (new Date(entry.occurredAt) > new Date(acc[type].latestDate)) {
                    acc[type].latestDate = entry.occurredAt;
                }
            }
            acc[type].count += 1;
            acc[type].total += entry.amount;
            return acc;
        }, {} as Record<string, { count: number; total: number; latestDate: string; }>);

        return {
            totalEarnings: formatCurrency(totalEarnings / 100),
            totalBonuses: formatCurrency(totalBonuses / 100),
            totalCommissions: formatCurrency(totalCommissions / 100),
            breakdown: Object.keys(breakdown).map((type) => ({ type, ...breakdown[type] })).sort((a, b) => b.total - a.total)
        };
    }, [earningsData, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-card p-4 rounded-2xl border border-border">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Filtrar ganhos por descrição ou Ref ID..."
                        className="w-full sm:w-96 pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title="Ganhos Totais" value={summary.totalEarnings} description="Soma de todos os bônus e comissões." />
                <SummaryCard title="Total em Bônus" value={summary.totalBonuses} description="Ganhos de bônus de ciclo, profundidade, etc." />
                <SummaryCard title="Total em Comissões" value={summary.totalCommissions} description="Ganhos de comissões por vendas e indicações." />
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-title">Detalhamento de Ganhos</h3>
                    <p className="text-sm text-text-soft mt-1">Ganhos detalhados por tipo de transação no período.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-xs text-text-body uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tipo de Ganho</th>
                                <th className="px-6 py-4 font-semibold text-center">Nº de Transações</th>
                                <th className="px-6 py-4 font-semibold text-right">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {summary.breakdown.length > 0 ? summary.breakdown.map((item) => (
                                <tr key={item.type} className="hover:bg-surface/50">
                                    <td className="px-6 py-4 font-medium text-text-title">{item.type}</td>
                                    <td className="px-6 py-4 text-center text-text-body">{item.count}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-success">{formatCurrency(item.total / 100)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-12 text-text-body">Nenhum ganho encontrado para o período selecionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-title">Análise por Tipo de Ganho</h3>
                    <p className="text-sm text-text-soft mt-1">Métricas adicionais para cada categoria de ganho.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-xs text-text-body uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tipo de Ganho</th>
                                <th className="px-6 py-4 font-semibold">Última Transação</th>
                                <th className="px-6 py-4 font-semibold text-right">Valor Médio</th>
                                <th className="px-6 py-4 font-semibold text-center">Total de Transações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {summary.breakdown.length > 0 ? summary.breakdown.map((item) => (
                                <tr key={item.type} className="hover:bg-surface/50">
                                    <td className="px-6 py-4 font-medium text-text-title">{item.type}</td>
                                    <td className="px-6 py-4 text-text-body">{new Date(item.latestDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-info">{formatCurrency((item.total / item.count) / 100)}</td>
                                    <td className="px-6 py-4 text-center text-text-body">{item.count}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-text-body">Nenhum dado para analisar no período selecionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 2. Progresso de Carreira Tab
const CareerProgressTab: React.FC = () => {
    const { achievedPins, nextPin } = useMemo(() => {
        const currentUserPinIndex = MARKETING_PLAN_DATA.careerPlan.findIndex(p => p.pin === MOCK_USER_PROFILE.currentPin);

        if (currentUserPinIndex === -1) {
            return { achievedPins: [], nextPin: MARKETING_PLAN_DATA.careerPlan[0] };
        }

        const achieved = MARKETING_PLAN_DATA.careerPlan.slice(0, currentUserPinIndex + 1);
        const next = MARKETING_PLAN_DATA.careerPlan[currentUserPinIndex + 1] || null;

        return { achievedPins: achieved, nextPin: next };
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-4 text-center text-sm text-info bg-info/5">
                Nota: O progresso de carreira exibe dados cumulativos de toda a sua jornada e não é afetado pelo filtro de data.
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-title">PINs Alcançados</h3>
                    <p className="text-sm text-text-soft mt-1">Seu histórico de conquistas no plano de carreira.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-xs text-text-body uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">PIN</th>
                                <th className="px-6 py-4 font-semibold">Ciclos Necessários</th>
                                <th className="px-6 py-4 font-semibold text-right">Recompensa Ganhada</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {achievedPins.map((pin) => (
                                <tr key={pin.pin} className="hover:bg-surface/50">
                                    <td className="px-6 py-4 font-medium text-gold">{pin.pin}</td>
                                    <td className="px-6 py-4 text-text-body">{pin.cycles}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-success">{formatCurrency(pin.reward)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                                            Alcançado
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {nextPin && (
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold text-text-title">Próximo Nível: <span className="text-gold">{nextPin.pin}</span></h3>
                    <p className="text-sm text-text-soft mt-1">Faltam <span className="font-bold text-text-title">{nextPin.cycles - MOCK_USER_PROFILE.currentCycles}</span> ciclos para sua próxima graduação.</p>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-text-body">Progresso</span>
                            <span className="text-sm font-bold text-gold">{MOCK_USER_PROFILE.currentCycles} / {nextPin.cycles}</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2.5">
                            <div className="bg-gold h-2.5 rounded-full" style={{ width: `${(MOCK_USER_PROFILE.currentCycles / nextPin.cycles) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Reports Component
const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [entries, setEntries] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const userId = localStorage.getItem('userId') || 'demo-user';
                const res = await walletAPI.getTransactions(userId);
                if (res?.data?.success) setEntries(res.data.transactions || []);
            } catch (err) {
                console.error('Erro ao carregar transações para relatórios:', err);
            }
        };
        load();
    }, []);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const entryDate = new Date(entry.occurredAt);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (entryDate < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (entryDate > end) return false;
            }
            return true;
        });
    }, [startDate, endDate, entries]);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    const tabs = [
        { id: 'summary', label: 'Resumo de Ganhos', component: <EarningsSummaryTab earningsData={filteredEntries} /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Relatórios de Desempenho</h1>
                <p className="text-text-body mt-1">Acompanhe seus ganhos e seu progresso de carreira.</p>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                    <label htmlFor="start-date" className="text-xs text-text-soft mb-1 block">Data de Início</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25"
                    />
                </div>
                <div className="flex-1 w-full sm:w-auto">
                    <label htmlFor="end-date" className="text-xs text-text-soft mb-1 block">Data de Fim</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25"
                    />
                </div>
                <div className="self-end">
                    <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-border border border-border transition-colors h-full">
                        Limpar
                    </button>
                </div>
            </div>
            <div className="border-b border-border">
                <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                    {tabs.map(tab => (
                        <TabButton key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {tabs.find(tab => tab.id === activeTab)?.component}
            </div>
        </div>
    );
};

export default Reports;
