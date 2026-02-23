import React, { useState } from 'react';
import Card from '../../components/Card';
import { IconActive } from '../../components/icons';

const Transferir: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2500);
    }

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-6">Transferir Saldo</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">ID do Consultor de Destino</label>
                        <input type="text" placeholder="Ex: user-02" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Valor da Transferência</label>
                        <input type="number" step="0.01" placeholder="R$ 0,00" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                    </div>
                     <button type="submit" className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${status === 'success' ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                       {status === 'success' ? <><IconActive className="mr-2"/> Transferido com Sucesso!</> : 'Confirmar Transferência'}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default Transferir;
