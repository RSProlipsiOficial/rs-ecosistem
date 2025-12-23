

import React, { useState, useMemo } from 'react';
import { Order, View, PaymentStatus, FulfillmentStatus } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import CustomerDetailModal from './CustomerDetailModal';

interface ManageOrdersProps {
    orders: Order[];
    onNavigate: (view: View, data?: Order) => void;
}

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center";
    const colorClasses = {
        'Pago': 'bg-[rgb(var(--color-success))]/[0.20] text-[rgb(var(--color-success))]',
        'Pendente': 'bg-[rgb(var(--color-warning))]/[0.20] text-[rgb(var(--color-warning))]',
        'Reembolsado': 'bg-[rgb(var(--color-brand-gray-light))]/[0.20] text-[rgb(var(--color-brand-text-dim))]',
        'Parcialmente Pago': 'bg-[rgb(var(--color-info))]/[0.20] text-[rgb(var(--color-info))]',
        'Cancelado': 'bg-[rgb(var(--color-error))]/[0.20] text-[rgb(var(--color-error))]',
    };
    return (<span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>);
};

const FulfillmentStatusBadge = ({ status }: { status: FulfillmentStatus }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center";
    const colorClasses = { 
        'Realizado': 'bg-[rgb(var(--color-success))]/[0.20] text-[rgb(var(--color-success))]', 
        'Não Realizado': 'bg-[rgb(var(--color-warning))]/[0.20] text-[rgb(var(--color-warning))]', 
        'Parcial': 'bg-[rgb(var(--color-info))]/[0.20] text-[rgb(var(--color-info))]' 
    };
    return (<span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>);
};


const ManageOrders: React.FC<ManageOrdersProps> = ({ orders, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerOrder, setSelectedCustomerOrder] = useState<Order | null>(null);

    const filteredOrders = useMemo(() => {
        return orders.filter(o =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, searchTerm]);

    return (
        <>
            <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
                <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                    <div className="relative max-w-lg">
                        <input
                            type="text"
                            placeholder="Buscar por Nº do pedido ou cliente"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                        </div>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                        <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                            <tr>
                                <th scope="col" className="px-6 py-3">Pedido</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-right">Total</th>
                                <th scope="col" className="px-6 py-3">Pagamento</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="border-b border-[rgb(var(--color-brand-gray-light))] hover:bg-[rgb(var(--color-brand-gray))]/[.50] cursor-pointer" onClick={() => onNavigate('orderDetail', order)}>
                                    <td className="px-6 py-4 font-medium text-[rgb(var(--color-brand-gold))]">{order.id}</td>
                                    <td className="px-6 py-4">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-[rgb(var(--color-brand-text-light))] hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedCustomerOrder(order); }}>
                                            {order.customerName}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: order.currency }).format(order.total)}</td>
                                    <td className="px-6 py-4"><PaymentStatusBadge status={order.paymentStatus} /></td>
                                    <td className="px-6 py-4"><FulfillmentStatusBadge status={order.fulfillmentStatus} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedCustomerOrder && <CustomerDetailModal order={selectedCustomerOrder} onClose={() => setSelectedCustomerOrder(null)} />}
        </>
    );
};

export default ManageOrders;