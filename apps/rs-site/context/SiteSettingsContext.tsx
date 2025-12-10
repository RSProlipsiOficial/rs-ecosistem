

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { SiteSettings, SocialLink } from '../types';

const defaultSettings: SiteSettings = {
  socialLinks: [
    { id: 'sl1', platform: 'facebook', url: '#' },
    { id: 'sl2', platform: 'instagram', url: '#' },
    { id: 'sl3', platform: 'linkedin', url: '#' },
    { id: 'sl4', platform: 'youtube', url: '#' },
  ]
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'rsprolipsi_site_settings';

const getInitialState = (): SiteSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure socialLinks is an array. If old data from a previous version exists, it might be an object.
        if (Array.isArray(parsed.socialLinks)) {
            return { ...defaultSettings, ...parsed };
        }
    }
    return defaultSettings;
  } catch (error) {
    console.error("Failed to parse site settings from localStorage", error);
    return defaultSettings;
  }
};

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save site settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = (): SiteSettingsContextType => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
