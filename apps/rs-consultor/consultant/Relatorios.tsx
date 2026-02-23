
import React, { useMemo, useState, useEffect, FC } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Card from '../components/Card';
import { mockUser, mockNetworkReport, mockFullNetwork, countNetworkNodes, mockBonusDepthData, mockBonusFidelityData, mockCycleSummary, mockWalletTransactions, mockDistributionCenters, mockCDProducts } from './data';
import { IconUsers, IconTrendingUp, IconActive, IconInactive, IconHandCoins, IconGitFork, IconAward, IconRepeat, IconStar, IconSearch, IconWhatsapp, IconEye, IconFilter, IconBuilding2, IconCheckCircle, IconChevronLeft, IconDownload, IconFileText, IconLock, IconMapPin, IconMinus, IconPlus, IconReceipt, IconShoppingCart, IconTrash, IconUser, IconWallet } from '../components/icons';
import Modal from '../components/Modal';
import { ReportModal } from './wallet/SaldoExtrato';
import type { WalletTransaction, NetworkNode, CDProduct } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useDashboardConfig, useUser } from './ConsultantLayout';
import { sigmaApi } from './services/sigmaApi';
import PinProgressGauge from './components/PinProgressGauge';
import NetworkTreeView from './components/NetworkTreeView';

// --- Shared Helpers ---
const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Tab Components ---

