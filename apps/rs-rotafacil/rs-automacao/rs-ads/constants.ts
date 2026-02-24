
import { Platform, AIStatus, Campaign, OptimizationAction, Client, KPI, CampaignStatus } from './types';

export const COLORS = {
  blackBase: '#0B0B0B',
  blackSecondary: '#121212',
  goldPrincipal: '#D4AF37',
  goldHover: '#F1C75B',
  grayTechnical: '#B5B5B5',
  white: '#FFFFFF'
};

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Conta Principal' }
];

export const MOCK_KPIS: KPI[] = [
  { 
    label: 'ROAS', 
    value: '0.0x', 
    change: 0, 
    icon: 'fa-chart-line', 
    target: '--', 
    status: 'on_track',
    recommendation: 'Aguardando dados iniciais'
  },
  { 
    label: 'CPA', 
    value: 'R$ 0,00', 
    change: 0, 
    icon: 'fa-bullseye', 
    target: '--', 
    status: 'on_track',
    recommendation: 'Aguardando conversões'
  },
  { 
    label: 'CTR', 
    value: '0.00%', 
    change: 0, 
    icon: 'fa-mouse-pointer', 
    target: '--', 
    status: 'on_track',
    recommendation: 'Monitorando cliques'
  },
  { 
    label: 'Spend', 
    value: 'R$ 0,00', 
    change: 0, 
    icon: 'fa-wallet', 
    target: '--', 
    status: 'on_track',
    recommendation: 'Início de ciclo'
  }
];

// Limpando campanhas e otimizações para o modo "trabalho oficial"
export const MOCK_CAMPAIGNS: Campaign[] = [];

export const MOCK_OPTIMIZATIONS: OptimizationAction[] = [];
