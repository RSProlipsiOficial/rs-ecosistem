
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';
import { IconCrown, IconGitFork, IconHandCoins, IconCalendar, IconUsers, IconStar } from '../icons';
import { useUser } from './hooks';
import { mockTopSigmeRanking, mockTopSigmeMonthlySummary } from './data';

const formatCurrency = (value: number | string | null | undefined): string => {
    if (value == null || value === '') {
        return 'R$ 0,00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const TopSigme: React.FC = () => {
    const { user } = useUser();
    const userPosition = mockTopSigmeRanking.find(r => r.name === user.name);
    
    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-bold text-brand-gold">Bônus Top Sigme</h1>
                <p className="text-gray-400 mt-1">Acompanhe sua posição no ranking global de consultores e seus ganhos.</p>
            </div>
            
            {/* Top Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconGitFork size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Ciclos Matriz SIGME</h4>
                        <p className="text-2xl font-bold text-white">{mockTopSigmeMonthlySummary.totalGlobalCycles}</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconHandCoins size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Total Distribuído (Mês)</h4>
                        <p className="text-2xl font-bold text-white">{formatCurrency(mockTopSigmeMonthlySummary.totalDistributed)}</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-gray-light rounded-full">
                        <IconCalendar size={24} className="text-brand-gold" />
                    </div>
                    <div>
                        <h4 className="text-sm text-brand-text-dim">Fechamento do Mês</h4>
                        <p className="text-2xl font-bold text-white">{mockTopSigmeMonthlySummary.closingDate}</p>
                    </div>
                </Card>
            </div>

            {/* Combined Section: Your Position & Interactive Tree */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Position Card */}
                <Card className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-brand-gray to-brand-gray-dark border-2 border-brand-gold shadow-gold-glow">
                    {userPosition ? (
                        <>
                            <IconCrown size={48} className="text-brand-gold mb-3" />
                            <p className="text-gray-400 text-lg">Sua Posição Atual</p>
                            <p className="text-5xl font-extrabold text-brand-gold my-2">{userPosition.position}º</p>
                            <p className="text-white text-xl font-bold">{mockTopSigmeMonthlySummary.totalGlobalCycles} Ciclos da Empresa</p>
                            <p className="text-white text-xl font-bold">{userPosition.cycles} Ciclos Contribuídos</p>
                            <p className="text-green-400 font-semibold mt-1">{formatCurrency(userPosition.earnings)} Ganhos Acumulados</p>
                        </>
                    ) : (
                        <div className="text-center">
                            <IconStar size={48} className="text-gray-500 mb-3" />
                            <p className="text-gray-400">Você ainda não está no ranking.</p>
                            <p className="text-sm text-gray-500 mt-1">Continue trabalhando sua rede para aparecer aqui!</p>
                        </div>
                    )}
                </Card>

                {/* Interactive Tree Card */}
                <Card className="flex flex-col justify-between items-center text-center p-6">
                    <div className="flex flex-col items-center gap-4 flex-grow">
                        <IconUsers size={40} className="text-brand-gold flex-shrink-0" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Estrutura da Matriz Top SIGME</h2>
                            <p className="text-gray-400 text-sm mt-1">Análise da estrutura da equipe.</p>
                        </div>
                    </div>
                    <Link 
                        to="/consultant/sigme/arvore-interativa/top-sigme" 
                        className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20 text-lg"
                    >
                        Abrir Árvore Interativa
                    </Link>
                </Card>
            </div>
            
            {/* Monthly Ranking Table */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Ranking Mensal Top Sigme</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-brand-gray text-sm text-gray-400">
                            <tr>
                                <th className="p-3">Posição</th>
                                <th className="p-3">Consultor</th>
                                <th className="p-3 text-center">Ciclos</th>
                                <th className="p-3 text-right">Ganhos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTopSigmeRanking.map((rank) => (
                                <tr key={rank.position} className={`border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50 ${rank.name === user.name ? 'bg-[#4a441f] border-l-4 border-brand-gold' : ''}`}>
                                    <td className="p-3 text-sm">
                                        <div className="flex items-center">
                                            <span className="font-bold text-lg w-8 text-center text-gray-400">{rank.position}</span>
                                            {rank.position <= 3 && <IconCrown className={`w-6 h-6 ml-2 ${rank.position === 1 ? 'text-yellow-400' : rank.position === 2 ? 'text-gray-300' : 'text-amber-600'}`} />}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-4">
                                            <img src={rank.avatarUrl} alt={rank.name} className="h-10 w-10 rounded-full"/>
                                            <p className="font-semibold text-white">{rank.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-sm text-gray-300">{rank.cycles}</td>
                                    <td className="p-3 text-right font-bold text-green-400">{formatCurrency(rank.earnings)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default TopSigme;
