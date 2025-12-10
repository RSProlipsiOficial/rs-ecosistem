import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';

interface ProductDetailSimpleProps {
    product: Product;
    onBack: () => void;
    onAddToCart: (product: Product, quantity: number, selectedVariant: ProductVariant) => void;
}

const ProductDetailSimple: React.FC<ProductDetailSimpleProps> = ({ product, onBack, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    
    // Variante padrão
    const defaultVariant: ProductVariant = {
        id: 'default',
        options: {},
        price: product.price,
        inventory: product.inventory,
        sku: product.sku
    };

    const handleAddToCart = () => {
        console.log('ProductDetailSimple - Adicionando ao carrinho:', {
            product: product.name,
            quantity,
            defaultVariant
        });
        onAddToCart(product, quantity, defaultVariant);
    };

    return (
        <section className="py-12 bg-[rgb(var(--color-brand-dark))] text-white min-h-screen">
            <div className="container mx-auto px-4">
                {/* Botão Voltar */}
                <button 
                    onClick={onBack} 
                    className="text-sm text-gray-400 hover:text-[rgb(var(--color-brand-gold))] mb-6"
                >
                    ← Voltar aos produtos
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Imagem do Produto */}
                    <div>
                        <div className="aspect-square bg-dark-800 rounded-lg overflow-hidden">
                            <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Detalhes do Produto */}
                    <div>
                        <p className="text-sm text-gray-400">{product.seller}</p>
                        <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
                        
                        {/* Preço */}
                        <div className="mt-6">
                            <span className="text-4xl font-bold text-[rgb(var(--color-brand-gold))]">
                                R$ {product.price.toFixed(2)}
                            </span>
                        </div>

                        {/* Quantidade */}
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex items-center border border-dark-700 rounded-full">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                    className="px-4 py-2 text-xl hover:text-[rgb(var(--color-brand-gold))]"
                                >
                                    -
                                </button>
                                <span className="px-4 text-lg font-semibold">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)} 
                                    className="px-4 py-2 text-xl hover:text-[rgb(var(--color-brand-gold))]"
                                >
                                    +
                                </button>
                            </div>
                            
                            {/* Botão Adicionar ao Carrinho */}
                            <button 
                                onClick={handleAddToCart}
                                className="flex-grow bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 px-8 rounded-full text-lg hover:bg-[rgb(var(--color-brand-secondary))]"
                            >
                                Adicionar ao Carrinho
                            </button>
                        </div>

                        {/* Descrição */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4">Descrição</h3>
                            <div 
                                className="text-gray-400" 
                                dangerouslySetInnerHTML={{ __html: product.description }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetailSimple;
