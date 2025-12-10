import React, { useState, useMemo, useEffect } from 'react';
import { Order, View, Product, PaymentSettings } from '../types';
import { WalletIcon } from './icons/WalletIcon';
import { DistributionIcon } from './icons/DistributionIcon';
import { AffiliateIcon } from './icons/AffiliateIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';

// Mock data for transfers history
const mockTransfers = [
    { id: 'TR-001', date: '2024-07-27T10:00:00Z', amount: 2500.00, status: 'Concluída', destination: 'PIX: a1b2...cdef' },
    { id: 'TR-002', date: '2024-07-20T15:30:00Z', amount: 1850.50, status: 'Concluída', destination: 'PIX: a1b2...cdef' },
    { id: 'TR-003', date: '2024-07-29T09:00:00Z', amount: 1250.75, status: 'Pendente', destination: 'PIX: a1b2...cdef' },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

type Commission = {
    id: string;
    type: 'Comissão Dropshipping' | 'Bônus Afiliado';
    date: string;
    orderId: string;
    productName: string;
    customerName: string;
    amount: number;
    order: Order; // for navigation
};

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<any> }> = ({ title, value, icon: Icon }) => (
    <div className="bg-black border border-dark-800 rounded-lg p-6">
        <div className="flex items-center gap-4">
            <Icon className="w-8 h-8 text-gold-400" />
            <div>
                <h4 className="text-gray-400">{title}</h4>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);

