import React, { useState, useMemo } from 'react';
import { TrackingPixel, ShortLink, User, TrackingPixelPlatform, Order, Lead, Product } from '../types';
import { PIXEL_PLATFORMS, PIXEL_TEMPLATES } from '../services/pixelTemplates';
import { Target, Link as LinkIcon, Edit2, Trash2, Plus, X, Copy, QrCode, Download, CheckCircle, BarChart2, MousePointerClick, Filter, Clock, AlertTriangle, HelpCircle, ExternalLink, RefreshCw, ShoppingBag, MessageCircle, ArrowRight, Calculator, PieChart, TrendingUp, DollarSign, Store, Smartphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie, Legend } from 'recharts';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';

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
}

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
                    <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2"><Calculator size={20} className="text-rs-gold"/> Custos & Variáveis</h3>
                    <div className="space-y-4">
                        <InputNumber label="Custo do Produto (Fornecedor)" value={costPrice} onChange={setCostPrice} />
                        <InputNumber label="Frete Médio (Loja paga)" value={shippingCost} onChange={setShippingCost} />
                        <InputNumber label="CPA Alvo (Ads)" value={marketingCPA} onChange={setMarketingCPA} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputNumber label="Imposto (%)" value={taxRate} onChange={setTaxRate} icon="%" />
                            <InputNumber label="Gateway (%)" value={gatewayFee} onChange={setGatewayFee} icon="%" />
                        </div>
                        <InputNumber label="Taxa Fixa (Checkout)" value={platformFixed} onChange={setPlatformFixed} />
                    </div>
                </div>

                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
                     <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><TrendingUp size={20}/> Meta de Lucro</h3>
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
                    <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign size={200} className="text-rs-gold"/></div>
                    
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
const ProductLinkBuilder: React.FC<MarketingToolsProps> = ({ products, onAddLink, currentUser }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [baseUrl, setBaseUrl] = useState('');
    const [utmData, setUtmData] = useState({ source: 'facebook', medium: 'cpc', campaign: '' });
    const [whatsappPhone, setWhatsappPhone] = useState(''); // Store phone for link generation
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [activeModalTab, setActiveModalTab] = useState<'checkout' | 'whatsapp'>('checkout');

    const handleSelectProduct = (p: Product) => {
        setSelectedProduct(p);
        // Clean product name for slug
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setBaseUrl(`https://sualoja.com.br/produto/${slug}`);
        setWhatsappMessage(`Olá! Vi o produto *${p.name}* e gostaria de tirar dúvidas.`);
    };

    const finalUrl = useMemo(() => {
        if (!baseUrl) return '';
        try {
            const url = new URL(baseUrl);
            if (utmData.source) url.searchParams.set('utm_source', utmData.source);
            if (utmData.medium) url.searchParams.set('utm_medium', utmData.medium);
            if (utmData.campaign) url.searchParams.set('utm_campaign', utmData.campaign);
            return url.toString();
        } catch(e) { return baseUrl; }
    }, [baseUrl, utmData]);

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
        alert('Link salvo no Encurtador!');
        setSelectedProduct(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {products.map(p => (
                     <div key={p.id} className="bg-rs-card border border-rs-goldDim/20 rounded-xl p-4 flex flex-col gap-3 hover:border-rs-gold/50 transition-colors">
                         <div className="flex justify-between items-start">
                             <div className="font-bold text-slate-200 line-clamp-1">{p.name}</div>
                             <div className="text-rs-gold font-bold text-sm">R$ {p.salePrice.toFixed(2)}</div>
                         </div>
                         <div className="text-xs text-slate-500">SKU: {p.sku} | Estoque: {p.currentStock}</div>
                         <button onClick={() => handleSelectProduct(p)} className="mt-auto btn-primary-sm flex items-center justify-center gap-2">
                             <LinkIcon size={16}/> Gerar Links
                         </button>
                     </div>
                 ))}
             </div>

             <ModalWrapper isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Gerador de Links do Produto" size="lg">
                 <div className="p-6 h-full flex flex-col">
                     <div className="flex gap-2 border-b border-white/10 mb-6">
                         <button onClick={() => setActiveModalTab('checkout')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeModalTab === 'checkout' ? 'border-rs-gold text-rs-gold' : 'border-transparent text-slate-400'}`}>
                             <LinkIcon size={16}/> Checkout/Página
                         </button>
                         <button onClick={() => setActiveModalTab('whatsapp')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeModalTab === 'whatsapp' ? 'border-rs-gold text-rs-gold' : 'border-transparent text-slate-400'}`}>
                             <MessageCircle size={16}/> WhatsApp
                         </button>
                     </div>

                     {activeModalTab === 'checkout' && (
                         <div className="space-y-4">
                             <div><label className="label-text">URL Base do Produto</label><input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="input-field"/></div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div><label className="label-text">Origem (Source)</label><select value={utmData.source} onChange={e => setUtmData({...utmData, source: e.target.value})} className="input-field"><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="google">Google</option><option value="tiktok">TikTok</option><option value="email">Email</option></select></div>
                                 <div><label className="label-text">Campanha</label><input type="text" value={utmData.campaign} onChange={e => setUtmData({...utmData, campaign: e.target.value})} className="input-field" placeholder="ex: black_friday"/></div>
                             </div>
                             
                             <div className="bg-black/30 p-3 rounded-lg border border-white/10 break-all text-sm text-emerald-400 font-mono mt-2">
                                 {finalUrl}
                             </div>

                             <div className="flex gap-2 pt-2">
                                 <button onClick={() => navigator.clipboard.writeText(finalUrl)} className="flex-1 btn-secondary flex items-center justify-center gap-2"><Copy size={16}/> Copiar</button>
                                 <button onClick={handleSaveShortLink} className="flex-1 btn-primary flex items-center justify-center gap-2"><Plus size={16}/> Encurtar e Salvar</button>
                             </div>
                         </div>
                     )}

                     {activeModalTab === 'whatsapp' && (
                         <div className="space-y-4">
                             <div>
                                <label className="label-text">Número do WhatsApp (Opcional)</label>
                                <input type="text" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} className="input-field" placeholder="DD + Número (apenas números)" />
                             </div>
                             <div>
                                <label className="label-text">Mensagem Pré-definida</label>
                                <textarea rows={3} value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value)} className="input-field resize-none"/>
                            </div>
                             
                             <div className="bg-black/30 p-3 rounded-lg border border-white/10 break-all text-sm text-emerald-400 font-mono mt-2">
                                 {whatsappLink}
                             </div>

                             <div className="flex gap-2 pt-2">
                                <button onClick={() => navigator.clipboard.writeText(whatsappLink)} className="flex-1 btn-secondary flex items-center justify-center gap-2"><Copy size={16}/> Copiar</button>
                                <button onClick={handleSaveShortLink} className="flex-1 btn-primary flex items-center justify-center gap-2"><Plus size={16}/> Encurtar e Salvar</button>
                             </div>
                         </div>
                     )}
                 </div>
             </ModalWrapper>
        </div>
    );
};

