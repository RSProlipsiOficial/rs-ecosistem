import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';
import { IconUsers, IconHandCoins, IconCheckCircle, IconFileClock, IconLock, IconGitFork } from '../icons';
// FIX: Corrected import name from 'mockBonusFidelidadeData' to 'mockBonusFidelityData'.
import { mockCycleSummary, mockBonusFidelityData } from './data'; // Import mock data

const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
        return 'R$ 0,00';
    }
    const num = typeof value === 'string' ? parseFloat(value.toString().replace(',', '.')) : value;
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Data is now imported from data.ts
const bonusFidelityData = mockBonusFidelityData;

const DetailedCycleCard: React.FC<{ cycle: any, level: any }> = ({ cycle, level }) => {
    const progress = (cycle.peopleCompleted / level.peopleTarget) * 100;
    const earnings = cycle.peopleCompleted * level.bonusPerPerson;

    let statusIcon, statusText, statusColor, borderColor;
    switch (cycle.status) {
        case 'completed':
            statusIcon = <IconCheckCircle size={28} className="text-green-400"/>;
            statusText = 'Concluído';
            statusColor = 'text-green-400';
            borderColor = 'border-brand-gold bg-brand-gold/10';
            break;
        case 'in_progress':
            statusIcon = <IconFileClock size={28} className="text-yellow-400"/>;
            statusText = 'Em Andamento';
            statusColor = 'text-yellow-400';
            borderColor = 'border-yellow-400';
            break;
        default: // locked
            statusIcon = <IconLock size={28} className="text-gray-500"/>;
            statusText = 'Bloqueado';
            statusColor = 'text-gray-500';
            borderColor = 'border-brand-gray';
            break;
    }

    return (
        <div className={`aspect-square p-4 rounded-xl border-2 ${borderColor} flex flex-col text-center ring-1 ring-black`}>
            <div className="flex-grow flex flex-col items-center justify-center">
                {statusIcon}
                <h4 className="font-bold text-white text-lg mt-2">Ciclo {cycle.cycleNumber}</h4>
                <span className={`text-sm font-semibold ${statusColor}`}>
                    {statusText}
                </span>
            </div>

            <div className="w-full mt-auto pt-3 border-t border-brand-gray-light/50 space-y-2">
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{cycle.peopleCompleted} / {level.peopleTarget}</span>
                    </div>
                    <div className="w-full bg-brand-gray h-2.5 rounded-full overflow-hidden">
                        <div className="bg-brand-gold h-full rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="w-full text-right">
                    <p className="text-xs text-gray-400">Ganhos do Ciclo</p>
                    <p className="font-semibold text-white">{formatCurrency(earnings)}</p>
                </div>
            </div>
        </div>
    );
}

const LevelCard: React.FC<{ levelData: typeof bonusFidelityData[0]; isEligible: boolean; }> = ({ levelData, isEligible }) => {
    const earnedOnLevel = levelData.cycles.reduce((acc, cycle) => acc + (cycle.peopleCompleted * levelData.bonusPerPerson), 0);

    return (
        <Card className={`w-full transition-opacity ${!isEligible ? 'opacity-60' : ''}`}>
            <header className="border-b border-brand-gray-light pb-4 mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white">Nível {levelData.level}</h3>
                    <span className="font-semibold text-brand-gold bg-brand-gray-light px-3 py-1.5 rounded-full text-sm">{formatCurrency(levelData.bonusPerPerson)} por pessoa</span>
                </div>
                {!isEligible && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm mt-3 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                        <IconLock size={18} />
                        <span className="font-semibold">
                            {levelData.level < 6
                                ? `Complete o Ciclo Global ${levelData.level} para desbloquear este bônus.`
                                : `Complete o Ciclo Global 5 para desbloquear este bônus.`
                            }
                        </span>
                    </div>
                )}
            </header>
            <div className={`max-h-[45vh] overflow-y-auto pr-2 ${!isEligible ? 'pointer-events-none' : ''}`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {levelData.cycles.map(cycle => (
                        <DetailedCycleCard key={cycle.cycleNumber} cycle={cycle} level={levelData} />
                    ))}
                </div>
            </div>
             <footer className="mt-4 pt-4 border-t border-brand-gray-light text-right">
                <p className="font-bold text-lg text-white">Total Ganho no Nível: <span className="text-brand-gold">{formatCurrency(earnedOnLevel)}</span></p>
             </footer>
        </Card>
    );
};


const BonusFidelidade: React.FC = () => {
    const userMaxCompletedCycle = Math.max(0, ...mockCycleSummary.filter(c => c.completed > 0).map(c => Number(c.level)));

    const totalBonus = bonusFidelityData.reduce((levelAcc, levelData) => {
        const isEligible = levelData.level <= 5 ? userMaxCompletedCycle >= levelData.level : userMaxCompletedCycle >= 5;
        if (!isEligible) return levelAcc;

        return levelAcc + levelData.cycles.reduce((cycleAcc, cycle) => {
            return cycleAcc + (cycle.peopleCompleted * levelData.bonusPerPerson);
        }, 0);
    }, 0);

    const totalPeopleInMatrixFirstCycle = bonusFidelityData.reduce((acc, level) => acc + level.peopleTarget, 0);
    const activePeople = 48123; // Mocked value
    
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
                        
                        return <LevelCard key={levelData.level} levelData={levelData} isEligible={isEligible} />;
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