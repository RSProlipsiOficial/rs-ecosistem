
import React, { useState, useEffect, useCallback } from 'react';

interface DocumentCarouselProps {
    pages: string[];
}

const DocumentCarousel: React.FC<DocumentCarouselProps> = ({ pages }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === pages.length - 1 ? 0 : prevIndex + 1));
    }, [pages.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? pages.length - 1 : prevIndex - 1));
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 7000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    if (!pages || pages.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto aspect-[8.5/11] bg-surface border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <p className="text-text-secondary">No document pages available.</p>
            </div>
        );
    }
    
    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl border-2 border-accent/30 group">
            <div className="relative w-full aspect-[8.5/11] overflow-hidden">
                <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {pages.map((pageUrl, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0">
                            <img src={pageUrl} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={prevSlide} aria-label="Previous page" className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-text-primary p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-button-text transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} aria-label="Next page" className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-text-primary p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-button-text transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-text-primary bg-black/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {pages.length}
            </div>
        </div>
    );
};

export default DocumentCarousel;
