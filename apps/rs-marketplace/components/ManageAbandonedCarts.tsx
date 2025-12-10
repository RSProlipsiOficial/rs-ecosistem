import React from 'react';
import { AbandonedCart } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ManageAbandonedCartsProps {
    carts: AbandonedCart[];
}

const RecoveryStatusBadge: React.FC<{ status: AbandonedCart['recoveryStatus'] }> = ({ status }) => {
    const config = {
        'Não enviado': 'bg-gray-500/20 text-gray-300',
        'Enviado': 'bg-blue-500/20 text-blue-300',
        'Recuperado': 'bg-green-500/20 text-green-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config[status]}`}>{status}</span>;
};

const ManageAbandonedCarts: React.FC<ManageAbandonedCartsProps> = ({ carts }) => {
    
    const totalValue = carts.reduce((sum, cart) => sum + cart.total, 0);

    const handleSendRecovery = (email: string) => {
        alert(`Simulação: E-mail de recuperação enviado para ${email}.`);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black border border-dark-800 rounded-lg p-6 flex items-center gap-4">
                    <ShoppingCartIcon className="w-8 h-8 text-gold-400" />
                    <div>
                        <h4 className="text-gray-400">Carrinhos Abandonados</h4>
                        <p className="text-2xl font-bold text-white">{carts.length}</p>
                    </div>
                </div>
                <div className="bg-black border border-dark-800 rounded-lg p-6 flex items-center gap-4">
                    <CheckCircleIcon className="w-8 h-8 text-gold-400" />
                    <div>
                        <h4 className="text-gray-400">Valor Total Abandonado</h4>
                        <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-black border border-dark-800 rounded-lg">
                <div className="p-4 border-b border-dark-800">
                    <h3 className="text-lg font-semibold text-white">Lista de Carrinhos</h3>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-black">
                             <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Itens</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                                <th className="px-6 py-3">Status Recuperação</th>
                                <th className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carts.map(cart => (
                                <tr key={cart.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{cart.customerName}</p>
                                        <p className="text-xs text-gray-500">{cart.customerEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">{new Date(cart.abandonedAt).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <ul className="text-xs">
                                            {cart.items.map(item => <li key={item.id}>- {item.name} (x{item.quantity})</li>)}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-white">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(cart.total)}</td>
                                    <td className="px-6 py-4"><RecoveryStatusBadge status={cart.recoveryStatus} /></td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleSendRecovery(cart.customerEmail)} className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed" title="Enviar e-mail de recuperação" disabled={cart.recoveryStatus !== 'Não enviado'}>
                                            <EnvelopeIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageAbandonedCarts;
