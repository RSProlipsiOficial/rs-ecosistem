import React, { useMemo, useState } from 'react';
import { CheckCircle, Copy, Edit2, ExternalLink, Eye, Globe, Package, Plus, Power, Search, Tag, Trash2 } from 'lucide-react';
import { GlobalProduct, Product, User } from '../types';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';
import { useNotifier } from '../contexts/NotificationContext';

interface CatalogManagerProps {
  currentUser: User;
  globalProducts: GlobalProduct[];
  products: Product[];
  onActivate: (gp: GlobalProduct) => Promise<void> | void;
  onUpdateGlobalProduct: (products: GlobalProduct[]) => void;
  onCreateGlobalProduct?: (product: Omit<GlobalProduct, 'id'>) => Promise<GlobalProduct>;
  onPatchGlobalProduct?: (product: GlobalProduct) => Promise<GlobalProduct>;
  onDeleteGlobalProduct?: (productId: string) => Promise<void>;
}

const EMPTY_GLOBAL_PRODUCT: Omit<GlobalProduct, 'id'> = {
  name: '',
  sku: '',
  category: '',
  description: '',
  imageUrl: '',
  videoUrl: '',
  suggestedPrice: 0,
  memberPrice: 0,
  minAllowedPrice: 0,
  maxAllowedPrice: 0,
  defaultCommissionPercent: 0,
  points: 0,
  stockLevel: 0,
  isActive: true,
};

const formatCurrency = (value?: number) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const parseNumber = (value: string | number | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const MARKETPLACE_URL = (((import.meta as any).env?.VITE_RS_MARKETPLACE_URL as string) || 'http://localhost:3003').replace(/\/$/, '');

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  currentUser,
  globalProducts,
  products,
  onActivate,
  onUpdateGlobalProduct,
  onCreateGlobalProduct,
  onPatchGlobalProduct,
  onDeleteGlobalProduct,
}) => {
  if (currentUser.role === 'Admin') {
    return (
      <AdminView
        globalProducts={globalProducts}
        onUpdate={onUpdateGlobalProduct}
        onCreate={onCreateGlobalProduct}
        onPatch={onPatchGlobalProduct}
        onDelete={onDeleteGlobalProduct}
      />
    );
  }

  return <LogistaView currentUser={currentUser} globalProducts={globalProducts} userProducts={products} onActivate={onActivate} />;
};

interface AdminViewProps {
  globalProducts: GlobalProduct[];
  onUpdate: (products: GlobalProduct[]) => void;
  onCreate?: (product: Omit<GlobalProduct, 'id'>) => Promise<GlobalProduct>;
  onPatch?: (product: GlobalProduct) => Promise<GlobalProduct>;
  onDelete?: (productId: string) => Promise<void>;
}

