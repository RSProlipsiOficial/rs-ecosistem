import React, { useState } from 'react';
import { Product, Review, Question } from '../types';
import ReviewsSection from './ReviewsSection';
import ProductQA from './ProductQA';

interface ProductTabsProps {
    product: Product;
    reviews: Review[];
    questions: Question[];
    onReviewSubmit: (data: any) => void;
    onQuestionSubmit: (data: any) => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
    product,
    reviews,
    questions,
    onReviewSubmit,
    onQuestionSubmit
}) => {
    const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'faq'>('desc');

    const tabs = [
        { id: 'desc', label: 'Descrição' },
        { id: 'specs', label: 'Características Técnicas' },
        { id: 'reviews', label: `Avaliações (${reviews.length})` },
        { id: 'faq', label: 'Perguntas Frequentes' },
    ] as const;

    return (
        <div className="w-full bg-rs-dark border border-rs-border rounded-3xl overflow-hidden shadow-2xl mt-12">
            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-rs-border bg-rs-gray/30">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-6 px-4 text-sm md:text-base font-black uppercase tracking-[0.1em] transition-all duration-300 relative
                            ${activeTab === tab.id
                                ? 'text-rs-gold bg-rs-gray/50'
                                : 'text-zinc-500 hover:text-white hover:bg-rs-gray/20'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-rs-gold shadow-[0_0_15px_rgba(200,167,78,0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-8 md:p-12 min-h-[400px]">
                {activeTab === 'desc' && (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest font-display">Sobre o Produto</h3>
                        <div
                            className="prose prose-invert prose-gold max-w-none text-zinc-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                )}

                {activeTab === 'specs' && (
                    <div className="animate-fade-in">
                        <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest font-display">Ficha Técnica</h3>
                        {product.options && product.options.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {product.options.map((opt) => (
                                    <div key={opt.name} className="flex justify-between items-center p-4 bg-rs-gray rounded-xl border border-rs-border">
                                        <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">{opt.name}</span>
                                        <span className="text-white font-medium text-sm">
                                            {opt.values.join(', ')}
                                        </span>
                                    </div>
                                ))}
                                {/* Mock stats for demo if empty */}
                                <div className="flex justify-between items-center p-4 bg-rs-gray rounded-xl border border-rs-border">
                                    <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">SKU</span>
                                    <span className="text-white font-medium text-sm">{product.id}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-rs-gray rounded-xl border border-rs-border">
                                    <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Marca</span>
                                    <span className="text-white font-medium text-sm">{product.seller}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-500 italic">Nenhuma especificação técnica disponível.</p>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="animate-fade-in">
                        <ReviewsSection
                            productId={product.id}
                            productName={product.name}
                            reviews={reviews}
                            onReviewSubmit={onReviewSubmit}
                        />
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="animate-fade-in">
                        <ProductQA
                            product={product}
                            questions={questions}
                            onQuestionSubmit={onQuestionSubmit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductTabs;
