import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { mockWalletTransactions } from '../data';
import { IconActive } from '../../components/icons';
import { useUser } from '../ConsultantLayout';

const Saque: React.FC = () => {
    const { user } = useUser();
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const walletBalance = useMemo(() => mockWalletTransactions.reduce((acc, t) => acc + t.amount, 0), []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2500);
    }

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-6">Solicitar Saque</h2>
             <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-w-md">
                    <div className="p-4 bg-brand-gray rounded-lg">
                        <p className="text-sm text-gray-400">Saldo Disponível para Saque</p>
                        <p className="text-2xl font-bold text-brand-gold">R$ {walletBalance.toFixed(2)}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Valor do Saque</label>
                        <input type="number" step="0.01" placeholder="R$ 0,00" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                    </div>
                     <div className="p-4 bg-brand-gray rounded-lg border-l-4 border-brand-gold/50">
                        <p className="text-sm font-semibold text-white">Destino do Saque (Conta Principal)</p>
                        <p className="text-xs text-gray-300">{user.bankAccount.bank}</p>
                        <p className="text-xs text-gray-400">Ag: {user.bankAccount.agency} / CC: {user.bankAccount.accountNumber}</p>
                        <p className="text-xs text-gray-400 mt-1">Chave PIX: {user.bankAccount.pixKey}</p>
                    </div>
                    <button type="submit" className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${status === 'success' ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                       {status === 'success' ? <><IconActive className="mr-2"/> Solicitação Enviada!</> : 'Confirmar Saque'}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default Saque;