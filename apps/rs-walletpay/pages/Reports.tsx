
import React, { useEffect, useMemo, useState } from 'react';
import { typeLabels } from '../constants';
import { careerAPI, walletAPI } from '../src/services/api';
import { LedgerEntry, LedgerEventType } from '../types';
import { getWalletUserId } from '../src/utils/walletSession';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

type CareerLevel = {
    id?: string;
    name: string;
    requiredVolume: number;
    imageUrl?: string;
    displayOrder?: number;
};

type CareerProgress = {
    currentVolume: number;
    nextLevelVolume: number;
    currentPin: string;
    nextPin: string;
    progressPercentage: number;
};

const SummaryCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-card p-6 rounded-2xl border border-border">
        <p className="text-sm text-text-soft">{title}</p>
        <p className="text-3xl font-bold text-text-title mt-1">{value}</p>
        <p className="text-xs text-text-body mt-2">{description}</p>
    </div>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
            active ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
        }`}
    >
        {label}
    </button>
);

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
            } else if (new Date(entry.occurredAt) > new Date(acc[type].latestDate)) {
                acc[type].latestDate = entry.occurredAt;
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
                        placeholder="Filtrar ganhos por descricao ou Ref ID..."
                        className="w-full sm:w-96 pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title="Ganhos Totais" value={summary.totalEarnings} description="Soma de todos os bonus e comissoes." />
                <SummaryCard title="Total em Bonus" value={summary.totalBonuses} description="Ganhos de bonus de ciclo, profundidade e similares." />
                <SummaryCard title="Total em Comissoes" value={summary.totalCommissions} description="Ganhos de comissoes por vendas e indicacoes." />
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-title">Detalhamento de Ganhos</h3>
                    <p className="text-sm text-text-soft mt-1">Ganhos detalhados por tipo de transacao no periodo.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-xs text-text-body uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tipo de Ganho</th>
                                <th className="px-6 py-4 font-semibold text-center">Transacoes</th>
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
                                    <td colSpan={3} className="text-center py-12 text-text-body">Nenhum ganho encontrado para o periodo selecionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-title">Analise por Tipo de Ganho</h3>
                    <p className="text-sm text-text-soft mt-1">Metricas adicionais para cada categoria de ganho.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-xs text-text-body uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tipo de Ganho</th>
                                <th className="px-6 py-4 font-semibold">Ultima Transacao</th>
                                <th className="px-6 py-4 font-semibold text-right">Valor Medio</th>
                                <th className="px-6 py-4 font-semibold text-center">Total</th>
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
                                    <td colSpan={4} className="text-center py-12 text-text-body">Nenhum dado para analisar no periodo selecionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CareerProgressTab: React.FC<{ levels: CareerLevel[]; progress: CareerProgress | null; loading: boolean }> = ({ levels, progress, loading }) => {
    const achievedLevels = useMemo(() => {
        if (!progress) return [];
        return levels.filter(level => Number(level.requiredVolume || 0) <= Number(progress.currentVolume || 0));
    }, [levels, progress]);

    const nextLevel = useMemo(() => {
        if (!progress) return null;
        return levels.find(level => level.name === progress.nextPin) ||
            levels.find(level => Number(level.requiredVolume || 0) > Number(progress.currentVolume || 0)) ||
            null;
    }, [levels, progress]);

    if (loading) {
        return (
            <div className="bg-card rounded-2xl border border-border p-8 text-center text-text-soft">
                Carregando progresso de carreira...
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="bg-card rounded-2xl border border-border p-8 text-center text-text-soft">
                Nao foi possivel carregar os dados de carreira.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard title="PIN Atual" value={progress.currentPin || 'Consultor'} description="Nivel atual consolidado pelo sistema." />
                    <SummaryCard title="Volume Atual" value={formatNumber(progress.currentVolume || 0)} description="Volume acumulado para progressao." />
                    <SummaryCard title="Proximo PIN" value={progress.nextPin || 'Sem proximo nivel'} description="Meta seguinte calculada pela API." />
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold text-text-title">Progresso Atual</h3>
                <p className="text-sm text-text-soft mt-1">
                    {nextLevel
                        ? `Faltam ${formatNumber(Math.max(0, Number(nextLevel.requiredVolume || 0) - Number(progress.currentVolume || 0)))} pontos para chegar em ${nextLevel.name}.`
                        : 'Voce ja atingiu o ultimo nivel configurado.'}
                </p>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-text-body">Progresso</span>
                        <span className="text-sm font-bold text-gold">{Math.round(progress.progressPercentage || 0)}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2.5">
                        <div className="bg-gold h-2.5 rounded-full" style={{ width: `${Math.max(0, Math.min(progress.progressPercentage || 0, 100))}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-title">Niveis Alcancados</h3>
                    <p className="text-sm text-text-soft mt-1">Lista baseada nos niveis configurados no painel administrativo.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-xs text-text-body uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nivel</th>
                                <th className="px-6 py-4 font-semibold">Volume Requerido</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {achievedLevels.length > 0 ? achievedLevels.map((level) => (
                                <tr key={level.id || level.name} className="hover:bg-surface/50">
                                    <td className="px-6 py-4 font-medium text-gold">{level.name}</td>
                                    <td className="px-6 py-4 text-text-body">{formatNumber(Number(level.requiredVolume || 0))}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                                            Alcancado
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-12 text-text-body">Nenhum nivel alcancado ainda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [careerLevels, setCareerLevels] = useState<CareerLevel[]>([]);
    const [careerProgress, setCareerProgress] = useState<CareerProgress | null>(null);
    const [careerLoading, setCareerLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const userId = getWalletUserId();
                if (!userId) {
                    setEntries([]);
                    setCareerLevels([]);
                    setCareerProgress(null);
                    setCareerLoading(false);
                    return;
                }

                const [transactionsRes, levelsRes, progressRes] = await Promise.all([
                    walletAPI.getTransactions(userId).catch(() => null),
                    careerAPI.getLevel().catch(() => null),
                    careerAPI.getProgress().catch(() => null),
                ]);

                if (transactionsRes?.data?.success) {
                    setEntries(transactionsRes.data.transactions || []);
                } else {
                    setEntries([]);
                }

                if (levelsRes?.data?.success) {
                    setCareerLevels(Array.isArray(levelsRes.data.data) ? levelsRes.data.data : []);
                } else {
                    setCareerLevels([]);
                }

                if (progressRes?.data?.success) {
                    setCareerProgress(progressRes.data.data || null);
                } else {
                    setCareerProgress(null);
                }
            } catch (err) {
                console.error('Erro ao carregar relatorios:', err);
                setEntries([]);
                setCareerLevels([]);
                setCareerProgress(null);
            } finally {
                setCareerLoading(false);
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
        { id: 'career', label: 'Carreira', component: <CareerProgressTab levels={careerLevels} progress={careerProgress} loading={careerLoading} /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Relatorios de Desempenho</h1>
                <p className="text-text-body mt-1">Acompanhe seus ganhos e seu progresso de carreira.</p>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                    <label htmlFor="start-date" className="text-xs text-text-soft mb-1 block">Data de Inicio</label>
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
