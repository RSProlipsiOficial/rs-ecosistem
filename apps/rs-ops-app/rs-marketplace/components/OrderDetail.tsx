
import React, { useState } from 'react';
import { Order, PaymentStatus, FulfillmentStatus } from '../types';
import { UserIcon } from './icons/UserIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { TruckIcon } from './icons/TruckIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface OrderDetailProps {
    order: Order;
    onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
    onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onUpdateOrder, onBack }) => {
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    const [isEditingTracking, setIsEditingTracking] = useState(false);
    const [notes, setNotes] = useState(order.notes || '');
    
    const handleStatusChange = (type: 'payment' | 'fulfillment', value: PaymentStatus | FulfillmentStatus) => {
        const updates = type === 'payment' ? { paymentStatus: value as PaymentStatus } : { fulfillmentStatus: value as FulfillmentStatus };
        onUpdateOrder(order.id, updates);
    };

    const handleSaveTracking = () => {
        onUpdateOrder(order.id, { trackingCode });
        setIsEditingTracking(false);
    };

    const handleSaveNotes = () => {
        onUpdateOrder(order.id, { notes });
        alert('Observação salva!');
    };
    
    const whatsappMessage = `Olá ${order.customerName}, seu pedido ${order.id} foi enviado! O código de rastreamento é: ${trackingCode}`;
    const whatsappLink = `https://wa.me/55${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div>
            <button onClick={onBack} className="text-sm text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] mb-6">
                &larr; Voltar para Pedidos
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Items */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4">Itens do Pedido</h3>
                        <div className="divide-y divide-[rgb(var(--color-brand-gray-light))]">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-[rgb(var(--color-brand-gray))] rounded-md flex-shrink-0"></div>
                                        <div>
                                            <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{item.productName}</p>
                                            {item.sku && <p className="text-xs text-[rgb(var(--color-brand-text-dim))] font-mono">SKU: {item.sku}</p>}
                                            {item.variantText && <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{item.variantText}</p>}
                                            <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: order.currency }).format(item.price)} x {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: order.currency }).format(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 mt-4 border-t border-[rgb(var(--color-brand-gray-light))] text-right">
                             <p className="text-[rgb(var(--color-brand-text-dim))]">Total: <span className="text-xl text-[rgb(var(--color-brand-text-light))] font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: order.currency }).format(order.total)}</span></p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                         <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2"><DocumentTextIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]"/> Observações do Pedido</h3>
                         <textarea 
                             value={notes} 
                             onChange={(e) => setNotes(e.target.value)} 
                             className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" 
                             placeholder="Adicione observações internas sobre este pedido..."
                             rows={4}
                         />
                         <div className="text-right mt-2">
                            <button 
                                onClick={handleSaveNotes} 
                                disabled={notes === (order.notes || '')} 
                                className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Salvar Observação
                            </button>
                         </div>
                    </div>
                </div>

                {/* Side column */}
                <div className="space-y-8">
                    {/* Status */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[rgb(var(--color-brand-text-dim))]">Status do Pagamento</label>
                            <select value={order.paymentStatus} onChange={(e) => handleStatusChange('payment', e.target.value as PaymentStatus)} className="w-full mt-1 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                                <option>Pendente</option><option>Pago</option><option>Cancelado</option><option>Reembolsado</option><option>Parcialmente Pago</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-[rgb(var(--color-brand-text-dim))]">Status do Pedido</label>
                            <select value={order.fulfillmentStatus} onChange={(e) => handleStatusChange('fulfillment', e.target.value as FulfillmentStatus)} className="w-full mt-1 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]">
                               <option>Não Realizado</option><option>Realizado</option><option>Parcial</option>
                            </select>
                        </div>
                    </div>
                     {/* Customer */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]"/> Cliente</h3>
                        <p className="font-bold text-[rgb(var(--color-brand-gold))] text-base">{order.customerName}</p>
                        <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{order.customerEmail}</p>
                        <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{order.customerPhone}</p>
                        <p className="text-sm text-[rgb(var(--color-brand-text-dim))] mt-2 flex items-center gap-2"><DocumentTextIcon className="w-4 h-4 text-[rgb(var(--color-brand-text-dim))]"/> CPF: {order.customerCpf}</p>
                    </div>
                     {/* Shipping */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2"><MapPinIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]"/> Endereço de Entrega</h3>
                        <address className="text-sm not-italic text-[rgb(var(--color-brand-text-dim))] space-y-1">
                            <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                            {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
                            <p>{order.shippingAddress.neighborhood}</p>
                            <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                            <p>CEP: {order.shippingAddress.zipCode}</p>
                        </address>
                    </div>
                     {/* Delivery & Tracking */}
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
                         <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2"><TruckIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]"/> Entrega e Rastreamento</h3>
                         {order.shippingMethod && (
                            <div className="mb-4">
                                <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Método de Envio</p>
                                <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{order.shippingMethod}</p>
                            </div>
                         )}
                         <div className="space-y-2">
                             <label className="text-sm text-[rgb(var(--color-brand-text-dim))]">Código de Rastreio</label>
                             {isEditingTracking || !order.trackingCode ? (
                                 <div className="flex items-center gap-2">
                                    <input type="text" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" placeholder="Insira o código"/>
                                    <button onClick={handleSaveTracking} className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-2 px-4 rounded-md hover:bg-gold-400">Salvar</button>
                                    {isEditingTracking && <button onClick={() => setIsEditingTracking(false)} className="bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] font-semibold py-2 px-4 rounded-md">Cancelar</button>}
                                </div>
                             ) : (
                                 <div className="flex items-center justify-between">
                                    <p className="font-mono text-[rgb(var(--color-brand-text-light))] bg-[rgb(var(--color-brand-gray))] px-3 py-2 rounded-md">{order.trackingCode}</p>
                                    <div className="flex items-center gap-4">
                                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[rgb(var(--color-success))] hover:text-[rgb(var(--color-success))]/[.80]" title="Enviar rastreio por WhatsApp">
                                            <WhatsappIcon className="w-5 h-5"/>
                                        </a>
                                        <button onClick={() => setIsEditingTracking(true)} className="text-sm text-[rgb(var(--color-brand-gold))] hover:underline">Editar</button>
                                    </div>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;