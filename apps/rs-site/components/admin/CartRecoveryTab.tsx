import React from 'react';
import { useAbandonedCart } from '../../context/AbandonedCartContext';
import { AbandonedCart } from '../../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (isoString: string) => new Date(isoString).toLocaleString('pt-BR');

const CartRecoveryTab: React.FC = () => {
    const { abandonedCarts, updateCartStatus } = useAbandonedCart();

    const getStatusChip = (status: AbandonedCart['recoveryStatus']) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">Pendente</span>;
            case 'sent':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">E-mail Enviado</span>;
            case 'recovered':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">Recuperado</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-accent">Recuperação de Carrinhos</h2>
                <p className="text-text-secondary mt-1">Visualize e gerencie carrinhos abandonados para recuperar vendas perdidas.</p>
            </div>

            <div className="bg-surface rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="bg-gray-800/50 text-xs text-text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="p-3 pl-4">Cliente (Email)</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3">Visto por Último</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 pr-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {abandonedCarts.map(cart => (
                            <tr key={cart.id} className="border-t border-border">
                                <td className="p-3 pl-4 font-semibold text-text-primary">{cart.customerEmail}</td>
                                <td className="p-3 text-text-secondary">{formatCurrency(cart.cartValue)}</td>
                                <td className="p-3 text-text-secondary">{formatDate(cart.lastSeen)}</td>
                                <td className="p-3">{getStatusChip(cart.recoveryStatus)}</td>
                                <td className="p-3 pr-4">
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => updateCartStatus(cart.id, 'sent')} 
                                            disabled={cart.recoveryStatus !== 'pending'}
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Enviar E-mail
                                        </button>
                                         <button 
                                            onClick={() => updateCartStatus(cart.id, 'recovered')} 
                                            disabled={cart.recoveryStatus === 'recovered'}
                                            className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md disabled:opacity-50"
                                        >
                                            Marcar como Recuperado
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {abandonedCarts.length === 0 && (
                    <div className="text-center p-8 text-text-secondary">
                        Nenhum carrinho abandonado registrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartRecoveryTab;
