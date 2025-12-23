import React, { useState, useMemo } from 'react';
import { Review } from '../types';
import { StarIcon } from './icons/StarIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClockIcon } from './icons/ClockIcon';

interface ManageReviewsProps {
    reviews: Review[];
    onUpdateStatus: (reviewIds: string[], status: Review['status']) => void;
    onDelete: (reviewIds: string[]) => void;
}

const StatusBadge: React.FC<{ status: Review['status'] }> = ({ status }) => {
    const config = {
        'Pendente': { icon: ClockIcon, color: 'yellow' },
        'Aprovada': { icon: CheckCircleIcon, color: 'green' },
        'Rejeitada': { icon: XCircleIcon, color: 'red' },
    };
    const { icon: Icon, color } = config[status];
    const colors = {
        yellow: 'bg-gold-500/10 text-gold-400',
        green: 'bg-green-500/10 text-green-400',
        red: 'bg-red-500/10 text-red-400',
    };
    return <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${colors[color]}`}><Icon className="w-3.5 h-3.5"/>{status}</span>;
};


const ManageReviews: React.FC<ManageReviewsProps> = ({ reviews, onUpdateStatus, onDelete }) => {
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [filter, setFilter] = useState<'all' | Review['status']>('all');

    const filteredReviews = useMemo(() => {
        if (filter === 'all') return reviews;
        return reviews.filter(r => r.status === filter);
    }, [reviews, filter]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedReviews(e.target.checked ? filteredReviews.map(r => r.id) : []);
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedReviews(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
    };

    const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
        if (selectedReviews.length === 0) return;
        if (action === 'delete') {
            if (window.confirm(`Tem certeza que deseja excluir ${selectedReviews.length} avaliação(ões)?`)) {
                onDelete(selectedReviews);
            }
        } else {
            onUpdateStatus(selectedReviews, action === 'approve' ? 'Aprovada' : 'Rejeitada');
        }
        setSelectedReviews([]);
    };

    return (
        <div className="bg-black border border-dark-800 rounded-lg">
            <div className="p-4 border-b border-dark-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h3 className="text-lg font-semibold text-white">Moderar Avaliações</h3>
                    <p className="text-sm text-gray-400">Aprove, rejeite ou exclua as avaliações enviadas pelos clientes.</p>
                </div>
                 <div className="flex gap-2">
                    {(['all', 'Pendente', 'Aprovada', 'Rejeitada'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm rounded-full ${filter === f ? 'bg-gold-500 text-black font-semibold' : 'bg-dark-800 text-gray-300 hover:bg-dark-700'}`}>
                            {f === 'all' ? 'Todas' : f}
                        </button>
                    ))}
                </div>
            </div>
             {selectedReviews.length > 0 && (
                <div className="p-4 bg-dark-800/50 flex items-center gap-4">
                    <span className="text-sm text-white">{selectedReviews.length} selecionada(s)</span>
                    <button onClick={() => handleBulkAction('approve')} className="flex items-center gap-2 text-sm font-semibold bg-green-600/50 text-white py-1.5 px-3 rounded-md hover:bg-green-600">
                        <CheckCircleIcon className="w-4 h-4"/> Aprovar
                    </button>
                    <button onClick={() => handleBulkAction('reject')} className="flex items-center gap-2 text-sm font-semibold bg-red-600/50 text-white py-1.5 px-3 rounded-md hover:bg-red-600">
                        <XCircleIcon className="w-4 h-4"/> Rejeitar
                    </button>
                    <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 text-sm font-semibold bg-dark-700 text-white py-1.5 px-3 rounded-md hover:bg-gray-600">
                        <TrashIcon className="w-4 h-4"/> Excluir
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-black">
                         <tr>
                            <th className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedReviews.length > 0 && selectedReviews.length === filteredReviews.length} /></th>
                            <th className="px-6 py-3">Avaliação</th>
                            <th className="px-6 py-3">Produto</th>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews.map(review => (
                            <tr key={review.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                <td className="w-4 p-4"><input type="checkbox" checked={selectedReviews.includes(review.id)} onChange={() => handleSelectOne(review.id)} /></td>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex text-gold-400">
                                            {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-gold-400' : 'text-gray-600'}`} />)}
                                        </div>
                                        <p className="font-semibold text-white">{review.title}</p>
                                    </div>
                                    <p className="text-xs text-gray-300 italic">"{review.text}"</p>
                                    <p className="text-xs text-gray-500 mt-1">- {review.author}</p>
                                </td>
                                <td className="px-6 py-4 text-white font-medium">{review.productName}</td>
                                <td className="px-6 py-4">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4"><StatusBadge status={review.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageReviews;
