import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { products as initialProducts } from '../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedProductsProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onProductClick, products, wishlist, onToggleWishlist }) => {
  const sourceProducts = (products && products.length > 0) ? products : initialProducts;
  const featured = sourceProducts
    .filter(p => String(p.status) === 'Ativo' || String(p.status) === 'Publicado');

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const [itemsVisible, setItemsVisible] = useState(4);

  useEffect(() => {
    const updateVisible = () => {
      // Roberto wants 4 columns. Let's make it 4 on most screens, maybe 2 on very small.
      if (window.innerWidth >= 1024) setItemsVisible(4);
      else if (window.innerWidth >= 768) setItemsVisible(3);
      else if (window.innerWidth >= 480) setItemsVisible(2);
      else setItemsVisible(1.2); // Partial peek for mobile
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const totalItems = featured.length;
  // Let the user scroll through all items. If 7 items, and 4 visible: maxIndex is 3.
  const maxIndex = totalItems - Math.floor(itemsVisible);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play logic
  useEffect(() => {
    if (totalItems <= itemsVisible) return;
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [maxIndex, itemsVisible, totalItems]);

  // Reset timer on manual interaction
  const resetTimer = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (totalItems > itemsVisible) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    }
  };

  const handleNext = () => {
    nextSlide();
    resetTimer();
  };

  const handlePrev = () => {
    prevSlide();
    resetTimer();
  };

  return (
    <section id="featured-products" className="py-12 sm:py-16 bg-[rgb(var(--color-brand-dark))] overflow-hidden border-b border-[rgb(var(--color-brand-gold))]/[.10]">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-[rgb(var(--color-brand-text-light))] uppercase tracking-widest">Destaques RS</h2>
          <div className="w-16 h-1 bg-[rgb(var(--color-brand-gold))] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Carousel Container - Removed max-w-6xl to use full container width */}
        <div className="relative group px-12">
          {/* Navigation Buttons - Adjusted positioning to stay inside the container width if needed, or outside for 'elite' look */}
          <button
            onClick={handlePrev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-[rgb(var(--color-brand-gray-light))]/[.40] hover:bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-[rgb(var(--color-brand-gray-light))]/[.40] hover:bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>

          {/* Items Wrapper */}
          <div className="overflow-hidden">
            <div
              className="flex -mx-4 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)` }}
            >
              {featured.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsVisible}%` }}
                >
                  <ProductCard
                    product={product}
                    onClick={() => onProductClick(product)}
                    wishlist={wishlist}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots (Optional but nice for UX) */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); resetTimer(); }}
              className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-[rgb(var(--color-brand-gold))]' : 'w-2 bg-[rgb(var(--color-brand-gray-light))]'}`}
              aria-label={`Ir para slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
