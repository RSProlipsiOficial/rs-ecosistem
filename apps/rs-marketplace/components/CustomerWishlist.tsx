import React from 'react';
import { Product, View } from '../types';
import ProductCard from './ProductCard';
import { HeartIcon } from './icons/HeartIcon';

interface CustomerWishlistProps {
    wishlist: string[];
    products: Product[];
    onNavigate: (view: View, data?: any) => void;
    onToggleWishlist: (productId: string) => void;
}

const CustomerWishlist: React.FC<CustomerWishlistProps> = ({ wishlist, products, onNavigate, onToggleWishlist }) => {
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-8">Minha Lista de Desejos</h1>
            
            {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlistProducts.map(product => (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            onClick={() => onNavigate('productDetail', product)}
                            wishlist={wishlist}
                            onToggleWishlist={onToggleWishlist}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-dark-900/50 rounded-lg">
                    <HeartIcon className="w-16 h-16 mx-auto text-gray-600" />
                    <h2 className="mt-4 text-2xl font-bold text-white">Sua lista de desejos está vazia.</h2>
                    <p className="mt-2 text-gray-400">Adicione seus produtos favoritos clicando no coração.</p>
                    <button onClick={() => onNavigate('home')} className="mt-6 bg-gold-500 text-black font-bold py-2 px-6 rounded-full hover:bg-gold-400">
                        Explorar Produtos
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerWishlist;
