import React, { useMemo, useState, useEffect } from 'react';
import { reportsAPI } from '../src/services/api';
import { TrophyIcon, CycleIcon, ShareIcon, UsersIcon, ChevronRightIcon, MagnifyingGlassIcon, LockClosedIcon, LockOpenIcon, PencilIcon } from './icons';
import type { Consultant } from '../types';
import ConsultantDetailModal from './ConsultantDetailModal';

// --- MOCK DATA & TYPES ---
interface ConsultantProgress {
    id: number;
    currentCycles: number;
    qualifiedLines: number;
    legContributions: { leg: string; cycles: number }[];

    // Digital Career (Drop)
    digitalPoints: number;
    digitalPin: string;

    downlines: {
        id: number;
        name: string;
        avatar: string;
        currentPin: string;
        currentCycles: number;
        nextPinCycles: number;
        // Digital Downline
        digitalPin: string;
        digitalPoints: number;
        nextDigitalPoints: number;
    }[];
}

interface PinRequirement {
    pin: string;
    cycles: number;
    minLines: number | string;
    vmec: string;
}

const pinRequirements: PinRequirement[] = [
    { pin: 'Bronze', cycles: 5, minLines: 0, vmec: '—' },
    { pin: 'Prata', cycles: 15, minLines: 1, vmec: '100 %' },
    { pin: 'Ouro', cycles: 70, minLines: 1, vmec: '100 %' },
    { pin: 'Safira', cycles: 150, minLines: 2, vmec: '60 / 40' },
    { pin: 'Esmeralda', cycles: 300, minLines: 2, vmec: '60 / 40' },
    { pin: 'Topázio', cycles: 500, minLines: 2, vmec: '60 / 40' },
    { pin: 'Rubi', cycles: 750, minLines: 3, vmec: '50 / 30 / 20' },
    { pin: 'Diamante', cycles: 1500, minLines: 3, vmec: '50 / 30 / 20' },
    { pin: 'Duplo Diamante', cycles: 3000, minLines: 4, vmec: '40 / 30 / 20 / 10' },
];

const digitalPinRequirements: PinRequirement[] = [
    { pin: 'Start', cycles: 0, minLines: 0, vmec: '-' },
    { pin: 'RS One Star', cycles: 10000, minLines: 0, vmec: '-' },
    { pin: 'RS Two Stars', cycles: 50000, minLines: 0, vmec: '-' },
    { pin: 'RS Three Stars', cycles: 100000, minLines: 0, vmec: '-' },
    { pin: 'RS Gold Star', cycles: 300000, minLines: 0, vmec: '-' },
    { pin: 'RS Diamond Star', cycles: 500000, minLines: 0, vmec: '-' },
    { pin: 'RS Blue Diamond Star', cycles: 1000000, minLines: 0, vmec: '-' },
    { pin: 'RS Legend Star', cycles: 5000000, minLines: 0, vmec: '-' },
];

const mockConsultantsProgressData: Record<number, ConsultantProgress> = {
    1: {
        id: 1,
        currentCycles: 1250,
        qualifiedLines: 3,
        legContributions: [{ leg: 'Rede Bruno', cycles: 600 }, { leg: 'Rede Carla', cycles: 450 }, { leg: 'Rede Outros', cycles: 200 }],
        digitalPoints: 0,
        digitalPin: 'Start',
        downlines: [
            { id: 2, name: 'Bruno Costa', avatar: 'https://picsum.photos/seed/bruno/50', currentPin: 'Ouro', currentCycles: 65, nextPinCycles: 150, digitalPin: 'Start', digitalPoints: 0, nextDigitalPoints: 100 },
            { id: 3, name: 'Carla Dias', avatar: 'https://picsum.photos/seed/carla/50', currentPin: 'Prata', currentCycles: 12, nextPinCycles: 70, digitalPin: 'Start', digitalPoints: 0, nextDigitalPoints: 100 },
        ]
    },
    2: {
        id: 2,
        currentCycles: 65,
        qualifiedLines: 1,
        legContributions: [{ leg: 'Rede Daniel', cycles: 50 }, { leg: 'Rede Outros', cycles: 15 }],
        digitalPoints: 0,
        digitalPin: 'Start',
        downlines: [
            { id: 4, name: 'Daniel Alves', avatar: 'https://picsum.photos/seed/daniel/50', currentPin: 'Prata', currentCycles: 18, nextPinCycles: 70, digitalPin: 'Start', digitalPoints: 0, nextDigitalPoints: 100 },
        ]
    },
    3: { id: 3, currentCycles: 12, qualifiedLines: 1, legContributions: [], downlines: [], digitalPoints: 0, digitalPin: 'Start' },
    4: { id: 4, currentCycles: 18, qualifiedLines: 2, legContributions: [], downlines: [], digitalPoints: 0, digitalPin: 'Start' },
    5: { id: 5, currentCycles: 4, qualifiedLines: 1, legContributions: [], downlines: [], digitalPoints: 0, digitalPin: 'Start' },
};

