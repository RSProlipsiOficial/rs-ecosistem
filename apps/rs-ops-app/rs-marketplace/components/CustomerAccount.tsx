
import React, { useState } from 'react';
import { Customer, Order, View, PaymentStatus, FulfillmentStatus } from '../types';
import { UserIcon } from './icons/UserIcon';
import { OrdersIcon } from './icons/OrdersIcon';

interface CustomerAccountProps {
    customer: Customer;
    orders: Order[];
    onNavigate: (view: View, data?: any) => void;
}

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center";
    const colorClasses = {
        'Pago': 'bg-green-500/20 text-green-300', 'Pendente': 'bg-gold-500/20 text-yellow-300',
        'Reembolsado': 'bg-gray-500/20 text-gray-300', 'Parcialmente Pago': 'bg-cyan-500/20 text-cyan-300',
        'Cancelado': 'bg-red-500/20 text-red-300',
    };
    return (<span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>);
};

const FulfillmentStatusBadge = ({ status }: { status: FulfillmentStatus }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center";
    const colorClasses = { 'Realizado': 'bg-green-500/20 text-green-300', 'Não Realizado': 'bg-orange-500/20 text-orange-300', 'Parcial': 'bg-purple-500/20 text-purple-300' };
    return (<span className={`${baseClasses} ${colorClasses[status]}`}>{status}</span>);
};

const CustomerAccount: React.FC<CustomerAccountProps> = ({ customer, orders, onNavigate }) => {
    const customerOrders = orders.filter(o => o.customerId === customer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const [activeTab, setActiveTab] = useState('orders');

    const renderOrderHistory = () => (
        <div className="bg-dark-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Histórico de Pedidos</h2>
            {customerOrders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-black/30">
                            <tr>
                                <th className="px-4 py-3">Pedido</th>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3">Pagamento</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {customerOrders.map(order => (
                                <tr key={order.id} className="hover:bg-dark-800/50">
                                    <td className="px-4 py-3 font-medium text-gold-400">{order.id}</td>
                                    <td className="px-4 py-3">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</td>
                                    <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                                    <td className="px-4 py-3"><FulfillmentStatusBadge status={order.fulfillmentStatus} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>Você ainda não fez nenhum pedido.</p>
            )}
        </div>
    );

    const renderProfile = () => (
         <div className="bg-dark-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Meus Dados</h2>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm text-gray-400">Nome Completo</label>
                    <p className="text-white p-2 bg-dark-800 rounded-md mt-1">{customer.name}</p>
                </div>
                 <div>
                    <label className="text-sm text-gray-400">E-mail</label>
                    <p className="text-white p-2 bg-dark-800 rounded-md mt-1">{customer.email}</p>
                </div>
                <button className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">Alterar Senha</button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-8">Minha Conta</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <div className="bg-dark-900 p-4 rounded-lg sticky top-24">
                        <div className="text-center mb-4">
                           <UserIcon className="w-16 h-16 mx-auto text-gold-400 bg-dark-800 p-3 rounded-full" />
                           <h2 className="mt-2 text-xl font-bold text-white truncate">{customer.name}</h2>
                           <p className="text-sm text-gray-400 truncate">{customer.email}</p>
                        </div>
                         <nav className="space-y-2">
                             <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-semibold transition-colors ${activeTab === 'orders' ? 'bg-gold-500/10 text-gold-400' : 'text-gray-300 hover:bg-dark-800'}`}>
                                <OrdersIcon className="w-5 h-5"/>
                                Histórico de Pedidos
                             </button>
                              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-semibold transition-colors ${activeTab === 'profile' ? 'bg-gold-500/10 text-gold-400' : 'text-gray-300 hover:bg-dark-800'}`}>
                                <UserIcon className="w-5 h-5"/>
                                Meus Dados
                             </button>
                         </nav>
                    </div>
                </aside>
                <main className="md:col-span-3">
                    {activeTab === 'orders' && renderOrderHistory()}
                    {activeTab === 'profile' && renderProfile()}
                </main>
            </div>
        </div>
    );
};

export default CustomerAccount;
