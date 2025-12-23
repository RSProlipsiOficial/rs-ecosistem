
import React from 'react';
import { CartItem } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface FloatingCartStatusProps {
    cartItems: CartItem[];
    onViewCart: () => void;
}

const FloatingCartStatus: React.FC<FloatingCartStatusProps> = ({ cartItems, onViewCart }) => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center animate-slide-up">
            <div className="container mx-auto px-4 pb-4">
                 <div className="bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gold))]/[0.30] rounded-lg shadow-lg flex items-center justify-between p-4">
                    <div>
                        <p className="font-bold text-[rgb(var(--color-brand-text-light))]">{totalItems} {totalItems > 1 ? 'Itens' : 'Item'} no Carrinho</p>
                        <p className="text-[rgb(var(--color-brand-gold))] font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</p>
                    </div>
                    <button 
                        onClick={onViewCart}
                        className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-2 px-6 rounded-full flex items-center gap-2 hover:bg-gold-400 transition-colors"
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                        Ver Pedido
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default FloatingCartStatus;