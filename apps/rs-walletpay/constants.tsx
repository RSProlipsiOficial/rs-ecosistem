import React from 'react';
import { LedgerEntry, LedgerEventType, LedgerState, Consultant, Client, Sale } from './types';

// Icons
export const IconDashboard = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>;
export const IconTransactions = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v18"></path><path d="m19 12-7 7-7-7"></path></svg>;
export const IconPayments = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
export const IconLink = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
export const IconPos = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="14" y2="18"></line></svg>;
export const IconCard = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>;
export const IconTransfer = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m17 2 4 4-4 4"></path><path d="M3 12h18"></path><path d="m7 22-4-4 4-4"></path><path d="M21 12H3"></path></svg>;
export const IconWithdraw = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1-.9-2-2-2Z"></path></svg>;
export const IconReports = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>;
export const IconSettings = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
export const IconAdmin = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>;
export const IconUsers = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
export const IconWhatsApp = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.1-.5 0-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.3-.3.1-.1.1-.2 0-.4-.1-.1-.6-1.3-.8-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.4.1.1 1.5 2.3 3.6 3.2.5.2.8.3 1.1.4.5.1 1 .1 1.3 0 .4-.1 1.5-.6 1.7-1.2.2-.5.2-1 .1-1.2-.1-.3-.3-.4-.5-.5zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path></svg>;

export const IconWallet = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1-.9-2-2-2Z"></path></svg>;
export const IconTrendingUp = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>;
export const IconTrendingDown = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>;
export const IconSigma = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 7V4H6v3"></path><path d="M12 4v16"></path><path d="M6 20h12"></path></svg>;
export const IconMarketplace = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>;
export const IconSparkles = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.27 7.11L5 8.35L8.24 11.4L7.34 15.64L12 13.26L16.66 15.64L15.76 11.4L19 8.35L14.73 7.11L12 3Z"/><path d="M5 3L2.27 7.11L-2 8.35L1.24 11.4L0.34 15.64L5 13.26L9.66 15.64L8.76 11.4L12 8.35L7.73 7.11L5 3Z" transform="translate(10, 8) scale(0.5)"/></svg>;
export const IconShoppingBag = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;


// Transaction Type Labels
export const typeLabels: { [key in LedgerEventType]: string } = {
  [LedgerEventType.COMMISSION_SHOP]: "Comissão Loja",
  [LedgerEventType.COMMISSION_REFERRAL]: "Comissão Indicação",
  [LedgerEventType.BONUS]: "Bônus",
  [LedgerEventType.PURCHASE]: "Compra",
  [LedgerEventType.WITHDRAWAL]: "Saque",
  [LedgerEventType.TRANSFER]: "Transferência",
  [LedgerEventType.FEES]: "Taxa",
  [LedgerEventType.ADJUSTMENT]: "Ajuste Manual",
  [LedgerEventType.CHARGEBACK]: "Estorno",
  [LedgerEventType.PAYMENT_RECEIVED]: "Pagamento Recebido"
};

// Mock Data
export const MOCK_LEDGER_ENTRIES: LedgerEntry[] = [];

export const MOCK_USER_PROFILE = {
  id: '',
  name: '',
  email: '',
  phone: '',
  smartCertificate: '',
  currentPin: '',
  currentCycles: 0,
  nextPin: '',
  nextPinCycles: 0,
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
  },
  bank: {
    name: '',
    agency: '',
    account: '',
  }
};

