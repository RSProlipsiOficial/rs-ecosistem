import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface ContentCarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    title?: string;
    showArrows?: boolean;
    autoPlay?: boolean;
    rows?: 1 | 2;
    itemWidth?: string;
    keyExtractor?: (item: T, index: number) => string;
}

function ContentCarousel<T>({
    items,
    renderItem,
    title,
    showArrows = true,
    autoPlay = false,
    rows = 1,
    itemWidth = 'w-[280px]',
    keyExtractor = (item: any, idx) => item?.id || String(idx),
}: ContentCarouselProps<T>) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    if (!items || items.length === 0) return null;

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 300; // rough width + gap
        const newScrollLeft = direction === 'left'
            ? scrollRef.current.scrollLeft - scrollAmount
            : scrollRef.current.scrollLeft + scrollAmount;

        scrollRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        setTimeout(handleScroll, 100);
    }, [items]);

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

    const containerClasses = rows === 1
        ? "flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide py-2 px-1 items-stretch"
        : "grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto scroll-smooth scrollbar-hide py-2 px-1 items-stretch";

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {title}
                    </h2>
                </div>
            )}

            {showArrows && showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl hover:scale-110"
                    aria-label="Anterior"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {showArrows && showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-[#D4AF37] hover:text-black transition-all shadow-xl hover:scale-110"
                    aria-label="Próximo"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={containerClasses}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    ...(rows > 1 ? { gridAutoColumns: 'max-content' } : {})
                }}
            >
                {items.map((item, idx) => (
                    <div key={keyExtractor(item, idx)} className={`${itemWidth} flex flex-col h-full`}>
                        {renderItem(item, idx)}
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
}

export default ContentCarousel;
