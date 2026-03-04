

import React, { useState, useEffect } from 'react';
import { Product, PaymentMethod, CDProfile } from '../types';
import {
    AlertTriangle, CheckCircle, Package, Edit, Plus, Search, Trash2, X,
    Send, ShoppingCart, FileText, Save, Lock, ArrowLeft, CreditCard,
    Wallet, QrCode, Banknote, Truck, MapPin, Zap, Copy, Check,
    Smartphone, Barcode, Calendar, RefreshCw
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { shippingService, ShippingQuote } from '../services/shippingService';

interface InventoryProps {
    products: Product[];
    walletBalance: number;
    cdId?: string;
    profile?: CDProfile;
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

const Inventory: React.FC<InventoryProps> = ({ products: initialProducts, walletBalance, cdId, profile }) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Global Catalog State
    const [globalProducts, setGlobalProducts] = useState<Product[]>([]);
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isRequestModalOpen && globalProducts.length === 0) {
            const loadCatalog = async () => {
                setIsLoadingCatalog(true);
                const catalog = await dataService.getGlobalCatalog();
                setGlobalProducts(catalog);
                setIsLoadingCatalog(false);
            };
            loadCatalog();
        }
    }, [isRequestModalOpen, globalProducts.length]);

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

    // Reset quotes if cart changes to force recalculation
    useEffect(() => {
        setShippingQuotes([]);
    }, [requestCart]);

    // Checkout State (Shipping & Payment)
    const [shippingOption, setShippingOption] = useState<ShippingOption>('PICKUP');
    const [shippingQuotes, setShippingQuotes] = useState<any[]>([]);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [currentMethod, setCurrentMethod] = useState<PaymentMethod>('PIX');
    const [amountToAdd, setAmountToAdd] = useState<string>(''); // String to handle inputs better

    // Pix Generation & Proof states
    const [generatedPix, setGeneratedPix] = useState<{ qrCodeUrl: string; copyPaste: string; value: number } | null>(null);
    const [pixProofBase64, setPixProofBase64] = useState<string | null>(null);
    const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);
    const [isVerifyingPix, setIsVerifyingPix] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPixProofBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Derived Totals
    const subtotal = requestCart.reduce((acc, item) => acc + (item.product.costPrice * item.quantity), 0);

    const getShippingCost = (_subtotal: number, option: ShippingOption) => {
        if (option === 'PICKUP') return 0;
        const quote = shippingQuotes.find(q => q.service === option);
        return quote ? quote.price : 0;
    };

    const calculateRealShipping = async () => {
        if (!profile) return;
        setIsCalculatingShipping(true);

        try {
            const quotes = await shippingService.calculateShipping(profile, requestCart);
            setShippingQuotes(quotes);

            // Auto-select best option
            const hasPickup = quotes.some(q => q.service === 'PICKUP');
            if (hasPickup) setShippingOption('PICKUP');
            else setShippingOption('STANDARD');

        } catch (error) {
            console.error("Erro ao calcular frete:", error);
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    useEffect(() => {
        // Calcula frete sempre que entra no checkout com carrinho e perfil disponíveis
        if (requestStep === 'CHECKOUT' && requestCart.length > 0 && shippingQuotes.length === 0) {
            calculateRealShipping();
        }
    }, [requestStep, requestCart.length]);

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
    const handleFixInventory = async () => {
        if (!cdId) return;
        setIsSyncing(true);
        try {
            const result = await dataService.fixStockInconsistency(cdId);
            if (result.success) {
                if (result.fixedCount > 0) {
                    alert(`Sucesso! ${result.fixedCount} produtos foram restaurados no seu estoque.`);
                    window.dispatchEvent(new CustomEvent('refresh-cd-data'));
                } else {
                    alert('Nenhuma inconsistência encontrada. Seu estoque parece estar em dia.');
                }
            } else {
                alert('Erro ao tentar reparar o estoque.');
            }
        } catch (err) {
            console.error('Erro ao reparar estoque:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (editingProduct) {
            setIsSaving(true);
            try {
                const updatedProduct = {
                    ...editingProduct,
                    status: editingProduct.stockLevel <= 0 ? 'CRITICO' : (editingProduct.stockLevel <= editingProduct.minStock ? 'BAIXO' : 'OK')
                };

                // Persistir no banco
                const success = await dataService.updateStock(updatedProduct.id, updatedProduct.stockLevel, updatedProduct.minStock);

                if (success) {
                    const finalProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
                    setProducts(finalProducts);
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                } else {
                    alert('Erro ao salvar no banco de dados. Verifique sua conexão.');
                }
            } catch (err) {
                console.error('Erro ao salvar produto:', err);
            } finally {
                setIsSaving(false);
            }
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

        const productToAdd = globalProducts.find(p => p.id === selectedProductId);
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
        // Define WALLET as default if balance is available
        setCurrentMethod(walletBalance > 0 ? 'WALLET' : 'PIX');
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
            const generateRealPix = async () => {
                setPendingPaymentAmount(val);
                setIsSubmitting(true);

                const payer = {
                    email: profile?.email || 'financeiro@rsprolipsi.com.br',
                    first_name: profile?.name || 'Distribuidor',
                    last_name: 'RS Prólipsi',
                    identification: {
                        type: 'CPF',
                        number: profile?.document?.replace(/[^0-9]/g, '') || '19119119100'
                    }
                };

                const result = await dataService.generatePix(
                    val,
                    `Abastecimento CD - ${profile?.name || cdId}`,
                    payer
                );

                if (result && result.success) {
                    setGeneratedPix({
                        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(result.qr_code)}&bgcolor=FFFFFF&color=000000&qzone=1`,
                        copyPaste: result.qr_code,
                        value: val
                    });
                    setLastPaymentId(result.paymentId);
                    setShowPixModal(true);
                } else {
                    alert("Erro ao gerar PIX. Tente novamente ou use outra forma de pagamento.");
                }
                setIsSubmitting(false);
            };

            generateRealPix();
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

    const handleFinalizeOrder = async () => {
        if (remainingDue > 0.01) {
            alert("Por favor, quite o valor total do pedido.");
            return;
        }

        if (!cdId) {
            alert("Erro: ID do CD não encontrado. Atualize a página.");
            return;
        }

        setIsSubmitting(true);
        const orderId = await dataService.createReplenishmentOrder(cdId, requestCart, totalOrder, shippingOption);

        if (orderId) {
            // Upload proof silently
            const isAutoPaid = payments.some(p => p.method === 'PIX' || p.method === 'WALLET') && !pixProofBase64;
            if (pixProofBase64) {
                await dataService.uploadPaymentProof(orderId, pixProofBase64);
            } else if (isAutoPaid) {
                await dataService.uploadPaymentProof(orderId, 'CONFIRMADO_AUTOMATICAMENTE');
            }
            alert("Pedido de reposição enviado para a Sede central com sucesso!");
            setRequestCart([]);
            setPayments([]);
            setPixProofBase64(null);
            setIsRequestModalOpen(false);
            setRequestStep('CART');
        } else {
            alert("Falha ao enviar o pedido de abastecimento. Tente novamente.");
        }
        setIsSubmitting(false);
    };

    const getStatusBadge = (status: string, stock: number, min: number) => {
        if (stock <= 0) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-900/30 text-red-500 border border-red-800"><AlertTriangle size={12} /> Esgotado</span>;
        if (stock <= min) return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-900/30 text-yellow-500 border border-yellow-800"><AlertTriangle size={12} /> Baixo</span>;
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-900/30 text-green-500 border border-green-800"><CheckCircle size={12} /> Normal</span>;
    };

    const getPaymentIcon = (method: PaymentMethod) => {
        switch (method) {
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
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="text-gold-400" />
                        Controle de Estoque (CD)
                    </h2>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('refresh-cd-data'))}
                        className="p-2 text-gray-400 hover:text-gold-400 hover:bg-dark-800 rounded-full transition-colors"
                        title="Atualizar dados"
                    >
                        <RefreshCw size={18} />
                    </button>
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
                        onClick={handleFixInventory}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-gold-400 border border-gold-400/30 font-bold rounded-lg hover:bg-dark-700 transition-all"
                        title="Corrigir produtos que não apareceram após o pagamento"
                    >
                        {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Package size={18} />}
                        REPARAR ESTOQUE
                    </button>
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
                                <th className="px-6 py-4 text-center">Estoque Atual</th>
                                <th className="px-6 py-4 text-right">Custo Venda CD</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {filteredProducts.map(product => {
                                return (
                                    <tr key={product.id} className="hover:bg-dark-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg bg-dark-800 object-cover border border-dark-700 shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center border border-dark-700 shrink-0">
                                                        <Package size={20} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-white font-bold leading-tight">{product.name}</p>
                                                    <p className="text-xs text-gray-600 font-mono">{product.sku}</p>
                                                </div>
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
                                                <span className="text-[10px] text-gray-600">Alerta: {product.minStock}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-yellow-500 font-bold">
                                            R$ {product.price.toFixed(2)}
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

                        {/* Imagem do Produto no Modal */}
                        {editingProduct.imageUrl && (
                            <div className="mb-6 flex justify-center">
                                <img src={editingProduct.imageUrl} alt={editingProduct.name} className="h-32 object-contain rounded-lg border border-dark-800 bg-dark-950 p-2" />
                            </div>
                        )}

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

                            <div className="grid grid-cols-1 gap-4">
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
                                    <Barcode size={16} className="text-gray-400" /> Lotes & Validade (FEFO)
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

                        <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-dark-800">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-medium" disabled={isSaving}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={isSaving}
                                className="px-6 py-2 bg-gold-400 text-dark-900 font-bold rounded-lg hover:bg-gold-500 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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
                                                disabled={isLoadingCatalog}
                                            >
                                                <option value="">{isLoadingCatalog ? 'Carregando catálogo da Sede...' : 'Selecione um produto da lista...'}</option>
                                                {globalProducts.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} - Custo CD: R$ {p.costPrice.toFixed(2)}
                                                    </option>
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
                                        <p className="mb-2 uppercase font-bold text-gold-500/80 flex items-center gap-2"><Lock size={12} /> Regras de Compra:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Preços com <strong>50% + 15.2% de desconto</strong> para reposição de CD.</li>
                                            <li>O custo final do CD é de aproximadamente <strong>42.4% do valor de varejo</strong>.</li>
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
                                            {shippingQuotes.some(q => q.service === 'PICKUP') && (
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
                                            )}

                                            <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingOption === 'STANDARD' ? 'bg-gold-500/10 border-gold-500' : 'bg-dark-950 border-dark-800'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="shipping" className="hidden" checked={shippingOption === 'STANDARD'} onChange={() => { setShippingOption('STANDARD'); if (shippingQuotes.length === 0) calculateRealShipping(); }} />
                                                    <Truck size={20} className={shippingOption === 'STANDARD' ? 'text-gold-400' : 'text-gray-500'} />
                                                    <div>
                                                        <span className="block text-white font-medium text-sm">Transportadora Padrão (Melhor Envio)</span>
                                                        <span className="text-xs text-gray-500">{shippingQuotes.find(q => q.service === 'STANDARD')?.carrier || 'Jadlog'} • {shippingQuotes.find(q => q.service === 'STANDARD')?.delivery_time || 5} dias úteis</span>
                                                    </div>
                                                </div>
                                                <span className="text-white font-bold text-sm">
                                                    {isCalculatingShipping ? (
                                                        <span className="animate-pulse text-gold-400">Cotando...</span>
                                                    ) : (
                                                        shippingQuotes.length > 0
                                                            ? `R$ ${(shippingQuotes.find(q => q.service === 'STANDARD')?.price ?? 0).toFixed(2)}`
                                                            : '--'
                                                    )}
                                                </span>
                                            </label>

                                            <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingOption === 'EXPRESS' ? 'bg-gold-500/10 border-gold-500' : 'bg-dark-950 border-dark-800'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="shipping" className="hidden" checked={shippingOption === 'EXPRESS'} onChange={() => { setShippingOption('EXPRESS'); if (shippingQuotes.length === 0) calculateRealShipping(); }} />
                                                    <Zap size={20} className={shippingOption === 'EXPRESS' ? 'text-gold-400' : 'text-gray-500'} />
                                                    <div>
                                                        <span className="block text-white font-medium text-sm">Entrega Expressa</span>
                                                        <span className="text-xs text-gray-500">{shippingQuotes.find(q => q.service === 'EXPRESS')?.carrier || 'Sedex'} • {shippingQuotes.find(q => q.service === 'EXPRESS')?.delivery_time || 2} dias úteis</span>
                                                    </div>
                                                </div>
                                                <span className="text-white font-bold text-sm">
                                                    {isCalculatingShipping ? (
                                                        <span className="animate-pulse text-gold-400">Cotando...</span>
                                                    ) : (
                                                        shippingQuotes.length > 0
                                                            ? `R$ ${(shippingQuotes.find(q => q.service === 'EXPRESS')?.price ?? 0).toFixed(2)}`
                                                            : '--'
                                                    )}
                                                </span>
                                            </label>
                                        </div>
                                        {profile?.address?.cep && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-dark-950/50 rounded-lg border border-dark-800 mt-2">
                                                <MapPin size={14} className="text-gold-400" />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                                    Enviado para: <span className="text-gray-300">{profile.address.cep}</span> ({profile.address.city} - {profile.address.state})
                                                </span>
                                            </div>
                                        )}
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
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-gray-500">Saldo disponível: R$ {walletBalance.toFixed(2)}</p>
                                                        <button
                                                            onClick={() => setAmountToAdd(Math.min(walletBalance, remainingDue).toFixed(2))}
                                                            className="text-xs text-gold-400 hover:text-gold-300 underline font-bold"
                                                        >
                                                            Usar Saldo Disponível
                                                        </button>
                                                    </div>
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
                                                        <button onClick={() => handleRemovePayment(p.id)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PIX MODAL (OVERLAY) */}
                            {showPixModal && generatedPix && (
                                <div className="absolute inset-0 bg-dark-950/95 z-10 flex flex-col items-center justify-center p-6 animate-fade-in">
                                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                        <QrCode className="text-gold-400" /> Pagamento via Pix
                                    </h4>
                                    <div className="bg-white p-4 rounded-xl mb-4">
                                        <img src={generatedPix.qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
                                    </div>
                                    <div className="w-full max-w-sm">
                                        <p className="text-xs text-gray-500 mb-1 text-center">Código Copia e Cola (R$ {generatedPix.value.toFixed(2)})</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={generatedPix.copyPaste}
                                                className="flex-1 bg-dark-800 border border-dark-700 rounded px-3 py-2 text-xs text-gray-400"
                                            />
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(generatedPix.copyPaste); alert("Copiado!"); }}
                                                className="bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded px-3 text-gold-400">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-sm mt-4">
                                        <label className="text-xs text-gray-500 mb-1 text-center block">Anexar Comprovante do PIX gerado (Obrigatório para liberação)</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-dark-800 file:text-gold-400 hover:file:bg-dark-700"
                                        />
                                    </div>

                                    <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                                        <button
                                            onClick={async () => {
                                                if (!lastPaymentId) {
                                                    alert("ID de pagamento não encontrado. Tente gerar novamente.");
                                                    return;
                                                }
                                                setIsVerifyingPix(true);
                                                const check = await dataService.checkPixStatus(lastPaymentId);
                                                setIsVerifyingPix(false);

                                                if (check && check.isPaid) {
                                                    alert("✅ Pagamento confirmado com sucesso!");
                                                    addPaymentEntry('PIX', pendingPaymentAmount);
                                                    setShowPixModal(false);
                                                    setPixProofBase64(null); // Proof not needed if API confirmed
                                                } else {
                                                    alert("❌ Pagamento ainda não consta como visualizado no Mercado Pago. Aguarde alguns instantes ou anexe o comprovante manual.");
                                                }
                                            }}
                                            disabled={isVerifyingPix}
                                            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-900/30"
                                        >
                                            {isVerifyingPix ? <span className="animate-pulse">Verificando...</span> : <><CheckCircle size={20} /> Confirmar Pagamento Automático</>}
                                        </button>

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => { setShowPixModal(false); setPixProofBase64(null); }}
                                                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!pixProofBase64) {
                                                        alert("Caso o pagamento automático não funcione, você DEVE anexar o comprovante manual para prosseguir.");
                                                        return;
                                                    }
                                                    addPaymentEntry('PIX', pendingPaymentAmount);
                                                    setShowPixModal(false);
                                                }}
                                                className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-gray-300 font-bold rounded-lg text-sm"
                                            >
                                                Já paguei (Manual)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CARD MODAL (OVERLAY) */}
                            {showCardModal && (
                                <div className="absolute inset-0 bg-dark-950/95 z-10 flex flex-col items-center justify-center p-6 animate-fade-in">
                                    <div className="w-full max-w-sm">
                                        <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                            <CreditCard className="text-gold-400" /> Cartão de Crédito
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
                                            disabled={remainingDue > 0.01 || isSubmitting}
                                            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-600/20 flex justify-center items-center gap-2 text-sm"
                                        >
                                            <CheckCircle size={16} />
                                            {isSubmitting ? 'Enviando...' : 'Concluir Pedido'}
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
