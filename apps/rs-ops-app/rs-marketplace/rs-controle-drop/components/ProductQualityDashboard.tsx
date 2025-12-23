
import React, { useMemo, useState } from 'react';
import { Order, RMA, Ticket, AbandonmentLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, Filter, AlertTriangle, MessageSquare, ShoppingCart } from 'lucide-react';

interface ProductQualityDashboardProps {
    orders: Order[];
    rmas: RMA[];
    tickets: Ticket[];
    abandonmentLogs: AbandonmentLog[];
}

interface ProductQualityMetrics {
    productId: string;
    productName: string;
    totalSold: number;
    returnCount: number;
    returnRate: number;
    ticketCount: number;
    abandonmentCount: number;
    mainSupplier: string; // Simplified for now
}

export const ProductQualityDashboard: React.FC<ProductQualityDashboardProps> = ({ orders, rmas, tickets, abandonmentLogs }) => {
    const [periodFilter, setPeriodFilter] = useState('all');

    const qualityMetrics = useMemo(() => {
        const metricsMap = new Map<string, ProductQualityMetrics>();

        // 1. Initialize with all products sold in the period
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!metricsMap.has(item.productId)) {
                    metricsMap.set(item.productId, {
                        productId: item.productId,
                        productName: item.productName,
                        totalSold: 0,
                        returnCount: 0,
                        returnRate: 0,
                        ticketCount: 0,
                        abandonmentCount: 0,
                        mainSupplier: item.supplierId, // Simplified
                    });
                }
            });
        });

        // 2. Calculate metrics
        metricsMap.forEach((metrics, productId) => {
            // Sales
            const sales = orders.flatMap(o => o.items).filter(i => i.productId === productId);
            metrics.totalSold = sales.reduce((sum, i) => sum + i.quantity, 0);

            // Returns from RMAs
            const productRmas = rmas.filter(r => r.items.some(i => i.productId === productId));
            metrics.returnCount = productRmas.length;
            metrics.returnRate = metrics.totalSold > 0 ? (metrics.returnCount / metrics.totalSold) * 100 : 0;
            
            // Tickets related to orders containing this product
            const orderIdsWithProduct = new Set(orders.filter(o => o.items.some(i => i.productId === productId)).map(o => o.id));
            metrics.ticketCount = tickets.filter(t => t.orderId && orderIdsWithProduct.has(t.orderId)).length;

            // Abandonments
            metrics.abandonmentCount = abandonmentLogs.filter(log => log.itemsSummary.some(i => i.name === metrics.productName)).length;
        });

        return Array.from(metricsMap.values()).filter(m => m.totalSold > 0);

    }, [orders, rmas, tickets, abandonmentLogs, periodFilter]);

    const problematicProducts = useMemo(() => {
        return qualityMetrics
            .filter(p => p.returnRate > 5 || p.ticketCount > 2) // Example criteria
            .sort((a, b) => (b.returnRate + b.ticketCount * 5) - (a.returnRate + a.ticketCount * 5));
    }, [qualityMetrics]);
    
    const reasonAnalysis = useMemo(() => {
        const reasonMap = new Map<string, number>();
        rmas.forEach(rma => {
            reasonMap.set(rma.reason, (reasonMap.get(rma.reason) || 0) + 1);
        });
        return Array.from(reasonMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [rmas]);

    const COLORS = ['#d4af37', '#8a7020', '#f3e5ab', '#6b5b2e'];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><TrendingUp /> Dashboard de Qualidade de Produtos</h2>
                    <p className="text-sm text-slate-400">Identifique produtos problemáticos com base em dados de pós-venda.</p>
                </div>
            </div>

            <div className="bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
                 <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2"><Package size={18} className="text-rs-gold"/> Produtos Problemáticos</h3>
                 <p className="text-xs text-slate-500 mb-4">Lista de produtos com alta taxa de devolução ou tickets de suporte, ordenados por criticidade.</p>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-3">Produto</th>
                                <th className="p-3 text-center">Vendas</th>
                                <th className="p-3 text-center text-red-400">Taxa Devolução</th>
                                <th className="p-3 text-center text-orange-400">Tickets Suporte</th>
                                <th className="p-3 text-center text-yellow-400">Abandonos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {problematicProducts.map(p => (
                                <tr key={p.productId}>
                                    <td className="p-3 font-medium text-slate-300">{p.productName}</td>
                                    <td className="p-3 text-center text-slate-400">{p.totalSold}</td>
                                    <td className="p-3 text-center text-red-400 font-bold">{p.returnRate.toFixed(1)}%</td>
                                    <td className="p-3 text-center text-orange-400">{p.ticketCount}</td>
                                    <td className="p-3 text-center text-yellow-400">{p.abandonmentCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            
            <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20">
                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-orange-400"/> Principais Motivos de Devolução (RMA)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={reasonAnalysis} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {reasonAnalysis.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#333'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
