export interface PresencaDiaria {
  id: string;
  aluno_id: string;
  data: string;
  status: 'presente' | 'ausente';
  horario_marcacao: string;
  marcado_por?: string;
  observacoes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AlunoComPresenca {
  id: string;
  nome_completo: string;
  nome_responsavel: string;
  whatsapp_responsavel: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  nome_colegio: string;
  turno: string;
  van_id: string;
  presenca?: PresencaDiaria;
}

export interface ResumoColegioTurnoPresenca {
  nome_colegio: string;
  turno: string;
  nome_completo: string; // "Colégio X - Manhã"
  total_alunos: number;
  presentes: number;
  ausentes: number;
  alunos: AlunoComPresenca[];
}

export interface ResumoGeralPresenca {
  total_alunos: number;
  total_presentes: number;
  total_ausentes: number;
  por_colegio_turno: ResumoColegioTurnoPresenca[];
  checklist_motorista_feito: boolean;
  horario_checklist?: string;
}

export const STATUS_PRESENCA = [
  { value: 'presente', label: 'Presente', icon: '✅', color: 'bg-green-500' },
  { value: 'ausente', label: 'Ausente', icon: '❌', color: 'bg-red-500' },
] as const;

export const TURNOS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'integral', label: 'Integral' },
  { value: 'noite', label: 'Noite' },
] as const;