
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
  const primaryImage = product.images?.[0] || product.featured_image || 'https://placehold.co/400x400?text=Produto';
  const currency = /^[A-Z]{3}$/.test(String(product.currency || '').toUpperCase())
    ? String(product.currency).toUpperCase()
    : 'BRL';
  const inventoryMessage = String(product.inventoryStatusMessage || '').trim();
  const isUnavailableInCurrentCd = Number(product.inventory || 0) <= 0 && product.inventorySource === 'cd';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleWishlist(product.id);
  };

  const handleCardClick = () => {
    if (isUnavailableInCurrentCd) return;
    onClick();
  };

  return (
    <div
      className={`w-full max-w-[280px] h-full min-h-[390px] mx-auto flex flex-col bg-[rgb(var(--color-brand-gray))]/[.50] backdrop-blur-sm border border-[rgb(var(--color-brand-gold))]/[.20] rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 group ${
        isUnavailableInCurrentCd
          ? 'cursor-not-allowed opacity-80'
          : 'cursor-pointer hover:shadow-[rgb(var(--color-brand-gold))]/[.10]'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-disabled={isUnavailableInCurrentCd}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick()}
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
      <div className="p-4 flex flex-1 flex-col">
        <p className="min-h-[20px] text-sm text-[rgb(var(--color-brand-text-dim))]">{product.seller || ' '}</p>
        <h3 className="mt-1 min-h-[56px] text-lg font-bold text-[rgb(var(--color-brand-text-light))] line-clamp-2 group-hover:text-[rgb(var(--color-brand-gold))] transition-colors">{product.name}</h3>

        <div className="mt-2 min-h-[28px] flex items-center">
          {product.reviewCount > 0 && (
            <>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-[rgb(var(--color-brand-gold))]' : 'text-[rgb(var(--color-brand-gray-light))]'}`} />
                ))}
              </div>
              <span className="text-[rgb(var(--color-brand-text-dim))] text-sm ml-2">({product.reviewCount})</span>
            </>
          )}
        </div>

        {inventoryMessage && (
          <p className={`mt-3 min-h-[32px] text-xs font-semibold leading-snug ${isUnavailableInCurrentCd ? 'text-red-400' : 'text-yellow-400'}`}>
            {inventoryMessage}
          </p>
        )}

        <div className="mt-auto pt-4 flex justify-between items-center gap-3">
          <p className="text-xl font-semibold text-[rgb(var(--color-brand-gold))]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(product.price)}
          </p>
          <button
            type="button"
            disabled={isUnavailableInCurrentCd}
            className={`shrink-0 border text-sm font-bold py-1 px-3 rounded-full transition-colors ${
            isUnavailableInCurrentCd
              ? 'border-red-500/50 text-red-300 hover:bg-red-500/10'
              : 'bg-transparent border-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-brand-dark))]'
          }`}
          >
            {isUnavailableInCurrentCd ? 'Indisponivel' : 'Ver Mais'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
