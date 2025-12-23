import React from 'react';
import { Order, View } from '../types';
import { WalletIcon } from './icons/WalletIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';
import { ArrowDownLeftIcon } from './icons/ArrowDownLeftIcon';
import { ClockIcon } from './icons/ClockIcon';

interface WalletOverviewProps {
    orders: Order[];
    onNavigate: (view: View, data?: any) => void;
}


const StatCard: React.FC<{ title: string; value: string; icon: React.FC<any>; onClick?: () => void }> = ({ title, value, icon: Icon, onClick }) => (
    <button 
        onClick={onClick} 
        className="bg-black border border-dark-800 rounded-lg p-6 text-left w-full hover:bg-dark-800/50 hover:border-yellow-600/50 transition-all duration-200 disabled:cursor-default disabled:hover:bg-black disabled:hover:border-dark-800"
        disabled={!onClick}
    >
        <div className="flex items-center gap-4">
            <Icon className="w-8 h-8 text-gold-400" />
            <div>
                <h4 className="text-gray-400">{title}</h4>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </button>
);

const WalletOverview: React.FC<WalletOverviewProps> = ({ orders, onNavigate }) => {
    // Mock data based on orders
    const totalSales = orders.filter(o => o.paymentStatus === 'Pago').reduce((sum, o) => sum + o.total, 0);
    const balance = totalSales * 0.85; // Assume some commission
    const pendingTransfers = 1250.75;
    
    // Create more realistic recent transactions from orders
    const recentTransactions = [
        ...orders
            .filter(o => o.paymentStatus === 'Pago')
            .slice(0, 2)
            .map(o => ({
                id: o.id,
                type: 'Venda' as const,
                amount: o.total,
                date: new Date(o.date).toLocaleDateString('pt-BR'),
                description: o.id,
                order: o,
            })),
        {
            id: 'transfer-1',
            type: 'Transferência' as const,
            amount: -2500.00,
            date: '27/07/2024',
            description: 'PIX para Banco X',
            order: null
        }
    ].sort((a,b) => new Date(b.order?.date || '2024-07-27').getTime() - new Date(a.order?.date || '2024-07-28').getTime());


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Saldo Disponível" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)} icon={WalletIcon} onClick={() => onNavigate('walletTransfers')} />
                <StatCard title="Total de Vendas (Pago)" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSales)} icon={ChartBarIcon} onClick={() => onNavigate('walletReports')} />
                <StatCard title="Transferências Pendentes" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingTransfers)} icon={ClockIcon} onClick={() => onNavigate('walletTransfers')} />
            </div>

            <div className="bg-black border border-dark-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Transações Recentes</h3>
                    <button onClick={() => onNavigate('walletReports')} className="text-sm font-semibold text-gold-400 hover:underline">Ver Extrato Completo</button>
                </div>
                <div className="space-y-2">
                    {recentTransactions.map(tx => (
                        <button 
                            key={tx.id} 
                            onClick={() => tx.order && onNavigate('orderDetail', tx.order)}
                            disabled={!tx.order}
                            className="w-full flex items-center justify-between p-3 bg-dark-800/50 rounded-md text-left hover:bg-dark-800 transition-colors disabled:cursor-default disabled:hover:bg-dark-800/50"
                        >
                            <div className="flex items-center gap-3">
                                {tx.amount > 0 ? <ArrowDownLeftIcon className="w-6 h-6 text-green-400 bg-green-500/10 p-1 rounded-full"/> : <ArrowUpRightIcon className="w-6 h-6 text-red-400 bg-red-500/10 p-1 rounded-full"/>}
                                <div>
                                    <p className="font-semibold text-white">{tx.type}</p>
                                    <p className="text-xs text-gray-500">{tx.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}</p>
                                <p className="text-xs text-gray-500">{tx.date}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WalletOverview;