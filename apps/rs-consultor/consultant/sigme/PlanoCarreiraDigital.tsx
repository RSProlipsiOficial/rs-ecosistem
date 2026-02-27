import React, { useMemo, useState, useEffect, FC } from 'react';
import Card from '../../components/Card';
import { IconAward, IconChart, IconUsers, IconGitFork } from '../../components/icons';
import { sigmaApi, DigitalLevel, DigitalStats } from '../services/sigmaApi';
import { CDSelector } from '../components/CDSelector';
import PinProgressGauge from '../components/PinProgressGauge';
import type { NetworkNode } from '../../types';

const CircularProgressIndicator: FC<{ progress: number; color: string; label: string; valueText: string; }> = ({ progress, color, label, valueText }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (circumference * Math.min(progress, 100)) / 100;

    return (
        <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="#1f2937" strokeWidth="6" fill="none" />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke={color}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-black text-white leading-none">{Math.floor(progress)}%</span>
                </div>
            </div>
            <p className="mt-3 font-black text-white text-[10px] sm:text-xs uppercase tracking-widest leading-tight">{label}</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter leading-none">{valueText}</p>
        </div>
    );
};

const PlanoCarreiraDigital: React.FC = () => {
    const [levels, setLevels] = useState<DigitalLevel[]>([]);
    const [stats, setStats] = useState<DigitalStats | null>(null);
    const [directLines, setDirectLines] = useState<NetworkNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (value: number) =>
        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [resLevels, resStats, resDirects] = await Promise.all([
                    sigmaApi.getDigitalLevels(),
                    sigmaApi.getDigitalStats(),
                    sigmaApi.getDownlines(1, 'directs')
                ]);

                if (resLevels.success) setLevels(resLevels.data);
                if (resStats.success) setStats(resStats.data);
                if (resDirects.success) {
                    // Ordenar linhas por volume (do maior para o menor)
                    const sortedDirects = [...resDirects.data].sort((a, b) => (b.totalVolume || 0) - (a.totalVolume || 0));
                    setDirectLines(sortedDirects);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const { currentPinObj, nextPinObj } = useMemo(() => {
        if (!levels.length) return {
            currentPinObj: { name: 'Consultor', value: 0, imageUrl: '' },
            nextPinObj: { name: 'RS One Star', value: 10000, imageUrl: '' }
        };

        const currentVol = stats?.currentVolume || 0;
        let currentIdx = -1;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (currentVol >= Number(levels[i].requiredVolume)) {
                currentIdx = i;
                break;
            }
        }

        const current = currentIdx !== -1
            ? { name: levels[currentIdx].name, value: Number(levels[currentIdx].requiredVolume), imageUrl: levels[currentIdx].imageUrl }
            : { name: 'Consultor', value: 0, imageUrl: '' };

        const next = (currentIdx + 1) < levels.length
            ? { name: levels[currentIdx + 1].name, value: Number(levels[currentIdx + 1].requiredVolume), imageUrl: levels[currentIdx + 1].imageUrl }
            : (levels[levels.length - 1]
                ? { name: levels[levels.length - 1].name, value: Number(levels[levels.length - 1].requiredVolume), imageUrl: levels[levels.length - 1].imageUrl }
                : { name: 'RS One Star', value: 10000, imageUrl: '' });

        return { currentPinObj: current, nextPinObj: next };
    }, [levels, stats]);

    const { effectiveVolume } = useMemo(() => {
        if (!nextPinObj) {
            return { effectiveVolume: stats?.currentVolume || 0 };
        }

        // Para o Plano Digital (Drop), o volume é baseado em vendas pessoais/drop (sem travas de VME de rede)
        const totalEffective = stats?.currentVolume || 0;

        return {
            effectiveVolume: totalEffective
        };
    }, [nextPinObj, stats]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-brand-gold/10 border-t-brand-gold rounded-full animate-spin"></div>
            <p className="text-brand-gold font-black uppercase tracking-[0.2em] animate-pulse">Sincronizando Carreira Digital...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center text-red-500 font-bold uppercase tracking-widest bg-red-500/10 rounded-2xl border border-red-500/20">
            Erro ao carregar dados: {error}
        </div>
    );

    return (
        <div className="space-y-8 pb-32">
            {/* Header com Estilo RS Premium Gold */}
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-gold/10 rounded-2xl border border-brand-gold/30 shadow-lg shadow-brand-gold/5">
                            <IconAward className="text-brand-gold" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                                Plano de <span className="text-brand-gold">Carreira Digital</span>
                            </h1>
                            <p className="text-gray-400 mt-1 text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Performance • Drop • Redes</p>
                        </div>
                    </div>
                </div>

                <CDSelector />

                {/* Progress Indicators - REGRAS DE RELÓGIO (ESTILO SIGME) */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/5 rounded-[2rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[80px] -mr-40 -mt-40 group-hover:bg-brand-gold/10 transition-colors duration-1000"></div>

                    <div className="relative z-10 space-y-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-lg font-black text-white uppercase italic tracking-widest">Requisitos para <span className="text-brand-gold">{nextPinObj.name}</span></h2>
                            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-brand-gold to-transparent rounded-full"></div>
                        </div>

                        <div className="flex justify-center max-w-5xl mx-auto">
                            <CircularProgressIndicator
                                progress={(effectiveVolume / nextPinObj.value) * 100}
                                color="#EAB308"
                                label="Volume Efetivo"
                                valueText={`${formatCurrency(effectiveVolume)} / ${formatCurrency(nextPinObj.value)}`}
                            />
                        </div>

                        {/* Main Gauge */}
                        <div className="flex flex-col items-center pt-10 border-t border-white/5">
                            <div className="w-full max-w-xs sm:max-w-sm scale-100 sm:scale-110">
                                <PinProgressGauge
                                    currentValue={effectiveVolume}
                                    currentPin={currentPinObj}
                                    nextPin={nextPinObj}
                                    unitLabel="DE VOLUME EFETIVO"
                                    size="lg"
                                    valueFormatter={formatCurrency}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de PINs Premium */}
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-gold/10 rounded-lg">
                            <IconChart className="text-brand-gold" size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Níveis de Graduação <span className="text-brand-gold">RS Star System</span></h2>
                    </div>
                    <div className="hidden sm:block bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Progressão Vitalícia por Meta de Vendas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                    {levels.map((level) => {
                        const isUnlocked = (stats?.currentVolume || 0) >= Number(level.requiredVolume);
                        const isCurrent = currentPinObj.name === level.name;

                        return (
                            <Card
                                key={level.id}
                                className={`
                                    relative p-0 overflow-hidden border-t-4 transition-all duration-500 hover:translate-y-[-8px] 
                                    ${isCurrent
                                        ? 'border-brand-gold bg-gradient-to-b from-brand-gold/20 to-black/40 shadow-[0_20px_40px_rgba(234,179,8,0.1)]'
                                        : isUnlocked
                                            ? 'border-white/40 bg-white/[0.03]'
                                            : 'border-white/5 bg-white/[0.01]'
                                    }
                                `}
                            >
                                <div className="aspect-square w-full bg-black/60 flex items-center justify-center p-8 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent z-0" />

                                    {level.imageUrl ? (
                                        <img
                                            src={level.imageUrl}
                                            alt={level.name}
                                            className={`h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-all duration-700 z-10 ${isUnlocked ? 'scale-110 rotate-0' : 'grayscale brightness-50 opacity-40 -rotate-6'}`}
                                        />
                                    ) : (
                                        <IconAward size={80} className="text-white/5" />
                                    )}

                                    {isUnlocked && (
                                        <div className="absolute top-4 right-4 bg-brand-gold text-black p-1.5 rounded-full shadow-lg shadow-brand-gold/20 z-20">
                                            <IconAward size={14} />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 space-y-5">
                                    <div className="text-center">
                                        <h4 className={`text-lg font-black uppercase tracking-tighter leading-none ${isUnlocked ? 'text-brand-gold' : 'text-white'}`}>
                                            {level.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-3">
                                            Meta: <span className={isUnlocked ? 'text-brand-gold' : 'text-gray-300'}>{formatCurrency(Number(level.requiredVolume))}</span>
                                        </p>
                                    </div>

                                    {/* Comissões Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center group-hover:bg-white/10 transition-colors">
                                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Venda Física</p>
                                            <p className="text-sm font-black text-white">{level.commissionPhysicalRs}%</p>
                                        </div>
                                        <div className="bg-brand-gold/5 p-2 rounded-xl border border-brand-gold/10 text-center group-hover:bg-brand-gold/10 transition-colors">
                                            <p className="text-[8px] text-brand-gold font-black uppercase tracking-widest mb-1">Venda Digital</p>
                                            <p className="text-sm font-black text-white">{level.commissionRsDigital}%</p>
                                        </div>
                                    </div>

                                    {/* Rede Afiliado Detalhada */}
                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-4">
                                        <p className="text-[8px] text-center text-gray-500 font-black uppercase tracking-[0.2em] pb-2 border-b border-white/5">Incentivo Rede Afiliado</p>
                                        <div className="grid grid-cols-3 gap-1 text-center">
                                            <div>
                                                <p className="text-[7px] text-gray-700 font-bold uppercase mb-1">ESSENTAL</p>
                                                <p className="text-xs font-black text-brand-gold">{level.commissionAffiliateDigitalEssential}%</p>
                                            </div>
                                            <div className="border-x border-white/5">
                                                <p className="text-[7px] text-gray-700 font-bold uppercase mb-1">PROFIS.</p>
                                                <p className="text-xs font-black text-white">{level.commissionAffiliateDigitalProfessional}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[7px] text-gray-700 font-bold uppercase mb-1">PREMIUM</p>
                                                <p className="text-xs font-black text-white">{level.commissionAffiliateDigitalPremium}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Award Badge */}
                                    {level.award && (
                                        <div className="bg-brand-gold/5 px-4 py-2.5 rounded-xl border border-brand-gold/20 flex items-center gap-3 group/award">
                                            <div className="p-1.5 bg-brand-gold/20 rounded-lg group-hover/award:scale-110 transition-transform">
                                                <IconAward size={16} className="text-brand-gold" />
                                            </div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-tight leading-tight line-clamp-1 italic">{level.award}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PlanoCarreiraDigital;
