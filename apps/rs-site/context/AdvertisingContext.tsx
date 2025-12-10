
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Advertisement } from '../types';
import { initialAdvertisements } from '../config/initialAdvertisements';

interface AdvertisingContextType {
  advertisements: Advertisement[];
  addAdvertisement: (advertisement: Omit<Advertisement, 'id'>) => void;
  updateAdvertisement: (advertisement: Advertisement) => void;
  deleteAdvertisement: (advertisementId: string) => void;
}

const AdvertisingContext = createContext<AdvertisingContextType | undefined>(undefined);

const ADVERTISING_STORAGE_KEY = 'rsprolipsi_advertisements';

const getInitialAdvertisements = (): Advertisement[] => {
  try {
    const saved = localStorage.getItem(ADVERTISING_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialAdvertisements;
  } catch (error) {
    console.error("Failed to parse advertisements from localStorage", error);
    return initialAdvertisements;
  }
};

export const AdvertisingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(getInitialAdvertisements);

  useEffect(() => {
    try {
      localStorage.setItem(ADVERTISING_STORAGE_KEY, JSON.stringify(advertisements));
    } catch (error) {
      console.error("Failed to save advertisements to localStorage", error);
    }
  }, [advertisements]);

  const addAdvertisement = (adData: Omit<Advertisement, 'id'>) => {
    const newAdvertisement: Advertisement = {
      id: `ad_${new Date().getTime()}`,
      ...adData,
    };
    setAdvertisements(prev => [...prev, newAdvertisement]);
  };

  const updateAdvertisement = (updatedAd: Advertisement) => {
    setAdvertisements(prev =>
      prev.map(ad => (ad.id === updatedAd.id ? updatedAd : ad))
    );
  };

  const deleteAdvertisement = (advertisementId: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      setAdvertisements(prev => prev.filter(ad => ad.id !== advertisementId));
    }
  };

  return (
    <AdvertisingContext.Provider value={{ advertisements, addAdvertisement, updateAdvertisement, deleteAdvertisement }}>
      {children}
    </AdvertisingContext.Provider>
  );
};

export const useAdvertisingContext = (): AdvertisingContextType => {
  const context = useContext(AdvertisingContext);
  if (context === undefined) {
    throw new Error('useAdvertisingContext must be used within an AdvertisingProvider');
  }
  return context;
};
