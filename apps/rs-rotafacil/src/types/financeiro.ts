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
  
  // Dados do aluno (quando fizer join)
  aluno?: {
    nome_completo: string;
    van_id: string;
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

export interface ResumoFinanceiro {
  totalGanhos: number;
  totalGastos: number;
  saldoFinal: number;
  totalGanhosMensalidades: number;
  totalGanhosExtras: number;
  totalGastosPagos: number;
  totalGastosPendentes: number;
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
  tipo: 'fixo' | 'variavel';
  status: 'pago' | 'nao_pago' | 'em_aberto';
  data_vencimento?: string;
  data_pagamento?: string;
  observacoes?: string;
}