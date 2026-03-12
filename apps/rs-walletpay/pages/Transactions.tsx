import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { typeLabels } from '../constants';
import { LedgerEntry, LedgerEventType, LedgerState } from '../types';
import { walletAPI } from '../src/services/api';
import { getWalletUserId } from '../src/utils/walletSession';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const toSafeString = (value: unknown) => String(value ?? '').trim();

const toCsvValue = (value: unknown) => `"${toSafeString(value).replace(/"/g, '""')}"`;

const downloadFile = (fileName: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
};

const buildReceiptContent = (entry: LedgerEntry) => {
    const detailLines = Object.entries(entry.details || {}).map(([key, value]) => `${key}: ${value}`);

    return [
        'RS WalletPay - Comprovante de Transacao',
        '',
        `Referencia: ${entry.refId}`,
        `Descricao: ${entry.description}`,
        `Tipo: ${typeLabels[entry.type]}`,
        `Status: ${entry.state}`,
        `Data: ${new Date(entry.occurredAt).toLocaleString('pt-BR')}`,
        `Valor bruto: ${formatCurrency(entry.amount)}`,
        `Taxa: ${formatCurrency(entry.fee || 0)}`,
        `Valor liquido: ${formatCurrency(entry.amount - (entry.fee || 0))}`,
        ...(detailLines.length ? ['', 'Detalhes adicionais:', ...detailLines] : []),
    ].join('\n');
};

