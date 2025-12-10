import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';
import Modal from '../Modal';
import { 
    mockCycleSummary,
    mockCDProducts,
    mockDistributionCenters,
    mockCycleInfo,
} from './data';
import { useUser } from './hooks';
import { IconGitFork, IconCheckCircle, IconTruck, IconMapPin, IconPlus, IconLock, IconBuilding2, IconShoppingCart, IconWhatsapp, IconMinus, IconTrash, IconChevronLeft, IconWallet, IconReceipt, IconHandCoins, IconFileClock } from '../icons';
import type { CDProduct } from './types';

const formatCurrency = (value: number | string | null | undefined): string => {
    if (value == null || value === '') {
        return 'R$ 0,00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

type DistributionCenter = typeof mockDistributionCenters[0];
interface CartItem extends CDProduct {
  quantity: number;
}


const DetailedCycleCard: React.FC<{ cycle: any }> = ({ cycle }) => {
    const progress = (cycle.peopleCompleted / cycle.peopleTarget) * 100;

    let statusIcon, statusText, statusColor, borderColor;
    switch (cycle.status) {
        case 'completed':
            statusIcon = <IconCheckCircle size={28} className="text-green-400"/>;
            statusText = 'Concluído';
            statusColor = 'text-green-400';
            borderColor = 'border-brand-gold bg-brand-gold/10';
            break;
        case 'in_progress':
            statusIcon = <IconFileClock size={28} className="text-yellow-400"/>;
            statusText = 'Em Andamento';
            statusColor = 'text-yellow-400';
            borderColor = 'border-yellow-400 animate-pulse-gold';
            break;
        default:
            statusIcon = <IconLock size={28} className="text-gray-500"/>;
            statusText = 'Bloqueado';
            statusColor = 'text-gray-500';
            borderColor = 'border-brand-gray';
            break;
    }

    return (
        <div className={`aspect-square p-4 rounded-xl border-2 ${borderColor} flex flex-col text-center`}>
            <div className="flex-grow flex flex-col items-center justify-center">
                {statusIcon}
                <h4 className="font-bold text-white text-lg mt-2">Ciclo {cycle.cycleNumber}</h4>
                <span className={`text-sm font-semibold ${statusColor}`}>
                    {statusText}
                </span>
            </div>

            <div className="w-full mt-auto pt-3 border-t border-brand-gray-light/50 space-y-2">
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{cycle.peopleCompleted} / {cycle.peopleTarget}</span>
                    </div>
                    <div className="w-full bg-brand-gray h-2.5 rounded-full overflow-hidden">
                        <div className="bg-brand-gold h-full rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="w-full text-right">
                    <p className="text-xs text-gray-400">Ganhos do Ciclo</p>
                    <p className="font-semibold text-white">{formatCurrency(cycle.earnings)}</p>
                </div>
            </div>
        </div>
    );
};


const CicloGlobal: React.FC = () => {
  const { user, credits } = useUser();
  
  // State for manual activation flow
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedDistributionCenter, setSelectedDistributionCenter] = useState<DistributionCenter | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState('correios');
  
  // State for auto reinvestment flow
  const [isAutoReinvestActive, setIsAutoReinvestActive] = useState(false);
  const [autoReinvestConfig, setAutoReinvestConfig] = useState<{ product: CDProduct | null, shippingMethod: string, distributionCenter: DistributionCenter | null }>({ product: null, shippingMethod: 'correios', distributionCenter: null });
  const [isAutoConfigModalOpen, setIsAutoConfigModalOpen] = useState(false);
  const [autoConfigStep, setAutoConfigStep] = useState(1);
  const [tempSelectedProduct, setTempSelectedProduct] = useState<CDProduct | null>(null);
  const [tempShippingMethod, setTempShippingMethod] = useState('correios');
  const [tempSelectedDistributionCenter, setTempSelectedDistributionCenter] = useState<DistributionCenter | null>(null);

  const walletBalance = credits;

    // Cart Management
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

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const { subtotal, shippingCost, total } = useMemo(() => {
    const sub = cart.reduce((acc, item) => {
        const discountedPrice = item.fullPrice * (1 - item.discount / 100);
        return acc + (discountedPrice * item.quantity);
    }, 0);

    let ship = 0;
    if (sub > 0) {
        if (shippingMethod === 'correios') {
            ship = 15.00;
        } else if (shippingMethod === 'transportadora') {
            ship = 25.00;
        }
    }
    
    const tot = sub + ship;
    return { subtotal: sub, shippingCost: ship, total: tot };
  }, [cart, shippingMethod]);


  const resetManualModal = () => {
    setIsActivationModalOpen(false);
    setTimeout(() => { // Delay reset to allow modal to close smoothly
        setModalStep(1);
        setSelectedDistributionCenter(null);
        setCart([]);
        setShippingMethod('correios');
    }, 300);
  };
  
  // --- Auto Reinvestment Logic ---
  const handleAutoReinvestToggle = () => {
    if (!isAutoReinvestActive) { // If trying to turn ON
      if (!autoReinvestConfig.product || !autoReinvestConfig.distributionCenter) { // If not configured yet
        handleOpenAutoConfig(); // Open modal to start configuration
      } else {
        setIsAutoReinvestActive(true); // Already configured, just activate
      }
    } else { // If trying to turn OFF
      setIsAutoReinvestActive(false);
    }
  };

  const handleOpenAutoConfig = () => {
    setTempSelectedProduct(autoReinvestConfig.product);
    setTempShippingMethod(autoReinvestConfig.shippingMethod);
    setTempSelectedDistributionCenter(autoReinvestConfig.distributionCenter);
    setAutoConfigStep(autoReinvestConfig.distributionCenter ? 2 : 1);
    setIsAutoConfigModalOpen(true);
  };

  const resetAutoConfigModal = (open = false) => {
    setIsAutoConfigModalOpen(open);
    setAutoConfigStep(1);
    setTempSelectedProduct(null);
    setTempShippingMethod('correios');
    setTempSelectedDistributionCenter(null);
  };

  const handleSaveAutoConfig = () => {
    if (tempSelectedProduct && tempSelectedDistributionCenter) {
      setAutoReinvestConfig({
        product: tempSelectedProduct,
        shippingMethod: tempShippingMethod,
        distributionCenter: tempSelectedDistributionCenter,
      });
      setIsAutoReinvestActive(true);
      resetAutoConfigModal(false);
    }
  };

  // --- CD Sorting Logic ---
  const federalSede = mockDistributionCenters.find(cd => cd.isFederalSede);
  const regionalCDs = mockDistributionCenters
    .filter(cd => !cd.isFederalSede)
    .sort((a, b) => a.city.localeCompare(b.city));
  const sortedCDs = [federalSede, ...regionalCDs].filter((cd): cd is DistributionCenter => !!cd);


  // --- Modal Renderers ---
  const renderManualModalContent = () => {
    switch (modalStep) {
        case 1: // CD Selection
            return (
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Passo 1: Escolha o CD</h3>
                    <p className="text-sm text-gray-400">Selecione de onde seus produtos serão processados e enviados.</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {sortedCDs.map(cd => (
                            <div key={cd.id} className={`flex items-center justify-between p-3 bg-brand-gray-light rounded-lg transition-all hover:bg-brand-gray ${cd.isFederalSede ? 'border-2 border-brand-gold/50' : ''}`}>
                                <button onClick={() => { setSelectedDistributionCenter(cd); setModalStep(2); }} className="flex-grow text-left">
                                    <div className="flex items-center gap-4">
                                        <IconBuilding2 className="text-brand-gold flex-shrink-0" size={32} />
                                        <div>
                                            <p className={`font-semibold text-white ${cd.isFederalSede ? 'text-brand-gold' : ''}`}>{cd.name}</p>
                                            <p className="text-sm text-gray-400">{cd.city}</p>
                                        </div>
                                    </div>
                                </button>
                                <a href={`https://wa.me/${cd.whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-3 bg-green-500/10 rounded-full hover:bg-green-500/30 text-green-400 ml-4 flex-shrink-0" aria-label={`Contact ${cd.name} on WhatsApp`}>
                                    <IconWhatsapp size={24} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 2: // Product Selection (Shop View)
            const ShopView: React.FC<{ onAddToCart: (product: CDProduct, quantity: number) => void, onGoToCart: () => void }> = ({ onAddToCart, onGoToCart }) => {
                const [quantities, setQuantities] = useState<Record<string, number>>({});
                const [addedProductId, setAddedProductId] = useState<string | null>(null);

                const handleQuantityChange = (productId: string, delta: number) => {
                    setQuantities(prev => {
                        const currentQuantity = prev[productId] || 1;
                        const newQuantity = Math.max(1, currentQuantity + delta);
                        return { ...prev, [productId]: newQuantity };
                    });
                };

                const handleAddToCartClick = (product: CDProduct) => {
                    const quantity = quantities[product.id] || 1;
                    onAddToCart(product, quantity);
                    setAddedProductId(product.id);
                    setTimeout(() => setAddedProductId(null), 1500);
                };
                
                return (
                    <div className="flex flex-col h-full">
                         <h3 className="text-xl font-bold text-white mb-4">Passo 2: Escolha seus produtos</h3>
                        <div className="flex-grow space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {mockCDProducts.map(product => {
                                const discountedPrice = product.fullPrice * (1 - product.discount / 100);
                                const isJustAdded = addedProductId === product.id;
                                return (
                                    <div key={product.id} className="p-3 bg-brand-gray-light rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-white">{product.name}</p>
                                            <p className="text-lg font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border border-brand-gray rounded-md">
                                                <button onClick={() => handleQuantityChange(product.id, -1)} className="px-2 py-1 text-white hover:bg-brand-gray rounded-l-md"><IconMinus size={14} /></button>
                                                <span className="px-3 py-1 text-sm font-bold">{quantities[product.id] || 1}</span>
                                                <button onClick={() => handleQuantityChange(product.id, 1)} className="px-2 py-1 text-white hover:bg-brand-gray rounded-r-md"><IconPlus size={14} /></button>
                                            </div>
                                            <button onClick={() => handleAddToCartClick(product)} className={`font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm ${isJustAdded ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                                                {isJustAdded ? <IconCheckCircle size={16} /> : <IconPlus size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                         <div className="pt-4 mt-4 border-t border-brand-gray-light flex justify-between items-center">
                            <button onClick={() => setModalStep(1)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar para CDs</button>
                            <button onClick={onGoToCart} disabled={cart.length === 0} className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 disabled:bg-brand-gray disabled:cursor-not-allowed flex items-center gap-2">
                                <IconShoppingCart size={16}/>
                                Ver Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                            </button>
                        </div>
                    </div>
                );
            };
            return <ShopView onAddToCart={addToCart} onGoToCart={() => setModalStep(3)} />;
        case 3: // Cart Review
             return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Passo 3: Revisão do Carrinho e Entrega</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                         {cart.length > 0 ? cart.map(item => {
                             const discountedPrice = item.fullPrice * (1 - item.discount / 100);
                             return (
                                <div key={item.id} className="flex items-center justify-between pb-3 border-b border-brand-gray-light last:border-b-0">
                                    <div>
                                        <p className="font-semibold text-white text-sm">{item.name}</p>
                                        <p className="text-xs text-brand-gold">{formatCurrency(discountedPrice)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center border border-brand-gray rounded-md">
                                            <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-2 py-1"><IconMinus size={14} /></button>
                                            <span className="px-3 py-1 text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-2 py-1"><IconPlus size={14} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1"><IconTrash size={16} /></button>
                                    </div>
                                </div>
                             )
                        }) : <p className="text-center text-gray-400 py-4">Seu carrinho está vazio.</p>}
                    </div>
                    {/* Shipping */}
                    <div className="space-y-2 pt-4 border-t border-brand-gray-light">
                        <h4 className="font-semibold text-white">Método de Entrega</h4>
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${shippingMethod === 'correios' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <input type="radio" name="shipping" value="correios" checked={shippingMethod === 'correios'} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                            <IconTruck className="mx-3" />
                            <span className="font-semibold">Receber via Correios ({formatCurrency(15.00)})</span>
                        </label>
                         <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${shippingMethod === 'transportadora' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <input type="radio" name="shipping" value="transportadora" checked={shippingMethod === 'transportadora'} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                            <IconTruck className="mx-3" />
                            <span className="font-semibold">Receber via Transportadora ({formatCurrency(25.00)})</span>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${shippingMethod === 'pickup' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <input type="radio" name="shipping" value="pickup" checked={shippingMethod === 'pickup'} onChange={(e) => setShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                            <IconMapPin className="mx-3" />
                            <span className="font-semibold">Retirar no CD (Grátis)</span>
                        </label>
                    </div>
                    {/* Totals and Actions */}
                    <div className="pt-4 border-t border-brand-gray-light">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Subtotal:</span> <span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Frete:</span> <span className="font-semibold">{formatCurrency(shippingCost)}</span></div>
                            <div className="flex justify-between text-lg"><span className="text-white font-bold">Total:</span> <span className="font-extrabold text-brand-gold">{formatCurrency(total)}</span></div>
                        </div>
                        <div className="pt-4 mt-4 flex justify-between items-center">
                            <button onClick={() => setModalStep(2)} className="text-sm text-gray-400 hover:text-white">&larr; Continuar Comprando</button>
                            <button onClick={() => setModalStep(4)} disabled={cart.length === 0} className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 disabled:bg-brand-gray disabled:cursor-not-allowed">Finalizar Compra</button>
                        </div>
                    </div>
                </div>
            );
        case 4: // Confirmation
            return (
                <div className="space-y-4">
                    <button onClick={() => setModalStep(3)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar</button>
                    <h3 className="text-xl font-bold text-white">Passo 4: Confirmação e Pagamento</h3>
                    <div className="p-4 bg-brand-gray-light rounded-lg space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">CD:</span> <span className="font-semibold">{selectedDistributionCenter?.name}</span></div>
                        <div className="text-sm"><p className="text-gray-400 mb-1">Itens:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                {cart.map(item => <li key={item.id} className="text-white">{item.quantity}x {item.name}</li>)}
                            </ul>
                        </div>
                        <div className="flex justify-between text-sm pt-2 mt-2 border-t border-brand-gray"><span className="text-gray-400">Frete:</span> <span className="font-semibold">{formatCurrency(shippingCost)}</span></div>
                        <div className="flex justify-between text-lg border-t border-brand-gray pt-2 mt-2"><span className="text-white font-bold">Total:</span> <span className="font-extrabold text-brand-gold">{formatCurrency(total)}</span></div>
                    </div>
                    <div className="space-y-3 mt-4">
                         <button onClick={() => setModalStep(5)} disabled={walletBalance < total} className="w-full flex items-center justify-center gap-2 bg-brand-gray-light text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-gray disabled:bg-brand-gray-light/50 disabled:cursor-not-allowed transition-colors"><IconWallet/>Pagar com Saldo ({formatCurrency(walletBalance)})</button>
                         <button onClick={() => setModalStep(5)} className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors"><IconReceipt/>Pagar com PIX / Outros</button>
                    </div>
                </div>
            );
        case 5: // Success
            return (
                 <div className="text-center space-y-4 py-8">
                    <IconCheckCircle size={48} className="mx-auto text-green-400" />
                    <h3 className="text-2xl font-bold text-white">Ativação Concluída!</h3>
                    <p className="text-gray-300">Você entrou no próximo ciclo com sucesso. Acompanhe sua rede pela árvore interativa.</p>
                    <button onClick={resetManualModal} className="w-full bg-brand-gray-light font-semibold py-2 px-4 rounded-lg hover:bg-brand-gray mt-4">Fechar</button>
                </div>
            );
        default: return null;
    }
  };

  const renderAutoConfigModalContent = () => {
    switch (autoConfigStep) {
        case 1: // CD Selection
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Passo 1: Escolha o CD</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                         {sortedCDs.map(cd => (
                            <div key={cd.id} className={`flex items-center justify-between p-3 bg-brand-gray-light rounded-lg transition-all hover:bg-brand-gray ${cd.isFederalSede ? 'border-2 border-brand-gold/50' : ''}`}>
                                <button onClick={() => { setTempSelectedDistributionCenter(cd); setAutoConfigStep(2); }} className="flex-grow text-left">
                                    <div className="flex items-center gap-4">
                                        <IconBuilding2 className="text-brand-gold flex-shrink-0" size={32} />
                                        <div>
                                            <p className={`font-semibold text-white ${cd.isFederalSede ? 'text-brand-gold' : ''}`}>{cd.name}</p>
                                            <p className="text-sm text-gray-400">{cd.city}</p>
                                        </div>
                                    </div>
                                </button>
                                <a href={`https://wa.me/${cd.whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-3 bg-green-500/10 rounded-full hover:bg-green-500/30 text-green-400 ml-4 flex-shrink-0" aria-label={`Contact ${cd.name} on WhatsApp`}>
                                    <IconWhatsapp size={24} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 2: // Product Selection
            return (
                <div className="space-y-4">
                     <button onClick={() => setAutoConfigStep(1)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar para CDs</button>
                    <h3 className="text-xl font-bold text-white">Passo 2: Escolha o produto para ativação</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {mockCDProducts.map(product => {
                            const discountedPrice = product.fullPrice * (1 - product.discount / 100);
                            const isSelected = tempSelectedProduct?.id === product.id;
                            return (
                                <button key={product.id} onClick={() => setTempSelectedProduct(product)} className={`w-full text-left p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gray border-2 transition-all ${isSelected ? 'border-brand-gold' : 'border-transparent'}`}>
                                    <p className="font-semibold text-white">{product.name}</p>
                                    <p className="text-lg font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                                </button>
                            );
                        })}
                    </div>
                     <button onClick={() => { if(tempSelectedProduct) setAutoConfigStep(3); }} disabled={!tempSelectedProduct} className="w-full bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 mt-4 disabled:bg-brand-gray disabled:cursor-not-allowed">Continuar</button>
                </div>
            );
        case 3: // Shipping Selection
            return (
                 <div className="space-y-4">
                    <button onClick={() => setAutoConfigStep(2)} className="text-sm text-gray-400 hover:text-white">&larr; Voltar para Produtos</button>
                    <h3 className="text-xl font-bold text-white">Passo 3: Defina a entrega</h3>
                    <div className="space-y-2">
                         <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${tempShippingMethod === 'correios' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <input type="radio" name="tempShipping" value="correios" checked={tempShippingMethod === 'correios'} onChange={(e) => setTempShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                            <IconTruck className="mx-3" />
                            <span className="font-semibold">Correios ({formatCurrency(15.00)})</span>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${tempShippingMethod === 'transportadora' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <input type="radio" name="tempShipping" value="transportadora" checked={tempShippingMethod === 'transportadora'} onChange={(e) => setTempShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                            <IconTruck className="mx-3" />
                            <span className="font-semibold">Transportadora ({formatCurrency(25.00)})</span>
                        </label>
                        <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${tempShippingMethod === 'pickup' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gray'}`}>
                            <input type="radio" name="tempShipping" value="pickup" checked={tempShippingMethod === 'pickup'} onChange={(e) => setTempShippingMethod(e.target.value)} className="form-radio text-brand-gold bg-brand-gray"/>
                            <IconMapPin className="mx-3" />
                            <span className="font-semibold">Retirar no Centro de Distribuição (Grátis)</span>
                        </label>
                    </div>
                    <button onClick={handleSaveAutoConfig} className="w-full bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 mt-4">Salvar Configuração e Ativar</button>
                </div>
            );
        default: return null;
    }
  };

  const totalAcumulado = useMemo(() => mockCycleSummary.reduce((acc, summary) => acc + summary.bonus, 0), []);
  const totalCiclosConcluidos = useMemo(() => mockCycleSummary.reduce((acc, summary) => acc + summary.completed, 0), []);

  const cycleGlobalData = useMemo(() => {
    const nextCycleIndex = mockCycleSummary.findIndex(s => s.completed === 0);

    return mockCycleSummary.map((summary, index) => {
        const isCompleted = summary.completed > 0;
        const isNext = nextCycleIndex !== -1 && index === nextCycleIndex;

        let status: 'completed' | 'in_progress' | 'locked' = 'locked';
        let peopleCompleted = 0;
        const peopleTarget = 6;

        if (isCompleted) {
            status = 'completed';
            peopleCompleted = peopleTarget;
        } else if (isNext) {
            status = 'in_progress';
            // Find first incomplete cycle from mockCycleInfo to get a realistic progress value
            const progressInfo = mockCycleInfo.find(c => !c.completed);
            peopleCompleted = progressInfo ? progressInfo.participants.length : 3; // Fallback to 3/6
        }

        return {
            cycleNumber: parseInt(summary.level),
            peopleCompleted,
            peopleTarget,
            status,
            earnings: summary.bonus,
        };
    });
  }, []);

  const nextOpportunityCycle = useMemo(() => {
    return cycleGlobalData.find(c => c.status === 'in_progress');
  }, [cycleGlobalData]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-gold">Bônus Matriz SIGME</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-center space-x-4">
            <div className="p-3 bg-brand-gray-light rounded-full">
                <IconHandCoins size={24} className="text-brand-gold" />
            </div>
            <div>
                <h4 className="text-sm text-brand-text-dim">Ganhos Acumulados</h4>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAcumulado)}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <div className="p-3 bg-brand-gray-light rounded-full">
                <IconGitFork size={24} className="text-brand-gold" />
            </div>
            <div>
                <h4 className="text-sm text-brand-text-dim">Ciclos Concluídos</h4>
                <p className="text-2xl font-bold text-white">{totalCiclosConcluidos}</p>
            </div>
        </Card>
      </div>

      <Card>
          <h2 className="text-xl font-bold text-white mb-4">Ativação para o Próximo Ciclo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Painel Automático */}
              <Card className="bg-brand-gray-light p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2">Ativação Automática</h3>
                  <p className="text-sm text-gray-400 mb-4 flex-grow">Configure a ativação automática para entrar no próximo ciclo usando seu saldo em carteira.</p>
                  
                  <div className="space-y-4">
                    <label htmlFor="auto-reinvest-toggle" className="flex items-center justify-between cursor-pointer p-3 bg-brand-gray rounded-lg">
                        <span className="font-semibold text-white">Reinvestimento automático</span>
                        <div className="relative">
                            <input type="checkbox" id="auto-reinvest-toggle" className="sr-only peer" checked={isAutoReinvestActive} onChange={handleAutoReinvestToggle} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                        </div>
                    </label>
                     {isAutoReinvestActive && autoReinvestConfig.product && autoReinvestConfig.distributionCenter && (
                        <div className="text-xs text-gray-400 bg-brand-gray p-2 rounded-md space-y-1">
                            <p>CD: <span className="font-semibold text-gray-300">{autoReinvestConfig.distributionCenter.name}</span></p>
                            <p>Produto: <span className="font-semibold text-gray-300">{autoReinvestConfig.product.name}</span></p>
                        </div>
                    )}
                    <button onClick={handleOpenAutoConfig} className="w-full bg-brand-gray text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm">
                        Configurar
                    </button>
                  </div>
              </Card>

              {/* Painel Manual */}
              <Card className="bg-brand-gray-light p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2">Ativação Manual</h3>
                  <p className="text-sm text-gray-400 mb-4 flex-grow">Ative manualmente comprando produtos. Você poderá pagar com saldo ou outros meios.</p>
                  <button 
                    onClick={() => setIsActivationModalOpen(true)}
                    className="w-full bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Ativar Manualmente
                  </button>
              </Card>
          </div>
      </Card>
      
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
            <div className="flex items-center gap-6 text-center md:text-left">
                <IconGitFork size={40} className="text-brand-gold flex-shrink-0" />
                <div>
                    <h2 className="text-xl font-bold text-white">Estrutura do Ciclo Atual</h2>
                    <p className="text-gray-400 mt-1 max-w-md">Visualize sua rede de 6 indicados do ciclo atual para acompanhar seu progresso de fechamento.</p>
                </div>
            </div>
            <Link 
                to="/consultant/sigme/arvore-interativa/ciclo-global" 
                className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
            >
                Abrir Árvore Interativa
            </Link>
        </div>
      </Card>
      
      {nextOpportunityCycle && (
        <Card>
            <h2 className="text-xl font-bold text-white mb-4">Sua Próxima Oportunidade de Bônus</h2>
            <div className="max-w-xs mx-auto">
                <DetailedCycleCard cycle={nextOpportunityCycle} />
            </div>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Sua Jornada de Ciclos</h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cycleGlobalData.map((cycleData) => (
                <DetailedCycleCard key={cycleData.cycleNumber} cycle={cycleData} />
            ))}
        </div>
      </div>

       <Modal isOpen={isActivationModalOpen} onClose={resetManualModal} title="Ativação Manual de Ciclo">
        {renderManualModalContent()}
      </Modal>

      <Modal isOpen={isAutoConfigModalOpen} onClose={() => resetAutoConfigModal()} title="Configurar Ativação Automática">
        {renderAutoConfigModalContent()}
      </Modal>

      <style>{`
            @keyframes pulse-gold {
              0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); border-color: rgba(255, 215, 0, 0.4); }
              50% { box-shadow: 0 0 15px 8px rgba(255, 215, 0, 0); border-color: rgba(255, 215, 0, 0.8); }
            }
            .animate-pulse-gold { animation: pulse-gold 2.5s infinite; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

            .form-radio, .form-checkbox { appearance: none; -webkit-appearance: none; -moz-appearance: none; width: 1.25rem; height: 1.25rem; border: 2px solid #4a5563; border-radius: 50%; display: inline-block; vertical-align: middle; position: relative; cursor: pointer; }
            .form-checkbox { border-radius: 0.25rem; }
            .form-radio:checked, .form-checkbox:checked { background-color: #ffd700; border-color: #ffd700; }
            .form-radio:checked::after { content: ''; display: block; width: 0.625rem; height: 0.625rem; background: #121212; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .form-checkbox:checked::after { content: '✓'; display: block; font-size: 1rem; line-height: 1.25rem; font-weight: bold; color: #121212; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        `}</style>
    </div>
  );
};

export default CicloGlobal;