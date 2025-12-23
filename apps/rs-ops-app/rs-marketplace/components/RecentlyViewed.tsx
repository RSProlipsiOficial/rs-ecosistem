
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface RecentlyViewedProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick, products, wishlist, onToggleWishlist }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="recently-viewed" className="py-16 sm:py-24 bg-[rgb(var(--color-brand-dark))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-[rgb(var(--color-brand-text-light))]">Vistos Recentemente</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[rgb(var(--color-brand-text-dim))]">
            Revisite os produtos que chamaram sua atenção.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product)}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
