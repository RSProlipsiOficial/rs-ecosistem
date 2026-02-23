import React, { useState, useEffect, useRef } from 'react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
    className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName, className = '' }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomActive, setZoomActive] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLDivElement>(null);

    // Carrossel automático (5 segundos, pausa no hover)
    useEffect(() => {
        const timer = setInterval(() => {
            if (!zoomActive && images.length > 1) {
                setCurrentImageIndex((prev) => (prev + 1) % images.length);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length, zoomActive]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgRef.current) return;
        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (!images || images.length === 0) {
        return (
            <div className={`${className} flex items-center justify-center bg-zinc-900 rounded-2xl border border-white/10 aspect-square`}>
                <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-zinc-500 text-sm font-bold">Sem imagem disponível</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className} flex flex-col gap-4`}>
            {/* Imagem Principal com Zoom (AGORA EM CIMA: order-1) */}
            <div
                ref={imgRef}
                className="order-1 relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-rs-border cursor-zoom-in group"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={handleMouseMove}
            >
                {/* Skeleton Loading */}
                {isLoading && (
                    <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-rs-gold/20 border-t-rs-gold rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Imagens */}
                {images.map((img, index) => (
                    <img
                        key={img}
                        src={img}
                        alt={`${productName} - imagem ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        style={
                            index === currentImageIndex && zoomActive
                                ? {
                                    transform: 'scale(2)',
                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                    zIndex: 20,
                                }
                                : {}
                        }
                        onLoad={() => index === 0 && setIsLoading(false)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                    />
                ))}

                {/* Overlay de Instrução de Zoom */}
                <div
                    className={`absolute bottom-4 right-4 bg-black/50 backdrop-blur-lg px-3 py-1.5 rounded-xl text-[9px] font-bold text-white/80 flex items-center gap-2 pointer-events-none z-30 transition-opacity duration-300 ${zoomActive ? 'opacity-0' : 'opacity-100'
                        }`}
                >
                    <span className="text-rs-gold text-sm">🔍</span> ZOOM
                </div>

                {/* Indicadores (Dots para mobile/desk) */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                    ? 'bg-rs-gold w-6'
                                    : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                aria-label={`Ver imagem ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Miniaturas (Horizontal Scroll EM BAIXO: order-2) */}
            <div className="order-2 flex gap-3 overflow-x-auto scrollbar-hide shrink-0 pb-2 w-full">
                {images.map((img, index) => (
                    <button
                        key={index}
                        onMouseEnter={() => setCurrentImageIndex(index)}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${index === currentImageIndex
                            ? 'border-rs-gold ring-2 ring-rs-gold/30 scale-105'
                            : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                            }`}
                    >
                        <img
                            src={img}
                            className="w-full h-full object-cover"
                            alt={`thumb-${index}`}
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>


            <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div >
    );
};

export default ProductGallery;
