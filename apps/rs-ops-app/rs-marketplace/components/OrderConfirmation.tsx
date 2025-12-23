import React, { useState, useMemo } from 'react';
import { Order, UpsellSettings, Product, OrderItem } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';

interface OrderConfirmationProps {
    order: Order | null;
    onContinueShopping: () => void;
    upsellSettings: UpsellSettings;
    allProducts: Product[];
    onAcceptUpsell: (originalOrder: Order, upsellProduct: Product, offerPrice: number) => void;
}

const UpsellOffer: React.FC<{
    order: Order;
    settings: UpsellSettings;
    product: Product;
    onAccept: () => void;
    onDecline: () => void;
}> = ({ order, settings, product, onAccept, onDecline }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = () => {
        setIsLoading(true);
        // Simulate processing
        setTimeout(() => {
            onAccept();
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto my-8 p-6 rounded-lg border-2 border-dashed border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/[.05] animate-pulse-border">
             <style>{`
                @keyframes pulse-border {
                    0%, 100% { border-color: rgb(var(--color-brand-gold)); }
                    50% { border-color: rgb(var(--color-warning)); }
                }
                .animate-pulse-border {
                    animation: pulse-border 2.5s ease-in-out infinite;
                }
            `}</style>
            <h2 className="text-2xl font-bold font-display text-[rgb(var(--color-brand-gold))] text-center">{settings.title}</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                <img src={product.images[0]} alt={product.name} className="w-32 h-32 object-cover rounded-md flex-shrink-0" />
                <div>
                    <p className="text-[rgb(var(--color-brand-text-dim))]">{settings.description}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-[rgb(var(--color-brand-gold))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(settings.offerPrice)}</span>
                        <span className="text-md text-[rgb(var(--color-brand-text-dim))] line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                 <button 
                    onClick={handleAccept} 
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-500 transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                    {isLoading && <SpinnerIcon className="w-5 h-5" />}
                    {settings.acceptButtonText}
                </button>
                 <button onClick={onDecline} disabled={isLoading} className="w-full text-center text-[rgb(var(--color-brand-text-dim))] hover:text-white text-sm transition-colors disabled:opacity-50">
                    {settings.declineButtonText}
                </button>
            </div>
        </div>
    );
};


const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping, upsellSettings, allProducts, onAcceptUpsell }) => {
    const [upsellState, setUpsellState] = useState<'pending' | 'accepted' | 'declined'>('pending');
    const [pixCodeCopied, setPixCodeCopied] = useState(false);

    const upsellProduct = useMemo(() => {
        if (!upsellSettings.enabled) return null;
        return allProducts.find(p => p.id === upsellSettings.productId);
    }, [upsellSettings, allProducts]);

    if (!order) {
        return (
            <div className="bg-[rgb(var(--color-brand-dark))] text-white min-h-screen flex flex-col items-center justify-center text-center p-4">
                 <h1 className="text-2xl font-bold text-white mb-4">Pedido não encontrado.</h1>
                 <button onClick={onContinueShopping} className="bg-[rgb(var(--color-brand-gold))] text-black font-bold py-3 px-8 rounded-full text-lg">
                    Voltar para a Loja
                </button>
            </div>
        )
    }

    const handleAccept = () => {
        if (upsellProduct) {
            onAcceptUpsell(order, upsellProduct, upsellSettings.offerPrice);
            setUpsellState('accepted');
        }
    };
    
    const handleCopyPix = () => {
        if (order.pixCopyableCode) {
            navigator.clipboard.writeText(order.pixCopyableCode);
            setPixCodeCopied(true);
            setTimeout(() => setPixCodeCopied(false), 2000);
        }
    };

    const renderContent = () => {
        if (upsellProduct && upsellState === 'pending') {
            return <UpsellOffer order={order} settings={upsellSettings} product={upsellProduct} onAccept={handleAccept} onDecline={() => setUpsellState('declined')} />;
        }
        
        return (
            <>
                 <CheckCircleIcon className="w-20 h-20 text-[rgb(var(--color-success))] mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Obrigado por sua compra!</h1>
                <p className="text-lg text-[rgb(var(--color-brand-text-dim))] mt-2">Seu pedido foi recebido e está sendo processado.</p>
                {upsellState === 'accepted' && (
                    <p className="text-lg text-[rgb(var(--color-success))] mt-2 font-semibold">Sua oferta especial foi adicionada com sucesso!</p>
                )}
            </>
        );
    };

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] text-white min-h-screen">
             <header className="bg-[rgb(var(--color-brand-gray))] backdrop-blur-sm border-b border-[rgb(var(--color-brand-gold))]/[.30]">
                <div className="container mx-auto px-4 h-20 flex items-center">
                    <span className="text-3xl font-display text-[rgb(var(--color-brand-gold))]">RS Prólipsi</span>
                </div>
            </header>
            <main className="container mx-auto px-4 py-12 text-center">
                
                {renderContent()}

                 {order.boletoUrl && (
                    <div className="max-w-2xl mx-auto my-8 p-6 rounded-lg border-2 border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/[.05]">
                        <h2 className="text-2xl font-bold font-display text-[rgb(var(--color-brand-gold))] text-center">Boleto Gerado com Sucesso!</h2>
                        <p className="text-[rgb(var(--color-brand-text-dim))] text-center mt-2">Clique no botão abaixo para visualizar e imprimir seu boleto.</p>
                        <div className="mt-6 text-center">
                            <a href={order.boletoUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-[rgb(var(--color-brand-gold))] text-black font-bold py-3 px-8 rounded-full text-lg">
                                Visualizar Boleto
                            </a>
                        </div>
                    </div>
                )}

                {order.pixQrCodeUrl && (
                    <div className="max-w-2xl mx-auto my-8 p-6 rounded-lg border-2 border-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/[.05]">
                        <h2 className="text-2xl font-bold font-display text-[rgb(var(--color-brand-gold))] text-center">Pague com PIX para Finalizar</h2>
                        <div className="text-center p-4 rounded-lg">
                            <img src={order.pixQrCodeUrl} alt="QR Code PIX" className="mx-auto bg-white p-2 rounded-md"/>
                            <p className="text-sm mt-4 text-[rgb(var(--color-brand-text-dim))]">Aponte a câmera do seu celular para pagar, ou use o código abaixo.</p>
                            <button onClick={handleCopyPix} className="mt-4 w-full bg-[rgb(var(--color-brand-gray))] text-white font-semibold py-3 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] flex items-center justify-center gap-2">
                                {pixCodeCopied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-[rgb(var(--color-success))]"/> : <CopyIcon className="w-5 h-5"/>}
                                {pixCodeCopied ? 'Código Copiado!' : 'Copiar Código PIX'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="max-w-2xl mx-auto bg-[rgb(var(--color-brand-gray))] rounded-lg p-6 my-8 text-left">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-[rgb(var(--color-brand-gray-light))] pb-2">Resumo do Pedido <span className="text-[rgb(var(--color-brand-gold))] font-mono">{order.id}</span></h2>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div key={`${item.variantId}-${index}`} className="flex justify-between items-center text-sm">
                                <p className="text-white">{item.productName} <span className="text-[rgb(var(--color-brand-text-dim))]">x{item.quantity}</span></p>
                                <p className="text-[rgb(var(--color-brand-text-dim))]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--color-brand-gray-light))] space-y-2 text-sm">
                         <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-brand-text-dim))]">Subtotal</span>
                            <span className="text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.subtotal)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-brand-text-dim))]">Frete ({order.shippingMethod})</span>
                            <span className="text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.shippingCost)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-[rgb(var(--color-success))]">
                                <span >Desconto ({order.appliedCoupon})</span>
                                <span >- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 text-[rgb(var(--color-brand-gold))]">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                        </div>
                    </div>
                </div>

                <button onClick={onContinueShopping} className="bg-[rgb(var(--color-brand-gold))] text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-gold-400 transition-transform transform hover:scale-105">
                    Continuar Comprando
                </button>
            </main>
        </div>
    );
};

export default OrderConfirmation;