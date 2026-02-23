
import React, { useState, useRef } from 'react';
import { BioSite, Section, BlockType, SocialPlatform, SeoConfig, Theme, TrackingPixels, FaqItem, BentoItem, CarouselItem } from '../types';
import { Renderer } from './Renderer';
import {
    Layout, Type, Image as ImageIcon, Link as LinkIcon,
    Trash2, MoveUp, MoveDown, Smartphone, Globe, Save,
    Settings, ChevronLeft, Moon, Sun, Plus, Share2, Layers, Search, Upload, X, ShoppingBag, Video, RectangleHorizontal, Palette, Type as TypeIcon, MessageCircle, Lock, MousePointer2, ChevronDown, ChevronRight, Minus, MoveVertical, ArrowUpDown, Loader2, MapPin, Timer, HelpCircle, Mail, Map as MapIcon, Calendar as CalendarIcon, Grid, GalleryHorizontal, Eye, Droplet, Hash
} from 'lucide-react';
const COMMON_BUTTON_LABELS = [
    'WhatsApp', 'Instagram', 'Link Oficial', 'Nossa Loja', 'Portfólio',
    'Fale Conosco', 'Agendar Horário', 'Localização', 'Catálogo', 'Facebook',
    'LinkedIn', 'YouTube', 'TikTok', 'Telegram', 'E-mail', 'Promoções',
    'Baixar App', 'Curso Online', 'Canal VIP', 'X / Twitter'
];

interface EditorProps {
    site: BioSite;
    onSave: (site: BioSite) => void;
    onBack: () => void;
    toggleTheme: () => void;
    isDarkMode: boolean;
}