const ProgressIndicator: React.FC<{ title: string; icon: React.ReactNode; current: number; total: number; unit?: string }> = ({ title, icon, current, total, unit = '' }) => {
    const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium text-gray-300">{title}</span>
                </div>
                <span className="text-sm font-semibold text-white">{current} / {total} {unit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

interface GoalsAndPerformancePageProps {
    consultants?: Consultant[];
    selectedConsultantId?: number | null;
    onSelectConsultant?: (id: number) => void;
    onUpdateConsultant?: (c: Consultant) => void;
}

const GoalsAndPerformancePage: React.FC<GoalsAndPerformancePageProps> = ({ consultants = [], selectedConsultantId = null, onSelectConsultant, onUpdateConsultant }) => {
    const [localSelectedId, setLocalSelectedId] = useState<number | null>(selectedConsultantId ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [performanceData, setPerformanceData] = useState<any>(null);

    useEffect(() => { loadPerformance(); }, [localSelectedId]);

    const loadPerformance = async () => {
        try {
            setLoading(true);
            setError('');
            if (!localSelectedId) { setPerformanceData(null); return; }

            // Tentar buscar da API primeiro
            try {
                // Verificar se o método existe antes de chamar para evitar crash
                if (typeof reportsAPI.getPerformanceReports === 'function') {
                    const res = await reportsAPI.getPerformanceReports({ consultantId: localSelectedId });

                    if (res?.data?.success && res.data.report) {
                        setPerformanceData(res.data.report);
                        return;
                    }
                }
            } catch (apiErr) {
                console.warn('API de performance falhou ou indisponível, usando dados locais (MOCK).', apiErr);
            }

            // Fallback para Mock Data se API falhar ou não retornar dados
            console.log('Usando dados mockados para ID:', localSelectedId);
            const mockData = mockConsultantsProgressData[localSelectedId] || {
                id: localSelectedId,
                currentCycles: 0,
                qualifiedLines: 0,
                legContributions: [],
                downlines: [],
                digitalPoints: 0,
                digitalPin: 'Start'
            };

            // Estrutura compatível com o esperado pelo componente
            setPerformanceData({
                sigma: {
                    careerPoints: mockData.currentCycles,
                    careerPinCurrent: 'Iniciante',
                    careerPinNext: { name: 'Bronze', pointsRemaining: 5 }
                },
                digital: {
                    points: mockData.digitalPoints,
                    currentPin: mockData.digitalPin,
                    nextPin: { name: 'RS One Star', pointsRemaining: 10000 }
                },
                identity: {
                    sigmaActive: true
                },
                ...mockData
            });

        } catch (err) {
            console.error('Erro fatal ao carregar performance:', err);
            setError('Erro ao carregar dados de performance.');
        } finally {
            setLoading(false);
        }
    };

    const [isEditModalOpen, setEditModalOpen] = useState(false);

    // Handler para salvar edições do modal
    const handleSaveEdit = (updatedConsultant: Consultant) => {
        if (onUpdateConsultant) {
            onUpdateConsultant(updatedConsultant);
        }
        setEditModalOpen(false);
    };

    const [searchQuery, setSearchQuery] = useState('');

    const consultant = useMemo(() => consultants.find(c => c.id === localSelectedId) || null, [consultants, localSelectedId]);

    const consultantData = useMemo(() => {
        if (!performanceData || !consultant) return null;
        const id = consultant.id;
        const sigma = performanceData?.sigma || {};
        return {
            id,
            name: consultant.name,
            avatar: consultant.avatar,
            currentPin: sigma.careerPinCurrent || consultant.pin,
            status: performanceData?.identity?.sigmaActive ? 'Ativo' : consultant.status,
            currentCycles: sigma.careerPoints || 0,
            qualifiedLines: 0,
            legContributions: [],
            downlines: []
        } as any;
    }, [performanceData, consultant]);

    const nextPinData = useMemo(() => {
        const next = performanceData?.sigma?.careerPinNext || null;
        if (!next) return null;
        return { pin: next.name, cycles: next.pointsRemaining, minLines: '-', vmec: '-' };
    }, [performanceData]);

    const nextDigitalPinData = useMemo(() => {
        // Find current level index
        const currentPoints = performanceData?.digital?.points || 0;
        const nextLevel = digitalPinRequirements.find(req => req.cycles > currentPoints) || digitalPinRequirements[digitalPinRequirements.length - 1];

        return {
            pin: nextLevel.pin,
            cycles: nextLevel.cycles,
            minLines: '-',
            vmec: '-'
        };
    }, [performanceData]);

    const handleToggleLock = () => {
        if (!consultant || !onUpdateConsultant) return;
        const newStatus = consultant.status === 'Ativo' ? 'Inativo' : 'Ativo';
        onUpdateConsultant({ ...consultant, status: newStatus });
    };

    const statusClasses = { 'Ativo': 'text-green-400', 'Inativo': 'text-red-400', 'Pendente': 'text-yellow-400' };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] animate-fade-in">
            {/* Left Column: List of consultants */}
            <div className="lg:col-span-1 bg-black/50 border border-gray-800 rounded-xl flex flex-col p-4 h-full">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por Nome ou ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pl-10"
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {(consultants || []).map(c => (
                        <button key={c.id} onClick={() => { setLocalSelectedId(c.id); onSelectConsultant && onSelectConsultant(c.id); }} className={`w-full p-2 rounded-lg text-left transition-colors border ${localSelectedId === c.id ? 'bg-yellow-500/10 border-yellow-500/30' : 'border-transparent hover:bg-gray-700/50'}`}>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate ${localSelectedId === c.id ? 'text-yellow-400' : 'text-white'}`}>{c.name}</p>
                                <p className="text-xs text-gray-400">ID: {c.code || c.id} | PIN: {c.pin}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Column: Performance Details */}
            <div className="lg:col-span-3 bg-black/50 border border-gray-800 rounded-xl p-6 overflow-y-auto custom-scrollbar relative">
                {!consultantData ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                        <TrophyIcon className="w-16 h-16 text-gray-600" />
                        <h3 className="mt-4 text-lg font-semibold">Selecione um Consultor</h3>
                        <p className="max-w-xs">Escolha um consultor na lista ao lado para visualizar suas metas e desempenho.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Consultant Header */}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{consultantData.name}</h2>
                                    <p className="text-lg font-semibold text-yellow-400">{consultantData.currentPin}</p>
                                    <p className={`text-sm font-bold ${statusClasses[consultantData.status]}`}>{consultantData.status}</p>
                                </div>
                                <img src={consultantData.avatar} alt={consultantData.name} className="w-20 h-20 rounded-full border-4 border-yellow-500" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-3">
                                <button onClick={() => setEditModalOpen(true)} className="flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm bg-yellow-500 text-black hover:bg-yellow-600">
                                    <PencilIcon className="w-5 h-5" /> Editar Dossiê
                                </button>
                                <button onClick={handleToggleLock} className={`flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm ${consultantData.status === 'Ativo' ? 'bg-red-600/80 text-white hover:bg-red-600' : 'bg-green-600/80 text-white hover:bg-green-600'}`}>
                                    {consultantData.status === 'Ativo' ? <><LockClosedIcon className="w-5 h-5" /> Bloquear Conta</> : <><LockOpenIcon className="w-5 h-5" /> Desbloquear Conta</>}
                                </button>
                            </div>
                        </div>

                        {/* Performance Details - PHYSICAL */}
                        <div className="space-y-6">
                            {nextPinData && nextPinData.pin !== consultantData.currentPin ? (
                                <>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Próximo Nível: <span className="text-yellow-400">{nextPinData.pin}</span></h2>
                                        <p className="text-sm text-gray-400">Plano de Carreira Físico (Ciclos)</p>
                                    </div>
                                    <ProgressIndicator title="Pontos de Carreira" icon={<CycleIcon className="w-5 h-5 text-gray-400" />} current={consultantData.currentCycles} total={nextPinData.cycles as number} />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><UsersIcon className="w-5 h-5 text-gray-400" /> VMEC (Volume Máximo por Equipe)</h4>
                                        <div className="p-4 bg-gray-900/50 rounded-lg">
                                            <p className="text-sm text-yellow-400 mb-3">Regra para <span className="font-bold">{nextPinData.pin}</span>: <span className="font-mono">{nextPinData.vmec}</span></p>
                                            <div className="space-y-2">
                                                {consultantData.legContributions?.map((leg, i) => {
                                                    const percentage = consultantData.currentCycles > 0 ? (leg.cycles / consultantData.currentCycles) * 100 : 0;
                                                    return <div key={i}>
                                                        <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{leg.leg}</span><span className="text-gray-400">{leg.cycles} ciclos ({percentage.toFixed(1)}%)</span></div>
                                                        <div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                                                    </div>
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            {/* Performance Details - DIGITAL (DROP) - NEW SECTION */}
                            <div className="pt-6 border-t border-gray-800">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ShareIcon className="w-5 h-5 text-cyan-400" />
                                        Plano Digital (Drop)
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-500/30">
                                            {performanceData?.digital?.currentPin || 'Start'}
                                        </span>
                                        <span className="text-gray-500 text-xs">Próximo: <span className="text-white font-bold">{nextDigitalPinData?.pin || 'Member'}</span></span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <ProgressIndicator
                                        title="Volume de Vendas (Pontos)"
                                        icon={<ShareIcon className="w-4 h-4 text-cyan-400" />}
                                        current={performanceData?.digital?.points || 0}
                                        total={nextDigitalPinData?.cycles || 100}
                                    />
                                </div>

                                <div className="mt-3 p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
                                    <p className="text-xs text-cyan-300">
                                        <span className="font-bold">Regra:</span> Acumule pontos vendendo produtos da loja Drop.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Downline Focus */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl">
                            <header className="flex items-center p-4 border-b border-gray-800"><UsersIcon className="w-5 h-5 text-yellow-500" /><h3 className="text-lg font-semibold text-white ml-2">Foco da Rede (Diretos)</h3></header>
                            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                {consultantData.downlines?.length > 0 ? consultantData.downlines.map(d => {
                                    const progress = d.nextPinCycles > 0 ? (d.currentCycles / d.nextPinCycles) * 100 : 0;
                                    return (
                                        <button key={d.id} onClick={() => { setLocalSelectedId(d.id); onSelectConsultant && onSelectConsultant(d.id); }} className="w-full bg-gray-900/50 p-3 rounded-lg text-left hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full" /><div><p className="font-semibold text-white">{d.name}</p><p className="text-xs text-gray-400">{d.currentPin}</p></div></div><ChevronRightIcon className="w-5 h-5 text-gray-500" /></div>
                                            <div className="mt-2"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progresso p/ próximo PIN</span><span>{d.currentCycles}/{d.nextPinCycles}</span></div><div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div></div></div>
                                        </button>
                                    )
                                }) : <p className="text-sm text-center text-gray-500 py-4">Nenhum direto na rede.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal de Edição Unificado */}
            {consultant && (
                <ConsultantDetailModal
                    isOpen={isEditModalOpen}
                    consultant={consultant}
                    onClose={() => setEditModalOpen(false)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
};

export default GoalsAndPerformancePage;
