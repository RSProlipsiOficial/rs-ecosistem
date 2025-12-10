import React, { useState, useMemo, useEffect } from 'react';
import { sigmaConfigAPI } from '../src/services/api';
import { CogIcon, GridIcon, RefreshIcon, TrophyIcon, ClipboardDocumentListIcon, CycleIcon, CloseIcon, TruckIcon, CubeIcon, BuildingStorefrontIcon } from './icons';

// --- MOCK DATA FOR RE-ENTRY MODAL ---
const mockReentryProducts = [
    { id: 'rsp-001', name: 'Kit Ativação Essencial', price: 60.00 },
    { id: 'rsp-002', name: 'Kit Bem-Estar', price: 60.00 },
    { id: 'rsp-004', name: 'Kit Beleza', price: 60.00 },
];
const mockConsultantAddress = 'Rua das Flores, 123, Jardim Botânico, São Paulo - SP, 01000-000';


// --- HELPER COMPONENTS ---

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <header className="flex items-center p-4 bg-black/30 border-b border-gray-800">
            {icon}
            <h2 className="text-xl font-semibold text-white ml-3">{title}</h2>
        </header>
        <div className="p-6">{children}</div>
    </div>
);

const SettingsRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-3 border-b border-gray-800 last:border-b-0">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="md:col-span-2 relative flex items-center">{children}</div>
    </div>
);

const SettingsInput: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; adornment?: string; step?: string; }> = 
({ value, onChange, type = 'number', adornment, step = "0.01" }) => (
    <div className="relative w-full">
        <input type={type} value={value} onChange={onChange} min="0" step={step} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pr-12" />
        {adornment && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">{adornment}</span>}
    </div>
);

const SettingsToggle: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ checked, onChange }) => (
    <label className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
        <span className="ml-3 text-sm font-medium text-gray-300">{checked ? 'Ativada' : 'Desativada'}</span>
    </label>
);

const SettingsSelect: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ value, onChange, children }) => (
    <select value={value} onChange={onChange} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5">
        {children}
    </select>
);

