
import React, { useMemo } from 'react';
import { Order } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { CreditCard, Wallet, FileText, HelpCircle, DollarSign, Percent } from 'lucide-react';

interface PaymentAnalysisProps {
  orders: Order[];
  currentMonth: string;
}

const getMethodGroup = (methodName: string) => {
    const lowerCaseName = methodName.toLowerCase();
    if (lowerCaseName.includes('cartão') || lowerCaseName.includes('credit')) return 'Cartão';
    if (lowerCaseName.includes('pix')) return 'PIX';
    if (lowerCaseName.includes('boleto')) return 'Boleto';
    return 'Outros';
};

export const PaymentAnalysis: React.FC<PaymentAnalysisProps> = ({ orders, currentMonth }) => {
  
  const monthlyOrders = useMemo(() => 
    orders.filter(o => o.date.startsWith(currentMonth) && o.status !== 'Refunded'), 
  [orders, currentMonth]);

  const methodStats = useMemo(() => {
    const stats = new Map<string, {
      method: string,
      qty: number,
      gross: number,
      paymentFees: number,
      platformFees: number,
      totalFees: number,
      netProfit: number
    }>();

    ['Cartão', 'PIX', 'Boleto', 'Outros'].forEach(m => {
       stats.set(m, { method: m, qty: 0, gross: 0, paymentFees: 0, platformFees: 0, totalFees: 0, netProfit: 0 });
    });

    monthlyOrders.forEach(order => {
      const group = getMethodGroup(order.paymentMethod);
      const current = stats.get(group)!;
      
      const gross = order.itemsTotal + order.shippingCharged - order.discountTotal;
      const productCost = order.items.reduce((acc, i) => acc + (i.unitCost * i.quantity), 0);
      const costs = productCost + order.shippingCost + order.otherExpenses;
      const fees = order.paymentFee + (order.platformFee || 0);
      const profit = gross - costs - fees;

      current.qty += 1;
      current.gross += gross;
      current.paymentFees += order.paymentFee;
      current.platformFees += (order.platformFee || 0);
      current.totalFees += fees;
      current.netProfit += profit;
      
      stats.set(group, current);
    });

    return Array.from(stats.values()).filter(s => s.gross > 0 || s.qty > 0).sort((a, b) => b.gross - a.gross);
  }, [monthlyOrders]);

  const pieData = methodStats.map(s => ({ name: s.method, value: s.gross }));
  const barData = methodStats.map(s => ({ 
    name: s.method, 
    Lucro: s.netProfit, 
    Taxas: s.totalFees 
  }));

  const COLORS: { [key: string]: string } = {
    'Cartão': '#3b82f6', // Blue
    'PIX': '#10b981',        // Green
    'Boleto': '#f59e0b',     // Orange
    'Outros': '#64748b'       // Slate
  };

  const getIcon = (method: string) => {
    switch(method) {
      case 'Cartão': return <CreditCard size={18} className="text-blue-400"/>;
      case 'PIX': return <Wallet size={18} className="text-emerald-400"/>;
      case 'Boleto': return <FileText size={18} className="text-orange-400"/>;
      default: return <HelpCircle size={18} className="text-slate-400"/>;
    }
  };

  const totalGross = methodStats.reduce((acc, s) => acc + s.gross, 0);
  const totalFees = methodStats.reduce((acc, s) => acc + s.totalFees, 0);
  const avgFeeRate = totalGross > 0 ? (totalFees / totalGross) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      <div className="bg-rs-card p-4 rounded-xl border border-rs-goldDim/20 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2">
             <DollarSign size={24}/> Vendas por Método
           </h2>
           <p className="text-sm text-slate-400">Análise de taxas e lucratividade por canal de pagamento</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Total Taxas</span>
              <span className="text-lg font-bold text-red-400">R$ {totalFees.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
           </div>
           <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Impacto Médio</span>
              <span className="text-lg font-bold text-orange-400">{avgFeeRate.toFixed(2)}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20 shadow-lg">
            <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2"><PieChart size={18} className="text-rs-gold"/> Participação na Receita</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie 
                       data={pieData} 
                       cx="50%" cy="50%" 
                       innerRadius={60} 
                       outerRadius={80} 
                       paddingAngle={5} 
                       dataKey="value"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} stroke="rgba(0,0,0,0.5)" />
                       ))}
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
            <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2"><BarChart size={18} className="text-emerald-400"/> Lucro Líquido vs Taxas</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{left: 0}}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false}/>
                     <XAxis type="number" stroke="#666" fontSize={10} tickFormatter={(val) => `R$${val/1000}k`}/>
                     <YAxis dataKey="name" type="category" width={80} stroke="#999" fontSize={11}/>
                     <Tooltip 
                       contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px'}}
                       formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
                       cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Legend />
                     <Bar dataKey="Lucro" fill="#10b981" stackId="a" radius={[0,0,0,0]} barSize={20} />
                     <Bar dataKey="Taxas" fill="#ef4444" stackId="a" radius={[0,4,4,0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

      </div>

      <div className="bg-rs-card rounded-xl border border-rs-goldDim/20 overflow-hidden shadow-lg">
         <div className="p-4 border-b border-white/5 font-semibold text-slate-200">
            Relatório Detalhado por Método
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                  <tr>
                     <th className="p-4">Método</th>
                     <th className="p-4 text-center">Pedidos</th>
                     <th className="p-4 text-right">Faturamento Bruto</th>
                     <th className="p-4 text-right text-orange-300">Taxas Gateway</th>
                     <th className="p-4 text-right text-purple-300">Taxas Plat.</th>
                     <th className="p-4 text-right font-bold text-emerald-400">Lucro Líquido</th>
                     <th className="p-4 text-center">Margem (%)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {methodStats.map(stat => {
                     const margin = stat.gross > 0 ? (stat.netProfit / stat.gross) * 100 : 0;
                     return (
                        <tr key={stat.method} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 flex items-center gap-3 font-medium text-slate-200">
                              {getIcon(stat.method)}
                              {stat.method}
                           </td>
                           <td className="p-4 text-center text-slate-400">{stat.qty}</td>
                           <td className="p-4 text-right">R$ {stat.gross.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                           <td className="p-4 text-right text-orange-300">- R$ {stat.paymentFees.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                           <td className="p-4 text-right text-purple-300">- R$ {stat.platformFees.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                           <td className="p-4 text-right font-bold text-emerald-400">R$ {stat.netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                           <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${margin > 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                 {margin.toFixed(1)}%
                              </span>
                           </td>
                        </tr>
                     );
                  })}
                  
                  <tr className="bg-white/5 font-bold">
                     <td className="p-4 text-rs-gold">TOTAIS</td>
                     <td className="p-4 text-center text-slate-200">{methodStats.reduce((a,b)=>a+b.qty,0)}</td>
                     <td className="p-4 text-right text-slate-200">R$ {totalGross.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                     <td className="p-4 text-right text-orange-400">- R$ {methodStats.reduce((a,b)=>a+b.paymentFees,0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                     <td className="p-4 text-right text-purple-400">- R$ {methodStats.reduce((a,b)=>a+b.platformFees,0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                     <td className="p-4 text-right text-emerald-400">R$ {methodStats.reduce((a,b)=>a+b.netProfit,0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                     <td className="p-4 text-center text-slate-400">-</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};