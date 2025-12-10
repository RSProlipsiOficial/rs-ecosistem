
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { initialDownloads } from '../config/initialDownloads';

interface DownloadsState {
  marketingPlanPages: string[];
  productCatalogPages: string[];
}

interface DownloadsContextType extends DownloadsState {
  setMarketingPlanPages: (pages: string[]) => void;
  setProductCatalogPages: (pages: string[]) => void;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

const DOWNLOADS_STORAGE_KEY = 'rsprolipsi_downloads';

const getInitialDownloads = (): DownloadsState => {
  try {
    const saved = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialDownloads;
  } catch (error) {
    console.error("Failed to parse downloads from localStorage", error);
    return initialDownloads;
  }
};

export const DownloadsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadsState>(getInitialDownloads);

  useEffect(() => {
    try {
      localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads));
    } catch (error) {
      console.error("Failed to save downloads to localStorage", error);
    }
  }, [downloads]);

  const setMarketingPlanPages = (pages: string[]) => {
    setDownloads(prev => ({ ...prev, marketingPlanPages: pages }));
  };

  const setProductCatalogPages = (pages: string[]) => {
    setDownloads(prev => ({ ...prev, productCatalogPages: pages }));
  };

  return (
    <DownloadsContext.Provider value={{ ...downloads, setMarketingPlanPages, setProductCatalogPages }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloadsContext = (): DownloadsContextType => {
  const context = useContext(DownloadsContext);
  if (context === undefined) {
    throw new Error('useDownloadsContext must be used within a DownloadsProvider');
  }
  return context;
};
