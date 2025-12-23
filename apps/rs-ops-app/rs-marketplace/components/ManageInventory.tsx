

import React, { useState, useMemo, useEffect } from 'react';
import { Product, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface ManageInventoryProps {
    products: Product[];
    onSave: (updatedProducts: Product[]) => void;
    onNavigate: (view: View, data?: Product) => void;
}

const ManageInventory: React.FC<ManageInventoryProps> = ({ products, onSave, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState<Record<string, number | string>>({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const initialInventory = products.reduce((acc, p) => {
            acc[p.id] = p.inventory;
            return acc;
        }, {} as Record<string, number>);
        setInventory(initialInventory);
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);
    
    const handleInventoryChange = (productId: string, value: string) => {
        setInventory(prev => ({ ...prev, [productId]: value }));
        setHasChanges(true);
    };
    
    const handleSave = () => {
        const updatedProducts = products.map(p => {
            const newInventory = inventory[p.id];
            if (newInventory !== undefined && newInventory !== p.inventory) {
                return { ...p, inventory: Number(newInventory) };
            }
            return p;
        });
        onSave(updatedProducts);
        setHasChanges(false);
    };

    return (
         <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
            <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))] flex justify-between items-center">
                <div className="relative max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                    </div>
                </div>
                {hasChanges && (
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-[rgb(var(--color-brand-gold))]">Você tem alterações não salvas.</p>
                        <button onClick={handleSave} className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-secondary))]">Salvar Alterações</button>
                    </div>
                )}
            </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                    <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                         <tr>
                            <th scope="col" className="px-6 py-3">Produto</th>
                            <th scope="col" className="px-6 py-3">SKU</th>
                            <th scope="col" className="px-6 py-3">Disponível</th>
                         </tr>
                     </thead>
                     <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b border-[rgb(var(--color-brand-gray-light))]">
                                <td className="px-6 py-4 font-medium text-[rgb(var(--color-brand-text-light))]">{product.name}</td>
                                <td className="px-6 py-4">
                                    {product.sku ? (
                                        product.sku
                                    ) : (
                                        <button
                                            onClick={() => onNavigate('addEditProduct', product)}
                                            className="text-[rgb(var(--color-brand-gold))] hover:underline text-xs"
                                            title="Adicionar SKU para este produto"
                                        >
                                            Adicionar SKU
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <input 
                                        type="number" 
                                        value={inventory[product.id] ?? ''}
                                        onChange={(e) => handleInventoryChange(product.id, e.target.value)}
                                        className="w-24 bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-1 px-2 text-[rgb(var(--color-brand-text-light))]"
                                    />
                                </td>
                            </tr>
                        ))}
                     </tbody>
                 </table>
             </div>
         </div>
    );
};

export default ManageInventory;
