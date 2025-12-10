
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Theme, TypographyStyle, MobileMenuStyle } from '../types';

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
    mobileMenuStyle: 'sidepanel', // Changed from 'overlay' to 'sidepanel'
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

const getInitialTheme = (): Theme => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      
      // Deep merge typography to prevent breaking changes from old structures
      const typography = { ...defaultTheme.typography };
      if (parsed.typography && typeof parsed.typography === 'object') {
        for (const key in typography) {
            const typedKey = key as keyof typeof typography;
            if (parsed.typography[typedKey]) {
                typography[typedKey] = { ...typography[typedKey], ...parsed.typography[typedKey] };
            }
        }
      }

      return {
          colors: { ...defaultTheme.colors, ...(parsed.colors || {}) },
          typography,
          navigation: { ...defaultTheme.navigation, ...(parsed.navigation || {}) },
      }
    }
  } catch (error) {
    console.error("Failed to parse theme from localStorage", error);
  }
  return defaultTheme;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }

    const root = document.documentElement;
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, String(value));
    });

    // Apply typography styles
    for (const element of Object.keys(theme.typography) as Array<keyof typeof theme.typography>) {
      const styles = theme.typography[element];
      for (const prop of Object.keys(styles) as Array<keyof typeof styles>) {
        const value = styles[prop];
        const cssVar = `--${String(prop).replace(/([A-Z])/g, '-$1').toLowerCase()}-${String(element)}`;
        root.style.setProperty(cssVar, String(value));
      }
    }
    // Special case for body font family for tailwind config
    root.style.setProperty('--font-family-body', theme.typography.body.fontFamily);

  }, [theme]);

  const updateTheme: UpdateThemeFn = useCallback((updates: any, type: 'colors' | 'typography' | 'navigation') => {
    setTheme(prevTheme => ({
      ...prevTheme,
      [type]: {
        ...prevTheme[type],
        ...updates,
      }
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