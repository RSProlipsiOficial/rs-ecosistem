import React, { useState, useEffect } from 'react';
import { cycleClosingAPI } from '../src/services/api';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ShieldCheckIcon
} from './icons';

interface ClosingHistoryItem {
    id: string;
    type: 'MENSAL' | 'TRIMESTRAL';
    period: string;
    total_volume: number;
    bonus_distributed: number;
    status: string;
    executed_at: string;
}

const CycleClosingTab: React.FC = () => {
    const [history, setHistory] = useState<ClosingHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<{ type: 'MENSAL' | 'TRIMESTRAL', step: 1 | 2 } | null>(null);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await cycleClosingAPI.getHistory();
            if (res.success) {
                setHistory(res.history);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleCloseCycle = async (type: 'MENSAL' | 'TRIMESTRAL') => {
        setActionLoading(type);
        try {
            const res = await cycleClosingAPI.close(type);
            if (res.success) {
                alert(`Fechamento ${type} executado com sucesso!`);
                loadHistory();
            } else {
                alert(`Erro: ${res.error || 'Falha na execução'}`);
            }
        } catch (error: any) {
            alert(`Erro crítico: ${error.message}`);
        } finally {
            setActionLoading(null);
            setShowConfirm(null);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header com Contexto */}
            <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#3A3A3A] shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#FFD700]/10 rounded-lg">
                        <ArrowPathIcon className="w-8 h-8 text-[#FFD700]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Fechamento de Ciclos</h2>
                        <p className="text-[#9CA3AF]">Gerencie os pagamentos mensais e as graduações trimestrais do ecossistema.</p>
                    </div>
                </div>
            </div>

            {/* Painel de Ações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fechamento Mensal */}
                <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#2A2A2A] hover:border-[#FFD700]/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CurrencyDollarIcon className="w-24 h-24 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-[#FFD700] mb-2 flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Fechamento Mensal
                    </h3>
                    <p className="text-[#9CA3AF] mb-6 text-sm">
                        Gatilho oficial de **pagamentos**. Processa Pool Top Sigma, Fidelidade e Bônus de Profundidade acumulados.
                    </p>

                    <button
                        onClick={() => setShowConfirm({ type: 'MENSAL', step: 1 })}
                        disabled={!!actionLoading}
                        className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#E6C200] active:scale-95 transition-all shadow-lg shadow-[#FFD700]/10"
                    >
                        {actionLoading === 'MENSAL' ? 'Processando...' : 'Executar Pagamentos'}
                    </button>

                    <div className="mt-4 flex items-center text-xs text-[#6B7280]">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Recomendado: Todo dia 30/31 às 00:00
                    </div>
                </div>

                {/* Fechamento Trimestral */}
                <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#2A2A2A] hover:border-[#FFD700]/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ChartBarIcon className="w-24 h-24 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-[#FFD700] mb-2 flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2" />
                        Fechamento Trimestral
                    </h3>
                    <p className="text-[#9CA3AF] mb-6 text-sm">
                        Gatilho de **graduação**. Consolida o volume acumulado e atualiza os PINs (ranks) dos consultores.
                    </p>

                    <button
                        onClick={() => setShowConfirm({ type: 'TRIMESTRAL', step: 1 })}
                        disabled={!!actionLoading}
                        className="w-full py-3 border-2 border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#FFD700] hover:text-black active:scale-95 transition-all"
                    >
                        {actionLoading === 'TRIMESTRAL' ? 'Processando...' : 'Fechar Graduação'}
                    </button>

                    <div className="mt-4 flex items-center text-xs text-[#6B7280]">
                        <ShieldCheckIcon className="w-4 h-4 mr-1" />
                        Próximas Graduações: Março, Junho, Setembro, Dezembro (Trimestral)
                    </div>
                </div>
            </div>

            {/* Histórico Recente */}
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-[#2A2A2A] flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2 text-[#9CA3AF]" />
                        Histórico de Execuções
                    </h3>
                    <button onClick={loadHistory} className="text-sm text-[#FFD700] hover:underline">Atualizar</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#262626] text-[#9CA3AF] text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Período</th>
                                <th className="px-6 py-3">Volume Atendido</th>
                                <th className="px-6 py-3">Executado Em</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[#9CA3AF]">Carregando histórico...</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[#9CA3AF]">Nenhum fechamento registrado.</td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#262626] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.type === 'MENSAL' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{item.period}</td>
                                        <td className="px-6 py-4 text-[#E5E7EB]">R$ {item.total_volume.toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-[#9CA3AF] text-sm">
                                            {new Date(item.executed_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-green-500 text-sm">
                                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modais de Confirmação */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white text-center mb-2">
                            Atenção: Fechamento {showConfirm.type}
                        </h3>

                        <p className="text-[#9CA3AF] text-center mb-8">
                            {showConfirm.step === 1
                                ? `Você está prestes a iniciar o processamento ${showConfirm.type.toLowerCase()}. Esta ação atualizará saldos e não pode ser desfeita.`
                                : `CONFIRMAÇÃO FINAL: Deseja realmente executar o fechamento agora? O sistema ficará indisponível para lançamentos durante o processo.`}
                        </p>

                        <div className="flex flex-col space-y-3">
                            {showConfirm.step === 1 ? (
                                <button
                                    onClick={() => setShowConfirm({ ...showConfirm, step: 2 })}
                                    className="py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Sim, entendo os riscos
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleCloseCycle(showConfirm.type)}
                                    className="py-4 bg-[#FFD700] text-black font-extrabold rounded-xl hover:bg-[#E6C200] transition-all transform active:scale-95 shadow-lg shadow-[#FFD700]/20"
                                >
                                    CONFIRMAR OPERAÇÃO
                                </button>
                            )}

                            <button
                                onClick={() => setShowConfirm(null)}
                                className="py-3 text-[#9CA3AF] hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CycleClosingTab;
