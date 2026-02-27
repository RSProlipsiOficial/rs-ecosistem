import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { Product, Order, View } from '../types';
import { products as initialProducts } from '../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BestsellersProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  orders: Order[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const Bestsellers: React.FC<BestsellersProps> = ({ onProductClick, products, orders, wishlist, onToggleWishlist }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(4);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1024) setItemsVisible(4);
      else if (window.innerWidth >= 768) setItemsVisible(3);
      else if (window.innerWidth >= 480) setItemsVisible(2);
      else setItemsVisible(1.2);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const sourceProducts = (products && products.length >= 4) ? products : initialProducts;
  const salesCount = new Map<string, number>();

  orders.forEach(order => {
    if (order.paymentStatus === 'Pago') {
      order.items.forEach(item => {
        salesCount.set(item.productId, (salesCount.get(item.productId) || 0) + item.quantity);
      });
    }
  });

  const sortedProductIds = Array.from(salesCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  let bestsellers = sortedProductIds
    .map(id => sourceProducts.find(p => p.id === id && p.status === 'Ativo'))
    .filter((p): p is Product => Boolean(p));

  if (bestsellers.length === 0) {
    bestsellers = [...sourceProducts]
      .filter(p => p.status === 'Ativo')
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }

  const totalItems = bestsellers.length;
  const maxIndex = Math.max(0, totalItems - Math.floor(itemsVisible));

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (totalItems <= itemsVisible) return;
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [maxIndex, itemsVisible, totalItems]);

  const resetTimer = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (totalItems > itemsVisible) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
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

  if (bestsellers.length === 0) return null;

  return (
    <section id="bestsellers" className="py-12 sm:py-16 bg-black overflow-hidden border-b border-[rgb(var(--color-brand-gold))]/[0.05]">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-white uppercase tracking-widest">Mais Vendidos</h2>
          <div className="w-16 h-1 bg-[rgb(var(--color-brand-gold))] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="relative group max-w-full mx-auto px-12">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/[.40] hover:bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:text-black rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/[.40] hover:bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:text-black rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>

          <div className="overflow-hidden">
            <div
              className="flex -mx-4 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)` }}
            >
              {bestsellers.map((product) => (
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
      </div>
    </section>
  );
};

export default Bestsellers;
