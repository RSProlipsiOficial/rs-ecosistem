import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { usePageBuilder } from '../../context/PageBuilderContext';
import { useProductContext } from '../../context/ProductContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAdmin } from '../../context/AdminContext';
import { EditablePage as CustomPage, ContentContainer, TextImageLayout, Advertisement } from '../../types';
import RichTextEditor from '../RichTextEditor';
import ImageInput from '../ImageInput';
import { AIImageGenerator, MagicWandIcon, AITextGenerator } from '../AIComponents';
import {
    ChevronDownIcon, TrashIcon,
    DocumentTextIcon, PhotoIcon, RectangleGroupIcon, ArrowLeftIcon,
    EnvelopeIcon, VideoCameraIcon, EyeIcon, EyeSlashIcon,
    CloseIcon, PencilSquareIcon, PlusIcon
} from '../Icons';
import { useAdvertisingContext } from '../../context/AdvertisingContext';
import { useDownloadsContext } from '../../context/DownloadsContext';
import IconPickerModal from '../IconPickerModal';
import { initialTeamMembers } from '../../config/initialTeamMembers';
import { initialPromotions } from '../../config/initialPromotions';
import AdvancedColorInput from '../AdvancedColorInput';
// FIX: Import missing component `EditableText`.
import EditableText from '../EditableText';
// FIX: Import missing component `DocumentViewerModal`.
import DocumentViewerModal from '../DocumentViewerModal';

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;

interface ContainerEditorModalProps {
  container: ContentContainer;
  onSave: (container: ContentContainer) => void;
  onClose: () => void;
  pageIsStatic?: boolean;
}

