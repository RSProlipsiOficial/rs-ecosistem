import React, { useState, useEffect } from 'react';
import { SharedOrder, Product, CartItem } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface SharedOrderParticipantProps {
    sharedOrderId: string;
    products: Product[];
    onAddItems: (sharedOrderId: string, customerName: string, items: CartItem[]) => Promise<{ paymentLink: string }>;
    onBack: () => void;
}

const SharedOrderParticipant: React.FC<SharedOrderParticipantProps> = ({ 
    sharedOrderId, 
    products, 
    onAddItems, 
    onBack 
}) => {
    const [sharedOrder, setSharedOrder] = useState<SharedOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string>('');
    const [showProducts, setShowProducts] = useState(false);

    useEffect(() => {
        loadSharedOrder();
    }, [sharedOrderId]);

    const loadSharedOrder = async () => {
        setLoading(true);
        try {
            // TODO: Substituir por chamada real à API
            await new Promise(res => setTimeout(res, 1000));
            
            // Mock data
            const mockOrder: SharedOrder = {
                id: sharedOrderId,
                teamId: 'team-1',
                coordinatorId: 'coord-1',
                coordinatorName: 'Ana Carolina',
                deliveryAddress: {
                    zipCode: '04567-000',
                    street: 'Rua Augusta',
                    number: '123',
                    complement: 'Apto 45',
                    neighborhood: 'Consolação',
                    city: 'São Paulo',
                    state: 'SP'
                },
                status: 'collecting',
                totalAmount: 0,
                participants: [],
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                shareLink: window.location.href
            };
            
            setSharedOrder(mockOrder);
        } catch (error) {
            console.error('Erro ao carregar pedido compartilhado:', error);
            alert('Erro ao carregar pedido. Verifique o link.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = (product: Product) => {
        const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity: 1,
            variantId: product.variants[0]?.id || '',
            variantText: ''
        };
        setSelectedItems(prev => [...prev, newItem]);
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setSelectedItems(prev => prev.filter(item => item.id !== itemId));
        } else {
            setSelectedItems(prev => prev.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    };

    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleSubmit = async () => {
        if (!customerName.trim()) {
            alert('Por favor, informe seu nome.');
            return;
        }

        if (selectedItems.length === 0) {
            alert('Por favor, adicione pelo menos um produto.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await onAddItems(sharedOrderId, customerName, selectedItems);
            setPaymentLink(result.paymentLink);
        } catch (error) {
            console.error('Erro ao adicionar itens:', error);
            alert('Erro ao adicionar seus itens. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                <div className="text-center">
                    <SpinnerIcon className="w-12 h-12 text-[rgb(var(--color-brand-gold))] mx-auto mb-4"/>
                    <p className="text-[rgb(var(--color-brand-text-dim))]">Carregando pedido...</p>
                </div>
            </div>
        );
    }

    if (!sharedOrder) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Pedido não encontrado</h2>
                    <p className="text-[rgb(var(--color-brand-text-dim))] mb-6">
                        O link pode estar expirado ou inválido.
                    </p>
                    <button onClick={onBack} className="bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] px-6 py-3 rounded-md font-bold">
                        Voltar para a Loja
                    </button>
                </div>
            </div>
        );
    }

    if (paymentLink) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-8 border border-[rgb(var(--color-brand-gold))]">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--color-brand-gold))] mb-2">
                            Pedido Adicionado com Sucesso!
                        </h2>
                        <p className="text-[rgb(var(--color-brand-text-dim))]">
                            Seus itens foram adicionados ao pedido compartilhado
                        </p>
                    </div>

                    <div className="bg-[rgb(var(--color-brand-dark))] p-4 rounded-lg mb-6">
                        <p className="text-sm text-[rgb(var(--color-brand-text-dim))] mb-2">Valor a pagar:</p>
                        <p className="text-3xl font-bold text-[rgb(var(--color-brand-gold))]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                        </p>
                    </div>

                    <a 
                        href={paymentLink}
                        className="block w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] text-center font-bold py-3 rounded-md hover:bg-gold-400 mb-4"
                    >
                        Ir para Pagamento
                    </a>

                    <div className="text-center text-sm text-[rgb(var(--color-brand-text-dim))] space-y-1">
                        <p>📦 Entrega junto com toda a equipe</p>
                        <p>💳 Pague apenas sua parte</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4"/>
                Voltar
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda: Informações do Pedido */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <UserGroupIcon className="w-8 h-8 text-[rgb(var(--color-brand-gold))]"/>
                            <div>
                                <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">
                                    Pedido Compartilhado
                                </h1>
                                <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">
                                    Coordenador: {sharedOrder.coordinatorName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-brand-text-dim))]">
                            <ClockIcon className="w-4 h-4"/>
                            <span>Válido até {new Date(sharedOrder.expiresAt).toLocaleString('pt-BR')}</span>
                        </div>
                    </div>

                    {/* Endereço de Entrega */}
                    <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPinIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/>
                            <h3 className="font-semibold">Endereço de Entrega</h3>
                        </div>
                        <div className="text-sm text-[rgb(var(--color-brand-text-dim))]">
                            <p>{sharedOrder.deliveryAddress.street}, {sharedOrder.deliveryAddress.number}</p>
                            {sharedOrder.deliveryAddress.complement && <p>{sharedOrder.deliveryAddress.complement}</p>}
                            <p>{sharedOrder.deliveryAddress.neighborhood}</p>
                            <p>{sharedOrder.deliveryAddress.city}/{sharedOrder.deliveryAddress.state}</p>
                            <p>CEP: {sharedOrder.deliveryAddress.zipCode}</p>
                        </div>
                    </div>

                    {/* Seu Nome */}
                    <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6">
                        <label className="block text-sm font-semibold mb-2">Seu Nome</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Digite seu nome completo"
                            className="w-full bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-3 px-4 focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                        />
                    </div>

                    {/* Produtos */}
                    <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Escolha seus Produtos</h3>
                            <button 
                                onClick={() => setShowProducts(!showProducts)}
                                className="text-sm text-[rgb(var(--color-brand-gold))] hover:underline"
                            >
                                {showProducts ? 'Ocultar' : 'Ver'} Produtos
                            </button>
                        </div>

                        {showProducts && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {products.slice(0, 12).map(product => (
                                    <div key={product.id} className="bg-[rgb(var(--color-brand-dark))] rounded-lg p-3">
                                        <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2"/>
                                        <p className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))] mb-1 truncate">{product.name}</p>
                                        <p className="text-sm text-[rgb(var(--color-brand-gold))] mb-2">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                        </p>
                                        <button 
                                            onClick={() => handleAddProduct(product)}
                                            className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] text-xs font-bold py-2 rounded-md hover:bg-gold-400"
                                        >
                                            + Adicionar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna Direita: Seus Itens */}
                <div className="lg:col-span-1">
                    <div className="bg-[rgb(var(--color-brand-gray))] rounded-lg p-6 sticky top-4">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingCartIcon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]"/>
                            <h3 className="font-semibold">Seus Itens ({selectedItems.length})</h3>
                        </div>

                        {selectedItems.length === 0 ? (
                            <p className="text-sm text-[rgb(var(--color-brand-text-dim))] text-center py-8">
                                Nenhum item adicionado ainda
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                    {selectedItems.map(item => (
                                        <div key={item.id} className="bg-[rgb(var(--color-brand-dark))] rounded-lg p-3">
                                            <div className="flex gap-3">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md"/>
                                                <div className="flex-grow">
                                                    <p className="text-sm font-semibold text-[rgb(var(--color-brand-text-light))] mb-1">{item.name}</p>
                                                    <p className="text-xs text-[rgb(var(--color-brand-gold))]">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="w-6 h-6 bg-[rgb(var(--color-brand-gray))] rounded-full text-xs font-bold"
                                                        >-</button>
                                                        <span className="text-sm font-semibold">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="w-6 h-6 bg-[rgb(var(--color-brand-gold))] text-black rounded-full text-xs font-bold"
                                                        >+</button>
                                                        <button 
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="ml-auto text-red-400 text-xs hover:underline"
                                                        >Remover</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-[rgb(var(--color-brand-gray-light))] pt-4 mb-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Subtotal:</span>
                                        <span className="text-[rgb(var(--color-brand-gold))]">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !customerName.trim()}
                                    className="w-full bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] font-bold py-3 rounded-md hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:bg-[rgb(var(--color-brand-gray-light))] disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <SpinnerIcon className="w-5 h-5"/>
                                            Processando...
                                        </>
                                    ) : (
                                        'Continuar para Pagamento'
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedOrderParticipant;
