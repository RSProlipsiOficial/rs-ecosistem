import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product, Collection, ProductVariant, Review, Question, Answer, SponsoredSettings } from '../types';
import { StarIcon } from './icons/StarIcon';
import ProductReviews from './ProductReviews';
import ProductQA from './ProductQA';
import ProductCard from './ProductCard';
import { HeartIcon } from './icons/HeartIcon';
import { ChevronLeft, ChevronRight, Share2, Plus, Minus } from 'lucide-react';
import { isSponsoredCampaignActive, rotateSponsoredProducts } from '../utils/sponsored';
import { trackSponsoredClick, trackSponsoredImpressions } from '../utils/sponsoredTracking';

interface ProductDetailProps {
    product: Product;
    products: Product[];
    sponsoredSettings?: Partial<SponsoredSettings> | null;
    collections: Collection[];
    onBack: () => void;
    onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
    onProductClick: (product: Product) => void;
    onNavigate: (view: 'collectionView', data: Collection) => void;
    reviews: Review[];
    onReviewSubmit: (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => void;
    wishlist: string[];
    onToggleWishlist: (productId: string) => void;
    questions: Question[];
    onQuestionSubmit: (questionData: Omit<Question, 'id' | 'createdAt' | 'answers'>) => void;
    onAnswerSubmit: (questionId: string, answerData: Omit<Answer, 'id' | 'createdAt'>) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
    product,
    products,
    sponsoredSettings,
    collections,
    onBack,
    onAddToCart,
    onProductClick,
    onNavigate,
    reviews,
    onReviewSubmit,
    wishlist,
    onToggleWishlist,
    questions,
    onQuestionSubmit,
    onAnswerSubmit,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [isDesktopProductLayout, setIsDesktopProductLayout] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= 900;
    });
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
        const initialOptions: { [key: string]: string } = {};
        product.options.forEach(option => {
            initialOptions[option.name] = option.values[0];
        });
        return initialOptions;
    });

    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (product.images.length <= 1) return;

        autoPlayRef.current = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % product.images.length);
        }, 30000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [product.images.length]);

    useEffect(() => {
        const updateLayout = () => {
            setIsDesktopProductLayout(window.innerWidth >= 900);
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);

        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    const resetTimer = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (product.images.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setActiveImageIndex(prev => (prev + 1) % product.images.length);
            }, 30000);
        }
    };

    const handleImageChange = (index: number) => {
        setActiveImageIndex(index);
        resetTimer();
    };

    const selectedVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) {
            return {
                id: 'default',
                options: {},
                price: product.price,
                inventory: product.inventory,
                sku: product.sku,
            };
        }

        return product.variants.find(variant =>
            Object.entries(selectedOptions).every(([key, value]) => variant.options[key] === value)
        );
    }, [product, selectedOptions]);

    const productCollection = product.collectionId
        ? collections.find(collection => collection.id === product.collectionId)
        : null;
    const isOutOfStock = selectedVariant ? selectedVariant.inventory <= 0 : product.inventory <= 0;
    const inventoryMessage = String(product.inventoryStatusMessage || '').trim();
    const productQuestions = questions.filter(question => question.productId === product.id);
    const isInWishlist = wishlist.includes(product.id);
    const approvedReviews = reviews.filter(review => review.productId === product.id && review.status === 'Aprovada');
    const averageRating = approvedReviews.length > 0
        ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length
        : 0;
    const summaryText = (product.shortDescription || product.description?.replace(/<[^>]*>/g, '') || '').trim();
    const displayImages = product.images.length > 0
        ? product.images
        : product.featured_image
            ? [product.featured_image]
            : ['https://via.placeholder.com/900x900?text=Sem+Imagem'];
    const currentCollectionIds = useMemo(() => {
        const ids = new Set<string>();
        if (product.collectionId) ids.add(String(product.collectionId));
        (product.collectionIds || []).filter(Boolean).forEach(id => ids.add(String(id)));
        return ids;
    }, [product.collectionId, product.collectionIds]);
    const resolveLinkedProducts = (ids: string[] = []) => {
        const seen = new Set<string>();

        return ids
            .map((id) => products.find((candidate) =>
                String(candidate.id) === String(id) &&
                candidate.id !== product.id &&
                candidate.status === 'Ativo'
            ))
            .filter((candidate): candidate is Product => {
                if (!candidate) return false;
                const key = String(candidate.id);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    };
    const relatedProductPool = useMemo(() => {
        const fallback = products.filter(candidate => candidate.id !== product.id && candidate.status === 'Ativo');

        const scored = fallback.map(candidate => {
            let score = 0;
            const candidateCollectionIds = new Set<string>();
            if (candidate.collectionId) candidateCollectionIds.add(String(candidate.collectionId));
            (candidate.collectionIds || []).filter(Boolean).forEach(id => candidateCollectionIds.add(String(id)));

            if ([...candidateCollectionIds].some(id => currentCollectionIds.has(id))) score += 6;
            if (candidate.category && product.category && candidate.category === product.category) score += 4;
            if (candidate.subcategory && product.subcategory && candidate.subcategory === product.subcategory) score += 3;
            if (candidate.type && product.type && candidate.type === product.type) score += 2;
            if (candidate.supplier && product.supplier && candidate.supplier === product.supplier) score += 1;

            const discountCandidate = Number(candidate.compareAtPrice || 0) > Number(candidate.price || 0);
            if (discountCandidate) score += 1;

            return { candidate, score };
        });

        return scored
            .sort((a, b) =>
                b.score - a.score ||
                b.candidate.reviewCount - a.candidate.reviewCount ||
                b.candidate.price - a.candidate.price
            )
            .map(item => item.candidate);
    }, [products, product, currentCollectionIds]);
    const manualBundleProducts = useMemo(
        () => resolveLinkedProducts(product.merchandising?.comboProductIds || []),
        [product.merchandising?.comboProductIds, products, product.id]
    );
    const manualContextProducts = useMemo(
        () => resolveLinkedProducts(product.merchandising?.relatedProductIds || []),
        [product.merchandising?.relatedProductIds, products, product.id]
    );
    const customersAlsoBought = useMemo(
        () => manualContextProducts.length > 0 ? manualContextProducts : relatedProductPool.slice(0, 8),
        [manualContextProducts, relatedProductPool]
    );
    const sponsoredProducts = useMemo(() => {
        const sponsoredPool = products
            .filter((candidate) =>
                candidate.id !== product.id &&
                candidate.status === 'Ativo' &&
                isSponsoredCampaignActive(candidate, 'product_detail_related')
            )
            .sort((a, b) => {
                const priorityA = Number(a.merchandising?.sponsored?.priority ?? 999);
                const priorityB = Number(b.merchandising?.sponsored?.priority ?? 999);

                if (priorityA !== priorityB) return priorityA - priorityB;

                const sameContextA =
                    (a.category && product.category && a.category === product.category ? 1 : 0) +
                    (a.subcategory && product.subcategory && a.subcategory === product.subcategory ? 1 : 0);
                const sameContextB =
                    (b.category && product.category && b.category === product.category ? 1 : 0) +
                    (b.subcategory && product.subcategory && b.subcategory === product.subcategory ? 1 : 0);

                return sameContextB - sameContextA || b.reviewCount - a.reviewCount;
            });

        if (sponsoredPool.length > 0) {
            return rotateSponsoredProducts(sponsoredPool, 'product_detail_related', sponsoredSettings);
        }

        const discounted = relatedProductPool.filter(candidate => Number(candidate.compareAtPrice || 0) > Number(candidate.price || 0));
        const source = discounted.length > 0 ? discounted : relatedProductPool;
        return source.slice(0, 8);
    }, [products, product, relatedProductPool, sponsoredSettings]);
    const bundleProducts = useMemo(() => {
        if (manualBundleProducts.length > 0) {
            return [product, ...manualBundleProducts];
        }
        const firstTwo = relatedProductPool.slice(0, 2);
        return [product, ...firstTwo];
    }, [product, relatedProductPool, manualBundleProducts]);
    const bundleTotal = useMemo(
        () => bundleProducts.reduce((sum, item) => sum + Number(item.price || 0), 0),
        [bundleProducts]
    );
    const sponsoredLabel = useMemo(() => {
        const firstSponsored = sponsoredProducts.find((item) => item.merchandising?.sponsored?.enabled);
        return firstSponsored?.merchandising?.sponsored?.label || 'Patrocinado';
    }, [sponsoredProducts]);

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleAddToCartClick = () => {
        if (!selectedVariant) {
            alert('Selecione uma opcao valida.');
            return;
        }

        onAddToCart(product, quantity, selectedVariant);
    };

    const resolveDefaultVariant = (targetProduct: Product): ProductVariant => {
        if (targetProduct.variants && targetProduct.variants.length > 0) {
            return targetProduct.variants[0];
        }

        return {
            id: `${targetProduct.id}-default`,
            options: {},
            price: targetProduct.price,
            inventory: targetProduct.inventory,
            sku: targetProduct.sku,
        };
    };

    const handleAddBundleToCart = () => {
        bundleProducts.forEach(bundleProduct => {
            onAddToCart(bundleProduct, 1, resolveDefaultVariant(bundleProduct));
        });
    };

    return (
        <section className="min-h-screen bg-black py-2 text-white">
            <div className="container mx-auto px-6">
                <div className="mb-2 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[rgb(var(--color-brand-gold))]"
                    >
                        <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Voltar para a loja
                    </button>

                    <div className="flex gap-4">
                        <button className="p-2 text-gray-400 transition-colors hover:text-white">
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={() => onToggleWishlist(product.id)}
                            className={`p-2 transition-colors ${isInWishlist ? 'text-[rgb(var(--color-brand-gold))]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <HeartIcon className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/5 bg-[#080808] p-4 lg:p-6">
                    <div
                        className="gap-6"
                        style={isDesktopProductLayout
                            ? {
                                display: 'grid',
                                gridTemplateColumns: '84px minmax(0, 1fr) 420px',
                                alignItems: 'start',
                            }
                            : undefined}
                    >
                        <div className={`${isDesktopProductLayout ? 'order-1 flex flex-col gap-3' : 'order-2 flex gap-3 overflow-x-auto pb-1 scrollbar-hide'}`}>
                            {displayImages.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    onClick={() => handleImageChange(index)}
                                    className={`relative flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                                        activeImageIndex === index
                                            ? 'h-[72px] w-[72px] border-[rgb(var(--color-brand-gold))] shadow-[0_0_0_1px_rgba(var(--color-brand-gold),0.35)]'
                                            : 'h-[72px] w-[72px] border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                                    }`}
                                >
                                    <img src={image} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <div className={`relative flex items-center justify-center rounded-2xl border border-white/5 bg-neutral-900 p-4 ${isDesktopProductLayout ? 'order-2 min-h-[560px]' : 'order-1 min-h-[420px]'}`}>
                            <img
                                src={displayImages[activeImageIndex]}
                                alt={product.name}
                                className={`w-full object-contain ${isDesktopProductLayout ? 'max-h-[520px]' : 'max-h-[380px]'}`}
                            />

                            {displayImages.length > 1 && (
                                <>
                                    <div className="absolute inset-y-0 left-0 flex items-center p-4">
                                        <button
                                            onClick={() => handleImageChange((activeImageIndex - 1 + displayImages.length) % displayImages.length)}
                                            className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-all hover:bg-[rgb(var(--color-brand-gold))] hover:text-black"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                    </div>
                                    <div className="absolute inset-y-0 right-0 flex items-center p-4">
                                        <button
                                            onClick={() => handleImageChange((activeImageIndex + 1) % displayImages.length)}
                                            className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-all hover:bg-[rgb(var(--color-brand-gold))] hover:text-black"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="absolute bottom-6 right-6 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-md">
                                {activeImageIndex + 1} / {displayImages.length}
                            </div>
                        </div>

                        <div className={`order-3 w-full rounded-2xl border border-white/5 bg-neutral-950/80 p-5 ${isDesktopProductLayout ? 'max-w-[420px] p-6' : ''}`}>
                            <div className="space-y-6">
                                <div>
                                    {productCollection && (
                                        <button
                                            onClick={() => onNavigate('collectionView', productCollection)}
                                            className="mb-4 inline-block rounded border border-[rgb(var(--color-brand-gold))]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--color-brand-gold))]"
                                        >
                                            {productCollection.title}
                                        </button>
                                    )}

                                    <h1 className="font-display text-2xl font-bold leading-[1.1] text-white md:text-3xl">
                                        {product.name}
                                    </h1>

                                    <div className="mt-5 flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, index) => (
                                                <StarIcon
                                                    key={index}
                                                    className={`h-4 w-4 ${
                                                        index < Math.round(averageRating)
                                                            ? 'text-[rgb(var(--color-brand-gold))]'
                                                            : 'text-neutral-800'
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        <span className="border-l border-white/10 pl-4 text-xs uppercase tracking-widest text-neutral-500">
                                            {approvedReviews.length > 0 ? `${approvedReviews.length} avaliacoes` : 'Sem avaliacoes ainda'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 border-b border-white/5 pb-6">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-light text-[rgb(var(--color-brand-gold))]">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: product.currency,
                                            }).format(selectedVariant?.price || product.price)}
                                        </span>

                                        {product.compareAtPrice && (
                                            <span className="text-lg font-light text-neutral-600 line-through">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: product.currency,
                                                }).format(product.compareAtPrice)}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs font-medium text-neutral-400">Ou em 10x sem juros no cartao</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                                        Resumo do produto
                                    </p>
                                    <div className="mt-3 text-sm leading-7 text-neutral-300">
                                        {summaryText || 'Sem descricao curta disponivel para este produto.'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-brand-gold))]/20 bg-gradient-to-b from-[rgb(var(--color-brand-gold))]/10 to-transparent p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-brand-gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 12 15 16 10" /></svg>
                                        <span className="text-center text-[8px] font-bold uppercase leading-tight tracking-widest text-[rgb(var(--color-brand-gold))]/80">
                                            Garantia
                                            <br />
                                            RS
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-brand-gold))]/20 bg-gradient-to-b from-[rgb(var(--color-brand-gold))]/10 to-transparent p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-brand-gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span className="text-center text-[8px] font-bold uppercase leading-tight tracking-widest text-[rgb(var(--color-brand-gold))]/80">
                                            7 dias
                                            <br />
                                            gratis
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-brand-gold))]/20 bg-gradient-to-b from-[rgb(var(--color-brand-gold))]/10 to-transparent p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-brand-gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><polyline points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                                        <span className="text-center text-[8px] font-bold uppercase leading-tight tracking-widest text-[rgb(var(--color-brand-gold))]/80">
                                            Envio
                                            <br />
                                            seguro
                                        </span>
                                    </div>
                                </div>

                                {product.options && product.options.length > 0 && (
                                    <div className="space-y-6 border-t border-white/5 pt-5">
                                        {product.options.map(option => (
                                            <div key={option.id}>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                        {option.name}
                                                    </p>
                                                    <span className="text-[10px] text-[rgb(var(--color-brand-gold))]">
                                                        {selectedOptions[option.name]}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {option.values.map(value => (
                                                        <button
                                                            key={`${option.id}-${value}`}
                                                            onClick={() => handleOptionChange(option.name, value)}
                                                            className={`rounded-full border px-5 py-2 text-xs transition-all ${
                                                                selectedOptions[option.name] === value
                                                                    ? 'border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))] font-bold text-black shadow-[0_0_15px_rgba(var(--color-brand-gold),0.3)]'
                                                                    : 'border-white/10 bg-transparent text-neutral-400 hover:border-white/30'
                                                            }`}
                                                        >
                                                            {value}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-4 border-t border-white/5 pt-5">
                                    <div className="flex gap-4">
                                        <div className="flex h-14 items-center rounded-xl border border-white/10 bg-black">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                className="flex h-full w-12 items-center justify-center text-gray-400 transition-colors hover:text-white"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                className="flex h-full w-12 items-center justify-center text-gray-400 transition-colors hover:text-white"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleAddToCartClick}
                                            disabled={isOutOfStock}
                                            className="h-14 flex-grow rounded-xl bg-[rgb(var(--color-brand-gold))] text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:transform-none"
                                        >
                                            {isOutOfStock ? 'Indisponivel' : 'Adicionar ao carrinho'}
                                        </button>
                                    </div>
                                    {isOutOfStock && inventoryMessage && (
                                        <p className="mt-3 text-sm font-semibold text-red-400">
                                            {inventoryMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-24 max-w-4xl">
                    <div className="mb-12 flex justify-center border-b border-white/5">
                        <nav className="flex space-x-12" aria-label="Tabs">
                            {['description', 'reviews', 'qa'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative py-4 text-xs font-bold uppercase tracking-[3px] transition-all ${
                                        activeTab === tab ? 'text-[rgb(var(--color-brand-gold))]' : 'text-neutral-600 hover:text-neutral-400'
                                    }`}
                                >
                                    {tab === 'description'
                                        ? 'Especificacoes'
                                        : tab === 'reviews'
                                            ? `Opinioes (${approvedReviews.length})`
                                            : `Duvidas (${productQuestions.length})`}

                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[rgb(var(--color-brand-gold))] shadow-[0_0_10px_rgb(var(--color-brand-gold))]" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === 'description' && (
                            <div className="prose prose-invert prose-neutral max-w-none">
                                <div className="text-lg leading-relaxed text-neutral-400" dangerouslySetInnerHTML={{ __html: product.description }} />
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <ProductReviews product={product} reviews={reviews} onReviewSubmit={onReviewSubmit} />
                        )}

                        {activeTab === 'qa' && (
                            <ProductQA
                                productId={product.id}
                                questions={questions}
                                onQuestionSubmit={onQuestionSubmit}
                                onAnswerSubmit={onAnswerSubmit}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-20 space-y-12">
                    {bundleProducts.length > 1 && (
                        <div className="rounded-3xl border border-white/5 bg-[#0a0a0a] p-6 lg:p-8">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[rgb(var(--color-brand-gold))]">
                                        Combos
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-white">Frequentemente comprados juntos</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Preco total</p>
                                    <p className="mt-2 text-2xl font-semibold text-[rgb(var(--color-brand-gold))]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency }).format(bundleTotal)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                                <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {bundleProducts.map((bundleProduct, index) => (
                                        <React.Fragment key={bundleProduct.id}>
                                            <div className="shrink-0">
                                                <ProductCard
                                                    product={bundleProduct}
                                                    onClick={() => onProductClick(bundleProduct)}
                                                    wishlist={wishlist}
                                                    onToggleWishlist={onToggleWishlist}
                                                />
                                            </div>
                                            {index < bundleProducts.length - 1 && (
                                                <div className="hidden shrink-0 items-center justify-center text-4xl font-light text-[rgb(var(--color-brand-gold))] xl:flex">
                                                    +
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div className="rounded-2xl border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-gold))]/5 p-5 xl:w-[320px] xl:flex-none">
                                    <p className="text-sm leading-6 text-neutral-300">
                                        Monte um combo com o item atual e produtos complementares do mesmo catalogo.
                                    </p>
                                    <button
                                        onClick={handleAddBundleToCart}
                                        className="mt-5 w-full rounded-xl bg-[rgb(var(--color-brand-gold))] px-5 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-white"
                                    >
                                        Adicionar os {bundleProducts.length} ao carrinho
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {customersAlsoBought.length > 0 && (
                        <ProductShelf
                            title="Clientes tambem compraram"
                            subtitle="Produtos do mesmo contexto de busca e compra."
                            products={customersAlsoBought}
                            wishlist={wishlist}
                            onToggleWishlist={onToggleWishlist}
                            onProductClick={onProductClick}
                        />
                    )}

                    {sponsoredProducts.length > 0 && (
                        <ProductShelf
                            title="Produtos relacionados a este item"
                            subtitle={sponsoredLabel}
                            products={sponsoredProducts}
                            sponsoredPlacementId="product_detail_related"
                            wishlist={wishlist}
                            onToggleWishlist={onToggleWishlist}
                            onProductClick={onProductClick}
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

interface ProductShelfProps {
    title: string;
    subtitle?: string;
    products: Product[];
    wishlist: string[];
    onToggleWishlist: (productId: string) => void;
    onProductClick: (product: Product) => void;
    sponsoredPlacementId?: string;
}

const ProductShelf: React.FC<ProductShelfProps> = ({
    title,
    subtitle,
    products,
    wishlist,
    onToggleWishlist,
    onProductClick,
    sponsoredPlacementId,
}) => {
    useEffect(() => {
        if (!sponsoredPlacementId || products.length === 0) return;
        trackSponsoredImpressions(products, sponsoredPlacementId);
    }, [products, sponsoredPlacementId]);

    return (
    <div className="rounded-3xl border border-white/5 bg-[#0a0a0a] p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
            <div>
                {subtitle && (
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[rgb(var(--color-brand-gold))]">
                        {subtitle}
                    </p>
                )}
                <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
            </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {products.map(item => (
                <div key={item.id} className="shrink-0">
                    <ProductCard
                        product={item}
                        onClick={() => {
                            if (sponsoredPlacementId) {
                                trackSponsoredClick(item, sponsoredPlacementId);
                            }
                            onProductClick(item);
                        }}
                        wishlist={wishlist}
                        onToggleWishlist={onToggleWishlist}
                    />
                </div>
            ))}
        </div>
    </div>
    );
};

export default ProductDetail;
