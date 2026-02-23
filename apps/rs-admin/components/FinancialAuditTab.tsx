import React, { useState, useMemo } from 'react';
import type { Consultant, PurchaseEvent, BonusPayment } from '../types';
import { MagnifyingGlassIcon, FunnelIcon, ChevronRightIcon, ChevronDownIcon, CurrencyDollarIcon, CalendarIcon } from './icons';

interface FinancialAuditTabProps {
    consultants: Consultant[];
}

interface EnrichedTransaction extends PurchaseEvent {
    originConsultant: Consultant;
}

const FinancialAuditTab: React.FC<FinancialAuditTabProps> = ({ consultants }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, this_month, last_month
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Consolidar todas as transações de compra de todos os consultores em uma única lista auditável
    const allTransactions = useMemo(() => {
        const transactions: EnrichedTransaction[] = [];
        consultants.forEach(c => {
            if (c.purchaseHistory) {
                c.purchaseHistory.forEach(p => {
                    transactions.push({
                        ...p,
                        originConsultant: c
                    });
                });
            }
        });
        // Ordenar por data (mais recente primeiro)
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [consultants]);

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const matchesSearch =
                t.originConsultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.id.toLowerCase().includes(searchQuery.toLowerCase());

            // TODO: Implementar filtro de data real se necessário
            return matchesSearch;
        });
    }, [allTransactions, searchQuery]);

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const statusClasses = {
        'Completed': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        'Canceled': 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header de Auditoria */}
            <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <CurrencyDollarIcon className="w-8 h-8 text-yellow-500" />
                            Auditoria Financeira & Rastreabilidade
                        </h2>
                        <p className="text-gray-400 mt-1">
                            Rastreie o fluxo de cada centavo. Identifique a origem dos pagamentos e a distribuição exata de bônus na rede.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-center">
                            <p className="text-xs text-gray-500 uppercase">Volume Total Auditado</p>
                            <p className="text-xl font-bold text-green-400">
                                {filteredTransactions.reduce((acc, t) => acc + t.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por ID do Pedido ou Nome do Comprador..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pl-10"
                        />
                    </div>
                    <div>
                        <select
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                        >
                            <option value="all">Todo o Período</option>
                            <option value="today">Hoje</option>
                            <option value="this_month">Este Mês</option>
                            <option value="last_month">Mês Passado</option>
                        </select>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-700">
                        <FunnelIcon className="w-5 h-5" /> Mais Filtros
                    </button>
                </div>
            </div>

            {/* Tabela de Transações */}
            <div className="bg-black/50 border border-gray-800 rounded-xl overflow-y-auto custom-scrollbar max-h-[600px] min-h-[400px]">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-yellow-500 uppercase bg-black/80 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-4 w-10"></th>
                            <th className="px-6 py-4">ID Pedido / Data</th>
                            <th className="px-6 py-4">Origem (Comprador)</th>
                            <th className="px-6 py-4">Produtos</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Valor Total</th>
                            <th className="px-6 py-4 text-right">Bônus Distribuído</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => {
                            const isExpanded = expandedRows[t.id];
                            const totalBonusDistributed = t.uplinePayments.reduce((acc, p) => acc + p.amount, 0);

                            return (
                                <React.Fragment key={t.id}>
                                    <tr
                                        onClick={() => toggleRow(t.id)}
                                        className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-800/30' : ''}`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-white font-bold">{t.id}</div>
                                            <div className="text-xs flex items-center gap-1 mt-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {new Date(t.date).toLocaleDateString('pt-BR')} {new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={t.originConsultant.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-700" />
                                                <div>
                                                    <div className="font-bold text-white">{t.originConsultant.name}</div>
                                                    <div className="text-xs">ID: {t.originConsultant.code || t.originConsultant.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white max-w-xs truncate" title={t.items.map(i => `${i.qty}x ${i.name}`).join(', ')}>
                                                {t.items.length} itens
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded border text-xs font-bold uppercase ${statusClasses['Completed']}`}>
                                                Aprovado
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-white">
                                            {t.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-yellow-500">
                                            {totalBonusDistributed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>

                                    {/* Linha Expandida - Detalhes da Distribuição */}
                                    {isExpanded && (
                                        <tr className="bg-gray-900/50">
                                            <td colSpan={7} className="p-0">
                                                <div className="border-l-4 border-yellow-500 m-4 ml-14 bg-black/40 rounded-r-lg overflow-hidden animate-fade-in">
                                                    <div className="px-6 py-3 border-b border-gray-800 bg-gray-900/80 flex justify-between items-center">
                                                        <h4 className="font-bold text-gray-300 text-xs uppercase tracking-wider">Rastreabilidade de Bônus (Quem recebeu desta compra?)</h4>
                                                    </div>
                                                    {t.uplinePayments.length > 0 ? (
                                                        <table className="w-full text-xs text-left">
                                                            <thead className="text-gray-500 bg-black/20">
                                                                <tr>
                                                                    <th className="px-6 py-2">Beneficiário (Upline)</th>
                                                                    <th className="px-6 py-2">Nível</th>
                                                                    <th className="px-6 py-2">Tipo de Bônus</th>
                                                                    <th className="px-6 py-2">Regra Aplicada</th>
                                                                    <th className="px-6 py-2 text-right">Valor Pago</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-800/50">
                                                                {t.uplinePayments.map((p, idx) => (
                                                                    <tr key={idx} className="hover:bg-white/5">
                                                                        <td className="px-6 py-2 font-medium text-yellow-500">
                                                                            {p.recipientName}
                                                                        </td>
                                                                        <td className="px-6 py-2">
                                                                            <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] border border-gray-700">
                                                                                L{p.effectiveLevel}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-2 text-white">{p.bonusType}</td>
                                                                        <td className="px-6 py-2 text-gray-500 italic">
                                                                            {p.effectiveLevel < p.theoreticalLevel ? 'Compressão Dinâmica' : 'Padrão'}
                                                                        </td>
                                                                        <td className="px-6 py-2 text-right font-mono text-green-400 font-bold">
                                                                            {p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500 text-sm">
                                                            Nenhum bônus distribuído para uplines neste pedido (compra direta sem comissionamento ou topo da rede).
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-500">
                                    Nenhuma transação encontrada com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialAuditTab;
