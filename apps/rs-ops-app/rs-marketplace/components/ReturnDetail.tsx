

import React from 'react';
import { ReturnRequest, View } from '../types';
import { UserIcon } from './icons/UserIcon';
import { OrdersIcon } from './icons/OrdersIcon';

interface ReturnDetailProps {
    returnRequest: ReturnRequest;
    onUpdateStatus: (returnId: string, status: ReturnRequest['status']) => void;
    onNavigate: (view: View, data?: any) => void;
}

const ReturnDetail: React.FC<ReturnDetailProps> = ({ returnRequest, onUpdateStatus, onNavigate }) => {
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as ReturnRequest['status'];
        onUpdateStatus(returnRequest.id, newStatus);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4">Itens da Devolução</h3>
                    <div className="divide-y divide-[rgb(var(--color-brand-gray-light))]">
                        {returnRequest.items.map((item, index) => (
                            <div key={index} className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[rgb(var(--color-brand-gray))] rounded-md flex-shrink-0"></div>
                                        <div>
                                            <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{item.productName}</p>
                                            <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Quantidade: {item.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 pl-16">
                                    <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Motivo: <span className="text-[rgb(var(--color-brand-text-light))]">{item.reason}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coluna Lateral */}
            <div className="space-y-8">
                <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4">Status da Devolução</h3>
                    <select
                        value={returnRequest.status}
                        onChange={handleStatusChange}
                        className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"
                    >
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovada">Aprovada</option>
                        <option value="Rejeitada">Rejeitada</option>
                        <option value="Concluída">Concluída</option>
                    </select>
                </div>

                <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]"/> Cliente</h3>
                    <div className="space-y-1 text-sm">
                        <p className="font-bold text-[rgb(var(--color-brand-gold))] text-base">{returnRequest.customerName}</p>
                        <p className="text-[rgb(var(--color-brand-text-dim))]">{returnRequest.customerEmail}</p>
                    </div>
                </div>

                 <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2"><OrdersIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]"/> Pedido Original</h3>
                    <button onClick={() => onNavigate('manageOrders')} className="font-medium text-[rgb(var(--color-brand-gold))] hover:underline">
                        {returnRequest.orderId}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default ReturnDetail;