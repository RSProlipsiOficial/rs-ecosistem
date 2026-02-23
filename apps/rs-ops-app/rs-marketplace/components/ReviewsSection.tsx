import React, { useState, useMemo } from 'react';
import { Review } from '../types';
import { StarIcon } from './icons/StarIcon';
import ProductReviews from './ProductReviews';
import { CloseIcon } from './icons/CloseIcon';

interface ReviewsSectionProps {
    productId: string;
    productName: string;
    reviews: Review[];
    onReviewSubmit: (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
    productId,
    productName,
    reviews,
    onReviewSubmit,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 0, title: '', text: '', author: '' });
    const [hoverRating, setHoverRating] = useState(0);

    // FILTRAR APENAS REVIEWS DESTE PRODUTO
    const productReviews = useMemo(() => {
        return reviews.filter((r) => r.productId === productId);
    }, [reviews, productId]);

    const hasReviews = productReviews.length > 0;

    // Calcular rating médio e distribuição
    const stats = useMemo(() => {
        if (!hasReviews) return { avgRating: 0, distribution: [0, 0, 0, 0, 0] };

        const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = total / productReviews.length;

        const distribution = [0, 0, 0, 0, 0];
        productReviews.forEach((r) => {
            distribution[r.rating - 1]++;
        });

        return { avgRating, distribution };
    }, [productReviews, hasReviews]);

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImages(Array.from(e.target.files));
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedVideo(e.target.files[0]);
        }
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newReview.rating > 0 && newReview.title && newReview.text && newReview.author) {
            // Simulating upload by creating object URLs
            const imageUrls = selectedImages.map(file => URL.createObjectURL(file));
            const videoUrl = selectedVideo ? URL.createObjectURL(selectedVideo) : undefined;

            onReviewSubmit({
                ...newReview,
                productId,
                productName,
                images: imageUrls,
                video: videoUrl
            });
            setIsModalOpen(false);
            setNewReview({ rating: 0, title: '', text: '', author: '' });
            setSelectedImages([]);
            setSelectedVideo(null);
        } else {
            alert('Por favor, preencha todos os campos e selecione uma nota.');
        }
    };

    const renderReviewModal = () => (
        <div className="fixed inset-0 bg-black/80 z-[200] flex justify-center items-start overflow-y-auto p-4 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div
                className="bg-rs-dark border border-rs-gold/30 rounded-2xl shadow-2xl w-full max-w-lg relative flex flex-col my-8"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 relative">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>

                    <h3 className="text-2xl font-black font-display text-white text-center uppercase tracking-wider">
                        Avaliar Produto
                    </h3>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-6">
                    <form id="review-form" onSubmit={handleReviewSubmit} className="space-y-5">
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sua Nota</label>
                            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <button
                                            type="button"
                                            key={ratingValue}
                                            onClick={() => setNewReview(prev => ({ ...prev, rating: ratingValue }))}
                                            onMouseEnter={() => setHoverRating(ratingValue)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <StarIcon className={`w-10 h-10 cursor-pointer transition-colors ${ratingValue <= (hoverRating || newReview.rating) ? 'text-rs-gold fill-rs-gold' : 'text-zinc-700'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Seu nome"
                                value={newReview.author}
                                onChange={e => setNewReview(p => ({ ...p, author: e.target.value }))}
                                className="w-full bg-zinc-900/50 border border-rs-border rounded-xl py-3 px-4 text-white focus:border-rs-gold focus:ring-1 focus:ring-rs-gold outline-none transition-all placeholder:text-zinc-600"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Título da avaliação"
                                value={newReview.title}
                                onChange={e => setNewReview(p => ({ ...p, title: e.target.value }))}
                                className="w-full bg-zinc-900/50 border border-rs-border rounded-xl py-3 px-4 text-white focus:border-rs-gold focus:ring-1 focus:ring-rs-gold outline-none transition-all placeholder:text-zinc-600"
                                required
                            />
                            <textarea
                                placeholder="Conte sua experiência com o produto..."
                                value={newReview.text}
                                onChange={e => setNewReview(p => ({ ...p, text: e.target.value }))}
                                rows={4}
                                className="w-full bg-zinc-900/50 border border-rs-border rounded-xl py-3 px-4 text-white focus:border-rs-gold focus:ring-1 focus:ring-rs-gold outline-none transition-all placeholder:text-zinc-600 resize-none"
                                required
                            />
                        </div>

                        {/* Upload de Mídia */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block">Adicionar Fotos e Vídeo</label>

                            {/* Botões de Upload */}
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-rs-gold hover:bg-rs-gold/5 transition-all group">
                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📷</span>
                                    <span className="text-xs text-zinc-500 font-bold uppercase">Fotos</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-rs-gold hover:bg-rs-gold/5 transition-all group">
                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎥</span>
                                    <span className="text-xs text-zinc-500 font-bold uppercase">Vídeo (30s)</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Previews */}
                            {(selectedImages.length > 0 || selectedVideo) && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {selectedImages.map((file, idx) => (
                                        <div key={idx} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-700 relative group">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <CloseIcon className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedVideo && (
                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center relative group">
                                            <span className="text-xl">▶️</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedVideo(null)}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <CloseIcon className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 pb-2">
                            <button
                                type="submit"
                                className="w-full bg-rs-gold hover:bg-rs-gold-vivid text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(200,167,78,0.2)] hover:shadow-[0_0_30px_rgba(200,167,78,0.4)] transition-all transform active:scale-[0.98]"
                            >
                                Publicar Avaliação
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );

    // Empty State (quando não há reviews)
    if (!hasReviews) {
        return (
            <>
                {isModalOpen && renderReviewModal()}
                <div className="bg-zinc-950 p-12 rounded-3xl border border-white/5 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-full flex items-center justify-center animate-pulse">
                            <StarIcon className="w-10 h-10 text-zinc-700" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white mb-2">
                                Este produto ainda não tem avaliações
                            </h3>
                            <p className="text-zinc-500 text-sm">
                                Seja o primeiro a compartilhar sua experiência com <strong>{productName}</strong>
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-rs-gold text-black font-black uppercase tracking-wider rounded-xl hover:brightness-110 hover:scale-105 transition-all shadow-lg shadow-rs-gold/20"
                        >
                            <StarIcon className="w-5 h-5 fill-black" />
                            Escrever primeira avaliação
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // Com Reviews
    return (
        <div className="space-y-8">
            {isModalOpen && renderReviewModal()}

            {/* Resumo de Avaliações */}
            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Lado Esquerdo: Rating médio */}
                    <div className="text-center md:text-left">
                        <div className="inline-flex flex-col items-center md:items-start">
                            <div className="text-6xl font-black text-gradient-gold mb-2">
                                {stats.avgRating.toFixed(1)}
                            </div>
                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-6 h-6 ${i < Math.round(stats.avgRating)
                                            ? 'text-rs-gold fill-current'
                                            : 'text-zinc-700'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-zinc-500 text-sm font-bold">
                                Baseado em {productReviews.length}{' '}
                                {productReviews.length === 1 ? 'avaliação' : 'avaliações'}
                            </p>
                        </div>
                    </div>

                    {/* Lado Direito: Distribuição */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.distribution[star - 1];
                            const percentage =
                                productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-zinc-500 w-8">
                                        {star} ★
                                    </span>
                                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-rs-gold rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-600 w-8 text-right">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Lista de Reviews (usando ProductReviews apenas para listar, mas passando controle do modal talvez? Não, ProductReviews tem seu botao interno. Vamos esconder o botao do ProductReviews se possível ou apenas usar ProductReviews para listar) 
                
                Melhor: Como eu já implementei o modal AQUI, eu não preciso do botão "Deixe sua avaliação" do ProductReviews. 
                Vou renderizar o botão AQUI em cima ou embaixo e usar o ProductReviews só pra LISTAR?
                O ProductReviews original tem um botão embutido. 
                Vou simplesmente NÃO usar ProductReviews e renderizar a lista aqui mesmo para ter controle total do layout.
            */}

            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] font-display text-white">
                        O que os clientes dizem
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs font-bold bg-rs-dark border border-rs-border hover:border-rs-gold text-white py-2 px-4 rounded-lg transition-all uppercase tracking-wider"
                    >
                        Avaliar Produto
                    </button>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rs-gray scrollbar-track-transparent">
                    {productReviews.length > 0 ? (
                        productReviews.map(review => (
                            <div key={review.id} className="border-b border-white/5 pb-6 last:border-b-0 animate-fade-in">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rs-gray to-zinc-900 border border-rs-border flex items-center justify-center mr-3 shadow-lg">
                                        <span className="font-bold text-zinc-500 text-sm">
                                            {review.author.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{review.author}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex ml-auto gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-rs-gold fill-current' : 'text-zinc-800'}`} />
                                        ))}
                                    </div>
                                </div>
                                <h4 className="font-bold text-zinc-200 mb-1">{review.title}</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">{review.text}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Este produto ainda não tem avaliações.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .text-gradient-gold {
          background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
        </div>
    );
};

export default ReviewsSection;


