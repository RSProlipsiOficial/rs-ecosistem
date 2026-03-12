import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface CarouselProps {
    banners: Banner[];
    className?: string;
    height?: number;
    mobileHeight?: number;
    fullWidth?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ banners, className, height = 400, mobileHeight = 300, fullWidth = true }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const validBanners = Array.isArray(banners)
        ? banners.filter((banner) => Boolean(banner?.desktopImage || banner?.mobileImage))
        : [];

    const goToPrevious = () => {
        if (validBanners.length === 0) return;
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? validBanners.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = useCallback(() => {
        if (validBanners.length === 0) return;
        const isLastSlide = currentIndex === validBanners.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, validBanners.length]);

    useEffect(() => {
        if (currentIndex >= validBanners.length && validBanners.length > 0) {
            setCurrentIndex(0);
        }
    }, [currentIndex, validBanners.length]);

    useEffect(() => {
        if (validBanners.length > 1) {
            const slideInterval = setInterval(goToNext, 5000);
            return () => clearInterval(slideInterval);
        }
    }, [validBanners.length, goToNext]);

    if (validBanners.length === 0) {
        return <div className="h-4 bg-dark-900"></div>; // Placeholder em vez de crash
    }

    return (
        <section
            className={`relative w-full overflow-hidden bg-dark-900 group ${fullWidth ? '' : 'container mx-auto px-4 rounded-xl'} ${className || ''}`}
            style={{
                height: typeof window !== 'undefined' && window.innerWidth < 768 ? mobileHeight : height
            }}
        >
            <div
                className="w-full h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {validBanners.map((banner, index) => {
                    const desktopImage = banner.desktopImage || banner.mobileImage;
                    const mobileImage = banner.mobileImage || banner.desktopImage;
                    const shouldPrioritize = index === 0;

                    return (
                        <a href={banner.link || '#'} key={banner.id} className="w-full h-full flex-shrink-0" aria-label={`Banner ${banner.id}`}>
                            <picture className="w-full h-full">
                                {desktopImage ? <source media="(min-width: 768px)" srcSet={desktopImage} /> : null}
                                <img
                                    src={mobileImage}
                                    alt={`Banner ${banner.id}`}
                                    loading={shouldPrioritize ? 'eager' : 'lazy'}
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x400?text=Imagem+Indispon%C3%ADvel';
                                    }}
                                />
                            </picture>
                        </a>
                    );
                })}
            </div>

            {validBanners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-4 -translate-y-1/2 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100"
                        aria-label="Slide anterior"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100"
                        aria-label="Próximo slide"
                    >
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                        {validBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-gold-500' : 'bg-gray-400/50 hover:bg-gray-200/80'
                                    }`}
                                aria-label={`Ir para o slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default Carousel;
