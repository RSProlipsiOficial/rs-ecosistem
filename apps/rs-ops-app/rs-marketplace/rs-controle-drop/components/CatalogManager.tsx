import React, { useState, useMemo } from 'react';
import { User, GlobalProduct, Product } from '../types';
import { Globe, Plus, Edit2, Trash2, CheckCircle, Power } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface CatalogManagerProps {
    currentUser: User;
    globalProducts: GlobalProduct[];
    products: Product[]; // Logista's own products to check for activation
    onActivate: (gp: GlobalProduct) => void;
    onUpdateGlobalProduct: (products: GlobalProduct[]) => void;
}

const EMPTY_GLOBAL_PRODUCT: Omit<GlobalProduct, 'id'> = {
    name: '',
    sku: '',
    description: '',
    suggestedPrice: 0,
    minAllowedPrice: 0,
    maxAllowedPrice: 0,
    isActive: true,
};

export const CatalogManager: React.FC<CatalogManagerProps> = ({ currentUser, globalProducts, products, onActivate, onUpdateGlobalProduct }) => {
    
    if (currentUser.role === 'Admin') {
        return <AdminView globalProducts={globalProducts} onUpdate={onUpdateGlobalProduct} />;
    }
    
    return <LogistaView globalProducts={globalProducts} userProducts={products} onActivate={onActivate} />;
};

// --- ADMIN VIEW ---
interface AdminViewProps {
    globalProducts: GlobalProduct[];
    onUpdate: (products: GlobalProduct[]) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ globalProducts, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<GlobalProduct, 'id'>>(EMPTY_GLOBAL_PRODUCT);

    const table = useDataTable({ initialData: globalProducts, searchKeys: ['name', 'sku'] });

    const handleOpenModal = (gp?: GlobalProduct) => {
        if (gp) {
            setEditingId(gp.id);
            setFormData(gp);
        } else {
            setEditingId(null);
            setFormData(EMPTY_GLOBAL_PRODUCT);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdate(globalProducts.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
        } else {
            onUpdate([...globalProducts, { ...formData, id: crypto.randomUUID() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este produto do catálogo global?')) {
            onUpdate(globalProducts.filter(p => p.id !== id));
        }
    };

    const columns: Column<GlobalProduct>[] = [
        { header: 'Produto Global', accessor: 'name', sortable: true, render: p => <span className="font-bold text-slate-200">{p.name}</span> },
        { header: 'SKU', accessor: 'sku', sortable: true, render: p => <span className="font-mono text-xs">{p.sku}</span> },
        { header: 'Preço Sugerido', accessor: 'suggestedPrice', sortable: true, render: p => `R$ ${p.suggestedPrice.toFixed(2)}` },
        { header: 'Status', accessor: 'isActive', render: p => p.isActive ? <span className="text-emerald-400">Ativo</span> : <span className="text-slate-500">Inativo</span> },
        { header: 'Ações', accessor: 'actions', render: p => (
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(p)} className="p-2 hover:text-blue-400"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold">Gerenciar Catálogo Global RS</h2>
                    <p className="text-sm text-slate-400">Adicione ou edite produtos disponíveis para todos os logistas.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Produto Global</button>
            </div>
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

             <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Produto Global' : 'Novo Produto Global'}>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label-text">Nome do Produto</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required/></div>
                        <div><label className="label-text">SKU</label><input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-field" required/></div>
                    </div>
                     <div><label className="label-text">Descrição</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows={3}/></div>
                     <div className="grid grid-cols-3 gap-4">
                        <div><label className="label-text">Preço Sugerido (R$)</label><input type="number" value={formData.suggestedPrice} onChange={e => setFormData({...formData, suggestedPrice: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                        <div><label className="label-text">Preço Mínimo (R$)</label><input type="number" value={formData.minAllowedPrice} onChange={e => setFormData({...formData, minAllowedPrice: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                        <div><label className="label-text">Preço Máximo (R$)</label><input type="number" value={formData.maxAllowedPrice} onChange={e => setFormData({...formData, maxAllowedPrice: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                     </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </ModalWrapper>
             <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};

// --- LOGISTA VIEW ---
interface LogistaViewProps {
    globalProducts: GlobalProduct[];
    userProducts: Product[];
    onActivate: (gp: GlobalProduct) => void;
}

const LogistaView: React.FC<LogistaViewProps> = ({ globalProducts, userProducts, onActivate }) => {
    
    const activatedProductIds = useMemo(() => 
        new Set(userProducts.map(p => p.globalProductId).filter(Boolean)),
    [userProducts]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-rs-gold">Catálogo de Produtos RS</h2>
                <p className="text-sm text-slate-400">Ative produtos em sua loja com um clique. A descrição e imagens são gerenciadas pela RS.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalProducts.filter(p => p.isActive).map(gp => {
                    const isActivated = activatedProductIds.has(gp.id);
                    return (
                        <div key={gp.id} className="bg-rs-card border border-rs-goldDim/20 rounded-xl p-4 flex flex-col gap-3">
                            <div className="w-full h-32 bg-black/20 rounded-lg"></div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-200">{gp.name}</h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{gp.description}</p>
                            </div>
                            <div className="text-sm text-slate-500">Preço Sugerido: <span className="font-bold text-rs-gold">R$ {gp.suggestedPrice.toFixed(2)}</span></div>
                            <button 
                                onClick={() => onActivate(gp)}
                                disabled={isActivated}
                                className={`w-full mt-2 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                    isActivated 
                                    ? 'bg-emerald-500/10 text-emerald-400 cursor-not-allowed' 
                                    : 'bg-rs-gold text-rs-black hover:bg-yellow-500'
                                }`}
                            >
                                {isActivated ? <><CheckCircle size={16}/> Ativo na sua Loja</> : <><Power size={16}/> Ativar em minha Loja</>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};