// --- RE-ENTRY CONFIGURATION MODAL ---
interface AutoReentryConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: { enabled: boolean; productId: string; deliveryMethod: string; };
    onSave: (newConfig: { enabled: boolean; productId: string; deliveryMethod: string; }) => void;
}
const AutoReentryConfigModal: React.FC<AutoReentryConfigModalProps> = ({ isOpen, onClose, config, onSave }) => {
    const [tempConfig, setTempConfig] = useState(config);

    useEffect(() => {
        if (isOpen) {
            setTempConfig(config);
        }
    }, [config, isOpen]);
    
    if (!isOpen) return null;

    const handleSave = () => {
        onSave(tempConfig);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Configurar Reentrada Automática</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <main className="p-6 overflow-y-auto space-y-6">
                    <div className="flex justify-between items-center p-4 bg-black/50 rounded-lg">
                        <label htmlFor="enable-reentry" className="text-lg font-semibold text-white">Ativar Reentrada Automática</label>
                        <SettingsToggle checked={tempConfig.enabled} onChange={(e) => setTempConfig(prev => ({ ...prev, enabled: e.target.checked }))}/>
                    </div>
                    
                    {tempConfig.enabled && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><CubeIcon className="w-5 h-5 text-yellow-500"/> Produto da Recompra</h3>
                                <p className="text-sm text-gray-400 mb-2">Selecione o produto que será comprado automaticamente a cada ciclo.</p>
                                <SettingsSelect value={tempConfig.productId} onChange={(e) => setTempConfig(prev => ({...prev, productId: e.target.value}))}>
                                    {mockReentryProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})})</option>)}
                                </SettingsSelect>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><TruckIcon className="w-5 h-5 text-yellow-500"/> Método de Entrega</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setTempConfig(prev => ({...prev, deliveryMethod: 'home'}))} className={`p-4 rounded-lg border-2 text-left transition-colors ${tempConfig.deliveryMethod === 'home' ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                        <p className="font-bold text-white">Receber em Casa</p>
                                        <p className="text-xs text-gray-400">O produto será enviado para seu endereço.</p>
                                    </button>
                                     <button onClick={() => setTempConfig(prev => ({...prev, deliveryMethod: 'pickup'}))} className={`p-4 rounded-lg border-2 text-left transition-colors ${tempConfig.deliveryMethod === 'pickup' ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                        <p className="font-bold text-white">Retirar no CD</p>
                                        <p className="text-xs text-gray-400">Você retira o produto no Centro de Distribuição.</p>
                                    </button>
                                </div>
                            </div>

                            {tempConfig.deliveryMethod === 'home' && (
                                <div className="animate-fade-in">
                                    <h3 className="text-lg font-semibold text-white mb-2">Endereço de Entrega</h3>
                                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
                                        <p>{mockConsultantAddress}</p>
                                    </div>
                                </div>
                            )}

                             <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Pagamento</h3>
                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
                                    <p>O valor do produto selecionado será <strong className="text-yellow-400">debitado automaticamente</strong> do seu saldo na WalletPay assim que o ciclo for completado e o saldo estiver disponível.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                
                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600">Salvar Configuração</button>
                </footer>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const SigmeSettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { loadConfig(); }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const res = await sigmaConfigAPI.getTopSigmaConfig();
            if (res?.data?.success) {
                const config = res.data.config;
                setSettings({
                    poolPercentage: (config.percentualPool || 0.045) * 100,
                    topCount: config.topCount || 10,
                    levelWeights: config.levelWeights || [20, 15, 12, 10, 9, 8, 7, 6, 6.5, 6.5],
                });
            }
        } catch (err) {
            setError('Erro ao carregar');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            
            const totalWeights = settings.levelWeights.reduce((a, b) => a + b, 0);
            if (Math.abs(totalWeights - 100) > 0.1) {
                setError(`Soma dos pesos (${totalWeights.toFixed(1)}%) deve ser 100%`);
                return;
            }
            
            const configData = {
                enabled: true,
                percentualPool: settings.poolPercentage / 100,
                topCount: settings.topCount,
                levelWeights: settings.levelWeights,
            };
            
            await sigmaConfigAPI.updateTopSigmaConfig(configData);
            setSuccess('✅ Configurações Top SIGMA salvas!');
            setTimeout(() => setSuccess(''), 3000);
            await loadConfig();
        } catch (err) {
            setError('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const [settings, setSettings] = useState({
        poolPercentage: 4.5,
        topCount: 10,
        levelWeights: [20, 15, 12, 10, 9, 8, 7, 6, 6.5, 6.5],
    });

    const [matrixSettings, setMatrixSettings] = useState({
        totalValue: 360,
        payoutValue: 108,
        payoutPercentage: 30,
        reentryLimit: 10,
        spilloverType: 'ascendente',
        careerPoints: 1,
    });
    
    // NEW State for Re-entry configuration
    const [isReentryModalOpen, setIsReentryModalOpen] = useState(false);
    const [reentryConfig, setReentryConfig] = useState({
        enabled: true,
        productId: 'rsp-001',
        deliveryMethod: 'home', // 'home' or 'pickup'
    });

    // State for Depth Bonus
    const [depthBonus, setDepthBonus] = useState({
        basePercentage: 6.81,
        levels: [7, 8, 10, 15, 25, 35],
    });
    
    // State for Top Sigma
    const [topSigma, setTopSigma] = useState({
        basePercentage: 4.5,
        rankings: [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
    });


    // --- Handlers ---
    const handleMatrixChange = (field: keyof typeof matrixSettings, value: string | number) => {
        setMatrixSettings(prev => {
            const newSettings = { ...prev };
            const numValue = value === '' ? 0 : parseFloat(value as string);
            
            if (field === 'totalValue' || field === 'payoutValue' || field === 'payoutPercentage' || field === 'reentryLimit' || field === 'careerPoints') {
                (newSettings as any)[field] = isNaN(numValue) ? 0 : numValue;
            } else {
                 (newSettings as any)[field] = value;
            }

            const totalValue = newSettings.totalValue;
            
            if (field === 'payoutValue') {
                newSettings.payoutPercentage = totalValue > 0 ? (newSettings.payoutValue / totalValue) * 100 : 0;
            } else { // Handles totalValue and payoutPercentage changes
                 newSettings.payoutValue = totalValue * (newSettings.payoutPercentage / 100);
            }
            
            return newSettings;
        });
    };
    
    const handleDepthBonusChange = (index: number, value: string) => {
        const newLevels = [...depthBonus.levels];
        newLevels[index] = Number(value);
        setDepthBonus(prev => ({ ...prev, levels: newLevels }));
    };
    
    const handleTopSigmaChange = (index: number, value: string) => {
        const newRankings = [...topSigma.rankings];
        newRankings[index] = Number(value);
        setTopSigma(prev => ({ ...prev, rankings: newRankings }));
    };

    // --- Memos for calculated values ---
    const totalDepthBonusPool = useMemo(() => (matrixSettings.totalValue * depthBonus.basePercentage) / 100, [matrixSettings.totalValue, depthBonus.basePercentage]);
    const totalDepthBonusPercentage = useMemo(() => depthBonus.levels.reduce((acc, p) => acc + p, 0), [depthBonus.levels]);
    
    const totalTopSigmaPool = useMemo(() => (360 * topSigma.basePercentage) / 100, [topSigma.basePercentage]);
    const totalTopSigmaPercentage = useMemo(() => topSigma.rankings.reduce((acc, p) => acc + p, 0), [topSigma.rankings]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-6">Configurações do Plano SIGMA</h1>
            
            <SettingsCard title="Ciclo da Matriz" icon={<CycleIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Valor Total do Ciclo"><SettingsInput value={matrixSettings.totalValue} onChange={(e) => handleMatrixChange('totalValue', e.target.value)} adornment="R$" /></SettingsRow>
                <SettingsRow label="Payout do Ciclo (Valor)"><SettingsInput value={matrixSettings.payoutValue.toFixed(2)} onChange={(e) => handleMatrixChange('payoutValue', e.target.value)} adornment="R$" /></SettingsRow>
                <SettingsRow label="Payout do Ciclo (%)"><SettingsInput value={matrixSettings.payoutPercentage.toFixed(2)} onChange={(e) => handleMatrixChange('payoutPercentage', e.target.value)} adornment="%" step="1" /></SettingsRow>
                
                <SettingsRow label="Reentrada Automática">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <p className={`font-semibold ${reentryConfig.enabled ? 'text-green-400' : 'text-gray-500'}`}>
                                {reentryConfig.enabled ? 'Ativada' : 'Desativada'}
                            </p>
                            {reentryConfig.enabled && (
                                <p className="text-xs text-gray-400">
                                    {mockReentryProducts.find(p => p.id === reentryConfig.productId)?.name}, {reentryConfig.deliveryMethod === 'home' ? 'Entrega em casa' : 'Retirada no CD'}
                                </p>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsReentryModalOpen(true)} 
                            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                            Configurar
                        </button>
                    </div>
                </SettingsRow>

                {reentryConfig.enabled && <SettingsRow label="Limite de Reentradas/Mês"><SettingsInput value={matrixSettings.reentryLimit} onChange={(e) => handleMatrixChange('reentryLimit', e.target.value)} adornment="vezes" step="1"/></SettingsRow>}
                <SettingsRow label="Derramamento (Spillover)"><SettingsSelect value={matrixSettings.spilloverType} onChange={(e) => handleMatrixChange('spilloverType', e.target.value)}><option value="ascendente">Linha Ascendente</option><option value="global">Global (da esquerda para direita)</option></SettingsSelect></SettingsRow>
                <SettingsRow label="Pontos para Carreira"><SettingsInput value={matrixSettings.careerPoints} onChange={(e) => handleMatrixChange('careerPoints', e.target.value)} adornment="ponto(s)" step="1"/></SettingsRow>
            </SettingsCard>
            
            <SettingsCard title="Bônus de Profundidade (L1-L6)" icon={<GridIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Base de Cálculo">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-1/2"><SettingsInput value={depthBonus.basePercentage} onChange={(e) => setDepthBonus(p => ({...p, basePercentage: Number(e.target.value)}))} adornment="%"/></div>
                        <div className="w-1/2 flex items-center bg-gray-900/50 rounded-lg p-2.5"><span className="text-gray-400 text-sm mr-2">sobre R$ {matrixSettings.totalValue.toFixed(2)} =</span><span className="text-white font-semibold">{totalDepthBonusPool.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    </div>
                </SettingsRow>
                <table className="w-full text-sm text-center mt-4">
                    <thead className="text-xs text-yellow-500 uppercase"><tr><th className="py-2">Nível</th><th className="py-2">% do Bônus</th><th className="py-2">Valor/Venda (R$)</th></tr></thead>
                    <tbody className="text-gray-300">
                        {depthBonus.levels.map((perc, index) => (
                            <tr key={index} className="border-t border-gray-800">
                                <td className="py-2 font-medium">L{index+1}</td>
                                <td className="py-2 w-48"><SettingsInput value={perc} onChange={(e) => handleDepthBonusChange(index, e.target.value)} adornment="%" step="0.01"/></td>
                                <td className="py-2 font-semibold text-white">{(totalDepthBonusPool * (perc / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</td>
                            </tr>
                        ))}
                        <tr className={`border-t-2 font-bold ${totalDepthBonusPercentage.toFixed(2) === '100.00' ? 'border-yellow-500/50' : 'border-red-500/50'}`}>
                            <td className="py-2 text-white">TOTAL</td>
                            <td className={`py-2 text-white ${totalDepthBonusPercentage.toFixed(2) !== '100.00' ? 'text-red-400' : ''}`}>{totalDepthBonusPercentage.toFixed(2)} %</td>
                            <td className="py-2 text-white">{totalDepthBonusPool.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
                 {totalDepthBonusPercentage.toFixed(2) !== '100.00' && <p className="text-red-400 text-xs text-center mt-2">A soma das porcentagens deve ser 100%.</p>}
            </SettingsCard>
            
            <SettingsCard title="TOP SIGMA (Pool Global de Liderança)" icon={<TrophyIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Base de Cálculo">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-1/2"><SettingsInput value={topSigma.basePercentage} onChange={(e) => setTopSigma(p => ({...p, basePercentage: Number(e.target.value)}))} adornment="%"/></div>
                        <div className="w-1/2 flex items-center bg-gray-900/50 rounded-lg p-2.5"><span className="text-gray-400 text-sm mr-2">sobre R$ 360,00 =</span><span className="text-white font-semibold">{totalTopSigmaPool.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    </div>
                </SettingsRow>
                <table className="w-full text-sm text-center mt-4">
                    <thead className="text-xs text-yellow-500 uppercase"><tr><th className="py-2">Ranking</th><th className="py-2">% do Pool</th></tr></thead>
                    <tbody className="text-gray-300">
                        {topSigma.rankings.map((perc, index) => (
                             <tr key={index} className="border-t border-gray-800">
                                <td className="py-2 font-medium">{index + 1}º</td>
                                <td className="py-2 w-48"><SettingsInput value={perc} onChange={(e) => handleTopSigmaChange(index, e.target.value)} adornment="%" step="0.1"/></td>
                            </tr>
                        ))}
                        <tr className="border-t-2 border-yellow-500/50 font-bold">
                            <td className="py-2 text-white">TOTAL</td>
                            <td className="py-2 text-white">{totalTopSigmaPercentage.toFixed(2)} %</td>
                        </tr>
                    </tbody>
                </table>
            </SettingsCard>

            <div className="flex justify-end pt-2">
                <button
                    onClick={async () => {
                        setSaving(true);
                        setError('');
                        try {
                            const payload = {
                                cycle: {
                                    value: matrixSettings.totalValue,
                                    payoutValue: Number(matrixSettings.payoutValue),
                                    payoutPercent: Number(matrixSettings.payoutPercentage),
                                    autoReentryEnabled: reentryConfig.enabled,
                                    autoReentryLimitPerMonth: matrixSettings.reentryLimit,
                                    spilloverMode: matrixSettings.spilloverType
                                },
                                depthBonus: {
                                    basePercent: depthBonus.basePercentage,
                                    baseOverValue: matrixSettings.totalValue,
                                    levels: depthBonus.levels.map((p, i) => ({ level: i + 1, percent: p }))
                                },
                                fidelityBonus: {
                                    percentTotal: 0,
                                    levels: []
                                },
                                topSigma: {
                                    percentTotal: topSigma.basePercentage,
                                    ranks: topSigma.rankings.map((p, i) => ({ rank: i + 1, percent: p }))
                                },
                                career: {
                                    percentTotal: 0,
                                    valuePerCycle: 0,
                                    pins: []
                                }
                            };
                            await sigmaConfigAPI.updateSigmaSettings(payload);
                            setSuccess('✅ Configurações SIGMA salvas!');
                            setTimeout(() => setSuccess(''), 3000);
                        } catch (e) {
                            setError('Erro ao salvar');
                        } finally {
                            setSaving(false);
                        }
                    }}
                    className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors text-lg"
                >
                    Salvar Alterações
                </button>
            </div>
            
            <AutoReentryConfigModal 
                isOpen={isReentryModalOpen}
                onClose={() => setIsReentryModalOpen(false)}
                config={reentryConfig}
                onSave={setReentryConfig}
            />
        </div>
    );
};

export default SigmeSettingsPage;
