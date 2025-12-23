import React, { useState, useMemo } from 'react';
import { TrackingPixel, ShortLink, User, TrackingPixelPlatform, Order, Lead, Product, Affiliate } from '../types';
import { PIXEL_PLATFORMS, PIXEL_TEMPLATES } from '../services/pixelTemplates';
import { Target, Link as LinkIcon, Edit2, Trash2, Plus, X, Copy, QrCode, Download, CheckCircle, BarChart2, MousePointerClick, Filter, Clock, AlertTriangle, HelpCircle, ExternalLink, RefreshCw, ShoppingBag, MessageCircle, ArrowRight, Calculator, PieChart, TrendingUp, DollarSign, Store, Smartphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie, Legend } from 'recharts';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { useNotifier } from '../contexts/NotificationContext';

interface MarketingToolsProps {
    pixels: TrackingPixel[];
    onAddPixel: (pixel: Omit<TrackingPixel, 'id' | 'userId' | 'createdAt'>) => void;
    onUpdatePixel: (pixel: TrackingPixel) => void;
    onDeletePixel: (id: string) => void;
    links: ShortLink[];
    onAddLink: (link: Omit<ShortLink, 'id' | 'userId' | 'createdAt' | 'clicks'>) => void;
    onUpdateLink: (link: ShortLink) => void;
    onDeleteLink: (id: string) => void;
    currentUser: User;
    users: User[];

    // Analytics props
    orders: Order[];
    leads: Lead[];
    onRegisterClick: (linkId: string) => void;

    // Inventory prop
    products: Product[];
    affiliates: Affiliate[];
}

// FIX: Defined missing components `PixelGenerator` and `LinkShortener`.
const EMPTY_PIXEL: Omit<TrackingPixel, 'id' | 'userId' | 'createdAt'> = {
    platform: 'meta',
    name: '',
    config: {},
};

const PixelModal: React.FC<{ pixel: TrackingPixel | null, onClose: () => void, onSave: (data: any) => void }> = ({ pixel, onClose, onSave }) => {
    const [formData, setFormData] = useState(pixel ? { name: pixel.name, platform: pixel.platform, config: pixel.config } : EMPTY_PIXEL);
    const platformFields = PIXEL_PLATFORMS.find(p => p.id === formData.platform)?.fields || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title={pixel ? 'Editar Pixel' : 'Novo Pixel'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="label-text">Nome do Pixel</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" required /></div>
                <div><label className="label-text">Plataforma</label>
                    <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value as any, config: {} })} className="input-field">
                        {PIXEL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                {platformFields.map(field => (
                    <div key={field.key}><label className="label-text">{field.label}</label><input type="text" value={formData.config[field.key] || ''} onChange={e => setFormData({ ...formData, config: { ...formData.config, [field.key]: e.target.value } })} className="input-field" required /></div>
                ))}
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar Pixel</button></div>
            </form>
            <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
        </ModalWrapper>
    );
};

