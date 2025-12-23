
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_LEDGER_ENTRIES, MOCK_NETWORK_CONSULTANTS } from '../../constants';
import { LedgerEntry, LedgerEventType } from '../../walletpay-types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { walletAPI } from '../../src/services/api';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const Transferencias: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [note, setNote] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);

    useEffect(() => {
        const loadBalance = async () => {
            try {
                const userId = localStorage.getItem('userId') || 'demo-user';
                const response = await walletAPI.getBalance(userId);
                
                if (response?.data?.success) {
                    setAvailableBalance(response.data.balance.available * 100);
                }
            } catch (error) {
                console.error('Erro ao carregar saldo:', error);
            }
        };
        
        loadBalance();
    }, []);

    useEffect(() => {
        if (recipientId.trim().length >= 6) { // Simple validation
            const found = MOCK_NETWORK_CONSULTANTS.find(c => c.id.toLowerCase() === recipientId.toLowerCase());
            setRecipientName(found ? found.name : 'Consultor não encontrado');
        } else {
            setRecipientName('');
        }
    }, [recipientId]);

    const transferHistory = useMemo(() =>
        MOCK_LEDGER_ENTRIES.filter(entry => entry.type === LedgerEventType.TRANSFER)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    , []);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
        if (!numericAmount || numericAmount <= 0) {
            alert("Valor inválido.");
            return;
        }
        if (numericAmount > availableBalance) {
            alert("Saldo insuficiente.");
            return;
        }
        
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            
            const response = await walletAPI.transfer({
                from_user_id: userId,
                to_user_id: recipientId,
                amount: numericAmount,
                note: note
            });
            
            if (response?.data?.success) {
                setModalOpen(true);
                setAmount('');
                setRecipientId('');
                setNote('');
            } else {
                alert('Erro ao realizar transferência');
            }
        } catch (error) {
            console.error('Erro ao transferir:', error);
            alert('Erro ao realizar transferência. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border">
                <h2 className="text-xl font-bold text-text-title">Transferir Saldo</h2>
                <p className="text-text-soft mt-1">Envie saldo para outro consultor da rede RS Prólipsi.</p>
                
                <div className="my-6 bg-surface p-4 rounded-lg border border-border">
                    <p className="text-sm text-text-soft">Saldo disponível para transferência</p>
                    <p className="text-3xl font-bold text-gold">{formatCurrency(availableBalance)}</p>
                </div>

                <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipientId" className="block text-sm font-medium text-text-body mb-2">ID do Destinatário</label>
                            <input
                                type="text" id="recipientId" value={recipientId}
                                onChange={e => setRecipientId(e.target.value.toUpperCase())}
                                placeholder="RS123456"
                                className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25"
                                required
                            />
                             {recipientName && (
                                <p className={`text-sm mt-2 ${recipientName === 'Consultor não encontrado' ? 'text-danger' : 'text-success'}`}>{recipientName}</p>
                            )}
                        </div>
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-text-body mb-2">Valor</label>
                            <input
                                type="text" id="amount" value={amount}
                                onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                                placeholder="R$ 0,00"
                                className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-text-body mb-2">Observação (opcional)</label>
                        <input type="text" id="note" value={note} onChange={e => setNote(e.target.value)}
                            placeholder="Ex: Adiantamento de comissão"
                            className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25"
                        />
                    </div>
                    <button type="submit" className="w-full text-center py-3 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200">
                        Revisar e Transferir
                    </button>
                </form>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-bold text-text-title mb-4">Histórico de Transferências</h3>
                <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="text-xs text-text-soft uppercase">
                            <tr>
                                <th className="py-2 px-3">Data</th>
                                <th className="py-2 px-3">Descrição</th>
                                <th className="py-2 px-3 text-right">Valor</th>
                                <th className="py-2 px-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                           {transferHistory.length > 0 ? transferHistory.map(item => (
                                <tr key={item.seq}>
                                    <td className="py-3 px-3 text-sm">{new Date(item.occurredAt).toLocaleString('pt-BR')}</td>
                                    <td className="py-3 px-3 text-sm">{item.description}</td>
                                    <td className={`py-3 px-3 text-right font-semibold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.amount)}</td>
                                    <td className="py-3 px-3 text-center"><StatusBadge status={item.state} /></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-text-body">Nenhuma transferência realizada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirmação">
                <div className="text-center">
                    <p>Transferência enviada com sucesso!</p>
                     <button onClick={() => setModalOpen(false)} className="mt-4 w-full text-center py-2 px-4 bg-gold text-card font-semibold rounded-lg">Ok</button>
                </div>
            </Modal>
        </div>
    );
};

export default Transferencias;



