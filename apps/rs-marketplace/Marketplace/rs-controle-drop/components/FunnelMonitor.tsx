import React, { useState, useMemo, useEffect } from 'react';
import { Cart, Checkout, User, CheckoutFunnelStep, Product, CartItem } from '../types';
import { useCartCheckout } from '../contexts/CartCheckoutContext';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ShoppingCart, ChevronsRight, Filter, Clock, MapPin, Hand, ArrowRight, X, Plus, Minus, Trash2, Truck, Gift, Package as PackageIcon } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { CheckoutFlow } from './CheckoutFlow';

interface FunnelMonitorProps {
    currentUser: User;
    users: User[];
    products: Product[];
    initialFilter?: any; // For deep linking
}

const timeSince = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `há ${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
};

export const FunnelMonitor: React.FC<FunnelMonitorProps> = ({ currentUser, users, products, initialFilter }) => {
    const { carts, checkouts, interactWithCheckout, startCheckout, updateCartItemQuantity, removeCartItem } = useCartCheckout();
    const [activeTab, setActiveTab] = useState<'carts' | 'checkouts'>('carts');

    const [cartStatusFilter, setCartStatusFilter] = useState('all');
    const [checkoutStatusFilter, setCheckoutStatusFilter] = useState('all');
    
    // Handle initial filters (Deep Linking)
    useEffect(() => {
        if (initialFilter) {
            if (initialFilter.status) {
                if (activeTab === 'carts') setCartStatusFilter(initialFilter.status);
                else setCheckoutStatusFilter(initialFilter.status);
            }
            if (initialFilter.tab) setActiveTab(initialFilter.tab);
        }
    }, [initialFilter, activeTab]);
    
    // State to manage which cart is entering the checkout flow
    const [checkoutCart, setCheckoutCart] = useState<Cart | null>(null);
    
    const [viewingCartId, setViewingCartId] = useState<string | null>(null);
    const viewingCart = useMemo(() => carts.find(c => c.id === viewingCartId), [carts, viewingCartId]);

    const filteredCarts = carts.filter(c => cartStatusFilter === 'all' || c.status === cartStatusFilter);
    const filteredCheckouts = checkouts.filter(c => checkoutStatusFilter === 'all' || c.status === checkoutStatusFilter);

    const cartTable = useDataTable({ initialData: filteredCarts, searchKeys: ['id', 'userId', 'utmSource', 'utmCampaign'] });
    const checkoutTable = useDataTable({ initialData: filteredCheckouts, searchKeys: ['id', 'userId', 'customerInfo.name', 'utmSource'] });

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            aberto: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
            atualizado: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
            abandonado: 'bg-red-500/10 text-red-400 border border-red-500/20',
            convertido: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            iniciado: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
            em_andamento: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
            concluido: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            falha_pagamento: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${styles[status] || 'bg-slate-700'}`}>{status.replace('_', ' ')}</span>;
    };
    
    const cartColumns: Column<Cart>[] = [
        { header: 'ID/Criação', accessor: 'createdAt', sortable: true, render: c => <div><div className="font-mono text-xs">{c.id}</div><div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString('pt-BR')}</div></div> },
        { header: 'Última Interação', accessor: 'updatedAt', sortable: true, render: c => <div className="text-xs text-slate-400 flex items-center gap-1.5"><Clock size={12}/> {timeSince(c.updatedAt)}</div> },
        { header: 'Status', accessor: 'status', sortable: true, render: c => getStatusBadge(c.status) },
        { header: 'Valor', accessor: 'total', sortable: false, headerClassName: 'text-right', cellClassName: 'text-right font-medium', render: c => `R$ ${c.items.reduce((a, b) => a + b.unitPrice * b.quantity, 0).toFixed(2)}` },
        { header: 'Itens', accessor: 'items', render: c => `${c.items.length} (${c.items.reduce((a, b) => a + b.quantity, 0)} un)` },
        { header: 'Origem', accessor: 'utmSource', render: c => <div className="text-xs"><span className="font-bold text-slate-300">{c.utmSource || '-'}</span> / <span className="text-slate-500">{c.utmCampaign || '-'}</span></div> },
        ...(currentUser.role === 'Admin' ? [{
            header: 'Logista', accessor: 'userId', sortable: true,
            render: (c: Cart) => <span className="text-xs text-slate-400">{users.find(u => u.id === c.userId)?.name || 'N/A'}</span>
        } as Column<Cart>] : []),
        { header: 'Ações', accessor: 'actions', render: c => (
            <div className="flex gap-2">
                 <button onClick={() => setViewingCartId(c.id)} className="text-xs bg-slate-700/50 hover:bg-slate-700/80 text-slate-300 px-2 py-1 rounded">Ver Detalhes</button>
                 {['aberto', 'atualizado'].includes(c.status) && (
                    <button
                        onClick={() => setCheckoutCart(c)}
                        className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded flex items-center gap-1"
                        title="Iniciar fluxo de checkout"
                    >
                        <ArrowRight size={12}/> Iniciar Checkout
                    </button>
                )}
            </div>
        )}
    ];
    
    const checkoutColumns: Column<Checkout>[] = [
        { header: 'ID/Criação', accessor: 'createdAt', sortable: true, render: c => <div><div className="font-mono text-xs">{c.id}</div><div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString('pt-BR')}</div></div> },
        { header: 'Última Interação', accessor: 'updatedAt', sortable: true, render: c => <div className="text-xs text-slate-400 flex items-center gap-1.5"><Clock size={12}/> {timeSince(c.updatedAt)}</div> },
        { header: 'Status', accessor: 'status', sortable: true, render: c => getStatusBadge(c.status) },
        { header: 'Etapa Funil', accessor: 'currentStep', sortable: true, render: c => <div className="text-xs text-slate-300 flex items-center gap-1.5 capitalize"><MapPin size={12}/> {c.currentStep?.replace('_', ' ') || '-'}</div> },
        { header: 'Valor', accessor: 'total', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right font-medium', render: c => `R$ ${c.total.toFixed(2)}` },
        { header: 'Cliente', accessor: 'customerInfo.name', render: c => c.customerInfo.name },
        ...(currentUser.role === 'Admin' ? [{
            header: 'Logista', accessor: 'userId', sortable: true,
            render: (c: Checkout) => <span className="text-xs text-slate-400">{users.find(u => u.id === c.userId)?.name || 'N/A'}</span>
        } as Column<Checkout>] : []),
        { header: 'Ações', accessor: 'actions', render: c => {
            const nextStep: CheckoutFunnelStep | undefined = c.currentStep === 'dados_pessoais' ? 'endereco_frete' : c.currentStep === 'endereco_frete' ? 'pagamento' : undefined;
            return (
                <button
                    onClick={() => interactWithCheckout(c.id, nextStep)}
                    disabled={!['iniciado', 'em_andamento'].includes(c.status)}
                    className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={nextStep ? `Simular avanço para '${nextStep.replace('_', ' ')}'` : 'Simular interação no pagamento'}
                >
                    {nextStep ? <><ArrowRight size={12}/> Avançar</> : <><Hand size={12}/> Interagir</>}
                </button>
            )
        }}
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ChevronsRight size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Monitor do Funil de Vendas</h2>
                        <p className="text-sm text-slate-500">Acompanhe o fluxo de compra em tempo real.</p>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-1 p-1 bg-rs-dark rounded-xl border border-white/10 w-fit">
                <button onClick={() => setActiveTab('carts')} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 ${activeTab === 'carts' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>
                    <ShoppingCart size={16}/> Carrinhos Ativos
                </button>
                <button onClick={() => setActiveTab('checkouts')} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 ${activeTab === 'checkouts' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>
                    <ChevronsRight size={16}/> Checkouts Ativos
                </button>
            </div>
            
            {activeTab === 'carts' && (
                <div>
                    <div className="flex items-center gap-2 bg-rs-card p-3 rounded-lg border border-white/5 mb-4 w-fit">
                        <Filter size={16} className="text-slate-400"/>
                        <select value={cartStatusFilter} onChange={e => setCartStatusFilter(e.target.value)} className="bg-transparent text-slate-300 text-sm outline-none">
                            <option value="all">Todos os Status</option>
                            <option value="aberto">Aberto</option>
                            <option value="atualizado">Atualizado</option>
                            <option value="abandonado">Abandonado</option>
                            <option value="convertido">Convertido</option>
                        </select>
                    </div>
                    <DataTable {...cartTable} columns={cartColumns} data={cartTable.paginatedData} onSort={cartTable.requestSort} onSearch={cartTable.setSearchTerm} onPageChange={{next: cartTable.nextPage, prev: cartTable.prevPage, goTo: cartTable.goToPage}} onItemsPerPageChange={cartTable.handleItemsPerPageChange} searchPlaceholder="Buscar por ID de usuário, UTM..."/>
                </div>
            )}

            {activeTab === 'checkouts' && (
                <div>
                    <div className="flex items-center gap-2 bg-rs-card p-3 rounded-lg border border-white/5 mb-4 w-fit">
                        <Filter size={16} className="text-slate-400"/>
                        <select value={checkoutStatusFilter} onChange={e => setCheckoutStatusFilter(e.target.value)} className="bg-transparent text-slate-300 text-sm outline-none">
                            <option value="all">Todos os Status</option>
                            <option value="iniciado">Iniciado</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="abandonado">Abandonado</option>
                            <option value="concluido">Concluído</option>
                            <option value="falha_pagamento">Falha Pagto</option>
                        </select>
                    </div>
                    <DataTable {...checkoutTable} columns={checkoutColumns} data={checkoutTable.paginatedData} onSort={checkoutTable.requestSort} onSearch={checkoutTable.setSearchTerm} onPageChange={{next: checkoutTable.nextPage, prev: checkoutTable.prevPage, goTo: checkoutTable.goToPage}} onItemsPerPageChange={checkoutTable.handleItemsPerPageChange} searchPlaceholder="Buscar por ID, cliente..."/>
                </div>
            )}
            
            {viewingCart && (
                <CartDetailModal
                    key={viewingCart.id}
                    cart={viewingCart}
                    products={products}
                    onClose={() => setViewingCartId(null)}
                    onUpdateItemQuantity={updateCartItemQuantity}
                    onRemoveItem={removeCartItem}
                    onStartCheckout={() => {
                        setViewingCartId(null);
                        setCheckoutCart(viewingCart);
                    }}
                />
            )}

            {checkoutCart && (
                <CheckoutFlow
                    cart={checkoutCart}
                    onClose={() => setCheckoutCart(null)}
                />
            )}

            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};

// --- CART DETAIL MODAL ---
interface CartDetailModalProps {
    cart: Cart;
    products: Product[];
    onClose: () => void;
    onUpdateItemQuantity: (cartId: string, itemId: string, quantity: number) => void;
    onRemoveItem: (cartId: string, itemId: string) => void;
    onStartCheckout: () => void;
}

const CartDetailModal: React.FC<CartDetailModalProps> = ({ cart, products, onClose, onUpdateItemQuantity, onRemoveItem, onStartCheckout }) => {
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [zipCode, setZipCode] = useState('');

    const subtotal = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const total = subtotal + (shippingCost || 0);

    const handleCalculateShipping = () => {
        if (zipCode.replace(/\D/g, '').length === 8) {
            setShippingCost(Math.random() * 30 + 15); // Random shipping cost
        } else {
            alert('CEP inválido.');
        }
    };
    
    const cartCategories = [...new Set(cart.items.map(item => products.find(p => p.id === item.productId)?.category).filter(Boolean))];
    const cartProductIds = cart.items.map(item => item.productId);
    const recommendedProducts = products.filter(p => !cartProductIds.includes(p.id) && p.category && cartCategories.includes(p.category)).slice(0, 3);
    
    const freeShippingThreshold = 250;
    const missingForFreeShipping = freeShippingThreshold - subtotal;

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title={`Detalhes do Carrinho #${cart.id}`} size="5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        {cart.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
                                <div className="w-16 h-16 bg-rs-dark rounded-md flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-200">{item.productName}</div>
                                    <div className="text-xs text-slate-500">Preço: R$ {item.unitPrice.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-2 border border-white/10 rounded-full p-1">
                                    <button onClick={() => onUpdateItemQuantity(cart.id, item.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-white/10"><Minus size={14}/></button>
                                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => onUpdateItemQuantity(cart.id, item.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-white/10"><Plus size={14}/></button>
                                </div>
                                <div className="w-24 text-right font-bold">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                                <button onClick={() => onRemoveItem(cart.id, item.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                    
                    {recommendedProducts.length > 0 && (
                        <div>
                            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-3"><PackageIcon size={16}/> Produtos Recomendados</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {recommendedProducts.map(p => (
                                    <div key={p.id} className="bg-black/20 p-3 rounded-lg border border-white/5 text-center">
                                        <div className="w-16 h-16 bg-rs-dark rounded-md mx-auto mb-2"></div>
                                        <div className="text-xs font-bold line-clamp-2">{p.name}</div>
                                        <div className="text-sm text-rs-gold font-bold mt-1">R$ {p.salePrice.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 bg-black/20 p-6 rounded-xl border border-white/10 h-fit">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-white/10 pb-3">Resumo do Pedido</h3>
                    
                    <div className="space-y-2">
                        <label className="label-text">Calcular Frete</label>
                        <div className="flex gap-2">
                            <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="Digite o CEP" className="input-field"/>
                            <button onClick={handleCalculateShipping} className="btn-secondary px-3"><Truck size={16}/></button>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="font-medium">R$ {subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Frete</span><span>{shippingCost ? `R$ ${shippingCost.toFixed(2)}` : 'A calcular'}</span></div>
                        <div className="border-t border-dashed border-white/10 my-2"></div>
                        <div className="flex justify-between font-bold text-lg"><span className="text-slate-200">Total</span><span className="text-rs-gold">R$ {total.toFixed(2)}</span></div>
                    </div>

                    {missingForFreeShipping > 0 && (
                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-center text-xs">
                            <Gift size={16} className="mx-auto mb-1 text-emerald-400"/>
                            Faltam <span className="font-bold text-white">R$ {missingForFreeShipping.toFixed(2)}</span> para você ganhar <span className="font-bold text-emerald-300">Frete Grátis</span>!
                        </div>
                    )}

                    <button onClick={onStartCheckout} className="w-full btn-primary text-lg py-3 mt-4">
                        Finalizar Compra
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};