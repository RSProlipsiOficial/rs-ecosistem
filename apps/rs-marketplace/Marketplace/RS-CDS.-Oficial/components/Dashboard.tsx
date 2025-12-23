
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CDProfile, Order, ViewState, Customer } from '../types';
import { Users, DollarSign, Package, TrendingUp, AlertTriangle, ArrowRight, MessageCircle, X, Search } from 'lucide-react';
import { mockCustomers } from '../services/mockData';

interface DashboardProps {
  profile: CDProfile;
  orders: Order[];
  onNavigate: (view: ViewState) => void;
}

// Dados iniciais zerados para produção
const initialChartData = [
  { name: 'Jan', vendas: 0 },
  { name: 'Fev', vendas: 0 },
  { name: 'Mar', vendas: 0 },
  { name: 'Abr', vendas: 0 },
  { name: 'Mai', vendas: 0 },
  { name: 'Jun', vendas: 0 },
];

const KPICard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    subtext?: string; 
    alert?: boolean;
    onClick?: () => void;
}> = ({ title, value, icon, subtext, alert, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-xl border transition-all duration-300 group cursor-pointer ${alert ? 'bg-red-900/20 border-red-800 hover:bg-red-900/30' : 'bg-dark-900 border-dark-800 hover:border-gold-600/50 hover:bg-dark-800/50'}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-gold-400 transition-colors">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-500/20 text-red-500' : 'bg-gold-400/10 text-gold-400'}`}>
        {icon}
      </div>
    </div>
    {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ profile, orders, onNavigate }) => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const pendingOrders = orders.filter(o => o.status === 'PENDENTE' || o.status === 'SEPARACAO').length;
  const readyOrders = orders.filter(o => o.status === 'AGUARDANDO_RETIRADA').length;

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=Olá, vi que você comprou recentemente no CD. Tem alguma dúvida?`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
          <p className="text-gray-400">Bem-vindo, <span className="text-gold-400">{profile.managerName || 'Gerente'}</span></p>
        </div>
        <div className="bg-dark-900 px-4 py-2 rounded-lg border border-dark-800 text-sm text-gray-300">
          Tipo: <span className="text-gold-400 font-bold ml-1">{profile.type}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Saldo Wallet" 
          value={`R$ ${profile.walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<DollarSign size={24} />}
          subtext="Disponível para saque"
          onClick={() => onNavigate('FINANCEIRO')}
        />
        <KPICard 
          title="Pedidos Pendentes" 
          value={pendingOrders.toString()} 
          icon={<Package size={24} />}
          alert={pendingOrders > 10}
          subtext="Necessitam atenção imediata"
          onClick={() => onNavigate('PEDIDOS')}
        />
         <KPICard 
          title="Aguardando Retirada" 
          value={readyOrders.toString()} 
          icon={<AlertTriangle size={24} />}
          subtext="Prontos no balcão"
          onClick={() => onNavigate('PEDIDOS')}
        />
        <KPICard 
          title="Clientes Recorrentes" 
          value={profile.activeCustomers.toString()} 
          icon={<Users size={24} />}
          subtext="Clique para fidelizar"
          onClick={() => setShowCustomerModal(true)}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-dark-900 p-6 rounded-xl border border-dark-800">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-gold-400" />
            Volume de Vendas (Semestral)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initialChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#999'}} />
                <YAxis stroke="#666" tick={{fill: '#999'}} prefix="R$ " />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Bar dataKey="vendas" fill="#FFD700" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
          <h3 className="text-lg font-bold text-white mb-6">Acesso Rápido</h3>
          <div className="space-y-3">
             <button 
                onClick={() => onNavigate('ESTOQUE')}
                className="w-full text-left px-4 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-between group"
             >
                <span>Nova Entrada de Nota</span>
                <span className="text-gold-400 group-hover:translate-x-1 transition-transform">→</span>
             </button>
             <button 
                onClick={() => onNavigate('FINANCEIRO')}
                className="w-full text-left px-4 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-between group"
             >
                <span>Relatório de Comissões</span>
                <span className="text-gold-400 group-hover:translate-x-1 transition-transform">→</span>
             </button>
             <button 
                onClick={() => onNavigate('CONFIGURACOES')}
                className="w-full text-left px-4 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-between group"
             >
                <span>Gerenciar Permissões</span>
                <span className="text-gold-400 group-hover:translate-x-1 transition-transform">→</span>
             </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-dark-800">
            <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Status do Sistema</p>
            <div className="flex items-center gap-2 text-sm text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Online - Pronto para Operação
            </div>
          </div>
        </div>
      </div>

      {/* CRM Modal (Active Customers) */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
                <button 
                    onClick={() => setShowCustomerModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gold-500/10 rounded-lg text-gold-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Clientes Recorrentes</h3>
                        <p className="text-sm text-gray-400">Acompanhe seus principais compradores e fidelize-os.</p>
                    </div>
                </div>

                <div className="flex justify-between mb-4">
                    <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                         <input type="text" placeholder="Buscar cliente..." className="bg-dark-950 border border-dark-800 rounded-lg pl-10 pr-4 py-2 text-sm w-full text-white outline-none focus:border-gold-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto border border-dark-800 rounded-lg bg-dark-950">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-dark-900 text-gray-200 uppercase font-bold text-xs sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Última Compra</th>
                                <th className="px-6 py-4">Pedidos</th>
                                <th className="px-6 py-4 text-right">Total Gasto</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {mockCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500 italic">
                                        Nenhum cliente registrado. As vendas aparecerão aqui.
                                    </td>
                                </tr>
                            ) : (
                                mockCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-dark-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-gold-400 font-bold text-xs border border-dark-700">
                                                    {customer.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{customer.name}</p>
                                                    <p className="text-xs text-gray-600">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{customer.lastPurchaseDate.split('-').reverse().join('/')}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-dark-950 px-2 py-1 rounded text-xs border border-dark-800">{customer.ordersCount} pedidos</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gold-400">
                                            R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${customer.status === 'ATIVO' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleWhatsApp(customer.phone)}
                                                className="p-2 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                                title="Chamar no WhatsApp"
                                            >
                                                <MessageCircle size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