// 1. Visão Geral (Existing Logic)
const VisaoGeralTab: React.FC<{
    totalAllBonuses: number;
    totalPeopleInFullNetwork: number;
    totalDirects: number;
    activeDirects: number;
    totalGroupVolume: number;
    bonusDataMapping: any[];
    showDetailedBonusReport: (title: string, transactionType: any) => void;
    filteredDirectReports: any[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterStatus: string;
    setFilterStatus: (status: 'all' | 'active' | 'inactive') => void;
}> = ({ totalAllBonuses, totalPeopleInFullNetwork, totalDirects, activeDirects, totalGroupVolume, bonusDataMapping, showDetailedBonusReport, filteredDirectReports, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {

    // Subcomponents for Visao Geral
    const UserReportRow = React.memo(({ user }: { user: typeof mockNetworkReport[0] }) => {
        const handleSendWhatsApp = (whatsapp: string) => {
            if (!whatsapp) return;
            const message = `Olá, ${user.name}! Vi seu contato no painel da RS Prólipsi e gostaria de conversar.`;
            const phoneNumber = whatsapp.replace(/\D/g, ''); // Remove non-numeric chars
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        };

        return (
            <tr className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                <td className="p-3">
                    <div className="flex items-center space-x-3">
                        <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
                        <div>
                            <p className="font-semibold text-white text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400">Desde: {new Date(user.joinDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </td>
                <td className="p-3 text-sm font-semibold">{user.pin}</td>
                <td className="p-3 text-sm">
                    <span className={`flex items-center gap-2 font-semibold ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                        {user.status === 'active' ? <IconActive size={16} /> : <IconInactive size={16} />}
                        <span className="capitalize">{user.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </span>
                </td>
                <td className="p-3 text-right font-mono">{user.totalCycles}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(user.personalVolume)}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(user.groupVolume)}</td>
                <td className="p-3 text-sm flex justify-between items-center">
                    {new Date(user.lastActivity).toLocaleDateString('pt-BR')}
                    <button
                        onClick={() => handleSendWhatsApp(user.whatsapp)}
                        className="p-1.5 bg-green-500/10 rounded-full hover:bg-green-500/30 text-green-400 ml-2"
                        title={`Enviar WhatsApp para ${user.name}`}
                    >
                        <IconWhatsapp size={16} />
                    </button>
                </td>
            </tr>
        );
    });

    const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, subValue?: string }> = ({ icon: Icon, title, value, subValue }) => (
        <Card className="flex items-center space-x-4">
            <div className="p-3 bg-brand-gray-light rounded-full">
                <Icon size={24} className="text-brand-gold" />
            </div>
            <div>
                <h4 className="text-sm text-brand-text-dim">{title}</h4>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subValue && <p className="text-xs text-brand-text-dim">{subValue}</p>}
            </div>
        </Card>
    );

    const BonusSummaryItem: React.FC<{ title: string; value: number; icon: React.ElementType; onClick: () => void; }> = ({ title, value, icon: Icon, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center text-center p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gray transition-colors duration-200 cursor-pointer h-full w-full">
            <Icon size={28} className="text-brand-gold mb-2 flex-shrink-0" />
            <h4 className="text-sm font-bold text-white mb-1 min-h-12 flex items-center justify-center text-center leading-tight line-clamp-2">{title}</h4>
            <p className="text-lg font-extrabold text-brand-gold">{formatCurrency(value)}</p>
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Total Geral de Bônus Acumulados */}
            <Card className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-brand-gray to-brand-gray-dark border-2 border-brand-gold shadow-gold-glow p-6">
                <IconHandCoins size={48} className="text-brand-gold mb-3" />
                <p className="text-gray-400 text-lg">Total Geral de Bônus Acumulados</p>
                <p className="text-5xl font-extrabold text-brand-gold my-2">{formatCurrency(totalAllBonuses)}</p>
            </Card>

            {/* Network Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={IconUsers} title="Total de Pessoas na Rede" value={totalPeopleInFullNetwork.toLocaleString('pt-BR')} subValue="Sua rede completa" />
                <StatCard icon={IconActive} title="Indicados Diretos" value={totalDirects} subValue={`${totalDirects > 0 ? ((activeDirects / totalDirects) * 100).toFixed(0) : 0}% ativos`} />
                <StatCard icon={IconTrendingUp} title="Volume Financeiro Gerado" value={formatCurrency(totalGroupVolume)} subValue="Este mês" />
            </div>

            {/* Individual Bonus Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {bonusDataMapping.map(bonus => (
                    <BonusSummaryItem
                        key={bonus.title}
                        title={bonus.title}
                        value={bonus.value}
                        icon={bonus.icon}
                        onClick={() => showDetailedBonusReport(bonus.title, bonus.transactionType)}
                    />
                ))}
            </div>

            {/* Direct Reports Table */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Desempenho dos Indicados Diretos</h2>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
                    <div className="relative flex-grow">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar consultor por nome, PIN ou ID..."
                            className="w-full bg-brand-gray border border-brand-gray-light rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                        />
                    </div>
                    <select
                        aria-label="Filtrar por status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                        className="w-full sm:w-auto bg-brand-gray border border-brand-gray-light rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-gold focus:outline-none text-sm appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%239CA3AF' class='w-4 h-4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-brand-gray text-sm text-gray-400">
                            <tr>
                                <th className="p-3">Consultor</th>
                                <th className="p-3">PIN</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ciclos Atuais</th>
                                <th className="p-3 text-right">Volume Pessoal</th>
                                <th className="p-3 text-right">Volume de Grupo</th>
                                <th className="p-3">Última Atividade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDirectReports.length > 0 ? (
                                filteredDirectReports.map(user => (
                                    <UserReportRow key={user.id} user={user} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Nenhum indicado direto encontrado com os filtros aplicados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// 2. Financeiro Tab (Ported from RelatoriosFinanceiros.tsx)
const FinanceiroTab: React.FC = () => {
    const earningsData = useMemo(() => {
        const summary = mockWalletTransactions.reduce((acc, t) => {
            if (t.amount > 0) {
                if (t.type === 'commission_cycle' || t.type === 'bonus_sigme' || t.type === 'bonus_fidelity') {
                    acc['Bônus de Ciclo'] = (acc['Bônus de Ciclo'] || 0) + t.amount;
                } else if (t.type === 'bonus_career') {
                    acc['Bônus de Carreira'] = (acc['Bônus de Carreira'] || 0) + t.amount;
                } else if (t.type === 'commission_shop') {
                    acc['Comissões RS Shop'] = (acc['Comissões RS Shop'] || 0) + t.amount;
                } else if (t.type === 'bonus_compensation') {
                    acc['Bônus Compensação'] = (acc['Bônus Compensação'] || 0) + t.amount;
                }
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(summary).map(([name, value]) => ({ name, value }));
    }, []);

    const COLORS = ['#FFD700', '#F59E0B', '#10B981', '#3B82F6'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Ganhos por Origem</h2>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={earningsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {earningsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #333' }} formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), name]} />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="flex flex-col space-y-4">
                    <h2 className="text-xl font-bold text-white">Detalhamento Financeiro</h2>
                    <div className="space-y-3">
                        {earningsData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-brand-gray-light rounded-lg hover:bg-brand-gray transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="font-semibold text-white">{item.name}</span>
                                </div>
                                <span className="font-bold text-brand-gold">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// 3. Ciclos Tab (Simplified from CicloGlobal.tsx)
const CiclosTab: React.FC = () => {
    // Simulated Journey Data
    const journey = mockCycleSummary;
    const totalCiclosConcluidos = (journey || []).filter(j => j.completed > 0).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconGitFork size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Ciclos Concluídos</h4>
                        <p className="text-2xl font-bold text-white">{totalCiclosConcluidos}</p>
                    </div>
                </Card>
                <Card className="flex items-center justify-between p-6">
                    <div>
                        <h4 className="text-lg font-bold text-white">Próximo Fechamento</h4>
                        <p className="text-sm text-gray-400">Continue preenchendo sua matriz para avançar.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-extrabold text-brand-gold">{journey.find(j => j.completed === 0)?.level || 'N/A'}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Ciclo Atual</p>
                    </div>
                </Card>
            </div>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Sua Jornada de Ciclos</h2>
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                    {journey.map((summary) => {
                        if (summary.completed > 0) {
                            return (
                                <div key={summary.level} className="w-56 h-64 flex-shrink-0 bg-brand-gray border border-brand-gold/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent"></div>
                                    <div className="relative z-10 text-center">
                                        <h3 className="text-lg font-bold text-white">Ciclo {summary.level}</h3>
                                        <div className="my-6">
                                            <IconCheckCircle size={48} className="mx-auto text-green-400" />
                                            <p className="mt-2 text-sm font-semibold text-green-400">Concluído</p>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-center">
                                        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">Bônus</p>
                                        <p className="text-xl font-bold text-white">{formatCurrency(summary.bonus || 108.00)}</p>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={summary.level} className="w-56 h-64 flex-shrink-0 bg-brand-gray-light border-2 border-brand-gold rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-gold-glow-lg opacity-80">
                                    <h3 className="text-lg font-bold text-white">Ciclo {summary.level}</h3>
                                    <p className="text-6xl font-extrabold text-brand-gold my-4">{summary.level}</p>
                                    <p className="text-sm text-gray-300 font-bold uppercase tracking-widest">Em Andamento</p>
                                </div>
                            );
                        }
                    })}
                </div>
            </Card>
            <Card>
                <NetworkTreeView />
            </Card>
        </div>
    );
};


// 4. Carreira Tab (Similar logic to PlanoCarreira.tsx but simplified for integration)
const CarreiraTab: React.FC = () => {
    // Re-implementing basic logic here for display
    const { config } = useDashboardConfig();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const resStats = await sigmaApi.getStats();
                if (resStats.success) {
                    setStats(resStats.data);
                }
            } catch (error) {
                console.error("Error loading stats", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const currentCycles = stats?.totalCycles || 0;

    // Hardcoding pins for display if config is not yet fully loaded
    const pins = config?.career?.pins || [
        { name: 'Iniciante', cyclesRequired: 0, rewardValue: 0, iconColor: '#CD7F32' },
        { name: 'Bronze', cyclesRequired: 5, rewardValue: 500, iconColor: '#CD7F32' },
        { name: 'Prata', cyclesRequired: 15, rewardValue: 1500, iconColor: '#C0C0C0' },
        { name: 'Ouro', cyclesRequired: 30, rewardValue: 3000, iconColor: '#FFD700' },
    ];

    const { currentPin, nextPin } = useMemo(() => {
        let current = pins[0];
        let next = pins[1] || pins[0];
        for (let i = pins.length - 1; i >= 0; i--) {
            if (currentCycles >= pins[i].cyclesRequired) {
                current = pins[i];
                next = pins[i + 1] || pins[i];
                break;
            }
        }
        return { currentPin: current, nextPin: next }
    }, [pins, currentCycles]);

    const progressPercentage = nextPin.cyclesRequired > 0
        ? Math.min(100, (currentCycles / nextPin.cyclesRequired) * 100)
        : 100;

    if (loading) return <div className="p-10 text-center"><p className="animate-pulse">Carregando dados de carreira...</p></div>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-gradient-to-r from-brand-gray to-brand-gray-dark border-brand-gold/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pin Atual</p>
                        <h2 className="text-4xl font-black text-white mt-1" style={{ color: currentPin.iconColor }}>{currentPin.name || currentPin.pin}</h2>
                        <p className="text-xs text-gray-500 mt-2">Você concluiu <span className="text-white font-bold">{currentCycles}</span> ciclos.</p>
                    </div>

                    <div className="flex-grow max-w-md w-full">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                            <span>Progresso para {nextPin.name || nextPin.pin}</span>
                            <span>{Math.floor(progressPercentage)}%</span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-brand-gold transition-all duration-1000 ease-out relative" style={{ width: `${progressPercentage}%` }}>
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-right text-[10px] text-gray-500 mt-1">Faltam {Math.max(0, (nextPin.cyclesRequired || nextPin.cycles) - currentCycles)} ciclos</p>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-white mb-6">Tabela de Graduações</h3>
                <div className="space-y-3">
                    {pins.map((pin: any, idx: number) => {
                        const isUnlocked = currentCycles >= (pin.cyclesRequired || pin.cycles);
                        const isNext = !isUnlocked && (idx === 0 || currentCycles >= (pins[idx - 1].cyclesRequired || pins[idx - 1].cycles));

                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border-l-4 transition-all ${isUnlocked ? 'bg-brand-gray-light border-green-500' : isNext ? 'bg-brand-gray border-brand-gold' : 'bg-brand-gray/50 border-gray-700 opacity-60'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isUnlocked ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                                        <IconAward size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{pin.name || pin.pin}</h4>
                                        <p className="text-xs text-gray-400">Requer {pin.cyclesRequired || pin.cycles} ciclos</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-brand-gold">{formatCurrency(pin.rewardValue || pin.bonus)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Prêmio</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}


const RelatoriosRede: React.FC = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'geral' | 'financeiro' | 'ciclos' | 'carreira'>('geral');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // Report modal state
    const [reportModalData, setReportModalData] = useState<{
        isOpen: boolean;
        title: string;
        transactions: WalletTransaction[];
    }>({ isOpen: false, title: '', transactions: [] });

    // --- Bonus Calculations ---
    const totalBonusProfundidade = useMemo(() => {
        return mockBonusDepthData.reduce<number>((levelAcc, level) => {
            return levelAcc + level.cycles.reduce<number>((cycleAcc, cycle) => {
                return cycleAcc + (cycle.peopleCompleted * level.bonusPerPerson);
            }, 0);
        }, 0);
    }, []);

    const userMaxCompletedCycle = Math.max(0, ...mockCycleSummary.filter(c => c.completed > 0).map(c => Number(c.level)));

    const totalBonusFidelidade = useMemo(() => {
        return mockBonusFidelityData.reduce<number>((levelAcc, levelData) => {
            const isEligible = levelData.level <= 5 ? userMaxCompletedCycle >= levelData.level : userMaxCompletedCycle >= 5;
            if (!isEligible) return levelAcc;

            return levelAcc + levelData.cycles.reduce<number>((cycleAcc, cycle) => {
                return cycleAcc + (cycle.peopleCompleted * levelData.bonusPerPerson);
            }, 0);
        }, 0);
    }, [userMaxCompletedCycle]);

    const totalAllBonuses = mockUser.bonusCicloGlobal + mockUser.bonusTopSigme + mockUser.bonusPlanoCarreira + totalBonusProfundidade + totalBonusFidelidade;

    const bonusDataMapping = useMemo(() => [
        { title: "Bônus Matriz SIGME", value: mockUser.bonusCicloGlobal || 0, icon: IconGitFork, transactionType: 'commission_cycle' },
        { title: "Bônus de Profundidade", value: totalBonusProfundidade, icon: IconUsers, transactionType: 'bonus_compensation' },
        { title: "Bônus de Fidelidade", value: totalBonusFidelidade, icon: IconRepeat, transactionType: 'bonus_fidelity' },
        { title: "Bônus Plano de Carreira", value: mockUser.bonusPlanoCarreira || 0, icon: IconAward, transactionType: 'bonus_career' },
        { title: "Bônus Top SIGME", value: mockUser.bonusTopSigme || 0, icon: IconStar, transactionType: 'bonus_sigme' },
    ], [mockUser, totalBonusProfundidade, totalBonusFidelidade]);

    const showDetailedBonusReport = (title: string, transactionType: WalletTransaction['type'] | WalletTransaction['type'][]) => {
        const typesArray = Array.isArray(transactionType) ? transactionType : [transactionType];
        const relevantTransactions = mockWalletTransactions.filter(t => typesArray.includes(t.type));
        setReportModalData({
            isOpen: true,
            title: `Extrato Detalhado - ${title}`,
            transactions: relevantTransactions,
        });
    };

    // --- Filtered Direct Reports ---
    const filteredDirectReports = useMemo(() => {
        let filtered = mockNetworkReport;

        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                user.pin.toLowerCase().includes(lowerCaseSearchTerm) ||
                user.id.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }
        return filtered;
    }, [searchTerm, filterStatus]);


    // --- Network Report Stats ---
    const totalDirects = mockNetworkReport.length;
    const activeDirects = mockNetworkReport.filter(d => d.status === 'active').length;
    const totalGroupVolume = mockNetworkReport.reduce((acc, d) => acc + parseFloat(d.groupVolume), 0);
    const totalPeopleInFullNetwork = countNetworkNodes(mockFullNetwork) - 1;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Relatórios de Rede</h1>
                    <p className="text-gray-400 mt-1">Painel Administrativo Completo - Acompanhe sua evolução.</p>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex p-1 bg-brand-gray-light rounded-xl overflow-x-auto">
                <button
                    onClick={() => setActiveTab('geral')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'geral' ? 'bg-brand-gold text-brand-dark shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <IconUsers size={18} /> Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('financeiro')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'financeiro' ? 'bg-brand-gold text-brand-dark shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <IconWallet size={18} /> Financeiro
                </button>
                <button
                    onClick={() => setActiveTab('ciclos')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'ciclos' ? 'bg-brand-gold text-brand-dark shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <IconGitFork size={18} /> Ciclos
                </button>
                <button
                    onClick={() => setActiveTab('carreira')}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'carreira' ? 'bg-brand-gold text-brand-dark shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <IconAward size={18} /> Carreira
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'geral' && (
                    <VisaoGeralTab
                        totalAllBonuses={totalAllBonuses}
                        totalPeopleInFullNetwork={totalPeopleInFullNetwork}
                        totalDirects={totalDirects}
                        activeDirects={activeDirects}
                        totalGroupVolume={totalGroupVolume}
                        bonusDataMapping={bonusDataMapping}
                        showDetailedBonusReport={showDetailedBonusReport}
                        filteredDirectReports={filteredDirectReports}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                    />
                )}
                {activeTab === 'financeiro' && <FinanceiroTab />}
                {activeTab === 'ciclos' && <CiclosTab />}
                {activeTab === 'carreira' && <CarreiraTab />}
            </div>

            {/* Reusing ReportModal from SaldoExtrato for detailed bonus reports */}
            <ReportModal
                isOpen={reportModalData.isOpen}
                onClose={() => setReportModalData({ ...reportModalData, isOpen: false })}
                title={reportModalData.title}
                transactions={reportModalData.transactions}
            />
        </div>
    );
};

export default RelatoriosRede;