const AdminView: React.FC<AdminViewProps> = ({ globalProducts, onUpdate, onCreate, onPatch, onDelete }) => {
  const { addToast } = useNotifier();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<GlobalProduct, 'id'>>(EMPTY_GLOBAL_PRODUCT);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(globalProducts.map((product) => String(product.category || '').trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [globalProducts]
  );

  const baseData = useMemo(() => {
    const byStatus =
      statusFilter === 'active'
        ? globalProducts.filter((item) => item.isActive)
        : statusFilter === 'inactive'
          ? globalProducts.filter((item) => !item.isActive)
          : globalProducts;

    if (categoryFilter === 'all') return byStatus;
    return byStatus.filter((item) => String(item.category || '').trim() === categoryFilter);
  }, [globalProducts, statusFilter, categoryFilter]);

  const table = useDataTable({
    initialData: baseData,
    searchKeys: ['name', 'sku', 'category', 'description'],
  });

  const handleOpenModal = (product?: GlobalProduct) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        ...product,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        videoUrl: product.videoUrl || '',
        memberPrice: product.memberPrice || product.minAllowedPrice || 0,
        points: product.points || 0,
        stockLevel: product.stockLevel || 0,
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_GLOBAL_PRODUCT);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!String(formData.name || '').trim()) {
      addToast('Informe o nome do produto do catálogo.', 'error');
      return;
    }

    if (!String(formData.sku || '').trim()) {
      addToast('Informe o SKU do produto do catálogo.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        if (onPatch) {
          await onPatch({ ...formData, id: editingId });
        } else {
          onUpdate(globalProducts.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item)));
        }
        addToast('Produto global atualizado com sucesso.', 'success');
      } else {
        if (onCreate) {
          await onCreate(formData);
        } else {
          onUpdate([...globalProducts, { ...formData, id: crypto.randomUUID() }]);
        }
        addToast('Produto global criado com sucesso.', 'success');
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData(EMPTY_GLOBAL_PRODUCT);
    } catch (error: any) {
      addToast(error?.message || 'Erro ao salvar produto global.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Excluir este produto do catálogo RS? Ele será removido da visualização global.')) return;

    setIsDeletingId(productId);
    try {
      if (onDelete) {
        await onDelete(productId);
      } else {
        onUpdate(globalProducts.filter((item) => item.id !== productId));
      }
      addToast('Produto global removido com sucesso.', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Erro ao remover produto global.', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns: Column<GlobalProduct>[] = [
    {
      header: 'Produto',
      accessor: 'name',
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-rs-goldDim/20 bg-black/30">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                <Package size={16} />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-100">{product.name}</div>
            <div className="text-xs text-slate-500">{product.category || 'Sem categoria'} • {product.sku || 'Sem SKU'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Preço',
      accessor: 'suggestedPrice',
      sortable: true,
      render: (product) => (
        <div>
          <div className="font-semibold text-rs-gold">{formatCurrency(product.suggestedPrice)}</div>
          <div className="text-xs text-slate-500">mín. {formatCurrency(product.minAllowedPrice)}</div>
        </div>
      ),
    },
    {
      header: 'Pontos',
      accessor: 'points',
      sortable: true,
      render: (product) => <span className="font-semibold text-slate-200">{product.points || 0}</span>,
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (product) =>
        product.isActive ? (
          <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">Ativo</span>
        ) : (
          <span className="inline-flex rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-400">Inativo</span>
        ),
    },
    {
      header: 'Ações',
      accessor: 'id',
      render: (product) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleOpenModal(product)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-blue-400">
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => void handleDelete(product.id)}
            disabled={isDeletingId === product.id}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Catálogo Global RS</h2>
          <p className="text-sm text-slate-400">Gerencie os produtos oficiais da RS com dados reais do Supabase.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={18} />
          Novo Produto Global
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Produtos no catálogo" value={String(globalProducts.length)} />
        <SummaryCard label="Ativos" value={String(globalProducts.filter((item) => item.isActive).length)} />
        <SummaryCard label="Categorias" value={String(categories.length)} />
        <SummaryCard
          label="Preço médio"
          value={formatCurrency(
            globalProducts.length ? globalProducts.reduce((total, item) => total + Number(item.suggestedPrice || 0), 0) / globalProducts.length : 0
          )}
        />
      </div>

      <DataTable
        {...table}
        columns={columns}
        data={table.paginatedData}
        onSort={table.requestSort}
        onSearch={table.setSearchTerm}
        onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        searchPlaceholder="Buscar por nome, SKU, categoria ou descrição..."
        toolbarContent={
          <>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none">
              <option value="all">Todos os status</option>
              <option value="active">Somente ativos</option>
              <option value="inactive">Somente inativos</option>
            </select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none">
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </>
        }
      />

      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Produto Global RS' : 'Novo Produto Global RS'} size="4xl">
        <form onSubmit={handleSave} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome do Produto"><input type="text" value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} className="input-field" required /></FormField>
            <FormField label="SKU"><input type="text" value={formData.sku} onChange={(event) => setFormData((prev) => ({ ...prev, sku: event.target.value }))} className="input-field" required /></FormField>
            <FormField label="Categoria"><input type="text" value={formData.category || ''} onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))} className="input-field" /></FormField>
            <FormField label="Preço de Venda (R$)"><input type="number" min="0" step="0.01" value={formData.suggestedPrice} onChange={(event) => setFormData((prev) => ({ ...prev, suggestedPrice: parseNumber(event.target.value) }))} className="input-field" /></FormField>
            <FormField label="Preço Membro / Mínimo (R$)"><input type="number" min="0" step="0.01" value={formData.minAllowedPrice} onChange={(event) => setFormData((prev) => { const value = parseNumber(event.target.value); return { ...prev, minAllowedPrice: value, memberPrice: value }; })} className="input-field" /></FormField>
            <FormField label="Preço Máximo (R$)"><input type="number" min="0" step="0.01" value={formData.maxAllowedPrice} onChange={(event) => setFormData((prev) => ({ ...prev, maxAllowedPrice: parseNumber(event.target.value) }))} className="input-field" /></FormField>
            <FormField label="Pontuação PV"><input type="number" min="0" step="1" value={formData.points || 0} onChange={(event) => setFormData((prev) => ({ ...prev, points: parseNumber(event.target.value) }))} className="input-field" /></FormField>
            <FormField label="Comissão Padrão (%)"><input type="number" min="0" step="0.01" value={formData.defaultCommissionPercent || 0} onChange={(event) => setFormData((prev) => ({ ...prev, defaultCommissionPercent: parseNumber(event.target.value) }))} className="input-field" /></FormField>
          </div>

          <FormField label="Descrição do Produto"><textarea rows={4} value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} className="input-field" /></FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Imagem Principal (URL)"><input type="url" value={formData.imageUrl || ''} onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))} className="input-field" /></FormField>
            <FormField label="Vídeo (URL)"><input type="url" value={formData.videoUrl || ''} onChange={(event) => setFormData((prev) => ({ ...prev, videoUrl: event.target.value }))} className="input-field" /></FormField>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
            <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((prev) => ({ ...prev, isActive: event.target.checked }))} className="h-4 w-4 accent-rs-gold" />
            Produto ativo para CDs e lojistas
          </label>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">{isSaving ? 'Salvando...' : 'Salvar Produto Global'}</button>
          </div>
        </form>
      </ModalWrapper>

      <CatalogStyles />
    </div>
  );
};

