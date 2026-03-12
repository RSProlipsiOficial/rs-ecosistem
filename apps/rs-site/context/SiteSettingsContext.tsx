import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { SiteSettings } from '../types';
import { siteBuilderApi } from '../services/siteBuilderApi';

const defaultSettings: SiteSettings = {
  socialLinks: [
    { id: 'sl1', platform: 'facebook', url: '#' },
    { id: 'sl2', platform: 'instagram', url: '#' },
    { id: 'sl3', platform: 'linkedin', url: '#' },
    { id: 'sl4', platform: 'youtube', url: '#' },
  ],
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);
const SETTINGS_STORAGE_KEY = 'rsprolipsi_site_settings';

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
    window.parent?.postMessage({ type: 'rs-site:content-updated', scope: 'site-settings' }, '*');
  } catch (error) {
    console.error('Failed to notify parent preview about site settings changes', error);
  }
};

const isPreviewEditorRuntime = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('previewEditor') === '1';
};

const normalizeSettings = (raw?: Partial<SiteSettings> | null): SiteSettings => {
  if (!Array.isArray(raw?.socialLinks)) {
    return defaultSettings;
  }

  return { ...defaultSettings, ...raw };
};

const getInitialState = (): SiteSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? normalizeSettings(JSON.parse(saved)) : defaultSettings;
  } catch (error) {
    console.error('Failed to parse site settings from localStorage', error);
    return defaultSettings;
  }
};

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(getInitialState);
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSyncedSettingsRef = useRef('');

  useEffect(() => {
    let isMounted = true;

    siteBuilderApi.getBootstrap().then(result => {
      if (!isMounted) {
        return;
      }

      if (result.success && result.data?.siteSettings) {
        const nextSettings = normalizeSettings(result.data.siteSettings);
        setSettings(nextSettings);
        lastSyncedSettingsRef.current = JSON.stringify(nextSettings);

        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
        } catch (error) {
          console.error('Failed to mirror site settings bootstrap into localStorage', error);
        }
      } else {
        lastSyncedSettingsRef.current = JSON.stringify(settings);
      }

      setBootstrapReady(true);
    }).catch(error => {
      console.error('Failed to load site settings bootstrap', error);
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
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save site settings to localStorage', error);
    }
  }, [settings]);

  useEffect(() => {
    if (isPreviewEditorRuntime()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== SETTINGS_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        setSettings(normalizeSettings(JSON.parse(event.newValue)));
      } catch (error) {
        console.error('Failed to sync site settings from storage', error);
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
      const result = await siteBuilderApi.saveBootstrap({ siteSettings: settings });
      if (result.success) {
        lastSyncedSettingsRef.current = serializedSettings;
        notifyEmbeddedPreviewUpdate();
        return;
      }

      console.error('Failed to save site settings to API', result.error);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings, bootstrapReady]);

  const updateSettings = (newSettings: SiteSettings) => {
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
