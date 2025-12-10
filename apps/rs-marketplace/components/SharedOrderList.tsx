import React, { useState, useEffect } from 'react';
import { SharedOrder } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { PlusIcon } from './icons/PlusIcon';

interface SharedOrderListProps {
    currentCustomer: any;
    onCreateNew: () => void;
    onViewDetails: (orderId: string) => void;
}

const SharedOrderList: React.FC<SharedOrderListProps> = ({ currentCustomer, onCreateNew, onViewDetails }) => {
    const [orders, setOrders] = useState<SharedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState<string>('');

    useEffect(() => {
        loadOrders();
    }, [currentCustomer]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // TODO: Substituir por chamada real à API
            await new Promise(res => setTimeout(res, 1000));
            
            // Mock data
            const mockOrders: SharedOrder[] = [
                {
                    id: 'shared-1',
                    teamId: 'team-1',
                    coordinatorId: currentCustomer?.id || 'user-1',
                    coordinatorName: currentCustomer?.name || 'Você',
                    deliveryAddress: {
                        zipCode: '04567-000',
                        street: 'Rua Augusta',
                        number: '123',
                        complement: 'Apto 45',
                        neighborhood: 'Consolação',
                        city: 'São Paulo',
                        state: 'SP'
                    },
                    status: 'collecting',
                    totalAmount: 2450.00,
                    participants: [
                        {
                            id: 'part-1',
                            sharedOrderId: 'shared-1',
                            customerId: 'cust-1',
                            customerName: 'Maria Silva',
                            items: [],
                            subtotal: 850.00,
                            paymentStatus: 'paid',
                            paidAt: new Date().toISOString()
                        },
                        {
                            id: 'part-2',
                            sharedOrderId: 'shared-1',
                            customerId: 'cust-2',
                            customerName: 'João Santos',
                            items: [],
                            subtotal: 1200.00,
                            paymentStatus: 'paid',
                            paidAt: new Date().toISOString()
                        },
                        {
                            id: 'part-3',
                            sharedOrderId: 'shared-1',
                            customerId: 'cust-3',
                            customerName: 'Pedro Costa',
                            items: [],
                            subtotal: 400.00,
                            paymentStatus: 'pending'
                        }
                    ],
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
                    shareLink: `${window.location.origin}/shared-order/shared-1`
                }
            ];
            
            setOrders(mockOrders);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(''), 2000);
    };

    const getStatusBadge = (status: SharedOrder['status']) => {
        const statusConfig = {
            pending: { label: 'Pendente', color: 'bg-gray-500' },
            collecting: { label: 'Coletando Pedidos', color: 'bg-blue-500' },
            ready: { label: 'Pronto', color: 'bg-green-500' },
            completed: { label: 'Concluído', color: 'bg-green-700' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`${config.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                {config.label}
            </span>
        );
    };

    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date().getTime();
        const expires = new Date(expiresAt).getTime();
        const diff = expires - now;
        
        if (diff <= 0) return 'Expirado';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <SpinnerIcon className="w-12 h-12 text-[rgb(var(--color-brand-gold))] mx-auto mb-4"/>
                    <p className="text-[rgb(var(--color-brand-text-dim))]">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--color-brand-text-light))] mb-2">
                        Meus Pedidos Compartilhados
                    </h1>
                    <p className="text-[rgb(var(--color-brand-text-dim))]">
                        Gerencie seus pedidos de equipe
                    </p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-6 rounded-md hover:bg-gold-400 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Novo Pedido Compartilhado
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-12 text-center">
                    <UserGroupIcon className="w-16 h-16 text-[rgb(var(--color-brand-text-dim))] mx-auto mb-4"/>
                    <h2 className="text-xl font-bold text-[rgb(var(--color-brand-text-light))] mb-2">
                        Nenhum pedido compartilhado ainda
                    </h2>
                    <p className="text-[rgb(var(--color-brand-text-dim))] mb-6">
                        Crie seu primeiro pedido de equipe e compartilhe com sua rede
                    </p>
                    <button
                        onClick={onCreateNew}
                        className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-6 rounded-md hover:bg-gold-400"
                    >
                        Criar Pedido Compartilhado
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map(order => {
                        const paidParticipants = order.participants.filter(p => p.paymentStatus === 'paid').length;
                        const totalParticipants = order.participants.length;
                        
                        return (
                            <div key={order.id} className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6 border-2 border-[rgb(var(--color-brand-gray-light))] hover:border-[rgb(var(--color-brand-gold))] transition-colors">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <UserGroupIcon className="w-8 h-8 text-[rgb(var(--color-brand-gold))]"/>
                                        <div>
                                            <h3 className="font-bold text-[rgb(var(--color-brand-text-light))]">
                                                Pedido #{order.id.slice(0, 8).toUpperCase()}
                                            </h3>
                                            <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">
                                                Criado {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                {/* Endereço */}
                                <div className="bg-[rgb(var(--color-brand-dark))] rounded-lg p-3 mb-4">
                                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))] mb-1">Entrega:</p>
                                    <p className="text-sm text-[rgb(var(--color-brand-text-light))]">
                                        {order.deliveryAddress.city}/{order.deliveryAddress.state}
                                    </p>
                                </div>

                                {/* Participantes */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold">Participantes:</span>
                                        <span className="text-sm text-[rgb(var(--color-brand-gold))]">
                                            {paidParticipants}/{totalParticipants} pagos
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {order.participants.slice(0, 3).map(participant => (
                                            <div key={participant.id} className="flex items-center justify-between text-sm">
                                                <span className="text-[rgb(var(--color-brand-text-dim))]">
                                                    {participant.customerName}
                                                </span>
                                                {participant.paymentStatus === 'paid' ? (
                                                    <CheckCircleIcon className="w-4 h-4 text-green-400"/>
                                                ) : (
                                                    <ClockIcon className="w-4 h-4 text-gold-400"/>
                                                )}
                                            </div>
                                        ))}
                                        {totalParticipants > 3 && (
                                            <p className="text-xs text-[rgb(var(--color-brand-text-dim))] italic">
                                                +{totalParticipants - 3} mais
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between py-3 border-t border-[rgb(var(--color-brand-gray-light))] mb-4">
                                    <span className="font-semibold">Total do Pedido:</span>
                                    <span className="text-xl font-bold text-[rgb(var(--color-brand-gold))]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                                    </span>
                                </div>

                                {/* Tempo Restante */}
                                <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-brand-text-dim))] mb-4">
                                    <ClockIcon className="w-4 h-4"/>
                                    <span>Expira em: {getTimeRemaining(order.expiresAt)}</span>
                                </div>

                                {/* Ações */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleCopyLink(order.shareLink)}
                                        className="bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))] font-semibold py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] flex items-center justify-center gap-2"
                                    >
                                        {copiedLink === order.shareLink ? (
                                            <>
                                                <ClipboardDocumentCheckIcon className="w-4 h-4"/>
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <CopyIcon className="w-4 h-4"/>
                                                Copiar Link
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => onViewDetails(order.id)}
                                        className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-semibold py-2 px-4 rounded-md hover:bg-gold-400"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SharedOrderList;
