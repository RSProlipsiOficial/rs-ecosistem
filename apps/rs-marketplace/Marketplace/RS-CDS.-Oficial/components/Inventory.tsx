

import React, { useState, useEffect } from 'react';
import { Product, PaymentMethod } from '../types';
import { AlertTriangle, CheckCircle, Package, Edit, Plus, Search, Trash2, X, Send, ShoppingCart, FileText, Save, Lock, ArrowLeft, CreditCard, Wallet, QrCode, Banknote, Truck, MapPin, Zap, Copy, Check, Smartphone, Barcode, Calendar } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  walletBalance: number;
}

interface RequestItem {
  product: Product;
  quantity: number;
}

interface PaymentEntry {
  id: string;
  method: PaymentMethod;
  amount: number;
}

type ShippingOption = 'PICKUP' | 'STANDARD' | 'EXPRESS';

const Inventory: React.FC<InventoryProps> = ({ products: initialProducts, walletBalance }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  // Payment Interaction Modals
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState<number>(0);
  
  // Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Request Form State
  const [requestCart, setRequestCart] = useState<RequestItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [requestQuantity, setRequestQuantity] = useState<number>(1);
  const [requestStep, setRequestStep] = useState<'CART' | 'CHECKOUT'>('CART');
  
  // Checkout State (Shipping & Payment)
  const [shippingOption, setShippingOption] = useState<ShippingOption>('PICKUP');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod>('PIX');
  const [amountToAdd, setAmountToAdd] = useState<string>(''); // String to handle inputs better

  // Derived Totals
  const subtotal = requestCart.reduce((acc, item) => acc + (item.product.costPrice * item.quantity), 0);
  
  const getShippingCost = (subtotal: number, option: ShippingOption) => {
    if (option === 'PICKUP') return 0;
    if (option === 'STANDARD') return (subtotal * 0.05) + 45.00; // Mock calculation
    if (option === 'EXPRESS') return (subtotal * 0.10) + 80.00;
    return 0;
  };

  const shippingCost = getShippingCost(subtotal, shippingOption);
  const totalOrder = subtotal + shippingCost;
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingDue = Math.max(0, totalOrder - totalPaid);

  // Reset checkout state when opening/changing steps
  useEffect(() => {
    if (requestStep === 'CHECKOUT' && payments.length === 0) {
        // Auto-fill amount input with remaining total
        setAmountToAdd(totalOrder.toFixed(2));
    }
  }, [requestStep, totalOrder, payments.length]);

  // Update amount to add when shipping changes if no payments made yet
  useEffect(() => {
      if (payments.length === 0) {
          setAmountToAdd(totalOrder.toFixed(2));
      }
  }, [totalOrder]);


  // --- Handlers for Product Editing ---
  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      );
      
      const finalProducts = updatedProducts.map(p => ({
        ...p,
        status: p.stockLevel <= 0 ? 'CRITICO' : p.stockLevel <= p.minStock ? 'BAIXO' : 'OK'
      })) as Product[];

      setProducts(finalProducts);
      setIsEditModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleChange = (field: keyof Product, value: string | number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: value
      });
    }
  };

  // --- Handlers for Stock Request ---
  const handleAddToRequest = () => {
    if (!selectedProductId) return;
    
    const productToAdd = products.find(p => p.id === selectedProductId);
    if (productToAdd) {
      const existingItemIndex = requestCart.findIndex(item => item.product.id === selectedProductId);
      
      if (existingItemIndex >= 0) {
        const newCart = [...requestCart];
        newCart[existingItemIndex].quantity += requestQuantity;
        setRequestCart(newCart);
      } else {
        setRequestCart([...requestCart, { product: productToAdd, quantity: requestQuantity }]);
      }
      
      setSelectedProductId('');
      setRequestQuantity(1);
    }
  };

  const handleRemoveFromRequest = (index: number) => {
    const newCart = [...requestCart];
    newCart.splice(index, 1);
    setRequestCart(newCart);
  };

  const handleProceedToCheckout = () => {
    if (requestCart.length === 0) return;
    setRequestStep('CHECKOUT');
    setPayments([]); // Reset payments on new checkout attempt
    setShippingOption('PICKUP');
  };

  // --- Payment Handlers ---
  const initiateAddPayment = () => {
    const val = parseFloat(amountToAdd);
    if (isNaN(val) || val <= 0) return;
    
    // Tolerance for float precision issues
    if (val > remainingDue + 0.05) { 
        alert(`O valor não pode exceder o restante a pagar (R$ ${remainingDue.toFixed(2)})`);
        return;
    }

    if (currentMethod === 'WALLET' && walletBalance < val) {
        alert("Saldo insuficiente na carteira.");
        return;
    }

    // Intercept specific methods for interaction
    if (currentMethod === 'PIX') {
        setPendingPaymentAmount(val);
        setShowPixModal(true);
        return;
    }

    if (currentMethod === 'CREDIT_CARD') {
        setPendingPaymentAmount(val);
        setShowCardModal(true);
        return;
    }

    // Direct add for others (Wallet, Boleto, Cash)
    addPaymentEntry(currentMethod, val);
  };

  const addPaymentEntry = (method: PaymentMethod, amount: number) => {
    const newPayment: PaymentEntry = {
        id: Math.random().toString(36).substr(2, 9),
        method: method,
        amount: amount
    };

    setPayments([...payments, newPayment]);
    
    // Auto update next input to remaining
    const newRemaining = remainingDue - amount;
    setAmountToAdd(newRemaining > 0 ? newRemaining.toFixed(2) : '');
  };

  const handleRemovePayment = (id: string) => {
      const filtered = payments.filter(p => p.id !== id);
      setPayments(filtered);
      
      // Update amount input suggestion
      const currentPaid = filtered.reduce((acc, p) => acc + p.amount, 0);
      setAmountToAdd((totalOrder - currentPaid).toFixed(2));
  };

  const handleFinalizeOrder = () => {
    if (remainingDue > 0.01) {
        alert("Por favor, quite o valor total do pedido.");
        return;
    }

    // Process Update
    const updatedProducts = [...products];
    requestCart.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.product.id);
      if (productIndex >= 0) {
        updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            stockLevel: updatedProducts[productIndex].stockLevel + item.quantity,
            status: (updatedProducts[productIndex].stockLevel + item.quantity) <= updatedProducts[productIndex].minStock ? 'BAIXO' : 'OK'
        };
      }
    });
    setProducts(updatedProducts);

    // Reset
    setRequestCart([]);
    setPayments([]);
    setIsRequestModalOpen(false);
    setRequestStep('CART');
  };

  const getStatusBadge = (status: string, stock: number, min: number) => {
    if (stock <= 0) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-900/30 text-red-500 border border-red-800"><AlertTriangle size={12} /> Esgotado</span>;
    if (stock <= min) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-500 border border-yellow-800"><AlertTriangle size={12} /> Baixo</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-900/30 text-green-500 border border-green-800"><CheckCircle size={12} /> Normal</span>;
  };

  const getPaymentIcon = (method: PaymentMethod) => {
      switch(method) {
          case 'WALLET': return <Wallet size={16} />;
          case 'PIX': return <QrCode size={16} />;
          case 'CREDIT_CARD': return <CreditCard size={16} />;
          case 'BOLETO': return <FileText size={16} />;
          case 'CASH': return <Banknote size={16} />;
      }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="text-gold-400" />
                Controle de Estoque (CD)
            </h2>
            <p className="text-gray-400 text-sm">Gerencie inventário, lotes e reposição.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar SKU ou Produto..." 
                    className="bg-dark-900 border border-dark-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-gold-400 w-full text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => { setIsRequestModalOpen(true); setRequestStep('CART'); }}
                className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-gold-500/20"
            >
                <ShoppingCart size={16} />
                Solicitar à Central
            </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-dark-800 text-gray-200 uppercase font-bold text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4 text-center">Nível Estoque</th>
                        <th className="px-6 py-4 text-right">Custo CD</th>
                        <th className="px-6 py-4 text-right text-blue-400">Pontos (VP)</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                    {filteredProducts.map(product => {
                        return (
                            <tr key={product.id} className="hover:bg-dark-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-white font-bold">{product.name}</p>
                                        <p className="text-xs text-gray-600 font-mono">{product.sku}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-dark-950 px-2 py-1 rounded border border-dark-800 text-xs">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-base font-bold ${product.stockLevel <= product.minStock ? 'text-red-400' : 'text-white'}`}>
                                            {product.stockLevel}
                                        </span>
                                        <span className="text-[10px] text-gray-600">Mínimo: {product.minStock}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-300 font-medium">
                                    R$ {product.costPrice.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-blue-400">
                                    {product.points} VP
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {getStatusBadge(product.status, product.stockLevel, product.minStock)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleEditClick(product)}
                                        className="p-2 hover:bg-dark-700 rounded text-gray-400 hover:text-white transition-colors" 
                                        title="Detalhes do Produto"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL 1: VIEW / ALERT CONFIG PRODUCT --- */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Edit size={20} className="text-gold-400" />
                    Detalhes do Produto
                </h3>
                <p className="text-sm text-gray-500 mb-6 font-mono">{editingProduct.sku}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                disabled
                                className="w-full bg-dark-950/50 border border-dark-800 text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed"
                                value={editingProduct.name}
                            />
                            <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pontos (VP)</label>
                            <input 
                                type="number" 
                                disabled
                                className="w-full bg-blue-900/10 border border-blue-900/30 text-blue-400 font-bold rounded-lg px-4 py-2 cursor-not-allowed"
                                value={editingProduct.points}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço Venda (R$)</label>
                            <input 
                                type="number" 
                                disabled
                                className="w-full bg-dark-950/50 border border-dark-800 text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed"
                                value={editingProduct.price}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-dark-950 rounded-xl border border-dark-800">
                        <h4 className="text-sm text-white font-bold mb-3 border-b border-dark-800 pb-2">Configuração de Estoque</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantidade Física</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        disabled
                                        className="w-full bg-dark-900 border border-dark-700 text-center text-white font-bold rounded-lg py-2 outline-none cursor-not-allowed opacity-70"
                                        value={editingProduct.stockLevel}
                                    />
                                    <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alerta Mínimo</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg px-4 py-2 focus:border-gold-400 outline-none"
                                    value={editingProduct.minStock}
                                    onChange={(e) => handleChange('minStock', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BATCH CONTROL SECTION */}
                    <div className="p-4 bg-dark-950 rounded-xl border border-dark-800">
                        <h4 className="text-sm text-white font-bold mb-3 border-b border-dark-800 pb-2 flex items-center gap-2">
                           <Barcode size={16} className="text-gray-400"/> Lotes & Validade (FEFO)
                        </h4>
                        
                        {!editingProduct.batches || editingProduct.batches.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">Nenhum lote registrado.</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 text-[10px] text-gray-500 uppercase font-bold px-2">
                                    <span>Lote</span>
                                    <span>Validade</span>
                                    <span className="text-right">Qtd</span>
                                </div>
                                {editingProduct.batches.map((batch) => (
                                    <div key={batch.id} className="grid grid-cols-3 text-xs items-center bg-dark-900 p-2 rounded border border-dark-800">
                                        <span className="text-white font-mono">{batch.code}</span>
                                        <span className={`flex items-center gap-1 ${new Date(batch.expirationDate) < new Date() ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                                            <Calendar size={10} />
                                            {batch.expirationDate.split('-').reverse().join('/')}
                                        </span>
                                        <span className="text-right text-gold-400 font-bold">{batch.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-gray-600 mt-2 text-center">Gestão detalhada de lotes disponível na entrada de Nota Fiscal.</p>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 px-4 py-3 rounded-xl border border-dark-700 text-gray-300 font-medium hover:bg-dark-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveProduct}
                        className="flex-1 px-4 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20 flex justify-center items-center gap-2"
                    >
                        <Save size={18} />
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: REQUEST TO CENTRAL (PURCHASE ORDER) --- */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[95vh] h-[600px]">
                
                {/* Left Side: Steps */}
                <div className="flex-1 p-6 border-r border-dark-800 overflow-y-auto bg-dark-900 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {requestStep === 'CART' ? <ShoppingCart size={24} className="text-gold-400" /> : <Truck size={24} className="text-gold-400" />}
                            {requestStep === 'CART' ? 'Montar Pedido' : 'Frete e Pagamento'}
                        </h3>
                        <div className="flex gap-2">
                             <div className={`w-3 h-3 rounded-full ${requestStep === 'CART' ? 'bg-gold-500' : 'bg-dark-700'}`}></div>
                             <div className={`w-3 h-3 rounded-full ${requestStep === 'CHECKOUT' ? 'bg-gold-500' : 'bg-dark-700'}`}></div>
                        </div>
                    </div>

                    {requestStep === 'CART' ? (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-dark-950 p-5 rounded-xl border border-dark-800">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Selecione os Produtos</label>
                                <div className="flex flex-col gap-3">
                                    <select 
                                        className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg px-4 py-3 outline-none focus:border-gold-400"
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                    >
                                        <option value="">Selecione um produto da lista...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.sku} - {p.name} (Custo: R$ {p.costPrice.toFixed(2)})</option>
                                        ))}
                                    </select>
                                    
                                    <div className="flex gap-3">
                                        <div className="w-1/3">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg px-4 py-3 outline-none focus:border-gold-400 font-bold text-center"
                                                value={requestQuantity}
                                                onChange={(e) => setRequestQuantity(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleAddToRequest}
                                            disabled={!selectedProductId}
                                            className="flex-1 bg-dark-800 hover:bg-dark-700 text-gold-400 border border-gold-500/30 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} />
                                            Adicionar Item
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 bg-dark-950/50 p-4 rounded-lg border border-dark-800/50">
                                <p className="mb-2 uppercase font-bold text-gold-500/80 flex items-center gap-2"><Lock size={12}/> Regras de Compra:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Preços com <strong>15.2% de desconto</strong> para reposição de CD.</li>
                                    <li>Valores calculados sobre tabela base de custo.</li>
                                    <li>Atualização imediata de estoque após confirmação financeira.</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6">
                            {/* 1. Shipping Selection */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">1. Modalidade de Envio</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingOption === 'PICKUP' ? 'bg-gold-500/10 border-gold-500' : 'bg-dark-950 border-dark-800'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="shipping" className="hidden" checked={shippingOption === 'PICKUP'} onChange={() => setShippingOption('PICKUP')} />
                                            <MapPin size={20} className={shippingOption === 'PICKUP' ? 'text-gold-400' : 'text-gray-500'} />
                                            <div>
                                                <span className="block text-white font-medium text-sm">Retirada na Fábrica</span>
                                                <span className="text-xs text-gray-500">Disponível em 24h</span>
                                            </div>
                                        </div>
                                        <span className="text-green-500 font-bold text-sm">Grátis</span>
                                    </label>

                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingOption === 'STANDARD' ? 'bg-gold-500/10 border-gold-500' : 'bg-dark-950 border-dark-800'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="shipping" className="hidden" checked={shippingOption === 'STANDARD'} onChange={() => setShippingOption('STANDARD')} />
                                            <Truck size={20} className={shippingOption === 'STANDARD' ? 'text-gold-400' : 'text-gray-500'} />
                                            <div>
                                                <span className="block text-white font-medium text-sm">Transportadora Padrão</span>
                                                <span className="text-xs text-gray-500">3 a 5 dias úteis</span>
                                            </div>
                                        </div>
                                        <span className="text-white font-bold text-sm">R$ {getShippingCost(subtotal, 'STANDARD').toFixed(2)}</span>
                                    </label>

                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingOption === 'EXPRESS' ? 'bg-gold-500/10 border-gold-500' : 'bg-dark-950 border-dark-800'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="shipping" className="hidden" checked={shippingOption === 'EXPRESS'} onChange={() => setShippingOption('EXPRESS')} />
                                            <Zap size={20} className={shippingOption === 'EXPRESS' ? 'text-gold-400' : 'text-gray-500'} />
                                            <div>
                                                <span className="block text-white font-medium text-sm">Entrega Expressa</span>
                                                <span className="text-xs text-gray-500">1 a 2 dias úteis</span>
                                            </div>
                                        </div>
                                        <span className="text-white font-bold text-sm">R$ {getShippingCost(subtotal, 'EXPRESS').toFixed(2)}</span>
                                    </label>
                                </div>
                            </div>

                            {/* 2. Payment Method Split */}
                            <div className="space-y-3 pt-4 border-t border-dark-800">
                                <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">2. Pagamento (Split)</h4>
                                
                                {remainingDue > 0.01 ? (
                                    <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                                        <div className="flex gap-2 mb-3">
                                            <select 
                                                className="flex-1 bg-dark-900 border border-dark-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
                                                value={currentMethod}
                                                onChange={(e) => setCurrentMethod(e.target.value as PaymentMethod)}
                                            >
                                                <option value="PIX">Pix</option>
                                                <option value="WALLET">Saldo em Carteira</option>
                                                <option value="CREDIT_CARD">Cartão de Crédito</option>
                                                <option value="BOLETO">Boleto</option>
                                                <option value="CASH">Dinheiro</option>
                                            </select>
                                            <input 
                                                type="number"
                                                className="w-24 bg-dark-900 border border-dark-700 text-white rounded-lg px-2 py-2 text-sm text-right outline-none"
                                                placeholder="0.00"
                                                value={amountToAdd}
                                                onChange={(e) => setAmountToAdd(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            onClick={initiateAddPayment}
                                            className="w-full bg-dark-800 hover:bg-dark-700 text-gold-400 font-bold py-2 rounded-lg text-sm border border-gold-500/20"
                                        >
                                            + Adicionar Pagamento
                                        </button>
                                        {currentMethod === 'WALLET' && (
                                            <p className="text-xs text-gray-500 mt-2 text-right">Saldo disponível: R$ {walletBalance.toFixed(2)}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-green-900/20 border border-green-800 p-4 rounded-xl flex items-center gap-3 text-green-500">
                                        <CheckCircle size={24} />
                                        <div>
                                            <p className="font-bold text-sm">Pagamento Completo</p>
                                            <p className="text-xs opacity-80">O valor total do pedido foi coberto.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* List of Payments */}
                                <div className="space-y-2 mt-2">
                                    {payments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center bg-dark-800/50 px-3 py-2 rounded border border-dark-800">
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                {getPaymentIcon(p.method)}
                                                <span>{p.method === 'WALLET' ? 'Saldo' : p.method === 'CREDIT_CARD' ? 'Cartão' : p.method}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-white text-sm">R$ {p.amount.toFixed(2)}</span>
                                                <button onClick={() => handleRemovePayment(p.id)} className="text-gray-500 hover:text-red-500"><X size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PIX MODAL (OVERLAY) */}
                    {showPixModal && (
                        <div className="absolute inset-0 bg-dark-950/95 z-10 flex flex-col items-center justify-center p-6 animate-fade-in">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <QrCode className="text-gold-400"/> Pagamento via Pix
                            </h4>
                            <div className="bg-white p-4 rounded-xl mb-6">
                                {/* Placeholder QR */}
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                                    <QrCode size={120} className="text-black" />
                                </div>
                            </div>
                            <div className="w-full max-w-sm">
                                <p className="text-xs text-gray-500 mb-1 text-center">Código Copia e Cola</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value="00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913RS PROLIPSI6008SAO PAULO62070503***6304E2CA"
                                        className="flex-1 bg-dark-800 border border-dark-700 rounded px-3 py-2 text-xs text-gray-400"
                                    />
                                    <button className="bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded px-3 text-gold-400">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3 w-full max-w-xs">
                                <button 
                                    onClick={() => setShowPixModal(false)}
                                    className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => {
                                        addPaymentEntry('PIX', pendingPaymentAmount);
                                        setShowPixModal(false);
                                    }}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm"
                                >
                                    Já paguei
                                </button>
                            </div>
                        </div>
                    )}

                     {/* CARD MODAL (OVERLAY) */}
                     {showCardModal && (
                        <div className="absolute inset-0 bg-dark-950/95 z-10 flex flex-col items-center justify-center p-6 animate-fade-in">
                             <div className="w-full max-w-sm">
                                <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                    <CreditCard className="text-gold-400"/> Cartão de Crédito
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Número do Cartão</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Validade</label>
                                            <input type="text" placeholder="MM/AA" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold block mb-1">CVV</label>
                                            <input type="text" placeholder="123" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Nome no Cartão</label>
                                        <input type="text" placeholder="COMO NO CARTAO" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 outline-none" />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <button 
                                        onClick={() => setShowCardModal(false)}
                                        className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={() => {
                                            addPaymentEntry('CREDIT_CARD', pendingPaymentAmount);
                                            setShowCardModal(false);
                                        }}
                                        className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg text-sm"
                                    >
                                        Pagar R$ {pendingPaymentAmount.toFixed(2)}
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Summary */}
                <div className="w-full md:w-[350px] bg-dark-950 flex flex-col border-l border-dark-800">
                    <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50">
                        <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                            <FileText size={16} /> Resumo Financeiro
                        </h4>
                        <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-3 mb-6">
                            {requestCart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                    <div className="flex-1 pr-2">
                                        <p className="text-gray-300 truncate">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity}x R$ {item.product.costPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-white font-medium">R$ {(item.quantity * item.product.costPrice).toFixed(2)}</span>
                                        {requestStep === 'CART' && (
                                            <button onClick={() => handleRemoveFromRequest(idx)} className="text-red-500 hover:text-red-400 text-xs mt-1">Remover</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {requestCart.length === 0 && <p className="text-center text-gray-600 text-sm italic py-4">Nenhum item adicionado.</p>}
                        </div>

                        <div className="border-t border-dark-800 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal Produtos</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Frete ({shippingOption === 'PICKUP' ? 'Retirada' : shippingOption === 'STANDARD' ? 'Padrão' : 'Expresso'})</span>
                                <span>R$ {shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-dark-800 mt-2">
                                <span className="text-white font-bold">Total Geral</span>
                                <span className="text-xl font-bold text-gold-400">R$ {totalOrder.toFixed(2)}</span>
                            </div>

                            {requestStep === 'CHECKOUT' && (
                                <div className="mt-4 bg-dark-900 p-3 rounded-lg border border-dark-800">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-green-500">Pago</span>
                                        <span className="text-green-500">R$ {totalPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-sm">
                                        <span className="text-red-400">Restante</span>
                                        <span className="text-red-400">R$ {remainingDue.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-dark-900 border-t border-dark-800">
                        {requestStep === 'CART' ? (
                             <button 
                                onClick={handleProceedToCheckout}
                                disabled={requestCart.length === 0}
                                className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-gold-500/20 flex justify-center items-center gap-2 text-sm"
                            >
                                Definir Frete e Pagamento <Send size={16} />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setRequestStep('CART')}
                                    className="px-3 py-3 rounded-xl border border-dark-700 text-gray-300 hover:bg-dark-800"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button 
                                    onClick={handleFinalizeOrder}
                                    disabled={remainingDue > 0.01}
                                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-600/20 flex justify-center items-center gap-2 text-sm"
                                >
                                    <CheckCircle size={16} />
                                    Concluir Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
