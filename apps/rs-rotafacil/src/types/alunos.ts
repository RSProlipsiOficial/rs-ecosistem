export interface Van {
  id: string;
  nome: string;
  capacidade_maxima: number;
  user_id: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Aluno {
  id: string;
  nome_completo: string;
  nome_responsavel: string;
  turno: 'manha' | 'tarde' | 'integral' | 'noite';
  serie: string;
  sala?: string;
  nome_colegio: string;
  cpf?: string;
  email?: string;

  // Endereço
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  tipo_residencia: 'casa' | 'apartamento' | 'outro';

  // Contato
  whatsapp_responsavel: string;

  // Financeiro
  valor_mensalidade: number;
  valor_letalidade?: number;
  dia_vencimento?: number; // 1-31

  // Relacionamentos
  van_id: string;
  user_id: string;

  ativo: boolean;
  status?: string; // Derivado do RPC
  created_at: string;
  updated_at: string;
}

export interface AlunoFormData {
  nome_completo: string;
  nome_responsavel: string;
  turno: 'manha' | 'tarde' | 'integral' | 'noite';
  serie: string;
  sala?: string;
  nome_colegio: string;
  cpf?: string;
  email?: string;
  senha_responsavel?: string; // Senha para criar conta do responsável
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  tipo_residencia: 'casa' | 'apartamento' | 'outro';
  whatsapp_responsavel: string;
  valor_mensalidade: number;
  valor_letalidade?: number;
  dia_vencimento?: number;
  van_id: string;
}