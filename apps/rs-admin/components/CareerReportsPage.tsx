import React, { useState, useEffect } from 'react';
import { careerPlanAPI } from '../src/services/api';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { CareerIcon, CloseIcon, RobotIcon, SparklesIcon, SpinnerIcon, UsersIcon, WhatsAppIcon } from './icons';
import ConsultantDetailModal from './ConsultantDetailModal';
import type { Consultant } from '../../types';

// --- MOCK DATA & TYPES ---

interface QualificationReport {
    id: number;
    consultant: Consultant;
    pinAnterior: string;
    pinAlcancado: string;
    ciclosApurados: number;
    linhasQualificadas: number;
    bonusPin: number;
    bonusFidelidade: number;
    bonusTopSigma: number;
    bonusProfundidade: number;
    status: 'Qualificado' | 'Promovido' | 'Não Qualificado';
}

// Cleared mock data
const mockQualificationReport: QualificationReport[] = [];

const statusClasses = {
    Qualificado: 'bg-green-600/20 text-green-400',
    Promovido: 'bg-blue-600/20 text-blue-400',
    'Não Qualificado': 'bg-red-600/20 text-red-400',
};

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

// --- MODAL COMPONENTS ---
const ConfirmationModal: React.FC<{onClose: () => void; onConfirm: () => void; report: QualificationReport[]; selectedBonuses: { fidelity: boolean; topSigma: boolean; careerPlan: boolean; }}> = ({ onClose, onConfirm, report, selectedBonuses }) => {
    const totalQualificados = report.filter(r => r.status !== 'Não Qualificado').length;
    const totalPromovidos = report.filter(r => r.status === 'Promovido').length;

    const cyclesToCloseList = [
        selectedBonuses.fidelity && 'Bônus Fidelidade',
        selectedBonuses.topSigma && 'Top SIGME',
        selectedBonuses.careerPlan && 'Plano de Carreira'
    ].filter(Boolean);
    
    const totalBonus = useMemo(() => {
        if (!report) return 0;
        return report.reduce((sum, r) => {
            let itemTotal = 0;
            if (selectedBonuses.careerPlan) itemTotal += r.bonusPin;
            if (selectedBonuses.fidelity) itemTotal += r.bonusFidelidade;
            if (selectedBonuses.topSigma) itemTotal += r.bonusTopSigma;
            // Profundidade is not a closable bonus type via this UI, so not included in total.
            return sum + itemTotal;
        }, 0);
    }, [report, selectedBonuses]);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl shadow-xl w-full max-w-lg">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-yellow-500">Confirmar Fechamento de Ciclo</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-gray-300">Você está prestes a finalizar os seguintes bônus do ciclo:</p>
                    <ul className="my-2 list-disc list-inside bg-black/50 p-3 rounded-lg text-yellow-400 space-y-1">
                        {cyclesToCloseList.length > 0 ? cyclesToCloseList.map(cycle => <li key={cycle}>{cycle}</li>) : <li className="text-gray-400">Nenhum bônus selecionado.</li>}
                    </ul>
                    <p className="text-gray-300">Esta ação é <strong className="text-red-400">IRREVERSÍVEL</strong> e irá consolidar os bônus e promoções.</p>
                    
                    <div className="p-4 bg-black/50 rounded-lg space-y-2 mt-4">
                        <h4 className="text-base font-semibold text-white mb-2">Resumo da Apuração</h4>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Total de Consultores Qualificados:</span><span className="font-bold">{totalQualificados}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Total de Promoções de PIN:</span><span className="font-bold">{totalPromovidos}</span></div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2 mt-2"><span className="text-white">Valor Total em Bônus (Selecionado):</span><span className="text-green-400">{totalBonus.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    </div>
                </main>
                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={onConfirm} className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Confirmar e Finalizar</button>
                </footer>
            </div>
        </div>
    );
};

