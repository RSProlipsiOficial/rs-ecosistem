export interface PlanejamentoFinanceiro {
  id?: string;
  user_id: string;
  renda_mensal: number;
  gastos_casa: number;
  lazer: number;
  educacao: number;
  investimentos: number;
  created_at?: string;
  updated_at?: string;
}

export interface VideoEducativo {
  id: string;
  titulo: string;
  descricao: string;
  thumbnail: string;
  youtube_url: string;
  categoria: string;
  duracao?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CategoriaVideo = 
  | 'Fundamentos'
  | 'Planejamento'
  | 'Redução de Gastos'
  | 'Investimento básico'
  | 'Mentalidade financeira';

export const CATEGORIAS_VIDEOS: { value: CategoriaVideo; label: string }[] = [
  { value: 'Fundamentos', label: 'Fundamentos' },
  { value: 'Planejamento', label: 'Planejamento' },
  { value: 'Redução de Gastos', label: 'Redução de Gastos' },
  { value: 'Investimento básico', label: 'Investimento básico' },
  { value: 'Mentalidade financeira', label: 'Mentalidade financeira' },
];