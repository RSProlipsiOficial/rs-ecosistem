

import React, { useState, useEffect } from 'react';
import { Order, ViewState } from '../types';
import { Search, ShoppingBag, Truck, MapPin, Clock, ArrowRight, Package, Copy, Check, Plus, X, DollarSign, User, FileText, Award, Printer } from 'lucide-react';
import { dataService } from '../services/dataService';
import { getDisplayOrderCode, getDisplayOrderHeading } from '../utils/orderDisplay';

interface OrdersProps {
  orders: Order[];
  onNavigate: (view: ViewState) => void;
  cdId?: string; // NOVO: Pra passar pro serviço
}

const statusColors: Record<string, string> = {
  'PENDENTE': 'bg-yellow-900/30 text-yellow-500 border-yellow-800 hover:bg-yellow-900/50 cursor-pointer',
  'SEPARACAO': 'bg-blue-900/30 text-blue-400 border-blue-800',
  'AGUARDANDO_RETIRADA': 'bg-purple-900/30 text-purple-400 border-purple-800',
  'EM_TRANSPORTE': 'bg-orange-900/30 text-orange-400 border-orange-800',
  'ENTREGUE': 'bg-green-900/30 text-green-500 border-green-800',
  'CONCLUIDO': 'bg-green-900/30 text-green-500 border-green-800',
};

const normalizeStatus = (status: string) => {
  if (!status) return '';
  return status
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_')           // Troca espaços por _
    .replace('EM_SEPARACAO', 'SEPARACAO'); // Padroniza o principal
};

