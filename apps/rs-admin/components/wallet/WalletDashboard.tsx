import React from 'react';
import { WalletIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, ChartBarIcon, TrophyIcon, UsersIcon, PaperAirplaneIcon, DocumentPlusIcon } from '../icons';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; bgColor: string; }> = ({ title, value, icon, bgColor }) => (
    <div className={`bg-black/50 border border-gray-800 rounded-xl p-5 flex items-center gap-4 shadow-lg transition-transform hover:scale-105 hover:border-yellow-500/50`}>
        <div className={`p-3 rounded-full ${bgColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// Cleared mock data
const stats = {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyOtherExpenses: 0,
    totalBonusPaid: 0,
    consultantsWithBalance: 0,
};
const monthlyTotalExpenses = 0;
const chartData: any[] = [];
const recentTransactions: any[] = [];

const CashFlowChart: React.FC<{ data: typeof chartData }> = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center text-gray-500">
                Nenhum dado de fluxo de caixa para exibir.
            </div>
        );
    }

    const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]));
    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = (maxValue / 4) * (4 - i);
        return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);
    });

    return (
        <div className="h-96 flex flex-col">
            <div className="flex-grow flex items-end space-x-4 pr-4">
                <div className="h-full flex flex-col justify-between text-xs text-gray-500 py-2 -ml-2">
                    {yAxisLabels.map(label => <span key={label}>{label}</span>)}
                    <span>0</span>
                </div>
                {data.map(({ month, income, expenses }) => {
                    const incomeHeight = (income / maxValue) * 100;
                    const expensesHeight = (expenses / maxValue) * 100;
                    return (
                        <div key={month} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex justify-around items-end h-full">
                                <div className="w-2/5 bg-green-500/80 rounded-t-md hover:bg-green-500 transition-colors" style={{ height: `${incomeHeight}%` }} title={`Entradas: ${income.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`}></div>
                                <div className="w-2/5 bg-red-500/80 rounded-t-md hover:bg-red-500 transition-colors" style={{ height: `${expensesHeight}%` }} title={`Saídas: ${expenses.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`}></div>
                            </div>
                            <span className="mt-2 text-xs text-gray-400">{month}</span>
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-center items-center space-x-6 mt-4 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-green-500 mr-2"></div><span className="text-gray-400">Entradas</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-red-500 mr-2"></div><span className="text-gray-400">Saídas</span></div>
            </div>
        </div>
    );
};

interface WalletDashboardProps {
    setActiveView: (view: string) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ setActiveView }) => {

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <WalletIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Visão Geral - WalletPay</h1>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="cursor-pointer">
                    <StatCard 
                        title="Saldo em Contas" 
                        value={stats.totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icon={<WalletIcon className="w-6 h-6 text-white" />}
                        bgColor="bg-blue-500/80"
                    />
                </div>
                <div onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="cursor-pointer">
                    <StatCard 
                        title="Entradas no Mês" 
                        value={stats.monthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icon={<ArrowUpTrayIcon className="w-6 h-6 text-white" />}
                        bgColor="bg-green-500/80"
                    />
                </div>
                 <div onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="cursor-pointer">
                    <StatCard 
                        title="Total Saídas (Mês)" 
                        value={monthlyTotalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icon={<ArrowDownTrayIcon className="w-6 h-6 text-white" />}
                        bgColor="bg-red-500/80"
                    />
                </div>
                <div onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="cursor-pointer">
                    <StatCard 
                        title="Outras Saídas (Mês)" 
                        value={stats.monthlyOtherExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icon={<ArrowDownTrayIcon className="w-6 h-6 text-white" />}
                        bgColor="bg-red-900/80"
                    />
                </div>
                 <div onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="cursor-pointer">
                    <StatCard 
                        title="Total Bônus Pagos" 
                        value={stats.totalBonusPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icon={<TrophyIcon className="w-6 h-6 text-white" />}
                        bgColor="bg-purple-500/80"
                    />
                </div>
                 <div onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="cursor-pointer">
                    <StatCard 
                        title="Consultores com Saldo" 
                        value={stats.consultantsWithBalance.toString()}
                        icon={<UsersIcon className="w-6 h-6 text-white" />}
                        bgColor="bg-orange-500/80"
                    />
                </div>
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-black/50 border border-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <ChartBarIcon className="w-6 h-6 mr-3 text-yellow-500"/>
                        Fluxo de Caixa (Últimos 6 meses)
                    </h2>
                    <CashFlowChart data={chartData} />
                </div>

                {/* Side Panel */}
                <div className="space-y-8">
                     {/* Quick Actions */}
                    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
                        <div className="space-y-3">
                            <button onClick={() => setActiveView('Transferências (WalletPay)')} className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                Nova Transferência
                            </button>
                             <button onClick={() => setActiveView('Cobranças (WalletPay)')} className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                                <DocumentPlusIcon className="w-5 h-5" />
                                Gerar Cobrança
                            </button>
                        </div>
                    </div>
                    {/* Recent Transactions */}
                    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Transações Recentes</h3>
                        {recentTransactions.length > 0 ? (
                            <ul className="space-y-3">
                                {recentTransactions.map((tx, i) => (
                                    <li key={i} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium text-gray-200">{tx.consultant}</p>
                                            <p className="text-xs text-gray-400">{tx.description}</p>
                                        </div>
                                        <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-center text-gray-500 py-4">Nenhuma transação recente.</p>
                        )}
                         <button onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="mt-4 text-center w-full text-sm text-yellow-500 hover:underline">
                            Ver extrato completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletDashboard;