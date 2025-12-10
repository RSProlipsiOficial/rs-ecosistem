

import React, { useState, useMemo } from 'react';
import { ReturnRequest, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClockIcon } from './icons/ClockIcon';

interface ManageReturnsProps {
    returns: ReturnRequest[];
    onUpdateStatus: (returnIds: string[], status: ReturnRequest['status']) => void;
    onDelete: (returnIds: string[]) => void;
    onNavigate: (view: View, data?: ReturnRequest) => void;
}

const ReturnStatusBadge = ({ status }: { status: ReturnRequest['status'] }) => {
    const statusConfig = {
        'Pendente': { text: 'Pendente', color: 'warning', icon: ClockIcon },
        'Aprovada': { text: 'Aprovada', color: 'success', icon: CheckCircleIcon },
        'Rejeitada': { text: 'Rejeitada', color: 'error', icon: XCircleIcon },
        'Concluída': { text: 'Concluída', color: 'info', icon: CheckCircleIcon },
    };
    const config = statusConfig[status];
    const colorClasses = {
        warning: 'bg-[rgb(var(--color-warning))]/[0.20] text-[rgb(var(--color-warning))]',
        success: 'bg-[rgb(var(--color-success))]/[0.20] text-[rgb(var(--color-success))]',
        error: 'bg-[rgb(var(--color-error))]/[0.20] text-[rgb(var(--color-error))]',
        info: 'bg-[rgb(var(--color-info))]/[0.20] text-[rgb(var(--color-info))]',
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-2 ${colorClasses[config.color]}`}>
            <config.icon className="w-4 h-4" />
            {config.text}
        </span>
    );
};

const ManageReturns: React.FC<ManageReturnsProps> = ({ returns, onUpdateStatus, onDelete, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReturns, setSelectedReturns] = useState<string[]>([]);

    const filteredReturns = useMemo(() => {
        return returns.filter(r => {
            const matchesSearch = r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [returns, searchTerm, statusFilter]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedReturns(e.target.checked ? filteredReturns.map(r => r.id) : []);
    };

    const handleSelectOne = (id: string) => {
        setSelectedReturns(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
    };

    const handleAction = (action: 'approve' | 'reject' | 'delete') => {
        if (selectedReturns.length === 0) return;

        switch (action) {
            case 'approve':
                onUpdateStatus(selectedReturns, 'Aprovada');
                break;
            case 'reject':
                onUpdateStatus(selectedReturns, 'Rejeitada');
                break;
            case 'delete':
                onDelete(selectedReturns);
                break;
        }
        setSelectedReturns([]);
    };

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
            <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Buscar por Nº do pedido ou cliente"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                        </div>
                    </div>
                    {/* Filter Dropdown would go here */}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                    <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                        <tr>
                            <th scope="col" className="p-4">
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedReturns.length > 0 && selectedReturns.length === filteredReturns.length} />
                            </th>
                            <th scope="col" className="px-6 py-3">ID Devolução</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Itens</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReturns.map(ret => (
                            <tr key={ret.id} className="border-b border-[rgb(var(--color-brand-gray-light))] hover:bg-[rgb(var(--color-brand-gray))]/[.50] cursor-pointer" onClick={() => onNavigate('returnDetail', ret)}>
                                <td className="w-4 p-4" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" checked={selectedReturns.includes(ret.id)} onChange={() => handleSelectOne(ret.id)} />
                                </td>
                                <td className="px-6 py-4 font-medium text-[rgb(var(--color-brand-gold))]">{ret.id}</td>
                                <td className="px-6 py-4">{ret.orderId}</td>
                                <td className="px-6 py-4">{new Date(ret.requestDate).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 text-[rgb(var(--color-brand-text-light))]">{ret.customerName}</td>
                                <td className="px-6 py-4"><ReturnStatusBadge status={ret.status} /></td>
                                <td className="px-6 py-4">{ret.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 flex justify-between items-center">
               <div className="flex gap-2">
                    <button onClick={() => handleAction('approve')} disabled={selectedReturns.length === 0} className="flex items-center gap-2 text-sm font-semibold bg-[rgb(var(--color-success))]/[0.50] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-success))]/[0.80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <CheckCircleIcon className="w-5 h-5"/> Aprovar
                    </button>
                    <button onClick={() => handleAction('reject')} disabled={selectedReturns.length === 0} className="flex items-center gap-2 text-sm font-semibold bg-[rgb(var(--color-error))]/[0.50] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-error))]/[0.80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <XCircleIcon className="w-5 h-5"/> Rejeitar
                    </button>
                     <button onClick={() => handleAction('delete')} disabled={selectedReturns.length === 0} className="flex items-center gap-2 text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <TrashIcon className="w-5 h-5"/> Excluir
                    </button>
               </div>
               <div className="text-xs">
                    {filteredReturns.length} de {returns.length} devoluções
               </div>
            </div>
        </div>
    );
};

export default ManageReturns;