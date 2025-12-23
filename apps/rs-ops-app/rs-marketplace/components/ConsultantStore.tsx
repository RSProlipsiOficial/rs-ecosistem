

import React, { useMemo, useState, useRef } from 'react';
import { View, DashboardSettings, Banner, UserProfile, NetworkActivityItem, DashboardComponent, CompensationSettings, CompensationTier, DashboardCard } from '../types';
import Carousel from './Carousel';
import { CopyIcon } from './icons/CopyIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';

// Import all available icons
import { AffiliateIcon } from './icons/AffiliateIcon';
import { DistributionIcon } from './icons/DistributionIcon';
import { TruckIcon } from './icons/TruckIcon';
import { GlobalIcon } from './icons/GlobalIcon';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { WalletIcon } from './icons/WalletIcon';
import { OrdersIcon } from './icons/OrdersIcon';
import { ProductsIcon } from './icons/ProductsIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { TagIcon } from './icons/TagIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { LinkChainIcon } from './icons/LinkChainIcon';
import { UserIcon } from './icons/UserIcon';
import { BellIcon } from './icons/BellIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
// Fix: Imported missing UserPlusIcon and ShoppingCartIcon
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface ConsultantStoreProps {
    onNavigate: (view: View, data?: any) => void;
    banners: Banner[];
    settings: DashboardSettings;
    userProfile: UserProfile;
    bonuses: { [key: string]: number };
    networkActivity: NetworkActivityItem[];
    userPoints: number;
    monthlyUserPoints: number;
    compensationSettings: CompensationSettings;
    weeklyBonuses: { day: string; bonus: number }[];
}

const componentIconMap: { [key: string]: React.FC<any> } = {
    AffiliateIcon, DistributionIcon, TruckIcon, GlobalIcon, StarOutlineIcon,
    TrophyIcon, WalletIcon, OrdersIcon, ProductsIcon, AnalyticsIcon, TagIcon,
    MegaphoneIcon, LinkChainIcon, UserIcon, BellIcon, ShoppingBagIcon, UserPlusIcon, ShoppingCartIcon
};

// FIX: Add adminViewTitles to resolve 'Cannot find name' error in ShortcutCard.
const adminViewTitles: Partial<Record<View, string>> = {
    consultantStore: 'Painel do Consultor',
    manageProducts: 'Produtos',
    addEditProduct: 'Adicionar/Editar Produto',
    editDropshippingProduct: 'Editar Produto Dropshipping',
    manageInventory: 'Gerenciar Estoque',
    manageOrders: 'Pedidos',
    orderDetail: 'Detalhes do Pedido',
    manageReturns: 'Gerenciar Devoluções',
    returnDetail: 'Detalhes da Devolução',
    manageDropshippingOrders: 'Pedidos Dropshipping',
    managePromotions: 'Cupons de Desconto',
    addEditCoupon: 'Adicionar/Editar Cupom',
    addEditMarketingPixel: 'Adicionar/Editar Pixel',
    storeEditor: 'Aparência da Loja',
    virtualOfficeDropshipping: 'Produtos Dropshipping',
    virtualOfficeAffiliateLinks: 'Links de Afiliado',
    virtualOfficePixels: 'Pixels de Marketing',
    virtualOfficeLinkShortener: 'Encurtador de Link',
    bannerDashboard: 'Banners do Painel',
    dashboardEditor: 'Editor do Painel',
    storeBannerEditor: 'Banners da Loja',
    managePayments: 'Configurações de Pagamento',
    manageShipping: 'Configurações de Frete',
    compensationPlan: 'Plano de Compensação',
    manageCollections: 'Coleções',
    addEditCollection: 'Adicionar/Editar Coleção',
    dropshippingCatalog: 'Catálogo Dropshipping',
    manageAffiliates: 'Programa de Afiliados',
    walletOverview: 'WalletPay - Visão Geral',
    walletReports: 'WalletPay - Extrato e Relatórios',
    walletTransfers: 'WalletPay - Transferências',
    walletCharges: 'WalletPay - Cobranças',
    walletSettings: 'WalletPay - Configurações',
    userProfileEditor: 'Meu Perfil',
    manageAnnouncements: 'Gerenciar Comunicados',
    addEditAnnouncement: 'Adicionar/Editar Comunicado',
    manageTrainings: 'Gerenciar Treinamentos',
    addEditTraining: 'Adicionar/Editar Treinamento',
    manageMarketingAssets: 'Gerenciar Materiais de Marketing',
    addEditMarketingAsset: 'Adicionar/Editar Material de Marketing',
};

