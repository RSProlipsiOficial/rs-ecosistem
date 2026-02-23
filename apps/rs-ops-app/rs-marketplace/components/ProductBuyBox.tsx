import React from 'react';
import { Product, ProductVariant } from '../types';
import { StarIcon } from './icons/StarIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface ProductBuyBoxProps {
    product: Product;
    selectedVariant: ProductVariant | null;
    selectedOptions: { [key: string]: string };
    onOptionChange: (optionName: string, value: string) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    onAddToCart: () => void;
    onBuyNow?: () => void;
    onToggleWishlist: () => void;
    isInWishlist: boolean;
}

const ProductBuyBox: React.FC<ProductBuyBoxProps> = ({
    product,
    selectedVariant,
    selectedOptions,
    onOptionChange,
    quantity,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
    onToggleWishlist,
    isInWishlist,
}) => {
    const isOutOfStock = selectedVariant
        ? selectedVariant.inventory <= 0
        : product.inventory <= 0;

    const currentPrice = selectedVariant?.price ?? product.price;
    const compareAtPrice = product.compareAtPrice;

    return (
        <div className="lg:sticky lg:top-6 space-y-6">
            {/* Header do Produto */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-black text-rs-gold uppercase tracking-[0.4em] bg-rs-gold/10 px-3 py-1.5 rounded-full border border-rs-gold/20">
                        {product.brand || product.seller}
                    </span>
                    {product.status === 'Novo' && (
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            Lançamento
                        </span>
                    )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-white font-display">
                    {product.name}
                </h1>

                {/* Rating - Only show if > 0 */}
                {product.reviewCount > 0 && (
                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="flex text-rs-gold">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'opacity-20'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-rs-gold font-bold text-sm">
                                {product.rating.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-l border-white/10 pl-6">
                            {product.reviewCount} Clientes Satisfeitos
                        </span>
                    </div>
                )}
            </div>

            {/* Bloco de Preço */}
            <div className="py-8 border-y border-white/5 space-y-4">
                <div className="flex items-baseline gap-4">
                    <span className="text-5xl md:text-6xl font-black text-gradient-gold tracking-tighter">
                        R$ {Math.floor(currentPrice)},{(currentPrice % 1).toFixed(2).split('.')[1]}
                    </span>
                    {compareAtPrice && compareAtPrice > currentPrice && (
                        <span className="text-zinc-600 line-through text-xl font-bold opacity-50">
                            R$ {compareAtPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    )}
                </div>

                <p className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                    Em até 12x de R$ {(currentPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
                </p>

                {/* Badges de Status */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2.5 bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.1em]">
                            ESTOQUE DISPONÍVEL
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-rs-gold/5 px-4 py-2 rounded-2xl border border-rs-gold/10">
                        <span className="text-sm">⚡</span>
                        <span className="text-[10px] text-rs-gold font-black uppercase tracking-[0.1em]">
                            ENVIO EXPRESSO HOJE
                        </span>
                    </div>
                </div>
            </div>

            {/* Variantes */}
            {product.options && product.options.length > 0 && (
                <div className="space-y-6">
                    {product.options.map((option) => (
                        <div key={option.name} className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    {option.name}
                                </label>
                                <span className="text-xs font-bold text-white bg-white/5 px-3 py-1 rounded-lg">
                                    {selectedOptions[option.name]}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {option.values.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => onOptionChange(option.name, val)}
                                        className={`min-w-[70px] px-5 py-3.5 rounded-2xl border-2 text-[11px] font-black transition-all duration-300 ${selectedOptions[option.name] === val
                                            ? 'border-rs-gold bg-rs-gold text-black shadow-[0_0_25px_rgba(212,175,55,0.4)]'
                                            : 'border-white/5 text-zinc-400 hover:border-white/20 bg-zinc-900/50 hover:bg-zinc-900'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quantidade + CTA + Wishlist */}
            <div className="space-y-3 pt-4">
                {/* Linha 1: Quantidade e Wishlist (Lado a Lado) */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Seletor de Quantidade */}
                    <div className="flex items-center bg-zinc-900/80 border border-rs-border rounded-xl px-2 h-[44px] justify-between select-none shadow-sm backdrop-blur-md">
                        <button
                            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                            className="text-lg text-zinc-500 hover:text-white transition-colors p-2 w-8 h-8 flex items-center justify-center"
                            aria-label="Diminuir quantidade"
                        >
                            -
                        </button>
                        <span className="font-black text-sm text-white">{quantity}</span>
                        <button
                            onClick={() => onQuantityChange(quantity + 1)}
                            className="text-lg text-zinc-500 hover:text-white transition-colors p-2 w-8 h-8 flex items-center justify-center"
                            aria-label="Aumentar quantidade"
                        >
                            +
                        </button>
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={onToggleWishlist}
                        className={`h-[44px] rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 font-bold uppercase tracking-widest text-[9px] ${isInWishlist
                            ? 'border-red-500/30 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                            : 'border-white/5 text-zinc-500 hover:border-white/20 bg-zinc-900/30 hover:bg-zinc-900'
                            }`}
                    >
                        <HeartIcon className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                        {isInWishlist ? 'Remover' : 'Lista de Desejos'}
                    </button>
                </div>

                {/* Linha 2: Botão Adicionar ao Carrinho (Full Width) */}
                <button
                    onClick={onAddToCart}
                    disabled={isOutOfStock}
                    className="w-full h-[60px] bg-rs-gold-gradient hover:brightness-110 text-black font-black uppercase tracking-[0.15em] text-sm rounded-xl transition-all hover:scale-[1.01] shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {isOutOfStock ? (
                        '⚠️ ESGOTADO'
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                            </svg>
                            ADICIONAR AO CARRINHO
                        </>
                    )}
                </button>
            </div>

            {/* Selos de Confiança Premium */}
            <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-rs-dark/50 border border-rs-border/50">
                    <div className="p-2 bg-rs-gold/10 rounded-lg shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-rs-gold" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-wider">
                            Compra Segura
                        </p>
                        <p className="text-[9px] text-zinc-500 font-medium">
                            Proteção SSL Total
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-rs-dark/50 border border-rs-border/50">
                    <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-500">
                            <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                            <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                            <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-wider">
                            Entrega Garantida
                        </p>
                        <p className="text-[9px] text-zinc-500 font-medium">
                            Rastreio em Tempo Real
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        .text-gradient-gold {
          background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .bg-rs-gold-gradient {
          background: linear-gradient(135deg, #d4af37 0%, #8a7020 100%);
        }
      `}</style>
        </div>
    );
};

export default ProductBuyBox;
