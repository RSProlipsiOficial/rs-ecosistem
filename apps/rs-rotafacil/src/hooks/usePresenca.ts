import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PresencaDiaria, AlunoComPresenca, ResumoGeralPresenca, ResumoColegioTurnoPresenca } from '@/types/presenca';

export function usePresenca(customUserId?: string) {
  const [presencas, setPresencas] = useState<PresencaDiaria[]>([]);
  const [alunosComPresenca, setAlunosComPresenca] = useState<AlunoComPresenca[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPresencasEAlunos = async (data?: string) => {
    try {
      setLoading(true);
      const dataConsulta = data || new Date().toISOString().split('T')[0];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let userId = customUserId || user.id;
      let vanId = user.user_metadata?.van_id;

      // Determine user role for internal logic
      const meta = user.user_metadata;
      const role = (meta?.tipo_usuario || meta?.user_type || 'usuario').toLowerCase();

      const isTeam = role === 'motorista' || role === 'monitora';

      console.log(`[usePresenca] Usuário: ${user.email}, Role: ${role}, vanId: ${vanId}, customUserId: ${customUserId}`);

      // If not a custom ID, check if the user is team (motorista/monitora)
      if (!customUserId && isTeam) {
        // Try to get sponsor ID from metadata first (more reliable)
        const sponsorId = meta?.sponsor_id || meta?.boss_id;

        if (sponsorId) {
          userId = sponsorId;
          console.log(`[usePresenca] Sponsor detectado no metadata: ${userId}`);
        } else {
          // Fallback to usuarios table
          const { data: profile } = await supabase
            .from('usuarios')
            .select('patrocinador_id')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.patrocinador_id) {
            userId = profile.patrocinador_id;
            console.log(`[usePresenca] Sponsor detectado na tabela usuarios: ${userId}`);
          }
        }
      }

      // Buscar todos os alunos vinculados ao dono da conta ou filtrar por van
      let query = (supabase as any)
        .from('alunos')
        .select('*')
        .eq('ativo', true);

      // Se tiver uma van vinculada no metadata, priorizamos esse filtro
      if (vanId) {
        query = query.eq('van_id', vanId);
        console.log(`[usePresenca] Filtrando por vanId: ${vanId}`);
      } else {
        // Caso contrário, filtra pelo ID do usuário (dono)
        query = query.eq('user_id', userId);
        console.log(`[usePresenca] Filtrando por userId: ${userId}`);
      }

      console.log(`[usePresenca] Executando query para alunos com userId: ${userId} e vanId: ${vanId}`);
      const { data: alunos, error: alunosError } = await query;

      if (alunosError) throw alunosError;

      // Buscar presenças do dia para todos os alunos (simplificado, RLS deve cuidar do acesso)
      const { data: presencasData, error: presencasError } = await (supabase as any)
        .from('lista_presenca')
        .select('*')
        .eq('user_id', userId)
        .eq('data', dataConsulta);

      if (presencasError) throw presencasError;

      // Combinar alunos com suas presenças
      const alunosComPresencaData: AlunoComPresenca[] = (alunos || []).map(aluno => {
        const presenca = presencasData?.find((p: any) => p.aluno_id === aluno.id);
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

  const marcarPresenca = async (alunoId: string, status: 'presente' | 'ausente' | 'limpar', data?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const userId = customUserId || session.user.id;
      const dataPresenca = data || new Date().toISOString().split('T')[0];

      // Verificar se já existe presença para este aluno nesta data
      const { data: presencaExistente } = await (supabase as any)
        .from('lista_presenca')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('data', dataPresenca)
        .maybeSingle();

      if (status === 'limpar') {
        if (presencaExistente) {
          const { error } = await supabase
            .from('lista_presenca')
            .delete()
            .eq('id', presencaExistente.id);

          if (error) throw error;

          // Registrar log de auditoria
          await (supabase as any).from('audit_log').insert({
            user_id: session.user.id,
            action: 'presenca_limpa_manual',
            table_name: 'lista_presenca',
            record_id: presencaExistente.id,
            metadata: {
              aluno_id: alunoId,
              data: dataPresenca,
              origem: 'monitoramento_individual'
            }
          });

          // Atualizar estado local
          setPresencas(prev => prev.filter(p => p.id !== presencaExistente.id));
          setAlunosComPresenca(prev => prev.map(aluno =>
            aluno.id === alunoId ? { ...aluno, presenca: undefined } : aluno
          ));

          toast({
            title: "Sucesso",
            description: "Presença removida com sucesso.",
          });
        }
        return;
      }

      if (presencaExistente) {
        // Atualizar presença existente
        const { data, error } = await (supabase as any)
          .from('lista_presenca')
          .update({
            status,
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
        const { data, error } = await (supabase as any)
          .from('lista_presenca')
          .insert([{
            aluno_id: alunoId,
            data: dataPresenca,
            status,
            turno: 'manha', // Defaulting to manha, ideally should come from aluno or input
            user_id: userId
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
        description: error.message || "Não foi possível marcar a presença.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getResumoPresencas = async (data?: string): Promise<ResumoGeralPresenca> => {
    const dataConsulta = data || new Date().toISOString().split('T')[0];

    // Verificar se há checklist do motorista para hoje
    const { data: { user } } = await supabase.auth.getUser();
    const userId = customUserId || user?.id || '00000000-0000-0000-0000-000000000000';

    const { data: checklistHoje } = await supabase
      .from('checklists_frota')
      .select('data_checklist')
      .eq('motorista_id', userId)
      .eq('data_checklist', dataConsulta)
      .maybeSingle(); // Use maybeSingle to avoid error if not found

    // Agrupar alunos por colégio + turno com segurança
    const alunosPorColegioTurno = alunosComPresenca.reduce((acc, aluno) => {
      const colegio = aluno.nome_colegio || 'Sem Colégio';
      const turnoStr = aluno.turno ? (aluno.turno.charAt(0).toUpperCase() + aluno.turno.slice(1)) : 'S/T';
      const chave = `${colegio} - ${turnoStr}`;
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
      horario_checklist: checklistHoje?.data_checklist,
    };
  };

  const zerarPresencas = async (data: string) => {
    try {
      setLoading(true);
      const dataReset = data || new Date().toISOString().split('T')[0];

      // Pegar os IDs dos alunos que estão na lista atual
      const alunosIds = alunosComPresenca.map(a => a.id);

      if (alunosIds.length === 0) return;

      const { error } = await (supabase as any)
        .from('lista_presenca')
        .delete()
        .eq('data', dataReset)
        .in('aluno_id', alunosIds);

      if (error) throw error;

      // Registrar log de auditoria global
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from('audit_log').insert({
          user_id: user.id,
          action: 'zerar_lista_presenca_total',
          table_name: 'lista_presenca',
          metadata: {
            data_reset: dataReset,
            total_alunos_afetados: alunosIds.length,
            ids_alunos: alunosIds,
            origem: 'monitoramento_global_reset'
          }
        });
      }

      // Atualizar estado local
      setPresencas(prev => prev.filter(p => p.data !== dataReset || !alunosIds.includes(p.aluno_id)));
      setAlunosComPresenca(prev => prev.map(aluno => ({
        ...aluno,
        presenca: undefined
      })));

      toast({
        title: "Sucesso",
        description: "Lista de presença zerada com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro ao zerar presenças:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível zerar a lista.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresencasEAlunos();
  }, []);

  return {
    presencas,
    alunosComPresenca,
    loading,
    marcarPresenca,
    zerarPresencas,
    getResumoPresencas,
    refetch: fetchPresencasEAlunos,
  };
}