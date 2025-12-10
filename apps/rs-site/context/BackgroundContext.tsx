
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { BackgroundPattern } from '../types';

const defaultPattern: BackgroundPattern = 'dots';
const defaultClass = `background-${defaultPattern}`;

interface BackgroundContextType {
  backgroundClass: string;
  setBackgroundClass: (className: string) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const BACKGROUND_STORAGE_KEY = 'rsprolipsi_background';

const getInitialState = (): string => {
  try {
    const saved = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    return saved || defaultClass;
  } catch (error) {
    console.error("Failed to parse background from localStorage", error);
    return defaultClass;
  }
};

export const BackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [backgroundClass, setBackgroundClass] = useState<string>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundClass);
    } catch (error) {
      console.error("Failed to save background to localStorage", error);
    }
  }, [backgroundClass]);

  return (
    <BackgroundContext.Provider value={{ backgroundClass, setBackgroundClass }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
