import React, { useState, useEffect } from 'react';
import { CompensationSettings, CompensationTier, View, RewardFrequency } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { DistributionIcon } from './icons/DistributionIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { ImageUploader } from './ImageUploader';

interface CompensationPlanProps {
    settings: CompensationSettings;
    onSave: (newSettings: CompensationSettings) => void;
    onNavigate: (view: View) => void;
}

const CompensationPlan: React.FC<CompensationPlanProps> = ({ settings, onSave, onNavigate }) => {
    const [localSettings, setLocalSettings] = useState<CompensationSettings>(settings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        const changes = JSON.stringify(localSettings) !== JSON.stringify(settings);
        setHasChanges(changes);
    }, [localSettings, settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: name === 'frequency' ? value : Number(value)
        }));
    };

    const handleTierChange = (id: string, field: keyof Omit<CompensationTier, 'id' | 'pinImageUrl' | 'bannerImageUrl'>, value: string | number) => {
        setLocalSettings(prev => ({
            ...prev,
            tiers: prev.tiers.map(tier => 
                tier.id === id ? { ...tier, [field]: field === 'name' ? value : Number(value) } : tier
            )
        }));
    };

    const handleTierImageChange = (id: string, field: 'pinImageUrl' | 'bannerImageUrl', url: string) => {
        setLocalSettings(prev => ({
            ...prev,
            tiers: prev.tiers.map(tier => 
                tier.id === id ? { ...tier, [field]: url } : tier
            )
        }));
    };

    const handleAddTier = () => {
        const newTier: CompensationTier = {
            id: `tier-${Date.now()}`,
            name: 'Novo Nível',
            pointsRequired: localSettings.tiers.length > 0 ? (Math.max(...localSettings.tiers.map(t => t.pointsRequired)) + 1000) : 1000,
            reward: localSettings.tiers.length > 0 ? (Math.max(...localSettings.tiers.map(t => t.reward)) + 100) : 100,
            pinImageUrl: '',
            bannerImageUrl: '',
        };
        setLocalSettings(prev => ({
            ...prev,
            tiers: [...prev.tiers, newTier]
        }));
    };

    const handleRemoveTier = (id: string) => {
        setLocalSettings(prev => ({
            ...prev,
            tiers: prev.tiers.filter(tier => tier.id !== id)
        }));
    };
    
    const handleSave = () => {
        onSave(localSettings);
    };

    const handleDiscard = () => {
        setLocalSettings(settings);
    };

    const frequencyOptions: RewardFrequency[] = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];

    return (
        <div className="space-y-6">
             <div className="pb-6 mb-6 flex justify-end items-center border-b border-dark-800">
                <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-gold-400 mr-4">Você tem alterações não salvas.</p>}
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges}
                        className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Frequência da Premiação */}
                <div className="bg-black border border-dark-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Frequência da Premiação</h3>
                    <p className="text-sm text-gray-400 mb-6">Escolha a periodicidade em que os bônus do plano de compensação serão calculados e pagos.</p>
                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-300 mb-2">
                            Frequência de Pagamento
                        </label>
                        <select
                            id="frequency"
                            name="frequency"
                            value={localSettings.frequency}
                            onChange={handleInputChange}
                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500"
                        >
                            {frequencyOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Regras de Pontuação */}
                <div className="bg-black border border-dark-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Regras de Pontuação</h3>
                    <p className="text-sm text-gray-400 mb-6">Defina quantos pontos são gerados por cada R$ 1 vendido em cada modalidade.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="dropshippingPointsPerBrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <DistributionIcon className="w-5 h-5 text-gold-400" />
                                Pontos por R$1 vendido (Dropshipping)
                            </label>
                            <input
                                type="number"
                                id="dropshippingPointsPerBrl"
                                name="dropshippingPointsPerBrl"
                                value={localSettings.dropshippingPointsPerBrl}
                                onChange={handleInputChange}
                                className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label htmlFor="affiliatePointsPerBrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <MegaphoneIcon className="w-5 h-5 text-gold-400" />
                                Pontos por R$1 vendido (Afiliados)
                            </label>
                            <input
                                type="number"
                                id="affiliatePointsPerBrl"
                                name="affiliatePointsPerBrl"
                                value={localSettings.affiliatePointsPerBrl}
                                onChange={handleInputChange}
                                className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-gold-500"
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>

                {/* Níveis de Premiação */}
                <div className="bg-black border border-dark-800 rounded-lg">
                    <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                        <div>
                           <h3 className="text-lg font-semibold text-white">Níveis de Premiação ({localSettings.frequency})</h3>
                           <p className="text-sm text-gray-400">Crie os níveis de recompensa baseados na pontuação acumulada no período.</p>
                        </div>
                        <button onClick={handleAddTier} className="text-sm font-bold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                            + Adicionar Nível
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Nome do Nível</th>
                                    <th className="px-6 py-3">PIN</th>
                                    <th className="px-6 py-3">Banner do Prêmio</th>
                                    <th className="px-6 py-3">Pontos Necessários</th>
                                    <th className="px-6 py-3">Recompensa (Bônus R$)</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {localSettings.tiers.map(tier => (
                                    <tr key={tier.id}>
                                        <td className="px-6 py-4 align-middle">
                                            <input type="text" value={tier.name} onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white" />
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="w-24">
                                                <ImageUploader
                                                    currentImage={tier.pinImageUrl}
                                                    onImageUpload={(url) => handleTierImageChange(tier.id, 'pinImageUrl', url)}
                                                    placeholderText="Subir Pin"
                                                    aspectRatio="square"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="w-40">
                                                <ImageUploader
                                                    currentImage={tier.bannerImageUrl}
                                                    onImageUpload={(url) => handleTierImageChange(tier.id, 'bannerImageUrl', url)}
                                                    placeholderText="Subir Banner"
                                                    aspectRatio="video"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <input type="number" value={tier.pointsRequired} onChange={(e) => handleTierChange(tier.id, 'pointsRequired', e.target.value)} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white" />
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <input type="number" value={tier.reward} onChange={(e) => handleTierChange(tier.id, 'reward', e.target.value)} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white" />
                                        </td>
                                        <td className="px-6 py-4 text-right align-middle">
                                            <button onClick={() => handleRemoveTier(tier.id)} className="p-2 text-gray-500 hover:text-red-500" aria-label={`Excluir nível ${tier.name}`}>
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompensationPlan;