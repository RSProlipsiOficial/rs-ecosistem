import React, { useState, useEffect } from 'react';
import { CareerIcon, TableCellsIcon, TrashIcon, ArrowUpTrayIcon, PlusIcon } from './icons';
import { digitalCareerAPI } from '../src/services/api';

// --- Interface Definitions ---

interface DigitalPinLevel {
    id: string;
    pin: string;
    volume: number | string;
    // RS Products
    commissionPhysicalRs: number | string;
    commissionRsDigital: number | string;
    // Affiliate Products
    commissionPhysicalAffiliate: number | string;
    commissionAffiliateEssential: number | string;
    commissionAffiliateProfessional: number | string;
    commissionAffiliatePremium: number | string;

    award: string;
    image: string | null;
    displayOrder: number;
}

interface SettingsCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

// --- Component Definitions ---

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

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-xs rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2";

const DigitalCareerPlanPage: React.FC = () => {
    const [careerData, setCareerData] = useState<DigitalPinLevel[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Carregar Níveis Digitais da API
    useEffect(() => {
        loadLevels();
    }, []);

    // --- FALLBACK DATA (Recovered from Database 2026-02-12) ---
    const DEFAULT_DIGITAL_LEVELS: DigitalPinLevel[] = [
        {
            id: "33cb7410-25b5-41d5-8ed2-f1f38ef2bdef",
            pin: "RS One Star",
            volume: 10000,
            commissionRsDigital: 30,
            award: "Placa RS One Star",
            image: null,
            displayOrder: 1,
            commissionPhysicalRs: 27,
            commissionPhysicalAffiliate: 8,
            commissionAffiliateEssential: 35,
            commissionAffiliateProfessional: 35,
            commissionAffiliatePremium: 35
        },
        {
            id: "ec22bcfa-3f59-4e84-b54d-b87e90575f38",
            pin: "RS Two Star",
            volume: 100000,
            commissionRsDigital: 35,
            award: "Headset Gamer Premium + Placa RS Two Star",
            image: null,
            displayOrder: 2,
            commissionPhysicalRs: 30,
            commissionPhysicalAffiliate: 9,
            commissionAffiliateEssential: 36,
            commissionAffiliateProfessional: 36,
            commissionAffiliatePremium: 36
        },
        {
            id: "eeab1b4f-cb3f-492e-99e9-8214122490cc",
            pin: "RS Three Star",
            volume: 250000,
            commissionRsDigital: 40,
            award: "Kit Creator Light (Teclado/Mouse/Mic/Ring Light) + Placa RS Three Star",
            image: null,
            displayOrder: 3,
            commissionPhysicalRs: 33,
            commissionPhysicalAffiliate: 10,
            commissionAffiliateEssential: 37,
            commissionAffiliateProfessional: 37,
            commissionAffiliatePremium: 37
        },
        {
            id: "4035c471-aa23-4661-ac37-5c210b672935",
            pin: "RS Pro Star",
            volume: 500000,
            commissionRsDigital: 45,
            award: "PC i9 PRO BUILDER (i9/16GB/SSD) + Placa RS Pro Star",
            image: null,
            displayOrder: 4,
            commissionPhysicalRs: 35,
            commissionPhysicalAffiliate: 11,
            commissionAffiliateEssential: 38,
            commissionAffiliateProfessional: 38,
            commissionAffiliatePremium: 38
        },
        {
            id: "7bc8f497-3016-4e39-b15d-e394605d7370",
            pin: "RS Prime Star",
            volume: 1000000,
            commissionRsDigital: 50,
            award: "Cruzeiro RS Premium Pack + Kit RS Prime + Placa RS Prime Star",
            image: null,
            displayOrder: 5,
            commissionPhysicalRs: 36,
            commissionPhysicalAffiliate: 12,
            commissionAffiliateEssential: 39,
            commissionAffiliateProfessional: 40,
            commissionAffiliatePremium: 40
        },
        {
            id: "d4f5084f-3f7b-4150-af30-e2dd076625cb",
            pin: "RS Elite Star",
            volume: 2000000,
            commissionRsDigital: 55,
            award: "Elite Travel Pack (Viagem Int) + Kit Elite + Placa RS Elite Star",
            image: null,
            displayOrder: 6,
            commissionPhysicalRs: 37,
            commissionPhysicalAffiliate: 13,
            commissionAffiliateEssential: 40,
            commissionAffiliateProfessional: 43,
            commissionAffiliatePremium: 45
        },
        {
            id: "66af9e05-4d75-4d63-81e9-94b96df02e29",
            pin: "RS Legend Star",
            volume: 5000000,
            commissionRsDigital: 60,
            award: "THE LEGEND PACK (Carro 0km) + Placa RS Legend Star",
            image: null,
            displayOrder: 7,
            commissionPhysicalRs: 38,
            commissionPhysicalAffiliate: 15,
            commissionAffiliateEssential: 40,
            commissionAffiliateProfessional: 45,
            commissionAffiliatePremium: 50
        }
    ];

    const loadLevels = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await digitalCareerAPI.getLevels();

            if (response?.data?.success && response.data.levels && response.data.levels.length > 0) {
                // Mapear dados da API para formato do componente
                const mappedLevels = response.data.levels.map((level: any) => ({
                    id: level.id,
                    pin: level.name,
                    volume: level.required_volume,
                    // RS
                    commissionPhysicalRs: level.commission_physical_rs || 0,
                    commissionRsDigital: level.commission_rs_digital || 0,
                    // Affiliate
                    commissionPhysicalAffiliate: level.commission_physical_affiliate || 0,
                    commissionAffiliateEssential: level.commission_affiliate_digital_essential || 0,
                    commissionAffiliateProfessional: level.commission_affiliate_digital_professional || 0,
                    commissionAffiliatePremium: level.commission_affiliate_digital_premium || 0,

                    award: level.award || '',
                    image: level.pin_image,
                    displayOrder: level.display_order || 0
                }));

                setCareerData(mappedLevels);
            } else {
                console.warn('API retornou vazio ou erro. Usando Fallback Local.');
                // Fallback se a API retornar vazio (mas sucesso)
                setCareerData(DEFAULT_DIGITAL_LEVELS);
            }
        } catch (err) {
            console.error('Erro ao carregar Níveis Digitais:', err);
            console.warn('Usando Fallback Local devido ao erro.');
            // Fallback em caso de erro de rede/servidor
            setCareerData(DEFAULT_DIGITAL_LEVELS);
            // Não mostrar erro na UI se o fallback funcionou, apenas logar warning
            // setError('Erro ao carregar Níveis Digitais. Usando dados locais.'); 
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (id: string, field: keyof DigitalPinLevel, value: string) => {
        setCareerData(prevData =>
            prevData.map(row =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    };

    const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            try {
                setLoading(true);
                setError('');

                // Upload via API
                const response = await digitalCareerAPI.uploadImage(file);

                if (!response.data || !response.data.url) {
                    throw new Error('Falha no upload: URL não retornada');
                }

                const imageUrl = response.data.url;

                // Se não for ID temporário, atualiza imediatamente
                if (!id.toString().startsWith('new_')) {
                    await digitalCareerAPI.updateLevel(id, { pin_image: imageUrl });
                }

                // Atualizar estado local
                setCareerData(prevData =>
                    prevData.map(row =>
                        row.id === id ? { ...row, image: imageUrl } : row
                    )
                );

                setSuccess(`Imagem do ${careerData.find(p => p.id === id)?.pin} atualizada!`);
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                console.error('Erro ao fazer upload:', err);
                setError('Erro ao fazer upload da imagem');
            } finally {
                setLoading(false);
            }
        }
    };

    const addLevelRow = () => {
        const newLevel: DigitalPinLevel = {
            id: `new_${Date.now()}`,
            pin: `Novo Nível`,
            volume: 0,
            commissionPhysicalRs: 0,
            commissionRsDigital: 0,
            commissionPhysicalAffiliate: 0,
            commissionAffiliateEssential: 0,
            commissionAffiliateProfessional: 0,
            commissionAffiliatePremium: 0,
            award: '',
            image: null,
            displayOrder: careerData.length + 1
        };
        setCareerData([...careerData, newLevel]);
    };

    const removeLevelRow = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este Nível?')) {
            return;
        }

        try {
            if (!id.toString().startsWith('new_')) {
                setLoading(true);
                await digitalCareerAPI.deleteLevel(id);
            }
            setCareerData(careerData.filter(row => row.id !== id));
        } catch (err) {
            console.error('Erro ao remover:', err);
            setError('Erro ao remover Nível do banco.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            for (const level of careerData) {
                const payload = {
                    name: level.pin,
                    display_order: Number(level.displayOrder),
                    required_volume: Number(level.volume),
                    // Map back to DB Columns
                    commission_physical_rs: Number(level.commissionPhysicalRs),
                    commission_rs_digital: Number(level.commissionRsDigital),
                    commission_physical_affiliate: Number(level.commissionPhysicalAffiliate),
                    commission_affiliate_digital_essential: Number(level.commissionAffiliateEssential),
                    commission_affiliate_digital_professional: Number(level.commissionAffiliateProfessional),
                    commission_affiliate_digital_premium: Number(level.commissionAffiliatePremium),

                    award: level.award,
                    pin_image: level.image,
                    active: true
                };

                if (!level.id.toString().startsWith('new_')) {
                    await digitalCareerAPI.updateLevel(level.id, payload);
                } else {
                    await digitalCareerAPI.createLevel(payload);
                }
            }

            setSuccess('✅ Alterações salvas com sucesso!');
            setTimeout(() => setSuccess(''), 5000);
            await loadLevels();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError('Erro ao salvar alterações. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <CareerIcon className="w-8 h-8 text-blue-500" />
                    <h1 className="text-3xl font-bold text-blue-500 ml-3">Plano de Carreira Digital (Drop/Afiliado)</h1>
                </div>
                {loading && <div className="text-blue-500">Carregando...</div>}
            </header>

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

            <SettingsCard
                title="Tabela de Níveis Digitais (Star System)"
                icon={<TableCellsIcon className="w-6 h-6 text-blue-500" />}
                footer={
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || loading}
                        className="bg-blue-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-300">
                        <thead className="text-xs text-blue-500 uppercase bg-black/30">
                            {/* Group Headers */}
                            <tr>
                                <th rowSpan={2} className="px-2 py-2 text-center border-b border-gray-800">Ord.</th>
                                <th rowSpan={2} className="px-3 py-2 border-b border-gray-800">Nível (Pin)</th>
                                <th rowSpan={2} className="px-3 py-2 border-b border-gray-800">Vol. Vendas</th>

                                <th colSpan={2} className="px-2 py-2 text-center border-b border-r border-gray-700 bg-gray-900/50">Produtos RS Próprios</th>
                                <th colSpan={4} className="px-2 py-2 text-center border-b border-gray-800 bg-gray-900/30">Produtos Afiliados (Terceiros)</th>

                                <th rowSpan={2} className="px-3 py-2 border-b border-gray-800">Premiação</th>
                                <th rowSpan={2} className="px-3 py-2 text-center border-b border-gray-800">Img</th>
                                <th rowSpan={2} className="px-3 py-2 text-center border-b border-gray-800">Ações</th>
                            </tr>
                            {/* Sub Headers */}
                            <tr>
                                {/* RS Subheaders */}
                                <th className="px-2 py-2 text-center text-yellow-400 border-b border-r border-gray-800 bg-gray-900/50" title="Comissão Física RS">Físico</th>
                                <th className="px-2 py-2 text-center text-green-400 border-b border-r border-gray-700 bg-gray-900/50" title="Comissão Digital RS">Digital</th>

                                {/* Affiliate Subheaders */}
                                <th className="px-2 py-2 text-center text-purple-400 border-b border-r border-gray-800 bg-gray-900/30" title="Físico Afiliado">Físico</th>
                                <th className="px-2 py-2 text-center text-blue-400 border-b border-gray-800 bg-gray-900/30" title="Digital Essencial (teto 40%)">Essen.</th>
                                <th className="px-2 py-2 text-center text-indigo-400 border-b border-gray-800 bg-gray-900/30" title="Digital Profissional (teto 45%)">Prof.</th>
                                <th className="px-2 py-2 text-center text-violet-400 border-b border-gray-800 bg-gray-900/30" title="Digital Premium (teto 50%)">Prem.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careerData.map((level) => (
                                <tr key={level.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className="px-1 py-1 text-center">
                                        <div className="flex justify-center">
                                            <input
                                                type="number"
                                                value={level.displayOrder}
                                                onChange={e => handleTableChange(level.id, 'displayOrder', e.target.value)}
                                                className={`${baseInputClasses} text-center px-0 h-8`}
                                                style={{ width: '35px' }}
                                            />
                                        </div>
                                    </td>

                                    <td className="px-2 py-1">
                                        <input type="text" value={level.pin} onChange={e => handleTableChange(level.id, 'pin', e.target.value)} className={`${baseInputClasses} h-8 text-xs`} style={{ minWidth: '130px' }} />
                                    </td>

                                    <td className="px-2 py-1">
                                        <input type="number" value={level.volume} onChange={e => handleTableChange(level.id, 'volume', e.target.value)} className={`${baseInputClasses} h-8 text-xs`} style={{ minWidth: '90px' }} step="0.01" />
                                    </td>

                                    {/* RS Commissions */}
                                    <td className="px-1 py-1 bg-gray-900/20 border-l border-gray-800">
                                        <input
                                            type="number"
                                            value={level.commissionPhysicalRs}
                                            onChange={e => handleTableChange(level.id, 'commissionPhysicalRs', e.target.value)}
                                            className={`${baseInputClasses} border-yellow-900/30 text-yellow-200 focus:border-yellow-500 text-center font-bold h-8`}
                                            step="0.1"
                                        />
                                    </td>
                                    <td className="px-1 py-1 bg-gray-900/20 border-r border-gray-800">
                                        <input
                                            type="number"
                                            value={level.commissionRsDigital}
                                            onChange={e => handleTableChange(level.id, 'commissionRsDigital', e.target.value)}
                                            className={`${baseInputClasses} border-green-900/30 text-green-200 focus:border-green-500 text-center font-bold h-8`}
                                            step="0.1"
                                        />
                                    </td>

                                    {/* Affiliate Commissions */}
                                    <td className="px-1 py-1 bg-gray-800/20">
                                        <input
                                            type="number"
                                            value={level.commissionPhysicalAffiliate}
                                            onChange={e => handleTableChange(level.id, 'commissionPhysicalAffiliate', e.target.value)}
                                            className={`${baseInputClasses} border-purple-900/30 text-purple-200 focus:border-purple-500 text-center font-bold h-8`}
                                            step="0.1"
                                        />
                                    </td>
                                    <td className="px-1 py-1 bg-gray-800/20">
                                        <input
                                            type="number"
                                            value={level.commissionAffiliateEssential}
                                            onChange={e => handleTableChange(level.id, 'commissionAffiliateEssential', e.target.value)}
                                            className={`${baseInputClasses} border-blue-900/30 text-blue-200 focus:border-blue-500 text-center font-bold h-8`}
                                            step="0.1"
                                        />
                                    </td>
                                    <td className="px-1 py-1 bg-gray-800/20">
                                        <input
                                            type="number"
                                            value={level.commissionAffiliateProfessional}
                                            onChange={e => handleTableChange(level.id, 'commissionAffiliateProfessional', e.target.value)}
                                            className={`${baseInputClasses} border-indigo-900/30 text-indigo-200 focus:border-indigo-500 text-center font-bold h-8`}
                                            step="0.1"
                                        />
                                    </td>
                                    <td className="px-1 py-1 bg-gray-800/20 border-r border-gray-800">
                                        <input
                                            type="number"
                                            value={level.commissionAffiliatePremium}
                                            onChange={e => handleTableChange(level.id, 'commissionAffiliatePremium', e.target.value)}
                                            className={`${baseInputClasses} border-violet-900/30 text-violet-200 focus:border-violet-500 text-center font-bold h-8`}
                                            step="0.1"
                                        />
                                    </td>

                                    <td className="px-2 py-1">
                                        <input type="text" value={level.award} onChange={e => handleTableChange(level.id, 'award', e.target.value)} className={`${baseInputClasses} h-8 text-xs`} style={{ minWidth: '150px' }} />
                                    </td>

                                    <td className="px-1 py-1 text-center">
                                        <div className="flex justify-center items-center">
                                            {level.image ? (
                                                <img src={level.image} alt="PIN" className="w-8 h-8 rounded-md object-cover mr-1" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center text-gray-500 text-[10px] mr-1">Sem</div>
                                            )}
                                            <label htmlFor={`upload-${level.id}`} className="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-gray-700">
                                                <ArrowUpTrayIcon className="w-4 h-4" />
                                                <input id={`upload-${level.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(level.id, e)} />
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-1 py-1 text-center">
                                        <button onClick={() => removeLevelRow(level.id)} className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-700">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 flex justify-start">
                    <button onClick={addLevelRow} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo Nível Digital
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
};

export default DigitalCareerPlanPage;
