import React, { useEffect, useMemo, useState } from 'react';
import { marketplaceAPI } from '../../src/services/api';
import { CubeIcon, PlusIcon, ArrowUpTrayIcon, CloseIcon, SpinnerIcon, CheckCircleIcon } from '../icons';
import type { Product, Collection } from '../../types';
import ProductDetailModal from './ProductDetailModal';

const statusClasses = {
  Ativo: 'bg-green-600/20 text-green-400',
  Inativo: 'bg-red-600/20 text-red-400',
};

const baseInputClasses =
  'bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5';

const getTenantId = () => {
  const envTenantId = (import.meta as any).env?.VITE_TENANT_ID || (import.meta as any).env?.VITE_MARKETPLACE_TENANT_ID;
  if (envTenantId) return envTenantId;

  if (typeof window !== 'undefined') {
    const keys = ['tenantId', 'tenant_id', 'marketplaceTenantId', 'storeTenantId'];
    for (const key of keys) {
      const value = window.localStorage.getItem(key);
      if (value) return value;
    }
  }

  return 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
};

const DEFAULT_TENANT_ID = getTenantId();

const normalizeStringArray = (value: any) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

const normalizeMaterials = (value: any): Product['materials'] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          name: item.split('/').pop() || 'arquivo',
          url: item,
        };
      }

      if (!item?.url) return null;

      return {
        name: item.name || item.url.split('/').pop() || 'arquivo',
        url: item.url,
        size: item.size,
        mimeType: item.mimeType || item.type,
      };
    })
    .filter(Boolean) as Product['materials'];
};

const normalizeProductMerchandising = (value: any): Product['merchandising'] => ({
  comboProductIds: Array.isArray(value?.comboProductIds)
    ? value.comboProductIds.filter((item: any) => item !== null && item !== undefined)
    : [],
  relatedProductIds: Array.isArray(value?.relatedProductIds)
    ? value.relatedProductIds.filter((item: any) => item !== null && item !== undefined)
    : [],
  sponsored: {
    enabled: Boolean(value?.sponsored?.enabled),
    priority: Number(value?.sponsored?.priority ?? 10),
    label: String(value?.sponsored?.label ?? 'Patrocinado'),
    placements: Array.isArray(value?.sponsored?.placements)
      ? value.sponsored.placements.filter((item: any) => typeof item === 'string')
      : ['product_detail_related'],
    startsAt: value?.sponsored?.startsAt ? String(value.sponsored.startsAt) : undefined,
    endsAt: value?.sponsored?.endsAt ? String(value.sponsored.endsAt) : undefined,
  },
});

const extractArrayResponse = (response: any) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.products)) return response.data.products;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const extractSingleResponse = (response: any) =>
  response?.data?.data || response?.data?.product || response?.data || null;

const mapApiCollectionToUiCollection = (apiCollection: any): Collection => ({
  id: String(apiCollection?.id || ''),
  name: String(apiCollection?.name || apiCollection?.title || 'Colecao'),
  title: String(apiCollection?.title || apiCollection?.name || 'Colecao'),
  description: String(apiCollection?.description || ''),
  imageUrl: String(apiCollection?.image || apiCollection?.image_url || ''),
  image: String(apiCollection?.image || apiCollection?.image_url || ''),
  status: apiCollection?.active === false ? 'Inativo' : 'Ativo',
  productIds: Array.isArray(apiCollection?.product_ids) ? apiCollection.product_ids.map(String) : [],
});

