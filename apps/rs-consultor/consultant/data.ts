import type { User, WalletTransaction, ShopOrder, SystemMessage, CycleInfo, NetworkNode, Invoice, Subscription, AnticipationRequest, Course, CDInfo, CDProduct, CDConsultantOrder, CDInventoryItem, Incentive } from '../types';

export const mockUser: User & { [key: string]: any } = {
  id: '',
  name: 'Carregando...',
  email: '',
  avatarUrl: '',
  whatsapp: '',
  cpfCnpj: '',
  pin: 'Iniciante',
  status: 'active',
  birthDate: '',
  registrationDate: '',
  hasPurchased: false,
  address: { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '' },
  bankAccount: { bank: '', agency: '', accountNumber: '', accountType: 'checking', pixKey: '' },
  idConsultor: '',
  isNetworkActive: false,
  graduacao: 'Iniciante',
  categoria: 'Consultor',
  linkIndicacao: '',
  linkLoja: '',
  linkAfiliado: '',
  personalVolume: 0,
  groupVolume: 0,
  totalVolume: 0,
  bonusCicloGlobal: 0,
  bonusTopSigme: 0,
  bonusPlanoCarreira: 0,
  bonusProfundidade: 0,
  upline: '',
};

export const mockPromoBanners = [
  { id: '1', title: 'Bônus de Liderança', preTitle: 'Nova Campanha', ctaText: 'Saiba Mais', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1674&q=80' },
  { id: '2', title: 'Cruzeiro 2026', preTitle: 'Qualifique-se', ctaText: 'Ver Regras', imageUrl: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1746&q=80' },
  { id: '3', title: 'Convenção Nacional', preTitle: 'Imperdível', ctaText: 'Comprar Ingresso', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80' },
  { id: '4', title: 'Lançamento de Produtos', preTitle: 'Novidade', ctaText: 'Ver Catálogo', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80' },
];

export const mockWalletTransactions: WalletTransaction[] = [];

export const mockShopOrders: ShopOrder[] = [];

export const mockMessages: SystemMessage[] = [];

export const createEmptyNode = (id: string, level: number): NetworkNode => ({
  id,
  name: 'Vago',
  email: '',
  avatarUrl: '',
  whatsapp: '',
  status: 'inactive',
  pin: 'Vago',
  cpfCnpj: '',
  birthDate: '',
  registrationDate: '',
  hasPurchased: false,
  level,
  children: [],
  isEmpty: true,
  address: { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' },
  bankAccount: { bank: '', agency: '', accountNumber: '', accountType: 'checking', pixKey: '' }
});

export const mockNetworkMembers: User[] = [];

export const mockCycleInfo: CycleInfo[] = [];

export const mockCycleProgress = {
  l1: { current: 0, total: 6 },
  l2: { current: 0, total: 36 },
  l3: { current: 0, total: 216 },
};

export const mockCycleSummary = [];

export const mockNetwork: NetworkNode = {
  ...mockUser,
  id: 'root-placeholder',
  level: 0,
  children: []
};

export const mockDeepNetwork: NetworkNode = mockNetwork;
export const mockFullNetwork: NetworkNode = mockNetwork;

export const mockBonuses = [];

export const mockCareerPlan = {
  currentCycles: 0,
  quarterlyEarnings: 0,
  monthlyGrowth: [],
  pinTable: [
    { pin: 'Bronze', cycles: 5, minLines: 0, vmec: '—', bonus: 13.50, iconColor: '#cd7f32' },
    { pin: 'Prata', cycles: 15, minLines: 1, vmec: '100%', bonus: 40.50, iconColor: '#c0c0c0' },
    { pin: 'Ouro', cycles: 70, minLines: 1, vmec: '100%', bonus: 189.00, iconColor: '#ffd700' },
    { pin: 'Safira', cycles: 150, minLines: 2, vmec: '60/40', bonus: 405.00, iconColor: '#0f52ba' },
    { pin: 'Esmeralda', cycles: 300, minLines: 2, vmec: '60/40', bonus: 810.00, iconColor: '#50c878' },
    { pin: 'Topázio', cycles: 500, minLines: 2, vmec: '60/40', bonus: 1350.00, iconColor: '#ffc87c' },
    { pin: 'Rubi', cycles: 750, minLines: 3, vmec: '50/30/20', bonus: 2025.00, iconColor: '#e0115f' },
    { pin: 'Diamante', cycles: 1500, minLines: 3, vmec: '50/30/20', bonus: 4050.00, iconColor: '#b9f2ff' },
    { pin: 'Duplo Diamante', cycles: 3000, minLines: 4, vmec: '40/30/20/10', bonus: 18450.00, iconColor: '#82EEFF' },
    { pin: 'Triplo Diamante', cycles: 5000, minLines: 5, vmec: '35/25/20/10/10', bonus: 36450.00, iconColor: '#00BFFF' },
    { pin: 'Diamante Red', cycles: 15000, minLines: 6, vmec: '30/20/18/12/10/10', bonus: 67500.00, iconColor: '#ff4500' },
    { pin: 'Diamante Blue', cycles: 25000, minLines: 6, vmec: '30/20/18/12/10/10', bonus: 105300.00, iconColor: '#4169e1' },
    { pin: 'Diamante Black', cycles: 50000, minLines: 6, vmec: '30/20/18/12/10/10', bonus: 135000.00, iconColor: '#e5e7eb' },
  ]
};

export const mockShopCareerPlan = {
  currentRevenue: 0,
  quarterlyRevenue: 0,
  monthlyGrowth: [],
  pinTable: [
    { pin: 'Vendedor Bronze', revenue: 5000, bonus: 100, iconColor: 'text-amber-600' },
    { pin: 'Vendedor Prata', revenue: 10000, bonus: 250, iconColor: 'text-gray-400' },
    { pin: 'Vendedor Ouro', revenue: 20000, bonus: 500, iconColor: 'text-yellow-400' },
    { pin: 'Líder de Vendas', revenue: 40000, bonus: 1000, iconColor: 'text-emerald-400' },
    { pin: 'Executivo de Vendas', revenue: 80000, bonus: 2500, iconColor: 'text-blue-400' },
    { pin: 'Diretor de Vendas', revenue: 150000, bonus: 5000, iconColor: 'text-indigo-400' },
    { pin: 'Embaixador Bronze', revenue: 300000, bonus: 10000, iconColor: 'text-rose-400' },
    { pin: 'Embaixador Prata', revenue: 600000, bonus: 20000, iconColor: 'text-fuchsia-400' },
    { pin: 'Embaixador Ouro', revenue: 1000000, bonus: 50000, iconColor: 'text-violet-400' },
  ]
};

export const mockTopSigmeRanking = [];
export const mockTopSigmeDashboardMembers = [];

export const mockTopSigmePersonalStats = {
  totalEarnings: 0,
};

export const mockTopSigmeMonthlySummary = {
  totalGlobalCycles: 0,
  totalDistributed: 0,
  closingDate: '-',
};

export const mockInvoices: Invoice[] = [];

export const mockSubscriptions: Subscription[] = [];

export const mockShopProducts = [];

export const mockAffiliateSellers = [];

export const mockShortenedLinks = [];

export const mockShopSettings = {
  storeSlug: '',
  payoutMethod: 'pix',
};

export const mockPixels = [];

export const mockIncentives: Incentive[] = [];

export const mockMatrixMembers: User[] = [];

export const mockDirects: User[] = [];

export const generateMatrixNetwork = (
  width: number,
  depth: number,
  rootUser: User,
  directs: User[],
  pool: User[]
): NetworkNode => {
  return {
    ...rootUser,
    level: 0,
    children: [],
  };
};

export const countNetworkNodes = (node: NetworkNode): number => {
  if (!node || node.isEmpty) return 0;
  let count = 1;
  if (node.children) {
    count += node.children.reduce((acc, child) => acc + countNetworkNodes(child), 0);
  }
  return count;
};

export const mockAnticipationRequests: AnticipationRequest[] = [];

export const mockCourses: Course[] = [];

export const mockDistributionCenters = [];

export const mockCDInfo: CDInfo = {
  name: "",
  email: "",
  phone: "",
  address: { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' },
  payment: {
    pixKey: {
      type: 'cpf',
      key: ''
    },
    apiKeys: { mercadoPago: '', pagSeguro: '', cielo: '', getnet: '', stone: '', pagoFacil: '', redLink: '', emax: '' }
  },
  shipping: {
    allowLocalPickup: true,
    apiKeys: { melhorEnvio: '', loggi: '', superFrete: '', correios: '', frenet: '' }
  }
};

export const mockCDProducts: CDProduct[] = [];

export const mockCDConsultantOrders: CDConsultantOrder[] = [];

export const mockCDInventory: CDInventoryItem[] = [];

export const mockActivationHistory = [];

export const mockNetworkReport = [];

export const mockUserBadges = [];

export const mockActivityFeed = [];

export const BONUS_PROFUNDIDADE_BASE = 0;

export const mockBonusDepthData = [];

export const mockBonusFidelityData = [];