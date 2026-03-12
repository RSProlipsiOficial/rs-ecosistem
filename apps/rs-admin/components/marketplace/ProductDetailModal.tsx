import React, { useEffect, useMemo, useState } from 'react';
import type { Product, Collection } from '../../types';
import { marketplaceAPI } from '../../src/services/api';
import { ArrowUpTrayIcon, CloseIcon, FolderPlusIcon, PlusIcon, SpinnerIcon, TrashIcon } from '../icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void> | void;
  product: Product | null;
  availableProducts: Product[];
  availableCollections: Collection[];
}

const DEFAULT_CATEGORIES = ['Cuidados Faciais', 'Bem-Estar', 'Maquiagem', 'Perfumaria'];

const newProductTemplate: Omit<Product, 'id'> = {
  name: '',
  sku: '',
  description: '',
  shortDescription: '',
  images: [],
  videos: [],
  materials: [],
  category: '',
  tags: [],
  fullPrice: 0,
  consultantPrice: 0,
  costPrice: 0,
  stock: 0,
  trackStock: true,
  status: 'Ativo',
  featuredImage: null,
  subcategory: '',
  supplier: '',
  barcode: '',
  weight: undefined,
  weightUnit: 'kg',
  merchandising: {
    comboProductIds: [],
    relatedProductIds: [],
    sponsored: {
      enabled: false,
      priority: 10,
      label: 'Patrocinado',
      placements: ['product_detail_related']
    }
  },
  mlm: {
    qualifiesForCycle: true,
  }
};

const extractFileName = (url: string) => {
  try {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'arquivo');
  } catch {
    return 'arquivo';
  }
};

const normalizeMerchandising = (value?: Product['merchandising']) => ({
  comboProductIds: Array.isArray(value?.comboProductIds) ? value!.comboProductIds : [],
  relatedProductIds: Array.isArray(value?.relatedProductIds) ? value!.relatedProductIds : [],
  sponsored: {
    enabled: Boolean(value?.sponsored?.enabled),
    priority: Number(value?.sponsored?.priority ?? 10),
    label: String(value?.sponsored?.label ?? 'Patrocinado'),
    placements: Array.isArray(value?.sponsored?.placements) && value!.sponsored!.placements!.length > 0
      ? value!.sponsored!.placements!
      : ['product_detail_related'],
    startsAt: value?.sponsored?.startsAt ? String(value.sponsored.startsAt) : undefined,
    endsAt: value?.sponsored?.endsAt ? String(value.sponsored.endsAt) : undefined,
  }
});

type RelationshipField = 'comboProductIds' | 'relatedProductIds';

interface RelationshipPickerProps {
  title: string;
  description: string;
  products: Product[];
  collections: Collection[];
  selectedIds: Array<string | number>;
  onChange: (nextIds: Array<string | number>) => void;
  excludeProductId?: string | number;
}

