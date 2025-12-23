import React, { useState } from 'react';
import { DistributionCenter } from '../types';
import { Warehouse, Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface DistributionCenterManagerProps {
    centers: DistributionCenter[];
    onAdd: (center: Omit<DistributionCenter, 'id' | 'userId'>) => void;
    onUpdate: (center: DistributionCenter) => void;
    onDelete: (id: string) => void;
}

const EMPTY_CENTER: Omit<DistributionCenter, 'id' | 'userId'> = {
    name: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    zipCodeRanges: [{ start: '', end: '' }],
};

export const DistributionCenterManager: React.FC<DistributionCenterManagerProps> = ({ centers, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<DistributionCenter, 'id' | 'userId'>>(EMPTY_CENTER);

    const table = useDataTable({ initialData: centers, searchKeys: ['name', 'address.city'] });

    const handleOpenModal = (center?: DistributionCenter) => {
        if (center) {
            setEditingId(center.id);
            setFormData(center);
        } else {
            setEditingId(null);
            setFormData(EMPTY_CENTER);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdate({ ...formData, id: editingId, userId: (formData as DistributionCenter).userId });
        } else {
            onAdd(formData);
        }
        setIsModalOpen(false);
    };

    const handleRangeChange = (index: number, field: 'start' | 'end', value: string) => {
        const newRanges = [...formData.zipCodeRanges];
        newRanges[index][field] = value;
        setFormData({ ...formData, zipCodeRanges: newRanges });
    };

    const addRange = () => {
        setFormData({ ...formData, zipCodeRanges: [...formData.zipCodeRanges, { start: '', end: '' }] });
    };

    const removeRange = (index: number) => {
        setFormData({ ...formData, zipCodeRanges: formData.zipCodeRanges.filter((_, i) => i !== index) });
    };

    const columns: Column<DistributionCenter>[] = [
        { header: 'Nome do CD', accessor: 'name', sortable: true, render: c => <span className="font-bold text-slate-200">{c.name}</span> },
        { header: 'Localização', accessor: 'address.city', sortable: true, render: c => `${c.address.city}, ${c.address.state}` },
        { header: 'Faixas de CEP', accessor: 'zipCodeRanges', render: c => `${c.zipCodeRanges.length} faixas configuradas` },
        { header: 'Ações', accessor: 'actions', render: c => (
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(c)} className="p-2 hover:text-blue-400"><Edit2 size={16}/></button>
                <button onClick={() => onDelete(c.id)} className="p-2 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Warehouse /> Centros de Distribuição</h2>
                    <p className="text-sm text-slate-400">Gerencie seus pontos de envio e roteamento.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo CD</button>
            </div>
            
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Centro de Distribuição' : 'Novo Centro de Distribuição'}>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="label-text">Nome do CD</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Ex: CD Sudeste"/>
                    </div>
                    <div>
                        <label className="label-text">Endereço (Cidade/Estado)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" required value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value }})} className="input-field" placeholder="Cidade"/>
                            <input type="text" required value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value }})} className="input-field" placeholder="Estado (UF)"/>
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Faixas de CEP Atendidas</label>
                        <div className="space-y-2">
                            {formData.zipCodeRanges.map((range, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={range.start} onChange={e => handleRangeChange(index, 'start', e.target.value)} className="input-field" placeholder="CEP Inicial"/>
                                    <span>-</span>
                                    <input type="text" value={range.end} onChange={e => handleRangeChange(index, 'end', e.target.value)} className="input-field" placeholder="CEP Final"/>
                                    <button type="button" onClick={() => removeRange(index)} className="p-2 text-red-400"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addRange} className="text-xs text-rs-gold mt-2 flex items-center gap-1"><Plus size={14}/> Adicionar Faixa</button>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </ModalWrapper>
            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};
