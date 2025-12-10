// Tipos para configuração do Dashboard do Consultor

export interface ProgressBarConfig {
  id?: string;
  title?: string;
  calculationMode: 'manual' | 'auto-pin';
  targetPin?: string;
  startCycles: number;
  endCycles: number;
  currentCycles: number;
}

export interface UserInfoField {
  id?: string;
  key: string;
  label: string;
}

export interface DashboardLink {
  id?: string;
  label: string;
  href: string;
  icon: string;
}

export interface DashboardBonusCard {
  id?: string;
  title: string;
  value: string;
  icon: string;
}

export interface Incentive {
  id: string;
  name?: string;
  title: string;
  description: string;
  requirement: string;
  reward: string;
  progress: number;
  icon: string;
}

export interface DashboardConfig {
  progressBar: ProgressBarConfig;
  userInfoFields: UserInfoField[];
  dashboardLinks: DashboardLink[];
  bonusCards: DashboardBonusCard[];
  selectedIncentives: string[];
  pinLogos: Record<string, string>;
}
