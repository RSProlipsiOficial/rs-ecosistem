import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { adminAPI } from '../src/services/api'; // Importar API Real
import { LedgerEntry, LedgerEventType } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const typeLabels: { [key in LedgerEventType]?: string } = {
    [LedgerEventType.COMMISSION_SHOP]: "Comissão Loja",
    [LedgerEventType.COMMISSION_REFERRAL]: "Comissão Indicação",
    [LedgerEventType.BONUS]: "Bônus",
    [LedgerEventType.PURCHASE]: "Compra",
    [LedgerEventType.WITHDRAWAL]: "Saque",
    [LedgerEventType.TRANSFER]: "Transferência",
    [LedgerEventType.FEES]: "Taxa",
    [LedgerEventType.ADJUSTMENT]: "Ajuste Manual",
    [LedgerEventType.CHARGEBACK]: "Estorno",
    [LedgerEventType.PAYMENT_RECEIVED]: "Pagamento Recebido"
};

const AdminLedger: React.FC = () => {
    const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    // Modal States
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [isDebitModalOpen, setIsDebitModalOpen] = useState(false);

    // Form States
    const [formData, setFormData] = useState({ userId: '', amount: '', description: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllTransactions();
            if (res.data?.success) {
                setTransactions(res.data.transactions);
            }
        } catch (error) {
            console.error("Erro ao buscar transações:", error);
            alert("Erro ao carregar transações. Verifique se você é admin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAction = async (type: 'credit' | 'debit') => {
        if (!formData.userId || !formData.amount) return alert("Preencha ID e Valor");

        setActionLoading(true);
        try {
            const payload = {
                userId: formData.userId,
                amount: Math.round(parseFloat(formData.amount.replace(',', '.')) * 100), // Convert to cents
                description: formData.description
            };

            if (type === 'credit') {
                await adminAPI.creditUser(payload);
                alert("Crédito realizado com sucesso!");
            } else {
                await adminAPI.debitUser(payload);
                alert("Débito realizado com sucesso!");
            }

            setIsCreditModalOpen(false);
            setIsDebitModalOpen(false);
            setFormData({ userId: '', amount: '', description: '' });
            fetchTransactions(); // Refresh list

        } catch (error: any) {
            console.error("Erro na ação:", error);
            alert(error.response?.data?.error || "Erro ao processar ação.");
        } finally {
            setActionLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Usuário',
            accessor: 'user',
            render: (item: any) => (
                <div>
                    <p className="font-bold text-text-title">{item.user?.name || 'Desconhecido'}</p>
                    <p className="text-xs text-text-soft">{item.user?.email || item.user_id}</p>
                </div>
            )
        },
        { header: 'Tipo', accessor: 'type', render: (item: any) => <span className="text-sm text-text-body">{typeLabels[item.type] || item.type}</span> },
        { header: 'Valor', accessor: 'amount', render: (item: any) => <span className={`font-semibold ${item.type === 'debit' || item.amount < 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(item.amount)}</span> },
        { header: 'Descrição', accessor: 'description' },
        { header: 'Data', accessor: 'created_at', render: (item: any) => new Date(item.created_at).toLocaleString('pt-BR') },
    ], []);

    const filteredData = transactions.filter(t =>
        JSON.stringify(t).toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-title">Admin Ledger</h1>
                    <p className="text-text-body">Gestão Global de Saldos</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsCreditModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold">
                        + Crédito Manual
                    </button>
                    <button onClick={() => setIsDebitModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold">
                        - Débito Manual
                    </button>
                </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border">
                <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-text-body"
                />
            </div>

            {loading ? <p>Carregando...</p> : <DataTable columns={columns} data={filteredData} />}

            {/* Modal Crédito */}
            <Modal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} title="Adicionar Crédito">
                <div className="space-y-4">
                    <input className="w-full p-2 bg-surface border border-border rounded" placeholder="ID do Usuário (UUID)" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} />
                    <input className="w-full p-2 bg-surface border border-border rounded" placeholder="Valor (R$)" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                    <input className="w-full p-2 bg-surface border border-border rounded" placeholder="Descrição" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <button onClick={() => handleAction('credit')} disabled={actionLoading} className="w-full bg-green-600 text-white py-2 rounded font-bold">
                        {actionLoading ? 'Processando...' : 'Confirmar Crédito'}
                    </button>
                </div>
            </Modal>

            {/* Modal Débito */}
            <Modal isOpen={isDebitModalOpen} onClose={() => setIsDebitModalOpen(false)} title="Remover Saldo">
                <div className="space-y-4">
                    <input className="w-full p-2 bg-surface border border-border rounded" placeholder="ID do Usuário (UUID)" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} />
                    <input className="w-full p-2 bg-surface border border-border rounded" placeholder="Valor (R$)" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                    <input className="w-full p-2 bg-surface border border-border rounded" placeholder="Descrição" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <button onClick={() => handleAction('debit')} disabled={actionLoading} className="w-full bg-red-600 text-white py-2 rounded font-bold">
                        {actionLoading ? 'Processando...' : 'Confirmar Débito'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminLedger;
