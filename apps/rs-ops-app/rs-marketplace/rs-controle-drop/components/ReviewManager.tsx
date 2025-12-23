import React, { useState } from 'react';
import { ProductReview, ReviewStatus } from '../types';
import { Star, Filter, ThumbsUp, ThumbsDown, Image as ImageIcon } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface ReviewManagerProps {
    reviews: ProductReview[];
    onUpdate: (review: ProductReview) => void;
}

export const ReviewManager: React.FC<ReviewManagerProps> = ({ reviews, onUpdate }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

    const filteredReviews = reviews.filter(r => statusFilter === 'all' || r.status === statusFilter);
    const table = useDataTable({ initialData: filteredReviews, searchKeys: ['productName', 'customerName', 'comment'] });

    const handleUpdateStatus = (review: ProductReview, status: ReviewStatus) => {
        onUpdate({ ...review, status });
    };
    
    const handleToggleFeatured = (review: ProductReview) => {
        onUpdate({ ...review, isFeatured: !review.isFeatured });
    };

    const handleSaveReview = (review: ProductReview) => {
        onUpdate(review);
        setEditingReview(null);
    };

    const getStatusBadge = (status: ReviewStatus) => {
        const styles: Record<ReviewStatus, string> = {
            'Pendente': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'Aprovado': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Oculto': 'bg-slate-700 text-slate-400 border-slate-600',
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[status]}`}>{status}</span>;
    };

    const columns: Column<ProductReview>[] = [
        {
            header: 'Produto / Cliente',
            accessor: 'productName',
            sortable: true,
            render: r => (
                <div>
                    <div className="font-bold text-slate-200">{r.productName}</div>
                    <div className="text-xs text-slate-500">por {r.customerName}</div>
                </div>
            )
        },
        {
            header: 'Avaliação',
            accessor: 'rating',
            sortable: true,
            render: r => (
                <div onClick={() => setEditingReview(r)} className="cursor-pointer">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < r.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'} />
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs truncate italic" title={r.comment}>"{r.comment}"</p>
                    {r.imageUrl && <ImageIcon size={14} className="inline-block text-blue-400 mt-1" />}
                </div>
            )
        },
        {
            header: 'Data',
            accessor: 'createdAt',
            sortable: true,
            render: r => <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            render: r => getStatusBadge(r.status)
        },
        {
            header: 'Ações de Moderação',
            accessor: 'actions',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: r => (
                <div className="flex justify-center gap-2">
                    {r.status !== 'Aprovado' && <button onClick={() => handleUpdateStatus(r, 'Aprovado')} className="p-2 text-slate-400 hover:text-emerald-400" title="Aprovar"><ThumbsUp size={16}/></button>}
                    {r.status !== 'Oculto' && <button onClick={() => handleUpdateStatus(r, 'Oculto')} className="p-2 text-slate-400 hover:text-red-400" title="Ocultar"><ThumbsDown size={16}/></button>}
                    {r.status === 'Aprovado' && (
                        <button onClick={() => handleToggleFeatured(r)} className={`p-2 transition-colors ${r.isFeatured ? 'text-rs-gold' : 'text-slate-400 hover:text-rs-gold'}`} title={r.isFeatured ? "Remover Destaque" : "Destacar Avaliação"}>
                            <Star size={16} fill={r.isFeatured ? 'currentColor' : 'none'}/>
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Star /> Moderação de Avaliações</h2>
                    <p className="text-sm text-slate-400">Gerencie a prova social da sua loja.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-rs-card p-3 rounded-lg border border-white/5 w-fit">
                <Filter size={16} className="text-slate-400"/>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-slate-300 text-sm outline-none">
                    <option value="all">Status: Todos</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Oculto">Oculto</option>
                </select>
            </div>

            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            {editingReview && (
                <ReviewEditModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSave={handleSaveReview}
                />
            )}
        </div>
    );
};

// --- EDIT MODAL ---
interface ReviewEditModalProps {
    review: ProductReview;
    onClose: () => void;
    onSave: (review: ProductReview) => void;
}
const ReviewEditModal: React.FC<ReviewEditModalProps> = ({ review, onClose, onSave }) => {
    const [formData, setFormData] = useState(review);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate file upload by creating a blob URL
            const fileUrl = URL.createObjectURL(e.target.files[0]);
            setFormData({ ...formData, imageUrl: fileUrl });
        }
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Editar Avaliação">
            <div className="p-6 space-y-4">
                <div><label className="label-text">Comentário</label><textarea rows={4} value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="input-field"/></div>
                <div>
                    <label className="label-text">Foto do Cliente</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="input-field" />
                    {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-lg" />}
                </div>
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="button" onClick={() => onSave(formData)} className="btn-primary">Salvar</button></div>
            </div>
            <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
        </ModalWrapper>
    );
};
