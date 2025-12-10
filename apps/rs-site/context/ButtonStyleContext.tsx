

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ButtonStyle, ButtonStyles } from '../types';

const defaultSolid: ButtonStyle = {
  preset: 'solid',
  backgroundColor: '#D4AF37',
  textColor: '#121212',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 9999, // pill
  shadow: 'lg',
  textTransform: 'none',
  fontWeight: '700',
  padding: '12px 40px',
};

const initialButtonStyles: ButtonStyles = {
  'hero_cta': { ...defaultSolid },
  'nav_login': { ...defaultSolid, padding: '8px 24px', shadow: 'md' },
  'products_home_cta': { ...defaultSolid },
  'buy_now': { ...defaultSolid, padding: '8px 20px', shadow: 'md' },
};

interface ButtonStyleContextType {
  styles: ButtonStyles;
  getStyle: (key: string) => ButtonStyle;
  updateStyle: (key: string, newStyle: ButtonStyle) => void;
  applyToAll: (key: string, newStyle: ButtonStyle) => void;
}

const ButtonStyleContext = createContext<ButtonStyleContextType | undefined>(undefined);

const BUTTON_STYLE_STORAGE_KEY = 'rsprolipsi_button_styles';

const getInitialState = (): ButtonStyles => {
  try {
    const saved = localStorage.getItem(BUTTON_STYLE_STORAGE_KEY);
    return saved ? { ...initialButtonStyles, ...JSON.parse(saved) } : initialButtonStyles;
  } catch (error) {
    console.error("Failed to parse button styles from localStorage", error);
    return initialButtonStyles;
  }
};

export const ButtonStyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [styles, setStyles] = useState<ButtonStyles>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(BUTTON_STYLE_STORAGE_KEY, JSON.stringify(styles));
    } catch (error) {
      console.error("Failed to save button styles to localStorage", error);
    }
  }, [styles]);

  const getStyle = (key: string): ButtonStyle => {
    return styles[key] || defaultSolid;
  };

  const updateStyle = (key: string, newStyle: ButtonStyle) => {
    setStyles(prev => ({
      ...prev,
      [key]: newStyle,
    }));
  };

  const applyToAll = (key: string, newStyle: ButtonStyle) => {
    if (key === 'buy_now') {
        const newStyles = { ...styles };
        Object.keys(newStyles).forEach(styleKey => {
            if (styleKey.startsWith('buy_now')) {
                newStyles[styleKey] = newStyle;
            }
        });
        setStyles(newStyles);
    }
  };

  return (
    <ButtonStyleContext.Provider value={{ styles, getStyle, updateStyle, applyToAll }}>
      {children}
    </ButtonStyleContext.Provider>
  );
};

export const useButtonStyle = (): ButtonStyleContextType => {
  const context = useContext(ButtonStyleContext);
  if (context === undefined) {
    throw new Error('useButtonStyle must be used within a ButtonStyleProvider');
  }
  return context;
};