const Orders: React.FC<OrdersProps> = ({ orders: initialOrders, onNavigate, cdId }) => {
  const [localOrders, setLocalOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [tempCode, setTempCode] = useState('');

  // Modals State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? '-')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  useEffect(() => {
    setLocalOrders(initialOrders);
  }, [initialOrders]);

  const refreshOrdersFromApi = async () => {
    if (!cdId) return localOrders;
    const refreshedOrders = await dataService.getOrders(cdId);
    if (Array.isArray(refreshedOrders) && refreshedOrders.length >= 0) {
      setLocalOrders(refreshedOrders);
      return refreshedOrders;
    }
    return localOrders;
  };

  const handleTrackingClick = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    const value = String(code || '').trim();
    if (!value) return;

    if (/^https?:\/\//i.test(value)) {
      window.open(value, '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(`https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(value)}`, '_blank', 'noopener,noreferrer');
  };

  // Payment Handlers
  const handleStatusClick = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (order.status === 'PENDENTE') {
      setPaymentOrder(order);
      return;
    }
    if (order.status === 'SEPARACAO' || order.status === 'AGUARDANDO_RETIRADA' || order.status === 'EM_TRANSPORTE' || order.status === 'ENTREGUE') {
      await handleOpenOrderDetails(order);
    }
  };

  const confirmPayment = async () => {
    if (paymentOrder) {
      // Usar fallback de CD caso ausente
      const targetCdId = cdId || paymentOrder.id; // Se não tiver, falhará no service gracefulmente
      const success = await dataService.confirmSalePayment(
        targetCdId,
        paymentOrder.id,
        paymentOrder.total,
        paymentOrder.marketplaceOrderId || undefined,
        paymentOrder.paymentMethod || undefined
      );

      if (success) {
        const updatedOrders = localOrders.map(o =>
          o.id === paymentOrder.id ? { ...o, status: 'SEPARACAO' } : o
        ) as Order[];
        setLocalOrders(updatedOrders);
        setPaymentOrder(null);
        // Dispatch custom event to trigger refresh in App.tsx se necessário
        window.dispatchEvent(new Event('refresh-cd-data'));
        await refreshOrdersFromApi();
      }
    }
  };

  const handleOpenOrderDetails = async (order: Order) => {
    const latestOrders = await refreshOrdersFromApi();
    const freshestOrder = latestOrders.find((item) => item.id === order.id) || order;
    setSelectedOrder(freshestOrder);
    setTempCode(freshestOrder.trackingCode || '');
  };

  const handleDispatchOrder = async () => {
    if (!selectedOrder) return;
    if (!tempCode.trim()) {
      alert('Informe o código de rastreio.');
      return;
    }

    const success = await dataService.updateOrderStatus(selectedOrder.id, 'EM_TRANSPORTE', tempCode.trim());
    if (!success) {
      alert('Não foi possível atualizar o rastreio do pedido.');
      return;
    }

    const updatedOrder = {
      ...selectedOrder,
      status: 'EM_TRANSPORTE' as Order['status'],
      trackingCode: tempCode.trim()
    };

    setLocalOrders((orders) =>
      orders.map((order) => (order.id === selectedOrder.id ? updatedOrder : order))
    );
    setSelectedOrder(updatedOrder);
    window.dispatchEvent(new Event('refresh-cd-data'));
    await refreshOrdersFromApi();
    alert('Código de rastreio salvo e pedido enviado para transporte.');
  };

  const handleMarkReadyForPickup = async () => {
    if (!selectedOrder) return;

    const success = await dataService.updateOrderStatus(selectedOrder.id, 'AGUARDANDO_RETIRADA');
    if (!success) {
      alert('Não foi possível atualizar o pedido para aguardando retirada.');
      return;
    }

    const updatedOrder = {
      ...selectedOrder,
      status: 'AGUARDANDO_RETIRADA' as Order['status']
    };

    setLocalOrders((orders) =>
      orders.map((order) => (order.id === selectedOrder.id ? updatedOrder : order))
    );
    setSelectedOrder(updatedOrder);
    window.dispatchEvent(new Event('refresh-cd-data'));
    await refreshOrdersFromApi();
    alert('Pedido marcado como aguardando retirada.');
  };

  const handleMarkDelivered = async () => {
    if (!selectedOrder) return;

    const success = await dataService.updateOrderStatus(selectedOrder.id, 'ENTREGUE');
    if (!success) {
      alert('Não foi possível marcar o pedido como entregue.');
      return;
    }

    const updatedOrder = {
      ...selectedOrder,
      status: 'ENTREGUE' as Order['status']
    };

    setLocalOrders((orders) =>
      orders.map((order) => (order.id === selectedOrder.id ? updatedOrder : order))
    );
    setSelectedOrder(updatedOrder);
    window.dispatchEvent(new Event('refresh-cd-data'));
    await refreshOrdersFromApi();
    alert('Pedido marcado como entregue.');
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const orderCode = getDisplayOrderCode(order);
    const heading = getDisplayOrderHeading(order);
    const rows = (order.productsDetail || [])
      .map((item) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td style="text-align:center;">${escapeHtml(item.quantity)}</td>
          <td style="text-align:right;">R$ ${Number(item.unitPrice).toFixed(2)}</td>
          <td style="text-align:right;">R$ ${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(heading)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
            h1, h2, h3 { margin: 0 0 10px; }
            .muted { color: #6b7280; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
            .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 16px; }
            .label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            th { text-align: left; color: #6b7280; text-transform: uppercase; font-size: 11px; }
            .total { margin-top: 16px; text-align: right; font-size: 24px; font-weight: 700; }
            .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h2>RS Prólipsi</h2>
          <h1>${escapeHtml(heading)}</h1>
          <p class="muted">Realizado em ${escapeHtml(order.date)}</p>

          <div class="grid">
            <div class="card">
              <div class="label">Cliente</div>
              <div>${escapeHtml(order.consultantName)}</div>
              <div class="label" style="margin-top:12px;">CPF</div>
              <div>${escapeHtml(order.buyerCpf || '-')}</div>
              <div class="label" style="margin-top:12px;">E-mail</div>
              <div>${escapeHtml(order.buyerEmail || '-')}</div>
              <div class="label" style="margin-top:12px;">Telefone</div>
              <div>${escapeHtml(order.buyerPhone || '-')}</div>
            </div>
            <div class="card">
              <div class="label">Entrega</div>
              <div>${escapeHtml(order.type)}</div>
              <div class="label" style="margin-top:12px;">Endereço</div>
              <div>${escapeHtml(order.shippingAddress || 'Retirada no Local')}</div>
              <div class="label" style="margin-top:12px;">Rastreio</div>
              <div>${escapeHtml(order.trackingCode || '-')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th style="text-align:center;">Qtd</th>
                <th style="text-align:right;">Unit.</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="total">Total: R$ ${Number(order.total).toFixed(2)}</div>
          <div class="footer">Código do pedido: ${escapeHtml(orderCode)}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const filteredOrders = localOrders.filter(order => {
    const normalizedOrder = normalizeStatus(order.status);
    const normalizedFilter = normalizeStatus(filter);

    const matchesStatus = filter === 'ALL' || normalizedOrder === normalizedFilter;

    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.consultantName.toLowerCase().includes(search.toLowerCase()) ||
      (order.trackingCode && order.trackingCode.toLowerCase().includes(search.toLowerCase()));

    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = order.date >= startDate && order.date <= endDate;
    } else if (startDate) {
      matchesDate = order.date >= startDate;
    } else if (endDate) {
      matchesDate = order.date <= endDate;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-gold-400" />
          Gestão de Pedidos
        </h2>
        <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row items-end sm:items-center">
          <div className="flex gap-2 items-center bg-dark-950 p-1 rounded-lg border border-dark-800 w-full sm:w-auto">
            <input
              type="date"
              className="bg-dark-900 border-none text-white px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-gold-400 text-sm h-10 w-full sm:w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Data Inicial"
            />
            <span className="text-gray-500 text-xs">até</span>
            <input
              type="date"
              className="bg-dark-900 border-none text-white px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-gold-400 text-sm h-10 w-full sm:w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Data Final"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Buscar pedido, rastreio..."
                className="w-full bg-dark-900 border border-dark-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-gold-400 text-sm h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {(search || startDate || endDate) && (
              <button
                onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
                className="h-10 w-10 flex items-center justify-center bg-dark-800 text-gray-400 hover:text-white rounded-lg border border-dark-700 shrink-0"
                title="Limpar Filtros"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-dark-800 scrollbar-hide">
        {['ALL', 'PENDENTE', 'SEPARACAO', 'AGUARDANDO_RETIRADA', 'EM_TRANSPORTE', 'ENTREGUE'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === status
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
              onClick={() => handleOpenOrderDetails(order)}
              className="bg-dark-900 p-3 rounded-xl border border-dark-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-gold-500/30 hover:bg-dark-800/50 transition-all cursor-pointer group animate-fade-in"
            >
              {/* Main row layout */}
              <div className="flex items-center gap-4 flex-1 w-full">
                {/* Icon - Smaller */}
                <div className={`p-2 rounded-full shrink-0 ${order.type === 'RETIRADA' ? 'bg-purple-900/20 text-purple-400' : 'bg-orange-900/20 text-orange-400'}`}>
                  {order.type === 'RETIRADA' ? <MapPin size={18} /> : <Truck size={18} />}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-x-6 gap-y-1 w-full">
                  {/* Primary Info: Consultant & ID */}
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm lg:text-base whitespace-nowrap">{order.consultantName}</span>
                    <span className="text-gray-500 text-xs font-mono">{getDisplayOrderCode(order)}</span>

                    <button
                      onClick={(e) => handleStatusClick(e, order)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide transition-all ${statusColors[normalizeStatus(order.status)] || 'bg-gray-800 text-gray-400 border-gray-700'}`}
                    >
                      {order.status.replace('_', ' ')}
                    </button>
                  </div>

                  {/* Secondary Info: Date & Items in one line */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {order.date}</span>
                    <span className="flex items-center gap-1"><ShoppingBag size={12} /> {order.items === 1 ? '1 item' : `${order.items} itens`}</span>
                    {order.type === 'ENTREGA' && order.trackingCode && (
                      <button
                        onClick={(e) => handleTrackingClick(e, order.trackingCode!)}
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 font-mono"
                      >
                        <Package size={12} /> {order.trackingCode}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action and Value Section */}
              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-dark-800 pt-3 lg:pt-0">
                <div className="flex items-center gap-3 text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Valor Total</span>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-gold-400 whitespace-nowrap">R$ {order.total.toFixed(2)}</span>
                    {order.totalPoints > 0 && (
                      <span className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">+{order.totalPoints} VP</span>
                    )}
                  </div>
                </div>
                <button className="bg-gold-500 text-black p-2 rounded-lg hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/10 shrink-0">
                  <ArrowRight size={18} />
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
                Deseja confirmar o recebimento e marcar o pedido <span className="text-white font-bold">{getDisplayOrderCode(paymentOrder)}</span> como pago?
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
                <h3 className="text-xl font-bold text-white">{getDisplayOrderHeading(selectedOrder)}</h3>
                <p className="text-gray-400 text-sm">Realizado em {selectedOrder.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <User size={14} className="text-gold-400" /> Dados do Cliente
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
                  <MapPin size={14} className="text-gold-400" /> Entrega
                </h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="text-gray-600 block text-xs uppercase">Tipo</span> {selectedOrder.type}</p>
                  <p><span className="text-gray-600 block text-xs uppercase">Endereço</span> {selectedOrder.shippingAddress || 'Retirada no Local'}</p>
                  {selectedOrder.trackingCode && (
                    <p>
                      <span className="text-gray-600 block text-xs uppercase">Rastreio</span>
                      <button
                        onClick={(e) => handleTrackingClick(e as any, selectedOrder.trackingCode!)}
                        className="text-orange-400 hover:text-orange-300 font-mono"
                      >
                        {selectedOrder.trackingCode}
                      </button>
                    </p>
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

            <div className="flex flex-wrap justify-end gap-3 mt-4">
              {selectedOrder.status === 'SEPARACAO' && selectedOrder.type === 'ENTREGA' && (
                <div className="flex items-center gap-2 w-full md:w-auto md:mr-auto">
                  <input
                    type="text"
                    placeholder="Inserir código de rastreio"
                    value={tempCode}
                    onChange={(e) => setTempCode(e.target.value)}
                    className="min-w-[260px] bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-white outline-none focus:border-gold-400"
                  />
                  <button
                    onClick={handleDispatchOrder}
                    className="bg-gold-500 hover:bg-gold-400 text-black px-5 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Enviar
                  </button>
                </div>
              )}
              {selectedOrder.status === 'SEPARACAO' && selectedOrder.type === 'RETIRADA' && (
                <button
                  onClick={handleMarkReadyForPickup}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg transition-colors font-semibold md:mr-auto"
                >
                  Pronto para retirada
                </button>
              )}
              {selectedOrder.status === 'AGUARDANDO_RETIRADA' && (
                <button
                  onClick={handleMarkDelivered}
                  className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg transition-colors font-semibold md:mr-auto"
                >
                  Confirmar retirada
                </button>
              )}
              {selectedOrder.status === 'EM_TRANSPORTE' && (
                <button
                  onClick={handleMarkDelivered}
                  className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg transition-colors font-semibold md:mr-auto"
                >
                  Marcar como entregue
                </button>
              )}
              <button
                onClick={() => handlePrintOrder(selectedOrder)}
                className="bg-gold-500 hover:bg-gold-400 text-black px-6 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
              >
                <Printer size={16} />
                Imprimir
              </button>
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
