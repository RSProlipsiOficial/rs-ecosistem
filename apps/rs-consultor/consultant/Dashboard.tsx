import React, { FC, useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import { mockPromoBanners, generateMatrixNetwork, mockDirects, mockMatrixMembers } from './data';
import { sigmaApi, type SigmaConfig } from './services/sigmaApi';
import PinProgressGauge from './components/PinProgressGauge';
import * as icons from '../components/icons';
import { useUser, useDashboardConfig } from './ConsultantLayout';
import { Link } from 'react-router-dom';
import type { NetworkNode } from '../types';

const { IconCopy, IconAward, IconGitFork, IconStar, IconHandCoins, IconChevronLeft, IconChevronRight, IconUsers, IconShop, IconSparkles, IconMessage, IconWallet, IconDashboard } = icons;

const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const InfoLine: FC<{ label: string; value: string; valueClassName?: string }> = ({ label, value, valueClassName = '' }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-brand-text-dim">{label}:</span>
        <span className={`font-semibold text-brand-text-light text-right ${valueClassName}`}>{value}</span>
    </div>
);

const CopyableLink: FC<{ label: string; link: string; }> = ({ label, link }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div>
            <label className="text-sm text-brand-text-dim mb-1 block">{label}</label>
            <div className="flex">
                <input type="text" readOnly value={link} className="w-full bg-brand-dark text-brand-text-dim text-sm p-2 rounded-l-md border border-brand-gray-light focus:outline-none" />
                <button onClick={handleCopy} className={`w-12 h-10 flex items-center justify-center rounded-r-md text-brand-dark transition-colors ${copied ? 'bg-green-500' : 'bg-brand-gold hover:bg-yellow-400'}`}>
                    <IconCopy size={18} />
                </button>
            </div>
        </div>
    );
};

const UserInfoCard: FC = () => {
    const { user } = useUser();
    const { config } = useDashboardConfig();

    const statusDisplayMap: Record<string, { value: string, className: string }> = {
        active: { value: 'Ativo', className: 'text-sky-400' },
        inactive: { value: 'Inativo', className: 'text-red-400' },
        pending: { value: 'Pendente', className: 'text-yellow-400' },
    };

    return (
        <Card>
            <div className="flex items-center space-x-4 mb-6">
                <img src={user.avatarUrl} alt={user.name} className="h-20 w-20 rounded-full border-4 border-brand-gray-light shadow-lg" />
                <div>
                    <h3 className="text-lg font-bold text-brand-text-light">{user.name}</h3>
                    <p className="text-sm text-brand-text-dim flex items-center gap-1.5">
                        <span className="opacity-50">ID:</span>
                        <span className="font-black text-brand-gold uppercase tracking-tighter">{user.idConsultor}</span>
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                {config.userInfo.map(field => {
                    const rawValue = user[field.source as keyof typeof user] as string;
                    const display = statusDisplayMap[rawValue] || { value: rawValue, className: 'text-brand-gold uppercase font-bold' };

                    return (
                        <InfoLine
                            key={field.id}
                            label={field.label}
                            value={display.value}
                            valueClassName={display.className}
                        />
                    );
                })}

                <div className="!mt-6 pt-6 border-t border-brand-gray-light space-y-4">
                    {config.links.map(link => (
                        <CopyableLink
                            key={link.id}
                            label={link.label}
                            link={user[link.source as keyof typeof user] as string}
                        />
                    ))}
                </div>
            </div>
        </Card>
    )
};

const StatCard: FC<{ title: string, value: string, icon: string, path?: string }> = ({ title, value, icon, path }) => {
    const Icon = icons[icon as keyof typeof icons] || IconAward;
    const content = (
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-gold/20 rounded-full group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-300">
                <Icon size={24} className="text-brand-gold group-hover:text-brand-dark transition-colors" />
            </div>
            <div>
                <h4 className="text-sm text-brand-text-dim uppercase">{title}</h4>
                <p className="text-2xl font-bold text-white group-hover:text-brand-gold transition-colors" style={{ textShadow: '0 0 6px rgba(255, 255, 255, 0.3)' }}>{value}</p>
            </div>
        </div>
    );

    return path ? (
        <Link to={path} className="block group">
            <Card className="hover:border-brand-gold/50 hover:bg-white/[0.05] transition-all">
                {content}
            </Card>
        </Link>
    ) : (
        <Card>{content}</Card>
    );
};