const PixelGenerator: React.FC<MarketingToolsProps> = ({ pixels, onAddPixel, onUpdatePixel, onDeletePixel }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPixel, setEditingPixel] = useState<TrackingPixel | null>(null);

    const table = useDataTable({ initialData: pixels, searchKeys: ['name', 'platform'] });

    const handleOpenModal = (pixel?: TrackingPixel) => {
        setEditingPixel(pixel || null);
        setModalOpen(true);
    };

    const handleSave = (data: Omit<TrackingPixel, 'id' | 'userId' | 'createdAt'>) => {
        if (editingPixel) {
            onUpdatePixel({ ...editingPixel, ...data });
        } else {
            onAddPixel(data);
        }
        setModalOpen(false);
    };

    const columns: Column<TrackingPixel>[] = [
        { header: 'Nome', accessor: 'name', render: p => <span className="font-bold">{p.name}</span> },
        { header: 'Plataforma', accessor: 'platform', render: p => PIXEL_PLATFORMS.find(pl => pl.id === p.platform)?.name || p.platform },
        { header: 'ID Principal', accessor: 'config', render: p => <span className="font-mono text-xs">{Object.values(p.config)[0]}</span> },
        {
            header: 'Ações', accessor: 'actions', render: p => (
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2 hover:text-blue-400"><Edit2 size={16} /></button>
                    <button onClick={() => onDeletePixel(p.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Pixels de Rastreamento</h3>
                <button onClick={() => handleOpenModal()} className="btn-secondary flex items-center gap-2"><Plus size={16} /> Novo Pixel</button>
            </div>
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }} onItemsPerPageChange={table.handleItemsPerPageChange} />
            {isModalOpen && <PixelModal pixel={editingPixel} onClose={() => setModalOpen(false)} onSave={handleSave} />}
            <style>{`.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
        </div>
    );
};

const EMPTY_LINK: Omit<ShortLink, 'id' | 'userId' | 'createdAt' | 'clicks'> = {
    slug: '',
    originalUrl: '',
    finalUrl: '',
    name: '',
    isActive: true
};

const LinkShortener: React.FC<MarketingToolsProps> = ({ links, onAddLink, onUpdateLink, onDeleteLink }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

    const table = useDataTable({ initialData: links, searchKeys: ['name', 'slug', 'originalUrl'] });

    const handleOpenModal = (link?: ShortLink) => {
        setEditingLink(link || null);
        setModalOpen(true);
    };

    const handleSave = (data: Omit<ShortLink, 'id' | 'userId' | 'createdAt' | 'clicks'>) => {
        if (editingLink) {
            onUpdateLink({ ...editingLink, ...data });
        } else {
            onAddLink(data);
        }
        setModalOpen(false);
    };

    const columns: Column<ShortLink>[] = [
        {
            header: 'Nome/Link', accessor: 'name', render: l => (
                <div>
                    <div className="font-bold">{l.name}</div>
                    <div className="text-xs text-rs-gold font-mono">rs.co/{l.slug}</div>
                </div>
            )
        },
        { header: 'URL Original', accessor: 'originalUrl', render: l => <a href={l.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 truncate max-w-xs">{l.originalUrl}</a> },
        { header: 'Cliques', accessor: 'clicks', render: l => l.clicks.length },
        {
            header: 'Ações', accessor: 'actions', render: l => (
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(l)} className="p-2 hover:text-blue-400"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteLink(l.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Encurtador de Links com UTM</h3>
                <button onClick={() => handleOpenModal()} className="btn-secondary flex items-center gap-2"><Plus size={16} /> Novo Link</button>
            </div>
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }} onItemsPerPageChange={table.handleItemsPerPageChange} />
            {isModalOpen && <ModalWrapper isOpen={true} onClose={() => setModalOpen(false)} title={editingLink ? 'Editar Link' : 'Novo Link Curto'}>
                <p className="p-6">Formulário de criação/edição de link aqui.</p>
            </ModalWrapper>}
            <style>{`.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
        </div>
    );
};

export const MarketingTools: React.FC<MarketingToolsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'pixels' | 'links' | 'product-links' | 'calculator'>('pixels');

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Target size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Ferramentas de Marketing & Estratégia</h2>
                        <p className="text-sm text-slate-500">Pixel, Links, UTMs e Precificação de Ofertas.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-rs-dark rounded-xl border border-white/10 w-fit overflow-x-auto">
                <button onClick={() => setActiveTab('pixels')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'pixels' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Gerador de Pixels</button>
                <button onClick={() => setActiveTab('links')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'links' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Encurtador de Links</button>
                <button onClick={() => setActiveTab('product-links')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'product-links' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Vitrine de Links</button>
                <button onClick={() => setActiveTab('calculator')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'calculator' ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}>Calculadora de Preço</button>
            </div>

            {activeTab === 'pixels' && <PixelGenerator {...props} />}
            {activeTab === 'links' && <LinkShortener {...props} />}
            {activeTab === 'product-links' && <ProductLinkBuilder {...props} />}
            {activeTab === 'calculator' && <PricingCalculator />}
        </div>
    );
};

// --- 1. PRICING CALCULATOR ---

// FIX: Defined InputNumber component.
interface InputNumberProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    isPercentage?: boolean;
}
const InputNumber: React.FC<InputNumberProps> = ({ label, value, onChange }) => (
    <div>
        <label className="label-text">{label}</label>
        <input
            type="number"
            step="0.01"
            value={value}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            className="input-field"
        />
    </div>
);

// FIX: Defined ResultCard component.
interface ResultCardProps {
    label: string;
    value: string;
    subtext?: string;
    color?: string;
}
const ResultCard: React.FC<ResultCardProps> = ({ label, value, subtext, color }) => (
    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
        <div className="text-xs text-slate-400">{label}</div>
        <div className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</div>
        {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
    </div>
);

const PricingCalculator = () => {
    const [costPrice, setCostPrice] = useState<number>(50);
    const [shippingCost, setShippingCost] = useState<number>(20);
    const [taxRate, setTaxRate] = useState<number>(6); // Simples Nacional approx
    const [gatewayFee, setGatewayFee] = useState<number>(5.99); // Gateway + Antifraud
    const [platformFixed, setPlatformFixed] = useState<number>(2.00);
    const [marketingCPA, setMarketingCPA] = useState<number>(40);
    const [targetMargin, setTargetMargin] = useState<number>(20);

    const results = useMemo(() => {
        const variableRates = (taxRate + gatewayFee + targetMargin) / 100;
        const fixedCosts = costPrice + shippingCost + platformFixed + marketingCPA;

        let suggestedPrice = 0;
        if (variableRates < 1) {
            suggestedPrice = fixedCosts / (1 - variableRates);
        }

        const taxAmount = suggestedPrice * (taxRate / 100);
        const gatewayAmount = suggestedPrice * (gatewayFee / 100);
        const profitAmount = suggestedPrice * (targetMargin / 100);

        return {
            suggestedPrice,
            taxAmount,
            gatewayAmount,
            profitAmount,
            roasTarget: marketingCPA > 0 ? suggestedPrice / marketingCPA : 0
        };
    }, [costPrice, shippingCost, taxRate, gatewayFee, platformFixed, marketingCPA, targetMargin]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-rs-card border border-rs-goldDim/20 rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2"><Calculator size={20} className="text-rs-gold" /> Custos & Variáveis</h3>
                    <div className="space-y-4">
                        <InputNumber label="Custo do Produto (Fornecedor)" value={costPrice} onChange={setCostPrice} />
                        <InputNumber label="Frete Médio (Loja paga)" value={shippingCost} onChange={setShippingCost} />
                        <InputNumber label="CPA Alvo (Ads)" value={marketingCPA} onChange={setMarketingCPA} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputNumber label="Imposto (%)" value={taxRate} onChange={setTaxRate} isPercentage />
                            <InputNumber label="Gateway (%)" value={gatewayFee} onChange={setGatewayFee} isPercentage />
                        </div>
                        <InputNumber label="Taxa Fixa (Checkout)" value={platformFixed} onChange={setPlatformFixed} />
                    </div>
                </div>

                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
                    <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><TrendingUp size={20} /> Meta de Lucro</h3>
                    <div>
                        <label className="label-text text-emerald-300">Margem Líquida Desejada (%)</label>
                        <input type="range" min="1" max="50" value={targetMargin} onChange={e => setTargetMargin(parseInt(e.target.value))} className="w-full accent-emerald-500 mb-2" />
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>1%</span>
                            <span className="text-emerald-400 text-lg">{targetMargin}%</span>
                            <span>50%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <div className="bg-rs-card border border-rs-gold/30 rounded-xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-center h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign size={200} className="text-rs-gold" /></div>

                    <div className="relative z-10 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Preço de Venda Sugerido</h4>
                        <div className="text-5xl md:text-6xl font-extrabold text-rs-gold mb-2">
                            R$ {results.suggestedPrice.toFixed(2)}
                        </div>
                        <p className="text-sm text-slate-500 mb-8">Para garantir {targetMargin}% de lucro líquido real no bolso.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                            <ResultCard label="Lucro Líquido / Venda" value={`R$ ${results.profitAmount.toFixed(2)}`} color="text-emerald-400" />
                            <ResultCard label="ROAS Mínimo (Ads)" value={`${results.roasTarget.toFixed(2)}x`} subtext={`Para CPA de R$ ${marketingCPA}`} color="text-blue-400" />
                            <ResultCard label="Impostos + Taxas" value={`R$ ${(results.taxAmount + results.gatewayAmount + platformFixed).toFixed(2)}`} color="text-orange-400" />
                            <ResultCard label="Custo Total (CMV+Mkt)" value={`R$ ${(costPrice + shippingCost + marketingCPA).toFixed(2)}`} color="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. PRODUCT LINK BUILDER (VITRINE) ---
const ProductLinkBuilder: React.FC<MarketingToolsProps> = ({ products, affiliates, onAddLink, currentUser }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [baseUrl, setBaseUrl] = useState('');
    const [utmData, setUtmData] = useState({ source: 'facebook', medium: 'cpc', campaign: '' });
    const [selectedAffiliateId, setSelectedAffiliateId] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState(''); // Store phone for link generation
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [activeModalTab, setActiveModalTab] = useState<'checkout' | 'whatsapp'>('checkout');
    const { addToast } = useNotifier();

    const handleSelectProduct = (p: Product) => {
        setSelectedProduct(p);
        // Clean product name for slug
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setBaseUrl(`${window.location.origin}/produto/${slug}`);
        setWhatsappMessage(`Olá! Vi o produto *${p.name}* e gostaria de tirar dúvidas.`);
        setSelectedAffiliateId('');
    };

    const finalUrl = useMemo(() => {
        if (!baseUrl) return '';
        try {
            const url = new URL(baseUrl);
            if (utmData.source) url.searchParams.set('utm_source', utmData.source);
            if (utmData.medium) url.searchParams.set('utm_medium', utmData.medium);
            if (utmData.campaign) url.searchParams.set('utm_campaign', utmData.campaign);
            if (selectedAffiliateId) {
                url.searchParams.set('aff', selectedAffiliateId);
            }
            return url.toString();
        } catch (e) { return baseUrl; }
    }, [baseUrl, utmData, selectedAffiliateId]);

    const whatsappLink = useMemo(() => {
        const phone = whatsappPhone.replace(/\D/g, ''); // Use entered phone number
        const text = encodeURIComponent(whatsappMessage);
        return phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    }, [whatsappPhone, whatsappMessage]);

    const handleSaveShortLink = () => {
        if (!selectedProduct) return;

        const isWa = activeModalTab === 'whatsapp';
        const slugSuffix = isWa ? 'wa' : utmData.source;
        // Generate a simple unique slug
        const randomSuffix = Math.random().toString(36).substring(7);
        const slug = `${selectedProduct.sku}-${slugSuffix}-${randomSuffix}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

        onAddLink({
            name: `${selectedProduct.name} (${isWa ? 'WhatsApp' : utmData.source})`,
            slug,
            originalUrl: isWa ? whatsappLink : baseUrl,
            finalUrl: isWa ? whatsappLink : finalUrl,
            utmSource: isWa ? 'whatsapp' : utmData.source,
            utmMedium: isWa ? 'social' : utmData.medium,
            utmCampaign: isWa ? '' : utmData.campaign,
            isActive: true
        });
        addToast('Link salvo no Encurtador!', 'success');
        setSelectedProduct(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                    <div key={p.id} className="bg-rs-card border border-rs-goldDim/20 rounded-xl overflow-hidden shadow-lg group">
                        <div className="aspect-video relative overflow-hidden">
                            <img src={p.pageLayout?.mainLayout === 'gallery' ? '#' : (p.pageLayout?.mainLayout || 'image-left')} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <div className="p-4 space-y-3">
                            <h4 className="font-bold text-slate-100 truncate">{p.name}</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">SKU: {p.sku}</span>
                                <span className="text-rs-gold font-bold">R$ {p.salePrice.toFixed(2)}</span>
                            </div>
                            <button onClick={() => handleSelectProduct(p)} className="w-full py-2 bg-rs-gold/10 text-rs-gold hover:bg-rs-gold hover:text-rs-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                                <LinkIcon size={14} /> Gerar Links de Venda
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProduct && (
                <ModalWrapper isOpen={true} onClose={() => setSelectedProduct(null)} title={`Gerar Links: ${selectedProduct.name}`}>
                    <div className="p-1 bg-rs-dark mx-6 mt-4 rounded-lg flex border border-white/10">
                        <button onClick={() => setActiveModalTab('checkout')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeModalTab === 'checkout' ? 'bg-rs-gold text-rs-black' : 'text-slate-500 hover:text-slate-300'}`}>Link Direto / Checkout</button>
                        <button onClick={() => setActiveModalTab('whatsapp')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeModalTab === 'whatsapp' ? 'bg-rs-gold text-rs-black' : 'text-slate-500 hover:text-slate-300'}`}>Link WhatsApp</button>
                    </div>

                    <div className="p-6 space-y-4">
                        {activeModalTab === 'checkout' ? (
                            <div className="space-y-4 animate-fade-in">
                                <div><label className="label-text">Origem (utm_source)</label>
                                    <select value={utmData.source} onChange={e => setUtmData({ ...utmData, source: e.target.value })} className="input-field uppercase text-xs">
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="google">Google</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="email">E-mail</option>
                                        <option value="direct">Direto / Bio</option>
                                    </select>
                                </div>
                                <div><label className="label-text">Campanha (utm_campaign)</label><input type="text" value={utmData.campaign} onChange={e => setUtmData({ ...utmData, campaign: e.target.value })} placeholder="ex: blackfriday" className="input-field" /></div>
                                {affiliates.length > 0 && (
                                    <div><label className="label-text">Afiliado Parceiro (Opcional)</label>
                                        <select value={selectedAffiliateId} onChange={e => setSelectedAffiliateId(e.target.value)} className="input-field">
                                            <option value="">Nenhum afiliado</option>
                                            {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="bg-black/30 p-3 rounded border border-rs-gold/20 flex flex-col gap-2">
                                    <div className="text-[10px] uppercase font-bold text-rs-gold tracking-widest">URL Final com UTM</div>
                                    <div className="text-xs break-all text-slate-300 font-mono p-2 bg-black/40 rounded border border-white/5">{finalUrl}</div>
                                    <button onClick={() => { navigator.clipboard.writeText(finalUrl); addToast('Link copiado!', 'success'); }} className="btn-secondary self-start py-1 px-3 mt-1 flex items-center gap-2"><Copy size={12} /> Copiar Link</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div><label className="label-text">Seu WhatsApp de Vendas (DDD + Número)</label>
                                    <div className="flex gap-2 items-center">
                                        <div className="bg-white/5 px-3 py-2 border border-white/10 rounded-lg text-slate-500 font-bold">+55</div>
                                        <input type="tel" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} placeholder="11999999999" className="input-field" />
                                    </div>
                                </div>
                                <div><label className="label-text">Mensagem Pré-definida</label><textarea value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value)} className="input-field h-24 text-sm" /></div>
                                <div className="bg-green-900/10 p-3 rounded border border-green-500/20 flex flex-col gap-2">
                                    <div className="text-[10px] uppercase font-bold text-green-400 tracking-widest">Link WhatsApp Direto</div>
                                    <div className="text-xs break-all text-green-200/70 font-mono p-2 bg-black/40 rounded border border-white/5">{whatsappLink}</div>
                                    <button onClick={() => { navigator.clipboard.writeText(whatsappLink); addToast('Link WA copiado!', 'success'); }} className="btn-secondary bg-green-500/10 text-green-400 border-green-500/20 self-start py-1 px-3 mt-1 flex items-center gap-2"><Copy size={12} /> Copiar Link WA</button>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                            <button onClick={() => setSelectedProduct(null)} className="btn-secondary">Fechar</button>
                            <button onClick={handleSaveShortLink} className="btn-primary flex items-center gap-2"><ArrowRight size={16} /> Encurtar & Salvar na Lista</button>
                        </div>
                    </div>
                    <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
                </ModalWrapper>
            )}
        </div>
    );
};