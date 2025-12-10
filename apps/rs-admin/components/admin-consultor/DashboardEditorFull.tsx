import React, { ChangeEvent, useState, useEffect } from 'react';
import Card from '../Card';
import { useDashboardConfig } from './dashboardConfigContext';
import { dashboardLayoutAPI, sigmaPinsAPI, pinsVisibilityAPI } from '../../src/services/api';
import { CONSULTOR_DASHBOARD_URL, MARKETPLACE_ADMIN_DASHBOARD_EDITOR_URL } from '../../src/config/urls';
import { ProgressBarConfig, UserInfoField, DashboardLink, DashboardBonusCard, Incentive } from './types';
import { IconTrash, IconPlus, IconUpload, IconActive, IconGitFork, IconStar, IconAward, IconLink } from '../icons';

// Mock data para o editor
const mockCareerPlan = {
  pinTable: [
    { pin: 'Bronze', cycles: 5 },
    { pin: 'Prata', cycles: 15 },
    { pin: 'Ouro', cycles: 70 },
    { pin: 'Safira', cycles: 150 },
    { pin: 'Esmeralda', cycles: 300 },
    { pin: 'Topázio', cycles: 500 },
    { pin: 'Rubi', cycles: 750 },
    { pin: 'Diamante', cycles: 1500 },
  ]
};

const Input: React.FC<{ label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }> = ({ label, value, onChange, type='text', placeholder }) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1">{label}</label>
        <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className="w-full bg-[#121212] p-2 rounded-md border border-[#2A2A2A] focus:ring-2 focus:ring-[#FFD700] focus:outline-none text-white" 
        />
    </div>
);

const Select: React.FC<{ label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1">{label}</label>
        <select 
          value={value} 
          onChange={onChange} 
          className="w-full bg-[#121212] p-2 rounded-md border border-[#2A2A2A] focus:ring-2 focus:ring-[#FFD700] focus:outline-none h-[42px] text-white">
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
    { value: 'bonusCicloGlobal', label: 'Bônus Ciclo Global', icon: 'IconGitFork' },
    { value: 'bonusTopSigme', label: 'Bônus Top Sigme', icon: 'IconStar' },
    { value: 'bonusPlanoCarreira', label: 'Bônus Plano de Carreira', icon: 'IconAward' },
];

const iconOptions = [
    { value: 'IconGitFork', label: 'Rede (GitFork)' },
    { value: 'IconStar', label: 'Estrela' },
    { value: 'IconAward', label: 'Prêmio' },
    { value: 'IconLink', label: 'Link' },
];

type DashboardContext = 'consultant' | 'marketplace'
const DashboardEditorFull: React.FC<{ context?: DashboardContext }> = ({ context = 'consultant' }) => {
    const { config, setConfig } = useDashboardConfig();
    const [localConfig, setLocalConfig] = useState(config);
    const [saveStatus, setSaveStatus] = useState(false);
    const [activeTab, setActiveTab] = useState<'widgets' | 'layout' | 'personalization'>('widgets');
    const [careerPins, setCareerPins] = useState<Array<{ id: string; nome: string; logoUrl: string | null }>>([]);
    const [pinVisibility, setPinVisibility] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLocalConfig(config);
        (async () => {
          try {
            const res = context === 'consultant'
              ? await dashboardLayoutAPI.getConsultantLayoutConfig()
              : await dashboardLayoutAPI.getMarketplaceLayoutConfig()
            const cfg = res.data?.config || {};
            const normalized = {
              ...config,
              bonusCards: Array.isArray((cfg as any).bonusCards)
                ? (cfg as any).bonusCards.map((c: any) => ({
                    title: c.title || 'Bônus',
                    value: c.value || c.source || 'bonusCicloGlobal',
                    icon: c.icon || 'IconGitFork',
                  }))
                : (config as any).bonusCards || [],
              userInfoFields: Array.isArray((cfg as any).userInfo)
                ? (cfg as any).userInfo.map((f: any) => ({ label: f.label || 'Campo', key: f.source || 'name' }))
                : (config as any).userInfoFields || [],
              dashboardLinks: Array.isArray((cfg as any).links)
                ? (cfg as any).links.map((l: any) => ({ label: l.label || 'Link', href: l.source || 'linkIndicacao', icon: 'IconLink' }))
                : (config as any).dashboardLinks || [],
              pinLogos: (cfg as any).pinLogos || (config as any).pinLogos || {},
            } as typeof config;
            setLocalConfig(normalized);
          } catch {}
          try {
            const resPins = await sigmaPinsAPI.getAll();
            const pins = Array.isArray(resPins.data?.pins) ? resPins.data.pins : [];
            setCareerPins(pins.map((p: any) => ({ id: String(p.id), nome: String(p.nome), logoUrl: p.logoUrl || null })));
          } catch {}
          try {
            const resVis = await pinsVisibilityAPI.get();
            const data = Array.isArray(resVis.data?.data) ? resVis.data.data : [];
            const map: Record<string, boolean> = {};
            data.forEach((i: any) => { map[String(i.pinId)] = Boolean(i.visible); });
            setPinVisibility(map);
          } catch {
            // default: all true
            setPinVisibility({});
          }
        })();
    }, [config]);

    const handleSave = async () => {
        try {
        setConfig(localConfig);
        const persistConfig: any = {
          bonusCards: (localConfig as any).bonusCards?.map((c: any, idx: number) => ({ id: `bonus-${idx+1}`, title: c.title, source: c.value, icon: c.icon })),
          userInfo: (localConfig as any).userInfoFields?.map((f: any, idx: number) => ({ id: `userInfo-${idx+1}`, label: f.label, source: f.key })),
          links: (localConfig as any).dashboardLinks?.map((l: any, idx: number) => ({ id: `link-${idx+1}`, label: l.label, source: (l.href && ['linkIndicacao','linkAfiliado'].includes(l.href)) ? l.href : 'linkIndicacao' })),
        };
        if (context === 'consultant') {
          await dashboardLayoutAPI.updateConsultantLayoutConfig(persistConfig);
          const payload = careerPins.map(p => ({ pinId: p.id, visible: pinVisibility[p.id] ?? true }));
          await pinsVisibilityAPI.update(payload);
        } else {
          await dashboardLayoutAPI.updateMarketplaceLayoutConfig(persistConfig);
        }
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2500);
        } catch (e) {
          console.error('Falha ao salvar layout', e);
          alert('Falha ao salvar configurações. Verifique a API e tente novamente.');
        }
    };

    // --- User Info Handlers ---
    const handleUserInfoChange = (index: number, field: 'label' | 'key', value: string) => {
        setLocalConfig(prev => ({
            ...prev,
            userInfoFields: prev.userInfoFields.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addUserInfoField = () => {
        const newField: UserInfoField = { key: 'name', label: 'Novo Campo' };
        setLocalConfig(prev => ({ 
            ...prev, 
            userInfoFields: [...prev.userInfoFields, newField] 
        }));
    };

    const removeUserInfoField = (index: number) => {
        setLocalConfig(prev => ({ 
            ...prev, 
            userInfoFields: prev.userInfoFields.filter((_, i) => i !== index) 
        }));
    };

    // --- Links Handlers ---
    const handleLinkChange = (index: number, field: 'label' | 'href' | 'icon', value: string) => {
        setLocalConfig(prev => ({
            ...prev,
            dashboardLinks: prev.dashboardLinks.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addLink = () => {
        const newLink: DashboardLink = { label: 'Novo Link', href: '/consultant/meu-link', icon: 'IconLink' };
        setLocalConfig(prev => ({ 
            ...prev, 
            dashboardLinks: [...prev.dashboardLinks, newLink] 
        }));
    };

    const removeLink = (index: number) => {
        setLocalConfig(prev => ({ 
            ...prev, 
            dashboardLinks: prev.dashboardLinks.filter((_, i) => i !== index) 
        }));
    };

    // --- Bonus Card Handlers ---
    const handleBonusCardChange = (index: number, field: 'title' | 'value' | 'icon', val: string) => {
        setLocalConfig(prev => ({
            ...prev,
            bonusCards: prev.bonusCards.map((c, i) => 
                i === index ? { ...c, [field]: val } : c
            )
        }));
    };

    const addBonusCard = () => {
        const newCard: DashboardBonusCard = { 
            title: 'Novo Bônus', 
            value: 'bonusCicloGlobal', 
            icon: 'IconGitFork' 
        };
        setLocalConfig(prev => ({ 
            ...prev, 
            bonusCards: [...prev.bonusCards, newCard] 
        }));
    };

    const removeBonusCard = (index: number) => {
        setLocalConfig(prev => ({ 
            ...prev, 
            bonusCards: prev.bonusCards.filter((_, i) => i !== index) 
        }));
    };

    // --- Progress Bar Handlers ---
    const handleProgressBarChange = (field: keyof ProgressBarConfig, value: any) => {
        setLocalConfig(prev => ({
            ...prev,
            progressBar: { ...prev.progressBar, [field]: value }
        }));
    };

    // --- Incentives Handlers ---
    const toggleIncentive = (id: string) => {
        setLocalConfig(prev => ({
            ...prev,
            selectedIncentives: prev.selectedIncentives.includes(id)
                ? prev.selectedIncentives.filter(i => i !== id)
                : [...prev.selectedIncentives, id]
        }));
    };

    const togglePinVisibility = (pinId: string) => {
        setPinVisibility(prev => ({ ...prev, [pinId]: !(prev[pinId] ?? true) }));
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-[#FFD700] mb-6">Editor de Dashboard do Consultor</h1>
            
            {/* Tabs */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setActiveTab('widgets')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        activeTab === 'widgets' 
                            ? 'bg-[#FFD700] text-[#121212]' 
                            : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
                    }`}
                >
                    Widgets
                </button>
                <button
                    onClick={() => setActiveTab('layout')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        activeTab === 'layout' 
                            ? 'bg-[#FFD700] text-[#121212]' 
                            : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
                    }`}
                >
                    Layout
                </button>
                <button
                    onClick={() => setActiveTab('personalization')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        activeTab === 'personalization' 
                            ? 'bg-[#FFD700] text-[#121212]' 
                            : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
                    }`}
                >
                    Personalização
                </button>
            </div>

            {/* Widgets Tab */}
            {activeTab === 'widgets' && (
                <div className="space-y-6">
                    {/* Cartões de Bônus */}
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Cartões de Bônus</h2>
                        <p className="text-sm text-gray-400 mb-4">Configure quais bônus aparecem no dashboard</p>
                        <div className="space-y-3">
                            {(localConfig.bonusCards || []).map((card, index) => (
                                <div key={index} className="p-3 bg-[#121212] rounded-lg flex items-end gap-3">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Input 
                                            label="Título" 
                                            value={card.title} 
                                            onChange={e => handleBonusCardChange(index, 'title', e.target.value)} 
                                        />
                                        <Select 
                                            label="Fonte do Bônus" 
                                            value={card.value} 
                                            onChange={e => handleBonusCardChange(index, 'value', e.target.value)} 
                                            options={bonusSources} 
                                        />
                                        <Select 
                                            label="Ícone" 
                                            value={card.icon} 
                                            onChange={e => handleBonusCardChange(index, 'icon', e.target.value)} 
                                            options={iconOptions} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeBonusCard(index)} 
                                        className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"
                                    >
                                        <IconTrash size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={addBonusCard} 
                            className="mt-4 flex items-center gap-2 bg-[#2A2A2A] px-4 py-2 rounded-lg font-semibold hover:bg-[#3A3A3A] text-white"
                        >
                            <IconPlus size={16}/> Adicionar Cartão de Bônus
                        </button>
                    </Card>

                    {/* Informações do Usuário */}
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Informações do Usuário</h2>
                        <p className="text-sm text-gray-400 mb-4">Escolha quais dados do consultor aparecem no cabeçalho</p>
                        <div className="space-y-3">
                            {(localConfig.userInfoFields || []).map((field, index) => (
                                <div key={index} className="p-3 bg-[#121212] rounded-lg flex items-end gap-3">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input 
                                            label="Rótulo" 
                                            value={field.label} 
                                            onChange={e => handleUserInfoChange(index, 'label', e.target.value)} 
                                        />
                                        <Select 
                                            label="Fonte do Dado" 
                                            value={field.key} 
                                            onChange={e => handleUserInfoChange(index, 'key', e.target.value)} 
                                            options={userInfoSources} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeUserInfoField(index)} 
                                        className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"
                                    >
                                        <IconTrash size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={addUserInfoField} 
                            className="mt-4 flex items-center gap-2 bg-[#2A2A2A] px-4 py-2 rounded-lg font-semibold hover:bg-[#3A3A3A] text-white"
                        >
                            <IconPlus size={16}/> Adicionar Campo
                        </button>
                    </Card>

                    {/* Links */}
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Links Rápidos</h2>
                        <p className="text-sm text-gray-400 mb-4">Configure os links de acesso rápido</p>
                        <div className="space-y-3">
                            {(localConfig.dashboardLinks || []).map((link, index) => (
                                <div key={index} className="p-3 bg-[#121212] rounded-lg flex items-end gap-3">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Input 
                                            label="Rótulo do Link" 
                                            value={link.label} 
                                            onChange={e => handleLinkChange(index, 'label', e.target.value)} 
                                        />
                                        <Input 
                                            label="URL" 
                                            value={link.href} 
                                            onChange={e => handleLinkChange(index, 'href', e.target.value)} 
                                        />
                                        <Select 
                                            label="Ícone" 
                                            value={link.icon} 
                                            onChange={e => handleLinkChange(index, 'icon', e.target.value)} 
                                            options={iconOptions} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeLink(index)} 
                                        className="h-10 w-10 bg-red-500/20 text-red-400 rounded-md flex items-center justify-center hover:bg-red-500/40"
                                    >
                                        <IconTrash size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={addLink} 
                            className="mt-4 flex items-center gap-2 bg-[#2A2A2A] px-4 py-2 rounded-lg font-semibold hover:bg-[#3A3A3A] text-white"
                        >
                            <IconPlus size={16}/> Adicionar Link
                        </button>
                    </Card>
                </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Barra de Progresso</h2>
                    <p className="text-sm text-gray-400 mb-4">Configure como a barra de progresso é calculada</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select 
                            label="Modo de Cálculo" 
                            value={localConfig.progressBar?.calculationMode ?? 'auto-pin'} 
                            onChange={e => handleProgressBarChange('calculationMode', e.target.value)} 
                            options={[
                                {value: 'manual', label: 'Manual (selecionar PIN)'},
                                {value: 'auto-pin', label: 'Automático (próximo PIN)'}
                            ]} 
                        />
                        {(localConfig.progressBar?.calculationMode ?? 'auto-pin') === 'manual' && (
                            <Select 
                                label="PIN Alvo" 
                                value={localConfig.progressBar?.targetPin || ''} 
                                onChange={e => handleProgressBarChange('targetPin', e.target.value)} 
                                options={[
                                    {value: '', label: 'Selecione um PIN'}, 
                                    ...mockCareerPlan.pinTable.map(p => ({ value: p.pin, label: p.pin }))
                                ]} 
                            />
                        )}
                        <Input 
                            label="Ciclos Atuais (Demo)" 
                            type="number" 
                            value={String(localConfig.progressBar?.currentCycles ?? 0)} 
                            onChange={e => handleProgressBarChange('currentCycles', Number(e.target.value))} 
                        />
                    </div>
                </Card>
            )}

            {/* Personalization Tab */}
            {activeTab === 'personalization' && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Logos dos PINs</h2>
                        <p className="text-sm text-gray-400 mb-4">Os logos e nomes são os mesmos do Plano de Carreira. Configure apenas a visibilidade.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {careerPins.map((p) => (
                              <div key={p.nome} className="p-3 bg-[#121212] rounded-lg text-center">
                                <label className="text-sm font-semibold text-white block mb-2">{p.nome}</label>
                                {p.logoUrl && (
                                  <img src={p.logoUrl} alt={p.nome} className="h-16 w-16 mx-auto mb-2 object-contain" />
                                )}
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  <label className="text-xs text-gray-400">Mostrar no dashboard</label>
                                  <input type="checkbox" checked={Boolean(pinVisibility[p.id] ?? true)} onChange={() => togglePinVisibility(p.id)} />
                                </div>
                              </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Informational Banner */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-500 text-sm">
                    ℹ️ <strong>Informação:</strong> As configurações estão ligadas ao backend e refletem no dashboard do consultor.
                </p>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex gap-4">
                <button 
                    onClick={handleSave}
                    className="px-6 py-3 bg-[#FFD700] text-[#121212] font-semibold rounded-lg hover:bg-[#FFE84D] transition-colors flex items-center gap-2"
                >
                    <IconActive size={20} />
                    Salvar Configurações
                </button>
                <button 
                    onClick={() => {
                      const href = context === 'consultant' ? CONSULTOR_DASHBOARD_URL : MARKETPLACE_ADMIN_DASHBOARD_EDITOR_URL;
                      window.open(href, '_blank');
                    }}
                    className="px-6 py-3 bg-[#2A2A2A] text-white font-semibold rounded-lg hover:bg-[#3A3A3A] transition-colors"
                >
                    Visualizar Preview
                </button>
            </div>

            {/* Save Success Notification */}
            {saveStatus && (
                <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
                    <IconActive />
                    <span>Salvo com sucesso!</span>
                </div>
            )}
        </div>
    );
};

export default DashboardEditorFull;
