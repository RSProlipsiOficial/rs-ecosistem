import React, { useState, useMemo, useEffect } from 'react';
import { PresentationChartBarIcon, CloseIcon, PrinterIcon, WalletIcon, SpinnerIcon } from '../icons';
import { logisticsAPI } from '../../src/services/api';

type ReportTab = 'purchases' | 'sales' | 'movements';
type OrderStatus = 'Pendente' | 'Pago' | 'Enviado' | 'Rejeitado';
type PaymentMethod = 'Saldo CD' | 'PIX';

// --- TYPE DEFINITIONS ---
interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unitPrice: number; // Discounted price
}

interface PurchaseOrder {
  id: string;
  date: string;
  cdName: string;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

interface CDReportsPageProps {
  cdId: string;
}

// Cleared mock data
const mockPurchaseOrders: PurchaseOrder[] = [];
const mockSalesData: any[] = [];
const mockMovementsData: any[] = [];

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";
const orderStatusClasses: Record<OrderStatus, string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-400',
  Pago: 'bg-blue-500/20 text-blue-400',
  Enviado: 'bg-green-600/20 text-green-400',
  Rejeitado: 'bg-red-600/20 text-red-400',
};

// --- ORDER DETAILS MODAL COMPONENT ---
const OrderDetailsModal: React.FC<{
  order: PurchaseOrder | null;
  onClose: () => void;
  onSave: (orderId: string, newStatus: OrderStatus) => void;
}> = ({ order, onClose, onSave }) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  if (!order) return null;

  const hasChanges = currentStatus !== order.status;

  const subtotal = order.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const totalItems = order.items.reduce((sum, item) => sum + item.qty, 0);

  const handlePrint = () => {
    window.print();
  }

  const handleSave = () => {
    if (!currentStatus || !hasChanges || isSaving) return;

    setIsSaving(true);
    // Simulate API call for better UX feedback
    setTimeout(() => {
      onSave(order.id, currentStatus);
      // The parent's onSave function closes the modal, which will unmount this component
      // and reset the isSaving state naturally.
    }, 750);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 print:p-0">
      <style>{`
                @media print {
                    body > *:not(.printable-modal) { display: none; }
                    .printable-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                        box-shadow: none;
                        border-radius: 0;
                        max-height: none;
                        color: black;
                        background-color: white !important;
                    }
                    .no-print { display: none; }
                    .printable-modal .bg-black\\/50 { background-color: #f0f0f0 !important; border: 1px solid #ccc; }
                    .printable-modal .text-white, .printable-modal .text-gray-300 { color: black !important; }
                    .printable-modal .text-yellow-400, .printable-modal .text-yellow-500 { color: black !important; font-weight: bold; }
                    .printable-modal .text-gray-400 { color: #555 !important; }
                    .printable-modal .border-gray-700, .printable-modal .border-gray-800 { border-color: #ccc !important; }
                    .printable-modal .bg-black\\/30 { background-color: #e0e0e0 !important; }
                }
            `}</style>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col printable-modal">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 no-print">
          <h2 className="text-xl font-bold text-white">Detalhes do Pedido <span className="font-mono text-yellow-400">{order.id}</span></h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} title="Imprimir Pedido" className="p-2 text-gray-400 hover:text-white transition-colors" disabled={isSaving}><PrinterIcon className="w-6 h-6" /></button>
            <button onClick={onClose} title="Fechar" className="p-2 text-gray-400 hover:text-white transition-colors" disabled={isSaving}><CloseIcon className="w-6 h-6" /></button>
          </div>
        </header>
        <main className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div className="bg-black/50 p-3 rounded-lg"><strong className="text-gray-400 block">Centro de Distribuição</strong><span className="font-semibold">{order.cdName}</span></div>
            <div className="bg-black/50 p-3 rounded-lg"><strong className="text-gray-400 block">Data do Pedido</strong><span>{new Date(order.date).toLocaleDateString('pt-BR')}</span></div>
            <div className="bg-black/50 p-3 rounded-lg">
              <strong className="text-gray-400 block">Status do Pedido</strong>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                className={`w-full bg-transparent font-semibold border-none outline-none focus:ring-0 p-0 text-sm ${currentStatus ? orderStatusClasses[currentStatus] : ''}`}
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Enviado">Enviado</option>
                <option value="Rejeitado">Rejeitado</option>
              </select>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-yellow-500 mt-6 mb-2">Itens do Pedido</h3>
          <div className="border border-gray-800 rounded-lg overflow-hidden">

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (statusFilter !== 'Todos' && order.status !== statusFilter) return false;
            if (paymentFilter !== 'Todos' && order.paymentMethod !== paymentFilter) return false;
            return true;
        });
    }, [orders, statusFilter, paymentFilter]);
    
    const closeOrderModal = () => {
        setSelectedOrder(null);
    }

    const handleSaveOrder = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        closeOrderModal();
    };

    const openOrderModal = (order: PurchaseOrder) => {
        setSelectedOrder(order);
    };

    const renderPurchasesTab = () => (
        <>
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                    <tr>
                        <th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">CD</th><th className="px-4 py-3 text-center">Itens</th>
                        <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Pagamento</th>
                        <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(order => {
                        const totalValue = order.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
                        const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
                        return (
                             <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => openOrderModal(order)}>
                                <td className="px-4 py-3 font-mono">{order.id}</td>
                                <td className="px-4 py-3">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-3 font-medium">{order.cdName}</td>
                                <td className="px-4 py-3 text-center">{totalQty}</td>
                                <td className="px-4 py-3 text-right font-semibold">{totalValue.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                                <td className="px-4 py-3 text-center">{order.paymentMethod}</td>
                                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${orderStatusClasses[order.status]}`}>{order.status}</span></td>
                                <td className="px-4 py-3 text-center"><button onClick={(e) => { e.stopPropagation(); openOrderModal(order); }} className="font-medium text-yellow-500 hover:text-yellow-400">Ver Pedido</button></td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={8} className="text-center py-10 text-gray-500">Nenhum pedido de compra encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'purchases': return renderPurchasesTab();
            case 'sales': return (
                <table className="w-full text-sm text-left text-gray-300">
                     <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                        <tr>
                            <th className="px-4 py-3">Data</th><th className="px-4 py-3">CD</th><th className="px-4 py-3">Consultor Comprador</th>
                            <th className="px-4 py-3">Produto</th><th className="px-4 py-3 text-center">Qtd.</th><th className="px-4 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockSalesData.length > 0 ? mockSalesData.map((d, i) => <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50"><td className="px-4 py-3">{d.date}</td><td className="px-4 py-3">{d.cd}</td><td className="px-4 py-3">{d.buyer}</td><td className="px-4 py-3">{d.product}</td><td className="px-4 py-3 text-center">{d.qty}</td><td className="px-4 py-3 text-right font-semibold">{d.total.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td></tr>) : (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhuma venda registrada.</td></tr>
                        )}
                    </tbody>
                </table>
            );
            case 'movements': return (
                 <table className="w-full text-sm text-left text-gray-300">
                     <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                        <tr>
                            <th className="px-4 py-3">Data</th><th className="px-4 py-3">CD</th><th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3 text-center">Tipo</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-right">Saldo Final</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockMovementsData.length > 0 ? mockMovementsData.map((d, i) => <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50"><td className="px-4 py-3">{d.date}</td><td className="px-4 py-3">{d.cd}</td><td className="px-4 py-3">{d.description}</td><td className="px-4 py-3 text-center"><span className={d.type === 'Crédito' ? 'text-green-400' : 'text-red-400'}>{d.type}</span></td><td className={`px-4 py-3 text-right font-semibold ${d.type === 'Crédito' ? 'text-green-400' : 'text-red-400'}`}>{d.amount.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td className="px-4 py-3 text-right font-semibold">{d.balance.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td></tr>) : (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhuma movimentação financeira.</td></tr>
                        )}
                    </tbody>
                </table>
            );
            default: return null;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <PresentationChartBarIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Relatórios do Centro de Distribuição</h1>
            </header>

            <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <input type="text" placeholder="Buscar por Pedido, CD, Produto..." className={baseInputClasses} />
                     <div className="flex items-center gap-2 md:col-span-2">
                        <input type="date" className={baseInputClasses} />
                        <span className="text-gray-400">a</span>
                        <input type="date" className={baseInputClasses} />
                    </div>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={baseInputClasses}>
                        <option>Todos os Status</option>
                        <option>Pendente</option>
                        <option>Pago</option>
                        <option>Enviado</option>
                        <option>Rejeitado</option>
                    </select>
                     <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className={baseInputClasses}>
                        <option>Todos os Pagamentos</option>
                        <option>Saldo CD</option>
                        <option>PIX</option>
                    </select>
                </div>
            </div>
            
             <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-800"><nav className="-mb-px flex space-x-4 px-4"><TabButton active={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')}>Compra dos CDs</TabButton><TabButton active={activeTab === 'sales'} onClick={() => setActiveTab('sales')}>Venda dos CDs</TabButton><TabButton active={activeTab === 'movements'} onClick={() => setActiveTab('movements')}>Movimentação Financeira</TabButton></nav></div>
                <div className="p-1 sm:p-2 md:p-6 overflow-x-auto">
                    {renderContent()}
                </div>
            </div>
            
            <OrderDetailsModal order={selectedOrder} onClose={closeOrderModal} onSave={handleSaveOrder} />
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-bold transition-colors rounded-t-lg border-b-2 ${active ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
        {children}
    </button>
);

export default CDReportsPage;