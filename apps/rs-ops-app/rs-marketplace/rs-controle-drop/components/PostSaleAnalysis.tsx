import React, { useMemo } from 'react';
import { Order, Product, PostSaleEvent } from '../types';
import { TrendingDown, AlertCircle, Package, MessageSquare, DollarSign } from 'lucide-react';
import { KPICard } from './KPICard';

interface PostSaleAnalysisProps {
  orders: Order[];
  products: Product[];
  currentMonth: string;
}

export const PostSaleAnalysis: React.FC<PostSaleAnalysisProps> = ({ orders, products, currentMonth }) => {

  const { monthlyOrders, allEvents, kpis, analysisByProduct, analysisByReason } = useMemo(() => {
    const monthlyOrders = orders.filter(o => o.date.startsWith(currentMonth));
    const allEvents: PostSaleEvent[] = monthlyOrders.flatMap(o => o.postSaleEvents || []);

    const totalRefunded = allEvents.reduce((acc, e) => acc + e.amount, 0);
    const totalGrossRevenue = monthlyOrders.reduce((acc, o) => acc + o.itemsTotal + o.shippingCharged, 0);
    const refundRate = totalGrossRevenue > 0 ? (totalRefunded / totalGrossRevenue) * 100 : 0;
    
    const kpis = {
      totalRefunded,
      refundRate,
      eventsCount: allEvents.length
    };

    const productMap = new Map<string, { name: string, ordersCount: number, eventsCount: number, totalLost: number }>();
    monthlyOrders.forEach(order => {
        order.items.forEach(item => {
            const current = productMap.get(item.productId) || { name: item.productName, ordersCount: 0, eventsCount: 0, totalLost: 0 };
            current.ordersCount++;
            
            if (order.postSaleEvents && order.postSaleEvents.length > 0) {
                current.eventsCount++;
                current.totalLost += order.postSaleEvents.reduce((acc, e) => acc + e.amount, 0) / order.items.length;
            }
            productMap.set(item.productId, current);
        });
    });

    const analysisByProduct = Array.from(productMap.values()).filter(p => p.eventsCount > 0).sort((a,b) => b.totalLost - a.totalLost);

    const reasonMap = new Map<string, { reason: string, count: number, totalAmount: number }>();
    allEvents.forEach(event => {
        const reasonKey = event.reason.trim().toLowerCase() || 'Não especificado';
        const current = reasonMap.get(reasonKey) || { reason: event.reason || 'Não especificado', count: 0, totalAmount: 0 };
        current.count++;
        current.totalAmount += event.amount;
        reasonMap.set(reasonKey, current);
    });

    const analysisByReason = Array.from(reasonMap.values()).sort((a,b) => b.totalAmount - a.totalAmount);

    return { monthlyOrders, allEvents, kpis, analysisByProduct, analysisByReason };
  }, [orders, products, currentMonth]);


  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4 bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
        <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
           <TrendingDown size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Análise Pós-Venda</h2>
          <p className="text-sm text-slate-500">Relatório de devoluções, reembolsos e chargebacks</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Reembolsado" value={`R$ ${kpis.totalRefunded.toFixed(2)}`} icon={<DollarSign size={18} className="text-red-400"/>} />
        <KPICard title="Taxa de Reembolso" value={`${kpis.refundRate.toFixed(2)}%`} subtext="sobre o Faturamento Bruto" icon={<TrendingDown size={18} className="text-orange-400"/>} />
        <KPICard title="Total de Eventos" value={kpis.eventsCount} subtext="Devoluções, Reembolsos, etc." icon={<AlertCircle size={18} className="text-yellow-400"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-rs-card rounded-xl border border-rs-goldDim/20 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/5 font-semibold text-slate-200 flex items-center gap-2">
            <Package size={18} className="text-rs-gold" />
            Impacto por Produto
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3">Produto</th>
                  <th className="p-3 text-center">Eventos</th>
                  <th className="p-3 text-center">Taxa de Eventos</th>
                  <th className="p-3 text-right">Valor Perdido (Est.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analysisByProduct.map(p => (
                   <tr key={p.name}>
                     <td className="p-3 font-medium text-slate-300">{p.name}</td>
                     <td className="p-3 text-center text-slate-400">{p.eventsCount}</td>
                     <td className="p-3 text-center text-orange-400">{((p.eventsCount / p.ordersCount) * 100).toFixed(1)}%</td>
                     <td className="p-3 text-right text-red-400 font-mono">- R$ {p.totalLost.toFixed(2)}</td>
                   </tr>
                ))}
                {analysisByProduct.length === 0 && (
                   <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum evento registrado para produtos neste mês.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-rs-card rounded-xl border border-rs-goldDim/20 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/5 font-semibold text-slate-200 flex items-center gap-2">
            <MessageSquare size={18} className="text-rs-gold" />
            Principais Motivos
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3">Motivo</th>
                  <th className="p-3 text-center">Qtd</th>
                  <th className="p-3 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analysisByReason.map(r => (
                   <tr key={r.reason}>
                     <td className="p-3 font-medium text-slate-300 capitalize">{r.reason}</td>
                     <td className="p-3 text-center text-slate-400">{r.count}</td>
                     <td className="p-3 text-right text-red-400 font-mono">- R$ {r.totalAmount.toFixed(2)}</td>
                   </tr>
                ))}
                {analysisByReason.length === 0 && (
                   <tr><td colSpan={3} className="p-8 text-center text-slate-500">Nenhum motivo especificado nos eventos deste mês.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};