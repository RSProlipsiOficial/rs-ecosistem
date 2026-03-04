
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, Palette, Type, ChevronUp, ChevronDown } from 'lucide-react';
import { StoreCustomization, Banner, View } from '../types';
import { ImageUploader } from './ImageUploader';
import { VideoUploader } from './VideoUploader';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { storeCustomizationAPI } from '../services/marketplaceAPI';

interface StorefrontEditorProps {
    customization: StoreCustomization;
    onUpdate: (updatedData: Partial<StoreCustomization>) => void;
    onNavigate: (view: View, data?: any) => void;
    senderId: string;
    isReceivingSync?: boolean; // Trava v3.6
}

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-[rgb(var(--color-brand-text-light))]"
            >
                <span>{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-4 border-t border-[rgb(var(--color-brand-gray-light))]">{children}</div>}
        </div>
    );
};

const StorefrontEditor: React.FC<StorefrontEditorProps> = ({ customization, onUpdate, onNavigate, senderId, isReceivingSync }) => {
    // Missão 1: Persistência de Rascunho v4.2
    const [localCustomization, setLocalCustomization] = useState<StoreCustomization>(() => {
        // v11.0: Carregamento do rascunho com prioridade para o rascunho se existir, senão usa customization da prop
        const savedDraft = typeof window !== 'undefined' ? localStorage.getItem('rs_editor_draft') : null;
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed && typeof parsed === 'object' && parsed.hero && parsed.carouselBanners) {
                    // Auto-repair: guarantee all 8 default sections exist in saved draft
                    if (parsed.homepageSections) {
                        const defaultSections = [
                            { id: 'hero', name: 'Banner Principal (Hero)' },
                            { id: 'carousel', name: 'Carrossel de Banners' },
                            { id: 'featuredProducts', name: 'Produtos em Destaque' },
                            { id: 'offers', name: 'Ofertas Especiais' },
                            { id: 'bestsellers', name: 'Mais Vendidos' },
                            { id: 'featuredCollections', name: 'Coleções em Destaque' },
                            { id: 'recentlyViewed', name: 'Vistos Recentemente' },
                            { id: 'midPageBanner', name: 'Banner de Meio da Página' },
                        ];
                        const existingIds = parsed.homepageSections.map((s: any) => s.id);
                        let changed = false;
                        defaultSections.forEach((def, idx) => {
                            if (!existingIds.includes(def.id)) {
                                parsed.homepageSections.splice(idx, 0, { id: def.id, name: def.name, enabled: true, order: idx + 1 });
                                changed = true;
                            }
                        });
                        if (changed) parsed.homepageSections.forEach((s: any, i: number) => s.order = i + 1);
                    }
                    console.log('%c[Editor v11.0] 📔 Draft restored and fixed', 'color: #00ffff; font-weight: bold;');
                    return parsed;
                }
            } catch (e) { }
        }
        return customization;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const localCustomizationRef = useRef<StoreCustomization>(localCustomization); // v9.5: Ref para evitar captura de closure no handshake

    // Atualiza o ref sempre que o estado muda
    useEffect(() => {
        localCustomizationRef.current = localCustomization;
    }, [localCustomization]);
    const hasChanges = JSON.stringify(localCustomization) !== JSON.stringify(customization);

    // Logs de Ciclo de Vida v4.2
    useEffect(() => {
        console.log(`%c[Editor v4.2] 🚀 Component MOUNTED. Instance: ${senderId}`, 'color: #ff00ff; font-weight: bold; border: 2px solid #ff00ff; padding: 4px;');
        return () => {
            console.log(`%c[Editor v4.2] 🛑 Component UNMOUNTED. Instance: ${senderId}`, 'color: #ff00ff; font-weight: bold;');
        };
    }, []);

    // Auto-Save Rascunho v4.2
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('rs_editor_draft', JSON.stringify(localCustomization));
            } catch (e) {
                console.warn('[Editor v4.2] ⚠️ Draft persistence failed (Quota exceeded?)', e);
            }
        }
    }, [localCustomization]);

    // Estabiliza o src do iframe para evitar reloads infinitos (Causa do 'piscar') v2.5
    const iframeSrc = useMemo(() => {
        return `${window.location.origin}/?preview=true&session=${Date.now()}`;
    }, []); // Só muda se o editor for remontado do zero

    // Canais persistentes para evitar perda de mensagens v2.7
    const syncChannelRef = useRef<BroadcastChannel | null>(null);
    const handshakeChannelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // Inicializa canais apenas uma vez v2.7.1
        if (!syncChannelRef.current) {
            syncChannelRef.current = new BroadcastChannel('rs_live_preview');
        }
        if (!handshakeChannelRef.current) {
            handshakeChannelRef.current = new BroadcastChannel('rs_live_preview_handshake');

            handshakeChannelRef.current.onmessage = (event) => {
                if (event.data?.type === 'PREVIEW_READY') {
                    console.log('%c[Editor v9.5] 🤝 Handshake Recebido: Preview pronto. Enviando estado ATUAL...', 'color: #00ff00; font-weight: bold;');
                    syncNow(localCustomizationRef.current);
                }
            };
        }

        return () => {
            syncChannelRef.current?.close();
            handshakeChannelRef.current?.close();
            syncChannelRef.current = null;
            handshakeChannelRef.current = null;
        };
    }, []); // Mount only

    const syncNow = (dataToSync: StoreCustomization = localCustomization) => {
        // Sincronização Ultra-Resiliente v3.4 (Blindagem contra QuotaExceeded + Heavy Payloads)
        // 1. Canal de Imagem dedicado
        // v5.0: Sincronização Senior - Canais Híbridos (Buffer + Inline 1MB)
        const isLogoHeavy = dataToSync.logoUrl?.startsWith('data:') && dataToSync.logoUrl.length > 1000000;

        // v8.0: Só marca como BUFFERED se conseguirmos salvar, senão manda inline (melhor lento que vazio)
        let finalLogoUrl = dataToSync.logoUrl;
        if (isLogoHeavy) {
            try {
                localStorage.setItem('rs_logo_buffer', dataToSync.logoUrl);
                finalLogoUrl = 'BUFFERED_IN_LOGO_KEY';
            } catch (e) {
                console.warn('[Editor] Logo Buffer Full - Sending Inline anyway');
            }
        } else if (!dataToSync.logoUrl) {
            localStorage.removeItem('rs_logo_buffer');
        }

        const lightDataForNetwork = {
            ...dataToSync,
            logoUrl: finalLogoUrl,
            carouselBanners: dataToSync.carouselBanners?.map(b => ({
                ...b,
                desktopImage: (b.desktopImage?.startsWith('data:') && b.desktopImage.length > 500000) ? 'BUFFERED' : b.desktopImage,
                mobileImage: (b.mobileImage?.startsWith('data:') && b.mobileImage.length > 500000) ? 'BUFFERED' : b.mobileImage
            }))
        };

        const syncPayload = {
            type: 'LIVE_PREVIEW_UPDATE',
            data: lightDataForNetwork,
            senderId: senderId,
            version: '9.5-GOLD-FIX',
            timestamp: Date.now()
        };

        console.log(`%c[Editor v5.7] 📤 Enviando Sync (ID: ${senderId}) | Logo: ${lightDataForNetwork.logoUrl?.substring(0, 10)}...`, 'color: #ffd700; font-weight: bold;');

        // 2. BroadcastChannel
        if (syncChannelRef.current) {
            try { syncChannelRef.current.postMessage(syncPayload); } catch (e) { }
        }

        // 3. postMessage Direto
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(syncPayload, '*');
        }

        // 4. LocalStorage Buffer (Object Fallback) - v9.0: Apenas mascara o logo se ele estiver realmente no buffer
        try {
            const lightData = {
                ...dataToSync,
                logoUrl: isLogoHeavy ? 'BUFFERED_IN_LOGO_KEY' : finalLogoUrl,
                carouselBanners: dataToSync.carouselBanners?.map(b => ({
                    ...b,
                    desktopImage: (b.desktopImage?.startsWith('data:') && b.desktopImage.length > 500000) ? 'BUFFERED' : b.desktopImage,
                    mobileImage: (b.mobileImage?.startsWith('data:') && b.mobileImage.length > 500000) ? 'BUFFERED' : b.mobileImage
                }))
            };
            localStorage.setItem('rs_preview_buffer', JSON.stringify({ ...syncPayload, data: lightData }));
        } catch (e) {
            console.warn('[Editor] Storage Full: Clearing old buffers...', e);
            try {
                localStorage.removeItem('rs_preview_buffer');
                localStorage.removeItem('rs_logo_buffer');
                localStorage.removeItem('rs_banners_buffer');
            } catch (ex) { }
        }

        console.log(`%c[Editor v3.4] 📤 syncNow: ${dataToSync.hero?.title}`, 'color: #ffd700; font-weight: bold;');
    };

    // v12.0: Sincronização em Tempo Real com o Pai (Debounced)
    // Blindagem v12.0: Ignora se estiver recebendo sincronização para evitar loops infinitos.
    useEffect(() => {
        if (isReceivingSync) return;

        const timeout = setTimeout(() => {
            console.log('%c[Editor v12.0] 🔋 Sincronizando rascunho com App Pai...', 'color: #00ff00;');
            onUpdate(localCustomization);
        }, 800);

        // Preview sempre atualiza rápido
        syncNow(localCustomization);

        return () => clearTimeout(timeout);
    }, [localCustomization, isReceivingSync]);

    const handleSave = async () => {
        console.log('[Editor] 💾 INITIATING ATOMIC SAVE v11.0...', localCustomization);
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // Validação mínima antes de enviar
            if (!localCustomization.hero?.title) {
                console.warn('Saving with empty hero title. Allowed but noted.');
            }

            const apiResult = await storeCustomizationAPI.update(localCustomization);
            console.log('%c[Editor] 📡 API RESPONSE:', 'color: #00ffff; font-bold;', apiResult);

            if (apiResult.success !== false) {
                localStorage.removeItem('rs_editor_draft'); // Limpa rascunho ao salvar com sucesso

                // v11.0: Sincroniza o estado global do App imediatamente para garantir persistência visual
                onUpdate(localCustomization);

                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                throw new Error(apiResult.error || 'API returned failure status');
            }
        } catch (e: any) {
            console.error('❌ FATAL SAVE ERROR:', e);
            alert(`⚠️ ERRO NO SERVIDOR: ${e.message}. \nSuas alterações foram mantidas no rascunho local.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm('Tem certeza que deseja descartar suas alterações não salvas?')) {
            localStorage.removeItem('rs_editor_draft');
            setLocalCustomization(customization);
        }
    };

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const updateLocalCustomization = (newData: Partial<StoreCustomization>) => {
        const updated = { ...localCustomization, ...newData };
        setLocalCustomization(updated);
        localCustomizationRef.current = updated;

        // Debounce de sincronia otimizado v9.6
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
            syncNow(updated);
        }, 300); // 300ms para feeling instantâneo
    };

    const handleFieldChange = (field: string, value: any) => {
        const updated = { ...localCustomization, [field]: value };
        setLocalCustomization(updated);

        // Sincronização imediata (sem esperar o render do useEffect)
        syncNow(updated);
        console.log(`Editor: 📤 Fast-sync field ${field}`, value);
    };

    const handleHeroChange = (field: string, value: any) => {
        const updated = {
            ...localCustomization,
            hero: { ...localCustomization.hero, [field]: value }
        };
        setLocalCustomization(updated);

        // Sincronização imediata
        syncNow(updated);
        console.log(`Editor: 📤 Fast-sync hero field ${field}`, value);
    };

    const handleCarouselChange = (index: number, field: keyof Banner, value: any) => {
        const newBanners = [...localCustomization.carouselBanners];
        newBanners[index] = { ...newBanners[index], [field]: value };
        const updated = { ...localCustomization, carouselBanners: newBanners };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const addBanner = () => {
        const newBanners: Banner[] = [
            ...localCustomization.carouselBanners,
            { id: Date.now().toString(), desktopImage: '', mobileImage: '', link: '', position: 'top' }
        ];
        const updated = { ...localCustomization, carouselBanners: newBanners };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const removeBanner = (index: number) => {
        const newBanners = localCustomization.carouselBanners.filter((_, i) => i !== index);
        const updated = { ...localCustomization, carouselBanners: newBanners };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const handleBannerReorder = (index: number, direction: 'up' | 'down') => {
        const banners = [...localCustomization.carouselBanners];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= banners.length) return;

        const temp = banners[swapIndex];
        banners[swapIndex] = banners[index];
        banners[index] = temp;

        const updated = { ...localCustomization, carouselBanners: banners };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const handleMidPageBannerChange = (field: keyof Banner, value: any) => {
        const updated = { ...localCustomization, midPageBanner: { ...localCustomization.midPageBanner, [field]: value } };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const handleFooterSubUpdate = (key: keyof StoreCustomization['footer'], value: any) => {
        // Correção de erro de referência 'prev' -> 'localCustomization'
        const correctUpdated = { ...localCustomization, footer: { ...localCustomization.footer, [key]: value } };
        setLocalCustomization(correctUpdated);
        syncNow(correctUpdated);
    };

    const handleSectionReorder = (visualIndex: number, direction: 'up' | 'down') => {
        // Work on the SORTED array (by .order) to match visual positions
        const sorted = [...localCustomization.homepageSections].sort((a, b) => (a.order || 0) - (b.order || 0));
        const swapIndex = direction === 'up' ? visualIndex - 1 : visualIndex + 1;
        if (swapIndex < 0 || swapIndex >= sorted.length) return;

        // Swap the two items
        const temp = sorted[swapIndex];
        sorted[swapIndex] = sorted[visualIndex];
        sorted[visualIndex] = temp;

        // Re-assign order values based on new position
        sorted.forEach((sec, i) => { sec.order = i + 1; });

        const updated = { ...localCustomization, homepageSections: sorted };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const handleSectionToggle = (index: number) => {
        const sections = [...localCustomization.homepageSections];
        sections[index].enabled = !sections[index].enabled;
        handleFieldChange('homepageSections', sections);
    };

    const handleSectionRename = (index: number, newName: string) => {
        const sections = [...localCustomization.homepageSections];
        sections[index].name = newName;
        handleFieldChange('homepageSections', sections);
    };

    const handleSectionFieldChange = (index: number, field: string, value: any) => {
        const sections = [...localCustomization.homepageSections];
        sections[index] = { ...sections[index], [field]: value };
        handleFieldChange('homepageSections', sections);
    };

    const handleAddSection = (sectionType: string) => {
        const sectionTemplates: Record<string, { id: string; name: string }> = {
            featuredProducts: { id: 'featuredProducts', name: 'Produtos em Destaque' },
            offers: { id: 'offers', name: 'Ofertas Especiais' },
            bestsellers: { id: 'bestsellers', name: 'Mais Vendidos' },
            carousel: { id: 'carousel', name: 'Carrossel de Banners' },
            featuredCollections: { id: 'featuredCollections', name: 'Coleções em Destaque' },
            recentlyViewed: { id: 'recentlyViewed', name: 'Vistos Recentemente' },
            midPageBanner: { id: 'midPageBanner', name: 'Banner do Meio' },
            custom: { id: `custom-${Date.now()}`, name: 'Seção Personalizada' },
        };

        const template = sectionTemplates[sectionType] || sectionTemplates.custom;

        const newSection = {
            id: template.id,
            name: template.name,
            enabled: true,
            order: localCustomization.homepageSections.length + 1
        };
        handleFieldChange('homepageSections', [...localCustomization.homepageSections, newSection]);
    };

    const handleRemoveSection = (index: number) => {
        const sections = localCustomization.homepageSections.filter((_, i) => i !== index);
        handleFieldChange('homepageSections', sections);
    };


    return (
        <div className="flex h-[calc(100vh-5rem)]">
            {/* Controls Sidebar */}
            <div className="w-96 flex-shrink-0 bg-[rgb(var(--color-brand-dark))] flex flex-col border-r border-[rgb(var(--color-brand-gray-light))]">
                <div className="flex gap-2 p-4 bg-[rgb(var(--color-brand-dark))] border-t border-[rgb(var(--color-brand-gray-light))] sticky bottom-0 z-20">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${saveSuccess
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-[rgb(var(--color-brand-gold-dark))] to-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                            } ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-[rgb(var(--color-brand-dark))] border-t-transparent rounded-full animate-spin"></span>
                                SALVANDO...
                            </>
                        ) : saveSuccess ? (
                            <>✅ SALVO NO BANCO!</>
                        ) : (
                            <>SALVAR NO SISTEMA</>
                        )}
                    </button>
                    <button
                        onClick={() => window.open('/', '_blank')}
                        className="py-3 px-4 bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] rounded-xl font-bold hover:bg-[rgb(var(--color-brand-gray-light))] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                        title="Ver Loja Ao Vivo"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </div>
                <header className="p-4 border-b border-[rgb(var(--color-brand-gray-light))] flex justify-between items-center">
                    <h2 className="text-xl font-display text-[rgb(var(--color-brand-gold))] uppercase tracking-wider">Editor de Vitrine</h2>
                    <button
                        onClick={() => {
                            syncNow();
                            alert('🔄 Sincronização forçada enviada!');
                        }}
                        className="p-2 bg-[rgb(var(--color-brand-gray))] hover:bg-[rgb(var(--color-brand-gray-light))] rounded-full text-[rgb(var(--color-brand-gold))] transition-all"
                        title="Forçar Sincronização com Preview"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" /></svg>
                    </button>
                </header>
                <p className="text-sm text-[rgb(var(--color-brand-text-dim))] p-4 pt-0">Personalize a aparência da sua loja.</p>
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    <Accordion title="Identidade Visual" defaultOpen>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2 text-sm">Logo da Loja</h4>
                                <ImageUploader currentImage={localCustomization.logoUrl} onImageUpload={(url) => handleFieldChange('logoUrl', url)} placeholderText="Logo da Loja" aspectRatio="square" />
                                <div className="mt-2">
                                    <label htmlFor="logo-max-width" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Largura Máxima: {localCustomization.logoMaxWidth || 200}px</label>
                                    <input type="range" id="logo-max-width" min="50" max="600" value={localCustomization.logoMaxWidth || 200} onChange={e => handleFieldChange('logoMaxWidth', parseInt(e.target.value))} className="w-full accent-[rgb(var(--color-brand-gold))]" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2 text-sm mt-4">Favicon (Ícone da Aba)</h4>
                                <ImageUploader currentImage={localCustomization.faviconUrl} onImageUpload={(url) => handleFieldChange('faviconUrl', url)} placeholderText="Ícone do Site (Favicon)" aspectRatio="square" />
                                <div className="mt-2">
                                    <label htmlFor="favicon-max-width" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Dimensão: {localCustomization.faviconMaxWidth || 32}px</label>
                                    <input type="range" id="favicon-max-width" min="16" max="128" value={localCustomization.faviconMaxWidth || 32} onChange={e => handleFieldChange('faviconMaxWidth', parseInt(e.target.value))} className="w-full accent-[rgb(var(--color-brand-gold))]" />
                                </div>
                                {/* Global Background Color */}
                                <div className="mt-4 p-2 bg-[rgb(var(--color-brand-dark))] rounded-lg border border-[rgb(var(--color-brand-gray-light))] shadow-sm">
                                    <h5 className="text-[10px] font-bold text-[rgb(var(--color-brand-gold))] uppercase mb-2">🎨 Cor de Fundo Global</h5>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={localCustomization.storeBackgroundColor || '#000000'}
                                            onChange={e => handleFieldChange('storeBackgroundColor', e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer border border-[rgb(var(--color-brand-gray-light))]"
                                            title="Cor de fundo da loja inteira"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-white">Fundo da Vitrine</span>
                                            <button
                                                onClick={() => handleFieldChange('storeBackgroundColor', '')}
                                                className="text-[10px] text-[rgb(var(--color-brand-text-dim))] hover:text-white text-left underline"
                                            >
                                                Resetar para Padrão
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="Página Inicial: Seções">
                        <div className="space-y-6">
                            {/* Hero Section */}
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2">Banner Principal (Hero)</h4>
                                <label htmlFor="hero-title" className="sr-only">Título do banner principal</label>
                                <input id="hero-title" value={localCustomization.hero.title} onChange={e => handleHeroChange('title', e.target.value)} placeholder="Título" className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm mb-2" />
                                <label htmlFor="hero-subtitle" className="sr-only">Subtítulo do banner principal</label>
                                <input id="hero-subtitle" value={localCustomization.hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} placeholder="Subtítulo" className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm mb-2" />
                                <label htmlFor="hero-button-anchor" className="sr-only">Link do Botão CTA</label>
                                <input id="hero-button-anchor" value={localCustomization.hero.buttonAnchor || ''} onChange={e => handleHeroChange('buttonAnchor', e.target.value)} placeholder="Link do Botão CTA (ex: #featuredProducts)" className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm mb-2 text-[rgb(var(--color-brand-gold))]" />
                                <ImageUploader currentImage={localCustomization.hero.desktopImage} onImageUpload={url => handleHeroChange('desktopImage', url)} placeholderText="Imagem Desktop" />
                                {/* Video background — replaces image when set */}
                                <div className="mt-3">
                                    <h5 className="text-xs font-bold text-[rgb(var(--color-brand-gold))] mb-1 flex items-center gap-1">
                                        🎬 Vídeo de Fundo
                                        <span className="text-[10px] font-normal text-[rgb(var(--color-brand-text-dim))]">(substitui imagem)</span>
                                    </h5>
                                    <VideoUploader
                                        currentVideo={localCustomization.hero.videoUrl || ''}
                                        onVideoChange={url => handleHeroChange('videoUrl', url)}
                                        placeholderText="Arraste ou clique para subir o vídeo"
                                        maxSizeMB={50}
                                    />
                                </div>
                                {/* Hero Colors */}
                                <div className="grid grid-cols-3 gap-2 mt-4 bg-[rgb(var(--color-brand-dark))] p-2 rounded-lg border border-[rgb(var(--color-brand-gray-light))]">
                                    <div>
                                        <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">Cor Título</label>
                                        <input type="color" value={localCustomization.hero.titleColor || '#FFFFFF'} onChange={e => handleHeroChange('titleColor', e.target.value)} className="w-full h-8 rounded cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">Cor Subtítulo</label>
                                        <input type="color" value={localCustomization.hero.subtitleColor || '#FFFFFF'} onChange={e => handleHeroChange('subtitleColor', e.target.value)} className="w-full h-8 rounded cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">Cor Botão</label>
                                        <input type="color" value={localCustomization.hero.buttonColor || '#ffd700'} onChange={e => handleHeroChange('buttonColor', e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent" />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">🖼️ Cor de Fundo do Bloco (Fallback)</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={localCustomization.hero.backgroundColor || '#000000'} onChange={e => handleHeroChange('backgroundColor', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent" />
                                            <button onClick={() => handleHeroChange('backgroundColor', '')} className="text-[10px] text-[rgb(var(--color-brand-text-dim))] hover:text-white" title="Resetar">↩ Resetar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Carousel Section */}
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2">Carrossel de Banners</h4>
                                <div className="space-y-2">
                                    {localCustomization.carouselBanners.map((banner, index) => (
                                        <div key={banner.id} className="bg-[rgb(var(--color-brand-gray))] p-2 rounded-md">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Banner {index + 1}</p>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleBannerReorder(index, 'up')} disabled={index === 0} className="text-[rgb(var(--color-brand-text-dim))] hover:text-white disabled:opacity-20"><ChevronUp size={14} /></button>
                                                        <button onClick={() => handleBannerReorder(index, 'down')} disabled={index === localCustomization.carouselBanners.length - 1} className="text-[rgb(var(--color-brand-text-dim))] hover:text-white disabled:opacity-20"><ChevronDown size={14} /></button>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeBanner(index)} aria-label={`Remover banner ${index + 1}`} title={`Remover banner ${index + 1}`}><TrashIcon className="w-4 h-4 text-red-500" /></button>
                                            </div>
                                            <div className="mb-2">
                                                <label className="text-[10px] text-[rgb(var(--color-brand-text-dim))] block mb-1">Posição</label>
                                                <select
                                                    value={banner.position || 'top'}
                                                    onChange={e => handleCarouselChange(index, 'position', e.target.value)}
                                                    className="w-full bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded px-2 py-1 text-xs"
                                                >
                                                    <option value="top">Topo da Loja</option>
                                                    <option value="middle">Meio da Loja</option>
                                                    <option value="bottom">Fim da Loja</option>
                                                </select>
                                            </div>
                                            <ImageUploader currentImage={banner.desktopImage} onImageUpload={url => handleCarouselChange(index, 'desktopImage', url)} placeholderText="Imagem do Banner" />
                                        </div>
                                    ))}
                                    <button onClick={addBanner} className="text-sm w-full p-2 bg-[rgb(var(--color-brand-gray))] rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] mb-4">+ Adicionar Banner</button>
                                    <div className="pt-2 border-t border-[rgb(var(--color-brand-gray-light))] mt-4 space-y-4">
                                        <div>
                                            <label className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Altura Desktop: {localCustomization.carouselHeight || 400}px</label>
                                            <input
                                                type="range"
                                                min="200"
                                                max="1000"
                                                step="10"
                                                value={localCustomization.carouselHeight || 400}
                                                onChange={e => handleFieldChange('carouselHeight', parseInt(e.target.value))}
                                                className="w-full accent-[rgb(var(--color-brand-gold))]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Altura Mobile: {localCustomization.carouselHeightMobile || 300}px</label>
                                            <input
                                                type="range"
                                                min="150"
                                                max="600"
                                                step="10"
                                                value={localCustomization.carouselHeightMobile || 300}
                                                onChange={e => handleFieldChange('carouselHeightMobile', parseInt(e.target.value))}
                                                className="w-full accent-[rgb(var(--color-brand-gold))]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-[rgb(var(--color-brand-dark))] rounded-md border border-[rgb(var(--color-brand-gray-light))] shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-white">Largura Total</span>
                                                <span className="text-[10px] text-[rgb(var(--color-brand-text-dim))]">Ocupar toda a tela</span>
                                            </div>
                                            <button
                                                onClick={() => handleFieldChange('carouselFullWidth', !localCustomization.carouselFullWidth)}
                                                className={`w-10 h-5 rounded-full transition-all relative ${localCustomization.carouselFullWidth !== false ? 'bg-[rgb(var(--color-brand-gold))]' : 'bg-gray-600'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${localCustomization.carouselFullWidth !== false ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Modular Sections List */}
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2 flex justify-between items-center text-sm">
                                    <span>Ordem das Seções (Blocos)</span>
                                </h4>
                                <p className="text-[10px] text-[rgb(var(--color-brand-text-dim))] leading-tight mb-3">Reorganize, renomeie ou oculte as seções da sua página inicial.</p>

                                <div className="space-y-2">
                                    {/* Sort by order property if existing, otherwise just use array index */}
                                    {[...localCustomization.homepageSections].sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, index) => {
                                        const origIndex = localCustomization.homepageSections.findIndex(s => s.id === section.id);
                                        const isExpanded = expandedSectionId === section.id;
                                        const hasCustomStyle = section.backgroundColor || section.titleColor || section.subtitle;

                                        return (
                                            <div key={section.id} className={`flex flex-col gap-2 p-2 rounded-md border transition-all duration-300 ${section.enabled ? 'bg-[rgb(var(--color-brand-gray))] border-[rgb(var(--color-brand-gray-light))]' : 'bg-[rgb(var(--color-brand-dark))] border-[rgb(var(--color-brand-gray-light))] opacity-75'}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <button onClick={() => handleSectionReorder(index, 'up')} disabled={index === 0} className="text-[rgb(var(--color-brand-text-dim))] hover:text-white disabled:opacity-30 p-0.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                                        </button>
                                                        <button onClick={() => handleSectionReorder(index, 'down')} disabled={index === localCustomization.homepageSections.length - 1} className="text-[rgb(var(--color-brand-text-dim))] hover:text-white disabled:opacity-30 p-0.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                    </div>

                                                    <button onClick={() => handleSectionToggle(origIndex)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))] shrink-0" title={section.enabled ? "Ocultar" : "Mostrar"}>
                                                        {section.enabled ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <input
                                                            value={section.name}
                                                            onChange={(e) => handleSectionRename(origIndex, e.target.value)}
                                                            className={`w-full bg-transparent border-none text-sm focus:ring-0 p-0 ${!section.enabled ? 'line-through text-[rgb(var(--color-brand-text-dim))]' : 'text-white font-medium'}`}
                                                            placeholder="Nome da Seção"
                                                        />
                                                        {hasCustomStyle && !isExpanded && (
                                                            <div className="flex gap-1 mt-0.5">
                                                                {section.backgroundColor && <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: section.backgroundColor }} title="Cor de fundo ativa"></div>}
                                                                {section.titleColor && <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: section.titleColor }} title="Cor de texto ativa"></div>}
                                                                {section.subtitle && <Type size={8} className="text-[rgb(var(--color-brand-gold))]" title="Subtítulo ativo" />}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                                                        className={`p-1.5 rounded-md transition-all ${isExpanded ? 'text-[rgb(var(--color-brand-gold)) ] bg-[rgb(var(--color-brand-gray-light))]' : 'text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray-light))]'}`}
                                                        title="Design do Bloco"
                                                    >
                                                        <Palette size={16} />
                                                    </button>

                                                    {!['hero', 'carousel', 'featuredProducts', 'offers', 'bestsellers', 'featuredCollections', 'recentlyViewed', 'midPageBanner'].includes(section.id) && (
                                                        <button onClick={() => handleRemoveSection(origIndex)} title="Excluir Bloco" className="shrink-0 p-1">
                                                            <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-400" />
                                                        </button>
                                                    )}
                                                </div>

                                                {isExpanded && (
                                                    <div className="mt-2 p-3 bg-[rgb(var(--color-brand-dark))] rounded-lg border border-[rgb(var(--color-brand-gray-light))] space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">📝 Título / Nome da Seção</label>
                                                                <input
                                                                    type="text"
                                                                    value={section.name}
                                                                    onChange={(e) => handleSectionRename(origIndex, e.target.value)}
                                                                    placeholder="Título principal do bloco"
                                                                    className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded p-2 text-xs text-white focus:border-[rgb(var(--color-brand-gold))] outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">📜 Subtítulo / Descrição</label>
                                                                <textarea
                                                                    value={section.subtitle || ''}
                                                                    onChange={(e) => handleSectionFieldChange(origIndex, 'subtitle', e.target.value)}
                                                                    placeholder="Texto complementar abaixo do título"
                                                                    rows={2}
                                                                    className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded p-2 text-xs text-white focus:border-[rgb(var(--color-brand-gold))] outline-none resize-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 pt-1">
                                                            <div>
                                                                <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">🔤 Cor Título</label>
                                                                <div className="flex items-center gap-1.5">
                                                                    <input
                                                                        type="color"
                                                                        value={section.titleColor || '#FFFFFF'}
                                                                        onChange={(e) => handleSectionFieldChange(origIndex, 'titleColor', e.target.value)}
                                                                        className="w-7 h-7 rounded cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleSectionFieldChange(origIndex, 'titleColor', '')}
                                                                        className="text-[10px] text-[rgb(var(--color-brand-text-dim))] hover:text-white"
                                                                        title="Resetar"
                                                                    >
                                                                        ↩
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">🔡 Cor Subtítulo</label>
                                                                <div className="flex items-center gap-1.5">
                                                                    <input
                                                                        type="color"
                                                                        value={section.subtitleColor || '#9CA3AF'}
                                                                        onChange={(e) => handleSectionFieldChange(origIndex, 'subtitleColor', e.target.value)}
                                                                        className="w-7 h-7 rounded cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleSectionFieldChange(origIndex, 'subtitleColor', '')}
                                                                        className="text-[10px] text-[rgb(var(--color-brand-text-dim))] hover:text-white"
                                                                        title="Resetar"
                                                                    >
                                                                        ↩
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-[rgb(var(--color-brand-gold))] uppercase block mb-1">🖼️ Fundo Bloco</label>
                                                                <div className="flex items-center gap-1.5">
                                                                    <input
                                                                        type="color"
                                                                        value={section.backgroundColor || '#000000'}
                                                                        onChange={(e) => handleSectionFieldChange(origIndex, 'backgroundColor', e.target.value)}
                                                                        className="w-7 h-7 rounded cursor-pointer border border-[rgb(var(--color-brand-gray-light))] bg-transparent"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleSectionFieldChange(origIndex, 'backgroundColor', '')}
                                                                        className="text-[10px] text-[rgb(var(--color-brand-text-dim))] hover:text-white"
                                                                        title="Resetar"
                                                                    >
                                                                        ↩
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <p className="text-[10px] text-[rgb(var(--color-brand-text-dim))]/60 mt-3 text-center">
                                        Use o olhinho 👁️ em cada bloco para ocultar ou exibir na loja.
                                    </p>
                                </div>
                            </div>

                            {/* Mid-page Banner */}
                            <div className="pt-4 border-t border-[rgb(var(--color-brand-gray-light))]">
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2">Banner do Meio da Página</h4>
                                <div className="space-y-4">
                                    <ImageUploader currentImage={localCustomization.midPageBanner.desktopImage} onImageUpload={url => handleMidPageBannerChange('desktopImage', url)} placeholderText="Imagem do Banner" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-[rgb(var(--color-brand-text-dim))] block mb-1">Altura Desktop: {localCustomization.midPageBanner.height || 400}px</label>
                                            <input
                                                type="range"
                                                min="50"
                                                max="800"
                                                step="10"
                                                value={localCustomization.midPageBanner.height || 400}
                                                onChange={e => handleMidPageBannerChange('height', parseInt(e.target.value))}
                                                className="w-full accent-[rgb(var(--color-brand-gold))]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[rgb(var(--color-brand-text-dim))] block mb-1">Altura Mobile: {localCustomization.midPageBanner.mobileHeight || 300}px</label>
                                            <input
                                                type="range"
                                                min="50"
                                                max="600"
                                                step="10"
                                                value={localCustomization.midPageBanner.mobileHeight || 300}
                                                onChange={e => handleMidPageBannerChange('mobileHeight', parseInt(e.target.value))}
                                                className="w-full accent-[rgb(var(--color-brand-gold))]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-2 bg-[rgb(var(--color-brand-dark))] rounded-md border border-[rgb(var(--color-brand-gray-light))] shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-white">Largura Total</span>
                                            <span className="text-[10px] text-[rgb(var(--color-brand-text-dim))]">Ignorar container lateral</span>
                                        </div>
                                        <button
                                            onClick={() => handleMidPageBannerChange('fullWidth', !localCustomization.midPageBanner.fullWidth)}
                                            className={`w-10 h-5 rounded-full transition-all relative ${localCustomization.midPageBanner.fullWidth ? 'bg-[rgb(var(--color-brand-gold))]' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${localCustomization.midPageBanner.fullWidth ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Link do Banner</label>
                                        <input
                                            value={localCustomization.midPageBanner.link || ''}
                                            onChange={e => handleMidPageBannerChange('link', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="Rodapé">
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="footer-description" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Descrição</label>
                                <textarea id="footer-description" value={localCustomization.footer.description} onChange={e => handleFooterSubUpdate('description', e.target.value)} rows={2} className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="footer-address" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">Endereço Completo</label>
                                <input id="footer-address" value={localCustomization.footer.businessAddress} onChange={e => handleFooterSubUpdate('businessAddress', e.target.value)} placeholder="Rua Exemplo, 123 - Centro, São Paulo - SP, 01010-010" className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="footer-email" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">E-mail de Contato</label>
                                <input id="footer-email" value={localCustomization.footer.contactEmail} onChange={e => handleFooterSubUpdate('contactEmail', e.target.value)} placeholder="contato@rsprolipsi.com.br" className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="footer-cnpj" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-1">CNPJ</label>
                                <input id="footer-cnpj" value={localCustomization.footer.cnpj} onChange={e => handleFooterSubUpdate('cnpj', e.target.value)} placeholder="00.000.000/0001-00" className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm" />
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="Redes Sociais">
                        <div className="space-y-3">
                            <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Gerenciar ícones de redes sociais no rodapé</p>
                            {localCustomization.footer.socialLinks?.map((social, idx) => (
                                <div key={idx} className="bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-[rgb(var(--color-brand-gold))] uppercase">{social.platform}</span>
                                        <button onClick={() => {
                                            const updated = localCustomization.footer.socialLinks.filter((_, i) => i !== idx);
                                            handleFooterSubUpdate('socialLinks', updated);
                                        }} title="Remover">
                                            <TrashIcon className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                    <label htmlFor={`social-url-${idx}`} className="sr-only">URL da rede {social.platform}</label>
                                    <input
                                        id={`social-url-${idx}`}
                                        value={social.url}
                                        onChange={e => {
                                            const updated = [...localCustomization.footer.socialLinks];
                                            updated[idx] = { ...updated[idx], url: e.target.value };
                                            handleFooterSubUpdate('socialLinks', updated);
                                        }}
                                        placeholder="https://..."
                                        className="w-full bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-xs"
                                        aria-label={`URL para ${social.platform}`}
                                    />
                                </div>
                            ))}
                            <div className="bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-3">
                                <label htmlFor="add-social-select" className="text-xs text-[rgb(var(--color-brand-text-dim))] block mb-2">Adicionar Nova Rede</label>
                                <select
                                    id="add-social-select"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const newSocial = { platform: e.target.value, url: '' };
                                            handleFooterSubUpdate('socialLinks', [...(localCustomization.footer.socialLinks || []), newSocial]);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="w-full text-sm bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2"
                                    aria-label="Selecionar rede social"
                                >
                                    <option value="">Selecione a plataforma...</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="pinterest">Pinterest</option>
                                </select>
                            </div>
                        </div>
                    </Accordion>
                    <Accordion title="CSS Personalizado">
                        <textarea value={localCustomization.customCss || ''} onChange={e => handleFieldChange('customCss', e.target.value)} rows={10} className="w-full bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-md p-2 text-sm font-mono" />
                    </Accordion>
                </main>
                <footer className="p-4 border-t border-[rgb(var(--color-brand-gray-light))] flex-shrink-0">
                    {hasChanges && <p className="text-xs text-center text-[rgb(var(--color-brand-gold))] mb-2">Você tem alterações não salvas.</p>}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDiscard}
                            disabled={!hasChanges || isSaving}
                            className="flex-1 text-sm font-semibold bg-[rgb(var(--color-brand-gray))] py-2 px-4 rounded-md disabled:opacity-50 transition-all active:scale-95"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className={`flex-1 text-sm font-bold py-2 px-4 rounded-md transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${saveSuccess
                                ? 'bg-green-500 text-white'
                                : 'bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] disabled:opacity-50'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-[rgb(var(--color-brand-dark))] border-t-transparent rounded-full animate-spin"></span>
                                    SAVING...
                                </>
                            ) : saveSuccess ? (
                                <>✅ SALVO!</>
                            ) : (
                                <>SALVAR NO SISTEMA</>
                            )}
                        </button>
                    </div>
                </footer>
            </div>

            {/* Live Preview */}
            <div className="flex-1 bg-black p-4">
                <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                    <iframe
                        id="preview-iframe"
                        name="preview-iframe"
                        src={iframeSrc}
                        className="w-full h-full border-0 rounded-lg shadow-inner bg-white"
                        title="Live Preview"
                    />
                </div>
            </div>
        </div>
    );
};

export default StorefrontEditor;
