import React, { useState, useEffect } from 'react';
import { logisticsAPI } from '../../src/services/api';
import { BuildingStorefrontIcon, ArchiveBoxIcon, ChartBarIcon, CubeIcon } from '../icons';

// Cleared mock data
const mockCDs: any[] = [];
const mockProducts: any[] = [];
const mockCDData: Record<number, any> = {};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

interface CDStorePageProps {
    cdId: number | null;
}

const CDStorePage: React.FC<CDStorePageProps> = ({ cdId }) => {
    const [products, setProducts] = useState(mockProducts);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'sales'>('overview');
    const [selectedCDId, setSelectedCDId] = useState(cdId);

    useEffect(() => { loadProducts(); }, [cdId]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await logisticsAPI.getCDStock(cdId);
            if (res?.data?.success) setProducts(res.data.products || mockProducts);
        } catch (err) {
            setError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const cdData = selectedCDId ? mockCDData[selectedCDId] : null;

    const totalStockValue = cdData?.stock.reduce((sum, item) => sum + item.value, 0) || 0;
    const totalSalesMonth = cdData?.sales.reduce((sum, item) => sum + item.total, 0) || 0;
    
    const TabButton: React.FC<{ tabId: 'overview' | 'stock' | 'sales'; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tabId 
                ? 'border-b-2 border-yellow-500 text-yellow-500' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-400">Valor Total em Estoque</p>
                <p className="text-3xl font-bold text-yellow-400">{totalStockValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
             <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-400">Vendas (Mês)</p>
                <p className="text-3xl font-bold">{totalSalesMonth.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
             <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-400">Consultores Atendidos (Mês)</p>
                <p className="text-3xl font-bold">{cdData?.sales.length || 0}</p>
            </div>
        </div>
    );

    const renderStock = () => (
        <div>
            <button className="mb-4 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 text-sm">Registrar Compra de Estoque</button>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                        <tr>
                            <th className="px-6 py-3">Produto</th>
                            <th className="px-6 py-3">SKU</th>
                            <th className="px-6 py-3 text-center">Quantidade em Estoque</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cdData?.stock.length > 0 ? cdData?.stock.map(item => {
                            const product = mockProducts.find(p => p.id === item.productId);
                            return (
                                <tr key={item.productId} className="border-b border-gray-800">
                                    <td className="px-6 py-4 font-medium">{product?.name}</td>
                                    <td className="px-6 py-4 font-mono">{product?.sku}</td>
                                    <td className="px-6 py-4 text-center font-bold text-lg">{item.quantity}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">Nenhum item em estoque.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSales = () => (
        <div>
            <button className="mb-4 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 text-sm">Registrar Venda / Retirada</button>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                     <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Consultor</th>
                            <th className="px-6 py-3 text-center">Itens</th>
                            <th className="px-6 py-3 text-right">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cdData?.sales.length > 0 ? cdData?.sales.map((sale, index) => (
                            <tr key={index} className="border-b border-gray-800">
                                <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td className="px-6 py-4 font-medium">{sale.consultant}</td>
                                <td className="px-6 py-4 text-center">{sale.items}</td>
                                <td className="px-6 py-4 text-right font-semibold">{sale.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">Nenhuma venda registrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <BuildingStorefrontIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Loja do Centro de Distribuição</h1>
            </header>
            
            {selectedCDId ? (
                <div className="mb-6">
                    <button onClick={() => setSelectedCDId(null)} className="text-sm text-yellow-500 hover:underline">
                        &larr; Voltar para a seleção de CDs
                    </button>
                </div>
            ) : (
                <div className="mb-6 max-w-md">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Selecione o CD para gerenciar</label>
                    <select 
                        onChange={(e) => setSelectedCDId(Number(e.target.value))}
                        className={baseInputClasses}
                        defaultValue=""
                    >
                        <option value="" disabled>Escolha um Centro de Distribuição...</option>
                        {mockCDs.map(cd => (
                            <option key={cd.id} value={cd.id}>{cd.name}</option>
                        ))}
                    </select>
                </div>
            )}


            {selectedCDId ? (
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg">
                    <div className="border-b border-gray-700 px-4">
                        <nav className="-mb-px flex space-x-4">
                            <TabButton tabId="overview" label="Visão Geral" icon={<ChartBarIcon className="w-5 h-5"/>} />
                            <TabButton tabId="stock" label="Estoque" icon={<ArchiveBoxIcon className="w-5 h-5"/>} />
                            <TabButton tabId="sales" label="Vendas" icon={<CubeIcon className="w-5 h-5"/>} />
                        </nav>
                    </div>
                    <div className="p-6">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'stock' && renderStock()}
                        {activeTab === 'sales' && renderSales()}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-black/50 border border-dashed border-gray-700 rounded-xl">
                    <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-gray-600" />
                    <p className="mt-4 text-lg text-gray-500">Selecione um Centro de Distribuição para começar.</p>
                </div>
            )}
        </div>
    );
};

export default CDStorePage;