const AiMessageModal: React.FC<{onClose: () => void; message: string; isLoading: boolean; onRegenerate: () => void; contactPhone: string | undefined}> = ({ onClose, message, isLoading, onRegenerate, contactPhone }) => {
    
    const handleSendWpp = () => {
        if (contactPhone) {
            const wppLink = `https://wa.me/${contactPhone}?text=${encodeURIComponent(message)}`;
            window.open(wppLink, '_blank');
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-500" /> Mensagem Gerada por IA</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400"><SpinnerIcon className="w-8 h-8 animate-spin mb-2" /> Gerando mensagem...</div>
                    ) : (
                        <textarea 
                            readOnly 
                            value={message} 
                            className="w-full h-40 p-3 bg-gray-800 rounded-lg text-gray-300 border border-gray-700 focus:ring-0 focus:border-gray-600 resize-none"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD700 #1E1E1E' }}
                        ></textarea>
                    )}
                </main>
                 <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-between gap-3">
                    <button onClick={onRegenerate} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50">
                        <SparklesIcon className="w-5 h-5"/>Regerar
                    </button>
                    <button onClick={handleSendWpp} disabled={isLoading || !contactPhone} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                        <WhatsAppIcon className="w-5 h-5"/> Enviar
                    </button>
                </footer>
            </div>
        </div>
    );
};


