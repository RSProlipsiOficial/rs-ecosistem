import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ManutencaoVan } from '@/types/manutencao';
import { useToast } from '@/hooks/use-toast';

export function useManutencao() {
  const [manutencoes, setManutencoes] = useState<ManutencaoVan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchManutencoes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userVans } = await supabase.from('vans').select('id').eq('user_id', user.id);
      const vanIds = userVans?.map(v => v.id) || [];

      const { data, error } = await supabase
        .from('manutencoes_frota')
        .select('*')
        .in('van_id', vanIds)
        .order('data_manutencao', { ascending: false });

      if (error) throw error;
      setManutencoes((data || []) as ManutencaoVan[]);
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as manutenções.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createManutencao = async (manutencaoData: Record<string, any>) => {
    try {
      // Basic auth check just to be safe
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const insertData = {
        // user_id: userId, // Table definition doesn't have user_id currently, only motorista for checklists. 
        // We might want to add created_by if needed, but for now matching the schema I created.
        data_manutencao: new Date().toISOString().split('T')[0], // Mapped from data_relato
        van_id: manutencaoData.van_id || null, // Sanitize UUID
        tipo: manutencaoData.tipo_problema || 'corretiva', // Mapped to tipo
        descricao: manutencaoData.descricao_problema, // Mapped to descricao
        status: 'agendado', // Default status
        // prioridade: manutencaoData.prioridade, // Not in new table
      };

      const { data, error } = await supabase
        .from('manutencoes_frota')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      setManutencoes(prev => [data as ManutencaoVan, ...prev]);

      toast({
        title: "Sucesso",
        description: "Problema reportado com sucesso!",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar manutenção:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reportar o problema.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateManutencao = async (id: string, updates: Partial<Record<string, any>>) => {
    try {
      const { data, error } = await supabase
        .from('manutencoes_frota')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setManutencoes(prev => prev.map(item =>
        item.id === id ? { ...item, ...data } as ManutencaoVan : item
      ));

      toast({
        title: "Sucesso",
        description: "Manutenção atualizada com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar manutenção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a manutenção.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('manutencoes_frota')
        .update({
          status: 'concluido',
          // data_solucao: new Date().toISOString().split('T')[0] // Not in table
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setManutencoes(prev => prev.map(item =>
        item.id === id ? { ...item, ...data } as ManutencaoVan : item
      ));

      toast({
        title: "Sucesso",
        description: "Manutenção marcada como concluída!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao marcar manutenção como concluída:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a manutenção como concluída.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteManutencao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manutencoes_frota')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setManutencoes(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Manutenção removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar manutenção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a manutenção.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getResumoManutencoes = () => {
    const total = manutencoes.length;
    const pendentes = manutencoes.filter(m => m.status === 'pendente').length;
    const emAndamento = manutencoes.filter(m => m.status === 'em_andamento').length;
    const concluidas = manutencoes.filter(m => m.status === 'concluido').length;
    const urgentes = manutencoes.filter(m => m.prioridade === 'urgente' && m.status !== 'concluido').length;

    return {
      total,
      pendentes,
      emAndamento,
      concluidas,
      urgentes,
    };
  };

  useEffect(() => {
    fetchManutencoes();
  }, []);

  return {
    manutencoes,
    loading,
    createManutencao,
    updateManutencao,
    deleteManutencao,
    markAsCompleted,
    getResumoManutencoes,
    refetch: fetchManutencoes,
  };
}