const MatrixOverviewCard: FC<{ config?: SigmaConfig | null }> = ({ config }) => {
    const { user } = useUser();
    const currentCycles = user.totalCycles || 0;
    const pinTable = config?.career.pins || [];
    const nextPin = pinTable.find(p => p.cyclesRequired > currentCycles) || pinTable[pinTable.length - 1] || { name: '—' };

    return (
        <Card className="bg-gradient-to-br from-brand-gray to-brand-gray-dark border-2 border-brand-gold shadow-gold-glow">
            <h4 className="font-bold text-brand-text-light mb-4 flex items-center gap-2">
                <IconGitFork size={20} className="text-brand-gold" /> Performance SIGME
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/consultant/sigme/plano-carreira" className="p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gold/10 hover:border-brand-gold border border-transparent transition-all group">
                    <p className="text-[10px] text-brand-text-dim uppercase tracking-widest mb-1 group-hover:text-brand-gold">Ciclos Pessoais</p>
                    <p className="text-2xl font-black text-white">{currentCycles}</p>
                </Link>
                <Link to="/consultant/sigme/ciclo-global" className="p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gold/10 hover:border-brand-gold border border-transparent transition-all group">
                    <p className="text-[10px] text-brand-text-dim uppercase tracking-widest mb-1 group-hover:text-brand-gold">Ganhos Matriz</p>
                    <p className="text-2xl font-black text-white">{formatCurrency((user.bonusCicloGlobal || 0) + (user.bonusTopSigme || 0))}</p>
                </Link>
                <Link to="/consultant/sigme/plano-carreira" className="p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gold/10 hover:border-brand-gold border border-transparent transition-all group">
                    <p className="text-[10px] text-brand-text-dim uppercase tracking-widest mb-1 group-hover:text-brand-gold">Alvo de Carreira</p>
                    <p className="text-2xl font-black text-brand-gold">{(nextPin as any).name || (nextPin as any).pin}</p>
                </Link>
            </div>
        </Card>
    );
};



const PromoBannerCarousel: FC = () => {
    const { user } = useUser();
    const { config } = useDashboardConfig();
    const [currentIndex, setCurrentIndex] = useState(0);

    const banners = useMemo(() => {
        const dynamicBanners = config.promoBanners || [];

        // Se já temos banners dinâmicos, o oficial pode herdar o coverUrl do usuário ou um default limpo
        const official = {
            id: 'official-rs',
            title: 'RS Prólipsi',
            preTitle: 'Oficial',
            ctaText: 'Ver Novidades',
            imageUrl: user.coverUrl || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2000', // Tech Gold fallback
            imageDataUrl: undefined,
            price: 0
        };

        // Prioriza banners dinâmicos se existirem
        return dynamicBanners.length > 0 ? dynamicBanners : [official];
    }, [user.coverUrl, config.promoBanners]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length);
        }, 8000); // 8s para o banner oficial ter mais destaque
        return () => clearInterval(timer);
    }, [banners.length]);

    const goToSlide = (index: number) => setCurrentIndex(index);

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <Card className="p-0 overflow-hidden relative aspect-[2/1] md:aspect-[4/1] border-brand-gold/20 shadow-xl">
            {banners.map((banner, index) => (
                <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={banner.imageDataUrl || banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    {index !== 0 && ( // Só mostra gradiente/texto pros banners secundários
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-6 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest">{banner.preTitle}</h4>
                            <h3 className="text-2xl md:text-4xl font-extrabold text-white mt-1">{banner.title}</h3>
                            {banner.price > 0 && (
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-white/60 text-sm">A partir de</span>
                                    <span className="text-2xl font-black text-brand-gold">{formatCurrency(banner.price)}</span>
                                </div>
                            )}
                            <button className="mt-4 bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors self-start text-sm">
                                {banner.ctaText}
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                    <button key={index} onClick={() => goToSlide(index)} className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? 'w-4 bg-brand-gold' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </Card>
    );
};

const EmbeddedMatrixView: FC = () => {
    const { user } = useUser();
    const [directs, setDirects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sigmaApi.getDownlines(1, 'sigme').then(res => {
            if (res.success) {
                setDirects(res.data);
            }
            setLoading(false);
        });
    }, []);

    return (
        <Card className="border border-white/5">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-brand-text-light flex items-center gap-2 uppercase tracking-tighter text-lg">
                    <IconGitFork size={22} className="text-brand-gold" /> Matriz SIGME 6x6
                </h4>
                <Link to="/consultant/sigme/ciclo-global" className="text-[10px] text-brand-gold font-bold uppercase tracking-widest hover:underline">
                    Ver Plano de Carreira &rarr;
                </Link>
            </div>
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="h-8 w-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : directs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <IconUsers size={40} className="text-white/10 mb-4" />
                    <p className="text-brand-text-dim text-sm font-medium">Sua matriz está aguardando os primeiros indicados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-2">
                    {/* Mostrar apenas membros ativos na rede (isNetworkActive) */}
                    {Array.from({ length: 6 }).map((_, idx) => {
                        const node = directs.filter(d => d.isNetworkActive !== false)[idx];
                        if (!node) return (
                            <div key={`empty-${idx}`} className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-white/5 bg-white/[0.02] opacity-40">
                                <div className="h-12 w-12 rounded-full bg-brand-gray-light flex items-center justify-center border border-white/10">
                                    <span className="text-white/20 font-bold">{idx + 1}</span>
                                </div>
                                <p className="text-[9px] font-bold mt-3 text-white/20 uppercase tracking-widest">Vago</p>
                            </div>
                        );

                        return (
                            <div key={node.id} className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-brand-gold/50 transition-all group">
                                <div className="relative">
                                    <img src={(!node.avatarUrl || node.avatarUrl.includes('0aa67016')) ? '/logo-rs.png' : node.avatarUrl} alt={node.name} className="h-14 w-14 rounded-full border-2 border-brand-gold group-hover:scale-110 transition-transform shadow-lg" />
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-brand-dark flex items-center justify-center">
                                        <div className="h-2 w-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black mt-3 text-center truncate w-full text-white uppercase tracking-tighter">{node.name.split(' ')[0]}</p>
                                <p className="text-[9px] text-brand-gold font-bold uppercase tracking-[0.2em] mt-0.5">{node.pin || 'Consultor'}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

// ShortcutIconsCard removido por solicitação do Roberto


const Dashboard: React.FC = () => {
    const { user } = useUser();
    const { config } = useDashboardConfig();
    const [apiConfig, setApiConfig] = useState<SigmaConfig | null>(null);

    useEffect(() => {
        sigmaApi.getConfig().then(res => {
            if (res.success) setApiConfig(res.data);
        });
    }, []);

    const bonusSourceMap: Record<string, { title: string; icon: string; path: string }> = {
        bonusCicloGlobal: { title: 'Bônus Ciclo Global', icon: 'IconGitFork', path: '/consultant/sigme/ciclo-global' },
        bonusTopSigme: { title: 'Bônus Matriz SIGME', icon: 'IconStar', path: '/consultant/sigme/ciclo-global' },
        bonusPlanoCarreira: { title: 'Plano de Carreira', icon: 'IconAward', path: '/consultant/sigme/plano-carreira' },
        bonusProfundidade: { title: 'Bônus Profundidade', icon: 'IconUsers', path: '/consultant/sigme/bonus-profundidade' },
    };

    return (
        <div className="space-y-6">
            {/* Top Banner - Full Width */}
            <PromoBannerCarousel />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - User Profile & Bonus */}
                <div className="lg:col-span-4 space-y-6">
                    <UserInfoCard />
                    <div className="grid grid-cols-1 gap-6">
                        {config.bonusCards.map(card => {
                            const cardInfo = bonusSourceMap[card.source] || { title: 'Bônus', icon: 'IconAward', path: '#' };
                            const value = user[card.source as keyof typeof user] as number || 0;
                            return (
                                <StatCard
                                    key={card.id}
                                    title={cardInfo.title}
                                    value={value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    icon={cardInfo.icon}
                                    path={cardInfo.path}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Right Column - Matrix & Carrier Progression */}
                <div className="lg:col-span-8 space-y-6">
                    <MatrixOverviewCard config={apiConfig} />

                    <Link to="/consultant/sigme/plano-carreira" className="py-2 bg-black/20 rounded-3xl border border-white/5 shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center group hover:border-brand-gold/30 transition-all overflow-hidden">
                        <div className="flex flex-col items-center mb-0 pt-4 absolute top-4 z-10">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-2 group-hover:text-brand-gold transition-colors">Evolução de Carreira</h2>
                            <div className="h-1 w-12 bg-brand-gold rounded-full group-hover:w-24 transition-all"></div>
                        </div>
                        {/* Escala final ajustada para harmonia perfeita e centralização total */}
                        <div className="scale-[0.5] md:scale-[0.6] origin-center -mb-8 transform-gpu transition-all group-hover:scale-[0.52] md:group-hover:scale-[0.62]">
                            <PinProgressGauge user={user} apiConfig={apiConfig} pinLogos={config.pinLogos} size="lg" />
                        </div>
                        <div className="absolute bottom-6 text-[9px] font-bold text-brand-gold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver Detalhes do Plano &rarr;
                        </div>
                    </Link>

                    <EmbeddedMatrixView />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;