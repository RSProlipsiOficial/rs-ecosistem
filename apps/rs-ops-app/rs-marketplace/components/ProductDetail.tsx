

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Collection, ProductVariant, Review, Question, Answer } from '../types';
import { StarIcon } from './icons/StarIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ReturnGuaranteeIcon } from './icons/ReturnGuaranteeIcon';
import ProductReviews from './ProductReviews';
import ProductQA from './ProductQA';
import { HeartIcon } from './icons/HeartIcon';
import { ChevronLeft, ChevronRight, Share2, Plus, Minus } from 'lucide-react';

interface ProductDetailProps {
    product: Product;
    collections: Collection[];
    onBack: () => void;
    onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
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
    product, collections, onBack, onAddToCart, onNavigate, reviews, onReviewSubmit,
    wishlist, onToggleWishlist, questions, onQuestionSubmit, onAnswerSubmit
}) => {
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
        const initialOptions: { [key: string]: string } = {};
        product.options.forEach(option => {
            initialOptions[option.name] = option.values[0];
        });
        return initialOptions;
    });

    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-carousel logic (30 seconds as requested by Roberto)
    useEffect(() => {
        if (product.images.length <= 1) return;

        autoPlayRef.current = setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % product.images.length);
        }, 30000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [product.images.length]);

    const resetTimer = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (product.images.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setActiveImageIndex((prev) => (prev + 1) % product.images.length);
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
                sku: product.sku
            };
        }
        return product.variants.find(variant =>
            Object.entries(selectedOptions).every(([key, value]) => variant.options[key] === value)
        );
    }, [selectedOptions, product]);

    const isInWishlist = wishlist.includes(product.id);

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleAddToCartClick = () => {
        if (selectedVariant) {
            onAddToCart(product, quantity, selectedVariant);
        } else {
            alert("Por favor, selecione uma opção válida.");
        }
    };

    const productCollection = product.collectionId ? collections.find(c => c.id === product.collectionId) : null;
    const isOutOfStock = selectedVariant ? selectedVariant.inventory <= 0 : product.inventory <= 0;
    const productQuestions = questions.filter(q => q.productId === product.id);

    return (
        <section className="py-2 bg-black text-white min-h-screen">
            <div className="container mx-auto px-6">
                {/* Header Section / Breadcrumb */}
                <div className="flex justify-between items-center mb-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-[rgb(var(--color-brand-gold))] transition-colors group"
                    >
                        <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Voltar para a Loja
                    </button>
                    <div className="flex gap-4">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={() => onToggleWishlist(product.id)}
                            className={`p-2 transition-colors ${isInWishlist ? 'text-[rgb(var(--color-brand-gold))]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <HeartIcon className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Left Side: Media Gallery */}
                    <div style={{ flex: '0 0 60%' }}>
                        <div className="relative bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 group">
                            <img
                                src={product.images[activeImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Navigation inside main image */}
                            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleImageChange((activeImageIndex - 1 + product.images.length) % product.images.length)}
                                    className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-[rgb(var(--color-brand-gold))] hover:text-black transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => handleImageChange((activeImageIndex + 1) % product.images.length)}
                                    className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-[rgb(var(--color-brand-gold))] hover:text-black transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Image counter */}
                            <div className="absolute bottom-6 right-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-white/70 border border-white/10">
                                {activeImageIndex + 1} / {product.images.length}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleImageChange(index)}
                                    className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-[rgb(var(--color-brand-gold))] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Product Details */}
                    <div style={{ flex: '1 1 0' }}>
                        <div className="lg:sticky lg:top-24 space-y-5">
                            <div>
                                {productCollection && (
                                    <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-bold text-[rgb(var(--color-brand-gold))] mb-4 px-2 py-0.5 border border-[rgb(var(--color-brand-gold))]/30 rounded">
                                        {productCollection.title}
                                    </span>
                                )}
                                <h1 className="text-2xl md:text-3xl font-bold font-display leading-[1.1] text-white">
                                    {product.name}
                                </h1>

                                {(() => {
                                    const approvedForProduct = reviews.filter(r => r.productId === product.id && r.status === 'Aprovada');
                                    const avgRating = approvedForProduct.length > 0
                                        ? approvedForProduct.reduce((sum, r) => sum + r.rating, 0) / approvedForProduct.length
                                        : 0;
                                    return (
                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`h-4 w-4 ${i < Math.round(avgRating) ? 'text-[rgb(var(--color-brand-gold))]' : 'text-neutral-800'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-neutral-500 uppercase tracking-widest border-l border-white/10 pl-4">
                                                {approvedForProduct.length > 0 ? `${approvedForProduct.length} Avaliações de Clientes` : 'Sem avaliações ainda'}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-light text-[rgb(var(--color-brand-gold))]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency }).format(selectedVariant?.price || product.price)}
                                    </span>
                                    {product.compareAtPrice && (
                                        <span className="text-lg text-neutral-600 line-through font-light">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency }).format(product.compareAtPrice)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400 font-medium">Ou em 10x sem juros no cartão</p>
                            </div>

                            <div className="p-4 bg-neutral-950 rounded-2xl border border-white/5 space-y-4">
                                {/* Variants / Options */}
                                {product.options && product.options.length > 0 && (
                                    <div className="space-y-6">
                                        {product.options.map(option => (
                                            <div key={option.id}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">{option.name}</p>
                                                    <span className="text-[10px] text-[rgb(var(--color-brand-gold))]">{selectedOptions[option.name]}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {option.values.map(value => (
                                                        <button
                                                            key={value}
                                                            onClick={() => handleOptionChange(option.name, value)}
                                                            className={`px-5 py-2 text-xs rounded-full border transition-all ${selectedOptions[option.name] === value ? 'bg-[rgb(var(--color-brand-gold))] text-black border-[rgb(var(--color-brand-gold))] font-bold shadow-[0_0_15px_rgba(var(--color-brand-gold),0.3)]' : 'bg-transparent border-white/10 text-neutral-400 hover:border-white/30'}`}
                                                        >
                                                            {value}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex items-center bg-black border border-white/10 rounded-xl h-14">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCartClick}
                                            disabled={isOutOfStock}
                                            className="flex-grow h-14 bg-[rgb(var(--color-brand-gold))] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-95 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isOutOfStock ? "Indisponível" : "Finalizar Pedido"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                                    <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-b from-[rgb(var(--color-brand-gold))]/10 to-transparent rounded-xl border border-[rgb(var(--color-brand-gold))]/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-brand-gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 12 15 16 10" /></svg>
                                        <span className="text-[8px] uppercase tracking-widest font-bold text-[rgb(var(--color-brand-gold))]/80 text-center leading-tight">Garantia<br />RS</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-b from-[rgb(var(--color-brand-gold))]/10 to-transparent rounded-xl border border-[rgb(var(--color-brand-gold))]/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-brand-gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span className="text-[8px] uppercase tracking-widest font-bold text-[rgb(var(--color-brand-gold))]/80 text-center leading-tight">7 Dias<br />Grátis</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-b from-[rgb(var(--color-brand-gold))]/10 to-transparent rounded-xl border border-[rgb(var(--color-brand-gold))]/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-brand-gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><polyline points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                                        <span className="text-[8px] uppercase tracking-widest font-bold text-[rgb(var(--color-brand-gold))]/80 text-center leading-tight">Envio<br />Seguro</span>
                                    </div>
                                </div>
                            </div>

                            {/* Short Description */}
                            <div className="prose prose-sm prose-invert text-neutral-400 line-clamp-3 leading-relaxed">
                                {product.shortDescription}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Detailed Info & Engagement */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <div className="flex justify-center border-b border-white/5 mb-12">
                        <nav className="flex space-x-12" aria-label="Tabs">
                            {['description', 'reviews', 'qa'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative py-4 text-xs uppercase tracking-[3px] font-bold transition-all ${activeTab === tab ? 'text-[rgb(var(--color-brand-gold))]' : 'text-neutral-600 hover:text-neutral-400'}`}
                                >
                                    {tab === 'description' ? 'Especificações' : tab === 'reviews' ? `Opiniões (${reviews.filter(r => r.productId === product.id && r.status === 'Aprovada').length})` : `Dúvidas (${productQuestions.length})`}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgb(var(--color-brand-gold))] shadow-[0_0_10px_rgb(var(--color-brand-gold))]"></span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === 'description' && (
                            <div className="prose prose-invert max-w-none prose-neutral">
                                <div className="text-neutral-400 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: product.description }} />
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
            </div>
        </section>
    );
};

export default ProductDetail;
