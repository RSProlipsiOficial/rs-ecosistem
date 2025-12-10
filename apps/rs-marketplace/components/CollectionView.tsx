

import React, { useMemo, useState } from 'react';
import { Collection, Product } from '../types';
import ProductCard from './ProductCard';

interface CollectionViewProps {
    collection: Collection;
    products: Product[];
    onProductClick: (product: Product) => void;
    onBack: () => void;
    wishlist: string[];
    onToggleWishlist: (productId: string) => void;
}

const CollectionView: React.FC<CollectionViewProps> = ({ collection, products, onProductClick, onBack, wishlist, onToggleWishlist }) => {
    const [sortOrder, setSortOrder] = useState('default');
    const collectionProducts = products.filter(p => collection.productIds.includes(p.id));
    
    const sortedProducts = useMemo(() => {
        const sorted = [...collectionProducts];
        switch (sortOrder) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
        return sorted;
    }, [collectionProducts, sortOrder]);


    return (
        <div className="bg-[rgb(var(--color-brand-dark))]">
            <div className="relative h-64 md:h-80 flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: `url(${collection.imageUrl})` }}>
                <div className="absolute inset-0 bg-[rgb(var(--color-brand-dark))]/[.70]"></div>
                <div className="relative z-10 px-4">
                    <h1 className="text-4xl md:text-6xl font-bold font-display text-[rgb(var(--color-brand-text-light))] drop-shadow-lg">{collection.title}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[rgb(var(--color-brand-text-dim))]">{collection.description}</p>
                </div>
            </div>
             <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4">
                     <div className="flex justify-between items-center mb-8">
                        <button onClick={onBack} className="text-sm text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]">
                            &larr; Voltar
                        </button>
                        <div>
                            <label htmlFor="sort-order" className="sr-only">Ordenar por</label>
                            <select 
                                id="sort-order"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))] text-sm focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                            >
                                <option value="default">Padrão</option>
                                <option value="price-asc">Preço: Menor para Maior</option>
                                <option value="price-desc">Preço: Maior para Menor</option>
                                <option value="name-asc">Nome: A-Z</option>
                            </select>
                        </div>
                    </div>
                    {sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {sortedProducts.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onClick={() => onProductClick(product)}
                                    wishlist={wishlist}
                                    onToggleWishlist={onToggleWishlist}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-[rgb(var(--color-brand-text-dim))]">Nenhum produto encontrado nesta coleção.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CollectionView;