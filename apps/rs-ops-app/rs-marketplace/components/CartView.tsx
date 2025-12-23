
import React, { useMemo } from 'react';
import { CartItem, View } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CartViewProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
    onRemoveItem: (cartItemId: string) => void;
    onNavigate: (view: View) => void;
}

const CartView: React.FC<CartViewProps> = ({ 
    isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onNavigate
}) => {
    const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    
    const handleCheckout = () => {
        onNavigate('checkout');
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/60 z-[99] animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[rgb(var(--color-brand-dark))] z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-heading"
            >
                <div className="flex flex-col h-full">
                    <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-[rgb(var(--color-brand-gold))]/[.30]">
                        <h2 id="cart-heading" className="text-xl font-display text-[rgb(var(--color-brand-gold))]">Seu Carrinho</h2>
                        <button onClick={onClose} aria-label="Fechar carrinho">
                            <CloseIcon className="h-6 w-6 text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]"/>
                        </button>
                    </header>
                    
                    {cartItems.length > 0 ? (
                        <>
                            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-[rgb(var(--color-brand-text-light))]">{item.name}</p>
                                            {item.variantText && <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{item.variantText}</p>}
                                            <p className="text-sm text-[rgb(var(--color-brand-gold))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                                            <div className="flex items-center border border-[rgb(var(--color-brand-gray-light))] rounded-full justify-between w-28 mt-2">
                                                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="px-3 py-1 text-lg text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] rounded-l-full">-</button>
                                                <span className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))]">{item.quantity}</span>
                                                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="px-3 py-1 text-lg text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))] rounded-r-full">+</button>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="font-bold text-[rgb(var(--color-brand-text-light))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                                            <button onClick={() => onRemoveItem(item.id)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))] mt-2" aria-label={`Remover ${item.name} do carrinho`}>
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </main>

                            <footer className="flex-shrink-0 p-4 border-t border-[rgb(var(--color-brand-gray-light))] space-y-4 bg-[rgb(var(--color-brand-dark))]">
                                <div className="space-y-2 text-[rgb(var(--color-brand-text-light))]">
                                    <div className="flex justify-between font-bold text-xl text-[rgb(var(--color-brand-gold))] border-t border-[rgb(var(--color-brand-gray-light))] pt-2 mt-2">
                                        <span>Subtotal:</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={onClose} className="w-full bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] font-bold py-3 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">Continuar Comprando</button>
                                    <button onClick={handleCheckout} className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-4 rounded-md hover:bg-gold-400">Finalizar Compra</button>
                                </div>
                            </footer>
                        </>
                    ) : (
                         <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <p className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">Seu carrinho está vazio</p>
                            <p className="text-[rgb(var(--color-brand-text-dim))] mt-2">Adicione produtos para vê-los aqui.</p>
                            <button onClick={onClose} className="mt-6 bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-2 px-6 rounded-full hover:bg-gold-400">
                                Voltar para a Loja
                            </button>
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default CartView;