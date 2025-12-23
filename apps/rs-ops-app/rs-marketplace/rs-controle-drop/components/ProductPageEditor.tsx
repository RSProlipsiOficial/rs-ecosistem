import React, { useState, useMemo } from 'react';
import { ProductPageLayout, ProductPageBlock, ProductPageTemplate, ProductPageBlockType } from '../types';
import { ArrowUp, ArrowDown, Save, Trash2, Layout, Plus, Check } from 'lucide-react';

interface ProductPageEditorProps {
    layout: ProductPageLayout;
    templates: ProductPageTemplate[];
    onSaveLayout: (layout: ProductPageLayout) => void;
    onUpdateTemplates: (templates: ProductPageTemplate[]) => void;
}

const ALL_BLOCK_TYPES: { type: ProductPageBlockType, name: string }[] = [
    { type: 'description', name: 'Descrição' },
    { type: 'benefits', name: 'Benefícios' },
    { type: 'reviews', name: 'Avaliações' },
    { type: 'faq', name: 'FAQ' },
    { type: 'guarantee', name: 'Garantia' },
    { type: 'cta', name: 'Chamada para Ação' },
];

export const ProductPageEditor: React.FC<ProductPageEditorProps> = ({ layout, templates, onSaveLayout, onUpdateTemplates }) => {
    const [currentLayout, setCurrentLayout] = useState<ProductPageLayout>(layout);
    const [newTemplateName, setNewTemplateName] = useState('');

    const handleLayoutChange = (mainLayout: 'image-left' | 'image-right' | 'gallery') => {
        const updatedLayout = { ...currentLayout, mainLayout };
        setCurrentLayout(updatedLayout);
        onSaveLayout(updatedLayout);
    };

    const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...currentLayout.blocks];
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === newBlocks.length - 1)) {
            return;
        }
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]; // Swap
        const updatedLayout = { ...currentLayout, blocks: newBlocks };
        setCurrentLayout(updatedLayout);
        onSaveLayout(updatedLayout);
    };

    const handleToggleBlock = (blockType: ProductPageBlockType) => {
        const blockExists = currentLayout.blocks.some(b => b.type === blockType);
        let newBlocks: ProductPageBlock[];
        if (blockExists) {
            newBlocks = currentLayout.blocks.filter(b => b.type !== blockType);
        } else {
            // Add block at the end
            newBlocks = [...currentLayout.blocks, { type: blockType }];
        }
        const updatedLayout = { ...currentLayout, blocks: newBlocks };
        setCurrentLayout(updatedLayout);
        onSaveLayout(updatedLayout);
    };
    
    const handleApplyTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setCurrentLayout(template.layout);
            onSaveLayout(template.layout);
        }
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName.trim()) {
            alert("Por favor, dê um nome ao template.");
            return;
        }
        const newTemplate: ProductPageTemplate = {
            id: crypto.randomUUID(),
            name: newTemplateName,
            layout: currentLayout,
        };
        onUpdateTemplates([...templates, newTemplate]);
        setNewTemplateName('');
    };
    
    const handleDeleteTemplate = (id: string) => {
        if(confirm("Tem certeza que deseja deletar este template?")) {
            onUpdateTemplates(templates.filter(t => t.id !== id));
        }
    };
    
    const activeBlockTypes = useMemo(() => new Set(currentLayout.blocks.map(b => b.type)), [currentLayout.blocks]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Configuration */}
            <div className="space-y-6">
                {/* Layout Selector */}
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Layout Principal</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <LayoutOption
                            label="Imagem à Esquerda"
                            isActive={currentLayout.mainLayout === 'image-left'}
                            onClick={() => handleLayoutChange('image-left')}
                        />
                         <LayoutOption
                            label="Imagem à Direita"
                            isActive={currentLayout.mainLayout === 'image-right'}
                            onClick={() => handleLayoutChange('image-right')}
                        />
                         <LayoutOption
                            label="Galeria"
                            isActive={currentLayout.mainLayout === 'gallery'}
                            onClick={() => handleLayoutChange('gallery')}
                        />
                    </div>
                </div>

                {/* Block Order */}
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Ordem dos Blocos</h3>
                    <div className="bg-black/20 p-2 rounded-lg border border-white/5 space-y-1">
                        {currentLayout.blocks.map((block, index) => (
                            <div key={block.type} className="flex items-center justify-between bg-white/5 p-2 rounded">
                                <span className="text-sm text-slate-200 capitalize">{ALL_BLOCK_TYPES.find(b => b.type === block.type)?.name}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleMoveBlock(index, 'up')} className="p-1 hover:bg-white/10 rounded"><ArrowUp size={14}/></button>
                                    <button onClick={() => handleMoveBlock(index, 'down')} className="p-1 hover:bg-white/10 rounded"><ArrowDown size={14}/></button>
                                </div>
                            </div>
                        ))}
                         {currentLayout.blocks.length === 0 && <p className="text-xs text-slate-500 text-center p-4">Nenhum bloco ativo.</p>}
                    </div>
                </div>

                 {/* Available Blocks */}
                <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Blocos Disponíveis</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {ALL_BLOCK_TYPES.map(block => (
                            <label key={block.type} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg cursor-pointer hover:bg-black/40">
                                <input
                                    type="checkbox"
                                    checked={activeBlockTypes.has(block.type)}
                                    onChange={() => handleToggleBlock(block.type)}
                                    className="accent-rs-gold w-4 h-4"
                                />
                                <span className="text-xs text-slate-300">{block.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

            </div>
            
            {/* Right side: Templates */}
            <div className="bg-rs-dark p-6 rounded-xl border border-rs-gold/20 space-y-6">
                <h3 className="font-bold text-rs-gold">Templates da Página</h3>
                 {/* Apply Template */}
                <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">Aplicar Template</label>
                    <select onChange={e => handleApplyTemplate(e.target.value)} className="input-field w-full">
                        <option value="">Selecione um template...</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                     {templates.map(t => (
                        <div key={t.id} className="flex justify-between items-center mt-2 bg-white/5 p-1 rounded">
                            <span className="text-xs text-slate-400 pl-2">{t.name}</span>
                            <button onClick={() => handleDeleteTemplate(t.id)} className="p-1 text-red-500/60 hover:text-red-500"><Trash2 size={12}/></button>
                        </div>
                    ))}
                </div>
                 {/* Save Template */}
                <div className="border-t border-white/10 pt-4">
                    <label className="text-sm font-bold text-slate-300 mb-2 block">Salvar Layout Atual como Template</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={e => setNewTemplateName(e.target.value)}
                            placeholder="Nome do novo template"
                            className="input-field flex-1"
                        />
                        <button onClick={handleSaveTemplate} className="btn-secondary flex items-center gap-2"><Save size={14}/> Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LayoutOptionProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}
const LayoutOption: React.FC<LayoutOptionProps> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`p-4 rounded-lg border-2 transition-colors text-center ${isActive ? 'bg-rs-gold/10 border-rs-gold' : 'bg-black/20 border-slate-700 hover:border-slate-500'}`}>
        <Layout size={24} className="mx-auto mb-2" />
        <span className="text-xs">{label}</span>
    </button>
);
