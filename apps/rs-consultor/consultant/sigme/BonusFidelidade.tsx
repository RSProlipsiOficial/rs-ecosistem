import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { IconUsers, IconHandCoins, IconCheckCircle, IconFileClock, IconLock, IconGitFork } from '../../components/icons';
import { mockCycleSummary } from '../data';
import { sigmaApi, SigmaConfig } from '../services/sigmaApi';

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CycleProgress: React.FC<{ cycle: any, level: any }> = ({ cycle, level }) => {
    const progress = (cycle.peopleCompleted / level.peopleTarget) * 100;
    const earnings = cycle.peopleCompleted * (level.bonusPerPerson || 0);

    let statusIcon, statusText, statusColor, borderColor;
    switch (cycle.status) {
        case 'completed':
            statusIcon = <IconCheckCircle size={14} />;
            statusText = 'Concluído';
            statusColor = 'text-green-400';
            borderColor = 'border-brand-gold bg-brand-gold/10';
            break;
        case 'in_progress':
            statusIcon = <IconFileClock size={14} />;
            statusText = 'Em Andamento';
            statusColor = 'text-yellow-400';
            borderColor = 'border-yellow-400 animate-pulse-gold';
            break;
        default:
            statusIcon = <IconLock size={14} />;
            statusText = 'Bloqueado';
            statusColor = 'text-gray-500';
            borderColor = 'border-brand-gray';
            break;
    }

    return (
        <div className={`p-4 rounded-xl border-2 ${borderColor} space-y-3 flex flex-col items-center text-center`}>
            <div className={`p-3 rounded-full mb-2 ${statusColor} ${cycle.status === 'locked' ? 'bg-brand-gray-dark' : 'bg-current/10'}`}>
                {React.cloneElement(statusIcon as React.ReactElement, { size: 28 })}
            </div>
            <h4 className="font-bold text-white text-lg">Ciclo {cycle.cycleNumber}</h4>
            <span className={`text-xs font-semibold ${statusColor}`}>
                {statusText}
            </span>

            <div className="flex-grow"></div>

            <div className="w-full mt-auto">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{cycle.peopleCompleted} / {level.peopleTarget}</span>
                </div>
                <div className="w-full bg-brand-gray h-2.5 rounded-full overflow-hidden">
                    <div className="bg-brand-gold h-full rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="w-full text-right mt-3">
                <p className="text-xs text-gray-400">Ganhos do Ciclo</p>
                <p className="font-semibold text-white">{formatCurrency(earnings)}</p>
            </div>
        </div>
    )
}

const LevelCard: React.FC<{ levelData: any }> = ({ levelData }) => {
    const totalPotential = levelData.peopleTarget * (levelData.bonusPerPerson || 0) * 10;
    const earnedOnLevel = (levelData.cycles || []).reduce((acc: number, cycle: any) => acc + (cycle.peopleCompleted * (levelData.bonusPerPerson || 0)), 0);

    return (
        <Card className="w-full">
            <header className="border-b border-brand-gray-light pb-4 mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Nível {levelData.level}</h3>
                    <span className="font-semibold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">{formatCurrency(levelData.bonusPerPerson || 0)} por pessoa</span>
                </div>
            </header>
            <div className="max-h-[45vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(levelData.cycles || []).map((cycle: any) => (
                        <CycleProgress key={cycle.cycleNumber} cycle={cycle} level={levelData} />
                    ))}
                    {(!levelData.cycles || levelData.cycles.length === 0) && (
                        <div className="col-span-full py-10 text-center text-gray-500 italic">
                            Nenhum ciclo ativo neste nível.
                        </div>
                    )}
                </div>
            </div>
            <footer className="mt-4 pt-4 border-t border-brand-gray-light flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-400">Total Ganho no Nível: <span className="text-lg text-white">{formatCurrency(earnedOnLevel)}</span></span>
                <span className="text-sm text-gray-500">Potencial Total: {formatCurrency(totalPotential)}</span>
            </footer>
        </Card>
    );
};

const LockedLevelCard: React.FC<{ level: number }> = ({ level }) => {
    return (
        <Card className="opacity-60">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-500">Nível {level}</h3>
                <IconLock size={24} className="text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
                {level < 6
                    ? `Complete o ciclo ${level} para desbloquear os bônus deste nível.`
                    : `Complete o ciclo 5 para desbloquear os bônus deste nível.`
                }
            </p>
        </Card>
    );
};


