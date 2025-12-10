import React, { useState, useMemo } from 'react';
import { LedgerEntry, LedgerEventType, LedgerState, User } from '../walletpay-types';
// FIX: Corrected import from MOCK_ADMIN_LEDGER_ENTRIES to MOCK_LEDGER_ENTRIES to match exported constant.
import { MOCK_LEDGER_ENTRIES, IconWhatsApp } from '../constants';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ActionMenu from '../components/ActionMenu';
import ComingSoonModal from '../components/ComingSoonModal';

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
    const [filter, setFilter] = useState('');
    const [modal, setModal] = useState<{ isOpen: boolean; content: React.ReactNode; title: string; }>({ isOpen: false, content: null, title: '' });
    const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

    const handleCloseModal = () => setModal({ isOpen: false, content: null, title: '' });

    const handleOpenUserModal = (user: User) => {
        const whatsappLink = user.phoneE164 ? `https://wa.me/${user.phoneE164.replace(/\D/g, '')}` : null;
        setModal({
            isOpen: true,
            title: "Detalhes do Consultor",
            content: (
                <div className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-text-soft">Nome</span>
                            <span className="font-semibold text-text-title">{user.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-text-soft">ID</span>
                            <span className="font-semibold text-text-title">{user.id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-text-soft">Email</span>
                            <span className="font-semibold text-text-title">{user.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-text-soft">Telefone</span>
                            <span className="font-semibold text-text-title">{user.phoneE164 || 'N/A'}</span>
                        </div>
                    </div>
                    {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center text-center py-3 px-6 bg-green-500 text-white text-base hover:bg-green-600 font-semibold rounded-lg transition-colors duration-200">
                           <IconWhatsApp className="w-5 h-5 mr-2" /> Iniciar Conversa
                        </a>
                    )}
                </div>
            )
        })
    };

    const handleOpenStatusModal = (entry: LedgerEntry) => {
        setModal({
            isOpen: true,
            title: "Alterar Status do Pagamento",
            content: (
                <div>
                    <p className="text-text-body mb-4">Alterar status para o lançamento <span className="font-bold text-gold">{entry.refId}</span> de {entry.user?.name}.</p>
                    <div className="space-y-2">
                        {Object.values(LedgerState).map(status => (
                            <label key={status} className="flex items-center p-3 rounded-lg hover:bg-surface cursor-pointer">
                                <input type="radio" name="status" value={status} className="form-radio h-4 w-4 text-gold bg-surface border-border focus:ring-gold" defaultChecked={entry.state === status} />
                                <span className="ml-3 text-text-body">{status}</span>
                            </label>
                        ))}
                    </div>
                    <button onClick={handleCloseModal} className="mt-4 w-full text-center py-2 px-4 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors">Salvar Alterações</button>
                </div>
            )
        })
    };

    const columns = useMemo(() => [
        {
            header: 'Pessoa',
            accessor: 'user',
            render: (item: LedgerEntry) => item.user ? (
                <button onClick={() => handleOpenUserModal(item.user!)} className="font-semibold text-text-title hover:text-gold hover:underline">
                    {item.user.name}
                </button>
            ) : 'N/A'
        },
        { header: 'Tipo', accessor: 'type', render: (item: LedgerEntry) => <span className="text-sm text-text-body">{typeLabels[item.type] || item.type}</span>},
        { header: 'Origem', accessor: 'origin', render: (item: LedgerEntry) => <span className="capitalize">{item.origin}</span>},
        { header: 'Valor', accessor: 'amount', render: (item: LedgerEntry) => <span className={`font-semibold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.amount)}</span>},
        { header: 'Status', accessor: 'state', render: (item: LedgerEntry) => <StatusBadge status={item.state} />},
        { header: 'Referência', accessor: 'refId'},
        { header: 'Data', accessor: 'occurredAt', render: (item: LedgerEntry) => new Date(item.occurredAt).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'})},
        {
            header: 'Ações',
            accessor: 'actions' as keyof LedgerEntry,
            render: (item: LedgerEntry) => (
                <div className="text-right">
                    <ActionMenu actions={[
                        { label: 'Ver Detalhes', onClick: () => item.user && handleOpenUserModal(item.user), disabled: !item.user },
                        { label: 'Contato WhatsApp', onClick: () => item.user?.phoneE164 && window.open(`https://wa.me/${item.user.phoneE164.replace(/\D/g, '')}`, '_blank'), disabled: !item.user?.phoneE164, icon: <IconWhatsApp className="w-4 h-4" /> },
                        { label: 'Alterar Status', onClick: () => handleOpenStatusModal(item) },
                        { label: 'Imprimir', onClick: () => setComingSoonFeature(`Comprovante ${item.refId}`) }
                    ]} />
                </div>
            )
        }
    ], []);

    const filteredData = MOCK_LEDGER_ENTRIES.filter(entry => {
        const search = filter.toLowerCase();
        return (
            entry.user?.name.toLowerCase().includes(search) ||
            entry.refId.toLowerCase().includes(search) ||
            entry.user?.id.toLowerCase().includes(search)
        )
    });

    const totals = useMemo(() => {
        return filteredData.reduce((acc, item) => {
            if (item.amount > 0) acc.credits += item.amount;
            else acc.debits += item.amount;
            acc.fees += item.fee;
            return acc;
        }, { credits: 0, debits: 0, fees: 0 });
    }, [filteredData]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border"><h4 className="text-sm text-text-soft">Total de Créditos</h4><p className="text-2xl font-bold text-success">{formatCurrency(totals.credits)}</p></div>
                <div className="bg-card p-4 rounded-xl border border-border"><h4 className="text-sm text-text-soft">Total de Débitos</h4><p className="text-2xl font-bold text-danger">{formatCurrency(totals.debits)}</p></div>
                <div className="bg-card p-4 rounded-xl border border-border"><h4 className="text-sm text-text-soft">Total de Taxas</h4><p className="text-2xl font-bold text-warning">{formatCurrency(totals.fees)}</p></div>
                <div className="bg-card p-4 rounded-xl border border-border"><h4 className="text-sm text-text-soft">Líquido</h4><p className="text-2xl font-bold text-text-title">{formatCurrency(totals.credits + totals.debits - totals.fees)}</p></div>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border">
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Filtrar por nome, ID ou Ref ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <DataTable columns={columns} data={filteredData} />
            
            <Modal isOpen={modal.isOpen} onClose={handleCloseModal} title={modal.title}>
                {modal.content}
            </Modal>
            <ComingSoonModal isOpen={!!comingSoonFeature} onClose={() => setComingSoonFeature(null)} featureName={comingSoonFeature || ''} />
        </div>
    );
};

export default AdminLedger;


