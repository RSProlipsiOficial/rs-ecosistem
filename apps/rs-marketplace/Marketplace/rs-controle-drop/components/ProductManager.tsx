
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Supplier, ProductSupplier, User, ProductVariant } from '../types';
import { Edit2, Trash2, Plus, Download, Building, Info, Layers, Star, Filter, UserPlus, ShoppingCart } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { useProducts } from '../contexts/ProductContext';

interface ProductManagerProps {
  suppliers: Supplier[];
  currentUser: User;
  users: User[];
  onAddSupplier: (s: Omit<Supplier, 'id'>) => void;
  onViewOrders: (productName: string) => void;
  targetProductId?: string | null; // PRT-030
  onClearTargetProduct?: () => void; // PRT-030
}

const EMPTY_PRODUCT: Omit<Product, 'id' | 'userId'> = {
  name: '', sku: '', category: '', salePrice: 0, shippingCost: 0, shippingCharged: 0,
  gatewayFeeRate: 4.99, currentStock: 0, minStock: 5, status: 'Active',
  variants: []
};

// Extended type for table display with computed metrics
type ProductWithMetrics = Product & {
  cost: number;
  profit: number;
};

export const ProductManager: React.FC<ProductManagerProps> = ({ suppliers, currentUser, users, onAddSupplier, onViewOrders, targetProductId, onClearTargetProduct }) => {
  const { products, productSuppliers, addProduct, updateProduct, deleteProduct, updateProductSuppliers } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'userId'>>(EMPTY_PRODUCT);
  const [currentLinks, setCurrentLinks] = useState<ProductSupplier[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'suppliers' | 'variants'>('details');

  // Quick Add Supplier State
  const [isQuickSupplierOpen, setQuickSupplierOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState<Omit<Supplier, 'id' | 'userId'>>({ name: '', contactPerson: '', email: '', phone: '' });

  // New Variant State
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ name: '', sku: '', price: 0, stock: 0, minStock: 0 });

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Derive categories from existing products for the dropdown
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);

  const filteredProducts = useMemo(() => {
      return products.filter(p => {
          if (statusFilter !== 'all' && p.status !== statusFilter) return false;
          if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
          
          if (stockFilter === 'low' && p.currentStock > p.minStock) return false;
          if (stockFilter === 'normal' && (p.currentStock <= p.minStock || p.currentStock >= 100)) return false;
          if (stockFilter === 'high' && p.currentStock < 100) return false;
          
          return true;
      });
  }, [products, statusFilter, categoryFilter, stockFilter]);

  // Helper functions for calculation
  const getLowestCost = (productId: string) => {
    const costs = productSuppliers.filter(ps => ps.productId === productId).map(ps => ps.costPrice);
    return costs.length > 0 ? Math.min(...costs) : 0;
  };
  
  const calculateEstProfit = (p: Product, costPrice: number) => {
    const grossRevenue = p.salePrice + p.shippingCharged;
    const gateFee = grossRevenue * (p.gatewayFeeRate / 100);
    const costs = costPrice + p.shippingCost + gateFee;
    return grossRevenue - costs;
  };

  // PRT-024: Pre-calculate metrics to allow sorting by Profit and Cost
  const tableData: ProductWithMetrics[] = useMemo(() => {
      return filteredProducts.map(p => {
          const cost = getLowestCost(p.id);
          const profit = calculateEstProfit(p, cost);
          return {
              ...p,
              cost,
              profit
          };
      });
  }, [filteredProducts, productSuppliers]);

  const table = useDataTable({ initialData: tableData, searchKeys: ['name', 'sku'] });

  // PRT-030: Handle Target Product ID from Alerts
  useEffect(() => {
      if (targetProductId) {
          const target = products.find(p => p.id === targetProductId);
          if (target) {
              handleOpenModal(target);
              // Optionally we could reset filters to ensure visibility, but modal opens regardless
          }
          if (onClearTargetProduct) onClearTargetProduct();
      }
  }, [targetProductId, products, onClearTargetProduct]);

  const handleToggleStatus = (p: Product) => {
      const newStatus = p.status === 'Active' ? 'Inactive' : 'Active';
      
      // Safety check: Don't accidentally hide products with inventory
      if (newStatus === 'Inactive' && p.currentStock > 0) {
          if (!window.confirm(`ATENÇÃO: Este produto ainda possui ${p.currentStock} unidades em estoque.\n\nInativá-lo pode esconder este estoque dos relatórios. Deseja continuar?`)) {
              return;
          }
      }
      
      updateProduct({ ...p, status: newStatus });
  };

  const columns: Column<ProductWithMetrics>[] = [
    {
      header: 'Produto', accessor: 'name', sortable: true,
      render: (p) => (
        <div className="relative pl-2">
          {/* PRT-025: Visual border kept for quick scanning, but toggle added in separate column */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
          <div className={`font-bold flex items-center gap-2 ${p.status === 'Active' ? 'text-slate-100' : 'text-slate-500'}`}>
              {p.name}
              {p.variants && p.variants.length > 0 && <Layers size={14} className="text-rs-gold" title="Com Variações"/>}
          </div>
          <div className="flex gap-2 text-xs text-slate-500 font-mono">
            <span>{p.sku || 'SEM SKU'}</span>
            {p.category && <span className="text-slate-400 font-sans">• {p.category}</span>}
          </div>
        </div>
      )
    },
    ...(currentUser.role === 'Admin' ? [{
        header: 'Logista', accessor: 'userId', sortable: true,
        render: (p: Product) => <span className="text-xs text-slate-400">{users.find(u => u.id === p.userId)?.name || 'N/A'}</span>
    } as Column<ProductWithMetrics>] : []),
    {
      header: 'Estoque', accessor: 'currentStock', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center',
      render: (p) => (
        <div>
           <span className={`font-medium ${p.currentStock <= p.minStock ? 'text-red-400' : 'text-slate-300'}`}>{p.currentStock}</span>
           {p.variants && p.variants.length > 0 && <div className="text-[10px] text-slate-500">Total Variações</div>}
        </div>
      )
    },
    {
      header: 'Custo (Min)', accessor: 'cost', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right text-slate-300',
      render: (p) => `R$ ${p.cost.toFixed(2)}`
    },
    {
      header: 'Preço Venda', accessor: 'salePrice', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right text-slate-200 font-medium',
      render: (p) => `R$ ${p.salePrice.toFixed(2)}`
    },
    {
      header: 'Lucro Est.', accessor: 'profit', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right',
      render: (p) => {
        const margin = p.salePrice > 0 ? (p.profit / p.salePrice) * 100 : 0;
        return (
          <div>
            <div className={`font-bold ${p.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {p.profit.toFixed(2)}</div>
            <div className="text-[10px] opacity-70">{margin.toFixed(0)}%</div>
          </div>
        )
      }
    },
    {
        header: 'Status', accessor: 'status', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center',
        render: (p) => (
            <button
                onClick={(e) => { e.stopPropagation(); handleToggleStatus(p); }}
                className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors focus:outline-none ${p.status === 'Active' ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-700 border border-slate-600'}`}
                title={p.status === 'Active' ? "Ativo (Clique para desativar)" : "Inativo (Clique para ativar)"}
            >
                <span className={`inline-block w-3 h-3 transform rounded-full transition-transform duration-200 ${p.status === 'Active' ? 'translate-x-5 bg-emerald-400' : 'translate-x-1 bg-slate-400'}`}/>
            </button>
        )
    },
    {
      header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center',
      render: (p) => (
        <div className="flex items-center justify-center gap-2">
            <button onClick={() => onViewOrders(p.name)} className="p-2 text-slate-400 hover:text-emerald-400" title="Ver Pedidos"><ShoppingCart size={16}/></button>
            <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-blue-400" title="Editar"><Edit2 size={16}/></button>
            <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-400" title="Excluir"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  const handleOpenModal = (product?: Product) => {
    setActiveTab('details');
    if (product) {
      setEditingId(product.id);
      setFormData({ ...product, variants: product.variants || [] });
      setCurrentLinks(productSuppliers.filter(ps => ps.productId === product.id));
    } else {
      setEditingId(null);
      setFormData(EMPTY_PRODUCT);
      setCurrentLinks([]);
    }
    setIsModalOpen(true);
  };

  const hasVariants = formData.variants && formData.variants.length > 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // PRT-022: Validation - Require at least one valid supplier
    if (currentLinks.length === 0 || currentLinks.some(l => !l.supplierId)) {
        alert("PRT-022: É necessário vincular pelo menos um fornecedor válido para salvar o produto. Verifique a aba 'Fornecedores'.");
        setActiveTab('suppliers');
        return;
    }
    
    // --- PRT-027: Business Rules Validation ---

    // 1. Active Status requires Price > 0
    if (formData.status === 'Active' && formData.salePrice <= 0) {
        alert("PRT-027: Não é permitido salvar um produto 'Ativo' com preço de venda zerado.");
        setActiveTab('details');
        return;
    }

    // 2. Duplicate SKU Check
    if (formData.sku) {
        // Determine ownerId to scope check (if creating, use currentUser, if editing, use existing product owner)
        const ownerId = editingId ? products.find(p => p.id === editingId)?.userId : currentUser.id;
        
        const duplicate = products.find(p => 
            p.sku === formData.sku && 
            p.id !== editingId && 
            p.userId === ownerId
        );
        
        if (duplicate) {
            alert(`PRT-027: O SKU "${formData.sku}" já está em uso por outro produto.`);
            setActiveTab('details');
            return;
        }
    }

    // 3. Min Stock > Current Stock Check
    // Calculate effective stock considering variants if applicable
    const effectiveStock = hasVariants 
        ? (formData.variants?.reduce((a, b) => a + b.stock, 0) || 0)
        : formData.currentStock;

    if (formData.minStock > effectiveStock) {
        if (!window.confirm(`PRT-027 AVISO: O Estoque Mínimo (${formData.minStock}) é maior que o Estoque Atual (${effectiveStock}).\n\nIsso gerará um alerta imediato de reposição. Deseja manter?`)) {
            setActiveTab('details');
            return;
        }
    }

    // 4. Price < Cost Check
    // Get lowest cost from currently linked suppliers
    const lowestCost = currentLinks.length > 0 
        ? Math.min(...currentLinks.map(l => l.costPrice))
        : 0;

    if (lowestCost > 0 && formData.salePrice < lowestCost) {
         if (!window.confirm(`PRT-027 PERIGO: O Preço de Venda (R$ ${formData.salePrice}) é MENOR que o Custo do Fornecedor (R$ ${lowestCost}).\n\nVocê terá PREJUÍZO bruto. Deseja confirmar mesmo assim?`)) {
            setActiveTab('details');
            return;
        }
    }
    
    // --- End PRT-027 ---

    // Note: Stock auto-calculation is now handled in the Provider
    const finalData = { ...formData };

    if (editingId) {
      const originalProduct = products.find(p => p.id === editingId);
      if(originalProduct) {
        updateProduct({ ...finalData, id: editingId, userId: originalProduct.userId });
        updateProductSuppliers(editingId, currentLinks);
      }
    } else {
      const newId = crypto.randomUUID();
      addProduct({ ...finalData, id: newId, userId: currentUser.id });
      updateProductSuppliers(newId, currentLinks.map(l => ({ ...l, productId: newId })));
    }
    setIsModalOpen(false);
  };
  
  const handleAddLink = () => {
    if(currentLinks.some(l => l.supplierId === '')) return;
    setCurrentLinks([...currentLinks, { productId: editingId || '', supplierId: '', costPrice: 0, isDefault: currentLinks.length === 0 }]);
  };

  const handleUpdateLink = (index: number, field: keyof ProductSupplier, value: string | number) => {
    const updatedLinks = [...currentLinks];
    (updatedLinks[index] as any)[field] = value;
    setCurrentLinks(updatedLinks);
  };

  const handleSetDefaultSupplier = (index: number) => {
      const updatedLinks = currentLinks.map((link, i) => ({
          ...link,
          isDefault: i === index
      }));
      setCurrentLinks(updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    const isRemovingDefault = currentLinks[index].isDefault;
    const remaining = currentLinks.filter((_, i) => i !== index);
    
    if (isRemovingDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
    }
    setCurrentLinks(remaining);
  };
  
  // Variant Handlers
  const handleAddVariant = () => {
      if (!newVariant.name) return;
      const variant: ProductVariant = {
          id: crypto.randomUUID(),
          name: newVariant.name,
          sku: newVariant.sku || '',
          price: newVariant.price || formData.salePrice,
          stock: newVariant.stock || 0,
          minStock: newVariant.minStock || 5
      };
      setFormData({ ...formData, variants: [...(formData.variants || []), variant] });
      setNewVariant({ name: '', sku: '', price: formData.salePrice, stock: 0, minStock: 5 });
  };

  const handleRemoveVariant = (id: string) => {
      setFormData({ ...formData, variants: (formData.variants || []).filter(v => v.id !== id) });
  };
  
  const handleUpdateVariant = (id: string, field: keyof ProductVariant, value: any) => {
      setFormData({
          ...formData,
          variants: (formData.variants || []).map(v => v.id === id ? { ...v, [field]: value } : v)
      });
  };

  // Quick Supplier Add Handler
  const handleSaveQuickSupplier = (e: React.FormEvent) => {
      e.preventDefault();
      onAddSupplier({ ...newSupplierData, userId: currentUser.id });
      setNewSupplierData({ name: '', contactPerson: '', email: '', phone: '' });
      setQuickSupplierOpen(false);
  };

  const handleExport = () => { /* ... */ };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Catálogo de Produtos</h2>
          <p className="text-sm text-slate-400">Gerencie produtos, variações e fornecedores.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary"><Download size={18} /></button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Produto</button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-col sm:flex-row gap-4 bg-rs-card p-4 rounded-xl border border-rs-goldDim/20 items-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
              <Filter size={16}/> Filtros:
          </div>
          <div className="flex gap-4 w-full sm:w-auto overflow-x-auto">
              <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Status</label>
                  <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)} 
                      className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-slate-300 outline-none focus:border-rs-gold min-w-[120px]"
                  >
                      <option value="all">Todos</option>
                      <option value="Active">Ativos</option>
                      <option value="Inactive">Inativos</option>
                  </select>
              </div>
              <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Categoria</label>
                  <select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)} 
                      className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-slate-300 outline-none focus:border-rs-gold min-w-[120px]"
                  >
                      <option value="all">Todas</option>
                      {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Nível de Estoque</label>
                  <select 
                      value={stockFilter} 
                      onChange={(e) => setStockFilter(e.target.value)} 
                      className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-slate-300 outline-none focus:border-rs-gold min-w-[120px]"
                  >
                      <option value="all">Todos</option>
                      <option value="low">Baixo (Crítico)</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alto</option>
                  </select>
              </div>
          </div>
      </div>

      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por nome ou SKU..."/>

      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Produto' : 'Novo Produto'} size="4xl">
        <form onSubmit={handleSave} className="flex flex-col overflow-hidden h-full">
            <div className="border-b border-white/10 px-6 shrink-0">
                <div className="flex gap-1">
                    <TabButton icon={<Info size={16}/>} label="Dados Principais" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
                    <TabButton icon={<Layers size={16}/>} label={`Variações (${formData.variants?.length || 0})`} isActive={activeTab === 'variants'} onClick={() => setActiveTab('variants')} />
                    <TabButton icon={<Building size={16}/>} label="Fornecedores" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                </div>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div><label className="label-text">Nome do Produto</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field"/></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="label-text">Categoria</label><input type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field" placeholder="Ex: Vestuário"/></div>
                      <div><label className="label-text">Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="input-field"><option value="Active">Ativo</option><option value="Inactive">Inativo</option></select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="label-text">SKU (Pai)</label><input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-field"/></div>
                    <div>
                        <label className="label-text">Estoque Atual</label>
                        <input 
                            type="number" 
                            min="0" 
                            value={hasVariants ? formData.variants?.reduce((a,b)=>a+b.stock,0) : formData.currentStock} 
                            onChange={e => !hasVariants && setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} 
                            className={`input-field ${hasVariants ? 'bg-black/20 text-slate-500 cursor-not-allowed' : ''}`}
                            readOnly={hasVariants}
                        />
                        {hasVariants && <span className="text-[10px] text-rs-gold italic">Calculado via variações</span>}
                    </div>
                    <div><label className="label-text">Estoque Mínimo (Alerta)</label><input type="number" min="0" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} className="input-field"/></div>
                  </div>
                   <h4 className="text-md font-bold text-slate-300 pt-4">Preços e Taxas (Base)</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="label-text">Preço de Venda</label><input type="number" step="0.01" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value)||0})} className="input-field"/></div>
                      <div><label className="label-text">Frete Pago pela Loja</label><input type="number" step="0.01" value={formData.shippingCost} onChange={e => setFormData({...formData, shippingCost: parseFloat(e.target.value)||0})} className="input-field"/></div>
                      <div><label className="label-text">Frete Cobrado do Cliente</label><input type="number" step="0.01" value={formData.shippingCharged} onChange={e => setFormData({...formData, shippingCharged: parseFloat(e.target.value)||0})} className="input-field"/></div>
                      <div><label className="label-text">Taxa Gateway (%)</label><input type="number" step="0.01" value={formData.gatewayFeeRate} onChange={e => setFormData({...formData, gatewayFeeRate: parseFloat(e.target.value)||0})} className="input-field"/></div>
                   </div>
                </div>
              )}

              {activeTab === 'variants' && (
                  <div className="space-y-6">
                      {/* Add New Variant Section */}
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                          <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2"><Plus size={16}/> Adicionar Nova Variação</h4>
                          <div className="grid grid-cols-12 gap-3 items-end">
                              <div className="col-span-12 sm:col-span-3">
                                  <label className="label-text">Nome/Atributos</label>
                                  <input 
                                    type="text" 
                                    placeholder="Ex: Azul - M" 
                                    className="input-field" 
                                    value={newVariant.name} 
                                    onChange={e => {
                                        const name = e.target.value;
                                        // Auto-gen SKU logic if SKU is empty and parent has SKU
                                        let sku = newVariant.sku;
                                        if (!sku && formData.sku) {
                                            const suffix = name.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                            sku = `${formData.sku}-${suffix}`;
                                        }
                                        setNewVariant({...newVariant, name, sku});
                                    }} 
                                  />
                              </div>
                              <div className="col-span-12 sm:col-span-3">
                                  <label className="label-text">SKU da Variação</label>
                                  <input type="text" placeholder="SKU-VAR" className="input-field" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} />
                              </div>
                              <div className="col-span-6 sm:col-span-2">
                                  <label className="label-text">Preço</label>
                                  <input type="number" className="input-field" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: parseFloat(e.target.value)})} />
                              </div>
                              <div className="col-span-6 sm:col-span-2">
                                  <label className="label-text">Estoque</label>
                                  <input type="number" className="input-field" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: parseInt(e.target.value)})} />
                              </div>
                              <div className="col-span-12 sm:col-span-2">
                                  <button type="button" onClick={handleAddVariant} disabled={!newVariant.name} className="btn-primary w-full h-[38px] flex items-center justify-center gap-2 text-sm"><Plus size={16}/> Adicionar</button>
                              </div>
                          </div>
                      </div>

                      {/* Variants List */}
                      <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 uppercase font-bold px-2">
                              <div className="col-span-4 sm:col-span-3">Variação</div>
                              <div className="col-span-3 sm:col-span-3">SKU</div>
                              <div className="col-span-2 sm:col-span-2 text-right">Preço</div>
                              <div className="col-span-2 sm:col-span-2 text-center">Estoque</div>
                              <div className="col-span-1 sm:col-span-2 text-center">Ações</div>
                          </div>
                          
                          <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {formData.variants?.map(v => (
                                <div key={v.id} className="grid grid-cols-12 gap-2 items-center bg-black/30 p-2 rounded border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="col-span-4 sm:col-span-3">
                                        <input type="text" className="input-field text-xs py-1.5 border-transparent bg-transparent hover:bg-black/20 focus:bg-black/40 focus:border-white/20 transition-all" value={v.name} onChange={e => handleUpdateVariant(v.id, 'name', e.target.value)} />
                                    </div>
                                    <div className="col-span-3 sm:col-span-3">
                                        <input type="text" className="input-field text-xs py-1.5 border-transparent bg-transparent hover:bg-black/20 focus:bg-black/40 focus:border-white/20 transition-all" value={v.sku} onChange={e => handleUpdateVariant(v.id, 'sku', e.target.value)} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-2">
                                        <input type="number" className="input-field text-xs py-1.5 text-right border-transparent bg-transparent hover:bg-black/20 focus:bg-black/40 focus:border-white/20 transition-all" value={v.price} onChange={e => handleUpdateVariant(v.id, 'price', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-2">
                                        <input type="number" className="input-field text-xs py-1.5 text-center border-transparent bg-transparent hover:bg-black/20 focus:bg-black/40 focus:border-white/20 transition-all" value={v.stock} onChange={e => handleUpdateVariant(v.id, 'stock', parseInt(e.target.value))} />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 text-center">
                                        <button type="button" onClick={() => handleRemoveVariant(v.id)} className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                          </div>
                          
                          {(!formData.variants || formData.variants.length === 0) && (
                              <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                                  <Layers size={32} className="mx-auto text-slate-600 mb-2"/>
                                  <p className="text-slate-400 font-medium">Nenhuma variação adicionada.</p>
                                  <p className="text-xs text-slate-500">Este produto será tratado como "Produto Simples".</p>
                              </div>
                          )}

                          {formData.variants && formData.variants.length > 0 && (
                             <div className="flex justify-end pt-2 border-t border-white/10">
                                 <div className="text-right">
                                     <div className="text-xs text-slate-500 uppercase font-bold">Total Estoque</div>
                                     <div className="text-xl font-bold text-rs-gold">{formData.variants.reduce((a,b)=>a+b.stock,0)} un.</div>
                                 </div>
                             </div>
                          )}
                      </div>
                  </div>
              )}

              {activeTab === 'suppliers' && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-md font-bold text-slate-300">Fornecedores Vinculados</h4>
                            <p className="text-[10px] text-slate-500">Defina o custo e quem é o principal para este produto.</p>
                        </div>
                        <button type="button" onClick={handleAddLink} className="btn-secondary text-xs p-1 px-2 flex items-center gap-1"><Plus size={14}/> Adicionar Vínculo</button>
                    </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 uppercase font-bold px-2">
                        <div className="col-span-1 text-center">Padrão</div>
                        <div className="col-span-6">Fornecedor</div>
                        <div className="col-span-4 text-right">Custo</div>
                        <div className="col-span-1"></div>
                    </div>
                    {currentLinks.map((link, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center bg-black/30 p-2 rounded">
                        <div className="col-span-1 text-center">
                            <button 
                                type="button" 
                                onClick={() => handleSetDefaultSupplier(index)}
                                className={`p-1 hover:scale-110 transition-transform ${link.isDefault ? 'text-rs-gold' : 'text-slate-600 hover:text-rs-gold/50'}`}
                                title={link.isDefault ? "Fornecedor Padrão" : "Definir como Padrão"}
                            >
                                <Star size={16} fill={link.isDefault ? "currentColor" : "none"} />
                            </button>
                        </div>
                        <div className="col-span-6 flex gap-2">
                          <select value={link.supplierId} onChange={e => handleUpdateLink(index, 'supplierId', e.target.value)} className="input-field text-xs w-full">
                            <option value="">Selecione...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                           <button 
                                type="button" 
                                onClick={() => setQuickSupplierOpen(true)} 
                                className="bg-white/10 hover:bg-white/20 text-slate-300 rounded px-2"
                                title="Cadastrar Novo Fornecedor Rapidamente"
                            >
                                <UserPlus size={14}/>
                            </button>
                        </div>
                        <div className="col-span-4">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                            <input type="number" step="0.01" value={link.costPrice} onChange={e => handleUpdateLink(index, 'costPrice', parseFloat(e.target.value)||0)} className="input-field pl-6 text-xs text-right"/>
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          <button type="button" onClick={() => handleRemoveLink(index)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                    {currentLinks.length === 0 && <p className="text-xs text-center text-slate-500 py-4">Nenhum fornecedor vinculado a este produto.</p>}
                  </div>
                 </div>
              )}
            </div>
            <div className="mt-auto p-6 border-t border-white/10 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Produto</button>
            </div>
        </form>
      </ModalWrapper>

      {/* QUICK ADD SUPPLIER MODAL */}
      <ModalWrapper isOpen={isQuickSupplierOpen} onClose={() => setQuickSupplierOpen(false)} title="Cadastro Rápido de Fornecedor" size="md">
           <form onSubmit={handleSaveQuickSupplier} className="p-6 space-y-4">
                <div><label className="label-text">Nome da Empresa</label><input type="text" required value={newSupplierData.name} onChange={e => setNewSupplierData({...newSupplierData, name: e.target.value})} className="input-field" placeholder="Ex: Fornecedor Express"/></div>
                <div><label className="label-text">Contato Principal</label><input type="text" value={newSupplierData.contactPerson} onChange={e => setNewSupplierData({...newSupplierData, contactPerson: e.target.value})} className="input-field" placeholder="Ex: João Silva"/></div>
                <div className="grid grid-cols-2 gap-4">
                     <div><label className="label-text">Telefone</label><input type="text" value={newSupplierData.phone} onChange={e => setNewSupplierData({...newSupplierData, phone: e.target.value})} className="input-field"/></div>
                     <div><label className="label-text">E-mail</label><input type="email" value={newSupplierData.email} onChange={e => setNewSupplierData({...newSupplierData, email: e.target.value})} className="input-field"/></div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setQuickSupplierOpen(false)} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar e Selecionar</button>
                </div>
           </form>
      </ModalWrapper>

      <style>{`
        .label-text { display: block; font-size: 0.75rem; font-weight: 500; color: #94a3b8; margin-bottom: 0.25rem; }
        .input-field { width: 100%; background-color: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: #e2e8f0; font-size: 0.875rem; outline: none; }
        .input-field:focus { border-color: #d4af37; }
        .btn-primary { background-color: #d4af37; color: #0a0a0a; font-weight: 700; padding: 0.5rem 1rem; border-radius: 0.5rem; }
        .btn-secondary { background-color: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.5rem 1rem; border-radius: 0.5rem; }
      `}</style>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            isActive ? 'border-rs-gold text-rs-gold' : 'border-transparent text-slate-400 hover:text-slate-100'
        }`}
    >
        {icon} {label}
    </button>
);
