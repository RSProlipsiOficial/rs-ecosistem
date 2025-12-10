import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PresencaDiaria, AlunoComPresenca, ResumoGeralPresenca, ResumoColegioTurnoPresenca } from '@/types/presenca';

export function usePresenca() {
  const [presencas, setPresencas] = useState<PresencaDiaria[]>([]);
  const [alunosComPresenca, setAlunosComPresenca] = useState<AlunoComPresenca[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPresencasEAlunos = async (data?: string) => {
    try {
      setLoading(true);
      const dataConsulta = data || new Date().toISOString().split('T')[0];
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      // Buscar todos os alunos
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true);

      if (alunosError) throw alunosError;

      // Buscar presenças do dia
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas_diarias')
        .select('*')
        .eq('user_id', userId)
        .eq('data', dataConsulta);

      if (presencasError) throw presencasError;

      // Combinar alunos com suas presenças
      const alunosComPresencaData: AlunoComPresenca[] = (alunos || []).map(aluno => {
        const presenca = presencasData?.find(p => p.aluno_id === aluno.id);
        return {
          ...aluno,
          presenca: presenca as PresencaDiaria
        };
      });

      setPresencas((presencasData || []) as PresencaDiaria[]);
      setAlunosComPresenca(alunosComPresencaData);
    } catch (error) {
      console.error('Erro ao buscar presenças e alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de presença.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarPresenca = async (alunoId: string, status: 'presente' | 'ausente', data?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      const dataPresenca = data || new Date().toISOString().split('T')[0];

      // Verificar se já existe presença para este aluno nesta data
      const { data: presencaExistente } = await supabase
        .from('presencas_diarias')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('data', dataPresenca)
        .eq('user_id', userId)
        .single();

      if (presencaExistente) {
        // Atualizar presença existente
        const { data, error } = await supabase
          .from('presencas_diarias')
          .update({
            status,
            horario_marcacao: new Date().toISOString(),
            marcado_por: userId,
          })
          .eq('id', presencaExistente.id)
          .select()
          .single();

        if (error) throw error;

        // Atualizar estado local
        setPresencas(prev => prev.map(p => 
          p.id === presencaExistente.id ? data as PresencaDiaria : p
        ));
        
        setAlunosComPresenca(prev => prev.map(aluno => 
          aluno.id === alunoId ? { ...aluno, presenca: data as PresencaDiaria } : aluno
        ));
      } else {
        // Criar nova presença
        const { data, error } = await supabase
          .from('presencas_diarias')
          .insert([{
            aluno_id: alunoId,
            data: dataPresenca,
            status,
            marcado_por: userId,
            user_id: userId,
          }])
          .select()
          .single();

        if (error) throw error;

        // Atualizar estado local
        setPresencas(prev => [...prev, data as PresencaDiaria]);
        
        setAlunosComPresenca(prev => prev.map(aluno => 
          aluno.id === alunoId ? { ...aluno, presenca: data as PresencaDiaria } : aluno
        ));
      }

      toast({
        title: "Sucesso",
        description: `Presença marcada como ${status === 'presente' ? 'presente' : 'ausente'}.`,
      });

    } catch (error: any) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a presença.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getResumoPresencas = async (data?: string): Promise<ResumoGeralPresenca> => {
    const dataConsulta = data || new Date().toISOString().split('T')[0];
    
    // Verificar se há checklist do motorista para hoje
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';
    
    const { data: checklistHoje } = await supabase
      .from('checklists_motorista')
      .select('horario_preenchimento')
      .eq('user_id', userId)
      .eq('data', dataConsulta)
      .single();

    // Agrupar alunos por colégio + turno
    const alunosPorColegioTurno = alunosComPresenca.reduce((acc, aluno) => {
      const chave = `${aluno.nome_colegio} - ${aluno.turno.charAt(0).toUpperCase() + aluno.turno.slice(1)}`;
      if (!acc[chave]) {
        acc[chave] = [];
      }
      acc[chave].push(aluno);
      return acc;
    }, {} as Record<string, AlunoComPresenca[]>);

    // Calcular resumo por colégio + turno
    const resumoPorColegioTurno: ResumoColegioTurnoPresenca[] = Object.entries(alunosPorColegioTurno).map(([chave, alunos]) => {
      const presentes = alunos.filter(a => a.presenca?.status === 'presente').length;
      const ausentes = alunos.filter(a => a.presenca?.status === 'ausente').length;
      
      // Extrair colégio e turno da chave
      const [nome_colegio, turno] = chave.split(' - ');
      
      return {
        nome_colegio,
        turno: turno.toLowerCase(),
        nome_completo: chave,
        total_alunos: alunos.length,
        presentes,
        ausentes,
        alunos,
      };
    }).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

    // Calcular totais gerais
    const total_alunos = alunosComPresenca.length;
    const total_presentes = alunosComPresenca.filter(a => a.presenca?.status === 'presente').length;
    const total_ausentes = alunosComPresenca.filter(a => a.presenca?.status === 'ausente').length;

    return {
      total_alunos,
      total_presentes,
      total_ausentes,
      por_colegio_turno: resumoPorColegioTurno,
      checklist_motorista_feito: !!checklistHoje,
      horario_checklist: checklistHoje?.horario_preenchimento,
    };
  };

  useEffect(() => {
    fetchPresencasEAlunos();
  }, []);

  return {
    presencas,
    alunosComPresenca,
    loading,
    marcarPresenca,
    getResumoPresencas,
    refetch: fetchPresencasEAlunos,
  };
}