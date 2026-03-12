import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface OffersProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  backgroundColor?: string;
}

const Offers: React.FC<OffersProps> = ({
  onProductClick,
  products,
  wishlist,
  onToggleWishlist,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  backgroundColor
}) => {
  // First try: products with explicit discount (compareAtPrice > price)
  const discountedProducts = products
    .filter(p => p.status === 'Ativo' && p.compareAtPrice && p.compareAtPrice > p.price)
    .sort((a, b) => {
      if (!a.compareAtPrice || !b.compareAtPrice) return 0;
      const discountA = ((a.compareAtPrice - a.price) / a.compareAtPrice) * 100;
      const discountB = ((b.compareAtPrice - b.price) / b.compareAtPrice) * 100;
      return discountB - discountA;
    })
    .slice(0, 4);

  // Fallback: show first 4 active products when no discounts exist
  const offerProducts = discountedProducts.length > 0
    ? discountedProducts
    : products.filter(p => p.status === 'Ativo').slice(0, 4);

  const hasRealDiscounts = discountedProducts.length > 0;

  if (offerProducts.length === 0) {
    return null;
  }

  return (
    <section
      id="offers"
      className="py-16 sm:py-24"
      style={{ backgroundColor: backgroundColor || '#000000' }} // Preto absoluto como padrão
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold font-display"
            style={{ color: titleColor || 'white' }}
          >
            {title || (hasRealDiscounts ? 'Ofertas Especiais' : 'Seleção de Produtos')}
          </h2>
          <p
            className="mt-4 max-w-2xl mx-auto text-lg"
            style={{ color: subtitleColor || (titleColor ? `${titleColor}cc` : '#9CA3AF') }} // text-gray-400 is #9CA3AF
          >
            {subtitle || (hasRealDiscounts
              ? 'Aproveite nossos descontos exclusivos por tempo limitado.'
              : 'Confira nossa seleção de produtos premium.')}
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