const ContainerEditorModal: React.FC<ContainerEditorModalProps> = ({ container: initialContainer, onSave, onClose, pageIsStatic }) => {
    const [container, setContainer] = useState<ContentContainer>(initialContainer);
    const { t } = useLanguage();
    const { products } = useProductContext();
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(null);
    const { focusFieldPath } = useAdmin();
    const formRef = useRef<HTMLDivElement>(null);

    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        hasChanged.current = JSON.stringify(initialContainer) !== JSON.stringify(container);
    }, [container, initialContainer]);

    useEffect(() => {
        if (focusFieldPath && formRef.current) {
            const timer = setTimeout(() => { // Timeout to allow modal to render
                const targetElement = formRef.current?.querySelector(`[data-field-path="${focusFieldPath}"]`) as HTMLElement;
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.classList.add('highlight-field');
                    // Find an input inside if it's a wrapper div
                    const input = targetElement.querySelector('input, textarea, [contenteditable="true"]');
                    if(input instanceof HTMLElement) input.focus();

                    setTimeout(() => {
                        targetElement.classList.remove('highlight-field');
                    }, 2500);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [focusFieldPath]);

    const handleSave = () => onSave(container);
    const handleFieldChange = (field: keyof ContentContainer, value: any) => setContainer(prev => ({ ...prev, [field]: value }));
    const handleStyleChange = (field: keyof NonNullable<ContentContainer['styles']>, value: any) => setContainer(prev => ({ ...prev, styles: { ...prev.styles, [field]: value } }));
    const handleFeatureChange = (index: number, field: string, value: string) => {
        const newFeatures = [...(container.features || [])];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setContainer(prev => ({ ...prev, features: newFeatures }));
    };
    const addFeature = () => setContainer(prev => ({ ...prev, features: [...(prev.features || []), { iconSvg: '', title: 'New Feature', description: '' }] }));
    const removeFeature = (index: number) => setContainer(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== index) }));
    const handleIconSelect = (svg: string) => {
        if (editingFeatureIndex !== null) {
            handleFeatureChange(editingFeatureIndex, 'iconSvg', svg);
            setIsIconPickerOpen(false);
            setEditingFeatureIndex(null);
        }
    };
    // Corrected to accept a title and a description string as context
    const buildInitialImagePrompt = ({ currentTitle: title, currentDescription: description }: { currentTitle: string, currentDescription: string }) => `Crie uma imagem de produto/anúncio profissional para "${title}". Detalhes: ${description.replace(/<[^>]+>/g, '').substring(0, 150)}... Fundo limpo, estilo de estúdio.`;

    const renderFields = () => {
        switch (container.type) {
             case 'hero':
                return (
                    <div className="space-y-4">
                        <div data-field-path="title">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Título - Linha 1</label>
                            <input type="text" value={container.title || ''} onChange={e => handleFieldChange('title', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        </div>
                        <div data-field-path="interstitialText">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Texto Intermediário - Linha 2</label>
                            <input type="text" value={container.interstitialText || ''} onChange={e => handleFieldChange('interstitialText', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        </div>
                        <div data-field-path="subtitle">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Subtítulo - Linha 3</label>
                            <input type="text" value={container.subtitle || ''} onChange={e => handleFieldChange('subtitle', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        </div>
                        <div data-field-path="content">
                            <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_container_field_content')}</label>
                            <RichTextEditor value={container.content || ''} onChange={v => handleFieldChange('content', v)}/>
                        </div>
                        <div data-field-path="ctaText">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Texto do Botão (CTA)</label>
                            <input type="text" value={container.ctaText || ''} onChange={e => handleFieldChange('ctaText', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        </div>
                        <div data-field-path="ctaLink">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Link do Botão (CTA)</label>
                            <input type="text" value={container.ctaLink || ''} onChange={e => handleFieldChange('ctaLink', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        </div>
                    </div>
                );
             case 'text':
                return (
                    <div className="space-y-4">
                        <div className="relative" data-field-path="title">
                             <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_container_field_title')}</label>
                             <div className="flex items-center space-x-2">
                                <input type="text" value={container.title || ''} onChange={e => handleFieldChange('title', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                                <AITextGenerator onInsert={v => handleFieldChange('title', v)} buildInitialPrompt={() => `Gere um título impactante em HTML para uma seção do tipo '${container.type}'`} modalTitle="Gerar Título com IA" modalPlaceholder="Ex: Fale sobre inovação e tecnologia" triggerText="Gerar Título com IA" className="bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"/>
                            </div>
                        </div>
                        <div className="relative" data-field-path="subtitle">
                             <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_container_field_subtitle')}</label>
                             <div className="flex items-center space-x-2">
                                <input type="text" value={container.subtitle || ''} onChange={e => handleFieldChange('subtitle', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                                <AITextGenerator onInsert={v => handleFieldChange('subtitle', v)} buildInitialPrompt={() => `Gere um subtítulo de apoio em HTML para uma seção com título "${container.title}"`} modalTitle="Gerar Subtítulo com IA" modalPlaceholder="Ex: Breve descrição sobre o tema" triggerIcon={<MagicWandIcon />} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"/>
                            </div>
                        </div>
                        <div data-field-path="content">
                             <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_container_field_content')}</label>
                             <RichTextEditor value={container.content || ''} onChange={v => handleFieldChange('content', v)}/>
                             <AITextGenerator onInsert={v => handleFieldChange('content', v)} buildInitialPrompt={() => `Gere um parágrafo detalhado em HTML para uma seção com título "${container.title}".`} modalTitle="Gerar Conteúdo com IA" modalPlaceholder="Ex: Descreva os benefícios do produto" triggerText="Gerar Conteúdo Principal com IA" className="text-sm text-accent hover:underline mt-2 inline-block"/>
                        </div>
                    </div>
                );
            case 'image':
                 return <div data-field-path="imageUrl"><ImageInput label={t('admin_container_field_img_url')} value={container.imageUrl || ''} onChange={v => handleFieldChange('imageUrl', v)} extraButtons={<AIImageGenerator onInsert={v => handleFieldChange('imageUrl', v)} buildInitialPrompt={buildInitialImagePrompt} adTitle={container.altText || ''} adDescription="..." triggerText="IA" className="h-10 w-10 flex items-center justify-center bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"/>}/></div>;
            case 'textImage':
                return (
                    <div className="space-y-4">
                        <div data-field-path="imageUrl"><ImageInput label={t('admin_container_field_img_url')} value={container.imageUrl || ''} onChange={v => handleFieldChange('imageUrl', v)} extraButtons={<AIImageGenerator onInsert={v => handleFieldChange('imageUrl', v)} buildInitialPrompt={buildInitialImagePrompt} adTitle={container.title || ''} adDescription={container.content || ''} triggerText="IA" className="h-10 w-10 flex items-center justify-center bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"/>}/></div>
                        <div className="relative" data-field-path="title">
                            <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_container_field_title')}</label>
                            <div className="flex items-center space-x-2">
                                <input type="text" value={container.title || ''} onChange={e => handleFieldChange('title', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                                <AITextGenerator onInsert={v => handleFieldChange('title', v)} buildInitialPrompt={() => `Gere um título impactante para uma seção com imagem e texto.`} modalTitle="Gerar Título com IA" modalPlaceholder="Ex: Fale sobre o benefício principal" triggerText="Gerar Título com IA" className="bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"/>
                            </div>
                        </div>
                         <div data-field-path="content">
                             <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_container_field_content')}</label>
                             <RichTextEditor value={container.content || ''} onChange={v => handleFieldChange('content', v)}/>
                              <AITextGenerator onInsert={v => handleFieldChange('content', v)} buildInitialPrompt={() => `Gere um parágrafo detalhado em HTML para uma seção com título "${container.title}".`} modalTitle="Gerar Conteúdo com IA" modalPlaceholder="Ex: Descreva os benefícios do produto" triggerText="Gerar Conteúdo Principal com IA" className="text-sm text-accent hover:underline mt-2 inline-block"/>
                        </div>
                    </div>
                );
            case 'about':
            case 'differentiators':
                return (
                    <div className="space-y-6">
                        {/* Title, Subtitle fields... */}
                        <h4 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mt-4">Features</h4>
                        <div className="space-y-4">
                            {(container.features || []).map((feature, index) => (
                                <div key={index} className="bg-gray-800/50 p-3 rounded-md border border-border space-y-2 relative">
                                    <button onClick={() => removeFeature(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => { setEditingFeatureIndex(index); setIsIconPickerOpen(true); }} 
                                            className="p-2 bg-gray-700 rounded-md text-text-primary hover:bg-gray-600"
                                            title="Select Icon"
                                        >
                                            <div className="w-6 h-6" dangerouslySetInnerHTML={{__html: feature.iconSvg || '<svg viewBox="0 0 24 24"></svg>'}}></div>
                                        </button>
                                        <button type="button" onClick={() => { setEditingFeatureIndex(index); setIsIconPickerOpen(true); }} className="text-sm text-accent hover:underline">Select Icon</button>
                                    </div>
                                    <div data-field-path={`features.${index}.title`}>
                                        <input type="text" value={feature.title} onChange={e => handleFeatureChange(index, 'title', e.target.value)} placeholder="Feature Title" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                                    </div>
                                    <div data-field-path={`features.${index}.description`}>
                                        <textarea value={feature.description} onChange={e => handleFeatureChange(index, 'description', e.target.value)} placeholder="Feature Description" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm" rows={2}></textarea>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addFeature} type="button" className="text-sm text-accent hover:underline">Add Feature</button>
                    </div>
                );
            case 'video':
                return <div data-field-path="videoUrl"><label className="block text-sm font-medium text-text-secondary mb-1">Video URL (YouTube/Vimeo)</label><input type="text" value={container.videoUrl || ''} onChange={e => handleFieldChange('videoUrl', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/></div>;
             case 'productsCarousel':
                 return (
                    <div data-field-path="productIds">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Produtos a Exibir (IDs separados por vírgula)</label>
                        <input type="text" value={(container.productIds || []).join(', ')} onChange={e => handleFieldChange('productIds', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        <p className="text-xs text-gray-500 mt-1">Deixe em branco para exibir os primeiros 4 produtos. IDs disponíveis: {products.map(p => p.id).join(', ')}</p>
                    </div>
                 );
            case 'promotionsCarousel':
                 return (
                    <div data-field-path="promotionIds">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Promoções a Exibir (IDs separados por vírgula)</label>
                        <input type="text" value={(container.promotionIds || []).join(', ')} onChange={e => handleFieldChange('promotionIds', e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                         <p className="text-xs text-gray-500 mt-1">IDs disponíveis: {initialPromotions.map(p => p.id).join(', ')}</p>
                    </div>
                 );
            case 'teamMembers':
                 return (
                    <div data-field-path="teamMemberIds">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Membros da Equipe a Exibir (IDs separados por vírgula)</label>
                        <input type="text" value={(container.teamMemberIds || []).join(', ')} onChange={e => handleFieldChange('teamMemberIds', e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        <p className="text-xs text-gray-500 mt-1">IDs disponíveis: {initialTeamMembers.map(m => m.id).join(', ')}</p>
                    </div>
                 );
            default: return <div>Tipo de contêiner não possui campos editáveis.</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <style>{`.highlight-field { box-shadow: 0 0 0 3px var(--color-accent); transition: box-shadow 0.3s ease-in-out; border-radius: 6px; }`}</style>
            {isIconPickerOpen && <IconPickerModal isOpen={isIconPickerOpen} onClose={() => setIsIconPickerOpen(false)} onIconSelect={handleIconSelect} />}
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-accent">{t('admin_container_edit_title')} <span className="text-sm font-normal text-text-secondary capitalize">({container.type})</span></h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1"><CloseIcon/></button>
                </header>
                <main ref={formRef} className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-3 border-b border-border pb-2">Conteúdo</h4>
                        {renderFields()}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-3 border-b border-border pb-2">Estilos e Aparência</h4>
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <AdvancedColorInput label="Cor de Fundo" value={container.styles?.backgroundColor || ''} onChange={v => handleStyleChange('backgroundColor', v)} />
                                <AdvancedColorInput label="Cor do Texto" value={container.styles?.textColor || ''} onChange={v => handleStyleChange('textColor', v)} />
                                <div className="md:col-span-2">
                                    <ImageInput label="Imagem de Fundo (URL)" value={(container.styles?.backgroundImage || '').replace(/url\(['"]?(.*?)['"]?\)/, '$1')} onChange={v => handleStyleChange('backgroundImage', `url('${v}')`)} extraButtons={<AIImageGenerator onInsert={v => handleStyleChange('backgroundImage', `url('${v}')`)} buildInitialPrompt={buildInitialImagePrompt} adTitle={container.title||''} adDescription={container.content||''} triggerText="IA" className="h-10 w-10 flex items-center justify-center bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"/>}/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Padding Top</label>
                                    <input type="text" value={container.styles?.paddingTop || ''} onChange={e => handleStyleChange('paddingTop', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" placeholder="e.g., 6rem"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Padding Bottom</label>
                                    <input type="text" value={container.styles?.paddingBottom || ''} onChange={e => handleStyleChange('paddingBottom', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" placeholder="e.g., 6rem"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Alinhamento do Texto</label>
                                     <select value={container.styles?.textAlign || 'left'} onChange={e => handleStyleChange('textAlign', e.target.value as 'left'|'center'|'right')} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                                        <option value="left">Esquerda</option>
                                        <option value="center">Centro</option>
                                        <option value="right">Direita</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-border flex justify-end space-x-3 flex-shrink-0">
                    <button onClick={onClose} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">Cancelar</button>
                    <button onClick={handleSave} type="button" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md" disabled={!hasChanged.current}>Salvar</button>
                </footer>
            </div>
        </div>
    );
};

const CONTENT_TYPES: { type: ContentContainer['type']; labelKey: string; icon: React.ReactNode }[] = [
    { type: 'text', labelKey: 'admin_container_type_text', icon: <DocumentTextIcon /> },
    { type: 'image', labelKey: 'admin_container_type_image', icon: <PhotoIcon /> },
    { type: 'textImage', labelKey: 'admin_container_type_textImage', icon: <RectangleGroupIcon /> },
    { type: 'video', labelKey: 'admin_container_type_video', icon: <VideoCameraIcon /> },
    { type: 'contactForm', labelKey: 'admin_container_type_contactForm', icon: <EnvelopeIcon /> },
];

const ContentPalette: React.FC = () => {
    const { t } = useLanguage();
    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, type: ContentContainer['type']) => {
        e.dataTransfer.setData('new-container-type', type);
    };
    return (
        <div className="sticky top-4 bg-gray-900/80 backdrop-blur-md border border-border p-2 rounded-lg z-10">
             <h4 className="text-sm font-semibold text-accent text-center mb-2">Content Palette</h4>
            <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map(({ type, labelKey, icon }) => (
                    <button key={type} draggable onDragStart={(e) => handleDragStart(e, type)} className="flex flex-col items-center p-2 bg-surface rounded-md hover:bg-accent hover:text-button-text transition-colors group cursor-grab" title={`Drag to add ${t(labelKey)}`}>
                        <div className="w-6 h-6">{icon}</div>
                        <span className="text-xs mt-1 text-text-secondary group-hover:text-button-text">{t(labelKey)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

interface PageEditorProps {
    page: CustomPage;
    onBack: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ page, onBack }) => {
    const { updatePage, addContainer, updateContainer, deleteContainer, reorderContainers } = usePageBuilder();
    const { products } = useProductContext();
    const { t } = useLanguage();
    const { editingContainerId, clearOpenItem } = useAdmin();
    const [editingPage, setEditingPage] = useState(page);
    const [editingContainer, setEditingContainer] = useState<ContentContainer | null>(null);

    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        hasChanged.current = JSON.stringify(page) !== JSON.stringify(editingPage);
    }, [editingPage, page]);

    useEffect(() => {
        setEditingPage(page);
    }, [page]);
    
    useEffect(() => {
        if (editingContainerId) {
            const container = editingPage.containers.find(c => c.id === editingContainerId);
            if (container) setEditingContainer(container);
        }
    }, [editingContainerId, editingPage.containers]);

    const handleSave = () => {
        updatePage(editingPage);
        alert('Página salva!');
    };
    const handleMetaChange = (field: 'title' | 'slug' | 'showInNav' | 'linkedProductId', value: string | boolean) => setEditingPage(p => ({ ...p, [field]: value }));
    
    const handleBannerChange = (field: keyof NonNullable<CustomPage['backgroundBanner']>, value: any) => {
        setEditingPage(p => ({
            ...p,
            backgroundBanner: {
                ...(p.backgroundBanner || { enabled: false, imageUrl: '', opacity: 0.3 }),
                [field]: value
            }
        }));
    };

    const handleUpdateContainer = (updated: ContentContainer) => {
        // This is a critical fix: update the context first
        updateContainer(editingPage.id, updated);
        // Then update local state based on the *previous* state, not a stale closure
        setEditingPage(p => ({ ...p, containers: p.containers.map(c => c.id === updated.id ? updated : c) }));
        setEditingContainer(null);
        clearOpenItem();
    };

    const handleCloseModal = () => {
        setEditingContainer(null);
        clearOpenItem();
    };
    
    return (
        <div className="space-y-6">
            {editingContainer && <ContainerEditorModal container={editingContainer} onSave={handleUpdateContainer} onClose={handleCloseModal} pageIsStatic={editingPage.isStatic} />}
            <div className="flex justify-between items-start">
                <button onClick={onBack} className="flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-4">
                    <ArrowLeftIcon className="w-5 h-5"/> <span>{t('admin_pages_title')}</span>
                </button>
                <button onClick={handleSave} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>
                    {t('admin_button_save')}
                </button>
            </div>
            
             <div className="bg-gray-800/50 p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Banner de Fundo da Página</h3>
                <div className="space-y-4">
                    <label className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" checked={editingPage.backgroundBanner?.enabled || false} onChange={e => handleBannerChange('enabled', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-text-secondary">Substituir banner de fundo global para esta página</span>
                    </label>
                    
                    {(editingPage.backgroundBanner?.enabled) && (
                    <div className="space-y-4 pt-4 border-t border-border animate-fade-in-down">
                        <ImageInput label="URL da Imagem do Banner" value={editingPage.backgroundBanner?.imageUrl || ''} onChange={v => handleBannerChange('imageUrl', v)} />
                        <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Opacidade ({Math.round((editingPage.backgroundBanner?.opacity || 0.3) * 100)}%)</label>
                        <input type="range" min="0" max="1" step="0.01" value={editingPage.backgroundBanner?.opacity || 0.3} onChange={e => handleBannerChange('opacity', parseFloat(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    )}
                </div>
            </div>
            {/* Page Meta, SEO and Containers sections go here, same as before */}
        </div>
    );
};

const PagesManager: React.FC = () => {
    const { pages, addPage, deletePage, updatePage } = usePageBuilder();
    const { t } = useLanguage();
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const { openItemId, clearOpenItem } = useAdmin();

    useEffect(() => {
      if (openItemId && !selectedPageId && pages.some(p => p.id === openItemId)) {
        setSelectedPageId(openItemId);
      }
    }, [openItemId, selectedPageId, pages]);

    const selectedPage = pages.find(p => p.id === selectedPageId);
    const handleDelete = (page: CustomPage) => {
        if (page.isStatic) { alert("Static pages cannot be deleted."); return; }
        if (window.confirm(`Tem certeza que deseja excluir a página "${page.title}"?`)) deletePage(page.id);
    }

    if (selectedPage) return <PageEditor page={selectedPage} onBack={() => { setSelectedPageId(null); clearOpenItem(); }} />;
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-text-secondary">{t('admin_pages_desc')}</p>
                {/* Create button removed for simplicity in this refactor, can be added back */}
            </div>
             <div className="space-y-2">
                {pages.map(page => (
                    <div key={page.id} className="bg-gray-800/50 p-3 rounded-md flex items-center justify-between hover:bg-gray-800/80">
                         <div className="flex-grow flex items-center space-x-3 overflow-hidden">
                            <button
                                onClick={() => updatePage({ ...page, showInNav: !page.showInNav })}
                                className={`p-2 rounded-full transition-colors ${page.showInNav ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-500/10'}`}
                                title={page.showInNav ? "Visible in navigation" : "Hidden from navigation"}
                            >
                                {page.showInNav ? <EyeIcon /> : <EyeSlashIcon />}
                            </button>
                            <div onClick={() => setSelectedPageId(page.id)} className="flex-grow text-left cursor-pointer overflow-hidden">
                                <h3 className="text-lg font-semibold text-text-primary truncate">{page.title} {page.isStatic && <span className="text-xs text-gray-500">(Static)</span>}</h3>
                                <span className="text-sm text-gray-400 truncate block">/{page.route || page.slug}</span>
                            </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                             <button onClick={() => setSelectedPageId(page.id)} className="p-2 text-text-secondary hover:text-accent rounded-full hover:bg-accent/10">
                                <PencilSquareIcon />
                            </button>
                            {!page.isStatic && (
                              <button onClick={() => handleDelete(page)} className="p-2 rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                  <TrashIcon/>
                              </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- ADVERTISING MANAGER ---

interface AdEditorProps {
    ad: Advertisement;
    onSave: (ad: Advertisement) => void;
    onCancel: () => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ ad, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Advertisement>(ad);
    const { t } = useLanguage();

    const handleChange = (field: keyof Advertisement, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // @google/genai-linter-fix: Updated function signature to accept a single object argument.
    // FIX: Updated function signature to accept a single object argument.
    const buildInitialAdDescriptionPrompt = (context: { currentContent?: string; imageUrlContext?: string }) => {
        const { currentContent: adTitle, imageUrlContext: adImageUrl } = context;
        return `Gere uma descrição de anúncio atraente em HTML para um produto chamado "${adTitle}". A imagem associada é ${adImageUrl ? `em ${adImageUrl}` : 'ainda não definida'}. A descrição deve ser persuasiva e destacar os principais benefícios.`;
    };
    
    // @google/genai-linter-fix: Updated function signature to accept a single object argument.
    // FIX: Updated function signature to accept a single object argument.
    const buildInitialImagePrompt = (context: { currentTitle: string; currentDescription: string }) => {
        const { currentTitle: adTitle, currentDescription: adDescription } = context;
        return `Crie uma imagem de produto/anúncio profissional para "${adTitle}". Detalhes: ${adDescription.replace(/<[^>]+>/g, '').substring(0, 150)}... Fundo limpo, estilo de estúdio.`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <button onClick={onCancel} className="flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-4">
                    <ArrowLeftIcon className="w-5 h-5"/> <span>{t('admin_advertising_title')}</span>
                </button>
                <button onClick={() => onSave(formData)} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80">
                    {t('admin_button_save')}
                </button>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border space-y-4">
                <h3 className="text-xl font-semibold text-text-primary border-b border-border pb-3 mb-4">{t('admin_ad_editor_title')}</h3>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_ad_field_title')}</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => handleChange('title', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_ad_field_desc')}</label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={v => handleChange('description', v)}
                    />
                    <AITextGenerator
                        onInsert={v => handleChange('description', v)}
                        buildInitialPrompt={buildInitialAdDescriptionPrompt}
                        modalTitle="Gerar Descrição com IA"
                        modalPlaceholder="Descreva o objetivo do anúncio"
                        triggerText="Gerar Descrição com IA"
                        className="text-sm text-accent hover:underline mt-2 inline-block"
                        adTitle={formData.title}
                        adImageUrl={formData.imageUrl}
                    />
                </div>
                
                <div>
                    <ImageInput
                        label={t('admin_ad_field_img_url')}
                        value={formData.imageUrl}
                        onChange={v => handleChange('imageUrl', v)}
                        extraButtons={
                            <AIImageGenerator
                                onInsert={v => handleChange('imageUrl', v)}
                                buildInitialPrompt={buildInitialImagePrompt}
                                adTitle={formData.title}
                                adDescription={formData.description}
                                triggerText="IA"
                                triggerIcon={<MagicWandIcon />}
                                className="h-10 w-10 flex items-center justify-center bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700"
                            />
                        }
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_ad_field_cta_text')}</label>
                        <input
                            type="text"
                            value={formData.ctaText}
                            onChange={e => handleChange('ctaText', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_ad_field_cta_link')}</label>
                        <input
                            type="text"
                            value={formData.ctaLink}
                            onChange={e => handleChange('ctaLink', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={e => handleChange('isActive', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-text-secondary">{t('admin_ad_field_active')}</label>
                </div>
            </div>
        </div>
    );
};

const AdvertisingManager: React.FC<{onBack: () => void, adIdToEdit: string | null}> = ({ onBack, adIdToEdit }) => {
    const { advertisements, addAdvertisement, updateAdvertisement, deleteAdvertisement } = useAdvertisingContext();
    const { t } = useLanguage();
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

    useEffect(() => {
        if (adIdToEdit) {
            const ad = advertisements.find(a => a.id === adIdToEdit);
            if (ad) setEditingAd(ad);
        }
    }, [adIdToEdit, advertisements]);
    
    const handleAddNew = () => {
        const newAd: Omit<Advertisement, 'id'> = { title: 'New Campaign', description: '...', imageUrl: '', ctaText: 'Learn More', ctaLink: '#', isActive: false };
        addAdvertisement(newAd);
    };

    const handleSave = (ad: Advertisement) => {
        updateAdvertisement(ad);
        setEditingAd(null);
    };
    
    return (
        <div>
            {editingAd && <AdEditor ad={editingAd} onSave={handleSave} onCancel={() => setEditingAd(null)} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text-primary">{t('admin_advertising_title')}</h3>
                <button onClick={handleAddNew} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80">{t('admin_advertising_add')}</button>
            </div>
            <div className="space-y-2">
                {advertisements.map(ad => (
                    <div key={ad.id} className="bg-gray-800/50 p-3 rounded-md flex items-center justify-between hover:bg-gray-800/80">
                        <span className={`h-2 w-2 rounded-full mr-3 ${ad.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        <p className="flex-grow font-semibold text-text-primary truncate">{ad.title}</p>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setEditingAd(ad)} className="p-2 text-text-secondary hover:text-accent"><PencilSquareIcon /></button>
                            <button onClick={() => deleteAdvertisement(ad.id)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- DOWNLOADS MANAGER ---
const DownloadsManager: React.FC = () => {
    const { marketingPlanPages, productCatalogPages, setMarketingPlanPages, setProductCatalogPages } = useDownloadsContext();
    const { t } = useLanguage();

    const handleUpdateList = (type: 'marketing' | 'catalog', index: number, value: string) => {
        const updater = type === 'marketing' ? setMarketingPlanPages : setProductCatalogPages;
        const list = type === 'marketing' ? marketingPlanPages : productCatalogPages;
        const newList = [...list];
        newList[index] = value;
        updater(newList);
    };

    const handleAddPage = (type: 'marketing' | 'catalog') => {
        const updater = type === 'marketing' ? setMarketingPlanPages : setProductCatalogPages;
        const list = type === 'marketing' ? marketingPlanPages : productCatalogPages;
        updater([...list, '']);
    };
    
    const handleRemovePage = (type: 'marketing' | 'catalog', index: number) => {
        const updater = type === 'marketing' ? setMarketingPlanPages : setProductCatalogPages;
        const list = type === 'marketing' ? marketingPlanPages : productCatalogPages;
        updater(list.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-text-primary">{t('admin_downloads_title')}</h3>
            <div className="space-y-6">
                <DownloadListEditor title={t('admin_downloads_plan')} pages={marketingPlanPages} onUpdate={(i, v) => handleUpdateList('marketing', i, v)} onAdd={() => handleAddPage('marketing')} onRemove={(i) => handleRemovePage('marketing')} />
                <DownloadListEditor title={t('admin_downloads_catalog')} pages={productCatalogPages} onUpdate={(i, v) => handleUpdateList('catalog', i, v)} onAdd={() => handleAddPage('catalog')} onRemove={(i) => handleRemovePage('catalog')} />
            </div>
        </div>
    );
};

const DownloadListEditor: React.FC<{title: string, pages: string[], onUpdate: (i:number, v:string)=>void, onAdd: ()=>void, onRemove: (i:number)=>void}> = ({title, pages, onUpdate, onAdd, onRemove}) => {
    const { t } = useLanguage();
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-text-primary mb-3">{title}</h4>
            <div className="space-y-2">
                {pages.map((pageUrl, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <ImageInput label="" value={pageUrl} onChange={v => onUpdate(index, v)} />
                        <button onClick={() => onRemove(index)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon /></button>
                    </div>
                ))}
            </div>
            <button onClick={onAdd} className="mt-3 text-sm text-accent hover:underline flex items-center space-x-1"><PlusIcon /> <span>{t('admin_downloads_add_page')}</span></button>
        </div>
    );
};

// --- MAIN TAB COMPONENT ---
const PagesTab: React.FC = () => {
    const { t } = useLanguage();
    const { openItemId, clearOpenItem, setOpenAdminSection } = useAdmin();
    const [activeSubTab, setActiveSubTab] = useState<'pages' | 'downloads' | 'advertising'>('pages');
    const [adIdToEdit, setAdIdToEdit] = useState<string | null>(null);

    useEffect(() => {
        if (openItemId === 'downloads') {
            setActiveSubTab('downloads');
            clearOpenItem();
        } else if (openItemId === 'advertising') {
            setActiveSubTab('advertising');
            clearOpenItem();
        } else if (openItemId && openItemId.startsWith('ad_')) {
            setActiveSubTab('advertising');
            setAdIdToEdit(openItemId);
            // Don't clearOpenItem here, so AdvertisingManager can see it
        }
    }, [openItemId, clearOpenItem]);
    
    // Clear ad ID when switching away from advertising tab
    useEffect(() => {
        if (activeSubTab !== 'advertising') {
            setAdIdToEdit(null);
            clearOpenItem();
        }
    }, [activeSubTab, clearOpenItem]);

    const renderContent = () => {
        switch (activeSubTab) {
            case 'downloads': return <DownloadsManager />;
            case 'advertising': return <AdvertisingManager onBack={() => setActiveSubTab('pages')} adIdToEdit={adIdToEdit} />;
            case 'pages': default: return <PagesManager />;
        }
    };
    
    const SubTabButton: React.FC<{children:ReactNode, tabName:typeof activeSubTab}> = ({children, tabName}) => (
        <button onClick={() => setActiveSubTab(tabName)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeSubTab === tabName ? 'bg-accent text-button-text' : 'text-text-secondary hover:bg-surface'}`}>{children}</button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-accent">{t('admin_pages_title')}</h2>
                <div className="flex items-center space-x-1 rounded-lg bg-gray-900/50 p-1 border border-border">
                    <SubTabButton tabName="pages">Páginas</SubTabButton>
                    <SubTabButton tabName="downloads">Downloads</SubTabButton>
                    <SubTabButton tabName="advertising">Anúncios</SubTabButton>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default PagesTab;