import React from 'react';
import { ChartBarIcon, CubeIcon, CurrencyDollarIcon, UsersIcon } from '../icons';

interface StatCardProps { 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    bgColor: string; 
    onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor, onClick }) => (
    <div onClick={onClick} className={`bg-black/50 border border-gray-800 rounded-xl p-5 flex items-center gap-4 shadow-lg transition-transform hover:scale-105 hover:border-yellow-500/50 cursor-pointer`}>
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
const recentOrders: any[] = [];
const topProducts: any[] = [];


const statusClasses: Record<string, string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-400',
  Enviado: 'bg-blue-600/20 text-blue-400',
  Entregue: 'bg-green-600/20 text-green-400',
  Cancelado: 'bg-red-600/20 text-red-400',
};

interface MarketplaceDashboardProps {
    setActiveView: (view: string) => void;
}

const MarketplaceDashboard: React.FC<MarketplaceDashboardProps> = ({ setActiveView }) => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <ChartBarIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Visão Geral do Marketplace</h1>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Faturamento Total" value="R$ 0,00" icon={<CurrencyDollarIcon className="w-6 h-6 text-white"/>} bgColor="bg-green-500/80" onClick={() => setActiveView('Marketplace Notas Fiscais')} />
                <StatCard title="Total de Pedidos" value="0" icon={<CubeIcon className="w-6 h-6 text-white"/>} bgColor="bg-blue-500/80" onClick={() => setActiveView('Marketplace Pedidos')} />
                <StatCard title="Ticket Médio" value="R$ 0,00" icon={<ChartBarIcon className="w-6 h-6 text-white"/>} bgColor="bg-purple-500/80" onClick={() => setActiveView('Marketplace Pedidos')} />
                <StatCard title="Clientes Ativos" value="0" icon={<UsersIcon className="w-6 h-6 text-white"/>} bgColor="bg-orange-500/80" onClick={() => setActiveView('Consultores')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Pedidos Recentes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                           <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                                <tr>
                                    <th className="px-4 py-3">Pedido</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length > 0 ? recentOrders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => setActiveView('Marketplace Pedidos')}>
                                        <td className="px-4 py-3 font-mono">{order.id}</td>
                                        <td className="px-4 py-3">{order.customer}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[order.status]}`}>{order.status}</span></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">Nenhum pedido recente.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Top Produtos</h2>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                           <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                                <tr>
                                    <th className="px-4 py-3">Produto</th>
                                    <th className="px-4 py-3 text-center">Vendas</th>
                                    <th className="px-4 py-3 text-right">Faturamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.length > 0 ? topProducts.map(product => (
                                    <tr key={product.name} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-4 py-3 font-medium">{product.name}</td>
                                        <td className="px-4 py-3 text-center">{product.sold}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-400">{product.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                )) : (
                                     <tr>
                                        <td colSpan={3} className="text-center py-8 text-gray-500">Nenhum produto vendido.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceDashboard;