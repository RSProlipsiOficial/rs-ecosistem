

import React, { useMemo, useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { LedgerEntry, LedgerEventType, LedgerState } from '../types';
import { MOCK_LEDGER_ENTRIES, typeLabels } from '../constants';
import Modal from '../components/Modal';
import ComingSoonModal from '../components/ComingSoonModal';
import { walletAPI } from '../src/services/api';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-border/50 text-sm items-center">
        <span className="text-text-soft capitalize">{label}</span>
        <span className="font-semibold text-text-title text-right">{value || 'N/A'}</span>
    </div>
);

const Transactions: React.FC = () => {
    const [filter, setFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
    const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiTransactions, setApiTransactions] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        const loadTransactions = async () => {            try {
                setLoading(true);
                const userId = localStorage.getItem('userId') || 'demo-user';
                const response = await walletAPI.getTransactions(userId);
                
                if (response?.data?.success) {
                    setApiTransactions(response.data.transactions);
                }
            } catch (error) {
                console.error('Erro ao carregar transações:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadTransactions();
    }, []);

    const handleOpenModal = (entry: LedgerEntry) => setSelectedEntry(entry);
    const handleCloseModal = () => setSelectedEntry(null);
    
    const handleClearFilters = () => {
        setFilter('');
        setStartDate('');
        setEndDate('');
        setSelectedType('');
    };

    const columns = useMemo(() => [
        {
            header: 'Data',
            accessor: 'occurredAt',
            render: (item: LedgerEntry) => (
                <div className="text-sm">
                    <p className="text-text-title font-medium">{new Date(item.occurredAt).toLocaleDateString('pt-BR')}</p>
                    <p className="text-text-body">{new Date(item.occurredAt).toLocaleTimeString('pt-BR')}</p>
                </div>
            )
        },
        {
            header: 'Descrição',
            accessor: 'description',
            render: (item: LedgerEntry) => {
                let subtext = `Ref: ${item.refId}`;
                if ((item.type === LedgerEventType.COMMISSION_SHOP || item.type === LedgerEventType.COMMISSION_REFERRAL) && item.details) {
                    const detailsParts = [];
                    if (item.details.produto) detailsParts.push(`Produto: ${item.details.produto}`);
                    if (item.details.cliente) detailsParts.push(`Cliente: ${item.details.cliente}`);
                    if (detailsParts.length > 0) {
                        subtext = detailsParts.join(' | ');
                    }
                } else if (item.type === LedgerEventType.TRANSFER && item.details?.destinatario) {
                    subtext = `Destinatário: ${item.details.destinatario}`;
                }
                return (
                    <div>
                        <p className="font-semibold text-text-title">{item.description}</p>
                        <p className="text-xs text-text-body">{subtext}</p>
                    </div>
                )
            }
        },
        {
            header: 'Tipo',
            accessor: 'type',
            render: (item: LedgerEntry) => <span className="text-sm text-text-body">{typeLabels[item.type]}</span>
        },
        {
            header: 'Valor',
            accessor: 'amount',
            render: (item: LedgerEntry) => <span className={`font-semibold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.amount)}</span>
        },
        {
            header: 'Status',
            accessor: 'state',
            render: (item: LedgerEntry) => <StatusBadge status={item.state} />
        },
    ], []);

    const sourceData = apiTransactions.length > 0 ? apiTransactions : (import.meta.env.DEV ? MOCK_LEDGER_ENTRIES : []);
    const filteredData = sourceData.filter(entry => {
        const filterLower = filter.toLowerCase();
        
        // Text filter
        const textMatch = !filterLower ? true : (
            entry.description.toLowerCase().includes(filterLower) ||
            entry.refId.toLowerCase().includes(filterLower) ||
            (entry.details?.destinatario || '').toLowerCase().includes(filterLower) ||
            (entry.details?.cliente || '').toLowerCase().includes(filterLower)
        );

        // Type filter
        const typeMatch = selectedType ? entry.type === selectedType : true;

        // Date filter
        const entryDate = new Date(entry.occurredAt);
        const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

        const dateMatch = (!start || entryDate >= start) && (!end || entryDate <= end);

        return textMatch && typeMatch && dateMatch;
    });

    const renderModalContent = () => {
        if (!selectedEntry) return null;
        
        const details = selectedEntry.details || {};
        const isPendingWithdrawal = selectedEntry.type === LedgerEventType.WITHDRAWAL && selectedEntry.state === LedgerState.PENDING;


        return (
            <div>
                <div className="space-y-3">
                    {isPendingWithdrawal && (
                        <div className="bg-warning/10 border border-warning/20 text-warning text-sm rounded-lg p-4 mb-4 text-center">
                            <p className="font-bold">Solicitação de Saque em Processamento</p>
                            <p className="mt-1">Esta solicitação ainda não foi paga. O valor será creditado na chave PIX informada assim que a transação for concluída.</p>
                        </div>
                    )}
                    <DetailRow label="Descrição" value={selectedEntry.description} />
                    <DetailRow label="Data da Solicitação" value={new Date(selectedEntry.occurredAt).toLocaleString('pt-BR')} />
                    <DetailRow label="Valor" value={formatCurrency(selectedEntry.amount)} />
                    {selectedEntry.fee > 0 && <DetailRow label="Taxa" value={formatCurrency(selectedEntry.fee)} />}
                    {selectedEntry.fee > 0 && <DetailRow label="Líquido" value={formatCurrency(selectedEntry.amount - selectedEntry.fee)} />}
                    <DetailRow label="Status" value={<StatusBadge status={selectedEntry.state} />} />
                    <DetailRow label="Referência" value={selectedEntry.refId} />
                    
                    {Object.keys(details).length > 0 && <hr className="border-border/50 my-3" />}
                    
                    {Object.keys(details).length > 0 && <h4 className="font-bold text-text-title mb-2">Detalhes Adicionais</h4>}

                    {Object.entries(details).map(([key, value]) => (
                        <DetailRow key={key} label={key} value={value} />
                    ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <button onClick={() => setComingSoonFeature(`Comprovante ${selectedEntry.refId}`)} className="flex-1 text-center py-2 px-4 bg-surface text-text-body hover:bg-border border border-border font-semibold rounded-lg transition-colors">
                        Ver Comprovante
                    </button>
                    <button onClick={() => setComingSoonFeature(`Suporte para ${selectedEntry.refId}`)} className="flex-1 text-center py-2 px-4 bg-surface text-text-body hover:bg-border border border-border font-semibold rounded-lg transition-colors">
                        Relatar Problema
                    </button>
                </div>
            </div>
        );
    };
    
    const formElementClass = "w-full px-3 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Extrato de Transações</h1>
                <p className="text-text-body mt-1">Veja o histórico completo de movimentações da sua conta.</p>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-grow" style={{ minWidth: '250px' }}>
                        <label className="text-xs text-text-soft mb-1 block">Buscar</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Descrição, Ref ID, nome..."
                                className={`${formElementClass} pl-10`}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-grow" style={{ minWidth: '180px' }}>
                         <label className="text-xs text-text-soft mb-1 block">Tipo</label>
                         <select className={formElementClass} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                            <option value="">Todos os Tipos</option>
                            {Object.entries(typeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                         </select>
                    </div>
                    <div className="flex-grow" style={{ minWidth: '130px' }}>
                         <label className="text-xs text-text-soft mb-1 block">De</label>
                         <input type="date" className={formElementClass} value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                     <div className="flex-grow" style={{ minWidth: '130px' }}>
                         <label className="text-xs text-text-soft mb-1 block">Até</label>
                         <input type="date" className={formElementClass} value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-border border border-border transition-colors">
                        Limpar Filtros
                    </button>
                    <button onClick={() => setComingSoonFeature('Exportar Extrato')} className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-border border border-border transition-colors">
                        Exportar
                    </button>
                </div>
            </div>

    <DataTable columns={columns} data={filteredData} onRowClick={handleOpenModal} />
            
            <Modal isOpen={!!selectedEntry} onClose={handleCloseModal} title="Detalhes da Transação">
                {renderModalContent()}
            </Modal>
            <ComingSoonModal isOpen={!!comingSoonFeature} onClose={() => setComingSoonFeature(null)} featureName={comingSoonFeature || ''} />
        </div>
    );
};

export default Transactions;
