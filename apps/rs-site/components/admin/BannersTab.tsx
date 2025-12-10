import React, { useState, useEffect, useRef } from 'react';
import { useBanner } from '../../context/BannerContext';
import { BannerSettings } from '../../types';
import ImageInput from '../ImageInput';
import { useLanguage } from '../../context/LanguageContext';

type BannerType = 'sideBanner' | 'backgroundBanner';

const BannersTab: React.FC = () => {
    const { settings, updateSettings } = useBanner();
    const [localSettings, setLocalSettings] = useState<BannerSettings>(settings);
    const { t } = useLanguage();

    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        hasChanged.current = JSON.stringify(settings) !== JSON.stringify(localSettings);
    }, [localSettings, settings]);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);
    
    const handleFieldChange = (banner: BannerType, field: string, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [banner]: {
                ...prev[banner],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        updateSettings(localSettings);
        alert('Configurações de banner salvas!');
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-accent">Gerenciamento de Banners Globais</h2>
            <p className="text-text-secondary -mt-6">Estas são as configurações padrão para os banners do site. O banner de fundo pode ser substituído individualmente em cada página no editor de páginas.</p>
            
            {/* Side Banner */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text-primary">{t('admin_banners_side_banner')}</h3>
                    <label className="flex items-center cursor-pointer">
                        <span className="mr-3 text-sm font-medium text-text-secondary">{t('admin_banners_disabled_enabled')}</span>
                        <div className="relative">
                            <input type="checkbox" checked={localSettings.sideBanner.enabled} onChange={e => handleFieldChange('sideBanner', 'enabled', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </div>
                    </label>
                </div>

                {localSettings.sideBanner.enabled && (
                    <div className="space-y-4 animate-fade-in-down">
                        <ImageInput label={t('admin_banners_image_url')} value={localSettings.sideBanner.imageUrl} onChange={v => handleFieldChange('sideBanner', 'imageUrl', v)} />
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_banners_link_url')}</label>
                            <input type="text" value={localSettings.sideBanner.link} onChange={e => handleFieldChange('sideBanner', 'link', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_banners_position')}</label>
                                <select value={localSettings.sideBanner.position} onChange={e => handleFieldChange('sideBanner', 'position', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                                    <option value="left">{t('admin_banners_position_left')}</option>
                                    <option value="right">{t('admin_banners_position_right')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_banners_top_offset')} ({localSettings.sideBanner.top}px)</label>
                                <input type="range" min="0" max="500" value={localSettings.sideBanner.top} onChange={e => handleFieldChange('sideBanner', 'top', parseInt(e.target.value))} className="w-full" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_banners_width')} ({localSettings.sideBanner.width}px)</label>
                                <input type="range" min="100" max="400" value={localSettings.sideBanner.width} onChange={e => handleFieldChange('sideBanner', 'width', parseInt(e.target.value))} className="w-full" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Background Banner */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-border">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text-primary">Banner de Fundo Global (Padrão)</h3>
                    <label className="flex items-center cursor-pointer">
                        <span className="mr-3 text-sm font-medium text-text-secondary">{t('admin_banners_disabled_enabled')}</span>
                        <div className="relative">
                            <input type="checkbox" checked={localSettings.backgroundBanner.enabled} onChange={e => handleFieldChange('backgroundBanner', 'enabled', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </div>
                    </label>
                </div>
                 {localSettings.backgroundBanner.enabled && (
                     <div className="space-y-4 animate-fade-in-down">
                        <ImageInput label={t('admin_banners_image_url')} value={localSettings.backgroundBanner.imageUrl} onChange={v => handleFieldChange('backgroundBanner', 'imageUrl', v)} />
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">{t('admin_banners_opacity')} {t('admin_banners_opacity_hint')} ({Math.round(localSettings.backgroundBanner.opacity * 100)}%)</label>
                            <input type="range" min="0" max="1" step="0.01" value={localSettings.backgroundBanner.opacity} onChange={e => handleFieldChange('backgroundBanner', 'opacity', parseFloat(e.target.value))} className="w-full" />
                        </div>
                    </div>
                 )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
                 <button onClick={handleSave} className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>
                    {t('admin_banners_save')}
                </button>
            </div>
             <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default BannersTab;