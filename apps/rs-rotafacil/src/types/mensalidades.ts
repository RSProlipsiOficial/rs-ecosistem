export interface MensalidadeMensagem {
  id: string;
  pagamento_id: string;
  tipo_mensagem: 'manual' | 'automatica';
  conteudo: string;
  enviada_em: string;
  status: 'enviada' | 'falhou' | 'pendente';
  whatsapp_responsavel?: string;
  user_id?: string;
  created_at: string;
}

export interface MensalidadeConfig {
  id: string;
  user_id: string;
  dias_antes_vencimento: number;
  dias_apos_vencimento: number;
  envio_automatico_ativo: boolean;
  mensagem_antes_vencimento: string;
  mensagem_no_vencimento: string;
  mensagem_apos_vencimento: string;
  chave_pix?: string;
  created_at: string;
  updated_at: string;
}

export interface MensalidadeConfigFormData {
  dias_antes_vencimento: number;
  dias_apos_vencimento: number;
  envio_automatico_ativo: boolean;
  mensagem_antes_vencimento: string;
  mensagem_no_vencimento: string;
  mensagem_apos_vencimento: string;
  chave_pix?: string;
}

export interface PagamentoComAluno {
  id: string;
  aluno_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: 'pago' | 'nao_pago';
  data_pagamento?: string;
  data_vencimento?: string;
  observacoes?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  aluno?: {
    nome_completo: string;
    nome_responsavel: string;
    whatsapp_responsavel: string;
    van_id: string;
    dia_vencimento?: number;
    ativo?: boolean;
    turno?: string;
    vans?: {
      nome: string;
    };
  };
}

export interface MensalidadeResumo {
  totalAlunos: number;
  totalPagos: number;
  totalPendentes: number;
  valorRecebido: number;
  valorPendente: number;
}

export interface MensalidadeFiltros {
  mes: number;
  ano: number;
  van_id?: string;
  status?: string | string[]; // Suporte a multi-seleção de status
  searchTerm?: string;
  aluno_id?: string;
  colegios?: string[];
  turnos?: string[];
  showInactive?: boolean;
}

export interface EnviarMensagemData {
  pagamento_id: string;
  tipo_mensagem: 'manual' | 'automatica';
  conteudo: string;
  whatsapp_responsavel: string;
}