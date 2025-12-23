

import React, { useState, useEffect } from 'react';
import { DashboardSettings, DashboardComponent, DashboardComponentType, DashboardCard, View } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ToggleSwitch } from './ToggleSwitch';
import { PlusIcon } from './icons/PlusIcon';

// Import all available icons
import { AffiliateIcon } from './icons/AffiliateIcon';
import { DistributionIcon } from './icons/DistributionIcon';
import { TruckIcon } from './icons/TruckIcon';
import { GlobalIcon } from './icons/GlobalIcon';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { WalletIcon } from './icons/WalletIcon';
import { OrdersIcon } from './icons/OrdersIcon';
import { ProductsIcon } from './icons/ProductsIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { TagIcon } from './icons/TagIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { LinkChainIcon } from './icons/LinkChainIcon';
import { UserIcon } from './icons/UserIcon';
import { BellIcon } from './icons/BellIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';

interface DashboardEditorProps {
    settings: DashboardSettings;
    onUpdate: (newSettings: DashboardSettings) => void;
}

const DragHandleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
    </svg>
);


const iconMap: { [key: string]: { component: React.FC<any>, name: string } } = {
    'AffiliateIcon': { component: AffiliateIcon, name: 'Afiliado' },
    'DistributionIcon': { component: DistributionIcon, name: 'Dropshipping' },
    'TruckIcon': { component: TruckIcon, name: 'Logística' },
    'GlobalIcon': { component: GlobalIcon, name: 'Global' },
    'StarOutlineIcon': { component: StarOutlineIcon, name: 'Estrela' },
    'TrophyIcon': { component: TrophyIcon, name: 'Troféu' },
    'WalletIcon': { component: WalletIcon, name: 'Carteira' },
    'OrdersIcon': { component: OrdersIcon, name: 'Pedidos' },
    'ProductsIcon': { component: ProductsIcon, name: 'Produtos' },
    'AnalyticsIcon': { component: AnalyticsIcon, name: 'Analytics' },
    'TagIcon': { component: TagIcon, name: 'Tag/Promoção' },
    'MegaphoneIcon': { component: MegaphoneIcon, name: 'Marketing' },
    'LinkChainIcon': { component: LinkChainIcon, name: 'Link' },
    'UserIcon': { component: UserIcon, name: 'Usuário' },
    'BellIcon': { component: BellIcon, name: 'Notificação' },
    'ShoppingBagIcon': { component: ShoppingBagIcon, name: 'Loja' },
};

const componentNameMap: { [key in DashboardComponentType]: string } = {
    userInfo: 'Cartão de Usuário',
    referralLinks: 'Links de Indicação e Afiliado',
    qualificationProgress: 'Barra de Qualificação/Progresso',
    adminBanner: 'Banner do Painel',
    bonusCards: 'Cartões de Bônus',
    incentivesProgram: 'Programa de Incentivos',
    networkActivity: 'Atividade da Rede',
    shortcut: 'Atalho Rápido',
    performanceChart: 'Gráfico de Desempenho',
};

const dataKeyOptions: {key: DashboardCard['dataKey'], label: string}[] = [
    { key: 'cycleBonus', label: 'Bônus Ciclo Global' },
    { key: 'topSigmeBonus', label: 'Bônus Top Sigme' },
    { key: 'careerPlanBonus', label: 'Bônus Plano de Carreira' },
    { key: 'affiliateBonus', label: 'Bônus Venda Afiliado' },
    { key: 'dropshipBonus', label: 'Bônus Dropship' },
    { key: 'logisticsBonus', label: 'Bônus de Logística' },
    { key: 'custom', label: 'Nenhum (Valor Manual)' }
];

// Fix: Added missing fields to match the UserProfile type and dashboard component configuration.
const userInfoFieldLabels: Record<keyof NonNullable<DashboardComponent['visibleFields']>, string> = {
    id: 'ID do Usuário',
    graduation: 'Graduação',
    accountStatus: 'Status da Conta',
    monthlyActivity: 'Atividade Mensal',
    category: 'Categoria',
    referralLink: 'Link de Indicação',
    affiliateLink: 'Link de Afiliado',
};

