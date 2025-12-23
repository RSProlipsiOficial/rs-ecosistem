
import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ImageUploader } from './ImageUploader';
import { TrashIcon } from './icons/TrashIcon';

interface BannerDashboardProps {
    banners: Banner[];
    onUpdate: (newBanners: Banner[]) => void;
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


const BannerDashboard: React.FC<BannerDashboardProps> = ({ banners, onUpdate }) => {
    const [localBanners, setLocalBanners] = useState<Banner[]>(banners);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        setLocalBanners(banners);
    }, [banners]);
    
    const hasChanges = JSON.stringify(localBanners) !== JSON.stringify(banners);

    const handleSave = () => {
        onUpdate(localBanners);
    };

    const handleDiscard = () => {
        setLocalBanners(banners);
    };

    const handleBannerChange = (index: number, field: keyof Banner, value: string) => {
        const updatedBanners = [...localBanners];
        updatedBanners[index] = { ...updatedBanners[index], [field]: value };
        setLocalBanners(updatedBanners);
    };

    const addBanner = () => {
        const newBanner: Banner = {
            id: `dash-banner-${Date.now()}`,
            desktopImage: '',
            mobileImage: '',
            link: '#'
        };
        setLocalBanners(prev => [...prev, newBanner]);
    };

    const removeBanner = (id: string) => {
        setLocalBanners(prev => prev.filter(banner => banner.id !== id));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        if (index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = () => {
        if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
            return;
        }

        const newBanners = [...localBanners];
        const draggedBanner = newBanners.splice(draggedIndex, 1)[0];
        newBanners.splice(dragOverIndex, 0, draggedBanner);

        setLocalBanners(newBanners);
    };

    const handleDragEnd = () => {
        handleDrop();
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="space-y-6">
            <div className="pb-6 mb-6 flex justify-end items-center border-b border-[rgb(var(--color-brand-gray-light))]">
                 <div className="flex items-center gap-4">
                    {hasChanges && <p className="text-sm text-[rgb(var(--color-brand-gold))]">Você tem alterações não salvas.</p>}
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges}
                        className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar Banners
                    </button>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-[rgb(var(--color-brand-text-dim))] max-w-2xl">Gerencie os banners que aparecem na página inicial do seu painel de administrador. Use este espaço para anúncios internos, lançamentos e comunicados.</p>
                    <button onClick={addBanner} className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] whitespace-nowrap">
                        + Adicionar Banner
                    </button>
                </div>
                <div className="space-y-4">
                    {localBanners.map((banner, index) => (
                        <React.Fragment key={banner.id}>
                            {dragOverIndex === index && draggedIndex !== index && (
                                <div className="h-2 my-2 border-2 border-dashed border-[rgb(var(--color-brand-gold))] rounded-lg bg-[rgb(var(--color-brand-gold))]/[.10]" />
                            )}
                            <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={() => handleDragEnter(index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={`bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg space-y-3 transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className="flex justify-between items-center p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="cursor-grab text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]" aria-label="Arrastar para reordenar">
                                            <DragHandleIcon className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-md text-[rgb(var(--color-brand-text-light))] font-semibold">Banner {index + 1}</h4>
                                    </div>
                                    <button onClick={() => removeBanner(banner.id)} className="p-1 text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="px-4 pb-4 space-y-3">
                                    <div>
                                        <label htmlFor={`carouselLink${index}`} className="block text-sm font-medium text-[rgb(var(--color-brand-text-dim))] mb-1">Link do Banner (opcional)</label>
                                        <input id={`carouselLink${index}`} type="text" value={banner.link} onChange={e => handleBannerChange(index, 'link', e.target.value)} className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))]"/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ImageUploader currentImage={banner.desktopImage} onImageUpload={url => handleBannerChange(index, 'desktopImage', url)} placeholderText="Imagem para Desktop (1200x400 recomendado)" />
                                        <ImageUploader currentImage={banner.mobileImage} onImageUpload={url => handleBannerChange(index, 'mobileImage', url)} placeholderText="Imagem para Celular (400x300 recomendado)" />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                    {localBanners.length === 0 && <p className="text-center text-[rgb(var(--color-brand-text-dim))] py-8">Nenhum banner encontrado. Adicione um para começar.</p>}
                </div>
            </div>
        </div>
    );
};

export default BannerDashboard;