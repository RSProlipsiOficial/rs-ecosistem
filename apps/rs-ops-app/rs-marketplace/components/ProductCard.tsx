
// Fix: Implementing the ProductCard component.
import React from 'react';
import { Product } from '../types';
import { StarIcon } from './icons/StarIcon';
import { HeartIcon } from './icons/HeartIcon';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, wishlist, onToggleWishlist }) => {
  const isInWishlist = wishlist.includes(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      onToggleWishlist(product.id);
  };
  
  return (
    <div 
      className="bg-[rgb(var(--color-brand-gray))]/[.50] backdrop-blur-sm border border-[rgb(var(--color-brand-gold))]/[.20] rounded-lg overflow-hidden shadow-lg hover:shadow-[rgb(var(--color-brand-gold))]/[.10] transition-shadow duration-300 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
         <button 
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 z-10 p-2 bg-[rgb(var(--color-brand-dark))]/[.40] rounded-full text-[rgb(var(--color-brand-text-light))] hover:text-[rgb(var(--color-brand-gold))] transition-colors"
            aria-label="Adicionar à lista de desejos"
        >
            <HeartIcon className={`w-6 h-6 transition-all ${isInWishlist ? 'text-[rgb(var(--color-brand-gold))] fill-current' : ''}`} />
        </button>
        <div className="absolute top-0 left-0 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] px-3 py-1 text-sm font-bold rounded-br-lg">
          {product.type}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{product.seller}</p>
        <h3 className="text-lg font-bold text-[rgb(var(--color-brand-text-light))] mt-1 truncate group-hover:text-[rgb(var(--color-brand-gold))] transition-colors">{product.name}</h3>
        
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-gray-light))]'}`} />
            ))}
          </div>
          <span className="text-[rgb(var(--color-brand-text-dim))] text-sm ml-2">({product.reviewCount})</span>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xl font-semibold text-[rgb(var(--color-brand-gold))]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency }).format(product.price)}
          </p>
          <button className="bg-transparent border border-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] text-sm font-bold py-1 px-3 rounded-full hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))] transition-colors">
            Ver Mais
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;