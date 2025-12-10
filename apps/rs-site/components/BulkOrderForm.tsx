import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const BulkOrderForm: React.FC = () => {
    const { products } = useProductContext();
    const { addToCart, clearCart, toggleCart, cartItems } = useCart();
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = (productId: string, variantId: string, quantity: number) => {
        const key = `${productId}-${variantId}`;
        setQuantities(prev => ({
            ...prev,
            [key]: Math.max(0, quantity)
        }));
    };

    const handleAddToCart = () => {
        const itemsToAdd = Object.entries(quantities)
            .filter(([, qty]) => Number(qty) > 0)
            .map(([key, qty]) => {
                const [productId, variantId] = key.split('-');
                const product = products.find(p => p.id === productId);
                const variant = product?.variants.find(v => v.id === variantId);
                if (product && variant) {
                    return {
                        product,
                        variant,
                        quantity: Number(qty),
                        shippingCost: null, // Shipping will be calculated at checkout
                    };
                }
                return null;
            }).filter((item): item is NonNullable<typeof item> => item !== null);

        if (itemsToAdd.length === 0) {
            alert('Por favor, adicione a quantidade de pelo menos um item.');
            return;
        }

        const confirmMessage = cartItems.length > 0 
            ? 'Isso substituirá os itens no seu carrinho atual pelos itens deste formulário. Deseja continuar?'
            : 'Adicionar itens selecionados ao carrinho?';
        
        if (window.confirm(confirmMessage)) {
            clearCart();
            itemsToAdd.forEach(item => {
                if (item) {
                    addToCart(item);
                }
            });
            toggleCart(); // Open cart to show the result
        }
    };

    const total = Object.entries(quantities).reduce((acc, [key, qty]) => {
        if (Number(qty) > 0) {
            const [productId, variantId] = key.split('-');
            const product = products.find(p => p.id === productId);
            const variant = product?.variants.find(v => v.id === variantId);
            if (variant) {
                return acc + (variant.price * Number(qty));
            }
        }
        return acc;
    }, 0);

    // Group products by category to render them separately
    const physicalProducts = products.filter(p => p.category === 'Physical' && p.status === 'active');
    const digitalProducts = products.filter(p => p.category === 'Digital' && p.status === 'active');
    
    const renderProductTable = (title: string, productsToList: Product[]) => (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <h3 className="text-xl font-semibold text-accent p-4 bg-gray-800/50">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-800/50 text-xs text-text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="p-3 pl-4">Produto / Variação</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Preço Unit.</th>
                            <th className="p-3 w-32">Quantidade</th>
                            <th className="p-3 pr-4 text-right">Total Linha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsToList.map(product => 
                            product.variants.map((variant) => {
                                const key = `${product.id}-${variant.id}`;
                                const quantity = quantities[key] || 0;
                                const lineTotal = variant.price * quantity;
                                return (
                                    <tr key={key} className="border-t border-border">
                                        <td className="p-3 pl-4">
                                            <div className="font-semibold text-text-primary">{product.translations.pt.name}</div>
                                            <div className="text-sm text-gray-400">{variant.name}</div>
                                        </td>
                                        <td className="p-3 text-text-secondary font-mono text-sm">{variant.sku}</td>
                                        <td className="p-3 text-text-secondary">{formatCurrency(variant.price)}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                min="0"
                                                value={quantity}
                                                onChange={(e) => handleQuantityChange(product.id, variant.id, parseInt(e.target.value) || 0)}
                                                className="w-24 bg-gray-800 border border-gray-600 rounded-md p-2 text-center"
                                            />
                                        </td>
                                        <td className="p-3 pr-4 text-right font-semibold text-accent">
                                            {formatCurrency(lineTotal)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="space-y-8">
                {physicalProducts.length > 0 && renderProductTable('Produtos Físicos', physicalProducts)}
                {digitalProducts.length > 0 && renderProductTable('Produtos Digitais', digitalProducts)}
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-right">
                    <span className="text-text-secondary">Subtotal do Pedido:</span>
                    <h3 className="text-3xl font-bold text-accent">{formatCurrency(total)}</h3>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto bg-accent text-button-text font-bold py-3 px-8 rounded-full hover:opacity-80 transition-opacity"
                >
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
};

export default BulkOrderForm;