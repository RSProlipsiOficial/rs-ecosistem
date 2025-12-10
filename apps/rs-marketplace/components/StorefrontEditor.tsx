
import React, { useState, useEffect, useRef } from 'react';
import { StoreCustomization, Banner, View } from '../types';
import { ImageUploader } from './ImageUploader';
import { TrashIcon } from './icons/TrashIcon';

interface StorefrontEditorProps {
    customization: StoreCustomization;
    onUpdate: (updatedData: Partial<StoreCustomization>) => void;
    onNavigate: (view: View) => void;
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

const StorefrontEditor: React.FC<StorefrontEditorProps> = ({ customization, onUpdate, onNavigate }) => {
    const [localCustomization, setLocalCustomization] = useState<StoreCustomization>(customization);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const hasChanges = JSON.stringify(localCustomization) !== JSON.stringify(customization);

    useEffect(() => {
        setLocalCustomization(customization);
    }, [customization]);

    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'LIVE_PREVIEW_UPDATE',
                payload: localCustomization
            }, '*');
        }
    }, [localCustomization]);

    const handleSave = () => {
        // Salva no localStorage
        localStorage.setItem('rs-store-customization', JSON.stringify(localCustomization));

        // Atualiza o estado
        onUpdate(localCustomization);

        // Recarrega para aplicar
        alert('✅ Salvo! Recarregando...');
        setTimeout(() => window.location.reload(), 300);
    };

    const handleDiscard = () => {
        setLocalCustomization(customization);
    };

    const handleFieldChange = (field: keyof StoreCustomization, value: any) => {
        setLocalCustomization(prev => ({ ...prev, [field]: value }));
    };

    const handleHeroChange = (field: keyof StoreCustomization['hero'], value: string) => {
        setLocalCustomization(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
    };

    const handleCarouselChange = (index: number, field: keyof Banner, value: string) => {
        const updatedBanners = [...localCustomization.carouselBanners];
        updatedBanners[index] = { ...updatedBanners[index], [field]: value };
        setLocalCustomization(prev => ({ ...prev, carouselBanners: updatedBanners }));
    };

    const addCarouselBanner = () => {
        const newBanner: Banner = { id: `carousel-${Date.now()}`, desktopImage: '', mobileImage: '', link: '#' };
        setLocalCustomization(prev => ({ ...prev, carouselBanners: [...prev.carouselBanners, newBanner] }));
    };

    const removeCarouselBanner = (id: string) => {
        setLocalCustomization(prev => ({ ...prev, carouselBanners: prev.carouselBanners.filter(b => b.id !== id) }));
    };

    const handleMidPageBannerChange = (field: keyof Banner, value: string) => {
        setLocalCustomization(prev => ({ ...prev, midPageBanner: { ...prev.midPageBanner, [field]: value } }));
    };

    const handleFooterSubUpdate = (key: keyof StoreCustomization['footer'], value: any) => {
        setLocalCustomization(prev => ({ ...prev, footer: { ...prev.footer, [key]: value } }));
    };


    return (
        <div className="flex h-[calc(100vh-5rem)]">
            {/* Controls Sidebar */}
            <div className="w-96 flex-shrink-0 bg-[rgb(var(--color-brand-dark))] flex flex-col border-r border-[rgb(var(--color-brand-gray-light))]">
                <header className="p-4 border-b border-[rgb(var(--color-brand-gray-light))] flex-shrink-0">
                    <h2 className="text-xl font-bold">Editor de Vitrine</h2>
                    <p className="text-sm text-[rgb(var(--color-brand-text-dim))]">Personalize a aparência da sua loja.</p>
                </header>
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    <Accordion title="Identidade Visual" defaultOpen>
                        <div className="space-y-4">
                            <ImageUploader currentImage={localCustomization.logoUrl} onImageUpload={(url) => handleFieldChange('logoUrl', url)} placeholderText="Logo da Loja" aspectRatio="square" />
                            <ImageUploader currentImage={localCustomization.faviconUrl} onImageUpload={(url) => handleFieldChange('faviconUrl', url)} placeholderText="Ícone do Site (Favicon)" aspectRatio="square" />
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
                                <ImageUploader currentImage={localCustomization.hero.desktopImage} onImageUpload={url => handleHeroChange('desktopImage', url)} placeholderText="Imagem Desktop" />
                            </div>
                            {/* Carousel Section */}
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2">Carrossel de Banners</h4>
                                <div className="space-y-2">
                                    {localCustomization.carouselBanners.map((banner, index) => (
                                        <div key={banner.id} className="bg-[rgb(var(--color-brand-gray))] p-2 rounded-md">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-xs text-[rgb(var(--color-brand-text-dim))]">Banner {index + 1}</p>
                                                <button onClick={() => removeCarouselBanner(banner.id)} aria-label={`Remover banner ${index + 1}`} title={`Remover banner ${index + 1}`}><TrashIcon className="w-4 h-4 text-red-500" /></button>
                                            </div>
                                            <ImageUploader currentImage={banner.desktopImage} onImageUpload={url => handleCarouselChange(index, 'desktopImage', url)} placeholderText="Imagem do Banner" />
                                        </div>
                                    ))}
                                    <button onClick={addCarouselBanner} className="text-sm w-full p-2 bg-[rgb(var(--color-brand-gray))] rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]">+ Adicionar Banner</button>
                                </div>
                            </div>
                            {/* Mid-page Banner */}
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--color-brand-gold))] mb-2">Banner do Meio da Página</h4>
                                <ImageUploader currentImage={localCustomization.midPageBanner.desktopImage} onImageUpload={url => handleMidPageBannerChange('desktopImage', url)} placeholderText="Imagem do Banner" />
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
                        <button onClick={handleDiscard} disabled={!hasChanges} className="flex-1 text-sm font-semibold bg-[rgb(var(--color-brand-gray))] py-2 px-4 rounded-md disabled:opacity-50">Descartar</button>
                        <button onClick={handleSave} disabled={!hasChanges} className="flex-1 text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md disabled:opacity-50">Salvar</button>
                    </div>
                </footer>
            </div>

            {/* Live Preview */}
            <div className="flex-1 bg-black p-4">
                <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                    <iframe
                        ref={iframeRef}
                        src={window.location.href}
                        title="Live Preview"
                        className="w-full h-full border-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default StorefrontEditor;
