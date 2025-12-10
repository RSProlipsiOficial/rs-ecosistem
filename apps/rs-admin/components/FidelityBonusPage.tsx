import React, { useState, useMemo, useEffect } from 'react';
import { StarIcon, ClipboardDocumentListIcon } from './icons';
import { sigmaConfigAPI } from '../src/services/api';

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

const RuleRow: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-white">{value}</span>
    </div>
);

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


// --- NEW TYPES & MOCK DATA ---

interface FidelityReportItem {
    consultantId: number;
    consultantName: string;
    avatar: string;
    currentMatrix: string;
    reentriesThisMonth: number;
    isNextMatrixUnlocked: boolean;
}

// Cleared mock data
const mockFidelityReport: FidelityReportItem[] = [];

const statusClasses: Record<string, string> = {
    'Qualificado': 'bg-green-600/20 text-green-400',
    'Não Qualificado': 'bg-red-600/20 text-red-400',
};


const FidelityBonusPage: React.FC = () => {
    const [settings, setSettings] = useState({
        sourcePercentage: 1.25,
        sourceValue: 360,
        levels: [7, 8, 10, 15, 25, 35],
    });
    const [reportData] = useState(mockFidelityReport);
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const response = await sigmaConfigAPI.getFidelityBonusConfig();
            if (response?.data?.success) {
                const config = response.data.config;
                setSettings({
                    sourcePercentage: (config.percentualPool || 0.0125) * 100,
                    sourceValue: config.valorBase || 360,
                    levels: Object.values(config.levels || {}).map((l: any) => l.percentage * 100),
                });
            }
        } catch (err) {
            console.error('Erro:', err);
            setError('Erro ao carregar. Usando padrão.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            
            if (settings.sourcePercentage <= 0 || settings.sourcePercentage > 100) {
                setError('Percentual deve estar entre 0 e 100');
                return;
            }
            
            const totalPerc = settings.levels.reduce((a, b) => a + b, 0);
            if (totalPerc > 100) {
                setError(`Soma dos níveis (${totalPerc}%) excede 100%`);
                return;
            }
            
            const configData = {
                enabled: true,
                percentualPool: settings.sourcePercentage / 100,
                valorBase: settings.sourceValue,
                valorPool: (settings.sourcePercentage / 100) * settings.sourceValue,
                maxLevels: settings.levels.length,
                levels: settings.levels.reduce((acc, perc, idx) => {
                    acc[`L${idx + 1}`] = {
                        percentage: perc / 100,
                        value: ((settings.sourcePercentage / 100) * settings.sourceValue * perc) / 100,
                    };
                    return acc;
                }, {} as any),
            };
            
            await sigmaConfigAPI.updateFidelityBonusConfig(configData);
            setSuccess('✅ Configurações salvas!');
            setTimeout(() => setSuccess(''), 3000);
            await loadConfig();
        } catch (err) {
            setError('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleSettingChange = (field: 'sourcePercentage' | 'sourceValue', value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: Number(value) >= 0 ? Number(value) : 0,
        }));
    };

    const handleLevelChange = (index: number, value: string) => {
        const newLevels = [...settings.levels];
        newLevels[index] = Number(value) >= 0 ? Number(value) : 0;
        setSettings(prev => ({ ...prev, levels: newLevels }));
    };
    
    const totalBonusPool = useMemo(() => {
        return (settings.sourcePercentage / 100) * settings.sourceValue;
    }, [settings.sourcePercentage, settings.sourceValue]);

    const totalLevelsPercentage = useMemo(() => {
        return settings.levels.reduce((acc, p) => acc + p, 0);
    }, [settings.levels]);

    const filteredReport = useMemo(() => {
        if (statusFilter === 'Todos') {
            return reportData;
        }
        return reportData.filter(item => {
            const isQualified = item.reentriesThisMonth > 0 && item.isNextMatrixUnlocked;
            const status = isQualified ? 'Qualificado' : 'Não Qualificado';
            return status === statusFilter;
        });
    }, [reportData, statusFilter]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-yellow-500">Bônus Fidelidade (Pool de Reentradas)</h1>
                {loading && <div className="text-yellow-500">Carregando...</div>}
            </div>
            {success && <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">{success}</div>}
            {error && <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">{error}</div>}

            <SettingsCard title="Regras e Fonte do Bônus" icon={<StarIcon className="w-6 h-6 text-yellow-500" />}>
                 <p className="text-sm text-gray-400 mb-4">
                    Premiação de constância. O consultor recebe bônus de fidelidade somente após abrir a matriz seguinte (ex: ao abrir a matriz 2, ganha da 1).
                    O cálculo é feito no final do mês, verificando quantos ciclos a pessoa completou.
                </p>
                <div className="space-y-2">
                    <SettingsRow label="Fonte do Bônus (%)">
                        <SettingsInput 
                            value={settings.sourcePercentage} 
                            onChange={(e) => handleSettingChange('sourcePercentage', e.target.value)} 
                            adornment="%" 
                        />
                    </SettingsRow>
                    <SettingsRow label="Valor Base do Ciclo">
                         <SettingsInput 
                            value={settings.sourceValue} 
                            onChange={(e) => handleSettingChange('sourceValue', e.target.value)} 
                            adornment="R$" 
                        />
                    </SettingsRow>
                     <SettingsRow label="Total do Bônus (Pool)">
                        <div className="p-2.5 bg-gray-900/50 rounded-lg w-full font-semibold text-white">
                            {totalBonusPool.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </SettingsRow>
                    <RuleRow label="Gatilho" value="Pago a cada reentrada ativa na matriz" />
                    <RuleRow label="Elegibilidade" value="Requer que o consultor tenha avançado para a próxima matriz" />
                </div>
            </SettingsCard>
            
            <SettingsCard title="Distribuição por Nível" icon={<StarIcon className="w-6 h-6 text-yellow-500" />}>
                <table className="w-full text-sm text-center">
                    <thead className="text-xs text-yellow-500 uppercase">
                        <tr>
                            <th className="py-2">Nível</th>
                            <th className="py-2">% do Bônus</th>
                            <th className="py-2">Valor/Venda (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {settings.levels.map((perc, index) => (
                            <tr key={index} className="border-t border-gray-800">
                                <td className="py-2 font-medium">L{index+1}</td>
                                <td className="py-2 w-48">
                                    <SettingsInput 
                                        value={perc} 
                                        onChange={(e) => handleLevelChange(index, e.target.value)} 
                                        adornment="%"
                                    />
                                </td>
                                <td className="py-2 font-semibold text-white">
                                    {((perc / 100) * totalBonusPool).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
                                </td>
                            </tr>
                        ))}
                        <tr className={`border-t-2 font-bold ${totalLevelsPercentage.toFixed(2) === '100.00' ? 'border-yellow-500/50' : 'border-red-500/50'}`}>
                            <td className="py-2 text-white">TOTAL</td>
                            <td className={`py-2 text-white ${totalLevelsPercentage.toFixed(2) !== '100.00' ? 'text-red-400' : ''}`}>
                                {totalLevelsPercentage.toFixed(2)} %
                            </td>
                            <td className="py-2 text-white">
                                {totalBonusPool.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    </tbody>
                </table>
                {totalLevelsPercentage.toFixed(2) !== '100.00' && <p className="text-red-400 text-xs text-center mt-2">A soma das porcentagens deve ser 100%.</p>}
            </SettingsCard>

             <SettingsCard title="Relatório de Qualificação (Simulação)" icon={<ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" />}>
                <div className="mb-4">
                    <label className="text-sm text-gray-400 mr-4">Filtrar por Status:</label>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 p-2"
                    >
                        <option value="Todos">Todos</option>
                        <option value="Qualificado">Qualificado</option>
                        <option value="Não Qualificado">Não Qualificado</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-4 py-3">Consultor</th>
                                <th className="px-4 py-3">Matriz Atual</th>
                                <th className="px-4 py-3 text-center">Reentradas no Mês</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Bônus Gerado (Estimado)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReport.length > 0 ? filteredReport.map(item => {
                                const isQualified = item.reentriesThisMonth > 0 && item.isNextMatrixUnlocked;
                                const status = isQualified ? 'Qualificado' : 'Não Qualificado';
                                const bonusGenerated = isQualified ? item.reentriesThisMonth * totalBonusPool : 0;

                                return (
                                    <tr key={item.consultantId} className="border-b border-gray-800">
                                        <td className="px-4 py-3 font-medium flex items-center gap-3">
                                            <img src={item.avatar} alt={item.consultantName} className="w-10 h-10 rounded-full object-cover" />
                                            {item.consultantName}
                                        </td>
                                        <td className="px-4 py-3">{item.currentMatrix}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-lg">{item.reentriesThisMonth}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-400">
                                            {formatCurrency(bonusGenerated)}
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        Nenhum dado para exibir.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SettingsCard>

             <div className="flex justify-end pt-2">
                <button 
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

        </div>
    );
};

export default FidelityBonusPage;