const mapApiProductToUiProduct = (apiProduct: any): Product => {
  const specifications = apiProduct?.specifications || {};
  const images = normalizeStringArray(apiProduct?.images);
  const collectionIds = normalizeStringArray(specifications?.collections);

  return {
    id: apiProduct?.id,
    tenantId: apiProduct?.tenant_id,
    name: apiProduct?.name || '',
    images,
    videos: normalizeStringArray(specifications?.videos),
    materials: normalizeMaterials(specifications?.materials),
    sku: apiProduct?.sku || '',
    description: apiProduct?.description || '',
    shortDescription: apiProduct?.short_description || specifications?.shortDescription || '',
    category: apiProduct?.category || '',
    subcategory: specifications?.subcategory || '',
    tags: Array.isArray(apiProduct?.tags) ? apiProduct.tags : [],
    fullPrice: Number(apiProduct?.price ?? apiProduct?.compare_price ?? 0),
    consultantPrice: Number(apiProduct?.member_price ?? apiProduct?.price ?? 0),
    costPrice: Number(apiProduct?.cost_price ?? 0),
    stock: Number(apiProduct?.stock_quantity ?? 0),
    trackStock: specifications?.trackQuantity ?? true,
    status: apiProduct?.published === false || apiProduct?.is_active === false ? 'Inativo' : 'Ativo',
    featuredImage: apiProduct?.featured_image || images[0] || null,
    collectionId: apiProduct?.collection_id ?? collectionIds[0] ?? null,
    collectionIds: collectionIds.length > 0
      ? collectionIds
      : (apiProduct?.collection_id ? [String(apiProduct.collection_id)] : []),
    supplier: specifications?.supplier || '',
    barcode: specifications?.barcode || '',
    weight: specifications?.weight,
    weightUnit: specifications?.weightUnit || 'kg',
    merchandising: normalizeProductMerchandising(specifications?.merchandising),
    mlm: {
      qualifiesForCycle: specifications?.mlm?.qualifiesForCycle ?? specifications?.qualifiesForCycle ?? true,
    },
  };
};

const buildApiPayload = (product: Product) => ({
  tenantId: product.tenantId || DEFAULT_TENANT_ID,
  name: product.name,
  description: product.description,
  shortDescription: product.shortDescription || '',
  sku: product.sku,
  category: product.category,
  subcategory: product.subcategory || '',
  tags: product.tags,
  price: product.fullPrice,
  memberPrice: product.consultantPrice,
  costPrice: product.costPrice,
  collectionIds: product.collectionIds || (product.collectionId ? [String(product.collectionId)] : []),
  collections: product.collectionIds || (product.collectionId ? [String(product.collectionId)] : []),
  stock: product.stock,
  images: product.images,
  videos: product.videos,
  materials: product.materials,
  featuredImage: product.featuredImage || product.images[0] || null,
  published: product.status === 'Ativo',
  isActive: product.status === 'Ativo',
  trackStock: product.trackStock,
  mlm: product.mlm,
  specifications: {
    shortDescription: product.shortDescription || '',
    trackQuantity: product.trackStock,
    videos: product.videos,
    materials: product.materials,
    subcategory: product.subcategory || '',
    supplier: product.supplier || '',
    barcode: product.barcode || '',
    weight: product.weight,
    weightUnit: product.weightUnit,
    collections: product.collectionIds || (product.collectionId ? [String(product.collectionId)] : []),
    merchandising: product.merchandising,
    mlm: product.mlm,
    qualifiesForCycle: product.mlm?.qualifiesForCycle ?? true,
  }
});

const ImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowUpTrayIcon className="w-6 h-6 text-yellow-500" />
            Importar Produtos em Massa
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="mt-4 text-xl font-bold text-white">Importacao concluida</h3>
              <p className="text-gray-400 mt-1">Fluxo visual mantido. A integracao em massa ainda precisa do parser do arquivo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Envie uma planilha <code className="text-yellow-400 font-mono">.csv</code> ou <code className="text-yellow-400 font-mono">.xlsx</code>.
              </p>
              <div className="mt-4">
                <label
                  htmlFor="import-file-upload"
                  className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50"
                >
                  <CubeIcon className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-sm font-semibold text-yellow-500">
                    {file ? file.name : 'Clique para selecionar o arquivo'}
                  </span>
                  <span className="text-xs text-gray-500">ou arraste e solte aqui</span>
                </label>
                <input
                  id="import-file-upload"
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
        </main>
        {!isSuccess && (
          <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end">
            <button
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className="flex items-center justify-center gap-2 w-48 bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isProcessing ? (
                <>
                  <SpinnerIcon className="w-5 h-5 animate-spin" /> Processando...
                </>
              ) : (
                'Processar Arquivo'
              )}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

const MarketplaceProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    loadProducts();
    loadCollections();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await marketplaceAPI.getAllProducts({ tenantId: DEFAULT_TENANT_ID });
      const rawProducts = extractArrayResponse(response);
      setProducts(rawProducts.map(mapApiProductToUiProduct));
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError(err?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await marketplaceAPI.getCollections({ tenantId: DEFAULT_TENANT_ID });
      const rawCollections = extractArrayResponse(response);
      setCollections(rawCollections.map(mapApiCollectionToUiCollection));
    } catch (err) {
      console.warn('Nao foi possivel carregar colecoes do marketplace para os relacionamentos.', err);
      setCollections([]);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productToSave: Product) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = buildApiPayload(productToSave);
      const response = editingProduct
        ? await marketplaceAPI.updateProduct(editingProduct.id, payload)
        : await marketplaceAPI.createProduct(payload);

      const savedProduct = extractSingleResponse(response);
      if (savedProduct) {
        const mappedProduct = mapApiProductToUiProduct(savedProduct);
        setProducts((prev) =>
          editingProduct
            ? prev.map((product) => (product.id === mappedProduct.id ? mappedProduct : product))
            : [mappedProduct, ...prev]
        );
      } else {
        await loadProducts();
      }

      setSuccess(editingProduct ? 'Produto atualizado no Supabase.' : 'Produto criado no Supabase.');
      handleCloseModal();
      await loadProducts();
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      setError(err?.message || 'Nao foi possivel salvar o produto.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'Todos' || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <CubeIcon className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-yellow-500 ml-3">Produtos do Marketplace</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Importar Produtos
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Produto
          </button>
        </div>
      </header>

      {(error || success) && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-green-500/30 bg-green-500/10 text-green-300'}`}>
          {error || success}
        </div>
      )}

      <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <input
            type="text"
            placeholder="Buscar produtos por nome ou SKU"
            className={baseInputClasses}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select className={baseInputClasses} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className={baseInputClasses} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-yellow-500 uppercase bg-black/30">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Preco Consultor</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <span className="inline-flex items-center gap-2">
                      <SpinnerIcon className="w-5 h-5 animate-spin" />
                      Carregando produtos...
                    </span>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const previewImage = product.featuredImage || product.images[0];
                  return (
                    <tr key={String(product.id)} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          {previewImage ? (
                            <img src={previewImage} alt={product.name} className="w-12 h-12 rounded-md object-cover bg-gray-800" />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-500">
                              Sem imagem
                            </div>
                          )}
                          <div>
                            <div className="text-white">{product.name}</div>
                            {(product.videos.length > 0 || product.materials.length > 0) && (
                              <div className="text-xs text-gray-500">
                                {product.images.length} img · {product.videos.length} videos · {product.materials.length} materiais
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono">{product.sku || '-'}</td>
                      <td className="px-6 py-4">{product.category || '-'}</td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {product.consultantPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.stock > 0 ? product.stock : <span className="text-red-400">Esgotado</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[product.status]}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEdit(product)} className="font-medium text-yellow-500 hover:text-yellow-400">
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductDetailModal
        isOpen={isModalOpen}
        product={editingProduct}
        availableProducts={products}
        availableCollections={collections}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
      />

      {saving && (
        <div className="fixed bottom-6 right-6 bg-black/80 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 shadow-lg">
          <span className="inline-flex items-center gap-2">
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            Sincronizando com o Supabase...
          </span>
        </div>
      )}

      {isImportModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} />}
    </div>
  );
};

export default MarketplaceProductsPage;