const BonusFidelidade: React.FC = () => {
    const [config, setConfig] = useState<SigmaConfig | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [configRes, statsRes] = await Promise.all([
                    sigmaApi.getConfig(),
                    sigmaApi.getStats()
                ]);

                if (configRes.success) setConfig(configRes.data);
                if (statsRes.success) setStats(statsRes.data);

                if (!configRes.success) {
                    setError(configRes.error || 'Erro ao carregar configurações');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const userMaxCompletedCycle = Math.max(0, ...mockCycleSummary.filter(c => c.completed > 0).map(c => Number(c.level)));

    const bonusFidelityData = useMemo(() => {
        if (!config) return [];

        const pool = config.fidelityBonus.percentTotal / 100;
        const base = config.cycle.value;
        const levels = config.fidelityBonus.levels;

        return levels.map(l => {
            const levelPercentage = l.percent / 100;
            const bonusPerPerson = base * pool * levelPercentage;

            return {
                level: l.level,
                peopleTarget: Math.pow(6, l.level),
                bonusPerPerson,
                cycles: [] // Aqui poderíamos carregar os ciclos reais do banco se disponível
            };
        });
    }, [config]);

    const totalBonus = useMemo(() => {
        return bonusFidelityData.reduce((levelAcc, levelData) => {
            const isEligible = levelData.level <= 5 ? userMaxCompletedCycle >= levelData.level : userMaxCompletedCycle >= 5;
            if (!isEligible) return levelAcc;

            return levelAcc + (levelData.cycles || []).reduce((cycleAcc: number, cycle: any) => {
                return cycleAcc + (cycle.peopleCompleted * levelData.bonusPerPerson);
            }, 0);
        }, 0);
    }, [bonusFidelityData, userMaxCompletedCycle]);

    const totalPeopleInMatrixFirstCycle = useMemo(() => {
        return bonusFidelityData.reduce((acc, level) => acc + level.peopleTarget, 0);
    }, [bonusFidelityData]);

    const activePeople = stats?.totalDownline || 0;

    if (loading) return <div className="p-10 text-center text-brand-gold">Carregando bônus de fidelidade...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Erro: {error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-gold">Bônus de Fidelidade</h1>
                <p className="text-gray-400 mt-1">Ganhe em bônus pela fidelidade dos ativos no ciclo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconHandCoins size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Bônus Total Acumulado</h4>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalBonus)}</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconUsers size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Pessoas Ativas na Matriz</h4>
                        <p className="text-2xl font-bold text-white">{activePeople.toLocaleString('pt-BR')}</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconUsers size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Total de Posições (1 Ciclo)</h4>
                        <p className="text-2xl font-bold text-white">{totalPeopleInMatrixFirstCycle.toLocaleString('pt-BR')}</p>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <IconGitFork size={32} className="text-brand-gold flex-shrink-0" />
                        <div>
                            <h2 className="text-lg font-bold text-white">Estrutura da Matriz 6x6</h2>
                            <p className="text-gray-400 text-sm mt-1">Visualize a estrutura completa da sua rede para este bônus.</p>
                        </div>
                    </div>
                    <Link
                        to="/consultant/sigme/arvore-interativa/bonus-fidelidade"
                        className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        Abrir Árvore Interativa
                    </Link>
                </div>
            </Card>

            <div>
                <h2 className="text-xl font-bold text-white mb-4">Progresso dos Níveis</h2>
                <div className="space-y-6">
                    {bonusFidelityData.map(levelData => {
                        const isEligible = levelData.level <= 5
                            ? userMaxCompletedCycle >= levelData.level
                            : userMaxCompletedCycle >= 5;

                        return isEligible
                            ? <LevelCard key={levelData.level} levelData={levelData} />
                            : <LockedLevelCard key={levelData.level} level={levelData.level} />;
                    })}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse-gold {
                  0%, 100% { border-color: rgba(255, 215, 0, 0.4); }
                  50% { border-color: rgba(255, 215, 0, 0.8); }
                }
                .animate-pulse-gold { animation: pulse-gold 2s infinite; }
            `}</style>
        </div>
    );
};

export default BonusFidelidade;