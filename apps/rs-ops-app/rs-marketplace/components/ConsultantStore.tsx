import React, { useEffect, useMemo, useState } from 'react';
import { Banner, CompensationSettings, CompensationTier, DashboardSettings, NetworkActivityItem, UserProfile, View } from '../types';
import Carousel from './Carousel';
import PinProgressGauge from './PinProgressGauge';
import { AffiliateIcon } from './icons/AffiliateIcon';
import { ClipboardDocumentCheckIcon } from './icons/ClipboardDocumentCheckIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DistributionIcon } from './icons/DistributionIcon';
import { GlobalIcon } from './icons/GlobalIcon';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';

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
    careerProgress?: {
        currentPinName?: string;
        nextPinName?: string;
        nextLevelVolume?: number;
    };
}

interface GaugePinData {
    name: string;
    value: number;
    imageUrl?: string;
}

interface MatrixSlot {
    id: string;
    name: string;
    pin: string;
    active: boolean;
}

const cardShellClass = 'bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-xl shadow-lg shadow-black/30';
const DEFAULT_AVATAR_URL = 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png';

const normalizeAvatarUrl = (value: unknown) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed || ['null', 'undefined', '[object Object]'].includes(trimmed)) return '';
    return trimmed;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
}).format(value || 0);

const formatInteger = (value: number) => new Intl.NumberFormat('pt-BR').format(Math.max(0, Math.round(value || 0)));

const DashboardCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`${cardShellClass} p-4 sm:p-5 ${className}`}>
        {children}
    </div>
);

const getStoredAvatar = (fallbackAvatar: string) => {
    try {
        const rawProfile = localStorage.getItem('rs-consultant-full-profile') || localStorage.getItem('rs-consultant-profile');
        if (!rawProfile) return fallbackAvatar;

        const parsed = JSON.parse(rawProfile);
        return normalizeAvatarUrl(parsed?.avatarUrl || parsed?.avatar_url) || fallbackAvatar;
    } catch {
        return fallbackAvatar;
    }
};

const resolveCareerPins = (
    points: number,
    tiers: CompensationTier[],
    fallbackLabel: string,
    careerProgress?: ConsultantStoreProps['careerProgress']
): { currentPin: GaugePinData; nextPin: GaugePinData } => {
    const sortedTiers = [...tiers].sort((a, b) => a.pointsRequired - b.pointsRequired);

    if (sortedTiers.length === 0) {
        return {
            currentPin: { name: fallbackLabel || 'Consultor', value: 0 },
            nextPin: { name: 'Meta', value: 100 }
        };
    }

    const normalize = (value: string) => value.trim().toLowerCase();
    const currentNamedTier = careerProgress?.currentPinName
        ? sortedTiers.find((tier) => normalize(tier.name) === normalize(careerProgress.currentPinName || ''))
        : null;
    const nextNamedTier = careerProgress?.nextPinName
        ? sortedTiers.find((tier) => normalize(tier.name) === normalize(careerProgress.nextPinName || ''))
        : null;

    if (careerProgress?.currentPinName || careerProgress?.nextPinName) {
        const targetTier = nextNamedTier || currentNamedTier || sortedTiers[0];

        return {
            currentPin: {
                name: currentNamedTier?.name || careerProgress?.currentPinName || fallbackLabel || 'Consultor',
                value: currentNamedTier ? currentNamedTier.pointsRequired : 0,
                imageUrl: currentNamedTier?.pinImageUrl
            },
            nextPin: {
                name: targetTier.name,
                value: Number(careerProgress?.nextLevelVolume ?? targetTier.pointsRequired ?? 0),
                imageUrl: targetTier.pinImageUrl
            }
        };
    }

    const currentTier = sortedTiers.slice().reverse().find((tier) => points >= tier.pointsRequired) || null;
    const currentTierIndex = currentTier ? sortedTiers.findIndex((tier) => tier.id === currentTier.id) : -1;
    const nextTier = currentTierIndex >= 0 ? (sortedTiers[currentTierIndex + 1] || currentTier) : sortedTiers[0];

    return {
        currentPin: currentTier
            ? { name: currentTier.name, value: currentTier.pointsRequired, imageUrl: currentTier.pinImageUrl }
            : { name: fallbackLabel || 'Consultor', value: 0 },
        nextPin: nextTier
            ? { name: nextTier.name, value: nextTier.pointsRequired, imageUrl: nextTier.pinImageUrl }
            : { name: 'Meta', value: Math.max(points, 100) }
    };
};

