import React, { useState, useMemo, useEffect } from 'react';
import { Product, Supplier, ProductSupplier, User, ProductVariant, ProductReview, DistributionCenter, ProductStockLocation, ProductPageTemplate, Experiment } from '../types';
import { Edit2, Trash2, Plus, Building, Info, Layers, Star, ShoppingCart, Truck, Globe, Warehouse, Gift, X, Image as ImageIcon, TestTube2, Store } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { useProducts } from '../contexts/ProductContext';
import { ProductPageEditor } from './ProductPageEditor';
import { useNotifier } from '../contexts/NotificationContext';
import { TabButton } from './TabButton';

interface ProductManagerProps {
  suppliers: Supplier[];
  currentUser: User;
  users: User[];
  reviews: ProductReview[];
  distributionCenters: DistributionCenter[];
  stockLocations: ProductStockLocation[];
  productPageTemplates: ProductPageTemplate[];
  experiments: Experiment[];
  onUpdateStockLocations: (productId: string, locations: ProductStockLocation[]) => void;
  onUpdateReview: (review: ProductReview) => void;
  onAddSupplier: (s: Omit<Supplier, 'id' | 'userId'>) => void;
  onViewOrders: (productName: string) => void;
  onUpdateProductPageTemplates: (templates: ProductPageTemplate[]) => void;
  targetProductId?: string | null;
  onClearTargetProduct?: () => void;
}

const EMPTY_PRODUCT: Omit<Product, 'id' | 'userId'> = {
  name: '', sku: '', category: '', salePrice: 0, shippingCost: 0, shippingCharged: 0,
  gatewayFeeRate: 4.99, currentStock: 0, minStock: 5, status: 'Active',
  variants: [], weightKg: 0, dimensions: { lengthCm: 0, widthCm: 0, heightCm: 0 },
  productType: 'simple',
  bundleConfig: { items: [], pricing: { type: 'fixed_price', value: 0 } },
  pageLayout: { mainLayout: 'image-left', blocks: [{type: 'description'}]},
  affiliateCommissionPercent: 0,
  visibility: ['loja', 'marketplace'],
};

type ProductWithMetrics = Product & {
  cost: number;
  profit: number;
};

