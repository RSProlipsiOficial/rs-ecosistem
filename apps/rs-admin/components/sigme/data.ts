// Mock data para componentes SIGMA no rs-admin
// Substituído por dados reais da API

export const mockUser = {
  id: '',
  name: '',
  email: '',
  nivel_carreira: '',
  foto_perfil: null
};

export const mockCycleSummary = {
  currentCycle: 0,
  totalCycles: 0,
  peopleInCurrentCycle: 0,
  cycleGoal: 0,
  bonusPerCycle: 0,
  totalEarned: 0,
  nextCycleProgress: 0
};

export const mockCycleInfo = {
  cycleNumber: 0,
  peopleNeeded: 0,
  totalPeople: 0,
  bonusValue: 0,
  status: 'pending'
};

export const mockBonusDepthData = {
  levels: [],
  totalBonus: 0,
  totalMembers: 0
};

export const mockBonusFidelityData = {
  cycles: [],
  totalEarned: 0,
  totalPending: 0
};

export const mockCareerPlan = {
  currentLevel: '',
  currentPoints: 0,
  nextLevel: '',
  pointsToNext: 0,
  currentCycles: 0,
  pinTable: [],
  benefits: [],
  levels: []
};

export const mockTopSigmeRanking: any[] = [];

export const mockTopSigmeMonthlySummary = {
  poolTotal: 0,
  yourPosition: 0,
  yourBonus: 0,
  monthlyVolume: 0,
  totalGlobalCycles: 0,
  totalDistributed: 0,
  closingDate: '-'
};

export const mockDirects: any[] = [];

export const mockMatrixMembers: any[] = [];

export const mockCDProducts: any[] = [];

export const mockDistributionCenters: any[] = [];

export const mockBonuses: any[] = [];

export const mockFullNetwork = {
  id: 'root',
  user_id: '',
  parent_id: null,
  position: 0,
  level: 0,
  is_active: false,
  created_at: '',
  user: mockUser,
  children: []
};

export function generateMatrixNetwork(userId: string, matrixId: number) {
  return mockFullNetwork;
}
