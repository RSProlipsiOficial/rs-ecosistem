import React, { useRef, useState, useEffect } from 'react';
import { Collection } from '../types';
import CollectionCard from './CollectionCard';

interface CollectionCarouselProps {
    collections: Collection[];
    onClick: (collection: Collection) => void;
    title?: string;
    showArrows?: boolean;
    autoPlay?: boolean;
}

const CollectionCarousel: React.FC<CollectionCarouselProps> = ({
    collections,
    onClick,
    title,
    showArrows = true,
    autoPlay = true
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    if (!collections || collections.length === 0) return null;

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320; // Card width + gap
        const newScrollLeft = direction === 'left'
            ? scrollRef.current.scrollLeft - scrollAmount
            : scrollRef.current.scrollLeft + scrollAmount;

        scrollRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        if (!autoPlay) return;
        const interval = setInterval(() => {
            if (isPaused || !scrollRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

            if (isAtEnd) {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                scroll('right');
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [isPaused, autoPlay]);

    return (
        <div
            className="relative py-8 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {title && (
                <div className="flex items-center justify-between mb-8 px-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                        {title}
                    </h2>
                    <div className="h-px bg-rs-gold/20 flex-1 mx-8 hidden sm:block" />
                </div>
            )}

            {showArrows && showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-rs-gold hover:text-black transition-all shadow-xl hover:scale-110"
                    aria-label="Anterior"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {showArrows && showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-rs-gold hover:text-black transition-all shadow-xl hover:scale-110"
                    aria-label="Próximo"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {collections.map((collection) => (
                    <div key={collection.id} className="flex-shrink-0 w-[280px]">
                        <CollectionCard
                            collection={collection}
                            onClick={() => onClick(collection)}
                        />
                    </div>
                ))}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default CollectionCarousel;
