import React, { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Edit2,
  Eye,
  FlaskConical,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import {
  DistributionCenter,
  Experiment,
  Product,
  ProductPageLayout,
  ProductPageTemplate,
  ProductStockLocation,
  ProductSupplier,
  ProductVariant,
  ProductReview,
  Supplier,
  User,
} from '../types';
import { useProducts } from '../contexts/ProductContext';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable, Column } from './DataTable';
import { ModalWrapper } from './ModalWrapper';
import { TabButton } from './TabButton';
import { ProductPageEditor } from './ProductPageEditor';
import { useNotifier } from '../contexts/NotificationContext';

type ProductEditorTab =
  | 'details'
  | 'page'
  | 'ab-tests'
  | 'bundle'
  | 'suppliers'
  | 'stock'
  | 'variants'
  | 'shipping';

interface ProductManagerProps {
  suppliers: Supplier[];
  currentUser: User;
  users: User[];
  reviews: ProductReview[];
  onUpdateReview: (review: ProductReview) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<Supplier | void> | Supplier | void;
  onViewOrders: (productName: string) => void;
  distributionCenters: DistributionCenter[];
  stockLocations: ProductStockLocation[];
  onUpdateStockLocations: (productId: string, locations: ProductStockLocation[]) => void;
  productPageTemplates: ProductPageTemplate[];
  onUpdateProductPageTemplates: (templates: ProductPageTemplate[]) => void;
  experiments: Experiment[];
  targetProductId?: string | null;
  onClearTargetProduct?: () => void;
}

const DEFAULT_PAGE_LAYOUT: ProductPageLayout = {
  mainLayout: 'image-left',
  blocks: [{ type: 'description' }, { type: 'benefits' }, { type: 'faq' }, { type: 'cta' }],
};

const EMPTY_PRODUCT = (userId: string): Product => ({
  id: crypto.randomUUID(),
  name: '',
  sku: '',
  category: '',
  salePrice: 0,
  shippingCost: 0,
  shippingCharged: 0,
  gatewayFeeRate: 0,
  currentStock: 0,
  minStock: 5,
  status: 'Active',
  productType: 'simple',
  bundleConfig: {
    items: [],
    pricing: { type: 'fixed_price', value: 0 },
  },
  weightKg: 0,
  dimensions: {
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
  },
  variants: [],
  userId,
  pageLayout: DEFAULT_PAGE_LAYOUT,
  affiliateCommissionPercent: 0,
  visibility: ['loja', 'marketplace'],
});

const EMPTY_SUPPLIER_LINK = (productId: string): ProductSupplier => ({
  productId,
  supplierId: '',
  costPrice: 0,
  leadTimeDays: 0,
  isDefault: false,
});

