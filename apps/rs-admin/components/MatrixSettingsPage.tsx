import React, { useState, useEffect, useMemo } from 'react';
import { CogIcon, UsersIcon, RefreshIcon } from './icons';
import { sigmaConfigAPI } from '../src/services/api';

interface SettingsCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon, children, footer }) => (
    <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <header className="flex items-center p-4 bg-black/30 border-b border-gray-800">
            {icon}
            <h2 className="text-xl font-semibold text-white ml-3">{title}</h2>
        </header>
        <div className="p-6">
            {children}
        </div>
        {footer && (
             <footer className="p-4 bg-black/30 border-t border-gray-800 flex justify-end">
                {footer}
            </footer>
        )}
    </div>
);


interface SettingsRowProps {
    label: string;
    children: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-3 border-b border-gray-800 last:border-b-0">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="md:col-span-2 relative flex items-center">
            {children}
        </div>
    </div>
);

const SettingsInput: React.FC<{name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, adornment?: string}> = 
({ name, value, onChange, type = 'text', adornment }) => (
    <div className="relative w-full">
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pr-12"
        />
        {adornment && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">{adornment}</span>}
    </div>
);

const SettingsToggle: React.FC<{name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ name, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" id={name} name={name} className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

interface MatrixSettingsPageProps {
    matrixTitle: string;
}

const defaultLevelPercentages = [5, 10, 15, 20, 50];
const mockMatrixSettings: Record<string, any> = {
    'Matriz 1 (2x5)': { activationValue: 120, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 2, minConsumption: 60 },
    'Matriz 2 (3x5)': { activationValue: 180, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 3, minConsumption: 60 },
    'Matriz 3 (4x5)': { activationValue: 240, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 4, minConsumption: 60 },
    'Matriz 4 (5x5)': { activationValue: 300, pointsPercentage: 19.5, reentry: false, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 5, minConsumption: 60 },
    'Matriz 5 (6x5)': { activationValue: 360, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 6, minConsumption: 60 },
    'Matriz 6 (7x5)': { activationValue: 420, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 7, minConsumption: 60 },
    'Matriz 7 (8x5)': { activationValue: 480, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 8, minConsumption: 60 },
    'Matriz 8 (9x5)': { activationValue: 600, pointsPercentage: 19.5, reentry: true, levelBonusPercentages: defaultLevelPercentages, requiredDirects: 9, minConsumption: 60 },
};

const MatrixSettingsPage: React.FC<MatrixSettingsPageProps> = ({ matrixTitle }) => {
    const [settings, setSettings] = useState({
        activationValue: 0,
        requiredDirects: 0,
        minConsumption: 60,
        pointsPercentage: 19.5,
        reentry: true,
        levelBonusPercentages: [0, 0, 0, 0, 0],
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadMatrixConfig();
    }, [matrixTitle]);

    const loadMatrixConfig = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await sigmaConfigAPI.getMatrixConfig();
            
            if (response?.data?.success && response.data.config) {
                const config = response.data.config;
                setSettings({
                    activationValue: config.cycle?.value || 360,
                    requiredDirects: config.slots?.total || 6,
                    minConsumption: config.validation?.requireMinimumBalance || 60,
                    pointsPercentage: (config.bonuses?.cycle?.percentage || 0.30) * 100,
                    reentry: config.reentry?.automatic || true,
                    levelBonusPercentages: config.bonuses?.depth?.levels || defaultLevelPercentages,
                });
            } else {
                // Usar dados mock se API falhar
                const initialSettings = mockMatrixSettings[matrixTitle] || { 
                    activationValue: 360, 
                    pointsPercentage: 30, 
                    reentry: true, 
                    levelBonusPercentages: defaultLevelPercentages,
                    requiredDirects: 6,
                    minConsumption: 60,
                };
                setSettings(initialSettings);
            }
        } catch (err) {
            console.error('Erro ao carregar configuração:', err);
            setError('Erro ao carregar configuração. Usando dados padrão.');
            // Usar dados mock
            const initialSettings = mockMatrixSettings[matrixTitle] || { 
                activationValue: 360, 
                pointsPercentage: 30, 
                reentry: true, 
                levelBonusPercentages: defaultLevelPercentages,
                requiredDirects: 6,
                minConsumption: 60,
            };
            setSettings(initialSettings);
        } finally {
            setLoading(false);
        }
    };

    const totalPointsValue = useMemo(() => {
        return (parseFloat(String(settings.activationValue)) * parseFloat(String(settings.pointsPercentage))) / 100;
    }, [settings.activationValue, settings.pointsPercentage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleLevelBonusPercentageChange = (index: number, value: string) => {
        const newPercentages = [...settings.levelBonusPercentages];
        newPercentages[index] = parseFloat(value) || 0;
        setSettings(prev => ({ ...prev, levelBonusPercentages: newPercentages }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            
            // Validações
            if (settings.activationValue <= 0) {
                setError('Valor de ativação deve ser maior que 0');
                return;
            }
            
            if (settings.requiredDirects < 0) {
                setError('Diretos necessários não pode ser negativo');
                return;
            }
            
            if (settings.pointsPercentage <= 0 || settings.pointsPercentage > 100) {
                setError('Percentual de pontos deve estar entre 0 e 100');
                return;
            }
            
            // Validar soma dos percentuais de nível
            const totalPercentage = settings.levelBonusPercentages.reduce((a, b) => a + b, 0);
            if (totalPercentage > 100) {
                setError(`Soma dos percentuais de nível (${totalPercentage}%) não pode exceder 100%`);
                return;
            }
            
            // Preparar dados para API
            const configData = {
                matrix: {
                    name: 'SIGMA',
                    type: '1x6',
                    size: settings.requiredDirects,
                },
                cycle: {
                    value: settings.activationValue,
                    completionRequirement: settings.requiredDirects,
                },
                bonuses: {
                    cycle: {
                        enabled: true,
                        percentage: settings.pointsPercentage / 100,
                        value: (settings.activationValue * settings.pointsPercentage) / 100,
                    },
                    depth: {
                        enabled: true,
                        levels: settings.levelBonusPercentages,
                    },
                },
                reentry: {
                    enabled: true,
                    automatic: settings.reentry,
                    cost: settings.activationValue,
                },
                validation: {
                    requireMinimumBalance: settings.minConsumption,
                },
            };
            
            await sigmaConfigAPI.updateMatrixConfig(configData);
            
            setSuccess('✅ Configurações da Matriz SIGMA salvas com sucesso!');
            setTimeout(() => setSuccess(''), 5000);
            
            // Recarregar
            await loadMatrixConfig();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError('Erro ao salvar configurações. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-yellow-500">{`Configurações da Matriz SIGMA`}</h1>
                {loading && <div className="text-yellow-500">Carregando...</div>}
            </div>
            
            {/* Mensagens */}
            {success && (
                <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                    {error}
                </div>
            )}

            <SettingsCard title="Parâmetros Gerais da Matriz" icon={<CogIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Valor da Ativação na Matriz">
                    <SettingsInput name="activationValue" value={settings.activationValue} onChange={handleChange} type="number" adornment="R$" />
                </SettingsRow>
                <SettingsRow label="Diretos Qualificados Necessários">
                    <SettingsInput name="requiredDirects" value={settings.requiredDirects} onChange={handleChange} type="number" adornment="Direto(s)" />
                </SettingsRow>
                <SettingsRow label="Consumo Mínimo para Qualificação">
                    <SettingsInput name="minConsumption" value={settings.minConsumption} onChange={handleChange} type="number" adornment="R$" />
                </SettingsRow>
                <SettingsRow label="Percentual de Pontos para Bônus">
                    <SettingsInput name="pointsPercentage" value={settings.pointsPercentage} onChange={handleChange} type="number" adornment="%" />
                </SettingsRow>
                 <SettingsRow label="Total de Pontos (Bônus Pool)">
                     <div className="flex items-center bg-gray-900/50 rounded-lg p-2.5 w-full cursor-not-allowed">
                        <span className="text-white font-semibold">
                            {totalPointsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Regras de Reentrada" icon={<RefreshIcon className="w-6 h-6 text-yellow-500" />}>
                <SettingsRow label="Reentrada Automática na Própria Matriz">
                    <SettingsToggle name="reentry" checked={settings.reentry} onChange={handleChange} />
                </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Distribuição de Bônus por Nível" icon={<UsersIcon className="w-6 h-6 text-yellow-500" />}>
                {settings.levelBonusPercentages.map((percentage, index) => {
                    const levelBonusValue = (totalPointsValue * percentage) / 100;
                    return (
                        <SettingsRow key={index} label={`Bônus Nível ${index + 1}`}>
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-1/2">
                                    <SettingsInput 
                                        name={`levelPercentage${index}`} 
                                        value={percentage} 
                                        onChange={(e) => handleLevelBonusPercentageChange(index, e.target.value)} 
                                        type="number" 
                                        adornment="%" 
                                    />
                                </div>
                                <div className="w-1/2 flex items-center bg-gray-900/50 rounded-lg p-2.5 cursor-not-allowed">
                                    <span className="text-gray-400 text-sm mr-2">Valor:</span>
                                    <span className="text-white font-semibold">
                                        {levelBonusValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            </div>
                        </SettingsRow>
                    );
                })}
            </SettingsCard>

            <div className="flex justify-end pt-2">
                <button 
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
};

export default MatrixSettingsPage;