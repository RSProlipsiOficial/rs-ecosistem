import React, { ChangeEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card';
// import { useDashboardConfig, ProgressBarConfig, UserInfoField, DashboardLink, DashboardBonusCard } from '../consultant/ConsultantLayout';
import * as icons from '../icons';
// import { mockCareerPlan, mockIncentives } from '../consultant/data';
import type { Incentive } from '../types';

const { IconTrash, IconPlus, IconUpload, IconChevronLeft, IconActive } = icons;

const Input: React.FC<{ label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }> = ({ label, value, onChange, type='text', placeholder }) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1">{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray focus:ring-2 focus:ring-brand-gold focus:outline-none" />
    </div>
);

const Select: React.FC<{ label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray focus:ring-2 focus:ring-brand-gold focus:outline-none h-[42px]">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

// Data sources for dynamic selection
const userInfoSources = [
    { value: 'name', label: 'Nome do Consultor' },
    { value: 'graduacao', label: 'Graduação' },
    { value: 'pin', label: 'PIN (Plano de Carreira)' },
    { value: 'categoria', label: 'Categoria' },
    { value: 'status', label: 'Status da Conta' },
    { value: 'idConsultor', label: 'ID de Consultor' },
    { value: 'email', label: 'Email' },
];
const linkSources = [
    { value: 'linkIndicacao', label: 'Link de Indicação' },
    { value: 'linkAfiliado', label: 'Link de Afiliado (Loja)' },
];
const bonusSources = [
    { value: 'bonusCicloGlobal', label: 'Bônus Ciclo Global' },
    { value: 'bonusTopSigme', label: 'Bônus Top Sigme' },
    { value: 'bonusPlanoCarreira', label: 'Bônus Plano de Carreira' },
];

const DashboardEditor: React.FC = () => {
    const { config, setConfig } = useDashboardConfig();
    const navigate = useNavigate();
    const [localConfig, setLocalConfig] = useState(config);
    const [saveStatus, setSaveStatus] = useState(false);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = () => {
        setConfig(localConfig);
        try {
            localStorage.setItem('dashboardConfig', JSON.stringify(localConfig));
        } catch (error) {
            console.error("Error saving config to localStorage:", error);
        }
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2500);
    };

    // --- User Info Handlers ---
    const handleUserInfoChange = (id: string, field: 'label' | 'source', value: string) => {
        setLocalConfig(prev => ({ ...prev, userInfo: prev.userInfo.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    };
    const addUserInfoField = () => {
        const newField: UserInfoField = { id: `user-info-${Date.now()}`, label: 'Novo Campo', source: 'name' };
        setLocalConfig(prev => ({ ...prev, userInfo: [...prev.userInfo, newField] }));
    };
    const removeUserInfoField = (id: string) => {
        setLocalConfig(prev => ({ ...prev, userInfo: prev.userInfo.filter(item => item.id !== id) }));
    };

    // --- Links Handlers ---
    const handleLinkChange = (id: string, field: 'label' | 'source', value: string) => {
        setLocalConfig(prev => ({ ...prev, links: prev.links.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    };
    const addLink = () => {
        const newLink: DashboardLink = { id: `link-${Date.now()}`, label: 'Novo Link', source: 'linkIndicacao' };
        setLocalConfig(prev => ({ ...prev, links: [...prev.links, newLink] }));
    };
    const removeLink = (id: string) => {
        setLocalConfig(prev => ({ ...prev, links: prev.links.filter(item => item.id !== id) }));
    };

    // --- Banner Handlers ---
    const handleBannerChange = (id: string, field: string, value: string | number) => {
        setLocalConfig(prev => ({...prev, promoBanners: prev.promoBanners.map(b => b.id === id ? {...b, [field]: value} : b)}));
    };
    const handleBannerImageUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageDataUrl = reader.result as string;
                setLocalConfig(prev => ({
                    ...prev,
                    promoBanners: prev.promoBanners.map(b => b.id === id ? { ...b, imageDataUrl, imageUrl: '' } : b)
                }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const addBanner = () => {
        const newBanner = { id: `promo-${Date.now()}`, preTitle: '', title: '', price: 0, imageUrl: 'https://via.placeholder.com/300x150', ctaText: '' };
        setLocalConfig(prev => ({ ...prev, promoBanners: [...prev.promoBanners, newBanner] }));
    };
    const removeBanner = (id: string) => {
        setLocalConfig(prev => ({ ...prev, promoBanners: prev.promoBanners.filter(b => b.id !== id) }));
    };

    // --- Bonus Card Handlers ---
    const handleBonusCardChange = (id: string, source: string) => {
        setLocalConfig(prev => ({ ...prev, bonusCards: prev.bonusCards.map(c => c.id === id ? { ...c, source } : c) }));
    };
    const addBonusCard = () => {
        const newCard: DashboardBonusCard = { id: `bonus-${Date.now()}`, source: 'bonusCicloGlobal' };
        setLocalConfig(prev => ({ ...prev, bonusCards: [...prev.bonusCards, newCard] }));
    };
    const removeBonusCard = (id: string) => {
        setLocalConfig(prev => ({ ...prev, bonusCards: prev.bonusCards.filter(c => c.id !== id) }));
    };
    
    // --- Progress Bar Handlers ---
    const handleProgressBarChange = (id: string, field: string, value: string | number | boolean | null) => {
      setLocalConfig(prev => {
        const newProgressBars = { ...prev.progressBars };
        // @ts-ignore
        newProgressBars[id][field] = value;
        if (field === 'calculationMode' && value === 'auto') {
            // @ts-ignore
            newProgressBars[id].targetPin = null;
        }
        return { ...prev, progressBars: newProgressBars };
      });
    }
    const addProgressBar = () => {
        const newId = `bar-${Date.now()}`;
        const newBar: ProgressBarConfig = { id: newId, title: 'Nova Barra de Progresso', startIcon: 'IconAward', endIcon: 'IconAward', calculationMode: 'auto', targetPin: null };
        setLocalConfig(prev => ({ ...prev, progressBars: { ...prev.progressBars, [newId]: newBar } }));
    };
    const removeProgressBar = (id: string) => {
        setLocalConfig(prev => {
            const newProgressBars = { ...prev.progressBars };
            // Ensure 'alcanceCategorias' cannot be removed if it's the only one
            if (id === 'alcanceCategorias' && Object.keys(newProgressBars).length === 1) {
                alert('A barra "Próximo PIN" não pode ser removida pois é essencial para o dashboard.');
                return prev;
            }
            delete newProgressBars[id];
            return { ...prev, progressBars: newProgressBars };
        });
    };
    const handlePinLogoUpload = (pinName: string, e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalConfig(prev => ({ ...prev, pinLogos: { ...prev.pinLogos, [pinName]: event.target?.result as string }}));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // --- Incentives Handlers ---
    const handleIncentiveChange = (id: string, field: keyof Incentive, value: string | number) => {
        setLocalConfig(prev => ({...prev, incentives: prev.incentives.map(inc => inc.id === id ? { ...inc, [field]: value } : inc)}));
    };
    const addIncentive = () => {
        const newIncentive: Incentive = { id: `inc-${Date.now()}`, name: 'Novo Incentivo', progress: 0, target: 100 };
        setLocalConfig(prev => ({ ...prev, incentives: [...prev.incentives, newIncentive] }));
    };
    const removeIncentive = (id: string) => {
        setLocalConfig(prev => ({ ...prev, incentives: prev.incentives.filter(inc => inc.id !== id) }));
    };


    return (
        <div className="space-y-8 pb-24">
            <button onClick={() => navigate('/consultant/dashboard')} className="flex items-center text-brand-gold font-semibold p-2 rounded-lg hover:bg-brand-gray-light transition-colors">
                <IconChevronLeft size={20} className="mr-1"/>
                Voltar
            </button>
            <h1 className="text-3xl font-bold text-brand-gold">Editor do Dashboard</h1>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Informações do Usuário</h2>
                <div className="space-y-3">
                    {localConfig.userInfo.map((field) => (
                        <div key={field.id} className="p-3 bg-brand-gray-light rounded-lg flex items-end gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input label="Rótulo" value={field.label} onChange={e => handleUserInfoChange(field.id, 'label', e.target.value)} />
                                <Select label="Fonte do Dado" value={field.source} onChange={e => handleUserInfoChange(field.id, 'source', e.target.value)} options={userInfoSources} />
                            </div>
                            <button onClick={() => removeUserInfoField(field.id)} className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"><IconTrash/></button>
                        </div>
                    ))}
                </div>
                <button onClick={addUserInfoField} className="mt-4 flex items-center gap-2 bg-brand-gray px-4 py-2 rounded-lg font-semibold hover:bg-brand-gray-light"><IconPlus/> Adicionar Campo</button>
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Links</h2>
                 <div className="space-y-3">
                    {localConfig.links.map((link) => (
                        <div key={link.id} className="p-3 bg-brand-gray-light rounded-lg flex items-end gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input label="Rótulo do Link" value={link.label} onChange={e => handleLinkChange(link.id, 'label', e.target.value)} />
                                <Select label="Fonte do Link" value={link.source} onChange={e => handleLinkChange(link.id, 'source', e.target.value)} options={linkSources} />
                            </div>
                            <button onClick={() => removeLink(link.id)} className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"><IconTrash/></button>
                        </div>
                    ))}
                </div>
                <button onClick={addLink} className="mt-4 flex items-center gap-2 bg-brand-gray px-4 py-2 rounded-lg font-semibold hover:bg-brand-gray-light"><IconPlus/> Adicionar Link</button>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Banners Promocionais</h2>
                <div className="space-y-4">
                    {localConfig.promoBanners.map((banner) => (
                        <div key={banner.id} className="p-4 bg-brand-gray-light rounded-lg space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-brand-gold text-lg">{banner.title || 'Novo Banner'}</h3>
                                <button onClick={() => removeBanner(banner.id)} className="p-2 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"><IconTrash size={16}/></button>
                            </div>
                             <div className="relative aspect-video bg-brand-dark rounded-md flex items-center justify-center overflow-hidden border border-brand-gray">
                                {(banner.imageDataUrl || banner.imageUrl) ? (
                                    <img src={banner.imageDataUrl || banner.imageUrl} alt={banner.title} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-gray-500">Pré-visualização da Imagem</span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Input label="URL da Imagem (Externa)" value={banner.imageUrl} onChange={e => handleBannerChange(banner.id, 'imageUrl', e.target.value)} />
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Ou Enviar Imagem (Local)</label>
                                    <label className="w-full h-10 flex items-center justify-center gap-2 bg-brand-dark rounded-md border border-brand-gray cursor-pointer hover:bg-brand-gray text-sm">
                                        <IconUpload size={16}/>
                                        <span>Enviar Arquivo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerImageUpload(banner.id, e)}/>
                                    </label>
                                </div>
                            </div>
                             <p className="text-xs text-gray-500 -mt-2 text-center">Os campos de texto abaixo são opcionais se sua imagem já contém as informações.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Subtítulo (Opcional)" value={banner.preTitle} placeholder="Ex: SAIA NA FRENTE COM O" onChange={e => handleBannerChange(banner.id, 'preTitle', e.target.value)} />
                                <Input label="Título (Opcional)" value={banner.title} placeholder="Ex: Pack Inicial Full" onChange={e => handleBannerChange(banner.id, 'title', e.target.value)} />
                                <Input label="Preço (Opcional)" value={String(banner.price)} type="number" onChange={e => handleBannerChange(banner.id, 'price', Number(e.target.value))} />
                                <Input label="Texto do Botão (Opcional)" value={banner.ctaText} placeholder="Ex: Adquirir agora" onChange={e => handleBannerChange(banner.id, 'ctaText', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={addBanner} className="mt-4 flex items-center gap-2 bg-brand-gray px-4 py-2 rounded-lg font-semibold hover:bg-brand-gray-light"><IconPlus/> Adicionar Banner</button>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Cartões de Bônus</h2>
                 <div className="space-y-3">
                    {localConfig.bonusCards.map((card) => (
                        <div key={card.id} className="p-3 bg-brand-gray-light rounded-lg flex items-end gap-3">
                            <div className="flex-1">
                                <Select label="Fonte do Bônus" value={card.source} onChange={e => handleBonusCardChange(card.id, e.target.value)} options={bonusSources} />
                            </div>
                            <button onClick={() => removeBonusCard(card.id)} className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"><IconTrash/></button>
                        </div>
                    ))}
                 </div>
                 <button onClick={addBonusCard} className="mt-4 flex items-center gap-2 bg-brand-gray px-4 py-2 rounded-lg font-semibold hover:bg-brand-gray-light"><IconPlus/> Adicionar Cartão de Bônus</button>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Barras de Progresso</h2>
                <div className="space-y-6">
                    {Object.values(localConfig.progressBars).map((bar: ProgressBarConfig) => (
                        <div key={bar.id} className="p-4 bg-brand-gray-light rounded-lg space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-brand-gold">{bar.title}</h3>
                                {/* Prevent removal of 'alcanceCategorias' if it's the last progress bar */}
                                {bar.id !== 'alcanceCategorias' || Object.keys(localConfig.progressBars).length > 1 ? (
                                    <button onClick={() => removeProgressBar(bar.id)} className="p-2 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"><IconTrash size={16}/></button>
                                ) : (
                                    <button disabled title="Barra essencial não pode ser removida" className="p-2 bg-gray-500/20 text-gray-400 rounded-md cursor-not-allowed"><IconTrash size={16}/></button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Título" value={bar.title} onChange={e => handleProgressBarChange(bar.id, 'title', e.target.value)} />
                                <Select label="Cálculo do Progresso" value={bar.calculationMode} onChange={e => handleProgressBarChange(bar.id, 'calculationMode', e.target.value)} options={[{value: 'manual', label: 'Manual (selecionar PIN)'},{value: 'auto', label: 'Automático (sistema define)'}]} />
                                {bar.calculationMode === 'manual' && (
                                    <div className="md:col-span-2">
                                        <Select label="Meta do PIN" value={bar.targetPin || ''} onChange={e => handleProgressBarChange(bar.id, 'targetPin', e.target.value)} options={[{value: '', label: 'Selecione um PIN'}, ...mockCareerPlan.pinTable.map(p => ({ value: p.pin, label: p.pin }))]} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                 <button onClick={addProgressBar} className="mt-4 flex items-center gap-2 bg-brand-gray px-4 py-2 rounded-lg font-semibold hover:bg-brand-gray-light"><IconPlus/> Adicionar Barra</button>
            </Card>

             <Card>
                <h2 className="text-xl font-bold text-white mb-4">Logos dos PINs</h2>
                <p className="text-sm text-gray-400 mb-4">Faça o upload dos logos para os PINs do plano de carreira.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockCareerPlan.pinTable.map(({pin}) => (
                        <div key={pin} className="p-3 bg-brand-gray-light rounded-lg text-center">
                            <label className="text-sm font-semibold text-white block mb-2">{pin}</label>
                            {localConfig.pinLogos[pin] && <img src={localConfig.pinLogos[pin]} className="h-16 w-16 mx-auto mb-2"/>}
                            <input type="file" accept="image/*" onChange={(e) => handlePinLogoUpload(pin, e)} className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-yellow-300"/>
                        </div>
                    ))}
                </div>
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Programa de Incentivos</h2>
                <p className="text-sm text-gray-400 mb-4">Gerencie as metas e o progresso dos incentivos do dashboard.</p>
                <div className="space-y-3">
                    {localConfig.incentives.map(incentive => (
                        <div key={incentive.id} className="p-3 bg-brand-gray-light rounded-lg flex items-end gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input label="Nome" value={incentive.name} onChange={e => handleIncentiveChange(incentive.id, 'name', e.target.value)} />
                                <Input label="Progresso (%)" type="number" value={String(incentive.progress)} onChange={e => handleIncentiveChange(incentive.id, 'progress', Number(e.target.value))} />
                                <Input label="Meta (Total)" type="number" value={String(incentive.target)} onChange={e => handleIncentiveChange(incentive.id, 'target', Number(e.target.value))} />
                            </div>
                            <button onClick={() => removeIncentive(incentive.id)} className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"><IconTrash/></button>
                        </div>
                    ))}
                </div>
                <button onClick={addIncentive} className="mt-4 flex items-center gap-2 bg-brand-gray px-4 py-2 rounded-lg font-semibold hover:bg-brand-gray-light"><IconPlus/> Adicionar Incentivo</button>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Resumo da Rede</h2>
                 <div>
                    <label className="text-sm text-gray-400 block mb-1">Fonte de Dados para Resumo</label>
                    <select value={localConfig.networkSummary.source} onChange={e => setLocalConfig(prev => ({...prev, networkSummary: { source: e.target.value as any}}))} className="w-full md:w-1/2 bg-brand-dark p-2 rounded-md border border-brand-gray focus:ring-2 focus:ring-brand-gold focus:outline-none h-[42px]">
                        <option value="top-sigme">Matriz Top Sigme</option>
                        <option value="global-cycle">Matriz Ciclo Global</option>
                    </select>
                </div>
            </Card>
            
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${saveStatus ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2">
                    <IconActive />
                    <span>Salvo com sucesso!</span>
                </div>
            </div>
            
             <div className="fixed bottom-8 right-8 z-40">
                <button 
                    onClick={handleSave}
                    className="bg-brand-gold text-brand-dark font-bold py-4 px-6 rounded-full shadow-2xl shadow-brand-gold/30 hover:bg-yellow-300 transform hover:scale-105 transition-transform cursor-pointer"
                >
                    Salvar Alterações
                </button>
            </div>

        </div>
    );
};

export default DashboardEditor;