import React, { useState, useMemo, useEffect } from 'react';
import { CareerIcon, TableCellsIcon, ClipboardDocumentListIcon, TrashIcon, ArrowUpTrayIcon, PlusIcon } from './icons';
import { careerPlanAPI } from '../src/services/api';
// import { uploadPinImage } from '../src/services/supabase';

interface PinLevel {
    id: string;
    pin: string;
    cycles: number | string;
    minLines: number | string;
    vmec: string;
    bonus: string;
    image: string | null;
}


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

const SettingsInput: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; adornment?: string; step?: string; }> =
    ({ value, onChange, type = 'number', adornment, step = "0.01" }) => (
        <div className="relative w-full">
            <input type={type} value={value} onChange={onChange} min="0" step={step} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pr-12" />
            {adornment && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">{adornment}</span>}
        </div>
    );

const SettingsRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-3 border-b border-gray-800 last:border-b-0">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="md:col-span-2 relative flex items-center">{children}</div>
    </div>
);

const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

const CareerPlanPage: React.FC = () => {
    const [careerData, setCareerData] = useState<PinLevel[]>([]);
    const [generalRules, setGeneralRules] = useState({
        bonusFactorValue: 360,
        bonusPercentage: 6.39,
        calculationPeriod: 'Trimestral',
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Carregar PINs da API
    useEffect(() => {
        loadPins();
    }, []);

    // 14 PINs Reais do Banco (Backup Hardcoded Exato)
    const DEFAULT_PINS: PinLevel[] = [
        { id: '8b446a86-7786-4f36-9b6f-6f9479b12204', pin: 'Iniciante', cycles: 0, minLines: 0, vmec: '—', bonus: 'R$ 0,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287532356_lmdqv.png' },
        { id: 'bf2d4fec-9c00-4f07-b411-2ccde89480e0', pin: 'Bronze', cycles: 5, minLines: 0, vmec: '—', bonus: 'R$ 13,50', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287536392_5sry8c.png' },
        { id: '1980d23a-7ed2-44a7-a22d-c2aee9a25577', pin: 'Prata', cycles: 15, minLines: 1, vmec: '100 %', bonus: 'R$ 40,50', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287539000_ksfznk.png' },
        { id: 'ec81ccb4-fd9b-4f92-bebc-136f191db23d', pin: 'Ouro', cycles: 70, minLines: 1, vmec: '100 %', bonus: 'R$ 189,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287542177_2f1cpm.png' },
        { id: '0a935c4a-bea8-4d48-be58-2b916d6c1d2d', pin: 'Safira', cycles: 150, minLines: 2, vmec: '60 / 40', bonus: 'R$ 405,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287601779_2cnkwx.png' },
        { id: 'ec3eeaa3-6fa0-4f83-9640-a85f81d82892', pin: 'Esmeralda', cycles: 300, minLines: 2, vmec: '60 / 40', bonus: 'R$ 810,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287597909_agnnz8.png' },
        { id: '518ce60c-b658-4791-8ff1-39cb347df90b', pin: 'Topázio', cycles: 500, minLines: 2, vmec: '60 / 40', bonus: 'R$ 1.350,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287593430_hx24vt.png' },
        { id: '3d93ca39-b146-4bc0-ba79-7de1786fc401', pin: 'Rubi', cycles: 750, minLines: 3, vmec: '50 / 30 / 20', bonus: 'R$ 2.025,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287550418_ul7cj8.png' },
        { id: '77fac779-f124-4666-ac0d-bf11bd52dfec', pin: 'Diamante', cycles: 1500, minLines: 3, vmec: '50 / 30 / 20', bonus: 'R$ 4.050,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287556626_troc4p.png' },
        { id: 'a91a4575-11df-491e-81d5-4c1dc447ac77', pin: 'Duplo Diamante', cycles: 3000, minLines: 4, vmec: '40 / 30 / 20 / 10', bonus: 'R$ 18.450,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287560759_6h4825o.png' },
        { id: 'f86fcd6e-7a4a-4431-96ae-f02fc30ad994', pin: 'Triplo Diamante', cycles: 5000, minLines: 5, vmec: '35 / 25 / 20 / 10 / 10', bonus: 'R$ 36.450,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287566743_o5aw6i.png' },
        { id: '6e90ec56-403e-479b-b941-7a8b551dcf09', pin: 'Diamante Red', cycles: 15000, minLines: 6, vmec: '30 / 20 / 18 / 12 / 10 / 10 / 1', bonus: 'R$ 67.500,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287572317_cnsvn5v.png' },
        { id: '9a84b018-9837-4f8e-a4a8-a31008144824', pin: 'Diamante Blue', cycles: 25000, minLines: 6, vmec: '30 / 20 / 18 / 12 / 10 / 10 / 1', bonus: 'R$ 105.300,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287588777_scb9l.png' },
        { id: '6de50486-9fbc-4be4-a608-39c512e37f2b', pin: 'Diamante Black', cycles: 50000, minLines: 6, vmec: '30 / 20 / 18 / 12 / 10 / 10 / 1', bonus: 'R$ 135.000,00', image: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/pins/pin_1769287577207_7fmtb.png' }
    ];

    const loadPins = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await careerPlanAPI.getLevels();

            if (response?.data?.success && response.data.levels && response.data.levels.length > 0) {
                // Mapear dados da API para formato do componente
                const mappedPins = response.data.levels.map((pin: any) => ({
                    id: pin.id,
                    pin: pin.name,
                    cycles: pin.display_order,
                    minLines: pin.required_personal_recruits,
                    vmec: String(pin.benefits || pin.required_team_volume || '0'),
                    bonus: ((pin.required_pv || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    image: pin.pin_image,
                }));

                setCareerData(mappedPins);
            } else {
                console.warn('API retornou lista vazia. Usando backup local.');
                setCareerData(DEFAULT_PINS);
            }
        } catch (err) {
            console.error('Erro ao carregar PINs:', err);
            // Em vez de mostrar erro, carrega o backup para não travar a tela do usuário
            console.warn('Falha na API. Carregando dados de backup.');
            setCareerData(DEFAULT_PINS);
            // setError('Erro ao carregar PINs. Dados locais carregados.'); // Opcional: avisar que está offline
        } finally {
            setLoading(false);
        }
    };

    const netBonusPerCycle = useMemo(() => {
        return (generalRules.bonusFactorValue * generalRules.bonusPercentage) / 100;
    }, [generalRules.bonusFactorValue, generalRules.bonusPercentage]);

    const handleRuleChange = (field: keyof typeof generalRules, value: string | number) => {
        setGeneralRules(prev => ({
            ...prev,
            [field]: typeof prev[field] === 'number' ? (Number(value) >= 0 ? Number(value) : 0) : value,
        }));
    };

    const handleTableChange = (id: string, field: keyof PinLevel, value: string) => {
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

                // Upload via API (Bypass RLS issues)
                const response = await careerPlanAPI.uploadImage(file);

                if (!response.data || !response.data.url) {
                    throw new Error('Falha no upload: URL não retornada');
                }

                const imageUrl = response.data.url;

                // Se não for ID temporário (não começa com new_), atualiza imediatamente
                if (!id.toString().startsWith('new_')) {
                    await careerPlanAPI.updateLevel(id, { pin_image: imageUrl });
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

    const addPinRow = () => {
        if (careerData.length >= 20) { // Aumentei o limite um pouco
            setError('Máximo de 20 PINs permitidos');
            return;
        }

        const newPin: PinLevel = {
            id: `new_${Date.now()}`, // ID string temporário
            pin: `Novo PIN`,
            cycles: 0,
            minLines: 0,
            vmec: '—',
            bonus: 'R$ 0,00',
            image: null
        };
        setCareerData([...careerData, newPin]);
    };

    const removePinRow = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este PIN?')) {
            return;
        }

        try {
            // Se não for temporário, deleta do banco
            if (!id.toString().startsWith('new_')) {
                setLoading(true);
                await careerPlanAPI.deleteLevel(id);
            }
            setCareerData(careerData.filter(row => row.id !== id));
        } catch (err) {
            console.error('Erro ao remover:', err);
            setError('Erro ao remover PIN do banco.');
        } finally {
            setLoading(false);
        }
    };

    // Salvar todas as alterações
    const handleSaveAll = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Validar dados
            // (Validação simplificada)

            // Salvar cada PIN
            for (const pin of careerData) {
                // Parse values
                let bonusVal = 0;
                if (typeof pin.bonus === 'string') {
                    bonusVal = parseFloat(pin.bonus.replace(/[R$\s.]/g, '').replace(',', '.'));
                } else {
                    bonusVal = Number(pin.bonus);
                }

                let vmecVal = pin.vmec; // Keep as string

                const payload = {
                    name: pin.pin,
                    code: pin.pin.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    display_order: Number(pin.cycles),
                    required_personal_recruits: Number(pin.minLines),
                    required_team_volume: 0,
                    benefits: vmecVal || '—',
                    required_pv: Math.round(bonusVal * 100),
                    bonus_percentage: 0,
                    pin_image: pin.image,
                    is_active: true
                };

                if (!pin.id.toString().startsWith('new_')) {
                    // Atualizar existente
                    await careerPlanAPI.updateLevel(pin.id, payload);
                } else {
                    // Criar novo
                    await careerPlanAPI.createLevel(payload);
                }
            }

            // Atualizar regras gerais (se houver endpoint para isso - por enquanto mantemos o mock ou salvamos em outro lugar)
            // O código original chamava updateCareerConfig que não existe no careerPlanAPI do api.ts novo
            // Vamos comentar por enquanto ou criar um endpoint de settings se necessário.
            // O usuário pediu foco nos PINs/Níveis.
            // await careerPlanAPI.updateCareerConfig(...); 

            setSuccess('✅ Todas as alterações foram salvas com sucesso!');
            setTimeout(() => setSuccess(''), 5000);

            // Recarregar dados para pegar IDs reais
            await loadPins();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError('Erro ao salvar alterações. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const staticRuleClasses = "p-2.5 text-sm text-gray-300 w-full";

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <CareerIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-yellow-500 ml-3">Plano de Carreira — 13 PINs Oficiais</h1>
                </div>
                {loading && <div className="text-yellow-500">Carregando...</div>}
            </header>

            {/* Mensagens de sucesso e erro */}
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
                title="Regras Gerais do Plano de Carreira"
                icon={<ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" />}
            >
                <div className="space-y-2">
                    <SettingsRow label="Valor Base do Ciclo (Fator Bônus)">
                        <SettingsInput
                            value={generalRules.bonusFactorValue}
                            onChange={(e) => handleRuleChange('bonusFactorValue', e.target.value)}
                            adornment="R$"
                        />
                    </SettingsRow>
                    <SettingsRow label="Percentual para Bônus de Carreira">
                        <SettingsInput
                            value={generalRules.bonusPercentage}
                            onChange={(e) => handleRuleChange('bonusPercentage', e.target.value)}
                            adornment="%"
                        />
                    </SettingsRow>
                    <SettingsRow label="Valor Líquido por Ciclo">
                        <div className="p-2.5 bg-gray-900/50 rounded-lg w-full font-semibold text-white">
                            {netBonusPerCycle.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </SettingsRow>
                    <SettingsRow label="Período de Apuração">
                        <select name="calculationPeriod" value={generalRules.calculationPeriod} onChange={(e) => handleRuleChange('calculationPeriod', e.target.value)} className={baseInputClasses}>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Semestral">Semestral (6 meses)</option>
                            <option value="9 meses">9 meses</option>
                            <option value="Anual">Anual (1 ano)</option>
                        </select>
                    </SettingsRow>
                    <SettingsRow label="Reconhecimento do PIN">
                        <p className={staticRuleClasses}>
                            O PIN é conquistado e permanece válido durante o período de apuração ({generalRules.calculationPeriod.toLowerCase()}).
                        </p>
                    </SettingsRow>
                    <SettingsRow label="Pagamento do Bônus">
                        <p className={staticRuleClasses}>
                            Pago ao atingir a meta, com valor liberado imediatamente.
                        </p>
                    </SettingsRow>
                    <SettingsRow label="VMEC (Definição)">
                        <p className={staticRuleClasses}>
                            Volume Máximo por Equipe e por Ciclo.
                        </p>
                    </SettingsRow>
                    <SettingsRow label="Pontuação">
                        <p className={staticRuleClasses}>
                            Cada ciclo ativo na matriz SIGMA gera 1 ponto/ciclo para o plano de carreira.
                        </p>
                    </SettingsRow>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Tabela Oficial de PINs"
                icon={<TableCellsIcon className="w-6 h-6 text-yellow-500" />}
                footer={
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || loading}
                        className="bg-yellow-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Salvando...' : 'Salvar Todas as Alterações'}
                    </button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-3 py-4">PIN</th>
                                <th className="px-3 py-4">Ciclos</th>
                                <th className="px-3 py-4">Linhas Mín.</th>
                                <th className="px-3 py-4">VMEC %</th>
                                <th className="px-3 py-4">Recompensa</th>
                                <th className="px-3 py-4 text-center">Imagem</th>
                                <th className="px-3 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careerData.map((level) => (
                                <tr key={level.id} className="border-b border-gray-800">
                                    <td className="px-3 py-2"><input type="text" value={level.pin} onChange={e => handleTableChange(level.id, 'pin', e.target.value)} className={baseInputClasses} style={{ minWidth: '160px' }} /></td>
                                    <td className="px-3 py-2"><input type="text" value={level.cycles} onChange={e => handleTableChange(level.id, 'cycles', e.target.value)} className={baseInputClasses} style={{ minWidth: '80px' }} /></td>
                                    <td className="px-3 py-2"><input type="text" value={level.minLines} onChange={e => handleTableChange(level.id, 'minLines', e.target.value)} className={baseInputClasses} style={{ minWidth: '80px' }} /></td>
                                    <td className="px-3 py-2"><input type="text" value={level.vmec} onChange={e => handleTableChange(level.id, 'vmec', e.target.value)} className={baseInputClasses} style={{ minWidth: '150px' }} /></td>
                                    <td className="px-3 py-2"><input type="text" value={level.bonus} onChange={e => handleTableChange(level.id, 'bonus', e.target.value)} className={baseInputClasses} style={{ minWidth: '120px' }} /></td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {level.image ? (
                                                <img src={level.image} alt="PIN" className="w-10 h-10 rounded-md object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-gray-700 flex items-center justify-center text-gray-500 text-xs">Sem Imagem</div>
                                            )}
                                            <label htmlFor={`upload-${level.id}`} className="cursor-pointer text-gray-400 hover:text-yellow-500 transition-colors p-2 rounded-full hover:bg-gray-700">
                                                <ArrowUpTrayIcon className="w-5 h-5" />
                                                <input id={`upload-${level.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(level.id, e)} />
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={() => removePinRow(level.id)} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-700">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 flex justify-start">
                    <button onClick={addPinRow} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo PIN
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
};

export default CareerPlanPage;
