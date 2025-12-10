

import React, { useState, useEffect } from 'react';
import { Order, ViewState } from '../types';
import { Search, ShoppingBag, Truck, MapPin, Clock, ArrowRight, Package, Copy, Check, Plus, X, DollarSign, User, FileText, Award } from 'lucide-react';

interface OrdersProps {
  orders: Order[];
  onNavigate: (view: ViewState) => void;
}

const statusColors = {
  'PENDENTE': 'bg-yellow-900/30 text-yellow-500 border-yellow-800 hover:bg-yellow-900/50 cursor-pointer',
  'SEPARACAO': 'bg-blue-900/30 text-blue-400 border-blue-800',
  'AGUARDANDO_RETIRADA': 'bg-purple-900/30 text-purple-400 border-purple-800',
  'EM_TRANSPORTE': 'bg-orange-900/30 text-orange-400 border-orange-800',
  'CONCLUIDO': 'bg-green-900/30 text-green-500 border-green-800',
};

const Orders: React.FC<OrdersProps> = ({ orders: initialOrders, onNavigate }) => {
  const [localOrders, setLocalOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Tracking Code Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCode, setTempCode] = useState('');

  // Modals State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  useEffect(() => {
    setLocalOrders(initialOrders);
  }, [initialOrders]);

  // Tracking Handlers
  const handleStartEdit = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setEditingId(order.id);
    setTempCode(order.trackingCode || '');
  };

  const handleSaveTracking = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const updatedOrders = localOrders.map(order => 
      order.id === orderId 
        ? { ...order, trackingCode: tempCode, status: tempCode ? 'EM_TRANSPORTE' : order.status } 
        : order
    ) as Order[];
    
    setLocalOrders(updatedOrders);
    setEditingId(null);
  };

  const handleTrackingClick = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    window.open(`https://rastreamento.correios.com.br/app/index.php?objeto=${code}`, '_blank');
  };

  // Payment Handlers
  const handleStatusClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (order.status === 'PENDENTE') {
      setPaymentOrder(order);
    }
  };

  const confirmPayment = () => {
    if (paymentOrder) {
      const updatedOrders = localOrders.map(o => 
        o.id === paymentOrder.id ? { ...o, status: 'SEPARACAO' } : o
      ) as Order[];
      setLocalOrders(updatedOrders);
      setPaymentOrder(null);
    }
  };

  const filteredOrders = localOrders.filter(order => {
    const matchesStatus = filter === 'ALL' || order.status === filter;
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) || 
                          order.consultantName.toLowerCase().includes(search.toLowerCase()) ||
                          (order.trackingCode && order.trackingCode.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-gold-400" />
            Gestão de Pedidos
        </h2>
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar pedido, consultor ou rastreio..." 
                    className="bg-dark-900 border border-dark-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-gold-400 w-72 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-dark-800 scrollbar-hide">
        {['ALL', 'PENDENTE', 'SEPARACAO', 'AGUARDANDO_RETIRADA', 'EM_TRANSPORTE', 'CONCLUIDO'].map((status) => (
            <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === status 
                    ? 'bg-dark-800 text-gold-400 border-b-2 border-gold-400' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
                }`}
            >
                {status === 'ALL' ? 'Todos os Pedidos' : status.replace('_', ' ')}
            </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-dark-900 rounded-xl border border-dark-800 text-gray-500">
                Nenhum pedido encontrado.
            </div>
        ) : (
            filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-dark-900 p-5 rounded-xl border border-dark-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-gold-500/30 hover:bg-dark-800/50 transition-all cursor-pointer group animate-fade-in"
                >
                    
                    {/* Left: Icon & Main Info */}
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-full shrink-0 ${order.type === 'RETIRADA' ? 'bg-purple-900/20 text-purple-400' : 'bg-orange-900/20 text-orange-400'}`}>
                            {order.type === 'RETIRADA' ? <MapPin size={24} /> : <Truck size={24} />}
                        </div>
                        <div className="w-full">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <span className="font-bold text-white text-lg group-hover:text-gold-400 transition-colors">{order.id}</span>
                                <button
                                  onClick={(e) => handleStatusClick(e, order)}
                                  className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wide transition-all ${statusColors[order.status]} ${order.status === 'PENDENTE' ? 'hover:scale-105 shadow-lg shadow-yellow-900/20' : ''}`}
                                  title={order.status === 'PENDENTE' ? "Clique para confirmar pagamento" : ""}
                                >
                                    {order.status.replace('_', ' ')}
                                </button>
                            </div>
                            <p className="text-gray-300 text-sm flex items-center gap-1">
                                Consultor: 
                                <span 
                                  className="text-white font-medium flex items-center gap-1"
                                >
                                  {order.consultantName}
                                </span> 
                                <span className="text-gray-500">({order.consultantPin})</span>
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1 bg-dark-950 px-2 py-1 rounded border border-dark-800"><Clock size={12} /> {order.date}</span>
                                <span className="flex items-center gap-1 bg-dark-950 px-2 py-1 rounded border border-dark-800"><ShoppingBag size={12} /> {order.items} itens</span>
                                {order.type === 'ENTREGA' && (
                                  <span className="flex items-center gap-1 bg-dark-950 px-2 py-1 rounded text-orange-400 border border-orange-900/30">
                                    <Package size={12} /> Entrega
                                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Tracking Code Section */}
                    {order.type === 'ENTREGA' && (
                        <div className="w-full lg:w-1/3 bg-dark-950/50 p-3 rounded-lg border border-dark-800 border-dashed" onClick={(e) => e.stopPropagation()}>
                           {editingId === order.id ? (
                               <div className="flex items-center gap-2">
                                   <input 
                                     type="text" 
                                     autoFocus
                                     className="bg-dark-800 border border-gold-500/50 text-white px-3 py-1.5 rounded text-sm w-full outline-none focus:ring-1 focus:ring-gold-500"
                                     placeholder="Código de Rastreio..."
                                     value={tempCode}
                                     onChange={(e) => setTempCode(e.target.value)}
                                   />
                                   <button 
                                     onClick={(e) => handleSaveTracking(e, order.id)}
                                     className="p-1.5 bg-green-500 text-black rounded hover:bg-green-400 transition-colors"
                                     title="Salvar"
                                   >
                                     <Check size={16} />
                                   </button>
                               </div>
                           ) : (
                               <div className="flex items-center justify-between">
                                  {order.trackingCode ? (
                                      <div 
                                        onClick={(e) => handleTrackingClick(e, order.trackingCode!)}
                                        className="flex items-center gap-3 overflow-hidden cursor-pointer group/tracking hover:bg-dark-800 p-1 rounded transition-colors w-full"
                                        title="Clique para rastrear"
                                      >
                                          <div className="p-1.5 bg-orange-900/20 text-orange-400 rounded group-hover/tracking:text-white group-hover/tracking:bg-orange-500 transition-colors">
                                              <Package size={16} />
                                          </div>
                                          <div className="flex flex-col overflow-hidden">
                                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Rastreio</span>
                                              <span className="text-sm text-white font-mono truncate underline decoration-gray-600 group-hover/tracking:decoration-gold-400 group-hover/tracking:text-gold-400">{order.trackingCode}</span>
                                          </div>
                                      </div>
                                  ) : (
                                      <span className="text-sm text-gray-600 italic pl-1">Sem rastreio informado</span>
                                  )}

                                  <div className="flex gap-1 ml-2">
                                      {order.trackingCode && (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigator.clipboard.writeText(order.trackingCode || '');
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-700 rounded transition-colors" 
                                            title="Copiar"
                                          >
                                              <Copy size={14} />
                                          </button>
                                      )}
                                      <button 
                                          onClick={(e) => handleStartEdit(e, order)}
                                          className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                                              order.trackingCode 
                                              ? 'text-gray-400 hover:text-gold-400 hover:bg-dark-700' 
                                              : 'bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border border-gold-500/30'
                                          }`}
                                      >
                                          {order.trackingCode ? 'Editar' : <><Plus size={12}/> Adicionar</>}
                                      </button>
                                  </div>
                               </div>
                           )}
                        </div>
                    )}
                    
                    {/* Right: Total & Action */}
                    <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-dark-800 pt-4 lg:pt-0">
                        <div className="text-right min-w-[100px]">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Total</p>
                            <p className="text-xl font-bold text-gold-400">R$ {order.total.toFixed(2)}</p>
                            {order.totalPoints > 0 && (
                              <p className="text-xs text-blue-400 font-bold mt-1 bg-blue-900/20 px-1 py-0.5 rounded inline-block">
                                +{order.totalPoints} VP
                              </p>
                            )}
                        </div>
                        <button className="bg-gold-500 text-black p-2.5 rounded-lg hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {paymentOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setPaymentOrder(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-yellow-900/30 text-yellow-500 rounded-full mb-4 border border-yellow-800/50">
                <DollarSign size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar Pagamento?</h3>
              <p className="text-gray-400 mt-2">
                Deseja confirmar o recebimento e marcar o pedido <span className="text-white font-bold">#{paymentOrder.id}</span> como pago?
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setPaymentOrder(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-dark-700 text-gray-300 font-medium hover:bg-dark-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmPayment}
                className="flex-1 px-4 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
             <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-start gap-4 mb-6">
                 <div className="p-3 bg-dark-800 rounded-lg text-gold-400">
                    <FileText size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Detalhes do Pedido #{selectedOrder.id}</h3>
                    <p className="text-gray-400 text-sm">Realizado em {selectedOrder.date}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <User size={14} className="text-gold-400"/> Dados do Cliente
                    </h4>
                    <div className="space-y-2 text-sm text-gray-400">
                        <p><span className="text-gray-600 block text-xs uppercase">Nome</span> {selectedOrder.consultantName}</p>
                        <p><span className="text-gray-600 block text-xs uppercase">CPF</span> {selectedOrder.buyerCpf || '-'}</p>
                        <p><span className="text-gray-600 block text-xs uppercase">Email</span> {selectedOrder.buyerEmail || '-'}</p>
                        <p><span className="text-gray-600 block text-xs uppercase">Telefone</span> {selectedOrder.buyerPhone || '-'}</p>
                    </div>
                 </div>

                 <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-gold-400"/> Entrega
                    </h4>
                    <div className="space-y-2 text-sm text-gray-400">
                        <p><span className="text-gray-600 block text-xs uppercase">Tipo</span> {selectedOrder.type}</p>
                        <p><span className="text-gray-600 block text-xs uppercase">Endereço</span> {selectedOrder.shippingAddress || 'Retirada no Local'}</p>
                        {selectedOrder.trackingCode && (
                            <p><span className="text-gray-600 block text-xs uppercase">Rastreio</span> {selectedOrder.trackingCode}</p>
                        )}
                    </div>
                 </div>
              </div>

              {/* Order Items Table */}
              <div className="bg-dark-950 rounded-xl border border-dark-800 overflow-hidden mb-6">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-800 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-4 py-2">Produto</th>
                            <th className="px-4 py-2 text-center">Qtd</th>
                            <th className="px-4 py-2 text-right">Unit.</th>
                            <th className="px-4 py-2 text-right text-blue-400">Pontos</th>
                            <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800">
                        {selectedOrder.productsDetail?.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-3 text-white">{item.productName}</td>
                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-blue-400 font-bold">{item.points} VP</td>
                                <td className="px-4 py-3 text-right font-bold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border-t border-dark-800 pt-6">
                 <div className="flex items-center gap-2 text-blue-400 bg-blue-900/10 px-3 py-1.5 rounded-lg border border-blue-900/30">
                    <Award size={18} />
                    <span className="font-bold">{selectedOrder.totalPoints} Pontos Gerados</span>
                 </div>
                 <div className="text-right">
                    <p className="text-gray-500 text-xs uppercase">Total a Pagar</p>
                    <p className="text-2xl font-bold text-gold-400">R$ {selectedOrder.total.toFixed(2)}</p>
                 </div>
              </div>

              <div className="flex justify-end mt-4">
                 <button 
                    onClick={() => setSelectedOrder(null)}
                    className="bg-dark-800 hover:bg-dark-700 text-white px-6 py-2 rounded-lg transition-colors"
                 >
                    Fechar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
