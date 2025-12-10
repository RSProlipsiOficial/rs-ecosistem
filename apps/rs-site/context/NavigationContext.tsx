
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Page = string;

interface NavigationContextType {
  page: Page;
  setPage: (page: Page) => void;
  viewingProductId: string | null;
  setViewingProductId: (id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<Page>('home');
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);

  return (
    <NavigationContext.Provider value={{ page, setPage, viewingProductId, setViewingProductId }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};