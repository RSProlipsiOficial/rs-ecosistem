import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { IntegrationsSettings } from '../types';

const defaultSettings: IntegrationsSettings = {
  mercadoPago: '',
  adyen: '',
  stripe: '',
  pagSeguro: '',
  stone: '',
  asaas: '9de0b2ef-9d5d-462d-87f7-1780650fbdb3',
  melhorEnvio: '',
};

interface IntegrationsContextType {
  settings: IntegrationsSettings;
  updateSettings: (newSettings: IntegrationsSettings) => void;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

const INTEGRATIONS_STORAGE_KEY = 'rsprolipsi_integrations';

const getInitialState = (): IntegrationsSettings => {
  try {
    const saved = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (error) {
    console.error("Failed to parse integrations settings from localStorage", error);
    return defaultSettings;
  }
};

export const IntegrationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<IntegrationsSettings>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save integrations settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: IntegrationsSettings) => {
    setSettings(newSettings);
  };

  return (
    <IntegrationsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = (): IntegrationsContextType => {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};