const CareerReportsPage: React.FC = () => {
    const [reports, setReports] = useState(mockQualificationReport);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { loadReports(); }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const res = await careerPlanAPI.getCareerReports();
            if (res?.data?.success) setReports(res.data.reports || mockQualificationReport);
        } catch (err) {
            setError('Erro ao carregar relatórios');
        } finally {
            setLoading(false);
        }
    };

    const [closureMode, setClosureMode] = useState<'Manual' | 'Automatico'>('Manual');
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isConsultantModalOpen, setConsultantModalOpen] = useState(false);
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
    const [processing, setProcessing] = useState(false);
    const [closureSuccess, setClosureSuccess] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [currentAiRequest, setCurrentAiRequest] = useState<{ type: 'pin' | 'journey'; item: QualificationReport } | null>(null);
    
    const [selectedBonuses, setSelectedBonuses] = useState({
        fidelity: false,
        topSigma: true,
        careerPlan: false,
    });
    
    const isAllSelected = useMemo(() => selectedBonuses.fidelity && selectedBonuses.topSigma && selectedBonuses.careerPlan, [selectedBonuses]);

    const handleSelectAllChange = () => {
        const nextState = !isAllSelected;
        setSelectedBonuses({
            fidelity: nextState,
            topSigma: nextState,
            careerPlan: nextState,
        });
    };

    const handleBonusSelectionChange = (bonus: keyof typeof selectedBonuses) => {
        setSelectedBonuses(prev => ({ ...prev, [bonus]: !prev[bonus] }));
    };

    const filteredReport = useMemo(() => {
        if (!report) return [];

        const noFiltersApplied = !selectedBonuses.fidelity && !selectedBonuses.topSigma && !selectedBonuses.careerPlan;

        if (noFiltersApplied) {
            return report;
        }

        return report.filter(item => {
            if (selectedBonuses.fidelity && item.bonusFidelidade > 0) return true;
            if (selectedBonuses.topSigma && item.bonusTopSigma > 0) return true;
            if (selectedBonuses.careerPlan && item.bonusPin > 0) return true;
            return false;
        });
    }, [report, selectedBonuses]);


    const handleGenerateReport = () => {
        setClosureSuccess(false);
        setReport([]); // Generate an empty report
    };

    const handleReset = () => {
        setReport(null);
        setClosureSuccess(false);
    };

    const handleConfirmClosure = () => {
        setProcessing(true);
        setConfirmModalOpen(false);
        setTimeout(() => {
            setProcessing(false);
            setClosureSuccess(true);
            setReport(null);
        }, 2000);
    };

    const handleAdjustConsultant = (item: QualificationReport) => {
        setSelectedConsultant(item.consultant);
        setConsultantModalOpen(true);
    };
    
    const handleGenerateMessage = async (type: 'pin' | 'journey', item: QualificationReport) => {
        setCurrentAiRequest({ type, item });
        setAiModalOpen(true);
        setIsAiLoading(true);
        setAiMessage('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let prompt = '';
            if (type === 'pin') {
                prompt = `Crie uma mensagem de parabéns curta e inspiradora para ${item.consultant.name} que acabou de ser promovido(a) ao PIN de ${item.pinAlcancado} na empresa RS Prólipsi. A mensagem deve ser pessoal e vibrante. Máximo de 3 frases.`;
            } else { // journey
                prompt = `Crie uma mensagem de reconhecimento e motivação para ${item.consultant.name} que se qualificou no ciclo da empresa RS Prólipsi, mantendo seu PIN de ${item.pinAlcancado}. Elogie sua consistência e dedicação. Máximo de 3 frases.`;
            }
            const response: GenerateContentResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiMessage(response.text);
        } catch (error) {
            console.error("AI Generation failed:", error);
            setAiMessage("Desculpe, não foi possível gerar a mensagem no momento.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleRegenerateAiMessage = () => {
        if (currentAiRequest) {
            handleGenerateMessage(currentAiRequest.type, currentAiRequest.item);
        }
    };

    const CustomCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => (
        <label onClick={onChange} className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors">
            <div className={`w-5 h-5 flex-shrink-0 border-2 rounded-md flex items-center justify-center transition-all ${checked ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600 bg-gray-800'}`}>
                {checked && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="3"><path d="M3 8 L6 11 L13 4" /></svg>}
            </div>
            <span>{label}</span>
        </label>
    );

    const noBonusesSelectedForClosure = !selectedBonuses.fidelity && !selectedBonuses.topSigma && !selectedBonuses.careerPlan;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center mb-8">
                <CareerIcon className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-yellow-500 ml-3">Apuração e Fechamento de Ciclo</h1>
            </header>
            
            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">1. Controle de Apuração e Fechamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">PERÍODO DE APURAÇÃO</label>
                        <select className={baseInputClasses}>
                            <option>Semanal (22/07 a 28/07)</option>
                            <option>Mensal (Julho/2024)</option>
                            <option>Trimestral (Q3/2024)</option>
                            <option>Semestral (S2/2024)</option>
                            <option>Anual (2024)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">MODO DE FECHAMENTO</label>
                         <div className="flex bg-gray-800 p-1 rounded-lg">
                            <button onClick={() => setClosureMode('Manual')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${closureMode === 'Manual' ? 'bg-yellow-500 text-black' : 'text-gray-300'}`}>Manual</button>
                            <button onClick={() => setClosureMode('Automatico')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${closureMode === 'Automatico' ? 'bg-yellow-500 text-black' : 'text-gray-300'}`}>Automático</button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleGenerateReport} className="w-full bg-gray-700 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-gray-600 transition-colors">Gerar Relatório</button>
                    </div>
                </div>
                {closureMode === 'Automatico' && <p className="text-xs text-gray-500 mt-2 text-center md:text-left">No modo automático, o sistema realizará a apuração e o fechamento todos os dias à meia-noite.</p>}
                
                 <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <label className="block text-xs font-medium text-gray-400 mb-2">SELECIONE OS BÔNUS PARA FECHAMENTO (E FILTRAR RELATÓRIO)</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                        <CustomCheckbox label="Todos" checked={isAllSelected} onChange={handleSelectAllChange} />
                        <div className="w-px h-5 bg-gray-700"></div> {/* Divider */}
                        <CustomCheckbox label="Bônus Fidelidade" checked={selectedBonuses.fidelity} onChange={() => handleBonusSelectionChange('fidelity')} />
                        <CustomCheckbox label="Top SIGME" checked={selectedBonuses.topSigma} onChange={() => handleBonusSelectionChange('topSigma')} />
                        <CustomCheckbox label="Plano de Carreira" checked={selectedBonuses.careerPlan} onChange={() => handleBonusSelectionChange('careerPlan')} />
                    </div>
                </div>
            </div>

            {report && (
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                     <header className="flex items-center justify-between p-4 bg-black/30 border-b border-gray-800">
                        <h2 className="text-xl font-semibold text-white">2. Relatório de Qualificação do Ciclo</h2>
                        <div className="flex gap-2">
                             <button onClick={handleReset} className="text-sm font-medium text-gray-300 bg-gray-700 rounded-lg px-4 py-2 hover:bg-gray-600">Resetar</button>
                             <button onClick={() => setConfirmModalOpen(true)} disabled={noBonusesSelectedForClosure} className="text-sm font-medium text-black bg-yellow-500 rounded-lg px-4 py-2 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400">Realizar Fechamento Agora</button>
                        </div>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                                <tr>
                                    <th className="px-4 py-3">Consultor</th>
                                    <th className="px-4 py-3">PIN Alcançado</th>
                                    <th className="px-4 py-3 text-right">Bônus PIN (R$)</th>
                                    <th className="px-4 py-3 text-right">Fidelidade (R$)</th>
                                    <th className="px-4 py-3 text-right">Top SIGME (R$)</th>
                                    <th className="px-4 py-3 text-right">Profundidade (R$)</th>
                                    <th className="px-4 py-3 text-right">Total Bônus (R$)</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReport.length > 0 ? filteredReport.map(item => {
                                    const totalBonus = item.bonusPin + item.bonusFidelidade + item.bonusTopSigma + item.bonusProfundidade;
                                    return (
                                        <tr key={item.id} className="border-b border-gray-800">
                                            <td className="px-4 py-2 font-medium flex items-center gap-3">
                                                <img src={item.consultant.avatar} alt={item.consultant.name} className="w-10 h-10 rounded-full object-cover"/>
                                                <div>
                                                    <p className="text-white">{item.consultant.name}</p>
                                                    <p className="text-xs text-gray-500">PIN Anterior: {item.pinAnterior}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 font-semibold">{item.pinAlcancado}</td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-300">{item.bonusPin.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-300">{item.bonusFidelidade.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-300">{item.bonusTopSigma.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-300">{item.bonusProfundidade.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-2 text-right font-bold text-green-400">{totalBonus.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-2 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[item.status]}`}>{item.status}</span></td>
                                            <td className="px-4 py-2 text-center space-x-1">
                                                <button onClick={() => handleAdjustConsultant(item)} className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded hover:bg-yellow-500/20">Ajustar</button>
                                                {item.status === 'Promovido' && <button onClick={() => handleGenerateMessage('pin', item)} className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20">Parabéns pelo PIN</button>}
                                                {item.status === 'Qualificado' && <button onClick={() => handleGenerateMessage('journey', item)} className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded hover:bg-green-500/20">Parabéns pela Jornada</button>}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={9} className="text-center py-10 text-gray-500">Nenhum dado no relatório.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {processing && (
                <div className="text-center p-12 bg-black/50 border border-dashed border-gray-700 rounded-xl animate-fade-in">
                    <SpinnerIcon className="w-12 h-12 mx-auto text-yellow-500 animate-spin" />
                    <p className="mt-4 text-lg text-gray-300">Processando fechamento do ciclo...</p>
                    <p className="text-sm text-gray-500">Isso pode levar alguns instantes.</p>
                </div>
            )}

            {closureSuccess && (
                 <div className="text-center p-12 bg-green-500/10 border border-dashed border-green-500/50 rounded-xl animate-fade-in">
                    <UsersIcon className="w-12 h-12 mx-auto text-green-400" />
                    <p className="mt-4 text-xl font-bold text-white">Ciclo Finalizado com Sucesso!</p>
                    <p className="text-sm text-gray-400">Os bônus foram creditados e as promoções consolidadas.</p>
                </div>
            )}

            {isConfirmModalOpen && report && <ConfirmationModal onClose={() => setConfirmModalOpen(false)} onConfirm={handleConfirmClosure} report={report} selectedBonuses={selectedBonuses} />}
            {isConsultantModalOpen && selectedConsultant && <ConsultantDetailModal isOpen={isConsultantModalOpen} consultant={selectedConsultant} onClose={() => setConsultantModalOpen(false)} onSave={() => {}} />}
            {isAiModalOpen && <AiMessageModal onClose={() => setAiModalOpen(false)} message={aiMessage} isLoading={isAiLoading} onRegenerate={handleRegenerateAiMessage} contactPhone={currentAiRequest?.item.consultant.contact.phone} />}
        </div>
    );
};

export default CareerReportsPage;