
// Fix: Implementing the FeaturedProducts component to display a grid of products.
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { products as initialProducts } from '../data/products';

interface FeaturedProductsProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onProductClick, products, wishlist, onToggleWishlist }) => {
  const sourceProducts = (products && products.length > 0) ? products : initialProducts;
  const featured = sourceProducts
    .filter(p => String(p.status) === 'Ativo' || String(p.status) === 'Publicado')
    .slice(0, 4);
  return (
    <section id="featured-products" className="py-16 sm:py-24 bg-[rgb(var(--color-brand-dark))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-[rgb(var(--color-brand-text-light))]">Produtos em Destaque</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[rgb(var(--color-brand-text-dim))]">
            Explore nossa seleção de produtos de alta qualidade dos melhores vendedores.
          </p>
        </div>
        <div className="featured-grid">
          {featured.map((product) => (
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

export default FeaturedProducts;
