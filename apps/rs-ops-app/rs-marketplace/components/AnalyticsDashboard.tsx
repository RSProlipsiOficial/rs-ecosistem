

import React, { useState, useEffect } from 'react';
import { StoreCustomization, Banner } from '../types';
import { ImageUploader } from './ImageUploader';
import { TrashIcon } from './icons/TrashIcon';

interface StoreBannerEditorProps {
    customization: StoreCustomization;
    onUpdate: (updatedData: Partial<StoreCustomization>) => void;
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

const StoreBannerEditor: React.FC<StoreBannerEditorProps> = ({ customization, onUpdate, senderId, isReceivingSync }) => {
    const [localCustomization, setLocalCustomization] = useState<StoreCustomization>(customization);

    useEffect(() => {
        if (!isReceivingSync) {
            setLocalCustomization(customization);
        }
    }, [customization, isReceivingSync]);

    const hasChanges = JSON.stringify(localCustomization) !== JSON.stringify(customization);

    const handleSave = () => {
        onUpdate(localCustomization);
    };

    const handleDiscard = () => {
        setLocalCustomization(customization);
    };

    // Canais persistentes v2.7
    const syncChannelRef = React.useRef<BroadcastChannel | null>(null);
    const handshakeChannelRef = React.useRef<BroadcastChannel | null>(null);

    React.useEffect(() => {
        // Inicializa canais apenas uma vez no mount v2.7.1
        if (!syncChannelRef.current) {
            syncChannelRef.current = new BroadcastChannel('rs_live_preview');
        }
        if (!handshakeChannelRef.current) {
            handshakeChannelRef.current = new BroadcastChannel('rs_live_preview_handshake');

            handshakeChannelRef.current.onmessage = (event) => {
                if (event.data?.type === 'PREVIEW_READY') {
                    console.log('%c[BannerEditor] Handshake Received: Preview is Ready. Sending state...', 'color: #00ff00; font-weight: bold;');
                    syncNow();
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

    // Sincronização Ultra-Resiliente v3.4 (Heavy Payload Support + Identity + Quota Shield)
    const syncNow = (customData?: StoreCustomization) => {
        if (isReceivingSync) return; // Trava contra Echo do pai (v3.6)

        const dataToSync = customData || localCustomization;
        if (!dataToSync) return;

        const syncPayload = {
            type: 'LIVE_PREVIEW_UPDATE',
            data: dataToSync,
            senderId: senderId,
            version: '3.4-SENIOR',
            timestamp: Date.now()
        };

        // 1. Canal de Banners dedicado
        if (dataToSync.carouselBanners?.length > 0) {
            try { localStorage.setItem('rs_banners_buffer', JSON.stringify(dataToSync.carouselBanners)); } catch (e) { console.warn('[BannerEditor] Buffer Full'); }
        }

        // 2. BroadcastChannel
        if (syncChannelRef.current) {
            try { syncChannelRef.current.postMessage(syncPayload); } catch (e) { }
        }

        // 3. postMessage
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(syncPayload, '*');
        }

        // 4. LocalStorage Buffer (Object Fallback) - v3.4: REMOVENDO BANNERS TAMBÉM
        try {
            const lightData = {
                ...dataToSync,
                carouselBanners: [{ id: 'BUFFERED', desktopImage: '', mobileImage: '', link: '' }]
            };
            localStorage.setItem('rs_preview_buffer', JSON.stringify({ ...syncPayload, data: lightData }));
        } catch (e) {
            try { localStorage.removeItem('rs_preview_buffer'); } catch (ex) { }
        }

        console.log(`[BannerEditor v3.4] 📤 Sync Sent: ${dataToSync.carouselBanners.length} banners`);
    };

    const handleHeroChange = (field: keyof StoreCustomization['hero'], value: string) => {
        const updated = { ...localCustomization, hero: { ...localCustomization.hero, [field]: value } };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const handleCarouselChange = (index: number, field: keyof Banner, value: string) => {
        const updatedBanners = [...localCustomization.carouselBanners];
        updatedBanners[index] = { ...updatedBanners[index], [field]: value };
        const updated = { ...localCustomization, carouselBanners: updatedBanners };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const addBanner = () => {
        const newBanner: Banner = { id: `carousel-${Date.now()}`, desktopImage: '', mobileImage: '', link: '#' };
        const updated = { ...localCustomization, carouselBanners: [...localCustomization.carouselBanners, newBanner] };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const removeBanner = (id: string) => {
        const updated = { ...localCustomization, carouselBanners: localCustomization.carouselBanners.filter(b => b.id !== id) };
        setLocalCustomization(updated);
        syncNow(updated);
    };

    const handleMidPageBannerChange = (field: keyof Banner, value: string) => {
        const updated = { ...localCustomization, midPageBanner: { ...localCustomization.midPageBanner, [field]: value } };
        setLocalCustomization(updated);
        syncNow(updated);
    };


    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-end items-center border-b border-[rgb(var(--color-brand-gray-light))]">
                <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-[rgb(var(--color-brand-gold))]">Você tem alterações não salvas.</p>}
                    <button onClick={handleDiscard} disabled={!hasChanges} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] disabled:opacity-50 disabled:cursor-not-allowed">
                        Descartar
                    </button>
                    <button onClick={handleSave} disabled={!hasChanges} className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed">
                        Salvar Banners
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <Accordion title="Banner Principal (Hero)" defaultOpen>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="heroTitle" className="block text-sm font-medium text-[rgb(var(--color-brand-text-dim))] mb-1">Título</label>
                            <input id="heroTitle" type="text" value={localCustomization.hero.title} onChange={e => handleHeroChange('title', e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                        </div>
                        <div>
                            <label htmlFor="heroSubtitle" className="block text-sm font-medium text-[rgb(var(--color-brand-text-dim))] mb-1">Subtítulo</label>
                            <input id="heroSubtitle" type="text" value={localCustomization.hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ImageUploader currentImage={localCustomization.hero.desktopImage} onImageUpload={url => handleHeroChange('desktopImage', url)} placeholderText="Imagem para Desktop (1600x900 recomendado)" />
                            <ImageUploader currentImage={localCustomization.hero.mobileImage} onImageUpload={url => handleHeroChange('mobileImage', url)} placeholderText="Imagem para Celular (800x1200 recomendado)" />
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Carrossel de Banners">
                    <div className="space-y-4">
                        <button onClick={addBanner} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">
                            + Adicionar Banner ao Carrossel
                        </button>
                        {localCustomization.carouselBanners.map((banner, index) => (
                            <div key={banner.id} className="bg-[rgb(var(--color-brand-gray))]/[.50] p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-md text-[rgb(var(--color-brand-text-light))] font-semibold">Banner {index + 1}</h4>
                                    <button onClick={() => removeBanner(banner.id)} className="p-1 text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                                <div>
                                    <label htmlFor={`carouselLink${index}`} className="block text-sm font-medium text-[rgb(var(--color-brand-text-dim))] mb-1">Link do Banner (opcional)</label>
                                    <input id={`carouselLink${index}`} type="text" value={banner.link} onChange={e => handleCarouselChange(index, 'link', e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ImageUploader currentImage={banner.desktopImage} onImageUpload={url => handleCarouselChange(index, 'desktopImage', url)} placeholderText="Desktop (1200x400)" />
                                    <ImageUploader currentImage={banner.mobileImage} onImageUpload={url => handleCarouselChange(index, 'mobileImage', url)} placeholderText="Celular (400x300)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Accordion>
                <Accordion title="Banner do Meio da Página">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="midPageLink" className="block text-sm font-medium text-[rgb(var(--color-brand-text-dim))] mb-1">Link do Banner (opcional)</label>
                            <input id="midPageLink" type="text" value={localCustomization.midPageBanner.link} onChange={e => handleMidPageBannerChange('link', e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ImageUploader currentImage={localCustomization.midPageBanner.desktopImage} onImageUpload={url => handleMidPageBannerChange('desktopImage', url)} placeholderText="Desktop (1200x300)" />
                            <ImageUploader currentImage={localCustomization.midPageBanner.mobileImage} onImageUpload={url => handleMidPageBannerChange('mobileImage', url)} placeholderText="Celular (400x200)" />
                        </div>
                    </div>
                </Accordion>
            </div>
        </div>
    );
};

export default StoreBannerEditor;