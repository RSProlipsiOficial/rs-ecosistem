export interface ManutencaoVan {
  id: string;
  user_id: string;
  van_id: string;
  data_relato: string;
  tipo_problema: 'motor' | 'freios' | 'pneus' | 'eletrica' | 'carroceria' | 'ar_condicionado' | 'geral';
  descricao_problema: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'aguardando_pecas' | 'concluido' | 'cancelado';
  data_solucao?: string;
  observacoes_solucao?: string;
  custo_reparo?: number;
  created_at: string;
  updated_at: string;
}

export interface ManutencaoFormData {
  van_id: string;
  tipo_problema: string;
  descricao_problema: string;
  prioridade: string;
}

export const TIPOS_PROBLEMA = [
  { value: 'motor', label: 'Motor' },
  { value: 'freios', label: 'Freios' },
  { value: 'pneus', label: 'Pneus' },
  { value: 'eletrica', label: 'Sistema Elétrico' },
  { value: 'carroceria', label: 'Carroceria' },
  { value: 'ar_condicionado', label: 'Ar Condicionado' },
  { value: 'geral', label: 'Geral' },
];

export const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa', color: 'bg-blue-500' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-500' },
];

export const STATUS_MANUTENCAO = [
  { value: 'pendente', label: 'Pendente', color: 'bg-gray-500' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-500' },
  { value: 'aguardando_pecas', label: 'Aguardando Peças', color: 'bg-yellow-500' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
];