interface LogistaViewProps {
  currentUser: User;
  globalProducts: GlobalProduct[];
  userProducts: Product[];
  onActivate: (gp: GlobalProduct) => Promise<void> | void;
}

const LogistaView: React.FC<LogistaViewProps> = ({ currentUser, globalProducts, userProducts, onActivate }) => {
  const { addToast } = useNotifier();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<GlobalProduct | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const normalized = (value: string) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const activatedProductsMap = useMemo(() => {
    const map = new Map<string, Product>();

    globalProducts.forEach((globalProduct) => {
      const matchedProduct = userProducts.find((product) => {
        if (product.globalProductId && product.globalProductId === globalProduct.id) return true;
        const skuMatch = normalized(product.sku || '') && normalized(product.sku || '') === normalized(globalProduct.sku || '');
        const nameMatch = normalized(product.name || '') && normalized(product.name || '') === normalized(globalProduct.name || '');
        return Boolean(skuMatch || nameMatch);
      });

      if (matchedProduct) {
        map.set(globalProduct.id, matchedProduct);
      }
    });

    return map;
  }, [globalProducts, userProducts]);

  const activatedProductIds = useMemo(() => new Set(Array.from(activatedProductsMap.keys())), [activatedProductsMap]);

  const resellerRef = useMemo(() => {
    const directId = String(currentUser.id || '').trim();
    if (directId) return directId;

    const emailPrefix = String(currentUser.email || '').split('@')[0]?.trim();
    return emailPrefix || 'rsprolipsi';
  }, [currentUser.email, currentUser.id]);

  const buildProductPageLink = (product: GlobalProduct) =>
    `${MARKETPLACE_URL}/loja/${encodeURIComponent(resellerRef)}?productId=${encodeURIComponent(product.id)}`;

  const buildCheckoutLink = (product: GlobalProduct) =>
    `${MARKETPLACE_URL}/loja/${encodeURIComponent(resellerRef)}?productId=${encodeURIComponent(product.id)}#/checkout`;

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast(successMessage, 'success');
    } catch {
      addToast('Nao foi possivel copiar o link.', 'error');
    }
  };

  const categories = useMemo(
    () =>
      Array.from(new Set(globalProducts.map((product) => String(product.category || '').trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [globalProducts]
  );

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return globalProducts
      .filter((product) => product.isActive)
      .filter((product) => (selectedCategory === 'all' ? true : String(product.category || '').trim() === selectedCategory))
      .filter((product) => (showOnlyAvailable ? !activatedProductIds.has(product.id) : true))
      .filter((product) => {
        if (!normalizedSearch) return true;
        return [product.name, product.sku, product.category, product.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      });
  }, [activatedProductIds, globalProducts, searchTerm, selectedCategory, showOnlyAvailable]);

  const handleActivate = async (product: GlobalProduct) => {
    setActivatingId(product.id);
    try {
      await onActivate(product);
      addToast(`Produto "${product.name}" ativado na sua operação.`, 'success');
    } catch (error: any) {
      addToast(error?.message || 'Erro ao ativar produto no CD.', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Catálogo RS para Operação do CD</h2>
          <p className="text-sm text-slate-400">Ative produtos oficiais na sua operação e aproveite o catálogo real da RS.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <SummaryCard label="Produtos ativos RS" value={String(globalProducts.filter((item) => item.isActive).length)} />
          <SummaryCard label="Já ativados no CD" value={String(activatedProductIds.size)} />
          <SummaryCard label="Categorias" value={String(categories.length)} />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-rs-goldDim/20 bg-rs-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nome, SKU, categoria ou descrição..." className="input-field pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none">
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button onClick={() => setShowOnlyAvailable((prev) => !prev)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${showOnlyAvailable ? 'border-rs-gold bg-rs-gold/10 text-rs-gold' : 'border-white/10 bg-black/30 text-slate-300'}`}>
            Mostrar só não ativados
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => {
          const activatedProduct = activatedProductsMap.get(product.id);
          const isActivated = Boolean(activatedProduct);
          const isBusy = activatingId === product.id;
          const pageLink = buildProductPageLink(product);
          const checkoutLink = buildCheckoutLink(product);

          return (
            <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-rs-goldDim/20 bg-rs-card">
              <div className="relative h-44 overflow-hidden bg-black/30">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-slate-500"><Package size={26} /></div>}
                <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-rs-gold">{product.category || 'Sem categoria'}</div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Banner oficial da campanha</div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-100">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{product.description || 'Sem descrição cadastrada.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoBadge icon={<Tag size={13} />} label="SKU" value={product.sku || 'Sem SKU'} />
                  <InfoBadge icon={<Globe size={13} />} label="PV" value={String(product.points || 0)} />
                  <InfoBadge icon={<Package size={13} />} label="Estoque RS" value={String(product.stockLevel || 0)} />
                  <InfoBadge icon={<Power size={13} />} label="Status" value={product.isActive ? 'Ativo' : 'Inativo'} />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Venda sugerida</div>
                    <div className="font-bold text-rs-gold">{formatCurrency(product.suggestedPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Faixa mínima</div>
                    <div className="font-bold text-slate-200">{formatCurrency(product.minAllowedPrice)}</div>
                  </div>
                </div>

                {isActivated ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                      <CheckCircle size={16} />
                      Produto ativo na sua loja
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">
                      Esse produto ja esta liberado na sua operacao de Drop. Use os links abaixo para divulgar ou mandar direto para o checkout.
                    </p>
                    <div className="mt-3 space-y-2">
                      <LinkActionRow
                        label="Link da pagina com afiliado"
                        value={pageLink}
                        onCopy={() => void copyToClipboard(pageLink, 'Link da pagina copiado.')}
                        onOpen={() => window.open(pageLink, '_blank', 'noopener,noreferrer')}
                      />
                      <LinkActionRow
                        label="Link direto de checkout"
                        value={checkoutLink}
                        onCopy={() => void copyToClipboard(checkoutLink, 'Link de checkout copiado.')}
                        onOpen={() => window.open(checkoutLink, '_blank', 'noopener,noreferrer')}
                      />
                    </div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Produto local: {activatedProduct?.name || product.name}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-rs-goldDim/20 bg-black/20 p-3 text-sm">
                    <div className="font-bold text-rs-gold">Ativar em minha loja</div>
                    <p className="mt-2 leading-6 text-slate-300">
                      Ativar cria a revenda do produto no seu Drop. Depois disso, voce recebe o link da pagina do produto com seu afiliado e o link direto do checkout.
                    </p>
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <button onClick={() => setPreviewProduct(product)} className="btn-secondary flex flex-1 items-center justify-center gap-2">
                    <Eye size={15} />
                    Ver detalhes
                  </button>
                  <button onClick={() => void handleActivate(product)} disabled={isActivated || isBusy} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${isActivated ? 'cursor-not-allowed bg-emerald-500/10 text-emerald-400' : 'bg-rs-gold text-rs-black hover:bg-yellow-500 disabled:opacity-60'}`}>
                    {isActivated ? <><CheckCircle size={16} />Ativo na loja</> : isBusy ? 'Ativando...' : <><Power size={16} />Ativar em minha loja</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleProducts.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 bg-rs-card p-8 text-center text-sm text-slate-500">Nenhum produto do catálogo encontrado com os filtros atuais.</div> : null}

      <ModalWrapper isOpen={Boolean(previewProduct)} onClose={() => setPreviewProduct(null)} title={previewProduct ? `Catálogo RS • ${previewProduct.name}` : 'Detalhes do produto'} size="4xl">
        {previewProduct ? (() => {
          const activatedProduct = activatedProductsMap.get(previewProduct.id);
          const isActivated = Boolean(activatedProduct);
          const pageLink = buildProductPageLink(previewProduct);
          const checkoutLink = buildCheckoutLink(previewProduct);
          const isBusy = activatingId === previewProduct.id;

          return (
            <div className="space-y-6 p-6">
              <div className="grid gap-6 md:grid-cols-[320px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-rs-goldDim/20 bg-black/30">
                  {previewProduct.imageUrl ? <img src={previewProduct.imageUrl} alt={previewProduct.name} className="h-full min-h-[280px] w-full object-cover" /> : <div className="flex h-full min-h-[280px] w-full items-center justify-center text-slate-500"><Package size={28} /></div>}
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 inline-flex rounded-full bg-rs-gold/10 px-3 py-1 text-xs font-bold text-rs-gold">{previewProduct.category || 'Sem categoria'}</div>
                    <h3 className="text-2xl font-bold text-slate-100">{previewProduct.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{previewProduct.description || 'Sem descrição cadastrada.'}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoPanel label="SKU" value={previewProduct.sku || 'Sem SKU'} />
                    <InfoPanel label="PV" value={String(previewProduct.points || 0)} />
                    <InfoPanel label="Preço sugerido" value={formatCurrency(previewProduct.suggestedPrice)} />
                    <InfoPanel label="Preço mínimo" value={formatCurrency(previewProduct.minAllowedPrice)} />
                    <InfoPanel label="Preço máximo" value={formatCurrency(previewProduct.maxAllowedPrice)} />
                    <InfoPanel label="Comissão padrão" value={`${Number(previewProduct.defaultCommissionPercent || 0).toFixed(2)}%`} />
                  </div>
                  {previewProduct.videoUrl ? <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm"><div className="mb-1 text-xs uppercase tracking-wide text-slate-500">Vídeo do produto</div><a href={previewProduct.videoUrl} target="_blank" rel="noreferrer" className="text-rs-gold hover:underline">Abrir vídeo em nova aba</a></div> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-rs-goldDim/20 bg-black/20 p-4">
                <div className="text-sm font-bold text-rs-gold">Revenda Drop e links de conversão</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ao ativar esse produto na sua loja, ele fica disponível para revenda na sua operação e libera o link da página com sua referência e o link direto do checkout.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => void handleActivate(previewProduct)} disabled={isActivated || isBusy} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${isActivated ? 'cursor-not-allowed bg-emerald-500/10 text-emerald-400' : 'bg-rs-gold text-rs-black hover:bg-yellow-500 disabled:opacity-60'}`}>
                    {isActivated ? <><CheckCircle size={16} />Produto ativo</> : isBusy ? 'Ativando...' : <><Power size={16} />Ativar em minha loja</>}
                  </button>
                  <button onClick={() => window.open(pageLink, '_blank', 'noopener,noreferrer')} className="btn-secondary flex items-center gap-2">
                    <ExternalLink size={15} />
                    Abrir página do produto
                  </button>
                  <button onClick={() => window.open(checkoutLink, '_blank', 'noopener,noreferrer')} className="btn-secondary flex items-center gap-2">
                    <ExternalLink size={15} />
                    Abrir checkout direto
                  </button>
                </div>
              </div>

              {isActivated ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <CheckCircle size={16} />
                    Produto já ativado na sua loja
                  </div>
                  <div className="mt-4 space-y-3">
                    <LinkActionRow
                      label="Link da página com afiliado"
                      value={pageLink}
                      onCopy={() => void copyToClipboard(pageLink, 'Link da página copiado.')}
                      onOpen={() => window.open(pageLink, '_blank', 'noopener,noreferrer')}
                    />
                    <LinkActionRow
                      label="Link direto de checkout"
                      value={checkoutLink}
                      onCopy={() => void copyToClipboard(checkoutLink, 'Link de checkout copiado.')}
                      onOpen={() => window.open(checkoutLink, '_blank', 'noopener,noreferrer')}
                    />
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Produto local: {activatedProduct?.name || previewProduct.name}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })() : null}
      </ModalWrapper>

      <CatalogStyles />
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-rs-goldDim/20 bg-rs-card p-4">
    <div className="text-[11px] uppercase tracking-widest text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-black text-slate-100">{value}</div>
  </div>
);

const InfoBadge: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-500">{icon}{label}</div>
    <div className="font-semibold text-slate-200">{value}</div>
  </div>
);

const InfoPanel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
    <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
  </div>
);

const LinkActionRow: React.FC<{ label: string; value: string; onCopy: () => void; onOpen: () => void }> = ({ label, value, onCopy, onOpen }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    <div className="flex items-center gap-2">
      <div className="flex-1 truncate rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200">{value}</div>
      <button type="button" onClick={onCopy} className="rounded-lg border border-white/10 bg-black/30 p-2 text-slate-300 transition hover:border-rs-goldDim/40 hover:text-rs-gold">
        <Copy size={15} />
      </button>
      <button type="button" onClick={onOpen} className="rounded-lg border border-white/10 bg-black/30 p-2 text-slate-300 transition hover:border-rs-goldDim/40 hover:text-rs-gold">
        <ExternalLink size={15} />
      </button>
    </div>
  </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

const CatalogStyles = () => (
  <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.65rem 1rem;border-radius:0.75rem;transition:all .2s ease}.btn-primary:hover{background-color:#e6c24a}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;padding:0.65rem 1rem;border-radius:0.75rem;transition:all .2s ease}.btn-secondary:hover{border-color:rgba(212,175,55,.45);color:#fff}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.65rem 0.85rem;color:#e2e8f0;outline:none}.input-field:focus{border-color:rgba(212,175,55,.45)}`}</style>
);
