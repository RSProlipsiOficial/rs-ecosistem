import React from 'react';

interface ReviewImageGalleryProps {
    images: string[];
}

const ReviewImageGallery: React.FC<ReviewImageGalleryProps> = ({ images }) => {
    if (!images || images.length === 0) return null;

    return (
        <div className="py-8 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Avaliações com imagens</h3>
                <button
                    onClick={() => {
                        const reviewsSection = document.getElementById('reviews-section');
                        if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[rgb(var(--color-brand-gold))] text-sm font-bold hover:underline"
                >
                    Ver todas as fotos ❯
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img, i) => (
                    <div key={i} className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border-2 border-transparent hover:border-[rgb(var(--color-brand-gold))] transition-all cursor-pointer shadow-lg group">
                        <img
                            src={img}
                            alt={`Avaliação ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewImageGallery;
