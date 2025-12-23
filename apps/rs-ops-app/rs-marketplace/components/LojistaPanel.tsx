import React, { useState } from 'react';

interface LojistaPanelProps {
    lojistaData: any;
    onLogout: () => void;
}

const LojistaPanel: React.FC<LojistaPanelProps> = ({ lojistaData, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'products', label: 'Produtos', icon: '📦' },
        { id: 'orders', label: 'Pedidos', icon: '🛒' },
        { id: 'customers', label: 'Clientes', icon: '👥' },
        { id: 'analytics', label: 'Relatórios', icon: '📈' },
        { id: 'settings', label: 'Configurações', icon: '⚙️' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Bem-vindo, {lojistaData.nome}!</h2>
                        
                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-blue-100 text-sm">Vendas Hoje</p>
                                    <span className="text-3xl">💰</span>
                                </div>
                                <p className="text-3xl font-bold">R$ 1.250,00</p>
                                <p className="text-blue-100 text-xs mt-2">+15% vs ontem</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-green-100 text-sm">Pedidos</p>
                                    <span className="text-3xl">📦</span>
                                </div>
                                <p className="text-3xl font-bold">23</p>
                                <p className="text-green-100 text-xs mt-2">12 pendentes</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-purple-100 text-sm">Produtos</p>
                                    <span className="text-3xl">🏷️</span>
                                </div>
                                <p className="text-3xl font-bold">156</p>
                                <p className="text-purple-100 text-xs mt-2">8 em estoque baixo</p>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-yellow-100 text-sm">Clientes</p>
                                    <span className="text-3xl">👥</span>
                                </div>
                                <p className="text-3xl font-bold">1,234</p>
                                <p className="text-yellow-100 text-xs mt-2">+45 este mês</p>
                            </div>
                        </div>

                        {/* Últimas Atividades */}
                        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Últimas Atividades</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: '🛒', text: 'Novo pedido #1234 recebido', time: 'Há 5 minutos' },
                                    { icon: '📦', text: 'Produto "Camisa Polo" adicionado', time: 'Há 1 hora' },
                                    { icon: '👤', text: 'Novo cliente cadastrado', time: 'Há 2 horas' },
                                    { icon: '💰', text: 'Pagamento confirmado #1230', time: 'Há 3 horas' },
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg hover:bg-gray-750 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{activity.icon}</span>
                                            <p className="text-gray-300">{activity.text}</p>
                                        </div>
                                        <p className="text-gray-500 text-sm">{activity.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            
            case 'products':
                return (
                    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Gerenciar Produtos</h3>
                        <p className="text-gray-400">Em desenvolvimento...</p>
                    </div>
                );
            
            case 'orders':
                return (
                    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Pedidos</h3>
                        <p className="text-gray-400">Em desenvolvimento...</p>
                    </div>
                );
            
            default:
                return (
                    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-4">{menuItems.find(m => m.id === activeTab)?.label}</h3>
                        <p className="text-gray-400">Em desenvolvimento...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Header */}
            <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                RS Prólipsi
                            </h1>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-300">Painel do Lojista</span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Lojista</p>
                                <p className="text-white font-medium">{lojistaData.nome}</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 bg-dark-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <nav className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-2 sticky top-24">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                        activeTab === item.id
                                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold shadow-lg'
                                            : 'text-gray-300 hover:bg-dark-700'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-9">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LojistaPanel;