const RelationshipPicker: React.FC<RelationshipPickerProps> = ({
  title,
  description,
  products,
  collections,
  selectedIds,
  onChange,
  excludeProductId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [subcategoryFilter, setSubcategoryFilter] = useState('Todas');
  const [collectionFilter, setCollectionFilter] = useState('Todas');

  const selectableProducts = useMemo(
    () => products.filter((item) => String(item.id) !== String(excludeProductId)),
    [products, excludeProductId]
  );

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(selectableProducts.map((item) => item.category).filter(Boolean)))],
    [selectableProducts]
  );

  const subcategories = useMemo(
    () => ['Todas', ...Array.from(new Set(selectableProducts.map((item) => item.subcategory).filter(Boolean)))],
    [selectableProducts]
  );

  const collectionMap = useMemo(
    () => new Map(
      collections.map((collection) => [
        String(collection.id),
        collection.title || collection.name || 'Colecao'
      ])
    ),
    [collections]
  );

  const collectionOptions = useMemo(
    () => [
      { id: 'Todas', label: 'Todas' },
      ...collections.map((collection) => ({
        id: String(collection.id),
        label: collection.title || collection.name || 'Colecao'
      }))
    ],
    [collections]
  );

  const resolveCollectionNames = (item: Product) => {
    const ids = new Set<string>();
    if (item.collectionId) ids.add(String(item.collectionId));
    (item.collectionIds || []).filter(Boolean).forEach((id) => ids.add(String(id)));
    return Array.from(ids).map((id) => collectionMap.get(id) || id);
  };

  const selectedProducts = useMemo(() => {
    const orderMap = new Map(selectedIds.map((id, index) => [String(id), index]));
    return selectableProducts
      .filter((item) => orderMap.has(String(item.id)))
      .sort((a, b) => (orderMap.get(String(a.id)) ?? 0) - (orderMap.get(String(b.id)) ?? 0));
  }, [selectableProducts, selectedIds]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return selectableProducts.filter((item) => {
      if (selectedIds.some((selectedId) => String(selectedId) === String(item.id))) return false;

      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.sku.toLowerCase().includes(normalizedSearch) ||
        String(item.category || '').toLowerCase().includes(normalizedSearch) ||
        String(item.subcategory || '').toLowerCase().includes(normalizedSearch) ||
        resolveCollectionNames(item).some((name) => name.toLowerCase().includes(normalizedSearch));

      const matchesCategory = categoryFilter === 'Todas' || item.category === categoryFilter;
      const matchesSubcategory = subcategoryFilter === 'Todas' || item.subcategory === subcategoryFilter;
      const matchesCollection =
        collectionFilter === 'Todas' ||
        [item.collectionId, ...(item.collectionIds || [])]
          .filter(Boolean)
          .map((value) => String(value))
          .includes(collectionFilter);

      return matchesSearch && matchesCategory && matchesSubcategory && matchesCollection;
    }).slice(0, 12);
  }, [selectableProducts, selectedIds, searchTerm, categoryFilter, subcategoryFilter, collectionFilter, collectionMap]);

  const addProduct = (productId: string | number) => {
    if (selectedIds.some((id) => String(id) === String(productId))) return;
    onChange([...selectedIds, productId]);
  };

  const removeProduct = (productId: string | number) => {
    onChange(selectedIds.filter((id) => String(id) !== String(productId)));
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-black/20 p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 mb-4">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nome, SKU, categoria, subcategoria ou colecao"
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 xl:col-span-2"
        />
        <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2.5" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2.5" value={subcategoryFilter} onChange={(event) => setSubcategoryFilter(event.target.value)}>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>{subcategory}</option>
          ))}
        </select>
        <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2.5" value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)}>
          {collectionOptions.map((collection) => (
            <option key={collection.id} value={collection.id}>{collection.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">Selecionados</p>
        {selectedProducts.length > 0 ? (
          <div className="space-y-2">
            {selectedProducts.map((item) => (
              <div key={String(item.id)} className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{item.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {item.category || 'Sem categoria'}{item.subcategory ? ` · ${item.subcategory}` : ''}{item.sku ? ` · SKU ${item.sku}` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => removeProduct(item.id)} className="text-red-400 hover:text-red-300 text-sm">
                  Remover
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-700 px-3 py-4 text-sm text-gray-500">
            Nenhum produto vinculado ainda.
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Resultados</p>
        {filteredProducts.length > 0 ? (
          <div className="space-y-2">
            {filteredProducts.map((item) => (
              <button
                key={String(item.id)}
                type="button"
                onClick={() => addProduct(item.id)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/40 px-3 py-3 text-left transition-colors hover:border-yellow-500/40 hover:bg-gray-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {item.category || 'Sem categoria'}{item.subcategory ? ` · ${item.subcategory}` : ''}{item.sku ? ` · SKU ${item.sku}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-yellow-500">Adicionar</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-700 px-3 py-4 text-sm text-gray-500">
            Nenhum produto encontrado com esse filtro.
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetailModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, product, availableProducts, availableCollections }) => {
  const [activeTab, setActiveTab] = useState('geral');
  const [formData, setFormData] = useState<Omit<Product, 'id'> & { id?: string | number }>(newProductTemplate);
  const [priceStrings, setPriceStrings] = useState({
    fullPrice: '0',
    consultantPrice: '0',
    costPrice: '0',
  });
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [pendingVideoFiles, setPendingVideoFiles] = useState<File[]>([]);
  const [pendingMaterialFiles, setPendingMaterialFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const initialData = product || newProductTemplate;
    const nextCategories = [...DEFAULT_CATEGORIES];

    if (initialData.category && !nextCategories.includes(initialData.category)) {
      nextCategories.unshift(initialData.category);
    }

    setFormData({
      ...newProductTemplate,
      ...initialData,
      images: initialData.images || [],
      videos: initialData.videos || [],
      materials: initialData.materials || [],
      tags: initialData.tags || [],
      featuredImage: initialData.featuredImage || initialData.images?.[0] || null,
      merchandising: normalizeMerchandising(initialData.merchandising),
      mlm: {
        qualifiesForCycle: initialData.mlm?.qualifiesForCycle ?? true,
      }
    });
    setPriceStrings({
      fullPrice: String(initialData.fullPrice || 0).replace('.', ','),
      consultantPrice: String(initialData.consultantPrice || 0).replace('.', ','),
      costPrice: String(initialData.costPrice || 0).replace('.', ','),
    });
    setCategories(nextCategories);
    setNewCategory('');
    setTagInput('');
    setVideoInput('');
    setPendingImageFiles([]);
    setPendingVideoFiles([]);
    setPendingMaterialFiles([]);
    setSaveError('');
    setIsSaving(false);
    setActiveTab('geral');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const isNumber = type === 'number';

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : isNumber ? parseInt(value, 10) || 0 : value
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^[0-9]*[,]{0,1}[0-9]{0,2}$/.test(value)) {
      setPriceStrings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMlmToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      mlm: {
        ...prev.mlm,
        [name]: checked
      }
    }));
  };

  const updateMerchandisingList = (field: RelationshipField, nextIds: Array<string | number>) => {
    setFormData((prev) => ({
      ...prev,
      merchandising: {
        ...normalizeMerchandising(prev.merchandising),
        [field]: nextIds
      }
    }));
  };

  const updateSponsoredField = (field: 'enabled' | 'priority' | 'label' | 'placements' | 'startsAt' | 'endsAt', value: boolean | number | string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      merchandising: {
        ...normalizeMerchandising(prev.merchandising),
        sponsored: {
          ...normalizeMerchandising(prev.merchandising).sponsored,
          [field]: value
        }
      }
    }));
  };

  const handleAddCategory = () => {
    const category = newCategory.trim();
    if (!category || categories.includes(category)) return;

    setCategories((prev) => [...prev, category]);
    setFormData((prev) => ({ ...prev, category }));
    setNewCategory('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || formData.tags.includes(tag)) {
      setTagInput('');
      return;
    }

    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const handleAddVideoUrl = () => {
    const url = videoInput.trim();
    if (!url || formData.videos.includes(url)) {
      setVideoInput('');
      return;
    }

    setFormData((prev) => ({ ...prev, videos: [...prev.videos, url] }));
    setVideoInput('');
  };

  const handleRemoveVideo = (videoToRemove: string) => {
    setFormData((prev) => ({ ...prev, videos: prev.videos.filter((video) => video !== videoToRemove) }));
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setFormData((prev) => {
      const images = prev.images.filter((image) => image !== imageToRemove);
      return {
        ...prev,
        images,
        featuredImage: prev.featuredImage === imageToRemove ? (images[0] || null) : prev.featuredImage
      };
    });
  };

  const handleRemoveMaterial = (materialUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((material) => material.url !== materialUrl)
    }));
  };

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setter((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const uploadFiles = async (files: File[], type: string) => {
    if (files.length === 0) return [] as string[];

    const responses = await Promise.all(files.map((file) => marketplaceAPI.uploadAsset(file, type)));
    return responses
      .map((response) => response.data?.url || response.data?.data?.url)
      .filter(Boolean);
  };

  const uploadMaterialFiles = async (files: File[]) => {
    const urls = await uploadFiles(files, 'materials');
    return urls.map((url, index) => ({
      name: files[index]?.name || extractFileName(url),
      url,
      size: files[index]?.size,
      mimeType: files[index]?.type
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setSaveError('');

      const [uploadedImages, uploadedVideos, uploadedMaterials] = await Promise.all([
        uploadFiles(pendingImageFiles, 'products'),
        uploadFiles(pendingVideoFiles, 'videos'),
        uploadMaterialFiles(pendingMaterialFiles),
      ]);

      const finalData = { ...formData };
      finalData.fullPrice = parseFloat(priceStrings.fullPrice.replace(',', '.')) || 0;
      finalData.consultantPrice = parseFloat(priceStrings.consultantPrice.replace(',', '.')) || 0;
      finalData.costPrice = parseFloat(priceStrings.costPrice.replace(',', '.')) || 0;
      finalData.images = [...formData.images, ...uploadedImages];
      finalData.videos = [...formData.videos, ...uploadedVideos];
      finalData.materials = [...formData.materials, ...uploadedMaterials];
      finalData.featuredImage = finalData.images[0] || null;
      finalData.merchandising = normalizeMerchandising(formData.merchandising);

      await Promise.resolve(
        onSave({
          ...newProductTemplate,
          ...finalData,
          id: finalData.id || Date.now(),
        })
      );
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      setSaveError(error?.message || 'Nao foi possivel salvar o produto.');
    } finally {
      setIsSaving(false);
    }
  };

  const TabButton: React.FC<{ tabId: string; label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
        activeTab === tabId
          ? 'border-b-2 border-yellow-500 text-yellow-500'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const baseInputClasses =
    'bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5';

  const FormRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({
    label,
    children,
    description
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-3">
      <div className="md:col-span-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );

  const SettingsToggle: React.FC<{
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ name, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" id={name} name={name} className="sr-only" checked={checked} onChange={onChange} />
        <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? 'transform translate-x-6' : ''
          }`}
        ></div>
      </div>
    </label>
  );

  const margin =
    (parseFloat(priceStrings.fullPrice.replace(',', '.')) || 0) -
    (parseFloat(priceStrings.consultantPrice.replace(',', '.')) || 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="border-b border-gray-700 px-4 overflow-x-auto">
          <nav className="-mb-px flex space-x-2">
            <TabButton tabId="geral" label="Geral" />
            <TabButton tabId="precos" label="Precos & Estoque" />
            <TabButton tabId="categorias" label="Categorias" />
            <TabButton tabId="organizacao" label="Tags" />
            <TabButton tabId="midia" label="Midia" />
            <TabButton tabId="relacionamentos" label="Relacionamentos" />
            <TabButton tabId="mlm" label="Regras de Ciclo" />
          </nav>
        </div>

        <main className="p-6 overflow-y-auto">
          {saveError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {saveError}
            </div>
          )}

          {activeTab === 'geral' && (
            <div className="space-y-2">
              <FormRow label="Nome do Produto">
                <input name="name" value={formData.name} onChange={handleChange} className={baseInputClasses} />
              </FormRow>
              <FormRow label="SKU">
                <input name="sku" value={formData.sku} onChange={handleChange} className={baseInputClasses} />
              </FormRow>
              <FormRow label="Descricao curta">
                <input
                  name="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={handleChange}
                  className={baseInputClasses}
                />
              </FormRow>
              <FormRow label="Descricao">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={baseInputClasses}
                />
              </FormRow>
              <FormRow label="Status do Produto">
                <select name="status" value={formData.status} onChange={handleChange} className={baseInputClasses}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </FormRow>
            </div>
          )}

          {activeTab === 'precos' && (
            <div className="space-y-2">
              <FormRow label="Preco cheio">
                <input
                  name="fullPrice"
                  value={priceStrings.fullPrice}
                  onChange={handlePriceChange}
                  type="text"
                  inputMode="decimal"
                  className={baseInputClasses}
                />
              </FormRow>
              <FormRow label="Preco para Consultor">
                <input
                  name="consultantPrice"
                  value={priceStrings.consultantPrice}
                  onChange={handlePriceChange}
                  type="text"
                  inputMode="decimal"
                  className={baseInputClasses}
                />
              </FormRow>
              <FormRow label="Margem do Consultor" description="Calculo automatico.">
                <div
                  className={`p-2.5 rounded-lg font-semibold ${
                    margin >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {margin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </FormRow>
              <FormRow label="Preco de custo">
                <input
                  name="costPrice"
                  value={priceStrings.costPrice}
                  onChange={handlePriceChange}
                  type="text"
                  inputMode="decimal"
                  className={baseInputClasses}
                />
              </FormRow>
              <FormRow label="Quantidade em Estoque">
                <input name="stock" value={formData.stock} onChange={handleChange} type="number" className={baseInputClasses} />
              </FormRow>
              <FormRow label="Rastrear Estoque?">
                <SettingsToggle name="trackStock" checked={formData.trackStock} onChange={handleChange} />
              </FormRow>
            </div>
          )}

          {activeTab === 'categorias' && (
            <div className="space-y-2">
              <FormRow label="Categoria do Produto">
                <select name="category" value={formData.category} onChange={handleChange} className={baseInputClasses}>
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Adicionar Nova Categoria">
                <div className="flex gap-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nome da nova categoria"
                    className={baseInputClasses}
                  />
                  <button
                    onClick={handleAddCategory}
                    type="button"
                    className="flex-shrink-0 flex items-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"
                  >
                    <FolderPlusIcon className="w-5 h-5" /> Adicionar
                  </button>
                </div>
              </FormRow>
            </div>
          )}

          {activeTab === 'organizacao' && (
            <div className="space-y-2">
              <FormRow label="Tags" description="Pressione Enter ou virgula para adicionar uma tag.">
                <div>
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg min-h-[42px]">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 text-sm font-medium px-2.5 py-1 rounded-full"
                      >
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} type="button" className="text-yellow-500 hover:text-white">
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Adicionar tag..."
                      className="flex-grow bg-transparent outline-none text-sm p-1"
                    />
                  </div>
                </div>
              </FormRow>
            </div>
          )}

          {activeTab === 'midia' && (
            <div className="space-y-6">
              <FormRow label="Imagens do Produto" description="As imagens ficam salvas no Supabase Storage.">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={image} className="relative group aspect-square">
                        <img src={image} alt={`Produto ${index + 1}`} className="w-full h-full object-cover rounded-lg border-2 border-gray-700" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image)}
                          className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-red-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {pendingImageFiles.length > 0 && (
                    <div className="rounded-lg border border-dashed border-yellow-500/30 bg-yellow-500/5 p-3">
                      <p className="text-xs uppercase tracking-wide text-yellow-400 mb-2">Imagens pendentes de upload</p>
                      <div className="space-y-2">
                        {pendingImageFiles.map((file) => (
                          <div key={`${file.name}-${file.size}`} className="flex items-center justify-between text-sm text-gray-200">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setPendingImageFiles((prev) => prev.filter((item) => item !== file))}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <label htmlFor="image-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50">
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm font-semibold text-yellow-500">Clique para carregar imagens</span>
                    <span className="text-xs text-gray-500">ou arraste e solte</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleFileSelection(event, setPendingImageFiles)}
                  />
                </div>
              </FormRow>

              <FormRow label="Videos" description="Pode adicionar URL ou enviar arquivo de video.">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      placeholder="https://..."
                      className={baseInputClasses}
                    />
                    <button
                      type="button"
                      onClick={handleAddVideoUrl}
                      className="flex items-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"
                    >
                      <PlusIcon className="w-5 h-5" /> Adicionar URL
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.videos.map((video) => (
                      <div key={video} className="flex items-center justify-between rounded-lg bg-black/30 border border-gray-700 px-3 py-2">
                        <span className="truncate text-sm text-gray-200">{video}</span>
                        <button type="button" onClick={() => handleRemoveVideo(video)} className="text-red-400 hover:text-red-300">
                          Remover
                        </button>
                      </div>
                    ))}
                    {pendingVideoFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-3 py-2">
                        <span className="truncate text-sm text-yellow-200">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setPendingVideoFiles((prev) => prev.filter((item) => item !== file))}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  <label htmlFor="video-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50">
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm font-semibold text-yellow-500">Clique para carregar videos</span>
                    <span className="text-xs text-gray-500">MP4, MOV e similares</span>
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleFileSelection(event, setPendingVideoFiles)}
                  />
                </div>
              </FormRow>

              <FormRow label="Materiais" description="Arquivos extras do produto para download ou apoio.">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {formData.materials.map((material) => (
                      <div key={material.url} className="flex items-center justify-between rounded-lg bg-black/30 border border-gray-700 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-gray-200">{material.name}</p>
                          <p className="truncate text-xs text-gray-500">{material.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(material.url)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    {pendingMaterialFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-3 py-2">
                        <span className="truncate text-sm text-yellow-200">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setPendingMaterialFiles((prev) => prev.filter((item) => item !== file))}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  <label htmlFor="material-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50">
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm font-semibold text-yellow-500">Clique para carregar materiais</span>
                    <span className="text-xs text-gray-500">PDF, ZIP, DOC, imagens ou outros anexos</span>
                  </label>
                  <input
                    id="material-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => handleFileSelection(event, setPendingMaterialFiles)}
                  />
                </div>
              </FormRow>
            </div>
          )}

          {activeTab === 'relacionamentos' && (
            <div className="space-y-6">
              <RelationshipPicker
                title="Combos / Frequentemente comprados juntos"
                description="Escolha quais produtos devem aparecer junto com este item no bloco de combo."
                products={availableProducts}
                collections={availableCollections}
                selectedIds={normalizeMerchandising(formData.merchandising).comboProductIds}
                onChange={(nextIds) => updateMerchandisingList('comboProductIds', nextIds)}
                excludeProductId={formData.id}
              />

              <RelationshipPicker
                title="Produtos do mesmo contexto de busca e compra"
                description="Esses produtos alimentam a vitrine 'Clientes também compraram' desta página."
                products={availableProducts}
                collections={availableCollections}
                selectedIds={normalizeMerchandising(formData.merchandising).relatedProductIds}
                onChange={(nextIds) => updateMerchandisingList('relatedProductIds', nextIds)}
                excludeProductId={formData.id}
              />

              <div className="rounded-xl border border-gray-700 bg-black/20 p-4">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white">Produto premium / patrocinado</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Controle administrativo do bloco patrocinado da página de produto. Essa área fica somente no rs-admin.
                  </p>
                </div>

                <div className="space-y-4">
                  <FormRow label="Ativar produto patrocinado">
                    <SettingsToggle
                      name="sponsored-enabled"
                      checked={normalizeMerchandising(formData.merchandising).sponsored.enabled}
                      onChange={(event) => updateSponsoredField('enabled', event.target.checked)}
                    />
                  </FormRow>

                  <FormRow label="Prioridade">
                    <input
                      type="number"
                      min={1}
                      value={normalizeMerchandising(formData.merchandising).sponsored.priority ?? 10}
                      onChange={(event) => updateSponsoredField('priority', Number(event.target.value || 10))}
                      className={baseInputClasses}
                    />
                  </FormRow>

                  <FormRow label="Rótulo">
                    <input
                      value={normalizeMerchandising(formData.merchandising).sponsored.label || 'Patrocinado'}
                      onChange={(event) => updateSponsoredField('label', event.target.value)}
                      className={baseInputClasses}
                    />
                  </FormRow>

                  <div className="rounded-lg border border-gray-700 bg-black/30 p-4 text-sm text-gray-400">
                    Hoje o marketplace usa esse patrocinado na vitrine do detalhe do produto. O próximo passo natural é expandir isso para campanhas por página, busca e home.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mlm' && (
            <div className="space-y-4">
              <FormRow
                label="Qualifica para Formacao de Ciclo?"
                description="Se ativo, a venda deste produto conta para ciclo no plano de marketing."
              >
                <SettingsToggle
                  name="qualifiesForCycle"
                  checked={formData.mlm.qualifiesForCycle}
                  onChange={handleMlmToggleChange}
                />
              </FormRow>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="p-4 bg-black/50 rounded-lg border border-gray-700/50">
                  <h3 className="text-base font-semibold text-yellow-500 mb-2">Resumo rapido</h3>
                  <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                    <li>Produto com ciclo ativo conta para as regras de MLM da plataforma.</li>
                    <li>As configuracoes sao salvas no campo `specifications.mlm` do produto.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end space-x-3">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-60">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProductDetailModal;
