
import React, { useState } from 'react';
import { Transaction, CDProfile } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, DollarSign, Download, Calendar, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinancialProps {
  profile: CDProfile;
  transactions: Transaction[];
}

const Financial: React.FC<FinancialProps> = ({ profile, transactions }) => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDate, setWithdrawDate] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Calculations
  const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIn - totalOut;

  // Chart Data Preparation
  const chartData = [
    { name: 'Entradas', value: totalIn, color: '#10B981' },
    { name: 'Saídas', value: totalOut, color: '#EF4444' },
    { name: 'Lucro', value: Math.max(0, netProfit), color: '#FFD700' }
  ];

  // Logic to validate withdrawal date (Robust against timezone issues)
  const validateWithdrawDate = (dateString: string) => {
    if (!dateString) return false;
    
    // Split string 'YYYY-MM-DD' directly to avoid UTC/Local timezone shifts
    const parts = dateString.split('-');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[2], 10);
    
    // Rule: Days 1-5 OR 10-15
    const isFirstWindow = day >= 1 && day <= 5;
    const isSecondWindow = day >= 10 && day <= 15;

    return isFirstWindow || isSecondWindow;
  };

  const handleRequestWithdraw = () => {
    setWithdrawError(null);

    // Parse amount handling Brazilian format (1.000,00) or standard (1000.00)
    // Remove dots (thousand separators) and replace comma with dot
    const cleanAmountStr = withdrawAmount.replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(cleanAmountStr);

    if (isNaN(amount) || amount <= 0) {
        setWithdrawError("Digite um valor válido.");
        return;
    }

    if (amount > profile.walletBalance) {
        setWithdrawError("Saldo insuficiente.");
        return;
    }

    if (!withdrawDate) {
        setWithdrawError("Selecione uma data para o saque.");
        return;
    }

    if (!validateWithdrawDate(withdrawDate)) {
        setWithdrawError("Data inválida. Saques permitidos apenas entre dias 01-05 e 10-15.");
        return;
    }

    // Success simulation
    alert(`Solicitação de saque de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} agendada para ${withdrawDate.split('-').reverse().join('/')} com sucesso!`);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
    setWithdrawDate('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="text-gold-400" />
                Gestão Financeira
            </h2>
            <p className="text-gray-400 text-sm">Controle de fluxo de caixa, comissões e despesas.</p>
        </div>
        <div className="flex gap-3">
            {/* "Adicionar Fundos" removed as user is not Admin */}
            <button 
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-gold-500/20 transition-colors"
            >
                <Download size={16} />
                Solicitar Saque
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
            <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase">Saldo Disponível</p>
                <div className="p-2 bg-gold-500/10 text-gold-400 rounded-lg">
                    <Wallet size={20} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white">R$ {profile.walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-500 mt-1">Atualizado agora</p>
        </div>

        <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
            <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase">Entradas (Mês)</p>
                <div className="p-2 bg-green-900/20 text-green-500 rounded-lg">
                    <ArrowUpRight size={20} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white">R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> +12% vs mês anterior
            </p>
        </div>

        <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
            <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase">Saídas (Mês)</p>
                <div className="p-2 bg-red-900/20 text-red-500 rounded-lg">
                    <ArrowDownRight size={20} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white">R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-500 mt-1">Compras de estoque e taxas</p>
        </div>

        <div className="bg-dark-900 p-6 rounded-xl border border-dark-800">
            <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase">Lucro Líquido</p>
                <div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg">
                    <DollarSign size={20} />
                </div>
            </div>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-white' : 'text-red-500'}`}>R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-500 mt-1">Margem operacional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
        <div className="lg:col-span-2 bg-dark-900 rounded-xl border border-dark-800 flex flex-col">
            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                <h3 className="font-bold text-white">Histórico de Transações</h3>
                <button className="text-xs text-gold-400 hover:underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-950 text-gray-500 font-bold text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3 text-right">Valor</th>
                            <th className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800">
                        {transactions.map(t => (
                            <tr key={t.id} className="hover:bg-dark-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">{t.date.split('-').reverse().join('/')}</td>
                                <td className="px-6 py-4 font-medium text-white">{t.description}</td>
                                <td className="px-6 py-4">
                                    <span className="text-xs bg-dark-800 px-2 py-1 rounded border border-dark-700">
                                        {t.category.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${t.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.type === 'IN' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                        t.status === 'CONCLUIDO' ? 'bg-green-900/20 text-green-500' :
                                        t.status === 'PENDENTE' ? 'bg-yellow-900/20 text-yellow-500' :
                                        'bg-red-900/20 text-red-500'
                                    }`}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Chart */}
        <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 flex flex-col">
            <h3 className="font-bold text-white mb-6">Fluxo de Caixa</h3>
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                        <YAxis stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 text-xs text-gray-500 text-center">
                Resumo consolidado do mês atual
            </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button 
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Download size={24} className="text-gold-400" />
                    Solicitação de Saque
                </h3>

                <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 mb-6">
                    <p className="text-sm text-gray-400 mb-1">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-white">R$ {profile.walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Valor do Saque</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400 font-bold">R$</span>
                            <input 
                                type="text" 
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold-400 outline-none font-bold"
                                placeholder="0,00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data Agendada</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold-400 outline-none"
                                value={withdrawDate}
                                onChange={(e) => setWithdrawDate(e.target.value)}
                            />
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    <div className="p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg flex gap-3">
                         <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                         <div>
                             <p className="text-yellow-500 font-bold text-xs mb-1">Janelas de Saque Permitidas</p>
                             <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                                 <li>1º Período: Dias <strong className="text-white">01 a 05</strong></li>
                                 <li>2º Período: Dias <strong className="text-white">10 a 15</strong></li>
                             </ul>
                         </div>
                    </div>

                    {withdrawError && (
                        <p className="text-red-500 text-sm font-bold text-center animate-pulse">{withdrawError}</p>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => setIsWithdrawModalOpen(false)}
                        className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleRequestWithdraw}
                        className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg text-sm shadow-lg shadow-gold-500/20"
                    >
                        Confirmar Saque
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Financial;
