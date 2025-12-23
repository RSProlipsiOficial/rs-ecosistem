
import React, { useState } from 'react';
import { Order, OrderDetail } from '../types';
import { Search, History, Filter, Eye, X, User, ShoppingBag, Truck, Calendar, Clock, Download, FileText, DollarSign } from 'lucide-react';

interface SalesHistoryProps {
  orders: Order[];
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders based on search (Consultant name, Sponsor name, or ID) AND Date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.consultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.sponsorName && order.sponsorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.vehiclePlate && order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = dateFilter ? order.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  // Calculate Totals for the current view
  const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.total, 0);
  const totalItems = filteredOrders.length;

  const calculateItemsTotal = (details?: OrderDetail[]) => {
      if (!details) return 0;
      return details.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Export to CSV Function
  const handleExport = () => {
    const headers = ["ID", "Data", "Hora", "Consultor", "Patrocinador", "Placa", "Status", "Total"];
    const rows = filteredOrders.map(o => [
        o.id,
        o.date,
        o.time || '',
        o.consultantName,
        o.sponsorName || '',
        o.vehiclePlate || '',
        o.status,
        o.total.toFixed(2)
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_vendas_rsa_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-gold-400" />
            Histórico RSA - Vendas
          </h2>
          <p className="text-gray-400 text-sm">Registro oficial de movimentações e logística.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
            <div className="flex gap-2">
                 {/* Date Filter */}
                <div className="relative">
                    <input 
                        type="date" 
                        className="bg-dark-900 border border-dark-800 text-white pl-4 pr-4 py-2 rounded-lg focus:outline-none focus:border-gold-400 text-sm w-full sm:w-auto h-10"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>

                {/* Text Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar Consultor, Placa..." 
                        className="w-full bg-dark-900 border border-dark-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-gold-400 text-sm h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex gap-2">
                 <button 
                    onClick={handleExport}
                    className="h-10 px-4 bg-dark-800 hover:bg-dark-700 text-gold-400 border border-dark-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    title="Exportar Relatório Excel/CSV"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Exportar</span>
                </button>

                {(searchTerm || dateFilter) && (
                    <button 
                        onClick={() => { setSearchTerm(''); setDateFilter(''); }}
                        className="h-10 w-10 flex items-center justify-center bg-dark-800 text-gray-400 hover:text-white rounded-lg border border-dark-700"
                        title="Limpar Filtros"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Summary Cards (KPIs for the current view) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Total no Período</p>
                  <p className="text-xl font-bold text-white">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 bg-green-900/20 text-green-500 rounded-lg">
                  <DollarSign size={20} />
              </div>
          </div>
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Pedidos Encontrados</p>
                  <p className="text-xl font-bold text-white">{totalItems}</p>
              </div>
              <div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg">
                  <FileText size={20} />
              </div>
          </div>
      </div>

      {/* Table */}
      <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-dark-800 text-gray-200 uppercase font-bold text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Data / Hora</th>
                        <th className="px-6 py-4">Pedido</th>
                        <th className="px-6 py-4">Consultor / Patrocinador</th>
                        <th className="px-6 py-4 text-center">Veículo</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                        <th className="px-6 py-4 text-center">Detalhes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                    {filteredOrders.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">
                                Nenhum registro encontrado para os filtros atuais.
                            </td>
                        </tr>
                    ) : (
                        filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-white font-medium">
                                            <Calendar size={12} className="text-gold-400" />
                                            {order.date.split('-').reverse().join('/')}
                                        </div>
                                        {order.time && (
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                                <Clock size={10} />
                                                {order.time}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono text-gray-300 bg-dark-950 px-2 py-1 rounded border border-dark-800">
                                        {order.id}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-blue-400" />
                                            <span className="text-white text-xs font-medium">{order.consultantName}</span>
                                        </div>
                                        {order.sponsorName && (
                                            <div className="flex items-center gap-2 pl-2 border-l border-dark-700">
                                                <span className="text-[10px] text-gray-500">Indic.: {order.sponsorName}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {order.vehiclePlate ? (
                                        <div className="inline-flex items-center gap-1 bg-dark-950 px-2 py-1 rounded border border-dark-700">
                                            <Truck size={12} className="text-gray-500"/>
                                            <span className="text-xs font-mono text-gold-400 font-bold">{order.vehiclePlate}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-[10px]">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                     <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                        order.status === 'CONCLUIDO' ? 'bg-green-900/20 text-green-500' :
                                        order.status === 'PENDENTE' ? 'bg-yellow-900/20 text-yellow-500' :
                                        'bg-blue-900/20 text-blue-500'
                                    }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-gold-400 font-bold">
                                    R$ {order.total.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Ver Detalhes da Compra"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
                 <button 
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                 >
                    <X size={20} />
                 </button>

                 <div className="mb-6 pb-4 border-b border-dark-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-gold-400" />
                        Detalhes da Compra
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Pedido <span className="text-white font-mono font-bold">#{selectedOrder.id}</span> • {selectedOrder.date.split('-').reverse().join('/')} {selectedOrder.time && `às ${selectedOrder.time}`}
                    </p>
                 </div>

                 <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Consultor</span>
                            <p className="text-white font-medium">{selectedOrder.consultantName}</p>
                            <p className="text-xs text-gray-500">PIN: {selectedOrder.consultantPin}</p>
                        </div>
                        <div className="bg-dark-950 p-3 rounded-lg border border-dark-800">
                            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Veículo / Placa</span>
                            <p className="text-white font-medium">{selectedOrder.vehiclePlate || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{selectedOrder.type}</p>
                        </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Itens do Pedido</h4>
                    <div className="space-y-2">
                        {selectedOrder.productsDetail?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-dark-800/30 p-3 rounded border border-dark-800">
                                <div>
                                    <p className="text-white text-sm font-medium">{item.productName}</p>
                                    <p className="text-xs text-gray-500">Cód: {item.productId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">
                                        {item.quantity}x <span className="text-gray-400 font-normal text-xs">R$ {item.unitPrice.toFixed(2)}</span>
                                    </p>
                                    <p className="text-gold-400 text-xs font-bold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-dark-800 flex justify-between items-center">
                    <span className="text-gray-400">Total do Pedido</span>
                    <span className="text-2xl font-bold text-gold-400">R$ {selectedOrder.total.toFixed(2)}</span>
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
