

import React, { useState, useMemo } from 'react';
import { Product, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface ManageProductsProps {
    products: Product[];
    onNavigate: (view: View, data?: Product) => void;
    onDelete: (productIds: string[]) => void;
}

const ManageProducts: React.FC<ManageProductsProps> = ({ products, onNavigate, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [products, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProducts(filteredProducts.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
            <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))] flex justify-end"> {/* Flex container for alignment */}
                <div className="relative max-w-lg flex-grow"> {/* Added flex-grow */}
                    <input
                        type="text"
                        placeholder="Buscar produtos por nome ou SKU"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                    </div>
                </div>
                {/* Moved "Adicionar Produto" button here to be next to search on desktop */}
                <button 
                    onClick={() => onNavigate('addEditProduct')} 
                    className="ml-4 text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-secondary))] transition-colors whitespace-nowrap"
                >
                    + Adicionar Produto
                </button>
            </div>
            {selectedProducts.length > 0 && (
                <div className="p-4 bg-[rgb(var(--color-brand-gray))]/[.50]">
                    <button onClick={() => onDelete(selectedProducts)} className="flex items-center gap-2 text-sm text-[rgb(var(--color-error))] hover:text-[rgb(var(--color-error))]/[.80]">
                        <TrashIcon className="w-5 h-5"/>
                        Excluir {selectedProducts.length} produto(s)
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                    <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length} /></th>
                            <th scope="col" className="px-6 py-3">Produto</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Estoque</th>
                            <th scope="col" className="px-6 py-3">Preço</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b border-[rgb(var(--color-brand-gray-light))] hover:bg-[rgb(var(--color-brand-gray))]/[.50]">
                                <td className="w-4 p-4"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => handleSelectOne(product.id)} /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded"/>
                                        <button onClick={() => onNavigate('addEditProduct', product)} className="font-medium text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))]">{product.name}</button>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'Ativo' ? 'bg-[rgb(var(--color-success))]/[.20] text-[rgb(var(--color-success))]' : 'bg-[rgb(var(--color-brand-gray-light))]/[.20] text-[rgb(var(--color-brand-text-dim))]'}`}>{product.status}</span></td>
                                <td className="px-6 py-4">{product.inventory}</td>
                                <td className="px-6 py-4">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency }).format(product.price)}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onNavigate('addEditProduct', product)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]">
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageProducts;
