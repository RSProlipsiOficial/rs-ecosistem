import { BioSite, Theme, PlanDefinition, UserProfile, UserPlan } from './types';

export const RS_THEME_DARK: Theme = {
  id: 'rs-luxury-dark',
  name: 'RS Luxury Dark',
  backgroundColor: '#0a0a0a',
  primaryColor: '#D4AF37', // Gold
  secondaryColor: '#1a1a1a',
  textColor: '#ffffff',
  fontFamily: 'Inter'
};

export const RS_THEME_LIGHT: Theme = {
  id: 'rs-luxury-light',
  name: 'RS Luxury Light',
  backgroundColor: '#f4f4f5',
  primaryColor: '#AA8C2C', // Darker Gold for contrast
  secondaryColor: '#ffffff',
  textColor: '#0a0a0a',
  fontFamily: 'Inter'
};

export const PLANS: Record<UserPlan, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'RS MiniSite Grátis',
    maxPages: 1,
    maxClients: 0,
    price: 'Grátis',
    features: ['1 MiniSite', 'Com marca RS Prólipsi']
  },
  start: {
    id: 'e0a9d0a0-0001-4000-8000-000000000001',
    name: 'RS MiniSite Start',
    maxPages: 1,
    maxClients: 0,
    price: 'R$ 5,90/mês',
    features: ['1 MiniSite', 'Recursos liberados', 'Sem marca RS Prólipsi']
  },
  pro: {
    id: 'e0a9d0a0-0002-4000-8000-000000000002',
    name: 'RS MiniSite Pro',
    maxPages: 10,
    maxClients: 0,
    price: 'R$ 19,90/mês',
    features: ['Até 10 MiniSites', 'Recursos liberados', 'Sem marcas']
  },
  agency: {
    id: 'e0a9d0a0-0003-4000-8000-000000000003',
    name: 'RS MiniSite Agente',
    maxPages: 500,
    maxClients: 100,
    price: 'R$ 129,90/mês',
    features: [
      'Acessos e Sub-contas',
      'Gestão de até 100 clientes (0% taxa)',
      'Acima de 100 clientes: 10% de taxa/cliente',
      'Venda mínima na plataforma: R$ 5,00',
      'Marca Própria (White-label)'
    ]
  },
  admin_master: {
    id: 'admin_master',
    name: 'Admin Master',
    maxPages: Infinity,
    maxClients: Infinity,
    price: 'Acesso Global',
    features: ['Gestão de Usuários', 'Gestão de Agências', 'Controle Financeiro', 'Acesso a Todos os Sites']
  }
};

export const INITIAL_USER: UserProfile = {
  id: 'master-001',
  name: 'RS PRÓLIPSI',
  email: 'rsprolipsioficial@gmail.com',
  plan: 'free',
  referralCode: 'rsprolipsi',
  idNumerico: 1, // [RS-MASTER-NUMERIC-ID]
  consultantId: 'rsprolipsi',
  avatarUrl: 'https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6',
  address: {
    zip: '83314-326',
    street: 'Rua Tereza Liberato Ricardo',
    number: '13',
    neighborhood: 'Planta Vera Cruz',
    city: 'Piraquara',
    state: 'PR'
  }
};

export const INITIAL_SITES: BioSite[] = [];