// --- 3. LINK SHORTENER (EXISTING + REFINED) ---
const LinkShortener: React.FC<MarketingToolsProps> = ({ links, onAddLink, onDeleteLink, onRegisterClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewAnalyticsId, setViewAnalyticsId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ShortLink>>({ 
        name: '', slug: '', originalUrl: '', 
        utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: '', isActive: true 
    });

    const activeLink = links.find(l => l.id === viewAnalyticsId);
    const table = useDataTable({ initialData: links, searchKeys: ['name', 'slug', 'utmSource'] });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUrlObj = new URL(formData.originalUrl || 'http://');
        if (formData.utmSource) finalUrlObj.searchParams.set('utm_source', formData.utmSource);
        if (formData.utmMedium) finalUrlObj.searchParams.set('utm_medium', formData.utmMedium);
        if (formData.utmCampaign) finalUrlObj.searchParams.set('utm_campaign', formData.utmCampaign);
        
        onAddLink({
            ...formData as ShortLink,
            finalUrl: finalUrlObj.toString(),
        });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-end">
                 <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/> Criar Link</button>
             </div>

             <DataTable<ShortLink>
                {...table} 
                columns={[
                    { header: 'Nome', accessor: 'name', sortable: true },
                    { header: 'Slug', accessor: 'slug', render: (l) => <span className="font-mono text-rs-gold">rs.co/{l.slug}</span> },
                    { header: 'Origem', accessor: 'utmSource', render: (l) => <span className="text-xs bg-slate-700 px-2 py-1 rounded">{l.utmSource}</span> },
                    { header: 'Cliques', accessor: 'clicks', sortable: true, render: (l) => <span className="font-bold text-white">{l.clicks?.length || 0}</span> },
                    { header: 'Ações', accessor: 'actions', render: (l) => (
                        <div className="flex gap-2">
                             <button onClick={() => onRegisterClick(l.id)} className="p-1.5 text-slate-500 hover:text-emerald-400" title="Simular Clique"><MousePointerClick size={16}/></button>
                             <button onClick={() => setViewAnalyticsId(l.id)} className="p-1.5 text-slate-500 hover:text-rs-gold" title="Ver Analytics"><BarChart2 size={16}/></button>
                             <button onClick={() => onDeleteLink(l.id)} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
                    )}
                ]} 
                data={table.paginatedData}
                onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange}
                totalItems={table.totalItems} itemsPerPage={table.itemsPerPage} currentPage={table.currentPage} totalPages={table.totalPages} searchTerm={table.searchTerm} sortConfig={table.sortConfig}
                startIndex={table.startIndex} endIndex={table.endIndex}
            />

             <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Link Encurtado">
                 <form onSubmit={handleSave} className="p-6 space-y-4">
                     <div><label className="label-text">Nome Identificador</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field"/></div>
                     <div className="grid grid-cols-2 gap-4">
                         <div><label className="label-text">Slug (ex: promo-natal)</label><input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="input-field"/></div>
                         <div><label className="label-text">URL Original</label><input required type="url" value={formData.originalUrl} onChange={e => setFormData({...formData, originalUrl: e.target.value})} className="input-field"/></div>
                     </div>
                     <div className="border-t border-white/10 pt-4">
                         <h4 className="font-bold text-slate-300 mb-2">Parâmetros UTM</h4>
                         <div className="grid grid-cols-3 gap-4">
                             <div><label className="label-text">Source</label><input type="text" value={formData.utmSource} onChange={e => setFormData({...formData, utmSource: e.target.value})} className="input-field"/></div>
                             <div><label className="label-text">Medium</label><input type="text" value={formData.utmMedium} onChange={e => setFormData({...formData, utmMedium: e.target.value})} className="input-field"/></div>
                             <div><label className="label-text">Campaign</label><input type="text" value={formData.utmCampaign} onChange={e => setFormData({...formData, utmCampaign: e.target.value})} className="input-field"/></div>
                         </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-4">
                         <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                         <button type="submit" className="btn-primary">Criar Link</button>
                     </div>
                 </form>
             </ModalWrapper>

             {activeLink && (
                 <ModalWrapper isOpen={!!activeLink} onClose={() => setViewAnalyticsId(null)} title={`Analytics: ${activeLink.name}`} size="lg">
                     <div className="p-6 space-y-6">
                         <div className="grid grid-cols-3 gap-4">
                             <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
                                 <div className="text-slate-500 text-xs uppercase font-bold">Cliques Totais</div>
                                 <div className="text-2xl font-bold text-blue-400">{activeLink.clicks?.length || 0}</div>
                             </div>
                             <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
                                 <div className="text-slate-500 text-xs uppercase font-bold">Último Clique</div>
                                 <div className="text-lg font-bold text-slate-200">
                                     {activeLink.clicks && activeLink.clicks.length > 0 ? new Date(activeLink.clicks[0].timestamp).toLocaleDateString() : '-'}
                                 </div>
                             </div>
                         </div>
                         <div className="bg-rs-card border border-rs-goldDim/20 rounded-xl overflow-hidden">
                             <div className="p-3 bg-white/5 font-bold text-slate-300">Histórico Recente</div>
                             <div className="max-h-60 overflow-y-auto">
                                 <table className="w-full text-sm text-left">
                                     <thead className="text-slate-500 text-xs uppercase bg-black/20">
                                         <tr><th className="p-3">Data/Hora</th><th className="p-3">Local</th><th className="p-3">Dispositivo</th></tr>
                                     </thead>
                                     <tbody className="divide-y divide-white/5 text-slate-400">
                                         {activeLink.clicks?.map(c => (
                                             <tr key={c.id}>
                                                 <td className="p-3">{new Date(c.timestamp).toLocaleString()}</td>
                                                 <td className="p-3">{c.location || 'N/A'}</td>
                                                 <td className="p-3">{c.userAgent || 'N/A'}</td>
                                             </tr>
                                         ))}
                                         {(!activeLink.clicks || activeLink.clicks.length === 0) && <tr><td colSpan={3} className="p-4 text-center italic">Sem cliques ainda.</td></tr>}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     </div>
                 </ModalWrapper>
             )}
        </div>
    );
};

