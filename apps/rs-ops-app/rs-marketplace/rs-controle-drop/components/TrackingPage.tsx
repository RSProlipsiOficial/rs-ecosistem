import React, { useState } from 'react';
import { Order, Product, TrackingEvent } from '../types';
import { trackingService } from '../services/trackingService';
import { Map, Search, Package, Truck, Home, MessageSquare, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface TrackingPageProps {
    orders: Order[];
    products: Product[];
    onNavigate: (tab: string, params?: any) => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ orders, products, onNavigate }) => {
    const [orderId, setOrderId] = useState('');
    const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
    const [timeline, setTimeline] = useState<TrackingEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSearchedOrder(null);
        setTimeline([]);
        
        const foundOrder = orders.find(o => o.id.slice(0, 8).toUpperCase() === orderId.toUpperCase() || o.trackingCode === orderId);
        
        if (foundOrder) {
            setSearchedOrder(foundOrder);
            setLoading(true);
            try {
                // PRT-310: Busca Real
                if (foundOrder.trackingCode) {
                    const realEvents = await trackingService.trackObject(foundOrder.trackingCode);
                    setTimeline(realEvents);
                } else {
                    setTimeline(trackingService.getInternalTimeline(foundOrder));
                }
            } catch (err) {
                setTimeline(trackingService.getInternalTimeline(foundOrder));
            } finally {
                setLoading(false);
            }
        } else {
            setError('Pedido ou código de rastreio não encontrado.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20">
                <h2 className="text-xl font-bold text-rs-gold mb-4 text-center">Rastreie seu Pedido</h2>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
                    <input 
                        type="text" 
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        placeholder="Digite o Nº do Pedido ou Código"
                        className="input-field flex-1 text-center font-medium"
                    />
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>}
                        Buscar
                    </button>
                </form>
                {error && <div className="text-center text-red-400 mt-4"><AlertCircle size={18} className="inline mr-2"/> {error}</div>}
            </div>

            {searchedOrder && (
                <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                        <h3 className="font-bold text-slate-100">Status: <span className="text-rs-gold uppercase">{searchedOrder.status}</span></h3>
                        {searchedOrder.trackingCode && <div className="text-emerald-400 font-mono">{searchedOrder.trackingCode}</div>}
                    </div>
                    
                    <div className="relative pl-6 space-y-8">
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10"></div>
                        {timeline.map((event, index) => (
                            <div key={index} className="relative">
                                <div className={`absolute -left-[25px] top-0 w-5 h-5 rounded-full border-2 ${index === 0 ? 'bg-rs-gold border-rs-gold' : 'bg-rs-card border-slate-600'}`}></div>
                                <div className={index === 0 ? 'text-slate-200' : 'text-slate-500'}>
                                    <p className="font-bold text-sm">{event.status}</p>
                                    <p className="text-xs">{new Date(event.date).toLocaleString('pt-BR')}</p>
                                    <p className="text-xs mt-1 text-slate-400 flex items-center gap-1"><Map size={10}/> {event.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};