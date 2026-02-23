import React from 'react';
import { StarIcon } from './icons/StarIcon';

interface ReviewSummaryProps {
    rating: number;
    reviewCount: number;
    distribution?: { [key: number]: number }; // e.g., { 5: 86, 4: 7, ... }
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ rating, reviewCount, distribution = { 5: 86, 4: 7, 3: 3, 2: 1, 1: 3 } }) => {
    return (
        <div className="flex flex-col md:flex-row gap-8 py-8 border-b border-[rgb(var(--color-brand-gray-light))]">
            {/* Left: Global Rating */}
            <div className="w-full md:w-1/3 space-y-2">
                <h3 className="text-xl font-bold">Avaliações de clientes</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-gray-light))]'}`} />
                        ))}
                    </div>
                    <span className="text-lg font-bold">{rating} de 5</span>
                </div>
                <p className="text-[rgb(var(--color-brand-text-dim))] text-sm">{reviewCount.toLocaleString()} avaliações globais</p>

                {/* Distribution Bars */}
                <div className="space-y-2 mt-4">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3 group cursor-pointer">
                            <span className="text-sm font-bold w-12 hover:text-[rgb(var(--color-brand-gold))] transition-colors">{star} estrelas</span>
                            <div className="flex-1 h-4 bg-[rgb(var(--color-brand-gray-light))]/30 rounded-sm overflow-hidden border border-[rgb(var(--color-brand-gray-light))]">
                                <div
                                    className="h-full bg-[rgb(var(--color-brand-gold))] transition-all duration-1000"
                                    style={{ width: `${distribution[star]}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold w-10 text-right">{distribution[star]}%</span>
                        </div>
                    ))}
                </div>

                <div className="pt-4">
                    <button className="text-[rgb(var(--color-brand-gold))] text-sm font-bold hover:underline transition-all">
                        Como as avaliações e classificações de clientes funcionam ⌄
                    </button>
                </div>
            </div>

            {/* Right: Write a review */}
            <div className="w-full md:w-2/3 space-y-4">
                <h4 className="text-lg font-bold">Avaliar este produto</h4>
                <p className="text-[rgb(var(--color-brand-text-dim))] text-sm">Compartilhe seus pensamentos com outros clientes</p>
                <button
                    onClick={() => {
                        const reviewsSection = document.getElementById('reviews-section');
                        if (reviewsSection) {
                            const headerOffset = 80;
                            const elementPosition = reviewsSection.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }}
                    className="w-full md:w-auto border border-[rgb(var(--color-brand-gray-light))] text-white font-bold py-2 px-12 rounded-lg hover:bg-[rgb(var(--color-brand-gray-light))]/20 transition-all shadow-md"
                >
                    Escreva uma avaliação
                </button>
            </div>
        </div>
    );
};

export default ReviewSummary;
