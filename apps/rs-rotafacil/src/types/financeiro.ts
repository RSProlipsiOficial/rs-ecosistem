export interface PagamentoMensal {
  id: string;
  aluno_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: 'pago' | 'nao_pago' | 'em_aberto';
  data_pagamento?: string;
  observacoes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  pix_id?: string | null;
  pix_qr_code?: string | null;
  pix_qr_code_base64?: string | null;
  pix_expiration?: string | null;

  // Dados do aluno (quando fizer join)
  aluno?: {
    nome_completo: string;
    nome_responsavel: string;
    whatsapp_responsavel?: string;
    email?: string;
    cpf?: string;
    van_id: string;
    turno: string;
    valor_mensalidade?: number;
    valor_letalidade?: number;
    dia_vencimento?: number;
    vans?: {
      nome: string;
    };
  };
}

export interface GanhoExtra {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'frete' | 'excursao' | 'ajuda' | 'presente' | 'outro';
  data_ganho: string;
  observacoes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Gasto {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'fixo' | 'variavel';
  categoria_detalhada: string;
  tipo_apuracao: 'EMPRESA' | 'DONO';
  status: 'pago' | 'nao_pago' | 'em_aberto';
  data_vencimento?: string;
  data_pagamento?: string;
  mes: number;
  ano: number;
  observacoes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Enum de Categorias de Gastos
export type CategoriaGasto =
  | 'FIXO'
  | 'VARIAVEL'
  | 'COMBUSTIVEL'
  | 'MANUTENCAO'
  | 'PNEUS'
  | 'MULTAS'
  | 'IMPOSTOS'
  | 'SALARIOS_DIARIAS'
  | 'TERCEIROS'
  | 'ADMIN'
  | 'OUTROS';

// Mapeamento de categorias para exibição
export const CATEGORIAS_LABELS: Record<CategoriaGasto, string> = {
  FIXO: 'Fixo',
  VARIAVEL: 'Variável',
  COMBUSTIVEL: 'Combustível',
  MANUTENCAO: 'Manutenção',
  PNEUS: 'Pneus',
  MULTAS: 'Multas',
  IMPOSTOS: 'Impostos',
  SALARIOS_DIARIAS: 'Salários/Diárias',
  TERCEIROS: 'Terceiros',
  ADMIN: 'Administrativo',
  OUTROS: 'Outros'
};

// Mapeamento de ícones por categoria
export const CATEGORIAS_ICONES: Record<CategoriaGasto, string> = {
  FIXO: '📌',
  VARIAVEL: '📊',
  COMBUSTIVEL: '⛽',
  MANUTENCAO: '🔧',
  PNEUS: '🛞',
  MULTAS: '🚨',
  IMPOSTOS: '💰',
  SALARIOS_DIARIAS: '👷',
  TERCEIROS: '🤝',
  ADMIN: '📋',
  OUTROS: '⚙️'
};

// Mapeamento de cores por categoria (Tailwind classes)
export const CATEGORIAS_CORES: Record<CategoriaGasto, string> = {
  FIXO: 'bg-blue-500/10 text-blue-500 border-blue-500/50',
  VARIAVEL: 'bg-orange-500/10 text-orange-500 border-orange-500/50',
  COMBUSTIVEL: 'bg-red-500/10 text-red-500 border-red-500/50',
  MANUTENCAO: 'bg-purple-500/10 text-purple-500 border-purple-500/50',
  PNEUS: 'bg-gray-500/10 text-gray-400 border-gray-500/50',
  MULTAS: 'bg-red-700/10 text-red-700 border-red-700/50',
  IMPOSTOS: 'bg-green-500/10 text-green-500 border-green-500/50',
  SALARIOS_DIARIAS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50',
  TERCEIROS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50',
  ADMIN: 'bg-violet-500/10 text-violet-400 border-violet-500/50',
  OUTROS: 'bg-gray-600/10 text-gray-500 border-gray-600/50'
};

export interface LancamentoFinanceiro {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  origem: 'mensalidade' | 'manual' | 'ajuste';
  referencia_id?: string;
  categoria: CategoriaGasto | string; // string para retrocompatibilidade
  subcategoria?: string;
  descricao: string;
  valor: number;
  competencia: string; // YYYY-MM
  data_evento: string;
  status: 'previsto' | 'realizado';
  pagamento_status: 'pago' | 'pendente';
  alocacao: 'empresa' | 'dono' | 'misto';
  van_id?: string;
  aluno_id?: string;
  pix_id?: string | null;
  pix_qr_code?: string | null;
  pix_qr_code_base64?: string | null;
  pix_expiration?: string | null;
  created_at: string;
  // Dados do aluno (quando fizer join)
  aluno?: {
    nome_completo: string;
    turno: string;
    whatsapp_responsavel?: string;
    dia_vencimento?: number;
    vans?: {
      nome: string;
    };
  };
}

export interface RegraFinanceira {
  user_id: string;
  pro_labore_padrao: number;
  reservas_percentual: number;
  categorias_ativas: string[];
}

export interface ResumoFinanceiro {
  totalGanhos: number;
  totalGastos: number;
  saldoFinal: number;
  totalGanhosMensalidades: number;
  totalMensalidadesPendentes: number;
  totalMensalidadesPrevistas: number;
  totalGanhosExtras: number;
  totalGastosPagos: number;
  totalGastosPendentes: number;
  // Métricas de Auditoria
  totalGastosEmpresa: number;
  totalRetiradaDono: number;
  lucroOperacional: number;
  lucroLiquido: number; // Lucro após retiradas do dono
  metaProLabore: number; // Meta/Teto de retiradas
}

export interface GanhoExtraFormData {
  descricao: string;
  valor: number;
  tipo: 'frete' | 'excursao' | 'ajuda' | 'presente' | 'outro';
  data_ganho: string;
  observacoes?: string;
}

export interface GastoFormData {
  descricao: string;
  valor: number;
  categoria: CategoriaGasto;
  subcategoria?: string;
  alocacao: 'empresa' | 'dono' | 'misto';
  status: 'pago' | 'pendente' | 'atrasado';
  data_evento?: string;
  data_vencimento?: string;
  observacoes?: string;
  van_id?: string;
}