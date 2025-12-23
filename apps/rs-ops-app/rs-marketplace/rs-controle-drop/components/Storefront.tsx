import React, { useState, useMemo, useEffect } from 'react';
import { Product, Order, Customer, Experiment, ExperimentDataPoint } from '../types';
import { VirtualAssistant } from './VirtualAssistant';
import { ShoppingBag, Bell, BellRing, ShoppingCart } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useCartCheckout } from '../contexts/CartCheckoutContext';
import { useNotifier } from '../contexts/NotificationContext';

interface StorefrontProps {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    experiments?: Experiment[];
    onAddExperimentData?: (dataPoints: ExperimentDataPoint[]) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ products, orders, customers, experiments = [], onAddExperimentData }) => {
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
    const { addToast } = useNotifier();
    
    // State to hold consistent assignments for this session/user
    const [assignedVariations, setAssignedVariations] = useState<Record<string, 'A' | 'B'>>({});

    useEffect(() => {
        setPermissionStatus(Notification.permission);
    }, []);

    // --- PRT-308: A/B TESTING PERSISTENCE ---
    useEffect(() => {
        if (!experiments || experiments.length === 0) return;

        const activeExperiments = experiments.filter(e => e.status === 'running');
        const newAssignments: Record<string, 'A' | 'B'> = {};
        const dataPointsToLog: ExperimentDataPoint[] = [];
        const sessionId = localStorage.getItem('rs_session_id') || crypto.randomUUID();
        
        if (!localStorage.getItem('rs_session_id')) {
            localStorage.setItem('rs_session_id', sessionId);
        }

        activeExperiments.forEach(exp => {
            const storageKey = `rs_ab_${exp.id}`;
            let assignedVariation = localStorage.getItem(storageKey) as 'A' | 'B' | null;

            // If not assigned yet, roll the dice and PERSIST
            if (!assignedVariation) {
                const split = exp.variations[1].split || 50;
                assignedVariation = Math.random() * 100 < split ? 'B' : 'A';
                localStorage.setItem(storageKey, assignedVariation);
                
                // Log VISIT event only once
                dataPointsToLog.push({
                    id: crypto.randomUUID(),
                    experimentId: exp.id,
                    variationId: assignedVariation,
                    eventType: 'visit',
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                });
            }
            newAssignments[exp.productId] = assignedVariation;
        });

        if (Object.keys(newAssignments).length > 0) {
            setAssignedVariations(prev => ({ ...prev, ...newAssignments }));
        }

        if (dataPointsToLog.length > 0 && onAddExperimentData) {
            onAddExperimentData(dataPointsToLog);
        }
    }, [experiments]); 

    const getProductDisplay = (product: Product) => {
        const variation = assignedVariations[product.id];
        const experiment = experiments.find(e => e.productId === product.id && e.status === 'running');
        
        let displayPrice = product.salePrice;
        let displayName = product.name;

        if (experiment && variation === 'B') {
            const varB = experiment.variations.find(v => v.id === 'B');
            if (varB) {
                if (experiment.type === 'price') displayPrice = Number(varB.value);
                else if (experiment.type === 'headline') displayName = String(varB.value);
            }
        }
        return { ...product, salePrice: displayPrice, name: displayName, isVariationB: variation === 'B' };
    };

    // PRT-303: Visibility Filter
    const visibleProducts = useMemo(() => {
        return products.filter(p => p.status === 'Active' && p.visibility?.includes('loja'));
    }, [products]);

    const handleSubscribe = async () => {
        const permission = await notificationService.requestPermission();
        setPermissionStatus(permission);
        if (permission === 'granted') {
            notificationService.sendNotification('Inscrição Ativada!', 'Você receberá nossas novidades e promoções.');
        }
    };

    const handleAddToCart = (product: Product, displayPrice: number, displayName: string) => {
        addToast(`Produto "${displayName}" adicionado ao carrinho por R$ ${displayPrice.toFixed(2)}`, 'success');
    };

    const aiContext = useMemo(() => ({
        products, orders, customers, browsingHistory: viewingProduct ? [viewingProduct] : [],
    }), [products, orders, customers, viewingProduct]);

    const renderBell = () => (
        permissionStatus === 'granted' 
        ? <div className="fixed top-6 right-28 w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30"><BellRing size={20} /></div>
        : <button onClick={handleSubscribe} className="fixed top-6 right-28 w-10 h-10 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center border border-blue-500/30 animate-pulse"><Bell size={20} /></button>
    );

    if (viewingProduct) {
        const displayProduct = getProductDisplay(viewingProduct);
        return (
            <div className="animate-fade-in">
                {renderBell()}
                <button onClick={() => setViewingProduct(null)} className="text-sm text-rs-gold mb-4 hover:underline">&larr; Voltar para a vitrine</button>
                <div className="bg-rs-card p-8 rounded-xl border border-rs-goldDim/20 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                    {displayProduct.isVariationB && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 z-10">Teste A/B: Variação B</div>}
                    <div className="w-full md:w-1/3 aspect-square bg-black/30 rounded-xl flex items-center justify-center text-slate-600"><ShoppingBag size={80} /></div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">{displayProduct.name}</h2>
                        <div className="flex items-end gap-3 mb-6">
                            <p className="text-4xl font-bold text-rs-gold">R$ {displayProduct.salePrice.toFixed(2)}</p>
                            {displayProduct.isVariationB && <span className="text-sm text-slate-500 line-through mb-1">R$ {viewingProduct.salePrice.toFixed(2)}</span>}
                        </div>
                        <button onClick={() => handleAddToCart(viewingProduct, displayProduct.salePrice, displayProduct.name)} className="btn-primary w-full md:w-auto px-8 py-3 text-lg flex items-center justify-center gap-3 shadow-lg shadow-rs-gold/10">
                            <ShoppingCart size={20}/> Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
                <VirtualAssistant context={aiContext} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {renderBell()}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-rs-gold">Vitrine de Produtos (Preview)</h2>
                <p className="text-sm text-slate-400">Simulação da loja. Produtos visíveis apenas se marcados como "Loja Própria".</p>
            </div>
            {visibleProducts.length === 0 ? (
                <div className="bg-rs-card p-12 rounded-xl border border-rs-goldDim/20 text-center text-slate-500"><ShoppingBag size={64} className="mb-4 opacity-50 mx-auto"/><p>Nenhum produto visível na loja no momento.</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {visibleProducts.map(p => {
                        const displayProduct = getProductDisplay(p);
                        return (
                            <div key={p.id} onClick={() => setViewingProduct(p)} className="bg-rs-card border border-rs-goldDim/20 rounded-xl p-4 flex flex-col gap-3 hover:border-rs-gold/50 transition-all cursor-pointer relative overflow-hidden group">
                                {displayProduct.isVariationB && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>}
                                <div className="w-full h-48 bg-black/20 rounded-lg flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform"><ShoppingBag size={48} /></div>
                                <div className="flex-1 mt-2"><h3 className="font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-rs-gold">{displayProduct.name}</h3></div>
                                <div className="text-xl text-rs-gold font-bold">R$ {displayProduct.salePrice.toFixed(2)}</div>
                            </div>
                        );
                    })}
                </div>
            )}
            <VirtualAssistant context={aiContext} />
        </div>
    );
};