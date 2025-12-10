export interface ChecklistMotorista {
  id: string;
  user_id: string;
  van_id: string;
  data: string;
  status: 'revisado' | 'nao_revisado';
  horario_preenchimento: string;
  fora_horario: boolean;
  
  // Itens do checklist
  pneus: boolean;
  estepe: boolean;
  oleo_motor: boolean;
  agua_radiador: boolean;
  freios: boolean;
  luzes_externas: boolean;
  cinto_seguranca: boolean;
  limpador_parabrisa: boolean;
  vidros_retrovisores: boolean;
  itens_soltos: boolean;
  portas_trancas: boolean;
  
  // Campos específicos
  combustivel: number | null;
  quilometragem: number;
  observacoes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface ChecklistFormData {
  van_id: string;
  data: string;
  observacoes?: string;
  pneus: boolean;
  estepe: boolean;
  oleo_motor: boolean;
  agua_radiador: boolean;
  freios: boolean;
  luzes_externas: boolean;
  cinto_seguranca: boolean;
  limpador_parabrisa: boolean;
  vidros_retrovisores: boolean;
  itens_soltos: boolean;
  portas_trancas: boolean;
  combustivel: number | null;
  quilometragem: number;
}

export interface ItemChecklist {
  key: keyof ChecklistFormData;
  label: string;
  description: string;
  required: boolean;
  type: 'boolean' | 'number' | 'text';
}

export const ITENS_CHECKLIST: ItemChecklist[] = [
  { key: 'pneus', label: 'Pneus', description: 'Verificar estado e calibragem', required: true, type: 'boolean' },
  { key: 'estepe', label: 'Estepe', description: 'Verificar se está em boas condições', required: true, type: 'boolean' },
  { key: 'oleo_motor', label: 'Óleo do motor', description: 'Conferir nível e validade', required: true, type: 'boolean' },
  { key: 'agua_radiador', label: 'Água do radiador', description: 'Verificar nível', required: true, type: 'boolean' },
  { key: 'freios', label: 'Freios', description: 'Testar pedal, ruído, resposta', required: true, type: 'boolean' },
  { key: 'luzes_externas', label: 'Luzes externas', description: 'Verificar funcionamento completo (farol, seta, ré)', required: true, type: 'boolean' },
  { key: 'cinto_seguranca', label: 'Cinto de segurança', description: 'Conferir se todos funcionam', required: true, type: 'boolean' },
  { key: 'limpador_parabrisa', label: 'Limpador de para-brisa', description: 'Testar funcionamento', required: true, type: 'boolean' },
  { key: 'vidros_retrovisores', label: 'Vidros e retrovisores', description: 'Conferir se estão limpos e íntegros', required: true, type: 'boolean' },
  { key: 'itens_soltos', label: 'Itens soltos na van', description: 'Verificar se não há objetos soltos ou perigosos', required: true, type: 'boolean' },
  { key: 'portas_trancas', label: 'Portas e trancas', description: 'Testar se abrem/fecham corretamente', required: true, type: 'boolean' },
];

export const CAMPOS_ESPECIAIS = [
  { key: 'combustivel', label: 'Combustível (%)', description: 'Marcar nível atual', type: 'number' as const },
  { key: 'quilometragem', label: 'Quilometragem', description: 'Número do hodômetro', type: 'number' as const },
];