const buildSupportPayload = (entry: LedgerEntry) => {
    const details = entry.details || {};

    return [
        'Solicitacao de suporte - RS WalletPay',
        '',
        `Referencia: ${entry.refId}`,
        `Descricao: ${entry.description}`,
        `Tipo: ${typeLabels[entry.type]}`,
        `Status: ${entry.state}`,
        `Data: ${new Date(entry.occurredAt).toLocaleString('pt-BR')}`,
        `Valor: ${formatCurrency(entry.amount)}`,
        ...(Object.keys(details).length ? ['', 'Detalhes:', JSON.stringify(details, null, 2)] : []),
    ].join('\n');
};

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
    const [loading, setLoading] = useState(false);
    const [apiTransactions, setApiTransactions] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setLoading(true);
                const userId = getWalletUserId();
                if (!userId) {
                    setApiTransactions([]);
                    return;
                }

                const response = await walletAPI.getTransactions(userId);

                if (response?.data?.success) {
                    setApiTransactions(response.data.transactions);
                }
            } catch (error) {
                console.error('Erro ao carregar transacoes:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, []);

    const handleClearFilters = () => {
        setFilter('');
        setStartDate('');
        setEndDate('');
        setSelectedType('');
    };

    const columns = useMemo(() => [
        {
            header: 'Data',
            accessor: 'occurredAt' as keyof LedgerEntry,
            render: (item: LedgerEntry) => (
                <div className="text-sm">
                    <p className="text-text-title font-medium">{new Date(item.occurredAt).toLocaleDateString('pt-BR')}</p>
                    <p className="text-text-body">{new Date(item.occurredAt).toLocaleTimeString('pt-BR')}</p>
                </div>
            )
        },
        {
            header: 'Descricao',
            accessor: 'description' as keyof LedgerEntry,
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
                    subtext = `Destinatario: ${item.details.destinatario}`;
                }

                return (
                    <div>
                        <p className="font-semibold text-text-title">{item.description}</p>
                        <p className="text-xs text-text-body">{subtext}</p>
                    </div>
                );
            }
        },
        {
            header: 'Tipo',
            accessor: 'type' as keyof LedgerEntry,
            render: (item: LedgerEntry) => <span className="text-sm text-text-body">{typeLabels[item.type]}</span>
        },
        {
            header: 'Valor',
            accessor: 'amount' as keyof LedgerEntry,
            render: (item: LedgerEntry) => (
                <span className={`font-semibold ${item.amount > 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(item.amount)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'state' as keyof LedgerEntry,
            render: (item: LedgerEntry) => <StatusBadge status={item.state} />
        },
    ], []);

    const filteredData = apiTransactions.filter((entry) => {
        const filterLower = filter.toLowerCase();
        const textMatch = !filterLower ? true : (
            entry.description.toLowerCase().includes(filterLower) ||
            entry.refId.toLowerCase().includes(filterLower) ||
            (entry.details?.destinatario || '').toLowerCase().includes(filterLower) ||
            (entry.details?.cliente || '').toLowerCase().includes(filterLower)
        );

        const typeMatch = selectedType ? entry.type === selectedType : true;
        const entryDate = new Date(entry.occurredAt);
        const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
        const dateMatch = (!start || entryDate >= start) && (!end || entryDate <= end);

        return textMatch && typeMatch && dateMatch;
    });

    const handleExport = () => {
        if (!filteredData.length) {
            alert('Nao ha transacoes filtradas para exportar.');
            return;
        }

        const header = [
            'Data',
            'Descricao',
            'Referencia',
            'Tipo',
            'Status',
            'Valor',
            'Taxa',
            'SaldoApos',
        ].join(',');

        const rows = filteredData.map((entry) => ([
            toCsvValue(new Date(entry.occurredAt).toLocaleString('pt-BR')),
            toCsvValue(entry.description),
            toCsvValue(entry.refId),
            toCsvValue(typeLabels[entry.type]),
            toCsvValue(entry.state),
            toCsvValue((entry.amount / 100).toFixed(2)),
            toCsvValue((entry.fee / 100).toFixed(2)),
            toCsvValue((entry.balanceAfter / 100).toFixed(2)),
        ].join(',')));

        downloadFile(
            `extrato-walletpay-${new Date().toISOString().slice(0, 10)}.csv`,
            [header, ...rows].join('\n'),
            'text/csv;charset=utf-8;'
        );
    };

    const handleReceiptDownload = (entry: LedgerEntry) => {
        downloadFile(
            `comprovante-${entry.refId}.txt`,
            buildReceiptContent(entry),
            'text/plain;charset=utf-8;'
        );
    };

    const handleSupportReport = async (entry: LedgerEntry) => {
        const payload = buildSupportPayload(entry);

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(payload);
                alert('Dados da transacao copiados. Encaminhe esse texto para o suporte.');
                return;
            }
        } catch (error) {
            console.warn('Nao foi possivel copiar o protocolo:', error);
        }

        downloadFile(
            `suporte-${entry.refId}.txt`,
            payload,
            'text/plain;charset=utf-8;'
        );
        alert('Nao foi possivel copiar automaticamente. O protocolo foi baixado em arquivo texto.');
    };

    const renderModalContent = () => {
        if (!selectedEntry) {
            return null;
        }

        const details = selectedEntry.details || {};
        const isPendingWithdrawal = selectedEntry.type === LedgerEventType.WITHDRAWAL && selectedEntry.state === LedgerState.PENDING;

        return (
            <div>
                <div className="space-y-3">
                    {isPendingWithdrawal && (
                        <div className="bg-warning/10 border border-warning/20 text-warning text-sm rounded-lg p-4 mb-4 text-center">
                            <p className="font-bold">Solicitacao de saque em processamento</p>
                            <p className="mt-1">Esta solicitacao ainda nao foi paga. O valor sera creditado na chave PIX informada assim que a transacao for concluida.</p>
                        </div>
                    )}
                    <DetailRow label="Descricao" value={selectedEntry.description} />
                    <DetailRow label="Data da solicitacao" value={new Date(selectedEntry.occurredAt).toLocaleString('pt-BR')} />
                    <DetailRow label="Valor" value={formatCurrency(selectedEntry.amount)} />
                    {selectedEntry.fee > 0 && <DetailRow label="Taxa" value={formatCurrency(selectedEntry.fee)} />}
                    {selectedEntry.fee > 0 && <DetailRow label="Liquido" value={formatCurrency(selectedEntry.amount - selectedEntry.fee)} />}
                    <DetailRow label="Status" value={<StatusBadge status={selectedEntry.state} />} />
                    <DetailRow label="Referencia" value={selectedEntry.refId} />

                    {Object.keys(details).length > 0 && <hr className="border-border/50 my-3" />}
                    {Object.keys(details).length > 0 && <h4 className="font-bold text-text-title mb-2">Detalhes adicionais</h4>}

                    {Object.entries(details).map(([key, value]) => (
                        <DetailRow key={key} label={key} value={value} />
                    ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => handleReceiptDownload(selectedEntry)}
                        className="flex-1 text-center py-2 px-4 bg-surface text-text-body hover:bg-border border border-border font-semibold rounded-lg transition-colors"
                    >
                        Baixar comprovante
                    </button>
                    <button
                        onClick={() => handleSupportReport(selectedEntry)}
                        className="flex-1 text-center py-2 px-4 bg-surface text-text-body hover:bg-border border border-border font-semibold rounded-lg transition-colors"
                    >
                        Copiar protocolo de suporte
                    </button>
                </div>
            </div>
        );
    };

    const formElementClass = 'w-full px-3 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Extrato de Transacoes</h1>
                <p className="text-text-body mt-1">Veja o historico completo de movimentacoes da sua conta.</p>
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
                                placeholder="Descricao, Ref ID, nome..."
                                className={`${formElementClass} pl-10`}
                                value={filter}
                                onChange={(event) => setFilter(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-grow" style={{ minWidth: '180px' }}>
                        <label className="text-xs text-text-soft mb-1 block">Tipo</label>
                        <select className={formElementClass} value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                            <option value="">Todos os tipos</option>
                            {Object.entries(typeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-grow" style={{ minWidth: '130px' }}>
                        <label className="text-xs text-text-soft mb-1 block">De</label>
                        <input type="date" className={formElementClass} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </div>
                    <div className="flex-grow" style={{ minWidth: '130px' }}>
                        <label className="text-xs text-text-soft mb-1 block">Ate</label>
                        <input type="date" className={formElementClass} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-border border border-border transition-colors">
                        Limpar filtros
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={loading || filteredData.length === 0}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface text-text-body hover:bg-border border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Exportar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-card rounded-2xl border border-border py-12 text-center text-text-body">
                    Carregando extrato...
                </div>
            ) : (
                <DataTable<LedgerEntry> columns={columns} data={filteredData} onRowClick={(entry) => setSelectedEntry(entry)} />
            )}

            <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title="Detalhes da transacao">
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Transactions;