const extractNameFromActivity = (text: string) => {
    const match = text.match(/<strong>(.*?)<\/strong>/i);
    const candidate = (match?.[1] || '').replace(/<[^>]+>/g, '').trim();

    if (!candidate) return '';
    if (/r\$/i.test(candidate)) return '';
    return candidate;
};

const getInitials = (name: string) => {
    const cleaned = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim();
    if (!cleaned) return 'RS';

    const parts = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);
    if (parts.length === 0) return 'RS';
    return parts.map((part) => part[0]).join('').toUpperCase();
};

const buildMatrixSlots = (items: NetworkActivityItem[], currentPinName: string): MatrixSlot[] => {
    const names = items
        .map((item) => extractNameFromActivity(item.text))
        .filter(Boolean)
        .slice(0, 6);

    return Array.from({ length: 6 }, (_, index) => {
        const name = names[index] || `Vago ${index + 1}`;
        return {
            id: `matrix-slot-${index + 1}`,
            name,
            pin: names[index] ? currentPinName : 'Aguardando',
            active: Boolean(names[index])
        };
    });
};

const CopyableField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-[rgb(var(--color-brand-text-dim))]">
                {label}
            </label>
            <div className="flex">
                <input
                    type="text"
                    readOnly
                    value={value}
                    className="h-10 w-full rounded-l-md border border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-dark))] px-3 text-xs text-[rgb(var(--color-brand-text-dim))] focus:outline-none"
                />
                <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex h-10 w-11 items-center justify-center rounded-r-md transition-colors ${copied ? 'bg-emerald-500 text-black' : 'bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] hover:bg-yellow-400'}`}
                    aria-label={`Copiar ${label}`}
                >
                    {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
};

const DashboardBanner: React.FC<{ banners: Banner[] }> = ({ banners }) => {
    if (!Array.isArray(banners) || banners.length === 0) {
        return (
            <DashboardCard className="overflow-hidden p-0">
                <div className="flex aspect-[4/1] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_35%),linear-gradient(135deg,rgba(12,18,30,0.96),rgba(4,8,16,0.96))]">
                    <div className="text-center">
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[rgb(var(--color-brand-gold))]">Painel do Consultor</p>
                        <h2 className="mt-3 text-3xl font-black text-white">Configure um banner no admin</h2>
                    </div>
                </div>
            </DashboardCard>
        );
    }

    return (
        <Carousel
            banners={banners}
            height={260}
            mobileHeight={170}
            className="rounded-xl overflow-hidden border border-[rgb(var(--color-brand-gray-light))] shadow-xl"
        />
    );
};

const UserInfoCard: React.FC<{ profile: UserProfile; currentPinName: string }> = ({ profile, currentPinName }) => {
    const fallbackAvatar = normalizeAvatarUrl(profile.avatarUrl) || DEFAULT_AVATAR_URL;
    const [avatarUrl, setAvatarUrl] = useState(() => getStoredAvatar(fallbackAvatar));
    const [avatarImgError, setAvatarImgError] = useState(false);
    const loginId = profile.loginId || profile.idConsultor || profile.slug || '---';
    const accountId = profile.code || (profile.idNumerico ? String(profile.idNumerico) : '---');

    useEffect(() => {
        const syncAvatar = () => {
            setAvatarUrl(getStoredAvatar(fallbackAvatar));
            setAvatarImgError(false);
        };

        syncAvatar();
        window.addEventListener('rs-consultant-profile-updated', syncAvatar as EventListener);
        window.addEventListener('storage', syncAvatar);

        return () => {
            window.removeEventListener('rs-consultant-profile-updated', syncAvatar as EventListener);
            window.removeEventListener('storage', syncAvatar);
        };
    }, [fallbackAvatar]);

    useEffect(() => {
        setAvatarImgError(false);
    }, [avatarUrl]);

    return (
        <DashboardCard>
            <div className="mb-5 flex items-center gap-3">
                {!avatarImgError ? (
                    <img
                        src={normalizeAvatarUrl(avatarUrl) || fallbackAvatar}
                        alt={profile.name}
                        className="h-14 w-14 rounded-full border-2 border-[rgb(var(--color-brand-gold))] object-cover shadow-lg"
                        onError={() => setAvatarImgError(true)}
                    />
                ) : (
                    <img
                        src={DEFAULT_AVATAR_URL}
                        alt={profile.name}
                        className="h-14 w-14 rounded-full border-2 border-[rgb(var(--color-brand-gold))] object-cover shadow-lg"
                    />
                )}
                <div className="min-w-0">
                    <h3 className="truncate text-base font-black uppercase tracking-tight text-[rgb(var(--color-brand-text-light))]">
                        {profile.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[rgb(var(--color-brand-text-dim))]">
                        <span className="opacity-60">LOGIN/MMN ID:</span>
                        <span className="rounded border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-gold))]/10 px-2 py-0.5 font-black lowercase tracking-widest text-[rgb(var(--color-brand-gold))]">
                            {String(loginId).toLowerCase()}
                        </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[rgb(var(--color-brand-text-dim))]">
                        <span className="opacity-60">ID CONTA:</span>
                        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-black tracking-widest text-white">
                            {accountId}
                        </span>
                    </p>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-brand-text-dim))]">Nome:</span>
                    <span className="text-right font-bold uppercase text-[rgb(var(--color-brand-text-light))]">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-brand-text-dim))]">Graduacao:</span>
                    <span className="text-right font-black uppercase text-[rgb(var(--color-brand-gold))]">{currentPinName || profile.graduation}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-brand-text-dim))]">PIN:</span>
                    <span className="text-right font-black uppercase text-[rgb(var(--color-brand-gold))]">{currentPinName}</span>
                </div>
            </div>

            <div className="mt-5 space-y-4 border-t border-[rgb(var(--color-brand-gray-light))] pt-5">
                <div className="rounded-xl border border-[rgb(var(--color-brand-gold))]/20 bg-[rgb(var(--color-brand-gold))]/5 p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[rgb(var(--color-brand-gold))]">Acesso Rapido</p>
                    <a
                        href={profile.referralLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[rgb(var(--color-brand-gold))] px-4 text-xs font-black uppercase tracking-[0.18em] text-[rgb(var(--color-brand-dark))] transition-colors hover:bg-yellow-400"
                    >
                        <UserPlusIcon className="h-4 w-4" />
                        Cadastrar Novo Parceiro
                    </a>
                    <p className="mt-2 text-center text-[10px] italic text-[rgb(var(--color-brand-text-dim))] opacity-75">
                        Sistema Marketplace RS
                    </p>
                </div>

                <CopyableField label="Link de Indicacao" value={profile.referralLink} />
                <CopyableField label="Link de Afiliado" value={profile.affiliateLink} />
            </div>
        </DashboardCard>
    );
};

const BonusSummaryCard: React.FC<{ title: string; value: number; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ title, value, icon: Icon }) => (
    <DashboardCard className="group transition-colors hover:border-[rgb(var(--color-brand-gold))]/45">
        <div className="flex items-center gap-3">
            <div className="rounded-full bg-[rgb(var(--color-brand-gold))]/15 p-2.5 text-[rgb(var(--color-brand-gold))] transition-colors group-hover:bg-[rgb(var(--color-brand-gold))] group-hover:text-[rgb(var(--color-brand-dark))]">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[rgb(var(--color-brand-text-dim))]">
                    {title}
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                    {formatCurrency(value)}
                </p>
            </div>
        </div>
    </DashboardCard>
);

const PerformanceOverviewCard: React.FC<{ currentPoints: number; matrixGains: number; nextPinName: string }> = ({ currentPoints, matrixGains, nextPinName }) => (
    <DashboardCard className="border-[rgb(var(--color-brand-gold))]/20 bg-[linear-gradient(135deg,rgba(26,33,48,0.96),rgba(17,24,39,0.96))]">
        <div className="mb-4 flex items-center gap-2">
            <GlobalIcon className="h-5 w-5 text-[rgb(var(--color-brand-gold))]" />
            <h4 className="text-sm font-bold text-[rgb(var(--color-brand-text-light))]">Performance SIGME</h4>
        </div>
        <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
        >
            <div className="min-w-0 rounded-lg border border-[rgb(var(--color-brand-gold))]/25 bg-[rgb(var(--color-brand-gray-light))]/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[rgb(var(--color-brand-text-dim))]">Ciclos Pessoais</p>
                <p className="mt-2 text-3xl font-black text-white">{formatInteger(currentPoints)}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray-light))]/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[rgb(var(--color-brand-text-dim))]">Ganhos Matriz</p>
                <p className="mt-2 text-3xl font-black text-white">{formatCurrency(matrixGains)}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray-light))]/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[rgb(var(--color-brand-text-dim))]">Alvo de Carreira</p>
                <p className="mt-2 text-3xl font-black text-[rgb(var(--color-brand-gold))]">{nextPinName}</p>
            </div>
        </div>
    </DashboardCard>
);

const CareerProgressCard: React.FC<{ currentPoints: number; currentPin: GaugePinData; nextPin: GaugePinData }> = ({ currentPoints, currentPin, nextPin }) => (
    <div
        className={`${cardShellClass} relative flex min-h-[370px] w-full flex-col items-center justify-center overflow-hidden bg-black/20 py-3`}
    >
        <div className="absolute top-4 z-10 flex flex-col items-center">
            <h2 className="mb-2 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Evolucao de Carreira</h2>
            <div className="h-1 w-12 rounded-full bg-[rgb(var(--color-brand-gold))]" />
        </div>
        <div className="origin-center scale-[0.58] transform-gpu md:scale-[0.72]">
            <PinProgressGauge
                currentValue={currentPoints}
                currentPin={currentPin}
                nextPin={nextPin}
                unitLabel="PONTOS"
                size="lg"
                valueFormatter={(value) => formatInteger(value)}
            />
        </div>
    </div>
);

const MatrixGridCard: React.FC<{ slots: MatrixSlot[]; onOpenPlan: () => void }> = ({ slots, onOpenPlan }) => (
    <DashboardCard className="border border-white/5">
        <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <GlobalIcon className="h-5 w-5 text-[rgb(var(--color-brand-gold))]" />
                <h4 className="text-lg font-black uppercase tracking-tight text-[rgb(var(--color-brand-text-light))]">Matriz SIGME 6x6</h4>
            </div>
            <button
                type="button"
                onClick={onOpenPlan}
                className="text-[10px] font-bold uppercase tracking-[0.24em] text-[rgb(var(--color-brand-gold))] hover:underline"
            >
                Ver Plano de Carreira
            </button>
        </div>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {slots.map((slot, index) => (
                <div
                    key={slot.id}
                    className={`flex flex-col items-center rounded-2xl border p-3 transition-colors ${slot.active ? 'border-white/10 bg-white/[0.03] hover:border-[rgb(var(--color-brand-gold))]/45' : 'border-dashed border-white/5 bg-white/[0.02] opacity-50'}`}
                >
                    <div className="relative">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-black ${slot.active ? 'border-[rgb(var(--color-brand-gold))] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(232,220,120,0.88))] text-[rgb(var(--color-brand-dark))]' : 'border-white/10 bg-[rgb(var(--color-brand-gray-light))] text-white/40'}`}>
                            {slot.active ? getInitials(slot.name) : index + 1}
                        </div>
                        {slot.active && (
                            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[rgb(var(--color-brand-dark))] bg-emerald-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                        )}
                    </div>
                    <p className="mt-3 w-full truncate text-center text-[10px] font-black uppercase tracking-tight text-white">
                        {slot.name}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--color-brand-gold))]">
                        {slot.pin}
                    </p>
                </div>
            ))}
        </div>
    </DashboardCard>
);

