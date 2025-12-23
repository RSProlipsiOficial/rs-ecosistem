import React, { useState, useMemo } from 'react';
import { Product, Order, ProductSupplier } from '../types';
import { BarChart3, Download, Calendar, Filter, AlertOctagon, TrendingUp, Package, DollarSign } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';

interface ProductReportsProps {
  products: Product[];
  orders: Order[];
  productSuppliers: ProductSupplier[];
}

interface ProductReportData extends Product {
    totalSold: number;
    totalRevenue: number;
    totalCost: number;
    estimatedProfit: number;
    profitMargin: number;
    lastSaleDate: string | null;
    daysSinceLastSale: number;
    turnoverRate: number; 
    capitalTied: number; 
}

export const ProductReports: React.FC<ProductReportsProps> = ({ products, orders, productSuppliers }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'stagnant'>('performance');
  const [daysThreshold, setDaysThreshold] = useState<number>(30);
  const [period, setPeriod] = useState<string>('30');

  const getDateFromPeriod = (days: string) => {
      if (days === 'all') return new Date(0);
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      return date;
  };

  const timeSince = (dateStr: string | null): number => {
      if (!dateStr) return 9999;
      const today = new Date();
      today.setHours(0,0,0,0);
      const target = new Date(dateStr);
      target.setHours(0,0,0,0);
      return Math.ceil(Math.abs(today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  };

  const reportData = useMemo(() => {
    const startDate = getDateFromPeriod(period);

    return products.map(product => {
      const productOrders = orders.filter(o => o.items.some(i => i.productId === product.id));
      const periodOrders = period === 'all' ? productOrders : productOrders.filter(o => new Date(o.date) >= startDate);

      const totalSold = periodOrders.reduce((sum, order) => {
        const item = order.items.find(i => i.productId === product.id);
        return sum + (item?.quantity || 0);
      }, 0);
      
      const totalRevenue = periodOrders.reduce((sum, order) => {
        const item = order.items.find(i => i.productId === product.id);
        return sum + ((item?.unitPrice || 0) * (item?.quantity || 0));
      }, 0);

      const lowestCost = Math.min(...productSuppliers.filter(ps => ps.productId === product.id).map(ps => ps.costPrice), Infinity);
      const validCost = lowestCost !== Infinity ? lowestCost : 0;
      
      const totalCost = validCost * totalSold;
      const estimatedProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

      let lastSaleDate: string | null = null;
      if (productOrders.length > 0) {
          const sortedOrders = [...productOrders].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          lastSaleDate = sortedOrders[0].date;
      }
      
      const daysSinceLastSale = timeSince(lastSaleDate);
      const totalInventoryExposure = totalSold + product.currentStock;
      const turnoverRate = totalInventoryExposure > 0 ? (totalSold / totalInventoryExposure) * 100 : 0;
      const capitalTied = validCost * product.currentStock;

      return {
        ...product,
        totalSold,
        totalRevenue,
        totalCost,
        estimatedProfit,
        profitMargin,
        lastSaleDate,
        daysSinceLastSale,
        turnoverRate,
        capitalTied
      };
    });
  }, [products, orders, productSuppliers, period]);

  const filteredData = useMemo(() => {
      if (activeTab === 'performance') {
          return reportData;
      } else {
          return reportData.filter(p => p.currentStock > 0 && p.daysSinceLastSale >= daysThreshold).sort((a,b) => b.capitalTied - a.capitalTied);
      }
  }, [reportData, activeTab, daysThreshold]);

  const handleExport = () => {
      const headers = ['Produto', 'SKU', 'Estoque Atual', 'Vendas (Periodo)', 'Receita', 'Margem %', 'Giro %', 'Dias Sem Venda', 'Capital Parado'];
      const csvRows = [
          headers.join(','),
          ...filteredData.map(row => [
              `"${row.name}"`, row.sku || '', row.currentStock, row.totalSold, row.totalRevenue.toFixed(2),
              row.profitMargin.toFixed(1), row.turnoverRate.toFixed(1), row.daysSinceLastSale === 9999 ? 'Nunca' : row.daysSinceLastSale, row.capitalTied.toFixed(2)
          ].join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
  };

  const table = useDataTable({ initialData: filteredData, searchKeys: ['name', 'sku'] });

  const performanceColumns: Column<ProductReportData>[] = [
    { header: 'Produto', accessor: 'name', sortable: true, render: p => <div><div className="font-bold text-slate-200">{p.name}</div><div className="text-xs text-slate-500">{p.sku}</div></div> },
    { header: 'Vendas', accessor: 'totalSold', sortable: true, cellClassName: 'text-center' },
    { header: 'Receita', accessor: 'totalRevenue', sortable: true, render: p => `R$ ${p.totalRevenue.toFixed(2)}`, cellClassName: 'text-right' },
    { header: 'Giro Est.', accessor: 'turnoverRate', sortable: true, render: p => <span className={`font-bold ${p.turnoverRate > 50 ? 'text-emerald-400' : 'text-slate-400'}`}>{p.turnoverRate.toFixed(1)}%</span>, cellClassName: 'text-center' },
    { header: 'Estoque', accessor: 'currentStock', sortable: true, cellClassName: 'text-center font-bold' },
  ];

  const stagnantColumns: Column<ProductReportData>[] = [
    { header: 'Produto', accessor: 'name', sortable: true, render: p => <div className="font-bold text-slate-200">{p.name}</div> },
    { header: 'Estoque', accessor: 'currentStock', sortable: true, cellClassName: 'text-center' },
    { header: 'Dias Sem Venda', accessor: 'daysSinceLastSale', sortable: true, render: p => <span className="text-red-400 font-bold">{p.daysSinceLastSale === 9999 ? 'Nunca' : `${p.daysSinceLastSale} dias`}</span>, cellClassName: 'text-center' },
    { header: 'Capital Parado', accessor: 'capitalTied', sortable: true, render: p => `R$ ${p.capitalTied.toFixed(2)}`, cellClassName: 'text-right font-bold text-red-300' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
       <div className="flex justify-between items-center bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><BarChart3 size={24} /></div>
            <div><h2 className="text-xl font-bold text-slate-100">Inteligência de Estoque</h2></div>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2"><Download size={18}/> CSV</button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-1 bg-rs-dark p-1 rounded-lg border border-white/10">
              <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 text-sm font-bold rounded-md ${activeTab === 'performance' ? 'bg-rs-gold text-rs-black' : 'text-slate-400'}`}><TrendingUp size={16}/> Performance</button>
              <button onClick={() => setActiveTab('stagnant')} className={`px-4 py-2 text-sm font-bold rounded-md ${activeTab === 'stagnant' ? 'bg-rs-gold text-rs-black' : 'text-slate-400'}`}><Package size={16}/> Estoque Parado</button>
          </div>
          <div className="flex items-center gap-3">
              {activeTab === 'performance' ? (
                  <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-slate-200">
                      <option value="30">Últimos 30 dias</option>
                      <option value="90">Últimos 90 dias</option>
                      <option value="all">Todo o período</option>
                  </select>
              ) : (
                  <select value={daysThreshold} onChange={(e) => setDaysThreshold(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-slate-200">
                      <option value="30">+30 dias sem venda</option>
                      <option value="60">+60 dias sem venda</option>
                      <option value="90">+90 dias sem venda</option>
                  </select>
              )}
          </div>
      </div>

       <DataTable {...table} columns={activeTab === 'performance' ? performanceColumns : stagnantColumns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar produto..."/>
       <style>{`.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
    </div>
  );
};