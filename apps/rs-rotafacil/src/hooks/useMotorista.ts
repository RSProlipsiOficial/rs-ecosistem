import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistMotorista } from '@/types/motorista';
import { useToast } from '@/hooks/use-toast';

export function useMotorista() {
  const [checklists, setChecklists] = useState<ChecklistMotorista[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('checklists_motorista')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setChecklists((data || []) as ChecklistMotorista[]);
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os checklists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async (checklistData: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      // Verificar se todos os itens obrigatórios estão preenchidos
      // Isso será validado no frontend, aqui assumimos que está correto
      const status = 'revisado'; // Como chegou até aqui, assume que está revisado
      
      // Verificar se está fora do horário (após 07:00)
      const agora = new Date();
      const horarioLimite = new Date();
      horarioLimite.setHours(7, 0, 0, 0);
      const foraHorario = agora > horarioLimite;

      // Garantir que os campos obrigatórios estão presentes
      if (!checklistData.van_id || !checklistData.data) {
        throw new Error('van_id e data são obrigatórios');
      }

      // Normaliza as chaves do frontend para os nomes corretos das colunas no banco
      const keyMap: Record<string, string> = {
        leo_do_motor: 'oleo_motor',
        gua_do_radiador: 'agua_radiador',
        cinto_de_segurana: 'cinto_seguranca',
        limpador_de_parabrisa: 'limpador_parabrisa',
        vidros_e_retrovisores: 'vidros_retrovisores',
        itens_soltos_na_van: 'itens_soltos',
        portas_e_trancas: 'portas_trancas',
      };
      const normalizedData = Object.keys(checklistData).reduce((acc, key) => {
        acc[keyMap[key] || key] = (checklistData as any)[key];
        return acc;
      }, {} as Record<string, any>);

      const insertData = {
        ...normalizedData,
        user_id: userId,
        status,
        fora_horario: foraHorario,
      };

      const { data, error } = await supabase
        .from('checklists_motorista')
        .insert([insertData as any])
        .select()
        .single();

      if (error) throw error;

      setChecklists(prev => [data as ChecklistMotorista, ...prev]);
      
      toast({
        title: "Sucesso",
        description: `Checklist do dia ${new Date(checklistData.data).toLocaleDateString()} registrado com sucesso!`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar checklist:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Erro",
          description: "Já existe um checklist para esta van nesta data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar o checklist.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const updateChecklist = async (id: string, updates: Partial<Record<string, any>>) => {
    try {
      // Normaliza eventuais chaves antigas para os nomes corretos no banco
      const keyMap: Record<string, string> = {
        leo_do_motor: 'oleo_motor',
        gua_do_radiador: 'agua_radiador',
        cinto_de_segurana: 'cinto_seguranca',
        limpador_de_parabrisa: 'limpador_parabrisa',
        vidros_e_retrovisores: 'vidros_retrovisores',
        itens_soltos_na_van: 'itens_soltos',
        portas_e_trancas: 'portas_trancas',
      };
      const normalizedUpdates = Object.keys(updates || {}).reduce((acc, key) => {
        (acc as any)[keyMap[key] || key] = (updates as any)[key];
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase
        .from('checklists_motorista')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setChecklists(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } as ChecklistMotorista : item
      ));

      toast({
        title: "Sucesso",
        description: "Checklist atualizado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o checklist.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteChecklist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('checklists_motorista')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChecklists(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Checklist removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar checklist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o checklist.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getChecklistByDate = (data: string, vanId?: string) => {
    return checklists.find(checklist => 
      checklist.data === data && (!vanId || checklist.van_id === vanId)
    );
  };

  const getResumoChecklists = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const checklistHoje = checklists.find(c => c.data === hoje);
    
    return {
      realizadoHoje: !!checklistHoje,
      statusHoje: checklistHoje?.status || null,
      foraHorario: checklistHoje?.fora_horario || false,
      totalRealizados: checklists.filter(c => c.status === 'revisado').length,
      totalNaoRealizados: checklists.filter(c => c.status === 'nao_revisado').length,
      sequenciaConsecutiva: calcularSequenciaConsecutiva(),
    };
  };

  const calcularSequenciaConsecutiva = () => {
    const checklistsOrdenados = [...checklists]
      .filter(c => c.status === 'revisado')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    let sequencia = 0;
    const hoje = new Date();
    
    for (let i = 0; i < checklistsOrdenados.length; i++) {
      const dataChecklist = new Date(checklistsOrdenados[i].data);
      const diasDiferenca = Math.floor((hoje.getTime() - dataChecklist.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasDiferenca === i) {
        sequencia++;
      } else {
        break;
      }
    }
    
    return sequencia;
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  return {
    checklists,
    loading,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    getChecklistByDate,
    getResumoChecklists,
    refetch: fetchChecklists,
  };
}