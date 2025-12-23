import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { products as initialProducts } from '../data/products';

interface OffersProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const Offers: React.FC<OffersProps> = ({ onProductClick, products, wishlist, onToggleWishlist }) => {
  const sourceProducts = (products && products.length >= 4) ? products : initialProducts;
  const offerProducts = sourceProducts
    .filter(p => p.status === 'Ativo' && p.compareAtPrice && p.compareAtPrice > p.price)
    .sort((a, b) => {
      if (!a.compareAtPrice || !b.compareAtPrice) return 0;
      const discountA = ((a.compareAtPrice - a.price) / a.compareAtPrice) * 100;
      const discountB = ((b.compareAtPrice - b.price) / b.compareAtPrice) * 100;
      return discountB - discountA;
    })
    .slice(0, 4);

  if (offerProducts.length === 0) {
    return null;
  }

  return (
    <section id="offers" className="py-16 sm:py-24 bg-dark-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Ofertas Especiais</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Aproveite nossos descontos exclusivos por tempo limitado.
          </p>
        </div>
        <div className="featured-grid">
          {offerProducts.map((product) => (
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

export default Offers;