const BalancesTab: React.FC<{ orders: Order[]; products: Product[]; onNavigate: (view: View, data?: any) => void }> = ({ orders, products, onNavigate }) => {
    
    const commissions: Commission[] = useMemo(() => {
        return orders
            .filter(o => o.paymentStatus === 'Pago')
            .flatMap(order => 
                order.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const isDropshipping = product?.type === 'Dropshipping';
                    // Mock commission rates
                    const commissionRate = isDropshipping ? 0.15 : 0.10;
                    // FIX: Explicitly type the commission type to satisfy the Commission interface
                    const commissionType: 'Comissão Dropshipping' | 'Bônus Afiliado' = isDropshipping ? 'Comissão Dropshipping' : 'Bônus Afiliado';
                    return {
                        id: `${order.id}-item-${index}`,
                        type: commissionType,
                        date: order.date,
                        orderId: order.id,
                        productName: item.productName,
                        customerName: order.customerName,
                        amount: item.price * item.quantity * commissionRate,
                        order: order,
                    };
                })
            ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, products]);

    const dropshipBalance = commissions.filter(c => c.type === 'Comissão Dropshipping').reduce((sum, c) => sum + c.amount, 0);
    const affiliateBalance = commissions.filter(c => c.type === 'Bônus Afiliado').reduce((sum, c) => sum + c.amount, 0);
    const totalBalance = dropshipBalance + affiliateBalance;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Saldo Acumulado Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)} icon={WalletIcon} />
                <StatCard title="Saldo Dropshipping" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dropshipBalance)} icon={DistributionIcon} />
                <StatCard title="Bônus de Afiliado" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(affiliateBalance)} icon={AffiliateIcon} />
            </div>
            <div className="bg-black border border-dark-800 rounded-lg">
                 <h3 className="text-lg font-semibold text-white p-4 border-b border-dark-800">Origem dos Saldos</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-black">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Origem (Produto / Pedido)</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3 text-right">Valor da Comissão</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.map(c => (
                                <tr key={c.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                    <td className="px-6 py-4">{new Date(c.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{c.type}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{c.productName}</p>
                                        <button onClick={() => onNavigate('orderDetail', c.order)} className="text-xs text-gold-400 hover:underline">{c.orderId}</button>
                                    </td>
                                    <td className="px-6 py-4">{c.customerName}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-green-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

const TransfersTab: React.FC<{onNavigate: (view: View) => void; paymentSettings: PaymentSettings}> = ({onNavigate, paymentSettings}) => {
    
    const [amount, setAmount] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');

    const availableDestinations = useMemo(() => {
        const destinations: { label: string; value: string }[] = [];
        if (paymentSettings.pix.enabled && paymentSettings.pix.pixKey) {
            destinations.push({
                label: `PIX (${paymentSettings.pix.pixKeyType}): ${paymentSettings.pix.pixKey}`,
                value: paymentSettings.pix.pixKey,
            });
        }
        if (paymentSettings.pagSeguro.enabled && paymentSettings.pagSeguro.email) {
            destinations.push({
                label: `PagSeguro (E-mail): ${paymentSettings.pagSeguro.email}`,
                value: paymentSettings.pagSeguro.email,
            });
        }
        return destinations;
    }, [paymentSettings]);

    useEffect(() => {
        if (availableDestinations.length > 0 && !selectedDestination) {
            setSelectedDestination(availableDestinations[0].value);
        }
    }, [availableDestinations, selectedDestination]);

    const handleTransfer = () => {
        if (!amount || Number(amount) <= 0) {
            alert("Por favor, insira um valor válido para a transferência.");
            return;
        }
        if (!selectedDestination) {
            alert("Por favor, selecione uma chave de destino.");
            return;
        }
        alert(`Solicitação de transferência de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(amount))} para "${selectedDestination}" enviada com sucesso!`);
        setAmount('');
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-black border border-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Solicitar Transferência</h3>
                <div className="space-y-4">
                     {availableDestinations.length > 0 ? (
                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-400 mb-2">Chave de Destino</label>
                             <select 
                                id="destination"
                                value={selectedDestination}
                                onChange={e => setSelectedDestination(e.target.value)}
                                className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500"
                            >
                                {availableDestinations.map(dest => (
                                    <option key={dest.value} value={dest.value}>{dest.label}</option>
                                ))}
                            </select>
                        </div>
                     ) : (
                         <div className="text-center p-4 bg-dark-800/50 rounded-md border border-dashed border-dark-700">
                            <p className="text-gray-400">Nenhuma chave de transferência configurada.</p>
                            <button onClick={() => onNavigate('walletSettings')} className="text-sm font-semibold text-gold-500 hover:underline mt-2">
                                Configurar chaves de pagamento
                            </button>
                        </div>
                     )}
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-2">Valor</label>
                         <input 
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="R$ 0,00"
                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white"
                            disabled={availableDestinations.length === 0}
                        />
                    </div>
                    <div className="text-right">
                        <button 
                            onClick={handleTransfer} 
                            className="font-bold bg-gold-500 text-black py-2 px-6 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={availableDestinations.length === 0}
                        >
                            Solicitar
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-black border border-dark-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white p-4 border-b border-dark-800">Histórico de Transferências</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-black">
                             <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Destino</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                         <tbody>
                            {mockTransfers.map(t => (
                                <tr key={t.id} className="border-b border-dark-800">
                                    <td className="px-6 py-4">{new Date(t.date).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-mono">{t.destination}</td>
                                    <td className="px-6 py-4">{t.status}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-red-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface WalletTransfersProps {
    orders: Order[];
    products: Product[];
    onNavigate: (view: View, data?: any) => void;
    paymentSettings: PaymentSettings;
}

const WalletTransfers: React.FC<WalletTransfersProps> = ({ orders, products, onNavigate, paymentSettings }) => {
    const [activeTab, setActiveTab] = useState<'balances' | 'transfers'>('balances');
    
    return (
        <div className="space-y-6">
            <div>
                <div className="border-b border-dark-800">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('balances')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'balances' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-dark-700'}`}
                        >
                            Saldos
                        </button>
                        <button
                            onClick={() => setActiveTab('transfers')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transfers' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-dark-700'}`}
                        >
                            Transferências
                        </button>
                    </nav>
                </div>
            </div>
            
            {activeTab === 'balances' && <BalancesTab orders={orders} products={products} onNavigate={onNavigate} />}
            {activeTab === 'transfers' && <TransfersTab onNavigate={onNavigate} paymentSettings={paymentSettings} />}
        </div>
    );
};

export default WalletTransfers;