import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface CarouselProps {
    banners: Banner[];
    className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ banners, className }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = useCallback(() => {
        if (banners.length === 0) return;
        const isLastSlide = currentIndex === banners.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, banners]);

    useEffect(() => {
        if (banners.length > 1) {
            const slideInterval = setInterval(goToNext, 5000);
            return () => clearInterval(slideInterval);
        }
    }, [banners, goToNext]);

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <section className={`relative w-full overflow-hidden bg-dark-900 group ${className || 'h-[300px] md:h-[400px]'}`}>
            <div
                className="w-full h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <a href={banner.link} key={banner.id} className="w-full h-full flex-shrink-0" aria-label={`Banner ${banner.id}`}>
                         <picture className="w-full h-full">
                            <source media="(min-width: 768px)" srcSet={banner.desktopImage} />
                            <img src={banner.mobileImage} alt={`Banner ${banner.id}`} className="w-full h-full object-cover" />
                        </picture>
                    </a>
                ))}
            </div>
            
            {banners.length > 1 && (
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
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    currentIndex === index ? 'bg-gold-500' : 'bg-gray-400/50 hover:bg-gray-200/80'
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