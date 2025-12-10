import React, { useState } from 'react';
import { useProductContext } from '../../context/ProductContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import ProductEditor from './ProductEditor';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons';

const StoreTab: React.FC = () => {
    const { products, deleteProduct } = useProductContext();
    const { t, language } = useLanguage();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleAddNew = () => {
        // Create a template for a new product without adding it to the context yet.
        const newProductTemplate: Product = {
            id: '', // Empty ID signifies a new product
            category: 'Physical',
            imageUrls: [], // Start with an empty image list
            purchaseUrl: '',
            translations: {
                pt: { name: 'Novo Produto', description: '' },
                en: { name: 'New Product', description: '' },
                es: { name: 'Nuevo Producto', description: '' }
            },
            variants: [{ id: `v_${new Date().getTime()}`, name: 'Padrão', price: 0, originalPrice: 0, sku: '', stock: 0 }], // Start with one variant
            reviews: [],
            status: 'draft',
            tags: [],
            shipping: { weight: 0, dimensions: { length: 0, width: 0, height: 0 } },
            seo: { metaTitle: '', metaDescription: '', slug: '' },
            eligibleForCartRecovery: false,
        };
        setEditingProduct(newProductTemplate);
    };

    const handleCloseEditor = () => {
        setEditingProduct(null);
    };
    
    if (editingProduct) {
        return <ProductEditor product={editingProduct} onClose={handleCloseEditor} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-accent">{t('admin_store_management_title')}</h2>
                    <p className="text-text-secondary mt-1">{t('admin_store_management_desc')}</p>
                </div>
                <button onClick={handleAddNew} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80 flex items-center space-x-2">
                    <PlusIcon />
                    <span>Adicionar Produto</span>
                </button>
            </div>

            <div className="bg-surface rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="bg-gray-800/50 text-xs text-text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="p-3 pl-4">Produto</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Estoque</th>
                            <th className="p-3">Preço</th>
                            <th className="p-3 pr-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-t border-border">
                                <td className="p-3 pl-4 flex items-center space-x-3">
                                    <img src={product.imageUrls[0] || 'https://via.placeholder.com/40'} alt="product" className="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-gray-700"/>
                                    <div>
                                        <div className="font-semibold text-text-primary">{product.translations[language]?.name || product.translations.pt.name}</div>
                                        <div className="text-xs text-gray-400">{product.category}</div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${product.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="p-3 text-text-secondary">{product.variants.reduce((acc, v) => acc + v.stock, 0)} em estoque</td>
                                <td className="p-3 text-text-secondary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(product.variants[0]?.price || 0)}</td>
                                <td className="p-3 pr-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => setEditingProduct(product)} className="p-2 text-text-secondary hover:text-accent"><PencilIcon /></button>
                                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-text-secondary hover:text-red-400"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StoreTab;