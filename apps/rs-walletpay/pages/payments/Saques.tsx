
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_LEDGER_ENTRIES, MOCK_PIX_KEYS } from '../../constants';
import { LedgerEntry, LedgerEventType } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { walletAPI } from '../../src/services/api';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const formatCurrencyForInput = (value: string) => {
  const onlyDigits = value.replace(/\D/g, '');
  if (!onlyDigits) return '';
  const numberValue = parseInt(onlyDigits, 10) / 100;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const parseCurrency = (value: string) => {
  return value.replace(/\D/g, '');
};

const Saques: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState<string | null>(null);
    const [selectedKey, setSelectedKey] = useState('');
    const [modal, setModal] = useState<{ isOpen: boolean; content: 'success' | 'addKey' | null }>({ isOpen: false, content: null });
    const [loading, setLoading] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [pixKeys, setPixKeys] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userId = localStorage.getItem('userId') || 'demo-user';
                
                const [balanceRes, pixRes, withdrawalsRes] = await Promise.all([
                    walletAPI.getBalance(userId).catch(() => null),
                    walletAPI.listPixKeys(userId).catch(() => null),
                    walletAPI.getWithdrawals(userId).catch(() => null)
                ]);
                
                if (balanceRes?.data?.success) {
                    setAvailableBalance(balanceRes.data.balance.available * 100);
                }
                
                if (pixRes?.data?.success) {
                    setPixKeys(pixRes.data.pix_keys || []);
                } else {
                    setPixKeys(import.meta.env.DEV ? MOCK_PIX_KEYS : []);
                }
                
                if (withdrawalsRes?.data?.success) {
                    setWithdrawals(withdrawalsRes.data.withdrawals);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setPixKeys(import.meta.env.DEV ? MOCK_PIX_KEYS : []);
            }
        };
        
        loadData();
    }, []);

    const withdrawalHistory = useMemo(() =>
        withdrawals
          .filter(entry => entry.type === LedgerEventType.WITHDRAWAL || (entry.type === LedgerEventType.FEES && (entry.description || '').includes('Saque')))
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    , [withdrawals]);
    
    useEffect(() => {
        if (!amount) {
            setAmountError(null);
            return;
        }
        const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
        if (numericAmount > availableBalance) {
            setAmountError('Saldo insuficiente para o valor solicitado.');
        } else {
            setAmountError(null);
        }
    }, [amount, availableBalance]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amountError) return;

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
            
            const response = await walletAPI.requestWithdraw({
                user_id: userId,
                amount: numericAmount,
                method: 'pix',
                pix_key: selectedKey
            });
            
            if (response?.data?.success) {
                setModal({ isOpen: true, content: 'success' });
                setAmount('');
                setSelectedKey('');
                // Recarregar lista de saques
                const withdrawalsRes = await walletAPI.getWithdrawals(userId);
                if (withdrawalsRes?.data?.success) {
                    setWithdrawals(withdrawalsRes.data.withdrawals);
                }
            } else {
                alert('Erro ao solicitar saque');
            }
        } catch (error) {
            console.error('Erro ao solicitar saque:', error);
            alert('Erro ao solicitar saque. Tente novamente.');
        } finally {
            setLoading(false);
        }
        setAmount('');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Withdrawal Form */}
                <div className="lg:col-span-2 bg-card p-6 sm:p-8 rounded-2xl border border-border">
                    <h2 className="text-xl font-bold text-text-title">Solicitar Saque</h2>
                    <p className="text-text-soft mt-1">O valor será enviado para a chave PIX selecionada.</p>
                    
                    <div className="my-6 bg-surface p-4 rounded-lg border border-border">
                        <p className="text-sm text-text-soft">Saldo disponível para saque</p>
                        <p className="text-3xl font-bold text-gold">{formatCurrency(availableBalance)}</p>
                    </div>

                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-text-body mb-2">Valor do saque</label>
                            <input
                                type="text" id="amount" value={amount ? formatCurrencyForInput(amount) : ''}
                                onChange={e => setAmount(parseCurrency(e.target.value))}
                                placeholder="R$ 0,00"
                                className={`w-full px-4 py-3 rounded-lg bg-surface border focus:outline-none focus:ring-2 transition-colors ${
                                    amountError 
                                    ? 'border-danger text-danger focus:ring-danger/25' 
                                    : 'border-border focus:ring-gold/25'
                                }`}
                            />
                            {amountError && <p className="text-sm text-danger mt-1">{amountError}</p>}
                        </div>
                        <div>
                            <label htmlFor="pixKey" className="block text-sm font-medium text-text-body mb-2">Chave PIX de destino</label>
                            <select id="pixKey" value={selectedKey} onChange={e => setSelectedKey(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25"
                            >
                                {pixKeys.map((key: any) => <option key={key.id} value={key.id}>{`${String(key.type).toUpperCase()}: ${key.key}`}{key.isPrimary ? ' (Principal)' : ''}</option>)}
                            </select>
                        </div>
                         <button type="submit" disabled={!!amountError} className="w-full text-center py-3 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            Confirmar Saque
                        </button>
                    </form>
                </div>

                {/* Saved Keys */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="text-lg font-bold text-text-title mb-4">Chaves PIX Salvas</h3>
                    <div className="space-y-3 mb-4">
                        {pixKeys.length > 0 ? pixKeys.map((key: any) => (
                            <div key={key.id} className="bg-surface p-3 rounded-lg border border-border text-sm">
                                <p className="font-semibold text-text-body capitalize">{key.type} {key.isPrimary && <span className="text-xs text-gold">(Principal)</span>}</p>
                                <p className="text-text-soft truncate">{key.key}</p>
                            </div>
                        )) : <p className="text-sm text-text-soft text-center py-4">Nenhuma chave cadastrada.</p>}
                    </div>
                     <button onClick={() => setModal({ isOpen: true, content: 'addKey' })} className="w-full text-center py-2 px-4 bg-surface text-text-body hover:bg-border border border-border font-semibold rounded-lg transition-colors">
                        Adicionar Chave
                    </button>
                </div>
            </div>

            {/* History */}
            <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-bold text-text-title mb-4">Histórico de Saques</h3>
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
                            {withdrawalHistory.length > 0 ? withdrawalHistory.map(item => (
                                <tr key={item.seq}>
                                    <td className="py-3 px-3 text-sm">{new Date(item.occurredAt).toLocaleString('pt-BR')}</td>
                                    <td className="py-3 px-3 text-sm">{item.description}</td>
                                    <td className={`py-3 px-3 text-right font-semibold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.amount)}</td>
                                    <td className="py-3 px-3 text-center"><StatusBadge status={item.state} /></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-text-body">Nenhum saque realizado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, content: null})} title={modal.content === 'success' ? 'Sucesso!' : 'Adicionar Chave PIX'}>
                {modal.content === 'success' && (
                    <div className="text-center">
                        <p>Sua solicitação de saque foi enviada e está sendo processada.</p>
                        <button onClick={() => setModal({isOpen: false, content: null})} className="mt-4 w-full text-center py-2 px-4 bg-gold text-card font-semibold rounded-lg">Ok</button>
                    </div>
                )}
                {modal.content === 'addKey' && (
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget as HTMLFormElement;
                        const type = (form.elements.namedItem('type') as HTMLInputElement).value;
                        const key = (form.elements.namedItem('key') as HTMLInputElement).value;
                        try {
                            const userId = localStorage.getItem('userId') || 'demo-user';
                            const res = await walletAPI.createPixKey({ user_id: userId, type, key });
                            if (res?.data?.success) {
                                const list = await walletAPI.listPixKeys(userId);
                                if (list?.data?.success) setPixKeys(list.data.pix_keys || []);
                                setModal({ isOpen: false, content: null });
                            } else {
                                alert('Falha ao criar chave PIX');
                            }
                        } catch (err) {
                            console.error('Erro ao criar chave PIX', err);
                            alert('Erro ao criar chave PIX');
                        }
                    }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-body mb-2">Tipo</label>
                            <select name="type" className="w-full px-4 py-3 rounded-lg bg-surface border border-border">
                                <option value="email">Email</option>
                                <option value="phone">Telefone</option>
                                <option value="random">Chave Aleatória</option>
                                <option value="cpf">CPF</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-body mb-2">Chave</label>
                            <input name="key" className="w-full px-4 py-3 rounded-lg bg-surface border border-border" placeholder="sua-chave" />
                        </div>
                        <button type="submit" className="mt-2 w-full text-center py-2 px-4 bg-gold text-card font-semibold rounded-lg">Salvar</button>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Saques;
