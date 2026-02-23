
import React, { useState, useMemo, FC } from 'react';
import Card from '../../components/Card';
import {
    IconBuilding2,
    IconShoppingCart,
    IconSettings,
    IconTruck,
    IconMapPin,
    IconEdit,
    IconPlus,
    IconMinus,
    IconTrash,
    IconChevronLeft,
    IconWallet,
    IconReceipt, // Using for PIX
    IconLandmark, // Using for Card
    IconCheckCircle
} from '../../components/icons';
import {
    mockCDInfo,
    mockCDProducts,
    mockCDConsultantOrders,
    mockCDInventory,
    mockUser
} from '../data';
import type { CDConsultantOrder, CDInventoryItem, CDProduct, CDInfo } from '../../types';

type Tab = 'comprar' | 'pedidos' | 'estoque' | 'configuracoes';
type View = 'shop' | 'cart' | 'checkout' | 'confirmation';

interface CartItem extends CDProduct {
    quantity: number;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
            active ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {label}
    </button>
);

// #region Sub-components for each view
const ShopView: FC<{ products: CDProduct[]; onAddToCart: (product: CDProduct, quantity: number) => void; cart: CartItem[] }> = ({ products, onAddToCart, cart }) => {
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [addedProductId, setAddedProductId] = useState<string | null>(null);

    const handleQuantityChange = (productId: string, delta: number) => {
        setQuantities(prev => {
            const currentQuantity = prev[productId] || 1;
            const newQuantity = Math.max(1, currentQuantity + delta);
            return { ...prev, [productId]: newQuantity };
        });
    };

    const handleAddToCart = (product: CDProduct) => {
        const quantity = quantities[product.id] || 1;
        onAddToCart(product, quantity);
        setAddedProductId(product.id);
        setTimeout(() => setAddedProductId(null), 1500);
    };

    const getProductQuantityInCart = (productId: string) => {
      const item = cart.find(p => p.id === productId);
      return item ? item.quantity : 0;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
                const discountedPrice = product.fullPrice * (1 - product.discount / 100);
                const quantityInCart = getProductQuantityInCart(product.id);
                const isJustAdded = addedProductId === product.id;
                return (
                    <Card key={product.id} className="p-0 flex flex-col">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                        <div className="p-4 flex flex-col flex-grow">
                            <h4 className="font-bold text-white h-12">{product.name}</h4>
                            <div className="mt-2">
                                <p className="text-sm text-gray-400 line-through">{formatCurrency(product.fullPrice)}</p>
                                <p className="text-2xl font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                                <p className="text-xs text-green-400">Desconto de {product.discount}%</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-brand-gray-light flex-grow flex flex-col justify-end">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center border border-brand-gray-light rounded-md">
                                        <button onClick={() => handleQuantityChange(product.id, -1)} className="px-3 py-2 text-white hover:bg-brand-gray-light rounded-l-md"><IconMinus size={16} /></button>
                                        <span className="px-4 py-1.5 font-bold">{quantities[product.id] || 1}</span>
                                        <button onClick={() => handleQuantityChange(product.id, 1)} className="px-3 py-2 text-white hover:bg-brand-gray-light rounded-r-md"><IconPlus size={16} /></button>
                                    </div>
                                    <button onClick={() => handleAddToCart(product)} className={`font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-36 ${isJustAdded ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                                        {isJustAdded ? (
                                            <><IconCheckCircle size={16} /> Adicionado!</>
                                        ) : (
                                            <><IconPlus size={16} /> Adicionar</>
                                        )}
                                    </button>
                                </div>
                                {quantityInCart > 0 && !isJustAdded && (
                                     <p className="text-center text-xs text-green-400 mt-2">{quantityInCart} no carrinho</p>
                                )}
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    );
};

const CartView: FC<{ cart: CartItem[]; onUpdateQuantity: (productId: string, quantity: number) => void; onRemove: (productId: string) => void; onContinue: () => void; onCheckout: () => void; shippingMethod: string; setShippingMethod: (method: string) => void; subtotal: number; shippingCost: number; total: number; }> = ({ cart, onUpdateQuantity, onRemove, onContinue, onCheckout, shippingMethod, setShippingMethod, subtotal, shippingCost, total }) => (
    <Card>
        <h3 className="text-2xl font-bold text-white mb-6">Seu Carrinho</h3>
        <div className="space-y-4">
            {cart.map(item => {
                 const discountedPrice = item.fullPrice * (1 - item.discount / 100);
                 return (
                    <div key={item.id} className="flex items-center justify-between pb-4 border-b border-brand-gray-light">
                        <div className="flex items-center gap-4">
                            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                            <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-sm text-brand-gold">{formatCurrency(discountedPrice)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-brand-gray-light rounded-md">
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 text-white hover:bg-brand-gray-light rounded-l-md"><IconMinus size={16} /></button>
                                <span className="px-4 py-1 font-bold">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 text-white hover:bg-brand-gray-light rounded-r-md"><IconPlus size={16} /></button>
                            </div>
                            <p className="font-bold text-white w-24 text-right">{formatCurrency(discountedPrice * item.quantity)}</p>
                            <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500"><IconTrash size={20} /></button>
                        </div>
                    </div>
                 )
            })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
                <h4 className="font-bold text-white mb-3">Opções de Frete</h4>
                <div className="space-y-2">
                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${shippingMethod === 'sedex' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                        <input type="radio" name="shipping" value="sedex" checked={shippingMethod === 'sedex'} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                        <span className="ml-3 font-semibold">SEDEX - R$ 15,00</span>
                    </label>
                    <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${shippingMethod === 'carrier' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                        <input type="radio" name="shipping" value="carrier" checked={shippingMethod === 'carrier'} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                        <span className="ml-3 font-semibold">Transportadora - R$ 25,00</span>
                    </label>
                     <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${shippingMethod === 'pickup' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                        <input type="radio" name="shipping" value="pickup" checked={shippingMethod === 'pickup'} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                        <span className="ml-3 font-semibold">Retirar no Local - Grátis</span>
                    </label>
                </div>
            </div>

            <div className="text-right space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal:</span> <span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Frete:</span> <span className="font-semibold">{formatCurrency(shippingCost)}</span></div>
                <div className="flex justify-between text-xl"><span className="text-white font-bold">Total:</span> <span className="font-extrabold text-brand-gold">{formatCurrency(total)}</span></div>
                <div className="pt-4 flex justify-end gap-4">
                    <button onClick={onContinue} className="bg-brand-gray-light text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-gray">Continuar Comprando</button>
                    <button onClick={onCheckout} className="bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400">Finalizar Compra</button>
                </div>
            </div>
        </div>

    </Card>
);

const CheckoutView: FC<{ total: number; walletBalance: number; useWallet: boolean; onToggleWallet: () => void; paymentMethod: string; onSetPaymentMethod: (method: string) => void; onBack: () => void; onPay: () => void; pixKey: CDInfo['payment']['pixKey'] }> = ({ total, walletBalance, useWallet, onToggleWallet, paymentMethod, onSetPaymentMethod, onBack, onPay, pixKey }) => {
    const amountToPay = useWallet ? Math.max(0, total - walletBalance) : total;
    const walletDeduction = useWallet ? Math.min(total, walletBalance) : 0;
    
    return (
        <Card>
            <button onClick={onBack} className="flex items-center text-brand-gold font-semibold mb-6"><IconChevronLeft size={20} /> Voltar ao Carrinho</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Resumo */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">Resumo do Pedido</h3>
                    <div className="p-4 bg-brand-gray-light rounded-lg space-y-2">
                        <div className="flex justify-between"><span className="text-gray-400">Total do Pedido:</span> <span className="font-semibold">{formatCurrency(total)}</span></div>
                        {useWallet && <div className="flex justify-between"><span className="text-gray-400">Saldo da Carteira:</span> <span className="font-semibold text-red-400">- {formatCurrency(walletDeduction)}</span></div>}
                        <div className="flex justify-between text-xl border-t border-brand-gray pt-2 mt-2"><span className="text-white font-bold">Valor a Pagar:</span> <span className="font-extrabold text-brand-gold">{formatCurrency(amountToPay)}</span></div>
                    </div>
                     <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${useWallet ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                        <input type="checkbox" checked={useWallet} onChange={onToggleWallet} className="form-checkbox h-5 w-5 rounded text-brand-gold bg-brand-gray" />
                        <span className="ml-3 font-semibold">Usar Saldo da Carteira ({formatCurrency(walletBalance)} disponível)</span>
                    </label>
                </div>

                {/* Pagamento */}
                <div className="space-y-4">
                     <h3 className="text-2xl font-bold text-white">Pagamento</h3>
                     <div className="space-y-2">
                        <button onClick={() => onSetPaymentMethod('pix')} className={`w-full text-left flex items-center p-3 rounded-lg border-2 ${paymentMethod === 'pix' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <IconReceipt size={24} className="mr-3 text-brand-gold" />
                            <span className="font-semibold">Pagar com PIX</span>
                        </button>
                        <button onClick={() => onSetPaymentMethod('card')} className={`w-full text-left flex items-center p-3 rounded-lg border-2 ${paymentMethod === 'card' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                             <IconLandmark size={24} className="mr-3 text-brand-gold" />
                             <span className="font-semibold">Pagar com Cartão de Crédito</span>
                        </button>
                     </div>
                     
                     {paymentMethod === 'pix' && (
                        <div className="p-4 bg-brand-gray-light rounded-lg text-center space-y-3">
                            <p>Escaneie o QR Code ou use o Copia e Cola.</p>
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${pixKey.key}`} alt="PIX QR Code" className="mx-auto bg-white p-2 rounded-md" />
                            <input type="text" readOnly value={pixKey.key} className="w-full bg-brand-dark text-center font-mono p-2 rounded-md border border-brand-gray" />
                        </div>
                     )}

                     {paymentMethod === 'card' && (
                        <div className="p-4 bg-brand-gray-light rounded-lg space-y-3">
                            <input type="text" placeholder="Número do Cartão" className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray" />
                            <input type="text" placeholder="Nome no Cartão" className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray" />
                            <div className="flex gap-3">
                                <input type="text" placeholder="Validade (MM/AA)" className="w-1/2 bg-brand-dark p-2 rounded-md border border-brand-gray" />
                                <input type="text" placeholder="CVV" className="w-1/2 bg-brand-dark p-2 rounded-md border border-brand-gray" />
                            </div>
                        </div>
                     )}

                     <button onClick={onPay} className="w-full bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 text-lg">
                        {paymentMethod === 'pix' ? 'Já realizei o pagamento' : 'Pagar Agora'}
                    </button>
                </div>
            </div>
        </Card>
    );
};

const ConfirmationView: FC<{ onNewOrder: () => void }> = ({ onNewOrder }) => (
    <Card className="text-center py-16">
        <IconCheckCircle size={64} className="mx-auto text-green-400" />
        <h3 className="text-3xl font-bold text-white mt-6">Pedido Realizado com Sucesso!</h3>
        <p className="text-gray-400 mt-2">Seu pedido foi recebido e está sendo processado. Você receberá atualizações por e-mail.</p>
        <button onClick={onNewOrder} className="mt-8 bg-brand-gold text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-yellow-400">Fazer Novo Pedido</button>
    </Card>
);
// #endregion

// #region Tab Content Components
const statusMap: Record<CDConsultantOrder['status'], { label: string; color: string }> = {
    pending_payment: { label: 'Aguardando Pagamento', color: 'bg-yellow-500/20 text-yellow-400' },
    paid: { label: 'Pago', color: 'bg-blue-500/20 text-blue-400' },
    shipped: { label: 'Enviado', color: 'bg-indigo-500/20 text-indigo-400' },
    completed: { label: 'Concluído', color: 'bg-green-500/20 text-green-400' },
};

const PedidosTab: React.FC<{ orders: CDConsultantOrder[] }> = ({ orders }) => (
    <div className="animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4">Pedidos de Consultores</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-brand-gray text-sm text-gray-400">
                    <tr>
                        <th className="p-3">Pedido / Data</th>
                        <th className="p-3">Consultor</th>
                        <th className="p-3">Itens</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                            <td className="p-3">
                                <p className="font-semibold text-white">{order.id}</p>
                                <p className="text-xs text-gray-400">{order.date}</p>
                            </td>
                            <td className="p-3">
                                <div className="flex items-center space-x-3">
                                    <img src={order.consultant.avatarUrl} alt={order.consultant.name} className="h-10 w-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-white text-sm">{order.consultant.name}</p>
                                        <p className="text-xs text-gray-400">{order.consultant.phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-3 text-sm text-gray-300">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                            <td className="p-3 font-semibold text-white">{formatCurrency(order.total)}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[order.status].color}`}>
                                    {statusMap[order.status].label}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const EstoqueTab: React.FC<{ inventory: CDInventoryItem[] }> = ({ inventory }) => (
     <div className="animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4">Gerenciamento de Estoque</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                 <thead className="border-b border-brand-gray text-sm text-gray-400">
                    <tr>
                        <th className="p-3">Produto</th>
                        <th className="p-3 text-center">Quantidade</th>
                        <th className="p-3 text-right">Custo Unitário</th>
                        <th className="p-3 text-right">Valor Total em Estoque</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map(item => (
                        <tr key={item.productId} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                            <td className="p-3 font-semibold text-white">{item.name}</td>
                            <td className="p-3 text-center font-mono text-lg">{item.quantity}</td>
                            <td className="p-3 text-right">{formatCurrency(item.unitCost)}</td>
                            <td className="p-3 text-right font-semibold text-brand-gold">{formatCurrency(item.quantity * item.unitCost)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ConfigInfoLine: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-white">{value}</p>
    </div>
);
const ConfiguracoesTab: React.FC = () => {
    const [cdInfo, setCdInfo] = useState(mockCDInfo);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        // Here you would typically send the data to a server
        setIsEditing(false);
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-3xl">
            {Object.entries({
                "Informações do CD": { icon: IconBuilding2, fields: { name: "Nome do CD", email: "E-mail", phone: "Telefone" }, section: "main" },
                "Endereço": { icon: IconMapPin, fields: { street: "Rua", number: "Nº", neighborhood: "Bairro", city: "Cidade", state: "UF", zipCode: "CEP" }, section: "address" },
                "Pagamento (PIX)": { icon: IconReceipt, fields: { type: "Tipo de Chave", key: "Chave PIX" }, section: "payment.pixKey" },
            }).map(([title, { icon: Icon, fields, section }]) => (
                <div key={title}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Icon /> {title}</h3>
                        {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-brand-gold hover:text-yellow-300"><IconEdit size={14}/> Editar</button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-brand-gray-light rounded-lg">
                        {Object.entries(fields).map(([key, label]) => {
                             // Access nested properties
                            const path = section.split('.');
                            // @ts-ignore
                            let value: any = cdInfo;
                            path.forEach(p => { if (p !== 'main') value = value[p] });
                            value = value[key as keyof typeof value];
                            
                            if (!isEditing) {
                                return <ConfigInfoLine key={key} label={label as string} value={value as string} />;
                            }

                            if (key === 'type') {
                                return (
                                    <div key={key}>
                                        <label className="text-sm text-gray-400 block mb-1">{label}</label>
                                        <select
                                            value={cdInfo.payment.pixKey.type}
                                            onChange={(e) => setCdInfo(prev => ({ ...prev, payment: { ...prev.payment, pixKey: { ...prev.payment.pixKey, type: e.target.value as any } } }))}
                                            className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray"
                                        >
                                            <option value="cnpj">CNPJ</option>
                                            <option value="cpf">CPF</option>
                                            <option value="email">E-mail</option>
                                            <option value="random">Chave aleatória</option>
                                            <option value="phone">Telefone</option>
                                        </select>
                                    </div>
                                )
                            }
                            
                            return (
                                <div key={key}>
                                    <label className="text-sm text-gray-400 block mb-1">{label}</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setCdInfo(prev => {
                                                const newState: any = { ...prev };
                                                let target: any = newState;
                                                for (let i = 0; i < path.length; i++) {
                                                    if(path[i] !== 'main') {
                                                        target = target[path[i]];
                                                    }
                                                }
                                                target[key] = newValue;
                                                return newState;
                                            });
                                        }}
                                        className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray"
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
             {isEditing && (
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => { setIsEditing(false); setCdInfo(mockCDInfo); }} className="bg-brand-gray-light text-white font-bold py-2 px-6 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="bg-brand-gold text-brand-dark font-bold py-2 px-6 rounded-lg">Salvar Alterações</button>
                </div>
            )}
        </div>
    );
};
// #endregion

const CentroDistribuicao: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('comprar');
    const [view, setView] = useState<View>('shop');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [shippingMethod, setShippingMethod] = useState('sedex');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [useWallet, setUseWallet] = useState(false);
    const walletBalance = mockUser.bonusCicloGlobal + mockUser.bonusTopSigme + mockUser.bonusPlanoCarreira;

    const addToCart = (product: CDProduct, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
        }
    };
    
    const resetOrder = () => {
        setCart([]);
        setView('shop');
        setShippingMethod('sedex');
        setPaymentMethod('pix');
        setUseWallet(false);
    }

    const { subtotal, shippingCost, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.fullPrice * (1 - item.discount / 100)) * item.quantity, 0);
        let ship = 0;
        if (shippingMethod === 'sedex') ship = 15.00;
        if (shippingMethod === 'carrier') ship = 25.00;
        const tot = sub + ship;
        return { subtotal: sub, shippingCost: ship, total: tot };
    }, [cart, shippingMethod]);


    const renderContent = () => {
        if (activeTab === 'comprar') {
            switch (view) {
                case 'shop':
                    return <ShopView products={mockCDProducts} onAddToCart={addToCart} cart={cart}/>;
                case 'cart':
                    return <CartView cart={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onContinue={() => setView('shop')} onCheckout={() => setView('checkout')} shippingMethod={shippingMethod} setShippingMethod={setShippingMethod} subtotal={subtotal} shippingCost={shippingCost} total={total} />;
                case 'checkout':
                    return <CheckoutView total={total} walletBalance={walletBalance} useWallet={useWallet} onToggleWallet={() => setUseWallet(!useWallet)} paymentMethod={paymentMethod} onSetPaymentMethod={setPaymentMethod} onBack={() => setView('cart')} onPay={() => setView('confirmation')} pixKey={mockCDInfo.payment.pixKey} />;
                case 'confirmation':
                    return <ConfirmationView onNewOrder={resetOrder} />;
            }
        }
        if (activeTab === 'pedidos') return <PedidosTab orders={mockCDConsultantOrders} />;
        if (activeTab === 'estoque') return <EstoqueTab inventory={mockCDInventory} />;
        if (activeTab === 'configuracoes') return <ConfiguracoesTab />;
        return null;
    };

    const getHeader = () => {
        switch (activeTab) {
            case 'comprar':
                return { title: 'Comprar Produtos do CD', icon: IconShoppingCart };
            case 'pedidos':
                return { title: 'Pedidos de Consultores', icon: IconTruck };
            case 'estoque':
                return { title: 'Meu Estoque', icon: IconBuilding2 };
            case 'configuracoes':
                return { title: 'Configurações do CD', icon: IconSettings };
            default:
                return { title: 'Centro de Distribuição', icon: IconBuilding2 };
        }
    };

    const { title, icon: HeaderIcon } = getHeader();

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><HeaderIcon /> {title}</h2>
                    {activeTab === 'comprar' && cart.length > 0 && (
                        <button onClick={() => setView('cart')} className="relative bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400">
                           <IconShoppingCart className="inline mr-2" />
                           Ver Carrinho
                           <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                        </button>
                    )}
                </div>
                 <div className="border-b border-brand-gray-light">
                    <div className="flex items-center -mb-px">
                        <TabButton label="Comprar Produtos" active={activeTab === 'comprar'} onClick={() => setActiveTab('comprar')} />
                        <TabButton label="Pedidos de Consultores" active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')} />
                        <TabButton label="Meu Estoque" active={activeTab === 'estoque'} onClick={() => setActiveTab('estoque')} />
                        <TabButton label="Configurações" active={activeTab === 'configuracoes'} onClick={() => setActiveTab('configuracoes')} />
                    </div>
                </div>
            </Card>

            <div className="animate-fade-in">
                {renderContent()}
            </div>
             <style>{`
                .form-radio, .form-checkbox { appearance: none; -webkit-appearance: none; -moz-appearance: none; width: 1.25rem; height: 1.25rem; border: 2px solid #4a5563; border-radius: 50%; display: inline-block; vertical-align: middle; position: relative; cursor: pointer; }
                .form-checkbox { border-radius: 0.25rem; }
                .form-radio:checked, .form-checkbox:checked { background-color: #ffd700; border-color: #ffd700; }
                .form-radio:checked::after { content: ''; display: block; width: 0.625rem; height: 0.625rem; background: #121212; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
                .form-checkbox:checked::after { content: '✓'; display: block; font-size: 1rem; color: #121212; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }

                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CentroDistribuicao;