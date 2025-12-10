

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CardStyle, CardStyles } from '../types';

const defaultCardStyle: CardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderRadius: 8, // lg
  shadow: 'none',
  hoverEffect: 'lift',
};

const initialCardStyles: CardStyles = {
  'feature_card': { ...defaultCardStyle },
  'differentiator_card': { ...defaultCardStyle, backgroundColor: 'transparent', hoverEffect: 'glow' },
  'about_image_card': { 
    ...defaultCardStyle, 
    backgroundColor: 'transparent', 
    borderColor: 'transparent',
    borderWidth: 0,
    shadow: 'none',
    hoverEffect: 'none',
  },
  'team_member_card': {
    ...defaultCardStyle,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 12,
    shadow: 'none',
    hoverEffect: 'lift',
  },
};

interface CardStyleContextType {
  styles: CardStyles;
  getStyle: (key: string) => CardStyle;
  updateStyle: (key: string, newStyle: CardStyle) => void;
}

const CardStyleContext = createContext<CardStyleContextType | undefined>(undefined);

const CARD_STYLE_STORAGE_KEY = 'rsprolipsi_card_styles';

const getInitialState = (): CardStyles => {
  try {
    const saved = localStorage.getItem(CARD_STYLE_STORAGE_KEY);
    return saved ? { ...initialCardStyles, ...JSON.parse(saved) } : initialCardStyles;
  } catch (error) {
    console.error("Failed to parse card styles from localStorage", error);
    return initialCardStyles;
  }
};

export const CardStyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [styles, setStyles] = useState<CardStyles>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(CARD_STYLE_STORAGE_KEY, JSON.stringify(styles));
    } catch (error) {
      console.error("Failed to save card styles to localStorage", error);
    }
  }, [styles]);

  const getStyle = (key: string): CardStyle => {
    return styles[key] || defaultCardStyle;
  };

  const updateStyle = (key: string, newStyle: CardStyle) => {
    setStyles(prev => ({
      ...prev,
      [key]: newStyle,
    }));
  };

  return (
    <CardStyleContext.Provider value={{ styles, getStyle, updateStyle }}>
      {children}
    </CardStyleContext.Provider>
  );
};

export const useCardStyle = (): CardStyleContextType => {
  const context = useContext(CardStyleContext);
  if (context === undefined) {
    throw new Error('useCardStyle must be used within a CardStyleProvider');
  }
  return context;
};