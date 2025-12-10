import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { SocialLink } from '../../types';
import { socialIcons } from '../../config/socialIcons';
// FIX: Added missing icon imports.
import { CloseIcon, SearchIcon, TrashIcon } from '../Icons';

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;

const SocialIconPickerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (platform: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIcons = useMemo(() => {
        if (!searchTerm) return socialIcons;
        return socialIcons.filter(icon => 
            icon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            icon.platform.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col">
                <header className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-accent">Select Social Icon</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><CloseIcon /></button>
                </header>
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 pl-10 text-text-primary focus:ring-accent focus:border-accent"
                            autoFocus
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto">
                    {filteredIcons.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                            {filteredIcons.map(iconData => (
                                <button
                                    key={iconData.platform}
                                    onClick={() => onSelect(iconData.platform)}
                                    title={iconData.name}
                                    className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-md hover:bg-accent hover:text-button-text transition-colors group aspect-square"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-primary" fill="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: iconData.svg }} >
                                    </svg>
                                    <span className="text-xs mt-2 text-text-secondary group-hover:text-button-text truncate">{iconData.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-text-secondary py-8">No icons found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const SettingsTab: React.FC = () => {
    const { settings, updateSettings } = useSiteSettings();
    const [localSocialLinks, setLocalSocialLinks] = useState<SocialLink[]>(settings.socialLinks);
    const { t } = useLanguage();
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

    // Deep comparison to check if form data has changed
    const hasChanged = useRef(false);
    useEffect(() => {
        hasChanged.current = JSON.stringify(settings.socialLinks) !== JSON.stringify(localSocialLinks);
    }, [localSocialLinks, settings.socialLinks]);

    useEffect(() => {
        setLocalSocialLinks(settings.socialLinks);
    }, [settings.socialLinks]);

    const handleLinkChange = (id: string, field: 'platform' | 'url', value: string) => {
        setLocalSocialLinks(links =>
            links.map(link => (link.id === id ? { ...link, [field]: value } : link))
        );
    };
    
    const handleIconSelect = (platform: string) => {
        if (editingLinkId) {
            handleLinkChange(editingLinkId, 'platform', platform);
        }
        setIsIconPickerOpen(false);
        setEditingLinkId(null);
    };

    const addLink = () => {
        const newLink: SocialLink = {
            id: generateId(),
            platform: 'link', // default to generic link icon
            url: '',
        };
        setLocalSocialLinks(links => [...links, newLink]);
    };

    const deleteLink = (id: string) => {
        setLocalSocialLinks(links => links.filter(link => link.id !== id));
    };
    
    const handleSave = () => {
        updateSettings({ socialLinks: localSocialLinks });
        alert('Settings saved!');
    };

    return (
        <div className="space-y-6">
            <SocialIconPickerModal 
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={handleIconSelect}
            />
            <h2 className="text-2xl font-semibold text-accent">{t('admin_settings_social_title')}</h2>
            <p className="text-text-secondary mt-1 mb-6">{t('admin_settings_social_desc')}</p>

            <div className="space-y-4">
                {localSocialLinks.map(link => {
                    const iconData = socialIcons.find(i => i.platform === link.platform);
                    return (
                        <div key={link.id} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-md">
                            <button
                                type="button"
                                onClick={() => { setEditingLinkId(link.id); setIsIconPickerOpen(true); }}
                                className="flex-shrink-0 w-24 h-12 flex items-center justify-center bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700"
                            >
                                {iconData ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-primary" fill="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: iconData.svg }}>
                                    </svg>
                                ) : (
                                    <span className="text-xs text-text-secondary">Select Icon</span>
                                )}
                            </button>
                            <input
                                type="text"
                                value={link.url}
                                onChange={e => handleLinkChange(link.id, 'url', e.target.value)}
                                placeholder={t('admin_settings_social_url')}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                            />
                            <button onClick={() => deleteLink(link.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon /></button>
                        </div>
                    );
                })}
            </div>
            <button onClick={addLink} className="mt-4 bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80">
                {t('admin_settings_social_add')}
            </button>
            <div className="mt-8 pt-6 border-t border-border flex justify-end space-x-3">
                <button onClick={() => setLocalSocialLinks(settings.socialLinks)} type="button" className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700">Discard</button>
                <button onClick={handleSave} type="button" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80" disabled={!hasChanged.current}>Save</button>
            </div>
        </div>
    );
};

export default SettingsTab;