const ConsultantStore: React.FC<ConsultantStoreProps> = ({
    onNavigate,
    banners,
    settings,
    userProfile,
    bonuses,
    networkActivity,
    userPoints,
    monthlyUserPoints,
    compensationSettings,
    weeklyBonuses,
    careerProgress
}) => {
    const [isDesktopLayout, setIsDesktopLayout] = useState(() =>
        typeof window === 'undefined' ? true : window.innerWidth >= 1024
    );

    useEffect(() => {
        const syncLayout = () => setIsDesktopLayout(window.innerWidth >= 1024);

        syncLayout();
        window.addEventListener('resize', syncLayout);

        return () => {
            window.removeEventListener('resize', syncLayout);
        };
    }, []);

    const { currentPin, nextPin } = useMemo(
        () => resolveCareerPins(userPoints, compensationSettings.tiers, userProfile.graduation || 'Consultor', careerProgress),
        [userPoints, compensationSettings.tiers, userProfile.graduation, careerProgress]
    );

    const leftBonusCards = useMemo(() => ([
        { id: 'cycleBonus', title: 'Bonus Ciclo Global', value: bonuses.cycleBonus || 0, icon: TrophyIcon },
        { id: 'topSigmeBonus', title: 'Bonus Matriz SIGME', value: bonuses.topSigmeBonus || 0, icon: StarOutlineIcon },
        { id: 'affiliateBonus', title: 'Bonus Venda Afiliado', value: bonuses.affiliateBonus || 0, icon: AffiliateIcon },
        { id: 'dropshipBonus', title: 'Bonus Dropship', value: bonuses.dropshipBonus || 0, icon: DistributionIcon }
    ]), [
        bonuses.cycleBonus,
        bonuses.topSigmeBonus,
        bonuses.affiliateBonus,
        bonuses.dropshipBonus
    ]);

    const matrixGains = (bonuses.cycleBonus || 0) + (bonuses.topSigmeBonus || 0);

    void onNavigate;
    void settings;
    void monthlyUserPoints;
    void weeklyBonuses;
    void networkActivity;

    return (
        <div className="space-y-6">
            <DashboardBanner banners={banners} />

            <div
                className="grid grid-cols-1 items-start gap-6"
                style={isDesktopLayout ? { gridTemplateColumns: '320px minmax(0, 1fr)' } : undefined}
            >
                <div className="space-y-6">
                    <UserInfoCard profile={userProfile} currentPinName={currentPin.name} />
                    <div className="grid grid-cols-1 gap-6">
                        {leftBonusCards.map((card) => (
                            <BonusSummaryCard key={card.id} title={card.title} value={card.value} icon={card.icon} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6 min-w-0">
                    <PerformanceOverviewCard
                        currentPoints={userPoints}
                        matrixGains={matrixGains}
                        nextPinName={nextPin.name}
                    />

                    <CareerProgressCard
                        currentPoints={userPoints}
                        currentPin={currentPin}
                        nextPin={nextPin}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConsultantStore;