// Renamed from DashboardEditor to follow file name convention,
// but App.tsx expects it to be exported as DashboardEditor.
const DashboardEditor: React.FC<DashboardEditorProps> = ({ settings, onUpdate }) => {
    const [localSettings, setLocalSettings] = useState<DashboardSettings>(settings);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    
    const [draggedCompIndex, setDraggedCompIndex] = useState<{col: 'left' | 'right', index: number} | null>(null);
    const [dragOverCompIndex, setDragOverCompIndex] = useState<{col: 'left' | 'right', index: number} | null>(null);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);
    
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

    const handleSave = () => onUpdate(localSettings);
    const handleDiscard = () => setLocalSettings(settings);
    
    const handleAddComponent = (type: DashboardComponentType, column: 'left' | 'right') => {
        const newComponent: DashboardComponent = {
            id: `comp-${Date.now()}`,
            type,
            column,
            enabled: true,
            title: componentNameMap[type],
            // Default values
            ...(type === 'userInfo' && { visibleFields: { id: true, graduation: true, accountStatus: true, monthlyActivity: true, category: true, referralLink: true, affiliateLink: true } }), // Fix: Added missing fields
            ...(type === 'qualificationProgress' && { value: 50, max: 100, startLabel: 'Início', endLabel: 'Meta' }),
            ...(type === 'shortcut' && { url: '#', icon: 'LinkChainIcon' }),
        };

        setLocalSettings(prev => ({
            ...prev,
            components: [...prev.components, newComponent]
        }));
        setIsAddMenuOpen(false);
    };

    const handleComponentChange = (id: string, field: keyof DashboardComponent, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            components: prev.components.map(c => c.id === id ? { ...c, [field]: value } : c)
        }));
    };
    
     const handleComponentFieldVisibilityChange = (componentId: string, fieldKey: string, isVisible: boolean) => {
        setLocalSettings(prev => ({
            ...prev,
            components: prev.components.map(c => 
                c.id === componentId 
                    ? { ...c, visibleFields: { ...c.visibleFields, [fieldKey]: isVisible } } 
                    : c
            )
        }));
    };

    const handleCardChange = (id: string, field: keyof DashboardCard, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            cards: prev.cards.map(c => c.id === id ? { ...c, [field]: value } : c)
        }));
    };
    
    const addableComponents: { type: DashboardComponentType, column: 'left' | 'right' }[] = [
        { type: 'userInfo', column: 'left' },
        { type: 'referralLinks', column: 'left' },
        { type: 'qualificationProgress', column: 'left' },
        { type: 'adminBanner', column: 'right' },
        { type: 'bonusCards', column: 'right' },
        { type: 'incentivesProgram', column: 'right' },
        { type: 'networkActivity', column: 'right' },
        { type: 'shortcut', column: 'right' },
        { type: 'performanceChart', column: 'right' },
    ];
    
    const leftColumn = localSettings.components.filter(c => c.column === 'left');
    const rightColumn = localSettings.components.filter(c => c.column === 'right');

    const handleDrop = (targetCol: 'left' | 'right', targetIndex: number) => {
        if (!draggedCompIndex) return;

        const sourceCol = draggedCompIndex.col;
        const sourceIndex = draggedCompIndex.index;
        
        const newLeft = [...leftColumn];
        const newRight = [...rightColumn];

        let draggedItem;
        if (sourceCol === 'left') {
            draggedItem = newLeft.splice(sourceIndex, 1)[0];
        } else {
            draggedItem = newRight.splice(sourceIndex, 1)[0];
        }
        
        draggedItem.column = targetCol;

        if (targetCol === 'left') {
            newLeft.splice(targetIndex, 0, draggedItem);
        } else {
            newRight.splice(targetIndex, 0, draggedItem);
        }

        setLocalSettings(prev => ({...prev, components: [...newLeft, ...newRight]}));
    };
    
    const renderComponentCard = (c: DashboardComponent, col: 'left' | 'right', index: number) => (
        <div key={c.id} 
             draggable
             onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggedCompIndex({col, index}) }}
             onDragEnd={() => { setDraggedCompIndex(null); setDragOverCompIndex(null); }}
             onDragOver={(e) => { e.preventDefault(); if (dragOverCompIndex?.index !== index || dragOverCompIndex.col !== col) setDragOverCompIndex({col, index}); }}
             onDrop={(e) => { e.preventDefault(); handleDrop(col, index); }}
             className={`bg-black border border-dark-800 rounded-lg p-4 space-y-3 transition-opacity ${draggedCompIndex?.index === index && draggedCompIndex?.col === col ? 'opacity-30' : ''}`}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <DragHandleIcon className="w-5 h-5 text-gray-500 cursor-grab" />
                    <h4 className="font-semibold text-white">{componentNameMap[c.type]}</h4>
                </div>
                <div className="flex items-center gap-4">
                     <ToggleSwitch checked={c.enabled} onChange={val => handleComponentChange(c.id, 'enabled', val)} labelId={`toggle-${c.id}`} />
                     <button onClick={() => setLocalSettings(p => ({...p, components: p.components.filter(i => i.id !== c.id)}))} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
             {c.title !== undefined && c.type !== 'userInfo' && c.type !== 'referralLinks' && (
                <input type="text" value={c.title} onChange={e => handleComponentChange(c.id, 'title', e.target.value)} placeholder="Título do Componente" className="w-full text-sm bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white"/>
             )}
              {c.type === 'userInfo' && c.visibleFields && (
                <div className="grid grid-cols-2 gap-2 border-t border-dark-700 pt-3">
                    {Object.entries(userInfoFieldLabels).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
                            <input type="checkbox" checked={c.visibleFields![key as keyof typeof c.visibleFields]} onChange={e => handleComponentFieldVisibilityChange(c.id, key, e.target.checked)} className="h-4 w-4 rounded bg-dark-700 border-dark-700 text-gold-500 focus:ring-yellow-600"/>
                            {label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-between items-center border-b border-dark-800">
                <h1 className="text-2xl font-bold text-white">Editor do Painel</h1>
                <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-gold-400">Você tem alterações não salvas.</p>}
                    <button onClick={handleDiscard} disabled={!hasChanges} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50">Descartar</button>
                    <button onClick={handleSave} disabled={!hasChanges} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50">Salvar Layout</button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-semibold text-white px-2">Coluna Esquerda</h3>
                    {leftColumn.map((c, i) => renderComponentCard(c, 'left', i))}
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-white px-2">Coluna Direita</h3>
                    {rightColumn.map((c, i) => renderComponentCard(c, 'right', i))}
                </div>
            </div>
             <div className="relative">
                <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-dark-800 text-white py-3 px-4 rounded-lg border-2 border-dashed border-dark-700 hover:border-gold-500 hover:text-gold-400">
                    <PlusIcon className="w-5 h-5"/> Adicionar Componente
                </button>
                 {isAddMenuOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-black border border-dark-700 rounded-lg shadow-lg z-10 p-2">
                        {addableComponents.map(comp => (
                            <button key={comp.type} onClick={() => handleAddComponent(comp.type, comp.column)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 rounded-md">
                                {componentNameMap[comp.type]} <span className="text-xs text-gray-500">({comp.column === 'left' ? 'Esquerda' : 'Direita'})</span>
                            </button>
                        ))}
                    </div>
                 )}
            </div>

            <div className="bg-black border border-dark-800 rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-white">Cartões de Bônus</h3>
                {localSettings.cards.map(card => (
                    <div key={card.id} className="grid grid-cols-3 gap-3 items-center">
                        <input type="text" value={card.title} onChange={e => handleCardChange(card.id, 'title', e.target.value)} placeholder="Título do Cartão" className="col-span-1 w-full text-sm bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white"/>
                         <select value={card.dataKey} onChange={e => handleCardChange(card.id, 'dataKey', e.target.value)} className="col-span-1 w-full text-sm bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white">
                            {dataKeyOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                        </select>
                        <select value={card.icon} onChange={e => handleCardChange(card.id, 'icon', e.target.value)} className="col-span-1 w-full text-sm bg-dark-800 border-2 border-dark-700 rounded-md py-1 px-2 text-white">
                            {Object.entries(iconMap).map(([key, {name}]) => <option key={key} value={key}>{name}</option>)}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardEditor;