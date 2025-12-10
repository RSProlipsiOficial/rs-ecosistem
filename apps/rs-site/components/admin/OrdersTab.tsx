import React, { useState } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { Order } from '../../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (isoString: string) => new Date(isoString).toLocaleString('pt-BR');

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const { updateOrderStatus } = useOrders();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateOrderStatus(order.id, e.target.value as 'pending' | 'paid');
    };

    const statusClasses = order.paymentStatus === 'paid' 
        ? 'bg-green-500/20 text-green-300' 
        : 'bg-yellow-500/20 text-yellow-300';

    return (
        <>
            <tr className="border-t border-border">
                <td className="p-3 pl-4">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="font-mono text-xs text-accent hover:underline">
                        #{order.id.split('_')[1]}
                    </button>
                </td>
                <td className="p-3">
                    <div className="font-semibold text-text-primary">{order.customer.fullName}</div>
                    <div className="text-xs text-gray-400">{order.customer.email}</div>
                </td>
                <td className="p-3 text-text-secondary">{formatDate(order.orderDate)}</td>
                <td className="p-3 font-semibold text-accent">{formatCurrency(order.total)}</td>
                <td className="p-3">
                    <select value={order.paymentStatus} onChange={handleStatusChange} className={`text-xs rounded-md p-1 border-0 focus:ring-2 focus:ring-accent ${statusClasses}`}>
                        <option value="pending" className="bg-background text-text-primary">Pendente</option>
                        <option value="paid" className="bg-background text-text-primary">Pago</option>
                    </select>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-800/30">
                    <td colSpan={5} className="p-4">
                        <h4 className="font-semibold text-sm mb-2">Itens do Pedido:</h4>
                        <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                            {order.items.map((item, index) => (
                                <li key={`${item.product.id}-${item.variant.id}-${index}`}>
                                    {item.quantity}x {item.product.translations.pt.name} ({item.variant.name}) - {formatCurrency(item.variant.price * item.quantity)}
                                </li>
                            ))}
                        </ul>
                    </td>
                </tr>
            )}
        </>
    );
};

const OrdersTab: React.FC = () => {
    const { orders } = useOrders();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-accent">Gerenciamento de Pedidos</h2>
                <p className="text-text-secondary mt-1">Visualize e gerencie os pedidos recebidos pela sua loja.</p>
            </div>

            <div className="bg-surface rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="bg-gray-800/50 text-xs text-text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="p-3 pl-4">Pedido</th>
                            <th className="p-3">Cliente</th>
                            <th className="p-3">Data</th>
                            <th className="p-3">Total</th>
                            <th className="p-3 pr-4">Status Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => <OrderRow key={order.id} order={order} />)}
                    </tbody>
                </table>
                 {orders.length === 0 && (
                    <div className="text-center p-8 text-text-secondary">
                        Nenhum pedido recebido ainda.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersTab;