// --- 4. PIXEL GENERATOR (EXISTING) ---
const PixelGenerator: React.FC<MarketingToolsProps> = ({ pixels, onAddPixel, onUpdatePixel, onDeletePixel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({ platform: 'meta', name: '', config: {} });
    const [generatedCode, setGeneratedCode] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

    const handleOpenModal = (p?: TrackingPixel) => {
        if (p) {
            setEditingId(p.id);
            setFormData(p);
            // Re-generate preview if needed or load existing
        } else {
            setEditingId(null);
            setFormData({ platform: 'meta', name: '', config: {} });
            setGeneratedCode('');
            setSelectedEvents([]);
        }
        setIsModalOpen(true);
    };

    const handleGenerate = () => {
        const template = PIXEL_TEMPLATES[formData.platform as TrackingPixelPlatform];
        if (!template) return;

        let code = template.base;
        // Replace base placeholders
        Object.keys(formData.config).forEach(key => {
            code = code.replace(new RegExp(`{${key}}`, 'g'), formData.config[key]);
        });

        // Append events
        if (selectedEvents.length > 0) {
            code += '\n<!-- Events -->\n<script>\n';
            selectedEvents.forEach(evtKey => {
                let evtCode = template.events[evtKey];
                // Replace event placeholders (basic replacements for demo)
                evtCode = evtCode.replace('{VALUE}', '0.00').replace('{CURRENCY}', 'BRL');
                // Replace standard config keys in events too (like conversionId)
                Object.keys(formData.config).forEach(key => {
                     evtCode = evtCode.replace(new RegExp(`{${key}}`, 'g'), formData.config[key]);
                });
                code += evtCode + '\n';
            });
            code += '</script>';
        }

        setGeneratedCode(code);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) onUpdatePixel({ ...formData, id: editingId });
        else onAddPixel(formData);
        setIsModalOpen(false);
    };

    const currentPlatform = PIXEL_PLATFORMS.find(p => p.id === formData.platform);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end"><button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18}/> Novo Pixel</button></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pixels.map(p => (
                    <div key={p.id} className="bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl flex flex-col justify-between group hover:border-rs-gold/40 transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase text-slate-500">{PIXEL_PLATFORMS.find(pl => pl.id === p.platform)?.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(p)} className="text-slate-400 hover:text-blue-400"><Edit2 size={14}/></button>
                                    <button onClick={() => onDeletePixel(p.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-200">{p.name}</h4>
                            <div className="mt-2 text-xs font-mono text-slate-400 bg-black/20 p-2 rounded truncate">
                                ID: {Object.values(p.config)[0]}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Pixel' : 'Configurar Novo Pixel'} size="5xl">
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    <form onSubmit={handleSave} className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <div><label className="label-text">Nome do Pixel (Interno)</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Ex: Facebook Principal"/></div>
                        <div>
                            <label className="label-text">Plataforma</label>
                            <select value={formData.platform} onChange={e => {setFormData({...formData, platform: e.target.value, config: {}}); setSelectedEvents([]); setGeneratedCode('')}} className="input-field">
                                {PIXEL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                            <h4 className="font-bold text-slate-300 text-sm">Configuração Base</h4>
                            {currentPlatform?.fields.map(field => (
                                <div key={field.key}>
                                    <label className="label-text">{field.label}</label>
                                    <input required type="text" value={formData.config[field.key] || ''} onChange={e => setFormData({...formData, config: {...formData.config, [field.key]: e.target.value}})} className="input-field"/>
                                </div>
                            ))}
                        </div>

                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                            <h4 className="font-bold text-slate-300 text-sm">Eventos Padrão</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(PIXEL_TEMPLATES[formData.platform as TrackingPixelPlatform]?.events || {}).map(evt => (
                                    <label key={evt} className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-200">
                                        <input type="checkbox" checked={selectedEvents.includes(evt)} onChange={e => {
                                            if (e.target.checked) setSelectedEvents([...selectedEvents, evt]);
                                            else setSelectedEvents(selectedEvents.filter(x => x !== evt));
                                        }} className="accent-rs-gold"/>
                                        {evt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={handleGenerate} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors">Gerar Código</button>
                            <button type="submit" className="flex-1 btn-primary">Salvar Config</button>
                        </div>
                    </form>

                    <div className="flex-1 bg-[#1e1e1e] border-l border-white/10 p-6 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-300">Preview do Código</h4>
                            <button onClick={() => navigator.clipboard.writeText(generatedCode)} disabled={!generatedCode} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-slate-300 flex items-center gap-1"><Copy size={12}/> Copiar</button>
                        </div>
                        <div className="flex-1 bg-[#0a0a0a] rounded-xl border border-white/5 p-4 overflow-auto custom-scrollbar">
                            <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all">
                                {generatedCode || '// Preencha os dados e clique em Gerar Código...'}
                            </pre>
                        </div>
                        <div className="mt-4 text-xs text-slate-500 flex items-start gap-2">
                            <AlertTriangle size={14} className="shrink-0 text-yellow-500"/>
                            <p>Instale a parte "Base" no &lt;head&gt; de todas as páginas. Os eventos devem ser disparados em momentos específicos (ex: botão de compra ou página de obrigado).</p>
                        </div>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
};

// --- HELPER COMPONENTS ---
const InputNumber = ({ label, value, onChange, icon }: any) => (
    <div>
        <label className="label-text">{label}</label>
        <div className="relative">
            {icon && <span className="absolute left-3 top-2 text-slate-500 text-xs">{icon}</span>}
            <span className="absolute left-3 top-2 text-slate-500 text-xs">R$</span>
            <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value)||0)} className="input-field pl-8" />
        </div>
    </div>
);

const ResultCard = ({ label, value, subtext, color }: any) => (
    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="text-xs text-slate-500 font-bold uppercase">{label}</div>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
        {subtext && <div className="text-[10px] text-slate-600 mt-1">{subtext}</div>}
    </div>
);

// Styles
const styles = `
.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}
.btn-primary-sm{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.3rem 0.8rem;border-radius:0.4rem;font-size:0.8rem;}
.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}
.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}
.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}
`;

export default MarketingTools;