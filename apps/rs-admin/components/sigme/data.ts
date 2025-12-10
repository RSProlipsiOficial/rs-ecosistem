// Mock data para componentes SIGMA no rs-admin
// Dados completos vindos do rs-consultor

export const mockUser = {
  id: 'user-123',
  name: 'João Silva',
  email: 'joao@example.com',
  nivel_carreira: 'Ouro',
  foto_perfil: null
};

export const mockCycleSummary = {
  currentCycle: 3,
  totalCycles: 2,
  peopleInCurrentCycle: 4,
  cycleGoal: 6,
  bonusPerCycle: 108,
  totalEarned: 216,
  nextCycleProgress: 66.67
};

export const mockCycleInfo = {
  cycleNumber: 3,
  peopleNeeded: 2,
  totalPeople: 4,
  bonusValue: 108,
  status: 'in_progress'
};

export const mockBonusDepthData = {
  levels: [
    { level: 1, members: 6, bonus: 147.12, percentage: 6.81 },
    { level: 2, members: 12, bonus: 294.24, percentage: 6.81 },
    { level: 3, members: 8, bonus: 196.16, percentage: 6.81 },
    { level: 4, members: 4, bonus: 98.08, percentage: 6.81 },
    { level: 5, members: 2, bonus: 49.04, percentage: 6.81 },
    { level: 6, members: 1, bonus: 24.52, percentage: 6.81 },
    { level: 7, members: 0, bonus: 0, percentage: 6.81 },
    { level: 8, members: 0, bonus: 0, percentage: 6.81 },
    { level: 9, members: 0, bonus: 0, percentage: 6.81 }
  ],
  totalBonus: 809.16,
  totalMembers: 33
};

export const mockBonusFidelityData = {
  cycles: [
    { cycleNumber: 2, previousCycle: 1, bonusValue: 108, status: 'paid', paidDate: '2024-11-05' },
    { cycleNumber: 3, previousCycle: 2, bonusValue: 108, status: 'pending', paidDate: null }
  ],
  totalEarned: 108,
  totalPending: 108
};

export const mockCareerPlan = {
  currentLevel: 'Ouro',
  currentPoints: 2100,
  nextLevel: 'Platina',
  pointsToNext: 900,
  currentCycles: 7,
  pinTable: [],
  benefits: [
    { name: 'Bônus Mensal', value: 'R$ 1.500,00', type: 'bonus' },
    { name: 'Viagem Anual', value: 'Internacional', type: 'benefit' },
    { name: 'Carro Popular', value: 'Disponível', type: 'reward' }
  ],
  levels: [
    { name: 'Bronze', min: 0, max: 500, color: '#CD7F32', benefits: 2 },
    { name: 'Prata', min: 500, max: 1500, color: '#C0C0C0', benefits: 4 },
    { name: 'Ouro', min: 1500, max: 3000, color: '#FFD700', benefits: 6 },
    { name: 'Platina', min: 3000, max: 6000, color: '#E5E4E2', benefits: 8 },
    { name: 'Diamante', min: 6000, max: 999999, color: '#B9F2FF', benefits: 12 }
  ]
};

export const mockTopSigmeRanking = [
  { position: 1, name: 'Carlos Mendes', cycles: 15, volume: 54000, bonus: 1350, percentage: 25, earnings: 1350, avatarUrl: null },
  { position: 2, name: 'Ana Lima', cycles: 12, volume: 43200, bonus: 1080, percentage: 20, earnings: 1080, avatarUrl: null },
  { position: 3, name: 'Pedro Costa', cycles: 10, volume: 36000, bonus: 810, percentage: 15, earnings: 810, avatarUrl: null },
  { position: 4, name: 'Maria Santos', cycles: 8, volume: 28800, bonus: 648, percentage: 12, earnings: 648, avatarUrl: null },
  { position: 5, name: 'João Silva', cycles: 7, volume: 25200, bonus: 540, percentage: 10, earnings: 540, avatarUrl: null },
  { position: 6, name: 'Juliana Rocha', cycles: 6, volume: 21600, bonus: 378, percentage: 7, earnings: 378, avatarUrl: null },
  { position: 7, name: 'Roberto Alves', cycles: 5, volume: 18000, bonus: 270, percentage: 5, earnings: 270, avatarUrl: null },
  { position: 8, name: 'Fernanda Dias', cycles: 4, volume: 14400, bonus: 162, percentage: 3, earnings: 162, avatarUrl: null },
  { position: 9, name: 'Lucas Ferreira', cycles: 3, volume: 10800, bonus: 108, percentage: 2, earnings: 108, avatarUrl: null },
  { position: 10, name: 'Beatriz Cunha', cycles: 2, volume: 7200, bonus: 54, percentage: 1, earnings: 54, avatarUrl: null }
];

export const mockTopSigmeMonthlySummary = {
  poolTotal: 5400,
  yourPosition: 5,
  yourBonus: 540,
  monthlyVolume: 240000,
  totalGlobalCycles: 100,
  totalDistributed: 5400,
  closingDate: '2024-12-01'
};

export const mockDirects = [
  { id: '1', name: 'Membro 1', level: 1, active: true },
  { id: '2', name: 'Membro 2', level: 1, active: true },
  { id: '3', name: 'Membro 3', level: 1, active: true },
  { id: '4', name: 'Membro 4', level: 1, active: false },
  { id: '5', name: 'Membro 5', level: 1, active: true },
  { id: '6', name: 'Membro 6', level: 1, active: true }
];

export const mockMatrixMembers = Array.from({ length: 6 }, (_, i) => ({
  id: `matrix-${i + 1}`,
  name: `Membro ${i + 1}`,
  position: i + 1,
  active: i < 4,
  joinedDate: '2024-11-01'
}));

export const mockCDProducts = [
  { id: 1, name: 'Produto 1', price: 60, stock: 100, category: 'Categoria A' },
  { id: 2, name: 'Produto 2', price: 60, stock: 50, category: 'Categoria B' },
  { id: 3, name: 'Produto 3', price: 60, stock: 75, category: 'Categoria A' }
];

export const mockDistributionCenters = [
  { id: 1, name: 'CD São Paulo', city: 'São Paulo', state: 'SP', products: 150 },
  { id: 2, name: 'CD Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', products: 120 }
];

export const mockBonuses = [
  { id: '1', type: 'Matriz', value: 108, date: '2024-11-01', status: 'paid' },
  { id: '2', type: 'Profundidade', value: 147.12, date: '2024-11-05', status: 'paid' },
  { id: '3', type: 'Fidelidade', value: 108, date: '2024-11-08', status: 'pending' }
];

export const mockFullNetwork = {
  id: 'root',
  user_id: 'user-123',
  parent_id: null,
  position: 0,
  level: 0,
  is_active: true,
  created_at: '2024-01-01',
  user: mockUser,
  children: [
    {
      id: 'child-1',
      user_id: 'user-124',
      parent_id: 'user-123',
      position: 1,
      level: 1,
      is_active: true,
      created_at: '2024-02-01',
      user: { id: 'user-124', name: 'Membro 1', email: 'membro1@example.com', nivel_carreira: 'Prata', foto_perfil: null },
      children: []
    },
    {
      id: 'child-2',
      user_id: 'user-125',
      parent_id: 'user-123',
      position: 2,
      level: 1,
      is_active: true,
      created_at: '2024-02-15',
      user: { id: 'user-125', name: 'Membro 2', email: 'membro2@example.com', nivel_carreira: 'Bronze', foto_perfil: null },
      children: []
    }
  ]
};

export function generateMatrixNetwork(userId: string, matrixId: number) {
  return mockFullNetwork;
}
