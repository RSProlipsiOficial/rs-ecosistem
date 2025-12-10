

import React, { useState, useMemo } from 'react';
import { Product, Collection, ProductVariant, Review, Question, Answer } from '../types';
import { StarIcon } from './icons/StarIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ReturnGuaranteeIcon } from './icons/ReturnGuaranteeIcon';
import ProductReviews from './ProductReviews';
import ProductQA from './ProductQA';
import { HeartIcon } from './icons/HeartIcon';

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
    const [activeImage, setActiveImage] = useState(product.images[0]);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>(() => {
        const initialOptions: {[key: string]: string} = {};
        product.options.forEach(option => {
            initialOptions[option.name] = option.values[0];
        });
        return initialOptions;
    });

    const selectedVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) {
            // Create a default variant for products without explicit variants
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
        setSelectedOptions(prev => ({...prev, [optionName]: value}));
    };

    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleAddToCartClick = () => {
        if (selectedVariant) {
            onAddToCart(product, quantity, selectedVariant);
            alert(`${quantity}x "${product.name}" adicionado ao carrinho!`);
        } else {
            alert("Por favor, selecione uma opção válida.");
        }
    };

    const productCollection = product.collectionId ? collections.find(c => c.id === product.collectionId) : null;
    const isOutOfStock = selectedVariant ? selectedVariant.inventory <= 0 : product.inventory <= 0;
    const productQuestions = questions.filter(q => q.productId === product.id);

    return (
        <section className="py-12 sm:py-16 bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))]">
            <div className="container mx-auto px-4">
                <button onClick={onBack} className="text-sm text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] mb-6">
                    &larr; Voltar aos produtos
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="aspect-square bg-[rgb(var(--color-brand-gray))]/[.50] rounded-lg overflow-hidden mb-4 border border-[rgb(var(--color-brand-gray-light))]">
                             <img src={activeImage} alt={product.name} className="w-full h-full object-cover"/>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {product.images.map((img, index) => (
                                <button key={index} onClick={() => setActiveImage(img)} className={`aspect-square rounded-md overflow-hidden border-2 ${activeImage === img ? 'border-[rgb(var(--color-brand-gold))]' : 'border-transparent hover:border-[rgb(var(--color-brand-gray-light))]'}`}>
                                    <img src={img} alt={`${product.name} - thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        {productCollection && (
                             <button onClick={() => onNavigate('collectionView', productCollection)} className="text-[rgb(var(--color-brand-gold))] font-semibold mb-1 hover:underline">
                                {productCollection.title}
                             </button>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold font-display text-[rgb(var(--color-brand-text-light))]">{product.name}</h1>
                        <div className="flex items-center mt-3">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-gray-light))]'}`} />
                                ))}
                            </div>
                            <span className="text-[rgb(var(--color-brand-text-dim))] text-sm ml-2">({product.reviewCount} avaliações)</span>
                        </div>

                        <p className="text-3xl md:text-4xl font-light text-[rgb(var(--color-brand-gold))] my-4">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency }).format(selectedVariant?.price || product.price)}
                        </p>
                        
                        <div className="prose prose-invert max-w-none text-[rgb(var(--color-brand-text-dim))] mb-6">
                            <p>{product.shortDescription}</p>
                        </div>
                        
                        {product.options && product.options.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {product.options.map(option => (
                                    <div key={option.id}>
                                        <p className="font-semibold text-[rgb(var(--color-brand-text-light))] mb-2">{option.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {option.values.map(value => (
                                                <button 
                                                    key={value}
                                                    onClick={() => handleOptionChange(option.name, value)}
                                                    className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${selectedOptions[option.name] === value ? 'bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] border-[rgb(var(--color-brand-gold))]' : 'bg-[rgb(var(--color-brand-dark))] border-[rgb(var(--color-brand-gray-light))] hover:border-[rgb(var(--color-brand-gray))]'}`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex items-center border border-[rgb(var(--color-brand-gray-light))] rounded-full">
                                <button onClick={() => handleQuantityChange(-1)} className="px-4 py-2 text-xl text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] rounded-l-full">-</button>
                                <span className="px-4 text-lg font-semibold">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="px-4 py-2 text-xl text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] rounded-r-full">+</button>
                            </div>
                            <button 
                                onClick={handleAddToCartClick}
                                disabled={isOutOfStock}
                                className="flex-grow bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-8 rounded-full text-lg hover:bg-[rgb(var(--color-brand-secondary))] transition-transform transform hover:scale-105 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed"
                            >
                                {isOutOfStock ? "Esgotado" : "Adicionar ao Carrinho"}
                            </button>
                            <button 
                                onClick={() => onToggleWishlist(product.id)}
                                className="p-3 border border-[rgb(var(--color-brand-gray-light))] rounded-full text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))]"
                                aria-label="Adicionar à lista de desejos"
                            >
                                <HeartIcon className={`w-6 h-6 transition-all ${isInWishlist ? 'text-[rgb(var(--color-brand-gold))] fill-current' : ''}`} />
                            </button>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                <ShieldCheckIcon className="w-6 h-6 text-[rgb(var(--color-success))]" />
                                <span>Compra <strong>100% segura</strong> e verificada.</span>
                            </div>
                             <div className="flex items-center gap-3 text-sm text-[rgb(var(--color-brand-text-dim))]">
                                <ReturnGuaranteeIcon className="w-6 h-6 text-[rgb(var(--color-info))]" />
                                <span>Garantia de devolução de <strong>7 dias</strong>.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description, Reviews & Q&A Tabs */}
                <div className="mt-16 border-t border-[rgb(var(--color-brand-gray-light))] pt-12">
                     <div className="border-b border-[rgb(var(--color-brand-gray-light))] mb-8">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('description')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'description' ? 'border-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))]' : 'border-transparent text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]'}`}>
                                Descrição
                            </button>
                            <button onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))]' : 'border-transparent text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]'}`}>
                                Avaliações ({product.reviewCount})
                            </button>
                            <button onClick={() => setActiveTab('qa')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'qa' ? 'border-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))]' : 'border-transparent text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]'}`}>
                                Perguntas ({productQuestions.length})
                            </button>
                        </nav>
                    </div>

                    <div>
                        {activeTab === 'description' && (
                            <div className="prose prose-invert max-w-none text-[rgb(var(--color-brand-text-dim))]" dangerouslySetInnerHTML={{ __html: product.description }} />
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
