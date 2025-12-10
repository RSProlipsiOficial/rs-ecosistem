
import React from 'react';
import { Order } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { UserIcon } from './icons/UserIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface CustomerDetailModalProps {
    order: Order;
    onClose: () => void;
}

const InfoRow: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-[rgb(var(--color-brand-text-dim))] mt-1 flex-shrink-0" />
        <div className="flex-grow">
            <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{label}</p>
            <p className="text-[rgb(var(--color-brand-text-light))] font-medium">{children}</p>
        </div>
    </div>
);


const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ order, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-[rgb(var(--color-brand-dark))]/[.70] z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-brand-gray-light))] flex-shrink-0">
                    <h2 className="text-xl font-bold text-[rgb(var(--color-brand-text-light))] flex items-center gap-2">
                        <UserIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]" />
                        Detalhes do Cliente
                    </h2>
                    <button onClick={onClose} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]" aria-label="Fechar">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="p-6 overflow-y-auto space-y-6">
                    <div className="bg-[rgb(var(--color-brand-gray))]/[.50] p-4 rounded-lg space-y-4">
                        <InfoRow icon={UserIcon} label="Nome do Cliente">
                            {order.customerName}
                        </InfoRow>
                        <InfoRow icon={EnvelopeIcon} label="E-mail">
                            {order.customerEmail}
                        </InfoRow>
                        <InfoRow icon={PhoneIcon} label="Telefone">
                            {order.customerPhone}
                        </InfoRow>
                         <InfoRow icon={DocumentTextIcon} label="CPF">
                            {order.customerCpf}
                        </InfoRow>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-2 flex items-center gap-2">
                            <MapPinIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/>
                            Endereço de Entrega
                        </h3>
                        <div className="bg-[rgb(var(--color-brand-gray))]/[.50] p-4 rounded-lg space-y-1 text-[rgb(var(--color-brand-text-light))]">
                            <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                            {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
                            <p>{order.shippingAddress.neighborhood}</p>
                            <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                            <p>CEP: {order.shippingAddress.zipCode}</p>
                        </div>
                    </div>
                </main>
                 <footer className="p-4 bg-[rgb(var(--color-brand-gray))]/[.50] border-t border-[rgb(var(--color-brand-gray-light))] flex-shrink-0 text-right">
                    <button 
                        onClick={onClose} 
                        className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]"
                    >
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CustomerDetailModal;