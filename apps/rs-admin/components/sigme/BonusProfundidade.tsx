import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';
import { IconUsers, IconHandCoins, IconGitFork, IconCheckCircle, IconFileClock, IconLock } from '../icons';
import { mockBonusDepthData } from './data';

const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
        return 'R$ 0,00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// New component for the detailed cycle card
const DetailedCycleCard: React.FC<{ cycle: any; level: any; }> = ({ cycle, level }) => {
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
};


const BonusProfundidade: React.FC = () => {
    const totalBonus = mockBonusDepthData.reduce((levelAcc, level) => {
        const levelTotal = level.cycles.reduce((cycleAcc, cycle) => {
            return cycleAcc + (cycle.peopleCompleted * level.bonusPerPerson);
        }, 0);
        return levelAcc + levelTotal;
    }, 0);

    const activePeople = 48123; // Static mock value

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-gold">Bônus de Profundidade</h1>
                <p className="text-gray-400 mt-1">Acompanhe seus ganhos e o progresso de cada ciclo na sua matriz de profundidade 6x6.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <Card>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <IconGitFork size={32} className="text-brand-gold flex-shrink-0" />
                        <div>
                            <h2 className="text-lg font-bold text-white">Estrutura da Matriz 6x6</h2>
                            <p className="text-gray-400 text-sm mt-1">Visualize a estrutura completa da sua rede de profundidade.</p>
                        </div>
                    </div>
                    <Link 
                        to="/consultant/sigme/arvore-interativa/bonus-profundidade" 
                        className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        Abrir Árvore Interativa
                    </Link>
                </div>
            </Card>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Progresso dos Níveis</h2>
                {mockBonusDepthData.map(level => {
                    const totalGanhosNivel = level.cycles.reduce((acc, cycle) => {
                        return acc + (cycle.peopleCompleted * level.bonusPerPerson);
                    }, 0);

                    return (
                        <Card key={level.level}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Nível {level.level}</h3>
                                <span className="font-semibold text-brand-gold bg-brand-gray-light px-3 py-1.5 rounded-full text-sm">{formatCurrency(level.bonusPerPerson)} por pessoa</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {level.cycles.map(cycle => (
                                    <DetailedCycleCard key={cycle.cycleNumber} cycle={cycle} level={level} />
                                ))}
                            </div>
                            <footer className="mt-4 pt-4 border-t border-brand-gray-light text-right">
                                <p className="font-bold text-lg text-white">Total Ganho no Nível: <span className="text-brand-gold">{formatCurrency(totalGanhosNivel)}</span></p>
                            </footer>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default BonusProfundidade;