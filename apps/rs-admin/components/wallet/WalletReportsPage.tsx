import React, { useState, useEffect } from 'react';
import { walletAPI } from '../../src/services/api';
import { PresentationChartLineIcon, WalletIcon, CareerIcon, ShopIcon, ClipboardDocumentListIcon } from '../icons';

interface WalletReportsPageProps {
  setActiveView: (view: string) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode, icon: React.ReactNode }> = ({ active, onClick, children, icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors rounded-t-lg border-b-2 ${active ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-white'}`}
    >
        {icon}
        {children}
    </button>
);

const financialReportData = [
    { type: 'Bônus de Ciclo (Matrizes SIGME)', transactions: 125, total: 15060.00 },
    { type: 'Bônus de Fidelidade', transactions: 98, total: 8820.00 },
    { type: 'Bônus Top SIGME', transactions: 10, total: 4500.00 },
    { type: 'Bônus de Carreira (PINs)', transactions: 15, total: 9750.00 },
    { type: 'Vendas RS Shop (Comissão)', transactions: 210, total: 7025.50 },
    { type: 'Taxas de Saque', transactions: 45, total: -225.00 },
    { type: 'Cobrança de Mensalidade', transactions: 850, total: 51000.00 },
];

const careerReportData = [
  { id: 1, name: 'Ana Silva', avatar: 'https://picsum.photos/seed/ana/50', currentPin: 'Diamante', achievedPin: 'Diamante', bonus: 4050.00, status: 'Qualificado' },
  { id: 3, name: 'Carla Dias', avatar: 'https://picsum.photos/seed/carla/50', currentPin: 'Prata', achievedPin: 'Ouro', bonus: 189.00, status: 'Qualificado (Promoção)' },
  { id: 5, name: 'Elena Faria', avatar: 'https://picsum.photos/seed/elena/50', currentPin: 'Bronze', achievedPin: 'Bronze', bonus: 0, status: 'Não Qualificado' },
  { id: 6, name: 'Fábio Lima', avatar: 'https://picsum.photos/seed/fabio/50', currentPin: 'Diamante', achievedPin: 'Diamante Duplo', bonus: 18450.00, status: 'Qualificado (Promoção)' },
];

const shopReportData = {
    kpis: {
        totalRevenue: 89450.75,
        totalOrders: 350,
        averageTicket: 255.57,
    },
    topProducts: [
        { name: 'Produto Exemplo A', quantity: 120, revenue: 12000.00 },
        { name: 'Produto Exemplo B', quantity: 95, revenue: 9500.00 },
        { name: 'Produto Exemplo C', quantity: 80, revenue: 8000.00 },
    ]
};

const FinancialReportTab: React.FC<{ setActiveView: (view: string) => void }> = ({ setActiveView }) => (
    <>
        <p className="text-sm text-gray-400 mb-4 px-1">
            Este é um resumo financeiro por categoria. Para uma visão detalhada de cada comissão individual, utilize o botão <button onClick={() => setActiveView('Extrato Detalhado (WalletPay)')} className="font-semibold text-yellow-500 hover:underline">"Ver Extrato Detalhado de Comissões"</button> no topo da página.
        </p>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                    <tr>
                        <th className="px-6 py-4">Tipo de Lançamento</th>
                        <th className="px-6 py-4 text-center">Nº de Transações</th>
                        <th className="px-6 py-4 text-right">Valor Total (R$)</th>
                    </tr>
                </thead>
                <tbody>
                    {financialReportData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-medium">{row.type}</td>
                            <td className="px-6 py-4 text-center">{row.transactions}</td>
                            <td className={`px-6 py-4 text-right font-semibold ${row.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {row.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-black/40 font-bold">
                        <td className="px-6 py-4 text-yellow-500 uppercase">Total Geral</td>
                        <td className="px-6 py-4 text-center text-white">{financialReportData.reduce((acc, item) => acc + item.transactions, 0)}</td>
                        <td className="px-6 py-4 text-right text-lg text-yellow-500">{financialReportData.reduce((acc, item) => acc + item.total, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>
);

const CareerReportTab: React.FC<{ setActiveView: (view: string) => void }> = ({ setActiveView }) => {
    const statusClasses: Record<string, string> = {
        'Qualificado': 'bg-green-600/20 text-green-400',
        'Qualificado (Promoção)': 'bg-blue-600/20 text-blue-400',
        'Não Qualificado': 'bg-red-600/20 text-red-400',
    };
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                    <tr>
                        <th className="px-4 py-4">Consultor</th>
                        <th className="px-4 py-4">PIN Atual</th>
                        <th className="px-4 py-4">PIN Alcançado</th>
                        <th className="px-4 py-4 text-right">Bônus PIN (R$)</th>
                        <th className="px-4 py-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {careerReportData.map((row) => (
                        <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                                <button onClick={() => setActiveView('Consultores')} className="flex items-center hover:text-yellow-400 transition-colors">
                                    <img className="w-10 h-10 rounded-full mr-3 object-cover" src={row.avatar} alt={row.name} />
                                    {row.name} (ID: {row.id})
                                </button>
                            </td>
                            <td className="px-4 py-3">{row.currentPin}</td>
                            <td className="px-4 py-3 font-semibold">{row.achievedPin}</td>
                            <td className="px-4 py-3 text-right">{row.bonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-center"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[row.status]}`}>{row.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ShopReportTab: React.FC = () => (
    <div>
        <p className="text-sm text-gray-400 mb-4 px-1">
            Resumo de vendas do Marketplace. Para detalhes de comissões geradas a partir de vendas, acesse o Extrato Detalhado.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900/50 p-4 rounded-lg"><p className="text-sm text-gray-400">Faturamento Total</p><p className="text-2xl font-bold">{shopReportData.kpis.totalRevenue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p></div>
            <div className="bg-gray-900/50 p-4 rounded-lg"><p className="text-sm text-gray-400">Pedidos Realizados</p><p className="text-2xl font-bold">{shopReportData.kpis.totalOrders}</p></div>
            <div className="bg-gray-900/50 p-4 rounded-lg"><p className="text-sm text-gray-400">Ticket Médio</p><p className="text-2xl font-bold">{shopReportData.kpis.averageTicket.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p></div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-3">Produtos Mais Vendidos</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                    <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4 text-center">Quantidade Vendida</th>
                        <th className="px-6 py-4 text-right">Faturamento Total</th>
                    </tr>
                </thead>
                <tbody>
                    {shopReportData.topProducts.map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-medium">{p.name}</td>
                            <td className="px-6 py-4 text-center">{p.quantity}</td>
                            <td className="px-6 py-4 text-right font-semibold text-green-400">{p.revenue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Mock data para relatórios
const mockReports: any[] = [];

const WalletReportsPage: React.FC<WalletReportsPageProps> = ({ setActiveView }) => {
    const [reports, setReports] = useState(mockReports);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('financeiro');
    
    const renderContent = () => {
        switch(activeTab) {
            case 'financeiro': return <FinancialReportTab setActiveView={() => {}} />;
            case 'carreira': return <CareerReportTab setActiveView={() => {}} />;
            case 'shop': return <ShopReportTab />;
            default: return null;
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                    <PresentationChartLineIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-yellow-500 ml-3">Central de Relatórios</h1>
                </div>
                <button 
                    onClick={() => setActiveView('Extrato Detalhado (WalletPay)')}
                    className="flex items-center gap-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400 border border-yellow-500/50 rounded-lg px-4 py-2 hover:bg-yellow-500/10 transition-colors self-start md:self-center"
                >
                    <ClipboardDocumentListIcon className="w-5 h-5"/>
                    Ver Extrato Detalhado de Comissões
                </button>
            </header>

            <div className="border-b border-gray-800 mb-6">
                <nav className="-mb-px flex space-x-4">
                    <TabButton active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} icon={<WalletIcon className="w-5 h-5" />}>Financeiro</TabButton>
                    <TabButton active={activeTab === 'carreira'} onClick={() => setActiveTab('carreira')} icon={<CareerIcon className="w-5 h-5" />}>Plano de Carreira</TabButton>
                    <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShopIcon className="w-5 h-5" />}>RS Shop</TabButton>
                </nav>
            </div>
            
            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default WalletReportsPage;