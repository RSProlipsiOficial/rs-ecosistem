import React, { useMemo, useState } from 'react';
import { Product, Review } from '../types';
import { StarIcon } from './icons/StarIcon';
import { UserIcon } from './icons/UserIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ProductReviewsProps {
    product: Product;
    reviews: Review[];
    onReviewSubmit: (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product, reviews, onReviewSubmit }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 0, title: '', text: '', author: '' });
    const [hoverRating, setHoverRating] = useState(0);

    const approvedReviews = useMemo(() => {
        return reviews
            .filter(r => r.productId === product.id && r.status === 'Aprovada')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [reviews, product.id]);

    // Calcular rating REAL baseado nos reviews aprovados (não do product.rating mock)
    const realAverageRating = useMemo(() => {
        if (approvedReviews.length === 0) return 0;
        const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / approvedReviews.length;
    }, [approvedReviews]);

    const ratingDistribution = useMemo(() => {
        const distribution = [
            { stars: 5, count: 0, percentage: 0 },
            { stars: 4, count: 0, percentage: 0 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 },
        ];
        if (approvedReviews.length === 0) return distribution;

        approvedReviews.forEach(review => {
            const starLevel = Math.floor(review.rating);
            if (starLevel >= 1 && starLevel <= 5) {
                distribution[5 - starLevel].count++;
            }
        });

        distribution.forEach(level => {
            level.percentage = (level.count / approvedReviews.length) * 100;
        });

        return distribution;

    }, [approvedReviews]);

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newReview.rating > 0 && newReview.title && newReview.text && newReview.author) {
            onReviewSubmit({ ...newReview, productId: product.id, productName: product.name });
            setIsModalOpen(false);
            setNewReview({ rating: 0, title: '', text: '', author: '' });
        } else {
            alert('Por favor, preencha todos os campos e selecione uma nota.');
        }
    };

    const renderReviewModal = () => (
        <div className="fixed inset-0 bg-black/70 z-[101] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <div
                className="bg-dark-900 border-2 border-yellow-600/30 rounded-lg shadow-2xl p-6 w-full max-w-lg space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Escreva sua avaliação</h3>
                    <button onClick={() => setIsModalOpen(false)}><CloseIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Sua Nota</label>
                        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={ratingValue}
                                        onClick={() => setNewReview(prev => ({ ...prev, rating: ratingValue }))}
                                        onMouseEnter={() => setHoverRating(ratingValue)}
                                        className="focus:outline-none"
                                    >
                                        <StarIcon className={`w-8 h-8 cursor-pointer transition-colors ${ratingValue <= (hoverRating || newReview.rating) ? 'text-gold-400' : 'text-gray-600'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <input type="text" placeholder="Seu nome" value={newReview.author} onChange={e => setNewReview(p => ({ ...p, author: e.target.value }))} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" required />
                    <input type="text" placeholder="Título da sua avaliação" value={newReview.title} onChange={e => setNewReview(p => ({ ...p, title: e.target.value }))} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" required />
                    <textarea placeholder="Escreva sua avaliação aqui..." value={newReview.text} onChange={e => setNewReview(p => ({ ...p, text: e.target.value }))} rows={4} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" required />
                    <div className="text-right">
                        <button type="submit" className="text-sm font-bold bg-gold-500 text-black py-2 px-6 rounded-md hover:bg-gold-400">Enviar Avaliação</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div>
            {isModalOpen && renderReviewModal()}
            <h2 className="text-2xl font-bold font-display text-white">Avaliações de Clientes</h2>

            {approvedReviews.length > 0 ? (
                <>
                    <div className="my-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`h-6 w-6 ${i < Math.round(realAverageRating) ? 'text-gold-400' : 'text-gray-600'}`} />
                                ))}
                            </div>
                            <p className="ml-3 text-lg font-semibold text-white">{realAverageRating.toFixed(1)} de 5</p>
                        </div>
                        <p className="text-gray-400 text-sm sm:border-l sm:border-dark-700 sm:pl-4">
                            Baseado em {approvedReviews.length} {approvedReviews.length > 1 ? 'avaliações' : 'avaliação'}
                        </p>
                    </div>

                    <div className="mb-6 space-y-1">
                        {ratingDistribution.map(level => (
                            <div key={level.stars} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400 w-16 whitespace-nowrap">{level.stars} estrelas</span>
                                <div className="flex-grow bg-dark-700 rounded-full h-2">
                                    <div className="bg-gold-400 h-2 rounded-full" style={{ width: `${level.percentage}%` }}></div>
                                </div>
                                <span className="text-gray-400 w-8 text-right">{level.percentage.toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : null}

            <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                Deixe sua avaliação
            </button>

            <div className="mt-8 space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {approvedReviews.length > 0 ? (
                    approvedReviews.map(review => (
                        <div key={review.id} className="border-b border-dark-800 pb-6 last:border-b-0">
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center mr-3">
                                    <UserIcon className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{review.author}</p>
                                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-gold-400' : 'text-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-200">{review.title}</h4>
                            <p className="text-gray-300 mt-1 text-sm">{review.text}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Este produto ainda não tem avaliações.</p>
                        <p className="text-gray-500 text-sm">Seja o primeiro a avaliar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;