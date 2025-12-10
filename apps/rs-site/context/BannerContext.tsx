import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { BannerSettings } from '../types';

const defaultSettings: BannerSettings = {
  sideBanner: {
    enabled: false,
    imageUrl: '',
    link: '#',
    position: 'left',
    top: 120,
    width: 200,
  },
  backgroundBanner: {
    enabled: true, // Changed to true
    imageUrl: 'https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2', // Added a default image URL
    opacity: 0.3,
  },
};

interface BannerContextType {
  settings: BannerSettings;
  updateSettings: (newSettings: BannerSettings) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

const BANNER_STORAGE_KEY = 'rsprolipsi_banner_settings';

const getInitialState = (): BannerSettings => {
  try {
    const saved = localStorage.getItem(BANNER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Simple merge to avoid breaking on new properties
      return {
        sideBanner: { ...defaultSettings.sideBanner, ...(parsed.sideBanner || {}) },
        backgroundBanner: { ...defaultSettings.backgroundBanner, ...(parsed.backgroundBanner || {}) },
      };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Failed to parse banner settings from localStorage", error);
    return defaultSettings;
  }
};

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BannerSettings>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save banner settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: BannerSettings) => {
    setSettings(newSettings);
  };

  return (
    <BannerContext.Provider value={{ settings, updateSettings }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = (): BannerContextType => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
};