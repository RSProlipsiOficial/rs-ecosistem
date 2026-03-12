
import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/marketplaceAPI';
import { supabase } from '../services/supabase';
import { Package } from 'lucide-react';

const TENANT_ID = (import.meta as any).env?.VITE_TENANT_ID || '';

const MarketplaceAdminProducts: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'TODOS' | 'RS' | 'AFILIADO'>('TODOS');
    const [editingStock, setEditingStock] = useState<string | null>(null);
    const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [toggleId, setToggleId] = useState<string | null>(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });
            if (!error && data) { setProducts(data); }
            else {
                const res = await productsAPI.getAll();
                setProducts(res?.data || res || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const saveStock = async (productId: string) => {
        const newVal = stockInputs[productId];
        if (newVal === undefined || isNaN(newVal)) return;
        setSavingId(productId);
        try {
            await supabase.from('products').update({ stock_quantity: newVal }).eq('id', productId);
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: newVal } : p));
            setEditingStock(null);
        } finally {
            setSavingId(null);
        }
    };

    const togglePublished = async (productId: string, current: boolean) => {
        setToggleId(productId);
        try {
            // Produtos RS (owner_type = 'RS' ou is_rs_product = true) são bloqueados
            const product = products.find(p => p.id === productId);
            if (product?.owner_type === 'RS' || product?.is_rs_product === true) {
                alert('⛔ Produtos RS originais são protegidos e não podem ser despublicados por aqui.');
                return;
            }
            await supabase.from('products').update({ published: !current }).eq('id', productId);
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, published: !current } : p));
        } finally {
            setToggleId(null);
        }
    };

    const isRSProduct = (p: any) => p.owner_type === 'RS' || p.is_rs_product === true || p.tenant_id === TENANT_ID;

    const filtered = products.filter(p => {
        const matchSearch = !search || (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'TODOS' || (filterType === 'RS' ? isRSProduct(p) : !isRSProduct(p));
        return matchSearch && matchType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">Gestão de Produtos</h2>
                    <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">{filtered.length} produtos · <span className="text-[rgb(var(--color-brand-gold))]">🔒 Produtos RS são protegidos</span></p>
                </div>
                <button onClick={loadProducts} className="px-4 py-2 bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg text-sm text-white hover:border-[rgb(var(--color-brand-gold))]/50 transition-colors">
                    🔄 Atualizar
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-[rgb(var(--color-brand-gold))]/5 border border-[rgb(var(--color-brand-gold))]/20 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                    <p className="text-[rgb(var(--color-brand-gold))] font-bold text-sm">Produtos RS — Protegidos</p>
                    <p className="text-[rgb(var(--color-brand-text-dim))] text-xs mt-0.5">Os produtos originais da RS Prólipsi não podem ser despublicados ou excluídos. Apenas o estoque pode ser editado. Consultores e afiliados criam produtos separados que passam por aprovação.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-brand-text-dim))]">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar produto ou SKU..."
                        className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[rgb(var(--color-brand-gold))]/50"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {(['TODOS', 'RS', 'AFILIADO'] as const).map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filterType === t ? 'bg-[rgb(var(--color-brand-gold))]/20 text-[rgb(var(--color-brand-gold))] border-[rgb(var(--color-brand-gold))]/50' : 'bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-dim))] border-[rgb(var(--color-brand-gray-light))] hover:text-white'}`}>
                        {t === 'RS' ? '🔒 RS' : t === 'AFILIADO' ? '🤝 Afiliado' : 'Todos'}
                    </button>
                ))}
            </div>

            {/* Products Table */}
            <div className="bg-[rgb(var(--color-brand-gray))] rounded-xl border border-[rgb(var(--color-brand-gray-light))] overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(var(--color-brand-gold))]"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500"><Package className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" /><p>Nenhum produto encontrado</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[rgba(255,255,255,0.03)]">
                                <tr className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-brand-text-dim))]">
                                    <th className="px-4 py-3 text-left">Produto</th>
                                    <th className="px-4 py-3 text-center">Tipo</th>
                                    <th className="px-4 py-3 text-right">Preço</th>
                                    <th className="px-4 py-3 text-center">Estoque</th>
                                    <th className="px-4 py-3 text-center">Publicado</th>
                                    <th className="px-4 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgb(var(--color-brand-gray-light))]">
                                {filtered.map((p, i) => {
                                    const isRS = isRSProduct(p);
                                    const stock = Number(p.stock_quantity || p.stock || 0);
                                    return (
                                        <tr key={p.id || i} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-black/40" /> : <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center shrink-0 text-gray-400"><Package className="w-5 h-5" /></div>}
                                                    <div>
                                                        <p className="text-white font-semibold flex items-center gap-1">
                                                            {p.name}
                                                            {isRS && <span className="text-[8px] font-black text-[rgb(var(--color-brand-gold))] bg-[rgb(var(--color-brand-gold))]/10 px-1.5 py-0.5 rounded border border-[rgb(var(--color-brand-gold))]/30">RS</span>}
                                                        </p>
                                                        {p.sku && <p className="text-xs text-[rgb(var(--color-brand-text-dim))] font-mono">{p.sku}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${isRS ? 'bg-[rgb(var(--color-brand-gold))]/10 text-[rgb(var(--color-brand-gold))] border-[rgb(var(--color-brand-gold))]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                    {isRS ? '🔒 RS' : '🤝 Afiliado'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-[rgb(var(--color-brand-gold))]">
                                                R$ {Number(p.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {editingStock === p.id ? (
                                                    <div className="flex items-center gap-1 justify-center">
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gold))]/50 text-white rounded px-2 py-1 text-sm text-center"
                                                            value={stockInputs[p.id] ?? stock}
                                                            onChange={e => setStockInputs(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                                                        />
                                                        <button onClick={() => saveStock(p.id)} disabled={savingId === p.id} className="text-green-400 hover:text-green-300 font-bold text-sm disabled:opacity-50">✓</button>
                                                        <button onClick={() => setEditingStock(null)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => { setEditingStock(p.id); setStockInputs(prev => ({ ...prev, [p.id]: stock })); }}
                                                        className={`font-bold text-sm hover:underline ${stock < 5 ? 'text-red-400' : stock < 10 ? 'text-yellow-400' : 'text-white'}`}>
                                                        {stock} un.
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => togglePublished(p.id, p.published)}
                                                    disabled={toggleId === p.id || isRS}
                                                    title={isRS ? 'Produto RS protegido' : 'Clique para alternar'}
                                                    className={`relative w-11 h-6 rounded-full transition-colors ${p.published ? 'bg-green-500' : 'bg-[rgb(var(--color-brand-gray-light))]'} ${isRS ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${p.published ? 'translate-x-5' : ''}`}></span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {!isRS && (
                                                    <button
                                                        onClick={() => { if (confirm('Excluir produto?')) { supabase.from('products').delete().eq('id', p.id).then(() => setProducts(prev => prev.filter(x => x.id !== p.id))); } }}
                                                        className="text-red-400 hover:text-red-300 text-xs font-medium hover:underline"
                                                    >
                                                        Excluir
                                                    </button>
                                                )}
                                                {isRS && <span className="text-[rgb(var(--color-brand-text-dim))] text-xs">🔒 Protegido</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceAdminProducts;
