
import React, { useState, useEffect } from 'react';
import { DropshippingOrder, Supplier, Order } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { UserIcon } from './icons/UserIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface DropshippingOrderDetailModalProps {
    order: DropshippingOrder;
    supplier: Supplier | null;
    customer: Order | null;
    onUpdateOrder: (orderId: string, updates: Partial<DropshippingOrder>) => void;
    onClose: () => void;
}

const DropshippingOrderDetailModal: React.FC<DropshippingOrderDetailModalProps> = ({ order, supplier, customer, onUpdateOrder, onClose }) => {
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    
    useEffect(() => {
        setTrackingCode(order.trackingCode || '');
    }, [order]);

    const handleSaveTrackingCode = () => {
        onUpdateOrder(order.id, { trackingCode });
        alert('Código de rastreamento salvo!');
    };
    
    const getWhatsAppLink = (message: string) => {
        if (!customer) return '#';
        const phone = `55${customer.customerPhone.replace(/\D/g, '')}`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    const getEmailLink = (subject: string, body: string) => {
        if (!customer) return '#';
        return `mailto:${customer.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const trackingMessage = `Olá ${customer?.customerName}, seu pedido ${order.orderId} foi enviado! O código de rastreamento é: ${trackingCode}.`;
    const trackingSubject = `Seu pedido ${order.orderId} foi enviado!`;


    return (
        <div 
            className="fixed inset-0 bg-[rgb(var(--color-brand-dark))]/[.70] z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-brand-gray-light))] flex-shrink-0">
                    <h2 className="text-xl font-bold text-[rgb(var(--color-brand-text-light))]">Detalhes do Pedido Drop - {order.id}</h2>
                    <button onClick={onClose} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto space-y-6">
                    {/* Status and Tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg">
                            <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Status</p>
                            <p className="text-lg font-semibold text-[rgb(var(--color-brand-gold))]">{order.status}</p>
                        </div>
                         <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg">
                            <label htmlFor="trackingCode" className="text-sm text-[rgb(var(--color-brand-text-dim))]">Rastreamento</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    id="trackingCode"
                                    value={trackingCode}
                                    onChange={(e) => setTrackingCode(e.target.value)}
                                    placeholder="Insira o código"
                                    className="w-full bg-[rgb(var(--color-brand-gray-light))] border border-[rgb(var(--color-brand-gray))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))]"
                                />
                                <button onClick={handleSaveTrackingCode} className="text-xs font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-3 rounded-md hover:bg-gold-400">
                                    Salvar
                                </button>
                            </div>
                            {trackingCode && customer && (
                                <div className="flex items-center gap-2 mt-2">
                                     <a href={getWhatsAppLink(trackingMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[rgb(var(--color-success))] hover:text-[rgb(var(--color-success))]/[.80]">
                                        <WhatsappIcon className="w-4 h-4" /> Enviar por WhatsApp
                                    </a>
                                     <a href={getEmailLink(trackingSubject, trackingMessage)} className="flex items-center gap-1 text-xs text-[rgb(var(--color-info))] hover:text-[rgb(var(--color-info))]/[.80]">
                                        <EnvelopeIcon className="w-4 h-4" /> Enviar por E-mail
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                         <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-2">Itens do Pedido</h3>
                         <div className="divide-y divide-[rgb(var(--color-brand-gray-light))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
                           {order.items.map((item, index) => (
                               <div key={index} className="flex items-center justify-between p-3">
                                   <div>
                                       <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{item.productName}</p>
                                       <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">
                                           Custo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.costPrice)} x {item.quantity}
                                       </p>
                                   </div>
                                   <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.costPrice * item.quantity)}
                                   </p>
                               </div>
                           ))}
                           <div className="p-3 text-right bg-[rgb(var(--color-brand-gray))]/[.50]">
                                <p className="text-[rgb(var(--color-brand-text-dim))]">Custo Total: <span className="text-lg text-[rgb(var(--color-brand-text-light))] font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalCost)}</span></p>
                           </div>
                         </div>
                    </div>
                    
                    {/* Customer Info */}
                    {customer && (
                        <div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-2 flex items-center gap-2"><UserIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]" /> Informações do Cliente</h3>
                             <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg space-y-2">
                                <p className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">{customer.customerName}</p>
                                <a href={getEmailLink(`Sobre seu pedido ${order.orderId}`, '')} className="text-sm text-[rgb(var(--color-brand-text-dim))] flex items-center gap-2 hover:text-[rgb(var(--color-brand-gold))]"><EnvelopeIcon className="w-4 h-4"/>{customer.customerEmail}</a>
                                <a href={getWhatsAppLink(`Olá ${customer.customerName}, sobre seu pedido ${order.orderId}...`)} target="_blank" rel="noopener noreferrer" className="text-sm text-[rgb(var(--color-brand-text-dim))] flex items-center gap-2 hover:text-[rgb(var(--color-brand-gold))]"><PhoneIcon className="w-4 h-4"/>{customer.customerPhone}</a>
                            </div>
                        </div>
                    )}


                    {/* Supplier Info */}
                    {supplier && (
                        <div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-2">Informações do Fornecedor</h3>
                            <div className="bg-[rgb(var(--color-brand-gray))] p-4 rounded-lg space-y-2">
                                <p className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">{supplier.name}</p>
                                <p className="text-sm text-[rgb(var(--color-brand-text-dim))] flex items-center gap-2"><MapPinIcon className="w-4 h-4"/>{supplier.address}</p>
                                <p className="text-sm text-[rgb(var(--color-brand-text-dim))] flex items-center gap-2"><PhoneIcon className="w-4 h-4"/>{supplier.phone}</p>
                                <a href={`mailto:${supplier.email}`} className="text-sm text-[rgb(var(--color-brand-text-dim))] flex items-center gap-2 hover:text-[rgb(var(--color-brand-gold))]"><EnvelopeIcon className="w-4 h-4"/>{supplier.email}</a>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DropshippingOrderDetailModal;