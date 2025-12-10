import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Aluno, AlunoFormData } from '@/types/alunos';
import { useToast } from '@/hooks/use-toast';

export function useAlunos(vanId?: string) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('alunos')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');

      if (vanId) {
        query = query.eq('van_id', vanId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlunos(data as Aluno[] || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAluno = async (alunoData: AlunoFormData) => {
    try {
      // For testing without authentication, use a placeholder user_id
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('alunos')
        .insert([{ ...alunoData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      setAlunos(prev => [...prev, data as Aluno]);
      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAluno = async (id: string, alunoData: Partial<AlunoFormData>) => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .update(alunoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAlunos(prev => prev.map(aluno => aluno.id === id ? data as Aluno : aluno));
      toast({
        title: "Sucesso",
        description: "Aluno atualizado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAluno = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      setAlunos(prev => prev.filter(aluno => aluno.id !== id));
      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [vanId]);

  return {
    alunos,
    loading,
    createAluno,
    updateAluno,
    deleteAluno,
    refetch: fetchAlunos,
  };
}