export const ProductManager: React.FC<ProductManagerProps> = ({ 
    suppliers, currentUser, users, reviews, onUpdateReview, onAddSupplier, onViewOrders, 
    targetProductId, onClearTargetProduct, distributionCenters, stockLocations, onUpdateStockLocations,
    productPageTemplates, onUpdateProductPageTemplates, experiments
}) => {
  const { products, productSuppliers, addProduct, updateProduct, deleteProduct, updateProductSuppliers } = useProducts();
  const { addToast } = useNotifier();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'userId'>>(EMPTY_PRODUCT);
  const [currentLinks, setCurrentLinks] = useState<ProductSupplier[]>([]);
  const [currentStockLocations, setCurrentStockLocations] = useState<ProductStockLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'suppliers' | 'variants' | 'shipping' | 'reviews' | 'stock' | 'bundle' | 'page-editor' | 'ab-tests'>('details');

  const [newBundleItem, setNewBundleItem] = useState({ productId: '', quantity: 1 });
  const simpleProducts = useMemo(() => products.filter(p => p.productType !== 'bundle'), [products]);

  const [isQuickSupplierOpen, setQuickSupplierOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState<Omit<Supplier, 'id' | 'userId'>>({ name: '', contactPerson: '', email: '', phone: '' });
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ name: '', sku: '', price: 0, costPrice: 0, stock: 0, minStock: 0 });

  const getLowestCost = (productId: string) => productSuppliers.filter(ps => ps.productId === productId).map(ps => ps.costPrice).reduce((min, p) => p < min ? p : min, Infinity);
  const calculateEstProfit = (p: Product, costPrice: number) => p.salePrice - costPrice;
  
  const tableData: ProductWithMetrics[] = useMemo(() => {
      return products.map(p => ({ ...p, cost: getLowestCost(p.id), profit: calculateEstProfit(p, getLowestCost(p.id)) }));
  }, [products, productSuppliers]);
  
  const table = useDataTable({ initialData: tableData, searchKeys: ['name', 'sku'] });

  useEffect(() => {
      if (targetProductId) {
          const target = products.find(p => p.id === targetProductId);
          if (target) handleOpenModal(target);
          if (onClearTargetProduct) onClearTargetProduct();
      }
  }, [targetProductId, products, onClearTargetProduct]);

  // PRT-302: Quick Toggle
  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';
    updateProduct({ ...product, status: newStatus });
    addToast(`Produto "${product.name}" ${newStatus === 'Active' ? 'ativado' : 'inativado'} com sucesso.`, 'success');
  };

  const columns: Column<ProductWithMetrics>[] = [
    { header: 'Produto', accessor: 'name', sortable: true, render: p => (
        <div className="relative pl-2">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
            <div className={`font-bold flex items-center gap-2 ${p.status === 'Active' ? 'text-slate-100' : 'text-slate-500'}`}>
                {p.productType === 'bundle' && <Gift size={14} className="text-purple-400" />}
                {p.name}
            </div>
            <div className="flex gap-2 text-xs text-slate-500 font-mono"><span>{p.sku || 'SEM SKU'}</span></div>
        </div>
    )},
    { 
        header: 'Ativo', accessor: 'status', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center', 
        render: p => (
            <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="sr-only peer" checked={p.status === 'Active'} onChange={() => handleToggleStatus(p)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rs-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
        )
    },
    {
        header: 'Canais', accessor: 'visibility', headerClassName: 'text-center', cellClassName: 'text-center',
        render: p => (
            <div className="flex items-center justify-center gap-1">
                <div title={p.visibility?.includes('loja') ? "Visível na Loja" : "Oculto"} className={`p-1 rounded ${p.visibility?.includes('loja') ? 'text-blue-400 bg-blue-500/10' : 'text-slate-700'}`}><Store size={14} /></div>
                <div title={p.visibility?.includes('marketplace') ? "Visível no Marketplace" : "Oculto"} className={`p-1 rounded ${p.visibility?.includes('marketplace') ? 'text-purple-400 bg-purple-500/10' : 'text-slate-700'}`}><Globe size={14} /></div>
            </div>
        )
    },
    { header: 'Estoque', accessor: 'currentStock', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center', render: p => <span className={`font-medium ${p.currentStock <= p.minStock ? 'text-red-400' : 'text-slate-300'}`}>{p.currentStock}</span>},
    { header: 'Preço', accessor: 'salePrice', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right text-slate-200 font-medium', render: p => `R$ ${p.salePrice.toFixed(2)}`},
    { header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center', render: p => (
        <div className="flex items-center justify-center gap-2">
            <button onClick={() => onViewOrders(p.name)} className="p-2 text-slate-400 hover:text-emerald-400"><ShoppingCart size={16}/></button>
            <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
            {currentUser.role === 'Admin' && <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>}
        </div>
    )}
  ];

  const handleOpenModal = (product?: Product) => {
    setActiveTab('details');
    if (product) {
      setEditingId(product.id);
      setFormData({ ...EMPTY_PRODUCT, ...product });
      setCurrentLinks(productSuppliers.filter(ps => ps.productId === product.id));
      setCurrentStockLocations(stockLocations.filter(sl => sl.productId === product.id));
    } else {
      setEditingId(null);
      setFormData(EMPTY_PRODUCT);
      setCurrentLinks([]);
      setCurrentStockLocations([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let finalData = { ...formData };

    // PRT-300: Validação de SKU Único
    const allSkus = new Set<string>();
    products.forEach(p => {
        if (p.id === editingId) return; // Exclude self
        if (p.sku) allSkus.add(p.sku.toLowerCase());
        p.variants?.forEach(v => {
            if(v.sku) allSkus.add(v.sku.toLowerCase());
        });
    });

    const skusToCheck = [finalData.sku, ...(finalData.variants?.map(v => v.sku) || [])].filter(Boolean).map(s => s!.toLowerCase());
    
    for(const sku of skusToCheck) {
        if(allSkus.has(sku)) {
            addToast(`Este SKU já está em uso: "${sku.toUpperCase()}". Escolha outro.`, 'error');
            return;
        }
    }
    
    // Check for duplicates within the form itself
    const formSkus = new Set<string>();
    for(const sku of skusToCheck) {
        if(formSkus.has(sku)) {
            addToast(`SKU duplicado dentro do mesmo produto: "${sku.toUpperCase()}".`, 'error');
            return;
        }
        formSkus.add(sku);
    }
    
    // PRT-301: Validação de Margem (Preço x Custo)
    if (finalData.productType === 'simple' && (!finalData.variants || finalData.variants.length === 0)) {
        // Usa currentLinks (estado local do formulário) para validar novos produtos
        const costs = currentLinks.map(l => l.costPrice);
        if (costs.length > 0) {
            const lowestCost = Math.min(...costs);
            if (finalData.salePrice < lowestCost) {
                addToast(`PREJUÍZO: O preço de venda (R$${finalData.salePrice.toFixed(2)}) é menor que o custo do fornecedor (R$${lowestCost.toFixed(2)}).`, 'error');
                return;
            }
        }
    }

    if (finalData.variants && finalData.variants.length > 0) {
        for (const variant of finalData.variants) {
            if (variant.costPrice > 0 && variant.price < variant.costPrice) {
                addToast(`VARIAÇÃO COM PREJUÍZO: "${variant.name}" tem preço menor que o custo.`, 'error');
                return;
            }
        }
    }

    // Save Logic
    if (editingId) {
      const originalProduct = products.find(p => p.id === editingId);
      if(originalProduct) {
        updateProduct({ ...finalData, id: editingId, userId: originalProduct.userId });
        updateProductSuppliers(editingId, currentLinks);
        onUpdateStockLocations(editingId, currentStockLocations);
      }
    } else {
      const newId = crypto.randomUUID();
      addProduct({ ...finalData, id: newId, userId: currentUser.id });
      updateProductSuppliers(newId, currentLinks.map(l => ({ ...l, productId: newId })));
      onUpdateStockLocations(newId, currentStockLocations.map(sl => ({ ...sl, productId: newId })));
    }
    
    // PRT-301: Stock Alert
    const variantStock = finalData.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
    const actualStock = finalData.variants && finalData.variants.length > 0 ? variantStock : finalData.currentStock;

    if (actualStock < finalData.minStock) {
        addToast(`Aviso: O estoque atual (${actualStock}) está abaixo do estoque mínimo (${finalData.minStock}).`, 'info');
    } else {
        addToast(`Produto "${finalData.name}" salvo com sucesso!`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleLinkChange = (index: number, field: keyof ProductSupplier, value: any) => {
      const newLinks = [...currentLinks];
      (newLinks[index] as any)[field] = value;
      setCurrentLinks(newLinks);
  };

  // PRT-303: Visibilidade UI
  const handleVisibilityChange = (channel: 'loja' | 'marketplace', checked: boolean) => {
    const currentVisibility = formData.visibility || [];
    let newVisibility: ('loja' | 'marketplace')[];
    if (checked) newVisibility = [...currentVisibility, channel];
    else newVisibility = currentVisibility.filter(c => c !== channel);
    setFormData({ ...formData, visibility: newVisibility });
  };

  // Variants handlers
  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    if (newVariants[index]) {
        (newVariants[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    }
  };

  const handleAddVariant = () => {
      if (!newVariant.name || !newVariant.sku) {
          addToast('Preencha Nome e SKU da variação.', 'error');
          return;
      }
      const newVariants = [...(formData.variants || []), { ...newVariant, id: crypto.randomUUID() } as ProductVariant];
      setFormData(prev => ({ ...prev, variants: newVariants }));
      setNewVariant({ name: '', sku: '', price: 0, costPrice: 0, stock: 0, minStock: 0 });
  };

  const handleRemoveVariant = (id: string) => {
      setFormData(prev => ({ ...prev, variants: (prev.variants || []).filter(v => v.id !== id) }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-rs-gold">Meus Produtos</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Produto</button>
      </div>
      
      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por nome ou SKU..."/>
      
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Produto' : 'Novo Produto'} size="5xl">
         <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
             <div className="border-b border-white/10 px-6 shrink-0">
                 <div className="flex gap-1 overflow-x-auto">
                     <TabButton icon={<Info size={16}/>} label="Dados Principais" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
                     <TabButton icon={<ImageIcon size={16}/>} label="Página do Produto" isActive={activeTab === 'page-editor'} onClick={() => setActiveTab('page-editor')} />
                     <TabButton icon={<TestTube2 size={16}/>} label="Testes A/B" isActive={activeTab === 'ab-tests'} onClick={() => setActiveTab('ab-tests')} />
                     <TabButton icon={<Gift size={16}/>} label="Kit (Bundle)" isActive={activeTab === 'bundle'} onClick={() => setActiveTab('bundle')} />
                     <TabButton icon={<Building size={16}/>} label="Fornecedores" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                     <TabButton icon={<Warehouse size={16}/>} label="Estoque" isActive={activeTab === 'stock'} onClick={() => setActiveTab('stock')} />
                     <TabButton icon={<Layers size={16}/>} label="Variações" isActive={activeTab === 'variants'} onClick={() => setActiveTab('variants')} />
                     <TabButton icon={<Truck size={16}/>} label="Frete" isActive={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} />
                 </div>
             </div>
             <div className="p-6 overflow-y-auto flex-1">
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <div><label className="label-text">Nome do Produto</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label-text">SKU</label><input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-field"/></div>
                                <div><label className="label-text">Categoria</label><input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field"/></div>
                            </div>
                             {/* PRT-303 UI */}
                            <div>
                                <label className="label-text">Visibilidade do Produto</label>
                                <div className="flex gap-4 p-3 bg-black/20 rounded-lg">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                                        <input type="checkbox" className="accent-rs-gold" checked={formData.visibility?.includes('loja') ?? false} onChange={e => handleVisibilityChange('loja', e.target.checked)}/> Loja Própria
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                                        <input type="checkbox" className="accent-rs-gold" checked={formData.visibility?.includes('marketplace') ?? false} onChange={e => handleVisibilityChange('marketplace', e.target.checked)}/> Marketplace RS
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div><label className="label-text">Preço de Venda (R$)</label><input type="number" step="0.01" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                             <div><label className="label-text">Estoque Mínimo</label><input type="number" min="0" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} className="input-field"/></div>
                             <div><label className="label-text">Estoque Total</label><input type="number" readOnly value={formData.currentStock} className="input-field bg-black/20"/></div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'suppliers' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-300">Fornecedores Vinculados</h3></div>
                        <div className="space-y-2">
                            {currentLinks.map((link, index) => {
                                const supplierName = suppliers.find(s => s.id === link.supplierId)?.name || 'Desconhecido';
                                return (
                                    <div key={index} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <div className="flex-1 text-sm font-bold text-slate-300">{supplierName}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Custo: R$</span>
                                            <input type="number" step="0.01" value={link.costPrice} onChange={e => handleLinkChange(index, 'costPrice', parseFloat(e.target.value) || 0)} className="input-field-sm w-24"/>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <label className="text-xs text-slate-500 mb-1 block">Vincular Fornecedor Existente</label>
                                <select className="input-field" onChange={(e) => { if (e.target.value) { setCurrentLinks([...currentLinks, { productId: editingId || 'temp', supplierId: e.target.value, costPrice: 0, isDefault: currentLinks.length === 0 }]); e.target.value = ""; }}}>
                                    <option value="">Selecione para adicionar...</option>
                                    {suppliers.filter(s => !currentLinks.some(cl => cl.supplierId === s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'variants' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-300">Variações</h3>
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
                            {(formData.variants || []).map((variant, index) => (
                                <div key={variant.id} className="grid grid-cols-6 gap-2 items-center bg-white/5 p-2 rounded">
                                    <input type="text" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} className="input-field-sm col-span-1" placeholder="Nome" />
                                    <input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} className="input-field-sm col-span-1" placeholder="SKU" />
                                    <input type="number" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)} className="input-field-sm col-span-1" placeholder="Preço" />
                                    <input type="number" step="0.01" value={variant.costPrice} onChange={e => handleVariantChange(index, 'costPrice', parseFloat(e.target.value) || 0)} className="input-field-sm col-span-1" placeholder="Custo" />
                                    <input type="number" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)} className="input-field-sm col-span-1" placeholder="Estoque" />
                                    <button type="button" onClick={() => handleRemoveVariant(variant.id)} className="p-1 text-red-400"><X size={14} /></button>
                                </div>
                            ))}
                            <div className="flex gap-2 pt-3 border-t border-white/10">
                                <input type="text" value={newVariant.name} onChange={e => setNewVariant({...newVariant, name: e.target.value})} className="input-field flex-1" placeholder="Nome (Ex: Azul G)"/>
                                <input type="text" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} className="input-field w-24" placeholder="SKU"/>
                                <input type="number" step="0.01" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: parseFloat(e.target.value) || 0})} className="input-field w-24" placeholder="Preço"/>
                                <input type="number" step="0.01" value={newVariant.costPrice} onChange={e => setNewVariant({...newVariant, costPrice: parseFloat(e.target.value) || 0})} className="input-field w-24" placeholder="Custo"/>
                                <input type="number" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: parseInt(e.target.value) || 0})} className="input-field w-20" placeholder="Estoque"/>
                                <button type="button" onClick={handleAddVariant} className="btn-secondary">Adicionar</button>
                            </div>
                        </div>
                    </div>
                )}
             </div>
             <div className="p-4 border-t border-white/10 flex justify-end shrink-0">
                 <button type="submit" className="btn-primary flex items-center gap-2"><Plus size={18} /> Salvar Produto</button>
             </div>
         </form>
      </ModalWrapper>
      <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.input-field-sm{background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.3rem;padding:0.3rem 0.5rem;color:#e2e8f0;font-size:0.8rem;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
    </div>
  );
};