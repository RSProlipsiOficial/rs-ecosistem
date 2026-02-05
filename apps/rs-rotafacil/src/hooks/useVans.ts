import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Van } from '@/types/alunos';
import { useToast } from '@/hooks/use-toast';

export function useVans() {
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVans = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const vanId = user?.user_metadata?.van_id;

      let query = supabase
        .from('vans')
        .select('*')
        .eq('ativo', true);

      // Se o usuário tiver uma van vinculada no metadata (motorista/monitora), filtra apenas ela
      if (vanId) {
        query = query.eq('id', vanId);
      } else {
        // Caso contrário, filtra pelo user_id do proprietário
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('nome');

      if (error) throw error;
      setVans(data || []);
    } catch (error) {
      console.error('Erro ao buscar vans:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vans.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVan = async (vanData: { nome: string; capacidade_maxima: number }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from('vans')
        .insert([{ ...vanData, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;

      setVans(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Van criada com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao criar van:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a van.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVan = async (id: string, vanData: Partial<{ nome: string; capacidade_maxima: number }>) => {
    try {
      const { data, error } = await supabase
        .from('vans')
        .update(vanData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setVans(prev => prev.map(van => van.id === id ? data : van));
      toast({
        title: "Sucesso",
        description: "Van atualizada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar van:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a van.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteVan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vans')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      setVans(prev => prev.filter(van => van.id !== id));
      toast({
        title: "Sucesso",
        description: "Van removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover van:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a van.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVans();
  }, []);

  return {
    vans,
    loading,
    createVan,
    updateVan,
    deleteVan,
    refetch: fetchVans,
  };
}