import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardConfig, ProgressBarConfig, UserInfoField, DashboardLink, DashboardBonusCard } from './types';

interface DashboardConfigContextType {
  config: DashboardConfig;
  setConfig: React.Dispatch<React.SetStateAction<DashboardConfig>>;
}

const DashboardConfigContext = createContext<DashboardConfigContextType | undefined>(undefined);

export const useDashboardConfig = () => {
  const context = useContext(DashboardConfigContext);
  if (!context) {
    throw new Error('useDashboardConfig must be used within DashboardConfigProvider');
  }
  return context;
};

const defaultConfig: DashboardConfig = {
  progressBar: {
    calculationMode: 'auto-pin',
    startCycles: 0,
    endCycles: 150,
    currentCycles: 100,
  },
  userInfoFields: [
    { key: 'graduacao', label: 'Graduação' },
    { key: 'pin', label: 'PIN Atual' },
  ],
  dashboardLinks: [
    { label: 'Link de Indicação', href: '/consultant/meu-link', icon: 'IconLink' },
  ],
  bonusCards: [
    { title: 'Bônus Ciclo Global', value: 'bonusCicloGlobal', icon: 'IconGitFork' },
    { title: 'Bônus Top SIGME', value: 'bonusTopSigme', icon: 'IconStar' },
  ],
  selectedIncentives: [],
  pinLogos: {},
};

export const DashboardConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);

  return (
    <DashboardConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </DashboardConfigContext.Provider>
  );
};