const EMPTY_VARIANT = (): ProductVariant => ({
  id: crypto.randomUUID(),
  name: '',
  sku: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 0,
});

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const parseNumber = (value: string | number | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const PRODUCT_EDITOR_TABS: Array<{ id: ProductEditorTab; label: string; icon: React.ReactNode }> = [
  { id: 'details', label: 'Dados Principais', icon: <Package size={16} /> },
  { id: 'page', label: 'Página do Produto', icon: <ShoppingBag size={16} /> },
  { id: 'ab-tests', label: 'Testes A/B', icon: <FlaskConical size={16} /> },
  { id: 'bundle', label: 'Kit (Bundle)', icon: <Boxes size={16} /> },
  { id: 'suppliers', label: 'Fornecedores', icon: <Users size={16} /> },
  { id: 'stock', label: 'Estoque', icon: <Warehouse size={16} /> },
  { id: 'variants', label: 'Variações', icon: <Store size={16} /> },
  { id: 'shipping', label: 'Frete', icon: <Truck size={16} /> },
];

export const ProductManager: React.FC<ProductManagerProps> = ({
  suppliers,
  currentUser,
  onViewOrders,
  distributionCenters,
  stockLocations,
  productPageTemplates,
  onUpdateProductPageTemplates,
  experiments,
  targetProductId,
  onClearTargetProduct,
}) => {
  const { products, productSuppliers, addProduct, updateProduct, deleteProduct } = useProducts();
  const { addToast } = useNotifier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductEditorTab>('details');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>(EMPTY_PRODUCT(currentUser.id));
  const [supplierLinks, setSupplierLinks] = useState<ProductSupplier[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const table = useDataTable<Product>({
    initialData: products,
    searchKeys: ['name', 'sku', 'category'],
  });

  useEffect(() => {
    if (!targetProductId) return;
    const product = products.find((item) => item.id === targetProductId);
    if (!product) return;
    openModal(product);
    onClearTargetProduct?.();
  }, [targetProductId, products]);

  const experimentsByProduct = useMemo(() => {
    const map = new Map<string, Experiment[]>();
    experiments.forEach((experiment) => {
      const list = map.get(experiment.productId) || [];
      list.push(experiment);
      map.set(experiment.productId, list);
    });
    return map;
  }, [experiments]);

  const columns: Column<Product>[] = [
    {
      header: 'Produto',
      accessor: 'name',
      sortable: true,
      render: (product) => (
        <div>
          <div className="font-bold text-slate-100">{product.name}</div>
          <div className="text-xs text-slate-500">{product.sku || 'Sem SKU'} • {product.category || 'Sem categoria'}</div>
        </div>
      ),
    },
    {
      header: 'Ativo',
      accessor: 'status',
      sortable: true,
      render: (product) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
            product.status === 'Active'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          }`}
        >
          {product.status === 'Active' ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Canais',
      accessor: 'visibility',
      render: (product) => (
        <div className="flex flex-wrap gap-1">
          {(product.visibility || []).map((channel) => (
            <span key={channel} className="rounded bg-white/5 px-2 py-1 text-[11px] text-slate-300">
              {channel === 'loja' ? 'Loja Própria' : 'Marketplace RS'}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Estoque',
      accessor: 'currentStock',
      sortable: true,
      render: (product) => (
        <div>
          <div className="font-semibold text-slate-200">{product.currentStock}</div>
          <div className="text-xs text-slate-500">mín: {product.minStock}</div>
        </div>
      ),
    },
    {
      header: 'Preço',
      accessor: 'salePrice',
      sortable: true,
      render: (product) => <span className="font-semibold text-rs-gold">{formatCurrency(product.salePrice || 0)}</span>,
    },
    {
      header: 'Ações',
      accessor: 'actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (product) => (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => onViewOrders(product.name)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-rs-gold"
            title="Ver pedidos do produto"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => openModal(product)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-blue-400"
            title="Editar produto"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => void handleDelete(product)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
            title="Excluir produto"
            disabled={isDeletingId === product.id}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const currentExperiments = useMemo(
    () => (editingId ? experimentsByProduct.get(editingId) || [] : []),
    [editingId, experimentsByProduct]
  );

  const currentStockByCenters = useMemo(() => {
    const locations = stockLocations.filter((location) => location.productId === editingId);
    return locations.map((location) => ({
      location,
      center: distributionCenters.find((center) => center.id === location.centerId),
    }));
  }, [distributionCenters, stockLocations, editingId]);

  function openModal(product?: Product) {
    if (product) {
      setEditingId(product.id);
      setFormData({
        ...product,
        pageLayout: product.pageLayout || DEFAULT_PAGE_LAYOUT,
        bundleConfig: product.bundleConfig || { items: [], pricing: { type: 'fixed_price', value: 0 } },
        variants: product.variants || [],
        visibility: product.visibility || ['loja', 'marketplace'],
      });
      setSupplierLinks(
        productSuppliers
          .filter((item) => item.productId === product.id)
          .map((item) => ({ ...item }))
      );
    } else {
      const fresh = EMPTY_PRODUCT(currentUser.id);
      setEditingId(null);
      setFormData(fresh);
      setSupplierLinks([]);
    }
    setActiveTab('details');
    setIsModalOpen(true);
  }

  const handleFieldChange = <K extends keyof Product>(field: K, value: Product[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVisibilityToggle = (channel: 'loja' | 'marketplace') => {
    setFormData((prev) => {
      const currentVisibility = prev.visibility || [];
      const nextVisibility = currentVisibility.includes(channel)
        ? currentVisibility.filter((item) => item !== channel)
        : [...currentVisibility, channel];
      return { ...prev, visibility: nextVisibility };
    });
  };

  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]:
                field === 'name' || field === 'sku'
                  ? String(value)
                  : parseNumber(value),
            }
          : variant
      ),
    }));
  };

  const handleSupplierLinkChange = (index: number, field: keyof ProductSupplier, value: string | number | boolean) => {
    setSupplierLinks((prev) =>
      prev.map((link, currentIndex) =>
        currentIndex === index
          ? {
              ...link,
              [field]:
                typeof value === 'boolean'
                  ? value
                  : field === 'supplierId'
                    ? String(value)
                    : parseNumber(value),
            }
          : field === 'isDefault' && value === true
            ? { ...link, isDefault: false }
            : link
      )
    );
  };

  const handleBundleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      bundleConfig: {
        ...(prev.bundleConfig || { items: [], pricing: { type: 'fixed_price', value: 0 } }),
        items: (prev.bundleConfig?.items || []).map((item, currentIndex) =>
          currentIndex === index
            ? {
                ...item,
                [field]: field === 'productId' ? String(value) : Math.max(1, parseNumber(value)),
              }
            : item
        ),
      },
    }));
  };

  const prepareProductForSave = (): Product => {
    const variants = (formData.variants || []).filter((variant) => variant.name.trim() || variant.sku.trim());
    const computedStock =
      variants.length > 0
        ? variants.reduce((total, variant) => total + Math.max(0, Number(variant.stock) || 0), 0)
        : Math.max(0, Number(formData.currentStock) || 0);

    return {
      ...formData,
      id: editingId || formData.id || crypto.randomUUID(),
      userId: currentUser.id,
      name: formData.name.trim(),
      sku: formData.sku?.trim(),
      category: formData.category?.trim(),
      salePrice: parseNumber(formData.salePrice),
      shippingCost: parseNumber(formData.shippingCost),
      shippingCharged: parseNumber(formData.shippingCharged),
      gatewayFeeRate: parseNumber(formData.gatewayFeeRate),
      currentStock: computedStock,
      minStock: Math.max(0, parseNumber(formData.minStock)),
      productType: formData.productType === 'bundle' ? 'bundle' : 'simple',
      bundleConfig:
        formData.productType === 'bundle'
          ? {
              items: (formData.bundleConfig?.items || []).filter((item) => item.productId),
              pricing: {
                type: formData.bundleConfig?.pricing?.type || 'fixed_price',
                value: parseNumber(formData.bundleConfig?.pricing?.value),
              },
            }
          : { items: [], pricing: { type: 'fixed_price', value: 0 } },
      weightKg: parseNumber(formData.weightKg),
      dimensions: {
        lengthCm: parseNumber(formData.dimensions?.lengthCm),
        widthCm: parseNumber(formData.dimensions?.widthCm),
        heightCm: parseNumber(formData.dimensions?.heightCm),
      },
      variants,
      pageLayout: formData.pageLayout || DEFAULT_PAGE_LAYOUT,
      affiliateCommissionPercent: parseNumber(formData.affiliateCommissionPercent),
      visibility: (formData.visibility || []).length > 0 ? formData.visibility : ['loja', 'marketplace'],
      status: formData.status === 'Inactive' ? 'Inactive' : 'Active',
    };
  };

  const prepareSupplierLinksForSave = (productId: string) =>
    supplierLinks
      .filter((link) => link.supplierId)
      .map((link, index) => ({
        productId,
        supplierId: link.supplierId,
        costPrice: parseNumber(link.costPrice),
        leadTimeDays: parseNumber(link.leadTimeDays),
        isDefault: link.isDefault || (!supplierLinks.some((item) => item.isDefault) && index === 0),
      }));

  const handleSave = async () => {
    const nextProduct = prepareProductForSave();

    if (!nextProduct.name) {
      addToast('Informe o nome do produto.', 'error');
      setActiveTab('details');
      return;
    }

    if (!nextProduct.salePrice || nextProduct.salePrice <= 0) {
      addToast('Informe um preço de venda válido.', 'error');
      setActiveTab('details');
      return;
    }

    if (nextProduct.productType === 'bundle' && (nextProduct.bundleConfig?.items || []).length === 0) {
      addToast('Adicione pelo menos um item ao kit.', 'error');
      setActiveTab('bundle');
      return;
    }

    if ((supplierLinks || []).some((link) => link.supplierId && parseNumber(link.costPrice) <= 0)) {
      addToast('Fornecedores vinculados precisam de custo válido.', 'error');
      setActiveTab('suppliers');
      return;
    }

    setIsSaving(true);
    try {
      const nextSupplierLinks = prepareSupplierLinksForSave(nextProduct.id);
      if (editingId) {
        await updateProduct(nextProduct, nextSupplierLinks);
        addToast('Produto atualizado com sucesso.', 'success');
      } else {
        await addProduct(nextProduct, nextSupplierLinks);
        addToast('Produto criado com sucesso.', 'success');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      addToast(error?.message || 'Erro ao salvar produto.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      addToast('Produto excluído com sucesso.', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Erro ao excluir produto.', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  const toolbarContent = (
    <button type="button" onClick={() => openModal()} className="btn-primary flex items-center gap-2">
      <Plus size={18} />
      Novo Produto
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Meus Produtos</h2>
          <p className="text-sm text-slate-400">Cadastre, edite e publique seus produtos com dados reais do CD.</p>
        </div>
        {toolbarContent}
      </div>

      <DataTable
        {...table}
        columns={columns}
        data={table.paginatedData}
        onSort={table.requestSort}
        onSearch={table.setSearchTerm}
        onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        searchPlaceholder="Buscar por nome ou SKU..."
      />

      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingId ? 'Editar Produto' : 'Novo Produto'}
        size="5xl"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 pt-4">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto">
              {PRODUCT_EDITOR_TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Dados Comerciais">
                  <div className="grid gap-4">
                    <InputField label="Nome do Produto" value={formData.name} onChange={(value) => handleFieldChange('name', value)} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField label="SKU" value={formData.sku || ''} onChange={(value) => handleFieldChange('sku', value)} />
                      <InputField label="Categoria" value={formData.category || ''} onChange={(value) => handleFieldChange('category', value)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField label="Preço de Venda (R$)" type="number" value={formData.salePrice} onChange={(value) => handleFieldChange('salePrice', parseNumber(value))} />
                      <SelectField
                        label="Status"
                        value={formData.status}
                        onChange={(value) => handleFieldChange('status', value as Product['status'])}
                        options={[
                          { value: 'Active', label: 'Ativo' },
                          { value: 'Inactive', label: 'Inativo' },
                        ]}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Estoque Base">
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField label="Estoque Mínimo" type="number" value={formData.minStock} onChange={(value) => handleFieldChange('minStock', parseNumber(value))} />
                      <InputField
                        label="Estoque Total"
                        type="number"
                        value={(formData.variants || []).length > 0 ? formData.variants?.reduce((sum, variant) => sum + variant.stock, 0) : formData.currentStock}
                        onChange={(value) => handleFieldChange('currentStock', parseNumber(value))}
                        disabled={(formData.variants || []).length > 0}
                        helpText={(formData.variants || []).length > 0 ? 'O estoque é calculado automaticamente pelas variações.' : undefined}
                      />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Visibilidade do Produto</div>
                      <div className="flex flex-wrap gap-3">
                        <CheckboxPill label="Loja Própria" checked={(formData.visibility || []).includes('loja')} onChange={() => handleVisibilityToggle('loja')} />
                        <CheckboxPill label="Marketplace RS" checked={(formData.visibility || []).includes('marketplace')} onChange={() => handleVisibilityToggle('marketplace')} />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'page' && (
              <SectionCard title="Página do Produto">
                <ProductPageEditor
                  layout={formData.pageLayout || DEFAULT_PAGE_LAYOUT}
                  templates={productPageTemplates}
                  onSaveLayout={(layout) => handleFieldChange('pageLayout', layout)}
                  onUpdateTemplates={onUpdateProductPageTemplates}
                />
              </SectionCard>
            )}

            {activeTab === 'ab-tests' && (
              <div className="grid gap-4 lg:grid-cols-3">
                <MetricCard title="Experimentos Ativos" value={currentExperiments.filter((item) => item.status === 'running').length} subtext="Testes em andamento" />
                <MetricCard title="Experimentos Pausados" value={currentExperiments.filter((item) => item.status === 'paused').length} subtext="Aguardando retomada" />
                <MetricCard title="Experimentos Concluídos" value={currentExperiments.filter((item) => item.status === 'completed').length} subtext="Histórico disponível" />

                <SectionCard title="Testes vinculados" className="lg:col-span-3">
                  {editingId ? (
                    currentExperiments.length > 0 ? (
                      <div className="space-y-3">
                        {currentExperiments.map((experiment) => (
                          <div key={experiment.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-slate-100">{experiment.name}</div>
                                <div className="text-xs text-slate-500">
                                  {experiment.type} • criado em {new Date(experiment.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-rs-gold">{experiment.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="Nenhum teste A/B para este produto" description="Os experimentos reais aparecerão aqui quando forem criados na área de Testes A/B." />
                    )
                  ) : (
                    <EmptyState title="Salve o produto antes" description="Para vincular testes A/B reais, primeiro salve o produto e depois volte a esta aba." />
                  )}
                </SectionCard>
              </div>
            )}

            {activeTab === 'bundle' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Tipo do Produto">
                  <div className="grid gap-4">
                    <SelectField
                      label="Modelo comercial"
                      value={formData.productType || 'simple'}
                      onChange={(value) => handleFieldChange('productType', value as Product['productType'])}
                      options={[
                        { value: 'simple', label: 'Produto simples' },
                        { value: 'bundle', label: 'Kit / Bundle' },
                      ]}
                    />
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
                      {formData.productType === 'bundle'
                        ? 'O produto será vendido como kit. Adicione os itens e defina a regra de preço do bundle.'
                        : 'Produto individual. O preço e o estoque são controlados diretamente nesta ficha.'}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Regra de precificação do kit">
                  <div className="grid gap-4">
                    <SelectField
                      label="Tipo de preço"
                      value={formData.bundleConfig?.pricing?.type || 'fixed_price'}
                      onChange={(value) =>
                        handleFieldChange('bundleConfig', {
                          ...(formData.bundleConfig || { items: [], pricing: { type: 'fixed_price', value: 0 } }),
                          pricing: {
                            type: value as 'fixed_price' | 'percent_discount' | 'fixed_discount',
                            value: formData.bundleConfig?.pricing?.value || 0,
                          },
                        })
                      }
                      options={[
                        { value: 'fixed_price', label: 'Preço fixo do kit' },
                        { value: 'percent_discount', label: 'Desconto percentual' },
                        { value: 'fixed_discount', label: 'Desconto fixo' },
                      ]}
                    />
                    <InputField
                      label="Valor da regra"
                      type="number"
                      value={formData.bundleConfig?.pricing?.value || 0}
                      onChange={(value) =>
                        handleFieldChange('bundleConfig', {
                          ...(formData.bundleConfig || { items: [], pricing: { type: 'fixed_price', value: 0 } }),
                          pricing: {
                            type: formData.bundleConfig?.pricing?.type || 'fixed_price',
                            value: parseNumber(value),
                          },
                        })
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Itens do kit" className="lg:col-span-2">
                  <div className="space-y-3">
                    {(formData.bundleConfig?.items || []).map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[2fr,120px,auto]">
                        <SelectField
                          label="Produto"
                          value={item.productId}
                          onChange={(value) => handleBundleItemChange(index, 'productId', value)}
                          options={[
                            { value: '', label: 'Selecione um produto' },
                            ...products.filter((product) => product.id !== editingId).map((product) => ({ value: product.id, label: product.name })),
                          ]}
                        />
                        <InputField label="Quantidade" type="number" value={item.quantity} onChange={(value) => handleBundleItemChange(index, 'quantity', value)} />
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleFieldChange('bundleConfig', {
                                ...(formData.bundleConfig || { items: [], pricing: { type: 'fixed_price', value: 0 } }),
                                items: (formData.bundleConfig?.items || []).filter((_, currentIndex) => currentIndex !== index),
                              })
                            }
                            className="rounded-lg p-3 text-slate-400 transition hover:bg-white/5 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        handleFieldChange('bundleConfig', {
                          ...(formData.bundleConfig || { items: [], pricing: { type: 'fixed_price', value: 0 } }),
                          items: [...(formData.bundleConfig?.items || []), { productId: '', quantity: 1 }],
                        })
                      }
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Adicionar item ao kit
                    </button>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <SectionCard title="Fornecedores vinculados">
                <div className="space-y-3">
                  {supplierLinks.map((link, index) => (
                    <div key={`${link.supplierId || 'supplier'}-${index}`} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[2fr,1fr,1fr,120px,auto]">
                      <SelectField
                        label="Fornecedor"
                        value={link.supplierId}
                        onChange={(value) => handleSupplierLinkChange(index, 'supplierId', value)}
                        options={[
                          { value: '', label: 'Selecione um fornecedor' },
                          ...suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
                        ]}
                      />
                      <InputField label="Custo (R$)" type="number" value={link.costPrice} onChange={(value) => handleSupplierLinkChange(index, 'costPrice', value)} />
                      <InputField label="Lead time (dias)" type="number" value={link.leadTimeDays || 0} onChange={(value) => handleSupplierLinkChange(index, 'leadTimeDays', value)} />
                      <div className="flex flex-col justify-end">
                        <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Principal</label>
                        <button
                          type="button"
                          onClick={() => handleSupplierLinkChange(index, 'isDefault', true)}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            link.isDefault ? 'border-rs-gold bg-rs-gold/10 text-rs-gold' : 'border-white/10 bg-black/20 text-slate-400 hover:border-rs-gold/40'
                          }`}
                        >
                          {link.isDefault ? 'Padrão' : 'Definir'}
                        </button>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setSupplierLinks((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                          className="rounded-lg p-3 text-slate-400 transition hover:bg-white/5 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {supplierLinks.length === 0 && (
                    <EmptyState title="Nenhum fornecedor vinculado" description="Cadastre um ou mais fornecedores reais para custo, lead time e abastecimento deste produto." />
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setSupplierLinks((prev) => [...prev, EMPTY_SUPPLIER_LINK(editingId || formData.id)])} className="btn-secondary flex items-center gap-2">
                      <Plus size={16} />
                      Vincular fornecedor
                    </button>
                    <span className="text-xs text-slate-500">Os fornecedores são salvos junto do produto no backend do RS Drop.</span>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === 'stock' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Resumo operacional">
                  <div className="grid gap-4 md:grid-cols-2">
                    <MetricCard title="Estoque atual" value={(formData.variants || []).length > 0 ? formData.variants?.reduce((sum, variant) => sum + variant.stock, 0) : formData.currentStock} subtext="Saldo total disponível" />
                    <MetricCard title="Estoque mínimo" value={formData.minStock} subtext="Ponto de alerta" />
                  </div>
                  {(formData.variants || []).length > 0 && (
                    <div className="mt-4 rounded-xl border border-rs-gold/20 bg-rs-gold/5 p-4 text-sm text-rs-gold">
                      Este produto usa variações. O estoque total é calculado somando o saldo de cada variação.
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Distribuição por CD">
                  {currentStockByCenters.length > 0 ? (
                    <div className="space-y-3">
                      {currentStockByCenters.map(({ location, center }) => (
                        <div key={location.centerId} className="rounded-xl border border-white/10 bg-black/20 p-4">
                          <div className="font-semibold text-slate-100">{center?.name || 'Centro de distribuição'}</div>
                          <div className="text-xs text-slate-500">Saldo registrado: {location.stock}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="Sem distribuição por CD" description="Quando este produto tiver estoque distribuído por centros, os saldos reais aparecerão aqui." />
                  )}
                </SectionCard>
              </div>
            )}

            {activeTab === 'variants' && (
              <SectionCard title="Variações do produto">
                <div className="space-y-3">
                  {(formData.variants || []).map((variant) => (
                    <div key={variant.id} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[2fr,1.2fr,1fr,1fr,1fr,1fr,auto]">
                      <InputField label="Nome" value={variant.name} onChange={(value) => handleVariantChange(variant.id, 'name', value)} />
                      <InputField label="SKU" value={variant.sku} onChange={(value) => handleVariantChange(variant.id, 'sku', value)} />
                      <InputField label="Preço" type="number" value={variant.price} onChange={(value) => handleVariantChange(variant.id, 'price', value)} />
                      <InputField label="Custo" type="number" value={variant.costPrice} onChange={(value) => handleVariantChange(variant.id, 'costPrice', value)} />
                      <InputField label="Estoque" type="number" value={variant.stock} onChange={(value) => handleVariantChange(variant.id, 'stock', value)} />
                      <InputField label="Mínimo" type="number" value={variant.minStock} onChange={(value) => handleVariantChange(variant.id, 'minStock', value)} />
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleFieldChange('variants', (formData.variants || []).filter((item) => item.id !== variant.id))}
                          className="rounded-lg p-3 text-slate-400 transition hover:bg-white/5 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={() => handleFieldChange('variants', [...(formData.variants || []), EMPTY_VARIANT()])} className="btn-secondary flex items-center gap-2">
                    <Plus size={16} />
                    Adicionar variação
                  </button>
                </div>
              </SectionCard>
            )}

            {activeTab === 'shipping' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Frete e taxas">
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField label="Custo de frete (R$)" type="number" value={formData.shippingCost} onChange={(value) => handleFieldChange('shippingCost', parseNumber(value))} />
                      <InputField label="Frete cobrado (R$)" type="number" value={formData.shippingCharged} onChange={(value) => handleFieldChange('shippingCharged', parseNumber(value))} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField label="Taxa de gateway (%)" type="number" value={formData.gatewayFeeRate} onChange={(value) => handleFieldChange('gatewayFeeRate', parseNumber(value))} />
                      <InputField label="Comissão de afiliado (%)" type="number" value={formData.affiliateCommissionPercent || 0} onChange={(value) => handleFieldChange('affiliateCommissionPercent', parseNumber(value))} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Dimensões do produto">
                  <div className="grid gap-4">
                    <InputField label="Peso (kg)" type="number" value={formData.weightKg || 0} onChange={(value) => handleFieldChange('weightKg', parseNumber(value))} />
                    <div className="grid gap-4 md:grid-cols-3">
                      <InputField
                        label="Comprimento (cm)"
                        type="number"
                        value={formData.dimensions?.lengthCm || 0}
                        onChange={(value) =>
                          handleFieldChange('dimensions', {
                            ...(formData.dimensions || { lengthCm: 0, widthCm: 0, heightCm: 0 }),
                            lengthCm: parseNumber(value),
                          })
                        }
                      />
                      <InputField
                        label="Largura (cm)"
                        type="number"
                        value={formData.dimensions?.widthCm || 0}
                        onChange={(value) =>
                          handleFieldChange('dimensions', {
                            ...(formData.dimensions || { lengthCm: 0, widthCm: 0, heightCm: 0 }),
                            widthCm: parseNumber(value),
                          })
                        }
                      />
                      <InputField
                        label="Altura (cm)"
                        type="number"
                        value={formData.dimensions?.heightCm || 0}
                        onChange={(value) =>
                          handleFieldChange('dimensions', {
                            ...(formData.dimensions || { lengthCm: 0, widthCm: 0, heightCm: 0 }),
                            heightCm: parseNumber(value),
                          })
                        }
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 p-6">
            <div className="text-xs text-slate-500">
              {editingId ? 'Alterando um produto real do Supabase/RS Drop.' : 'Novo produto será salvo direto no Supabase/RS Drop.'}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={isSaving}>
                Cancelar
              </button>
              <button type="button" onClick={() => void handleSave()} className="btn-primary flex items-center gap-2" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Salvando...' : editingId ? 'Salvar Produto' : 'Criar Produto'}
              </button>
            </div>
          </div>
        </div>
      </ModalWrapper>

      <style>{`
        .btn-primary {
          background-color: #d4af37;
          color: #0a0a0a;
          font-weight: 700;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
        }
        .btn-secondary {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, className }) => (
  <div className={`rounded-2xl border border-rs-goldDim/20 bg-rs-card p-5 ${className || ''}`}>
    <div className="mb-4 text-sm font-bold uppercase tracking-wider text-rs-gold">{title}</div>
    {children}
  </div>
);

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  disabled?: boolean;
  helpText?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', disabled = false, helpText }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 outline-none transition focus:border-rs-gold disabled:cursor-not-allowed disabled:opacity-60"
    />
    {helpText ? <span className="mt-2 block text-xs text-slate-500">{helpText}</span> : null}
  </label>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 outline-none transition focus:border-rs-gold">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

interface CheckboxPillProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const CheckboxPill: React.FC<CheckboxPillProps> = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
      checked ? 'border-rs-gold bg-rs-gold/10 text-rs-gold' : 'border-white/10 bg-black/20 text-slate-400 hover:border-rs-gold/40'
    }`}
  >
    {label}
  </button>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext }) => (
  <div className="rounded-2xl border border-rs-goldDim/20 bg-rs-card p-5">
    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</div>
    <div className="mt-3 text-3xl font-black text-slate-100">{value}</div>
    <div className="mt-2 text-xs text-slate-500">{subtext}</div>
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
    <div className="text-base font-bold text-slate-200">{title}</div>
    <div className="mt-2 text-sm text-slate-500">{description}</div>
  </div>
);
