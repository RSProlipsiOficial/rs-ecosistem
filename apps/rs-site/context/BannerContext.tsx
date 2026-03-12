import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { BannerSettings } from '../types';
import { siteBuilderApi } from '../services/siteBuilderApi';

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
    enabled: true,
    imageUrl: 'https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2',
    opacity: 0.3,
  },
};

interface BannerContextType {
  settings: BannerSettings;
  updateSettings: (newSettings: BannerSettings) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);
const BANNER_STORAGE_KEY = 'rsprolipsi_banner_settings';

const shouldNotifyEmbeddedPreviewUpdate = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('embedAdmin') === '1';
};

const notifyEmbeddedPreviewUpdate = () => {
  if (!shouldNotifyEmbeddedPreviewUpdate()) {
    return;
  }

  try {
    window.parent?.postMessage({ type: 'rs-site:content-updated', scope: 'banners' }, '*');
  } catch (error) {
    console.error('Failed to notify parent preview about banner changes', error);
  }
};

const isPreviewEditorRuntime = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('previewEditor') === '1';
};

const normalizeSettings = (raw?: Partial<BannerSettings> | null): BannerSettings => ({
  sideBanner: { ...defaultSettings.sideBanner, ...(raw?.sideBanner || {}) },
  backgroundBanner: { ...defaultSettings.backgroundBanner, ...(raw?.backgroundBanner || {}) },
});

const getInitialState = (): BannerSettings => {
  try {
    const saved = localStorage.getItem(BANNER_STORAGE_KEY);
    return saved ? normalizeSettings(JSON.parse(saved)) : defaultSettings;
  } catch (error) {
    console.error('Failed to parse banner settings from localStorage', error);
    return defaultSettings;
  }
};

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BannerSettings>(getInitialState);
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSyncedSettingsRef = useRef('');

  useEffect(() => {
    let isMounted = true;

    siteBuilderApi.getBootstrap().then(result => {
      if (!isMounted) {
        return;
      }

      if (result.success && result.data?.bannerSettings) {
        const nextSettings = normalizeSettings(result.data.bannerSettings);
        setSettings(nextSettings);
        lastSyncedSettingsRef.current = JSON.stringify(nextSettings);

        try {
          localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(nextSettings));
        } catch (error) {
          console.error('Failed to mirror banner settings bootstrap into localStorage', error);
        }
      } else {
        lastSyncedSettingsRef.current = JSON.stringify(settings);
      }

      setBootstrapReady(true);
    }).catch(error => {
      console.error('Failed to load banner settings bootstrap', error);
      if (isMounted) {
        lastSyncedSettingsRef.current = JSON.stringify(settings);
        setBootstrapReady(true);
      }
    });

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save banner settings to localStorage', error);
    }
  }, [settings]);

  useEffect(() => {
    if (isPreviewEditorRuntime()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== BANNER_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        setSettings(normalizeSettings(JSON.parse(event.newValue)));
      } catch (error) {
        console.error('Failed to sync banner settings from storage', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!bootstrapReady) {
      return;
    }

    const serializedSettings = JSON.stringify(settings);
    if (serializedSettings === lastSyncedSettingsRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      const result = await siteBuilderApi.saveBootstrap({ bannerSettings: settings });
      if (result.success) {
        lastSyncedSettingsRef.current = serializedSettings;
        notifyEmbeddedPreviewUpdate();
        return;
      }

      console.error('Failed to save banner settings to API', result.error);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings, bootstrapReady]);

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
