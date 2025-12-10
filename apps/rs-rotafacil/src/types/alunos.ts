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
  nome_colegio: string;
  
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
  
  // Relacionamentos
  van_id: string;
  user_id: string;
  
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlunoFormData {
  nome_completo: string;
  nome_responsavel: string;
  turno: 'manha' | 'tarde' | 'integral' | 'noite';
  serie: string;
  nome_colegio: string;
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
  van_id: string;
}