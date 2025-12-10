import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Offer } from '../types';
import { initialOffers } from '../config/initialOffers';

interface OffersContextType {
  offers: Offer[];
  addOffer: (offerData: Omit<Offer, 'id'>) => void;
  updateOffer: (updatedOffer: Offer) => void;
  deleteOffer: (offerId: string) => void;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

const OFFERS_STORAGE_KEY = 'rsprolipsi_offers';

const getInitialState = (): Offer[] => {
  try {
    const saved = localStorage.getItem(OFFERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialOffers;
  } catch (error) {
    console.error("Failed to parse offers from localStorage", error);
    return initialOffers;
  }
};

export const OffersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
    } catch (error) {
      console.error("Failed to save offers to localStorage", error);
    }
  }, [offers]);

  const addOffer = (offerData: Omit<Offer, 'id'>) => {
    const newOffer: Offer = {
      id: `${offerData.type}_${new Date().getTime()}`,
      ...offerData,
    };
    setOffers(prev => [...prev, newOffer]);
  };

  const updateOffer = (updatedOffer: Offer) => {
    setOffers(prev => prev.map(o => (o.id === updatedOffer.id ? updatedOffer : o)));
  };

  const deleteOffer = (offerId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      setOffers(prev => prev.filter(o => o.id !== offerId));
    }
  };

  return (
    <OffersContext.Provider value={{ offers, addOffer, updateOffer, deleteOffer }}>
      {children}
    </OffersContext.Provider>
  );
};

export const useOffers = (): OffersContextType => {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};
