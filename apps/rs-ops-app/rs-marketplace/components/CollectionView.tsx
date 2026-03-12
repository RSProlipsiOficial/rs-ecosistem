import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Collection, Product, SponsoredSettings } from '../types';
import ProductCard from './ProductCard';
import FeaturedProducts from './FeaturedProducts';
import { isSponsoredCampaignActive, rotateSponsoredProducts } from '../utils/sponsored';

interface CollectionViewProps {
    collection: Collection;
    products: Product[];
    sponsoredSettings?: Partial<SponsoredSettings> | null;
    onProductClick: (product: Product) => void;
    onBack: () => void;
    wishlist: string[];
    onToggleWishlist: (productId: string) => void;
}

const CollectionView: React.FC<CollectionViewProps> = ({ collection, products, sponsoredSettings, onProductClick, onBack, wishlist, onToggleWishlist }) => {
    const [sortOrder, setSortOrder] = useState('default');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsVisible, setItemsVisible] = useState(4);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const collectionProducts = products.filter((p) => collection.productIds.includes(p.id));

    const collectionSpotlightProducts = useMemo(() => {
        const sponsoredPool = products
            .filter((product) => isSponsoredCampaignActive(product, 'collection_spotlight', { collectionId: collection.id }))
            .sort((a, b) => Number(a.merchandising?.sponsored?.priority ?? 999) - Number(b.merchandising?.sponsored?.priority ?? 999));

        return rotateSponsoredProducts(sponsoredPool, 'collection_spotlight', sponsoredSettings);
    }, [products, collection.id, sponsoredSettings]);

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

    useEffect(() => {
        const updateVisible = () => {
            if (window.innerWidth >= 1280) setItemsVisible(4);
            else if (window.innerWidth >= 900) setItemsVisible(3);
            else if (window.innerWidth >= 640) setItemsVisible(2);
            else setItemsVisible(1.15);
        };

        updateVisible();
        window.addEventListener('resize', updateVisible);
        return () => window.removeEventListener('resize', updateVisible);
    }, []);

    useEffect(() => {
        setCurrentIndex(0);
    }, [sortOrder, collection.id]);

    const totalItems = sortedProducts.length;
    const maxIndex = Math.max(0, totalItems - Math.floor(itemsVisible));

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    useEffect(() => {
        if (totalItems <= itemsVisible) return;

        autoPlayRef.current = setInterval(() => {
            nextSlide();
        }, 4500);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [maxIndex, itemsVisible, totalItems]);

    const resetTimer = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (totalItems > itemsVisible) {
            autoPlayRef.current = setInterval(() => {
                nextSlide();
            }, 4500);
        }
    };

    const handleNext = () => {
        nextSlide();
        resetTimer();
    };

    const handlePrev = () => {
        prevSlide();
        resetTimer();
    };

    return (
        <div className="bg-[rgb(var(--color-brand-dark))]">
            <div
                className="relative h-64 md:h-80 flex items-center justify-center text-center bg-cover bg-center"
                style={{ backgroundImage: `url(${collection.imageUrl})` }}
            >
                <div className="absolute inset-0 bg-[rgb(var(--color-brand-dark))]/[.70]"></div>
                <div className="relative z-10 px-4">
                    <h1 className="text-4xl md:text-6xl font-bold font-display text-[rgb(var(--color-brand-text-light))] drop-shadow-lg">
                        {collection.title}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[rgb(var(--color-brand-text-dim))]">
                        {collection.description}
                    </p>
                </div>
            </div>

            <section className="py-16 sm:py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
                        <button
                            onClick={onBack}
                            className="w-fit text-sm text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] transition-colors"
                        >
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
                                <option value="default">Padrao</option>
                                <option value="price-asc">Preco: Menor para Maior</option>
                                <option value="price-desc">Preco: Maior para Menor</option>
                                <option value="name-asc">Nome: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {collectionSpotlightProducts.length > 0 && (
                        <div className="mb-14">
                            <FeaturedProducts
                                title="Produtos premium da colecao"
                                subtitle="Patrocinado"
                                sponsoredPlacementId="collection_spotlight"
                                products={collectionSpotlightProducts}
                                onProductClick={onProductClick}
                                wishlist={wishlist}
                                onToggleWishlist={onToggleWishlist}
                            />
                        </div>
                    )}

                    {sortedProducts.length > 0 ? (
                        <>
                            <div className="relative group px-4 sm:px-8 lg:px-12">
                                {totalItems > itemsVisible && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-[rgb(var(--color-brand-gray-light))]/[.40] hover:bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
                                            aria-label="Anterior"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>

                                        <button
                                            onClick={handleNext}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-[rgb(var(--color-brand-gray-light))]/[.40] hover:bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
                                            aria-label="Proximo"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}

                                <div className="overflow-hidden">
                                    <div
                                        className="flex -mx-4 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                                        style={{ transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)` }}
                                    >
                                        {sortedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex-shrink-0 px-4 flex justify-center"
                                                style={{ width: `${100 / itemsVisible}%` }}
                                            >
                                                <ProductCard
                                                    product={product}
                                                    onClick={() => onProductClick(product)}
                                                    wishlist={wishlist}
                                                    onToggleWishlist={onToggleWishlist}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {totalItems > itemsVisible && (
                                <div className="flex justify-center mt-8 space-x-2">
                                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setCurrentIndex(idx);
                                                resetTimer();
                                            }}
                                            className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-[rgb(var(--color-brand-gold))]' : 'w-2 bg-[rgb(var(--color-brand-gray-light))]'}`}
                                            aria-label={`Ir para slide ${idx + 1}`}
                                        ></button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-[rgb(var(--color-brand-text-dim))]">Nenhum produto encontrado nesta colecao.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CollectionView;
