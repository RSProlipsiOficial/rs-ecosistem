
import React, { useState, useMemo } from 'react';
import { DropshippingProduct, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { ImportIcon } from './icons/ImportIcon';

interface DropshippingCatalogProps {
    products: DropshippingProduct[];
    onImport: (product: DropshippingProduct) => void;
    onEdit: (product: DropshippingProduct) => void;
    onNavigate: (view: View) => void;
}

const DropshippingProductCard: React.FC<{ product: DropshippingProduct; onImport: (product: DropshippingProduct) => void; onEdit: (product: DropshippingProduct) => void; }> = ({ product, onImport, onEdit }) => (
    <div className="bg-[rgb(var(--color-brand-gray))]/[.50] border border-[rgb(var(--color-brand-gray-light))] rounded-lg overflow-hidden group flex flex-col">
        <div className="relative">
            <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover" />
            <div className="absolute top-2 right-2 bg-[rgb(var(--color-brand-dark))]/[.50] text-[rgb(var(--color-brand-text-light))] text-xs px-2 py-1 rounded-full">{product.supplier}</div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-md font-bold text-[rgb(var(--color-brand-text-light))] truncate group-hover:text-[rgb(var(--color-brand-gold))] flex-grow">{product.name}</h3>
            <div className="mt-2 flex justify-between items-baseline">
                <div>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Custo</p>
                    <p className="text-lg font-semibold text-[rgb(var(--color-brand-text-dim))]">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(product.costPrice)}</p>
                </div>
                <div>
                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Venda Sugerida</p>
                    <p className="text-lg font-bold text-[rgb(var(--color-brand-gold))]">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(product.suggestedRetailPrice)}</p>
                </div>
            </div>
             <div className="mt-4 space-y-2">
                <button 
                    onClick={() => onEdit(product)}
                    className="w-full text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400 transition-colors"
                >
                    Editar e Importar
                </button>
                <button 
                    onClick={() => onImport(product)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] transition-colors"
                >
                    <ImportIcon className="w-5 h-5"/>
                    Importação Rápida
                </button>
            </div>
        </div>
    </div>
);

const DropshippingCatalog: React.FC<DropshippingCatalogProps> = ({ products, onImport, onEdit, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    return (
        <div>
            <div className="mb-6">
                 <div className="relative flex-grow max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar produtos no catálogo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map(product => (
                    <DropshippingProductCard key={product.id} product={product} onImport={onImport} onEdit={onEdit} />
                ))}
            </div>

        </div>
    );
};

export default DropshippingCatalog;