export const MARKETING_PLAN_DATA = {
  matrixCycle: {
    totalValue: 360.00,
    payoutValue: 108.00,
    payoutPercentage: 30,
    reentriesLimit: 10,
    careerPoints: 1,
  },
  depthBonus: [
    { level: 'L1', percentage: 7, value: 1.716 },
    { level: 'L2', percentage: 8, value: 1.961 },
    { level: 'L3', percentage: 10, value: 2.452 },
    { level: 'L4', percentage: 15, value: 3.677 },
    { level: 'L5', percentage: 25, value: 6.129 },
    { level: 'L6', percentage: 35, value: 8.581 },
  ],
  loyaltyBonus: [
    { level: 'L1', percentage: 7, value: 0.315 },
    { level: 'L2', percentage: 8, value: 0.360 },
    { level: 'L3', percentage: 10, value: 0.450 },
    { level: 'L4', percentage: 15, value: 0.675 },
    { level: 'L5', percentage: 25, value: 1.125 },
    { level: 'L6', percentage: 35, value: 1.575 },
  ],
  topSigma: [
    { rank: '1º', percentage: 2 },
    { rank: '2º', percentage: 1.5 },
    { rank: '3º', percentage: 1.2 },
    { rank: '4º', percentage: 1 },
    { rank: '5º', percentage: 0.8 },
    { rank: '6º', percentage: 0.7 },
    { rank: '7º', percentage: 0.6 },
    { rank: '8º', percentage: 0.5 },
    { rank: '9º', percentage: 0.4 },
    { rank: '10º', percentage: 0.3 },
  ],
  careerPlan: [
    { pin: 'Bronze', cycles: 5, lines: 0, vmec: '–', reward: 13.50 },
    { pin: 'Prata', cycles: 15, lines: 1, vmec: '100%', reward: 40.50 },
    { pin: 'Ouro', cycles: 70, lines: 1, vmec: '100%', reward: 189.00 },
    { pin: 'Safira', cycles: 150, lines: 2, vmec: '60/40', reward: 405.00 },
    { pin: 'Esmeralda', cycles: 300, lines: 2, vmec: '60/40', reward: 810.00 },
    { pin: 'Topázio', cycles: 500, lines: 2, vmec: '60/40', reward: 1350.00 },
    { pin: 'Rubi', cycles: 750, lines: 3, vmec: '50/30/20', reward: 2025.00 },
    { pin: 'Diamante', cycles: 1500, lines: 3, vmec: '50/30/20', reward: 4050.00 },
    { pin: 'Duplo Diamante', cycles: 3000, lines: 4, vmec: '40/30/20/10', reward: 18450.00 },
    { pin: 'Triplo Diamante', cycles: 5000, lines: 5, vmec: '35/25/20/10/10', reward: 36450.00 },
    { pin: 'Diamante Red', cycles: 15000, lines: 6, vmec: '30/20/18/12/10/10/1', reward: 67500.00 },
    { pin: 'Diamante Blue', cycles: 25000, lines: 6, vmec: '30/20/18/12/10/10/1', reward: 105300.00 },
    { pin: 'Diamante Black', cycles: 50000, lines: 6, vmec: '30/20/18/12/10/10/1', reward: 135000.00 },
  ]
};

export const MOCK_NETWORK_CONSULTANTS: Consultant[] = [];

export const MOCK_PAYMENT_LINKS: { id: string; name: string; amount: number | null; status: 'active' | 'inactive'; url: string; createdAt: string; }[] = [];

export const MOCK_PIX_KEYS: { id: string; type: string; key: string; isPrimary: boolean; }[] = [];

export const USER_REFERRAL_LINKS = {
  cadastro: `https://rs.wallet/register?sponsor=${MOCK_USER_PROFILE.id || ''}`,
  loja: `https://rs.wallet/shop/${MOCK_USER_PROFILE.id || ''}`,
  produtos: 'https://rs.wallet/products',
};

export const MOCK_MARKETING_MODELS = [
  {
    id: 'model_1',
    title: 'Convite para a Equipe',
    imageUrl: 'https://picsum.photos/400/201',
    contentText: `Olá! 👋\n\nEstou construindo uma equipe de sucesso com a RS Prólipsi e gostaria de convidar você para fazer parte.\n\nÉ uma oportunidade incrível de crescimento pessoal e financeiro. Quer saber mais?\n\nCadastre-se pelo meu link: {{link_cadastro}}`,
  },
  {
    id: 'model_2',
    title: 'Conheça Nossos Produtos',
    imageUrl: 'https://picsum.photos/400/202',
    contentText: `Cuide da sua saúde com os melhores produtos! 🌿\n\nA RS Prólipsi tem uma linha completa para o seu bem-estar.\n\nConfira todos os produtos em minha loja virtual: {{link_loja}}\n\n#saude #bemestar #prolipsi`,
  },
  {
    id: 'model_3',
    title: 'Oportunidade de Renda Extra',
    imageUrl: 'https://picsum.photos/400/203',
    contentText: `Buscando uma forma de complementar sua renda?\n\nCom a RS Prólipsi, você pode empreender e alcançar seus objetivos.\n\nFale comigo para saber como começar ou acesse: {{link_cadastro}}`,
  }
];

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_SALES: Sale[] = [];