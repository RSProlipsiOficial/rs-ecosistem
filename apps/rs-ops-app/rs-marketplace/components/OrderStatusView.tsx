
import React from 'react';
import { Order } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TruckIcon } from './icons/TruckIcon';
import { UserIcon } from './icons/UserIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
// Fix: Import SpinnerIcon to fix "Cannot find name 'SpinnerIcon'" error.
import { SpinnerIcon } from './icons/SpinnerIcon';

interface OrderStatusViewProps {
    order: Order;
    onBack: () => void;
}

const OrderStatusView: React.FC<OrderStatusViewProps> = ({ order, onBack }) => {

    const steps = [
        { name: 'Pedido Realizado', status: 'completed' },
        { name: 'Pagamento Aprovado', status: order.paymentStatus === 'Pago' || order.paymentStatus === 'Parcialmente Pago' ? 'completed' : (order.paymentStatus === 'Cancelado' ? 'error' : 'pending') },
        { name: 'Pedido Enviado', status: order.fulfillmentStatus === 'Realizado' || order.fulfillmentStatus === 'Parcial' ? 'completed' : 'pending' },
        { name: 'Entregue', status: order.fulfillmentStatus === 'Realizado' && order.paymentStatus === 'Pago' ? 'pending' : 'pending' } // Mocked as pending
    ];
    const currentStepIndex = steps.map(s => s.status === 'completed').lastIndexOf(true);


    const StatusStep: React.FC<{ step: typeof steps[0]; isCurrent: boolean; isCompleted: boolean; isLast: boolean }> = ({ step, isCurrent, isCompleted, isLast }) => {
        const icon = isCompleted ? <CheckCircleIcon className="w-5 h-5 text-white"/> : (isCurrent ? <SpinnerIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/> : <ClockIcon className="w-5 h-5 text-[rgb(var(--color-brand-text-dim))]"/>)
        const circleClass = isCompleted ? 'bg-[rgb(var(--color-success))]' : (isCurrent ? 'bg-[rgb(var(--color-brand-gold))]' : 'bg-[rgb(var(--color-brand-gray-light))]');

        return (
            <div className="relative flex items-start">
                <div className="flex flex-col items-center mr-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full z-10 ${circleClass}`}>
                        {icon}
                    </div>
                    {!isLast && <div className={`w-0.5 h-16 mt-2 ${isCompleted ? 'bg-[rgb(var(--color-success))]' : 'bg-[rgb(var(--color-brand-gray-light))]'}`}></div>}
                </div>
                <div className="pt-1.5">
                    <p className={`font-bold ${isCompleted || isCurrent ? 'text-[rgb(var(--color-brand-text-light))]' : 'text-[rgb(var(--color-brand-text-dim))]'}`}>{step.name}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] mb-8">
                <ArrowLeftIcon className="w-5 h-5"/>
                Buscar outro pedido
            </button>
            <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6 lg:p-8">
                <div className="text-center border-b border-[rgb(var(--color-brand-gray-light))] pb-6 mb-6">
                    <p className="text-[rgb(var(--color-brand-text-dim))]">Status do Pedido</p>
                    <p className="text-3xl font-bold font-display text-[rgb(var(--color-brand-gold))]">{order.id}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status Timeline */}
                    <div className="lg:col-span-1">
                        {steps.map((step, index) => (
                            <StatusStep 
                                key={step.name} 
                                step={step} 
                                isCompleted={index <= currentStepIndex}
                                isCurrent={index === currentStepIndex + 1}
                                isLast={index === steps.length - 1}
                            />
                        ))}
                    </div>

                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {order.trackingCode && (
                            <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><TruckIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/> Rastreamento</h3>
                                <p className="text-[rgb(var(--color-brand-text-dim))]">Código: <span className="font-mono text-white bg-[rgb(var(--color-brand-gray-light))] px-2 py-1 rounded">{order.trackingCode}</span></p>
                            </div>
                        )}
                        <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/> Endereço de Entrega</h3>
                            <address className="text-sm not-italic text-[rgb(var(--color-brand-text-dim))] space-y-1">
                                <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                                <p>{order.shippingAddress.neighborhood}, {order.shippingAddress.city} - {order.shippingAddress.state}</p>
                                <p>CEP: {order.shippingAddress.zipCode}</p>
                            </address>
                        </div>
                        <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Resumo da Compra</h3>
                            <div className="space-y-2">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <p className="text-white">{item.productName} <span className="text-[rgb(var(--color-brand-text-dim))]">x{item.quantity}</span></p>
                                        <p className="text-[rgb(var(--color-brand-text-dim))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-[rgb(var(--color-brand-gray-light))] flex justify-between font-bold text-lg text-[rgb(var(--color-brand-gold))]">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusView;