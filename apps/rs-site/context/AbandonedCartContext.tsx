import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AbandonedCart } from '../types';
import { initialAbandonedCarts } from '../config/initialAbandonedCarts';

interface AbandonedCartContextType {
  abandonedCarts: AbandonedCart[];
  addAbandonedCart: (cart: Omit<AbandonedCart, 'id' | 'recoveryStatus'>) => void;
  updateCartStatus: (cartId: string, status: AbandonedCart['recoveryStatus']) => void;
}

const AbandonedCartContext = createContext<AbandonedCartContextType | undefined>(undefined);

const ABANDONED_CART_STORAGE_KEY = 'rsprolipsi_abandoned_carts';

const getInitialState = (): AbandonedCart[] => {
  try {
    const saved = localStorage.getItem(ABANDONED_CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialAbandonedCarts;
  } catch (error) {
    console.error("Failed to parse abandoned carts from localStorage", error);
    return initialAbandonedCarts;
  }
};

export const AbandonedCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(ABANDONED_CART_STORAGE_KEY, JSON.stringify(abandonedCarts));
    } catch (error) {
      console.error("Failed to save abandoned carts to localStorage", error);
    }
  }, [abandonedCarts]);

  const addAbandonedCart = (cart: Omit<AbandonedCart, 'id' | 'recoveryStatus'>) => {
    // Prevent adding duplicates
    if (abandonedCarts.some(ac => ac.customerEmail === cart.customerEmail)) return;

    const newCart: AbandonedCart = {
      id: `cart_${new Date().getTime()}`,
      ...cart,
      recoveryStatus: 'pending',
    };
    setAbandonedCarts(prev => [newCart, ...prev]);
  };

  const updateCartStatus = (cartId: string, status: AbandonedCart['recoveryStatus']) => {
    setAbandonedCarts(prev => prev.map(cart => (cart.id === cartId ? { ...cart, recoveryStatus: status } : cart)));
  };

  return (
    <AbandonedCartContext.Provider value={{ abandonedCarts, addAbandonedCart, updateCartStatus }}>
      {children}
    </AbandonedCartContext.Provider>
  );
};

export const useAbandonedCart = (): AbandonedCartContextType => {
  const context = useContext(AbandonedCartContext);
  if (context === undefined) {
    throw new Error('useAbandonedCart must be used within an AbandonedCartProvider');
  }
  return context;
};