export const Editor: React.FC<EditorProps> = ({ site, onSave, onBack, toggleTheme, isDarkMode }) => {
    const [currentSite, setCurrentSite] = useState<BioSite>(site);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'build' | 'settings' | 'design'>('build');
    const [isSaving, setIsSaving] = useState(false);

    // Preview Mode State: 'mobile' | 'desktop'
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

    // Settings Accordion State for UI organization
    const [settingsSection, setSettingsSection] = useState<'seo' | 'tracking' | 'general'>('seo');

    // Local state for adding new social links
    const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('instagram');
    const [newSocialUrl, setNewSocialUrl] = useState('');

    // -- Image Upload Logic --
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeUploadCallback, setActiveUploadCallback] = useState<((url: string) => void) | null>(null);

    const handleUploadClick = (callback: (url: string) => void) => {
        setActiveUploadCallback(() => callback);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && activeUploadCallback) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    activeUploadCallback(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input so same file can be selected again if needed
        if (event.target) event.target.value = '';
    };

    // -- Actions --

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 600));

        onSave(currentSite);

        setIsSaving(false);
        alert('Alterações salvas com sucesso!');
    };

    const addSection = (type: BlockType) => {
        // -- FREE PLAN RESTRICTIONS LOGIC --
        if (currentSite.plan === 'free') {
            const ALLOWED_FREE = ['hero', 'text', 'button', 'image-text'];

            // 1. Check Block Type
            if (!ALLOWED_FREE.includes(type)) {
                alert("Recurso exclusivo do plano PRO. Faça upgrade para desbloquear Carrosséis, Bento Grids, Vídeos e muito mais.");
                return;
            }

            // 2. Check Quantity (Hero + 3 Items = 4 Total Sections)
            if (currentSite.sections.length >= 4) {
                alert("Limite do plano Grátis atingido (Max: 3 blocos de conteúdo). Faça upgrade para adicionar itens ilimitados.");
                return;
            }
        }

        const newSection: Section = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: {
                title: type === 'hero' ? 'Novo Título' : type === 'text' ? 'Título da Seção' : type === 'product' ? 'Nome do Produto' : type === 'image-text' ? 'Título do Item' : type === 'video' ? 'Título do Vídeo' : type === 'countdown' ? 'Grande Lançamento' : type === 'faq' ? 'Perguntas Frequentes' : type === 'newsletter' ? 'Inscreva-se na Newsletter' : undefined,
                subtitle: type === 'hero' ? 'Seu subtítulo aqui' : type === 'text' ? 'Escreva seu texto aqui...' : type === 'product' ? 'Descrição incrível do seu produto.' : type === 'image-text' ? 'Descrição breve do item com imagem.' : type === 'video' ? 'Descrição sobre o vídeo.' : type === 'newsletter' ? 'Receba novidades exclusivas toda semana.' : type === 'countdown' ? 'Faltam poucos dias!' : undefined,
                label: type === 'button' ? 'Clique Aqui' : type === 'product' ? 'Comprar Agora' : type === 'whatsapp' ? 'Chamar no WhatsApp' : undefined,
                url: type === 'button' ? 'https://' : type === 'product' ? 'https://' : type === 'video' ? '' : undefined,
                price: type === 'product' ? 'R$ 97,00' : undefined,
                items: type === 'gallery' ? ['https://picsum.photos/300/300', 'https://picsum.photos/301/301'] : undefined,
                socialLinks: type === 'social' ? [
                    { platform: 'instagram', url: 'https://instagram.com' },
                    { platform: 'whatsapp', url: 'https://wa.me/' }
                ] : undefined,
                imageSrc: type === 'image-text' ? 'https://picsum.photos/200' : undefined,
                whatsappNumber: type === 'whatsapp' ? '5511999999999' : undefined,
                whatsappMessage: type === 'whatsapp' ? 'Olá! Gostaria de mais informações.' : undefined,

                // Default content for new blocks
                mapAddress: type === 'map' ? 'Av. Paulista, 1000, São Paulo' : undefined,
                targetDate: type === 'countdown' ? new Date(Date.now() + 86400000 * 3).toISOString() : undefined, // 3 days from now
                faqItems: type === 'faq' ? [
                    { question: 'Como faço para comprar?', answer: 'Basta clicar no botão comprar e seguir o checkout.' },
                    { question: 'Qual o prazo de entrega?', answer: 'O acesso é imediato após a confirmação.' }
                ] : undefined,
                placeholderText: type === 'newsletter' ? 'Seu melhor e-mail' : undefined,
                buttonText: type === 'newsletter' ? 'Cadastrar' : undefined,

                // Bento Default
                bentoItems: type === 'bento' ? [
                    { type: 'text', title: 'Sobre Mim', subtitle: 'Saiba mais', url: '#' },
                    { type: 'image', imageSrc: 'https://picsum.photos/200', url: '#' }
                ] : undefined,

                // Carousel Default
                carouselItems: type === 'carousel' ? [
                    { imageSrc: 'https://picsum.photos/300/400', title: 'Projeto 1', url: '#' },
                    { imageSrc: 'https://picsum.photos/301/400', title: 'Projeto 2', url: '#' },
                    { imageSrc: 'https://picsum.photos/302/400', title: 'Projeto 3', url: '#' }
                ] : undefined
            },
            style: {
                textAlign: 'center',
                backgroundType: 'color', // Default
                overlayOpacity: 0.4,
                backgroundColor: type === 'whatsapp' ? '#25D366' : type === 'divider' ? currentSite.theme.primaryColor : undefined,
                textColor: type === 'whatsapp' ? '#FFFFFF' : undefined,
                // Spacer defaults
                height: type === 'spacer' ? '50px' : undefined,
                // Divider defaults
                dividerWidth: type === 'divider' ? '100%' : undefined,
                dividerThickness: type === 'divider' ? '1px' : undefined,
            }
        };

        // Default left alignment for text & image-text blocks
        if (type === 'text' || type === 'image-text') {
            newSection.style.textAlign = 'left';
        }

        setCurrentSite(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        setSelectedSectionId(newSection.id);
    };

    const updateSection = (id: string, updates: Partial<Section['content']> | Partial<Section['style']>, isStyle = false) => {
        setCurrentSite(prev => ({
            ...prev,
            sections: prev.sections.map(sec => {
                if (sec.id !== id) return sec;
                if (isStyle) {
                    return { ...sec, style: { ...sec.style, ...updates } };
                }
                return { ...sec, content: { ...sec.content, ...updates } };
            })
        }));
    };

    const updateTheme = (updates: Partial<Theme>) => {
        setCurrentSite(prev => ({
            ...prev,
            theme: { ...prev.theme, ...updates }
        }));
    };

    const updateSeo = (field: keyof SeoConfig, value: string) => {
        setCurrentSite(prev => ({
            ...prev,
            seo: {
                ...prev.seo,
                [field]: value
            }
        }));
    };

    const updateTracking = (field: keyof TrackingPixels, value: string) => {
        // Ensure tracking object exists
        const currentTracking = currentSite.tracking || {};
        setCurrentSite(prev => ({
            ...prev,
            tracking: {
                ...currentTracking,
                [field]: value
            }
        }));
    };

    const deleteSection = (id: string) => {
        setCurrentSite(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id)
        }));
        setSelectedSectionId(null);
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...currentSite.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setCurrentSite(prev => ({ ...prev, sections: newSections }));
    };

    const addSocialLink = (sectionId: string) => {
        if (!newSocialUrl) return;
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.socialLinks) return;

        const updatedLinks = [...section.content.socialLinks, { platform: newSocialPlatform, url: newSocialUrl }];
        updateSection(sectionId, { socialLinks: updatedLinks });
        setNewSocialUrl('');
    };

    const removeSocialLink = (sectionId: string, index: number) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.socialLinks) return;

        const updatedLinks = section.content.socialLinks.filter((_, idx) => idx !== index);
        updateSection(sectionId, { socialLinks: updatedLinks });
    };

    const addFaqItem = (sectionId: string) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section) return;

        const currentItems = section.content.faqItems || [];
        const newItems = [...currentItems, { question: 'Nova Pergunta', answer: 'Sua resposta aqui.' }];
        updateSection(sectionId, { faqItems: newItems });
    };

    const updateFaqItem = (sectionId: string, index: number, field: keyof FaqItem, value: string) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.faqItems) return;

        const newItems = [...section.content.faqItems];
        newItems[index] = { ...newItems[index], [field]: value };
        updateSection(sectionId, { faqItems: newItems });
    };

    const removeFaqItem = (sectionId: string, index: number) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.faqItems) return;

        const newItems = section.content.faqItems.filter((_, idx) => idx !== index);
        updateSection(sectionId, { faqItems: newItems });
    };

    const addBentoItem = (sectionId: string) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section) return;

        const currentItems = section.content.bentoItems || [];
        const newItem: BentoItem = { type: 'image', title: 'Novo Item', subtitle: 'Ver mais', imageSrc: 'https://picsum.photos/400/300' };
        updateSection(sectionId, { bentoItems: [...currentItems, newItem] });
    };

    const updateBentoItem = (sectionId: string, index: number, updates: Partial<BentoItem>) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.bentoItems) return;

        const newItems = [...section.content.bentoItems];
        newItems[index] = { ...newItems[index], ...updates };
        updateSection(sectionId, { bentoItems: newItems });
    };

    const removeBentoItem = (sectionId: string, index: number) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.bentoItems) return;

        const newItems = section.content.bentoItems.filter((_, idx) => idx !== index);
        updateSection(sectionId, { bentoItems: newItems });
    };

    const addCarouselItem = (sectionId: string) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section) return;

        const currentItems = section.content.carouselItems || [];
        const newItem: CarouselItem = { imageSrc: 'https://picsum.photos/400/500', title: 'Novo Slide', url: '#' };
        updateSection(sectionId, { carouselItems: [...currentItems, newItem] });
    };

    const updateCarouselItem = (sectionId: string, index: number, updates: Partial<CarouselItem>) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.carouselItems) return;

        const newItems = [...section.content.carouselItems];
        newItems[index] = { ...newItems[index], ...updates };
        updateSection(sectionId, { carouselItems: newItems });
    };

    const removeCarouselItem = (sectionId: string, index: number) => {
        const section = currentSite.sections.find(s => s.id === sectionId);
        if (!section || !section.content.carouselItems) return;

        const newItems = section.content.carouselItems.filter((_, idx) => idx !== index);
        updateSection(sectionId, { carouselItems: newItems });
    };

    // -- Render Components --

    const renderSidebarContent = () => {
        if (sidebarTab === 'settings') {
            const isProOrAgency = currentSite.plan === 'pro' || currentSite.plan === 'agency';

            return (
                <div className="space-y-6 animate-fade-in p-2">
                    {/* SEO Section */}
                    <div className="border border-gray-200 dark:border-rs-gray rounded-lg overflow-hidden">
                        <button
                            onClick={() => setSettingsSection(settingsSection === 'seo' ? 'general' : 'seo')}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                            <span className="flex items-center gap-2"><Globe size={16} /> SEO & Metadados</span>
                            <ChevronDown size={16} className={`transition-transform ${settingsSection === 'seo' ? 'rotate-180' : ''}`} />
                        </button>

                        {settingsSection === 'seo' && (
                            <div className="p-4 space-y-4 bg-white dark:bg-rs-black">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Título da Página (Meta Title)</label>
                                    <input
                                        type="text"
                                        value={currentSite.seo.title}
                                        onChange={(e) => updateSeo('title', e.target.value)}
                                        placeholder="Ex: João Silva | Consultor"
                                        className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Descrição (Meta Description)</label>
                                    <textarea
                                        rows={4}
                                        value={currentSite.seo.description}
                                        onChange={(e) => updateSeo('description', e.target.value)}
                                        placeholder="Uma breve descrição sobre você ou seu negócio..."
                                        className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Imagem de Compartilhamento (OG Image)</label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={currentSite.seo.image}
                                                onChange={(e) => updateSeo('image', e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs"
                                            />
                                            <button
                                                onClick={() => handleUploadClick((url) => updateSeo('image', url))}
                                                className="bg-gray-200 dark:bg-rs-gray hover:bg-rs-goldDark dark:hover:bg-rs-gold hover:text-white p-2 rounded transition-colors"
                                            >
                                                <Upload size={16} />
                                            </button>
                                        </div>
                                        {currentSite.seo.image && (
                                            <div className="relative rounded overflow-hidden border border-gray-200 dark:border-rs-gray h-32 group">
                                                <img src={currentSite.seo.image} alt="Preview OG" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tracking Pixels Section (RESTORED) */}
                    <div className="border border-gray-200 dark:border-rs-gray rounded-lg overflow-hidden">
                        <button
                            onClick={() => setSettingsSection(settingsSection === 'tracking' ? 'general' : 'tracking')}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                            <span className="flex items-center gap-2"><MousePointer2 size={16} /> Pixels de Rastreamento</span>
                            <ChevronDown size={16} className={`transition-transform ${settingsSection === 'tracking' ? 'rotate-180' : ''}`} />
                        </button>

                        {settingsSection === 'tracking' && (
                            <div className="p-4 space-y-4 bg-white dark:bg-rs-black">
                                {!isProOrAgency && (
                                    <div className="p-3 bg-rs-gold/10 border border-rs-gold/30 rounded text-xs text-rs-goldDark dark:text-rs-gold mb-4 flex items-center gap-2">
                                        <Lock size={12} /> Disponível apenas nos planos Pro e Agency.
                                    </div>
                                )}

                                <div className={!isProOrAgency ? 'opacity-50 pointer-events-none' : ''}>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Facebook Pixel ID</label>
                                        <input
                                            type="text"
                                            value={currentSite.tracking?.metaPixelId || ''}
                                            onChange={(e) => updateTracking('metaPixelId', e.target.value)}
                                            placeholder="Ex: 1234567890"
                                            className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-xs font-mono"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Google Analytics (G-XXXX)</label>
                                        <input
                                            type="text"
                                            value={currentSite.tracking?.googleAnalyticsId || ''}
                                            onChange={(e) => updateTracking('googleAnalyticsId', e.target.value)}
                                            placeholder="Ex: G-A1B2C3D4"
                                            className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-xs font-mono"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Google Ads ID (AW-XXXX)</label>
                                        <input
                                            type="text"
                                            value={currentSite.tracking?.googleAdsId || ''}
                                            onChange={(e) => updateTracking('googleAdsId', e.target.value)}
                                            placeholder="Ex: AW-123456789"
                                            className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-xs font-mono"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">TikTok Pixel ID</label>
                                        <input
                                            type="text"
                                            value={currentSite.tracking?.tiktokPixelId || ''}
                                            onChange={(e) => updateTracking('tiktokPixelId', e.target.value)}
                                            placeholder="Ex: C1D2E3F4G5"
                                            className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (sidebarTab === 'design') {
            return (
                <div className="space-y-6 animate-fade-in p-2">
                    <div>
                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase mb-3 tracking-widest flex items-center gap-2">
                            <Palette size={14} />
                            Estilo Global
                        </h4>

                        {/* Background Selection */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Tipo de Fundo</label>
                            <div className="flex bg-gray-200 dark:bg-black rounded p-1 mb-4">
                                {['color', 'image', 'video'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => updateTheme({ backgroundType: type as any })}
                                        className={`flex-1 text-[10px] font-bold uppercase py-1.5 rounded transition-all ${(currentSite.theme.backgroundType || 'color') === type
                                            ? 'bg-white dark:bg-rs-gray text-black dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {type === 'color' ? 'Cor' : type === 'image' ? 'Imagem' : 'Vídeo'}
                                    </button>
                                ))}
                            </div>

                            {/* Background Inputs */}
                            {currentSite.theme.backgroundType === 'color' && (
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={currentSite.theme.backgroundColor}
                                        onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentSite.theme.backgroundColor}
                                        onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                                        className="flex-1 bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-xs uppercase font-mono"
                                    />
                                </div>
                            )}

                            {currentSite.theme.backgroundType === 'image' && (
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => handleUploadClick((url) => updateTheme({ backgroundImage: url }))}
                                        className="w-full py-2 bg-gray-200 dark:bg-white/10 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-rs-gold hover:text-black transition-colors"
                                    >
                                        <Upload size={14} /> Upload Imagem de Fundo
                                    </button>
                                </div>
                            )}

                            {currentSite.theme.backgroundType === 'video' && (
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => handleUploadClick((url) => updateTheme({ backgroundVideo: url }))}
                                        className="w-full py-2 bg-gray-200 dark:bg-white/10 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-rs-gold hover:text-black transition-colors"
                                    >
                                        <Upload size={14} /> Carregar Vídeo de Fundo
                                    </button>
                                </div>
                            )}

                            {(currentSite.theme.backgroundType === 'image' || currentSite.theme.backgroundType === 'video') && (
                                <div className="mt-3">
                                    <div className="flex justify-between mb-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Sobreposição Escura</label>
                                        <span className="text-xs font-mono text-gray-400">{Math.round((currentSite.theme.backgroundOverlayOpacity || 0) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={currentSite.theme.backgroundOverlayOpacity || 0}
                                        onChange={(e) => updateTheme({ backgroundOverlayOpacity: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-gray-300 dark:bg-rs-gray rounded-lg appearance-none cursor-pointer accent-rs-gold"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Font Selection */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Tipografia</label>
                            <select
                                value={currentSite.theme.fontFamily}
                                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                                className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-sm outline-none focus:border-rs-gold"
                            >
                                <option value="Inter">Inter (Padrão)</option>
                                <option value="Playfair Display">Playfair Display (Serifa)</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Lato">Lato</option>
                            </select>
                        </div>

                        {/* Color Palette */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Paleta de Cores</label>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Cor Principal (Destaque)</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={currentSite.theme.primaryColor}
                                            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                            className="w-20 bg-transparent text-right text-xs font-mono border-b border-gray-300 dark:border-gray-700 focus:border-rs-gold outline-none"
                                        />
                                        <input
                                            type="color"
                                            value={currentSite.theme.primaryColor}
                                            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Cor Secundária (Blocos)</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={currentSite.theme.secondaryColor}
                                            onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                                            className="w-20 bg-transparent text-right text-xs font-mono border-b border-gray-300 dark:border-gray-700 focus:border-rs-gold outline-none"
                                        />
                                        <input
                                            type="color"
                                            value={currentSite.theme.secondaryColor}
                                            onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 dark:text-gray-300">Cor do Texto</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={currentSite.theme.textColor}
                                            onChange={(e) => updateTheme({ textColor: e.target.value })}
                                            className="w-20 bg-transparent text-right text-xs font-mono border-b border-gray-300 dark:border-gray-700 focus:border-rs-gold outline-none"
                                        />
                                        <input
                                            type="color"
                                            value={currentSite.theme.textColor}
                                            onChange={(e) => updateTheme({ textColor: e.target.value })}
                                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default 'build' tab
        const isFree = currentSite.plan === 'free';
        const PRO_LOCK = <Lock size={12} className="ml-1 text-rs-gold" />;

        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h4 className="hidden md:block text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase mb-3 tracking-widest">Adicionar Blocos</h4>

                    {/* Essential Blocks (Free & Pro) */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <BlockButton icon={<Layout />} label="Capa" onClick={() => addSection('hero')} />
                        <BlockButton icon={<LinkIcon />} label="Botão" onClick={() => addSection('button')} />
                        <BlockButton icon={<Type />} label="Texto" onClick={() => addSection('text')} />
                        <BlockButton icon={<RectangleHorizontal />} label="Foto+Texto" onClick={() => addSection('image-text')} />
                    </div>

                    {/* Pro Blocks */}
                    <h4 className="hidden md:block text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase mb-3 tracking-widest flex items-center">
                        Avançado {isFree && PRO_LOCK}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 opacity-90">
                        <BlockButton icon={<Grid />} label="Mosaico" onClick={() => addSection('bento')} locked={isFree} />
                        <BlockButton icon={<GalleryHorizontal />} label="Carrossel" onClick={() => addSection('carousel')} locked={isFree} />
                        <BlockButton icon={<ShoppingBag />} label="Produto" onClick={() => addSection('product')} locked={isFree} />
                        <BlockButton icon={<MessageCircle />} label="WhatsApp" onClick={() => addSection('whatsapp')} locked={isFree} />

                        <BlockButton icon={<Timer />} label="Contagem" onClick={() => addSection('countdown')} locked={isFree} />
                        <BlockButton icon={<HelpCircle />} label="FAQ" onClick={() => addSection('faq')} locked={isFree} />
                        <BlockButton icon={<MapIcon />} label="Mapa" onClick={() => addSection('map')} locked={isFree} />
                        <BlockButton icon={<Mail />} label="Newsletter" onClick={() => addSection('newsletter')} locked={isFree} />

                        <BlockButton icon={<Video />} label="Vídeo" onClick={() => addSection('video')} locked={isFree} />
                        <BlockButton icon={<ImageIcon />} label="Galeria" onClick={() => addSection('gallery')} locked={isFree} />
                        <BlockButton icon={<Share2 />} label="Redes" onClick={() => addSection('social')} locked={isFree} />
                        <BlockButton icon={<Minus />} label="Linha" onClick={() => addSection('divider')} locked={isFree} />
                        <BlockButton icon={<ArrowUpDown />} label="Espaço" onClick={() => addSection('spacer')} locked={isFree} />
                    </div>
                </div>

                {/* Layer Management (Simplified DnD) */}
                <div className="hidden md:block">
                    <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase mb-3 tracking-widest">Camadas</h4>
                    <div className="space-y-2">
                        {currentSite.sections.map((sec, idx) => (
                            <div
                                key={sec.id}
                                onClick={() => setSelectedSectionId(sec.id)}
                                className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${selectedSectionId === sec.id ? 'border-rs-goldDark bg-rs-goldLight/20 dark:border-rs-gold dark:bg-rs-gold/10 text-black dark:text-white' : 'border-gray-200 dark:border-rs-gray hover:bg-gray-100 dark:hover:bg-rs-gray/50 text-gray-600 dark:text-gray-300'}`}
                            >
                                <span className="text-xs truncate max-w-[100px]">{sec.type.toUpperCase()}</span>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 'up'); }} className="p-1 hover:text-rs-goldDark dark:hover:text-rs-gold disabled:opacity-30" disabled={idx === 0}><MoveUp size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 'down'); }} className="p-1 hover:text-rs-goldDark dark:hover:text-rs-gold disabled:opacity-30" disabled={idx === currentSite.sections.length - 1}><MoveDown size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPropertiesPanel = () => {
        const section = currentSite.sections.find(s => s.id === selectedSectionId);

        if (!section) {
            return (
                <div className="p-6 text-center opacity-40 flex flex-col items-center">
                    <Settings size={48} className="mb-4 text-rs-goldDark dark:text-rs-gold" />
                    <p className="text-gray-500 dark:text-gray-400">Selecione um bloco no preview para editar suas propriedades.</p>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-6 animate-fade-in text-gray-800 dark:text-white">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-rs-gray pb-4">
                    <h3 className="font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-wider text-sm">Editar {section.type}</h3>
                    <button onClick={() => deleteSection(section.id)} className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Dynamic Inputs based on block type */}
                <div className="space-y-4">

                    {/* COMMON FIELDS: Title/Subtitle (Available in most blocks) */}
                    {['hero', 'text', 'image-text', 'video', 'product', 'newsletter', 'faq', 'countdown'].includes(section.type) && (
                        <React.Fragment>
                            {/* Specific Image Inputs for Hero/Product/Image-Text */}
                            {(section.type === 'hero' || section.type === 'product' || section.type === 'image-text') && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                        {section.type === 'hero' ? 'Foto de Perfil' : 'Imagem'}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded overflow-hidden border border-gray-300 dark:border-rs-gray bg-gray-100 dark:bg-rs-black">
                                            <img src={section.content.imageSrc || 'https://via.placeholder.com/100'} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <button
                                            onClick={() => handleUploadClick((url) => updateSection(section.id, { imageSrc: url }))}
                                            className="px-3 py-1.5 bg-gray-200 dark:bg-rs-gray hover:bg-rs-goldDark dark:hover:bg-rs-gold text-black dark:text-white hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-2"
                                        >
                                            <Upload size={14} />
                                            Carregar
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Título</label>
                                <input
                                    type="text"
                                    value={section.content.title || ''}
                                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                    {section.type === 'newsletter' ? 'Subtítulo / Chamada' : 'Subtítulo / Descrição'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={section.content.subtitle || ''}
                                    onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                />
                            </div>
                        </React.Fragment>)}
                    {/* BLOCK SPECIFIC: PRODUCT */}
                    {/* BLOCK SPECIFIC: PRODUCT */}
                    {section.type === 'product' && (<React.Fragment>
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço Atual</label>
                                    <input
                                        type="text"
                                        value={section.content.price || ''}
                                        onChange={(e) => updateSection(section.id, { price: e.target.value })}
                                        placeholder="R$ 97,00"
                                        className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço Antigo</label>
                                    <input
                                        type="text"
                                        value={section.content.oldPrice || ''}
                                        onChange={(e) => updateSection(section.id, { oldPrice: e.target.value })}
                                        placeholder="R$ 197,00"
                                        className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs opacity-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Texto do Botão de Compra</label>
                                <input
                                    type="text"
                                    value={section.content.label || ''}
                                    onChange={(e) => updateSection(section.id, { label: e.target.value })}
                                    placeholder="COMPRAR AGORA"
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Link de Compra (URL)</label>
                                <input
                                    type="text"
                                    value={section.content.url || ''}
                                    onChange={(e) => updateSection(section.id, { url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none font-mono text-xs"
                                />
                            </div>
                        </div>

                        {/* CHECKOUT FEATURE */}
                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                            <label className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase cursor-pointer mb-2">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-rs-gold" />
                                    <span>Ativar Checkout (Perfil Completo)</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={section.content.checkoutEnabled || false}
                                    onChange={(e) => updateSection(section.id, { checkoutEnabled: e.target.checked })}
                                    className="w-4 h-4 accent-rs-gold rounded"
                                />
                            </label>
                            {section.content.checkoutEnabled && (
                                <p className="text-[10px] text-gray-400 leading-relaxed bg-rs-gold/5 p-2 rounded border border-rs-gold/20">
                                    <Lock size={10} className="inline mr-1" />
                                    O usuário precisará preencher Nome, CPF, Endereço e Telefone antes de prosseguir. Ideal para dropshipping e vendas diretas.
                                </p>
                            )}
                        </div>
                    </React.Fragment>)}

                    {/* BLOCK SPECIFIC: BUTTON */}
                    {section.type === 'button' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Texto do Botão</label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={section.content.label || ''}
                                        onChange={(e) => updateSection(section.id, { label: e.target.value })}
                                        className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                    />
                                    <button
                                        onClick={() => setShowSuggestions(!showSuggestions)}
                                        className="text-[10px] font-bold text-rs-gold uppercase flex items-center gap-1 hover:underline"
                                    >
                                        <HelpCircle size={12} /> {showSuggestions ? 'Esconder Sugestões' : 'Ver Sugestões de Nomes'}
                                    </button>
                                </div>
                            </div>

                            {/* Suggestions Dropdown/List */}
                            {showSuggestions && (
                                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-rs-gray animate-fade-in shadow-inner max-h-40 overflow-y-auto">
                                    {COMMON_BUTTON_LABELS.map(sug => (
                                        <button
                                            key={sug}
                                            onClick={() => {
                                                updateSection(section.id, { label: sug });
                                                setShowSuggestions(false);
                                            }}
                                            className="text-[10px] bg-white dark:bg-rs-black hover:bg-rs-gold hover:text-black px-2.5 py-1.5 rounded-md transition-all text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 font-medium shadow-sm"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                    {section.type === 'video' ? 'Link do Vídeo (YouTube/Vimeo)' : 'Link (URL)'}
                                </label>
                                <input
                                    type="text"
                                    value={section.content.url || ''}
                                    onChange={(e) => updateSection(section.id, { url: e.target.value })}
                                    placeholder={section.type === 'video' ? 'Cole o link completo aqui (Youtube/Vimeo)' : 'https://...'}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none font-mono text-xs"
                                />
                            </div>

                            {/* RS KIT PRESETS */}
                            <div className="pt-2">
                                <label className="block text-[10px] font-bold text-rs-goldDark uppercase mb-2">Presetação de Kit RS (Automático)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Start', 'Pro', 'Agente'].map(kit => (
                                        <button
                                            key={kit}
                                            onClick={() => {
                                                updateSection(section.id, {
                                                    label: `Kit Bio ${kit}`,
                                                    checkoutEnabled: true,
                                                    url: `${window.location.origin}/checkout/${kit.toLowerCase()}`
                                                });
                                            }}
                                            className="py-2 px-1 bg-rs-gold/5 border border-rs-gold/20 rounded text-[9px] font-bold hover:bg-rs-gold hover:text-black transition-all"
                                        >
                                            Bio {kit}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-gray-500 mt-2 italic">Ao selecionar um kit, o checkout seguro é ativado automaticamente.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                                <label className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase cursor-pointer mb-2">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={14} className="text-rs-gold" />
                                        <span>Ativar Checkout (Leads)</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={section.content.checkoutEnabled || false}
                                        onChange={(e) => updateSection(section.id, { checkoutEnabled: e.target.checked })}
                                        className="w-4 h-4 accent-rs-gold rounded"
                                    />
                                </label>
                                {section.content.checkoutEnabled && (
                                    <p className="text-[10px] text-gray-400 leading-relaxed bg-rs-gold/5 p-2 rounded border border-rs-gold/20">
                                        Transforma este botão em uma chamada para cadastro. O link original será aberto após o preenchimento.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: WHATSAPP */}
                    {section.type === 'whatsapp' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Número do WhatsApp</label>
                                <input
                                    type="text"
                                    value={section.content.whatsappNumber || ''}
                                    onChange={(e) => updateSection(section.id, { whatsappNumber: e.target.value })}
                                    placeholder="Ex: 5511999999999"
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none font-mono text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mensagem Padrão</label>
                                <textarea
                                    rows={2}
                                    value={section.content.whatsappMessage || ''}
                                    onChange={(e) => updateSection(section.id, { whatsappMessage: e.target.value })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Texto do Botão</label>
                                <input
                                    type="text"
                                    value={section.content.label || ''}
                                    onChange={(e) => updateSection(section.id, { label: e.target.value })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: BENTO GRID */}
                    {section.type === 'bento' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Itens do Grid</h4>
                                <button
                                    onClick={() => addBentoItem(section.id)}
                                    className="text-[10px] font-bold text-rs-gold uppercase hover:underline"
                                >
                                    + Adicionar Item
                                </button>
                            </div>
                            <div className="space-y-4">
                                {section.content.bentoItems?.map((item, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 dark:border-rs-gray rounded-lg space-y-3 bg-gray-50 dark:bg-white/5 animate-fade-in">
                                        <div className="flex justify-between items-center bg-gray-200 dark:bg-white/10 p-1 rounded">
                                            <span className="text-[10px] font-bold px-2 uppercase opacity-50">Item {idx + 1}</span>
                                            <div className="flex gap-1">
                                                {['text', 'image'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => updateBentoItem(section.id, idx, { type: t as any })}
                                                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${item.type === t ? 'bg-rs-gold text-black shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                    >
                                                        {t === 'text' ? 'Texto' : 'Imagem'}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => removeBentoItem(section.id, idx)}
                                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded ml-2"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {item.type === 'image' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded overflow-hidden border border-gray-300 dark:border-rs-gray">
                                                    <img src={item.imageSrc || 'https://via.placeholder.com/100'} alt="Bento" className="w-full h-full object-cover" />
                                                </div>
                                                <button
                                                    onClick={() => handleUploadClick((url) => updateBentoItem(section.id, idx, { imageSrc: url }))}
                                                    className="px-2 py-1 bg-gray-200 dark:bg-rs-gray hover:bg-rs-gold hover:text-black rounded text-[10px] font-bold transition-colors"
                                                >
                                                    Trocar Foto
                                                </button>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={(e) => updateBentoItem(section.id, idx, { title: e.target.value })}
                                                placeholder="Título principais"
                                                className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-1.5 text-xs outline-none focus:border-rs-gold"
                                            />
                                            <input
                                                type="text"
                                                value={item.subtitle || ''}
                                                onChange={(e) => updateBentoItem(section.id, idx, { subtitle: e.target.value })}
                                                placeholder="Subtítulo / Ver mais"
                                                className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-1.5 text-xs outline-none focus:border-rs-gold opacity-70"
                                            />
                                            <input
                                                type="text"
                                                value={item.url || ''}
                                                onChange={(e) => updateBentoItem(section.id, idx, { url: e.target.value })}
                                                placeholder="Link (URL)"
                                                className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-1.5 text-xs font-mono outline-none focus:border-rs-gold"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: CAROUSEL */}
                    {section.type === 'carousel' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={section.content.autoplay || false}
                                        onChange={(e) => updateSection(section.id, { autoplay: e.target.checked })}
                                        className="w-4 h-4 accent-rs-gold"
                                    />
                                    Reprodução Automática
                                </label>
                                {section.content.autoplay && (
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Velocidade (segundos)</label>
                                            <span className="text-[10px] font-mono text-gray-400">{(section.content.autoplaySpeed || 3000) / 1000}s</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="10000"
                                            step="500"
                                            value={section.content.autoplaySpeed || 3000}
                                            onChange={(e) => updateSection(section.id, { autoplaySpeed: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-gray-300 dark:bg-rs-gray rounded-lg appearance-none cursor-pointer accent-rs-gold"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {section.content.carouselItems?.map((item, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 dark:border-rs-gray rounded-lg bg-gray-50 dark:bg-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-16 rounded overflow-hidden border border-gray-300 dark:border-rs-gray bg-gray-100 dark:bg-rs-black">
                                                    <img src={item.imageSrc} alt="Slide" className="w-full h-full object-cover" />
                                                </div>
                                                <button
                                                    onClick={() => handleUploadClick((url) => updateCarouselItem(section.id, idx, { imageSrc: url }))}
                                                    className="px-2 py-1 bg-gray-200 dark:bg-rs-gray hover:bg-rs-gold hover:text-black rounded text-[9px] font-bold transition-colors"
                                                >
                                                    Mudar Foto
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeCarouselItem(section.id, idx)}
                                                className="text-red-500 p-1.5 hover:bg-red-500/10 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={(e) => updateCarouselItem(section.id, idx, { title: e.target.value })}
                                                placeholder="Título do Slide"
                                                className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-2 text-xs outline-none focus:border-rs-gold"
                                            />
                                            <input
                                                type="text"
                                                value={item.url || ''}
                                                onChange={(e) => updateCarouselItem(section.id, idx, { url: e.target.value })}
                                                placeholder="Link do Slide (URL)"
                                                className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-2 text-xs font-mono outline-none focus:border-rs-gold"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* BLOCK SPECIFIC: COUNTDOWN */}
                    {section.type === 'countdown' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data e Hora do Evento</label>
                                <input
                                    type="datetime-local"
                                    value={section.content.targetDate?.slice(0, 16) || ''}
                                    onChange={(e) => updateSection(section.id, { targetDate: new Date(e.target.value).toISOString() })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Formato Visual</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateSection(section.id, { countdownShape: 'square' })}
                                        className={`flex-1 py-2 text-xs font-bold border rounded ${!section.content.countdownShape || section.content.countdownShape === 'square' ? 'bg-rs-gold text-black border-rs-gold' : 'border-gray-300 dark:border-rs-gray text-gray-500'}`}
                                    >
                                        Quadrado
                                    </button>
                                    <button
                                        onClick={() => updateSection(section.id, { countdownShape: 'circle' })}
                                        className={`flex-1 py-2 text-xs font-bold border rounded ${section.content.countdownShape === 'circle' ? 'bg-rs-gold text-black border-rs-gold' : 'border-gray-300 dark:border-rs-gray text-gray-500'}`}
                                    >
                                        Redondo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: FAQ */}
                    {section.type === 'faq' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Perguntas e Respostas</h4>
                                <button
                                    onClick={() => addFaqItem(section.id)}
                                    className="text-[10px] font-bold text-rs-gold uppercase hover:underline"
                                >
                                    + Adicionar
                                </button>
                            </div>
                            <div className="space-y-4">
                                {section.content.faqItems?.map((item, idx) => (
                                    <div key={idx} className="p-3 border border-gray-200 dark:border-rs-gray rounded-lg bg-gray-50 dark:bg-white/5 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Pergunta {idx + 1}</span>
                                            <button
                                                onClick={() => removeFaqItem(section.id, idx)}
                                                className="text-red-500 p-1 hover:bg-red-500/10 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={item.question}
                                            onChange={(e) => updateFaqItem(section.id, idx, 'question', e.target.value)}
                                            placeholder="Pergunta..."
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-2 text-xs outline-none focus:border-rs-gold font-bold"
                                        />
                                        <textarea
                                            rows={2}
                                            value={item.answer}
                                            onChange={(e) => updateFaqItem(section.id, idx, 'answer', e.target.value)}
                                            placeholder="Resposta..."
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-2 text-xs outline-none focus:border-rs-gold"
                                        />

                                        {/* CTA Button in FAQ */}
                                        <div className="pt-2 border-t border-gray-200 dark:border-white/5 space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Botão de Ação (Opcional)</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={item.buttonLabel || ''}
                                                    onChange={(e) => updateFaqItem(section.id, idx, 'buttonLabel', e.target.value)}
                                                    placeholder="Nome do Botão"
                                                    className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-1.5 text-[10px] outline-none focus:border-rs-gold"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.buttonUrl || ''}
                                                    onChange={(e) => updateFaqItem(section.id, idx, 'buttonUrl', e.target.value)}
                                                    placeholder="Link (URL)"
                                                    className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded p-1.5 text-[10px] outline-none focus:border-rs-gold font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: NEWSLETTER */}
                    {section.type === 'newsletter' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Texto do Botão</label>
                                <input
                                    type="text"
                                    value={section.content.buttonText || ''}
                                    onChange={(e) => updateSection(section.id, { buttonText: e.target.value })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Placeholder do E-mail</label>
                                <input
                                    type="text"
                                    value={section.content.placeholderText || ''}
                                    onChange={(e) => updateSection(section.id, { placeholderText: e.target.value })}
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none"
                                />
                            </div>
                        </div>
                    )}


                    {/* BLOCO ESPECÍFICO: MAPA */}
                    {section.type === 'map' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Endereço Completo</label>
                                <textarea
                                    rows={3}
                                    value={section.content.mapAddress || ''}
                                    onChange={(e) => updateSection(section.id, { mapAddress: e.target.value })}
                                    placeholder="Av. Paulista, 1000 - São Paulo, SP"
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {/* BLOCO ESPECÍFICO: DIVISOR */}
                    {section.type === 'divider' && (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Largura da Linha</label>
                                    <span className="text-[10px] font-mono text-gray-400">{section.style.dividerWidth || '100%'}</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={parseInt(section.style.dividerWidth || '100')}
                                    onChange={(e) => updateSection(section.id, { dividerWidth: `${e.target.value}%` }, true)}
                                    className="w-full h-1 bg-gray-300 dark:bg-rs-gray rounded-lg appearance-none cursor-pointer accent-rs-gold"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Espessura</label>
                                    <span className="text-[10px] font-mono text-gray-400">{section.style.dividerThickness || '1px'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {['1px', '2px', '4px', '8px'].map((thick) => (
                                        <button
                                            key={thick}
                                            onClick={() => updateSection(section.id, { dividerThickness: thick }, true)}
                                            className={`flex-1 py-2 text-[10px] font-bold border rounded ${section.style.dividerThickness === thick ? 'bg-rs-gold text-black border-rs-gold' : 'border-gray-300 dark:border-rs-gray text-gray-500'}`}
                                        >
                                            {thick}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* DIVIDER ADVANCED STYLES */}
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Estilo da Linha</label>
                                    <div className="flex bg-gray-100 dark:bg-black p-1 rounded border border-gray-200 dark:border-white/10">
                                        {['solid', 'dashed', 'dotted'].map((st) => (
                                            <button
                                                key={st}
                                                onClick={() => updateSection(section.id, { dividerStyle: st as any }, true)}
                                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${(section.style.dividerStyle || 'solid') === st ? 'bg-white dark:bg-rs-gray text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            >
                                                {st === 'solid' ? 'Sólido' : st === 'dashed' ? 'Tracejado' : 'Pontilhado'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sombra</label>
                                    <select
                                        value={section.style.shadow || ''}
                                        onChange={(e) => updateSection(section.id, { shadow: e.target.value }, true)}
                                        className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-xs outline-none focus:border-rs-gold"
                                    >
                                        <option value="">Nenhuma</option>
                                        <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Suave</option>
                                        <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Média</option>
                                        <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Intensa</option>
                                        <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)">Elevada</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Degradê (CSS)</label>
                                    <input
                                        type="text"
                                        value={section.style.gradient || ''}
                                        onChange={(e) => updateSection(section.id, { gradient: e.target.value }, true)}
                                        placeholder="Ex: linear-gradient(to right, gold, red)"
                                        className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-xs font-mono outline-none focus:border-rs-gold"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BLOCO ESPECÍFICO: ESPAÇADOR */}
                    {section.type === 'spacer' && (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Altura do Espaço</label>
                                    <span className="text-[10px] font-mono text-gray-400">{section.style.height || '32px'}</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="200"
                                    step="8"
                                    value={parseInt(section.style.height || '32')}
                                    onChange={(e) => updateSection(section.id, { height: `${e.target.value}px` }, true)}
                                    className="w-full h-1 bg-gray-300 dark:bg-rs-gray rounded-lg appearance-none cursor-pointer accent-rs-gold"
                                />
                            </div>
                        </div>
                    )}

                    {/* BLOCO ESPECÍFICO: REDES SOCIAIS (NOVO) */}
                    {section.type === 'social' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Ícones Sociais</h4>
                                <div className="relative group">
                                    <button className="text-[10px] font-bold text-rs-gold uppercase hover:underline flex items-center gap-1">
                                        + Adicionar <ChevronDown size={10} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-lg shadow-xl z-20 hidden group-hover:block">
                                        {['instagram', 'whatsapp', 'linkedin', 'facebook', 'youtube', 'twitter', 'website'].map((platform) => (
                                            <button
                                                key={platform}
                                                onClick={() => {
                                                    const newLinks = [...(section.content.socialLinks || []), { platform: platform as any, url: '' }];
                                                    updateSection(section.id, { socialLinks: newLinks });
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/10 capitalize"
                                            >
                                                {platform}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {section.content.socialLinks?.map((link, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-rs-gray rounded bg-gray-50 dark:bg-white/5">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-white/10 rounded-full shrink-0">
                                            {/* Simple Icon Placeholder depending on platform */}
                                            <span className="text-[10px] font-bold uppercase">{link.platform.slice(0, 2)}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...(section.content.socialLinks || [])];
                                                newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                                updateSection(section.id, { socialLinks: newLinks });
                                            }}
                                            placeholder={`Link do ${link.platform}`}
                                            className="flex-1 bg-transparent text-xs outline-none min-w-0"
                                        />
                                        <button
                                            onClick={() => {
                                                const newLinks = section.content.socialLinks?.filter((_, i) => i !== idx);
                                                updateSection(section.id, { socialLinks: newLinks });
                                            }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {!section.content.socialLinks?.length && (
                                    <p className="text-[10px] text-center text-gray-400 italic py-2">Nenhuma rede social adicionada</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: VIDEO */}
                    {section.type === 'video' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Link do Vídeo (YouTube/Vimeo)</label>
                                <input
                                    type="text"
                                    value={section.content.url || ''}
                                    onChange={(e) => updateSection(section.id, { url: e.target.value })}
                                    placeholder="Cole o link completo aqui (Youtube/Vimeo)"
                                    className="w-full bg-white dark:bg-rs-dark border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white focus:border-rs-goldDark dark:focus:border-rs-gold outline-none font-mono text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {/* BLOCK SPECIFIC: GALLERY */}
                    {section.type === 'gallery' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Fotos da Galeria</h4>
                                <button
                                    onClick={() => {
                                        const newItems = [...(section.content.galleryItems || []), { imageSrc: 'https://picsum.photos/400/300', title: 'Nova Foto' }];
                                        updateSection(section.id, { galleryItems: newItems });
                                    }}
                                    className="text-[10px] font-bold text-rs-gold uppercase hover:underline"
                                >
                                    + Adicionar
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {section.content.galleryItems?.map((item, idx) => (
                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-rs-gray aspect-square">
                                        <img src={item.imageSrc} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                            <button
                                                onClick={() => handleUploadClick((url) => {
                                                    const newItems = [...(section.content.galleryItems || [])];
                                                    newItems[idx] = { ...newItems[idx], imageSrc: url };
                                                    updateSection(section.id, { galleryItems: newItems });
                                                })}
                                                className="px-2 py-1 bg-white text-black text-[9px] font-bold rounded uppercase hover:bg-rs-gold"
                                            >
                                                Trocar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newItems = section.content.galleryItems?.filter((_, i) => i !== idx);
                                                    updateSection(section.id, { galleryItems: newItems });
                                                }}
                                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Common Alignment Options - Hide for Spacer/Divider */}
                    {section.type !== 'spacer' && section.type !== 'divider' && (
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-rs-gray">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Alinhamento</label>
                            <div className="flex gap-2 bg-white dark:bg-rs-dark rounded p-1 border border-gray-300 dark:border-rs-gray w-fit">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateSection(section.id, { textAlign: align as any }, true)}
                                        className={`p-2 rounded ${section.style.textAlign === align ? 'bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black' : 'text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                                    >
                                        <div className={`w-4 h-0.5 bg-current ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}></div>
                                        <div className={`w-2 h-0.5 bg-current mt-1 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DETAILED BLOCK STYLE SECTION (RESTORED QUALITY) */}
                    <div className="pt-6 border-t border-gray-200 dark:border-rs-gray mt-6">
                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase mb-4 tracking-widest flex items-center gap-2">
                            <Droplet size={14} />
                            Personalização Visual
                        </h4>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Fundo do Bloco</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={section.style.backgroundColor || ''} // Default transparency handled in renderer
                                        onChange={(e) => updateSection(section.id, { backgroundColor: e.target.value, backgroundType: 'color' }, true)}
                                        className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                                    />
                                    {section.style.backgroundColor && (
                                        <button
                                            onClick={() => updateSection(section.id, { backgroundColor: undefined }, true)}
                                            className="text-[10px] text-red-400 hover:underline"
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Cor do Texto</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={section.style.textColor || ''}
                                        onChange={(e) => updateSection(section.id, { textColor: e.target.value }, true)}
                                        className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                                    />
                                    {section.style.textColor && (
                                        <button
                                            onClick={() => updateSection(section.id, { textColor: undefined }, true)}
                                            className="text-[10px] text-red-400 hover:underline"
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Background Image/Video Override */}
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Mídia de Fundo</label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => updateSection(section.id, { backgroundType: 'color' }, true)}
                                    className={`flex-1 py-1 text-[10px] border rounded ${section.style.backgroundType !== 'image' && section.style.backgroundType !== 'video' ? 'bg-rs-gold text-black border-rs-gold' : 'border-gray-600 text-gray-400'}`}
                                >
                                    Nenhum
                                </button>
                                <button
                                    onClick={() => updateSection(section.id, { backgroundType: 'image' }, true)}
                                    className={`flex-1 py-1 text-[10px] border rounded ${section.style.backgroundType === 'image' ? 'bg-rs-gold text-black border-rs-gold' : 'border-gray-600 text-gray-400'}`}
                                >
                                    Imagem
                                </button>
                                <button
                                    onClick={() => updateSection(section.id, { backgroundType: 'video' }, true)}
                                    className={`flex-1 py-1 text-[10px] border rounded ${section.style.backgroundType === 'video' ? 'bg-rs-gold text-black border-rs-gold' : 'border-gray-600 text-gray-400'}`}
                                >
                                    Vídeo
                                </button>
                            </div>

                            {(section.style.backgroundType === 'image' || section.style.backgroundType === 'video') && (
                                <div className="space-y-2 animate-fade-in">
                                    <button
                                        onClick={() => handleUploadClick((url) => {
                                            if (section.style.backgroundType === 'image') updateSection(section.id, { backgroundImage: url }, true);
                                            else updateSection(section.id, { backgroundVideo: url }, true);
                                        })}
                                        className="w-full py-2 bg-gray-200 dark:bg-white/10 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-rs-gold hover:text-black transition-colors"
                                    >
                                        <Upload size={14} /> Carregar {section.style.backgroundType === 'image' ? 'Imagem' : 'Vídeo'}
                                    </button>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Opacidade da Máscara</label>
                                            <span className="text-[10px] font-mono text-gray-400">{Math.round((section.style.overlayOpacity ?? 0.4) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={section.style.overlayOpacity ?? 0.4}
                                            onChange={(e) => updateSection(section.id, { overlayOpacity: parseFloat(e.target.value) }, true)}
                                            className="w-full h-1 bg-gray-300 dark:bg-rs-gray rounded-lg appearance-none cursor-pointer accent-rs-gold"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Border Radius */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Arredondamento</label>
                            <select
                                value={section.style.borderRadius || '12px'}
                                onChange={(e) => updateSection(section.id, { borderRadius: e.target.value }, true)}
                                className="w-full bg-white dark:bg-rs-black border border-gray-300 dark:border-rs-gray rounded p-2 text-gray-900 dark:text-white text-xs outline-none focus:border-rs-gold"
                            >
                                <option value="0px">Quadrado (0px)</option>
                                <option value="8px">Suave (8px)</option>
                                <option value="12px">Padrão (12px)</option>
                                <option value="24px">Arredondado (24px)</option>
                                <option value="999px">Pílula (Full)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-rs-black">

            {/* 1. LEFT SIDEBAR (Navigation + Content) */}
            <div className="hidden md:flex w-80 bg-white dark:bg-rs-black border-r border-gray-200 dark:border-rs-gray flex-col z-20 shadow-xl transition-colors duration-300 relative">
                <div className="p-4 border-b border-gray-200 dark:border-rs-gray flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider">Voltar</span>
                    </button>
                    <div className="flex gap-1">
                        <button onClick={() => setSidebarTab('build')} title="Blocos" className={`p-1.5 rounded ${sidebarTab === 'build' ? 'bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}><Layout size={16} /></button>
                        <button onClick={() => setSidebarTab('design')} title="Design" className={`p-1.5 rounded ${sidebarTab === 'design' ? 'bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}><Palette size={16} /></button>
                        <button onClick={() => setSidebarTab('settings')} title="Configurações" className={`p-1.5 rounded ${sidebarTab === 'settings' ? 'bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}><Settings size={16} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24">
                    {renderSidebarContent()}
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-white dark:bg-rs-black border-b border-gray-200 dark:border-rs-gray flex items-center justify-between px-4 z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <ChevronLeft size={24} />
                    <span className="font-bold">Voltar</span>
                </button>
                <div className="flex gap-4">
                    <button onClick={() => setSidebarTab('build')} className={sidebarTab === 'build' ? 'text-rs-goldDark dark:text-rs-gold' : 'text-gray-400'}><Layout size={20} /></button>
                    <button onClick={() => setSidebarTab('design')} className={sidebarTab === 'design' ? 'text-rs-goldDark dark:text-rs-gold' : 'text-gray-400'}><Palette size={20} /></button>
                    <button onClick={() => setSidebarTab('settings')} className={sidebarTab === 'settings' ? 'text-rs-goldDark dark:text-rs-gold' : 'text-gray-400'}><Settings size={20} /></button>
                </div>
            </div>

            {/* 2. CENTER CANVAS (Preview) */}
            <div className="flex-1 bg-gray-200 dark:bg-neutral-900 flex flex-col relative transition-colors duration-300 pt-14 md:pt-0">
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-300 dark:border-rs-gray bg-gray-200/50 dark:bg-rs-black/50 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarTab('build')}
                            className={`pb-4 translate-y-2.5 font-bold text-sm transition-colors border-b-2 ${sidebarTab !== 'design' ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold' : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => setSidebarTab('design')}
                            className={`pb-4 translate-y-2.5 font-bold text-sm transition-colors border-b-2 ${sidebarTab === 'design' ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold' : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Design
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4 border-r border-gray-300 dark:border-rs-gray pr-4">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider hidden md:inline">
                                Modo {isDarkMode ? 'Escuro' : 'Claro'}
                            </span>
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-rs-gold text-black' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                                title="Alternar Tema"
                            >
                                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                        </div>

                        <div className="flex bg-gray-300 dark:bg-rs-dark rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setPreviewDevice('mobile')}
                                className={`p-2 rounded transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-rs-gray text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                            >
                                <Smartphone size={16} />
                            </button>
                            <button
                                onClick={() => setPreviewDevice('desktop')}
                                className={`p-2 rounded transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-rs-gray text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                            >
                                <Globe size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-grid-pattern relative">
                    <div className="min-h-full w-full flex flex-col items-center justify-center p-8">
                        {/* 
                    PREVIEW CONTAINER 
                    Toggles between Phone Frame and Full Screen Desktop
                */}
                        <div
                            className={`
                        relative transition-all duration-500 shadow-2xl overflow-hidden
                        ${previewDevice === 'mobile'
                                    ? 'w-[375px] h-[750px] bg-black rounded-[3rem] border-[8px] border-gray-800 dark:border-rs-gray ring-4 ring-black shrink-0'
                                    : 'w-full h-full bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-rs-gray'
                                }
                    `}
                        >

                            {/* Notch (Mobile Only) */}
                            {previewDevice === 'mobile' && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 pointer-events-none"></div>
                            )}

                            {/* Render Engine Inside */}
                            <div className="w-full h-full bg-white overflow-hidden scrollbar-hide relative group">
                                <Renderer
                                    sections={currentSite.sections}
                                    theme={currentSite.theme}
                                    isPreview={true}
                                    onSectionClick={(id) => {
                                        setSidebarTab('build');
                                        setSelectedSectionId(id);
                                    }}
                                    selectedSectionId={selectedSectionId}
                                    plan={currentSite.plan}
                                    tracking={currentSite.tracking}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* 3. RIGHT SIDEBAR (Properties) */}
            < div className="w-72 bg-gray-50 dark:bg-rs-dark border-l border-gray-200 dark:border-rs-gray hidden lg:flex flex-col transition-colors duration-300 overflow-y-auto custom-scrollbar" >
                {renderPropertiesPanel()}
            </div >

            {/* 1. LEFT SIDEBAR (Tools) - Bottom Action */}
            < div className="hidden md:flex w-80 fixed bottom-0 left-0 bg-white dark:bg-rs-black border-t border-gray-200 dark:border-rs-gray p-4 z-30" >
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-rs-goldDark dark:bg-rs-gold hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white dark:text-black py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div >

            {/* Floating Save Button for Mobile */}
            < div className="md:hidden fixed bottom-6 right-6 z-50" >
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                </button>
            </div >

            {/* HIDDEN FILE INPUT FOR UPLOADS */}
            < input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*"
            />

        </div >
    );
};

interface BlockButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    locked?: boolean;
}

const BlockButton: React.FC<BlockButtonProps> = ({ icon, label, onClick, locked }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-3 h-24 rounded-lg border transition-all hover:shadow-md group relative ${locked
            ? 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 opacity-70 cursor-not-allowed'
            : 'border-gray-200 dark:border-rs-gray bg-white dark:bg-white/5 hover:border-rs-goldDark dark:hover:border-rs-gold'
            }`}
    >
        {locked && (
            <div className="absolute top-2 right-2 text-gray-400">
                <Lock size={12} />
            </div>
        )}
        <div className={`mb-2 transition-colors ${locked ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-rs-goldDark dark:group-hover:text-rs-gold'}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${locked ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300 group-hover:text-rs-goldDark dark:group-hover:text-rs-gold'}`}>
            {label}
        </span>
    </button>
);
