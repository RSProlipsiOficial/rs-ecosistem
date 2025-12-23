
import React, { useMemo, useState } from 'react';
import { Order } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Store, Wallet, DollarSign, Percent, Target, Megaphone, Globe } from 'lucide-react';

interface SalesChannelAnalysisProps {
  orders: Order[];
  currentMonth: string;
}

type AnalysisType = 'channel' | 'source' | 'campaign';

export const SalesChannelAnalysis: React.FC<SalesChannelAnalysisProps> = ({ orders, currentMonth }) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('channel');

  const monthlyOrders = useMemo(() => 
    orders.filter(o => o.date.startsWith(currentMonth) && o.status !== 'Refunded'), 
  [orders, currentMonth]);

  const stats = useMemo(() => {
    const dataMap = new Map<string, {
      key: string,
      ordersCount: number,
      netRevenue: number,
      platformFees: number,
      netProfit: number
    }>();

    monthlyOrders.forEach(order => {
      let key = 'Não especificado';
      
      if (analysisType === 'channel') {
          key = order.salesChannel || 'Não especificado';
      } else if (analysisType === 'source') {
          key = order.utmSource || 'Direto / Orgânico';
      } else if (analysisType === 'campaign') {
          key = order.utmCampaign || order.campaign || 'Sem Campanha';
      }

      const current = dataMap.get(key) || { key, ordersCount: 0, netRevenue: 0, platformFees: 0, netProfit: 0 };
      
      const netRevenue = order.itemsTotal + order.shippingCharged - order.discountTotal;
      const productCost = order.items.reduce((acc, i) => acc + (i.unitCost * i.quantity), 0);
      const totalCosts = productCost + order.shippingCost + order.paymentFee + order.platformFee + order.otherExpenses;
      const profit = netRevenue - totalCosts;

      current.ordersCount += 1;
      current.netRevenue += netRevenue;
      current.platformFees += (order.platformFee || 0);
      current.netProfit += profit;
      
      dataMap.set(key, current);
    });

    return Array.from(dataMap.values()).filter(s => s.netRevenue > 0).sort((a, b) => b.netRevenue - a.netRevenue);
  }, [monthlyOrders, analysisType]);

  const pieData = stats.map(s => ({ name: s.key, value: s.netRevenue }));
  const barData = stats.map(s => ({ 
    name: s.key, 
    Lucro: s.netProfit, 
    "Taxas de Plataforma": s.platformFees 
  }));

  const COLORS = ['#d4af37', '#3b82f6', '#10b981', '#f59e0b', '#64748b', '#8b5cf6', '#ec4899'];

  const totalRevenue = stats.reduce((acc, s) => acc + s.netRevenue, 0);

  const getAnalysisLabel = () => {
      switch(analysisType) {
          case 'channel': return 'Canal de Venda';
          case 'source': return 'Origem (UTM Source)';
          case 'campaign': return 'Campanha (UTM Campaign)';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="bg-rs-card p-4 rounded-xl border border-rs-goldDim/20 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2">
             <Store size={24}/> Análise de Atribuição
           </h2>
           <p className="text-sm text-slate-400">Entenda de onde vêm suas vendas e qual campanha é mais lucrativa.</p>
        </div>
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
            <button onClick={() => setAnalysisType('channel')} className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${analysisType === 'channel' ? 'bg-rs-gold text-rs-black font-bold shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <Store size={16}/> Canais
            </button>
            <button onClick={() => setAnalysisType('source')} className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${analysisType === 'source' ? 'bg-rs-gold text-rs-black font-bold shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <Globe size={16}/> Origem
            </button>
            <button onClick={() => setAnalysisType('campaign')} className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${analysisType === 'campaign' ? 'bg-rs-gold text-rs-black font-bold shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <Megaphone size={16}/> Campanhas
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20 shadow-lg">
            <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2"><PieChart size={18} className="text-rs-gold"/> Receita por {getAnalysisLabel()}</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip 
                        contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px'}} 
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
                     />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20 shadow-lg">
            <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2"><BarChart size={18} className="text-emerald-400"/> Lucro vs Taxas por {getAnalysisLabel()}</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{left: 20}}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false}/>
                     <XAxis type="number" stroke="#666" fontSize={10} tickFormatter={(val) => `R$${val/1000}k`}/>
                     <YAxis dataKey="name" type="category" width={100} stroke="#999" fontSize={11}/>
                     <Tooltip 
                        contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px'}} 
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Legend />
                     <Bar dataKey="Lucro" fill="#10b981" stackId="a" radius={[0,0,0,0]} barSize={20} />
                     <Bar dataKey="Taxas de Plataforma" fill="#ef4444" stackId="a" radius={[0,4,4,0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-rs-card rounded-xl border border-rs-goldDim/20 overflow-hidden shadow-lg">
         <div className="p-4 border-b border-white/5 font-semibold text-slate-200">
            Relatório Detalhado: {getAnalysisLabel()}
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                  <tr>
                     <th className="p-4">{getAnalysisLabel()}</th>
                     <th className="p-4 text-center">Pedidos</th>
                     <th className="p-4 text-right">Receita Líquida</th>
                     {analysisType === 'channel' && <th className="p-4 text-right text-red-300">Taxas Plataforma</th>}
                     <th className="p-4 text-right font-bold text-emerald-400">Lucro Líquido</th>
                     <th className="p-4 text-center">Margem (%)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {stats.map(stat => {
                     const margin = stat.netRevenue > 0 ? (stat.netProfit / stat.netRevenue) * 100 : 0;
                     return (
                        <tr key={stat.key} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 font-medium text-slate-200">{stat.key}</td>
                           <td className="p-4 text-center text-slate-400">{stat.ordersCount}</td>
                           <td className="p-4 text-right">R$ {stat.netRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                           {analysisType === 'channel' && <td className="p-4 text-right text-red-300">- R$ {stat.platformFees.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>}
                           <td className="p-4 text-right font-bold text-emerald-400">R$ {stat.netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                           <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${margin > 20 ? 'text-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                 {margin.toFixed(1)}%
                              </span>
                           </td>
                        </tr>
                     );
                  })}
                  {stats.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum dado encontrado para este período.</td></tr>}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
