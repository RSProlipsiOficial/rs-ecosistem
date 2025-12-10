import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CloseIcon, TrashIcon } from './Icons';

const CartModal: React.FC = () => {
    const { 
        isCartOpen, 
        toggleCart,
        openCheckout,
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        subtotal,
        totalShipping,
        totalPrice,
        applyCoupon,
        discount,
        couponCode,
        couponError
    } = useCart();
    const [couponInput, setCouponInput] = useState('');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    const handleApplyCoupon = () => {
        applyCoupon(couponInput);
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] animate-fade-in" onClick={toggleCart}>
            <div 
                className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-accent">Seu Carrinho</h2>
                    <button onClick={toggleCart} className="text-text-secondary hover:text-text-primary"><CloseIcon/></button>
                </header>

                {cartItems.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                        <p className="text-text-secondary">Seu carrinho está vazio.</p>
                        <button onClick={toggleCart} className="mt-4 bg-accent text-button-text font-bold py-2 px-6 rounded-full">
                            Continuar Comprando
                        </button>
                    </div>
                ) : (
                    <>
                        <main className="flex-grow p-4 overflow-y-auto space-y-4">
                            {cartItems.map(item => (
                                <div key={`${item.product.id}-${item.variant.id}`} className="flex items-start space-x-4 border-b border-border pb-4">
                                    <img src={item.product.imageUrls[0]} alt={item.product.translations.pt.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-surface" />
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-text-primary">{item.product.translations.pt.name}</h3>
                                        <p className="text-sm text-text-secondary">{item.variant.name}</p>
                                        <p className="text-sm font-bold text-accent mt-1">{formatCurrency(item.variant.price)}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product.id, item.variant.id, parseInt(e.target.value))}
                                            min="1"
                                            className="w-16 bg-surface border border-border rounded-md p-1 text-center"
                                        />
                                        <button onClick={() => removeFromCart(item.product.id, item.variant.id)} className="text-xs text-red-500 hover:underline">
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </main>
                        
                        <footer className="p-4 border-t border-border flex-shrink-0 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="coupon" className="text-sm font-medium text-text-secondary">Cupom de Desconto</label>
                                <div className="flex space-x-2">
                                    <input 
                                        id="coupon"
                                        type="text" 
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Ex: PROMO10"
                                        className="flex-grow bg-surface border border-border rounded-md p-2 text-sm"
                                    />
                                    <button onClick={handleApplyCoupon} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm">Aplicar</button>
                                </div>
                                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                                {couponCode && <p className="text-xs text-green-400">Cupom "{couponCode}" aplicado!</p>}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between text-text-secondary"><span>Frete</span><span>{formatCurrency(totalShipping)}</span></div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Desconto ({couponCode})</span>
                                        <span>- {formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-text-primary"><span>Total</span><span>{formatCurrency(totalPrice)}</span></div>
                            </div>
                             <div className="flex justify-between items-center">
                                <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Limpar Carrinho</button>
                                <button onClick={openCheckout} className="bg-accent text-button-text font-bold py-3 px-6 rounded-full hover:opacity-80">Finalizar Compra</button>
                            </div>
                        </footer>
                    </>
                )}
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default CartModal;