const UserInfoCard: React.FC<{ profile: UserProfile, visibleFields: DashboardComponent['visibleFields'] }> = ({ profile, visibleFields }) => (
    <div className="bg-black border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
            <img src={profile.avatarUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#d4af37]" />
            <div>
                <h3 className="font-bold text-sm text-white">{profile.name}</h3>
                {visibleFields?.id && <p className="text-[10px] text-slate-500">ID: {profile.id}</p>}
            </div>
        </div>
        <div className="space-y-1.5 text-xs">
            {visibleFields?.graduation && <div className="flex justify-between"><span className="text-slate-400">Graduação:</span><span className="font-semibold text-[#d4af37]">{profile.graduation}</span></div>}
            {visibleFields?.accountStatus && <div className="flex justify-between"><span className="text-slate-400">Status:</span><span className="font-semibold text-emerald-400">{profile.accountStatus}</span></div>}
            {visibleFields?.monthlyActivity && <div className="flex justify-between"><span className="text-slate-400">Atividade:</span><span className="font-semibold text-emerald-400">{profile.monthlyActivity}</span></div>}
            {visibleFields?.category && <div className="flex justify-between"><span className="text-slate-400">Categoria:</span><span className="font-semibold text-[#d4af37]">{profile.category}</span></div>}
        </div>
    </div>
);

const LinksCard: React.FC<{ referral: string; affiliate: string }> = ({ referral, affiliate }) => {
    const [copied, setCopied] = React.useState<'referral' | 'affiliate' | null>(null);

    const handleCopy = (type: 'referral' | 'affiliate') => {
        navigator.clipboard.writeText(type === 'referral' ? referral : affiliate);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-4 space-y-3">
            <div>
                <label className="text-xs text-[rgb(var(--color-brand-text-dim))]">Link de Indicação</label>
                <div className="flex items-center gap-2">
                    <input type="text" readOnly value={referral} className="w-full bg-[rgb(var(--color-brand-gray))]/[.50] text-[rgb(var(--color-brand-text-dim))] text-sm rounded-md px-2 py-1 border border-[rgb(var(--color-brand-gray-light))]" />
                    <button onClick={() => handleCopy('referral')} className="p-2 bg-[rgb(var(--color-brand-gray))] rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">
                        {copied === 'referral' ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-[rgb(var(--color-success))]" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <div>
                <label className="text-xs text-[rgb(var(--color-brand-text-dim))]">Link de Afiliado</label>
                <div className="flex items-center gap-2">
                    <input type="text" readOnly value={affiliate} className="w-full bg-[rgb(var(--color-brand-gray))]/[.50] text-[rgb(var(--color-brand-text-dim))] text-sm rounded-md px-2 py-1 border border-[rgb(var(--color-brand-gray-light))]" />
                    <button onClick={() => handleCopy('affiliate')} className="p-2 bg-[rgb(var(--color-brand-gray))] rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">
                        {copied === 'affiliate' ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-[rgb(var(--color-success))]" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const QualificationProgress: React.FC<{ component: DashboardComponent; tiers: CompensationTier[] }> = ({ component, tiers }) => {
    const { title, value = 0, max = 100 } = component;
    const rawPercentage = max > 0 ? (value / max) * 100 : 0;
    const percentage = Math.min(rawPercentage, 100);

    const startTier = tiers.find(t => t.name === component.startLabel);
    const endTier = tiers.find(t => t.name === component.endLabel);

    const StartIconComponent = component.startIcon ? componentIconMap[component.startIcon] : null;
    const EndIconComponent = component.endIcon ? componentIconMap[component.endIcon] : null;


    return (
        <div className="bg-black border border-white/10 rounded-xl p-3">
            <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-semibold text-xs text-slate-200">{title}</h4>
                <span className="font-bold text-[#d4af37] text-xs">{rawPercentage.toFixed(0)}%</span>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute h-2 bg-[#d4af37] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[#d4af37]">
                {startTier?.pinImageUrl ?
                    <img src={startTier.pinImageUrl} alt={startTier?.name} className="w-5 h-5 object-contain" title={component.startLabel} /> :
                    (StartIconComponent ? <StartIconComponent className="w-4 h-4" title={component.startLabel} /> : <div className="w-5 h-5"></div>)
                }
                {endTier?.pinImageUrl ?
                    <img src={endTier.pinImageUrl} alt={endTier?.name} className="w-5 h-5 object-contain" title={component.endLabel} /> :
                    (EndIconComponent ? <EndIconComponent className="w-4 h-4" title={component.endLabel} /> : <div className="w-5 h-5"></div>)
                }
            </div>
        </div>
    );
};

const BonusCard: React.FC<{ card: DashboardCard; value: number }> = ({ card, value }) => {
    const Icon = componentIconMap[card.icon];
    return (
        <div className="bg-black border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
            {Icon && <div className="p-1.5 bg-[#d4af37]/10 rounded-lg"><Icon className="w-5 h-5 text-[#d4af37]" /></div>}
            <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-base font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</p>
            </div>
        </div>
    );
};

const IncentivesProgram: React.FC<{ component: DashboardComponent }> = ({ component }) => (
    <div className="bg-black border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">{component.title}</h3>
        <div className="grid grid-cols-2 gap-4">
            {component.content?.map((item, index) => (
                <div key={index}>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">{item.title}</span>
                        <span className="font-semibold text-[#d4af37]">{item.progress}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="absolute h-2 bg-[#d4af37] rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const NetworkActivityFeed: React.FC<{ title?: string, items: NetworkActivityItem[] }> = ({ title, items }) => {
    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4">{title || 'Atividade da Rede'}</h3>
            <ul className="space-y-4">
                {items.map(item => {
                    const Icon = componentIconMap[item.icon];
                    return (
                        <li key={item.id} className="flex items-start gap-3 border-l border-[rgb(var(--color-brand-gold))] pl-3 border-b border-[rgb(var(--color-brand-gray-light))] pb-4 last:border-b-0">
                            <div className="p-1.5 bg-[rgb(var(--color-brand-gray))] rounded-full mt-1">
                                {Icon && <Icon className="w-5 h-5 text-[rgb(var(--color-brand-gold))]" />}
                            </div>
                            <div>
                                {/* Fix: Used dangerouslySetInnerHTML to render HTML string from NetworkActivityItem.text */}
                                <p className="text-sm text-[rgb(var(--color-brand-text-dim))]" dangerouslySetInnerHTML={{ __html: item.text }}></p>
                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">{item.timestamp}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const ShortcutCard: React.FC<{ component: DashboardComponent; onNavigate: (view: View) => void }> = ({ component, onNavigate }) => {
    const Icon = component.icon ? componentIconMap[component.icon] : LinkChainIcon;
    const isInternalLink = Object.keys(adminViewTitles).includes(component.url || '');

    const handleClick = (e: React.MouseEvent) => {
        if (isInternalLink && component.url) {
            e.preventDefault();
            onNavigate(component.url as View);
        }
    };

    return (
        <a href={isInternalLink ? '#' : component.url || '#'} onClick={handleClick} className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-4 flex items-center gap-4 hover:bg-[rgb(var(--color-brand-gray))]/[.50] transition-colors">
            <div className="p-2 bg-[rgb(var(--color-brand-gold))]/[.10] rounded-full">
                <Icon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]" />
            </div>
            <h4 className="font-semibold text-[rgb(var(--color-brand-text-light))]">{component.title}</h4>
        </a>
    );
};

const PerformanceChartCard: React.FC<{ title?: string; data: { day: string; bonus: number }[] }> = ({ title, data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const chartHeight = 150;
    const chartWidth = 400; // Increased width
    const yAxisWidth = 40;
    const xAxisHeight = 20;
    const maxValue = Math.ceil(Math.max(...data.map(d => d.bonus), 0) / 100) * 100 || 100; // Round up to nearest 100

    const handleMouseMove = (e: React.MouseEvent, day: string, bonus: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 10,
            content: `${day}: R$ ${bonus.toFixed(2)}`
        });
    };

    const yAxisLabels = [0, maxValue / 2, maxValue].map(value => ({
        value,
        y: chartHeight - (chartHeight * (value / maxValue))
    }));

    return (
        <div ref={containerRef} className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-6 relative">
            <style>{`
                @keyframes grow-bar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                .bar-rect { transform-origin: bottom; animation: grow-bar 0.5s ease-out forwards; transition: filter 0.2s ease-in-out; }
                .bar-rect:hover { filter: brightness(1.2); }
            `}</style>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-brand-text-light))] mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-[rgb(var(--color-brand-gold))]" />
                {title}
            </h3>
            <div className="relative h-[180px]">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight + xAxisHeight}`} width="100%" height="100%">
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(var(--color-brand-gold))" />
                            <stop offset="100%" stopColor="rgb(var(--color-warning))" />
                        </linearGradient>
                    </defs>

                    {/* Y-Axis Labels and Grid Lines */}
                    {yAxisLabels.map(({ value, y }) => (
                        <g key={value}>
                            <text x={yAxisWidth - 8} y={y + 4} textAnchor="end" fill="rgb(var(--color-brand-text-dim))" fontSize="10">
                                {value}
                            </text>
                            <line
                                x1={yAxisWidth} x2={chartWidth}
                                y1={y} y2={y}
                                stroke="rgb(var(--color-brand-gray-light))" strokeWidth="0.5" strokeDasharray="2,2"
                            />
                        </g>
                    ))}

                    {/* Bars and X-Axis Labels */}
                    <g transform={`translate(${yAxisWidth}, 0)`}>
                        {data.map((item, index) => {
                            const barContainerWidth = (chartWidth - yAxisWidth) / data.length;
                            const barWidth = barContainerWidth * 0.5;
                            const barHeight = maxValue > 0 ? (item.bonus / maxValue) * chartHeight : 0;
                            const x = index * barContainerWidth + (barContainerWidth - barWidth) / 2;

                            return (
                                <g key={index}>
                                    <rect
                                        className="bar-rect"
                                        x={x}
                                        y={chartHeight - barHeight}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="url(#barGradient)"
                                        rx="2"
                                        onMouseMove={(e) => handleMouseMove(e, item.day, item.bonus)}
                                        onMouseOut={() => setTooltip(null)}
                                        style={{ animationDelay: `${index * 70}ms` }}
                                    />
                                    <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fill="rgb(var(--color-brand-text-dim))" fontSize="12">{item.day}</text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
                {tooltip && (
                    <div
                        className="absolute bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] text-xs rounded-md py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full shadow-lg"
                        style={{ left: tooltip.x, top: tooltip.y }}
                    >
                        {tooltip.content}
                    </div>
                )}
            </div>
        </div>
    );
};


const renderDashboardComponent = (
    component: DashboardComponent,
    props: ConsultantStoreProps
) => {
    switch (component.type) {
        case 'userInfo':
            return <UserInfoCard profile={props.userProfile} visibleFields={component.visibleFields} />;
        case 'referralLinks':
            return <LinksCard referral={props.userProfile.referralLink} affiliate={props.userProfile.affiliateLink} />;
        case 'qualificationProgress':
            return <QualificationProgress component={component} tiers={props.compensationSettings.tiers} />;
        case 'adminBanner':
            return <Carousel banners={props.banners} className="h-full rounded-lg overflow-hidden" />;
        case 'bonusCards':
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {props.settings.cards.map(card => {
                        // @ts-ignore
                        const value = props.bonuses[card.dataKey as keyof typeof props.bonuses] || 0;
                        return <BonusCard key={card.id} card={card} value={value} />
                    })}
                </div>
            );
        case 'incentivesProgram':
            return <IncentivesProgram component={component} />;
        case 'networkActivity':
            return <NetworkActivityFeed title={component.title} items={props.networkActivity} />;
        case 'shortcut':
            return <ShortcutCard component={component} onNavigate={props.onNavigate} />;
        case 'performanceChart':
            return <PerformanceChartCard title={component.title} data={props.weeklyBonuses} />;
        default:
            return null;
    }
}

const getTierProgress = (points: number, tiers: CompensationTier[]) => {
    if (!tiers || tiers.length === 0) {
        return { currentTier: null, nextTier: null, value: 0, max: 100, startLabel: 'N/A', endLabel: 'N/A' };
    }

    const sortedTiers = [...tiers].sort((a, b) => a.pointsRequired - b.pointsRequired);

    const currentTier = sortedTiers.slice().reverse().find(t => points >= t.pointsRequired);
    const currentTierIndex = currentTier ? sortedTiers.findIndex(t => t.id === currentTier.id) : -1;
    const nextTier = currentTierIndex > -1 ? sortedTiers[currentTierIndex + 1] : sortedTiers[0];

    const previousTierPoints = currentTierIndex > 0 ? sortedTiers[currentTierIndex - 1].pointsRequired : 0;

    const startLabel = currentTier ? currentTier.name : 'Iniciante';
    const endLabel = nextTier ? nextTier.name : (currentTier ? currentTier.name : 'N/A');

    const max = nextTier ? nextTier.pointsRequired - previousTierPoints : (currentTier ? currentTier.pointsRequired - previousTierPoints : (sortedTiers[0]?.pointsRequired || 100));
    const value = points - previousTierPoints;

    return {
        value,
        max,
        startLabel,
        endLabel
    };
};

const ConsultantStore: React.FC<ConsultantStoreProps> = (props) => {
    const { settings, userPoints, monthlyUserPoints, compensationSettings } = props;

    const dynamicSettings = useMemo(() => {
        const newSettings: DashboardSettings = JSON.parse(JSON.stringify(settings)); // Deep copy

        const lifetimeProgress = getTierProgress(userPoints, compensationSettings.tiers);
        const monthlyProgress = getTierProgress(monthlyUserPoints, compensationSettings.tiers);

        newSettings.components = newSettings.components.map((comp: DashboardComponent) => {
            if (comp.type === 'qualificationProgress') {
                if (comp.id === 'comp-qual-current' || comp.id === 'comp-qual-next') {
                    return { ...comp, ...lifetimeProgress };
                }
                if (comp.id === 'comp-qual-month') {
                    return { ...comp, ...monthlyProgress };
                }
            }
            return comp;
        });
        return newSettings;

    }, [settings, userPoints, monthlyUserPoints, compensationSettings]);

    const adminBannerComponent = dynamicSettings.components.find(c => c.type === 'adminBanner' && c.enabled);

    const leftColumnComponents = dynamicSettings.components.filter(c => c.column === 'left' && c.enabled);
    const rightColumnComponents = dynamicSettings.components.filter(c => c.column === 'right' && c.enabled && c.type !== 'adminBanner');

    const dynamicProps = { ...props, settings: dynamicSettings };

    return (
        <div className="space-y-4">
            {/* Banner GRANDE no topo */}
            {adminBannerComponent && (
                <div key={adminBannerComponent.id} className="h-[220px] rounded-xl overflow-hidden">
                    {renderDashboardComponent(adminBannerComponent, dynamicProps)}
                </div>
            )}

            {/* Perfil + Barras de Qualificação lado a lado - 50/50 */}
            <div className="grid grid-cols-2 gap-4">
                {leftColumnComponents.filter(c => c.type === 'userInfo').map(component => (
                    <div key={component.id}>
                        {renderDashboardComponent(component, dynamicProps)}
                    </div>
                ))}
                <div className="space-y-3">
                    {leftColumnComponents.filter(c => c.type === 'qualificationProgress').map(component => (
                        <div key={component.id}>
                            {renderDashboardComponent(component, dynamicProps)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Resto do conteúdo em 2 colunas */}
            <div className="grid grid-cols-2 gap-4">
                {/* Coluna Esquerda */}
                <div className="space-y-4">
                    {leftColumnComponents.filter(c => c.type !== 'userInfo' && c.type !== 'qualificationProgress').map(component => (
                        <div key={component.id}>
                            {renderDashboardComponent(component, dynamicProps)}
                        </div>
                    ))}
                </div>

                {/* Coluna Direita */}
                <div className="space-y-4">
                    {rightColumnComponents.map(component => (
                        <div key={component.id}>
                            {renderDashboardComponent(component, dynamicProps)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConsultantStore;