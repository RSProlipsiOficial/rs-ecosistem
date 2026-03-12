import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Theme } from '../types';
import { siteBuilderApi } from '../services/siteBuilderApi';

export const defaultTheme: Theme = {
  colors: {
    accent: '#D4AF37',
    background: '#121212',
    textPrimary: '#FFFFFF',
    textSecondary: '#a0aec0',
    buttonBg: '#D4AF37',
    buttonText: '#121212',
    surface: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    mobileMenuBackground: '#1a1a1a',
    mobileMenuText: '#FFFFFF',
    mobileMenuAccent: '#D4AF37',
  },
  typography: {
    body: { fontFamily: 'Inter', fontWeight: '400', textTransform: 'none' },
    h1: { fontFamily: 'Montserrat', fontWeight: '700', textTransform: 'uppercase' },
    h2: { fontFamily: 'Montserrat', fontWeight: '700', textTransform: 'none' },
    h3: { fontFamily: 'Montserrat', fontWeight: '600', textTransform: 'none' },
    h4: { fontFamily: 'Inter', fontWeight: '600', textTransform: 'none' },
  },
  navigation: {
    mobileMenuStyle: 'sidepanel',
  },
};

type UpdateThemeFn = {
  (updates: Partial<Theme['colors']>, type: 'colors'): void;
  (updates: Partial<Theme['typography']>, type: 'typography'): void;
  (updates: Partial<Theme['navigation']>, type: 'navigation'): void;
};

interface ThemeContextType {
  theme: Theme;
  updateTheme: UpdateThemeFn;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'rsprolipsi_theme';

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
    window.parent?.postMessage({ type: 'rs-site:content-updated', scope: 'theme' }, '*');
  } catch (error) {
    console.error('Failed to notify parent preview about theme changes', error);
  }
};

const isPreviewEditorRuntime = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('previewEditor') === '1';
};

const normalizeTheme = (rawTheme?: Partial<Theme> | null): Theme => {
  const typography = { ...defaultTheme.typography };
  if (rawTheme?.typography && typeof rawTheme.typography === 'object') {
    for (const key in typography) {
      const typedKey = key as keyof typeof typography;
      if ((rawTheme.typography as any)[typedKey]) {
        typography[typedKey] = { ...typography[typedKey], ...(rawTheme.typography as any)[typedKey] };
      }
    }
  }

  return {
    colors: { ...defaultTheme.colors, ...(rawTheme?.colors || {}) },
    typography,
    navigation: { ...defaultTheme.navigation, ...(rawTheme?.navigation || {}) },
  };
};

const getInitialTheme = (): Theme => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme ? normalizeTheme(JSON.parse(savedTheme)) : defaultTheme;
  } catch (error) {
    console.error('Failed to parse theme from localStorage', error);
    return defaultTheme;
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSyncedThemeRef = useRef('');

  useEffect(() => {
    let isMounted = true;

    siteBuilderApi.getBootstrap().then(result => {
      if (!isMounted) {
        return;
      }

      if (result.success && result.data?.theme) {
        const nextTheme = normalizeTheme(result.data.theme);
        setTheme(nextTheme);
        lastSyncedThemeRef.current = JSON.stringify(nextTheme);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(nextTheme));
        } catch (error) {
          console.error('Failed to mirror theme bootstrap into localStorage', error);
        }
      } else {
        lastSyncedThemeRef.current = JSON.stringify(theme);
      }

      setBootstrapReady(true);
    }).catch(error => {
      console.error('Failed to load theme bootstrap', error);
      if (isMounted) {
        lastSyncedThemeRef.current = JSON.stringify(theme);
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
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, String(value));
    });

    for (const element of Object.keys(theme.typography) as Array<keyof typeof theme.typography>) {
      const styles = theme.typography[element];
      for (const prop of Object.keys(styles) as Array<keyof typeof styles>) {
        const cssVar = `--${String(prop).replace(/([A-Z])/g, '-$1').toLowerCase()}-${String(element)}`;
        root.style.setProperty(cssVar, String(styles[prop]));
      }
    }

    root.style.setProperty('--font-family-body', theme.typography.body.fontFamily);
  }, [theme]);

  useEffect(() => {
    if (isPreviewEditorRuntime()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        setTheme(normalizeTheme(JSON.parse(event.newValue)));
      } catch (error) {
        console.error('Failed to sync theme from storage', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!bootstrapReady) {
      return;
    }

    const serializedTheme = JSON.stringify(theme);
    if (serializedTheme === lastSyncedThemeRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      const result = await siteBuilderApi.saveBootstrap({ theme });
      if (result.success) {
        lastSyncedThemeRef.current = serializedTheme;
        notifyEmbeddedPreviewUpdate();
        return;
      }

      console.error('Failed to save theme to API', result.error);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [theme, bootstrapReady]);

  const updateTheme: UpdateThemeFn = useCallback((updates: any, type: 'colors' | 'typography' | 'navigation') => {
    setTheme(prevTheme => ({
      ...prevTheme,
      [type]: {
        ...prevTheme[type],
        ...updates,
      },
    }));
  }, []);

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
