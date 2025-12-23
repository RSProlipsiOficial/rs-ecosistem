
import React from 'react';
import { MarketingPixel, View, MarketingPixelType } from '../types';
import { FacebookIcon } from './icons/FacebookIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { PinterestIcon } from './icons/PinterestIcon';
import { KwaiIcon } from './icons/KwaiIcon';
import { TaboolaIcon } from './icons/TaboolaIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { ToggleSwitch } from './ToggleSwitch';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DuplicateIcon } from './icons/DuplicateIcon';
import { SnapchatIcon } from './icons/SnapchatIcon';
import { CriteoIcon } from './icons/CriteoIcon';
import { OutbrainIcon } from './icons/OutbrainIcon';
import { BingIcon } from './icons/BingIcon';
import { HotjarIcon } from './icons/HotjarIcon';

interface ManageMarketingPixelsProps {
    pixels: MarketingPixel[];
    onNavigate: (view: View, data?: MarketingPixel) => void;
    onDelete: (id: string) => void;
    onStatusToggle: (id: string) => void;
    onDuplicate: (id: string) => void;
}

const icons: Record<MarketingPixelType, React.FC<any>> = {
    'Facebook': FacebookIcon,
    'Google Ads': GoogleIcon,
    'Google Analytics': GoogleIcon,
    'TikTok': TikTokIcon,
    'Pinterest': PinterestIcon,
    'Kwai': KwaiIcon,
    'Taboola': TaboolaIcon,
    'LinkedIn': LinkedInIcon,
    'Twitter': TwitterIcon,
    'Bing': BingIcon,
    'Criteo': CriteoIcon,
    'Hotjar': HotjarIcon,
    'Outbrain': OutbrainIcon,
    'Snapchat': SnapchatIcon,
};


const PixelRow: React.FC<{ 
    pixel: MarketingPixel, 
    onNavigate: (view: View, data?: MarketingPixel) => void;
    onDelete: (id: string) => void;
    onStatusToggle: (id: string) => void;
    onDuplicate: (id: string) => void;
}> = ({ pixel, onNavigate, onDelete, onStatusToggle, onDuplicate }) => {
    
    const Icon = icons[pixel.type];
    
    return (
        <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Icon className={`w-8 h-8 flex-shrink-0 ${pixel.type === 'Google Ads' || pixel.type === 'Google Analytics' ? '' : `text-[rgb(var(--color-brand-text-light))]`}`} />
                <div>
                    <button onClick={() => onNavigate('addEditMarketingPixel', pixel)} className="font-bold text-[rgb(var(--color-brand-text-light))] text-left hover:text-[rgb(var(--color-brand-gold))]">{pixel.name}</button>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-[rgb(var(--color-brand-text-dim))]">
                        <span className="font-mono bg-[rgb(var(--color-brand-gray))]/[.50] px-1 rounded">ID: {pixel.pixelId}</span>
                        {pixel.idLabel && <span className="font-mono bg-[rgb(var(--color-brand-gray))]/[.50] px-1 rounded">Label: {pixel.idLabel}</span>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                 <ToggleSwitch 
                    checked={pixel.status === 'Ativo'}
                    onChange={() => onStatusToggle(pixel.id)}
                    labelId={`toggle-pixel-${pixel.id}`}
                 />
                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    <button onClick={() => onNavigate('addEditMarketingPixel', pixel)} title="Editar" className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDuplicate(pixel.id)} title="Duplicar" className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-text-light))]"><DuplicateIcon className="w-5 h-5"/></button>
                    <button title="Excluir" onClick={() => onDelete(pixel.id)} className="text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-error))]"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
    );
};

const ManageMarketingPixels: React.FC<ManageMarketingPixelsProps> = ({ pixels, onNavigate, onDelete, onStatusToggle, onDuplicate }) => {
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-brand-text-light))]">Pixels de Marketing</h1>
                <button 
                    onClick={() => onNavigate('addEditMarketingPixel')}
                    className="font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-5 rounded-md hover:bg-gold-400 transition-colors"
                >
                    + Adicionar Pixel
                </button>
            </div>
            
            <div className="space-y-3">
                {pixels.map(pixel => (
                    <PixelRow 
                        key={pixel.id} 
                        pixel={pixel} 
                        onNavigate={onNavigate}
                        onDelete={onDelete}
                        onStatusToggle={onStatusToggle}
                        onDuplicate={onDuplicate}
                    />
                ))}
            </div>
        </div>
    );
};

export default ManageMarketingPixels;